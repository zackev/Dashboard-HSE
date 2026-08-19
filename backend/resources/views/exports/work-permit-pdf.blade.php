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

@php
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

    $adminStatus = strtoupper($permit->admin_status ?? 'PENDING');
    $gmStatus = strtoupper($permit->gm_status ?? 'PENDING');

    $adminApproved = $adminStatus === 'APPROVED';
    $adminRejected = $adminStatus === 'REJECTED';

    $gmApproved = $gmStatus === 'APPROVED';
    $gmRejected = $gmStatus === 'REJECTED';

    $ot = $permit->overtimes->first();

    $adminStatusStyle = match ($adminStatus) {
        'APPROVED' => 'background:#dcfce7;color:#166534;border:1px solid #86efac;',
        'REJECTED' => 'background:#fee2e2;color:#991b1b;border:1px solid #fca5a5;',
        default => 'background:#fef3c7;color:#92400e;border:1px solid #fcd34d;',
    };

    $gmStatusStyle = match ($gmStatus) {
        'APPROVED' => 'background:#dcfce7;color:#166534;border:1px solid #86efac;',
        'REJECTED' => 'background:#fee2e2;color:#991b1b;border:1px solid #fca5a5;',
        default => 'background:#fef3c7;color:#92400e;border:1px solid #fcd34d;',
    };

@endphp


{{-- =========================================================
     KOP SURAT
========================================================= --}}
<table class="no-border" style="margin-bottom:4px;">
    <tr>

        {{-- LOGO PERUSAHAAN --}}
        <td style="width:90px; vertical-align:middle;">
            <div class="logo-box">
                @if ($logoPath)
                    <img src="{{ $logoPath }}" alt="Logo">
                @else
                    <span class="bold small">LOGO</span>
                @endif
            </div>
        </td>


        {{-- IDENTITAS PERUSAHAAN --}}
        <td class="title-box">

            <div class="company-name">
                {{ $company?->name ?? 'NAMA PERUSAHAAN' }}
            </div>

            @if ($company?->short_name)
                <div class="company-short-name">
                    {{ $company->short_name }}
                </div>
            @endif

            @if ($company?->address)
                <div class="company-address">
                    {{ $company->address }}

                    @if ($company->city)
                        , {{ $company->city }}
                    @endif

                    @if ($company->province)
                        , {{ $company->province }}
                    @endif

                    @if ($company->postal_code)
                        {{ $company->postal_code }}
                    @endif
                </div>
            @endif

            @if ($company?->phone || $company?->email || $company?->website)
                <div class="company-contact">

                    @if ($company?->phone)
                        Telp: {{ $company->phone }}
                    @endif

                    @if ($company?->email)
                        @if ($company?->phone) | @endif
                        Email: {{ $company->email }}
                    @endif

                    @if ($company?->website)
                        @if ($company?->phone || $company?->email) | @endif
                        {{ $company->website }}
                    @endif

                </div>
            @endif

            <h1>
                SURAT IZIN PEKERJAAN RESIKO TINGGI
            </h1>

        </td>


        {{-- INFORMASI DOKUMEN --}}
        <td style="width:150px; padding:0; vertical-align:top;">
            <table class="doc-info-table">
                <tr>
                    <td>No Dok</td>
                    <td>: {{ $permit->doc_number ?? '-' }}</td>
                </tr>

                <tr>
                    <td>No Rev</td>
                    <td>: {{ $permit->doc_revision ?? '-' }}</td>
                </tr>

                <tr>
                    <td>Tgl Rilis</td>
                    <td>
                        :
                        {{ $permit->doc_release_date
                            ? \Carbon\Carbon::parse($permit->doc_release_date)->format('d M Y')
                            : '-' }}
                    </td>
                </tr>

                <tr>
                    <td>Hal</td>
                    <td>: {{ $permit->doc_pages ?? '-' }}</td>
                </tr>
            </table>
        </td>

    </tr>
</table>


<table class="no-border" style="margin-bottom:2px;">
    <tr>
        <td class="bold">
            Nomor : {{ $permit->permit_no }}
        </td>

        <td class="bold" style="text-align:right;">
            Tanggal : {{ $permit->created_at->format('d M Y') }}
        </td>
    </tr>
</table>


{{-- =========================================================
     A. KLASIFIKASI PEKERJAAN
========================================================= --}}
<div class="section-title">
    A. Klasifikasi Pekerjaan
</div>

<table>
    <tr>
        @foreach ([
            'Kerja Panas',
            'Kerja Listrik',
            'Ketinggian',
            'Alat Berat',
            'Perpipaan',
            'Tangki',
            'Ruang Terbatas',
            'Galian'
        ] as $c)

            @php
                $on = in_array($c, $permit->work_classifications ?? []);
            @endphp

            <td class="center" style="width:12.5%;">
                <span class="checkbox {{ $on ? 'checked' : '' }}"></span>
                {{ $c }}
            </td>

        @endforeach
    </tr>
</table>


{{-- =========================================================
     B. INFORMASI PEKERJAAN
========================================================= --}}
<div class="section-title">
    B. Informasi Pekerjaan
</div>

<table>
    <tr>

        <td style="width:50%; padding:0;">
            <table class="no-border">

                <tr>
                    <td class="label">Pekerjaan</td>
                    <td>: {{ $permit->work_description }}</td>
                </tr>

                <tr>
                    <td class="label">Lokasi</td>
                    <td>: {{ $permit->location }}</td>
                </tr>

                <tr>
                    <td class="label">Area</td>
                    <td>: {{ $permit->area }}</td>
                </tr>

                <tr>
                    <td class="label">Plant</td>
                    <td>: {{ $permit->plant }}</td>
                </tr>

                <tr>
                    <td class="label">Nama Manajer Area</td>
                    <td>: {{ $permit->area_manager_name }}</td>
                </tr>

                <tr>
                    <td class="label">Telp Manajer Area</td>
                    <td>: {{ $permit->area_manager_phone }}</td>
                </tr>

                <tr>
                    <td class="label">Nama Pemohon</td>
                    <td>: {{ $permit->requested_by }}</td>
                </tr>

                <tr>
                    <td class="label">Telp Pemohon</td>
                    <td>: {{ $permit->requester_phone }}</td>
                </tr>

                <tr>
                    <td class="label">Pengawas</td>
                    <td>: {{ $permit->supervisor_name }}</td>
                </tr>

                <tr>
                    <td class="label">Telp Pengawas</td>
                    <td>: {{ $permit->supervisor_phone }}</td>
                </tr>

                <tr>
                    <td class="label">Petugas K3</td>
                    <td>: {{ $permit->safety_officer_name }}</td>
                </tr>

                <tr>
                    <td class="label">Telp Petugas K3</td>
                    <td>: {{ $permit->safety_officer_phone }}</td>
                </tr>

                <tr>
                    <td class="label">Perusahaan Pemohon</td>
                    <td>: {{ $permit->requester_company }}</td>
                </tr>

            </table>
        </td>


        <td style="width:50%; padding:0;">
            <table>

                <tr>
                    <th>Daftar Pekerja</th>
                    <th style="width:40px;">Jumlah</th>
                </tr>

                @forelse (($permit->workers ?? []) as $w)

                    <tr>
                        <td>{{ $w['role'] ?? '' }}</td>
                        <td class="center">{{ $w['qty'] ?? '' }}</td>
                    </tr>

                @empty

                    <tr>
                        <td colspan="2" class="italic">
                            Tidak ada data
                        </td>
                    </tr>

                @endforelse

            </table>
        </td>

    </tr>
</table>


{{-- =========================================================
     C. PERLENGKAPAN KERJA
========================================================= --}}
<div class="section-title">
    C. Perlengkapan Kerja
</div>

<table>

    <tr>
        <th>Kategori</th>
        <th>Nama</th>
        <th style="width:50px;">Jumlah</th>
    </tr>

    @forelse (($permit->equipment ?? []) as $e)

        <tr>
            <td>{{ $e['category'] ?? '' }}</td>
            <td>{{ $e['name'] ?? '' }}</td>
            <td class="center">{{ $e['qty'] ?? '' }}</td>
        </tr>

    @empty

        <tr>
            <td colspan="3" class="italic">
                Tidak ada data
            </td>
        </tr>

    @endforelse

</table>

<p class="small italic">
    * Semua perlengkapan kerja diperiksa oleh Petugas K3.
</p>


{{-- =========================================================
     D. KESELAMATAN KERJA / JSA
========================================================= --}}
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

    @forelse (($permit->jsa ?? []) as $i => $row)

        <tr>
            <td class="center">{{ $i + 1 }}</td>
            <td>{{ $row['step'] ?? '' }}</td>
            <td>{{ $row['hazard'] ?? '' }}</td>
            <td>{{ $row['control'] ?? '' }}</td>
        </tr>

    @empty

        <tr>
            <td colspan="4" class="italic">
                Tidak ada data
            </td>
        </tr>

    @endforelse

</table>

<p class="small italic">
    *Identifikasi bahaya dijadikan sebagai panduan bekerja secara aman dan selamat.
</p>


{{-- =========================================================
     E. PERALATAN KESELAMATAN
========================================================= --}}
<div class="section-title">
    E. Peralatan Keselamatan
</div>

@php
    $se = $permit->safety_equipment ?? [];
@endphp

<table>

    <tr>

        @foreach (\App\Models\Permit::SAFETY_EQUIPMENT_GROUPS as $group => $items)

            <td style="width:33.33%; padding:3px;">

                <div class="bold small center" style="margin-bottom:2px;">
                    {{ $group }}
                </div>

                @foreach ($items as $item)

                    <div class="small">
                        <span class="checkbox {{ in_array($item, $se) ? 'checked' : '' }}"></span>
                        {{ $item }}
                    </div>

                @endforeach

            </td>

        @endforeach

    </tr>

</table>


{{-- =========================================================
     F. VALIDASI IZIN KERJA
========================================================= --}}
<div class="section-title">
    F. Validasi Izin Kerja
</div>

<table>

    <tr>
        <th class="sig-block">Izin Diberikan</th>
        <th class="sig-block">Izin Lembur</th>
        <th class="sig-block">Izin Dibatalkan</th>
    </tr>


    {{-- =====================================================
         JAM IZIN
    ====================================================== --}}
    <tr>

        {{-- IZIN DIBERIKAN --}}
        <td>

            @if ($adminApproved)

                Mulai Jam : {{ $permit->start_time }}
                <br>
                Sampai Jam : {{ $permit->end_time }}

            @else

                <span class="italic small">
                    Izin belum diberikan
                </span>

            @endif

        </td>


        {{-- IZIN LEMBUR --}}
        <td>

            @if ($ot)

                Mulai Jam : {{ $ot->start_time }}
                <br>
                Sampai Jam : {{ $ot->end_time }}

            @else

                <span class="italic small">
                    Tidak ada izin lembur
                </span>

            @endif

        </td>


        {{-- IZIN DIBATALKAN --}}
        <td>

            @if ($adminRejected || $gmRejected)

                <span class="italic small">
                    Izin dibatalkan karena hasil review
                </span>

            @else

                <span class="italic small">
                    -
                </span>

            @endif

        </td>

    </tr>


    {{-- =====================================================
         DISIAPKAN
    ====================================================== --}}
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


    {{-- =====================================================
         NAMA PEMOHON
    ====================================================== --}}
    <tr>

        <td>
            Nama : {{ $permit->requested_by }}
            <br>
            Tanggal : {{ $permit->created_at->format('d M Y') }}
        </td>

        <td>
            Nama : {{ $ot?->requester?->name ?? '-' }}
            <br>
            Tanggal :
            {{ $ot?->created_at?->format('d M Y') ?? '-' }}
        </td>

        <td>
            @if ($adminRejected)
                Nama : {{ $permit->adminReviewer?->name ?? '-' }}
                <br>
                Tanggal :
                {{ $permit->admin_reviewed_at
                    ? \Carbon\Carbon::parse($permit->admin_reviewed_at)->format('d M Y')
                    : '-' }}
            @elseif ($gmRejected)
                Nama : {{ $permit->gmReviewer?->name ?? '-' }}
                <br>
                Tanggal :
                {{ $permit->gm_reviewed_at
                    ? \Carbon\Carbon::parse($permit->gm_reviewed_at)->format('d M Y')
                    : '-' }}
            @else
                Nama : -
                <br>
                Tanggal : -
            @endif
        </td>

    </tr>


    {{-- =====================================================
         DIPERIKSA
    ====================================================== --}}
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


    {{-- =====================================================
         REVIEW ADMIN
    ====================================================== --}}
    <tr>

        {{-- IZIN DIBERIKAN --}}
        <td>

            @if ($adminApproved)

                <span style="
                    display:inline-block;
                    padding:4px 10px;
                    border-radius:4px;
                    font-size:10px;
                    font-weight:bold;
                    {{ $adminStatusStyle }}
                ">
                    APPROVED
                </span>

                <br><br>

                Nama : {{ $permit->adminReviewer?->name ?? '-' }}

                <br>

                Tanggal :
                {{ $permit->admin_reviewed_at
                    ? \Carbon\Carbon::parse($permit->admin_reviewed_at)->format('d M Y')
                    : '-' }}

            @else

                <span class="italic small">
                    -
                </span>

            @endif

        </td>


        {{-- IZIN LEMBUR --}}
        <td>

            @if ($ot)

                <span style="
                    display:inline-block;
                    padding:4px 10px;
                    border-radius:4px;
                    font-size:10px;
                    font-weight:bold;
                    {{ strtoupper($ot->admin_status ?? 'PENDING') === 'APPROVED'
                        ? 'background:#dcfce7;color:#166534;border:1px solid #86efac;'
                        : (strtoupper($ot->admin_status ?? 'PENDING') === 'REJECTED'
                            ? 'background:#fee2e2;color:#991b1b;border:1px solid #fca5a5;'
                            : 'background:#fef3c7;color:#92400e;border:1px solid #fcd34d;')
                    }}
                ">
                    {{ strtoupper($ot->admin_status ?? 'PENDING') }}
                </span>

                <br><br>

                Nama : {{ $ot->adminReviewer?->name ?? '-' }}

                <br>

                Tanggal :
                {{ $ot?->admin_reviewed_at
                    ? \Carbon\Carbon::parse($ot->admin_reviewed_at)->format('d M Y')
                    : '-' }}

            @else

                <span class="italic small">
                    -
                </span>

            @endif

        </td>


        {{-- IZIN DIBATALKAN --}}
        <td>

            @if ($adminRejected)

                <span style="
                    display:inline-block;
                    padding:4px 10px;
                    border-radius:4px;
                    font-size:10px;
                    font-weight:bold;
                    {{ $adminStatusStyle }}
                ">
                    REJECTED
                </span>

                <br><br>

                Nama : {{ $permit->adminReviewer?->name ?? '-' }}

                <br>

                Tanggal :
                {{ $permit->admin_reviewed_at
                    ? \Carbon\Carbon::parse($permit->admin_reviewed_at)->format('d M Y')
                    : '-' }}

            @else

                <span class="italic small">
                    -
                </span>

            @endif

        </td>

    </tr>


    {{-- =====================================================
         MENGETAHUI GM
    ====================================================== --}}
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


    {{-- =====================================================
         REVIEW GM
    ====================================================== --}}
    <tr>

        {{-- IZIN DIBERIKAN --}}
        <td>

            @if ($gmApproved)

                <span style="
                    display:inline-block;
                    padding:4px 10px;
                    border-radius:4px;
                    font-size:10px;
                    font-weight:bold;
                    {{ $gmStatusStyle }}
                ">
                    APPROVED
                </span>

                <br><br>

                Nama : {{ $permit->gmReviewer?->name ?? '-' }}

                <br>

                Tanggal :
                {{ $permit->gm_reviewed_at
                    ? \Carbon\Carbon::parse($permit->gm_reviewed_at)->format('d M Y')
                    : '-' }}

            @elseif ($adminApproved && $gmStatus === 'PENDING')

                <span class="italic small">
                    Menunggu persetujuan GM
                </span>

            @else

                <span class="italic small">
                    -
                </span>

            @endif

        </td>


        {{-- IZIN LEMBUR --}}
        <td>

            @if ($ot)

                <span style="
                    display:inline-block;
                    padding:4px 10px;
                    border-radius:4px;
                    font-size:10px;
                    font-weight:bold;
                    {{ strtoupper($ot->gm_status ?? 'PENDING') === 'APPROVED'
                        ? 'background:#dcfce7;color:#166534;border:1px solid #86efac;'
                        : (strtoupper($ot->gm_status ?? 'PENDING') === 'REJECTED'
                            ? 'background:#fee2e2;color:#991b1b;border:1px solid #fca5a5;'
                            : 'background:#fef3c7;color:#92400e;border:1px solid #fcd34d;')
                    }}
                ">
                    {{ strtoupper($ot->gm_status ?? 'PENDING') }}
                </span>

                <br><br>

                Nama : {{ $ot->gmReviewer?->name ?? '-' }}

                <br>

                Tanggal :
                {{ $ot?->gm_reviewed_at
                    ? \Carbon\Carbon::parse($ot->gm_reviewed_at)->format('d M Y')
                    : '-' }}

            @else

                <span class="italic small">
                    -
                </span>

            @endif

        </td>


        {{-- IZIN DIBATALKAN --}}
        <td>

            @if ($gmRejected)

                <span style="
                    display:inline-block;
                    padding:4px 10px;
                    border-radius:4px;
                    font-size:10px;
                    font-weight:bold;
                    {{ $gmStatusStyle }}
                ">
                    REJECTED
                </span>

                <br><br>

                Nama : {{ $permit->gmReviewer?->name ?? '-' }}

                <br>

                Tanggal :
                {{ $permit->gm_reviewed_at
                    ? \Carbon\Carbon::parse($permit->gm_reviewed_at)->format('d M Y')
                    : '-' }}

            @else

                <span class="italic small">
                    -
                </span>

            @endif

        </td>

    </tr>


    {{-- =====================================================
         CATATAN
    ====================================================== --}}
    <tr>

        <td colspan="3" class="small italic">
            *Catatan Lain :
            {{ $permit->admin_note ?? $permit->gm_note ?? '-' }}
        </td>

    </tr>

</table>

{{-- =========================================================
     CATATAN SISTEM
========================================================= --}}
<p class="small italic" style="margin-top:6px;">
    * Dokumen ini dihasilkan otomatis oleh sistem HSE Dashboard dan sah tanpa tanda tangan basah,
    mengikuti rekam jejak approval digital (Admin &amp; GM) di atas.
</p>


</body>
</html>