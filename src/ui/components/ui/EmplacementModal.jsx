// EmplacementModal.jsx
import { Collapse, message, Modal, Space, Skeleton, Popconfirm } from 'antd'
import { api } from '../../utils/api'
import { useEffect, useState, useMemo, useCallback } from 'react'
import PaletteArticleCard from './PaletteArticleCard'
import { Trash } from 'lucide-react'

const EmplacementModal = ({
  selectedEmplacement,
  setSelectedEmplacement,
  handleOk,
  parseEmplacement,
  inventory_id
}) => {
  const [emplacement, setEmplacement] = useState(null)
  const [palettes, setPalettes] = useState([])
  const [loading, setLoading] = useState(false)

  const emplacementData = useMemo(
    () => (selectedEmplacement ? parseEmplacement(selectedEmplacement) : null),
    [selectedEmplacement, parseEmplacement]
  )

  const getEmplacement = useCallback(async () => {
    if (!selectedEmplacement) return

    setLoading(true)
    try {
      const url = inventory_id
        ? `emplacement/${selectedEmplacement}/inventory/${inventory_id}`
        : `emplacement/${selectedEmplacement}`

      const response = await api.get(url)
      setEmplacement(response.data)
      setPalettes(response?.data?.palettes || [])
    } catch (error) {
      message.error(error?.response?.data?.message || 'Erreur lors du chargement')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [selectedEmplacement, inventory_id])

  useEffect(() => {
    if (selectedEmplacement) {
      setEmplacement(null)
      getEmplacement()
    } else {
      setEmplacement(null)
      setLoading(false)
    }
  }, [selectedEmplacement, getEmplacement])

  const handleCancel = useCallback(() => {
    setSelectedEmplacement(null)
  }, [setSelectedEmplacement])

  const handleDelete = async (palette_code) => {
    try {
      await api.delete(`palettes/${palette_code}`)
      setPalettes(prev => prev.filter(p => p.code !== palette_code))
      message.success('Palette supprimée avec succès.')
    } catch (error) {
      message.error(error?.response?.data?.message || 'Erreur')
    }
  }

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-2 border border-gray-200 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton.Input active size="small" />
          <Skeleton.Input active size="small" />
          <Skeleton.Input active size="small" />
          <Skeleton.Input active size="small" />
        </div>
      </div>
      <Skeleton active paragraph={{ rows: 3 }} />
    </div>
  )

  return (
    <Modal
      title={`Emplacement ${selectedEmplacement}`}
      open={!!selectedEmplacement}
      onOk={handleCancel}
      onCancel={handleCancel}
      centered
      destroyOnHidden={false}
      maskClosable={false}
      width={{
        xs: '95%',
        sm: '85%',
        md: '80%',
        lg: '70%',
        xl: '65%',
        xxl: '60%',
      }}
      bodyStyle={{
        maxHeight: '90vh',
        overflowY: 'auto',
      }}
    >
      {selectedEmplacement && (
        <>
          {loading ? (
            <div className="min-h-[300px] w-full">
              <LoadingSkeleton />
            </div>
          ) : (
            <div className="space-y-5">
              {/* Emplacement Info */}
                {
                  emplacementData?.rowNumber && (<div className="bg-white rounded-xl p-2 border border-gray-200 shadow-xs">
                    {emplacementData && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Depot</span>
                          <div className="font-medium">
                            {emplacement?.depot?.code || '-'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Rangée</span>
                          <div className="font-medium">
                            {emplacementData.rowNumber || '-'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Étage</span>
                          <div className="font-medium">
                            {emplacementData.floorLetter || '-'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Colonne</span>
                          <div className="font-medium">
                            {emplacementData.columnNumber || '-'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>)
                }
              

              {/* Palettes Section */}
              <div className="max-h-[70vh] overflow-y-auto pr-2">
                <Space direction="vertical" className="w-full">
                  {palettes.length > 0 ? (
                    palettes.map((palette, index) => (
                      <Collapse
                        key={palette.code || index}
                        defaultActiveKey={index === 0 ? [palette.code] : []}
                        className="rounded-lg border border-gray-200 hover:border-gray-300 transition"
                        items={[
                          {
                            key: palette.code,
                            label: (
                              <div className="flex justify-between items-center w-full">
                                <span className="font-semibold text-gray-900">
                                  {palette.code}
                                </span>

                                <div className="flex items-center gap-3">
                                  <span className="text-xs bg-gray-100 px-3 py-1 rounded-full border">
                                    {(inventory_id
                                      ? palette.inventory_articles?.length
                                      : palette.articles?.length) || 0}{' '}
                                    articles
                                  </span>

                                  <Popconfirm
                                    title="Supprimer cette palette ?"
                                    okText="Oui"
                                    cancelText="Non"
                                    onConfirm={() => handleDelete(palette.code)}
                                  >
                                    <button className="text-red-600 bg-red-100 border border-red-200 p-1.5 rounded-full hover:bg-red-200 transition">
                                      <Trash size={14} />
                                    </button>
                                  </Popconfirm>
                                </div>
                              </div>
                            ),
                            children:
                              (inventory_id
                                ? palette.inventory_articles?.length
                                : palette.articles?.length) > 0 ? (
                                <PaletteArticleCard
                                  palette={palette}
                                  inventory_id={inventory_id}
                                />
                              ) : (
                                <div className="text-center py-10 text-gray-500">
                                  <div className="text-4xl mb-2">📦</div>
                                  <p>Aucun article dans cette palette</p>
                                </div>
                              ),
                          },
                        ]}
                      />
                    ))
                  ) : (
                    <div className="text-center py-16 text-gray-500">
                      <div className="text-6xl mb-4">🎨</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Aucune palette trouvée
                      </h3>
                      <p>Aucune palette configurée pour cet emplacement.</p>
                    </div>
                  )}
                </Space>
              </div>

              {/* Status */}
              {emplacement?.status && (
                <div className="sticky bottom-0 bg-white pt-3 border-t flex justify-center">
                  <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {emplacement.status.charAt(0).toUpperCase() +
                      emplacement.status.slice(1)}
                  </span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </Modal>
  )
}

export default EmplacementModal
