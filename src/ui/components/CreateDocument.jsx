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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 font-sans">
      {/* Main Application Window */}
      <div className="bg-white mx-auto">
        
        {/* Title Bar */}
        <div className="bg-blue-600 text-white px-6 py-3  border-b border-blue-700">
          <div className="flex justify-between items-center">
            <h1 className="text-lg font-bold">
              Devis : Envoyé N° 25BDE00454 CL012 INTERIEUR MARROC
            </h1>
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
<div className="space-y-3 grid grid-cols-2 gap-3">
  <div className="flex items-center justify-end gap-2">
    <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Numéro:</span>
    <input
      type="text"
      value={formData.clientNumber}
      onChange={(e) => handleInputChange('client', 'clientNumber', e.target.value)}
      className="w-32 px-3 py-1 border border-gray-300 rounded text-sm font-semibold text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
<div className="flex items-center justify-end gap-2">
  <span className="text-sm text-gray-600 whitespace-nowrap">Date:</span>
  <input
    type="date"
    value={formData.date ? `20${formData.date.slice(0,2)}-${formData.date.slice(2,4)}-${formData.date.slice(4,6)}` : ''}
    onChange={(e) => {
      const dateValue = e.target.value; // Format: YYYY-MM-DD
      if (dateValue) {
        const [year, month, day] = dateValue.split('-');
        const formattedDate = `${year.slice(2)}${month}${day}`; // Convert to YYMMDD
        handleInputChange('client', 'date', formattedDate);
      }
    }}
    className="w-32 px-3 py-1 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>
  <div className="flex items-center justify-end gap-2">
    <span className="text-sm text-gray-600 whitespace-nowrap">N° document:</span>
    <input
      type="text"
      value={formData.documentNumber}
      onChange={(e) => handleInputChange('client', 'documentNumber', e.target.value)}
      className="w-32 px-3 py-1 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
  <div className="flex items-center justify-end gap-2">
    <span className="text-sm text-gray-600 whitespace-nowrap">Référence:</span>
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