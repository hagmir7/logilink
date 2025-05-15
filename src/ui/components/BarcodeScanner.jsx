import React, { useEffect, useRef, useState } from 'react'
import Quagga from 'quagga'

const BarcodeScanner = () => {
  const scannerRef = useRef(null)
  const [scannedCodes, setScannedCodes] = useState([])
  const [scanning, setScanning] = useState(false)
  const quaggaInitialized = useRef(false)

  const startScanner = () => {
    if (quaggaInitialized.current) {
      Quagga.start()
      setScanning(true)
    } else {
      initQuagga()
    }
  }

  const stopScanner = () => {
    Quagga.stop()
    setScanning(false)
  }

  const initQuagga = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      Quagga.init(
        {
          inputStream: {
            name: 'Live',
            type: 'LiveStream',
            target: scannerRef.current,
            constraints: {
              width: 420,
              height: 200,
              facingMode: 'environment', // use rear camera on mobile
            }
          },
          locator: {
            patchSize: 'medium',
            halfSample: true,
          },
          numOfWorkers: navigator.hardwareConcurrency || 4,
          decoder: {
            readers: [
              'ean_reader',
              'ean_8_reader',
              'code_128_reader',
              'code_39_reader',
              'code_93_reader',
            ],
          },
          locate: true,
        },
        (err) => {
          if (err) {
            console.error('Error initializing Quagga:', err)
            return
          }
          quaggaInitialized.current = true
          Quagga.start()
          setScanning(true)
        }
      )

      Quagga.onDetected((result) => {
        if (result && result.codeResult) {
          const code = result.codeResult.code

          // Log to console
          console.log(`Barcode detected: ${code}`)

          // Add to state with timestamp
          setScannedCodes((prevCodes) => {
            const timestamp = new Date().toLocaleTimeString()
            const newScan = { code, timestamp }
            const lastScan = prevCodes[0]
            if (
              !lastScan ||
              lastScan.code !== code ||
              new Date() - new Date(lastScan.timestamp) > 3000
            ) {
              return [newScan, ...prevCodes].slice(0, 10);
            }
            return prevCodes
          })
          alert(code)
        }
      })

      // Draw detection areas
      Quagga.onProcessed((result) => {
        const drawingCtx = Quagga.canvas.ctx.overlay
        const drawingCanvas = Quagga.canvas.dom.overlay

        if (result) {
          if (result.boxes) {
            drawingCtx.clearRect(
              0,
              0,
              parseInt(drawingCanvas.getAttribute('width')),
              parseInt(drawingCanvas.getAttribute('height'))
            )
            result.boxes
              .filter((box) => box !== result.box)
              .forEach((box) => {
                Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, {
                  color: 'green',
                  lineWidth: 2,
                })
              })
          }

          if (result.box) {
            Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, {
              color: 'blue',
              lineWidth: 2,
            })
          }

          if (result.codeResult && result.codeResult.code) {
            Quagga.ImageDebug.drawPath(
              result.line,
              { x: 'x', y: 'y' },
              drawingCtx,
              { color: 'red', lineWidth: 3 }
            )
          }
        }
      })
    }
  }

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      if (quaggaInitialized.current) {
        Quagga.stop()
      }
    }
  }, [])

  return (
    <div className='flex flex-col items-center'>
      <div className='w-full max-w-2xl relative mb-4'>
        <div
          ref={scannerRef}
          className='viewport w-full bg-gray-100 rounded-lg overflow-hidden aspect-video'
        ></div>

        <div className='flex justify-center mt-4 space-x-4 px-6'>
          <button
            onClick={startScanner}
            disabled={scanning}
            className={`px-4 py-2 rounded-lg font-medium ${
              scanning
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            Start Scanner
          </button>

          <button
            onClick={stopScanner}
            disabled={!scanning}
            className={`px-4 py-2 rounded-lg font-medium ${
              !scanning
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            Stop Scanner
          </button>
        </div>
      </div>

      <div className='w-full max-w-2xl bg-white rounded-lg shadow p-4'>

        {scannedCodes.length === 0 ? (
          <span> </span>
        ) : (
          <ul className='divide-y'>
            {scannedCodes.map((scan, index) => (
              <li key={index} className='py-2 flex justify-between'>
                <span className='font-mono'>{scan.code}</span>
                <span className='text-gray-500 text-sm'>{scan.timestamp}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default BarcodeScanner
