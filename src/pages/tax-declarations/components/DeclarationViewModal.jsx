import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DeclarationViewModal = ({ declaration, onClose }) => {
  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-background bg-opacity-80">
      <div className="bg-card border border-border rounded-lg shadow-elevation-4 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
          <div>
            <h2 className="font-heading font-semibold text-lg md:text-xl text-foreground">
              Détails de la déclaration
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {declaration?.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-muted transition-smooth"
            aria-label="Fermer"
          >
            <Icon name="X" size={20} color="var(--color-foreground)" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-success bg-opacity-10 rounded-md">
              <Icon name="CheckCircle" size={24} color="var(--color-success)" />
              <div>
                <p className="font-medium text-sm text-foreground">Déclaration soumise avec succès</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Soumis le {new Date(declaration?.submitted)?.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-4 space-y-3">
              <h4 className="font-heading font-semibold text-base text-foreground mb-3">
                Informations générales
              </h4>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Type de déclaration</span>
                <span className="text-sm font-medium text-foreground">{declaration?.title}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Période</span>
                <span className="text-sm font-medium text-foreground">{declaration?.period}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Date d'échéance</span>
                <span className="text-sm font-medium text-foreground">
                  {new Date(declaration?.deadline)?.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Numéro de référence</span>
                <span className="text-sm font-medium text-foreground data-text">REF-2024-{Math.floor(Math.random() * 10000)}</span>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-4 space-y-3">
              <h4 className="font-heading font-semibold text-base text-foreground mb-3">
                Détails financiers
              </h4>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Chiffre d'affaires</span>
                <span className="text-sm font-medium text-foreground data-text">
                  {(Math.random() * 50000 + 10000)?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">TVA collectée</span>
                <span className="text-sm font-medium text-foreground data-text">
                  {(Math.random() * 10000 + 2000)?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">TVA déductible</span>
                <span className="text-sm font-medium text-foreground data-text">
                  {(Math.random() * 5000 + 1000)?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 bg-primary bg-opacity-10 px-3 rounded-md mt-3">
                <span className="font-medium text-sm text-foreground">Montant total</span>
                <span className="font-heading font-semibold text-lg text-primary data-text">
                  {declaration?.amount?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <h4 className="font-heading font-semibold text-base text-foreground mb-3">
                Documents joints
              </h4>
              <div className="space-y-2">
                {['Formulaire CA3', 'Justificatifs de TVA', 'Relevé bancaire']?.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-card rounded-md">
                    <div className="flex items-center gap-3">
                      <Icon name="FileText" size={20} color="var(--color-primary)" />
                      <span className="text-sm font-medium text-foreground">{doc}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="Download"
                      iconPosition="left"
                    >
                      Télécharger
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 md:p-6 border-t border-border">
          <Button
            variant="outline"
            size="default"
            onClick={onClose}
          >
            Fermer
          </Button>
          <Button
            variant="default"
            size="default"
            iconName="Download"
            iconPosition="left"
          >
            Télécharger le PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeclarationViewModal;