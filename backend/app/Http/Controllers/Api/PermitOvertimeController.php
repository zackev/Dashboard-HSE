<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permit;
use App\Models\PermitOvertime;
use App\Models\User;
use App\Notifications\PermitStatusUpdated;
use App\Notifications\PermitSubmitted;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;

/**
 * Izin Lembur: request tambahan berbasis Permit yang SUDAH Approved.
 * Alur approval identik dengan Permit utama (Admin -> GM), makanya banyak
 * method di sini mirip PermitController - sengaja terpisah class supaya
 * tidak mencampur 2 concern (izin utama vs izin lembur) dalam 1 controller.
 */
class PermitOvertimeController extends Controller
{
    public function index(Request $request, int $permitId)
    {
        $permit = Permit::findOrFail($permitId);
        $this->authorizeView($request, $permit);

        $rows = $permit->overtimes()->with(['requester:id,name', 'adminReviewer:id,name', 'gmReviewer:id,name'])
            ->orderBy('date', 'desc')->get();

        return response()->json(['data' => $rows, 'total' => $rows->count()]);
    }

    /** Pemohon minta lembur dari permit miliknya yang sudah Approved. */
    public function store(Request $request, int $permitId)
    {
        $permit = Permit::findOrFail($permitId);
        $user = $request->user();

        if ($permit->user_id !== $user->id) {
            return response()->json(['error' => 'Anda tidak punya akses ke ijin kerja ini.'], 403);
        }
        if ($permit->status !== 'Approved') {
            return response()->json(['error' => 'Izin lembur hanya bisa diajukan dari Ijin Kerja yang sudah Approved.'], 422);
        }

        $data = $request->validate([
            'date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'reason' => 'nullable|string',
        ]);

        $overtime = $permit->overtimes()->create([
            ...$data,
            'requested_by' => $user->id,
            'status' => 'Submitted',
            'admin_status' => 'Pending',
            'gm_status' => 'Pending',
        ]);

        $admins = User::whereHas('role.permissions', fn ($q) => $q->where('key', 'permits'))
            ->where('is_active', true)->get();
        if ($admins->isNotEmpty()) {
            Notification::send($admins, new PermitSubmitted($permit));
        }

        return response()->json(['data' => $overtime], 201);
    }

    public function adminReview(Request $request, int $permitId, int $overtimeId)
    {
        $data = $request->validate([
            'action' => 'required|in:approve,reject',
            'note' => 'nullable|string',
        ]);

        $overtime = PermitOvertime::where('permit_id', $permitId)->findOrFail($overtimeId);
        if ($overtime->admin_status !== 'Pending') {
            return response()->json(['error' => 'Izin lembur ini sudah pernah direview oleh Admin.'], 422);
        }

        $approve = $data['action'] === 'approve';
        $overtime->update([
            'admin_status' => $approve ? 'Approved' : 'Rejected',
            'admin_reviewed_by' => $request->user()->id,
            'admin_reviewed_at' => now(),
            'admin_note' => $data['note'] ?? null,
            'status' => $approve ? 'GM Review' : 'Rejected',
        ]);

        if ($approve) {
            $gms = User::whereHas('role.permissions', fn ($q) => $q->where('key', 'permits_gm'))
                ->where('is_active', true)->get();
            if ($gms->isNotEmpty()) {
                Notification::send($gms, new PermitSubmitted($overtime->permit));
            }
        } else {
            $this->notifyRequester($overtime);
        }

        return response()->json(['data' => $overtime]);
    }

    public function gmReview(Request $request, int $permitId, int $overtimeId)
    {
        $data = $request->validate([
            'action' => 'required|in:approve,reject',
            'note' => 'nullable|string',
        ]);

        $overtime = PermitOvertime::where('permit_id', $permitId)->findOrFail($overtimeId);
        if ($overtime->admin_status !== 'Approved') {
            return response()->json(['error' => 'Izin lembur ini belum disetujui Admin.'], 422);
        }
        if ($overtime->gm_status !== 'Pending') {
            return response()->json(['error' => 'Izin lembur ini sudah pernah direview oleh GM.'], 422);
        }

        $approve = $data['action'] === 'approve';
        $overtime->update([
            'gm_status' => $approve ? 'Approved' : 'Rejected',
            'gm_reviewed_by' => $request->user()->id,
            'gm_reviewed_at' => now(),
            'gm_note' => $data['note'] ?? null,
            'status' => $approve ? 'Approved' : 'Rejected',
        ]);

        $this->notifyRequester($overtime);

        return response()->json(['data' => $overtime]);
    }

    protected function notifyRequester(PermitOvertime $overtime): void
    {
        if ($overtime->requester) {
            $overtime->requester->notify(new PermitStatusUpdated($overtime->permit));
        }
    }

    protected function authorizeView(Request $request, Permit $permit): void
    {
        $user = $request->user();
        $allowed = $user->hasPermission('permits') || $user->hasPermission('permits_gm') || $permit->user_id === $user->id;
        if (! $allowed) {
            abort(response()->json(['error' => 'Anda tidak punya akses ke ijin kerja ini.'], 403));
        }
    }
}
