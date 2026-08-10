<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
    @page { margin: 18px 22px; }
    body { font-family: Helvetica, Arial, sans-serif; font-size: 8.5px; color: #111; }
    table { width: 100%; border-collapse: collapse; }
    td, th { border: 1px solid #000; padding: 2px 4px; vertical-align: top; }
    .no-border td, .no-border { border: none; padding: 0; }
    .section-title {
        background: #000; color: #fff; font-weight: bold; padding: 3px 5px;
        font-size: 9px; text-transform: uppercase;
    }
    .label { font-weight: normal; white-space: nowrap; width: 110px; }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .small { font-size: 7.5px; }
    .italic { font-style: italic; }
    .checkbox { display: inline-block; width: 8px; height: 8px; border: 1px solid #000; margin-right: 3px; vertical-align: middle; }
    .checked { background: #000; }
    .header-table td { border: none; padding: 1px 4px; }
    .logo-box { border: 1px solid #000; padding: 4px; text-align: center; width: 90px; }
    .title-box { text-align: center; }
    .title-box h1 { font-size: 15px; margin: 4px 0; }
    .doc-info-table td { border: 1px solid #000; font-size: 7.5px; padding: 1px 4px; }
    .sig-block { width: 33.33%; }
    .sig-row td { height: 14px; }
</style>
</head>
<body>

{{-- Kop surat --}}
<table class="no-border" style="margin-bottom:4px;">
    <tr>
        <td style="width:90px;">
            <div class="logo-box"><span class="bold">Ahli K3 Umum</span></div>
        </td>
        <td class="title-box">
            <h1>SURAT IZIN PEKERJAAN RESIKO TINGGI</h1>
        </td>
        <td style="width:150px; padding:0;">
            <table class="doc-info-table">
                <tr><td>No Dok</td><td>: {{ $permit->doc_number ?? '-' }}</td></tr>
                <tr><td>No Rev</td><td>: {{ $permit->doc_revision ?? '-' }}</td></tr>
                <tr><td>Tgl Rilis</td><td>: {{ $permit->doc_release_date ? \Carbon\Carbon::parse($permit->doc_release_date)->format('d M Y') : '-' }}</td></tr>
                <tr><td>Hal</td><td>: {{ $permit->doc_pages ?? '-' }}</td></tr>
            </table>
        </td>
    </tr>
</table>

<table class="no-border" style="margin-bottom:2px;">
    <tr>
        <td class="bold">Nomor : {{ $permit->permit_no }}</td>
        <td class="bold" style="text-align:right;">Tanggal : {{ $permit->created_at->format('d M Y') }}</td>
    </tr>
</table>

{{-- A. Klasifikasi Pekerjaan --}}
<div class="section-title">A. Klasifikasi Pekerjaan</div>
<table>
    <tr>
        @foreach (['Kerja Panas','Kerja Listrik','Ketinggian','Alat Berat','Perpipaan','Tangki','Ruang Terbatas','Galian'] as $c)
            @php $on = in_array($c, $permit->work_classifications ?? []); @endphp
            <td class="center" style="width:12.5%;">
                <span class="checkbox {{ $on ? 'checked' : '' }}"></span>{{ $c }}
            </td>
        @endforeach
    </tr>
</table>

{{-- B. Informasi Pekerjaan --}}
<div class="section-title">B. Informasi Pekerjaan</div>
<table>
    <tr>
        <td style="width:50%; padding:0;">
            <table class="no-border">
                <tr><td class="label">Pekerjaan</td><td>: {{ $permit->work_description }}</td></tr>
                <tr><td class="label">Lokasi</td><td>: {{ $permit->location }}</td></tr>
                <tr><td class="label">Area</td><td>: {{ $permit->area }}</td></tr>
                <tr><td class="label">Plant</td><td>: {{ $permit->plant }}</td></tr>
                <tr><td class="label">Nama Manajer Area</td><td>: {{ $permit->area_manager_name }}</td></tr>
                <tr><td class="label">Telp Manajer Area</td><td>: {{ $permit->area_manager_phone }}</td></tr>
                <tr><td class="label">Nama Pemohon</td><td>: {{ $permit->requested_by }}</td></tr>
                <tr><td class="label">Telp Pemohon</td><td>: {{ $permit->requester_phone }}</td></tr>
                <tr><td class="label">Pengawas</td><td>: {{ $permit->supervisor_name }}</td></tr>
                <tr><td class="label">Telp Pengawas</td><td>: {{ $permit->supervisor_phone }}</td></tr>
                <tr><td class="label">Petugas K3</td><td>: {{ $permit->safety_officer_name }}</td></tr>
                <tr><td class="label">Telp Petugas K3</td><td>: {{ $permit->safety_officer_phone }}</td></tr>
                <tr><td class="label">Perusahaan Pemohon</td><td>: {{ $permit->requester_company }}</td></tr>
            </table>
        </td>
        <td style="width:50%; padding:0;">
            <table>
                <tr><th>Daftar Pekerja</th><th style="width:40px;">Jumlah</th></tr>
                @forelse (($permit->workers ?? []) as $w)
                    <tr><td>{{ $w['role'] ?? '' }}</td><td class="center">{{ $w['qty'] ?? '' }}</td></tr>
                @empty
                    <tr><td colspan="2" class="italic">Tidak ada data</td></tr>
                @endforelse
            </table>
        </td>
    </tr>
</table>

{{-- C. Perlengkapan Kerja --}}
<div class="section-title">C. Perlengkapan Kerja</div>
<table>
    <tr><th>Kategori</th><th>Nama</th><th style="width:50px;">Jumlah</th></tr>
    @forelse (($permit->equipment ?? []) as $e)
        <tr>
            <td>{{ $e['category'] ?? '' }}</td>
            <td>{{ $e['name'] ?? '' }}</td>
            <td class="center">{{ $e['qty'] ?? '' }}</td>
        </tr>
    @empty
        <tr><td colspan="3" class="italic">Tidak ada data</td></tr>
    @endforelse
</table>
<p class="small italic">* Semua perlengkapan kerja diperiksa oleh Petugas K3.</p>

{{-- D. Keselamatan Kerja (JSA) --}}
<div class="section-title">D. Keselamatan Kerja</div>
<table>
    <tr>
        <th style="width:25px;">No</th><th>Aktivitas</th><th>Potensi Bahaya</th><th>Langkah Aman Pekerjaan</th>
    </tr>
    @forelse (($permit->jsa ?? []) as $i => $row)
        <tr>
            <td class="center">{{ $i + 1 }}</td>
            <td>{{ $row['step'] ?? '' }}</td>
            <td>{{ $row['hazard'] ?? '' }}</td>
            <td>{{ $row['control'] ?? '' }}</td>
        </tr>
    @empty
        <tr><td colspan="4" class="italic">Tidak ada data</td></tr>
    @endforelse
</table>
<p class="small italic">*Identifikasi bahaya dijadikan sebagai panduan bekerja secara aman dan selamat.</p>

{{-- E. Peralatan Keselamatan --}}
<div class="section-title">E. Peralatan Keselamatan</div>
@php $se = $permit->safety_equipment ?? []; @endphp
<table>
    <tr>
        @foreach (\App\Models\Permit::SAFETY_EQUIPMENT_GROUPS as $group => $items)
            <td style="width:33.33%; padding:3px;">
                <div class="bold small center" style="margin-bottom:2px;">{{ $group }}</div>
                @foreach ($items as $item)
                    <div class="small"><span class="checkbox {{ in_array($item, $se) ? 'checked' : '' }}"></span>{{ $item }}</div>
                @endforeach
            </td>
        @endforeach
    </tr>
</table>

{{-- F. Validasi Izin Kerja --}}
<div class="section-title">F. Validasi Izin Kerja</div>
<table>
    <tr>
        <th class="sig-block">Izin Diberikan</th>
        <th class="sig-block">Izin Lembur</th>
        <th class="sig-block">Izin Dibatalkan</th>
    </tr>
    <tr>
        <td>
            Mulai Jam : {{ $permit->start_time }} <br>
            Sampai Jam : {{ $permit->end_time }}
        </td>
        <td>
            @php $ot = $permit->overtimes->first(); @endphp
            @if ($ot)
                Mulai Jam : {{ $ot->start_time }} <br>
                Sampai Jam : {{ $ot->end_time }}
            @else
                <span class="italic small">Tidak ada izin lembur</span>
            @endif
        </td>
        <td>
            @if ($permit->status === 'Rejected')
                Jam : {{ now()->format('H:i') }} <br>
                Keterangan : {{ $permit->rejection_reason }}
            @else
                <span class="italic small">-</span>
            @endif
        </td>
    </tr>
    <tr class="sig-row">
        <td class="bold">Disiapkan<br><span class="small" style="font-weight:normal;">Pemohon</span></td>
        <td class="bold">Disiapkan<br><span class="small" style="font-weight:normal;">Pemohon</span></td>
        <td class="bold">Disiapkan<br><span class="small" style="font-weight:normal;">Pemohon</span></td>
    </tr>
    <tr>
        <td>Nama : {{ $permit->requested_by }}<br>Tanggal : {{ $permit->created_at->format('d M Y') }}</td>
        <td>Nama : {{ $ot->requester->name ?? '-' }}<br>Tanggal : {{ $ot?->created_at?->format('d M Y') ?? '-' }}</td>
        <td>Nama : -<br>Tanggal : -</td>
    </tr>
    <tr class="sig-row">
        <td class="bold">Diperiksa<br><span class="small" style="font-weight:normal;">Pengawas K3</span></td>
        <td class="bold">Diperiksa<br><span class="small" style="font-weight:normal;">Pengawas K3</span></td>
        <td class="bold">Diperiksa<br><span class="small" style="font-weight:normal;">Pengawas K3</span></td>
    </tr>
    <tr>
        <td>Nama : {{ $permit->adminReviewer->name ?? '-' }}<br>Tanggal : {{ $permit->admin_reviewed_at ? \Carbon\Carbon::parse($permit->admin_reviewed_at)->format('d M Y') : '-' }}</td>
        <td>Nama : {{ $ot->adminReviewer->name ?? '-' }}<br>Tanggal : {{ $ot?->admin_reviewed_at ? \Carbon\Carbon::parse($ot->admin_reviewed_at)->format('d M Y') : '-' }}</td>
        <td>Nama : -<br>Tanggal : -</td>
    </tr>
    <tr class="sig-row">
        <td class="bold">Mengetahui<br><span class="small" style="font-weight:normal;">Manajer Area (GM)</span></td>
        <td class="bold">Mengetahui<br><span class="small" style="font-weight:normal;">Manajer Area (GM)</span></td>
        <td class="bold">Mengetahui<br><span class="small" style="font-weight:normal;">Manajer Area (GM)</span></td>
    </tr>
    <tr>
        <td>Nama : {{ $permit->gmReviewer->name ?? '-' }}<br>Tanggal : {{ $permit->gm_reviewed_at ? \Carbon\Carbon::parse($permit->gm_reviewed_at)->format('d M Y') : '-' }}</td>
        <td>Nama : {{ $ot->gmReviewer->name ?? '-' }}<br>Tanggal : {{ $ot?->gm_reviewed_at ? \Carbon\Carbon::parse($ot->gm_reviewed_at)->format('d M Y') : '-' }}</td>
        <td>Nama : -<br>Tanggal : -</td>
    </tr>
    <tr>
        <td colspan="3" class="small italic">
            *Catatan Lain : {{ $permit->admin_note ?? $permit->gm_note ?? '-' }}
        </td>
    </tr>
</table>

<p class="small italic" style="margin-top:6px;">
    * Dokumen ini dihasilkan otomatis oleh sistem HSE Dashboard dan sah tanpa tanda tangan basah,
    mengikuti rekam jejak approval digital (Admin &amp; GM) di atas.
</p>

</body>
</html>
