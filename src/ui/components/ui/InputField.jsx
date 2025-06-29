import React from 'react'
import QScanner from '../QScanner'
import BCScanner from '../BCScanner'


const InputField = ({ value, onChange, onScan, label, placeholder }) => {
  const electron = window.electron;
  console.log(electron);
  
  return (
    <div className={electron ? 'hidden' : ''}>
      <BCScanner onScan={onScan} />
    </div>
  )
}

export default InputField 