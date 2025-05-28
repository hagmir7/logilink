import React from 'react'

export function Table({ children, className = '' }) {
  return (
    <div className='overflow-hidden rounded-lg border border-gray-300/80'>
      <div className='overflow-x-auto w-full'>
        <table
          className={`min-w-full divide-y divide-gray-200/60 ${className}`}
        >
          {children}
        </table>
      </div>
    </div>
  )
}

export function Thead({ children, className = '' }) {
  return (
    <thead
      className={`bg-gradient-to-r from-gray-50 to-gray-100/50 ${className}`}
    >
      {children}
    </thead>
  )
}

export function Tbody({ children, className = '' }) {
  return (
    <tbody className={`divide-y divide-gray-200/40 bg-white ${className}`}>
      {children}
    </tbody>
  )
}

export function Tr({ children, className = '', hoverable = true }) {
  const hoverClass = hoverable
    ? 'hover:bg-gray-50/50 transition-colors duration-150 ease-in-out'
    : ''

  return <tr className={`${hoverClass} ${className}`}>{children}</tr>
}

export function Th({ children, className = '', sortable = false }) {
  const sortableClass = sortable
    ? 'cursor-pointer select-none hover:bg-gray-100/70 transition-colors duration-150'
    : ''

  return (
    <th
      className={`px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap ${sortableClass} ${className}`}
    >
      <div className='flex items-center space-x-1'>
        {children}
        {sortable && (
          <svg
            className='w-3 h-3 text-gray-400'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4'
            />
          </svg>
        )}
      </div>
    </th>
  )
}

export function Td({ children, className = '', align = 'left' }) {
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align]

  return (
    <td
      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${alignmentClass} ${className}`}
    >
      {children}
    </td>
  )
}

// Additional utility components
export function TableCaption({ children, className = '' }) {
  return (
    <caption
      className={`px-6 py-3 text-left text-sm text-gray-600 bg-gray-50/50 border-b border-gray-200/60 ${className}`}
    >
      {children}
    </caption>
  )
}

export function TableFooter({ children, className = '' }) {
  return (
    <tfoot className={`bg-gray-50/80 border-t border-gray-200/60 ${className}`}>
      {children}
    </tfoot>
  )
}

