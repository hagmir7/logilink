import React from 'react'
import QScanner from '../QScanner'
import BCScanner from '../BCScanner'


const InputField = ({ value, onChange, onScan, label, placeholder }) => {
  return (
    <div className=''>
      <BCScanner onScan={onScan} />
    </div>
  )
}

export default InputField 