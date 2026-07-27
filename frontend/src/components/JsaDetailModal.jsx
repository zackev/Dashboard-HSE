export default function JsaDetailModal({ open, permit, onClose }) {
  if (!open || !permit) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-6xl max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Detail Job Safety Analysis</h2>

          <button onClick={onClose} className="text-xl font-bold">
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 w-16">No</th>

                <th className="border p-2">Langkah Kerja</th>

                <th className="border p-2">Potensi Bahaya & Risiko</th>

                <th className="border p-2">Langkah Pengendalian</th>
              </tr>
            </thead>

            <tbody>
              {permit.jsa.map((item, index) => (
                <tr key={index}>
                  <td className="border p-2 text-center">{index + 1}</td>

                  <td className="border p-2">{item.step}</td>

                  <td className="border p-2">{item.hazard}</td>

                  <td className="border p-2">{item.control}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
