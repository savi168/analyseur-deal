// Cloudflare Worker : extraction structurée d'annonces immobilières via l'API Claude.
// Reçoit POST JSON {text: "..."} et/ou {pdf: "<base64>"} et renvoie les champs extraits.
// Secrets à configurer dans le Worker : ANTHROPIC_API_KEY (obligatoire),
// APP_TOKEN (recommandé), ALLOWED_ORIGINS (optionnel, séparés par des virgules).

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['titre','prix_affiche','surface_m2','nb_pieces','adresse','ville','etage','ascenseur','dpe','etat','charges_mois','taxe_fonciere_an','annee_construction','travaux_commentaire'],
  properties: {
    titre: { type: 'string', description: "Titre court de l'annonce" },
    prix_affiche: { anyOf: [{type:'number'},{type:'null'}], description: 'Prix demandé en euros (FAI si précisé)' },
    surface_m2: { anyOf: [{type:'number'},{type:'null'}], description: 'Surface habitable ou Carrez en m²' },
    nb_pieces: { anyOf: [{type:'integer'},{type:'null'}] },
    adresse: { anyOf: [{type:'string'},{type:'null'}], description: 'Rue / quartier si mentionné' },
    ville: { anyOf: [{type:'string'},{type:'null'}], description: 'Ville, avec arrondissement le cas échéant' },
    etage: { anyOf: [{type:'string'},{type:'null'}], description: "Ex : '4e', 'RDC'" },
    ascenseur: { anyOf: [{type:'boolean'},{type:'null'}] },
    dpe: { anyOf: [{type:'string'},{type:'null'}], description: 'Lettre A à G' },
    etat: { anyOf: [{type:'string'},{type:'null'}], description: "'à rénover', 'bon état', 'refait à neuf'…" },
    charges_mois: { anyOf: [{type:'number'},{type:'null'}], description: 'Charges de copropriété en €/mois (convertir si données au trimestre ou à l\'année)' },
    taxe_fonciere_an: { anyOf: [{type:'number'},{type:'null'}], description: 'Taxe foncière en €/an' },
    annee_construction: { anyOf: [{type:'integer'},{type:'null'}] },
    travaux_commentaire: { anyOf: [{type:'string'},{type:'null'}], description: "Indices de travaux à prévoir mentionnés dans l'annonce (une phrase)" }
  }
};

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request.headers.get('Origin') || '', env);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return json({ error: 'POST attendu' }, 405, cors);
    if (env.APP_TOKEN && request.headers.get('x-app-token') !== env.APP_TOKEN)
      return json({ error: 'jeton invalide (vérifiez le champ Jeton dans Réglages IA)' }, 401, cors);
    if (!env.ANTHROPIC_API_KEY)
      return json({ error: 'secret ANTHROPIC_API_KEY manquant dans le Worker' }, 500, cors);

    let body;
    try { body = await request.json(); } catch { return json({ error: 'corps JSON invalide' }, 400, cors); }
    if (!body.text && !body.pdf) return json({ error: 'fournir "text" et/ou "pdf"' }, 400, cors);

    const content = [];
    if (body.pdf) content.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: body.pdf } });
    content.push({ type: 'text', text:
      "Extrais les informations de cette annonce ou plaquette immobilière française." +
      (body.text ? "\n\nTexte de l'annonce :\n" + String(body.text).slice(0, 60000) : '') });

    const apiReq = {
      model: 'claude-opus-5',
      max_tokens: 4000,
      fallbacks: 'default',
      output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
      system: "Tu extrais des données structurées d'annonces immobilières françaises. Mets null pour toute information absente ; n'invente rien. Convertis les montants en euros.",
      messages: [{ role: 'user', content }]
    };

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'server-side-fallback-2026-07-01'
      },
      body: JSON.stringify(apiReq)
    });
    if (!resp.ok) {
      const t = await resp.text();
      return json({ error: 'API Claude ' + resp.status + ' : ' + t.slice(0, 300) }, 502, cors);
    }
    const msg = await resp.json();
    if (msg.stop_reason === 'refusal')
      return json({ error: 'requête refusée par les filtres de sécurité' }, 502, cors);
    if (msg.stop_reason === 'max_tokens')
      return json({ error: 'réponse tronquée, réessayez avec un texte plus court' }, 502, cors);
    const text = (msg.content || []).find(b => b.type === 'text');
    try { return json(JSON.parse(text.text), 200, cors); }
    catch { return json({ error: 'réponse du modèle illisible' }, 502, cors); }
  }
};

function corsHeaders(origin, env) {
  const allowed = (env.ALLOWED_ORIGINS || 'https://savi168.github.io').split(',').map(s => s.trim());
  const ok = allowed.includes(origin) || allowed.includes('*');
  return {
    'Access-Control-Allow-Origin': ok ? origin : allowed[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-app-token'
  };
}
function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', ...cors } });
}
