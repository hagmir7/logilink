import { Button, message } from 'antd';
import { Printer } from 'lucide-react';
import { getExped, getDocumentType } from '../utils/config';
import { api } from '../utils/api';

export default function PrintDocumentTest({ docentete, doclignes, selectedRows = [], largeSize }) {

  const handlePrint = () => {
    const content = document.getElementById("print-section").innerHTML;
    const styledHtml = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, Helvetica, sans-serif;
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

              .footer {
                display: none;
              }
            }

            .document-header {
              display: flex;
              justify-content: space-between;
              padding-bottom: 10px;
            }
            .company-section { flex: 1; }
            .company-name { font-size: 14px; font-weight: bold; margin-bottom: 3px; }
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
              font-family: Arial, Helvetica, sans-serif;
              border-collapse: collapse;
              width: 100%;
              margin-top: 15px;
              font-size: 11px;
            }

            td {
              padding: 8px;
              text-align: center;
              vertical-align: top;
              
            }

        

            tr:nth-child(even) {
              background-color: #f2f2f2;
            }

            .with-bg{
                background-color: #f2f2f2;
            }


                th {
                padding: 12px 0;
                text-align: center;
                border-bottom: 0.3px solid gray;
                color: black;
                font-weight: bold;
                font-size: 12px;
                }

                .ref {
                border-right: 0.3px solid gray;
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
          <div class="footer">
            STILE MOBILI - Document imprimé le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')} - Page 1
          </div>
        </body>
      </html>
    `;
    window.electron.ipcRenderer.send("print-content", styledHtml);
    printEvent();
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

  return (
    <div>
      <Button
        onClick={handlePrint}
        style={largeSize ? {height: 60, fontSize: 25} : {}}
        color='cyan'
        variant='solid'
        icon={<Printer size={ largeSize ? 40 : 16} />}
      >
        Imprimer test
      </Button>

      <div id='print-section' style={{ display: 'none' }}>
        <div className='document-content'>
          <div className='document-header'>
            <div className='company-section'>
              <div className='company-name'>N° CLIENT: {docentete?.DO_Tiers || ''}</div>
              <div className='company-name with-bg'>N° DOC: {docentete?.DO_Piece || ''}</div>
              <div className='company-name'>REF: {docentete?.DO_Ref || ''}</div>
            </div>

            <div className='logo-section'>
              <img src='https://intercocina.com/storage/StileMobili-01.png' alt='StileMobili' />
            </div>

            <div className='client-section'>
             <div className='company-name'><span style={{textAlign: 'left'}}>DATE DOC: </span>     {docentete?.DO_Date ? dateFormat(docentete.DO_Date) : '__'}</div>
              <div className='company-name with-bg'>DATE LIVRE:   {docentete?.DO_DateLivr ? dateFormat(docentete?.DO_DateLivr) : '__'}</div>
              <div className='company-name'>EXPEDITION : {getExped(docentete?.DO_Expedit)}</div>
            </div>
          </div>

          <div className='system-info'>
            <div>STILE MOBILI - LOGILINK PRO version 2.00</div>
            <div>Date de tirage {new Date().toISOString().split('T')[0]} à {new Date().toLocaleTimeString('fr-FR')}</div>
          </div>

          {chunkLines(printingLines, 30).map((pageLines, pageIndex) => (
            <div key={pageIndex} className='page-break'>
              <table>
                <thead>
                  <tr>
                    <th className='ref'>REF</th>
                    <th>QTE</th>
                    <th>PIECE</th>
                    <th>H</th>
                    <th>L</th>
                    <th>P</th>
                    <th>E</th>
                    <th>COL</th>
                    <th>C</th>
                    <th>DESCRIPTION</th>
                  </tr>
                </thead>
                <tbody>
                  {pageLines.map((item, index) => {
                    const art = item.article || {};
                    return (
                      <tr key={index}>
                        <td className='ref'>{item.AR_Ref || '__'}</td>
                        <td>
                          <span>{Math.floor(item.EU_Qte || 0)} </span>
                          <small>{item.EU_Qte !== item.DL_Qte ? `(${Math.floor(item.DL_Qte)}m)` : ''}</small>
                        </td>
                        <td>{item?.Nom || item.article?.Nom || item?.DL_Design || '__'}</td>

                        <td>{item.Hauteur > 0 ? Math.floor(item.Hauteur) : Math.floor(item.article?.Hauteur) || '__'}</td>
                        <td>{item.Largeur > 0 ? Math.floor(item.Largeur) : Math.floor(item?.article?.Largeur) || '__'}</td>
                        <td>{Math.floor(item.Profondeur) ? Math.floor(item.Profondeur) : Math.floor(art.Profonduer) || "__"}</td>
                        <td>{item.Episseur > 0 ? Math.floor(item.Episseur) : Math.floor(item?.article?.Episseur) || '__'}</td>

                        
                        <td>{item.Couleur ? item.Couleur : art.Couleur}</td>
                        <td>{item.Chant || art.Chant || '__'}</td>
                        <td>{item.Poignee} {item.Description}</td>
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
      </div>
    </div>
  )
}