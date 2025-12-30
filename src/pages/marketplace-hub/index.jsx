import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import NavigationSidebar from '../../components/ui/NavigationSidebar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import FeaturedCarousel from './components/FeaturedCarousel';
import CategoryFilter from './components/CategoryFilter';
import SearchBar from './components/SearchBar';
import IntegrationCard from './components/IntegrationCard';
import ConnectedIntegrationsPanel from './components/ConnectedIntegrationsPanel';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getMarketplaceIntegrations,
  getFeaturedIntegrations,
  getUserIntegrations,
  connectIntegration,
  disconnectIntegration
} from '../../services/marketplaceService';
import { trackEngagement } from '../../utils/analytics';

const MarketplaceHub = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Data state
  const [integrations, setIntegrations] = useState([]);
  const [featuredIntegrations, setFeaturedIntegrations] = useState([]);
  const [userIntegrations, setUserIntegrations] = useState([]);
  
  // Filter state
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pricingFilter, setPricingFilter] = useState('all');
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('discover'); // 'discover' or 'connected'

  // Fetch initial data
  useEffect(() => {
    loadData();
  }, [user?.id]);

  // Apply filters when they change
  useEffect(() => {
    if (!loading) {
      applyFilters();
    }
  }, [selectedCategory, searchQuery, pricingFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch featured integrations
      const featuredResult = await getFeaturedIntegrations();
      if (featuredResult?.success) {
        setFeaturedIntegrations(featuredResult?.data || []);
      }

      // Fetch all integrations
      const integrationsResult = await getMarketplaceIntegrations();
      if (integrationsResult?.success) {
        setIntegrations(integrationsResult?.data || []);
      }

      // Fetch user's connected integrations if logged in
      if (user?.id) {
        const userIntResult = await getUserIntegrations(user?.id);
        if (userIntResult?.success) {
          setUserIntegrations(userIntResult?.data || []);
        }
      }
    } catch (err) {
      console.error('Error loading marketplace data:', err);
      setError('Erreur lors du chargement des intégrations. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      const filters = {
        category: selectedCategory,
        pricing: pricingFilter,
        search: searchQuery
      };

      const result = await getMarketplaceIntegrations(filters);
      if (result?.success) {
        setIntegrations(result?.data || []);
      }
    } catch (err) {
      console.error('Error applying filters:', err);
    }
  };

  const handleConnectIntegration = async (integration) => {
    if (!user?.id) {
      navigate('/login');
      return;
    }

    trackEngagement?.marketplaceAction('connect_integration', integration?.name);

    try {
      const result = await connectIntegration(user?.id, integration?.id, {
        connectionName: `${integration?.name} - ${new Date()?.toLocaleDateString('fr-FR')}`,
        autoSync: true,
        syncFrequency: 60
      });

      if (result?.success) {
        // Refresh user integrations
        const userIntResult = await getUserIntegrations(user?.id);
        if (userIntResult?.success) {
          setUserIntegrations(userIntResult?.data || []);
        }
        
        // Show success message (you could add a toast notification here)
        alert(`${integration?.name} connecté avec succès !`);
      } else {
        alert(`Erreur lors de la connexion: ${result?.error}`);
      }
    } catch (err) {
      console.error('Error connecting integration:', err);
      alert('Erreur lors de la connexion. Veuillez réessayer.');
    }
  };

  const handleDisconnectIntegration = async (userIntegration) => {
    if (!confirm(`Êtes-vous sûr de vouloir déconnecter ${userIntegration?.integration?.name} ?`)) {
      return;
    }

    trackEngagement?.marketplaceAction('disconnect_integration', userIntegration?.integration?.name);

    try {
      const result = await disconnectIntegration(userIntegration?.id);

      if (result?.success) {
        // Refresh user integrations
        const userIntResult = await getUserIntegrations(user?.id);
        if (userIntResult?.success) {
          setUserIntegrations(userIntResult?.data || []);
        }
        
        alert('Intégration déconnectée avec succès.');
      } else {
        alert(`Erreur lors de la déconnexion: ${result?.error}`);
      }
    } catch (err) {
      console.error('Error disconnecting integration:', err);
      alert('Erreur lors de la déconnexion. Veuillez réessayer.');
    }
  };

  const handleConfigureIntegration = (userIntegration) => {
    trackEngagement?.marketplaceAction('configure_integration', userIntegration?.integration?.name);
    // Navigate to integration settings or open modal
    alert('Configuration en cours de développement');
  };

  const handleViewLogs = (userIntegration) => {
    trackEngagement?.marketplaceAction('view_logs', userIntegration?.integration?.name);
    // Navigate to logs view or open modal
    alert('Visualisation des logs en cours de développement');
  };

  return (
    <>
      <Helmet>
        <title>Marketplace - ComptaFlow</title>
        <meta name="description" content="Découvrez et connectez des intégrations tierces pour étendre les capacités de ComptaFlow : banques, paiements, CRM, analytics et plus encore" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <NavigationSidebar 
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <main 
          className={`
            transition-smooth pt-20 lg:pt-0
            ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'}
          `}
        >
          <div className="p-4 md:p-6 lg:p-8">
            <BreadcrumbTrail />

            <div className="mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-semibold text-foreground mb-2">
                Marketplace d'Intégrations
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Étendez les capacités de ComptaFlow en connectant vos outils professionnels préférés
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-4 mb-6 border-b border-border">
              <button
                onClick={() => setActiveTab('discover')}
                className={`
                  px-4 py-2 font-medium transition-colors border-b-2
                  ${activeTab === 'discover' ?'text-primary border-primary' :'text-muted-foreground border-transparent hover:text-foreground'
                  }
                `}
              >
                Découvrir
              </button>
              <button
                onClick={() => setActiveTab('connected')}
                className={`
                  px-4 py-2 font-medium transition-colors border-b-2 flex items-center gap-2
                  ${activeTab === 'connected' ?'text-primary border-primary' :'text-muted-foreground border-transparent hover:text-foreground'
                  }
                `}
              >
                Mes Intégrations
                {userIntegrations?.length > 0 && (
                  <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                    {userIntegrations?.length}
                  </span>
                )}
              </button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Chargement des intégrations...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-6">
                <p className="text-error">{error}</p>
                <button
                  onClick={loadData}
                  className="mt-2 text-sm text-error hover:underline"
                >
                  Réessayer
                </button>
              </div>
            )}

            {/* Content */}
            {!loading && !error && (
              <>
                {activeTab === 'discover' ? (
                  <>
                    {/* Featured Carousel */}
                    {featuredIntegrations?.length > 0 && (
                      <div className="mb-8">
                        <FeaturedCarousel 
                          integrations={featuredIntegrations}
                          onConnect={handleConnectIntegration}
                        />
                      </div>
                    )}

                    {/* Search and Filters */}
                    <div className="grid lg:grid-cols-4 gap-6 mb-8">
                      <div className="lg:col-span-1">
                        <CategoryFilter 
                          selectedCategory={selectedCategory}
                          onCategoryChange={setSelectedCategory}
                        />
                        
                        <div className="mt-4 bg-surface border border-border rounded-lg p-4">
                          <h3 className="text-sm font-semibold text-foreground mb-3">
                            Tarification
                          </h3>
                          <div className="space-y-2">
                            {['all', 'free', 'freemium', 'paid_monthly', 'paid_annual']?.map((pricing) => (
                              <label key={pricing} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="pricing"
                                  value={pricing}
                                  checked={pricingFilter === pricing}
                                  onChange={(e) => setPricingFilter(e?.target?.value)}
                                  className="text-primary focus:ring-primary"
                                />
                                <span className="text-sm text-foreground">
                                  {pricing === 'all' ? 'Tous' :
                                   pricing === 'free' ? 'Gratuit' :
                                   pricing === 'freemium' ? 'Freemium' :
                                   pricing === 'paid_monthly'? 'Mensuel' : 'Annuel'}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-3">
                        <div className="mb-6">
                          <SearchBar 
                            onSearch={setSearchQuery}
                            placeholder="Rechercher par nom, fournisseur ou fonctionnalité..."
                          />
                        </div>

                        {/* Integration Cards Grid */}
                        {integrations?.length > 0 ? (
                          <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {integrations?.map((integration) => (
                              <IntegrationCard
                                key={integration?.id}
                                integration={integration}
                                onConnect={handleConnectIntegration}
                                userConnections={userIntegrations}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <p className="text-muted-foreground mb-2">
                              Aucune intégration trouvée
                            </p>
                            <button
                              onClick={() => {
                                setSelectedCategory('all');
                                setSearchQuery('');
                                setPricingFilter('all');
                              }}
                              className="text-primary hover:underline text-sm"
                            >
                              Réinitialiser les filtres
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  /* Connected Integrations Tab */
                  (<div className="max-w-4xl">
                    <ConnectedIntegrationsPanel
                      userIntegrations={userIntegrations}
                      onDisconnect={handleDisconnectIntegration}
                      onConfigure={handleConfigureIntegration}
                      onViewLogs={handleViewLogs}
                    />
                  </div>)
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default MarketplaceHub;