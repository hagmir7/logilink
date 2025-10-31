import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Select, Switch, Modal, Upload } from 'antd';
import { PlusOutlined, MinusCircleOutlined, PaperClipOutlined, UploadOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import { api } from '../utils/api';

const { Option } = Select;

export default function PurchaseForm({services, users }) {
  const [form] = Form.useForm();
  const [isUrgent, setIsUrgent] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(null);
  const [lineFiles, setLineFiles] = useState({});

  const onFinish = (values) => {
    // Combine form values with urgent status and files
    const formData = {
      ...values,
      urgent: isUrgent ? 1 : 0,
      // Add files to each line
      lines: values.lines?.map((line, index) => ({
        ...line,
        files: lineFiles[index] || []
      }))
    };

    onSubmit(formData);
    console.log(formData);
    
  };


  async function onSubmit(values) {
    try {
      const formData = new FormData();
      formData.append('urgent', isUrgent ? 1 : 0);
      formData.append('status', values.status);
      formData.append('reference', values.reference);
      formData.append('service_id', values.service_id);
      formData.append('user_id', values.user_id);
      formData.append('note', values.note || '');

      // Loop through purchase lines
      values.lines?.forEach((line, index) => {
        formData.append(`lines[${index}][code]`, line.code);
        formData.append(`lines[${index}][description]`, line.description);
        formData.append(`lines[${index}][quantity]`, line.quantity);
        formData.append(`lines[${index}][unit]`, line.unit);
        formData.append(`lines[${index}][estimated_price]`, line.estimated_price || '');

        // Append uploaded files for each line
        (lineFiles[index] || []).forEach((file, fileIndex) => {
          formData.append(`lines[${index}][files][${fileIndex}]`, file.originFileObj);
        });
      });

      const response = await api.post('/purchase-documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  }


  const openUploadModal = (index) => {
    setCurrentLineIndex(index);
    setUploadModalVisible(true);
  };

  const handleUploadChange = (info) => {
    const files = info.fileList.map(file => ({
      uid: file.uid,
      name: file.name,
      status: file.status,
      url: file.url,
      originFileObj: file.originFileObj
    }));

    setLineFiles(prev => ({
      ...prev,
      [currentLineIndex]: files
    }));
  };

  const getFileCount = (index) => {
    return lineFiles[index]?.length || 0;
  };

  return (
    <div className="py-4 px-4 bg-gray-50 rounded-xl max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Document d'achat</h2>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ urgent: false, status: '1' }}
      >
        {/* Document Info */}
        <div className="shadow-sm p-5 rounded-lg bg-white border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Reference */}
            <Form.Item
              name="reference"
              label={<span className="font-semibold text-gray-700">Référence</span>}
              rules={[{ required: true, message: 'Référence requise' }]}
              className="mb-0"
            >
              <Input
                placeholder="Ex: BON-2025-001"
                prefix={<span className="text-gray-400">#</span>}
                className="hover:border-blue-400 transition-colors"
              />
            </Form.Item>

            {/* Status */}
            <Form.Item
              name="status"
              label={<span className="font-semibold text-gray-700">Statut</span>}
              rules={[{ required: true, message: 'Statut requis' }]}
              className="mb-0"
            >
              <Select
                placeholder="Sélectionner le statut"
                className="w-full"
              >
                <Option value="1">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                    Brouillon
                  </span>
                </Option>
                <Option value="2">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    Soumis
                  </span>
                </Option>
                <Option value="3">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                    En Révision
                  </span>
                </Option>
                <Option value="4">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                    Approuvé
                  </span>
                </Option>
                <Option value="5">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                    Rejeté
                  </span>
                </Option>
                <Option value="6">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                    Commandé
                  </span>
                </Option>
                <Option value="7">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                    Reçu
                  </span>
                </Option>
                <Option value="8">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gray-600"></span>
                    Annulé
                  </span>
                </Option>
              </Select>
            </Form.Item>

            {/* Service */}
            <Form.Item
              name="service_id"
              label={<span className="font-semibold text-gray-700">Service / Département</span>}
              className="mb-0"
            >
              <Select
                placeholder="Sélectionner un service"
                className="w-full"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {services?.map((s) => (
                  <Option key={s.id} value={s.id}>{s.name}</Option>
                ))}
              </Select>
            </Form.Item>

            {/* User */}
            <Form.Item
              name="user_id"
              label={<span className="font-semibold text-gray-700">Utilisateur</span>}
              className="mb-0"
            >
              <Select
                placeholder="Sélectionner un utilisateur"
                className="w-full"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {users?.map((s) => (
                  <Option key={s.id} value={s.id}>{s.name}</Option>
                ))}
              </Select>
            </Form.Item>

            {/* Note - spans 2 columns on larger screens */}
            <Form.Item
              name="note"
              label={<span className="font-semibold text-gray-700">Note / Commentaire</span>}
              className="mb-0"
            >
              <Input.TextArea
                rows={1}
                placeholder="Ajouter des notes, instructions spéciales ou commentaires..."
                className="hover:border-blue-400 transition-colors"
                showCount
                maxLength={500}
              />
            </Form.Item>

            <div className='mt-7'>
              <Button
                type={isUrgent ? 'primary' : 'default'}
                danger={isUrgent}
                icon={isUrgent ? <span>🚨</span> : <span>⚪</span>}
                onClick={() => setIsUrgent(!isUrgent)}
                className={`font-medium transition-all  ${isUrgent ? 'shadow-md' : ''}`}
              >
                {isUrgent ? 'URGENT' : 'Marquer urgent'}
              </Button>
            </div>
          </div>
        </div>

        {/* Dynamic Purchase Lines */}
        <div className='p-4 rounded-lg bg-white mt-3 shadow-sm border border-gray-100'>
          <Form.List name="lines">
            {(fields, { add, remove }) => (
              <div className="space-y-1">
                {/* Header */}
                <div className="flex items-center justify-between ">
                  <h3 className="text-lg font-bold text-gray-800">Lignes d'achat</h3>
                  {fields.length > 0 && (
                    <span className="text-sm text-gray-500 font-medium">
                      {fields.length} ligne{fields.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Purchase Lines */}
                {fields.length > 0 ? (
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div
                        key={field.key}
                        className="relative grid grid-cols-1 md:grid-cols-5 gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/30 transition-all"
                      >
                        {/* Line Number Badge */}
                        <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                          {index + 1}
                        </div>

                        <Form.Item
                          {...field}
                          name={[field.name, 'code']}
                          rules={[{ required: true, message: 'Requis' }]}
                          className="mb-0"
                        >
                          <Input
                            placeholder="Code article"
                            className="w-full"
                          />
                        </Form.Item>



                        {/* Description */}
                        <Form.Item
                          {...field}
                          name={[field.name, 'description']}
                          rules={[{ required: true, message: 'Requis' }]}
                          className="mb-0"
                        >
                          <Input
                            placeholder="Description de l'article"
                            className="w-full"
                          />
                        </Form.Item>

                        {/* Quantity */}
                        <Form.Item
                          {...field}
                          name={[field.name, 'quantity']}
                          rules={[{ required: true, message: 'Requis' }]}
                          className="mb-0"
                        >
                          <Input
                            type="number"
                            placeholder="Qté"
                            min="0"
                            step="0.01"
                            className="w-full"
                          />
                        </Form.Item>
                        <Form.Item
                          {...field}
                          name={[field.name, 'estimated_price']}
                          className="mb-0 flex-1"
                        >
                          <Input
                            type="number"
                            placeholder="Prix estimé"
                            min="0"
                            step="0.01"
                            prefix="MAD"
                            className="w-full"
                          />
                        </Form.Item>


                        {/* Price & Action Buttons Container */}
                        <div className="flex gap-2 items-start">


                          {/* Unit */}
                          <Form.Item
                            {...field}
                            name={[field.name, 'unit']}
                            className="mb-0"
                          >
                            <Input
                              placeholder="Unité (kg, pcs...)"
                              className="w-full"
                            />
                          </Form.Item>


                          {/* Upload Files Button */}
                          <Button
                            type="default"
                            icon={<PaperClipOutlined />}
                            onClick={() => openUploadModal(index)}
                            className="flex-shrink-0"
                            title="Joindre des fichiers"
                          >
                            {getFileCount(index) > 0 && (
                              <span className="ml-1 text-blue-600 font-semibold">
                                ({getFileCount(index)})
                              </span>
                            )}
                          </Button>

                          {/* Delete Button */}
                          <Button
                            type="text"
                            danger
                            icon={<MinusCircleOutlined />}
                            onClick={() => remove(field.name)}
                            className="flex-shrink-0"
                            title="Supprimer cette ligne"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-sm">Aucune ligne d'achat. Cliquez ci-dessous pour ajouter.</p>
                  </div>
                )}

                {/* Add Button */}
                <Form.Item className="mb-0">
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                    className="border-2 border-dashed hover:border-blue-400 hover:text-blue-500 transition-colors"
                  >
                    Ajouter une ligne d'achat
                  </Button>
                </Form.Item>
              </div>
            )}
          </Form.List>
        </div>

        <div className='mt-4'>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Enregistrer
            </Button>
          </Form.Item>
        </div>
      </Form>

      {/* Upload Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <PaperClipOutlined className="text-blue-500" />
            <span>Joindre des fichiers - Ligne {currentLineIndex !== null ? currentLineIndex + 1 : ''}</span>
          </div>
        }
        open={uploadModalVisible}
        onOk={() => setUploadModalVisible(false)}
        onCancel={() => setUploadModalVisible(false)}
        width={600}
        okText="Terminé"
        cancelText="Annuler"
      >
        <div className="py-4">
          <Upload
            multiple
            fileList={currentLineIndex !== null ? lineFiles[currentLineIndex] || [] : []}
            onChange={handleUploadChange}
            beforeUpload={() => false}
            listType="text"
          >
            <Button icon={<UploadOutlined />} block size="large" type="dashed">
              Cliquez ou glissez des fichiers ici
            </Button>
          </Upload>
          <p className="text-gray-500 text-sm mt-3">
            Vous pouvez joindre plusieurs fichiers (images, PDFs, documents, etc.)
          </p>
        </div>
      </Modal>
    </div>
  );
}