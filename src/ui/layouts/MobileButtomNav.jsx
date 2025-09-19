import {
  ArrowDownFromLine,
  ArrowRightLeft,
  ArrowUpFromLine,
  ShoppingBag,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('/');

  // Sync activeTab with current location
  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location.pathname]);

  const handleNavClick = (path) => {
    setActiveTab(path);
    navigate(path);
  };

  const navItems = [
    {
      key: 'preparation',
      label: 'Préparation',
      path: '/',
      icon: <ShoppingBag className="h-6 w-6 mb-1" />,
      color: 'blue',
    },
    {
      key: 'sortie',
      label: 'Sortie',
      path: '/stock/out',
      icon: <ArrowUpFromLine className="h-6 w-6 mb-1" />,
      color: 'blue',
    },
    {
      key: 'entree',
      label: 'Entrée',
      path: '/stock/in',
      icon: <ArrowDownFromLine className="h-6 w-6 mb-1" />,
      color: 'blue',
    },
    {
      key: 'transfer',
      label: 'Transfert',
      path: '/transfer-order',
      icon: <ArrowRightLeft className="h-6 w-6 mb-1" />,
      color: 'blue',
    },
  ];

  return (
    <nav className="fixed lg:hidden bottom-0 z-50 left-0 right-0 w-full bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg rounded-t-2xl">
      <div className="flex justify-around items-center py-3 px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.path;
          return (
            <button
              key={item.key}
              onClick={() => handleNavClick(item.path)}
              className={`
                group relative flex flex-col items-center justify-center w-full
                p-2 rounded-xl transition-all duration-200
                ${isActive ? `text-${item.color}-600 bg-${item.color}-50` : 'text-gray-500'}
                hover:text-${item.color}-600 hover:bg-${item.color}-50
                active:scale-95 transform
              `}
            >
              <div className="relative">
                <div
                  className={`transition-transform duration-200 ${
                    isActive ? 'scale-110' : 'group-hover:scale-110 group-active:scale-90'
                  }`}
                >
                  {item.icon}
                </div>
                {isActive && (
                  <div
                    className={`absolute inset-0 bg-${item.color}-400/20 rounded-full scale-150 opacity-100`}
                  ></div>
                )}
              </div>
              <span
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive ? `text-${item.color}-600` : ''
                }`}
              >
                {item.label}
              </span>
              <div
                className={`
                  absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 rounded-full transition-all duration-200
                  ${isActive ? `w-8 bg-${item.color}-600` : 'w-0 bg-transparent group-hover:w-8 group-hover:bg-gray-400'}
                `}
              ></div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
