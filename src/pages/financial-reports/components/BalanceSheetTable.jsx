import React from 'react';

const BalanceSheetTable = ({ data, showComparison }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    })?.format(amount);
  };

  const renderSection = (section) => {
    return (
      <div key={section?.id} className="mb-6">
        <div className="bg-primary text-primary-foreground py-2 md:py-3 px-4 rounded-t-lg">
          <h3 className="font-heading font-semibold text-sm md:text-base">{section?.title}</h3>
        </div>
        <div className="border border-t-0 border-border rounded-b-lg overflow-hidden">
          <table className="w-full">
            <tbody>
              {section?.items?.map((item, index) => (
                <tr 
                  key={item?.id} 
                  className={`
                    ${index % 2 === 0 ? 'bg-card' : 'bg-muted/30'}
                    hover:bg-muted/50 transition-smooth
                  `}
                >
                  <td className="py-3 md:py-4 px-4 text-sm md:text-base">
                    {item?.label}
                  </td>
                  <td className="py-3 md:py-4 px-4 text-right text-sm md:text-base font-medium data-text">
                    {formatCurrency(item?.amount)}
                  </td>
                  {showComparison && (
                    <td className="py-3 md:py-4 px-4 text-right text-sm md:text-base text-muted-foreground data-text">
                      {formatCurrency(item?.comparisonAmount || 0)}
                    </td>
                  )}
                </tr>
              ))}
              <tr className="bg-muted border-t-2 border-border font-semibold">
                <td className="py-3 md:py-4 px-4 text-sm md:text-base">
                  Total {section?.title}
                </td>
                <td className="py-3 md:py-4 px-4 text-right text-sm md:text-base data-text">
                  {formatCurrency(section?.total)}
                </td>
                {showComparison && (
                  <td className="py-3 md:py-4 px-4 text-right text-sm md:text-base data-text">
                    {formatCurrency(section?.comparisonTotal || 0)}
                  </td>
                )}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {data?.map(section => renderSection(section))}
    </div>
  );
};

export default BalanceSheetTable;