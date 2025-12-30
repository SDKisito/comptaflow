import React, { useState, useMemo } from 'react';
import NavigationSidebar from '../../components/ui/NavigationSidebar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { Checkbox } from '../../components/ui/Checkbox';

import InvoiceFilterPanel from './components/InvoiceFilterPanel';
import InvoiceTableRow from './components/InvoiceTableRow';
import InvoicePreviewPanel from './components/InvoicePreviewPanel';
import InvoiceMobileCard from './components/InvoiceMobileCard';
import BulkActionsBar from './components/BulkActionsBar';
import InvoiceStatsCards from './components/InvoiceStatsCards';

import { trackFeature, trackEngagement } from '../../utils/analytics';

const InvoiceManagement = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    invoiceNumber: '',
    client: 'all',
    status: 'all',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    search: ''
  });

  const mockInvoices = [
    {
      id: 1,
      invoiceNumber: 'FAC-2024-001',
      clientName: 'Entreprise Martin SARL',
      clientEmail: 'contact@martin-sarl.fr',
      clientAddress: '45 Avenue des Champs-Élysées, 75008 Paris',
      issueDate: '2024-12-01',
      dueDate: '2024-12-31',
      amount: 2500.00,
      tvaRate: 20,
      status: 'Payée',
      items: [
        { description: 'Consultation comptable mensuelle', quantity: 1, unitPrice: 1500.00, total: 1500.00 },
        { description: 'Déclaration TVA trimestrielle', quantity: 1, unitPrice: 1000.00, total: 1000.00 }
      ],
      paymentHistory: [
        { date: '2024-12-15', amount: 3000.00, method: 'Virement bancaire' }
      ],
      notes: 'Paiement reçu avec remerciements. Prochain rendez-vous prévu en janvier 2025.'
    },
    {
      id: 2,
      invoiceNumber: 'FAC-2024-002',
      clientName: 'Société Dupont & Fils',
      clientEmail: 'admin@dupont-fils.fr',
      clientAddress: '12 Rue de la République, 69002 Lyon',
      issueDate: '2024-12-05',
      dueDate: '2025-01-05',
      amount: 4800.00,
      tvaRate: 20,
      status: 'Envoyée',
      items: [
        { description: 'Audit comptable annuel', quantity: 1, unitPrice: 3500.00, total: 3500.00 },
        { description: 'Formation fiscalité', quantity: 2, unitPrice: 650.00, total: 1300.00 }
      ],
      notes: 'Facture envoyée par email le 05/12/2024. Rappel automatique prévu le 20/12/2024.'
    },
    {
      id: 3,
      invoiceNumber: 'FAC-2024-003',
      clientName: 'Cabinet Lefebvre',
      clientEmail: 'contact@cabinet-lefebvre.fr',
      clientAddress: '78 Boulevard Haussmann, 75009 Paris',
      issueDate: '2024-11-20',
      dueDate: '2024-12-20',
      amount: 1850.00,
      tvaRate: 20,
      status: 'En retard',
      items: [
        { description: 'Gestion de paie mensuelle', quantity: 1, unitPrice: 1200.00, total: 1200.00 },
        { description: 'Déclarations sociales', quantity: 1, unitPrice: 650.00, total: 650.00 }
      ],
      notes: 'Paiement en retard de 4 jours. Relance envoyée le 21/12/2024.'
    },
    {
      id: 4,
      invoiceNumber: 'FAC-2024-004',
      clientName: 'Boutique Bernard',
      clientEmail: 'info@boutique-bernard.fr',
      clientAddress: '34 Rue du Commerce, 33000 Bordeaux',
      issueDate: '2024-12-10',
      dueDate: '2025-01-10',
      amount: 3200.00,
      tvaRate: 20,
      status: 'Partiellement payée',
      items: [
        { description: 'Tenue de comptabilité trimestrielle', quantity: 1, unitPrice: 2400.00, total: 2400.00 },
        { description: 'Conseil en gestion', quantity: 1, unitPrice: 800.00, total: 800.00 }
      ],
      paymentHistory: [
        { date: '2024-12-18', amount: 1600.00, method: 'Chèque' }
      ],
      notes: 'Paiement partiel reçu. Solde restant: 1 920,00 € TTC.'
    },
    {
      id: 5,
      invoiceNumber: 'FAC-2024-005',
      clientName: 'Restaurant Le Gourmet',
      clientEmail: 'direction@legourmet.fr',
      clientAddress: '56 Quai des Belges, 13001 Marseille',
      issueDate: '2024-12-15',
      dueDate: '2025-01-15',
      amount: 2100.00,
      tvaRate: 20,
      status: 'Envoyée',
      items: [
        { description: 'Comptabilité mensuelle restaurant', quantity: 1, unitPrice: 1500.00, total: 1500.00 },
        { description: 'Gestion TVA restauration', quantity: 1, unitPrice: 600.00, total: 600.00 }
      ],
      notes: 'Facture envoyée le 15/12/2024. Client habituel avec historique de paiement ponctuel.'
    },
    {
      id: 6,
      invoiceNumber: 'FAC-2024-006',
      clientName: 'Entreprise Martin SARL',
      clientEmail: 'contact@martin-sarl.fr',
      clientAddress: '45 Avenue des Champs-Élysées, 75008 Paris',
      issueDate: '2024-12-18',
      dueDate: '2025-01-18',
      amount: 1750.00,
      tvaRate: 20,
      status: 'Brouillon',
      items: [
        { description: 'Consultation stratégie fiscale', quantity: 1, unitPrice: 1200.00, total: 1200.00 },
        { description: 'Analyse financière', quantity: 1, unitPrice: 550.00, total: 550.00 }
      ],
      notes: 'Brouillon en cours de finalisation. À envoyer après validation client.'
    },
    {
      id: 7,
      invoiceNumber: 'FAC-2024-007',
      clientName: 'Société Dupont & Fils',
      clientEmail: 'admin@dupont-fils.fr',
      clientAddress: '12 Rue de la République, 69002 Lyon',
      issueDate: '2024-11-15',
      dueDate: '2024-12-15',
      amount: 5600.00,
      tvaRate: 20,
      status: 'En retard',
      items: [
        { description: 'Bilan comptable annuel', quantity: 1, unitPrice: 4200.00, total: 4200.00 },
        { description: 'Liasse fiscale', quantity: 1, unitPrice: 1400.00, total: 1400.00 }
      ],
      notes: 'Paiement en retard de 9 jours. Deuxième relance envoyée.'
    },
    {
      id: 8,
      invoiceNumber: 'FAC-2024-008',
      clientName: 'Cabinet Lefebvre',
      clientEmail: 'contact@cabinet-lefebvre.fr',
      clientAddress: '78 Boulevard Haussmann, 75009 Paris',
      issueDate: '2024-12-20',
      dueDate: '2025-01-20',
      amount: 2900.00,
      tvaRate: 20,
      status: 'Envoyée',
      items: [
        { description: 'Révision comptable semestrielle', quantity: 1, unitPrice: 2200.00, total: 2200.00 },
        { description: 'Conseil juridique fiscal', quantity: 1, unitPrice: 700.00, total: 700.00 }
      ],
      notes: 'Facture envoyée le 20/12/2024. Échéance dans 30 jours.'
    }
  ];

  const filteredInvoices = useMemo(() => {
    return mockInvoices?.filter(invoice => {
      if (filters?.invoiceNumber && !invoice?.invoiceNumber?.toLowerCase()?.includes(filters?.invoiceNumber?.toLowerCase())) {
        return false;
      }
      if (filters?.status !== 'all' && invoice?.status !== filters?.status) {
        return false;
      }
      if (filters?.client !== 'all') {
        const clientMap = {
          'client1': 'Entreprise Martin SARL',
          'client2': 'Société Dupont & Fils',
          'client3': 'Cabinet Lefebvre',
          'client4': 'Boutique Bernard',
          'client5': 'Restaurant Le Gourmet'
        };
        if (invoice?.clientName !== clientMap?.[filters?.client]) {
          return false;
        }
      }
      if (filters?.startDate && new Date(invoice.issueDate) < new Date(filters.startDate)) {
        return false;
      }
      if (filters?.endDate && new Date(invoice.issueDate) > new Date(filters.endDate)) {
        return false;
      }
      if (filters?.minAmount && invoice?.amount < parseFloat(filters?.minAmount)) {
        return false;
      }
      if (filters?.maxAmount && invoice?.amount > parseFloat(filters?.maxAmount)) {
        return false;
      }
      if (filters?.search) {
        const searchLower = filters?.search?.toLowerCase();
        return (invoice?.invoiceNumber?.toLowerCase()?.includes(searchLower) ||
        invoice?.clientName?.toLowerCase()?.includes(searchLower) || invoice?.clientEmail?.toLowerCase()?.includes(searchLower));
      }
      return true;
    });
  }, [filters]);

  const stats = useMemo(() => {
    return {
      totalInvoices: mockInvoices?.length,
      totalAmount: mockInvoices?.reduce((sum, inv) => sum + inv?.amount, 0),
      paidInvoices: mockInvoices?.filter(inv => inv?.status === 'Payée')?.length,
      pendingInvoices: mockInvoices?.filter(inv => inv?.status === 'Envoyée')?.length,
      overdueInvoices: mockInvoices?.filter(inv => inv?.status === 'En retard')?.length,
      draftInvoices: mockInvoices?.filter(inv => inv?.status === 'Brouillon')?.length
    };
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    trackEngagement?.filter('invoice', `${key}:${value}`);
  };

  const handleResetFilters = () => {
    setFilters({
      invoiceNumber: '',
      client: 'all',
      status: 'all',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      search: ''
    });
  };

  const handleSelectInvoice = (id, checked) => {
    if (checked) {
      setSelectedInvoices(prev => [...prev, id]);
    } else {
      setSelectedInvoices(prev => prev?.filter(invId => invId !== id));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedInvoices(filteredInvoices?.map(inv => inv?.id));
    } else {
      setSelectedInvoices([]);
    }
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleEditInvoice = (invoice) => {
    alert(`Modification de la facture ${invoice?.invoiceNumber}\n\nCette fonctionnalité ouvrira un formulaire d'édition complet avec tous les champs modifiables.`);
  };

  const handleDuplicateInvoice = (invoice) => {
    alert(`Duplication de la facture ${invoice?.invoiceNumber}\n\nUne nouvelle facture sera créée avec les mêmes informations et un nouveau numéro.`);
  };

  const handleSendInvoice = (invoice) => {
    alert(`Envoi de la facture ${invoice?.invoiceNumber}\n\nLa facture sera envoyée par email à: ${invoice?.clientEmail}\n\nUn email de confirmation sera envoyé à votre adresse.`);
  };

  const handleMarkPaid = (invoice) => {
    alert(`Marquer comme payée: ${invoice?.invoiceNumber}\n\nLa facture sera marquée comme payée et le statut sera mis à jour dans le système.`);
  };

  const handleDownloadPDF = (invoice) => {
    try {
      // Add this block - Define generateInvoicePDF function inline or use a placeholder
      const generateInvoicePDF = (invoiceData) => {
        // Placeholder PDF generation logic
        console.log('Generating PDF for invoice:', invoiceData.invoiceNumber);
        // In a real implementation, this would use a library like jsPDF or pdfmake
      };
      
      generateInvoicePDF(invoice);
      trackFeature?.invoice?.download('pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handleSendEmail = async (invoice) => {
    try {
      // ... existing send email logic ...
      trackFeature?.invoice?.send();
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const handlePreview = (invoice) => {
    setSelectedInvoice(invoice);
    trackFeature?.invoice?.preview();
  };

  const handleCreateInvoice = () => {
    // ... existing create invoice logic ...
    trackFeature?.invoice?.create();
  };

  const handleBulkSend = () => {
    alert(`Envoi groupé de ${selectedInvoices?.length} facture(s)\n\nToutes les factures sélectionnées seront envoyées par email à leurs clients respectifs.`);
  };

  const handleBulkMarkPaid = () => {
    alert(`Marquer ${selectedInvoices?.length} facture(s) comme payées\n\nToutes les factures sélectionnées seront marquées comme payées.`);
  };

  const handleBulkDelete = () => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedInvoices?.length} facture(s) ?\n\nCette action est irréversible.`)) {
      alert('Factures supprimées avec succès.');
      setSelectedInvoices([]);
    }
  };

  const handleClearSelection = () => {
    setSelectedInvoices([]);
  };

  const allSelected = filteredInvoices?.length > 0 && selectedInvoices?.length === filteredInvoices?.length;
  const someSelected = selectedInvoices?.length > 0 && selectedInvoices?.length < filteredInvoices?.length;

  return (
    <div className="min-h-screen bg-background">
      <NavigationSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main className={`transition-smooth ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'} pt-20 lg:pt-6 px-4 md:px-6 lg:px-8 pb-8`}>
        <BreadcrumbTrail />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-heading font-bold text-2xl md:text-3xl lg:text-4xl text-foreground mb-2">
              Gestion des Factures
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Créez, suivez et gérez toutes vos factures clients avec TVA automatique
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              iconName={showFilters ? 'X' : 'Filter'}
              iconPosition="left"
            >
              Filtres
            </Button>
            <Button
              variant="default"
              onClick={() => alert('Création d\'une nouvelle facture\n\nFormulaire de création avec modèles personnalisables et calcul automatique de la TVA.')}
              iconName="Plus"
              iconPosition="left"
            >
              Nouvelle Facture
            </Button>
          </div>
        </div>

        <InvoiceStatsCards stats={stats} />

        {showFilters && (
          <div className="mt-6">
            <InvoiceFilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
            />
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-lg shadow-elevation-2 overflow-hidden">
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <Checkbox
                          checked={allSelected}
                          indeterminate={someSelected}
                          onChange={(e) => handleSelectAll(e?.target?.checked)}
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        N° Facture
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Date émission
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Échéance
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Montant HT
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices?.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-4 py-12 text-center">
                          <Icon name="FileText" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
                          <p className="text-muted-foreground">Aucune facture trouvée</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Modifiez vos filtres ou créez une nouvelle facture
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredInvoices?.map(invoice => (
                        <InvoiceTableRow
                          key={invoice?.id}
                          invoice={invoice}
                          isSelected={selectedInvoices?.includes(invoice?.id)}
                          onSelect={handleSelectInvoice}
                          onView={handleViewInvoice}
                          onEdit={handleEditInvoice}
                          onDuplicate={handleDuplicateInvoice}
                          onSend={handleSendInvoice}
                          onMarkPaid={handleMarkPaid}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="lg:hidden space-y-4 p-4">
                {filteredInvoices?.length === 0 ? (
                  <div className="text-center py-12">
                    <Icon name="FileText" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucune facture trouvée</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Modifiez vos filtres ou créez une nouvelle facture
                    </p>
                  </div>
                ) : (
                  filteredInvoices?.map(invoice => (
                    <InvoiceMobileCard
                      key={invoice?.id}
                      invoice={invoice}
                      isSelected={selectedInvoices?.includes(invoice?.id)}
                      onSelect={handleSelectInvoice}
                      onView={handleViewInvoice}
                      onEdit={handleEditInvoice}
                      onDuplicate={handleDuplicateInvoice}
                      onSend={handleSendInvoice}
                      onMarkPaid={handleMarkPaid}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <InvoicePreviewPanel
              invoice={selectedInvoice}
              onClose={() => setSelectedInvoice(null)}
              onDownloadPDF={handleDownloadPDF}
              onSendEmail={handleSendEmail}
            />
          </div>
        </div>

        <BulkActionsBar
          selectedCount={selectedInvoices?.length}
          onSendBulk={handleBulkSend}
          onMarkPaidBulk={handleBulkMarkPaid}
          onDeleteBulk={handleBulkDelete}
          onClearSelection={handleClearSelection}
        />
      </main>
    </div>
  );
};

export default InvoiceManagement;