<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;

/**
 * Export ringkasan dashboard (bukan data mentah per baris) ke xlsx/csv.
 * Dipakai oleh DashboardController::export(). Mengubah struktur array
 * $stats (hasil fullStats()/employeeStats()) menjadi baris-baris flat
 * supaya enak dibaca di Excel, tanpa menyentuh/ubah endpoint /stats.
 */
class DashboardSummaryExport implements FromArray, WithHeadings, WithTitle
{
    protected array $stats;

    protected string $periodLabel;

    public function __construct(array $stats, string $periodLabel)
    {
        $this->stats = $stats;
        $this->periodLabel = $periodLabel;
    }

    public function headings(): array
    {
        return ['Kategori', 'Item', 'Nilai'];
    }

    public function title(): string
    {
        return 'Dashboard HSE';
    }

    public function array(): array
    {
        $rows = [['Periode', '-', $this->periodLabel]];

        if (($this->stats['scope'] ?? null) === 'employee') {
            foreach ($this->stats['totals'] as $key => $value) {
                $rows[] = ['Ringkasan Saya', $key, $value];
            }

            return $rows;
        }

        foreach ($this->stats['totals'] as $key => $value) {
            $rows[] = ['Total', $key, $value];
        }
        foreach ($this->stats['incidentsBySeverity'] as $key => $value) {
            $rows[] = ['Incident by Severity', $key, $value];
        }
        foreach ($this->stats['incidentsByStatus'] as $key => $value) {
            $rows[] = ['Incident by Status', $key, $value];
        }
        foreach ($this->stats['capaByStatus'] as $key => $value) {
            $rows[] = ['CAPA by Status', $key, $value];
        }
        foreach ((array) $this->stats['ptwStatus'] as $key => $value) {
            $rows[] = ['PTW Status', $key, $value];
        }
        foreach ($this->stats['manpower'] as $key => $value) {
            $rows[] = ['Manpower', $key, $value];
        }
        foreach ($this->stats['incidentSummary'] as $key => $value) {
            $rows[] = ['Incident Summary (kumulatif)', $key, $value];
        }

        $tc = $this->stats['trainingCompliance'];
        $rows[] = ['Training Compliance', 'completed', $tc['completed']];
        $rows[] = ['Training Compliance', 'total', $tc['total']];
        $rows[] = ['Training Compliance', 'percent', $tc['percent'].'%'];

        return $rows;
    }
}
