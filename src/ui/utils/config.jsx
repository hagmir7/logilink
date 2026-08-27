import { useNavigate } from "react-router-dom";

// Get document type from the DO Piece
export function getDocumentType(DO_Piece) {
  const prefixMap = {
    DE: { type: 'Devis', code: 0 },
    PL: { type: 'Préparation de livraison', code: 2 },
    BL: { type: 'Bon de livraison', code: 3 },
    FA: { type: 'Facture', code: 6 },
    BLX: { type: 'Bon d’achat', code: 13 },
    BPL: { type: 'Préparation de livraison', code: 2 },
  }

  const piece = DO_Piece.slice(2);

  for (const key of ["DE", "PL", "BL", "FA", "BLX", "PL", "BC", "BL", "FA", "BPL"]) {
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
    10: 'STILEMOBILI',
  }

  return expedMap[exp] || 'N/A'
}



export function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d)) return ""; // handle invalid date

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${day}/${month}/${year}`;
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


export const statuses = [
  { id: 1, name: "Transféré", color: "#f39c12" },
  { id: 2, name: "Reçu", color: "#27ae60" },
  { id: 3, name: "Fabrication", color: "#2980b9" },
  { id: 4, name: "Fabriqué", color: "#3498db" },
  { id: 5, name: "Montage", color: "#9b59b6" },
  { id: 6, name: "Peinture", color: "#8e44ad" },
  { id: 7, name: "Préparation", color: "#16a085" },
  { id: 8, name: "Préparé", color: "#1abc9c" },
  { id: 9, name: "Contrôle", color: "#d35400" },
  { id: 10, name: "Contrôlé", color: "#e67e22" },
  { id: 11, name: "Validé", color: "#2ecc71" },
  { id: 12, name: "Livraison", color: "#34495e" },
  { id: 13, name: "Chargement", color: "#e74c3c" },
  { id: 14, name: "Livré", color: "#2c3e50" }
];



export function getStatus(id) {
  return statuses.find(status => status.id === id) || null;
}


export function uppercaseFirst(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}


export const getCompany = ($id) => {
    const companies = [
      { value: 1, label: 'Intercocina' },
      { value: 2, label: 'Serie Mobel' },
      { value: 3, label: 'AstiDkor' },
      { value: 4, label: 'Stile Mobili' },
    ]
    const company = companies.find((c) => c.value === Number($id))
    return company ? company.label : null
  }


export const categories = [
  { value: 'tout', label: 'Tout' },
  { value: 'panneaux', label: 'Panneaux' },
  { value: 'caissons', label: 'Caissons' },
  { value: 'facades', label: 'Façades' },
  { value: 'vitrines', label: 'Vitrines' },
  { value: 'chant', label: 'Chant' },
  { value: 'parquet', label: 'Parquet' },
  { value: 'accessoires', label: 'Accessoires' },
  { value: 'semi-fini', label: 'Semi fini'},
  { value: 'plan-de-travail', label: 'Plan de travail' },
  { value: 'acc-de-montage', label: 'Acc de montage' },
  { value: 'emballage-colle', label: 'Emballage & Colle' },
  { value: 'peinture-et-consommable', label: 'Peinture et consommable' },
  { value: 'vetements', label: 'Vêtements'},
  { value: 'matiere-premiere', label: 'Matière première'},
  { value: 'verre', label: 'Verre'},
  { value: 'piece-rechange', label: 'Piece de Rechange'}
];


export const formatCurrency = (value) => {
  if (!value) return <Skeleton />
  return `${parseFloat(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD`
}




// config.jsx
export const handleShow = async (navigate, path, width=1400, height=800) => {
  try {
    if (window.electron && typeof window.electron.openShow === 'function') {
      await window.electron.openShow({ url:path, width, height});
    } else {
      navigate('layout' + path); // ✅ Use relative path if inside /layout
    }
  } catch (error) {
    console.error('Error navigating:', error);
  }
};


 export const dateFormat = (date) => {
    if (!date) return '__'

    const inputDate = new Date(date)

    const day = inputDate.getDate()
    const month = inputDate.getMonth() + 1
    const year = inputDate.getFullYear()

    return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`
  }



export const REFRESH_INTERVAL_MS = 1_110_000 // ~18.5 min

export const TRANSFER_OPTIONS = [{ value: "19,4", label: 'Peinture' }]

// role_id on a line that identifies a "peinture" (paint) step
const PEINTURE_ROLE_ID = 19
// role_id on a line that identifies a "fabrication/cut" step
const FABRICATION_ROLE_ID = 6

/**
 * Per-role rules for whether a line can currently be selected (isDisabled)
 * and whether it has already been completed (isDone).
 *
 * NOTE (unconfirmed assumptions, carried over from the original code):
 * - montage is disabled until fabrication is finished
 * - peinture completion is tracked via line.peinture_at / line.peinture_by
 */
export const ROLE_RULES = {
  fabrication: {
    isDisabled: (line) => Boolean(line?.cutted_at || line?.fabricated_at || line?.peinture_at),
    isDone: (line) => Boolean(line?.fabricated_by || line?.cutted_by),
  },
  montage: {
    isDisabled: (line) => !line?.fabricated_at,
    isDone: (line) => Boolean(line?.mounted_by),
  },
  peinture: {
    isDisabled: (line) => Boolean(line?.peinture_at),
    isDone: (line) => Boolean(line?.peinture_by),
  },
}

export const isLineDisabled = (role, line) => ROLE_RULES[role]?.isDisabled(line) ?? true
export const isLineDone = (role, line) => ROLE_RULES[role]?.isDone(line) ?? false

/**
 * Decides what the "select" column should show for a given line, based on
 * the currently active role. This replaces the nested if/else chain that
 * used to live inside the column's `render`.
 *
 * Returns one of:
 *   { kind: 'checkbox' }               -> render a selectable checkbox
 *   { kind: 'status', status: 'done' | 'painting' } -> render a status badge
 *   null                                -> render nothing (e.g. montage today)
 */
export function getLineSelectDisplay(role, line) {
  const roleId = Number(line?.role_id)

  if (role === 'fabrication') {
    if (roleId === FABRICATION_ROLE_ID) return { kind: 'checkbox' }
    if (roleId === PEINTURE_ROLE_ID) return { kind: 'status', status: 'painting' }
    return { kind: 'status', status: 'done' }
  }

  if (role === 'peinture') {
    if (roleId === PEINTURE_ROLE_ID) return { kind: 'checkbox' }
    return { kind: 'status', status: 'done' }
  }

  // montage currently has no dedicated display in this column
  return null
}

/** Formats a date as DD/MM/YYYY, or '__' when missing. Distinct from the
 * app-wide `formatDate` util, which uses a different display format. */
export function formatShortDate(date) {
  if (!date) return '__'
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${d.getFullYear()}`
}