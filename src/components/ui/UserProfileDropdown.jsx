import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const UserProfileDropdown = ({ isCollapsed = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const user = {
    name: 'Marie Dubois',
    email: 'marie.dubois@example.fr',
    avatar: null
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(event?.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event?.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    setIsOpen(false);
    navigate('/login');
  };

  const getInitials = (name) => {
    return name?.split(' ')?.map(word => word?.[0])?.join('')?.toUpperCase()?.slice(0, 2);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className={`
          w-full flex items-center p-2 rounded-md
          transition-smooth
          hover:bg-muted hover:shadow-elevation-1
          ${isCollapsed ? 'justify-center' : 'justify-start'}
        `}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium text-sm">
          {getInitials(user?.name)}
        </div>
        {!isCollapsed && (
          <>
            <div className="ml-3 flex-1 text-left">
              <p className="text-sm font-medium text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <Icon
              name={isOpen ? 'ChevronUp' : 'ChevronDown'}
              size={16}
              color="var(--color-muted-foreground)"
            />
          </>
        )}
      </button>
      {isOpen && (
        <div
          className={`
            absolute bottom-full mb-2
            ${isCollapsed ? 'left-0' : 'left-0 right-0'}
            bg-popover border border-border rounded-md shadow-elevation-3
            overflow-hidden
            z-150
          `}
          style={{
            minWidth: isCollapsed ? '200px' : 'auto'
          }}
        >
          <div className="py-2">
            <Link
              to="/account-settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-smooth"
            >
              <Icon name="User" size={16} color="var(--color-foreground)" />
              <span className="ml-3">Mon Profil</span>
            </Link>
            <Link
              to="/account-settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-smooth"
            >
              <Icon name="Settings" size={16} color="var(--color-foreground)" />
              <span className="ml-3">Paramètres</span>
            </Link>
            <div className="border-t border-border my-2" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-sm text-destructive hover:bg-muted transition-smooth"
            >
              <Icon name="LogOut" size={16} color="var(--color-destructive)" />
              <span className="ml-3">Déconnexion</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;