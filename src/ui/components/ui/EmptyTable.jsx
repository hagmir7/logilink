import { Empty } from 'antd'
import { Tr } from './Table'

export default function EmptyTable() {
    return (
        <Tr>
            <td
                colSpan='7'
                className='px-6 py-4 text-center text-sm text-gray-500'
            >
                <Empty description="Aucun article trouvé" />
            </td>
        </Tr>
    )
}
