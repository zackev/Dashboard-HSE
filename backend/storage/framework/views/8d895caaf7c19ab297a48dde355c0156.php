<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
    @page { margin: 18px 22px; }

    body {
        font-family: Helvetica, Arial, sans-serif;
        font-size: 8.5px;
        color: #111;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    td, th {
        border: 1px solid #000;
        padding: 2px 4px;
        vertical-align: top;
    }

    .no-border td,
    .no-border {
        border: none;
        padding: 0;
    }

    .section-title {
        background: #000;
        color: #fff;
        font-weight: bold;
        padding: 3px 5px;
        font-size: 9px;
        text-transform: uppercase;
    }

    .label {
        font-weight: normal;
        white-space: nowrap;
        width: 110px;
    }

    .center {
        text-align: center;
    }

    .bold {
        font-weight: bold;
    }

    .small {
        font-size: 7.5px;
    }

    .italic {
        font-style: italic;
    }

    .checkbox {
        display: inline-block;
        width: 8px;
        height: 8px;
        border: 1px solid #000;
        margin-right: 3px;
        vertical-align: middle;
    }

    .checked {
        background: #000;
    }

    .header-table td {
        border: none;
        padding: 1px 4px;
    }

    .logo-box {
        border: none;
        padding: 4px;
        text-align: center;
        width: 80px;
        height: 60px;
    }

    .logo-box img {
        display: block;
        margin: auto;
        max-width: 80px;
        max-height: 55px;
    }

    .title-box {
        text-align: center;
        vertical-align: middle;
    }

    .title-box h1 {
        font-size: 15px;
        margin: 6px 0 2px;
    }

    .company-name {
        font-size: 13px;
        font-weight: bold;
    }

    .company-short-name {
        font-size: 8px;
        font-weight: bold;
    }

    .company-address {
        font-size: 7.5px;
        margin-top: 2px;
    }

    .company-contact {
        font-size: 7px;
        margin-top: 1px;
    }

    .doc-info-table td {
        border: 1px solid #000;
        font-size: 7.5px;
        padding: 1px 4px;
    }

    .sig-block {
        width: 33.33%;
    }

    .sig-row td {
        height: 14px;
    }
</style>
</head>

<body>

<?php
    /*
     * Ambil perusahaan dari user yang sedang login.
     */
    $company = auth()->user()->company;

    /*
     * Lokasi file logo perusahaan.
     */
    $logoPath = null;

    if ($company?->logo) {
        $possiblePath = storage_path('app/public/' . $company->logo);

        if (file_exists($possiblePath)) {
            $logoPath = $possiblePath;
        }
    }
?>



<table class="no-border" style="margin-bottom:4px;">
    <tr>

        
        <td style="width:90px; vertical-align:middle;">
            <div class="logo-box">
                <?php if($logoPath): ?>
                    <img src="<?php echo e($logoPath); ?>" alt="Logo">
                <?php else: ?>
                    <span class="bold small">LOGO</span>
                <?php endif; ?>
            </div>
        </td>


        
        <td class="title-box">

            <div class="company-name">
                <?php echo e($company?->name ?? 'NAMA PERUSAHAAN'); ?>

            </div>

            <?php if($company?->short_name): ?>
                <div class="company-short-name">
                    <?php echo e($company->short_name); ?>

                </div>
            <?php endif; ?>

            <?php if($company?->address): ?>
                <div class="company-address">
                    <?php echo e($company->address); ?>


                    <?php if($company->city): ?>
                        , <?php echo e($company->city); ?>

                    <?php endif; ?>

                    <?php if($company->province): ?>
                        , <?php echo e($company->province); ?>

                    <?php endif; ?>

                    <?php if($company->postal_code): ?>
                        <?php echo e($company->postal_code); ?>

                    <?php endif; ?>
                </div>
            <?php endif; ?>

            <?php if($company?->phone || $company?->email || $company?->website): ?>
                <div class="company-contact">

                    <?php if($company?->phone): ?>
                        Telp: <?php echo e($company->phone); ?>

                    <?php endif; ?>

                    <?php if($company?->email): ?>
                        <?php if($company?->phone): ?> | <?php endif; ?>
                        Email: <?php echo e($company->email); ?>

                    <?php endif; ?>

                    <?php if($company?->website): ?>
                        <?php if($company?->phone || $company?->email): ?> | <?php endif; ?>
                        <?php echo e($company->website); ?>

                    <?php endif; ?>

                </div>
            <?php endif; ?>

            <h1>
                SURAT IZIN PEKERJAAN RESIKO TINGGI
            </h1>

        </td>


        
        <td style="width:150px; padding:0; vertical-align:top;">
            <table class="doc-info-table">
                <tr>
                    <td>No Dok</td>
                    <td>: <?php echo e($permit->doc_number ?? '-'); ?></td>
                </tr>

                <tr>
                    <td>No Rev</td>
                    <td>: <?php echo e($permit->doc_revision ?? '-'); ?></td>
                </tr>

                <tr>
                    <td>Tgl Rilis</td>
                    <td>
                        :
                        <?php echo e($permit->doc_release_date
                            ? \Carbon\Carbon::parse($permit->doc_release_date)->format('d M Y')
                            : '-'); ?>

                    </td>
                </tr>

                <tr>
                    <td>Hal</td>
                    <td>: <?php echo e($permit->doc_pages ?? '-'); ?></td>
                </tr>
            </table>
        </td>

    </tr>
</table>


<table class="no-border" style="margin-bottom:2px;">
    <tr>
        <td class="bold">
            Nomor : <?php echo e($permit->permit_no); ?>

        </td>

        <td class="bold" style="text-align:right;">
            Tanggal : <?php echo e($permit->created_at->format('d M Y')); ?>

        </td>
    </tr>
</table>



<div class="section-title">
    A. Klasifikasi Pekerjaan
</div>

<table>
    <tr>
        <?php $__currentLoopData = [
            'Kerja Panas',
            'Kerja Listrik',
            'Ketinggian',
            'Alat Berat',
            'Perpipaan',
            'Tangki',
            'Ruang Terbatas',
            'Galian'
        ]; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $c): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>

            <?php
                $on = in_array($c, $permit->work_classifications ?? []);
            ?>

            <td class="center" style="width:12.5%;">
                <span class="checkbox <?php echo e($on ? 'checked' : ''); ?>"></span>
                <?php echo e($c); ?>

            </td>

        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
    </tr>
</table>



<div class="section-title">
    B. Informasi Pekerjaan
</div>

<table>
    <tr>

        <td style="width:50%; padding:0;">
            <table class="no-border">

                <tr>
                    <td class="label">Pekerjaan</td>
                    <td>: <?php echo e($permit->work_description); ?></td>
                </tr>

                <tr>
                    <td class="label">Lokasi</td>
                    <td>: <?php echo e($permit->location); ?></td>
                </tr>

                <tr>
                    <td class="label">Area</td>
                    <td>: <?php echo e($permit->area); ?></td>
                </tr>

                <tr>
                    <td class="label">Plant</td>
                    <td>: <?php echo e($permit->plant); ?></td>
                </tr>

                <tr>
                    <td class="label">Nama Manajer Area</td>
                    <td>: <?php echo e($permit->area_manager_name); ?></td>
                </tr>

                <tr>
                    <td class="label">Telp Manajer Area</td>
                    <td>: <?php echo e($permit->area_manager_phone); ?></td>
                </tr>

                <tr>
                    <td class="label">Nama Pemohon</td>
                    <td>: <?php echo e($permit->requested_by); ?></td>
                </tr>

                <tr>
                    <td class="label">Telp Pemohon</td>
                    <td>: <?php echo e($permit->requester_phone); ?></td>
                </tr>

                <tr>
                    <td class="label">Pengawas</td>
                    <td>: <?php echo e($permit->supervisor_name); ?></td>
                </tr>

                <tr>
                    <td class="label">Telp Pengawas</td>
                    <td>: <?php echo e($permit->supervisor_phone); ?></td>
                </tr>

                <tr>
                    <td class="label">Petugas K3</td>
                    <td>: <?php echo e($permit->safety_officer_name); ?></td>
                </tr>

                <tr>
                    <td class="label">Telp Petugas K3</td>
                    <td>: <?php echo e($permit->safety_officer_phone); ?></td>
                </tr>

                <tr>
                    <td class="label">Perusahaan Pemohon</td>
                    <td>: <?php echo e($permit->requester_company); ?></td>
                </tr>

            </table>
        </td>


        <td style="width:50%; padding:0;">
            <table>

                <tr>
                    <th>Daftar Pekerja</th>
                    <th style="width:40px;">Jumlah</th>
                </tr>

                <?php $__empty_1 = true; $__currentLoopData = ($permit->workers ?? []); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $w): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>

                    <tr>
                        <td><?php echo e($w['role'] ?? ''); ?></td>
                        <td class="center"><?php echo e($w['qty'] ?? ''); ?></td>
                    </tr>

                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>

                    <tr>
                        <td colspan="2" class="italic">
                            Tidak ada data
                        </td>
                    </tr>

                <?php endif; ?>

            </table>
        </td>

    </tr>
</table>



<div class="section-title">
    C. Perlengkapan Kerja
</div>

<table>

    <tr>
        <th>Kategori</th>
        <th>Nama</th>
        <th style="width:50px;">Jumlah</th>
    </tr>

    <?php $__empty_1 = true; $__currentLoopData = ($permit->equipment ?? []); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $e): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>

        <tr>
            <td><?php echo e($e['category'] ?? ''); ?></td>
            <td><?php echo e($e['name'] ?? ''); ?></td>
            <td class="center"><?php echo e($e['qty'] ?? ''); ?></td>
        </tr>

    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>

        <tr>
            <td colspan="3" class="italic">
                Tidak ada data
            </td>
        </tr>

    <?php endif; ?>

</table>

<p class="small italic">
    * Semua perlengkapan kerja diperiksa oleh Petugas K3.
</p>



<div class="section-title">
    D. Keselamatan Kerja
</div>

<table>

    <tr>
        <th style="width:25px;">No</th>
        <th>Aktivitas</th>
        <th>Potensi Bahaya</th>
        <th>Langkah Aman Pekerjaan</th>
    </tr>

    <?php $__empty_1 = true; $__currentLoopData = ($permit->jsa ?? []); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i => $row): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>

        <tr>
            <td class="center"><?php echo e($i + 1); ?></td>
            <td><?php echo e($row['step'] ?? ''); ?></td>
            <td><?php echo e($row['hazard'] ?? ''); ?></td>
            <td><?php echo e($row['control'] ?? ''); ?></td>
        </tr>

    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>

        <tr>
            <td colspan="4" class="italic">
                Tidak ada data
            </td>
        </tr>

    <?php endif; ?>

</table>

<p class="small italic">
    *Identifikasi bahaya dijadikan sebagai panduan bekerja secara aman dan selamat.
</p>



<div class="section-title">
    E. Peralatan Keselamatan
</div>

<?php
    $se = $permit->safety_equipment ?? [];
?>

<table>

    <tr>

        <?php $__currentLoopData = \App\Models\Permit::SAFETY_EQUIPMENT_GROUPS; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $group => $items): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>

            <td style="width:33.33%; padding:3px;">

                <div class="bold small center" style="margin-bottom:2px;">
                    <?php echo e($group); ?>

                </div>

                <?php $__currentLoopData = $items; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $item): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>

                    <div class="small">
                        <span class="checkbox <?php echo e(in_array($item, $se) ? 'checked' : ''); ?>"></span>
                        <?php echo e($item); ?>

                    </div>

                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>

            </td>

        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>

    </tr>

</table>



<div class="section-title">
    F. Validasi Izin Kerja
</div>

<table>

    <tr>
        <th class="sig-block">Izin Diberikan</th>
        <th class="sig-block">Izin Lembur</th>
        <th class="sig-block">Izin Dibatalkan</th>
    </tr>


    <tr>

        <td>
            Mulai Jam : <?php echo e($permit->start_time); ?>

            <br>
            Sampai Jam : <?php echo e($permit->end_time); ?>

        </td>


        <td>

            <?php
                $ot = $permit->overtimes->first();
            ?>

            <?php if($ot): ?>

                Mulai Jam : <?php echo e($ot->start_time); ?>

                <br>
                Sampai Jam : <?php echo e($ot->end_time); ?>


            <?php else: ?>

                <span class="italic small">
                    Tidak ada izin lembur
                </span>

            <?php endif; ?>

        </td>


        <td>

            <?php if($permit->status === 'Rejected'): ?>

                Jam : <?php echo e(now()->format('H:i')); ?>

                <br>
                Keterangan : <?php echo e($permit->rejection_reason); ?>


            <?php else: ?>

                <span class="italic small">
                    -
                </span>

            <?php endif; ?>

        </td>

    </tr>


    <tr class="sig-row">

        <td class="bold">
            Disiapkan
            <br>
            <span class="small" style="font-weight:normal;">
                Pemohon
            </span>
        </td>

        <td class="bold">
            Disiapkan
            <br>
            <span class="small" style="font-weight:normal;">
                Pemohon
            </span>
        </td>

        <td class="bold">
            Disiapkan
            <br>
            <span class="small" style="font-weight:normal;">
                Pemohon
            </span>
        </td>

    </tr>


    <tr>

        <td>
            Nama : <?php echo e($permit->requested_by); ?>

            <br>
            Tanggal : <?php echo e($permit->created_at->format('d M Y')); ?>

        </td>

        <td>
            Nama : <?php echo e($ot->requester->name ?? '-'); ?>

            <br>
            Tanggal : <?php echo e($ot?->created_at?->format('d M Y') ?? '-'); ?>

        </td>

        <td>
            Nama : -
            <br>
            Tanggal : -
        </td>

    </tr>


    <tr class="sig-row">

        <td class="bold">
            Diperiksa
            <br>
            <span class="small" style="font-weight:normal;">
                Pengawas K3
            </span>
        </td>

        <td class="bold">
            Diperiksa
            <br>
            <span class="small" style="font-weight:normal;">
                Pengawas K3
            </span>
        </td>

        <td class="bold">
            Diperiksa
            <br>
            <span class="small" style="font-weight:normal;">
                Pengawas K3
            </span>
        </td>

    </tr>


    <tr>

        <td>
            Nama : <?php echo e($permit->adminReviewer->name ?? '-'); ?>

            <br>
            Tanggal :
            <?php echo e($permit->admin_reviewed_at
                ? \Carbon\Carbon::parse($permit->admin_reviewed_at)->format('d M Y')
                : '-'); ?>

        </td>

        <td>
            Nama : <?php echo e($ot->adminReviewer->name ?? '-'); ?>

            <br>
            Tanggal :
            <?php echo e($ot?->admin_reviewed_at
                ? \Carbon\Carbon::parse($ot->admin_reviewed_at)->format('d M Y')
                : '-'); ?>

        </td>

        <td>
            Nama : -
            <br>
            Tanggal : -
        </td>

    </tr>


    <tr class="sig-row">

        <td class="bold">
            Mengetahui
            <br>
            <span class="small" style="font-weight:normal;">
                Manajer Area (GM)
            </span>
        </td>

        <td class="bold">
            Mengetahui
            <br>
            <span class="small" style="font-weight:normal;">
                Manajer Area (GM)
            </span>
        </td>

        <td class="bold">
            Mengetahui
            <br>
            <span class="small" style="font-weight:normal;">
                Manajer Area (GM)
            </span>
        </td>

    </tr>


    <tr>

        <td>
            Nama : <?php echo e($permit->gmReviewer->name ?? '-'); ?>

            <br>
            Tanggal :
            <?php echo e($permit->gm_reviewed_at
                ? \Carbon\Carbon::parse($permit->gm_reviewed_at)->format('d M Y')
                : '-'); ?>

        </td>

        <td>
            Nama : <?php echo e($ot->gmReviewer->name ?? '-'); ?>

            <br>
            Tanggal :
            <?php echo e($ot?->gm_reviewed_at
                ? \Carbon\Carbon::parse($ot->gm_reviewed_at)->format('d M Y')
                : '-'); ?>

        </td>

        <td>
            Nama : -
            <br>
            Tanggal : -
        </td>

    </tr>


    <tr>

        <td colspan="3" class="small italic">
            *Catatan Lain :
            <?php echo e($permit->admin_note ?? $permit->gm_note ?? '-'); ?>

        </td>

    </tr>

</table>



<p class="small italic" style="margin-top:6px;">
    * Dokumen ini dihasilkan otomatis oleh sistem HSE Dashboard dan sah tanpa tanda tangan basah,
    mengikuti rekam jejak approval digital (Admin &amp; GM) di atas.
</p>


</body>
</html><?php /**PATH E:\1KERJAAN\Telisik Studio\Dashboard HSE\hse-dashboard\backend\resources\views/exports/work-permit-pdf.blade.php ENDPATH**/ ?>