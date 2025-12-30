import React, { useState } from 'react';
import NavigationSidebar from '../../components/ui/NavigationSidebar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Button from '../../components/ui/Button';
import ClientCard from './components/ClientCard';
import ClientDetailsPanel from './components/ClientDetailsPanel';
import ClientFilters from './components/ClientFilters';
import AddClientModal from './components/AddClientModal';
import SearchBar from './components/SearchBar';
import Icon from '../../components/AppIcon';
import { trackFeature } from '../../utils/analytics';


const ClientManagement = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const mockClients = [
    {
      id: 1,
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
    },
    {
      id: 2,
      companyName: "Restaurant Le Gourmet",
      contactName: "Sophie Martin",
      email: "contact@legourmet-restaurant.fr",
      phone: "01 45 23 67 89",
      siret: "234 567 890 00023",
      vatNumber: "FR23456789012",
      billingAddress: "12 Rue de la Paix\n75002 Paris\nFrance",
      status: "active",
      outstandingBalance: 0.00,
      lastActivity: "22/12/2025",
      paymentTerms: "30 jours",
      creditLimit: 20000.00,
      totalInvoices: 36,
      paidInvoices: 36,
      pendingInvoices: 0,
      overdueInvoices: 0,
      recentInvoices: [
        { id: 1, number: "FAC-2025-0155", date: "18/12/2025", amount: 3200.00, status: "paid" },
        { id: 2, number: "FAC-2025-0148", date: "10/12/2025", amount: 2850.00, status: "paid" }
      ],
      paymentHistory: [
        { id: 1, amount: 3200.00, date: "22/12/2025", method: "Virement bancaire", invoiceNumber: "FAC-2025-0155" },
        { id: 2, amount: 2850.00, date: "15/12/2025", method: "Virement bancaire", invoiceNumber: "FAC-2025-0148" }
      ],
      documents: [
        { id: 1, name: "Contrat annuel 2025.pdf", date: "01/01/2025", size: "320 KB" }
      ],
      notes: [
        { id: 1, author: "Marie Dubois", date: "22/12/2025", content: "Excellent client. Paiements toujours à temps. Envisager une remise de fidélité." }
      ]
    },
    {
      id: 3,
      companyName: "Café des Arts",
      contactName: "Luc Bernard",
      email: "l.bernard@cafedesarts.fr",
      phone: "01 48 76 54 32",
      siret: "345 678 901 00034",
      vatNumber: "FR34567890123",
      billingAddress: "78 Boulevard Saint-Germain\n75005 Paris\nFrance",
      status: "overdue",
      outstandingBalance: 1850.00,
      lastActivity: "10/12/2025",
      paymentTerms: "30 jours",
      creditLimit: 10000.00,
      totalInvoices: 18,
      paidInvoices: 14,
      pendingInvoices: 2,
      overdueInvoices: 2,
      recentInvoices: [
        { id: 1, number: "FAC-2025-0140", date: "28/11/2025", amount: 950.00, status: "overdue" },
        { id: 2, number: "FAC-2025-0135", date: "15/11/2025", amount: 900.00, status: "overdue" },
        { id: 3, number: "FAC-2025-0125", date: "01/11/2025", amount: 750.00, status: "paid" }
      ],
      paymentHistory: [
        { id: 1, amount: 750.00, date: "10/11/2025", method: "Chèque", invoiceNumber: "FAC-2025-0125" }
      ],
      documents: [
        { id: 1, name: "Contrat de service.pdf", date: "15/06/2025", size: "195 KB" }
      ],
      notes: [
        { id: 1, author: "Jean Martin", date: "18/12/2025", content: "Relance envoyée pour les factures en retard. Client a promis un paiement avant fin décembre." },
        { id: 2, author: "Marie Dubois", date: "10/12/2025", content: "Difficultés financières temporaires signalées. Surveiller de près." }
      ]
    },
    {
      id: 4,
      companyName: "Hôtel Belle Vue",
      contactName: "Claire Rousseau",
      email: "direction@hotel-bellevue.fr",
      phone: "01 53 42 18 90",
      siret: "456 789 012 00045",
      vatNumber: "FR45678901234",
      billingAddress: "25 Rue du Faubourg Saint-Honoré\n75008 Paris\nFrance",
      status: "active",
      outstandingBalance: 4200.00,
      lastActivity: "24/12/2025",
      paymentTerms: "45 jours",
      creditLimit: 30000.00,
      totalInvoices: 42,
      paidInvoices: 38,
      pendingInvoices: 4,
      overdueInvoices: 0,
      recentInvoices: [
        { id: 1, number: "FAC-2025-0158", date: "20/12/2025", amount: 4200.00, status: "pending" },
        { id: 2, number: "FAC-2025-0150", date: "12/12/2025", amount: 3800.00, status: "paid" }
      ],
      paymentHistory: [
        { id: 1, amount: 3800.00, date: "24/12/2025", method: "Virement bancaire", invoiceNumber: "FAC-2025-0150" }
      ],
      documents: [
        { id: 1, name: "Contrat cadre 2025-2027.pdf", date: "01/01/2025", size: "450 KB" },
        { id: 2, name: "Avenant n°1.pdf", date: "15/06/2025", size: "120 KB" }
      ],
      notes: [
        { id: 1, author: "Marie Dubois", date: "24/12/2025", content: "Gros client stratégique. Excellent historique de paiement. Renouvellement du contrat prévu en janvier 2026." }
      ]
    },
    {
      id: 5,
      companyName: "Traiteur Saveurs",
      contactName: "Marc Lefebvre",
      email: "m.lefebvre@traiteur-saveurs.fr",
      phone: "01 47 89 23 45",
      siret: "567 890 123 00056",
      vatNumber: "FR56789012345",
      billingAddress: "33 Avenue de l'Opéra\n75002 Paris\nFrance",
      status: "inactive",
      outstandingBalance: 0.00,
      lastActivity: "15/09/2025",
      paymentTerms: "30 jours",
      creditLimit: 8000.00,
      totalInvoices: 12,
      paidInvoices: 12,
      pendingInvoices: 0,
      overdueInvoices: 0,
      recentInvoices: [
        { id: 1, number: "FAC-2025-0095", date: "01/09/2025", amount: 1200.00, status: "paid" },
        { id: 2, number: "FAC-2025-0082", date: "15/08/2025", amount: 950.00, status: "paid" }
      ],
      paymentHistory: [
        { id: 1, amount: 1200.00, date: "15/09/2025", method: "Virement bancaire", invoiceNumber: "FAC-2025-0095" }
      ],
      documents: [
        { id: 1, name: "Contrat de service.pdf", date: "01/03/2025", size: "210 KB" }
      ],
      notes: [
        { id: 1, author: "Jean Martin", date: "20/09/2025", content: "Client inactif depuis 3 mois. Envoyer une relance commerciale pour réactivation." }
      ]
    },
    {
      id: 6,
      companyName: "Épicerie Fine Deluxe",
      contactName: "Isabelle Moreau",
      email: "contact@epicerie-deluxe.fr",
      phone: "01 56 34 78 90",
      siret: "678 901 234 00067",
      vatNumber: "FR67890123456",
      billingAddress: "18 Rue de Rivoli\n75004 Paris\nFrance",
      status: "active",
      outstandingBalance: 1650.00,
      lastActivity: "23/12/2025",
      paymentTerms: "30 jours",
      creditLimit: 12000.00,
      totalInvoices: 28,
      paidInvoices: 25,
      pendingInvoices: 3,
      overdueInvoices: 0,
      recentInvoices: [
        { id: 1, number: "FAC-2025-0157", date: "18/12/2025", amount: 1650.00, status: "pending" },
        { id: 2, number: "FAC-2025-0149", date: "08/12/2025", amount: 1420.00, status: "paid" }
      ],
      paymentHistory: [
        { id: 1, amount: 1420.00, date: "23/12/2025", method: "Carte bancaire", invoiceNumber: "FAC-2025-0149" }
      ],
      documents: [
        { id: 1, name: "Contrat annuel.pdf", date: "01/02/2025", size: "280 KB" }
      ],
      notes: [
        { id: 1, author: "Marie Dubois", date: "23/12/2025", content: "Bon client régulier. Commandes fréquentes et paiements ponctuels." }
      ]
    }
  ];

  const filteredClients = mockClients?.filter(client => {
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
      // ... existing add client logic ...
      trackFeature?.client?.add();
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  const handleViewClient = (client) => {
    setSelectedClient(client);
    trackFeature?.client?.view();
  };

  const handleEditClient = (client) => {
    // ... existing edit logic ...
    trackFeature?.client?.edit();
  };

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
                <p className="text-2xl md:text-3xl font-bold text-foreground">48</p>
                <p className="text-xs text-success mt-1">+6 ce mois</p>
              </div>

              <div className="bg-card border border-border rounded-lg p-4 md:p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Clients actifs</p>
                  <Icon name="CheckCircle" size={20} color="var(--color-success)" />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-foreground">42</p>
                <p className="text-xs text-muted-foreground mt-1">87.5% du total</p>
              </div>

              <div className="bg-card border border-border rounded-lg p-4 md:p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Solde total impayé</p>
                  <Icon name="AlertCircle" size={20} color="var(--color-warning)" />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-foreground">10 150 €</p>
                <p className="text-xs text-error mt-1">8 factures en retard</p>
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
        </main>
      </div>
      {selectedClient && (
        <ClientDetailsPanel
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onEdit={() => console.log('Modifier le client:', selectedClient?.id)}
        />
      )}
      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddClient}
      />
    </div>
  );
};

export default ClientManagement;