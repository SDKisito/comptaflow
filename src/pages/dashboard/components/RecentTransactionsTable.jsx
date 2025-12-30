import React from 'react';
import Icon from '../../../components/AppIcon';

const RecentTransactionsTable = ({ transactions }) => {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'invoice':
        return 'FileText';
      case 'expense':
        return 'Receipt';
      case 'payment':
        return 'CreditCard';
      default:
        return 'DollarSign';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'invoice':
        return 'var(--color-primary)';
      case 'expense':
        return 'var(--color-warning)';
      case 'payment':
        return 'var(--color-success)';
      default:
        return 'var(--color-muted-foreground)';
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      paid: 'bg-success text-success-foreground',
      pending: 'bg-warning text-warning-foreground',
      overdue: 'bg-error text-error-foreground',
      draft: 'bg-muted text-muted-foreground'
    };

    return (
      <span className={`px-2 py-1 rounded-md text-xs font-medium ${styles?.[status] || styles?.draft}`}>
        {status === 'paid' && 'Payé'}
        {status === 'pending' && 'En attente'}
        {status === 'overdue' && 'En retard'}
        {status === 'draft' && 'Brouillon'}
      </span>
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1 overflow-hidden">
      <div className="p-4 md:p-6 border-b border-border">
        <h2 className="text-lg md:text-xl font-heading font-semibold text-foreground">
          Transactions Récentes
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-muted-foreground">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-muted-foreground">
                Description
              </th>
              <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-muted-foreground hidden md:table-cell">
                Client
              </th>
              <th className="px-4 py-3 text-right text-xs md:text-sm font-medium text-muted-foreground">
                Montant
              </th>
              <th className="px-4 py-3 text-center text-xs md:text-sm font-medium text-muted-foreground hidden lg:table-cell">
                Statut
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {transactions?.map((transaction) => (
              <tr key={transaction?.id} className="hover:bg-muted transition-smooth">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Icon 
                      name={getTypeIcon(transaction?.type)} 
                      size={18} 
                      color={getTypeColor(transaction?.type)} 
                    />
                    <span className="text-xs md:text-sm text-foreground capitalize hidden sm:inline">
                      {transaction?.type === 'invoice' && 'Facture'}
                      {transaction?.type === 'expense' && 'Dépense'}
                      {transaction?.type === 'payment' && 'Paiement'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs md:text-sm font-medium text-foreground line-clamp-1">
                    {transaction?.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{transaction?.date}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <p className="text-xs md:text-sm text-foreground line-clamp-1">
                    {transaction?.client}
                  </p>
                </td>
                <td className="px-4 py-3 text-right">
                  <p className={`text-xs md:text-sm font-semibold data-text ${
                    transaction?.amount > 0 ? 'text-success' : 'text-error'
                  }`}>
                    {transaction?.amount > 0 ? '+' : ''}{transaction?.amount?.toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR'
                    })}
                  </p>
                </td>
                <td className="px-4 py-3 text-center hidden lg:table-cell">
                  {getStatusBadge(transaction?.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTransactionsTable;