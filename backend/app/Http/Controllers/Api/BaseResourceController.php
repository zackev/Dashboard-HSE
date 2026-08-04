<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * Controller CRUD generik — mirip routes/crudFactory.js di versi Node.js
 * sebelumnya. Subclass cukup set $model, $requiredFields, $sortKey.
 */
abstract class BaseResourceController extends Controller
{
    protected string $model;

    protected array $requiredFields = [];

    protected string $sortKey = 'date';

    protected string $sortDirection = 'desc';

    public function index(Request $request)
    {
        $query = $this->model::query();

        if ($status = $request->query('status')) {
            $query->whereRaw('LOWER(status) = ?', [strtolower($status)]);
        }

        if ($q = $request->query('q')) {
            $needle = '%'.strtolower($q).'%';
            $query->where(function ($sub) use ($needle) {
                foreach ($this->searchableColumns() as $col) {
                    $sub->orWhereRaw('LOWER('.$col.') LIKE ?', [$needle]);
                }
            });
        }

        $rows = $query->orderBy($this->sortKey, $this->sortDirection)->get();

        return response()->json(['data' => $this->transformCollection($rows), 'total' => $rows->count()]);
    }

    public function show(int $id)
    {
        $row = $this->model::find($id);
        if (! $row) {
            return response()->json(['error' => 'Data tidak ditemukan'], 404);
        }
        return response()->json(['data' => $this->transform($row)]);
    }

    public function store(Request $request)
    {
        $this->validateRequired($request);
        $row = $this->model::create($request->all());
        return response()->json(['data' => $this->transform($row)], 201);
    }

    public function update(Request $request, int $id)
    {
        $row = $this->model::find($id);
        if (! $row) {
            return response()->json(['error' => 'Data tidak ditemukan'], 404);
        }
        $row->update($request->all());
        return response()->json(['data' => $this->transform($row)]);
    }

    public function destroy(int $id)
    {
        $row = $this->model::find($id);
        if (! $row) {
            return response()->json(['error' => 'Data tidak ditemukan'], 404);
        }
        $row->delete();
        return response()->json(['data' => true]);
    }

    protected function validateRequired(Request $request): void
    {
        $missing = [];
        foreach ($this->requiredFields as $field) {
            if ($request->input($field) === null || $request->input($field) === '') {
                $missing[] = $field;
            }
        }
        if ($missing) {
            abort(response()->json(['error' => 'Field wajib diisi: '.implode(', ', $missing)], 400));
        }
    }

    /** Kolom teks yang dipakai untuk pencarian bebas (?q=). */
    protected function searchableColumns(): array
    {
        return ['title'];
    }

    protected function transform($row)
    {
        return $row;
    }

    protected function transformCollection($rows)
    {
        return $rows;
    }
}
