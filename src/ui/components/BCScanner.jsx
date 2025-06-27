import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Scan, X, AlertCircle } from 'lucide-react';

import { Html5Qrcode } from 'html5-qrcode';

const BCScanner = ({ onScan, onError }) => {
  const [showScanner, setShowScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const [cams, setCams] = useState([]);

  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
        setIsScanning(false);
        setShowScanner(false);
        setError('');
      } catch (err) {
        console.error('Failed to stop scanner:', err);
        setError('Erreur lors de l\'arrêt du scanner');
        if (onError) onError(err);
      }
    } else {
      setShowScanner(false);
      setIsScanning(false);
      setError('');
    }
  }, [isScanning, onError]);

  const startScanner = useCallback(async () => {
    if (!scannerRef.current) return;

    try {
      setError('');
      const cameras = await Html5Qrcode.getCameras();
      setCams(cameras);
      
      if (!cameras || cameras.length === 0) {
        throw new Error('Aucune caméra trouvée');
      }


      const cameraId = cameras.length === 1 ? cameras[0].id : cameras[0].id;
      setIsScanning(true);
      
      // Initialize scanner if not already exists
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerRef.current.id);
      }

      // Start scanning
      await html5QrCodeRef.current.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          stopScanner();
          if (onScan) onScan(decodedText);
        },
        (errorMessage) => {
          console.warn('Scan error:', errorMessage);
        }
      );
    } catch (err) {
      console.error('Camera initialization failed:', err);
      setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
      setIsScanning(false);
      if (onError) onError(err);
    }
  }, [onScan, onError, stopScanner]);

  useEffect(() => {
    if (showScanner && !isScanning) {
      startScanner();
    }
  }, [showScanner, isScanning, startScanner]);

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && isScanning) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, [isScanning]);

  const handleStartScan = () => {
    setShowScanner(true);
    setError('');
  };

  const handleModalClick = (e) => {
    // Close modal if clicking on backdrop
    if (e.target === e.currentTarget) {
      stopScanner();
    }
  };

  return (
    <div className="w-full">
      {/* Trigger Button */}
      <button
        onClick={handleStartScan}
        className="flex items-center justify-center gap-2 w-full max-w-md mx-auto px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
        type="button"
      >
        <Scan className="w-5 h-5" />
      </button>

      {/* Modal Overlay */}
      {showScanner && (
        <div 
          className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleModalClick}
        >
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Scanner QR/Code-barres</h3>
              <button
                onClick={stopScanner}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                disabled={!isScanning}
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-4">
              {error ? (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              ) : (
                <div className="mb-4">
                  <div 
                    id="barcode-scanner" 
                    ref={scannerRef} 
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 h-64 flex items-center justify-center"
                  >
                    {isScanning ? (
                      <div className="text-center">
                        <div className="animate-pulse">
                          <Scan className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                        </div>
                        <p className="text-gray-600">Recherche de codes...</p>
                        <p className="text-sm text-gray-500 mt-1">Pointez votre caméra vers un code QR ou code-barres</p>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">
                        <Scan className="w-12 h-12 mx-auto mb-2" />
                        <p>Initialisation de la caméra...</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Modal Footer */}
              <div className="flex gap-2">
                <button
                  onClick={stopScanner}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  Annuler
                </button>
                {error && (
                  <button
                    onClick={startScanner}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
                    disabled={isScanning}
                  >
                    Réessayer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BCScanner;