import React from 'react';
import { 
  Building2, 
  CreditCard, 
  Users, 
  BarChart3, 
  FileCheck, 
  Receipt,
  Package,
  Briefcase,
  MoreHorizontal
} from 'lucide-react';
import Icon from '../../../components/AppIcon';


const CategoryFilter = ({ selectedCategory, onCategoryChange }) => {
  const categories = [
    { value: 'all', label: 'Toutes les catégories', icon: MoreHorizontal },
    { value: 'banking', label: 'Banque', icon: Building2 },
    { value: 'payments', label: 'Paiements', icon: CreditCard },
    { value: 'crm', label: 'CRM', icon: Users },
    { value: 'analytics', label: 'Analytics', icon: BarChart3 },
    { value: 'compliance', label: 'Conformité', icon: FileCheck },
    { value: 'tax', label: 'Fiscalité', icon: Receipt },
    { value: 'inventory', label: 'Inventaire', icon: Package },
    { value: 'hr', label: 'RH', icon: Briefcase }
  ];

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">
        Catégories
      </h3>
      <div className="space-y-1">
        {categories?.map((category) => {
          const Icon = category?.icon;
          const isSelected = selectedCategory === category?.value;
          
          return (
            <button
              key={category?.value}
              onClick={() => onCategoryChange?.(category?.value)}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm
                transition-colors duration-200
                ${isSelected 
                  ? 'bg-primary text-primary-foreground font-medium' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }
              `}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{category?.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;