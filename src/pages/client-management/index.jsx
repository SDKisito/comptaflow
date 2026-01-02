import React, { useState, useEffect } from 'react';
import NavigationSidebar from '../../components/ui/NavigationSidebar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Button from '../../components/ui/Button';
import ClientCard from './components/ClientCard';
import ClientDetailsPanel from './components/ClientDetailsPanel';
import ClientFilters from './components/ClientFilters';
import AddClientModal from './components/AddClientModal';
import EditClientModal from './components/EditClientModal';
import SearchBar from './components/SearchBar';
import Icon from '../../components/AppIcon';
import { trackFeature } from '../../utils/analytics';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';


const ClientManagement = () => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState(null);
  const [realClients, setRealClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les clients depuis Supabase
  useEffect(() => {
    if (user?.id) {
      loadClients();
    }
  }, [user]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transformez les données pour correspondre au format attendu
      const transformedClients = (data || []).map(client => ({
        id: client.id,
        companyName: client.name || client.company_name || 'Sans nom',
        contactName: client.first_name && client.last_name 
          ? `${client.first_name} ${client.last_name}` 
          : client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        siret: client.siret || '',
        vatNumber: client.vat_number || '',
        billingAddress: client.address || '',
        status: client.is_active ? 'active' : 'inactive',
        outstandingBalance: 0,
        lastActivity: new Date(client.created_at).toLocaleDateString('fr-FR'),
        paymentTerms: '30 jours',
        creditLimit: 0,
        totalInvoices: 0,
        paidInvoices: 0,
        pendingInvoices: 0,
        overdueInvoices: 0,
        recentInvoices: [],
        paymentHistory: [],
        documents: [],
        notes: []
      }));
      
      setRealClients(transformedClients);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const mockClients = [
    {
      id: 'mock-1',
      companyName: "SARL Boulangerie Moderne",
      contactName: "Pierre Dubois",
      email: "p.dubois@boulangerie-moderne.fr",
      phone: "01 42 68 53 21",
      siret: "123 456 789 00012",
      vatNumber: "FR12345678901",
      billingAddress: "45 Avenue des Champs-Élysées\n75008 Paris\nFrance",
      status: "active",
      outstandingBalance: 2450.00,
      lastActivity: "23/12/2025",
      paymentTerms: "30 jours",
      creditLimit: 15000.00,
      totalInvoices: 24,
      paidInvoices: 20,
      pendingInvoices: 3,
      overdueInvoices: 1,
      recentInvoices: [
        { id: 1, number: "FAC-2025-0156", date: "15/12/2025", amount: 1250.00, status: "paid" },
        { id: 2, number: "FAC-2025-0142", date: "01/12/2025", amount: 850.00, status: "pending" },
        { id: 3, number: "FAC-2025-0128", date: "15/11/2025", amount: 350.00, status: "overdue" }
      ],
      paymentHistory: [
        { id: 1, amount: 1250.00, date: "20/12/2025", method: "Virement bancaire", invoiceNumber: "FAC-2025-0156" },
        { id: 2, amount: 980.00, date: "05/12/2025", method: "Carte bancaire", invoiceNumber: "FAC-2025-0145" }
      ],
      documents: [
        { id: 1, name: "Contrat de service 2025.pdf", date: "01/01/2025", size: "245 KB" },
        { id: 2, name: "Conditions générales.pdf", date: "01/01/2025", size: "180 KB" }
      ],
      notes: [
        { id: 1, author: "Marie Dubois", date: "20/12/2025", content: "Client très satisfait du service. Demande une augmentation de la limite de crédit." },
        { id: 2, author: "Jean Martin", date: "15/12/2025", content: "Paiement reçu pour la facture FAC-2025-0156. Aucun problème signalé." }
      ]
    }
  ];

  // Combiner les clients mockés et réels
  const allClients = [...mockClients, ...realClients];

  const filteredClients = allClients?.filter(client => {
    const matchesFilter = activeFilter === 'all' || client?.status === activeFilter;
    const matchesSearch = 
      client?.companyName?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      client?.contactName?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      client?.email?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      client?.siret?.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const sortedClients = [...filteredClients]?.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a?.companyName?.localeCompare(b?.companyName);
      case 'balance':
        return b?.outstandingBalance - a?.outstandingBalance;
      case 'activity':
        return new Date(b.lastActivity.split('/').reverse().join('-')) - new Date(a.lastActivity.split('/').reverse().join('-'));
      case 'created':
        return b?.id - a?.id;
      default:
        return 0;
    }
  });

  const handleAddClient = async (clientData) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          user_id: user?.id,
          name: clientData.companyName,
          email: clientData.email,
          phone: clientData.phone,
          siret: clientData.siret,
          address: clientData.billingAddress,
          city: '',
          postal_code: '',
          country: 'France',
          is_active: true
        }])
        .select();

      if (error) throw error;
      
      alert('Client créé avec succès !');
      await loadClients();
      setIsAddModalOpen(false);
      trackFeature?.client?.add();
    } catch (error) {
      console.error('Error adding client:', error);
      alert('Erreur lors de la création du client: ' + error.message);
    }
  };

  const handleViewClient = (client) => {
    setSelectedClient(client);
    trackFeature?.client?.view();
  };

  const handleEditClient = (client) => {
    // Vérifier si c'est un client mocké
    if (typeof client.id === 'string' && client.id.startsWith('mock-')) {
      alert('Ce client est en lecture seule (données de démonstration)');
      return;
    }
    
    setClientToEdit(client);
    setIsEditModalOpen(true);
    trackFeature?.client?.edit();
  };

  const handleSaveEdit = async (clientData) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update({
          name: clientData.companyName,
          email: clientData.email,
          phone: clientData.phone,
          siret: clientData.siret,
          address: clientData.billingAddress,
          is_active: clientData.status === 'active'
        })
        .eq('id', clientToEdit.id)
        .eq('user_id', user?.id)
        .select();

      if (error) throw error;
      
      alert('Client modifié avec succès !');
      await loadClients();
      setIsEditModalOpen(false);
      setClientToEdit(null);
      setSelectedClient(null); // Fermer le panel de détails
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Erreur lors de la modification du client: ' + error.message);
    }
  };

  // Calcul des statistiques avec les vrais clients
  const totalClients = allClients.length;
  const activeClients = allClients.filter(c => c.status === 'active').length;
  const totalOutstanding = allClients.reduce((sum, c) => sum + (c.outstandingBalance || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <NavigationSidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      <div className={`transition-smooth ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'}`}>
        <main className="p-4 md:p-6 lg:p-8">
          <BreadcrumbTrail />

          <div className="mb-6 md:mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h1 className="font-heading font-bold text-2xl md:text-3xl lg:text-4xl text-foreground mb-2">
                  Gestion des clients
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  Gérez votre base de données clients et suivez les relations commerciales
                </p>
              </div>
              <Button 
                variant="default" 
                size="lg" 
                iconName="Plus" 
                iconPosition="left"
                onClick={() => setIsAddModalOpen(true)}
              >
                Nouveau client
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-card border border-border rounded-lg p-4 md:p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Total clients</p>
                  <Icon name="Users" size={20} color="var(--color-primary)" />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-foreground">{totalClients}</p>
                <p className="text-xs text-success mt-1">{realClients.length} réels</p>
              </div>

              <div className="bg-card border border-border rounded-lg p-4 md:p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Clients actifs</p>
                  <Icon name="CheckCircle" size={20} color="var(--color-success)" />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-foreground">{activeClients}</p>
                <p className="text-xs text-muted-foreground mt-1">{totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 0}% du total</p>
              </div>

              <div className="bg-card border border-border rounded-lg p-4 md:p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Solde total impayé</p>
                  <Icon name="AlertCircle" size={20} color="var(--color-warning)" />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-foreground">{totalOutstanding.toLocaleString('fr-FR')} €</p>
                <p className="text-xs text-error mt-1">Basé sur données mockées</p>
              </div>

              <div className="bg-card border border-border rounded-lg p-4 md:p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Revenus ce mois</p>
                  <Icon name="TrendingUp" size={20} color="var(--color-success)" />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-foreground">45 280 €</p>
                <p className="text-xs text-success mt-1">+12.5% vs mois dernier</p>
              </div>
            </div>

            <ClientFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
          </div>

          <div className="mb-6">
            <SearchBar 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Chargement des clients...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
                {sortedClients?.map((client) => (
                  <ClientCard
                    key={client?.id}
                    client={client}
                    onSelect={setSelectedClient}
                    isSelected={selectedClient?.id === client?.id}
                  />
                ))}
              </div>

              {sortedClients?.length === 0 && (
                <div className="text-center py-12 md:py-16">
                  <Icon name="Users" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
                  <h3 className="font-heading font-semibold text-lg md:text-xl text-foreground mb-2">
                    Aucun client trouvé
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-6">
                    Essayez de modifier vos critères de recherche ou de filtrage
                  </p>
                  <Button variant="outline" iconName="RefreshCw" iconPosition="left" onClick={() => {
                    setSearchQuery('');
                    setActiveFilter('all');
                  }}>
                    Réinitialiser les filtres
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {selectedClient && (
        <ClientDetailsPanel
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onEdit={handleEditClient}
        />
      )}

      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddClient}
      />

      <EditClientModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setClientToEdit(null);
        }}
        onSave={handleSaveEdit}
        client={clientToEdit}
      />
    </div>
  );
};

export default ClientManagement;
