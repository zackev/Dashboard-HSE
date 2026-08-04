<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Capa;
use App\Models\Document;
use App\Models\HsePerformance;
use App\Models\Incident;
use App\Models\Inspection;
use App\Models\Kpi;
use App\Models\Permit;
use App\Models\Training;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/**
 * Endpoint /api/stats. Bentuk respons untuk admin (scope=admin) sengaja
 * dibuat SAMA PERSIS dengan /api/stats versi Node.js lama (manpower,
 * incidentSummary, safetyInspectionTrend, ptwStatus, trainingCompliance,
 * dst) supaya Dashboard.jsx yang sudah ada tidak perlu dirombak total.
 * Employee (scope=employee) mendapat bentuk yang jauh lebih ringkas & di-scope
 * ke datanya sendiri — lihat pages/Dashboard.jsx bagian employeeView.
 */
class DashboardController extends Controller
{
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    public function index(Request $request)
    {
        $user = $request->user();
        $period = $request->get('period', 'this_month');
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');

        if ($user->hasPermission('incidents')) {
            return response()->json(['data' => $this->fullStats($period, $startDate, $endDate)]);
        }

        return response()->json(['data' => $this->employeeStats($user, $period, $startDate, $endDate)]);
    }

    /**
     * Export ringkasan dashboard (mengikuti filter periode yang sama seperti
     * /stats) dalam format xlsx / csv / pdf. Tidak mengubah endpoint /stats
     * yang sudah dipakai frontend — ini endpoint baru yang terpisah.
     */
    public function export(Request $request)
    {
        $request->validate([
            'format' => 'required|in:xlsx,csv,pdf',
        ]);

        $user = $request->user();
        $period = $request->get('period', 'this_month');
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');
        $format = $request->get('format');

        $stats = $user->hasPermission('incidents')
            ? $this->fullStats($period, $startDate, $endDate)
            : $this->employeeStats($user, $period, $startDate, $endDate);

        $periodLabel = $this->periodLabel($period, $startDate, $endDate);
        $filename = 'dashboard-hse-'.now()->format('Ymd-His');

        if ($format === 'pdf') {
            return \Barryvdh\DomPDF\Facade\Pdf::loadView('exports.dashboard-pdf', [
                'stats' => $stats,
                'periodLabel' => $periodLabel,
                'generatedAt' => now()->format('d M Y H:i'),
            ])->download("{$filename}.pdf");
        }

        $export = new \App\Exports\DashboardSummaryExport($stats, $periodLabel);
        $writerType = $format === 'csv' ? \Maatwebsite\Excel\Excel::CSV : \Maatwebsite\Excel\Excel::XLSX;

        return \Maatwebsite\Excel\Facades\Excel::download($export, "{$filename}.{$format}", $writerType);
    }

    protected function periodLabel(string $period, ?string $startDate, ?string $endDate): string
    {
        if ($period === 'custom' && $startDate && $endDate) {
            return "{$startDate} s/d {$endDate}";
        }

        return match ($period) {
            'today' => 'Hari Ini',
            'yesterday' => 'Kemarin',
            'this_week' => 'Minggu Ini',
            'last_week' => 'Minggu Lalu',
            'this_month' => 'Bulan Ini',
            'last_month' => 'Bulan Lalu',
            'this_year' => 'Tahun Ini',
            default => 'Semua Waktu',
        };
    }

    protected function countBy($rows, string $key): array
    {
        return $rows->groupBy(fn ($r) => $r->$key ?: 'Unknown')->map->count()->toArray();
    }

    protected function fullStats(string $period, ?string $startDate = null, ?string $endDate = null): array
    {
        // Hanya modul dengan kolom tanggal kejadian yang difilter per periode.
        // kpis/documents = status "saat ini" (bukan historis), hsePerf = kumulatif
        // sejak awal (TRIR/LTIF akan salah kalau dipotong per periode) -> sengaja
        // dibiarkan mengambil semua data, tidak terpengaruh filter.
        $incidents = $this->applyPeriodFilter(Incident::query(), 'date', $period, $startDate, $endDate)->get();
        $inspections = $this->applyPeriodFilter(Inspection::query(), 'date', $period, $startDate, $endDate)->get();
        $trainings = $this->applyPeriodFilter(Training::query(), 'date', $period, $startDate, $endDate)->get();
        $capa = $this->applyPeriodFilter(Capa::query(), 'due_date', $period, $startDate, $endDate)->get();
        $permits = $this->applyPeriodFilter(Permit::query(), 'valid_from', $period, $startDate, $endDate)->get();
        $kpis = Kpi::all();
        $documents = Document::all();
        $hsePerf = HsePerformance::computeAll(HsePerformance::all())->values();

        $today = Carbon::today();
        $in30 = $today->copy()->addDays(30);

        $latestPerf = $hsePerf->last();
        $trend = $hsePerf->slice(-14)->values()->map(fn ($p) => [
            'date' => $p['date'], 'trir' => $p['trir'], 'ltif' => $p['ltif'],
        ]);

        $manpower = [
            'total' => $latestPerf['total_workers'] ?? 0,
            'safeManHours' => $latestPerf['man_hours_cumulative'] ?? 0,
        ];
        $incidentSummary = [
            'nearMiss' => $latestPerf['cumulative_near_miss'] ?? 0,
            'firstAid' => $latestPerf['cumulative_first_aid_case'] ?? 0,
            'medicalTreatment' => $latestPerf['cumulative_medical_treatment_case'] ?? 0,
            'lostTimeInjury' => $latestPerf['cumulative_lost_time_incident'] ?? 0,
        ];

        $inspectionByMonth = [];
        foreach ($inspections as $i) {
            if (! $i->date) continue;
            $monthKey = substr((string) $i->date, 0, 7);
            $inspectionByMonth[$monthKey] ??= ['inspection' => 0, 'finding' => 0];
            $inspectionByMonth[$monthKey]['inspection']++;
            if (trim((string) $i->findings) !== '') {
                $inspectionByMonth[$monthKey]['finding']++;
            }
        }
        ksort($inspectionByMonth);
        $safetyInspectionTrend = [];
        foreach ($inspectionByMonth as $monthKey => $v) {
            $m = (int) substr($monthKey, 5, 2);
            $safetyInspectionTrend[] = [
                'month' => self::MONTHS[$m - 1] ?? $monthKey,
                'inspection' => $v['inspection'],
                'finding' => $v['finding'],
            ];
        }

        $ptwStatus = $this->countBy($permits, 'status');

        $trainingCompleted = $trainings->where('status', 'Completed')->count();
        $trainingCompliance = [
            'completed' => $trainingCompleted,
            'total' => $trainings->count(),
            'percent' => $trainings->count() > 0 ? (int) round(($trainingCompleted / $trainings->count()) * 100) : 0,
        ];

        $activePermits = $permits->where('status', 'Active')->count();
        $expiringPermits = $permits->filter(function ($p) use ($today, $in30) {
            if (! $p->valid_to) return false;
            $d = Carbon::parse($p->valid_to);
            return $d->between($today, $in30) && ! in_array($p->status, ['Closed', 'Rejected']);
        })->count();

        $kpiAchieved = $kpis->where('status', 'Achieved')->count();

        $docsExpiringSoon = $documents->filter(fn ($d) => $d->expiry_date && Carbon::parse($d->expiry_date)->between($today, $in30))->count();
        $docsExpired = $documents->filter(fn ($d) => $d->expiry_date && Carbon::parse($d->expiry_date)->lt($today))->count();

        return [
            'scope' => 'admin',
            'totals' => [
                'incidents' => $incidents->count(),
                'inspections' => $inspections->count(),
                'trainings' => $trainings->count(),
                'capa' => $capa->count(),
                'openIncidents' => $incidents->where('status', '!=', 'Closed')->count(),
                'openCapa' => $capa->whereNotIn('status', ['Closed', 'Done'])->count(),
                'permits' => $permits->count(),
                'activePermits' => $activePermits,
                'expiringPermits' => $expiringPermits,
                'pendingPermits' => $permits->where('status', 'Submitted')->count(),
                'kpis' => $kpis->count(),
                'kpiAchieved' => $kpiAchieved,
                'documents' => $documents->count(),
                'docsExpiringSoon' => $docsExpiringSoon,
                'docsExpired' => $docsExpired,
            ],
            'incidentsBySeverity' => $this->countBy($incidents, 'severity'),
            'incidentsByStatus' => $this->countBy($incidents, 'status'),
            'capaByStatus' => $this->countBy($capa, 'status'),
            'trainingParticipants' => (int) $trainings->sum('participants'),
            'hsePerformance' => ['latest' => $latestPerf, 'trend' => $trend],
            'manpower' => $manpower,
            'incidentSummary' => $incidentSummary,
            'safetyInspectionTrend' => $safetyInspectionTrend,
            'ptwStatus' => (object) $ptwStatus,
            'trainingCompliance' => $trainingCompliance,
        ];
    }

    protected function employeeStats($user, string $period, ?string $startDate = null, ?string $endDate = null): array
    {
        $permitsQuery = Permit::where('user_id', $user->id);
        $permits = $this->applyPeriodFilter($permitsQuery, 'valid_from', $period, $startDate, $endDate)
            ->orderBy('valid_from', 'desc')->get();
        $sopDocuments = Document::whereIn('category', ['Policy', 'Procedure/SOP'])->where('status', 'Active')->count();

        return [
            'scope' => 'employee',
            'totals' => [
                'myPermits' => $permits->count(),
                'myPermitsSubmitted' => $permits->where('status', 'Submitted')->count(),
                'myPermitsApproved' => $permits->whereIn('status', ['Approved', 'Active'])->count(),
                'myPermitsRejected' => $permits->where('status', 'Rejected')->count(),
                'sopDocuments' => $sopDocuments,
            ],
            'myPermitsByStatus' => (object) $this->countBy($permits, 'status'),
            'recentPermits' => $permits->take(5)->values(),
        ];
    }

    private function applyPeriodFilter($query, string $column, string $period, ?string $startDate = null, ?string $endDate = null)
    {
        $today = now();

        return match ($period) {
    
            'today'
                => $query->whereDate($column, $today),
    
            'yesterday'
                => $query->whereDate($column, $today->copy()->subDay()),
    
            'this_week'
                => $query->whereBetween($column, [
                    $today->copy()->startOfWeek(),
                    $today->copy()->endOfWeek(),
                ]),
    
            'last_week'
                => $query->whereBetween($column, [
                    $today->copy()->subWeek()->startOfWeek(),
                    $today->copy()->subWeek()->endOfWeek(),
                ]),
    
            'this_month'
                => $query->whereMonth($column, $today->month)
                         ->whereYear($column, $today->year),
    
            'last_month'
                => $query->whereMonth($column, $today->copy()->subMonth()->month)
                         ->whereYear($column, $today->copy()->subMonth()->year),
    
            'this_year'
                => $query->whereYear($column, $today->year),

            'custom'
                => ($startDate && $endDate)
                    ? $query->whereBetween($column, [$startDate, $endDate])
                    : $query,

            default => $query,
        };
    }
}
