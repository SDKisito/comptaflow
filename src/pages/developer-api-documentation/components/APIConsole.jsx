import React, { useState } from 'react';
import { X, Play, Loader2 } from 'lucide-react';

const APIConsole = ({ endpoint, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [requestBody, setRequestBody] = useState('');

  const handleTestRequest = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Réponse simulée
      const mockResponse = {
        status: 200,
        headers: {
          'content-type': 'application/json',
          'x-ratelimit-remaining': '4998',
          'x-ratelimit-limit': '5000'
        },
        data: {
          success: true,
          message: 'Requête exécutée avec succès',
          data: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            created_at: new Date()?.toISOString()
          }
        }
      };

      setResponse(mockResponse);
    } catch (err) {
      setError({
        status: 500,
        message: err?.message || 'Erreur lors de l\'exécution de la requête'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Console API Interactive</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                endpoint?.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                endpoint?.method === 'POST' ? 'bg-green-100 text-green-700' :
                endpoint?.method === 'PUT'? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
              }`}>
                {endpoint?.method}
              </span>
              <code className="text-sm font-mono text-gray-700">{endpoint?.path}</code>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Request Body (for POST/PUT) */}
          {(endpoint?.method === 'POST' || endpoint?.method === 'PUT') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Corps de la requête (JSON)
              </label>
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e?.target?.value)}
                placeholder={`{\n  "example": "value"\n}`}
                className="w-full h-40 p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Execute Button */}
          <div>
            <button
              onClick={handleTestRequest}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Exécution...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Exécuter la requête</span>
                </>
              )}
            </button>
          </div>

          {/* Response */}
          {response && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-gray-900">Réponse</h4>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                  {response?.status} OK
                </span>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-100">
                  <code>{JSON.stringify(response?.data, null, 2)}</code>
                </pre>
              </div>

              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">En-têtes de réponse</h5>
                <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                  {Object.entries(response?.headers)?.map(([key, value]) => (
                    <div key={key} className="flex text-xs">
                      <span className="font-mono text-gray-600 w-1/3">{key}:</span>
                      <span className="font-mono text-gray-800">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                  {error?.status} ERROR
                </span>
              </div>
              <p className="text-sm text-red-800">{error?.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default APIConsole;