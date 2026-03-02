import { Printer } from 'lucide-react';
import { getExped, getDocumentType } from '../utils/config';
import { api } from '../utils/api';
import React, { useState, useEffect } from 'react';
import { Button, Modal, Select, message } from 'antd';
import { useAuth } from '../contexts/AuthContext';

const { Option } = Select;

export default function FacadDocumentPrint({ docentete, doclignes, selectedRows = [], largeSize }) {

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
              font-size: 10px;
              color: #000;
              background: #fff;
              padding: 0;
            }

            @page {
              size: A4 landscape;
              margin: 25;
            }

            @media print {
              body { padding: 0; font-size: 10px; margin: 0; }
              .no-print { display: none !important; }
              .page-break { page-break-after: always; }
              .page-break:last-child { page-break-after: auto; }
            }

            /* ── DOCUMENT WRAPPER ───────────────────────── */
            .document-wrap {
              width: 100%;
              margin: 0 auto;
            }

            /* ── TOP HEADER TABLE ───────────────────────── */
            .header-table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #000;
              margin-bottom: 8px;
              table-layout: fixed;
            }

            .header-table td {
              border: 1px solid #000;
            }

            .header-logo-cell {
              width: 20%;
              text-align: center;
              vertical-align: middle;
              padding: 6px;
            }

            .header-logo-cell img {
              width: 100px;
              display: block;
              margin: 0 auto;
            }

            .header-syst-cell {
              width: 40%;
              font-weight: bold;
              text-align: center;
              vertical-align: middle;
              padding: 4px 6px;
              font-size: 12px;
            }

            .header-title-cell {
              width: 40%;
              font-weight: bold;
              text-align: center;
              vertical-align: middle;
              text-transform: uppercase;
              padding: 6px;
              font-size: 14px;
            }

            .header-ref-cell {
              width: 20%;
              font-size: 11px;
              text-align: center;
              vertical-align: middle;
              padding: 4px 6px;
            }

            /* ── REF BPS / DATE LIVRAISON ROW ───────────── */
            .info-top-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              padding: 0 2px;
            }

            .info-top-row span {
              font-size: 11px;
              font-weight: bold;
            }

            /* ── CLIENT INFO TABLE ───────────────────────── */
            .client-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 10px;
            }

            .client-table th {
              background: #F4B083;
              color: #000;
              font-weight: bold;
              font-size: 11px;
              text-align: center;
              padding: 4px 6px;
              border: 1px solid #333;
            }

            .client-table td {
              border: 1px solid #333;
              padding: 4px 6px;
              font-size: 11px;
              height: 24px;
            }

            /* ── MAIN DATA TABLE ─────────────────────────── */
            .main-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 10px;
              font-size: 12px;
              table-layout: fixed;
            }

            .main-table thead th {
              border: 1px solid #333;
              padding: 3px 2px;
              text-align: center;
              font-weight: bold;
              font-size: 12px;
              background: #fff;
              vertical-align: middle;
            }

            .main-table thead th.group-header {
              background: #fff;
              border-bottom: 1px solid #000;
            }

            .main-table tbody td {
              border: 1px solid #333;
              padding: 2px 2px;
              height: 18px;
              font-size: 12px;
            }

            .main-table tbody tr:nth-child(even) td {
              background-color: #e8e8e8;
            }

            /* Column widths */
            .col-piece   { width: 4%;  font-weight: bold; }
            .col-refarticle { width: 7%; }
            .col-dim     { width: 5%;  text-align: center; }
            .col-col     { width: 5%;  text-align: center; }
            .col-chant   { width: 4%;  text-align: center; }
            .col-qte     { width: 4%;  text-align: center; }
            .col-ctrl    { width: 3%;  text-align: center; font-size: 6px; }

            /* ── FOOTER SIGNATURES ───────────────────────── */
            .signature-footer {
              display: flex;
              justify-content: space-between;
              margin-top: 16px;
              padding: 0 4px;
            }

            .signature-footer span {
              font-size: 11px;
              font-weight: bold;
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
                  <td style={{ fontSize: 11, fontWeight: 'bold' }}>{docentete?.DO_Tiers || ''}</td>
                  <td style={{ fontSize: 11, fontWeight: 'bold' }}>{docentete?.DO_Piece || ''}</td>
                  <td style={{ fontSize: 11, fontWeight: 'bold' }}>{docentete?.DO_Ref || ''}</td>
                  <td style={{ fontSize: 11, fontWeight: 'bold' }}>☐ CUISINE</td>
                </tr>
              </tbody>
            </table>

            {/* ── MAIN DATA TABLE ── */}
            <table className="main-table">
              <thead>
                {/* Row 1: base columns (rowSpan=2) + group headers */}
                <tr>
                  <th className="col-piece"   rowSpan="2">Piece</th>
                  <th className="col-refarticle" rowSpan="2">Ref Article</th>
                  <th className="col-dim"     rowSpan="2">Hauteur</th>
                  <th className="col-dim"     rowSpan="2">Largeur</th>
                  <th className="col-col"     rowSpan="2">Couleur</th>
                  <th className="col-chant"   rowSpan="2">Chant</th>
                  <th className="col-dim"     rowSpan="2">Epaisseur</th>
                  <th className="col-qte"     rowSpan="2">Qte</th>
                  {/* Contrôle group headers */}
                  <th className="group-header" colSpan="4" style={{ textAlign: 'center', borderBottom: '1px solid #000' }}>Découpage</th>
                  <th className="group-header" colSpan="4" style={{ textAlign: 'center', borderBottom: '1px solid #000' }}>Placage</th>
                  <th className="group-header" colSpan="4" style={{ textAlign: 'center', borderBottom: '1px solid #000' }}>Autre</th>
                </tr>
                {/* Row 2: sub-column headers for each Contrôle group */}
                <tr>
                  {/* Découpage */}
                  <th className="col-ctrl" style={{fontSize:'10px'}}>Machine</th>
                  <th className="col-ctrl" style={{fontSize:'10px'}}>Date</th>
                  <th className="col-ctrl" style={{fontSize:'10px'}}>Qnt</th>
                  <th className="col-ctrl" style={{fontSize:'10px'}}>Op</th>
                  {/* Placage */}
                  <th className="col-ctrl" style={{fontSize:'10px'}}>Machine</th>
                  <th className="col-ctrl" style={{fontSize:'10px'}}>Date</th>
                  <th className="col-ctrl" style={{fontSize:'10px'}}>Qnt</th>
                  <th className="col-ctrl" style={{fontSize:'10px'}}>Op</th>
                  {/* Autre */}
                  <th className="col-ctrl" style={{fontSize:'10px'}}>Machine</th>
                  <th className="col-ctrl" style={{fontSize:'10px'}}>Date</th>
                  <th className="col-ctrl" style={{fontSize:'10px'}}>Qnt</th>
                  <th className="col-ctrl" style={{fontSize:'10px'}}>Op</th>
                </tr>
              </thead>
              <tbody>
                {pageLines.map((item, index) => {
                  const art = item.article || {};
                  return (
                    <tr key={index}>
                      {/* Base data columns */}
                      <td className="col-piece">{item?.Nom || item.article?.Nom || item?.DL_Design || ''}</td>
                      <td className="col-refarticle">{item.AR_Ref || ''}</td>
                      <td className="col-dim">{item.Hauteur > 0 ? Math.floor(item.Hauteur) : Math.floor(art.Hauteur) || ''}</td>
                      <td className="col-dim">{item.Largeur > 0 ? Math.floor(item.Largeur) : Math.floor(art.Largeur) || ''}</td>
                      <td className="col-col">{item.Couleur || art.Couleur || ''}</td>
                      <td className="col-chant">{item.Chant || art.Chant || ''}</td>
                      <td className="col-dim">{item.Episseur > 0 ? Math.floor(item.Episseur) : Math.floor(art.Episseur) || ''}</td>
                      <td className="col-qte">{Math.floor(item.EU_Qte || 0)}</td>
                      {/* Découpage — empty fill-in cells */}
                      <td className="col-ctrl">&nbsp;</td>
                      <td className="col-ctrl">&nbsp;</td>
                      <td className="col-ctrl">&nbsp;</td>
                      <td className="col-ctrl">&nbsp;</td>
                      {/* Placage — empty fill-in cells */}
                      <td className="col-ctrl">&nbsp;</td>
                      <td className="col-ctrl">&nbsp;</td>
                      <td className="col-ctrl">&nbsp;</td>
                      <td className="col-ctrl">&nbsp;</td>
                      {/* Autre — empty fill-in cells */}
                      <td className="col-ctrl">&nbsp;</td>
                      <td className="col-ctrl">&nbsp;</td>
                      <td className="col-ctrl">&nbsp;</td>
                      <td className="col-ctrl">&nbsp;</td>
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