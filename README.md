# Prépa Résidanat : mise en ligne sur GitHub Pages avec Firebase

Cette version de l'application tourne en dehors de Claude :

- **GitHub Pages** héberge la page gratuitement.
- **Firebase** gère les comptes (Google, Microsoft, e-mail) et enregistre les données de chaque étudiant.
- **Connexion persistante :** un étudiant se connecte une seule fois par appareil, puis reste connecté jusqu'à ce qu'il clique « Se déconnecter » dans Réglages.

## Ce que contient le dossier

| Fichier | Rôle |
|---|---|
| `index.html` | L'application complète |
| `firebase-config.js` | Tes clés Firebase et l'e-mail du propriétaire : **le seul fichier à modifier** |
| `fb-adapter.js` | Page de connexion et lien entre l'application et Firebase (ne pas modifier) |
| `firestore.rules` | Règles de sécurité de la base de données |
| `functions/` | Facultatif : serveur qui génère les quiz avec l'IA |
| `.nojekyll` | Indique à GitHub Pages de servir les fichiers tels quels |

---

## Étape 1. Créer le projet Firebase (10 minutes)

1. Va sur <https://console.firebase.google.com> et connecte-toi avec ton compte Google.
2. Clique **Créer un projet** et donne-lui un nom, par exemple `prepa-residanat`. Google Analytics n'est pas nécessaire.
3. Sur la page du projet, clique l'icône **Web** (`</>`) pour ajouter une application. Donne-lui un surnom et ne coche pas Firebase Hosting.
4. Firebase affiche un bloc `const firebaseConfig = { ... }`. Garde-le ouvert pour l'étape 2.

## Étape 2. Remplir `firebase-config.js`

Ouvre `firebase-config.js` dans un éditeur de texte (Bloc-notes suffit), puis :

- **Clés :** remplace chaque valeur de `window.FIREBASE_CONFIG` par celles de l'étape 1 (`apiKey`, `authDomain`, `projectId`, etc.).
- **Propriétaire :** dans `window.APP_OWNERS`, mets **ton adresse e-mail**, celle avec laquelle tu te connecteras. C'est elle qui te donne le rôle de propriétaire.

Ces clés peuvent être publiées : Firebase les prévoit pour une page web. La sécurité vient de la connexion obligatoire et des règles de l'étape 4.

## Étape 3. Activer la connexion

Dans la console Firebase, ouvre **Authentication**, puis **Commencer**, puis l'onglet **Méthode de connexion** :

1. **Google :** active-le et choisis ton e-mail d'assistance.
2. **Adresse e-mail/Mot de passe :** active-le.
3. **Microsoft (facultatif) :**
   - Crée une application sur <https://portal.azure.com>, rubrique « Inscriptions d'applications ».
   - Comme URI de redirection, mets celle que Firebase affiche (`https://TON-PROJET.firebaseapp.com/__/auth/handler`).
   - Copie l'ID d'application et le secret dans Firebase.
   - Mets enfin `window.APP_MICROSOFT = true` dans `firebase-config.js`.
4. Onglet **Paramètres**, rubrique **Domaines autorisés** : ajoute `TONPSEUDO.github.io` (ton pseudo GitHub).

## Étape 4. Créer la base de données et ses règles

1. Ouvre **Firestore Database**, clique **Créer une base de données**, choisis le **mode production** et une région proche (par exemple `europe-west1`).
2. Ouvre l'onglet **Règles** et remplace tout le contenu par celui du fichier `firestore.rules`.
3. Dans la fonction `isOwner`, remplace `ton.email@exemple.com` par ton adresse, la même qu'à l'étape 2.
4. Clique **Publier**.

Ces règles garantissent que :

- chaque étudiant ne voit que son propre planning ;
- seuls toi et tes admins attribuez les offres (Basique, Avancé, Pro, Max) : un étudiant ne peut pas se les donner lui-même ;
- seul toi nommes les admins.

## Étape 5. Publier sur GitHub Pages

1. Sur <https://github.com>, clique **New repository** (Nouveau dépôt).
   - Nom : `prepa-residanat`.
   - Visibilité : **Public** (GitHub Pages est gratuit pour un dépôt public ; un dépôt privé demande un abonnement payant).
2. Dans le dépôt, clique **Add file**, puis **Upload files**.
   - Glisse **tous les fichiers du dossier**, y compris `.nojekyll`. Sur Mac, appuie sur Cmd + Maj + . pour voir les fichiers cachés.
   - Clique **Commit changes**.
3. Ouvre **Settings**, puis **Pages**.
   - Dans « Source », choisis **Deploy from a branch**.
   - Branche : `main`, dossier : `/ (root)`.
   - Clique **Save**.
4. Après une à deux minutes, l'adresse de l'application s'affiche : `https://TONPSEUDO.github.io/prepa-residanat/`.

Avec la ligne de commande, si tu préfères :

```bash
git init && git add . && git commit -m "Prépa Résidanat"
git branch -M main
git remote add origin https://github.com/TONPSEUDO/prepa-residanat.git
git push -u origin main
```

## Étape 6 (facultative). Quiz générés par l'IA

Sans cette étape, tout fonctionne sauf la génération de nouvelles questions : planning, suivi, révisions, classement, comptes et revue des erreurs restent disponibles.

La génération demande un petit serveur, qui garde ta clé d'API secrète. Il nécessite le forfait Firebase **Blaze** (paiement à l'usage) et une clé d'API Anthropic (<https://console.anthropic.com>).

```bash
npm install -g firebase-tools
firebase login
cd dossier-du-projet
firebase init functions      # choisis ton projet, JavaScript, et garde les fichiers existants
firebase functions:secrets:set ANTHROPIC_API_KEY
firebase deploy --only functions
```

Copie ensuite l'adresse de la fonction `quiz` affichée à la fin dans `window.QUIZ_ENDPOINT` (fichier `firebase-config.js`), puis republie ce fichier sur GitHub.

Le serveur vérifie que la personne est connectée et plafonne chaque compte à 300 questions par jour (réglable dans `functions/index.js`).

## Partager l'application

- **Lien :** envoie simplement l'adresse de l'étape 5.
- **Inscription :** chaque personne crée son compte une seule fois, avec Google, Microsoft ou son e-mail, puis remplit son profil (pseudo, ville, date du concours, internat).
- **Rester connecté :** la session est gardée sur l'appareil. Sur un autre téléphone ou ordinateur, il suffit de se reconnecter une fois, et l'étudiant y retrouve tout son planning.

## Gérer les accès (propriétaire et admins)

1. Connecte-toi avec l'adresse mise dans `APP_OWNERS`. Avec Google, l'adresse est déjà vérifiée. Avec un compte e-mail/mot de passe, la vérification de l'adresse est obligatoire pour être reconnu propriétaire.
2. L'onglet **Accès** apparaît. Il te permet de :
   - accorder ou refuser les **demandes d'offre** ;
   - changer l'offre de chaque utilisateur et sa date de fin ;
   - **nommer un admin** : il doit s'être inscrit une fois, puis tu tapes son e-mail dans « Ajouter une personne » et tu choisis le rôle Admin.
3. Le menu « Voir comme » en haut de l'écran te montre l'application telle que la voit chaque offre.

## Mettre l'application à jour

Quand tu reçois un nouveau `index.html`, remplace-le dans le dépôt (**Add file**, puis **Upload files**, puis **Commit**). Tes réglages Firebase et les données des étudiants ne changent pas.

## Reprendre tes données de la version Claude

1. Dans la version Claude, ouvre **Réglages**, puis **Sauvegarde**, puis **Exporter une copie (.json)**.
2. Dans la version GitHub, connecte-toi, puis ouvre **Réglages**, puis **Sauvegarde**, puis **Importer une copie**.

## Fast Track Planning

Le bouton **Fast Track** (page Planning, ou bandeau d'accueil) charge en un clic le programme de révision accéléré du 8 novembre 2026 au 27 mai 2027, identique pour tous les utilisateurs, quelle que soit leur offre.

- Les dates de chaque module viennent du grand tableau du programme ; elles sont dans le tableau `FT` de `index.html` (à modifier pour changer le programme).
- Les cours de chaque module sont répartis jour par jour selon leur poids, avec des QCM, dans les heures disponibles de la semaine type.
- Il remplace les blocs à venir non verrouillés sur cette période ; les blocs faits, verrouillés ou placés à la main restent. Le bouton **Annuler** rétablit le planning d'avant.
- Les jours à 0 h (repos, absences) sont sautés sauf si l'utilisateur coche l'option.

## Bon à savoir

- **Gratuité :** le forfait gratuit de Firebase couvre largement quelques centaines d'étudiants. Vérifie les quotas actuels sur la page Tarifs de Firebase.
- **Paiement :** il n'est pas encore intégré. L'équipe active les offres à la main dans l'onglet Accès. Un paiement en ligne (Stripe, CIB/Edahabia via un prestataire) pourra être ajouté plus tard.
- **Programme :** il suit le programme de la Faculté de médecine d'Alger (nouveau système). Les modules se règlent dans l'onglet Modules.
