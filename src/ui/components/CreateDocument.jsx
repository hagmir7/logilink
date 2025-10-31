import React, { useState } from 'react';

const CreateDocument = () => {
  const [formData, setFormData] = useState({
    clientNumber: 'CL012',
    date: '201025',
    documentNumber: 'Souche B',
    reference: '25BDE00454',
    deliveryDate: '20/02/4',
    testReference: '',
    representative: 'Hassan Agmir',
    header: '1',
    expeditionNumber: '',
    port: '',
    articles: [
      { reference: '', designation: '', height: '', width: '', unitPrice: '' },
      { reference: '', designation: '', height: '', width: '', unitPrice: '' }
    ],
    toolsNet: '',
    totalHT: '',
    toolsBrut: '',
    totalHTDevise: ''
  });

  const handleInputChange = (section, field, value, index = null) => {
    if (index !== null) {
      const updatedArticles = [...formData.articles];
      updatedArticles[index][field] = value;
      setFormData({ ...formData, articles: updatedArticles });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const menuItems = [
    { label: 'Batèmes', icon: '📊' },
    { label: 'Informations', icon: 'ℹ️' },
    { label: 'Pied', icon: '📄' },
    { label: 'Imprimer', icon: '🖨️' },
    { label: 'Comptabilité', icon: '💰' },
    { label: 'Transformer', icon: '🔄' },
    { label: 'Valider', icon: '✅' },
    { label: 'Expédition', icon: '🚚' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-6 font-sans">
      {/* Main Application Window */}
      <div className="bg-white rounded-lg shadow-2xl border border-gray-300 max-w-7xl mx-auto">
        
        {/* Title Bar */}
        <div className="bg-blue-600 text-white px-6 py-3 rounded-t-lg border-b border-blue-700">
          <div className="flex justify-between items-center">
            <h1 className="text-lg font-bold">
              Devis : Envoyé N° 25BDE00454 CL012 INTERIEUR MARROC
            </h1>
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Menu Bar */}
        <div className="bg-gray-100 border-b border-gray-300 px-4 py-2">
          <div className="flex space-x-6">
            {menuItems.map((item, index) => (
              <button
                key={index}
                className="flex items-center space-x-1 px-3 py-1 rounded hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200 text-sm font-medium text-gray-700"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Client Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Client Number Card */}
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Client Numéro
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Numéro:</span>
                  <input
                    type="text"
                    value={formData.clientNumber}
                    onChange={(e) => handleInputChange('client', 'clientNumber', e.target.value)}
                    className="w-32 px-3 py-1 border border-gray-300 rounded text-sm font-semibold text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Date:</span>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => handleInputChange('client', 'date', e.target.value)}
                    className="w-32 px-3 py-1 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">N° document:</span>
                  <input
                    type="text"
                    value={formData.documentNumber}
                    onChange={(e) => handleInputChange('client', 'documentNumber', e.target.value)}
                    className="w-32 px-3 py-1 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Référence:</span>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) => handleInputChange('client', 'reference', e.target.value)}
                    className="w-32 px-3 py-1 border border-gray-300 rounded text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Statut Envoyé
                </h3>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                  Envoyé
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Date livraison Prévue:</span>
                  <input
                    type="text"
                    value={formData.deliveryDate}
                    onChange={(e) => handleInputChange('status', 'deliveryDate', e.target.value)}
                    className="w-32 px-3 py-1 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Référence test:</span>
                  <input
                    type="text"
                    value={formData.testReference}
                    onChange={(e) => handleInputChange('status', 'testReference', e.target.value)}
                    placeholder="Entrez la référence"
                    className="w-32 px-3 py-1 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Affaire & Expedition Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Affaire Card */}
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Affaire
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Représentant:</span>
                  <input
                    type="text"
                    value={formData.representative}
                    onChange={(e) => handleInputChange('affaire', 'representative', e.target.value)}
                    className="w-48 px-3 py-1 border border-gray-300 rounded text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Entête:</span>
                  <input
                    type="text"
                    value={formData.header}
                    onChange={(e) => handleInputChange('affaire', 'header', e.target.value)}
                    className="w-16 px-3 py-1 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Expedition Card */}
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Expédition EX-WORK
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">N° Expédition:</span>
                  <input
                    type="text"
                    value={formData.expeditionNumber}
                    onChange={(e) => handleInputChange('expedition', 'expeditionNumber', e.target.value)}
                    placeholder="Numéro d'expédition"
                    className="w-48 px-3 py-1 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Port:</span>
                  <input
                    type="text"
                    value={formData.port}
                    onChange={(e) => handleInputChange('expedition', 'port', e.target.value)}
                    placeholder="Port de destination"
                    className="w-48 px-3 py-1 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200">
                    Valider
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Articles Table */}
          <div className="mb-6">
            <div className="bg-gray-800 text-white px-4 py-2 rounded-t-lg">
              <h3 className="text-sm font-semibold uppercase">Articles</h3>
            </div>
            <div className="border border-gray-300 rounded-b-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-300">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Référence article</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Désignation</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Hauteur</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Largeur</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">P.U. HT</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.articles.map((article, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={article.reference}
                          onChange={(e) => handleInputChange('articles', 'reference', e.target.value, index)}
                          placeholder="Référence"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={article.designation}
                          onChange={(e) => handleInputChange('articles', 'designation', e.target.value, index)}
                          placeholder="Désignation"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={article.height}
                          onChange={(e) => handleInputChange('articles', 'height', e.target.value, index)}
                          placeholder="Hauteur"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={article.width}
                          onChange={(e) => handleInputChange('articles', 'width', e.target.value, index)}
                          placeholder="Largeur"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={article.unitPrice}
                          onChange={(e) => handleInputChange('articles', 'unitPrice', e.target.value, index)}
                          placeholder="Prix unitaire HT"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions and Totals Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Actions Card */}
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Actions
              </h3>
              <div className="flex space-x-3">
                <button className="flex items-center space-x-1 px-4 py-2 border border-gray-400 rounded text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                  <span>➖</span>
                  <span>Actions -</span>
                </button>
                <button className="flex items-center space-x-1 px-4 py-2 border border-gray-400 rounded text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                  <span>➖</span>
                  <span>Actions -</span>
                </button>
              </div>
            </div>

            {/* Totals Card */}
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Tools net:</span>
                  <input
                    type="text"
                    value={formData.toolsNet}
                    onChange={(e) => handleInputChange('totals', 'toolsNet', e.target.value)}
                    placeholder="0.00"
                    className="w-32 px-3 py-1 border border-gray-300 rounded text-sm text-right bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Total HT:</span>
                  <input
                    type="text"
                    value={formData.totalHT}
                    onChange={(e) => handleInputChange('totals', 'totalHT', e.target.value)}
                    placeholder="0.00"
                    className="w-32 px-3 py-1 border border-gray-300 rounded text-sm text-right font-semibold text-blue-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <hr className="border-gray-300" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tools brut:</span>
                  <input
                    type="text"
                    value={formData.toolsBrut}
                    onChange={(e) => handleInputChange('totals', 'toolsBrut', e.target.value)}
                    placeholder="0.00"
                    className="w-32 px-3 py-1 border border-gray-300 rounded text-sm text-right bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total HT devise:</span>
                  <input
                    type="text"
                    value={formData.totalHTDevise}
                    onChange={(e) => handleInputChange('totals', 'totalHTDevise', e.target.value)}
                    placeholder="0.00"
                    className="w-32 px-3 py-1 border border-gray-300 rounded text-sm text-right bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-gray-800 text-white px-6 py-2 rounded-b-lg border-t border-gray-700">
          <div className="flex justify-between items-center text-xs">
            <span>Prêt</span>
            <span>Devis Desktop App</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDocument;