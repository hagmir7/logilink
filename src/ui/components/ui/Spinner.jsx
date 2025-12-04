import { Loader2 } from 'lucide-react'
import React from 'react'

function Spinner() {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className='animate-spin text-blue-400 rounded-full h-8 w-8' size={17} />
        </div>
    )
}

export default Spinner