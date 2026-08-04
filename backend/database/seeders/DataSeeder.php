<?php

namespace Database\Seeders;

use App\Models\Capa;
use App\Models\Document;
use App\Models\HsePerformance;
use App\Models\Incident;
use App\Models\Inspection;
use App\Models\Kpi;
use App\Models\Permit;
use App\Models\Training;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Data asli dari db/data.json project Node.js lama (dipindah 1:1, tidak ada
 * yang hilang), DITAMBAH data dummy tambahan (ditandai komentar "// Dummy
 * tambahan") supaya dashboard langsung terlihat "hidup" & grafik trennya
 * lebih jelas begitu pertama kali dibuka. Data asli tetap dominan.
 */
class DataSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedIncidents();
        $this->seedInspections();
        $this->seedTrainings();
        $this->seedCapa();
        $this->seedHsePerformance();
        $this->seedPermits();
        $this->seedKpis();
        $this->seedDocuments();
    }

    protected function seedIncidents(): void
    {
        $rows = [
            ['title' => 'Tumpahan oli di area produksi', 'type' => 'Near Miss', 'severity' => 'Low', 'location' => 'Workshop A - Line 2', 'date' => '2026-07-10', 'reported_by' => 'Andi Saputra', 'status' => 'Closed', 'description' => 'Ditemukan tumpahan oli hidrolik kecil di lantai dekat mesin press. Langsung dibersihkan dan area diberi tanda.'],
            ['title' => 'Pekerja tidak memakai safety helmet', 'type' => 'Unsafe Act', 'severity' => 'Medium', 'location' => 'Area Konstruksi Gudang B', 'date' => '2026-07-18', 'reported_by' => 'Siti Rahma', 'status' => 'In Progress', 'description' => 'Ditemukan 2 pekerja kontraktor tidak memakai helm saat bekerja di ketinggian rendah. Sudah diberi teguran lisan.'],
            ['title' => 'Kebocoran gas LPG di dapur kantin', 'type' => 'Hazard', 'severity' => 'High', 'location' => 'Kantin Karyawan', 'date' => '2026-07-22', 'reported_by' => 'Budi Hartono', 'status' => 'Open', 'description' => 'Tercium bau gas di area kompor kantin. Regulator diduga bocor, area sudah diisolasi sementara menunggu teknisi.'],
            // Dummy tambahan
            ['title' => 'Lantai licin dekat area cuci alat', 'type' => 'Hazard', 'severity' => 'Low', 'location' => 'Workshop B', 'date' => '2026-07-28', 'reported_by' => 'Dewi Anggraini', 'status' => 'Open', 'description' => 'Ceceran air dari proses cuci alat membuat lantai licin, sudah dipasang tanda peringatan sementara menunggu perbaikan drainase.'],
            ['title' => 'Kabel listrik terkelupas di panel utama', 'type' => 'Unsafe Condition', 'severity' => 'High', 'location' => 'Ruang Panel Listrik', 'date' => '2026-07-30', 'reported_by' => 'Budi Hartono', 'status' => 'In Progress', 'description' => 'Ditemukan kabel terkelupas saat inspeksi rutin, area sudah diisolasi dan teknisi listrik sudah dijadwalkan.'],
        ];
        foreach ($rows as $r) { Incident::create($r); }
    }

    protected function seedInspections(): void
    {
        $rows = [
            ['title' => 'Inspeksi APAR Bulanan', 'area' => 'Seluruh Gedung', 'inspector' => 'Rina Wijaya', 'date' => '2026-07-05', 'status' => 'Completed', 'findings' => 'Semua APAR dalam kondisi baik, 2 unit perlu isi ulang bulan depan.'],
            ['title' => 'Inspeksi Alat Pelindung Diri (APD)', 'area' => 'Workshop A', 'inspector' => 'Andi Saputra', 'date' => '2026-07-20', 'status' => 'Scheduled', 'findings' => ''],
            // Dummy tambahan
            ['title' => 'Inspeksi Kelayakan Forklift', 'area' => 'Area Gudang', 'inspector' => 'Budi Hartono', 'date' => '2026-07-27', 'status' => 'Completed', 'findings' => 'Semua unit forklift laik jalan, 1 unit perlu servis rem ringan.'],
            ['title' => 'Inspeksi Housekeeping 5R Mingguan', 'area' => 'Seluruh Area Produksi', 'inspector' => 'Dewi Anggraini', 'date' => '2026-08-02', 'status' => 'Scheduled', 'findings' => ''],
        ];
        foreach ($rows as $r) { Inspection::create($r); }
    }

    protected function seedTrainings(): void
    {
        $rows = [
            ['title' => 'Pelatihan Penggunaan APAR & Evakuasi Kebakaran', 'trainer' => 'Dinas Pemadam Kebakaran Kota', 'date' => '2026-06-15', 'participants' => 24, 'status' => 'Completed', 'notes' => 'Termasuk simulasi evakuasi gedung utama.'],
            ['title' => 'Induksi K3 Karyawan Baru', 'trainer' => 'Tim HSE Internal', 'date' => '2026-08-01', 'participants' => 12, 'status' => 'Scheduled', 'notes' => 'Untuk batch karyawan baru bulan Agustus.'],
            // Dummy tambahan
            ['title' => 'Pelatihan Confined Space Entry', 'trainer' => 'Konsultan K3 Eksternal', 'date' => '2026-08-10', 'participants' => 15, 'status' => 'Scheduled', 'notes' => 'Wajib untuk tim maintenance tangki.'],
        ];
        foreach ($rows as $r) { Training::create($r); }
    }

    protected function seedCapa(): void
    {
        $rows = [
            ['title' => 'Perbaikan regulator gas kantin', 'related_to' => 'Kebocoran gas LPG di dapur kantin', 'type' => 'Corrective', 'pic' => 'Budi Hartono', 'due_date' => '2026-07-25', 'status' => 'In Progress'],
            ['title' => 'Sosialisasi ulang wajib helm di area konstruksi', 'related_to' => 'Pekerja tidak memakai safety helmet', 'type' => 'Preventive', 'pic' => 'Siti Rahma', 'due_date' => '2026-07-28', 'status' => 'Open'],
            // Dummy tambahan
            ['title' => 'Pasang anti-slip mat area cuci alat', 'related_to' => 'Lantai licin dekat area cuci alat', 'type' => 'Corrective', 'pic' => 'Dewi Anggraini', 'due_date' => '2026-08-05', 'status' => 'Open'],
            ['title' => 'Penggantian kabel panel listrik utama', 'related_to' => 'Kabel listrik terkelupas di panel utama', 'type' => 'Corrective', 'pic' => 'Budi Hartono', 'due_date' => '2026-08-03', 'status' => 'In Progress'],
        ];
        foreach ($rows as $r) { Capa::create($r); }
    }

    protected function seedHsePerformance(): void
    {
        $rows = [
            ['date' => '2026-06-10', 'male_workers' => 62, 'female_workers' => 38, 'working_hours' => 8, 'near_miss' => 1, 'first_aid_case' => 1, 'medical_treatment_case' => 0, 'restricted_work_case' => 0, 'property_damage' => 0, 'lost_time_incident' => 0, 'lost_days' => 0, 'fatality' => 0, 'notes' => 'Contoh dari instruksi: 100 orang hadir x 8 jam = 800 man-hour.'],
            ['date' => '2026-06-11', 'male_workers' => 65, 'female_workers' => 37, 'working_hours' => 8, 'near_miss' => 0, 'first_aid_case' => 0, 'medical_treatment_case' => 1, 'restricted_work_case' => 0, 'property_damage' => 0, 'lost_time_incident' => 0, 'lost_days' => 0, 'fatality' => 0, 'notes' => '1 kasus medical treatment di area workshop.'],
            ['date' => '2026-06-15', 'male_workers' => 70, 'female_workers' => 40, 'working_hours' => 8, 'near_miss' => 2, 'first_aid_case' => 1, 'medical_treatment_case' => 0, 'restricted_work_case' => 0, 'property_damage' => 0, 'lost_time_incident' => 1, 'lost_days' => 5, 'fatality' => 0, 'notes' => '1 Lost Time Incident, pekerja istirahat 5 hari.'],
            ['date' => '2026-06-20', 'male_workers' => 68, 'female_workers' => 39, 'working_hours' => 8, 'near_miss' => 1, 'first_aid_case' => 0, 'medical_treatment_case' => 0, 'restricted_work_case' => 0, 'property_damage' => 1, 'lost_time_incident' => 0, 'lost_days' => 0, 'fatality' => 0, 'notes' => 'Kerusakan ringan pada pagar pembatas akibat forklift.'],
            ['date' => '2026-07-05', 'male_workers' => 72, 'female_workers' => 41, 'working_hours' => 8, 'near_miss' => 3, 'first_aid_case' => 2, 'medical_treatment_case' => 0, 'restricted_work_case' => 0, 'property_damage' => 0, 'lost_time_incident' => 0, 'lost_days' => 0, 'fatality' => 0, 'notes' => 'Tren membaik, tidak ada LTI baru.'],
            ['date' => '2026-07-15', 'male_workers' => 75, 'female_workers' => 42, 'working_hours' => 8, 'near_miss' => 1, 'first_aid_case' => 1, 'medical_treatment_case' => 0, 'restricted_work_case' => 1, 'property_damage' => 0, 'lost_time_incident' => 0, 'lost_days' => 0, 'fatality' => 0, 'notes' => '1 restricted work case, pekerja dipindah ke tugas ringan.'],
            ['date' => '2026-07-24', 'male_workers' => 78, 'female_workers' => 44, 'working_hours' => 8, 'near_miss' => 2, 'first_aid_case' => 1, 'medical_treatment_case' => 0, 'restricted_work_case' => 0, 'property_damage' => 0, 'lost_time_incident' => 0, 'lost_days' => 0, 'fatality' => 0, 'notes' => 'Data terbaru, jumlah tenaga kerja terus bertambah.'],
            // Dummy tambahan - melanjutkan tren sampai akhir Juli agar grafik lebih hidup
            ['date' => '2026-07-27', 'male_workers' => 79, 'female_workers' => 44, 'working_hours' => 8, 'near_miss' => 1, 'first_aid_case' => 0, 'medical_treatment_case' => 0, 'restricted_work_case' => 0, 'property_damage' => 0, 'lost_time_incident' => 0, 'lost_days' => 0, 'fatality' => 0, 'notes' => 'Hari tenang, tidak ada insiden berarti.'],
            ['date' => '2026-07-29', 'male_workers' => 80, 'female_workers' => 45, 'working_hours' => 8, 'near_miss' => 2, 'first_aid_case' => 1, 'medical_treatment_case' => 0, 'restricted_work_case' => 0, 'property_damage' => 0, 'lost_time_incident' => 0, 'lost_days' => 0, 'fatality' => 0, 'notes' => 'Near miss terkait lantai licin di Workshop B.'],
            ['date' => '2026-07-31', 'male_workers' => 80, 'female_workers' => 46, 'working_hours' => 8, 'near_miss' => 0, 'first_aid_case' => 0, 'medical_treatment_case' => 0, 'restricted_work_case' => 0, 'property_damage' => 0, 'lost_time_incident' => 0, 'lost_days' => 0, 'fatality' => 0, 'notes' => 'Penutupan bulan Juli, kondisi aman.'],
        ];
        foreach ($rows as $r) { HsePerformance::create($r); }
    }

    /** user_id diisi belakangan lewat linkPermitsToEmployees() setelah user dibuat. */
    protected function seedPermits(): void
    {
        $rows = [
            ['permit_no' => 'IK-2026-0142', 'type' => 'Hot Work', 'location' => 'Workshop A - Line 2', 'work_description' => 'Pengelasan pipa hidrolik yang bocor.', 'requested_by' => 'Andi Saputra', 'approved_by' => 'Rina Wijaya', 'valid_from' => '2026-07-24', 'valid_to' => '2026-07-25', 'status' => 'Active', 'jsa' => [['step' => 'Matikan & isolasi sumber tekanan hidrolik sebelum pengelasan', 'hazard' => 'Tekanan sisa dalam pipa bisa menyembur/meledak saat dilas', 'control' => 'Lakukan lock-out tag-out (LOTO), pastikan tekanan nol sebelum mulai'], ['step' => 'Siapkan APD las (welding mask, sarung tangan, apron)', 'hazard' => 'Percikan api dan radiasi las dapat melukai mata/kulit', 'control' => 'Wajib pakai APD lengkap sesuai SOP hot work'], ['step' => 'Sediakan APAR di area kerja sebelum pengelasan dimulai', 'hazard' => 'Percikan api dapat memicu kebakaran material di sekitar', 'control' => 'APAR jenis CO2/dry chemical standby, fire watch selama proses']]],
            ['permit_no' => 'IK-2026-0143', 'type' => 'Confined Space', 'location' => 'Tangki Penyimpanan B-3', 'work_description' => 'Inspeksi internal tangki sebelum maintenance tahunan.', 'requested_by' => 'Budi Hartono', 'approved_by' => '', 'valid_from' => '2026-07-28', 'valid_to' => '2026-07-29', 'status' => 'Submitted', 'jsa' => [['step' => 'Uji kadar oksigen & gas berbahaya sebelum masuk tangki', 'hazard' => 'Kekurangan oksigen atau gas beracun di ruang tertutup', 'control' => 'Gas test wajib sebelum masuk, pakai gas detector portable'], ['step' => 'Masuk & keluar tangki lewat manhole dengan pengawasan', 'hazard' => 'Pekerja terjebak / sulit dievakuasi darurat', 'control' => 'Ada standby man di luar, komunikasi radio terus-menerus']]],
            ['permit_no' => 'IK-2026-0138', 'type' => 'Working at Height', 'location' => 'Atap Gudang B', 'work_description' => 'Perbaikan atap yang bocor.', 'requested_by' => 'Siti Rahma', 'approved_by' => 'Rina Wijaya', 'valid_from' => '2026-07-15', 'valid_to' => '2026-07-16', 'status' => 'Closed', 'jsa' => [['step' => 'Pasang safety net & full body harness sebelum naik atap', 'hazard' => 'Jatuh dari ketinggian saat bekerja di atap', 'control' => 'Wajib pakai full body harness dengan 2 lanyard, anchor point diperiksa dulu'], ['step' => 'Cek kondisi cuaca sebelum & selama pekerjaan', 'hazard' => 'Atap licin saat hujan/angin kencang meningkatkan risiko jatuh', 'control' => 'Pekerjaan dihentikan kalau hujan atau angin di atas ambang aman']]],
            // Dummy tambahan
            ['permit_no' => 'IK-2026-0150', 'type' => 'Electrical Work', 'location' => 'Ruang Panel Listrik', 'work_description' => 'Penggantian kabel panel listrik utama yang terkelupas.', 'requested_by' => 'Budi Hartono', 'approved_by' => '', 'valid_from' => '2026-08-04', 'valid_to' => '2026-08-05', 'status' => 'Submitted', 'jsa' => [
                ['step' => 'Matikan aliran listrik utama & pasang LOTO', 'hazard' => 'Tersengat listrik saat perbaikan', 'control' => 'Lock-out tag-out wajib, gunakan multimeter cek tegangan nol'],
                ['step' => 'Gunakan APD elektrik (sarung tangan isolasi, sepatu safety)', 'hazard' => 'Kontak langsung dengan komponen bertegangan', 'control' => 'APD elektrik standar wajib dipakai selama pekerjaan'],
            ]],
        ];
        foreach ($rows as $r) { Permit::create($r); }

        // Hubungkan permit ke akun employee berdasarkan nama pengaju
        // (akun sudah dibuat lebih dulu oleh UserSeeder).
        $byName = User::whereNotNull('role_id')->get()->keyBy('name');
        foreach (Permit::all() as $permit) {
            $user = $byName->get($permit->requested_by);
            if ($user) {
                $permit->update(['user_id' => $user->id]);
            }
        }
    }

    protected function seedKpis(): void
    {
        $rows = [
            ['kpi_name' => 'Zero Fatality', 'category' => 'Lagging', 'period' => '2026', 'target' => 0, 'actual' => 0, 'unit' => 'kasus', 'status' => 'On Track'],
            ['kpi_name' => 'TRIR di bawah 1.0', 'category' => 'Lagging', 'period' => '2026', 'target' => 1, 'actual' => 0.66, 'unit' => 'rate', 'status' => 'On Track'],
            ['kpi_name' => 'Partisipasi Safety Talk Mingguan', 'category' => 'Leading', 'period' => 'Juli 2026', 'target' => 95, 'actual' => 88, 'unit' => '%', 'status' => 'At Risk'],
            ['kpi_name' => 'Penyelesaian CAPA Tepat Waktu', 'category' => 'Leading', 'period' => 'Q2 2026', 'target' => 90, 'actual' => 92, 'unit' => '%', 'status' => 'Achieved'],
        ];
        foreach ($rows as $r) { Kpi::create($r); }
    }

    protected function seedDocuments(): void
    {
        $rows = [
            ['title' => 'Kebijakan K3 Perusahaan', 'category' => 'Policy', 'doc_number' => 'POL-HSE-001', 'revision' => 'Rev. 3', 'issue_date' => '2026-01-10', 'expiry_date' => '2028-01-10', 'status' => 'Active', 'uploaded_by' => 'Tim HSE Internal', 'file_name' => null, 'file_path' => null],
            ['title' => 'SOP Penggunaan APAR', 'category' => 'Procedure/SOP', 'doc_number' => 'SOP-HSE-014', 'revision' => 'Rev. 1', 'issue_date' => '2026-03-01', 'expiry_date' => '2027-03-01', 'status' => 'Active', 'uploaded_by' => 'Rina Wijaya', 'file_name' => null, 'file_path' => null],
            ['title' => 'Sertifikat Ahli K3 Umum - Andi Saputra', 'category' => 'Certificate', 'doc_number' => 'CERT-AK3U-2023-118', 'revision' => '-', 'issue_date' => '2023-08-12', 'expiry_date' => '2026-08-12', 'status' => 'Active', 'uploaded_by' => 'Andi Saputra', 'file_name' => null, 'file_path' => null],
            // Dummy tambahan
            ['title' => 'SOP Bekerja di Ruang Terbatas (Confined Space)', 'category' => 'Procedure/SOP', 'doc_number' => 'SOP-HSE-021', 'revision' => 'Rev. 1', 'issue_date' => '2026-05-15', 'expiry_date' => '2027-05-15', 'status' => 'Active', 'uploaded_by' => 'Tim HSE Internal', 'file_name' => null, 'file_path' => null],
            ['title' => 'Prosedur Tanggap Darurat Kebakaran', 'category' => 'Procedure/SOP', 'doc_number' => 'SOP-HSE-005', 'revision' => 'Rev. 2', 'issue_date' => '2026-02-01', 'expiry_date' => '2028-02-01', 'status' => 'Active', 'uploaded_by' => 'Tim HSE Internal', 'file_name' => null, 'file_path' => null],
        ];
        foreach ($rows as $r) { Document::create($r); }
    }
}

