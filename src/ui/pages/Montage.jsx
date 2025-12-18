import React, { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { getExped, getDocumentType, locale } from '../utils/config'
import { useParams } from 'react-router-dom'
import { Button, Checkbox, DatePicker, Empty, message, Tag } from 'antd'
import Skeleton from '../components/ui/Skeleton'
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table'
import { RefreshCcw, ArrowRight } from 'lucide-react'
import PrintDocument from '../components/PrintDocument';

function Montage() {
  const { id } = useParams()
  const [data, setData] = useState({ docentete: {}, doclignes: [] })
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState([])
  const [complationSpin, setComplationSpin] = useState(false)
  const currentItems = data?.doclignes || []

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await api.get(`docentetes/${id}`)
      setData(response.data)
    } catch (err) {
      message.error(err?.response?.data?.message)
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!id) return

    fetchData() // first load

    const interval = setInterval(() => {
      fetchData();
    }, 30000)

    return () => clearInterval(interval)
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
    try {
      await api.post('docentetes/start', data)
      fetchData()
      message.success('Date modifiée avec succès')
    } catch (error) {
      console.error(error);
      message.error(error?.response?.data?.message)
    }
    
    
  }

  const complation = async () => {
    if (selected.length === 0) return
    setComplationSpin(true)
    const data = {
      lines: selected,
    }
    try {
      await api.post('docentetes/complation', data)
      setComplationSpin(false)
      fetchData()
      message.success('Articles validés avec succès')
    } catch (error) {
      console.error(error);
      message.error(error?.response?.data?.message)
    }

   
  }

  const dateFormat = (date) => {
    const inputDate = new Date(date)

    const formattedDate = `${inputDate.getFullYear()}/${String(
      inputDate.getMonth() + 1
    ).padStart(2, '0')}/${
      Number(String(inputDate.getDate()).padStart(2, '0')) + 1
    }`
    return formattedDate
  }

  return (
    <div className='max-w-7xl mx-auto p-2 md:p-5'>
      <div className='flex justify-between items-center mb-6'>
        <div className='flex items-center space-x-3'>
          <h1 className='text-lg font-bold text-gray-800'>
            {data.docentete.DO_Piece
              ? `Commande ${data.docentete.DO_Piece}`
              : 'Chargement...'}
          </h1>
        </div>
        <div className='flex gap-2'>
          <Button onClick={fetchData}>
            {loading ? (
              <RefreshCcw className='animate-spin h-4 w-4 mr-2' />
            ) : (
              <RefreshCcw className='h-4 w-4 mr-2' />
            )}
            Rafraîchir
          </Button>
          <PrintDocument doclignes={data.doclignes} docentete={data.docentete} />
        </div>
      </div>

      {/* Document Info */}
     {/* Document Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {[
          {
            label: 'Client',
            value: data.docentete.DO_Tiers,
          },
          {
            label: 'Référence',
            value: data.docentete.DO_Ref,
          },
          {
            label: 'Expédition',
            value: getExped(data.docentete.DO_Expedit),
          },
          {
            label: 'Type de document',
            value: data.docentete.DO_Piece && getDocumentType(data.docentete.DO_Piece),
          },
        ].map(({ label, value }, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
            <div className="flex flex-col gap-2">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                {label}
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {value || <Skeleton />}
              </span>
            </div>
          </div>
        ))}
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
          <Button onClick={complation} color="green" variant="solid" loading={complationSpin}>
            Validation <ArrowRight size={18} />
          </Button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className='overflow-x-auto'>
        <Table>
          {
            data.doclignes?.length > 0 ? 
             <Thead>
            <Tr>
              <th className='px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 whitespace-nowrap'>
                <Checkbox
                  onChange={handleSelectAll}
                  checked={
                    selected.length === data.doclignes.length &&
                    data.doclignes.length > 0
                  }
                ></Checkbox>
              </th>

              <th className='px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 whitespace-nowrap'>Piece </th>
              <th className='px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 whitespace-nowrap'>Ref Article </th>
              <th className='px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 whitespace-nowrap'>Date Livraison</th>
                <th className='px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 whitespace-nowrap'>
                Hauteur
              </th>
              <th className='px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 whitespace-nowrap'>
                Largeur
              </th>
              {/* <th className='px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 whitespace-nowrap'>
                Profondeur
              </th> */}
                <th className='px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 whitespace-nowrap'>
                Couleur
              </th>

              <th className='px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 whitespace-nowrap'>
                Chant
              </th>

              <th className='px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 whitespace-nowrap'>
                Epaisseur
              </th>
              <th className='px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 whitespace-nowrap'>Quantité</th>
            </Tr>
          </Thead> : null
          }
         

          <Tbody>
            {loading ? (
               [...Array(4)].map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {[...Array(10)].map((_, colIndex) => (
                    <td className="px-6 py-4" key={colIndex}>
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data.doclignes?.length > 0 ? (
              currentItems.map((item, index) => (
                <Tr key={index} className='whitespace-nowrap'>
                  <td className='py-4 whitespace-nowrap text-sm text-gray-500 text-center'>
                    <Checkbox
                      checked={selected.includes(item.line?.id)}
                      onChange={() => handleSelect(item.line?.id)}
                    />
                  </td>

             <td className='px-2 text-sm border-r border-gray-100'>
                    <div className='text-sm font-medium text-gray-900 whitespace-nowrap'>
                      {item?.Nom ||
                        item.article?.Nom ||
                        item?.DL_Design ||
                        '__'}
                        {" "}
                        {item?.Poignee}
                        {" "}
                        {item?.Rotation}

                        {" "}
                        {item?.Description}
                    </div>
                  </td>

                  <td className='px-2 text-sm border-r border-gray-100'>{item.AR_Ref || '__'}</td>

                  <td className='px-2 text-sm border-r border-gray-100'>
                    <Tag> {item.line?.complation_date
                      ? dateFormat(item.line.complation_date)
                      : '__'}</Tag>
                  </td>

                  <td className='px-2 text-sm border-r border-gray-100'>
                    {item.Hauteur > 0 ?
                      Math.floor(item.Hauteur) :
                      Math.floor(item.article?.Hauteur) || '__'
                    }
                  </td>

                  <td className='px-2 text-sm border-r border-gray-100'>
                    {item.Largeur > 0
                      ? Math.floor(item.Largeur)
                      : Math.floor(item?.article?.Largeur) || '__'}
                  </td>
                  {/* <td className='px-2 text-sm border-r border-gray-100'>
                    {Math.floor(item.Profondeur ? item.Profondeur : item?.article?.Profonduer) || '__'}
                  </td> */}

                  <td className='px-2 text-sm border-r border-gray-100'>
                    {(item.Couleur ? item.Couleur : item?.article?.Couleur) || '__'}
                  </td>

                  <td className='px-2 text-sm border-r border-gray-100'>
                    {(item.Chant ? item.Chant : item?.article?.Chant) || '__'}
                  </td>

                  <td className='px-2 text-sm border-r border-gray-100'>
                    {item.Episseur > 0
                      ? Math.floor(item.Episseur)
                      : Math.floor(item?.article?.Episseur) || '__'}
                  </td>
                  <td className='px-2 py-1 whitespace-nowrap border-r border-gray-100'>
                    <span className='px-3 py-1 w-full justify-center border border-green-500 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'>
                      {Math.floor(item.EU_Qte)}
                    </span>
                  </td>
                </Tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan='10'
                  className='px-6 py-4 text-center text-sm text-gray-500'
                >
                  <Empty description="Aucun article trouvé"/>
                </td>
              </tr>
            )}
          </Tbody>
        </Table>
      </div>
    </div>
  )
}

export default Montage
