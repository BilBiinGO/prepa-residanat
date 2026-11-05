/* ===== À remplir une seule fois (voir README.md, étape 2) =====
   Ces clés ne sont pas secrètes : Firebase les prévoit pour être publiées dans une page web.
   La sécurité vient des règles Firestore (firestore.rules) et de la connexion obligatoire. */
window.FIREBASE_CONFIG = {
  apiKey: "COLLE_ICI",
  authDomain: "ton-projet.firebaseapp.com",
  projectId: "ton-projet",
  storageBucket: "ton-projet.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000"
};
/* Adresse(s) e-mail du propriétaire : accès complet et nomination des admins.
   Mets la même adresse dans firestore.rules (fonction isOwner). */
window.APP_OWNERS = ["ton.email@exemple.com"];
/* Connexion Microsoft : passe à true après l'avoir activée dans Firebase (README, étape 3). */
window.APP_MICROSOFT = false;
/* Facultatif : adresse de la fonction qui génère les quiz avec l'IA (README, étape 6). Laisse vide sinon. */
window.QUIZ_ENDPOINT = "";
