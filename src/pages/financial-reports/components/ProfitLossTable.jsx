import React from 'react';

const ProfitLossTable = ({ data, showComparison, comparisonData }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    })?.format(amount);
  };

  const calculateVariance = (current, previous) => {
    if (!previous) return null;
    const variance = ((current - previous) / Math.abs(previous)) * 100;
    return variance?.toFixed(1);
  };

  const renderRow = (item, level = 0) => {
    const paddingClass = level === 0 ? 'pl-4' : level === 1 ? 'pl-8' : 'pl-12';
    const fontClass = level === 0 ? 'font-semibold' : 'font-normal';
    const bgClass = level === 0 ? 'bg-muted/50' : '';

    return (
      <React.Fragment key={item?.id}>
        <tr className={`border-b border-border hover:bg-muted/30 transition-smooth ${bgClass}`}>
          <td className={`py-3 md:py-4 ${paddingClass} text-sm md:text-base ${fontClass}`}>
            {item?.label}
          </td>
          <td className="py-3 md:py-4 px-4 text-right text-sm md:text-base data-text">
            {formatCurrency(item?.amount)}
          </td>
          {showComparison && comparisonData && (
            <>
              <td className="py-3 md:py-4 px-4 text-right text-sm md:text-base text-muted-foreground data-text">
                {formatCurrency(item?.comparisonAmount || 0)}
              </td>
              <td className="py-3 md:py-4 px-4 text-right text-sm md:text-base">
                {item?.comparisonAmount && (
                  <span className={`
                    font-medium
                    ${parseFloat(calculateVariance(item?.amount, item?.comparisonAmount)) >= 0 
                      ? 'text-success' :'text-error'
                    }
                  `}>
                    {calculateVariance(item?.amount, item?.comparisonAmount)}%
                  </span>
                )}
              </td>
            </>
          )}
        </tr>
        {item?.children && item?.children?.map(child => renderRow(child, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead className="bg-muted border-b-2 border-border">
          <tr>
            <th className="py-3 md:py-4 px-4 text-left text-xs md:text-sm font-semibold text-foreground">
              Compte
            </th>
            <th className="py-3 md:py-4 px-4 text-right text-xs md:text-sm font-semibold text-foreground">
              Montant
            </th>
            {showComparison && comparisonData && (
              <>
                <th className="py-3 md:py-4 px-4 text-right text-xs md:text-sm font-semibold text-foreground">
                  Comparaison
                </th>
                <th className="py-3 md:py-4 px-4 text-right text-xs md:text-sm font-semibold text-foreground">
                  Variance
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {data?.map(item => renderRow(item))}
        </tbody>
      </table>
    </div>
  );
};

export default ProfitLossTable;