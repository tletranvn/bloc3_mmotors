FROM php:8.3-fpm-alpine

# Dépendances système + extensions PHP
RUN apk add --no-cache \
        git unzip libzip-dev libpq-dev icu-dev oniguruma-dev nginx \
    && docker-php-ext-install \
        pdo pdo_pgsql zip intl opcache mbstring \
    && apk add --no-cache $PHPIZE_DEPS \
    && pecl install apcu \
    && docker-php-ext-enable apcu \
    && apk del $PHPIZE_DEPS

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copier et installer les dépendances PHP (sans les packages de dev)
COPY composer.json composer.lock symfony.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-interaction

# Copier le reste du code
COPY . .

# Warmup du cache Symfony en prod
RUN APP_ENV=prod php bin/console cache:warmup --env=prod

# Permissions
RUN chown -R www-data:www-data /app/var /app/public

# Config nginx prod (écoute sur $PORT injecté par Heroku)
COPY deploy/heroku.conf /etc/nginx/http.d/default.conf

# Script de démarrage : migrations + PHP-FPM + nginx
COPY deploy/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 80

CMD ["/start.sh"]
