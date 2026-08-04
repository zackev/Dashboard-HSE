<?php

namespace App\Http\Controllers\Api;

use App\Models\Training;

class TrainingController extends BaseResourceController
{
    protected string $model = Training::class;
    protected array $requiredFields = ['title', 'trainer', 'date'];
    protected string $sortKey = 'date';

    protected function searchableColumns(): array
    {
        return ['title', 'trainer', 'status', 'notes'];
    }
}
