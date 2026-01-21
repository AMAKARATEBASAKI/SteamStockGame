FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    libonig-dev \
    && docker-php-ext-install pdo_mysql zip mbstring

COPY --from=composer:2.6 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www
