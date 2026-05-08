import { Select, Modal, DatePicker, message } from "antd"
import { useState } from "react"
import { api } from "../utils/api"
import { locale } from "../utils/config"

export default function OFDuplicateModal({ ofId, open, onClose, onSuccess }) {
  const [machines, setMachines]               = useState([])
  const [loadingMachines, setLoadingMachines] = useState(false)
  const [selectedMachine, setSelectedMachine] = useState(null)
  const [duplicating, setDuplicating]         = useState(false)
  const [dateLancement, setDateLancement]     = useState(null)
  const [dateDemarrage, setDateDemarrage]     = useState(null)

  const getMachines = async () => {
    setLoadingMachines(true)
    try {
      const response = await api.get('machines?per_page=100')
      setMachines(
        response.data.data
          .filter(m => m.is_active)
          .map(item => ({
            label: item.ref_machine ? `${item.ref_machine} — ${item.group_code}` : item.ref_machine,
            value: item.machine_id,
          }))
      )
    } catch (error) {
      message.error(error?.response?.data?.message || 'Erreur lors du chargement des machines')
    } finally {
      setLoadingMachines(false)
    }
  }

  const handleAfterOpen = (isOpen) => {
    if (isOpen) {
      setSelectedMachine(null)
      setDateLancement(null)
      setDateDemarrage(null)
      getMachines()
    }
  }

  const handleDuplicate = async () => {
    if (!selectedMachine) { message.warning('Veuillez sélectionner une machine'); return }
    if (!dateLancement)   { message.warning('Veuillez sélectionner une date de lancement'); return }

    setDuplicating(true)
    try {
      await api.post(`ordres-fabrication/${ofId}/duplicate`, {
        reference_machine:      selectedMachine,
        date_lancement_prevue:  dateLancement.format('YYYY-MM-DD'),
        ...(dateDemarrage && { date_demarrage: dateDemarrage.format('YYYY-MM-DD') }),
      })
      message.success('OF dupliqué avec succès')
      onClose()
      onSuccess?.()
    } catch (error) {
      message.error(error?.response?.data?.message || 'Erreur lors de la duplication')
    } finally {
      setDuplicating(false)
    }
  }

  return (
    <Modal
      title="Dupliquer l'OF"
      open={open}
      afterOpenChange={handleAfterOpen}
      onCancel={onClose}
      onOk={handleDuplicate}
      okText="Dupliquer"
      cancelText="Annuler"
      confirmLoading={duplicating}
      okButtonProps={{ disabled: !selectedMachine || !dateLancement }}
    >
      <div className="py-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sélectionner une machine
        </label>
        <Select
          showSearch
          placeholder="Rechercher une machine..."
          value={selectedMachine}
          onChange={setSelectedMachine}
          loading={loadingMachines}
          options={machines}
          optionFilterProp="label"
          style={{ width: '100%' }}
          size="large"
        />

        <div className="flex gap-2 mt-3">
          <div className="flex flex-col gap-1 w-full">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Date de lancement prévue <span className="text-red-500">*</span>
            </label>
            <DatePicker
              value={dateLancement}
              onChange={setDateLancement}
              format="DD/MM/YYYY"
              placeholder="JJ/MM/AAAA"
              locale={locale}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Date de démarrage
            </label>
            <DatePicker
              value={dateDemarrage}
              onChange={setDateDemarrage}
              format="DD/MM/YYYY"
              placeholder="JJ/MM/AAAA"
              locale={locale}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}