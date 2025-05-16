import React from 'react'

export function Table({ children, classNmae }) {
  return (
    <table
      className={`min-w-full bg-white border-2 border-gray-200 overflow-hidden ${classNmae}`}
    >
      {children}
    </table>
  )
}

export function Tbody({ children, className }) {
  return (
    <tbody className={`divide-y divide-gray-200 ${className}`}>
      {children}
    </tbody>
  )
}

export function Td({ children, className }) {
  return (
    <td
      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${className}`}
    >
      {children}
    </td>
  )
}

export function Th({ children, className }) {
  return (
    <th
      className={`px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap ${className}`}
    >
      {children}
    </th>
  )
}

export function Thead({ children, className }) {
  return (
    <thead className={`bg-gray-50 border-gray-200 border-2 ${className}`}>
      {children}
    </thead>
  )
}

export function Tr({ children, className }) {
  return <tr className={`${className}`}>{children}</tr>
}
