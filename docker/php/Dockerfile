FROM php:8.3-fpm-alpine

# Installation des dependances systeme + extensions PHP + PCOV en une seule couche
# chaque RUN cree une couche Docker — moins de couches = image plus legere
RUN apk add --no-cache \
        git unzip libzip-dev libpq-dev icu-dev oniguruma-dev \
    && docker-php-ext-install \
        pdo pdo_pgsql zip intl opcache mbstring \
    && apk add --no-cache $PHPIZE_DEPS \
    && pecl install pcov apcu \
    && docker-php-ext-enable pcov apcu \
    && apk del $PHPIZE_DEPS

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer 

WORKDIR /var/www/html

# Configuration des permissions et de l'utilisateur www-data (pas root)
RUN chown -R www-data:www-data /var/www/html

EXPOSE 9000

CMD ["php-fpm"]
