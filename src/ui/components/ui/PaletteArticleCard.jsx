import React from 'react';
import { useNavigate } from 'react-router-dom'
import ArticleQuantityInput from './ArticleQuantityInput';

export default function PaletteArticleCard({palette}) {
    const navigate = useNavigate();

    const handleShow = async (id) => {
      try {
        const url = `/#/articles/${id}`
        if (window.electron && typeof window.electron.openShow === 'function') {
          await window.electron.openShow(url)
        } else {
          navigate(`/articles/${id}`)
        }
      } catch (error) {
        console.error('Error navigating to article:', error)
      }
    }
  return (
    <div className='overflow-hidden rounded-lg border border-gray-200'>
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gradient-to-r from-gray-50 to-gray-100'>
            <tr>
              <th className='px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                Code
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                Nom
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                Quantité
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                Couleur
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-100'>
            {palette.articles.map((article, index) => (
              <tr
                onClick={() => handleShow(article.code)}
                key={article.code || `${palette.code}-${index}`}
                className='hover:bg-blue-50 transition-all duration-200 hover:shadow-sm'
              >
                <td className='px-4 py-4 whitespace-nowrap'>
                  <span className='text-sm font-mono font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded'>
                    {article.code || 'N/A'}
                  </span>
                </td>
                <td className='px-4 py-4 whitespace-nowrap'>
                  <span className='text-sm text-gray-900 font-medium'>
                    {article.name || 'Sans nom'}
                  </span>
                </td>
                <td className='px-4 py-4 whitespace-nowrap'>
                  {/* <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-200'>
                    {article.pivot?.quantity || 0}
                  </span> */}
                  <ArticleQuantityInput
                    defaultValue={article.pivot?.quantity || 0}
                    code={article?.code}
                  />
                </td>
                <td className='px-4 py-4 whitespace-nowrap'>
                  <div className='flex items-center gap-3'>
                    <span className='text-sm text-gray-700 font-mono'>
                      {article.color || 'Non défini'}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
