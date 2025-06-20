// EmplacementModal.jsx
import { Collapse, message, Modal, Space, Skeleton } from 'antd'
import { api } from '../../utils/api'
import { useEffect, useState, useMemo, useCallback } from 'react'
import PaletteArticleCard from './PaletteArticleCard'

const EmplacementModal = ({
  selectedEmplacement,
  setSelectedEmplacement,
  handleOk,
  parseEmplacement,
}) => {
  const [emplacement, setEmplacement] = useState(null)
  const [loading, setLoading] = useState(false)

  const emplacementData = useMemo(
    () => (selectedEmplacement ? parseEmplacement(selectedEmplacement) : null),
    [selectedEmplacement, parseEmplacement]
  )

  const getEmplacement = useCallback(async () => {
    if (!selectedEmplacement) return

    setLoading(true)
    try {
      const response = await api.get(`emplacement/${selectedEmplacement}`)
      setEmplacement(response.data)
    } catch (error) {
      message.error(error?.response?.data?.message || 'Erreur lors du chargement')
      console.error(error);
    } finally {
      setLoading(false)
    }
  }, [selectedEmplacement])

  useEffect(() => {
    if (selectedEmplacement) {
      setEmplacement(null)
      setLoading(true)
      getEmplacement()
    } else {
      setEmplacement(null)
      setLoading(false)
    }
  }, [selectedEmplacement, getEmplacement])

  const handleCancel = useCallback(() => {
    setSelectedEmplacement(null)
  }, [setSelectedEmplacement])

  const LoadingSkeleton = () => (
    <div className='space-y-4'>
      <div className='bg-gray-50 rounded-lg p-4 border border-gray-300 mt-7'>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <Skeleton.Input active size='small' />
          <Skeleton.Input active size='small' />
          <Skeleton.Input active size='small' />
          <Skeleton.Input active size='small' />
        </div>
      </div>
      <div className='space-y-2'>
        <Skeleton active paragraph={{ rows: 2 }} />
        <Skeleton active paragraph={{ rows: 1 }} />
      </div>
    </div>
  )

  return (
    <Modal
      title={`Emplacement ${selectedEmplacement}`}
      closable={{ 'aria-label': 'Custom Close Button' }}
      open={!!selectedEmplacement}
      onOk={handleCancel}
      width={{
        xs: '90%',
        sm: '80%',
        md: '70%',
        lg: '60%',
        xl: '50%',
        xxl: '40%',
      }}
      onCancel={handleCancel}
      destroyOnClose={false}
      maskClosable={false}
    >
      <div style={{ minHeight: '200px' }}>
        {' '}
        {selectedEmplacement && (
          <>
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <div className='space-y-4'>
                <div className='bg-gray-50 rounded-lg p-4 border border-gray-300 mt-7'>
                  {emplacementData && (
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                      <div>
                        <span className='text-gray-500'>Depot:</span>
                        <span className='ml-2 font-medium'>
                          {emplacement?.depot?.code || '-'}
                        </span>
                      </div>
                      <div>
                        <span className='text-gray-500'>Rangée:</span>
                        <span className='ml-2 font-medium'>
                          {emplacementData.rowNumber || '-'}
                        </span>
                      </div>
                      <div>
                        <span className='text-gray-500'>Étage:</span>
                        <span className='ml-2 font-medium'>
                          {emplacementData.floorLetter || '-'}
                        </span>
                      </div>
                      <div>
                        <span className='text-gray-500'>Colonne:</span>
                        <span className='ml-2 font-medium'>
                          {emplacementData.columnNumber || '-'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Palettes Section */}
                <Space direction='vertical' className='w-full p-0'>
                  {emplacement?.palettes?.length > 0 ? (
                    emplacement.palettes.map((palette, paletteIndex) => (
                      <Collapse
                        key={palette.code || paletteIndex}
                        defaultActiveKey={
                          paletteIndex === 0 ? [palette.code] : []
                        }
                        ghost={false}
                        items={[
                          {
                            key: palette.code,
                            label: (
                              <div className='flex justify-between'>
                                <span className='font-semibold text-gray-900'>
                                  {palette.code}
                                </span>
                                <span className='text-sm text-gray-500 bg-gray-100 px-2 border border-gray-300 py-1 rounded-full'>
                                  {palette.articles?.length || 0} articles
                                </span>
                              </div>
                            ),
                            children:
                              palette.articles?.length > 0 ? (
                                <PaletteArticleCard palette={palette} />
                              ) : (
                                <div className='text-center py-8 text-gray-500'>
                                  <div className='text-4xl mb-2'>📦</div>
                                  <p>Aucun article dans cette palette</p>
                                </div>
                              ),
                          },
                        ]}
                      />
                    ))
                  ) : (
                    <div className='text-center py-12 text-gray-500'>
                      <div className='text-6xl mb-4'>🎨</div>
                      <h3 className='text-lg font-medium text-gray-900 mb-2'>
                        Aucune palette trouvée
                      </h3>
                      <p>
                        Il n'y a pas de palettes configurées pour cet
                        emplacement.
                      </p>
                    </div>
                  )}
                </Space>

                {/* Status section */}
                {emplacement?.status && (
                  <div className='flex items-center justify-center'>
                    <span className='inline-block px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800'>
                      {emplacement.status.charAt(0).toUpperCase() +
                        emplacement.status.slice(1)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  )
}

export default EmplacementModal
