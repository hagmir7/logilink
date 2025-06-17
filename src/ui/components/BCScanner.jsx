import React, { useState, useEffect } from 'react';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import { Scan, X } from 'lucide-react';

const BCScanner = ({ onScan }) => {
  const [showScanner, setShowScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [error, setError] = useState(null);

  // Reset scanner state when opening
  useEffect(() => {
    if (showScanner) {
      setIsScanning(true);
      setError(null);
    }
  }, [showScanner]);

  const handleScan = (err, result) => {
    if (err) {
      console.error('Scanner error:', err);
      setError('Erreur de scan. Veuillez réessayer.');
      return;
    }

    if (result && isScanning) {
      setIsScanning(false); // Prevent multiple scans
      
      let scanValue = '';
      try {
        const text = result.text;
        
        // Handle JSON-formatted QR codes
        if (
          typeof text === 'string' &&
          (text.startsWith('[') || text.startsWith('{'))
        ) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            scanValue = parsed[0]?.rawValue || parsed[0] || '';
          } else {
            scanValue = parsed.rawValue || parsed.value || text;
          }
        } else {
          scanValue = text;
        }
      } catch (parseError) {
        // If JSON parsing fails, use the raw text
        scanValue = result.text;
      }

      if (scanValue) {
        onScan(scanValue);
        setTimeout(() => {
          setShowScanner(false);
        }, 100); // Small delay to show scan success
      } else {
        setError('Code scanné vide. Veuillez réessayer.');
        setIsScanning(true);
      }
    }
  };

  const closeScanner = () => {
    setShowScanner(false);
    setIsScanning(true);
    setError(null);
  };

  return (
    <div className="flex justify-center">
      {showScanner ? (
        <div className="bg-white border-2 border-gray-200 rounded-lg shadow-lg p-4 w-full max-w-md">
          {/* Header */}
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Scanner</h3>
            <button
              onClick={closeScanner}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              type="button"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-3 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Scanner */}
          <div className="relative bg-black rounded-lg overflow-hidden">
            <BarcodeScannerComponent
              onUpdate={handleScan}
              constraints={{ 
                facingMode: 'environment',
                aspectRatio: 1
              }}
              style={{
                width: '100%',
                height: '250px'
              }}
            />
            
            {/* Scanning overlay */}
            {isScanning && (
              <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
                <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-blue-500"></div>
                <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-blue-500"></div>
                <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-blue-500"></div>
                <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-blue-500"></div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <p className="mt-3 text-sm text-gray-600 text-center">
            Positionnez le code-barres dans le cadre
          </p>

          {/* Close Button */}
          <button
            onClick={closeScanner}
            className="mt-3 w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
            type="button"
          >
            Annuler
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowScanner(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors border-2 border-dashed border-blue-300 hover:border-blue-400"
          type="button"
        >
          <Scan size={24} />
          <span className="text-sm font-medium">Scanner</span>
        </button>
      )}
    </div>
  );
};

// Demo component to test the scanner
const ScannerDemo = () => {
  const [scannedValue, setScannedValue] = useState('');

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-xl font-bold text-center">Scanner de Code-Barres</h2>
      
      <BCScanner onScan={setScannedValue} />
      
      {scannedValue && (
        <div className="p-3 bg-green-100 border border-green-300 rounded-lg">
          <p className="text-sm font-medium text-green-800">Valeur scannée:</p>
          <p className="text-green-700 break-all">{scannedValue}</p>
        </div>
      )}
    </div>
  );
};

export default ScannerDemo;