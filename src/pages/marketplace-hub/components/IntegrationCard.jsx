import React from 'react';
import { Star, Users, Shield, ExternalLink } from 'lucide-react';

const IntegrationCard = ({ integration, onConnect, userConnections = [] }) => {
  const isConnected = userConnections?.some(
    conn => conn?.integrationId === integration?.id && conn?.status === 'connected'
  );

  const getCategoryIcon = (category) => {
    const icons = {
      banking: '🏦',
      payments: '💳',
      crm: '👥',
      analytics: '📊',
      compliance: '✓',
      tax: '📋',
      inventory: '📦',
      hr: '👔',
      other: '⚙️'
    };
    return icons?.[category] || '⚙️';
  };

  const getPricingLabel = (pricingModel, basePrice, currency) => {
    const labels = {
      free: 'Gratuit',
      freemium: 'Freemium',
      paid_monthly: `${basePrice}${currency}/mois`,
      paid_annual: `${basePrice}${currency}/an`,
      usage_based: 'À l\'usage'
    };
    return labels?.[pricingModel] || 'Contactez-nous';
  };

  const getCertificationIcon = (cert) => {
    const icons = {
      gdpr: { icon: '🔒', label: 'RGPD' },
      french_banking: { icon: '🏦', label: 'Banking FR' },
      pci_dss: { icon: '💳', label: 'PCI DSS' },
      iso27001: { icon: '🔐', label: 'ISO 27001' }
    };
    return icons?.[cert] || { icon: '✓', label: cert };
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">
            {integration?.logoUrl ? (
              <img 
                src={integration?.logoUrl} 
                alt={`${integration?.name} logo`}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-2xl">
                {getCategoryIcon(integration?.category)}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {integration?.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {integration?.providerName}
            </p>
          </div>
        </div>
        {integration?.isFeatured && (
          <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
            Vedette
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {integration?.description}
      </p>
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-warning fill-warning" />
          <span className="font-medium text-foreground">{integration?.rating}</span>
          <span className="text-muted-foreground">
            ({integration?.reviewCount})
          </span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{integration?.installationCount?.toLocaleString('fr-FR')} installations</span>
        </div>
      </div>
      {integration?.complianceCertifications && integration?.complianceCertifications?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {integration?.complianceCertifications?.map((cert, index) => {
            const certInfo = getCertificationIcon(cert);
            return (
              <span 
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-success/10 text-success text-xs rounded"
                title={certInfo?.label}
              >
                <Shield className="w-3 h-3" />
                {certInfo?.label}
              </span>
            );
          })}
        </div>
      )}
      {integration?.features && Array.isArray(integration?.features) && (
        <div className="mb-4">
          <ul className="text-sm text-muted-foreground space-y-1">
            {integration?.features?.slice(0, 3)?.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-success mt-0.5">✓</span>
                <span className="line-clamp-1">{feature}</span>
              </li>
            ))}
            {integration?.features?.length > 3 && (
              <li className="text-xs text-muted-foreground/70 italic">
                +{integration?.features?.length - 3} autres fonctionnalités
              </li>
            )}
          </ul>
        </div>
      )}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="text-sm">
          <span className="font-semibold text-foreground">
            {getPricingLabel(integration?.pricingModel, integration?.basePrice, integration?.currency)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {integration?.documentationUrl && (
            <a
              href={integration?.documentationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              title="Documentation"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <button
            onClick={() => onConnect?.(integration)}
            disabled={isConnected}
            className={`
              px-4 py-2 rounded-md font-medium text-sm transition-colors
              ${isConnected 
                ? 'bg-success/20 text-success cursor-not-allowed' :'bg-primary text-primary-foreground hover:bg-primary/90'
              }
            `}
          >
            {isConnected ? 'Connecté' : 'Connecter'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntegrationCard;