import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ClientDetailsPanel = ({ client, onClose, onEdit }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!client) return null;

  const tabs = [
    { id: 'overview', label: 'Aperçu', icon: 'Info' },
    { id: 'invoices', label: 'Factures', icon: 'FileText' },
    { id: 'payments', label: 'Paiements', icon: 'CreditCard' },
    { id: 'documents', label: 'Documents', icon: 'FolderOpen' },
    { id: 'notes', label: 'Notes', icon: 'MessageSquare' }
  ];

  const renderOverview = () => (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-muted/50 rounded-lg p-4 md:p-5">
        <h4 className="font-heading font-semibold text-base md:text-lg mb-3 md:mb-4">Informations générales</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Entreprise</p>
            <p className="text-sm md:text-base font-medium">{client?.companyName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Contact principal</p>
            <p className="text-sm md:text-base font-medium">{client?.contactName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Email</p>
            <p className="text-sm md:text-base font-medium">{client?.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Téléphone</p>
            <p className="text-sm md:text-base font-medium">{client?.phone}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">SIRET</p>
            <p className="text-sm md:text-base font-medium">{client?.siret}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">N° TVA</p>
            <p className="text-sm md:text-base font-medium">{client?.vatNumber}</p>
          </div>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 md:p-5">
        <h4 className="font-heading font-semibold text-base md:text-lg mb-3 md:mb-4">Adresse de facturation</h4>
        <p className="text-sm md:text-base text-foreground whitespace-pre-line">{client?.billingAddress}</p>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 md:p-5">
        <h4 className="font-heading font-semibold text-base md:text-lg mb-3 md:mb-4">Conditions de paiement</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Délai de paiement</p>
            <p className="text-sm md:text-base font-medium">{client?.paymentTerms}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Limite de crédit</p>
            <p className="text-sm md:text-base font-medium">
              {client?.creditLimit?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 md:p-5">
        <h4 className="font-heading font-semibold text-base md:text-lg mb-3 md:mb-4">Statistiques</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="text-center">
            <p className="text-xl md:text-2xl font-bold text-primary">{client?.totalInvoices}</p>
            <p className="text-xs text-muted-foreground mt-1">Factures</p>
          </div>
          <div className="text-center">
            <p className="text-xl md:text-2xl font-bold text-success">{client?.paidInvoices}</p>
            <p className="text-xs text-muted-foreground mt-1">Payées</p>
          </div>
          <div className="text-center">
            <p className="text-xl md:text-2xl font-bold text-warning">{client?.pendingInvoices}</p>
            <p className="text-xs text-muted-foreground mt-1">En attente</p>
          </div>
          <div className="text-center">
            <p className="text-xl md:text-2xl font-bold text-error">{client?.overdueInvoices}</p>
            <p className="text-xs text-muted-foreground mt-1">En retard</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInvoices = () => (
    <div className="space-y-3 md:space-y-4">
      {client?.recentInvoices?.map((invoice) => (
        <div key={invoice?.id} className="bg-muted/50 rounded-lg p-4 md:p-5 hover:shadow-elevation-1 transition-smooth">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h5 className="font-semibold text-sm md:text-base mb-1">{invoice?.number}</h5>
              <p className="text-xs md:text-sm text-muted-foreground">{invoice?.date}</p>
            </div>
            <span className={`px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
              invoice?.status === 'paid' ? 'bg-success/10 text-success' :
              invoice?.status === 'pending'? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'
            }`}>
              {invoice?.status === 'paid' ? 'Payée' : invoice?.status === 'pending' ? 'En attente' : 'En retard'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm md:text-base font-semibold">
              {invoice?.amount?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </p>
            <Button variant="ghost" size="sm" iconName="Eye" iconPosition="left">
              Voir
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-3 md:space-y-4">
      {client?.paymentHistory?.map((payment) => (
        <div key={payment?.id} className="bg-muted/50 rounded-lg p-4 md:p-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm md:text-base mb-1">
                {payment?.amount?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">{payment?.date}</p>
            </div>
            <Icon name="CheckCircle" size={20} color="var(--color-success)" />
          </div>
          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
            <Icon name="CreditCard" size={14} color="var(--color-muted-foreground)" />
            <span>{payment?.method}</span>
            <span>•</span>
            <span>Facture {payment?.invoiceNumber}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-3 md:space-y-4">
      {client?.documents?.map((doc) => (
        <div key={doc?.id} className="bg-muted/50 rounded-lg p-4 md:p-5 hover:shadow-elevation-1 transition-smooth">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="FileText" size={20} color="var(--color-primary)" />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="font-semibold text-sm md:text-base mb-1 truncate">{doc?.name}</h5>
              <p className="text-xs md:text-sm text-muted-foreground">{doc?.date} • {doc?.size}</p>
            </div>
            <Button variant="ghost" size="sm" iconName="Download">
              <span className="hidden md:inline">Télécharger</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderNotes = () => (
    <div className="space-y-3 md:space-y-4">
      {client?.notes?.map((note) => (
        <div key={note?.id} className="bg-muted/50 rounded-lg p-4 md:p-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs md:text-sm font-semibold text-primary">{note?.author?.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-sm md:text-base">{note?.author}</p>
                <span className="text-xs text-muted-foreground">•</span>
                <p className="text-xs md:text-sm text-muted-foreground">{note?.date}</p>
              </div>
              <p className="text-sm md:text-base text-foreground">{note?.content}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'invoices':
        return renderInvoices();
      case 'payments':
        return renderPayments();
      case 'documents':
        return renderDocuments();
      case 'notes':
        return renderNotes();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-150 lg:relative lg:bg-transparent lg:backdrop-blur-none">
      <div className="fixed inset-y-0 right-0 w-full lg:w-[480px] xl:w-[560px] bg-card border-l border-border shadow-elevation-4 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 md:p-5 lg:p-6 border-b border-border">
          <h3 className="font-heading font-semibold text-lg md:text-xl">Détails du client</h3>
          <Button variant="ghost" size="icon" iconName="X" onClick={onClose} />
        </div>

        <div className="flex-shrink-0 border-b border-border overflow-x-auto">
          <div className="flex p-2 gap-1 min-w-max">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`
                  flex items-center gap-2 px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-smooth whitespace-nowrap
                  ${activeTab === tab?.id
                    ? 'bg-primary text-primary-foreground shadow-elevation-1'
                    : 'text-muted-foreground hover:bg-muted'
                  }
                `}
              >
                <Icon name={tab?.icon} size={16} color="currentColor" />
                <span>{tab?.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-5 lg:p-6">
          {renderTabContent()}
        </div>

        <div className="flex-shrink-0 p-4 md:p-5 lg:p-6 border-t border-border bg-muted/30">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" fullWidth iconName="Edit" iconPosition="left" onClick={onEdit}>
              Modifier
            </Button>
            <Button variant="default" fullWidth iconName="FileText" iconPosition="left">
              Nouvelle facture
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailsPanel;