<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">

    <?php
        /*
        |----------------------------------------------------------------
        | Company (ditaruh di sini, PALING ATAS <head>, supaya bisa dipakai
        | di @page CSS untuk running footer - lihat @bottom-left di bawah)
        |----------------------------------------------------------------
        | Mengambil company dari user yang sedang login.
        | Tidak mengubah controller.
        */
        $company = auth()->user()->company ?? null;

        $companyName = $company->name ?? 'HSE DASHBOARD';
        $companyAddress = $company->address ?? ($company->company_address ?? '');
    ?>

    <style>
        @page {
            margin: 30px 32px 42px 32px;

            @bottom-left {
                content: "<?php echo e($companyName); ?> \2022 HSE Dashboard";
                font-size: 6.5px;
                color: #9aa3af;
            }

            @bottom-right {
                content: "CONFIDENTIAL MANAGEMENT REPORT";
                font-size: 6.5px;
                font-weight: bold;
                color: #16324F;
            }
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: DejaVu Sans, Helvetica, Arial, sans-serif;
            font-size: 8.5px;
            color: #1f2937;
            margin: 0;
            padding: 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        td,
        th {
            vertical-align: top;
        }

        /* =========================================================
           COLOR SYSTEM
           Dipakai konsisten sama seperti chart di dashboard web
           (Dashboard.jsx), supaya laporan PDF & web terasa 1 identitas.
        ========================================================= */
        /*
            navy      #16324F  - warna utama / typografi penting
            slate     #5A6B7E  - teks sekunder
            amber     #F2A93B  - aksen utama (warning / highlight)
            blue      #4D9FEC  - info / netral
            green     #3FB27F  - positif / aman / closed
            red       #E5484D  - risiko / kritikal / rejected
            line      #E1E6EC  - garis & border halus
        */

        /* =========================================================
           HEADER
        ========================================================= */

        .header {
            padding-bottom: 12px;
            margin-bottom: 4px;
        }

        .header-accent-bar {
            height: 4px;
            background: #16324F;
            margin-bottom: 14px;
        }

        .header-accent-bar span {
            display: inline-block;
            height: 4px;
            width: 70px;
            background: #F2A93B;
        }

        .header-table td {
            border: none;
            padding: 0;
            vertical-align: middle;
        }

        .logo {
            width: 72px;
            height: 52px;
            text-align: center;
            vertical-align: middle;
        }

        .logo img {
            max-width: 68px;
            max-height: 48px;
        }

        .company-name {
            font-size: 16px;
            font-weight: bold;
            color: #16324F;
            letter-spacing: 0.2px;
            margin-bottom: 3px;
        }

        .company-address {
            font-size: 7.5px;
            color: #7b8794;
            line-height: 1.5;
        }

        .report-title {
            text-align: right;
        }

        .report-title .main {
            font-size: 13.5px;
            font-weight: bold;
            color: #16324F;
            text-transform: uppercase;
            letter-spacing: 0.6px;
        }

        .report-title .subtitle {
            font-size: 7.5px;
            color: #7b8794;
            margin-top: 4px;
        }

        .report-title .badge {
            display: inline-block;
            margin-top: 6px;
            padding: 2px 8px;
            background: #16324F;
            color: #ffffff;
            font-size: 6.5px;
            font-weight: bold;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        /* =========================================================
           META
        ========================================================= */

        .meta-box {
            background: #F7F9FB;
            border: 1px solid #E1E6EC;
            border-left: 3px solid #16324F;
            padding: 9px 12px;
            margin-bottom: 16px;
        }

        .meta-table td {
            border: none;
            padding: 1px 5px;
        }

        .meta-label {
            font-size: 6.8px;
            font-weight: bold;
            color: #8a93a0;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }

        .meta-value {
            font-size: 9px;
            font-weight: bold;
            color: #16324F;
            margin-top: 1px;
        }

        /* =========================================================
           SECTION
        ========================================================= */

        .section {
            margin-top: 16px;
        }

        .section-header {
            border-bottom: 1.5px solid #16324F;
            padding-bottom: 5px;
            margin-bottom: 9px;
        }

        .section-header-inner {
            border: none;
            padding: 0;
        }

        .section-tag {
            display: inline-block;
            width: 8px;
            height: 8px;
            background: #F2A93B;
            margin-right: 5px;
            vertical-align: middle;
        }

        .section-title {
            font-size: 10.5px;
            font-weight: bold;
            color: #16324F;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .section-description {
            font-size: 7px;
            color: #8a93a0;
            margin-top: 2px;
        }

        /* =========================================================
           KPI CARDS
        ========================================================= */

        .kpi-table {
            width: 100%;
            border-spacing: 6px;
            border-collapse: separate;
            margin-left: -6px;
            margin-right: -6px;
        }

        .kpi {
            border: 1px solid #E1E6EC;
            border-top: 3px solid #16324F;
            background: #ffffff;
            padding: 9px 10px;
            height: 55px;
        }

        .kpi-danger { border-top-color: #E5484D; }
        .kpi-warning { border-top-color: #F2A93B; }
        .kpi-info { border-top-color: #4D9FEC; }
        .kpi-success { border-top-color: #3FB27F; }
        .kpi-neutral { border-top-color: #16324F; }

        .kpi-label {
            font-size: 6.8px;
            font-weight: bold;
            color: #8a93a0;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            margin-bottom: 5px;
        }

        .kpi-value {
            font-size: 18px;
            font-weight: bold;
            color: #16324F;
            line-height: 1.1;
        }

        .kpi-note {
            font-size: 6.3px;
            color: #9aa3af;
            margin-top: 3px;
        }

        /* =========================================================
           TWO COLUMN
        ========================================================= */

        .two-column {
            width: 100%;
        }

        .two-column > tbody > tr > td {
            width: 50%;
            padding-right: 8px;
        }

        .two-column > tbody > tr > td:last-child {
            padding-right: 0;
            padding-left: 8px;
        }

        /* =========================================================
           CHART BOX
        ========================================================= */

        .chart-box {
            border: 1px solid #E1E6EC;
            padding: 10px 11px;
            background: #ffffff;
            min-height: 130px;
        }

        .chart-title {
            font-size: 8.5px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #16324F;
        }

        .bar-row {
            margin-bottom: 8px;
        }

        .bar-label {
            width: 32%;
            font-size: 7px;
            color: #4b5563;
            font-weight: bold;
        }

        .bar-track {
            width: 53%;
            background: #EEF1F5;
            height: 9px;
            border-radius: 2px;
        }

        .bar-fill {
            height: 9px;
            border-radius: 2px;
            background: #16324F;
        }

        .bar-number {
            width: 15%;
            text-align: right;
            font-size: 7.5px;
            font-weight: bold;
            color: #16324F;
        }

        /* =========================================================
           MINI TABLE
        ========================================================= */

        .data-table {
            border: 1px solid #E1E6EC;
        }

        .data-table th {
            background: #16324F;
            color: #ffffff;
            font-size: 6.8px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            padding: 6px 8px;
        }

        .data-table td {
            padding: 5px 8px;
            border-bottom: 1px solid #EEF1F5;
            font-size: 7.5px;
        }

        .data-table tr:last-child td {
            border-bottom: none;
        }

        .data-table tr:nth-child(even) td {
            background: #F8FAFC;
        }

        .status-dot {
            display: inline-block;
            width: 6px;
            height: 6px;
            border-radius: 3px;
            margin-right: 5px;
            background: #8a93a0;
        }

        .number {
            text-align: right;
            font-weight: bold;
            color: #16324F;
        }

        /* =========================================================
           HSE PERFORMANCE
        ========================================================= */

        .performance-box {
            border: 1px solid #E1E6EC;
            background: #F7F9FB;
            padding: 10px;
        }

        .performance-table td {
            border: none;
            padding: 4px 5px;
        }

        .performance-value {
            text-align: left;
            font-weight: bold;
            font-size: 15px;
            color: #16324F;
            margin-top: 3px;
        }

        /* =========================================================
           SUMMARY LIST
        ========================================================= */

        .summary-table td {
            border-bottom: 1px solid #EEF1F5;
            padding: 6px 7px;
        }

        .summary-table tr:last-child td {
            border-bottom: none;
        }

        .summary-label {
            color: #5f6875;
        }

        .summary-value {
            text-align: right;
            font-weight: bold;
            color: #16324F;
        }

        /* =========================================================
           TRAINING
        ========================================================= */

        .training-box {
            border: 1px solid #E1E6EC;
            padding: 11px;
        }

        .training-percent {
            font-size: 26px;
            font-weight: bold;
            color: #16324F;
        }

        .progress {
            height: 10px;
            background: #EEF1F5;
            border-radius: 3px;
            margin-top: 8px;
            margin-bottom: 6px;
        }

        .progress-fill {
            height: 10px;
            border-radius: 3px;
            background: #3FB27F;
        }

        .training-info {
            font-size: 7px;
            color: #6b7280;
        }

        /* =========================================================
           INSPECTION TREND
        ========================================================= */

        .trend-table {
            border: 1px solid #E1E6EC;
        }

        .trend-table th {
            background: #F7F9FB;
            color: #16324F;
            padding: 6px;
            font-size: 6.8px;
            font-weight: bold;
            text-align: center;
            border-bottom: 1px solid #E1E6EC;
        }

        .trend-table td {
            padding: 5px;
            border-bottom: 1px solid #EEF1F5;
            text-align: center;
            font-size: 7px;
        }

        .trend-bar-cell {
            height: 55px;
            vertical-align: bottom !important;
        }

        .trend-bar {
            display: inline-block;
            width: 12px;
            background: #4D9FEC;
            vertical-align: bottom;
            border-radius: 2px 2px 0 0;
        }

        .trend-finding {
            background: #E5484D;
        }

        /* =========================================================
           FOOTER
           (dirender via @page { @bottom-left/@bottom-right } di atas,
           bukan class CSS - lihat catatan di HTML bagian bawah body)
        ========================================================= */

        .page-break {
            page-break-before: always;
        }

        .muted {
            color: #8a93a0;
        }

        .empty {
            font-size: 7px;
            color: #9ca3af;
            padding: 12px;
            text-align: center;
        }
    </style>
</head>

<body>

<?php
    /*
    |--------------------------------------------------------------------------
    | Logo
    |--------------------------------------------------------------------------
    | Dibuat fleksibel mengikuti beberapa kemungkinan penyimpanan logo.
    */
    $logoPath = null;

    if ($company && !empty($company->logo)) {
        $possiblePaths = [
            public_path('storage/' . ltrim($company->logo, '/')),
            storage_path('app/public/' . ltrim($company->logo, '/')),
            public_path(ltrim($company->logo, '/')),
        ];

        foreach ($possiblePaths as $path) {
            if (file_exists($path)) {
                $logoPath = $path;
                break;
            }
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Helper
    |--------------------------------------------------------------------------
    */
    $totals = $stats['totals'] ?? [];

    $severity = (array) ($stats['incidentsBySeverity'] ?? []);
    $incidentStatus = (array) ($stats['incidentsByStatus'] ?? []);
    $capaStatus = (array) ($stats['capaByStatus'] ?? []);
    $ptwStatus = (array) ($stats['ptwStatus'] ?? []);

    $training = $stats['trainingCompliance'] ?? [
        'completed' => 0,
        'total' => 0,
        'percent' => 0,
    ];

    $inspectionTrend = $stats['safetyInspectionTrend'] ?? [];

    $maxSeverity = max(array_values($severity) ?: [1]);
    $maxIncidentStatus = max(array_values($incidentStatus) ?: [1]);
    $maxPtw = max(array_values($ptwStatus) ?: [1]);

    $trainingPercent = max(0, min(100, (int) ($training['percent'] ?? 0)));

    /*
    |--------------------------------------------------------------------------
    | Color mapping (dipakai KPI card, bar chart, status dot)
    |--------------------------------------------------------------------------
    | Warna sama persis dengan chart di dashboard web, supaya laporan PDF
    | & web punya identitas visual yang konsisten.
    */
    $statusColorMap = [
        'open' => '#E5484D', 'submitted' => '#F2A93B', 'in progress' => '#F2A93B',
        'pending' => '#F2A93B', 'draft' => '#8a93a0', 'unknown' => '#8a93a0',
        'approved' => '#4D9FEC', 'active' => '#3FB27F', 'closed' => '#3FB27F',
        'completed' => '#3FB27F', 'done' => '#3FB27F', 'achieved' => '#3FB27F',
        'rejected' => '#E5484D', 'critical' => '#E5484D', 'high' => '#E5484D',
        'medium' => '#F2A93B', 'low' => '#3FB27F',
    ];
    $colorFor = function ($label) use ($statusColorMap) {
        return $statusColorMap[strtolower(trim((string) $label))] ?? '#16324F';
    };
?>




<div class="header">
    <table class="header-table">
        <tr>

            <td style="width:75px;">
                <div class="logo">
                    <?php if($logoPath): ?>
                        <img src="<?php echo e($logoPath); ?>" alt="Logo">
                    <?php else: ?>
                        <div style="font-size:8px;font-weight:bold;">
                            HSE
                        </div>
                    <?php endif; ?>
                </div>
            </td>

            <td>
                <div class="company-name">
                    <?php echo e($companyName); ?>

                </div>

                <?php if($companyAddress): ?>
                    <div class="company-address">
                        <?php echo e($companyAddress); ?>

                    </div>
                <?php else: ?>
                    <div class="company-address">
                        Health, Safety & Environment Management System
                    </div>
                <?php endif; ?>
            </td>

            <td style="width:190px;">
                <div class="report-title">
                    <div class="main">
                        HSE Dashboard Report
                    </div>

                    <div class="subtitle">
                        Management Safety Performance Summary
                    </div>

                    <div class="badge">
                        <?php echo e(($stats['scope'] ?? '') === 'employee' ? 'Personal Report' : 'Confidential'); ?>

                    </div>
                </div>
            </td>

        </tr>
    </table>
</div>

<div class="header-accent-bar"><span></span></div>




<div class="meta-box">
    <table class="meta-table">
        <tr>
            <td style="width:25%;">
                <div class="meta-label">Periode Laporan</div>
                <div class="meta-value"><?php echo e($periodLabel); ?></div>
            </td>

            <td style="width:25%;">
                <div class="meta-label">Tanggal Dibuat</div>
                <div class="meta-value"><?php echo e($generatedAt); ?></div>
            </td>

            <td style="width:25%;">
                <div class="meta-label">Scope</div>
                <div class="meta-value">
                    <?php echo e(($stats['scope'] ?? '') === 'employee' ? 'Personal' : 'Management'); ?>

                </div>
            </td>

            <td style="width:25%;">
                <div class="meta-label">Dokumen</div>
                <div class="meta-value">HSE-DASHBOARD</div>
            </td>
        </tr>
    </table>
</div>




<?php if(($stats['scope'] ?? null) === 'employee'): ?>

    <div class="section">
        <div class="section-header">
            <div class="section-title"><span class="section-tag"></span>Ringkasan Aktivitas Saya</div>
            <div class="section-description">
                Ringkasan aktivitas HSE berdasarkan akun pengguna.
            </div>
        </div>

        <table class="kpi-table">
            <tr>
                <?php $__currentLoopData = $totals; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $key => $value): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <td class="kpi">
                        <div class="kpi-label">
                            <?php echo e($key); ?>

                        </div>

                        <div class="kpi-value">
                            <?php echo e($value); ?>

                        </div>
                    </td>

                    <?php if($loop->iteration % 4 === 0 && !$loop->last): ?>
                        </tr><tr>
                    <?php endif; ?>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
            </tr>
        </table>
    </div>


    <?php if(!empty($stats['myPermitsByStatus'])): ?>

        <div class="section">
            <div class="section-header">
                <div class="section-title"><span class="section-tag"></span>Status Permit Saya</div>
            </div>

            <div class="chart-box">

                <?php
                    $employeePermitStatus = (array) $stats['myPermitsByStatus'];
                    $maxEmployeePermit = max(array_values($employeePermitStatus) ?: [1]);
                ?>

                <?php $__currentLoopData = $employeePermitStatus; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $key => $value): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>

                    <?php
                        $width = $maxEmployeePermit > 0
                            ? ($value / $maxEmployeePermit) * 100
                            : 0;
                    ?>

                    <table style="margin-bottom:6px;">
                        <tr>
                            <td class="bar-label">
                                <?php echo e($key); ?>

                            </td>

                            <td class="bar-track">
                                <div class="bar-fill"
                                     style="width:<?php echo e($width); ?>%; background: <?php echo e($colorFor($key)); ?>;"></div>
                            </td>

                            <td class="bar-number">
                                <?php echo e($value); ?>

                            </td>
                        </tr>
                    </table>

                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>

            </div>
        </div>

    <?php endif; ?>


<?php else: ?>




<div class="section">

    <div class="section-header">
        <div class="section-title"><span class="section-tag"></span>Executive HSE Summary</div>

        <div class="section-description">
            Indikator utama performa Health, Safety & Environment.
        </div>
    </div>


    
    <table class="kpi-table">
        <tr>

            <td class="kpi kpi-danger">
                <div class="kpi-label">Total Incident</div>
                <div class="kpi-value">
                    <?php echo e($totals['incidents'] ?? 0); ?>

                </div>
                <div class="kpi-note">Periode laporan</div>
            </td>

            <td class="kpi kpi-warning">
                <div class="kpi-label">Open Incident</div>
                <div class="kpi-value">
                    <?php echo e($totals['openIncidents'] ?? 0); ?>

                </div>
                <div class="kpi-note">Belum closed</div>
            </td>

            <td class="kpi kpi-info">
                <div class="kpi-label">Permit</div>
                <div class="kpi-value">
                    <?php echo e($totals['permits'] ?? 0); ?>

                </div>
                <div class="kpi-note">Total PTW</div>
            </td>

            <td class="kpi kpi-success">
                <div class="kpi-label">Active Permit</div>
                <div class="kpi-value">
                    <?php echo e($totals['activePermits'] ?? 0); ?>

                </div>
                <div class="kpi-note">Permit aktif</div>
            </td>

        </tr>
    </table>


    
    <table class="kpi-table">
        <tr>

            <td class="kpi kpi-info">
                <div class="kpi-label">Inspection</div>
                <div class="kpi-value">
                    <?php echo e($totals['inspections'] ?? 0); ?>

                </div>
            </td>

            <td class="kpi kpi-success">
                <div class="kpi-label">Training</div>
                <div class="kpi-value">
                    <?php echo e($totals['trainings'] ?? 0); ?>

                </div>
            </td>

            <td class="kpi kpi-warning">
                <div class="kpi-label">CAPA Open</div>
                <div class="kpi-value">
                    <?php echo e($totals['openCapa'] ?? 0); ?>

                </div>
            </td>

            <td class="kpi kpi-danger">
                <div class="kpi-label">Document Expired</div>
                <div class="kpi-value">
                    <?php echo e($totals['docsExpired'] ?? 0); ?>

                </div>
            </td>

        </tr>
    </table>

</div>




<div class="section">

    <table class="two-column">

        <tr>

            
            <td>

                <div class="section-header">
                    <div class="section-title">
                        <span class="section-tag"></span>Incident by Severity
                    </div>
                </div>

                <div class="chart-box">

                    <?php if(count($severity)): ?>

                        <?php $__currentLoopData = $severity; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $key => $value): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>

                            <?php
                                $width = $maxSeverity > 0
                                    ? ($value / $maxSeverity) * 100
                                    : 0;
                            ?>

                            <table class="bar-row">
                                <tr>

                                    <td class="bar-label">
                                        <?php echo e($key); ?>

                                    </td>

                                    <td class="bar-track">
                                        <div class="bar-fill"
                                             style="width:<?php echo e($width); ?>%; background: <?php echo e($colorFor($key)); ?>;"></div>
                                    </td>

                                    <td class="bar-number">
                                        <?php echo e($value); ?>

                                    </td>

                                </tr>
                            </table>

                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>

                    <?php else: ?>

                        <div class="empty">
                            Tidak ada data incident.
                        </div>

                    <?php endif; ?>

                </div>

            </td>


            
            <td>

                <div class="section-header">
                    <div class="section-title">
                        <span class="section-tag"></span>Permit to Work Status
                    </div>
                </div>

                <div class="chart-box">

                    <?php if(count($ptwStatus)): ?>

                        <?php $__currentLoopData = $ptwStatus; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $key => $value): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>

                            <?php
                                $width = $maxPtw > 0
                                    ? ($value / $maxPtw) * 100
                                    : 0;
                            ?>

                            <table class="bar-row">
                                <tr>

                                    <td class="bar-label">
                                        <?php echo e($key); ?>

                                    </td>

                                    <td class="bar-track">
                                        <div class="bar-fill"
                                             style="width:<?php echo e($width); ?>%; background: <?php echo e($colorFor($key)); ?>;"></div>
                                    </td>

                                    <td class="bar-number">
                                        <?php echo e($value); ?>

                                    </td>

                                </tr>
                            </table>

                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>

                    <?php else: ?>

                        <div class="empty">
                            Tidak ada data permit.
                        </div>

                    <?php endif; ?>

                </div>

            </td>

        </tr>

    </table>

</div>




<div class="section">

    <table class="two-column">

        <tr>

            <td>

                <div class="section-header">
                    <div class="section-title">
                        <span class="section-tag"></span>Incident Status
                    </div>
                </div>

                <table class="data-table">

                    <tr>
                        <th>Status</th>
                        <th style="text-align:right;">Jumlah</th>
                    </tr>

                    <?php $__empty_1 = true; $__currentLoopData = $incidentStatus; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $key => $value): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>

                        <tr>
                            <td><span class="status-dot" style="background:<?php echo e($colorFor($key)); ?>;"></span><?php echo e($key); ?></td>
                            <td class="number"><?php echo e($value); ?></td>
                        </tr>

                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>

                        <tr>
                            <td colspan="2" class="empty">
                                Tidak ada data.
                            </td>
                        </tr>

                    <?php endif; ?>

                </table>

            </td>


            <td>

                <div class="section-header">
                    <div class="section-title">
                        <span class="section-tag"></span>CAPA Status
                    </div>
                </div>

                <table class="data-table">

                    <tr>
                        <th>Status</th>
                        <th style="text-align:right;">Jumlah</th>
                    </tr>

                    <?php $__empty_1 = true; $__currentLoopData = $capaStatus; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $key => $value): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>

                        <tr>
                            <td><span class="status-dot" style="background:<?php echo e($colorFor($key)); ?>;"></span><?php echo e($key); ?></td>
                            <td class="number"><?php echo e($value); ?></td>
                        </tr>

                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>

                        <tr>
                            <td colspan="2" class="empty">
                                Tidak ada data.
                            </td>
                        </tr>

                    <?php endif; ?>

                </table>

            </td>

        </tr>

    </table>

</div>




<div class="section">

    <div class="section-header">
        <div class="section-title">
            <span class="section-tag"></span>Training Compliance
        </div>

        <div class="section-description">
            Persentase penyelesaian training pada periode laporan.
        </div>
    </div>

    <div class="training-box">

        <table>
            <tr>

                <td style="width:75%;">

                    <div class="training-percent">
                        <?php echo e($trainingPercent); ?>%
                    </div>

                    <div class="progress">
                        <div class="progress-fill"
                             style="width:<?php echo e($trainingPercent); ?>%;"></div>
                    </div>

                    <div class="training-info">
                        <?php echo e($training['completed'] ?? 0); ?>

                        training selesai dari
                        <?php echo e($training['total'] ?? 0); ?>

                        training.
                    </div>

                </td>

                <td style="width:25%;">

                    <table class="summary-table">

                        <tr>
                            <td class="summary-label">
                                Completed
                            </td>

                            <td class="summary-value">
                                <?php echo e($training['completed'] ?? 0); ?>

                            </td>
                        </tr>

                        <tr>
                            <td class="summary-label">
                                Total
                            </td>

                            <td class="summary-value">
                                <?php echo e($training['total'] ?? 0); ?>

                            </td>
                        </tr>

                    </table>

                </td>

            </tr>
        </table>

    </div>

</div>




<?php if(count($inspectionTrend)): ?>

    <div class="section page-break">

        <div class="section-header">

            <div class="section-title">
                <span class="section-tag"></span>Safety Inspection Trend
            </div>

            <div class="section-description">
                Perbandingan jumlah inspection dan finding berdasarkan periode.
            </div>

        </div>


        <table class="trend-table">

            <tr>
                <?php $__currentLoopData = $inspectionTrend; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $item): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>

                    <th>
                        <?php echo e($item['month'] ?? '-'); ?>

                    </th>

                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
            </tr>

            <tr>

                <?php
                    $maxInspection = max(
                        array_map(
                            fn($x) => (int)($x['inspection'] ?? 0),
                            $inspectionTrend
                        ) ?: [1]
                    );
                ?>

                <?php $__currentLoopData = $inspectionTrend; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $item): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>

                    <?php
                        $inspection = (int) ($item['inspection'] ?? 0);

                        $height = $maxInspection > 0
                            ? max(5, ($inspection / $maxInspection) * 45)
                            : 5;
                    ?>

                    <td class="trend-bar-cell">

                        <div style="font-size:6.5px;margin-bottom:3px;">
                            <?php echo e($inspection); ?>

                        </div>

                        <div class="trend-bar"
                             style="height:<?php echo e($height); ?>px;">
                        </div>

                    </td>

                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>

            </tr>

            <tr>

                <?php $__currentLoopData = $inspectionTrend; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $item): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>

                    <td>

                        <span class="muted">
                            Finding:
                        </span>

                        <?php echo e($item['finding'] ?? 0); ?>


                    </td>

                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>

            </tr>

        </table>

    </div>

<?php endif; ?>




<?php if(!empty($stats['hsePerformance']['latest'])): ?>

    <?php
        $performance = $stats['hsePerformance']['latest'];
    ?>

    <div class="section">

        <div class="section-header">

            <div class="section-title">
                <span class="section-tag"></span>HSE Performance
            </div>

            <div class="section-description">
                Indikator performa keselamatan kumulatif.
            </div>

        </div>

        <div class="performance-box">

            <table class="performance-table">

                <tr>

                    <td style="width:25%;">
                        <div class="meta-label">TRIR</div>

                        <div class="performance-value">
                            <?php echo e($performance['trir'] ?? 0); ?>

                        </div>
                    </td>

                    <td style="width:25%;">
                        <div class="meta-label">LTIF</div>

                        <div class="performance-value">
                            <?php echo e($performance['ltif'] ?? 0); ?>

                        </div>
                    </td>

                    <td style="width:25%;">
                        <div class="meta-label">Man Hours</div>

                        <div class="performance-value">
                            <?php echo e(number_format($performance['man_hours_cumulative'] ?? 0)); ?>

                        </div>
                    </td>

                    <td style="width:25%;">
                        <div class="meta-label">Workers</div>

                        <div class="performance-value">
                            <?php echo e(number_format($performance['total_workers'] ?? 0)); ?>

                        </div>
                    </td>

                </tr>

            </table>

        </div>

    </div>

<?php endif; ?>




<?php if(!empty($stats['incidentSummary'])): ?>

    <div class="section">

        <div class="section-header">

            <div class="section-title">
                <span class="section-tag"></span>Incident Summary
            </div>

            <div class="section-description">
                Ringkasan kejadian keselamatan secara kumulatif.
            </div>

        </div>


        <table class="data-table">

            <tr>
                <th>Indikator</th>
                <th style="text-align:right;">Jumlah</th>
            </tr>

            <?php $__currentLoopData = $stats['incidentSummary']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $key => $value): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>

                <tr>

                    <td>
                        <?php echo e($key); ?>

                    </td>

                    <td class="number">
                        <?php echo e($value); ?>

                    </td>

                </tr>

            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>

        </table>

    </div>

<?php endif; ?>




<div class="section">

    <div class="section-header">

        <div class="section-title">
            <span class="section-tag"></span>Document & Compliance Status
        </div>

    </div>


    <table class="data-table">

        <tr>
            <th>Indikator</th>
            <th style="text-align:right;">Jumlah</th>
        </tr>

        <tr>
            <td>Total Documents</td>
            <td class="number">
                <?php echo e($totals['documents'] ?? 0); ?>

            </td>
        </tr>

        <tr>
            <td>Documents Expiring Soon</td>
            <td class="number">
                <?php echo e($totals['docsExpiringSoon'] ?? 0); ?>

            </td>
        </tr>

        <tr>
            <td>Documents Expired</td>
            <td class="number">
                <?php echo e($totals['docsExpired'] ?? 0); ?>

            </td>
        </tr>

        <tr>
            <td>Total KPI</td>
            <td class="number">
                <?php echo e($totals['kpis'] ?? 0); ?>

            </td>
        </tr>

        <tr>
            <td>KPI Achieved</td>
            <td class="number">
                <?php echo e($totals['kpiAchieved'] ?? 0); ?>

            </td>
        </tr>

    </table>

</div>

<?php endif; ?>





</body>
</html><?php /**PATH E:\1KERJAAN\Telisik Studio\Dashboard HSE\hse-dashboard\backend\resources\views/exports/dashboard-pdf.blade.php ENDPATH**/ ?>