import { useNavigate } from 'react-router-dom'
import ArticleQuantityInput from './ArticleQuantityInput';
import { Button, message, Popconfirm } from 'antd';
import { Trash } from 'lucide-react';
import { api } from '../../utils/api';
import { upperFirst } from 'lodash';
import { useState } from 'react';

export default function PaletteArticleCard({ palette, inventory_id }) {
  const navigate = useNavigate();
  const [articles, setArticles] = useState(inventory_id ? palette.inventory_articles : palette.articles);

  const handleShow = async (id) => {
    try {
      const url = `/articles/${id}`
      if (window.electron && typeof window.electron.openShow === 'function') {
        await window.electron.openShow({
          width: 1200,
          height: 700,
          url,
        })
      } else {
        navigate(`/articles/${id}`)
      }
    } catch (error) {
      console.error('Error navigating to article:', error)
    }
  }

  const handleDelete = async (article_code) => {
    try {
      let url;
      if (inventory_id) {
        url = `inventory/palette/${palette.code}/article/${article_code}/delete`

      } else {
        url = `palettes/${palette.code}/article/${article_code}/delete`
      }

      await api.delete(url)

      if (inventory_id) {
        setArticles(articles.filter(article => article.code_article !== article_code));
      } else {
        setArticles(articles.filter(article => article.code !== article_code));
      }
      message.success("Article supprimé avec succès")
    } catch (error) {
      console.error("Error supprimé de l'article:", error)
      message.error(error?.response?.data?.message, 5)
    }
  }
  return (
    <div className='overflow-hidden rounded-lg'>
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gradient-to-r from-gray-50 to-gray-100'>
            <tr>
              <th className='px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                Code
              </th>
              <th className='px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                Nom
              </th>
              <th className='px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                Couleur
              </th>
              <th className='px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                Quantité
              </th>

              <th className='px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-100'>
            {articles.map((article, index) => {
              return (<tr
                key={article.code || `${palette.code}-${index}`}
                className='hover:bg-blue-50 transition-all duration-200 hover:shadow-sm'
              >
                <td className='px-4 py-3 whitespace-nowrap w-full' onClick={() => handleShow(article?.code || article?.code_article)}>
                  <span className='text-sm font-mono font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded border border-gray-300'>
                    {article?.code || article?.code_article || '__'}
                  </span>
                </td>
                <td className='px-4 py-3 whitespace-nowrap w-full' onClick={() => handleShow(article?.code || article?.code_article)}>
                  <span className='text-sm text-gray-900 font-medium'>
                    {upperFirst(article.name || article.description || article.designation || '__')}
                  </span>
                </td>
                <td className='px-4 py-3 whitespace-nowrap'>
                  <div className='flex items-center gap-3'>
                    <span className='text-sm text-gray-700 font-mono'>
                      {article.color || '__'}
                    </span>
                  </div>
                </td>
                <td className='px-4 py-3 whitespace-nowrap'>
                  <ArticleQuantityInput
                    defaultValue={article.pivot?.quantity || 0}
                    article={article}
                    palette_code={palette?.code}
                    inventory_id={inventory_id}
                  />
                </td>

                <td className='px-4 py-3 flex gap-2'>
                  <Popconfirm
                    title="Êtes-vous sûr de vouloir supprimer ?"
                    okText="Oui"
                    cancelText="Non"
                    onConfirm={() => handleDelete(article.id)}
                  >
                    <Button danger icon={<Trash size={15} />} />
                  </Popconfirm>
                </td>

              </tr>)
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
