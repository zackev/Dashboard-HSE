<?php

namespace App\Http\Controllers\Api;

use App\Models\Kpi;

class KpiController extends BaseResourceController
{
    protected string $model = Kpi::class;
    protected array $requiredFields = ['kpi_name', 'category', 'period', 'target', 'status'];
    protected string $sortKey = 'period';

    protected function searchableColumns(): array
    {
        return ['kpi_name', 'category', 'period', 'status'];
    }
}
