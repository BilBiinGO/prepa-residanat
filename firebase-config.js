/* ===== À remplir une seule fois (voir README.md, étape 2) =====
   Ces clés ne sont pas secrètes : Firebase les prévoit pour être publiées dans une page web.
   La sécurité vient des règles Firestore (firestore.rules) et de la connexion obligatoire. */
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyCK-u02_zA4dOeeauFDPtAYEa5aCZ-J2kQ",
  authDomain: "prepa-residanat.firebaseapp.com",
  projectId: "prepa-residanat",
  storageBucket: "prepa-residanat.firebasestorage.app",
  messagingSenderId: "766819833907",
  appId: "1:766819833907:web:cfce2d1954b3ac38652b46",
  measurementId: "G-Y1V36Y444R"
};
/* Adresse(s) e-mail du propriétaire : accès complet et nomination des admins.
   Mets la même adresse dans firestore.rules (fonction isOwner). */
window.APP_OWNERS = ["iker.bilel@gmail.com"];
/* Connexion Microsoft : passe à true après l'avoir activée dans Firebase (README, étape 3). */
window.APP_MICROSOFT = false;
/* Facultatif : adresse de la fonction qui génère les quiz avec l'IA (README, étape 6). Laisse vide sinon. */
window.QUIZ_ENDPOINT = "";
