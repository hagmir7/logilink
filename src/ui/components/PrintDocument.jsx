import { Printer } from 'lucide-react';
import { getExped, getDocumentType } from '../utils/config';
import { api } from '../utils/api';
import React, { useState, useEffect } from 'react';
import { Button, Modal, Select, message } from 'antd';
import { useAuth } from '../contexts/AuthContext'
import { Watermark } from 'antd';
import Barcode from 'react-barcode';

const { Option } = Select;


export default function PrintDocument({ docentete, doclignes, selectedRows = [], largeSize }) {

  const [visible, setVisible] = useState(false);
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState(null);
  const { user, roles } = useAuth()

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



  const handlePrint = () => {
    const content = document.getElementById("print-section").innerHTML;
    const styledHtml = `
      <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 25px;
              color: #000;
              background: #fff;
              font-size: 12px;
              line-height: 1.4;
            }
            @page {
                margin: 25;
                size: A4;
              }

            @media print {
              body {
                margin: 0;
                padding: 0;
                font-size: 11px;
              }

              .page-break {
                page-break-after: always;
              }

              .page-break:last-child {
                page-break-after: auto;
              }

              .signature-footer {
                position: fixed;
                bottom: 0mm;
                left: 0mm;
                right: 0mm;
                height: 32mm;
                page-break-inside: avoid;
              }

              .document-content {
                margin-bottom: 160px;
                padding-bottom: 20px;
              }

              table {
                margin-bottom: 20px;
              }
            }

            .document-header {
              display: flex;
              justify-content: space-between;
              padding-bottom: 10px;
            }
            
            .barcode-container {
              text-align: center;
              margin: 15px 0;
              padding: 10px;
              background: white;
            }

                        
            .barcode-container {
              text-align: center;
              margin: 15px 0;
              padding: 10px;
              background: white;
            }

            th {}
            .company-section { flex: 1; }
            .document-info { font-size: 14px; font-weight: bold; margin-bottom: 4px; }
            .company-tagline { font-size: 11px; margin-bottom: 2px; }
            .logo-section { flex: 0 0 auto; margin: 0 15px; }
            .logo-section img { height: 90px; }
            .client-section { flex: 1; text-align: right; }
            .info-row { font-size: 11px; margin-bottom: 2px; }
            .info-label { font-weight: bold; }

            .system-info {
              border: 1px solid #000;
              padding: 5px 8px;
              margin-bottom: 15px;
              font-size: 10px;
              display: flex;
              justify-content: space-between;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
              font-size: 12px;
              color: #000;
               border-top: 1px solid #333;
               border-left: 1px solid #333;
                border-right: 1px solid #333;
            }

            th, td {
              border-bottom: 1px solid #333;
              padding: 3px 8px;
              text-align: left;
              vertical-align: top;
            }

            th {
              background-color: #ccc;
              font-weight: bold;
              font-size: 11px;
            }

            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 9px;
              color: #777;
              border-top: 1px solid #ccc;
              padding-top: 8px;
            }

            .signature-footer {
              margin-top: 40px;
              display: flex;
              justify-content: space-between;
              border: 2px solid #000;
              height: 120px;
              background: white;
            }

            .signature-section {
              flex: 1;
              padding: 10px;
              display: flex;
              flex-direction: column;
            }

            .signature-section:first-child {
              border-right: 2px solid #000;
            }

            .signature-header {
              font-weight: bold;
              font-size: 14px;
              text-align: center;
              padding: 8px;
              background: #f0f0f0;
              border-bottom: 1px solid #000;
              margin: -10px -10px 10px -10px;
            }

            .signature-content {
              flex: 1;
              display: flex;
              align-items: flex-end;
              justify-content: center;
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `;
    window.electron.ipcRenderer.send("print-content", {htmlContent: styledHtml, printer:selectedPrinter});
    if(!roles('commercial')){
      printEvent();
    }
  };

  const printEvent = async () => {
    try {
      await api.get(`documents/print/${docentete.document.id}`)
      message.success('Document imprimé avec succès')
    } catch (error) {
      console.error(error);
    }
  }

  const dateFormat = (date) => {
    if (!date) return '__';
    const inputDate = new Date(date);
    return `${inputDate.getFullYear()}/${String(inputDate.getMonth() + 1).padStart(2, '0')}/${String(inputDate.getDate()).padStart(2, '0')}`;
  };

  const chunkLines = (lines, size = 30) => {
    const chunks = [];
    for (let i = 0; i < lines.length; i += size) {
      chunks.push(lines.slice(i, i + size));
    }
    return chunks;
  };

  /** NEW: decide what to print */
  const printingLines = selectedRows.length > 0 ? selectedRows : doclignes;

  // Check if any item has Description or Prof values
  const hasDescription = printingLines.some(item => item.Description);
  const hasProf = printingLines.some(item => {
    const art = item.article || {};
    return (item.Profondeur && item.Profondeur > 0) || (art.Profonduer && art.Profonduer > 0);
  });

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
            icon={<Printer size={largeSize ? 30 : 16} />}
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
              style={{ width: "100%" }}
              placeholder="Sélectionnez une imprimante"
              onChange={value => setSelectedPrinter(value)}
            >
              {printers.map((printer, index) => (
                <Option key={index} value={printer.name}>
                  {printer.name}
                </Option>
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
          icon={<Printer size={largeSize ? 30 : 16} />}
        >
          Imprimer
        </Button>
      )}

      <div id='print-section' style={{ display: 'none' }}>
        <Watermark content={['STILE MOBILI']}>
        <div className='document-content'>
          {/* Header */}
          <div className='document-header'>
            <div className='company-section'>
              <div className='document-info'>N° CLIENT : {docentete?.DO_Tiers || ''}</div>
              <div className='document-info bg'>N° DOC  : {docentete?.DO_Piece || ''}</div>
              <div className='document-info'>REF : {docentete?.DO_Ref || '__'}</div>
            </div>

            <div className='logo-section'>
              <img src='https://intercocina.com/storage/StileMobili-01.png' alt='StileMobili' />
            </div>

            <div className='client-section'>
              <div className='document-info'>DATE DOC : {docentete?.DO_Date ? dateFormat(docentete.DO_Date) : '__'}</div>
              <div className='document-info bg'>DATE LIVRE  : {docentete?.DO_DateLivr ? dateFormat(docentete?.DO_DateLivr) : '__'}</div>
              <div className='document-info'>EXPEDITION : {getExped(docentete?.DO_Expedit)}</div>
              {
                chunkLines(printingLines, 30)?.length > 1 && (<div className='info-row'><span className='info-label'>Page:</span> 1 sur {chunkLines(printingLines, 30).length}</div>)
              }
              {/* Barcode inside client section */}
              {docentete?.DO_Piece && (
                <div>
                  <Barcode 
                    value={docentete.DO_Piece} 
                    width={1}
                    height={30}
                    fontSize={10}
                    displayValue={false}
                  />
                </div>
              )}
            </div>
          </div>

          <div className='system-info'>
            <div>STILE MOBILI - LOGILINK PRO version 2.00</div>
            <div>Date de tirage {new Date().toISOString().split('T')[0]} à {new Date().toLocaleTimeString('fr-FR')}</div>
          </div>

          {chunkLines(printingLines, 30).map((pageLines, pageIndex) => (
            <div key={pageIndex} className='page-break'>
              {pageIndex > 0 && (
                <>
                  <div className='document-header'>
                    <div className='company-section'>
                      <div className='document-info'>N° CLIENT : {docentete?.DO_Tiers || ''}</div>
                      <div className='document-info bg'>N° DOC  : {docentete?.DO_Piece || ''}</div>
                      <div className='document-info'>REF : {docentete?.DO_Ref || '__'}</div>
                    </div>

                    <div className='logo-section'>
                      <img src='https://intercocina.com/storage/StileMobili-01.png' alt='StileMobili' />
                    </div>

                    <div className='client-section'>
                      <div className='document-info'>DATE DOC : {docentete?.DO_Date ? dateFormat(docentete.DO_Date) : '__'}</div>
                      <div className='document-info bg'>DATE LIVRE  : {docentete?.DO_DateLivr ? dateFormat(docentete?.DO_DateLivr) : '__'}</div>
                      <div className='document-info'>EXPEDITION : {getExped(docentete?.DO_Expedit)}</div>
                      {
                        chunkLines(printingLines, 30)?.length > 1 && (<div className='info-row'><span className='info-label'>Page:</span> 1 sur {chunkLines(printingLines, 30).length}</div>)
                      }
                      {/* Barcode inside client section */}
                      {docentete?.DO_Piece && (
                        <div>
                          <Barcode 
                            value={docentete.DO_Piece} 
                            width={1}
                            height={30}
                            fontSize={10}
                            displayValue={false}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className='system-info'>
                    <div>STILE MOBILI - LOGILINK PRO version 2.00</div>
                    <div>Date de tirage {new Date().toISOString().split('T')[0]} à {new Date().toLocaleTimeString('fr-FR')}</div>
                  </div>
                </>
              )}
              <table>
                <thead>
                  <tr>
                    <th>Pièce</th>
                    <th>H</th>
                    <th>L</th>
                    {hasProf && <th>Prof</th>}
                    <th>Qté</th>
                    <th>Couleur</th>
                    <th>Chant</th>
                    {hasDescription && <th>Description</th>}
                    <th>ÉP</th>
                    <th>Réf</th>
                  </tr>
                </thead>
                <tbody>
                  {pageLines.map((item, index) => {
                    const art = item.article || {};
                    return (
                      <tr key={index}>
                        <td>{item?.Nom || item.article?.Nom || item?.DL_Design || '__'}</td>
                        <td>{item.Hauteur > 0 ? Math.floor(item.Hauteur) : Math.floor(item.article?.Hauteur) || '__'}</td>
                        <td>{item.Largeur > 0 ? Math.floor(item.Largeur) : Math.floor(item?.article?.Largeur) || '__'}</td>
                        {hasProf && <td>{Math.floor(item.Profondeur) ? Math.floor(item.Profondeur) : Math.floor(art.Profonduer) || "__"}</td>}
                        <td>
                          <span>{Math.floor(item.EU_Qte || 0)} </span>
                          <small>{item.EU_Qte !== item.DL_Qte ? `(${Math.floor(item.DL_Qte)}m)` : ''}</small>
                        </td>
                        <td>{item.Couleur ? item.Couleur : art.Couleur}</td>
                        <td>{item.Chant || art.Chant || '__'}</td>
                        {hasDescription && <td>{item.Description}</td>}
                        <td>{item.Episseur > 0 ? Math.floor(item.Episseur) : Math.floor(item?.article?.Episseur) || '__'}</td>
                        <td>{item?.stock?.code_supplier || item.AR_Ref || '__'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {pageIndex === chunkLines(printingLines, 30).length - 1 && (
                <div className='signature-footer'>
                  <div className='signature-section'>
                    <div className='signature-header'>Date & Heure</div>
                    <div className='signature-content'></div>
                  </div>
                  <div className='signature-section'>
                    <div className='signature-header'>Ramasseur</div>
                    <div className='signature-content'></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        </Watermark>
      </div>
    </div>
  )
}