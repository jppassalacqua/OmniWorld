# OmniWorld Architect 🌍✨

**OmniWorld Architect** est une suite complète de *worldbuilding* (création de mondes) assistée par l'intelligence artificielle, conçue pour les Maîtres de Jeu (MJ), les auteurs et les développeurs de jeux de role. 

Cette application React permet de structurer, visualiser et générer du contenu narratif complexe (Lore, Chronologies, Cartes, Personnages) et de l'exporter vers des outils tiers au format JSON

![OmniWorld Banner](https://via.placeholder.com/1200x300?text=OmniWorld+Architect)

## 🚀 Fonctionnalités Clés

### 📚 Wiki & Lore (Nouveau)
*   **Architecture Hiérarchique** : Créez des pages et des sous-pages à l'infini pour structurer votre bible.
*   **Éditeur Riche** : Formatage de texte, citations, titres.
*   **Commandes "Slash" (/)** : Accès rapide aux outils d'édition.
*   **Auto-linking** : Détection et création automatique de liens vers vos entités existantes.
*   **Génération par IA** : Générez des sections entières de Lore (Histoire, Magie, Technologie) basées sur le contexte de votre monde.

### ⏳ Gestion Temporelle (Timeline)
*   **Systèmes de Calendrier** : Créez des calendriers personnalisés (mois, jours, cycles lunaires).
*   **Vues Multiples** :
    *   *Chronicle* : Vue liste narrative.
    *   *Gantt* : Visualisation des durées et chevauchements d'événements.
    *   *Calendar* : Vue mensuelle classique.
*   **Événements** : Liez des événements historiques à des entités spécifiques.

### 🗺️ Cartographie Interactive
*   **Pinning** : Placez des épingles sur vos cartes pour lier des lieux à des fiches d'entités.
*   **Génération de Cartes** : Utilisez l'IA pour générer des visuels de cartes (continents, villes, donjons).
*   **Hiérarchie** : Gérez des cartes du monde et des cartes locales.

### 👤 Gestion des Entités
*   **Base de données** : Personnages (PNJ), Lieux, Objets, Factions.
*   **Détails** : Attributs, relations, description et images.
*   **Génération d'Art** : Générez des portraits ou des illustrations pour vos entités via l'IA.
*   **Drag & Drop** : Importez vos propres images facilement.

### 🎲 Scénarios & Sessions
*   **Générateur de Scénarios** : Créez des trames narratives (Hook, Synopsis, Scènes) basées sur vos entités.
*   **Assistant MJ (AI GM)** : Jouez ou simulez des sessions de jeu via un chat interactif avec une IA qui incarne le Maître de Jeu, respectant le contexte de votre monde.

### 📤 Ponts d'Exportation
*   **Unity** : Exportez vos données en format JSON structuré prêt pour l'intégration dans des moteurs de jeu.
*   **Foundry VTT** : Exportez vos PNJ et objets au format compatible pour l'importation directe dans la table virtuelle.

---

## 🛠️ Technologies Utilisées

*   **Frontend** : React 19, TypeScript
*   **Styling** : Tailwind CSS
*   **Icônes** : Lucide React
*   **IA** : Google Gemini API (`gemini-2.5-flash` pour le texte, `gemini-2.5-flash-image` pour les visuels)
*   **Build** : Vite / ESBuild (implicite selon l'environnement)

---

## ⚙️ Installation et Configuration

### Prérequis

*   Node.js (v18 ou supérieur)
*   Une clé API Google Gemini (AI Studio)

### 1. Cloner le projet

```bash
git clone https://github.com/votre-repo/omniworld-architect.git
cd omniworld-architect
```

### 2. Installer les dépendances

Si vous utilisez un fichier `package.json` standard (non inclus dans les fichiers fournis mais nécessaire pour le développement local) :

```bash
npm install
# ou
yarn install
```

### 3. Configuration de la Clé API

L'application nécessite une clé API pour fonctionner avec les fonctionnalités d'IA.
Créez un fichier `.env` à la racine du projet :

```env
API_KEY=votre_clé_api_google_gemini_ici
```

> **Note de sécurité** : Ne committez jamais votre fichier `.env` sur un dépôt public.

### 4. Lancer en local

```bash
npm start
```

Ouvrez `http://localhost:3000` (ou le port indiqué) dans votre navigateur.

---

## 📦 Méthodes de Déploiement

Puisque OmniWorld Architect est une application React (Single Page Application - SPA), elle peut être déployée facilement sur n'importe quel hébergeur de contenu statique.

### Vercel (Recommandé)

1.  Installez Vercel CLI : `npm i -g vercel`
2.  À la racine du projet, lancez : `vercel`
3.  Configurez les **Environment Variables** dans le dashboard Vercel :
    *   Ajoutez `API_KEY` avec votre clé Gemini.

### Netlify

1.  Connectez votre dépôt GitHub à Netlify.
2.  Commande de build : `npm run build` (ou `vite build`)
3.  Dossier de publication : `dist` ou `build`.
4.  Allez dans **Site Settings > Build & Deploy > Environment** et ajoutez votre variable `API_KEY`.

### Docker

Créez un `Dockerfile` à la racine :

```dockerfile
# Build Stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Assurez-vous que l'API_KEY est injectée lors du build ou gérée via runtime config
ARG API_KEY
ENV API_KEY=$API_KEY
RUN npm run build

# Serve Stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 🤝 Contribution

Les contributions sont les bienvenues !
1.  Forkez le projet.
2.  Créez votre branche de fonctionnalité (`git checkout -b feature/AmazingFeature`).
3.  Committez vos changements (`git commit -m 'Add some AmazingFeature'`).
4.  Push vers la branche (`git push origin feature/AmazingFeature`).
5.  Ouvrez une Pull Request.

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

*Créé avec passion pour les bâtisseurs de mondes.*
