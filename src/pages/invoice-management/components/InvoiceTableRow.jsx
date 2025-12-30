import React from 'react';
import { Checkbox } from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import InvoiceStatusBadge from './InvoiceStatusBadge';
import { downloadInvoicePDF } from '../../../utils/pdfGenerator';

const InvoiceTableRow = ({ invoice, isSelected, onSelect, onView, onEdit, onDuplicate, onSend, onMarkPaid }) => {
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
    <tr className={`border-b border-border hover:bg-muted/50 transition-smooth ${isOverdue ? 'bg-error/5' : ''}`}>
      <td className="px-4 py-3">
        <Checkbox
          checked={isSelected}
          onChange={(e) => onSelect(invoice?.id, e?.target?.checked)}
        />
      </td>
      <td className="px-4 py-3">
        <span className="font-medium text-foreground data-text">{invoice?.invoiceNumber}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{invoice?.clientName}</span>
          <span className="text-xs text-muted-foreground">{invoice?.clientEmail}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-foreground">{formatDate(invoice?.issueDate)}</span>
      </td>
      <td className="px-4 py-3">
        <span className={`font-medium ${isOverdue ? 'text-error' : 'text-foreground'}`}>
          {formatDate(invoice?.dueDate)}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="font-semibold text-foreground data-text">{formatAmount(invoice?.amount)}</span>
      </td>
      <td className="px-4 py-3">
        <InvoiceStatusBadge status={invoice?.status} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onView(invoice)}
            title="Voir la facture"
          >
            <Icon name="Eye" size={16} color="var(--color-foreground)" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(invoice)}
            title="Modifier"
          >
            <Icon name="Edit" size={16} color="var(--color-foreground)" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDuplicate(invoice)}
            title="Dupliquer"
          >
            <Icon name="Copy" size={16} color="var(--color-foreground)" />
          </Button>
          {!isDraft && invoice?.status !== 'Payée' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSend(invoice)}
              title="Envoyer"
            >
              <Icon name="Send" size={16} color="var(--color-primary)" />
            </Button>
          )}
          {invoice?.status !== 'Payée' && !isDraft && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onMarkPaid(invoice)}
              title="Marquer comme payée"
            >
              <Icon name="CheckCircle" size={16} color="var(--color-success)" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownloadPDF}
            iconName="Download"
            className="text-muted-foreground hover:text-foreground"
            title="Télécharger PDF"
          />
        </div>
      </td>
    </tr>
  );
};

export default InvoiceTableRow;
