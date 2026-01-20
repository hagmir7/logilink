import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Form, Input, InputNumber, Button, Modal, Select, message } from 'antd';
import { api } from '../utils/api';

const { Option } = Select;

const TransferPurchaseDocument = ({ document, getCheckedLines, fetchAllData }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [company, setCompany] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [selectedLines, setSelectedLines] = useState([]);
    const [devise, setDevise] = useState([]);

    const [form] = Form.useForm();

    const showModal = () => {
        const checkedLines = getCheckedLines();
        setSelectedLines(checkedLines);
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const onFinish = async (values) => { 

        const linesToTransfer = selectedLines.length > 0 
            ? selectedLines 
            : document?.lines || [];

        const hide = message.loading('Enregistrement en cours...', 0);
        try {
            const response = await api.post('purchase-documents/transfer', {
                ...values,
                document_id: document?.id,
                lines: linesToTransfer,
            });
            message.success('Document transféré avec succès!');
            fetchAllData()
            setIsModalOpen(false);
            form.resetFields();
        } catch (error) {
            console.error('Submit error:', error);
            
            if (error.response?.data?.errors) {
                Object.values(error.response.data.errors).forEach(err => message.error(err[0]));
            } else {
                message.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
            }
        } finally {
            hide();
        }
    };

    const getCompts = async () => {
        try {
            const params = new URLSearchParams();
            if (company) params.append('company_db', company);

            const response = await api.get(`client/suppliers?${params.toString()}`);
            setSuppliers(
                response.data.map(item => ({
                    label: item.CT_Num + " " + item.CT_Intitule,
                    value: item.CT_Num
                }))
            );
        } catch (error) {
            console.error(error);
            message.error(error.response?.data?.message || 'Erreur lors de la récupération des fournisseurs');
        }
    };

     const getDevise = async () => {
        try {
            const params = new URLSearchParams();
            if (company) params.append('company_db', company);

            const response = await api.get(`devise?${params.toString()}`);
            setDevise(
                response.data.map(item => ({
                    label: item.D_Intitule + " - " + item.D_Monnaie,
                    value: item.cbIndice
                }))
            );
        } catch (error) {
            console.error(error);
            message.error(error.response?.data?.message || 'Erreur lors de la récupération des fournisseurs');
        }
    };

    useEffect(() => {
        getCompts();
        getDevise();
    }, [company]); 

    const changeCompany = (value) => {
        setCompany(value);
        form.setFieldsValue({
            supplier: null
        });
    };

    return (
        <>
            <Button color="cyan" variant="solid" type="primary" onClick={showModal}>
                <span>Transfert</span>
            </Button>
            <Modal
                title={
                    <div>
                        <div>Transférer vers Sage</div>
                        <div className="text-sm text-gray-500 font-normal mt-1">
                            {selectedLines.length > 0 
                                ? `${selectedLines.length} ligne(s) sélectionnée(s)`
                                : 'Toutes les lignes seront transférées'}
                        </div>
                    </div>
                }
                closable={{ 'aria-label': 'Custom Close Button' }}
                cancelText="Annuler"
                open={isModalOpen}
                onCancel={handleCancel}
                footer={false}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    className="max-w-md mx-auto"
                >
                    <Form.Item
                        label={<span className="font-semibold text-gray-700 mt-2">Société</span>}
                        name="company_db"
                        rules={[
                            { required: true, message: 'La Société est requise' },
                        ]}
                    >
                        <Select
                            onChange={changeCompany}
                            placeholder="Sélectionnez la société"
                            className="w-full"
                        >
                            <Select.Option value="sqlsrv_inter">Intercocina</Select.Option>
                            <Select.Option value="sqlsrv_asti">AstiDkora</Select.Option>
                            <Select.Option value="sqlsrv_serie">Seriemoble</Select.Option>
                            <Select.Option value="sqlsrv">Stile Mobili</Select.Option>
                        </Select>
                    </Form.Item>

                    {/* Souche */}
                    <Form.Item
                        label={<span className="font-semibold text-gray-700 mt-2">Souche</span>}
                        name="souche"
                        rules={[
                            { required: true, message: 'La souche est requise' },
                        ]}
                    >
                        <Select placeholder="Sélectionnez la souche" className="w-full">
                            <Option value={0}>Achat A</Option>
                            <Option value={2}>Achat B</Option>
                        </Select>
                    </Form.Item>


                      <Form.Item
                        label={<span className="font-semibold text-gray-700 mt-2">Devise</span>}
                        name="devise"
                        rules={[
                            { required: true, message: 'La devis est requise' },
                        ]}
                    >
                        <Select placeholder="Sélectionnez la devise" options={devise} className="w-full"/ >
                    </Form.Item>

                    {/* Référence */}
                    <Form.Item
                        label={<span className="font-semibold text-gray-700 mt-2">Référence</span>}
                        name="reference"
                        rules={[
                            { required: true, message: 'La référence est requise' },
                            { max: 50, message: 'Maximum 50 caractères' },
                        ]}
                    >
                        <Input defaultValue={document?.reference} placeholder="Entrez la référence" />
                    </Form.Item>

                    {/* Fournisseur */}
                    <Form.Item
                        label={<span className="font-semibold text-gray-700 mt-2">Fournisseur</span>}
                        name="supplier"
                        rules={[
                            { required: true, message: 'Le fournisseur est requis' },
                        ]}
                    >
                        <Select
                            showSearch
                            placeholder="Sélectionnez un fournisseur"
                            optionFilterProp="label"
                            filterOption={(input, option) =>
                                option.label.toLowerCase().includes(input.toLowerCase())
                            }
                            options={suppliers}
                        />
                    </Form.Item>

                    <div className='mt-3'>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" className="w-full">
                                Enregistrer
                            </Button>
                        </Form.Item>
                    </div>
                </Form>
            </Modal>
        </>
    );
};

export default TransferPurchaseDocument;