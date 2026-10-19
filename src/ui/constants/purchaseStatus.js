export const STATUS = {
  DRAFT: '1',
  SENT: '2',
  RECEIVED: '7',
  NON_COMPLIANT: '8',
};

export const STATUS_OPTIONS = [
  { value: '1', label: 'Brouillon', color: 'bg-gray-400' },
  { value: '2', label: 'Envoyer', color: 'bg-blue-400' },
  { value: '3', label: 'En Révision', color: 'bg-yellow-400' },
  { value: '4', label: 'Approuvé', color: 'bg-green-400' },
  { value: '5', label: 'Rejeté', color: 'bg-red-400' },
  { value: '6', label: 'Commandé', color: 'bg-purple-400' },
  { value: '7', label: 'Reçu', color: 'bg-teal-400' },
  { value: '8', label: 'Reçu non conforme', color: 'bg-gray-600' },
  { value: '9', label: 'En stock', color: 'bg-cyan-500' },
];
