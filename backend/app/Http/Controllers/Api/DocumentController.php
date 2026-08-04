<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    /**
     * List dokumen. Employee hanya diberi akses lewat route /documents-sop
     * (lihat DocumentSopController) yang otomatis memfilter category.
     */
    public function index(Request $request)
    {
        $query = Document::query();

        if ($status = $request->query('status')) {
            $query->whereRaw('LOWER(status) = ?', [strtolower($status)]);
        }
        if ($q = $request->query('q')) {
            $needle = '%'.strtolower($q).'%';
            $query->where(function ($sub) use ($needle) {
                $sub->orWhereRaw('LOWER(title) LIKE ?', [$needle])
                    ->orWhereRaw('LOWER(category) LIKE ?', [$needle])
                    ->orWhereRaw('LOWER(doc_number) LIKE ?', [$needle]);
            });
        }

        $rows = $query->orderBy('issue_date', 'desc')->get();
        return response()->json(['data' => $rows, 'total' => $rows->count()]);
    }

    public function show(int $id)
    {
        $row = Document::find($id);
        if (! $row) {
            return response()->json(['error' => 'Document tidak ditemukan'], 404);
        }
        return response()->json(['data' => $row]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'category' => 'required|string',
            'doc_number' => 'required|string',
            'issue_date' => 'required|date',
            'status' => 'required|string',
            'file' => 'nullable|file|max:15360', // 15MB
        ]);

        $payload = $request->except('file');

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('documents', 'public');
            $payload['file_name'] = $file->getClientOriginalName();
            $payload['file_path'] = '/storage/'.$path;
        }

        $row = Document::create($payload);
        return response()->json(['data' => $row], 201);
    }

    public function update(Request $request, int $id)
    {
        $row = Document::find($id);
        if (! $row) {
            return response()->json(['error' => 'Document tidak ditemukan'], 404);
        }

        $payload = $request->except('file');

        if ($request->hasFile('file')) {
            $this->deleteFileIfExists($row->file_path);
            $file = $request->file('file');
            $path = $file->store('documents', 'public');
            $payload['file_name'] = $file->getClientOriginalName();
            $payload['file_path'] = '/storage/'.$path;
        }

        $row->update($payload);
        return response()->json(['data' => $row]);
    }

    public function destroy(int $id)
    {
        $row = Document::find($id);
        if (! $row) {
            return response()->json(['error' => 'Document tidak ditemukan'], 404);
        }
        $this->deleteFileIfExists($row->file_path);
        $row->delete();
        return response()->json(['data' => true]);
    }

    protected function deleteFileIfExists(?string $filePath): void
    {
        if (! $filePath) {
            return;
        }
        $relative = str_replace('/storage/', '', $filePath);
        if (Storage::disk('public')->exists($relative)) {
            Storage::disk('public')->delete($relative);
        }
    }
}
