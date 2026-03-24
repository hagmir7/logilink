function printOf(of) {
  const PRINT_STYLE = `
    @page { size: A4; margin: 0mm; }
    body { font-family: Arial, sans-serif; font-size: 12px; }
    table { border-collapse: collapse; width: 100%; }
    td { vertical-align: top; }
  `;

  // Inject preview style (optional)
//   if (!document.getElementById('of-print-style')) {
//     const s = document.createElement('style');
//     s.id = 'of-print-style';
//     s.innerHTML = PRINT_STYLE;
//     document.head.appendChild(s);
//   }

  // Create container if not exists
  let el = document.getElementById('of-print-zone');
  if (!el) {
    el = document.createElement('div');
    el.id = 'of-print-zone';
    el.classList = 'hidden';
    document.body.appendChild(el);
  }

  const checked   = (v) => v ? '&#9745;' : '&#9744;';
  const isStd     = of.type_commande === 'standard';
  const isSpecial = of.type_commande === 'speciale';

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '';

  // Pad lines to at least 13
  const lines  = of.lines || [];
  const padded = [...lines, ...Array(Math.max(0, 13 - lines.length)).fill(null)];

  el.innerHTML = `
    <div style="font-family:Arial,sans-serif; font-size:12px; max-width:780px; margin:0 auto;">

      <!-- ═══ HEADER ═══ -->
      <table style="width:100%; border-collapse:collapse; margin-bottom:18px;">
        <tr>
          <td style="width:130px; border:0.5px solid #000; padding:6px 10px; vertical-align:middle;">
            <div style="display:flex; align-items:center; gap:6px;">
              <div style="display:flex; gap:2px;">
                <div style="width:14px; height:18px; background:#e63312; clip-path:polygon(0 0,60% 0,100% 100%,0 100%);"></div>
                <div style="width:14px; height:18px; background:#1a5fa8; clip-path:polygon(40% 0,100% 0,100% 100%,0 100%);"></div>
              </div>
              <span style="font-size:9px; font-weight:900; letter-spacing:-0.5px; color:#1a5fa8; line-height:1;">
                INTER<span style="color:#e63312;">COCINA</span>
              </span>
            </div>
          </td>
          <td style="border:0.5px solid #000; border-left:none; padding:4px 10px; vertical-align:middle;">
            <div style="font-size:9px; font-weight:700; text-align:center; letter-spacing:0.5px; margin-bottom:4px;">
              SYSTEME DE MANAGEMENT DE LA QUALITE
            </div>
            <div style="font-size:18px; font-weight:900; text-align:center; letter-spacing:0.5px;">
              ORDRE DE FABRICATION
            </div>
          </td>
          <td style="width:120px; border:0.5px solid #000; border-left:none; padding:0; vertical-align:top;">
            <div style="border-bottom:0.5px solid #000; padding:4px 8px; font-size:10px; font-weight:700;">ENR.FAB.01</div>
            <div style="border-bottom:0.5px solid #000; padding:4px 8px; font-size:10px;">Version : 1.0</div>
            <div style="padding:4px 8px; font-size:10px;">Page <b>1</b> | <b>1</b></div>
          </td>
        </tr>
      </table>

      <!-- ═══ INFORMATIONS GÉNÉRALES ═══ -->
      <table style="width:100%; border-collapse:collapse; margin-bottom:12px;">
        <tr>
          <td colspan="4" style="background:#002060; color:#fff; font-size:14px; font-weight:700; text-align:center; padding:7px; border:0.5px solid #000; letter-spacing:0.3px;">
            Informations Générales
          </td>
        </tr>
        <tr>
          <td style="background:#f4b083; font-weight:700; font-size:11px; text-align:center; padding:6px 8px; border:0.5px solid #000; width:20%;">N° OF</td>
          <td style="background:#f4b083; font-weight:700; font-size:11px; text-align:center; padding:6px 8px; border:0.5px solid #000; width:20%;">Date de lancement prévue</td>
          <td style="background:#f4b083; font-weight:700; font-size:11px; text-align:center; padding:6px 8px; border:0.5px solid #000; width:20%;">Date de démarrage</td>
          <td style="background:#f4b083; font-weight:700; font-size:11px; text-align:center; padding:6px 8px; border:0.5px solid #000; width:40%;">Référence Machine</td>
        </tr>
        <tr>
          <td style="border:0.5px solid #000; padding:8px; text-align:center; font-weight:700; font-size:12px;">
            ${of.reference || ''}
          </td>
          <td style="border:0.5px solid #000; padding:8px; text-align:center;">
            ${formatDate(of.date_lancement)}
          </td>
          <td style="border:0.5px solid #000; padding:8px; text-align:center;">
            ${formatDate(of.date_demarrage)}
          </td>
          <td style="border:0.5px solid #000; padding:8px; text-align:center;">
            ${of.reference_machine || ''}
          </td>
        </tr>
      </table>

      <!-- ═══ COMMANDE ═══ -->
      <table style="width:100%; border-collapse:collapse; margin-bottom:14px;">
        <tr>
          <td style="background:#f4b083; font-weight:700; font-size:11px; padding:6px 10px; border:0.5px solid #000; width:18%;">Commande</td>
          <td style="border:0.5px solid #000; padding:6px 16px; width:41%; font-size:12px;">
            ${checked(isStd)} standard
          </td>
          <td style="border:0.5px solid #000; padding:6px 16px; width:41%; font-size:12px;">
            ${checked(isSpecial)} spéciale
          </td>
        </tr>
      </table>

      <!-- ═══ ARTICLES TABLE ═══ -->
      <table style="width:100%; border-collapse:collapse; margin-bottom:16px;">
        <tr>
          <td style="background:#f4b083; font-weight:700; font-size:11px; text-align:center; padding:6px 8px; border:0.5px solid #000; width:22%;">Réf article</td>
          <td style="background:#f4b083; font-weight:700; font-size:11px; text-align:center; padding:6px 8px; border:0.5px solid #000; width:28%;">Désignation</td>
          <td style="background:#f4b083; font-weight:700; font-size:11px; text-align:center; padding:6px 8px; border:0.5px solid #000; width:25%;">Nom</td>
          <td style="background:#f4b083; font-weight:700; font-size:11px; text-align:center; padding:6px 8px; border:0.5px solid #000; width:25%;">Quantité à produire</td>
        </tr>
        ${padded.map(line => `
          <tr>
            <td style="border:0.5px solid #000; padding:7px 8px; font-family:monospace; font-size:11px; font-weight:700;">
              ${line?.article_code || ''}
            </td>
            <td style="border:0.5px solid #000; padding:7px 8px; font-size:11px;">
              ${line?.article?.description || line?.article?.name || ''}
            </td>
            <td style="border:0.5px solid #000; padding:7px 8px; font-size:11px;">
              ${line?.article?.name || ''}
            </td>
            <td style="border:0.5px solid #000; padding:7px 8px; text-align:center; font-weight:700; font-size:12px;">
              ${line ? parseFloat(line.quantity).toFixed(2) : ''}
            </td>
          </tr>
        `).join('')}
      </table>

      <!-- ═══ SIGNATURES ═══ -->
      <table style="width:100%; border-collapse:collapse;">
        <tr>
          <td style="width:33%; padding:4px 0; font-size:11px; font-weight:700; vertical-align:bottom;">
            <span style="border-bottom:0.5px solid #000; padding-bottom:2px;">Date :</span>
            <br/>
            <span style="font-size:10px; font-weight:700; border-bottom:0.5px solid #000; padding-bottom:2px;">
              Fabrication :
            </span>
          </td>
          <td style="width:33%; padding:4px 0; font-size:11px; font-weight:700; vertical-align:bottom; text-align:center;">
            <span style="border-bottom:0.5px solid #000; padding-bottom:2px;">Visa Chef d'atelier :</span>
          </td>
          <td style="width:33%; padding:4px 0; font-size:11px; font-weight:700; vertical-align:bottom; text-align:center;">
            <span style="border-bottom:0.5px solid #000; padding-bottom:2px;">Visa Responsable</span>
          </td>
        </tr>
      </table>

    </div>
  `;

  // SEND FULL HTML TO ELECTRON
  const styledHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>${PRINT_STYLE}</style>
      </head>
      <body>
        ${el.innerHTML}
      </body>
    </html>
  `;

  window.electron.ipcRenderer.send("print-content", { htmlContent: styledHtml });
}

export default printOf;