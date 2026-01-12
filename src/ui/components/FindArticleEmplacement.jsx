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
      {articleData && (() => {
        const supplierRef =
          articleData.code_supplier ||
          articleData.code_supplier_2 ||
          articleData.qr_code;

        const valueClass = window.electron
          ? 'font-bold text-lg'
          : 'text-base font-medium';

        return (
          <div className="bg-gray-100 p-4 rounded-lg mt-2 space-y-3">

            {/* Title */}
            <div className={`font-bold ${window.electron ? 'text-xl' : 'text-lg'}`}>
              {uppercaseFirst(articleData.description)}
              {articleData.name && (
                <span className="font-normal text-gray-600">
                  {' '}({articleData.name})
                </span>
              )}
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">

              {articleData.color && (
                <>
                  <div className="text-gray-600">Couleur</div>
                  <div className={valueClass}>{articleData.color}</div>
                </>
              )}

              <div className="text-gray-600">Dimensions</div>
              <div className={valueClass}>
                {articleData.height || 0} × {articleData.width || 0} × {articleData.depth || 0}
              </div>

              {articleData.thickness > 0 && (
                <>
                  <div className="text-gray-600">Épaisseur</div>
                  <div className={valueClass}>{articleData.thickness}</div>
                </>
              )}

              <>
                <div className="text-gray-600">Réf. Article</div>
                <div className={valueClass}>{articleData.code}</div>
              </>
              {supplierRef && (
                <>
                  <div className="text-gray-600">Réf. Fournisseur</div>
                  <div className={valueClass}>{supplierRef}</div>
                </>
              )}

            </div>
          </div>
        );
      })()}


      {articleCode ? (
        <ArticleEmpacement key={articleCode} code={articleCode} />
      ) : (
        <div className="flex justify-center mt-5 w-full">
          <div className="text-center">
            <MapPin size={50} className="text-gray-400 mx-auto" />
            <p className={`text-center mt-6 ${window.electron ? "text-xl" : 'text-lg'}`}>Trouver l'emplacement de l'article</p>
          </div>
        </div>
      )}
    </div>
  );
}
