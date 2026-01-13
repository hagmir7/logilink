import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Modal, Upload, message, Tag, Empty, Checkbox } from 'antd';
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
  const [currentUser, setCurrentUser] = useState();
  const [currentService, setCurrentService] = useState();
  const { id } = useParams();
  const navigate = useNavigate();
  const authContext = useAuth();
  const [searchModal, setSearchModal] = useState({});
  const [units, setUnits] = useState([]);
  let baseURL = localStorage.getItem('connection_url') || 'http://192.168.1.113/api/';

  // Helper function to check roles - handles different formats
  const hasRole = (roleNames) => {
    const checkRoles = Array.isArray(roleNames) ? roleNames : [roleNames];
    
    // If roles is a function (like in your original code)
    if (typeof authContext?.roles === 'function') {
      return authContext.roles(checkRoles);
    }
    
    // If roles is an array
    if (Array.isArray(authContext?.roles)) {
      return checkRoles.some(role => authContext.roles.includes(role));
    }
    
    // If roles is an object with role properties
    if (authContext?.roles && typeof authContext.roles === 'object') {
      return checkRoles.some(role => authContext.roles[role] === true);
    }
    
    // Default: no roles
    return false;
  };

  // Fetch all data on mount
  useEffect(() => {
    if (!id) {
      setLoading(false);
    }
    fetchAllData();
  }, [id]);

  const getCheckedLines = () => {
    const lines = form.getFieldValue('lines') || [];
    const checkedLines = lines.filter(l => l?.checked === true);
    console.log('All lines:', lines);
    console.log('Checked lines:', checkedLines);
    return checkedLines;
  };

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
      setUnits(unitsRes.data || []);

      if (id) {
        setLoading(true);
        const documentRes = await api.get(`purchase-documents/${id}`);
        const docData = documentRes.data;
        setCurrentUser(docData.user);
        setCurrentService(docData.service);

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
      service_id: docData.service_id,
      reference: docData.reference,
      status: docData.status ? String(docData.status) : '1',
      user_id: docData.user_id,
      note: docData.note,
      lines: docData.lines?.map(line => ({
        id: line.id,
        code: line.code,
        description: line.description,
        quantity: line.quantity,
        unit: line.unit,
        estimated_price: line.estimated_price,
        checked: false, // Initialize checkbox as unchecked
      })) || []
    };

    form.setFieldsValue(formValues);

    // Set existing files for display
    if (docData.lines) {
      const existingFiles = {};
      docData.lines.forEach((line, index) => {
        if (line.files && line.files.length > 0) {
          existingFiles[index] = line.files.map(file => ({
            uid: file.id,
            name: file.file_name || file.file_path.split('/').pop(),
            status: 'done',
            existing: true,
            fileId: file.id,
            url: `${baseURL}/download-file/${file.id}`
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
  }, [users, currentUser, form]);

  useEffect(() => {
    if (services.length > 0 && currentService) {
      form.setFieldsValue({ service_id: currentService.id });
    }
  }, [services, currentService, form]);

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
      existing: file.existing || false,
      fileId: file.fileId
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
    formData.append('status', values.status ? String(values.status) : '1');
    if (values.service_id) formData.append('service_id', values.service_id);
    if (values.user_id) formData.append('user_id', values.user_id);
    formData.append('note', values.note || '');
    formData.append('urgent', isUrgent ? '1' : '0');

    // Selective transfer logic
    const lines = values.lines || [];
    const checkedLines = lines.filter(line => line.checked === true);

    // If user checked something → only those, otherwise all lines
    const linesToSend = checkedLines.length > 0 ? checkedLines : lines;

    linesToSend.forEach((line, index) => {
      if (line.id) {
        formData.append(`lines[${index}][id]`, line.id);
      }

      formData.append(`lines[${index}][code]`, line.code || '');
      formData.append(`lines[${index}][description]`, line.description || '');
      formData.append(`lines[${index}][quantity]`, line.quantity || '0');
      formData.append(`lines[${index}][unit]`, line.unit || '');
      formData.append(`lines[${index}][estimated_price]`, line.estimated_price || '0');

      // Attach files
      const originalIndex = values.lines.indexOf(line);
      if (lineFiles[originalIndex]?.length > 0) {
        lineFiles[originalIndex].forEach(file => {
          if (file.originFileObj && !file.existing) {
            formData.append(`lines[${index}][files][]`, file.originFileObj);
          }
        });
      }
    });

    handleSubmit(formData);
  };

  const handleSubmit = async (formData) => {
    try {
      const hide = message.loading('Enregistrement en cours...', 0);

      if (id) {
        formData.append('_method', 'PUT');
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
    { value: "8", label: "Reçu non conforme", color: "bg-gray-600" },
  ];

  const handleKeyDown = (event, lineIndex, field) => {
    if (event.key === "F4") {
      event.preventDefault();

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
        code: article.code,
        description: article.description,
      };
      form.setFieldsValue({ lines: updatedLines });
      message.success('Article ajouté à la ligne');
    } else if (selectedArticles.length > 1) {
      // Multiple articles: Update first, create new lines for others
      const updatedLines = [...lines];

      // Update the current line with the first article
      updatedLines[lineIndex] = {
        ...updatedLines[lineIndex],
        code: selectedArticles[0].code,
        description: selectedArticles[0].description,
      };

      // Create new lines for remaining articles
      const newLines = selectedArticles.slice(1).map(article => ({
        code: article.code,
        description: article.description,
        quantity: 1,
        unit: '',
        estimated_price: 0,
        checked: false, // Initialize checkbox
      }));

      // Insert new lines after the current line
      updatedLines.splice(lineIndex + 1, 0, ...newLines);

      form.setFieldsValue({ lines: updatedLines });
      message.success(`${selectedArticles.length} articles ajoutés`);
    }
  };

  const forceDownload = async (fileId, filename) => {
    try {
      const response = await api.get(
        `download/purchase-file/${fileId}`,
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      message.error('Téléchargement échoué');
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
                style={{ marginBottom: 0 }}
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
                style={{ marginBottom: 0 }}
              >
                <Select
                  placeholder="Sélectionner le statut"
                  defaultActiveFirstOption={false}
                  className="w-full"
                  disabled={(Number(initialData?.status) > 2) && hasRole('chef_service')}
                >
                  {statusOptions
                    .filter(option => {
                      const currentValue = String(initialData?.status);

                      // Always keep current value (even if > 2)
                      if (String(option.value) === currentValue) {
                        return true;
                      }

                      // chef_service → only 1 & 2 selectable
                      if (hasRole('chef_service')) {
                        return ['1', '2'].includes(String(option.value));
                      }

                      return true;
                    })
                    .map(option => {
                      const isCurrent = String(option.value) === String(initialData?.status);
                      const isDisabled = hasRole('chef_service') && Number(option.value) > 2 && !isCurrent;

                      return (
                        <Select.Option
                          key={String(option.value)}
                          value={String(option.value)}
                          disabled={isDisabled}
                        >
                          <span className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${option.color}`}></span>
                            {option.label}
                          </span>
                        </Select.Option>
                      );
                    })}
                </Select>
              </Form.Item>

              {/* Service */}
              <Form.Item
                name="service_id"
                label={<span className="font-semibold text-gray-700">Service / Département</span>}
                style={{ marginBottom: 0 }}
              >
                <Select
                  placeholder="Sélectionner un service"
                  className="w-full"
                  showSearch
                  optionFilterProp="children"
                  disabled={!hasRole('supper_admin')}
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
                style={{ marginBottom: 0 }}
              >
                <Select
                  placeholder="Sélectionner un utilisateur"
                  className="w-full"
                  disabled={!hasRole('supper_admin')}
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
                style={{ marginBottom: 0 }}
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
                  className={`font-medium transition-all ${isUrgent ? 'shadow-md' : ''}`}
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
                  {/* Purchase Lines */}
                  {fields.length > 0 ? (
                    <div className="space-y-3">
                      {fields.map((field, index) => (
                        <div
                          key={field.key}
                          className="relative grid grid-cols-1 md:grid-cols-6 gap-3 p-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/30 transition-all"
                        >
                          {/* Hidden ID field for updates */}
                          <Form.Item
                            {...field}
                            name={[field.name, 'id']}
                            hidden
                            style={{ marginBottom: 0 }}
                          >
                            <Input type="hidden" />
                          </Form.Item>

                          {/* Code (optional) */}
                          <Form.Item
                            {...field}
                            name={[field.name, 'code']}
                            className="mb-0"
                            style={{ marginBottom: 0 }}
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
                            style={{ marginBottom: 0 }}
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
                              style={{ marginBottom: 0 }}
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

                          {/* Unit */}
                          <div className="flex gap-2 items-start">
                            <Form.Item
                              {...field}
                              name={[field.name, 'unit']}
                              className="mb-0 w-full"
                              style={{ marginBottom: 0 }}
                            >
                              <Select
                                showSearch
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

                          {/* Action Buttons */}
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
                              disabled={(Number(initialData?.status) > 2) && !hasRole('supper_admin')}
                            />
                            
                            {/* Checkbox */}
                            <Form.Item
                              {...field}
                              name={[field.name, 'checked']}
                              valuePropName="checked"
                              style={{ marginBottom: 0 }}
                            >
                              <Checkbox />
                            </Form.Item>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (loading ? <FormListSkeleton rows={5} /> :
                    <div className="flex flex-col items-center justify-center w-full h-full py-8 text-gray-400 text-center">
                      <Empty
                        image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                        description="Aucune ligne d'achat. Cliquez ci-dessous pour ajouter."
                      />
                    </div>
                  )}

                  {/* Add Button */}
                  <div className='flex justify-center mt-3 w-full'>
                    <Form.Item className="mb-0 w-1/4">
                      <Button
                        type="dashed"
                        onClick={() => add({ checked: false })} // Initialize new lines with checked: false
                        block
                        icon={<PlusOutlined />}
                        disabled={(Number(initialData?.status) > 2) && !hasRole('supper_admin')}
                        className="border-2 border-dashed hover:border-blue-400 hover:text-blue-500 transition-colors"
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
              <Button 
                type="primary" 
                htmlType="submit" 
                size="middle" 
                disabled={(Number(initialData?.status) > 2) && !hasRole('supper_admin')}
              >
                {initialData ? 'Mettre à jour' : 'Enregistrer'}
              </Button>
            </Form.Item>

            {id && hasRole('admin') ? (
              <TransferPurchaseDocument
                document={initialData}
                getCheckedLines={getCheckedLines}
                fetchAllData={fetchAllData}
              />
            ) : null}
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
              onDownload={(file) => {
                if (!file.fileId) return message.error('Fichier introuvable');
                forceDownload(file.fileId, file.name);
              }}
              showUploadList={{
                showDownloadIcon: true,
                showPreviewIcon: false,
              }}
              itemRender={(originNode, file) => {
                if (file.existing) {
                  return (
                    <div className="flex items-center justify-between">
                      {originNode}
                    </div>
                  );
                }
                return originNode;
              }}
            >
              <Button 
                icon={<UploadOutlined />} 
                disabled={(Number(initialData?.status) > 2) && !hasRole('supper_admin')} 
                block 
                size="large" 
                type="dashed"
              >
                Cliquez ou glissez des fichiers ici
              </Button>
            </Upload>

            <p className="text-gray-500 text-sm mt-3">
              Vous pouvez joindre plusieurs fichiers (images, PDFs, documents, etc.)
            </p>
          </div>
        </Modal>
      </div>
    </div>
  );
}