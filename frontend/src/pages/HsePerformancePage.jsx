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
            <strong className="font-mono text-brand-yellow">Man-Hour Kumulatif</strong> = akumulasi Man-Hour dari tanggal paling awal yang tercatat sampai baris tersebut (terus bertambah setiap hari baru ditambahkan).
            {' '}<strong className="font-mono text-brand-yellow">TRIR</strong> = ((Kumulatif Near Miss + FAC + MTC + RWC + Property Damage) &divide; Kumulatif Man-Hour) &times; 200.000.
            {' '}<strong className="font-mono text-brand-yellow">LTIF</strong> = ((Kumulatif LTI + Fatality) &divide; Kumulatif Man-Hour) &times; 1.000.000.
          </p>
        </div>
      }
    />
  );
}
