# Analyseur de deal — marchand de biens (Paris)

Outil d'analyse d'opérations achat / rénovation / revente : coût complet, marge nette, ROI sur fonds propres et pistes d'optimisation.

Un seul fichier (`index.html`), aucun serveur ni dépendance. Les deals sont enregistrés dans le navigateur (localStorage) et exportables en JSON.

## Déploiement sur GitHub Pages

1. Créer un dépôt sur GitHub et y pousser ce dossier.
2. Dans le dépôt : **Settings → Pages → Build and deployment → Source : GitHub Actions**.
3. À chaque `git push` sur `main`, le workflow `.github/workflows/deploy.yml` publie le site.

L'URL sera `https://<votre-utilisateur>.github.io/<nom-du-depot>/`.

## Utilisation locale

Ouvrir `index.html` dans un navigateur.

## Extraction IA (texte d'annonce et PDF)

L'extraction automatique des champs d'une annonce (prix, surface, charges,
DPE…) utilise l'API Claude via un Worker Cloudflare que vous hébergez
vous-même : voir [worker/README.md](worker/README.md) pour l'installation
(~5 minutes). Un bouton favori « Envoyer vers l'analyseur » (page d'accueil)
permet aussi de créer un bien en 1 clic depuis une annonce ouverte.
