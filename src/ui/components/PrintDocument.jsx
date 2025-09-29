import { Button, message } from 'antd';
import { Printer } from 'lucide-react';
import { getExped, getDocumentType } from '../utils/config';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';

export default function PrintDocument({ docentete, doclignes }) {
  const handlePrint = () => {
    const content = document.getElementById("print-section").innerHTML;
    const styledHtml = `
      <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 15px;
              color: #000;
              background: #fff;
              font-size: 12px;
              line-height: 1.4;
            }
<<<<<<< HEAD
            @page {
                margin: 7; /* remove page margins */
                size: A4;  /* force paper size */
              }
=======
>>>>>>> 5ac528e2cacf7c6445397b472761d14415b55ce6

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
            
            th {
              background-color: gray;
            }

            .company-section {
              flex: 1;
            }

            .company-name {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 2px;
            }

            .company-tagline {
              font-size: 11px;
              margin-bottom: 2px;
            }

            .logo-section {
              flex: 0 0 auto;
              margin: 0 15px;
            }

            .logo-section img {
              height: 90px;
            }

            .client-section {
              flex: 1;
              text-align: right;
            }

            .info-row {
              font-size: 11px;
              margin-bottom: 2px;
            }

            .info-label {
              font-weight: bold;
            }

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
              font-size: 11px;
              color: #000;
            }

            th, td {
              border: 1px solid #333;
<<<<<<< HEAD
              padding: 3px 8px;
=======
              padding: 6px 8px;
>>>>>>> 5ac528e2cacf7c6445397b472761d14415b55ce6
              text-align: left;
              vertical-align: top;
            }

            th {
              background-color: #ccc; /* or use gray, #bbb, etc. */
              font-weight: bold;
              font-size: 11px;
            }

            tbody tr:nth-child(even) {
              background-color: gray;
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
      // message.error(error?.response?.data?.message || "Errur d'imprimer le document");
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

  const { roles } = useAuth();

  return (
    <div>
      <Button
        onClick={handlePrint}
        color='cyan'
        variant='solid'
        icon={<Printer className='h-4 w-4' />}
      >
        Imprimer
      </Button>

      <div id='print-section'
       style={{ display: 'none' }}
       >
        <div className='document-content'>
          <div className='document-header'>
            <div className='company-section'>
              <div className='company-name'>STILE MOBILI</div>
              <div className='company-tagline'>
                Fabricant de meubles de cuisine
              </div>
              <div>4ᵉ Tranche Zone Industrielle</div>
              <div style={{ marginTop: '2px' }}>
                <strong>Pièce: {docentete?.DO_Piece || '__'}</strong>
                <br />
                <span>{docentete?.DO_Ref || '__'}</span>
              </div>
            </div>

            <div className='logo-section'>
              <img
                src='https://intercocina.com/storage/StileMobili-01.png'
                alt='StileMobili'
              />
            </div>

            <div className='client-section'>
              <div className='info-row'>
                <span className='info-label'>Client:</span>{' '}
                {docentete?.DO_Tiers || '__'}
              </div>
              <div className='info-row'>
                <span className='info-label'>Date:</span>{' '}
                {docentete?.DO_Date ? dateFormat(docentete.DO_Date) : '__'}
              </div>
              <div className='info-row'>
                <span className='info-label'>Livraison:</span>{' '}
                {docentete?.DO_DateLivr
                  ? dateFormat(docentete?.DO_DateLivr)
                  : '__'}
              </div>
              <div className='info-row'>
                <span className='info-label'>Expédition:</span>{' '}
                {getExped(docentete?.DO_Expedit)}
              </div>
              <div className='info-row'>
                <span className='info-label'>Type:</span>{' '}
                {docentete?.DO_Piece
                  ? getDocumentType(docentete.DO_Piece)
                  : '__'}
              </div>
            </div>
          </div>

          <div className='system-info'>
            <div>STILE MOBILI - LOGILINK PRO version 2.00</div>
            <div>
              Date de tirage {new Date().toISOString().split('T')[0]} à{' '}
              {new Date().toLocaleTimeString('fr-FR')}
            </div>
          </div>

          {chunkLines(doclignes, 30).map((pageLines, pageIndex) => (
            <div key={pageIndex} className='page-break'>
              <table>
                <thead>
                  <tr>
                    <th>H</th>
                    <th>Pièce</th>
                    <th>L</th>
                    <th>Qté</th>
                    <th>Couleur</th>
                    <th>Chant</th>
<<<<<<< HEAD
                    <th>Description</th>
=======
                    <th>Poignée</th>
>>>>>>> 5ac528e2cacf7c6445397b472761d14415b55ce6
                    <th>ÉP</th>
                    <th>Réf</th>
                  </tr>
                </thead>
                <tbody>
                  {pageLines.map((item, index) => {
                    const art = item.article || {}
                    return (
                      <tr key={index}>
                        <td>{item.Hauteur > 0
                      ? Math.floor(item.Hauteur)
                      : Math.floor(item.article?.Hauteur) || '__'}</td>
                        <td>{item?.Nom || item.article?.Nom || item?.DL_Design || '__'}</td>
                        <td>{item.Largeur > 0 ? Math.floor(item.Largeur) : Math.floor(item?.article?.Largeur) || '__'}</td>
                        
                        <td>{Math.floor(item.DL_Qte || 0)}</td>
                        <td>{item.Couleur ? item.Couleur : art.Couleur}</td>
                        <td>{item.Chant || art.Chant || '__'}</td>
<<<<<<< HEAD
                        {/* <td>{item.Poignee} {" "} {item?.Rotation}</td> */}
                        <td>{item.Description}</td>
                        
=======
                        <td>{item.Poignee} {" "} {item?.Rotation}</td>
>>>>>>> 5ac528e2cacf7c6445397b472761d14415b55ce6
                        <td>{item?.Episseur | item?.article?.Episseur}</td>
                        <td>{item.AR_Ref || '__'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {pageIndex === chunkLines(doclignes, 30).length - 1 && (
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
