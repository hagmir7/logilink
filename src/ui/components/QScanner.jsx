import { useState } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import { Scan } from 'lucide-react'

const QScanner = ({ onScan }) => {
  const [showScanner, setShowScanner] = useState(false)

  return (
    <div>
      {showScanner ? (
        <div className='bg-gray-100 p-4 rounded-md'>
          <Scanner
            onScan={(result) => {
              let scanValue = ''
              try {
                if (
                  typeof result === 'string' &&
                  (result.startsWith('[') || result.startsWith('{'))
                ) {
                  const parsed = JSON.parse(result)
                  if (Array.isArray(parsed)) {
                    scanValue = parsed[0]?.rawValue || ''
                  } else {
                    scanValue = parsed.rawValue || ''
                  }
                } else if (Array.isArray(result)) {
                  scanValue = result[0]?.rawValue || ''
                } else if (typeof result === 'object') {
                  scanValue = result.rawValue || result.text || ''
                } else {
                  scanValue = result || ''
                }
              } catch (err) {
                scanValue = result || ''
              }
              onScan(scanValue)
              setShowScanner(false)
            }}
          />
          <button
            onClick={() => setShowScanner(false)}
            className='mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm w-full'
          >
            Annuler
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowScanner(true)}
          className='flex items-center gap-2 text-blue-600 hover:text-blue-800'
          type='button'
        >
          <Scan size={50} />
        </button>
      )}
    </div>
  )
}

export default QScanner