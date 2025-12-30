import React, { useState } from 'react';
import { Shield, Key, AlertTriangle } from 'lucide-react';
import CodeBlock from './CodeBlock';

const AuthenticationGuide = () => {
  const [activeTab, setActiveTab] = useState('oauth');

  const oauthExample = `// Étape 1: Rediriger l'utilisateur vers l'autorisation
const authUrl = 'https://api.comptaflow.com/oauth/authorize';
const params = {
  client_id: 'votre_client_id',
  redirect_uri: 'https://votre-app.com/callback',
  response_type: 'code',
  scope: 'invoices:read invoices:write clients:read'
};

window.location.href = authUrl + '?' + new URLSearchParams(params);

// Étape 2: Échanger le code contre un token
const response = await fetch('https://api.comptaflow.com/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'authorization_code',
    code: 'code_reçu_du_callback',
    client_id: 'votre_client_id',
    client_secret: 'votre_client_secret',
    redirect_uri: 'https://votre-app.com/callback'
  })
});

const { access_token, refresh_token } = await response.json();`;

  const apiKeyExample = `// Utilisation de la clé API dans les requêtes
const response = await fetch('https://api.comptaflow.com/api/v2/invoices', {
  headers: {
    'Authorization': 'Bearer votre_api_key',
    'Content-Type': 'application/json'
  }
});

const invoices = await response.json();`;

  const webhookExample = `// Configuration du webhook
const webhookConfig = {
  url: 'https://votre-app.com/webhooks/comptaflow',
  events: [
    'invoice.created',
    'invoice.paid',
    'payment.received'
  ],
  secret: 'votre_secret_webhook'
};

// Vérification de la signature du webhook
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

// Gestionnaire de webhook
app.post('/webhooks/comptaflow', (req, res) => {
  const signature = req.headers['x-comptaflow-signature'];
  const payload = JSON.stringify(req.body);
  
  if (!verifyWebhookSignature(payload, signature, webhookConfig.secret)) {
    return res.status(401).send('Signature invalide');
  }
  
  // Traiter l'événement
  const event = req.body;
  console.log('Événement reçu:', event.type, event.data);
  
  res.status(200).send('OK');
});`;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <Shield className="w-6 h-6 mr-2 text-blue-600" />
          Guide d'Authentification
        </h2>
        <p className="text-gray-700 mb-6">
          ComptaFlow prend en charge plusieurs méthodes d'authentification pour sécuriser vos intégrations.
        </p>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('oauth')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'oauth' ?'border-blue-600 text-blue-600' :'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            OAuth 2.0
          </button>
          <button
            onClick={() => setActiveTab('apikey')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'apikey' ?'border-blue-600 text-blue-600' :'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Clés API
          </button>
          <button
            onClick={() => setActiveTab('webhook')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'webhook' ?'border-blue-600 text-blue-600' :'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Webhooks
          </button>
        </div>

        {/* OAuth Content */}
        {activeTab === 'oauth' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Flux OAuth 2.0 (Recommandé)</h3>
              <p className="text-sm text-blue-800">
                Utilisez OAuth 2.0 pour permettre à vos utilisateurs d'autoriser l'accès à leurs données 
                ComptaFlow sans partager leurs identifiants.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Scopes disponibles</h4>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  'invoices:read - Lire les factures',
                  'invoices:write - Créer/modifier les factures',
                  'clients:read - Lire les clients',
                  'clients:write - Gérer les clients',
                  'expenses:read - Lire les dépenses',
                  'expenses:write - Enregistrer les dépenses',
                  'payments:read - Lire les paiements',
                  'payments:write - Enregistrer les paiements',
                ]?.map((scope) => (
                  <div key={scope} className="flex items-start space-x-2">
                    <Key className="w-4 h-4 text-gray-500 mt-0.5" />
                    <span className="text-sm text-gray-700">{scope}</span>
                  </div>
                ))}
              </div>
            </div>

            <CodeBlock code={oauthExample} language="javascript" />

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-900 mb-1">Sécurité</h4>
                  <p className="text-sm text-yellow-800">
                    Ne partagez jamais votre client_secret. Stockez-le de manière sécurisée côté serveur.
                    Les tokens d'accès expirent après 1 heure. Utilisez le refresh_token pour obtenir un nouveau token.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* API Key Content */}
        {activeTab === 'apikey' && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">Clés API</h3>
              <p className="text-sm text-green-800">
                Les clés API sont idéales pour les intégrations serveur-à-serveur où vous contrôlez 
                entièrement l'environnement d'exécution.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Générer une clé API</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Connectez-vous à votre compte ComptaFlow</li>
                <li>Accédez à Paramètres → Intégrations → Clés API</li>
                <li>Cliquez sur "Générer une nouvelle clé"</li>
                <li>Nommez votre clé et sélectionnez les permissions</li>
                <li>Copiez la clé immédiatement (elle ne sera plus affichée)</li>
              </ol>
            </div>

            <CodeBlock code={apiKeyExample} language="javascript" />

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900 mb-1">⚠️ Sécurité Critique</h4>
                  <ul className="text-sm text-red-800 space-y-1 mt-2">
                    <li>• Ne commitez JAMAIS vos clés API dans le contrôle de version</li>
                    <li>• Utilisez des variables d'environnement (.env)</li>
                    <li>• Renouvelez régulièrement vos clés</li>
                    <li>• Révoquez immédiatement toute clé compromise</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Webhook Content */}
        {activeTab === 'webhook' && (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2">Configuration des Webhooks</h3>
              <p className="text-sm text-purple-800">
                Recevez des notifications en temps réel lorsque des événements se produisent dans ComptaFlow.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Événements disponibles</h4>
              <div className="space-y-2">
                {[
                  { event: 'invoice.created', desc: 'Une nouvelle facture est créée' },
                  { event: 'invoice.updated', desc: 'Une facture est modifiée' },
                  { event: 'invoice.paid', desc: 'Une facture est marquée comme payée' },
                  { event: 'payment.received', desc: 'Un paiement est reçu' },
                  { event: 'client.created', desc: 'Un nouveau client est ajouté' },
                  { event: 'expense.created', desc: 'Une nouvelle dépense est enregistrée' },
                ]?.map((item) => (
                  <div key={item?.event} className="flex items-start space-x-3 p-2 bg-gray-50 rounded">
                    <code className="text-xs font-mono text-purple-600 bg-purple-100 px-2 py-1 rounded">
                      {item?.event}
                    </code>
                    <span className="text-sm text-gray-700">{item?.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <CodeBlock code={webhookExample} language="javascript" />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Bonnes pratiques</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Répondez rapidement (200 OK) pour éviter les tentatives multiples</li>
                <li>• Vérifiez toujours la signature du webhook</li>
                <li>• Traitez les événements de manière idempotente</li>
                <li>• Utilisez une file d'attente pour les traitements longs</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthenticationGuide;