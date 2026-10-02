# Orange Répondeur — règles du projet

Source unique des règles pour Codex et Claude Code (`CLAUDE.md` contient seulement `@AGENTS.md`).

## Façon de travailler sur ce projet

- **Branche de travail** : `Next` (pas de `dev`). Un push sur `Next` déploie la bêta dans `/beta` ; `main` contient la version validée et ne reçoit `Next` que sur demande explicite.
- **Publication** : push sur `main` → production à la racine de GitHub Pages ; push sur `Next` → bêta.
- **Tags de version** : aucun tag `vX.Y.Z` automatique.
- **Particularités** : base Supabase de production ; workflow n8n `OR V2 PROD` (méthode de modification plus bas).

## Projet et commandes

Application web interne de consultation et de gestion des messages du répondeur Orange d'un cabinet de kinésithérapie. Interface React 18 construite avec Vite 5, authentification Google et stockage des messages et fichiers audio dans Supabase.

- Installation reproductible : `npm ci`
- Développement local : `npm run dev`
- Vérification statique : `npm run lint`
- Build de production : `npm run build`
- Prévisualisation du build : `npm run preview`
- `main` contient la version validée. Les pull requests ne sont pas requises pour le flux courant.

## Architecture

- `src/App.jsx` : orchestration de l'interface, authentification, lecture et modification des messages et compteur du répondeur.
- `src/components/` : barre de filtres, liste et carte d'un message.
- `src/hooks/useAudioController.js` : chargement et contrôle de lecture des fichiers audio Supabase.
- `src/services/supabaseClient.js` : initialisation du client Supabase.
- `src/constants/index.jsx` : constantes applicatives et configuration publique du client Supabase.
- `src/styles/main.css` : styles globaux et thèmes de l'application.
- `.github/workflows/pages.yml` : build et déploiement GitHub Pages de la production, de la bêta et des previews.
- `.github/workflows/cleanup-previews.yml` : ancien workflow de déploiement Pages conservé dans le dépôt ; vérifier son utilité avant toute modification.

## Invariants métier

- Seul le compte Google autorisé par l'application peut consulter et modifier les messages.
- Un message peut être assigné à un kinésithérapeute, catégorisé, copié, écouté et supprimé.
- La suppression d'un message doit traiter à la fois la ligne Supabase et, s'il existe, son fichier dans le bucket `audio-files`.
- Le compteur du répondeur Orange ne doit être remis à zéro qu'après confirmation que la messagerie Orange a réellement été vidée.

## Export du workflow n8n

- Le workflow de production exporté depuis n8n porte le nom `OR V2 PROD`.
- Les exports sont téléchargés dans `/Users/damienhamon/Downloads`.
- Rechercher les fichiers nommés `OR V2 PROD.json`, `OR V2 PROD (1).json`, `OR V2 PROD (2).json`, etc.
- Toujours utiliser le fichier dont la date de modification est la plus récente. Le numéro entre parenthèses n'est qu'un indice secondaire.
- Avant toute analyse, vérifier que le fichier est un JSON valide et que le nom interne du workflow est bien `OR V2 PROD`.
- Ne jamais copier ni versionner cet export dans le dépôt sans l'avoir nettoyé : il peut contenir des en-têtes d'autorisation, des identifiants de services et des métadonnées sensibles.

## Méthode de modification du workflow

- Ne jamais tester directement une modification sur le workflow de production actif.
- Dupliquer d'abord le workflow dans n8n, renommer clairement la copie comme workflow de test et la laisser inactive pendant sa préparation.
- Tester une seule petite modification à la fois avec des données contrôlées.
- Pendant les tests, éviter les effets externes non nécessaires : insertion en base, notification Telegram, écriture Google Sheets et incrément du compteur.
- Vérifier le chemin nominal et le chemin d'erreur avant de proposer le raccordement à la production.
- Ne modifier le workflow de production qu'après validation explicite du résultat sur la copie de test.

## Format des nœuds fournis à l'utilisateur

- Toute correction destinée à être collée dans n8n doit être fournie sous forme de JSON de presse-papiers n8n, avec les sections `nodes` et `connections`.
- Fournir toujours au moins deux nœuds reliés ensemble.
- Si un seul nœud est corrigé, inclure aussi son nœud précédent ou son nœud suivant, même inchangé, afin que le lot puisse être collé dans n8n.
- Si plusieurs nœuds sont modifiés, fournir tous les nœuds modifiés et au moins les connexions nécessaires entre eux.
- Ne jamais inclure de secret en clair dans le JSON livré. Conserver des références aux credentials n8n ou indiquer les champs à reconnecter manuellement.
- Accompagner chaque lot d'un protocole de test court, du résultat attendu et d'une procédure simple de retour arrière.

## Web statique et livraison

- Vérifier le rendu et la console dans un navigateur pour toute modification d'interface.
- La version affichée dans l'application et celle de `package.json` doivent rester synchronisées et être incrémentées à chaque livraison sur `Next`.
- Un push sur `main` déploie la production à la racine de GitHub Pages ; un push sur `Next` déploie la bêta dans `/beta`.

## Base Supabase

- Toute migration ou tout SQL qui modifie la base doit être expliqué et nécessite un accord explicite avant application. La lecture est libre.
- **Application par l'agent** : après mon accord explicite dans la conversation, appliquer soi-même la migration avec le MCP Supabase (`apply_migration` ; SQL ponctuel : `execute_sql`), en local comme dans le cloud. Ne jamais me demander de copier-coller du SQL dans l'éditeur Supabase. Ensuite vérifier (`list_migrations`, `get_advisors` sécurité) et rendre compte. Si le MCP Supabase n'est pas disponible ou n'accède pas au projet, le dire et expliquer comment le connecter, au lieu de me renvoyer le SQL. Le MCP Supabase doit avoir accès au compte `damienhamon.kine@gmail.com` (voir `ACCOUNTS.md`).
- RLS est obligatoire sur toute table exposée. Les migrations doivent être horodatées et versionnées, avec un script de retour arrière lorsque c'est possible.
- Ne jamais placer de clé de service Supabase dans le code client. Seule une clé publique destinée au navigateur peut y être référencée.

## Règles communes (catalogue WORKFLOW)

- **Instructions** : ce fichier est l'unique source des règles ; `CLAUDE.md` se limite à `@AGENTS.md`. Ne jamais dupliquer une règle ailleurs. Les singularités du projet (branche, publication, versions) sont dans « Façon de travailler sur ce projet » et priment sur ce bloc.
- **Comptes et services** : voir `ACCOUNTS.md` (GitHub, hébergement, base de données, API, emplacement des secrets). Le mettre à jour dès qu'un compte, un service ou un secret change. Aucune valeur secrète dedans.
- **Avant de coder** : pour une demande non triviale, reformuler ce qui a été compris et poser les questions utiles avant de coder.
- **Git** : travailler sur la **branche de travail** déclarée plus haut, sans créer d'autre branche durable ni changer ce modèle sans demande explicite. Pas de pull request. Ne jamais réécrire l'historique de la branche de travail ou de `main`. En cloud, si l'outil impose une branche de session, fusionner le travail dans la branche de travail et la pousser avant de terminer.
- **Trace de l'agent** : terminer chaque message de commit par une ligne `Agent: Claude` ou `Agent: Codex`, selon l'agent qui a réellement fait le travail.
- **GitHub** : le compte est fixé par la configuration git (voir `ACCOUNTS.md`). Ne pas utiliser `gh auth switch` ; en cas d'erreur d'accès, le signaler.
- **Automatisations GitHub** (`.github/workflows/agents.yml`) : GitHub pose lui-même les tags (`revue-ok`, `vX.Y.Z`) et envoie les notifications Telegram de clôture et de version, ce qui fonctionne aussi depuis le cloud. Ne pas pousser ces tags soi-même : il suffit de pousser les commits.
- **Notification de fin** : si la tâche a demandé plus de 2 minutes, lancer juste avant la réponse finale `tg-notify "<résumé en quelques phrases>"`, ou `tg-notify --bloque "<raison>"` en cas de blocage après un travail significatif. Une seule notification par tâche, sans donnée sensible. Si l'envoi échoue, le signaler sans considérer la tâche comme échouée. (Chemin complet : `/opt/homebrew/bin/tg-notify`.) En cloud, `tg-notify` n'existe pas : ne rien envoyer, la clôture et les versions sont notifiées par GitHub.
- **Revue de code** (demande « revue », sans PR) : examiner en lecture seule les commits déjà poussés sur la branche de travail depuis le tag `revue-ok` (à défaut depuis `origin/main`), ou le commit / la plage indiqués. Rendre : résumé des fonctionnalités couvertes, problèmes classés par gravité avec `fichier:ligne` et correction proposée, plan de correction. Ne rien corriger sans accord.
- **Clôture** (demande « clôture » ou « fin de session », une fois les corrections validées et poussées) : ajouter en tête de `JOURNAL.md` (titre `# Journal des clôtures` s'il n'existe pas) une entrée courte, sans donnée sensible :
  ```
  ## AAAA-MM-JJ — Claude|Codex · local|cloud
  - Livré : <fonctionnalités revues et testées>
  - Tests : <vérifications lancées et résultat>
  - Corrigé à la revue : <corrections, ou « rien »>
  - En attente : <points reportés, ou « rien »>
  - Prochaine étape : <…>
  ```
  La commiter avec un message qui **commence par `Clôture`** (ex. `Clôture : journal`) et la pousser sur la branche de travail : l'Action GitHub déplace alors `revue-ok` sur ce commit et envoie l'entrée sur Telegram (pas de `tg-notify` en plus). Si le MCP Notion est disponible, mettre aussi à jour la ligne du projet dans la base Notion « État de reprise projets » (Branche, Dernier agent, Environnement, Dernier commit, Dernière session, Où on en est, Prochaine étape). Terminer par un récapitulatif et la ligne « ✅ CONVERSATION CLÔTURÉE — développé, testé, revu ».
- **Reprise** (premier message d'une conversation) : `git fetch origin --tags`, puis donner l'état en une ligne avant de traiter la demande : « ✅ Tout est clôturé (dernière entrée de `JOURNAL.md` : date, agent, prochaine étape) » si `revue-ok` et `origin/<branche de travail>` pointent le même commit, sinon « ⚠️ N commits poussés depuis la dernière clôture, non revus » avec leur liste courte (`git log --oneline revue-ok..origin/<branche de travail>`). Sans tag `revue-ok` : « Aucune clôture enregistrée ». Rappeler la branche de travail, signaler les modifications locales non commitées, puis ajouter la ligne : « Raccourcis : *réfléchis* (reformuler avant de coder) · *revue* (revue de code) · *clôture* ou *fin de session* (journal, tag, notification) · *initialise ce projet* (mise aux normes du workflow) ».
- Maintenir ce fichier quand les commandes, l'architecture, les invariants, la façon de travailler ou le déploiement évoluent.
