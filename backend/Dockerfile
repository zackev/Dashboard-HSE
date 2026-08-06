# ============================================================
# Stage 1 - build React (frontend/) jadi static files
# ============================================================
FROM node:20-alpine AS frontend

WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build
# hasilnya ada di /app/dist (index.html + folder assets/)

# ============================================================
# Stage 2 - Laravel (backend/) + hasil build React ditempel di public/
# ============================================================
FROM php:8.3-cli AS backend

# Extension yang dibutuhkan:
# - pdo_mysql   -> koneksi database MySQL
# - zip         -> WAJIB untuk maatwebsite/excel (xlsx export)
# - gd, mbstring, bcmath -> umum dibutuhkan Laravel/dompdf
RUN apt-get update && apt-get install -y \
        git unzip libzip-dev libpng-dev libonig-dev \
    && docker-php-ext-install pdo_mysql zip gd mbstring bcmath \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY backend/ .

# Folder ini WAJIB dibuat SEBELUM composer install, karena proses
# `artisan package:discover` (dipicu otomatis oleh composer) menulis ke
# bootstrap/cache. Folder kosong tidak ikut ter-commit di Git, jadi harus
# dibuat manual di sini dulu.
RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/testing \
        storage/framework/views storage/logs bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

RUN composer install --no-dev --optimize-autoloader --no-interaction

# Salin hasil build React KE DALAM public/ Laravel.
# Ini MERGE, bukan timpa folder -> public/index.php (punya Laravel) tetap ada,
# yang nambah cuma index.html + folder assets/ dari React.
COPY --from=frontend /app/dist ./public

EXPOSE 8080

# Urutan start: migrate DB -> buat symlink storage -> cache config -> jalankan server
# php artisan serve cukup untuk skala demo/klien; kalau traffic sudah besar nanti,
# baru worth it ganti ke php-fpm + nginx/Caddy.
CMD php artisan migrate --force \
    && php artisan storage:link \
    && php artisan config:cache \
    && php artisan route:cache \
    && php artisan serve --host=0.0.0.0 --port=${PORT:-8080}
