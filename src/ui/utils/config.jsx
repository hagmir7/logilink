
// Get document type from the DO Piece
export function getDocumentType(DO_Piece) {
  const prefixMap = {
    DE: { type: 'Devis', code: 0 },
    BPL: { type: 'Bon de préparation logistique', code: 2 },
    PL: { type: 'Bon de préparation', code: 2 },
    BC: { type: 'Bon de commande client', code: 3 },
    BL: { type: 'Bon de livraison', code: 3 },
    BLX: { type: 'Bon de livraison externe', code: 13 },
    FA: { type: 'Facture', code: 6 },
    BFA: { type: 'Facture d’Avoir', code: 6 },
    BDE: { type: 'Bon de demande d’achat', code: 0 },
  }

  const piece = DO_Piece.slice(2);

  for (const key of ["BFA", "BPL", "BLX", "BDE", "DE", "PL", "BC", "BL", "FA"]) {
    if (piece.startsWith(key)) {
      return prefixMap[key].type;
    }
  }

  return "Type inconnu";
}



// Helper function to get shipping method label
export function getExped(exp) {
  const expedMap = {
    1: 'EX-WORK',
    2: 'LA VOIE EXPRESS',
    3: 'SDTM',
    4: 'LODIVE',
    5: 'MTR',
    6: 'CARRE',
    7: 'MAROC EXPRESS',
    8: 'GLOG MAROC',
    9: 'AL JAZZERA',
    10: 'C YAHYA',
    11: 'C YASSIN',
    12: 'GHAZALA',
    13: 'GISNAD',
  }

  return expedMap[exp] || ''
}