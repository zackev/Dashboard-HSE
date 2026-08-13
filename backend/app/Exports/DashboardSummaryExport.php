<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Events\AfterSheet;

class DashboardSummaryExport implements
    FromArray,
    WithHeadings,
    WithTitle,
    WithEvents,
    WithColumnWidths
{
    protected array $stats;

    protected string $periodLabel;

    public function __construct(array $stats, string $periodLabel)
    {
        $this->stats = $stats;
        $this->periodLabel = $periodLabel;
    }

    /**
     * Header tabel.
     */
    public function headings(): array
    {
        return [
            'Kategori',
            'Item',
            'Nilai',
        ];
    }

    /**
     * Nama worksheet.
     */
    public function title(): string
    {
        return 'Dashboard HSE';
    }

    /**
     * Lebar kolom.
     */
    public function columnWidths(): array
    {
        return [
            'A' => 28,
            'B' => 34,
            'C' => 20,
        ];
    }

    /**
     * Data yang masuk ke Excel / CSV.
     */
    public function array(): array
    {
        $rows = [];

        /*
        |--------------------------------------------------------------------------
        | INFORMASI LAPORAN
        |--------------------------------------------------------------------------
        */

        $rows[] = [
            'PERIODE',
            '',
            $this->periodLabel,
        ];

        $rows[] = [
            'DIBUAT',
            '',
            now()->format('d M Y H:i'),
        ];

        /*
        |--------------------------------------------------------------------------
        | EMPLOYEE
        |--------------------------------------------------------------------------
        */

        if (($this->stats['scope'] ?? null) === 'employee') {

            $rows[] = [
                'RINGKASAN SAYA',
                '',
                '',
            ];

            foreach ($this->stats['totals'] as $key => $value) {
                $rows[] = [
                    'Ringkasan Saya',
                    $this->formatLabel($key),
                    $value,
                ];
            }

            return $rows;
        }

        /*
        |--------------------------------------------------------------------------
        | TOTAL
        |--------------------------------------------------------------------------
        */

        $rows[] = [
            'TOTAL',
            '',
            '',
        ];

        foreach ($this->stats['totals'] as $key => $value) {
            $rows[] = [
                'Total',
                $this->formatLabel($key),
                $value,
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | INCIDENT SEVERITY
        |--------------------------------------------------------------------------
        */

        $rows[] = [
            'INCIDENT',
            '',
            '',
        ];

        foreach ($this->stats['incidentsBySeverity'] as $key => $value) {
            $rows[] = [
                'Incident by Severity',
                $this->formatLabel($key),
                $value,
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | INCIDENT STATUS
        |--------------------------------------------------------------------------
        */

        $rows[] = [
            'INCIDENT',
            '',
            '',
        ];

        foreach ($this->stats['incidentsByStatus'] as $key => $value) {
            $rows[] = [
                'Incident by Status',
                $this->formatLabel($key),
                $value,
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | CAPA
        |--------------------------------------------------------------------------
        */

        $rows[] = [
            'CAPA',
            '',
            '',
        ];

        foreach ($this->stats['capaByStatus'] as $key => $value) {
            $rows[] = [
                'CAPA by Status',
                $this->formatLabel($key),
                $value,
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | PTW
        |--------------------------------------------------------------------------
        */

        $rows[] = [
            'PERMIT TO WORK',
            '',
            '',
        ];

        foreach ((array) $this->stats['ptwStatus'] as $key => $value) {
            $rows[] = [
                'PTW Status',
                $this->formatLabel($key),
                $value,
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | MANPOWER
        |--------------------------------------------------------------------------
        */

        $rows[] = [
            'MANPOWER',
            '',
            '',
        ];

        foreach ($this->stats['manpower'] as $key => $value) {
            $rows[] = [
                'Manpower',
                $this->formatLabel($key),
                $value,
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | INCIDENT SUMMARY
        |--------------------------------------------------------------------------
        */

        $rows[] = [
            'HSE PERFORMANCE',
            '',
            '',
        ];

        foreach ($this->stats['incidentSummary'] as $key => $value) {
            $rows[] = [
                'Incident Summary',
                $this->formatLabel($key),
                $value,
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | TRAINING
        |--------------------------------------------------------------------------
        */

        $rows[] = [
            'TRAINING',
            '',
            '',
        ];

        $tc = $this->stats['trainingCompliance'];

        $rows[] = [
            'Training Compliance',
            'Completed',
            $tc['completed'],
        ];

        $rows[] = [
            'Training Compliance',
            'Total',
            $tc['total'],
        ];

        $rows[] = [
            'Training Compliance',
            'Compliance',
            $tc['percent'] . '%',
        ];

        return $rows;
    }

    /**
     * Format nama field supaya lebih manusiawi.
     */
    protected function formatLabel(string $value): string
    {
        $value = preg_replace('/(?<!^)([A-Z])/', ' $1', $value);

        $value = str_replace([
            '_',
            '-',
        ], ' ', $value);

        return ucwords(trim($value));
    }

    /**
     * Styling Excel.
     */
    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {

                $sheet = $event->sheet->getDelegate();

                /*
                |--------------------------------------------------------------------------
                | TITLE
                |--------------------------------------------------------------------------
                */

                $sheet->insertNewRowBefore(1, 3);

                $sheet->mergeCells('A1:C1');
                $sheet->setCellValue(
                    'A1',
                    'HSE DASHBOARD REPORT'
                );

                $sheet->mergeCells('A2:C2');
                $sheet->setCellValue(
                    'A2',
                    'Health, Safety & Environment Performance Summary'
                );

                $sheet->mergeCells('A3:C3');
                $sheet->setCellValue(
                    'A3',
                    'Periode: ' . $this->periodLabel
                );

                /*
                |--------------------------------------------------------------------------
                | TITLE STYLE
                |--------------------------------------------------------------------------
                */

                $sheet->getStyle('A1:C1')->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 18,
                        'color' => [
                            'rgb' => 'FFFFFF',
                        ],
                    ],
                    'fill' => [
                        'fillType' => 'solid',
                        'startColor' => [
                            'rgb' => '111827',
                        ],
                    ],
                    'alignment' => [
                        'horizontal' => 'center',
                        'vertical' => 'center',
                    ],
                ]);

                $sheet->getStyle('A2:C2')->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 11,
                        'color' => [
                            'rgb' => '374151',
                        ],
                    ],
                    'alignment' => [
                        'horizontal' => 'center',
                    ],
                ]);

                $sheet->getStyle('A3:C3')->applyFromArray([
                    'font' => [
                        'italic' => true,
                        'size' => 9,
                        'color' => [
                            'rgb' => '6B7280',
                        ],
                    ],
                    'alignment' => [
                        'horizontal' => 'center',
                    ],
                ]);

                /*
                |--------------------------------------------------------------------------
                | TABLE HEADER
                |--------------------------------------------------------------------------
                |
                | Setelah insert 3 baris:
                | row 5 = headings
                |
                */

                $sheet->getStyle('A5:C5')->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'color' => [
                            'rgb' => 'FFFFFF',
                        ],
                    ],
                    'fill' => [
                        'fillType' => 'solid',
                        'startColor' => [
                            'rgb' => '1F2937',
                        ],
                    ],
                    'alignment' => [
                        'horizontal' => 'center',
                        'vertical' => 'center',
                    ],
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => 'thin',
                            'color' => [
                                'rgb' => 'D1D5DB',
                            ],
                        ],
                    ],
                ]);

                /*
                |--------------------------------------------------------------------------
                | DATA AREA
                |--------------------------------------------------------------------------
                */

                $highestRow = $sheet->getHighestRow();

                $sheet->getStyle(
                    "A6:C{$highestRow}"
                )->applyFromArray([
                    'font' => [
                        'size' => 10,
                        'color' => [
                            'rgb' => '374151',
                        ],
                    ],
                    'alignment' => [
                        'vertical' => 'center',
                    ],
                    'borders' => [
                        'bottom' => [
                            'borderStyle' => 'hair',
                            'color' => [
                                'rgb' => 'E5E7EB',
                            ],
                        ],
                    ],
                ]);

                /*
                |--------------------------------------------------------------------------
                | ZEBRA STRIPE
                |--------------------------------------------------------------------------
                */

                for ($row = 6; $row <= $highestRow; $row++) {

                    if ($row % 2 === 0) {
                        $sheet->getStyle(
                            "A{$row}:C{$row}"
                        )->applyFromArray([
                            'fill' => [
                                'fillType' => 'solid',
                                'startColor' => [
                                    'rgb' => 'F8FAFC',
                                ],
                            ],
                        ]);
                    }
                }

                /*
                |--------------------------------------------------------------------------
                | SECTION ROWS
                |--------------------------------------------------------------------------
                */

                $sectionNames = [
                    'TOTAL',
                    'INCIDENT',
                    'CAPA',
                    'PERMIT TO WORK',
                    'MANPOWER',
                    'HSE PERFORMANCE',
                    'TRAINING',
                    'RINGKASAN SAYA',
                ];

                for ($row = 6; $row <= $highestRow; $row++) {

                    $value = strtoupper(
                        trim((string) $sheet->getCell("A{$row}")->getValue())
                    );

                    if (in_array($value, $sectionNames, true)) {

                        $sheet->mergeCells(
                            "A{$row}:C{$row}"
                        );

                        $sheet->getStyle(
                            "A{$row}:C{$row}"
                        )->applyFromArray([
                            'font' => [
                                'bold' => true,
                                'size' => 10,
                                'color' => [
                                    'rgb' => 'FFFFFF',
                                ],
                            ],
                            'fill' => [
                                'fillType' => 'solid',
                                'startColor' => [
                                    'rgb' => '2563EB',
                                ],
                            ],
                            'alignment' => [
                                'horizontal' => 'left',
                                'vertical' => 'center',
                            ],
                        ]);
                    }
                }

                /*
                |--------------------------------------------------------------------------
                | VALUE COLUMN
                |--------------------------------------------------------------------------
                */

                $sheet->getStyle(
                    "C6:C{$highestRow}"
                )->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'color' => [
                            'rgb' => '111827',
                        ],
                    ],
                    'alignment' => [
                        'horizontal' => 'right',
                        'vertical' => 'center',
                    ],
                ]);

                /*
                |--------------------------------------------------------------------------
                | SPECIAL COLORS
                |--------------------------------------------------------------------------
                */

                for ($row = 6; $row <= $highestRow; $row++) {

                    $category = strtolower(
                        (string) $sheet->getCell("A{$row}")->getValue()
                    );

                    $item = strtolower(
                        (string) $sheet->getCell("B{$row}")->getValue()
                    );

                    /*
                    | Incident
                    */

                    if (
                        str_contains($category, 'incident')
                        || str_contains($item, 'incident')
                    ) {
                        $sheet->getStyle(
                            "C{$row}"
                        )->getFont()->getColor()->setRGB('DC2626');
                    }

                    /*
                    | CAPA
                    */

                    if (str_contains($category, 'capa')) {
                        $sheet->getStyle(
                            "C{$row}"
                        )->getFont()->getColor()->setRGB('EA580C');
                    }

                    /*
                    | Training
                    */

                    if (str_contains($category, 'training')) {
                        $sheet->getStyle(
                            "C{$row}"
                        )->getFont()->getColor()->setRGB('16A34A');
                    }

                    /*
                    | Permit
                    */

                    if (
                        str_contains($category, 'ptw')
                        || str_contains($category, 'permit')
                    ) {
                        $sheet->getStyle(
                            "C{$row}"
                        )->getFont()->getColor()->setRGB('7C3AED');
                    }
                }

                /*
                |--------------------------------------------------------------------------
                | FREEZE HEADER
                |--------------------------------------------------------------------------
                */

                $sheet->freezePane('A6');

                /*
                |--------------------------------------------------------------------------
                | AUTO FILTER
                |--------------------------------------------------------------------------
                */

                $sheet->setAutoFilter(
                    "A5:C{$highestRow}"
                );

                /*
                |--------------------------------------------------------------------------
                | ROW HEIGHT
                |--------------------------------------------------------------------------
                */

                $sheet->getRowDimension(1)->setRowHeight(28);
                $sheet->getRowDimension(2)->setRowHeight(20);
                $sheet->getRowDimension(3)->setRowHeight(18);
                $sheet->getRowDimension(5)->setRowHeight(22);

                for ($row = 6; $row <= $highestRow; $row++) {
                    $sheet->getRowDimension($row)->setRowHeight(19);
                }

                /*
                |--------------------------------------------------------------------------
                | PRINT SETTINGS
                |--------------------------------------------------------------------------
                */

                $sheet->getPageSetup()->setOrientation('portrait');
                $sheet->getPageSetup()->setPaperSize(
                    \PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::PAPERSIZE_A4
                );

                $sheet->getPageSetup()->setFitToWidth(1);
                $sheet->getPageSetup()->setFitToHeight(0);

                $sheet->getPageMargins()
                    ->setTop(0.4)
                    ->setRight(0.3)
                    ->setBottom(0.4)
                    ->setLeft(0.3);

                /*
                |--------------------------------------------------------------------------
                | PRINT TITLE
                |--------------------------------------------------------------------------
                */

                $sheet->getPageSetup()->setRowsToRepeatAtTopByStartAndEnd(1, 5);
            },
        ];
    }
}