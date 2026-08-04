<?php

namespace App\Http\Controllers\Api\Settings;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('role:id,name,slug')->orderBy('name')->get()
            ->makeHidden(['password', 'remember_token']);

        return response()->json(['data' => $users]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:150',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:30',
            'password' => 'required|string|min:6',
            'role_id' => 'required|exists:roles,id',
        ]);

        $user = User::create([
            ...$data,
            'password' => Hash::make($data['password']),
            'is_active' => true,
        ]);

        return response()->json(['data' => $user->load('role')], 201);
    }

    public function update(Request $request, int $id)
    {
        $user = User::findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|required|string|max:150',
            'email' => 'sometimes|required|email|unique:users,email,'.$id,
            'phone' => 'nullable|string|max:30',
            'password' => 'nullable|string|min:6',
            'role_id' => 'sometimes|required|exists:roles,id',
            'is_active' => 'sometimes|boolean',
        ]);

        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return response()->json(['data' => $user->load('role')]);
    }

    public function destroy(Request $request, int $id)
    {
        if ($request->user()->id === $id) {
            return response()->json(['error' => 'Anda tidak bisa menghapus akun sendiri.'], 422);
        }

        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['data' => true]);
    }
}
