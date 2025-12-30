import React from 'react';
import { X } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const NavigationSidebar = ({ sections, activeSection, onSectionChange, isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 
          transform transition-transform duration-300 z-50 lg:z-0 overflow-y-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <h3 className="font-semibold text-gray-900">Navigation</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <nav className="space-y-1">
            {sections?.map((section) => {
              const Icon = section?.icon;
              const isActive = activeSection === section?.id;

              return (
                <button
                  key={section?.id}
                  onClick={() => {
                    onSectionChange(section?.id);
                    onClose();
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors
                    ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-medium' :'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className="text-sm">{section?.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Ressources
            </h4>
            <div className="space-y-2">
              <a
                href="/api/changelog"
                className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                Journal des modifications
              </a>
              <a
                href="/api/status"
                className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                Statut de l'API
              </a>
              <a
                href="/support"
                className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                Support développeur
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default NavigationSidebar;