// EmplacementModal.jsx
import { Modal } from 'antd'

const EmplacementModal = ({
  selectedEmplacement,
  setSelectedEmplacement,
  handleOk,
  parseEmplacement,
  getEmplacementStatus
}) => {
  const emplacementData = parseEmplacement(selectedEmplacement)
  const status = getEmplacementStatus(selectedEmplacement)?.status || ''

  const statusClass =
    status === 'occupied'
      ? 'bg-red-100 text-red-800'
      : status === 'available'
      ? 'bg-green-100 text-green-800'
      : status === 'maintenance'
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-blue-100 text-blue-800'

  return (
    <Modal
      title={`${selectedEmplacement}`}
      closable={{ 'aria-label': 'Custom Close Button' }}
      open={!!selectedEmplacement}
      onOk={handleOk}
      onCancel={() => setSelectedEmplacement(null)}
    >
      <div>
        {selectedEmplacement && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="font-mono text-xl font-bold text-center text-gray-900 mb-2">
                {selectedEmplacement}
              </div>

              {emplacementData && (
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Depot:</span>
                    <span className="ml-2 font-medium">K</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Étage :</span>
                    <span className="ml-2 font-medium">{emplacementData.floorLetter}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Rangée:</span>
                    <span className="ml-2 font-medium">{emplacementData.rowNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Colonne:</span>
                    <span className="ml-2 font-medium">{emplacementData.columnNumber}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center">
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${statusClass}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default EmplacementModal
