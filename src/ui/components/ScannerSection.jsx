import { Loader2 } from 'lucide-react'
import QScanner from '../components/QScanner'
import { Alert, Input } from 'antd'

export default function ScannerSection({
  line,
  setLine,
  handleScan,
  lineError,
  loadingStates,
  empalcementCode,
  setEmpalcementCode,
  handleScanEmplacement,
  empalcementCodeLoading,
  empalcementCodeError,
  scannedEmplacement,
  paletteCodeInput,
  lineInput,
  onConfirmAll,
}) {
  return (
    <div className='bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 relative'>
      <button className='absolute right-1 p-6 px-10' onClick={onConfirmAll} />

      <div className='flex justify-center items-center gap-3 mb-4 sm:mb-6'>
        <div className='p-2 bg-blue-100 rounded-lg'>
          <QScanner onScan={handleScan} />
        </div>
      </div>

      <div className='flex-row gap-3'>
        <Input
          type='text'
          value={line}
          onChange={(e) => {
            const newValue = e.target.value
            setLine(newValue)
            handleScan(newValue)
          }}
          autoFocus
          ref={lineInput}
          style={{ fontSize: '30px', fontWeight: 600 }}
          placeholder='Article Code...'
          allowClear
          suffix={
            loadingStates.scan ? <Loader2 className='w-8 h-8 animate-spin' /> : null
          }
        />
        {lineError && lineError !== '' && line !== '' && (
          <Alert
            message={lineError}
            type='error'
            className='mt-2 p-2'
            style={{ fontSize: '18px', color: 'red' }}
          />
        )}
      </div>

      <div className='flex-row gap-3 mt-4'>
        <Input
          type='text'
          value={empalcementCode}
          onChange={(e) => {
            const newValue = e.target.value
            setEmpalcementCode(newValue)
            handleScanEmplacement(newValue)
          }}
          ref={paletteCodeInput}
          style={{ fontSize: '30px', fontWeight: 600 }}
          placeholder='Emplacement code...'
          allowClear
          suffix={
            empalcementCodeLoading ? (
              <Loader2 className='w-8 h-8 animate-spin' />
            ) : null
          }
        />
        {empalcementCodeError && empalcementCodeError !== '' && line !== '' && (
          <Alert
            message={empalcementCodeError}
            type='error'
            className='mt-2 p-2'
            style={{ fontSize: '18px', color: 'red' }}
          />
        )}
      </div>

      {scannedEmplacement && (
        <div className='bg-gray-100 p-3 rounded-md mt-2'>
          <div className='grid grid-cols-2 gap-2 text-lg'>
            <div className='font-medium'>Dépôt:</div>
            <div className='font-bold'>
              {scannedEmplacement?.depot?.code || scannedEmplacement.depot_id}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}