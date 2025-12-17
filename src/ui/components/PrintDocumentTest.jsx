import { Printer, ReceiptText } from 'lucide-react';
import { getExped, getDocumentType } from '../utils/config';
import { api } from '../utils/api';
import React, { useState, useEffect } from 'react';
import { Button, Modal, Select, message } from 'antd';
import { useAuth } from '../contexts/AuthContext'

const { Option } = Select;


export default function PrintDocumentTest({ docentete, doclignes, selectedRows = [], largeSize }) {

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
        message.error('Échec du chargement des imprimantes');
      }
    };
    fetchPrinters();
  }, []);

  const handlePrintPdf = async () => {
    if (!selectedPrinter) {
      message.warning('Veuillez sélectionner une imprimante.');
      return;
    }

    try {
      await window.electron.printPaletteTickets(selectedPrinter, {
        docentete,
        palettes: palettes.length > 0 ? palettes : docentete?.document?.palettes?.filter(palette => palette?.company_id == user?.company_id)
      });
      message.success("L'impression a commencé !");
      setVisible(false);
    } catch (error) {
      console.error(error);
      message.error("L'impression a échoué.");
    }
  };


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

/* ===============================
   PRINT RULES
================================= */
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

/* ===============================
   HEADER
================================= */
.document-header {
  display: flex;
  justify-content: space-between;
  padding-bottom: 10px;
  border-bottom: 1px solid #1f3a5f;
}

.company-section,
.client-section {
  flex: 1;
}

.company-name {
  font-size: 14px;
  font-weight: bold;
  color: black;
  margin-bottom: 8px;
  padding-left:2px;
  padding-right:2px;

}

.company-name-bg {
  font-size: 14px;
  font-weight: bold;
  color: black;
  margin-bottom: 8px
  
}

.company-name-bg span {
  background: #e0e2e3;
  padding:4px
}

.logo-section img {
  height: 90px;
}

.client-section {
  text-align: right;
}

.info-row {
  font-size: 11px;
  margin-bottom: 2px;
}

.info-label {
  font-weight: bold;
  color: black;
}

/* ===============================
   SYSTEM INFO
================================= */
.system-info {
  border: 1px solid #cbd5e1;
  background: #dbdedf;
  padding: 5px 8px;
  margin: 12px 0 15px 0;
  font-size: 12px;
  display: flex;
  font-weight: bold;
  justify-content: space-between;
}


/* ===============================
   TABLE
================================= */
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
  font-size: 11px;
}

thead th {
  color: black;
  font-weight: bold;
  padding: 6px 8px;
  border-bottom: 1px solid gray;

}
.center{
  text-align:center
}

tbody td {
  padding: 5px 8px;

}

/* BARDAGE */
tbody tr:nth-child(even) {
  background-color: #dbdedf;
}

tbody td:first-child {
  border-right: 1px solid gray;
}

/* ===============================
   SIGNATURE
================================= */
.signature-footer {
  margin-top: 40px;
  display: flex;
  justify-content: space-between;
  border: 2px solid #1f3a5f;
  height: 120px;
}

.signature-section {
  flex: 1;
  padding: 10px;
}
  .ref{
    font-weight: bold;
  }

.signature-section:first-child {
  border-right: 2px solid #1f3a5f;
}

.signature-header {
  font-weight: bold;
  font-size: 14px;
  text-align: center;
  padding: 8px;
  background: #f1f5f9;
  border-bottom: 1px solid #1f3a5f;
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

  const chunkLines = (lines, size = 40) => {
    const chunks = [];
    for (let i = 0; i < lines.length; i += size) {
      chunks.push(lines.slice(i, i + size));
    }
    return chunks;
  };

  /** NEW: decide what to print */
  const printingLines = selectedRows.length > 0 ? selectedRows : doclignes;

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
            Imprimer Test
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
          icon={<Printer size={largeSize ? 40 : 16} />}
        >
          Imprimer
        </Button>
      )}


      

      <div id='print-section' style={{ display: 'none' }}>
        <div className='document-content'>
          <div className='document-header'>
            <div className='company-section'>
              <div className='company-name'>N° CLIENT : {docentete?.DO_Tiers || ''}</div>
              <div className='company-name bg'>N° DOC  : {docentete?.DO_Piece || ''}</div>
              <div className='company-name'>REF : {docentete?.DO_Ref || '__'}</div>
            </div>

            <div className='logo-section'>
              <img src='https://intercocina.com/storage/StileMobili-01.png' alt='StileMobili' />
            </div>

            <div className='client-section'>
                 <div className='company-name'>DATE DOC : {docentete?.DO_Date ? dateFormat(docentete.DO_Date) : '__'}</div>
              <div className='company-name bg'>DATE LIVRE  : {docentete?.DO_DateLivr ? dateFormat(docentete?.DO_DateLivr) : '__'}</div>
              <div className='company-name'>EXPEDITION : {getExped(docentete?.DO_Expedit)}</div>
              {
                chunkLines(printingLines, 40)?.length > 1 && ( <div className='info-row'><span className='info-label'>Page:</span> 1 sur {chunkLines(printingLines, 40).length}</div>)
              }
             
            </div>
          </div>

          <div className='system-info'>
            <div>STILE MOBILI - LOGILINK PRO version 2.00</div>
            <div>Date de tirage {new Date().toISOString().split('T')[0]} à {new Date().toLocaleTimeString('fr-FR')}</div>
          </div>

          {chunkLines(printingLines, 40).map((pageLines, pageIndex) => (
            <div key={pageIndex} className='page-break'>
              {pageIndex > 0 && (
                <>
                  <div className='document-header'>
                    <div className='company-section'>
                      <div className='company-name'>STILE MOBILI</div>
                      <div className='company-tagline'>Fabricant de meubles de cuisine</div>
                      <div>4ᵉ Tranche Zone Industrielle</div>
                      <div style={{ marginTop: '2px' }}>
                        <strong>Pièce: {docentete?.DO_Piece || '__'}</strong><br />
                        <span>{docentete?.DO_Ref || '__'}</span>
                      </div>
                    </div>

                    <div className='logo-section'>
                      <img src='https://intercocina.com/storage/StileMobili-01.png' alt='StileMobili' />
                    </div>

                    <div className='client-section'>
                      <div className='info-row'><span className='info-label'>Client:</span> {docentete?.DO_Tiers || '__'}</div>
                      <div className='info-row'><span className='info-label'>Date:</span> {docentete?.DO_Date ? dateFormat(docentete.DO_Date) : '__'}</div>
                      <div className='info-row'><span className='info-label'>Livraison:</span> {docentete?.DO_DateLivr ? dateFormat(docentete?.DO_DateLivr) : '__'}</div>
                      <div className='info-row'><span className='info-label'>Expédition:</span> {getExped(docentete?.DO_Expedit)}</div>
                      <div className='info-row'><span className='info-label'>Type:</span> {docentete?.DO_Piece ? getDocumentType(docentete.DO_Piece) : '__'}</div>
                      <div className='info-row'><span className='info-label'>Page:</span> {pageIndex + 1} sur {chunkLines(printingLines, 40).length}</div>
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
                    <th>REF</th>
                    <th>QTE</th>
                    <th>PIECE</th>
                    <th>H</th>
                    <th>L</th>
                    <th>P</th>
                    <th>É</th>
                    <th>COL</th>
                   
                 
                    <th>C</th>
                    <th>Description</th>
                   
                    
                  </tr>
                </thead>
                <tbody>
                  {pageLines.map((item, index) => {
                    const art = item.article || {};
                    return (
                      <tr key={index}>
                        <td  className='ref'>{item.AR_Ref || '__'}</td>
                         <td  className='center'>
                          <span>{Math.floor(item.EU_Qte || 0)} </span>
                          <small>{item.EU_Qte !== item.DL_Qte ? `(${Math.floor(item.DL_Qte)}m)` : ''}</small>
                        </td>

                        <td>{item?.Nom || item.article?.Nom || item?.DL_Design || '__'}</td>

                        <td  className='center'>{item.Hauteur > 0 ? Math.floor(item.Hauteur) : Math.floor(item.article?.Hauteur) || '__'}</td>
                      
                        <td  className='center'>{item.Largeur > 0 ? Math.floor(item.Largeur) : Math.floor(item?.article?.Largeur) || '__'}</td>
                        
                        <td  className='center'>{Math.floor(item.Profondeur) ? Math.floor(item.Profondeur) : Math.floor(art.Profonduer) || "__"}</td>

                        <td  className='center'>{item.Episseur > 0 ? Math.floor(item.Episseur) : Math.floor(item?.article?.Episseur) || '__'}</td>

                        <td  className='center'>{item.Couleur ? item.Couleur : art.Couleur}</td>

                      
                        <td  className='center'>{item.Chant || art.Chant || '__'}</td>

                        <td>{item.Poignee} {item.Description}</td>

                        
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {pageIndex === chunkLines(printingLines, 40).length - 1 && (
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
      </div>
    </div>
  )
}