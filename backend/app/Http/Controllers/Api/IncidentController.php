<?php

namespace App\Http\Controllers\Api;

use App\Models\Incident;

class IncidentController extends BaseResourceController
{
    protected string $model = Incident::class;
    protected array $requiredFields = ['title', 'type', 'severity', 'location', 'date'];
    protected string $sortKey = 'date';

    protected function searchableColumns(): array
    {
        return ['title', 'type', 'severity', 'location', 'status', 'description'];
    }
}
