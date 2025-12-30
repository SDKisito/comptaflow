import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const BreadcrumbTrail = () => {
  const location = useLocation();

  const routeLabels = {
    '/dashboard': 'Tableau de Bord',
    '/invoice-management': 'Facturation',
    '/expense-tracking': 'Dépenses',
    '/client-management': 'Clients',
    '/tax-declarations': 'Déclarations',
    '/financial-reports': 'Rapports',
    '/account-settings': 'Paramètres'
  };

  const pathSegments = location?.pathname?.split('/')?.filter(Boolean);
  
  const breadcrumbs = pathSegments?.map((segment, index) => {
    const path = `/${pathSegments?.slice(0, index + 1)?.join('/')}`;
    const label = routeLabels?.[path] || segment?.charAt(0)?.toUpperCase() + segment?.slice(1);
    return { path, label };
  });

  if (breadcrumbs?.length === 0 || location?.pathname === '/login') {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center space-x-2 text-sm">
        <li>
          <Link
            to="/dashboard"
            className="flex items-center text-muted-foreground hover:text-foreground transition-smooth"
          >
            <Icon name="Home" size={16} color="currentColor" />
            <span className="ml-1.5">Accueil</span>
          </Link>
        </li>
        {breadcrumbs?.map((crumb, index) => {
          const isLast = index === breadcrumbs?.length - 1;
          return (
            <li key={crumb?.path} className="flex items-center">
              <Icon
                name="ChevronRight"
                size={16}
                color="var(--color-muted-foreground)"
                className="mx-2"
              />
              {isLast ? (
                <span className="font-medium text-foreground" aria-current="page">
                  {crumb?.label}
                </span>
              ) : (
                <Link
                  to={crumb?.path}
                  className="text-muted-foreground hover:text-foreground transition-smooth"
                >
                  {crumb?.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default BreadcrumbTrail;