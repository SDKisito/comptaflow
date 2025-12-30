import React, { useState } from 'react';
import { Database, ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';

const DataModelsReference = () => {
  const [expandedModel, setExpandedModel] = useState('invoice');

  const dataModels = {
    invoice: {
      label: 'Facture (Invoice)',
      description: 'Représente une facture émise à un client',
      fields: [
        { name: 'id', type: 'UUID', required: true, description: 'Identifiant unique' },
        { name: 'invoice_number', type: 'String', required: true, description: 'Numéro de facture (format: INV-YYYY-NNNN)' },
        { name: 'client_id', type: 'UUID', required: true, description: 'Référence vers le client' },
        { name: 'issue_date', type: 'Date', required: true, description: 'Date d\'émission (format: YYYY-MM-DD)' },
        { name: 'due_date', type: 'Date', required: true, description: 'Date d\'échéance' },
        { name: 'status', type: 'Enum', required: true, description: 'Statut: draft, sent, paid, overdue, cancelled' },
        { name: 'total_ht', type: 'Decimal(10,2)', required: true, description: 'Montant HT en euros' },
        { name: 'total_tva', type: 'Decimal(10,2)', required: true, description: 'Montant TVA' },
        { name: 'total_ttc', type: 'Decimal(10,2)', required: true, description: 'Montant TTC' },
        { name: 'items', type: 'Array[InvoiceItem]', required: true, description: 'Liste des lignes de facturation' },
        { name: 'created_at', type: 'Timestamp', required: false, description: 'Date de création' },
        { name: 'updated_at', type: 'Timestamp', required: false, description: 'Dernière modification' },
      ],
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        invoice_number: 'INV-2025-0042',
        client_id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        issue_date: '2025-01-15',
        due_date: '2025-02-15',
        status: 'sent',
        total_ht: 1500.00,
        total_tva: 300.00,
        total_ttc: 1800.00,
        items: [
          {
            description: 'Prestation de conseil',
            quantity: 10,
            unit_price: 150.00,
            tva_rate: 20.0
          }
        ]
      },
      validation: [
        'invoice_number doit être unique',
        'due_date doit être postérieure à issue_date',
        'total_ttc = total_ht + total_tva',
        'Format SIRET français requis pour client_id'
      ]
    },
    client: {
      label: 'Client',
      description: 'Représente un client de l\'entreprise',
      fields: [
        { name: 'id', type: 'UUID', required: true, description: 'Identifiant unique' },
        { name: 'name', type: 'String(255)', required: true, description: 'Nom ou raison sociale' },
        { name: 'siret', type: 'String(14)', required: true, description: 'Numéro SIRET (14 chiffres)' },
        { name: 'tva_number', type: 'String(13)', required: false, description: 'Numéro TVA intracommunautaire' },
        { name: 'email', type: 'String(255)', required: true, description: 'Email de contact' },
        { name: 'phone', type: 'String(20)', required: false, description: 'Téléphone' },
        { name: 'address', type: 'String(500)', required: true, description: 'Adresse complète' },
        { name: 'postal_code', type: 'String(10)', required: true, description: 'Code postal' },
        { name: 'city', type: 'String(100)', required: true, description: 'Ville' },
        { name: 'country', type: 'String(2)', required: true, description: 'Code pays (ISO 3166-1 alpha-2)' },
        { name: 'payment_terms', type: 'Integer', required: false, description: 'Délai de paiement en jours (défaut: 30)' },
      ],
      example: {
        id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        name: 'Entreprise Client SARL',
        siret: '12345678901234',
        tva_number: 'FR12345678901',
        email: 'contact@client.fr',
        phone: '+33123456789',
        address: '123 Rue de la République',
        postal_code: '75001',
        city: 'Paris',
        country: 'FR',
        payment_terms: 30
      },
      validation: [
        'SIRET doit contenir exactement 14 chiffres',
        'Format TVA: FRxx123456789 (FR + 2 chiffres + 9 chiffres)',
        'Email doit être valide',
        'country doit être un code ISO 3166-1 alpha-2'
      ]
    },
    expense: {
      label: 'Dépense (Expense)',
      description: 'Représente une dépense de l\'entreprise',
      fields: [
        { name: 'id', type: 'UUID', required: true, description: 'Identifiant unique' },
        { name: 'date', type: 'Date', required: true, description: 'Date de la dépense' },
        { name: 'category', type: 'String(100)', required: true, description: 'Catégorie comptable' },
        { name: 'description', type: 'String(500)', required: true, description: 'Description détaillée' },
        { name: 'amount_ht', type: 'Decimal(10,2)', required: true, description: 'Montant HT' },
        { name: 'tva_rate', type: 'Decimal(5,2)', required: true, description: 'Taux de TVA (%)' },
        { name: 'amount_ttc', type: 'Decimal(10,2)', required: true, description: 'Montant TTC' },
        { name: 'payment_method', type: 'Enum', required: true, description: 'Mode: cash, card, transfer, check' },
        { name: 'receipt_url', type: 'String(500)', required: false, description: 'URL du justificatif' },
      ],
      example: {
        id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
        date: '2025-01-20',
        category: 'Fournitures de bureau',
        description: 'Achat de matériel informatique',
        amount_ht: 250.00,
        tva_rate: 20.0,
        amount_ttc: 300.00,
        payment_method: 'card',
        receipt_url: 'https://storage.comptaflow.com/receipts/abc123.pdf'
      },
      validation: [
        'amount_ttc = amount_ht * (1 + tva_rate/100)',
        'date ne peut pas être dans le futur',
        'receipt_url recommandé pour conformité fiscale'
      ]
    },
    payment: {
      label: 'Paiement (Payment)',
      description: 'Représente un paiement reçu ou effectué',
      fields: [
        { name: 'id', type: 'UUID', required: true, description: 'Identifiant unique' },
        { name: 'invoice_id', type: 'UUID', required: true, description: 'Référence vers la facture' },
        { name: 'amount', type: 'Decimal(10,2)', required: true, description: 'Montant du paiement' },
        { name: 'payment_date', type: 'Date', required: true, description: 'Date du paiement' },
        { name: 'payment_method', type: 'Enum', required: true, description: 'Mode: transfer, card, cash, check, stripe' },
        { name: 'reference', type: 'String(100)', required: false, description: 'Référence du paiement' },
        { name: 'status', type: 'Enum', required: true, description: 'Statut: pending, completed, failed, refunded' },
      ],
      example: {
        id: 'a3bb189e-8bf9-3888-9912-ace4e6543002',
        invoice_id: '550e8400-e29b-41d4-a716-446655440000',
        amount: 1800.00,
        payment_date: '2025-02-10',
        payment_method: 'transfer',
        reference: 'VIREMENT-20250210-001',
        status: 'completed'
      },
      validation: [
        'amount ne peut pas dépasser le montant TTC de la facture',
        'payment_date doit être >= invoice.issue_date',
        'Paiements partiels supportés (amount < invoice.total_ttc)'
      ]
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <Database className="w-6 h-6 mr-2 text-purple-600" />
          Modèles de Données
        </h2>
        <p className="text-gray-700 mb-6">
          Schémas détaillés des objets retournés par l'API avec leurs champs, types, et règles de validation.
        </p>

        <div className="space-y-4">
          {Object.entries(dataModels)?.map(([key, model]) => (
            <div key={key} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedModel(expandedModel === key ? null : key)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {expandedModel === key ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{model?.label}</h3>
                    <p className="text-sm text-gray-600">{model?.description}</p>
                  </div>
                </div>
              </button>

              {expandedModel === key && (
                <div className="p-6 space-y-6">
                  {/* Fields Table */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Champs</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Requis</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {model?.fields?.map((field) => (
                            <tr key={field?.name} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-mono text-purple-600">{field?.name}</td>
                              <td className="px-4 py-3 text-sm font-mono text-gray-600">{field?.type}</td>
                              <td className="px-4 py-3 text-sm">
                                {field?.required ? (
                                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">OUI</span>
                                ) : (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">Non</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">{field?.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Example */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Exemple JSON</h4>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{JSON.stringify(model?.example, null, 2)}</code>
                    </pre>
                  </div>

                  {/* Validation Rules */}
                  {model?.validation && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-yellow-900 mb-2">Règles de Validation</h4>
                          <ul className="space-y-1">
                            {model?.validation?.map((rule, index) => (
                              <li key={index} className="text-sm text-yellow-800">• {rule}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DataModelsReference;