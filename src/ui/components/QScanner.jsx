import { useState } from "react"
import { Scanner } from "@yudiel/react-qr-scanner"
import { Scan } from "lucide-react"

const QScanner = ({ onScan }) => {
  const [showScanner, setShowScanner] = useState(false)

  return (
    <div className="flex justify-center">
      {showScanner ? (
        <div className="bg-gray-100 p-4 rounded-md w-1/2">
          <Scanner
            onScan={(result) => {
              let value =
                result?.[0]?.rawValue ||
                result?.rawValue ||
                result?.text ||
                result ||
                ""

              console.log("RAW SCAN RESULT:", result)
              console.log("PARSED VALUE:", value)

              if (value && onScan) onScan(value) // <<< Prevent empty sending
              setShowScanner(false)
            }}
          />

          <button
            onClick={() => setShowScanner(false)}
            className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm w-full"
          >
            Annuler
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowScanner(true)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          type="button"
        >
          <Scan size={50} />
        </button>
      )}
    </div>
  )
}

export default QScanner
