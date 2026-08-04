<?php

use App\Http\Middleware\EnsureAnyPermission;
use App\Http\Middleware\EnsurePermission;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Lets Sanctum authenticate SPA requests (React) via cookie session
        // instead of requiring a bearer token, as long as the frontend
        // origin is listed in config/sanctum.php (SANCTUM_STATEFUL_DOMAINS).
        $middleware->statefulApi();

        $middleware->alias([
            'permission' => EnsurePermission::class,
            'permission.any' => EnsureAnyPermission::class,
        ]);

        $middleware->validateCsrfTokens(except: []);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
