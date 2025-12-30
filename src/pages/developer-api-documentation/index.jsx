import React, { useState, useEffect } from 'react';
import { Search, Book, Code, Shield, Database, Zap, ExternalLink } from 'lucide-react';
import NavigationSidebar from './components/NavigationSidebar';
import EndpointCard from './components/EndpointCard';
import AuthenticationGuide from './components/AuthenticationGuide';
import DataModelsReference from './components/DataModelsReference';
import IntegrationExamples from './components/IntegrationExamples';
import APIConsole from './components/APIConsole';
import RateLimitInfo from './components/RateLimitInfo';

const DeveloperAPIDocumentation = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const sections = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Book },
    { id: 'authentication', label: 'Authentification', icon: Shield },
    { id: 'endpoints', label: 'Points de terminaison', icon: Code },
    { id: 'data-models', label: 'Modèles de données', icon: Database },
    { id: 'examples', label: 'Exemples d\'intégration', icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <Code className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Documentation API ComptaFlow</h1>
                <p className="text-sm text-gray-600 mt-1">Version 2.0 • REST API</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                API Active
              </span>
              <a
                href="https://status.comptaflow.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-blue-600 hover:text-blue-700"
              >
                Statut du service
                <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher dans la documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e?.target?.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </header>
      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar Navigation */}
        <NavigationSidebar
          sections={sections}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {activeSection === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Bienvenue dans l'API ComptaFlow</h2>
                <p className="text-gray-700 mb-4">
                  L'API REST ComptaFlow permet aux développeurs tiers d'intégrer nos fonctionnalités de comptabilité 
                  dans leurs applications. Cette documentation fournit toutes les informations nécessaires pour 
                  commencer rapidement.
                </p>

                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors">
                    <Shield className="w-8 h-8 text-blue-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Sécurisé & Conforme</h3>
                    <p className="text-sm text-gray-600">
                      OAuth 2.0, chiffrement TLS 1.3, et conformité RGPD complète
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors">
                    <Zap className="w-8 h-8 text-yellow-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Haute Performance</h3>
                    <p className="text-sm text-gray-600">
                      Temps de réponse &lt;200ms, 99.9% de disponibilité garantie
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors">
                    <Code className="w-8 h-8 text-green-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">RESTful & JSON</h3>
                    <p className="text-sm text-gray-600">
                      Architecture REST standard avec réponses JSON structurées
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors">
                    <Database className="w-8 h-8 text-purple-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Webhooks Temps Réel</h3>
                    <p className="text-sm text-gray-600">
                      Notifications instantanées pour les événements importants
                    </p>
                  </div>
                </div>
              </div>

              <RateLimitInfo />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">🚀 Démarrage Rapide</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                  <li>Créez un compte développeur sur le portail ComptaFlow</li>
                  <li>Générez vos clés API dans la section "Intégrations"</li>
                  <li>Testez vos requêtes avec notre console interactive</li>
                  <li>Intégrez nos exemples de code dans votre application</li>
                </ol>
              </div>
            </div>
          )}

          {activeSection === 'authentication' && (
            <AuthenticationGuide />
          )}

          {activeSection === 'endpoints' && (
            <EndpointCard onSelectEndpoint={setSelectedEndpoint} />
          )}

          {activeSection === 'data-models' && (
            <DataModelsReference />
          )}

          {activeSection === 'examples' && (
            <IntegrationExamples />
          )}

          {/* API Console Modal */}
          {selectedEndpoint && (
            <APIConsole
              endpoint={selectedEndpoint}
              onClose={() => setSelectedEndpoint(null)}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default DeveloperAPIDocumentation;