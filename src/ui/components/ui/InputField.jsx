import React from 'react'
import QScanner from '../QScanner'
import BCScanner from '../BCScanner'


const InputField = ({ value, onChange, onScan, label, placeholder, btnClass }) => {
  const electron = window.electron;
  console.log(electron);
  
  return (
    <div className={electron ? 'hidden' : ''}>
      <BCScanner onScan={onScan} btnClass={btnClass}  />
    </div>
  )
}

export default InputField 