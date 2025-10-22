# Consignes pour les contributions

- L'application est déployée sur plusieurs environnements (GitHub Pages, prévisualisations de pull request, etc.). Ne forcez pas la valeur de `base` dans `vite.config.js` sur un chemin absolu fixe : laissez la résolution dynamique déjà en place. Sinon, les assets générés par Vite seront chargés depuis un mauvais chemin et l'interface affichera un écran blanc.
- Si vous avez besoin d'un chemin spécifique (par exemple pour GitHub Pages), utilisez plutôt la variable d'environnement `VITE_BASE` dans le workflow concerné.
- Après toute modification visuelle notable, pensez à fournir une capture d'écran pour faciliter la revue.
