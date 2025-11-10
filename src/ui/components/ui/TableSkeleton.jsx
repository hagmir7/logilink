import React from 'react'

const TableSkeleton = ({ rows, columns}) => {
  return (
    <>
      {[...Array(rows ?? 4)].map((_, rowIndex) => (
        <tr key={rowIndex} className='border-b border-gray-200'>
          {[...Array(columns ?? 4)].map((_, colIndex) => (
            <td className='px-4 py-4' key={colIndex}>
              <div className='h-4 bg-gray-200 rounded w-3/4 animate-pulse'></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export default TableSkeleton;