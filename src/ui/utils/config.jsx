
// Get document type from the DO Piece
export function getDocumentType(DO_Piece) {
  const prefixMap = {
    DE: { type: 'Devis', code: 0 },
    BPL: { type: 'Bon de préparation', code: 2 },
    PL: { type: 'Bon de préparation', code: 2 },
    BC: { type: 'Bon de commande', code: 3 },
    BL: { type: 'Bon de livraison', code: 3 },
    BLX: { type: 'Bon de livraison', code: 13 },
    FA: { type: 'Facture', code: 6 },
    BFA: { type: 'Facture', code: 6 },
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



export function formatDate(date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1 // months are 0-based
  const day = date.getDate()
  return `${year}/${month}/${day}`
}


export const locale = {
  "lang": {
    "locale": "fr_FR",
    "placeholder": "Sélectionner une date",
    "rangePlaceholder": ["Date de début", "Date de fin"],
    "today": "Aujourd’hui",
    "now": "Maintenant",
    "backToToday": "Retour à aujourd’hui",
    "ok": "OK",
    "clear": "Effacer",
    "month": "Mois",
    "year": "Année",
    "timeSelect": "Choisir l’heure",
    "dateSelect": "Choisir la date",
    "monthSelect": "Choisir un mois",
    "yearSelect": "Choisir une année",
    "decadeSelect": "Choisir une décennie",
    "yearFormat": "YYYY",
    "fieldDateFormat": "DD/MM/YYYY",
    "cellDateFormat": "D",
    "fieldDateTimeFormat": "DD/MM/YYYY HH:mm:ss",
    "monthFormat": "MMMM",
    "fieldWeekFormat": "YYYY-wo",
    "monthBeforeYear": false,
    "previousMonth": "Mois précédent (PageUp)",
    "nextMonth": "Mois suivant (PageDown)",
    "previousYear": "Année précédente (Ctrl + gauche)",
    "nextYear": "Année suivante (Ctrl + droite)",
    "previousDecade": "Décennie précédente",
    "nextDecade": "Décennie suivante",
    "previousCentury": "Siècle précédent",
    "nextCentury": "Siècle suivant",
    "shortWeekDays": ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
    "shortMonths": [
      "Janv",
      "Févr",
      "Mars",
      "Avr",
      "Mai",
      "Juin",
      "Juil",
      "Août",
      "Sept",
      "Oct",
      "Nov",
      "Déc"
    ]
  },
  "timePickerLocale": {
    "placeholder": "Sélectionner l’heure"
  }
}
