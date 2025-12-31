import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

import InvoiceStatusBadge from './InvoiceStatusBadge';

import { downloadInvoicePDF } from '../../../utils/pdfGenerator';

const InvoicePreviewPanel = ({ invoice, onClose, onDownloadPDF, onSendEmail }) => {
  if (!invoice) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-elevation-2 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Icon name="FileText" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Sélectionnez une facture pour voir les détails</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })?.format(amount);
  };

  const calculateTVA = (amount, rate) => {
    return amount * (rate / 100);
  };

  const tvaAmount = calculateTVA(invoice?.amount, invoice?.tvaRate);
  const totalTTC = invoice?.amount + tvaAmount;

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-2 overflow-hidden">
      <div className="bg-primary/5 border-b border-border px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon name="FileText" size={24} color="var(--color-primary)" />
          <div>
            <h3 className="font-heading font-semibold text-base md:text-lg text-foreground">
              {invoice?.invoiceNumber}
            </h3>
            <p className="text-xs text-muted-foreground">Aperçu de la facture</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <Icon name="X" size={20} color="var(--color-foreground)" />
        </Button>
      </div>
      <div className="p-4 md:p-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Building2" size={20} color="var(--color-primary)" />
              <span className="font-semibold text-foreground">Votre Entreprise SARL</span>
            </div>
            <p className="text-sm text-muted-foreground">123 Rue de Commerce</p>
            <p className="text-sm text-muted-foreground">75001 Paris, France</p>
            <p className="text-sm text-muted-foreground">SIRET: 123 456 789 00012</p>
            <p className="text-sm text-muted-foreground">TVA: FR12345678901</p>
          </div>
          <InvoiceStatusBadge status={invoice?.status} />
        </div>

        <div className="border-t border-border pt-4">
          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <Icon name="User" size={18} color="var(--color-foreground)" />
            Facturé à
          </h4>
          <p className="font-medium text-foreground">{invoice?.clientName}</p>
          <p className="text-sm text-muted-foreground">{invoice?.clientEmail}</p>
          <p className="text-sm text-muted-foreground">{invoice?.clientAddress}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Date d'émission</p>
            <p className="font-medium text-foreground">{formatDate(invoice?.issueDate)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Date d'échéance</p>
            <p className="font-medium text-foreground">{formatDate(invoice?.dueDate)}</p>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <h4 className="font-semibold text-foreground mb-3">Détails de la facture</h4>
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            {invoice?.items?.map((item, index) => (
              <div key={index} className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{item?.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Quantité: {item?.quantity} × {formatAmount(item?.unitPrice)}
                  </p>
                </div>
                <p className="font-semibold text-foreground data-text">{formatAmount(item?.total)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Sous-total HT</span>
            <span className="font-medium text-foreground data-text">{formatAmount(invoice?.amount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">TVA ({invoice?.tvaRate}%)</span>
            <span className="font-medium text-foreground data-text">{formatAmount(tvaAmount)}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-border">
            <span className="font-semibold text-foreground">Total TTC</span>
            <span className="font-bold text-lg text-primary data-text">{formatAmount(totalTTC)}</span>
          </div>
        </div>

        {invoice?.paymentHistory && invoice?.paymentHistory?.length > 0 && (
          <div className="border-t border-border pt-4">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Icon name="CreditCard" size={18} color="var(--color-success)" />
              Historique des paiements
            </h4>
            <div className="space-y-2">
              {invoice?.paymentHistory?.map((payment, index) => (
                <div key={index} className="flex justify-between items-center bg-success/5 rounded-lg p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{formatDate(payment?.date)}</p>
                    <p className="text-xs text-muted-foreground">{payment?.method}</p>
                  </div>
                  <span className="font-semibold text-success data-text">{formatAmount(payment?.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {invoice?.notes && (
          <div className="border-t border-border pt-4">
            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Icon name="FileText" size={18} color="var(--color-foreground)" />
              Notes
            </h4>
            <p className="text-sm text-muted-foreground">{invoice?.notes}</p>
          </div>
        )}
      </div>
      <div className="border-t border-border px-4 md:px-6 py-4 bg-muted/30 flex flex-col sm:flex-row gap-3">
        <Button
          variant="default"
          onClick={() => {
            try {
              const companyInfo = {
                name: name: invoice?.companyName || '',
                address: invoice?.companyAddress || '',
                postalCode: invoice?.companyPostalCode || '',
                city: invoice?.companyCity || '',
                country: invoice?.companyCountry || '',
                phone: invoice?.companyPhone || '',
                email: invoice?.companyEmail || '',
                siret: invoice?.companySiret || '',
                tvaNumber: invoice?.companyTvaNumber || ''
              };

              downloadInvoicePDF(invoice, companyInfo);
            } catch (error) {
              console.error('Erreur lors de la génération du PDF:', error);
              alert('Une erreur est survenue lors de la génération du PDF.');
            }
          }}
          iconName="Download"
          iconPosition="left"
          className="w-full"
        >
          Télécharger PDF
        </Button>
        {invoice?.status !== 'Payée' && invoice?.status !== 'Brouillon' && (
          <Button
            variant="default"
            fullWidth
            onClick={() => onSendEmail(invoice)}
            iconName="Mail"
            iconPosition="left"
          >
            Envoyer par email
          </Button>
        )}
      </div>
    </div>
  );
};

export default InvoicePreviewPanel;
