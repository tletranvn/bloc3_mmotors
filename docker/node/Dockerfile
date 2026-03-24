FROM node:22-alpine

# Installation des outils necessaires (su-exec pour changer d'utilisateur)
RUN apk add --no-cache git su-exec

WORKDIR /var/www/html/frontend

EXPOSE 5173

# En developpement, lancer le serveur Vite
CMD ["sh", "-c", "npm install && npm run dev"]
