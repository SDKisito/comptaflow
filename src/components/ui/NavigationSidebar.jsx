import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import UserProfileDropdown from './UserProfileDropdown';
import NotificationBadge from './NotificationBadge';

const NavigationSidebar = ({ isCollapsed = false, onToggle }) => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigationItems = [
    {
      label: 'Tableau de Bord',
      path: '/dashboard',
      icon: 'LayoutDashboard',
      tooltip: 'Vue d\'ensemble financière et métriques clés'
    },
    {
      label: 'Facturation',
      path: '/invoice-management',
      icon: 'FileText',
      tooltip: 'Gestion des factures et suivi des paiements',
      badge: { count: 3, type: 'warning' }
    },
    {
      label: 'Clients',
      path: '/client-management',
      icon: 'Users',
      tooltip: 'Gestion de la relation client'
    },
    {
      label: 'Dépenses',
      path: '/expense-tracking',
      icon: 'Receipt',
      tooltip: 'Suivi et catégorisation des dépenses'
    },
    {
      label: 'Rapports',
      path: '/financial-reports',
      icon: 'BarChart3',
      tooltip: 'Analyses financières et business intelligence'
    },
    {
      label: 'Déclarations',
      path: '/tax-declarations',
      icon: 'FileCheck',
      tooltip: 'Conformité fiscale et déclarations réglementaires',
      badge: { count: 2, type: 'error' }
    },
    {
      label: 'Paramètres',
      path: '/account-settings',
      icon: 'Settings',
      tooltip: 'Configuration du compte et système'
    }
  ];

  const isActive = (path) => location?.pathname === path;

  const handleMobileToggle = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      <button
        onClick={handleMobileToggle}
        className="fixed top-4 left-4 z-50 lg:hidden bg-card p-2 rounded-md shadow-elevation-2 transition-smooth hover:shadow-elevation-3"
        aria-label="Toggle navigation menu"
      >
        <Icon name={isMobileOpen ? 'X' : 'Menu'} size={24} color="var(--color-foreground)" />
      </button>
      <aside
        className={`
          fixed lg:fixed top-0 left-0 h-full bg-card border-r border-border z-100
          transition-smooth
          ${isCollapsed ? 'w-20' : 'w-60'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <Icon name="TrendingUp" size={24} color="var(--color-primary-foreground)" />
            </div>
            {!isCollapsed && (
              <span className="sidebar-logo-text ml-3 font-heading font-semibold text-lg text-foreground">
                ComptaFlow
              </span>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto py-6 px-3">
            <ul className="space-y-2">
              {navigationItems?.map((item) => (
                <li key={item?.path}>
                  <Link
                    to={item?.path}
                    onClick={closeMobileMenu}
                    className={`
                      flex items-center h-10 px-3 rounded-md
                      transition-smooth
                      ${isActive(item?.path)
                        ? 'bg-primary text-primary-foreground shadow-elevation-1'
                        : 'text-foreground hover:bg-muted hover:shadow-elevation-1'
                      }
                      ${isCollapsed ? 'justify-center' : 'justify-start'}
                    `}
                    title={isCollapsed ? item?.tooltip : ''}
                  >
                    <Icon
                      name={item?.icon}
                      size={20}
                      color={isActive(item?.path) ? 'var(--color-primary-foreground)' : 'var(--color-foreground)'}
                    />
                    {!isCollapsed && (
                      <>
                        <span className="ml-3 font-medium">{item?.label}</span>
                        {item?.badge && (
                          <NotificationBadge
                            count={item?.badge?.count}
                            type={item?.badge?.type}
                            className="ml-auto"
                          />
                        )}
                      </>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-border p-3">
            <UserProfileDropdown isCollapsed={isCollapsed} />
          </div>
        </div>
      </aside>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-background z-75 lg:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default NavigationSidebar;