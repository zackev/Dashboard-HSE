<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permit;
use App\Models\User;
use App\Notifications\PermitStatusUpdated;
use App\Notifications\PermitSubmitted;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;


/**
 * Alur status `permits.status`:
 *   Submitted -> (admin approve) -> GM Review -> (gm approve) -> Approved
 *             -> (admin/gm reject di tahap manapun) -> Rejected
 *
 * `admin_status` & `gm_status` masing2 Pending/Approved/Rejected -> dipakai
 * sebagai audit trail terperinci (siapa, kapan, catatan apa), sedangkan
 * `status` adalah ringkasan yang dipakai Badge di frontend (tidak berubah
 * dari pola yang sudah ada).
 */
class PermitController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // FIX: Permit::with() sudah menghasilkan Eloquent Builder,
        // jadi tidak perlu memanggil ->query() lagi.
        $query = Permit::with([
            'user:id,name',
            'adminReviewer:id,name',
            'gmReviewer:id,name'
        ]);

        $isAdmin = $user->hasPermission('permits');
        $isGm = $user->hasPermission('permits_gm');

        if (! $isAdmin && ! $isGm) {
            $query->where('user_id', $user->id);
        }

        if ($status = $request->query('status')) {
            $query->whereRaw('LOWER(status) = ?', [strtolower($status)]);
        }

        if ($q = $request->query('q')) {
            $needle = '%' . strtolower($q) . '%';

            $query->where(function ($sub) use ($needle) {
                $sub->orWhereRaw('LOWER(permit_no) LIKE ?', [$needle])
                    ->orWhereRaw('LOWER(location) LIKE ?', [$needle])
                    ->orWhereRaw('LOWER(type) LIKE ?', [$needle]);
            });
        }

        $rows = $query->orderBy('valid_from', 'desc')->get();

        return response()->json([
            'data' => $rows,
            'total' => $rows->count()
        ]);
    }


    /** Daftar pilihan tetap (klasifikasi & APD) untuk checkbox di form React. */
    public function formOptions()
    {
        return response()->json([
            'data' => [
                'work_classifications' => Permit::WORK_CLASSIFICATIONS,
                'safety_equipment_groups' => Permit::SAFETY_EQUIPMENT_GROUPS,
                'equipment_categories' => Permit::EQUIPMENT_CATEGORIES,
            ]
        ]);
    }
    
    public function show(Request $request, int $id)
    {
        $row = Permit::with(['user:id,name', 'adminReviewer:id,name', 'gmReviewer:id,name', 'overtimes'])->find($id);
        if (! $row) {
            return response()->json(['error' => 'Ijin Kerja tidak ditemukan'], 404);
        }
        $this->authorizeView($request, $row);
        return response()->json(['data' => $row]);
    }

    /** Pemohon submit form lengkap. Semua status mulai dari Pending/Submitted. */
    public function store(Request $request)
    {
        $user = $request->user();

        $required = ['permit_no', 'location', 'valid_from', 'valid_to', 'start_time', 'end_time'];
        $missing = array_filter($required, fn ($f) => ! $request->filled($f));
        if ($missing) {
            return response()->json(['error' => 'Field wajib diisi: '.implode(', ', $missing)], 400);
        }
        if (empty($request->input('work_classifications'))) {
            return response()->json(['error' => 'Klasifikasi Pekerjaan wajib dipilih minimal 1.'], 400);
        }
        if (! Permit::hasValidJsa($request->input('jsa'))) {
            return response()->json(['error' => 'JSA wajib diisi minimal 1 baris (Langkah Kerja) sebelum ijin kerja bisa diajukan.'], 400);
        }

        $payload = $request->only([
            'permit_no', 'type', 'location', 'work_description', 'valid_from', 'valid_to',
            'start_time', 'end_time', 'jsa', 'work_classifications', 'area', 'plant',
            'area_manager_name', 'area_manager_phone', 'requester_phone', 'supervisor_name',
            'supervisor_phone', 'safety_officer_name', 'safety_officer_phone', 'requester_company',
            'workers', 'equipment', 'safety_equipment',
        ]);

        $payload['status'] = 'Submitted';
        $payload['admin_status'] = 'Pending';
        $payload['gm_status'] = 'Pending';
        $payload['requested_by'] = $user->name;
        $payload['user_id'] = $user->id;

        $permit = Permit::create($payload);

        $admins = User::whereHas('role.permissions', fn ($q) => $q->where('key', 'permits'))
            ->where('is_active', true)->get();
        if ($admins->isNotEmpty()) {
            Notification::send($admins, new PermitSubmitted($permit));
        }

        return response()->json(['data' => $permit], 201);
    }

    public function update(Request $request, int $id)
    {
        $row = Permit::find($id);
        if (! $row) {
            return response()->json(['error' => 'Ijin Kerja tidak ditemukan'], 404);
        }
        $user = $request->user();

        if (! $user->hasPermission('permits') && ! $user->hasPermission('permits_gm')) {
            if ($row->user_id !== $user->id) {
                return response()->json(['error' => 'Anda tidak punya akses ke ijin kerja ini.'], 403);
            }
            if ($row->status !== 'Submitted') {
                return response()->json(['error' => 'Ijin kerja yang sudah direview tidak bisa diubah lagi.'], 422);
            }
        }

        if ($request->has('jsa') && ! Permit::hasValidJsa($request->input('jsa'))) {
            return response()->json(['error' => 'JSA wajib diisi minimal 1 baris (Langkah Kerja).'], 400);
        }

        $fields = [
            'permit_no', 'type', 'location', 'work_description', 'valid_from', 'valid_to',
            'start_time', 'end_time', 'jsa', 'work_classifications', 'area', 'plant',
            'area_manager_name', 'area_manager_phone', 'requester_phone', 'supervisor_name',
            'supervisor_phone', 'safety_officer_name', 'safety_officer_phone', 'requester_company',
            'workers', 'equipment', 'safety_equipment',
        ];

        $row->update($request->only($fields));
        return response()->json(['data' => $row]);
    }

    /**
     * Review tahap 1 (Admin/Pengawas K3). Admin JUGA mengisi kop surat
     * (No Dok/No Rev/Tgl Rilis/Jml Halaman) di endpoint yang sama.
     */
    public function adminReview(Request $request, int $id)
    {
        $data = $request->validate([
            'action' => 'required|in:approve,reject',
            'note' => 'nullable|string',
            'doc_number' => 'nullable|string',
            'doc_revision' => 'nullable|string',
            'doc_release_date' => 'nullable|date',
            'doc_pages' => 'nullable|string',
        ]);

        $permit = Permit::findOrFail($id);
        if ($permit->admin_status !== 'Pending') {
            return response()->json(['error' => 'Ijin kerja ini sudah pernah direview oleh Admin.'], 422);
        }

        $user = $request->user();
        $approve = $data['action'] === 'approve';

        $permit->update([
            'admin_status' => $approve ? 'Approved' : 'Rejected',
            'admin_reviewed_by' => $user->id,
            'admin_reviewed_at' => now(),
            'admin_note' => $data['note'] ?? null,
            'doc_number' => $data['doc_number'] ?? $permit->doc_number,
            'doc_revision' => $data['doc_revision'] ?? $permit->doc_revision,
            'doc_release_date' => $data['doc_release_date'] ?? $permit->doc_release_date,
            'doc_pages' => $data['doc_pages'] ?? $permit->doc_pages,
            'status' => $approve ? 'GM Review' : 'Rejected',
            'rejection_reason' => $approve ? null : ($data['note'] ?? null),
        ]);

        if (! $approve) {
            $this->notifyOwner($permit);
        } else {
            $gms = User::whereHas('role.permissions', fn ($q) => $q->where('key', 'permits_gm'))
                ->where('is_active', true)->get();
            if ($gms->isNotEmpty()) {
                Notification::send($gms, new PermitSubmitted($permit));
            }
        }

        return response()->json(['data' => $permit]);
    }

    /** Review tahap 2 / final (GM). Hanya bisa dilakukan setelah Admin approve. */
    public function gmReview(Request $request, int $id)
    {
        $data = $request->validate([
            'action' => 'required|in:approve,reject',
            'note' => 'nullable|string',
        ]);

        $permit = Permit::findOrFail($id);
        if ($permit->admin_status !== 'Approved') {
            return response()->json(['error' => 'Ijin kerja ini belum disetujui Admin, belum bisa direview GM.'], 422);
        }
        if ($permit->gm_status !== 'Pending') {
            return response()->json(['error' => 'Ijin kerja ini sudah pernah direview oleh GM.'], 422);
        }

        $user = $request->user();
        $approve = $data['action'] === 'approve';

        $permit->update([
            'gm_status' => $approve ? 'Approved' : 'Rejected',
            'gm_reviewed_by' => $user->id,
            'gm_reviewed_at' => now(),
            'gm_note' => $data['note'] ?? null,
            'status' => $approve ? 'Approved' : 'Rejected',
            'rejection_reason' => $approve ? null : ($data['note'] ?? null),
            'approved_by' => $approve ? $user->name : $permit->approved_by,
            'approved_by_id' => $approve ? $user->id : $permit->approved_by_id,
            'approved_at' => $approve ? now() : $permit->approved_at,
        ]);

        $this->notifyOwner($permit);

        return response()->json(['data' => $permit]);
    }

    public function destroy(Request $request, int $id)
    {
        $row = Permit::find($id);
        if (! $row) {
            return response()->json(['error' => 'Ijin Kerja tidak ditemukan'], 404);
        }
        $user = $request->user();
        if (! $user->hasPermission('permits') && $row->user_id !== $user->id) {
            return response()->json(['error' => 'Anda tidak punya akses ke ijin kerja ini.'], 403);
        }
        $row->delete();
        return response()->json(['data' => true]);
    }

    /**
     * Cetak PDF sesuai layout form asli. Boleh diakses: pemohon (HANYA kalau
     * sudah Approved), Admin (permission 'permits'), GM (permission 'permits_gm').
     */
    public function print(Request $request, int $id)
    {
        $permit = Permit::with(['user:id,name', 'adminReviewer:id,name', 'gmReviewer:id,name'])->findOrFail($id);
        $user = $request->user();

        $isAdmin = $user->hasPermission('permits');
        $isGm = $user->hasPermission('permits_gm');
        $isOwner = $permit->user_id === $user->id;

        if (! $isAdmin && ! $isGm && ! ($isOwner && $permit->status === 'Approved')) {
            return response()->json(['error' => 'Ijin kerja ini belum bisa dicetak.'], 403);
        }

        return \Barryvdh\DomPDF\Facade\Pdf::loadView('exports.work-permit-pdf', ['permit' => $permit])
            ->setPaper('a4', 'portrait')
            ->download("ijin-kerja-{$permit->permit_no}.pdf");
    }

    protected function notifyOwner(Permit $permit): void
    {
        if ($permit->user) {
            $permit->user->notify(new PermitStatusUpdated($permit));
        }
    }

    protected function authorizeView(Request $request, Permit $permit): void
    {
        $user = $request->user();
        $allowed = $user->hasPermission('permits') || $user->hasPermission('permits_gm') || $permit->user_id === $user->id;
        if (! $allowed) {
            abort(response()->json(['error' => 'Anda tidak punya akses ke ijin kerja ini.'], 403));
        }
    }
}
