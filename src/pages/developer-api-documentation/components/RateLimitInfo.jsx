import React from 'react';
import { Zap, AlertTriangle } from 'lucide-react';

const RateLimitInfo = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-start space-x-3 mb-4">
        <Zap className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Limites de Taux (Rate Limiting)</h3>
          <p className="text-sm text-gray-600 mt-1">
            ComptaFlow applique des limites de taux pour garantir la stabilité de l'API pour tous les utilisateurs.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="text-3xl font-bold text-blue-600 mb-1">5,000</div>
          <div className="text-sm text-gray-600">Requêtes / heure</div>
          <div className="text-xs text-gray-500 mt-1">Par clé API</div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <div className="text-3xl font-bold text-green-600 mb-1">50,000</div>
          <div className="text-sm text-gray-600">Requêtes / jour</div>
          <div className="text-xs text-gray-500 mt-1">Maximum quotidien</div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <div className="text-3xl font-bold text-purple-600 mb-1">10</div>
          <div className="text-sm text-gray-600">Requêtes / seconde</div>
          <div className="text-xs text-gray-500 mt-1">Burst autorisé</div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900">En-têtes de Rate Limit</h4>
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="flex items-start space-x-2">
            <code className="text-xs font-mono text-purple-600 bg-purple-100 px-2 py-1 rounded">
              X-RateLimit-Limit
            </code>
            <span className="text-sm text-gray-700">Nombre maximum de requêtes autorisées</span>
          </div>
          <div className="flex items-start space-x-2">
            <code className="text-xs font-mono text-purple-600 bg-purple-100 px-2 py-1 rounded">
              X-RateLimit-Remaining
            </code>
            <span className="text-sm text-gray-700">Nombre de requêtes restantes dans la fenêtre actuelle</span>
          </div>
          <div className="flex items-start space-x-2">
            <code className="text-xs font-mono text-purple-600 bg-purple-100 px-2 py-1 rounded">
              X-RateLimit-Reset
            </code>
            <span className="text-sm text-gray-700">Timestamp de réinitialisation de la limite (epoch Unix)</span>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-900 mb-1">Dépassement de limite</h4>
            <p className="text-sm text-yellow-800 mb-2">
              Si vous dépassez la limite, vous recevrez une réponse <code className="bg-yellow-100 px-1 py-0.5 rounded">429 Too Many Requests</code> avec un en-tête <code className="bg-yellow-100 px-1 py-0.5 rounded">Retry-After</code> indiquant le nombre de secondes à attendre.
            </p>
            <p className="text-sm text-yellow-800">
              Pour des limites plus élevées, contactez notre équipe à <a href="mailto:api-support@comptaflow.com" className="text-yellow-900 underline font-medium">api-support@comptaflow.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RateLimitInfo;