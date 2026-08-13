<?php

namespace App\Http\Controllers\Api\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CompanyController extends Controller
{
    public function show(Request $request)
    {
        $company = $request->user()->company;

        return response()->json([
            'data' => $company,
        ]);
    }

    public function update(Request $request)
    {
        $company = $request->user()->company;

        if (! $company) {
            return response()->json([
                'error' => 'Perusahaan belum terhubung dengan akun ini.',
            ], 404);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'short_name' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:255',
            'province' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:20',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|string|max:255',
            'npwp' => 'nullable|string|max:100',
            'industry' => 'nullable|string|max:255',
            'logo' => 'nullable|file|mimes:svg,jpg,jpeg,png,webp|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            if ($company->logo) {
                Storage::disk('public')->delete($company->logo);
            }

            $data['logo'] = $request->file('logo')->store(
                'companies',
                'public'
            );
        }

        $company->update($data);

        return response()->json([
            'data' => $company->fresh(),
        ]);
    }
}