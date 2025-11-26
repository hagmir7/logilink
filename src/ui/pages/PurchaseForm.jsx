import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Modal, Upload, message, Tag, Empty } from 'antd';
import { PlusOutlined, MinusCircleOutlined, PaperClipOutlined, UploadOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import AchatProductSearch from '../components/AchatProductSearch';
import TransferPurchaseDocument from '../components/TransferPurchaseDocument';
import FormListSkeleton from '../components/ui/FormListSkeleton';


const { Option } = Select;

export default function PurchaseForm() {
  const [form] = Form.useForm();
  const [isUrgent, setIsUrgent] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(null);
  const [lineFiles, setLineFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState(null);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setcurrentuser] = useState();
  const [currentService, setCurrentService] = useState();
  const { id } = useParams();
  const navigate = useNavigate();
  const { roles = [] } = useAuth();
  const [searchModal, setSearchModal] = useState({});
  const [units, setUnits] = useState()

  // Fetch all data on mount
  useEffect(() => {
    if (!id) {
      setLoading(false);
    }
    fetchAllData();

  }, [id]);

  const fetchAllData = async () => {
    try {

      // Fetch services and users (always needed)
      const [servicesRes, usersRes, unitsRes] = await Promise.all([
        api.get('services'),
        api.get('users'),
        api.get('units')
      ]);

      setServices(servicesRes.data || []);
      setUsers(usersRes.data || []);
      setUnits(unitsRes.data || [])

      if (id) {
        setLoading(true);
        const documentRes = await api.get(`purchase-documents/${id}`);
        const docData = documentRes.data;
        setcurrentuser(docData.user)
        setCurrentService(docData.service)

        setInitialData(docData);
        initializeFormWithData(docData);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      message.error(
        error?.response?.data?.message ||
        'Erreur lors du chargement des données'
      );
    } finally {
      setLoading(false);
    }
  };

  const initializeFormWithData = (docData) => {
    // Set urgent state
    setIsUrgent(docData.urgent || false);

    // Prepare form values
    const formValues = {
      reference: docData.reference,
      status: docData.status ? String(docData.status) : 1,
      service_id: docData.service_id,
      user_id: docData.user_id,
      note: docData.note,
      lines: docData.lines?.map(line => ({
        id: line.id,
        code: line.code,
        description: line.description,
        quantity: line.quantity,
        unit: line.unit,
        estimated_price: line.estimated_price,
      })) || []
    };

    form.setFieldsValue(formValues);

    if (users.length > 0) {
      form.setFieldsValue({
        user_id: docData.user_id || currentUser?.id,
        reference: docData.reference,
        status: docData.status ? String(docData.status) : 1,
        service_id: docData.service_id,
        note: docData.note,
        lines: docData.lines?.map(line => ({
          id: line.id,
          code: line.code,
          description: line.description,
          quantity: line.quantity,
          unit: line.unit,
          estimated_price: line.estimated_price,
        })) || []
      });
    }

    // Set existing files for display
    if (docData.lines) {
      const existingFiles = {};
      docData.lines.forEach((line, index) => {
        if (line.files && line.files.length > 0) {
          existingFiles[index] = line.files.map(file => ({
            uid: file.id,
            name: file.file_name || file.file_path.split('/').pop(),
            status: 'done',
            url: `/storage/${file.file_path}`,
            existing: true, // Mark as existing file
            fileId: file.id
          }));
        }
      });
      setLineFiles(existingFiles);
    }
  };

  useEffect(() => {
    if (users.length > 0 && currentUser) {
      form.setFieldsValue({ user_id: currentUser.id });

    }

    if (users.length > 0 && currentService) {
      form.setFieldsValue({ service_id: currentService.id });
    }
  }, [users, currentUser]);



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
      originFileObj: file.originFileObj,
      existing: file.existing || false, // Mark if it's an existing file
      fileId: file.fileId // Store file ID for deletion
    }));

    setLineFiles(prev => ({
      ...prev,
      [currentLineIndex]: files
    }));
  };

  const getFileCount = (index) => {
    return lineFiles[index]?.length || 0;
  };

  const onFinish = (values) => {
    const formData = new FormData();

    // Basic fields
    formData.append('reference', values.reference);
    formData.append('status', values.status || '0');
    if (values.service_id) formData.append('service_id', values.service_id);
    if (values.user_id) formData.append('user_id', values.user_id);
    formData.append('note', values.note || '');
    formData.append('urgent', isUrgent ? '1' : '0');

    // Lines
    if (values.lines && values.lines.length > 0) {
      values.lines.forEach((line, index) => {
        if (line.id) {
          formData.append(`lines[${index}][id]`, line.id);
        }

        formData.append(`lines[${index}][code]`, line.code || '');
        formData.append(`lines[${index}][description]`, line.description || '');
        formData.append(`lines[${index}][quantity]`, line.quantity || '0');
        formData.append(`lines[${index}][unit]`, line.unit || '');
        formData.append(`lines[${index}][estimated_price]`, line.estimated_price || '0');

        // Add files for this line
        if (lineFiles[index] && lineFiles[index].length > 0) {
          lineFiles[index].forEach((file) => {
            if (file.originFileObj && !file.existing) {
              formData.append(`lines[${index}][files][]`, file.originFileObj);
            }
          });
        }
      });
    }

    handleSubmit(formData);
  };

  const handleSubmit = async (formData) => {
    try {
      const hide = message.loading('Enregistrement en cours...', 0);

      if (id) {
        formData.append('_method', 'PUT'); // Laravel will treat as PUT
      }

      const url = id
        ? `/purchase-documents/${id}`
        : '/purchase-documents';

      const response = await api.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      hide();
      message.success(id ? 'Document mis à jour avec succès!' : 'Document créé avec succès!');

      if (!id) {
        navigate(`/purchase/${response.data.document.id}`);
      }

    } catch (error) {
      console.error('Submit error:', error);
      message.destroy();

      if (error.response?.data?.errors) {
        Object.values(error.response.data.errors).forEach(err => message.error(err[0]));
      } else {
        message.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
      }
    }
  };

  const statusOptions = [
    { value: "1", label: "Brouillon", color: "bg-gray-400" },
    { value: "2", label: "Envoyer", color: "bg-blue-400" },
    { value: "3", label: "En Révision", color: "bg-yellow-400" },
    { value: "4", label: "Approuvé", color: "bg-green-400" },
    { value: "5", label: "Rejeté", color: "bg-red-400" },
    { value: "6", label: "Commandé", color: "bg-purple-400" },
    { value: "7", label: "Reçu", color: "bg-teal-400" },
    { value: "8", label: "Annulé", color: "bg-gray-600" },
  ];

  const handleKeyDown = (event, lineIndex, field) => {
    if (event.key === "F4") {
      event.preventDefault();

      // Get all lines from the form
      const lines = form.getFieldValue("lines") || [];
      const currentLine = lines[lineIndex];

      if (!currentLine) {
        console.warn("No line found at index:", lineIndex);
        return;
      }

      let value = "";

      if (field === 'code') {
        value = currentLine.code || "";
      } else if (field === 'description') {
        value = currentLine.description || "";
      }

      setSearchModal({ open: true, lineIndex, value });
    }
  };

  const handleArticleSelect = (selectedArticles, lineIndex) => {
    const lines = form.getFieldValue('lines') || [];

    if (lineIndex === undefined || lineIndex < 0 || lineIndex >= lines.length) {
      console.warn('Invalid line index:', lineIndex);
      return;
    }

    if (selectedArticles.length === 1) {
      // Single article: Update the current line
      const article = selectedArticles[0];
      const updatedLines = [...lines];
      updatedLines[lineIndex] = {
        ...updatedLines[lineIndex],
        code: article.AR_Ref,
        description: article.AR_Design,
      };
      form.setFieldsValue({ lines: updatedLines });
      message.success('Article ajouté à la ligne');
    } else if (selectedArticles.length > 1) {
      // Multiple articles: Update first, create new lines for others
      const updatedLines = [...lines];

      // Update the current line with the first article
      updatedLines[lineIndex] = {
        ...updatedLines[lineIndex],
        code: selectedArticles[0].AR_Ref,
        description: selectedArticles[0].AR_Design,
      };

      // Create new lines for remaining articles
      const newLines = selectedArticles.slice(1).map(article => ({
        code: article.AR_Ref,
        description: article.AR_Design,
        quantity: 1,
        unit: '',
        estimated_price: 0,
      }));

      // Insert new lines after the current line
      updatedLines.splice(lineIndex + 1, 0, ...newLines);

      form.setFieldsValue({ lines: updatedLines });
      message.success(`${selectedArticles.length} articles ajoutés`);
    }
  };

  return (
    <div className='bg-gray-100 pb-32'>
      <div className="rounded-xl max-w-6xl mx-auto pt-2">
        <h2 className="text-md mb-4 font-bold">
          Document d'achat {"  "}
          {initialData && <Tag color='#f50' style={{ fontSize: '14px' }} className='font-bold tracking-widest'>{initialData.code}</Tag>}
        </h2>
        <AchatProductSearch
          searchModalOpen={searchModal.open}
          lineId={searchModal.lineIndex}
          inputValue={searchModal.value}
          onCancel={() => setSearchModal({ open: false, lineIndex: null, value: "" })}
          onSelect={handleArticleSelect}
        />


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
                style={{marginBottom: 0}}
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
                style={{marginBottom: 0}}
              >
                <Select
                  placeholder="Sélectionner le statut"
                  defaultActiveFirstOption={false}
                  value={initialData?.status ?? undefined}
                  className="w-full"
                  disabled={(Number(initialData?.status) > 2) && !roles('supper_admin')}
                >
                  {statusOptions.map((option) => (
                    <Select.Option key={option.value} value={option.value}>
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${option.color}`}></span>
                        {option.label}
                      </span>
                    </Select.Option>
                  ))}
                </Select>

              </Form.Item>

              {/* Service */}
              <Form.Item
                name="service_id"
                label={<span className="font-semibold text-gray-700">Service / Département</span>}
                style={{marginBottom: 0}}
              >
                <Select
                  placeholder="Sélectionner un service"
                  className="w-full"
                  showSearch
                  optionFilterProp="children"
                  disabled={!roles('supper_admin')}
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
                style={{marginBottom: 0}}
              >
                <Select
                  placeholder="Sélectionner un utilisateur"
                  className="w-full"
                  disabled={!roles('supper_admin')}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {users?.map((user) => (
                    <Select.Option key={user.id} value={user.id}>
                      {user.full_name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>



              {/* Note */}
              <Form.Item
                name="note"
                label={<span className="font-semibold text-gray-700">Note / Commentaire</span>}
                className="mb-0"
                style={{marginBottom: 0}}
              >
                <Input.TextArea
                  rows={1}
                  placeholder="Ajouter des notes, instructions spéciales ou commentaires..."
                  className="hover:border-blue-400 transition-colors"
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              {/* Urgent Button */}
              <div className='mt-7.5'>
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
                  {/* <div className="flex items-center justify-between ">
                  <h3 className="text-md mb-4 font-bold">Lignes de documents</h3>
                  {fields.length > 0 && (
                    <span className="text-sm text-gray-500 font-medium">
                      {fields.length} ligne{fields.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div> */}

                  {/* Purchase Lines */}
                  {fields.length > 0 ? (
                    <div className="space-y-3">
                      {fields.map((field, index) => (
                        <div
                          key={field.key}
                          className="relative grid grid-cols-1 md:grid-cols-6 gap-3 p-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/30 transition-all"
                        >
                          {/* Line Number Badge */}
                          {/* <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                          {index + 1}
                        </div> */}

                          {/* Hidden ID field for updates */}
                          <Form.Item
                            {...field}
                            name={[field.name, 'id']}
                            hidden
                            style={{marginBottom: 0}}
                          >
                            <Input type="hidden" />
                          </Form.Item>

                          {/* Code (optional) */}
                          <Form.Item
                            {...field}
                            name={[field.name, 'code']}
                            className="mb-0"
                            style={{marginBottom: 0}}
                          >
                            <Input
                              placeholder="Code (optionnel)"
                              className="w-full"
                              onKeyDown={(e) => handleKeyDown(e, index, 'code')}
                            />
                          </Form.Item>

                          {/* Description */}
                          <Form.Item
                            {...field}
                            name={[field.name, 'description']}
                            rules={[{ required: true, message: 'Requis' }]}
                            className="mb-0 col-span-2"
                            style={{marginBottom: 0}}
                          >
                            <Input
                              placeholder="Description de l'article"
                              className="w-full"
                              onKeyDown={(e) => handleKeyDown(e, index, 'description')}
                            />
                          </Form.Item>

                          {/* Quantity */}
                          <div className="flex gap-2 items-start">

                            <Form.Item
                              {...field}
                              name={[field.name, 'quantity']}
                              rules={[{ required: true, message: 'Requis' }]}
                              style={{marginBottom: 0}}
                            >
                              <Input
                                type="number"
                                placeholder="Qté"
                                min="0"
                                step="0.01"
                                className="w-full"
                              />

                            </Form.Item>


                          </div>

                          <div className="flex gap-2 items-start">

                            <Form.Item
                              {...field}
                              name={[field.name, 'unit']}
                              className="mb-0 w-full"
                              style={{marginBottom: 0}}
                            >
                              <Select
                                showSearch
                                // style={{ width: 90 }}
                                placeholder="Unité"
                                className="w-full"
                                options={units.map(u => ({ label: u.U_Intitule, value: u.U_Intitule }))}
                                optionFilterProp="label"
                                filterOption={(input, option) =>
                                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                              />
                            </Form.Item>


                          </div>




                          {/* <Form.Item
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
                        </Form.Item> */}

                          {/* Unit Action Buttons Container */}

                          <div className="flex gap-2 justify-between">


                            {/* Upload Files Button */}
                            <Button
                              type="default"
                              icon={<PaperClipOutlined />}
                              onClick={() => openUploadModal(index)}
                              className="flex-shrink-0 mt-0 pt-0"
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
                              disabled={(Number(initialData?.status) > 2) && !roles('supper_admin')}
                            />
                          </div>


                        </div>
                      ))}
                    </div>
                  ) : (loading ? <FormListSkeleton rows={5} /> :
                    <div className="flex flex-col items-center justify-center w-full h-full py-8 text-gray-400 text-center">
                      <Empty
                        image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                        // styles={{ height: 100 }}
                        description="Aucune ligne d'achat. Cliquez ci-dessous pour ajouter."
                      />
                    </div>

                  )}

                  {/* Add Button */}
                  <div className='flex justify-center mt-3 w-full'>
                    <Form.Item className="mb-0 w-1/4 ">
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                        disabled={(Number(initialData?.status) > 2) && !roles('supper_admin')}
                        className="border-2 border-dashed hover:border-blue-400 hover:text-blue-500 transition-colors "
                      >
                        Ajouter une ligne
                      </Button>
                    </Form.Item>
                  </div>
                </div>
              )}
            </Form.List>
          </div>

          {/* Submit Button */}
          <div className='mt-4 fixed right-0 bottom-0 py-3 z-40 bg-white w-full flex justify-end px-5 shadow-2xl border-t border-gray-200 gap-3'>
            <Form.Item>
              <Button type="primary" htmlType="submit" size="middle" disabled={(Number(initialData?.status) > 2) && !roles('supper_admin')}>
                {initialData ? 'Mettre à jour' : 'Enregistrer'}
              </Button>
            </Form.Item>

            {
              id && roles('admin') ? <TransferPurchaseDocument document={initialData} /> : ''
            }

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
              <Button icon={<UploadOutlined />} disabled={(Number(initialData?.status) > 2) && !roles('supper_admin')} block size="large" type="dashed">
                Cliquez ou glissez des fichiers ici
              </Button>
            </Upload>
            <p className="text-gray-500 text-sm mt-3">
              Vous pouvez joindre plusieurs fichiers (images, PDFs, documents, etc.)
            </p>
            {lineFiles[currentLineIndex]?.some(f => f.existing) && (
              <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-700">
                💡 Les fichiers existants sont affichés mais ne seront pas re-téléchargés
              </div>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
}