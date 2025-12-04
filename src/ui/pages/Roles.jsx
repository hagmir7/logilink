import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CModal from '../components/ui/CModal'
import { Loader2, PlusCircle, RefreshCcw } from 'lucide-react'
import { api } from '../utils/api'
import RoleForm from '../components/RoleForm';


function strClean(str) {
  return str.replace(/\w\S*/g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1);
  }).replace("_", " ");
}

const TableRow = ({ data }) => (
  <tr className='hover:bg-gray-100'>
    <td className='size-px whitespace-nowrap'>
      <Link to={`/roles/${data.name}`}>
        <div className='px-6 py-2 flex items-center gap-x-2'>
          <span className='text-sm text-gray-600'>
            #{data.id || '__'}
          </span>
        </div>
      </Link>
    </td>
    <td className='size-px whitespace-nowrap'>
      <Link to={`/roles/${data.name}`}>
        <div className='px-6 py-2'>
          <span className='text-sm text-gray-600'>
            {strClean(data.name) || '__'}
          </span>
        </div>
      </Link>
    </td>
    <td className='size-px whitespace-nowrap'>
      <div className='px-6 py-2'>
        <span className='text-sm text-gray-600'>
          {data.guard_name}
        </span>
      </div>
    </td>
  </tr>
)

const Roles = () => {
  const labels = ['Code', 'Role', 'Gaurdn']
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getData()
  }, [])

  const getData = async () => {
    setLoading(true)
    const respones = await api.get('roles')
    if (respones.status !== 200) {
      setLoading(false)
    }
    setData(respones.data)
    setLoading(false)
  }

  return (
    <div className='flex flex-col'>
      <div className='-m-1.5 overflow-x-auto'>
        <div className='p-1.5 min-w-full inline-block align-middle'>
          <div className='bg-white overflow-hidden'>
            {/* Header */}
            <div className='px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-b border-gray-200 '>
              <h2 className='text-xl font-semibold text-gray-800'>
                Roles
              </h2>
              <div className='inline-flex gap-x-2'>
                <button
                  type='button'
                  onClick={getData}
                  className='py-2 px-3 cursor-pointer inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none'
                >
                  <RefreshCcw size={17} />
                  Rafraîchir
                </button>
                <CModal
                  label='Créer'
                  title='Créer un nouveau rôle'
                  icon={() => <PlusCircle size={17} />}
                  btnClass='py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:bg-red-700 disabled:opacity-50 disabled:pointer-events-none'
                >
                  <RoleForm />
                </CModal>
              </div>
            </div>
            {/* Table */}
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  {labels.map((label) => {
                    return (
                      <th
                        scope='col'
                        key={label}
                        className='px-6 py-3 text-start'
                      >
                        <div className='flex items-center gap-x-2'>
                          <span className='text-xs font-semibold uppercase text-gray-800'>
                            {label}
                          </span>
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {data.map((item, index) => (
                  <TableRow key={index} data={item} />
                ))}
              </tbody>
            </table>
            {loading && (
              <div className='flex flex-col items-center justify-center h-64'>
                <Loader2
                  className='animate-spin text-blue-500 mb-2'
                  size={32}
                />
                <span className='text-gray-600'>Chargement...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Roles
