# Worker d'extraction IA

Ce Worker Cloudflare reçoit le texte d'une annonce (ou un PDF) et renvoie les
champs structurés (prix, surface, charges, DPE…) grâce à l'API Claude.
Il sert d'intermédiaire pour ne jamais exposer votre clé API dans le site.

## Mise en place (~5 minutes, gratuit)

1. **Clé API Anthropic** : créez-en une sur https://console.anthropic.com
   (Settings → API keys). Une extraction coûte moins de 2 centimes.
2. **Compte Cloudflare** (gratuit) : https://dash.cloudflare.com →
   *Workers & Pages* → *Create Worker* → nommez-le par ex. `analyseur-extract`
   → *Deploy*, puis *Edit code* : remplacez tout le contenu par `extract.js`
   et cliquez *Deploy*.
3. **Secrets** : dans le Worker → *Settings* → *Variables and Secrets* :
   - `ANTHROPIC_API_KEY` (type **Secret**) : votre clé API — obligatoire.
   - `APP_TOKEN` (type Secret) : un mot de passe de votre choix — recommandé,
     il empêche des inconnus d'utiliser votre clé via le Worker.
   - `ALLOWED_ORIGINS` (optionnel) : origines autorisées, par défaut
     `https://savi168.github.io`.
4. **Côté site** : ouvrez une simulation → panneau « 1. L'annonce » →
   *Réglages IA* → collez l'URL du Worker
   (`https://analyseur-extract.<votre-compte>.workers.dev`) et l'APP_TOKEN.

Ensuite : collez le texte d'une annonce (Ctrl+A, Ctrl+C sur la page) ou
déposez un PDF, et cliquez « Extraire avec l'IA ».

## Synchronisation des données (optionnel)

Pour retrouver vos biens et simulations sur tous vos appareils :

1. Dans Cloudflare : *Storage & Databases* → *KV* → *Create namespace*,
   nommez-le par ex. `analyseur-data`.
2. Dans votre Worker → *Settings* → *Bindings* → *Add* → *KV namespace* :
   nom de variable **`DATA`** (exactement), namespace `analyseur-data`.
3. Le secret `APP_TOKEN` doit être configuré (il protège vos données).
4. Redéployez le Worker avec la dernière version de `extract.js`.

Côté site (page d'accueil → « Sauvegarde & synchronisation ») : boutons
« Envoyer vers le cloud » / « Récupérer du cloud », et une case à cocher
pour la sauvegarde automatique après chaque modification.
