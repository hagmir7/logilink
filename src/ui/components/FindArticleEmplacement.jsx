import { Input, Spin } from 'antd';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { debounce } from 'lodash';
import InputField from './ui/InputField';
import ArticleEmpacement from '../pages/ArticleEmpacement';
import { api } from '../utils/api';
import { uppercaseFirst } from '../utils/config';
import { MapPin } from 'lucide-react';

export default function FindArticleEmplacement() {
  const [articleData, setArticleData] = useState(null);
  const [articleError, setArticleError] = useState('');
  const [articleCode, setArticleCode] = useState('');
  const [loadingArticle, setLoadingArticle] = useState(false);
  const articleInput = useRef();
  const is_electron = typeof window !== 'undefined' && !!window.electron;


  const fetchArticleData = useCallback(
    debounce(async (code) => {
      if (!code.trim()) return;

      setLoadingArticle(true);
      setArticleData(null);
      try {
        const response = await api.get(`inventory/article/${code}`);
        setArticleData(response.data);
        articleInput.current?.focus();
        setArticleError('');
      } catch (error) {
        setArticleError(
          error.response?.data?.message || 'Article introuvable'
        );
      } finally {
        setLoadingArticle(false);
      }
    }, 500),
    []
  );

  const sanitizeInput = (value) => value.replace(/[\[\]]/g, '');

  const changeArticle = (value) => {
    const cleaned = sanitizeInput(value || '');
    setArticleCode(cleaned);
    setArticleError('');
    setArticleData(null);

    fetchArticleData.cancel();

    if (cleaned.length >= 3) {
      fetchArticleData(cleaned);
    }
  };

  useEffect(() => {
    articleInput.current?.focus();
    return () => fetchArticleData.cancel();
  }, []);

  return (
    <div className="px-2 md:px-5 pt-3 pb-24">
      <h2 className={`${window.electron ? "text-2xl" : 'text-md'} mt-3 font-semibold text-gray-700 my-2`}>Réf Article</h2>

      <div className="flex gap-2">
        <Input
          placeholder="Saisir Réf Article"
          size="large"
          className={is_electron && 'h-[60px]'}
          style={is_electron ? { fontSize: '30px' } : {}}
          ref={articleInput}
          value={articleCode}
          onChange={(e) => changeArticle(e.target.value)}
          allowClear
          suffix={loadingArticle && <Spin size="small" />}
        />

        <InputField
          value={articleCode}
          onChange={(e) => changeArticle(e.target.value)}
          onScan={(value) => changeArticle(value)}
        />
      </div>

      {articleError && <div className="text-red-600 text-sm mb-3">{articleError}</div>}

      {articleData && (
        <div className="bg-gray-100 p-3 rounded-md mt-2">
          <div className={`mb-2 font-bold ${window.electron ? 'text-lg' : 'md'}`}>
            {uppercaseFirst(articleData.description)}
            {articleData.name && ` (${articleData.name})`}
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {articleData.color && (
              <>
                <div className="font-medium">Couleur:</div>
                <div className={window.electron ? 'font-bold text-lg' : "text-base"}>{articleData.color}</div>
              </>
            )}
            <div className="font-medium">Dimensions:</div>
            <div className={window.electron ? 'font-bold text-lg' : "text-base"}>
              {articleData.height || 0} × {articleData.width || 0} × {articleData.depth || 0}
            </div>
            {articleData.thickness > 0 && (
              <>
                <div className="font-medium">Épaisseur:</div>
                <div className={window.electron ? 'font-bold text-lg' : "text-base"}>{articleData.thickness}</div>
              </>
            )}
          </div>
        </div>
      )}

      {articleCode ? (
        <ArticleEmpacement key={articleCode} code={articleCode} />
      ) : (
        <div className="flex justify-center mt-5 w-full">
          <div className="text-center">
            <MapPin size={50} className="text-gray-400 mx-auto" />
            <p className={`text-center mt-6 ${window.electron ? "text-xl": 'text-lg'}`}>Trouver l'emplacement de l'article</p>
          </div>
        </div>
      )}
    </div>
  );
}
