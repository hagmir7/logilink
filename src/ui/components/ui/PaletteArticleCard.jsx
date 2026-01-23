import { useNavigate } from 'react-router-dom';
import ArticleQuantityInput from './ArticleQuantityInput';
import { Button, message, Popconfirm, Input } from 'antd';
import { Trash, Search } from 'lucide-react';
import { api } from '../../utils/api';
import { upperFirst } from 'lodash';
import { useState, useMemo } from 'react';

export default function PaletteArticleCard({ palette, inventory_id }) {
  const navigate = useNavigate();
  const [articles, setArticles] = useState(
    inventory_id ? palette.inventory_articles : palette.articles
  );
  const [searchTerm, setSearchTerm] = useState('');

  // Helper functions
  const getArticleCode = (article) => article?.code || article?.code_article;
  
  const getArticleName = (article) =>
    upperFirst(
      article.name || article.description || article.designation || '__'
    );

  // Filter articles based on search term
  const filteredArticles = useMemo(() => {
    if (!searchTerm.trim()) return articles;

    const lowerSearch = searchTerm.toLowerCase();
    return articles.filter((article) => {
      const code = getArticleCode(article)?.toLowerCase() || '';
      const name = getArticleName(article)?.toLowerCase() || '';
      const color = article.color?.toLowerCase() || '';

      return (
        code.includes(lowerSearch) ||
        name.includes(lowerSearch) ||
        color.includes(lowerSearch)
      );
    });
  }, [articles, searchTerm]);

  const handleShow = async (id) => {
    try {
      const url = `/articles/${id}`;
      if (window.electron && typeof window.electron.openShow === 'function') {
        await window.electron.openShow({
          width: 1200,
          height: 700,
          url,
        });
      } else {
        navigate(`/articles/${id}`);
      }
    } catch (error) {
      console.error('Error navigating to article:', error);
    }
  };

  const handleDelete = async (articleId, articleCode) => {
    try {
      let url;

      if (inventory_id) {
        url = `inventory/palette/${palette.code}/article/${articleCode}/delete`;
      } else {
        url = `palettes/${palette.code}/delete-article`;
      }

      await api.delete(url, {
        data: {
          article_stock_id: articleId,
        },
      });

      setArticles((prev) =>
        prev.filter((article) => getArticleCode(article) !== articleCode)
      );

      message.success('Article supprimé avec succès');
    } catch (error) {
      console.error('Erreur suppression article:', error);
      message.error(error?.response?.data?.message || 'Erreur', 5);
    }
  };

  return (
    <div className='overflow-hidden rounded-lg'>
      {/* Header with article count and search */}
      {
        articles.length > 10 && (<div className='bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b border-blue-200'>
          <div className='flex items-center justify-between gap-4'>
            <span className='text-sm font-semibold text-blue-900'>
              Articles dans la palette ({filteredArticles.length}/{articles.length})
            </span>
            <Input
              placeholder="Rechercher par code, nom ou couleur..."
              prefix={<Search size={16} className='text-gray-400' />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
              className='max-w-xs'
            />
          </div>
        </div>)
      }
      

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
            {filteredArticles.length === 0 ? (
              <tr>
                <td colSpan={5} className='px-4 py-8 text-center text-gray-500'>
                  {searchTerm ? 'Aucun article trouvé' : 'Aucun article dans cette palette'}
                </td>
              </tr>
            ) : (
              filteredArticles.map((article, index) => {
                const articleCode = getArticleCode(article);
                const articleName = getArticleName(article);

                return (
                  <tr
                    key={articleCode || `${palette.code}-${index}`}
                    className='hover:bg-blue-50 transition-all duration-200 hover:shadow-sm'
                  >
                    <td 
                      className='px-4 py-3 whitespace-nowrap w-full cursor-pointer' 
                      onClick={() => handleShow(articleCode)}
                    >
                      <span className='text-sm font-mono font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded border border-gray-300'>
                        {articleCode || '__'}
                      </span>
                    </td>
                    <td 
                      className='px-4 py-3 whitespace-nowrap w-full cursor-pointer' 
                      onClick={() => handleShow(articleCode)}
                    >
                      <span className='text-sm text-gray-900 font-medium'>
                        {articleName}
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
                        onConfirm={() => handleDelete(article.id, articleCode)}
                      >
                        <Button danger icon={<Trash size={15} />} />
                      </Popconfirm>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}