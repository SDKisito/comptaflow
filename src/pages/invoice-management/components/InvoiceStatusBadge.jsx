import React from 'react';

const InvoiceStatusBadge = ({ status }) => {
  const statusConfig = {
    'Brouillon': {
      bg: 'bg-muted',
      text: 'text-muted-foreground',
      label: 'Brouillon'
    },
    'Envoyée': {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-300',
      label: 'Envoyée'
    },
    'Payée': {
      bg: 'bg-success/10',
      text: 'text-success',
      label: 'Payée'
    },
    'En retard': {
      bg: 'bg-error/10',
      text: 'text-error',
      label: 'En retard'
    },
    'Partiellement payée': {
      bg: 'bg-warning/10',
      text: 'text-warning',
      label: 'Partiellement payée'
    }
  };

  const config = statusConfig?.[status] || statusConfig?.['Brouillon'];

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium font-caption ${config?.bg} ${config?.text}`}>
      {config?.label}
    </span>
  );
};

export default InvoiceStatusBadge;
