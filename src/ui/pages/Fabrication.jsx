import React, { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { getExped, getDocumentType, locale } from '../utils/config'
import { useParams } from 'react-router-dom'
import { Button, Checkbox, DatePicker } from 'antd'
import { useAuth } from '../contexts/AuthContext'
import Skeleton from '../components/ui/Skeleton'
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table'
import { RefreshCcw, ArrowRight } from 'lucide-react'
import SkeletonTable from '../components/ui/SkeletonTable'
import EmptyTable from '../components/ui/EmptyTable'

function Fabrication() {
  const { id } = useParams()
  const [data, setData] = useState({ docentete: {}, doclignes: [] })
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState([])
  const [complationSpin, setComplationSpin] = useState(false)
  const { roles } = useAuth()
  const currentItems = data?.doclignes || []

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await api.get(`docentete/${id}`)

      setData(response.data)
      setLoading(false)
    } catch (err) {
      setLoading(false)
      console.error('Failed to fetch data:', err)
    }
  }
  useEffect(() => {
    fetchData()
  }, [id])

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(data.doclignes.map((item) => item.line.id))
    } else {
      setSelected([])
    }
  }

  const onDateChange = async (date, dateString) => {
    if (selected.length === 0) return
    const data = {
      complation_date: date,
      lines: selected,
    }
    setSelected([]);
    const response = await api.post('docentetes/start', data);
    console.log(response);
    fetchData();
  }

  const complation = async () => {
    if (selected.length === 0) return
    setComplationSpin(true)
    const data = {
      lines: selected,
    }

    const response = await api.post('docentetes/complation', data)
    console.log(response)
    setComplationSpin(false)
    fetchData()
  }

  const dateFormat = (date) => {
    const inputDate = new Date(date)

    const formattedDate = `${inputDate.getFullYear()}/${String(
      inputDate.getMonth() + 1
    ).padStart(2, '0')}/${Number(String(inputDate.getDate()).padStart(2, '0')) + 1
      }`
    return formattedDate
  }

  return (
    <div className='max-w-7xl mx-auto'>
      <div className='flex justify-between items-center mb-6'>
        <div className='flex items-center space-x-3'>
          <h1 className='text-xl font-bold text-gray-800'>
            {data.docentete.DO_Piece ? `Commande ${data.docentete.DO_Piece}` : 'Chargement...'}
          </h1>
        </div>
        <Button onClick={fetchData}>
          {loading ? (
            <RefreshCcw className='animate-spin h-4 w-4 mr-2' />
          ) : (
            <RefreshCcw className='h-4 w-4 mr-2' />
          )}
          Rafraîchir
        </Button>
      </div>

      {/* Document Info */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 bg-white border-2 border-gray-200 p-4 mb-6'>
        <div className='flex flex-col'>
          <span className='text-sm text-gray-500'>Client</span>
          <span className='font-medium'>
            {data.docentete.DO_Tiers || <Skeleton />}
          </span>
        </div>
        <div className='flex flex-col'>
          <span className='text-sm text-gray-500'>Référence</span>
          <span className='font-medium'>
            {data.docentete.DO_Ref || <Skeleton />}
          </span>
        </div>
        <div className='flex flex-col'>
          <span className='text-sm text-gray-500'>Expédition</span>
          <span className='font-medium'>
            {getExped(data.docentete.DO_Expedit) || <Skeleton />}
          </span>
        </div>
        <div className='flex flex-col'>
          <span className='text-sm text-gray-500'>Type de document</span>
          <span className='font-medium'>
            {(data.docentete.DO_Piece &&
              getDocumentType(data.docentete.DO_Piece)) || <Skeleton />}
          </span>
        </div>
      </div>

      {/* Table Header */}
      <div className='flex justify-between items-center mb-4'>
        <div>
          <DatePicker
            onChange={onDateChange}
            locale={locale}
            translate='y'
            lang='fr'
            className='border-2'
            placeholder='Date de livraison'
          // dateFormat='dd/MM/yyyy'
          />
        </div>
        <div className='flex gap-3'>
          <Button onClick={complation} loading={complationSpin}>
            Validation <ArrowRight size={18} />
          </Button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className='hidden md:block overflow-x-auto'>
        <Table>
          <Thead>
            <Tr>
              <Th>
                <Checkbox
                  onChange={handleSelectAll}
                  checked={
                    selected.length === data.doclignes.length &&
                    data.doclignes.length > 0
                  }
                ></Checkbox>
              </Th>

              <Th>Piece </Th>
              <Th>Ref Article </Th>
              <Th>Date Livraison</Th>
              <Th>Dimensions</Th>
              <Th>Matériaux</Th>
              <Th>Quantité</Th>
            </Tr>
          </Thead>

          <Tbody>
            {loading ? <SkeletonTable />
              : data.doclignes?.length > 0 ? (
                currentItems.map((item, index) => (
                  <Tr key={index} className='whitespace-nowrap'>
                    <Td className='py-4 whitespace-nowrap text-sm text-gray-500 text-center'>
                      <Checkbox
                        checked={selected.includes(item.line?.id)}
                        onChange={() => handleSelect(item.line?.id)}
                      />
                    </Td>

                    <Td className="font-black">
                      {item.article ? item.article.Nom : item?.Nom || '__'}{' '}
                      {item?.article?.Description || null}
                    </Td>

                    <Td> {item.AR_Ref || '__'}</Td>

                    <Td>
                      {item.line?.complation_date
                        ? dateFormat(item.line.complation_date)
                        : '__'}
                    </Td>

                    <Td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm text-gray-500'>
                        H:{' '}
                        {Math.floor(
                          item.article ? item.article.Hauteur : item.Hauteur
                        ) || '__'}
                      </div>
                      <div className='text-sm text-gray-500'>
                        L:{' '}
                        {Math.floor(
                          item.article ? item.article.Largeur : item.Largeur
                        ) || '__'}
                      </div>
                      <div className='text-sm text-gray-500'>
                        P:{' '}
                        {Math.floor(
                          item.article ? item.article.Profondeur : item.Profondeur
                        ) || '__'}
                      </div>
                    </Td>

                    <Td className='hidden lg:table-cell px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm text-gray-500'>
                        Couleur:{' '}
                        {(item.article ? item.article.Couleur : item.Couleur) ||
                          '__'}
                      </div>
                      <div className='text-sm text-gray-500'>
                        Chant:{' '}
                        {(item.article ? item.article.Chant : item.Chant) || '__'}
                      </div>
                      <div className='text-sm text-gray-500'>
                        Epaisseur:{' '}
                        {Math.floor(
                          item.article ? item.article.Episseur : item.Episseur
                        ) || '__'}
                      </div>
                    </Td>
                    <Td className='px-6 py-4 whitespace-nowrap'>
                      <span className='px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'>
                        {Math.floor(item.DL_Qte)}
                      </span>
                    </Td>
                  </Tr>
                ))
              ) : (
                <EmptyTable />
              )}
          </Tbody>
        </Table>
      </div>
    </div>
  )
}

export default Fabrication;
