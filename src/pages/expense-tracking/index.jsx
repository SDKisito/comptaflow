import React, { useState, useEffect } from 'react';
import NavigationSidebar from '../../components/ui/NavigationSidebar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ExpenseEntryForm from './components/ExpenseEntryForm';
import ExpenseListItem from './components/ExpenseListItem';
import ExpenseFilters from './components/ExpenseFilters';
import ExpenseSummaryCards from './components/ExpenseSummaryCards';
import RecurringExpenseModal from './components/RecurringExpenseModal';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';


const ExpenseTracking = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, expense: null });
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    deductibility: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'date-desc'
  });

  const categoryLabels = {
    fournitures: 'Fournitures de bureau',
    loyer: 'Loyer et charges',
    transport: 'Frais de transport',
    repas: 'Repas et restauration',
    telecom: 'Télécommunications',
    marketing: 'Marketing et publicité',
    formation: 'Formation professionnelle',
    assurance: 'Assurances',
    honoraires: 'Honoraires',
    maintenance: 'Maintenance et réparations',
    abonnements: 'Abonnements logiciels',
    autres: 'Autres dépenses'
  };

  const mockExpenses = [
    {
      id: 1,
      amount: '850.00',
      date: '2024-12-20',
      category: 'loyer',
      categoryLabel: 'Loyer et charges',
      description: 'Loyer mensuel bureau - Décembre 2024',
      tvaRate: '20',
      tvaAmount: '170.00',
      totalAmount: '1020.00',
      isDeductible: true,
      receiptName: 'facture_loyer_dec2024.pdf'
    },
    {
      id: 2,
      amount: '245.50',
      date: '2024-12-18',
      category: 'fournitures',
      categoryLabel: 'Fournitures de bureau',
      description: 'Achat matériel informatique - Clavier et souris ergonomiques',
      tvaRate: '20',
      tvaAmount: '49.10',
      totalAmount: '294.60',
      isDeductible: true,
      receiptName: 'ticket_fournitures_18dec.jpg'
    },
    {
      id: 3,
      amount: '125.00',
      date: '2024-12-15',
      category: 'transport',
      categoryLabel: 'Frais de transport',
      description: 'Déplacement client Paris - Aller-retour train',
      tvaRate: '10',
      tvaAmount: '12.50',
      totalAmount: '137.50',
      isDeductible: true,
      receiptName: 'billet_train_15dec.pdf'
    },
    {
      id: 4,
      amount: '89.90',
      date: '2024-12-14',
      category: 'abonnements',
      categoryLabel: 'Abonnements logiciels',
      description: 'Abonnement mensuel Adobe Creative Cloud',
      tvaRate: '20',
      tvaAmount: '17.98',
      totalAmount: '107.88',
      isDeductible: true,
      receiptName: null
    },
    {
      id: 5,
      amount: '450.00',
      date: '2024-12-12',
      category: 'marketing',
      categoryLabel: 'Marketing et publicité',
      description: 'Campagne publicitaire Google Ads - Semaine 50',
      tvaRate: '20',
      tvaAmount: '90.00',
      totalAmount: '540.00',
      isDeductible: true,
      receiptName: 'facture_google_ads.pdf'
    },
    {
      id: 6,
      amount: '65.00',
      date: '2024-12-10',
      category: 'repas',
      categoryLabel: 'Repas et restauration',
      description: 'Déjeuner d\'affaires avec prospect',
      tvaRate: '10',
      tvaAmount: '6.50',
      totalAmount: '71.50',
      isDeductible: false,
      receiptName: 'ticket_restaurant_10dec.jpg'
    },
    {
      id: 7,
      amount: '320.00',
      date: '2024-12-08',
      category: 'formation',
      categoryLabel: 'Formation professionnelle',
      description: 'Formation en ligne React Advanced Patterns',
      tvaRate: '20',
      tvaAmount: '64.00',
      totalAmount: '384.00',
      isDeductible: true,
      receiptName: 'facture_formation_react.pdf'
    },
    {
      id: 8,
      amount: '180.00',
      date: '2024-12-05',
      category: 'telecom',
      categoryLabel: 'Télécommunications',
      description: 'Facture téléphone et internet professionnel',
      tvaRate: '20',
      tvaAmount: '36.00',
      totalAmount: '216.00',
      isDeductible: true,
      receiptName: 'facture_telecom_dec.pdf'
    },
    {
      id: 9,
      amount: '95.00',
      date: '2024-12-03',
      category: 'maintenance',
      categoryLabel: 'Maintenance et réparations',
      description: 'Réparation ordinateur portable - Remplacement batterie',
      tvaRate: '20',
      tvaAmount: '19.00',
      totalAmount: '114.00',
      isDeductible: true,
      receiptName: null
    },
    {
      id: 10,
      amount: '1250.00',
      date: '2024-12-01',
      category: 'honoraires',
      categoryLabel: 'Honoraires',
      description: 'Honoraires comptable - Trimestre Q4 2024',
      tvaRate: '20',
      tvaAmount: '250.00',
      totalAmount: '1500.00',
      isDeductible: true,
      receiptName: 'facture_comptable_q4.pdf'
    }
  ];

  useEffect(() => {
    setExpenses(mockExpenses);
    setFilteredExpenses(mockExpenses);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, expenses]);

  const applyFilters = () => {
    let filtered = [...expenses];

    if (filters?.search) {
      const searchLower = filters?.search?.toLowerCase();
      filtered = filtered?.filter(exp =>
        exp?.description?.toLowerCase()?.includes(searchLower) ||
        exp?.categoryLabel?.toLowerCase()?.includes(searchLower)
      );
    }

    if (filters?.category) {
      filtered = filtered?.filter(exp => exp?.category === filters?.category);
    }

    if (filters?.deductibility === 'deductible') {
      filtered = filtered?.filter(exp => exp?.isDeductible);
    } else if (filters?.deductibility === 'non-deductible') {
      filtered = filtered?.filter(exp => !exp?.isDeductible);
    }

    if (filters?.dateFrom) {
      filtered = filtered?.filter(exp => exp?.date >= filters?.dateFrom);
    }

    if (filters?.dateTo) {
      filtered = filtered?.filter(exp => exp?.date <= filters?.dateTo);
    }

    filtered?.sort((a, b) => {
      switch (filters?.sortBy) {
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'amount-desc':
          return parseFloat(b?.totalAmount) - parseFloat(a?.totalAmount);
        case 'amount-asc':
          return parseFloat(a?.totalAmount) - parseFloat(b?.totalAmount);
        case 'category':
          return a?.categoryLabel?.localeCompare(b?.categoryLabel);
        default:
          return 0;
      }
    });

    setFilteredExpenses(filtered);
  };

  const handleSaveExpense = (expenseData) => {
    if (editingExpense) {
      setExpenses(prev =>
        prev?.map(exp => exp?.id === editingExpense?.id ? { ...expenseData, categoryLabel: categoryLabels?.[expenseData?.category] } : exp)
      );
      setEditingExpense(null);
    } else {
      setExpenses(prev => [...prev, { ...expenseData, categoryLabel: categoryLabels?.[expenseData?.category] }]);
    }
    setShowEntryForm(false);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setShowEntryForm(true);
  };

  const handleDeleteExpense = (expense) => {
    setDeleteConfirmation({ isOpen: true, expense });
  };

  const confirmDelete = () => {
    setExpenses(prev => prev?.filter(exp => exp?.id !== deleteConfirmation?.expense?.id));
    setDeleteConfirmation({ isOpen: false, expense: null });
  };

  const handleViewReceipt = (expense) => {
    alert(`Ouverture du justificatif: ${expense?.receiptName}\n\nDans une application réelle, ceci ouvrirait le document dans une visionneuse ou le téléchargerait.`);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: '',
      deductibility: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'date-desc'
    });
  };

  const handleExport = (format = 'csv') => {
    alert(`Export des dépenses au format ${format?.toUpperCase()}\n\nDans une application réelle, ceci générerait et téléchargerait un fichier ${format?.toUpperCase()} avec toutes les dépenses filtrées.`);
  };

  const handleSaveRecurring = (recurringData) => {
    alert(`Dépense récurrente configurée:\n\nDescription: ${recurringData?.description}\nMontant: ${recurringData?.amount}€\nFréquence: ${recurringData?.frequency}\n\nDans une application réelle, le système générerait automatiquement les dépenses selon la fréquence définie.`);
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main
        className={`
          transition-smooth pt-20 lg:pt-6 pb-8
          ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'}
        `}
      >
        <div className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          <BreadcrumbTrail />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-2">
                Suivi des dépenses
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Enregistrez et catégorisez vos dépenses professionnelles pour une gestion financière optimale
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                iconName="Repeat"
                iconPosition="left"
                onClick={() => setShowRecurringModal(true)}
                className="flex-1 sm:flex-none"
              >
                Dépense récurrente
              </Button>
              <Button
                variant="default"
                iconName="Plus"
                iconPosition="left"
                onClick={() => {
                  setEditingExpense(null);
                  setShowEntryForm(true);
                }}
                className="flex-1 sm:flex-none"
              >
                Nouvelle dépense
              </Button>
            </div>
          </div>

          <ExpenseSummaryCards expenses={filteredExpenses} />

          <div className="mt-6 md:mt-8">
            <ExpenseFilters
              filters={filters}
              onFilterChange={setFilters}
              onReset={handleResetFilters}
              onExport={handleExport}
            />
          </div>

          {showEntryForm && (
            <div className="mt-6 md:mt-8">
              <ExpenseEntryForm
                onSubmit={handleSaveExpense}
                onCancel={() => {
                  setShowEntryForm(false);
                  setEditingExpense(null);
                }}
                editingExpense={editingExpense}
              />
            </div>
          )}

          <div className="mt-6 md:mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-heading font-semibold text-foreground">
                Liste des dépenses
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({filteredExpenses?.length} résultat{filteredExpenses?.length > 1 ? 's' : ''})
                </span>
              </h2>
            </div>

            {filteredExpenses?.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-8 md:p-12 text-center">
                <Icon name="Receipt" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
                <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                  Aucune dépense trouvée
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {filters?.search || filters?.category || filters?.deductibility || filters?.dateFrom || filters?.dateTo
                    ? 'Aucune dépense ne correspond à vos critères de recherche.' :'Commencez par enregistrer votre première dépense professionnelle.'}
                </p>
                {(filters?.search || filters?.category || filters?.deductibility || filters?.dateFrom || filters?.dateTo) && (
                  <Button
                    variant="outline"
                    iconName="X"
                    iconPosition="left"
                    onClick={handleResetFilters}
                  >
                    Réinitialiser les filtres
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredExpenses?.map(expense => (
                  <ExpenseListItem
                    key={expense?.id}
                    expense={expense}
                    onEdit={handleEditExpense}
                    onDelete={handleDeleteExpense}
                    onViewReceipt={handleViewReceipt}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <RecurringExpenseModal
        isOpen={showRecurringModal}
        onClose={() => setShowRecurringModal(false)}
        onSave={handleSaveRecurring}
      />
      <DeleteConfirmationModal
        isOpen={deleteConfirmation?.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, expense: null })}
        onConfirm={confirmDelete}
        expense={deleteConfirmation?.expense}
      />
    </div>
  );
};

export default ExpenseTracking;