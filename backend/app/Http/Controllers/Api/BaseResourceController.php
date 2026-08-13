<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

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
            $query->whereRaw(
                'LOWER(status) = ?',
                [strtolower($status)]
            );
        }

        if ($q = $request->query('q')) {
            $needle = '%' . strtolower($q) . '%';

            $query->where(function ($sub) use ($needle) {
                foreach ($this->searchableColumns() as $col) {
                    $sub->orWhereRaw(
                        'LOWER(' . $col . ') LIKE ?',
                        [$needle]
                    );
                }
            });
        }

        $rows = $query
            ->orderBy($this->sortKey, $this->sortDirection)
            ->get();

        return response()->json([
            'data' => $this->transformCollection($rows),
            'total' => $rows->count(),
        ]);
    }

    public function show(Request $request, int $id)
    {
        $row = $this->model::find($id);

        if (! $row) {
            return response()->json([
                'error' => 'Data tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'data' => $this->transform($row)
        ]);
    }

    public function store(Request $request)
    {
        $this->validateRequired($request);

        $data = $request->all();

        // company_id otomatis berasal dari user yang sedang login.
        // Client/frontend tidak boleh menentukan company_id sendiri.
        if (auth()->check()) {
            $data['company_id'] = auth()->user()->company_id;
        }

        $row = $this->model::create($data);

        return response()->json([
            'data' => $this->transform($row)
        ], 201);
    }

    public function update(Request $request, int $id)
    {
        $row = $this->model::find($id);

        if (! $row) {
            return response()->json([
                'error' => 'Data tidak ditemukan'
            ], 404);
        }

        $data = $request->all();

        // Jangan izinkan frontend memindahkan data
        // ke company lain.
        unset($data['company_id']);

        $row->update($data);

        return response()->json([
            'data' => $this->transform($row)
        ]);
    }

    public function destroy(Request $request, int $id)
    {
        $row = $this->model::find($id);

        if (! $row) {
            return response()->json([
                'error' => 'Data tidak ditemukan'
            ], 404);
        }

        $row->delete();

        return response()->json([
            'data' => true
        ]);
    }

    protected function validateRequired(Request $request): void
    {
        $missing = [];

        foreach ($this->requiredFields as $field) {
            if (
                $request->input($field) === null ||
                $request->input($field) === ''
            ) {
                $missing[] = $field;
            }
        }

        if ($missing) {
            abort(response()->json([
                'error' => 'Field wajib diisi: ' . implode(', ', $missing)
            ], 400));
        }
    }

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