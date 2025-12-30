import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Scan, X, AlertCircle, Camera } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'

const BCScanner = ({ onScan, onError, btnClass }) => {
  const [showScanner, setShowScanner] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState('')
  const [cameras, setCameras] = useState([])
  const [selectedCamera, setSelectedCamera] = useState(null)
  const [showCameraSelect, setShowCameraSelect] = useState(false)
  const scannerRef = useRef(null)
  const html5QrCodeRef = useRef(null)

  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop()
      } catch (err) {
        console.error('Failed to stop scanner:', err)
      }
      try {
        html5QrCodeRef.current.clear()
      } catch (err) {
        console.error('Failed to clear scanner:', err)
      }
      html5QrCodeRef.current = null
    }
    setIsScanning(false)
    setShowScanner(false)
    setError('')
    setShowCameraSelect(false)
  }, [])

  const loadCameras = useCallback(async () => {
    try {
      const availableCameras = await Html5Qrcode.getCameras()

      if (!availableCameras || availableCameras.length === 0) {
        throw new Error('Aucune caméra trouvée')
      }

      setCameras(availableCameras)

      // If user has previously selected a camera, use it
      if (selectedCamera) {
        const cameraExists = availableCameras.find(
          (cam) => cam.id === selectedCamera
        )
        if (cameraExists) {
          return selectedCamera
        }
      }

      // Default camera selection
      const defaultCamera =
        availableCameras.length === 1
          ? availableCameras[0].id
          : availableCameras[1].id

      setSelectedCamera(defaultCamera)
      return defaultCamera
    } catch (err) {
      console.error('Failed to load cameras:', err)
      throw err
    }
  }, [selectedCamera])

  const startScanner = useCallback(
    async (cameraId) => {
      if (!scannerRef.current) return

      try {
        setError('')
        setIsScanning(true)

        // Initialize scanner if not already exists
        if (!html5QrCodeRef.current) {
          html5QrCodeRef.current = new Html5Qrcode(scannerRef.current.id)
        }

        // Start scanning
        await html5QrCodeRef.current.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            stopScanner()
            if (onScan) onScan(decodedText)
          },
          (errorMessage) => {
            // Normal scanning errors, ignore
          }
        )
      } catch (err) {
        console.error('Camera initialization failed:', err)
        setError("Impossible d'accéder à la caméra. Vérifiez les permissions.")
        setIsScanning(false)
        if (onError) onError(err)
      }
    },
    [onScan, onError, stopScanner]
  )

  const handleCameraChange = async (cameraId) => {
    setSelectedCamera(cameraId)
    setShowCameraSelect(false)

    // Stop current scanner if running
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop()
        html5QrCodeRef.current.clear()
        html5QrCodeRef.current = null
      } catch (err) {
        console.error('Failed to stop scanner:', err)
      }
    }

    setIsScanning(false)

    // Start with new camera
    await startScanner(cameraId)
  }

  useEffect(() => {
    let mounted = true

    if (showScanner && !isScanning && !html5QrCodeRef.current) {
      loadCameras()
        .then((cameraId) => {
          if (cameraId && mounted) {
            startScanner(cameraId)
          }
        })
        .catch((err) => {
          if (mounted) {
            setError(
              "Impossible d'accéder à la caméra. Vérifiez les permissions."
            )
            if (onError) onError(err)
          }
        })
    }

    return () => {
      mounted = false
    }
  }, [showScanner, isScanning, loadCameras, startScanner, onError])

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(console.error)
      }
    }
  }, [])

  const handleStartScan = () => {
    setShowScanner(true)
    setError('')
  }

  const handleModalClick = (e) => {
    // Close modal if clicking on backdrop
    if (e.target === e.currentTarget) {
      stopScanner()
    }
  }

  return (
    <div className='w-full'>
      {/* Trigger Button */}
      <button
        onClick={handleStartScan}
        className={`flex items-center justify-center gap-2 w-full max-w-md mx-auto px-4 py-3 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors font-medium text-white ${
          btnClass || ''
        }`}
        type='button'
      >
        <Scan className='w-5 h-5 text-white' />
      </button>

      {/* Modal Overlay */}
      {showScanner && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
          onClick={handleModalClick}
        >
          <div className='bg-white rounded-lg shadow-2xl w-full max-w-md mx-auto'>
            {/* Modal Header */}
            <div className='flex justify-between items-center p-4 border-b border-gray-200'>
              <h3 className='text-lg font-semibold text-gray-800'>
                Scanner QR/Code-barres
              </h3>
              <div className='flex items-center gap-1'>
                {/* Camera Selection Button */}
                {cameras.length > 1 && !error && (
                  <button
                    onClick={() => setShowCameraSelect(!showCameraSelect)}
                    className='p-1 hover:bg-gray-100 rounded-full transition-colors'
                    title='Changer de caméra'
                    type='button'
                  >
                    <Camera className='w-5 h-5 text-gray-600' />
                  </button>
                )}
                <button
                  onClick={stopScanner}
                  className='p-1 hover:bg-gray-100 rounded-full transition-colors'
                  type='button'
                >
                  <X className='w-5 h-5 text-gray-600' />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className='p-4'>
              {/* Camera Selection Dropdown */}
              {showCameraSelect && cameras.length > 1 && (
                <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Sélectionner une caméra:
                  </label>
                  <select
                    value={selectedCamera || ''}
                    onChange={(e) => handleCameraChange(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700'
                  >
                    {cameras.map((camera, index) => (
                      <option key={camera.id} value={camera.id}>
                        {camera.label || `Caméra ${index + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {error ? (
                <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2'>
                  <AlertCircle className='w-5 h-5 text-red-500 flex-shrink-0' />
                  <span className='text-red-700 text-sm'>{error}</span>
                </div>
              ) : (
                <div className='mb-4'>
                  <div
                    id='barcode-scanner'
                    ref={scannerRef}
                    className='w-full border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 h-64 flex items-center justify-center'
                  >
                    {isScanning ? (
                      <div className='text-center'>
                        <div className='animate-pulse'>
                          <Scan className='w-12 h-12 text-blue-500 mx-auto mb-2' />
                        </div>
                        <p className='text-gray-600'>Recherche de codes...</p>
                        <p className='text-sm text-gray-500 mt-1'>
                          Pointez votre caméra vers un code QR ou code-barres
                        </p>
                      </div>
                    ) : (
                      <div className='text-center text-gray-500'>
                        <Scan className='w-12 h-12 mx-auto mb-2 text-gray-400' />
                        <p>Initialisation de la caméra...</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className='flex gap-2'>
                <button
                  onClick={stopScanner}
                  className='flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm font-medium'
                  type='button'
                >
                  Annuler
                </button>
                {error && (
                  <button
                    onClick={handleStartScan}
                    className='flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium'
                    type='button'
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
  )
}

export default BCScanner