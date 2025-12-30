import React from 'react';
import Icon from '../../../components/AppIcon';

const TrustBadges = () => {
  const badges = [
    {
      id: 1,
      icon: 'Shield',
      label: 'Conforme RGPD',
      description: 'Protection des données personnelles'
    },
    {
      id: 2,
      icon: 'Lock',
      label: 'Chiffrement SSL',
      description: 'Connexion sécurisée 256-bit'
    },
    {
      id: 3,
      icon: 'FileCheck',
      label: 'Normes Comptables',
      description: 'Conforme aux standards français'
    },
    {
      id: 4,
      icon: 'Award',
      label: 'Certifié DGFIP',
      description: 'Intégration fiscale officielle'
    }
  ];

  return (
    <div className="mt-8 pt-8 border-t border-border">
      <h3 className="text-sm font-medium text-center text-muted-foreground mb-6">
        Sécurité et Conformité
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {badges?.map((badge) => (
          <div
            key={badge?.id}
            className="flex flex-col items-center text-center p-3 rounded-md bg-muted/50 hover:bg-muted transition-smooth"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Icon name={badge?.icon} size={20} color="var(--color-primary)" />
            </div>
            <p className="text-xs font-medium text-foreground mb-1">{badge?.label}</p>
            <p className="text-xs text-muted-foreground">{badge?.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrustBadges;