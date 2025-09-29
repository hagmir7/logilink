import React, { useState } from 'react'
import { Button, Input, message, Modal, Select } from 'antd'
import { PlusCircle } from 'lucide-react'
import { api } from '../utils/api'

const DepotForm = () => {
  const [opentModal, setOpenModal] = useState(false)
  const [depot, setDepot] = useState({
    code: '',
    company_id: '',
  })

  const createDepot = async () => {
    try {
      await api.post('depots/create', {
        code: depot.code,
        company_id: depot.company_id,
      })
      message.success('Dépôt créé avec succès')
    } catch (error) {
      message.error(error.response.data.message)
      console.error(error)
    }
  }

  return (
    <div>
      <Button
        color='cyan'
        variant='solid'
        onClick={() => setOpenModal(true)}
      >
        <PlusCircle size={20} />
        <span className='text-md'>Créer</span>
      </Button>
      <Modal
        title='Depot'
        centered
        open={opentModal}
        okText='Enregistrer'
        onOk={() => {
          createDepot()
          setOpenModal(false)
        }}
        onCancel={() => setOpenModal(false)}
      >
        <label htmlFor='depot' className='text-md text-gray-600'>
          Depot <strong className='text-red-600'>*</strong>
        </label>
        <Input
          onChange={(e) => setDepot({ ...depot, code: e.target.value })}
          placeholder='Depot code'
          size='large'
          required
          className='mb-5'
        />
        <div className='py-3'></div>
        <label htmlFor='company' className='text-md text-gray-600'>
          Entreprise <strong className='text-red-600 text-md'>*</strong>
        </label>
        <Select
          placeholder='Entreprise'
          size='large'
          className='w-full'
          aria-required
          onChange={(value) => setDepot({ ...depot, company_id: value })}
          options={[
            {
              label: 'Intercocina',
              value: 1,
            },
            {
              label: 'Serie Moble',
              value: 2,
            },
          ]}
        />
      </Modal>
    </div>
  )
}

export default DepotForm
