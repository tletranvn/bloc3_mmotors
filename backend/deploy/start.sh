#!/bin/sh
set -e

# Remplacer $PORT dans la config nginx (Heroku injecte le port dynamiquement)
sed -i "s/\$PORT/$PORT/g" /etc/nginx/http.d/default.conf

# Lancer les migrations Doctrine
php bin/console doctrine:migrations:migrate --no-interaction --env=prod

# Démarrer PHP-FPM en arrière-plan
php-fpm -D

# Démarrer nginx au premier plan (process principal du container)
exec nginx -g "daemon off;"
