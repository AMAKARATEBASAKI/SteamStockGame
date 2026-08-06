FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    libonig-dev \
    curl \
    && docker-php-ext-install pdo_mysql zip mbstring \
    && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /var/www

COPY src/composer.json src/composer.lock* ./
RUN composer install --no-interaction --prefer-dist --no-progress --no-scripts

COPY src/ ./
RUN composer dump-autoload --optimize

EXPOSE 8000
CMD ["sh", "-c", "php artisan serve --host 0.0.0.0 --port ${PORT:-8000}"]
