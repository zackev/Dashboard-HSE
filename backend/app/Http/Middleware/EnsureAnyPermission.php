<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Sama seperti EnsurePermission, tapi lolos kalau user punya SALAH SATU
 * dari beberapa permission key. Dipakai untuk route /permits yang diakses
 * bersama oleh admin (key 'permits') maupun employee (key 'permits_own').
 */
class EnsureAnyPermission
{
    public function handle(Request $request, Closure $next, string ...$permissionKeys): Response
    {
        $user = $request->user();

        if (! $user || ! $user->is_active) {
            return response()->json(['message' => 'Unauthenticated atau akun nonaktif.'], 401);
        }

        foreach ($permissionKeys as $key) {
            if ($user->hasPermission($key)) {
                return $next($request);
            }
        }

        return response()->json(['message' => 'Anda tidak punya akses ke modul ini.'], 403);
    }
}
