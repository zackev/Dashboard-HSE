<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class CompanyScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        if (auth()->check()) {
            $companyId = auth()->user()->company_id;

            $builder->where(function ($query) use ($model, $companyId) {
                $query->where(
                    $model->getTable() . '.company_id',
                    $companyId
                )->orWhereNull(
                    $model->getTable() . '.company_id'
                );
            });
        }
    }
}