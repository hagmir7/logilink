import { Tr } from './Table'

export default function EmptyTable() {
    return (
        <Tr>
            <td
                colSpan='7'
                className='px-6 py-4 text-center text-sm text-gray-500'
            >
                <div className='flex flex-col items-center justify-center py-6'>
                    <svg
                        className='h-12 w-12 text-gray-400'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={1}
                            d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4'
                        />
                    </svg>
                    <h3 className='mt-2 text-sm font-medium text-gray-900'>
                        Aucun article trouvé
                    </h3>
                </div>
            </td>
        </Tr>
    )
}
