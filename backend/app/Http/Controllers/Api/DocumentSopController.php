<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\Request;

/**
 * Endpoint khusus untuk role Employee: daftar dokumen SOP/Policy, read-only.
 * Dilindungi middleware permission:documents_sop (terpisah dari permission
 * 'documents' yang dipakai admin untuk CRUD penuh), supaya admin bisa
 * mengatur akses baca SOP tanpa memberi hak kelola dokumen penuh.
 */
class DocumentSopController extends Controller
{
    protected array $sopCategories = ['Policy', 'Procedure/SOP'];

    public function index(Request $request)
    {
        $query = Document::whereIn('category', $this->sopCategories)
            ->where('status', 'Active');

        if ($q = $request->query('q')) {
            $needle = '%'.strtolower($q).'%';
            $query->whereRaw('LOWER(title) LIKE ?', [$needle]);
        }

        $rows = $query->orderBy('issue_date', 'desc')->get();
        return response()->json(['data' => $rows, 'total' => $rows->count()]);
    }
}
