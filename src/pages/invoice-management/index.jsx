import React, { useState, useMemo, useEffect } from 'react';
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
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { downloadInvoicePDF } from '../../utils/pdfGenerator';

const InvoiceManagement = () => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [realInvoices, setRealInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Charger les factures depuis Supabase
  useEffect(() => {
    if (user?.id) {
      loadInvoices();
    }
  }, [user]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transformez les données pour correspondre au format attendu
      const transformedInvoices = (data || []).map(invoice => ({
        id: invoice.id,
        invoiceNumber: invoice.invoice_number || 'N/A',
        clientName: invoice.client_name || 'Client inconnu',
        clientEmail: invoice.client_email || '',
        clientAddress: invoice.client_address || '',
        issueDate: invoice.issue_date || new Date().toISOString().split('T')[0],
        dueDate: invoice.due_date || new Date().toISOString().split('T')[0],
        amount: parseFloat(invoice.total_amount || 0),
        tvaRate: parseFloat(invoice.tax_rate || 20),
        status: invoice.status || 'draft',
        items: invoice.items || [],
        paymentHistory: invoice.payment_history || [],
        notes: invoice.notes || ''
      }));
      
      setRealInvoices(transformedInvoices);
    } catch (error) {
      console.error('Erreur lors du chargement des factures:', error);
    } finally {
      setLoading(false);
    }
  };

  const mockInvoices = [
    {
      id: 'mock-1',
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
      id: 'mock-2',
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
    }
  ];

  // Combiner les factures mockées et réelles
  const allInvoices = [...mockInvoices, ...realInvoices];

  const filteredInvoices = useMemo(() => {
    return allInvoices?.filter(invoice => {
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
  }, [filters, allInvoices]);

  const stats = useMemo(() => {
    return {
      totalInvoices: allInvoices?.length,
      totalAmount: allInvoices?.reduce((sum, inv) => sum + inv?.amount, 0),
      paidInvoices: allInvoices?.filter(inv => inv?.status === 'Payée' || inv?.status === 'paid')?.length,
      pendingInvoices: allInvoices?.filter(inv => inv?.status === 'Envoyée' || inv?.status === 'sent')?.length,
      overdueInvoices: allInvoices?.filter(inv => inv?.status === 'En retard' || inv?.status === 'overdue')?.length,
      draftInvoices: allInvoices?.filter(inv => inv?.status === 'Brouillon' || inv?.status === 'draft')?.length
    };
  }, [allInvoices]);

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

  const handleEditInvoice = async (invoice) => {
    // Si c'est une facture mockée, on ne peut pas la modifier
    if (typeof invoice.id === 'string' && invoice.id.startsWith('mock-')) {
      alert('Cette facture est en lecture seule (données de démonstration)');
      return;
    }

    // Demander les nouvelles informations
    const newClientName = prompt('Nom du client :', invoice.clientName);
    if (!newClientName) return;
    
    const newClientEmail = prompt('Email du client :', invoice.clientEmail);
    if (!newClientEmail) return;
    
    const newAmount = prompt('Montant HT (€) :', invoice.amount);
    if (!newAmount) return;

    try {
      const { data, error } = await supabase
        .from('invoices')
        .update({
          client_name: newClientName,
          client_email: newClientEmail,
          total_amount: parseFloat(newAmount),
          updated_at: new Date().toISOString()
        })
        .eq('id', invoice.id)
        .eq('user_id', user?.id)
        .select();

      if (error) throw error;
      
      alert('Facture modifiée avec succès !');
      await loadInvoices(); // Recharger la liste
    } catch (error) {
      console.error('Error updating invoice:', error);
      alert('Erreur lors de la modification: ' + error.message);
    }
  };

  const handleDuplicateInvoice = async (invoice) => {
    // Si c'est une facture mockée, on crée quand même une vraie copie
    const isMocked = typeof invoice.id === 'string' && invoice.id.startsWith('mock-');

    try {
      // Générer un nouveau numéro de facture
      const newInvoiceNumber = `FAC-${new Date().getFullYear()}-${String(realInvoices.length + 1).padStart(3, '0')}`;
      
      const { data, error } = await supabase
        .from('invoices')
        .insert([{
          user_id: user?.id,
          invoice_number: newInvoiceNumber,
          client_name: invoice.clientName,
          client_email: invoice.clientEmail,
          client_address: invoice.clientAddress,
          issue_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          total_amount: invoice.amount,
          tax_rate: invoice.tvaRate,
          status: 'draft',
          items: invoice.items || [],
          notes: invoice.notes || ''
        }])
        .select();

      if (error) throw error;
      
      alert(`Facture dupliquée avec succès !\nNouveau numéro: ${newInvoiceNumber}`);
      await loadInvoices(); // Recharger la liste
    } catch (error) {
      console.error('Error duplicating invoice:', error);
      alert('Erreur lors de la duplication: ' + error.message);
    }
  };

const handleSendInvoice = async (invoice) => {
  if (typeof invoice.id === 'string' && invoice.id.startsWith('mock-')) {
    alert(`📧 Envoi simulé (données de démonstration)`);
    return;
  }

  if (!confirm(`Envoyer la facture ${invoice.invoiceNumber} à ${invoice.clientEmail} ?`)) {
    return;
  }

  try {
    // Appeler la Edge Function
    const { data: functionData, error: functionError } = await supabase.functions.invoke('send-email', {
      body: {
        emailType: 'invoice',
        to: invoice.clientEmail,
        data: {
          clientName: invoice.clientName,
          invoiceNumber: invoice.invoiceNumber,
          issueDate: invoice.issueDate,
          dueDate: invoice.dueDate,
          totalAmount: (invoice.amount * 1.2).toFixed(2), // TTC
          downloadUrl: `https://nando-it.fr/comptaflow/invoice/${invoice.id}/download`
        }
      }
    });

    if (functionError) throw functionError;

    // Mettre à jour le statut
    const { error } = await supabase
      .from('invoices')
      .update({
        status: 'sent',
        updated_at: new Date().toISOString()
      })
      .eq('id', invoice.id)
      .eq('user_id', user?.id);

    if (error) throw error;
    
    alert(`✅ Facture envoyée à ${invoice.clientEmail} !`);
    await loadInvoices();
  } catch (error) {
    console.error('Error sending invoice:', error);
    alert('Erreur lors de l\'envoi: ' + error.message);
  }
};

  const handleMarkPaid = async (invoice) => {
    // Si c'est une facture mockée
    if (typeof invoice.id === 'string' && invoice.id.startsWith('mock-')) {
      alert('Cette facture est en lecture seule (données de démonstration)');
      return;
    }

    if (!confirm(`Marquer la facture ${invoice.invoiceNumber} comme payée ?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('invoices')
        .update({
          status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('id', invoice.id)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      alert('✅ Facture marquée comme payée !');
      await loadInvoices();
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      alert('Erreur: ' + error.message);
    }
  };

  const handleDownloadPDF = (invoice) => {
    try {
      downloadInvoicePDF(invoice);
      trackFeature?.invoice?.download('pdf');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Erreur lors du téléchargement du PDF: ' + error.message);
    }
  };

  const handleSendEmail = async (invoice) => {
    await handleSendInvoice(invoice);
  };

  const handlePreview = (invoice) => {
    setSelectedInvoice(invoice);
    trackFeature?.invoice?.preview();
  };

  const handleCreateInvoice = async () => {
    // Demander les informations de base
    const clientName = prompt('Nom du client :');
    if (!clientName) return;
    
    const clientEmail = prompt('Email du client :');
    if (!clientEmail) return;
    
    const amount = prompt('Montant HT (€) :');
    if (!amount) return;

    try {
      // Générer un numéro de facture automatique
      const invoiceNumber = `FAC-${new Date().getFullYear()}-${String(realInvoices.length + 1).padStart(3, '0')}`;
      
      const { data, error } = await supabase
        .from('invoices')
        .insert([{
          user_id: user?.id,
          invoice_number: invoiceNumber,
          client_name: clientName,
          client_email: clientEmail,
          issue_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          total_amount: parseFloat(amount),
          tax_rate: 20,
          status: 'draft',
          items: [],
          notes: ''
        }])
        .select();

      if (error) throw error;
      
      alert('✅ Facture créée avec succès !');
      await loadInvoices();
      trackFeature?.invoice?.create();
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Erreur lors de la création: ' + error.message);
    }
  };

  const handleBulkSend = () => {
    alert(`Envoi groupé de ${selectedInvoices?.length} facture(s)\n\nToutes les factures sélectionnées seront envoyées par email à leurs clients respectifs.`);
  };

  const handleBulkMarkPaid = () => {
    alert(`Marquer ${selectedInvoices?.length} facture(s) comme payées\n\nToutes les factures sélectionnées seront marquées comme payées.`);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedInvoices?.length} facture(s) ?\n\nCette action est irréversible.`)) {
      return;
    }

    try {
      // Filtrer uniquement les IDs non-mockés
      const realIds = selectedInvoices.filter(id => !(typeof id === 'string' && id.startsWith('mock-')));
      
      if (realIds.length === 0) {
        alert('Aucune facture réelle sélectionnée (seules les données de démonstration sont sélectionnées)');
        return;
      }

      const { error } = await supabase
        .from('invoices')
        .delete()
        .in('id', realIds)
        .eq('user_id', user?.id);

      if (error) throw error;

      alert(`✅ ${realIds.length} facture(s) supprimée(s) avec succès !`);
      setSelectedInvoices([]);
      await loadInvoices();
    } catch (error) {
      console.error('Error deleting invoices:', error);
      alert('Erreur lors de la suppression: ' + error.message);
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
              onClick={handleCreateInvoice}
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
                    {loading ? (
                      <tr>
                        <td colSpan="8" className="px-4 py-12 text-center">
                          <p className="text-muted-foreground">Chargement...</p>
                        </td>
                      </tr>
                    ) : filteredInvoices?.length === 0 ? (
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
                          onDownloadPDF={handleDownloadPDF}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="lg:hidden space-y-4 p-4">
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Chargement...</p>
                  </div>
                ) : filteredInvoices?.length === 0 ? (
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
