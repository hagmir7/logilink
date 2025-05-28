import { Button } from 'antd';
import { Printer } from 'lucide-react';
import { getExped, getDocumentType } from '../utils/config';

export default function PrintDocument({ docentete, doclignes }) {
  const handlePrint = () => {
    const content = document.getElementById("print-section").innerHTML;
    const styledHtml = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #000;
            }
            h2 {
              margin-bottom: 10px;
              color: #000;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 20px;
              margin-bottom: 20px;
            }
            .logo img {
              height: 80px;
            }
            .logo {
              flex-shrink: 0;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .header-section {
              flex: 1;
              font-size: 12px;
            }
            .header-section strong {
              font-size: 14px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              font-size: 12px;
              color: #000;
            }
            th, td {
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #e0e0e0;
            }
            .info-label {
              font-size: 11px;
              margin-bottom: 5px;
              text-transform: uppercase;
            }
            .info-value {
              font-weight: bold;
              font-size: 13px;
              color: #000;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 11px;
              color: #333;
              border-top: 1px solid #000;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          ${content}
          <div class="footer">
            STILE MOBILI - Document imprimé le ${new Date().toLocaleDateString()} - Page 1
          </div>
        </body>
      </html>
    `;
    window.electron.ipcRenderer.send("print-content", styledHtml);
  };

  const dateFormat = (date) => {
    if (!date) return '__';
    const inputDate = new Date(date);
    return `${inputDate.getFullYear()}/${String(inputDate.getMonth() + 1).padStart(2, '0')}/${String(inputDate.getDate()).padStart(2, '0')}`;
  };

  return (
    <div>
      <Button onClick={handlePrint} size="large" type="primary" icon={<Printer />}>
        Imprimer
      </Button>

      <div id="print-section" style={{ display: 'none' }}>
        {/* Header */}
    <div className="header">
      <div className="header-section" style={{ textAlign: 'left' }}>
        <div className="info-label"><strong>STILEMOBILI</strong></div>
        <div className="info-label">FAB. MEUBLES DE CUISINE</div>
        <div className="info-label">4ᵉ TRANCHE ZONE INDUSTRIELLE</div>
        <div className="info-label"><strong>PL {docentete?.DO_Piece || '__'}</strong></div>
        <div className="info-value">{docentete?.DO_Ref || '__'}</div>
      </div>

      <div className="logo">
        <img src="https://intercocina.com/assets/imgs/intercocina-logo.png" alt="Logo" />
      </div>

      <div className="header-section" style={{ textAlign: 'left', alignItems: 'flex-start' }}>
        <div className="info-label"><strong>Client</strong>: {docentete?.DO_Tiers || '__'}</div>
        <div className="info-label">Date: <strong>{docentete?.DO_Date ? dateFormat(docentete.DO_Date) : '__'}</strong></div>
        <div className="info-label">Livraison: <strong>{docentete?.DO_DateLivr ? dateFormat(docentete.DO_DateLivr) : '__'}</strong></div>
        <div className="info-label">Expédition: {getExped(docentete?.DO_Expedit)}</div>
        <div className="info-label">Type: {docentete?.DO_Piece ? getDocumentType(docentete.DO_Piece) : '__'}</div>
      </div>
    </div>


        {/* Document Info */}
        <table>
          <tbody>
            <tr>
              <td>STILE MOBILI - LOGILINK PRO version 2.00</td>
              <td>Date de tirage {new Date().toISOString().split('T')[0]} {"    "} à {new Date().toLocaleTimeString()}</td>
              <td></td>
            </tr>
          </tbody>
        </table>

        {/* Lines Table */}
        <table>
          <thead>
            <tr>
              <th>Pièce</th>
              <th>H x L x P</th>
              <th>Qté</th>
              <th>Couleur</th>
              <th>Chant</th>
              <th>Épaisseur</th>
              <th>Réf Article</th>
            </tr>
          </thead>
          <tbody>
            {doclignes.map((item, index) => {
              const art = item.article || {};              
              return (
                <tr key={index}>
                  <td>
                    <strong>{art.Nom ? art.Nom : item?.DL_Design || '__'} </strong>{" "}
                    <span style={{ fontSize: '11px', color: '#000' }}>
                      {art.Description ? `(${art.Description})` : ''}
                    </span>
                  </td>
                  <td>
                    {`${Math.floor(art.Hauteur || item.Hauteur || 0)} x ${Math.floor(art.Largeur || item.Largeur || 0)} x ${Math.floor(art.Profondeur || item.Profondeur || 0)}`}
                  </td>
                  <td>{Math.floor(item.DL_Qte || 0)}</td>
                  <td>{art.Couleur || item.Couleur || '__'}</td>
                  <td>{art.Chant || item.Chant || '__'}</td>
                  <td>{Math.floor(art.Epaisseur || item.Epaisseur || 0)}</td>
                  <td>{item.AR_Ref || '__'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
