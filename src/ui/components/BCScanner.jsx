import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Scan, X, AlertCircle, Camera } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'

const CAMERA_STORAGE_KEY = 'bcscanner_camera_id'

const BCScanner = ({ onScan, onError, btnClass }) => {
  const [showScanner, setShowScanner] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState('')
  const [cameras, setCameras] = useState([])
  const [selectedCamera, setSelectedCamera] = useState(null)
  const [showCameraSelect, setShowCameraSelect] = useState(false)

  const scannerRef = useRef(null)
  const html5QrCodeRef = useRef(null)

  /* ----------------------------------------
     Load saved camera on mount
  ---------------------------------------- */
  useEffect(() => {
    const savedCamera = localStorage.getItem(CAMERA_STORAGE_KEY)
    if (savedCamera) {
      setSelectedCamera(savedCamera)
    }
  }, [])

  /* ----------------------------------------
     Stop scanner
  ---------------------------------------- */
  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop()
        await html5QrCodeRef.current.clear()
      } catch (_) {}
      html5QrCodeRef.current = null
    }
    setIsScanning(false)
    setShowScanner(false)
    setShowCameraSelect(false)
    setError('')
  }, [])

  /* ----------------------------------------
     Load cameras & decide behavior
  ---------------------------------------- */
  const loadCameras = useCallback(async () => {
    const availableCameras = await Html5Qrcode.getCameras()

    if (!availableCameras || availableCameras.length === 0) {
      throw new Error('Aucune caméra trouvée')
    }

    setCameras(availableCameras)

    const savedCamera = localStorage.getItem(CAMERA_STORAGE_KEY)

    // ✅ Use saved camera if still available
    if (savedCamera) {
      const exists = availableCameras.find(cam => cam.id === savedCamera)
      if (exists) {
        setSelectedCamera(savedCamera)
        return savedCamera
      }
    }

    // ❌ No saved camera → force user selection
    setShowCameraSelect(true)
    return null
  }, [])

  /* ----------------------------------------
     Start scanner
  ---------------------------------------- */
  const startScanner = useCallback(
    async (cameraId) => {
      if (!scannerRef.current || !cameraId) return

      try {
        setError('')
        setIsScanning(true)

        if (!html5QrCodeRef.current) {
          html5QrCodeRef.current = new Html5Qrcode(scannerRef.current.id)
        }

        await html5QrCodeRef.current.start(
          cameraId,
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            stopScanner()
            onScan?.(decodedText)
          },
          () => {}
        )
      } catch (err) {
        setError("Impossible d'accéder à la caméra.")
        setIsScanning(false)
        onError?.(err)
      }
    },
    [onScan, onError, stopScanner]
  )

  /* ----------------------------------------
     Camera selection handler
  ---------------------------------------- */
  const handleCameraChange = async (cameraId) => {
    setSelectedCamera(cameraId)
    localStorage.setItem(CAMERA_STORAGE_KEY, cameraId)
    setShowCameraSelect(false)

    if (html5QrCodeRef.current) {
      await html5QrCodeRef.current.stop().catch(() => {})
      html5QrCodeRef.current.clear()
      html5QrCodeRef.current = null
    }

    setIsScanning(false)
    await startScanner(cameraId)
  }

  /* ----------------------------------------
     Auto start when modal opens
  ---------------------------------------- */
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
          setError("Impossible d'accéder à la caméra.")
          onError?.(err)
        })
    }

    return () => {
      mounted = false
    }
  }, [showScanner, isScanning, loadCameras, startScanner, onError])

  /* ----------------------------------------
     Cleanup on unmount
  ---------------------------------------- */
  useEffect(() => {
    return () => {
      html5QrCodeRef.current?.stop().catch(() => {})
    }
  }, [])

  /* ----------------------------------------
     UI
  ---------------------------------------- */
  return (
    <div className='w-full'>
      <button
        onClick={() => setShowScanner(true)}
        className={`flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-500 rounded-lg hover:bg-blue-600 text-white ${btnClass || ''}`}
        type='button'
      >
        <Scan className='w-5 h-5' />
      </button>

      {showScanner && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg w-full max-w-md shadow-xl'>
            {/* Header */}
            <div className='flex justify-between items-center p-4 border-b'>
              <h3 className='font-semibold'>Scanner QR / Code-barres</h3>
              <div className='flex gap-1'>
                {cameras.length > 1 && (
                  <button
                    onClick={() => setShowCameraSelect(true)}
                    className='p-1 hover:bg-gray-100 rounded'
                  >
                    <Camera className='w-5 h-5' />
                  </button>
                )}
                <button onClick={stopScanner} className='p-1 hover:bg-gray-100 rounded'>
                  <X className='w-5 h-5' />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className='p-4'>
              {showCameraSelect && (
                <div className='mb-4'>
                  <label className='text-sm font-medium'>Sélectionner une caméra</label>
                  <select
                    value={selectedCamera || ''}
                    onChange={(e) => handleCameraChange(e.target.value)}
                    className='w-full mt-2 p-2 border rounded'
                  >
                    <option value='' disabled>
                      Choisir une caméra
                    </option>
                    {cameras.map((cam, i) => (
                      <option key={cam.id} value={cam.id}>
                        {cam.label || `Caméra ${i + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {error ? (
                <div className='flex gap-2 text-red-600 text-sm'>
                  <AlertCircle className='w-5 h-5' />
                  {error}
                </div>
              ) : (
                <div
                  id='barcode-scanner'
                  ref={scannerRef}
                  className='h-64 border-2 border-dashed rounded flex items-center justify-center'
                >
                  {isScanning ? 'Scan en cours…' : 'Initialisation caméra…'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BCScanner
