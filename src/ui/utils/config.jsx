
// Get document type from the DO Piece
export function getDocumentType(DO_Piece) {
  const prefixMap = {
    DE: { type: 'Devis', code: 0 },
    PL: { type: 'Préparation de livraison', code: 2 },
    BL: { type: 'Bon de livraison', code: 3 },
    FA: { type: 'Facture', code: 6 },
    BLX: { type: 'Bon d’achat', code: 13 },
  }

  const piece = DO_Piece.slice(2);

  for (const key of ["DE", "PL", "BL", "FA", "BLX", "PL", "BC", "BL", "FA"]) {
    if (piece.startsWith(key)) {
      return prefixMap[key]?.type;
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


const statuses = [
  { id: 1, name: "Transféré", color: "#f39c12" },
  { id: 2, name: "Reçu", color: "#27ae60" },
  { id: 3, name: "Fabrication", color: "#2980b9" },
  { id: 4, name: "Fabriqué", color: "#3498db" },
  { id: 5, name: "Montage", color: "#9b59b6" },
  { id: 6, name: "Monté", color: "#8e44ad" },
  { id: 7, name: "Préparation", color: "#16a085" },
  { id: 8, name: "Préparé", color: "#1abc9c" },
  { id: 9, name: "Contrôle", color: "#d35400" },
  { id: 10, name: "Contrôlé", color: "#e67e22" },
  { id: 11, name: "Validé", color: "#2ecc71" },
  { id: 12, name: "Prêt", color: "#34495e" },
  { id: 13, name: "À livrer", color: "#e74c3c" },
  { id: 14, name: "Livré", color: "#2c3e50" }
];

export function getStatus(id) {
  return statuses.find(status => status.id === id) || null;
}


export function uppercaseFirst(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

