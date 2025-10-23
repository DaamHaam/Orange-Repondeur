# Orange Répondeur

Application Vite + React utilisée pour consulter et gérer les messages issus du répondeur Supabase.

## Mettre à jour l'application sans casser la publication GitHub Pages

La publication automatique GitHub Pages se base sur le dossier `dist` généré par Vite et sur le `base` défini dans `vite.config.js` (`/Orange-Repondeur/`). Pour éviter toute régression lors d'une mise à jour :

1. **Installer les dépendances**
   ```bash
   npm install
   ```
2. **Tester localement** en lançant Vite avec l'hôte ouvert pour vérifier le rendu avant publication.
   ```bash
   npm run dev -- --host
   ```
3. **Vérifier la compilation** pour s'assurer que la build utilisée par GitHub Pages reste fonctionnelle.
   ```bash
   npm run build
   ```
4. **Commiter les sources uniquement** : GitHub Pages reconstruira le site à partir du dépôt, il est inutile de versionner le contenu du dossier `dist`.
5. **Mettre à jour le numéro de version** en synchronisant `package.json` et l'étiquette affichée dans l'application (`src/App.jsx`) pour suivre les évolutions déployées.

En cas de changement du nom du dépôt ou du chemin de publication, pensez à ajuster la constante `repoSlug` dans `vite.config.js` ou à définir la variable d'environnement `VITE_BASE` lors du build.

## Scripts utiles
- `npm run dev` : lance le serveur de développement Vite.
- `npm run build` : génère la version optimisée pour la production.
- `npm run preview` : sert la build de production en local.
- `npm run lint` : vérifie la qualité du code avec ESLint.

## Prérequis
- Node.js 18 ou version supérieure.
- Accès au projet Supabase configuré dans `src/services/supabaseClient.js` (variables d'environnement côté build).
