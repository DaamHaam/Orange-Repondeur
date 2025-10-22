# Consignes pour les contributions

- L'application est déployée sur plusieurs environnements (GitHub Pages, prévisualisations de pull request, etc.). Conservez la configuration actuelle de `vite.config.js` : en développement (`vite`), la base doit rester `/`, tandis qu'en build elle doit lire la variable d'environnement `VITE_BASE` avec repli sur `/Orange-Repondeur/`. Modifier ce comportement peut provoquer un écran blanc dans les prévisualisations.
- Si vous déployez via un workflow ou un script, positionnez `VITE_BASE` en fonction de la cible (`/Orange-Repondeur/`, `/Orange-Repondeur/beta/`, `/Orange-Repondeur/beta/pr-<num>/`, etc.).
- Après toute modification visuelle notable, pensez à fournir une capture d'écran pour faciliter la revue.
