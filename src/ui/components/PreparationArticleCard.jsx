import React from 'react';
import { Button, Tag, Spin } from 'antd';

const PreparationArticleCard = ({ 
  item, 
  index, 
  isElectron = false, 
  loadingId = null, 
  onPrepare 
}) => {
  const isDisabled = item.line.next_role_id == '4';
  const isLoading = loadingId === item.line.id;
  
  const getProductName = () => {
    return [item?.Nom, item.article?.Nom, item?.DL_Design]
      .find(v => v && v !== "NULL") || "Non spécifié";
  };

  const getQuantityTagColor = () => {
    return item.DL_QteBL == Math.floor(item.DL_Qte) ? 'green' : 'red';
  };

  const getDimension = (field) => {
    if (item[field] > 0) return Math.floor(item[field]);
    if (item?.article?.[field]) return Math.floor(item.article[field]);
    return 'N/A';
  };

  const getSpecification = (field) => {
    return (item.article ? item.article[field] : item[field]) || 'N/A';
  };

  return (
    <div
      key={index}
      className={`bg-white border border-gray-300 rounded-md shadow-md hover:shadow-lg transition-shadow duration-200 mb-6 ${
        isElectron ? 'p-6 rounded-xl' : 'p-5'
      } ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {/* Header Section */}
      <div className='flex justify-between items-start mb-3'>
        <div className='flex-1 pr-4'>
          <h3
            className={`font-semibold text-gray-900 leading-tight ${
              isElectron ? 'text-2xl mb-2' : 'text-xl mb-1'
            }`}
          >
            {getProductName()} {item?.Description && (item.Description )} {item?.Poignee}
          </h3>

        </div>
        <Button
          key={item.line.id}
          onClick={() => onPrepare(item.line.id)}
          style={
            isElectron
              ? {
                  fontSize: '20px',
                  height: '56px',
                  padding: '0 28px',
                  display: 'none',
                  borderRadius: '8px',
                }
              : { borderRadius: '6px' }
          }
          color={item.line.status.color}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Spin size='small' style={{ marginRight: 8 }} />
              Préparation...
            </>
          ) : (
            item.line?.status?.name
          )}
        </Button>
      </div>

      {/* Reference and Status Section */}
      <div className='flex justify-between items-center mb-2 pb-2 border-b border-gray-200'>
        <div className='flex flex-col gap-1'>
          <span className={`${isElectron ? 'text-sm' : 'text-xs'} text-gray-500 uppercase tracking-wide font-medium`}>
            Référence
          </span>
          <span className={`${isElectron ? 'text-lg' : 'text-base'} font-semibold text-gray-900`}>
            {item.AR_Ref || 'N/A'}
          </span>
        </div>

        <div className='flex gap-2'>
          <Tag
            color={getQuantityTagColor()}
            style={
              isElectron
                ? { fontSize: '20px', padding: '8px 16px', borderRadius: '6px', fontWeight: '600' }
                : { fontSize: '14px', padding: '6px 12px', borderRadius: '6px', fontWeight: '500' }
            }
          >
            {Number(item.DL_QteBL || 0)}
          </Tag>

          <Tag
            color={item.line.status.color}
            style={
              isElectron
                ? { fontSize: '20px', padding: '8px 16px', borderRadius: '6px', fontWeight: '600' }
                : { fontSize: '14px', padding: '6px 12px', borderRadius: '6px', fontWeight: '500' }
            }
          >
            {item.line?.status?.name}
          </Tag>

          <Tag
            color='blue'
            style={
              isElectron
                ? { fontSize: '20px', padding: '8px 16px', borderRadius: '6px', fontWeight: '600' }
                : { fontSize: '14px', padding: '6px 12px', borderRadius: '6px', fontWeight: '500' }
            }
          >
            <span>{Math.floor(item.EU_Qte || 0)} {" "}</span>
            <small>{item.EU_Qte !== item.DL_Qte ? `(${Math.floor(item.DL_Qte)}m)` : ''}</small>
            {/* Qté: {Math.floor(item.DL_Qte || 0)} */}
          </Tag>
        </div>
      </div>

      {/* Dimensions Section */}
      <div className='mb-5'>
        <div
          className={`grid grid-cols-4 ${
            isElectron ? 'gap-2 text-base' : 'gap-3 text-sm'
          }`}
        >
          <div className='bg-gray-50 rounded-md p-2 border border-gray-100'>
            <div className='text-gray-500 text-md font-medium mb-1'>Hauteur</div>
            <div className='font-bold text-gray-900 text-lg'>{getDimension('Hauteur')}</div>
          </div>
          <div className='bg-gray-50 rounded-md p-2 border border-gray-100'>
            <div className='text-gray-500 text-md font-medium mb-1'>Largeur</div>
            <div className='font-bold text-gray-900 text-lg'>{getDimension('Largeur')}</div>
          </div>
          <div className='bg-gray-50 rounded-md p-2 border border-gray-100'>
            <div className='text-gray-500 text-md font-medium mb-1'>Profondeur</div>
            <div className='font-bold text-gray-900 text-lg'>
              {Math.floor(item.article ? item.article.Profondeur : item.Profondeur) || 'N/A'}
            </div>
          </div>
          <div className='bg-gray-50 rounded-md p-2 border border-gray-100'>
            <div className='text-gray-500 text-md font-medium mb-1'>Épaisseur</div>
            <div className='font-bold text-gray-900 text-lg'>
              {Math.floor(item.article ? item.article.Episseur : item.Episseur) || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Specifications Section */}
      <div>
        <div
          className={`grid grid-cols-2 ${
            isElectron ? 'gap-2 text-base' : 'gap-3 text-sm'
          }`}
        >
          <div className='bg-gray-50 rounded-md p-2 border border-gray-100'>
            <div className='text-gray-500 text-md font-medium mb-1'>Couleur</div>
            <div className='font-bold text-gray-900 text-lg'>{getSpecification('Couleur')}</div>
          </div>
          <div className='bg-gray-50 rounded-md p-2 border border-gray-100'>
            <div className='text-gray-500 text-md font-medium mb-1'>Chant</div>
            <div className='font-bold text-gray-900 text-lg'>{getSpecification('Chant')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreparationArticleCard;

// Usage Example:
// import ProductCard from './ProductCard';
//
