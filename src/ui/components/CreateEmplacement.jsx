import React, { useState, useEffect } from 'react'
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  message,
  Card,
  Space,
  Typography,
} from 'antd'
import { PlusOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { api } from '../utils/api'
import { data } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const { Option } = Select

const CreateEmplacement = () => {
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [depots, setDepots] = useState([])
  const [loadingDepots, setLoadingDepots] = useState(false)
  const { roles } = useAuth();

  const getDepots = async () => {
    setLoadingDepots(true)
    try {
      const response = await api.get('depots')

      setDepots(response?.data?.data || [])
    } catch (error) {
      message.error('Erreur lors du chargement des dépôts')
      console.error('Error fetching depots:', error)
    } finally {
      setLoadingDepots(false)
    }
  }

  // Create emplacement
  const createEmplacement = async (values) => {
    setLoading(true)
    try {
      const response = await api.post('emplacement/create', {
        depot_id: values.depot_id,
        code: values.code,
        description: values.description,
      })

      message.success('Emplacement créé avec succès!')
      form.resetFields()
      setIsModalVisible(false)

      // You can add a callback here to refresh the parent component's data
      // onEmplacementCreated?.(response.data);
    } catch (error) {
      message.error("Erreur lors de la création de l'emplacement")
      console.error('Error creating emplacement:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle modal open
  const showModal = () => {
    setIsModalVisible(true)
    getDepots() // Fetch depots when modal opens
  }

  // Handle modal close
  const handleCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
  }

  // Handle form submission
  const handleSubmit = (values) => {
    createEmplacement(values)
  }

  return (
    <div>

      {
        roles('admin') ? <div>
          <Button
            type='primary'
            icon={<PlusOutlined />}
            size='middle'
            onClick={showModal}
          >
            Créer
          </Button>
        </div> : ""
      }


      <Modal
        title='Créer un Nouvel Emplacement'
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout='vertical'
          onFinish={handleSubmit}
          autoComplete='off'
        >
          <Form.Item
            label='Dépôt'
            name='depot_id'
            rules={[
              { required: true, message: 'Veuillez sélectionner un dépôt!' },
            ]}
          >
            <Select
              placeholder='Sélectionnez un dépôt'
              loading={loadingDepots}
              showSearch
              optionFilterProp='children'
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {depots.map((depot) => (
                <Option key={depot.id} value={depot.id}>
                  {depot.name} - {depot.code}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Code de l'Emplacement"
            name='code'
            rules={[
              { required: true, message: 'Veuillez saisir le code!' },
              {
                min: 2,
                message: 'Le code doit contenir au moins 2 caractères',
              },
              {
                max: 20,
                message: 'Le code ne peut pas dépasser 20 caractères',
              },
            ]}
          >
            <Input placeholder='Ex: A01, B-12, ZONE-1' maxLength={20} />
          </Form.Item>

          <Form.Item
            label='Description (Optionnel)'
            name='description'
            rules={[
              {
                max: 255,
                message: 'La description ne peut pas dépasser 255 caractères',
              },
            ]}
          >
            <Input.TextArea
              placeholder="Description de l'emplacement..."
              rows={3}
              maxLength={255}
              showCount
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCancel}>Annuler</Button>
              <Button
                type='primary'
                htmlType='submit'
                loading={loading}
                icon={<PlusOutlined />}
              >
                Créer l'Emplacement
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default CreateEmplacement
