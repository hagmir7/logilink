import { Loader2 } from 'lucide-react'
import React from 'react'

function Spinner() {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className='animate-spin text-blue-400 rounded-full h-8 w-8' size={17} />
            {/* <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div> */}
        </div>
    )
}

export default Spinner