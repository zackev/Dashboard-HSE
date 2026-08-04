<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permit;
use App\Models\User;
use App\Notifications\PermitStatusUpdated;
use App\Notifications\PermitSubmitted;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;

class PermitController extends Controller
{
    /**
     * Admin (permission 'permits'): lihat semua ijin kerja.
     * Employee (permission 'permits_own'): otomatis hanya lihat miliknya
     * sendiri — dicek lewat $request->user()->hasPermission('permits').
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Permit::with('user:id,name');

        if (! $user->hasPermission('permits')) {
            // Bukan admin/role dengan akses penuh -> paksa scope ke diri sendiri
            $query->where('user_id', $user->id);
        }

        if ($status = $request->query('status')) {
            $query->whereRaw('LOWER(status) = ?', [strtolower($status)]);
        }

        if ($q = $request->query('q')) {
            $needle = '%'.strtolower($q).'%';
            $query->where(function ($sub) use ($needle) {
                $sub->orWhereRaw('LOWER(permit_no) LIKE ?', [$needle])
                    ->orWhereRaw('LOWER(location) LIKE ?', [$needle])
                    ->orWhereRaw('LOWER(type) LIKE ?', [$needle]);
            });
        }

        $rows = $query->orderBy('valid_from', 'desc')->get();

        return response()->json([
            'data' => $rows,
            'total' => $rows->count(),
        ]);
    }
    
    public function show(Request $request, int $id)
    {
        $row = Permit::with('user:id,name')->find($id);
        if (! $row) {
            return response()->json(['error' => 'Ijin Kerja tidak ditemukan'], 404);
        }
        $this->authorizeOwnerOrAdmin($request, $row);
        return response()->json(['data' => $row]);
    }

    /**
     * Dipakai baik oleh Admin (bisa isi status manapun) maupun Employee
     * (status dipaksa "Submitted", user_id diambil dari akun login).
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $isAdmin = $user->hasPermission('permits');

        $required = ['permit_no', 'type', 'location', 'valid_from', 'valid_to'];
        $missing = array_filter($required, fn ($f) => ! $request->filled($f));
        if ($missing) {
            return response()->json(['error' => 'Field wajib diisi: '.implode(', ', $missing)], 400);
        }

        if (! Permit::hasValidJsa($request->input('jsa'))) {
            return response()->json(['error' => 'JSA wajib diisi minimal 1 baris (Langkah Kerja) sebelum ijin kerja bisa diajukan.'], 400);
        }

        $payload = $request->only([
            'permit_no', 'type', 'location', 'work_description', 'valid_from', 'valid_to', 'jsa',
        ]);

        if ($isAdmin) {
            $payload['status'] = $request->input('status', 'Submitted');
            $payload['requested_by'] = $request->input('requested_by', $user->name);
            $payload['user_id'] = $request->input('user_id', $user->id);
        } else {
            $payload['status'] = 'Submitted';
            $payload['requested_by'] = $user->name;
            $payload['user_id'] = $user->id;
        }

        $permit = Permit::create($payload);

        // Beritahu semua user yang punya akses approval ('permits') lewat
        // web bell + email + WhatsApp (channel WA otomatis no-op kalau belum
        // dikonfigurasi di .env — lihat README).
        $admins = User::whereHas('role.permissions', fn ($q) => $q->where('key', 'permits'))
            ->where('is_active', true)
            ->get();
        if ($admins->isNotEmpty()) {
            Notification::send($admins, new PermitSubmitted($permit));
        }

        return response()->json(['data' => $permit], 201);
    }

    public function update(Request $request, int $id)
    {
        $row = Permit::find($id);
        if (! $row) {
            return response()->json(['error' => 'Ijin Kerja tidak ditemukan'], 404);
        }
        $this->authorizeOwnerOrAdmin($request, $row);

        if ($request->has('jsa') && ! Permit::hasValidJsa($request->input('jsa'))) {
            return response()->json(['error' => 'JSA wajib diisi minimal 1 baris (Langkah Kerja).'], 400);
        }

        $user = $request->user();
        $fields = ['permit_no', 'type', 'location', 'work_description', 'valid_from', 'valid_to', 'jsa'];
        if ($user->hasPermission('permits')) {
            $fields = array_merge($fields, ['status', 'requested_by']);
        }

        $row->update($request->only($fields));
        return response()->json(['data' => $row]);
    }

    /** Endpoint khusus admin: setujui ijin kerja. */
    public function approve(Request $request, int $id)
    {
        $row = Permit::findOrFail($id);
        $row->update([
            'status' => $request->input('status', 'Approved'),
            'approved_by' => $request->user()->name,
            'approved_by_id' => $request->user()->id,
            'approved_at' => now(),
            'rejection_reason' => null,
        ]);
        $this->notifyOwner($row);
        return response()->json(['data' => $row]);
    }

    /** Endpoint khusus admin: tolak ijin kerja (dengan alasan). */
    public function reject(Request $request, int $id)
    {
        $request->validate(['reason' => 'nullable|string']);
        $row = Permit::findOrFail($id);
        $row->update([
            'status' => 'Rejected',
            'approved_by' => $request->user()->name,
            'approved_by_id' => $request->user()->id,
            'approved_at' => now(),
            'rejection_reason' => $request->input('reason'),
        ]);
        $this->notifyOwner($row);
        return response()->json(['data' => $row]);
    }

    public function destroy(Request $request, int $id)
    {
        $row = Permit::find($id);
        if (! $row) {
            return response()->json(['error' => 'Ijin Kerja tidak ditemukan'], 404);
        }
        $this->authorizeOwnerOrAdmin($request, $row);
        $row->delete();
        return response()->json(['data' => true]);
    }

    protected function notifyOwner(Permit $permit): void
    {
        if ($permit->user) {
            $permit->user->notify(new PermitStatusUpdated($permit));
        }
    }

    protected function authorizeOwnerOrAdmin(Request $request, Permit $permit): void
    {
        $user = $request->user();
        if (! $user->hasPermission('permits') && $permit->user_id !== $user->id) {
            abort(response()->json(['error' => 'Anda tidak punya akses ke ijin kerja ini.'], 403));
        }
    }
}
