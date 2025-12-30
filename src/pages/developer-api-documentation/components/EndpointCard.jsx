import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Filter } from 'lucide-react';

const EndpointCard = ({ onSelectEndpoint }) => {
  const [expandedCategory, setExpandedCategory] = useState('invoices');
  const [filterMethod, setFilterMethod] = useState('all');

  const endpoints = {
    invoices: {
      label: 'Factures',
      color: 'blue',
      endpoints: [
        {
          method: 'GET',
          path: '/api/v2/invoices',
          description: 'Récupérer la liste des factures',
          params: ['page', 'limit', 'status', 'client_id'],
        },
        {
          method: 'GET',
          path: '/api/v2/invoices/{id}',
          description: 'Récupérer une facture spécifique',
          params: ['id'],
        },
        {
          method: 'POST',
          path: '/api/v2/invoices',
          description: 'Créer une nouvelle facture',
          params: ['client_id', 'items', 'due_date'],
        },
        {
          method: 'PUT',
          path: '/api/v2/invoices/{id}',
          description: 'Mettre à jour une facture',
          params: ['id', 'status', 'items'],
        },
        {
          method: 'DELETE',
          path: '/api/v2/invoices/{id}',
          description: 'Supprimer une facture',
          params: ['id'],
        },
      ],
    },
    clients: {
      label: 'Clients',
      color: 'green',
      endpoints: [
        {
          method: 'GET',
          path: '/api/v2/clients',
          description: 'Liste tous les clients',
          params: ['page', 'limit', 'search'],
        },
        {
          method: 'POST',
          path: '/api/v2/clients',
          description: 'Créer un nouveau client',
          params: ['name', 'siret', 'email'],
        },
        {
          method: 'PUT',
          path: '/api/v2/clients/{id}',
          description: 'Modifier un client',
          params: ['id', 'name', 'email'],
        },
      ],
    },
    expenses: {
      label: 'Dépenses',
      color: 'purple',
      endpoints: [
        {
          method: 'GET',
          path: '/api/v2/expenses',
          description: 'Récupérer les dépenses',
          params: ['date_from', 'date_to', 'category'],
        },
        {
          method: 'POST',
          path: '/api/v2/expenses',
          description: 'Enregistrer une dépense',
          params: ['amount', 'category', 'date'],
        },
      ],
    },
    payments: {
      label: 'Paiements',
      color: 'yellow',
      endpoints: [
        {
          method: 'GET',
          path: '/api/v2/payments',
          description: 'Liste des paiements',
          params: ['invoice_id', 'status'],
        },
        {
          method: 'POST',
          path: '/api/v2/payments',
          description: 'Enregistrer un paiement',
          params: ['invoice_id', 'amount', 'method'],
        },
      ],
    },
    reports: {
      label: 'Rapports',
      color: 'red',
      endpoints: [
        {
          method: 'GET',
          path: '/api/v2/reports/balance-sheet',
          description: 'Bilan comptable',
          params: ['year', 'format'],
        },
        {
          method: 'GET',
          path: '/api/v2/reports/profit-loss',
          description: 'Compte de résultat',
          params: ['date_from', 'date_to'],
        },
      ],
    },
  };

  const getMethodColor = (method) => {
    const colors = {
      GET: 'bg-blue-100 text-blue-700',
      POST: 'bg-green-100 text-green-700',
      PUT: 'bg-yellow-100 text-yellow-700',
      DELETE: 'bg-red-100 text-red-700',
    };
    return colors?.[method] || 'bg-gray-100 text-gray-700';
  };

  const filteredEndpoints = Object.entries(endpoints)?.reduce((acc, [key, category]) => {
    const filtered = category?.endpoints?.filter(
      (endpoint) => filterMethod === 'all' || endpoint?.method === filterMethod
    );
    if (filtered?.length > 0) {
      acc[key] = { ...category, endpoints: filtered };
    }
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Points de terminaison API</h2>
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e?.target?.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Toutes les méthodes</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>
      </div>
      {Object.entries(filteredEndpoints)?.map(([key, category]) => (
        <div key={key} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={() => setExpandedCategory(expandedCategory === key ? null : key)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              {expandedCategory === key ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
              <span
                className={`w-3 h-3 rounded-full bg-${category?.color}-500`}
              />
              <h3 className="font-semibold text-gray-900">{category?.label}</h3>
              <span className="text-sm text-gray-500">
                ({category?.endpoints?.length} endpoint{category?.endpoints?.length > 1 ? 's' : ''})
              </span>
            </div>
          </button>

          {expandedCategory === key && (
            <div className="border-t border-gray-200">
              {category?.endpoints?.map((endpoint, index) => (
                <div
                  key={index}
                  className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${getMethodColor(
                        endpoint?.method
                      )}`}
                    >
                      {endpoint?.method}
                    </span>
                    <div className="flex-1">
                      <code className="text-sm font-mono text-gray-900 font-semibold">
                        {endpoint?.path}
                      </code>
                      <p className="text-sm text-gray-600 mt-1">{endpoint?.description}</p>
                      {endpoint?.params && endpoint?.params?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {endpoint?.params?.map((param) => (
                            <span
                              key={param}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono"
                            >
                              {param}
                            </span>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => onSelectEndpoint(endpoint)}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Tester dans la console →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default EndpointCard;