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
