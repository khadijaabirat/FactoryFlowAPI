# Image officielle Node.js légère
FROM node:20-alpine

# Répertoire de travail
WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie du reste des fichiers du projet
COPY . .

# Port d'écoute du backend
EXPOSE 5000

# Commande de démarrage avec nodemon pour le rechargement à chaud
CMD ["npm", "run", "dev"]
