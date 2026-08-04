<?php

namespace App\Http\Controllers\Api;

use App\Models\Capa;

class CapaController extends BaseResourceController
{
    protected string $model = Capa::class;
    protected array $requiredFields = ['title', 'type', 'pic', 'due_date'];
    protected string $sortKey = 'due_date';

    protected function searchableColumns(): array
    {
        return ['title', 'related_to', 'type', 'pic', 'status'];
    }
}
