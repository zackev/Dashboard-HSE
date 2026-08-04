<?php

namespace App\Http\Controllers\Api;

use App\Models\Inspection;

class InspectionController extends BaseResourceController
{
    protected string $model = Inspection::class;
    protected array $requiredFields = ['title', 'area', 'inspector', 'date'];
    protected string $sortKey = 'date';

    protected function searchableColumns(): array
    {
        return ['title', 'area', 'inspector', 'status', 'findings'];
    }
}
