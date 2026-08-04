<?php

namespace App\Http\Controllers\Api\Settings;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::with('permissions:id,key,label')->withCount('users')->orderBy('id')->get();
        return response()->json(['data' => $roles]);
    }

    public function permissionsCatalog()
    {
        // Semua "page/module" yang bisa dicentang admin di halaman Settings.
        $permissions = Permission::orderBy('sort_order')->get();
        return response()->json(['data' => $permissions]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'permission_keys' => 'array',
            'permission_keys.*' => 'string|exists:permissions,key',
        ]);

        $role = Role::create([
            'name' => $data['name'],
            'slug' => Str::slug($data['name']).'-'.Str::random(4),
            'is_default' => false,
        ]);

        $this->syncPermissions($role, $data['permission_keys'] ?? []);

        return response()->json(['data' => $role->load('permissions')], 201);
    }

    public function update(Request $request, int $id)
    {
        $role = Role::findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|required|string|max:100',
            'permission_keys' => 'array',
            'permission_keys.*' => 'string|exists:permissions,key',
        ]);

        if (isset($data['name'])) {
            $role->update(['name' => $data['name']]);
        }

        if ($request->has('permission_keys')) {
            $this->syncPermissions($role, $data['permission_keys'] ?? []);
        }

        return response()->json(['data' => $role->load('permissions')]);
    }

    public function destroy(int $id)
    {
        $role = Role::findOrFail($id);

        if ($role->is_default) {
            return response()->json(['error' => 'Role bawaan sistem (Admin/Employee) tidak bisa dihapus.'], 422);
        }
        if ($role->users()->exists()) {
            return response()->json(['error' => 'Role masih dipakai oleh karyawan. Pindahkan karyawan ke role lain terlebih dulu.'], 422);
        }

        $role->delete();
        return response()->json(['data' => true]);
    }

    protected function syncPermissions(Role $role, array $keys): void
    {
        $ids = Permission::whereIn('key', $keys)->pluck('id', 'key');
        $role->permissions()->sync($ids->values());
    }
}
