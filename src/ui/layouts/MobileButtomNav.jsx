import {
  ArrowDownFromLine,
  ArrowRightLeft,
  ArrowUpFromLine,
  IterationCw,
  LocationEdit,
  Package,
  PlaneLanding,
  Plus,
  ShoppingBag,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button, Modal } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import FindArticleEmplacement from '../components/FindArticleEmplacement';

export default function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('/');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => setIsModalOpen(true);
  const handleOk = () => setIsModalOpen(false);
  const handleCancel = () => setIsModalOpen(false);
  const {roles} = useAuth()

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
      label: 'Plus',
      icon: <Plus className="h-6 w-6 mb-1" />,
      color: 'blue',
      onClick: showModal,
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
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                } else if (item.path) {
                  handleNavClick(item.path);
                }
              }}
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
                  className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-active:scale-90'
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
                className={`text-sm font-medium transition-colors duration-200 ${isActive ? `text-${item.color}-600` : ''
                  }`}
              >
                {item.label}
              </span>
              <div
                className={`
                  absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 rounded-full transition-all duration-200
                  ${isActive
                    ? `w-8 bg-${item.color}-600`
                    : 'w-0 bg-transparent group-hover:w-8 group-hover:bg-gray-400'
                  }
                `}
              ></div>
            </button>
          );
        })}
      </div>

      {/* Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-xl font-semibold">
            <ArrowRightLeft className="w-6 h-6 text-blue-600" />
            Transfert
          </div>
        }
        open={isModalOpen}
        onOk={handleOk}
        footer={false}
        onCancel={handleCancel}
        centered
      >
        <div className="flex flex-col gap-6 mt-6">
          <Button
            type="primary"
            size="large"
            className="flex items-center justify-center gap-3 rounded-2xl shadow-md"
            style={{ fontSize: "1.5rem", height: 60 }}
            onClick={() => {
              navigate('/transfer-order');
              setIsModalOpen(false)
            }}
          >
            <Package className="w-6 h-6" />
            Transfert de Commande
          </Button>

          <Button
            type="default" size="large" color='lime' variant="solid"
            className="flex items-center justify-center gap-3 rounded-2xl shadow-md"
            style={{ fontSize: "1.5rem", height: 60 }}
            onClick={() => {
              navigate('/transfer-stock');
              setIsModalOpen(false)
            }}
          >
            <ArrowRightLeft className="w-6 h-6" />
            Transfert de Stock
          </Button>


          <Button
            color="danger" variant="solid" size="large"
            className="flex items-center justify-center gap-3 rounded-2xl shadow-md"
            style={{ fontSize: "1.5rem", height: 60 }}
            onClick={() => {
              navigate('/reception-movement-list');
              setIsModalOpen(false)
            }}
          >
            <PlaneLanding className="w-6 h-6" />
            Reception
          </Button>

          <Button
            color="gold" variant="solid" size="large"
            className="flex items-center justify-center gap-3 rounded-2xl shadow-md"
            style={{ fontSize: "1.5rem", height: 60 }}
            onClick={() => {
              navigate('/stock/return');
              setIsModalOpen(false);
            }}
          >
            <IterationCw className="w-6 h-6" />
            Movement de Retour
          </Button>

          <Button
            color="pink" variant="solid" size="large"
            className="flex items-center justify-center gap-3 rounded-2xl shadow-md"
            style={{ fontSize: "1.5rem", height: 60 }}
            onClick={() => {
              navigate('/find-article');
              setIsModalOpen(false);
            }}
          >
            <LocationEdit className="w-6 h-6" />
            Rechercher l'article
          </Button>
        </div>
      </Modal>
    </nav>
  );
}
