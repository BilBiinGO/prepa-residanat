/* Facultatif (README, étape 6) : génération des quiz par l'IA, côté serveur.
   La clé de l'API Anthropic reste secrète ici, jamais dans la page. Nécessite le forfait Firebase « Blaze ». */
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const Anthropic = require("@anthropic-ai/sdk");
admin.initializeApp();
const KEY = defineSecret("ANTHROPIC_API_KEY");
const PER_DAY = 300;   // plafond de questions par compte et par jour

exports.quiz = onRequest({ secrets: [KEY], cors: true, region: "europe-west1" }, async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const tok = (req.get("Authorization") || "").replace("Bearer ", "");
    const user = await admin.auth().verifyIdToken(tok);
    const prompt = String((req.body || {}).prompt || "").slice(0, 20000);
    if (!prompt) return res.status(400).json({ error: "prompt manquant" });
    const day = new Date().toISOString().slice(0, 10), ref = admin.firestore().doc("usage/" + user.uid + "_" + day);
    const used = ((await ref.get()).data() || {}).n || 0;
    if (used >= PER_DAY) return res.status(429).json({ error: "quota" });
    const client = new Anthropic({ apiKey: KEY.value() });
    const msg = await client.messages.create({ model: "claude-sonnet-5-5", max_tokens: 8000, messages: [{ role: "user", content: prompt }] });
    const text = msg.content.map(c => c.text || "").join("");
    const json = JSON.parse(text.slice(text.indexOf("["), text.lastIndexOf("]") + 1));
    await ref.set({ n: used + (Array.isArray(json) ? json.length : 0) }, { merge: true });
    res.json({ result: json });
  } catch (e) {
    res.status(e && e.code && String(e.code).startsWith("auth/") ? 401 : 500).json({ error: "échec" });
  }
});
