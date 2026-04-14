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
    if (!date) return '__'

    const inputDate = new Date(date)

    const day = inputDate.getDate()
    const month = inputDate.getMonth() + 1
    const year = inputDate.getFullYear()

    return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`
  }


  const chunkLines = (lines, size = 40) => {
    const chunks = [];
    for (let i = 0; i < lines.length; i += size) {
      chunks.push(lines.slice(i, i + size));
    }
    return chunks;
  };

  const printingLines = selectedRows.length > 0 ? selectedRows : doclignes;

  // 1. Sort ALL lines (including SP000001) by DL_Ligne ascending
  const sortedLines = [...printingLines].sort((a, b) =>
    (a.line?.DL_Ligne ?? a.DL_Ligne ?? 0) - (b.line?.DL_Ligne ?? b.DL_Ligne ?? 0)
  );

  // 2. Split into CAI (portrait) and Other (landscape) lists.
  //    SP000001 is a divider — place it on whichever page the lines above it belong to.
  const caiLines   = [];
  const otherLines = [];
  let lastFamily = null; // tracks family of the last real (non-SP) line

  sortedLines.forEach(item => {
    const isSeparator = item.AR_Ref === 'SP000001';

    if (isSeparator) {
      // Append separator to whichever list the previous real lines went into
      if (lastFamily === 'CAI') {
        caiLines.push(item);
      } else if (lastFamily !== null) {
        otherLines.push(item);
      }
      // If lastFamily is still null (SP000001 is the very first line), skip it
    } else {
      lastFamily = item?.article?.FA_CodeFamille;
      if (lastFamily === 'CAI') {
        caiLines.push(item);
      } else {
        otherLines.push(item);
      }
    }
  });

  // Build print groups: [{ lines, orientation }]
  const printGroups = [];
  if (caiLines.length > 0)   printGroups.push({ lines: caiLines,   orientation: 'portrait'  });
  if (otherLines.length > 0) printGroups.push({ lines: otherLines, orientation: 'landscape' });

  const printEvent = async () => {
    try {
      await api.get(`documents/print/${docentete.document.id}`);
      message.success('Document imprimé avec succès');
    } catch (error) {
      console.error(error);
    }
  };

  const buildHtml = (content, orientation) => `
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
            size: A4 ${orientation};
            margin: 25px;
          }

          @media print {
            body { padding: 0; font-size: 10px; margin: 0; }
            .no-print { display: none !important; }
            .page-break { page-break-after: always; }
            .page-break:last-child { page-break-after: auto; }
          }

          .document-wrap { width: 100%; margin: 0 auto; }

          .header-table {
            width: 100%; border-collapse: collapse; border: 1px solid #000;
            margin-bottom: 8px; table-layout: fixed;
          }
          .header-table td { border: 1px solid #000; }
          .header-logo-cell { width: 20%; text-align: center; vertical-align: middle; padding: 6px; }
          .header-logo-cell img { width: 100px; display: block; margin: 0 auto; }
          .header-syst-cell { width: 40%; font-weight: bold; text-align: center; vertical-align: middle; padding: 4px 6px; font-size: 12px; }
          .header-title-cell { width: 40%; font-weight: bold; text-align: center; vertical-align: middle; text-transform: uppercase; padding: 6px; font-size: 14px; }
          .header-ref-cell { width: 20%; font-size: 11px; text-align: center; vertical-align: middle; padding: 4px 6px; }

          .info-top-row { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 0 2px; }
          .info-top-row span { font-size: 11px; font-weight: bold; }

          .client-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
          .client-table th { background: #F4B083; color: #000; font-weight: bold; font-size: 11px; text-align: center; padding: 4px 6px; border: 1px solid #333; }
          .client-table td { border: 1px solid #333; padding: 4px 6px; font-size: 11px; height: 24px; }

          .main-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 12px; table-layout: auto; }
          .main-table thead th { border: 1px solid #333; padding: 3px 2px; text-align: center; font-weight: bold; font-size: 12px; background: #fff; vertical-align: middle; }
          .main-table thead th.group-header { background: #fff; border-bottom: 1px solid #000; }
          .main-table tbody td { border: 1px solid #333; padding: 2px 2px; height: 18px; font-size: 12px; }
          .main-table tbody tr:nth-child(even) td { background-color: #e8e8e8; }

          .col-piece      { font-weight: bold; }
          .col-refarticle { }
          .col-dim        { text-align: center; }
          .col-col        { text-align: center; }
          .col-chant      { text-align: center; }
          .col-qte        { text-align: center; }
          .col-ctrl       { text-align: center; font-size: 6px; }

          .separator-row td {
            background: #d0d0d0 !important;
            border-top: 2px solid #555 !important;
            border-bottom: 2px solid #555 !important;
            height: 6px !important;
            padding: 0 !important;
          }

          .signature-footer { display: flex; justify-content: space-between; margin-top: 16px; padding: 0 4px; }
          .signature-footer span { font-size: 11px; font-weight: bold; }
        </style>
      </head>
      <body>${content}</body>
    </html>
  `;

  const handlePrint = () => {
    printGroups.forEach(({ lines, orientation }) => {
      const sectionId = orientation === 'portrait' ? 'print-section-cai' : 'print-section-other';
      const content = document.getElementById(sectionId).innerHTML;
      window.electron.ipcRenderer.send('print-content', {
        htmlContent: buildHtml(content, orientation),
        printer: selectedPrinter,
        landscape: orientation === 'landscape',
      });
    });

    if (!roles('commercial')) {
      printEvent();
    }
  };

  // ── SHARED PAGE FRAGMENTS ────────────────────────────────────────────────
  const renderPageHeader = (pageIndex, totalPages) => (
    <>
      <table className="header-table">
        <tbody>
          <tr>
            <td rowSpan="3" className="header-logo-cell">
              <img src="https://intercocina.com/assets/imgs/intercocina-logo.png" alt="StileMobili" />
            </td>
            <td className="header-syst-cell">SYSTEME DE MANAGEMENT DE LA QUALITE</td>
            <td className="header-ref-cell">ENR.FAB.11</td>
          </tr>
          <tr>
            <td rowSpan="2" className="header-title-cell">
              Bon de commande des produits spéciaux
            </td>
            <td className="header-ref-cell"><strong>Version :</strong> 1.0</td>
          </tr>
          <tr>
            <td className="header-ref-cell"><strong>Page :</strong> {pageIndex + 1} sur {totalPages}</td>
          </tr>
        </tbody>
      </table>
      <div className="info-top-row">
        <span>Réf BPS : {docentete?.document?.code || '__'}</span>
        <span>Date de livraison prévue : {doclignes[0]?.line.complation_date ? dateFormat(doclignes[0]?.line.complation_date) : '__'}</span>
      </div>
    </>
  );

  const renderClientTable = (categoryType) => (
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
          <td style={{ fontSize: 11, fontWeight: 'bold' }}>☐ {categoryType}</td>
        </tr>
      </tbody>
    </table>
  );

  const renderFooter = () => (
    <div className="signature-footer">
      <span>Date de libération : {doclignes[0]?.line?.fabircation_at ? dateFormat(doclignes[0]?.line?.fabircation_at) : ''}</span>
      <span>VISA CHEF D'ATELIER : {user?.full_name}</span>
    </div>
  );

  // ── TABLE HEADER: landscape (with rows2) vs portrait (no rows2) ──
  const renderTableHead = (isLandscape) => {
    if (isLandscape) {
      return (
        <>
          <colgroup>
            <col style={{ width: '6.25%' }} /><col style={{ width: '6.25%' }} /><col style={{ width: '6.25%' }} /><col style={{ width: '6.25%' }} />
            <col style={{ width: '6.25%' }} /><col style={{ width: '6.25%' }} /><col style={{ width: '6.25%' }} /><col style={{ width: '6.25%' }} />
            <col style={{ width: '4.17%' }} /><col style={{ width: '4.17%' }} /><col style={{ width: '4.17%' }} /><col style={{ width: '4.17%' }} />
            <col style={{ width: '4.17%' }} /><col style={{ width: '4.17%' }} /><col style={{ width: '4.17%' }} /><col style={{ width: '4.17%' }} />
            <col style={{ width: '4.17%' }} /><col style={{ width: '4.17%' }} /><col style={{ width: '4.17%' }} /><col style={{ width: '4.16%' }} />
          </colgroup>
          <thead style={{ tableLayout: 'fixed' }}>
            <tr style={{ height: '50%' }}>
              <th className="col-piece"      rowSpan="2">Piece</th>
              <th className="col-refarticle" rowSpan="2">Ref</th>
              <th className="col-dim"        rowSpan="2">H</th>
              <th className="col-dim"        rowSpan="2">L</th>
              <th className="col-col"        rowSpan="2">Couleur</th>
              <th className="col-chant"      rowSpan="2">C</th>
              <th className="col-dim"        rowSpan="2">Ep</th>
              <th className="col-qte"        rowSpan="2">Qte</th>
              <th className="group-header" colSpan="4" style={{ textAlign: 'center', borderBottom: '1px solid #000' }}>Découpage</th>
              <th className="group-header" colSpan="4" style={{ textAlign: 'center', borderBottom: '1px solid #000' }}>Placage</th>
              <th className="group-header" colSpan="4" style={{ textAlign: 'center', borderBottom: '1px solid #000' }}>Autre</th>
            </tr>
            <tr style={{ height: '50%' }}>
              <th className="col-ctrl" style={{ fontSize: '7px', padding: '1px 1px' }}>Machine</th>
              <th className="col-ctrl" style={{ fontSize: '7px', padding: '1px 1px' }}>Date</th>
              <th className="col-ctrl" style={{ fontSize: '7px', padding: '1px 1px' }}>Qnt</th>
              <th className="col-ctrl" style={{ fontSize: '7px', padding: '1px 1px' }}>Op</th>
              <th className="col-ctrl" style={{ fontSize: '7px', padding: '1px 1px' }}>Machine</th>
              <th className="col-ctrl" style={{ fontSize: '7px', padding: '1px 1px' }}>Date</th>
              <th className="col-ctrl" style={{ fontSize: '7px', padding: '1px 1px' }}>Qnt</th>
              <th className="col-ctrl" style={{ fontSize: '7px', padding: '1px 1px' }}>Op</th>
              <th className="col-ctrl" style={{ fontSize: '7px', padding: '1px 1px' }}>Machine</th>
              <th className="col-ctrl" style={{ fontSize: '7px', padding: '1px 1px' }}>Date</th>
              <th className="col-ctrl" style={{ fontSize: '7px', padding: '1px 1px' }}>Qnt</th>
              <th className="col-ctrl" style={{ fontSize: '7px', padding: '1px 1px' }}>Op</th>
            </tr>
          </thead>
        </>
      );
    }

    return (
      <thead>
        <tr>
          <th className="col-piece">Piece</th>
          <th className="col-refarticle">Ref</th>
          <th className="col-dim">H</th>
          <th className="col-dim">L</th>
          <th className="col-chant">Prof</th>
          <th className="col-col">Couleur</th>
          <th className="col-dim">Ep</th>
          <th className="col-qte">Qte</th>
        </tr>
      </thead>
    );
  };

  // ── TABLE ROW: separator row for SP000001, normal row otherwise ──
  const renderTableRow = (item, index, isLandscape) => {
    const art = item.article || {};
    const isSeparator = item.AR_Ref === 'SP000001';
    const colSpan = isLandscape ? 20 : 8;

    if (isSeparator) {
      return (
        <tr key={index} className="separator-row">
          <td colSpan={colSpan}>&nbsp;</td>
        </tr>
      );
    }

    return (
      <tr key={index}>
        <td className="col-piece"      style={{ fontSize: '12px' }}>{item?.Nom || item.article?.Nom || item?.DL_Design || ''}</td>
        <td className="col-refarticle" style={{ fontSize: '12px' }}>{item.AR_Ref || ''}</td>
        <td className="col-dim"        style={{ fontSize: '12px' }}>{item.Hauteur > 0 ? Math.floor(item.Hauteur) : Math.floor(art.Hauteur) || ''}</td>
        <td className="col-dim"        style={{ fontSize: '12px' }}>{item.Largeur > 0 ? Math.floor(item.Largeur) : Math.floor(art.Largeur) || ''}</td>
         {
          isLandscape
            ? <td className="col-chant" style={{ fontSize: '12px' }}>{item.Chant || art.Chant || ''}</td>
            : <td className="col-chant">{Math.floor(item.Profondeur) || Math.floor(art.Profonduer) || ''}</td>
        }

        <td className="col-col"        style={{ fontSize: '12px' }}>{item.Couleur || art.Couleur || ''}</td>
       
        <td className="col-dim" style={{ fontSize: '12px' }}>{item.Episseur > 0 ? Math.floor(item.Episseur) : Math.floor(art.Episseur) || ''}</td>
        <td className="col-qte" style={{ fontSize: '12px' }}>{Math.floor(item.EU_Qte || 0)}</td>
        {isLandscape && (
          <>
            <td className="col-ctrl">&nbsp;</td>
            <td className="col-ctrl">&nbsp;</td>
            <td className="col-ctrl">&nbsp;</td>
            <td className="col-ctrl">&nbsp;</td>
            <td className="col-ctrl">&nbsp;</td>
            <td className="col-ctrl">&nbsp;</td>
            <td className="col-ctrl">&nbsp;</td>
            <td className="col-ctrl">&nbsp;</td>
            <td className="col-ctrl">&nbsp;</td>
            <td className="col-ctrl">&nbsp;</td>
            <td className="col-ctrl">&nbsp;</td>
            <td className="col-ctrl">&nbsp;</td>
          </>
        )}
      </tr>
    );
  };

  return (
    <div>
      {roles(['commercial', 'admin']) ? (
        <>
          <Button
            type="primary"
            onClick={() => setVisible(true)}
            size={largeSize}
            color="blue"
            variant="solid"
            icon={<Printer size={largeSize ? 40 : 16} />}
          >
            {/* Imprimer */}
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
          color="blue"
          variant="solid"
          icon={<Printer size={largeSize ? 40 : 16} />}
        >
          {/* Imprimer */}
        </Button>
      )}

      {/* ─────────────── HIDDEN PRINT SECTION — CAI (portrait) ─────────────── */}
      {caiLines.length > 0 && (
        <div id="print-section-cai" style={{ display: 'none' }}>
          {chunkLines(caiLines, 40).map((pageLines, pageIndex) => {
            const totalPages = chunkLines(caiLines, 40).length;
            return (
              <div key={pageIndex} className="document-wrap page-break">
                {renderPageHeader(pageIndex, totalPages)}
                {renderClientTable("Caisson")}
                <table className="main-table">
                  {renderTableHead(false)}
                  <tbody>{pageLines.map((item, i) => renderTableRow(item, i, false))}</tbody>
                </table>
                {pageIndex === totalPages - 1 && renderFooter()}
              </div>
            );
          })}
        </div>
      )}

      {/* ─────────────── HIDDEN PRINT SECTION — OTHER (landscape) ─────────────── */}
      {otherLines.length > 0 && (
        <div id="print-section-other" style={{ display: 'none' }}>
          {chunkLines(otherLines, 16).map((pageLines, pageIndex) => {
            const totalPages = chunkLines(otherLines, 16).length;
            return (
              <div key={pageIndex} className="document-wrap page-break">
                {renderPageHeader(pageIndex, totalPages)}
                {renderClientTable("Autre")}
                <table className="main-table">
                  {renderTableHead(true)}
                  <tbody>{pageLines.map((item, i) => renderTableRow(item, i, true))}</tbody>
                </table>
                {pageIndex === totalPages - 1 && renderFooter()}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}