/* ===== Prépa Résidanat · version hébergée (GitHub Pages + Firebase) =====
   L'application parle à « claude.use(nom) ». Hors de claude.ai, ce fichier fournit les mêmes services :
   db → Cloud Firestore, user → Firebase Authentication, downloads → téléchargement direct, sample → fonction IA facultative. */
(function () {
  "use strict";
  const cfg = window.FIREBASE_CONFIG || {};
  if (!window.firebase || !cfg.apiKey || cfg.apiKey === "COLLE_ICI") {
    console.warn("Firebase non configuré : l'application fonctionne sur cet appareil seulement.");
    return;
  }
  firebase.initializeApp(cfg);
  const auth = firebase.auth(), fs = firebase.firestore();
  auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);   // reste connecté : pas besoin de ressaisir ses identifiants
  window.FB_MODE = true;
  const owners = (window.APP_OWNERS || []).map(e => String(e).toLowerCase());
  const $ = s => document.querySelector(s);
  const esc = t => String(t == null ? "" : t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ----- Écran de connexion ----- */
  let mode = "login";
  const MSG = {
    "auth/invalid-credential": "E-mail ou mot de passe incorrect.", "auth/wrong-password": "Mot de passe incorrect.", "auth/user-not-found": "Aucun compte avec cet e-mail.",
    "auth/email-already-in-use": "Un compte existe déjà avec cet e-mail : connecte-toi.", "auth/weak-password": "Mot de passe trop court (6 caractères minimum).",
    "auth/invalid-email": "Adresse e-mail invalide.", "auth/popup-closed-by-user": "Fenêtre fermée avant la fin de la connexion.", "auth/too-many-requests": "Trop d'essais : réessaie dans quelques minutes.",
    "auth/account-exists-with-different-credential": "Ce compte existe déjà avec une autre méthode de connexion (par exemple Google).", "auth/unauthorized-domain": "Ce site n'est pas autorisé dans Firebase (README, étape 3)."
  };
  function screen(err, info) {
    let el = $("#fbauth");
    if (!el) { el = document.createElement("div"); el.id = "fbauth"; document.body.appendChild(el); }
    const reg = mode === "register";
    el.innerHTML = '<div class="fb-wrap"><div class="card fb-card">' +
      '<div class="eyebrow">Concours de résidanat</div><h2 style="margin:6px 0 4px;font-size:26px">Prépa Résidanat</h2>' +
      '<p class="small muted" style="margin-bottom:16px">' + (reg ? "Crée ton compte. Tu resteras connecté sur cet appareil." : "Connecte-toi pour retrouver ton planning sur tous tes appareils.") + "</p>" +
      '<div class="stack" style="gap:10px"><button class="btn fb-prov" data-fb="google">' + G + " Continuer avec Google</button>" +
      (window.APP_MICROSOFT ? '<button class="btn fb-prov" data-fb="microsoft">' + MS + " Continuer avec Microsoft</button>" : "") +
      '<div class="fb-or"><span>ou avec ton e-mail</span></div>' +
      '<form id="fbform" class="stack" style="gap:10px" novalidate>' + (reg ? '<label>Prénom et nom<input id="fbname" autocomplete="name" required></label>' : "") +
      '<label>E-mail<input id="fbmail" type="email" autocomplete="email" required></label><label>Mot de passe<input id="fbpass" type="password" autocomplete="' + (reg ? "new-password" : "current-password") + '" minlength="6" required></label>' +
      (err ? '<div class="notice bad small">' + esc(err) + "</div>" : "") + (info ? '<div class="notice ok small">' + esc(info) + "</div>" : "") +
      '<button class="btn pri" type="submit">' + (reg ? "Créer mon compte" : "Se connecter") + "</button></form>" +
      '<div class="row between small"><button class="btn ghost sm" data-fb="toggle">' + (reg ? "J'ai déjà un compte" : "Créer un compte") + "</button>" + (reg ? "" : '<button class="btn ghost sm" data-fb="reset">Mot de passe oublié</button>') + "</div></div></div></div>";
  }
  const G = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 01-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0012 24z"/><path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 010-4.7V6.6h-4a12 12 0 000 10.9l4-3.1z"/><path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 001.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8z"/></svg>';
  const MS = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="#F25022" d="M1 1h10.5v10.5H1z"/><path fill="#7FBA00" d="M12.5 1H23v10.5H12.5z"/><path fill="#00A4EF" d="M1 12.5h10.5V23H1z"/><path fill="#FFB900" d="M12.5 12.5H23V23H12.5z"/></svg>';
  const fail = e => screen(MSG[e && e.code] || ("Connexion impossible : " + ((e && e.message) || e)));
  document.addEventListener("click", async e => {
    const b = e.target.closest && e.target.closest("[data-fb]"); if (!b) return;
    e.preventDefault();
    const k = b.dataset.fb;
    if (k === "toggle") { mode = mode === "login" ? "register" : "login"; return screen(); }
    if (k === "reset") { const m = ($("#fbmail") || {}).value; if (!m) return screen("Tape d'abord ton e-mail."); try { await auth.sendPasswordResetEmail(m.trim()); screen(null, "E-mail de réinitialisation envoyé."); } catch (x) { fail(x); } return; }
    const p = k === "google" ? new firebase.auth.GoogleAuthProvider() : new firebase.auth.OAuthProvider("microsoft.com");
    try { await auth.signInWithPopup(p); } catch (x) { if (x && x.code === "auth/popup-blocked") { auth.signInWithRedirect(p); } else fail(x); }
  });
  document.addEventListener("submit", async e => {
    if (!e.target || e.target.id !== "fbform") return;
    e.preventDefault();
    const m = $("#fbmail").value.trim(), pw = $("#fbpass").value;
    try {
      if (mode === "register") { const r = await auth.createUserWithEmailAndPassword(m, pw); const n = ($("#fbname") || {}).value; if (n) await r.user.updateProfile({ displayName: n.trim() }); }
      else await auth.signInWithEmailAndPassword(m, pw);
    } catch (x) { fail(x); }
  });
  window.FB_LOGOUT = () => auth.signOut().then(() => location.reload());

  /* ----- Services attendus par l'application ----- */
  let resolveUser;
  const userReady = new Promise(r => resolveUser = r);
  auth.onAuthStateChanged(u => {
    if (!u) { screen(); return; }
    const el = $("#fbauth"); if (el) el.remove();
    resolveUser(u);
  });
  const userApi = {
    id: async () => (await userReady).uid,
    isOwner: async () => { const u = await userReady; return !!u.emailVerified && owners.includes(String(u.email || "").toLowerCase()); },
    me: async () => { const u = await userReady; return { id: u.uid, name: u.displayName || (u.email || "").split("@")[0], avatarUrl: u.photoURL || "", email: u.email || "" }; },
    profiles: async ids => {
      const out = {};
      await Promise.all([].concat(ids).map(async id => { try { const d = await fs.doc("members/" + id).get(); const m = d.exists ? d.data() : {}; out[id] = { id, name: m.name || m.p || "", avatarUrl: m.photo || "" }; } catch (e) { out[id] = { id, name: "", avatarUrl: "" }; } }));
      return out;
    },
    search: async q => {
      q = String(q || "").trim().toLowerCase(); if (q.length < 3) return [];
      try {
        const r = q.includes("@") ? await fs.collection("members").where("email", "==", q).limit(5).get() : await fs.collection("members").where("p", "==", q).limit(5).get();
        return r.docs.map(d => ({ id: d.id, name: d.data().name || d.data().p || "", email: d.data().email || "" }));
      } catch (e) { return []; }
    }
  };
  const downloads = {
    save: async ({ filename, data }) => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([data], { type: "application/json" })); a.download = filename; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
  };
  const sample = window.QUIZ_ENDPOINT ? Object.assign(async () => ({ text: "" }), {
    json: async (prompt, o) => {
      const u = await userReady, t = await u.getIdToken();
      const r = await fetch(window.QUIZ_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + t }, body: JSON.stringify({ prompt }), signal: o && o.signal });
      if (!r.ok) throw { code: r.status === 429 ? "rate_limited" : r.status === 401 || r.status === 403 ? "not_granted" : "error" };
      return (await r.json()).result;
    }
  }) : null;
  window.claude = {
    use: async name => {
      if (name === "user") { await userReady; return userApi; }
      if (name === "db") { await userReady; return fs; }
      if (name === "downloads") return downloads;
      if (name === "sample") return sample;
      return null;
    }
  };
})();
