# Comptes et services — Orange Répondeur

Carte des comptes utilisés par le projet, pour reprendre après des mois. **Aucune valeur secrète ici** : seulement où la trouver.

## Code

- GitHub : compte `DaamHaam`, dépôt public `DaamHaam/Orange-Repondeur`
- Dépôt : <https://github.com/DaamHaam/Orange-Repondeur>
- Branches : `Next` (développement et bêta), `main` (production validée)
- Config git spécifique : helper de credentials local forçant le compte `DaamHaam`

## Hébergement

- GitHub Pages : production <https://daamhaam.github.io/Orange-Repondeur/>, bêta <https://daamhaam.github.io/Orange-Repondeur/beta/>
- Déploiement : automatique par GitHub Actions au push sur `main` pour la production et sur `Next` pour la bêta

## Base de données

- Supabase : base, authentification et stockage des fichiers audio
- Compte : `damienhamon.kine@gmail.com`
- Projet : nom `à compléter`, ref `xvxvhfpqyheelsdczxcj`, région `à compléter`
- Environnements : `à compléter`

## API et services externes

| Service | Usage | Compte | Où est le secret |
|---|---|---|---|
| Supabase | Base, Auth Google et stockage audio | `damienhamon.kine@gmail.com` | Configuration publique du client dans `src/constants/index.jsx` ; secrets serveur dans Supabase ou `à compléter` |
| n8n | Automatisation du répondeur, workflow de production `OR V2 PROD` | `damhamon1808@gmail.com` | Credentials gérés dans n8n |
| Google OAuth | Connexion à l'application | `à compléter` | Configuration du fournisseur dans Supabase Auth |
| Google Sheets | Écriture depuis le workflow n8n | `à compléter` | Credential Google dans n8n |
| Telegram | Notifications depuis le workflow n8n | `à compléter` | Credential Telegram dans n8n |
| Orange | Messagerie vocale et compteur | `à compléter` | `à compléter` |

## Outils des agents
- Comptes vus par les agents : Supabase `DamsPRO` (damienhamon.kine@gmail.com) **non branché** sur Claude (local et cloud), qui sont sur `kineslba` ; pour une migration, rebrancher ou demander. Voir WORKFLOW/CATALOGUE.md § 11.

- MCP utiles : aucun requis actuellement
- Notification : `tg-notify` (bots partagés, Trousseau `claude-ar-gs-telegram-bot` / `codex-ar-gs-telegram-bot`)

## À savoir

- Le workflow n8n actif est une production : toujours préparer et tester les changements sur une copie inactive.
- Les exports n8n téléchargés peuvent contenir des informations sensibles et ne doivent pas être copiés dans le dépôt sans nettoyage.
- Le module renforcé « données personnelles / données de santé » du catalogue n'est pas activé pour l'instant.
- Unity, Convex et les autres hébergeurs ne sont pas utilisés.
