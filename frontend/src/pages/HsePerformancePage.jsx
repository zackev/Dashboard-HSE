import CrudPage from '../components/CrudPage.jsx';
import { MODULES, VIEW_META } from '../config/modules.jsx';

export default function HsePerformancePage({ onDataChanged }) {
  const [title, subtitle] = VIEW_META.hse_performance;

  return (
    <CrudPage
      moduleKey="hse_performance"
      cfg={MODULES.hse_performance}
      title={title}
      subtitle={subtitle}
      onDataChanged={onDataChanged}
      extraTop={
        <div className="panel border-l-4 border-l-brand-yellow">
          <h3 className="mb-2 text-sm font-semibold">Metodologi Perhitungan</h3>
          <p className="mb-2 text-[12.5px] leading-relaxed text-muted">
            <strong className="font-mono text-brand-yellow">Man-Hour Hari Ini</strong> = Jumlah Tenaga Kerja Hadir &times; Jam Kerja Normal per Hari.
            {' '}Contoh: 10 Juni 2026, 100 orang hadir, jam kerja normal 8 jam &rarr; Man-Hour = 100 &times; 8 = <strong className="font-mono text-brand-yellow">800</strong>.
            {' '}Cukup input jumlah tenaga kerja &amp; jam kerja, Man-Hour langsung muncul otomatis — tidak perlu dihitung manual.
          </p>
          <p className="text-[12.5px] leading-relaxed text-muted">
            <strong className="font-mono text-brand-yellow">Man-Hour Kumulatif</strong> = akumulasi Man-Hour dari tanggal paling awal yang tercatat sampai baris tersebut (kumulatif harian, terus bertambah).
            {' '}FR, SR, TRIR, dan LTIF dihitung dari angka kumulatif ini, bukan cuma data satu hari:{' '}
            <strong className="font-mono text-brand-yellow">FR</strong> = (Kumulatif LTI &times; 1.000.000) &divide; Kumulatif Man-Hour &middot;{' '}
            <strong className="font-mono text-brand-yellow">SR</strong> = (Kumulatif Hari Hilang &times; 1.000.000) &divide; Kumulatif Man-Hour &middot;{' '}
            <strong className="font-mono text-brand-yellow">TRIR</strong> = (Kumulatif Recordable Cases &times; 200.000) &divide; Kumulatif Man-Hour &middot;{' '}
            <strong className="font-mono text-brand-yellow">LTIF</strong> = sama dengan FR.
            {' '}Recordable Cases = MTC + RWC + LTI + Fatality.
          </p>
        </div>
      }
    />
  );
}
