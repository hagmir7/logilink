import BCScanner from '../BCScanner'


const InputField = ({ value, onChange, onScan, label, placeholder, btnClass }) => {
  const electron = window.electron;
  
  return (
    <div className={electron ? 'hidden' : ''}>
      <BCScanner onScan={onScan} btnClass={btnClass}  />
    </div>
  )
}

export default InputField 