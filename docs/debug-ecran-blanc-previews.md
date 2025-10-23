# Comprendre l'écran gris dans les prévisualisations GitHub Pages

Ce document résume les vérifications à effectuer **sans modifier le code** pour isoler la cause de l'écran gris observé dans les préviews déployées par GitHub Pages.

## 1. Vérifier que le bundle se télécharge bien
1. Ouvrir la preview dans Chrome/Edge/Firefox.
2. Afficher les DevTools (F12) > onglet **Network** puis filtrer sur « JS ».
3. Recharger la page.
4. Contrôler que le fichier `assets/index-*.js` apparaît avec le statut **200**.
   - Si le statut est **404** ou **0**, cliquer dessus et regarder l'onglet **Response**. Si la réponse contient du HTML (`<!doctype html>`), le navigateur tente de charger le bundle au mauvais chemin.
5. Toujours dans l'onglet **Headers**, vérifier l'URL exacte. Elle doit suivre le schéma :
   ```
   https://<orga>.github.io/Orange-Repondeur/beta/pr-<num>/assets/index-XXXXX.js
   ```
   Toute URL qui ne contient pas `beta/pr-<num>` ou qui finit par `assets/index-XXXXX.js/` est suspecte.

## 2. Inspecter la console JavaScript
1. Onglet **Console** des DevTools.
2. Recharger la page.
3. Noter toute erreur du type :
   - `Uncaught SyntaxError: Unexpected token '<'` → signifie que GitHub Pages renvoie du HTML à la place du bundle JS.
   - `Failed to load resource: the server responded with a status of 404` → confirme un chemin erroné.
   - `TypeError: Cannot read properties of undefined` juste après le montage → indique que le JavaScript s'exécute mais qu'une donnée attendue (ex. réponse Supabase) est vide ou mal formatée.
4. Faire une capture de ces erreurs (copie d'écran ou copier/coller) pour faciliter le diagnostic.

## 3. Tester localement la build comme si elle était dans un sous-dossier
Même si `vite.config.js` force déjà `base: './'`, reproduire la structure GitHub Pages en local permet de confirmer le comportement.

```bash
npm run build
npx serve dist --listen 4173 --single
```

- Ouvrir `http://localhost:4173/index.html` → contrôle de base.
- Pour simuler une préview :
  ```bash
  mkdir -p dist-simulee/beta/pr-test
  cp -r dist/* dist-simulee/beta/pr-test/
  npx serve dist-simulee --listen 4310 --single
  ```
  Puis visiter `http://localhost:4310/beta/pr-test/`.
  - Si l'écran devient gris localement, ouvrir l'onglet **Network** pour vérifier si les assets sont cherchés dans `beta/pr-test/assets`. Cela reproduit fidèlement ce que fait GitHub Pages.

## 4. Contrôler le contenu du dépôt `gh-pages`
1. Dans GitHub, aller sur la branche `gh-pages`.
2. Vérifier que le dossier `beta/pr-<num>/` contient **au moins** :
   - `index.html`
   - `404.html`
   - un dossier `assets/`
3. Ouvrir le `index.html` directement sur GitHub (bouton Raw). Confirmer que les chemins des scripts et CSS commencent par `./assets/`.
4. Si le dossier `assets/` manque ou ne contient pas la même empreinte (hash) que celle référencée dans `index.html`, le problème vient du déploiement (ancienne build, cache GitHub Actions, etc.).

## 5. Vérifier les requêtes Supabase
Quand le bundle charge correctement mais que l'écran reste vide, inspecter la section **Network > Fetch/XHR** :
1. Les requêtes doivent partir vers `https://xvxvhfpqyheelsdczxcj.supabase.co/rest/v1/messages`.
2. Statut attendu : **200**.
3. Si le statut est **401/403**, vérifier la clé Supabase (variable `SUPABASE_KEY`). Une clé invalide provoquera une erreur gérée côté React (`Erreur de chargement des messages…`) mais peut aussi stopper l'initialisation si la réponse ne correspond pas au format attendu.
4. Cliquer sur la requête pour lire le JSON retourné et voir si des champs sont manquants (par exemple `date` ou `message_type`).

## 6. Comparer avec l'environnement local
1. Lancer `npm run dev -- --host` et vérifier que l'application fonctionne en local.
2. Ouvrir simultanément la preview et la version locale.
3. Comparer la console : mêmes erreurs ? mêmes données ?
   - Si tout fonctionne en local mais pas dans la preview, le souci est très probablement lié aux chemins (section 1) ou au déploiement (section 4).

## 7. Collecter les éléments pour reproduction
Pour faciliter toute investigation future, réunir :
- L'URL exacte de la preview GitHub Pages.
- Les captures d'écran des onglets **Network** et **Console**.
- Un export du `index.html` déployé (via `curl` ou en le téléchargeant depuis GitHub).
- La sortie complète du job GitHub Actions correspondant (section « Deploy PR preview »).

Avec ces informations, il sera possible de confirmer si le problème vient des chemins générés par Vite, du déploiement GitHub Pages, ou d'une erreur JavaScript au runtime.
