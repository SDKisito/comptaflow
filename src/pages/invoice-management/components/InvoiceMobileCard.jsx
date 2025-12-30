import React from 'react';
import { Checkbox } from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import InvoiceStatusBadge from './InvoiceStatusBadge';
import { downloadInvoicePDF } from '../../../utils/pdfGenerator';

const InvoiceMobileCard = ({ invoice, isSelected, onSelect, onView, onEdit, onDuplicate, onSend, onMarkPaid }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })?.format(amount);
  };

  const isOverdue = invoice?.status === 'En retard';
  const isDraft = invoice?.status === 'Brouillon';

  const handleDownloadPDF = (e) => {
    e?.stopPropagation();
    try {
      const companyInfo = {
        name: 'ComptaFlow SARL',
        address: '123 Avenue de la Comptabilité',
        postalCode: '75001',
        city: 'Paris',
        country: 'France',
        phone: '+33 1 23 45 67 89',
        email: 'contact@comptaflow.fr',
        siret: '123 456 789 00012',
        tvaNumber: 'FR12345678901'
      };

      downloadInvoicePDF(invoice, companyInfo);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Une erreur est survenue lors de la génération du PDF.');
    }
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-4 shadow-elevation-1 ${isOverdue ? 'border-error' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <Checkbox
            checked={isSelected}
            onChange={(e) => onSelect(invoice?.id, e?.target?.checked)}
          />
          <div className="flex-1">
            <p className="font-semibold text-foreground data-text mb-1">{invoice?.invoiceNumber}</p>
            <p className="text-sm font-medium text-foreground">{invoice?.clientName}</p>
            <p className="text-xs text-muted-foreground">{invoice?.clientEmail}</p>
          </div>
        </div>
        <InvoiceStatusBadge status={invoice?.status} />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Date d'émission</p>
          <p className="font-medium text-foreground">{formatDate(invoice?.issueDate)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Date d'échéance</p>
          <p className={`font-medium ${isOverdue ? 'text-error' : 'text-foreground'}`}>
            {formatDate(invoice?.dueDate)}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="font-bold text-lg text-primary data-text">{formatAmount(invoice?.amount)}</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onView(invoice)}
            title="Voir"
          >
            <Icon name="Eye" size={18} color="var(--color-foreground)" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(invoice)}
            title="Modifier"
          >
            <Icon name="Edit" size={18} color="var(--color-foreground)" />
          </Button>
          {!isDraft && invoice?.status !== 'Payée' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSend(invoice)}
              title="Envoyer"
            >
              <Icon name="Send" size={18} color="var(--color-primary)" />
            </Button>
          )}
          {invoice?.status !== 'Payée' && !isDraft && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onMarkPaid(invoice)}
              title="Marquer payée"
            >
              <Icon name="CheckCircle" size={18} color="var(--color-success)" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownloadPDF}
            iconName="Download"
            title="Télécharger PDF"
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceMobileCard;