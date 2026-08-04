<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HsePerformance;
use Illuminate\Http\Request;

class HsePerformanceController extends Controller
{
    /** Selalu hitung ulang kumulatif dari SEMUA baris (bukan hanya yang match filter) baru filter untuk tampilan. */
    public function index(Request $request)
    {
        $all = HsePerformance::all();
        $computed = HsePerformance::computeAll($all)->values();

        if ($q = $request->query('q')) {
            $needle = strtolower($q);
            $computed = $computed->filter(fn ($r) => str_contains(strtolower($r['date']), $needle)
                || str_contains(strtolower($r['notes'] ?? ''), $needle))->values();
        }

        $ordered = $computed->sortByDesc('date')->values();

        return response()->json(['data' => $ordered, 'total' => $ordered->count()]);
    }

    public function show(int $id)
    {
        $row = HsePerformance::find($id);
        if (! $row) {
            return response()->json(['error' => 'Data HSE Performance tidak ditemukan'], 404);
        }
        $all = HsePerformance::all();
        $found = HsePerformance::computeAll($all)->firstWhere('id', $row->id);

        return response()->json(['data' => $found]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
        ]);
        $row = HsePerformance::create($request->all());
        $all = HsePerformance::all();
        $computed = HsePerformance::computeAll($all)->firstWhere('id', $row->id);

        return response()->json(['data' => $computed], 201);
    }

    public function update(Request $request, int $id)
    {
        $row = HsePerformance::find($id);
        if (! $row) {
            return response()->json(['error' => 'Data HSE Performance tidak ditemukan'], 404);
        }
        $row->update($request->all());
        $all = HsePerformance::all();
        $computed = HsePerformance::computeAll($all)->firstWhere('id', $row->id);

        return response()->json(['data' => $computed]);
    }

    public function destroy(int $id)
    {
        $row = HsePerformance::find($id);
        if (! $row) {
            return response()->json(['error' => 'Data HSE Performance tidak ditemukan'], 404);
        }
        $row->delete();
        return response()->json(['data' => true]);
    }
}
