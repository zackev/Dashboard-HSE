<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware RBAC dinamis.
 *
 * Dipakai di routes/api.php seperti: ->middleware('permission:incidents')
 * "incidents" di sini adalah `key` di tabel permissions. Admin bisa
 * menambah role baru & mencentang permission apa saja lewat halaman
 * Settings > Roles & Akses tanpa perlu ubah kode ini.
 */
class EnsurePermission
{
    public function handle(Request $request, Closure $next, string $permissionKey): Response
    {
        $user = $request->user();

        if (! $user || ! $user->is_active) {
            return response()->json(['message' => 'Unauthenticated atau akun nonaktif.'], 401);
        }

        if (! $user->hasPermission($permissionKey)) {
            return response()->json([
                'message' => 'Anda tidak punya akses ke modul ini.',
            ], 403);
        }

        return $next($request);
    }
}
