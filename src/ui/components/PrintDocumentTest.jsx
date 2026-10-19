import { Printer } from 'lucide-react';
import { getExped, getDocumentType } from '../utils/config';
import { api } from '../utils/api';
import React, { useState, useEffect } from 'react';
import { Button, Modal, Select, message } from 'antd';
import { useAuth } from '../contexts/AuthContext';

const { Option } = Select;

export default function PrintDocumentTest({ docentete, doclignes, selectedRows = [], largeSize }) {

  const [visible, setVisible] = useState(false);
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState(null);
  const { user, roles } = useAuth();

  useEffect(() => {
    const fetchPrinters = async () => {
      try {
        const printersList = await window.electron.getPrinters();
        setPrinters(printersList);
      } catch (error) {
        message.warning('Échec du chargement des imprimantes');
      }
    };
    fetchPrinters();
  }, []);

  const dateFormat = (date) => {
    if (!date) return '__';
    const inputDate = new Date(date);
    return `${inputDate.getFullYear()}/${String(inputDate.getMonth() + 1).padStart(2, '0')}/${String(inputDate.getDate()).padStart(2, '0')}`;
  };

  const chunkLines = (lines, size = 40) => {
    const chunks = [];
    for (let i = 0; i < lines.length; i += size) {
      chunks.push(lines.slice(i, i + size));
    }
    return chunks;
  };

  const printingLines = selectedRows.length > 0 ? selectedRows : doclignes;

  const printEvent = async () => {
    try {
      await api.get(`documents/print/${docentete.document.id}`);
      message.success('Document imprimé avec succès');
    } catch (error) {
      console.error(error);
    }
  };

  const handlePrint = () => {
    const content = document.getElementById('print-section').innerHTML;
    const styledHtml = `
      <html>
        <head>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }

            body {
              font-family: Arial, sans-serif;
              font-size: 14px;
              color: #000;
              background: #fff;
              padding: 0;
            }

            @page {
              size: A4;
              margin: 25;
            }

            @media print {
              body { padding: 0; font-size: 14px;margin: 0 }
              .no-print { display: none !important; }
              .page-break { page-break-after: always; }
              .page-break:last-child { page-break-after: auto; }
            }

            /* ── DOCUMENT WRAPPER ───────────────────────── */
            .document-wrap {
              width: 100%;
          
              margin: 0 auto;
            }

            /* ── TOP HEADER (logo | title | ref box) ────── */
  /* ── TOP HEADER TABLE ───────────────────────── */
            .header-table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #000;
              margin-bottom: 10px;
              table-layout: fixed;
            }

          

            .header-table td {
              border: 1px solid #000;
            }

            .header-logo-cell {
              width: 25%;
              text-align: center;
              vertical-align: middle;
              padding: 8px;
            }

            .header-logo-cell img {
              width: 110px;
              display: block;
              margin: 0 auto;
            }

            .header-syst-cell {
              width: 50%;
              font-weight: bold;
              text-align: center;
              vertical-align: middle;
              padding: 6px 8px;
              font-size: 14px;
            }

            .header-title-cell {
              width: 50%;
              font-weight: bold;
              text-align: center;
              vertical-align: middle;
              text-transform: uppercase;
              padding: 8px;
              font-size: 17px;
            }

            .header-ref-cell {
              width: 25%;
              font-size: 14px;
              text-align: center;
              vertical-align: middle;
              padding: 6px 8px;
            }

            /* ── REF BPS / DATE LIVRAISON ROW ───────────── */
            .info-top-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              padding: 0 4px;
            }

            .info-top-row span {
              font-size: 14px;
              font-weight: bold;
            }

            /* ── CLIENT INFO TABLE ───────────────────────── */
            .client-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 14px;
            }

            .client-table th {
              background: #E8693A;
              color: #fff;
              font-weight: bold;
              font-size: 13px;
              text-align: center;
              padding: 5px 8px;
              border: 1px solid #333;
            }

            .client-table td {
              border: 1px solid #333;
              padding: 5px 8px;
              font-size: 11px;
              height: 28px;
            }

            /* ── MAIN DATA TABLE ─────────────────────────── */
            .main-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 14px;
              font-size: 14px;
            }

            .main-table thead th {
              border: 1px solid #333;
              padding: 5px 4px;
              text-align: center;
              font-weight: bold;
              font-size: 14px;
            }

            .main-table tbody td {
              border: 1px solid #333;
              padding: 4px 4px;
              height: 24px;
              font-size: 14px;
            }

            .main-table tbody tr:nth-child(even) td {
              background-color: #e8e8e8;
            }

            .main-table .col-ref { font-weight: bold; width: 9%; }
            .main-table .col-qte { text-align: center; width: 5%; }
            .main-table .col-piece { width: 14%; }
            .main-table .col-dim { text-align: center; width: 5%; }
            .main-table .col-col { text-align: center; width: 7%; }
            .main-table .col-chant { text-align: center; width: 6%; }
            .main-table .col-desc { width: auto; }

            /* ── FOOTER SIGNATURES ───────────────────────── */
            .signature-footer {
              display: flex;
              justify-content: space-between;
              margin-top: 20px;
              padding: 0 4px;
            }

            .signature-footer span {
              font-size: 14px;
              font-weight: bold;
            }

            td {
              font-size: 14px;
            }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `;
    window.electron.ipcRenderer.send('print-content', { htmlContent: styledHtml, printer: selectedPrinter });
    if (!roles('commercial')) {
      printEvent();
    }
  };

  const pages = chunkLines(printingLines, 40);

  return (
    <div>
      {roles(['commercial', 'admin']) ? (
        <>
          <Button
            type="primary"
            onClick={() => setVisible(true)}
            size={largeSize}
            color="cyan"
            variant="solid"
            icon={<Printer size={largeSize ? 40 : 16} />}
          >
            Imprimer
          </Button>
          <Modal
            title="Sélectionner l'imprimante"
            open={visible}
            onOk={handlePrint}
            onCancel={() => setVisible(false)}
            okText="Imprimer"
            cancelText="Annuler"
          >
            <Select
              style={{ width: '100%' }}
              placeholder="Sélectionnez une imprimante"
              onChange={value => setSelectedPrinter(value)}
            >
              {printers.map((printer, index) => (
                <Option key={index} value={printer.name}>{printer.name}</Option>
              ))}
            </Select>
          </Modal>
        </>
      ) : (
        <Button
          onClick={handlePrint}
          style={largeSize ? { height: 60, fontSize: 25 } : {}}
          color="cyan"
          variant="solid"
          icon={<Printer size={largeSize ? 40 : 16} />}
        >
          Imprimer
        </Button>
      )}

      {/* ─────────────── HIDDEN PRINT SECTION ─────────────── */}
      <div id="print-section" style={{ display: 'none' }}>
        {pages.map((pageLines, pageIndex) => (
          <div key={pageIndex} className="document-wrap page-break">

            {/* ── TOP HEADER ── */}
            <table className="header-table">
              <tbody>
                <tr>
                  <td rowSpan="3" className="header-logo-cell">
                    <img src="https://intercocina.com/storage/StileMobili-01.png" alt="StileMobili" />
                  </td>
                  <td className="header-syst-cell">
                    SYSTEME DE MANAGEMENT DE LA QUALITE
                  </td>
                  <td className="header-ref-cell">
                    ENR.FAB.11
                  </td>
                </tr>
                <tr>
                  <td rowSpan="2" className="header-title-cell">
                    Bon de commande des produits spéciaux
                  </td>
                  <td className="header-ref-cell">
                    <strong>Version :</strong> 1.0
                  </td>
                </tr>
                <tr>
                  <td className="header-ref-cell">
                    <strong>Page :</strong> {pageIndex + 1} sur {pages.length}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* ── RÉF BPS / DATE DE LIVRAISON PRÉVUE ── */}
            <div className="info-top-row">
              <span>Réf BPS : {docentete?.DO_Ref || '__'}</span>
              <span>Date de livraison prévue : {docentete?.DO_DateLivr ? dateFormat(docentete.DO_DateLivr) : '__'}</span>
            </div>

            {/* ── CLIENT INFO TABLE ── */}
            <table className="client-table">
              <thead>
                <tr>
                  <th>N° CLIENT</th>
                  <th>N° PL</th>
                  <th>REF CLIENT</th>
                  <th>Catégorie de produit</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{fontSize: 13, fontWeight: 'bold'}}>{docentete?.DO_Tiers || ''}</td>
                  <td style={{fontSize: 13, fontWeight: 'bold'}}>{docentete?.DO_Piece || ''}</td>
                  <td style={{fontSize: 13, fontWeight: 'bold'}}>{docentete?.DO_Ref || ''}</td>
                  <td style={{fontSize: 13, fontWeight: 'bold'}}>☐ Caisson</td>
                </tr>
              </tbody>
            </table>

            {/* ── MAIN DATA TABLE ── */}
            <table className="main-table">
              <thead>
                <tr>
                  <th className="col-ref">Piece</th>
                  <th className="col-piece">Ref Article</th>
                  <th className="col-dim">Hauteur</th>
                  <th className="col-dim">Largeur</th>
                  <th className="col-dim">Profondeur</th>
                  <th className="col-col">Couleur</th>
                  <th className="col-chant">Chant</th>
                  <th className="col-dim">Epaisseur</th>
                  <th className="col-qte">Quantité</th>
                </tr>
              </thead>
              <tbody>
                {pageLines.map((item, index) => {
                  const art = item.article || {};
                  return (
                    <tr key={index}>
                      <td className="col-ref">{item?.Nom || item.article?.Nom || item?.DL_Design || ''}</td>
                      <td className="col-piece">{item.AR_Ref || ''}</td>
                      <td className="col-dim">{item.Hauteur > 0 ? Math.floor(item.Hauteur) : Math.floor(art.Hauteur) || ''}</td>
                      <td className="col-dim">{item.Largeur > 0 ? Math.floor(item.Largeur) : Math.floor(art.Largeur) || ''}</td>
                      <td className="col-dim">{Math.floor(item.Profondeur) || Math.floor(art.Profondeur) || ''}</td>
                      <td className="col-col">{item.Couleur || art.Couleur || ''}</td>
                      <td className="col-chant">{item.Chant || art.Chant || ''}</td>
                      <td className="col-dim">{item.Episseur > 0 ? Math.floor(item.Episseur) : Math.floor(art.Episseur) || ''}</td>
                      <td className="col-qte">{Math.floor(item.EU_Qte || 0)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* ── FOOTER ── */}
            {pageIndex === pages.length - 1 && (
              <div className="signature-footer">
                <span>Date de libération :</span>
                <span>VISA CHEF D'ATELIER :</span>
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}