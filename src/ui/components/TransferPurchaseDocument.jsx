
import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Form, Input, InputNumber, Button, Modal, Select, message } from 'antd';
import { api } from '../utils/api';


const { Option } = Select;
const TransferPurchaseDocument = ({ document }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [company, setCompany] = useState(false);
    const [suppliers, SetSuppliers] = useState([]);

    const [form] = Form.useForm();


    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const onFinish = async (values) => {  // Add values parameter
        const hide = message.loading('Enregistrement en cours...', 0);
        try {
            const response = await api.post('purchase-documents/transfer', {
                ...values,
                document_id: document?.id 
            });
            message.success('Document transféré avec succès!');
            setIsModalOpen(false);  // Close modal on success
            form.resetFields();  // Reset form
        } catch (error) {
            console.error('Submit error:', error);
            
            if (error.response?.data?.errors) {
                Object.values(error.response.data.errors).forEach(err => message.error(err[0]));
            } else {
                message.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
            }
        } finally {
            hide();  // Always hide loading message
        }
    }

    const getCompts = async () => {
        try {
            const params = new URLSearchParams();
            if (company) params.append('company_db', company);

            const response = await api.get(`client/suppliers?${params.toString()}`);
            SetSuppliers(
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

    useEffect(() => {
        getCompts();
    }, [company]); 


    return (
        <>
            <Button color="cyan" variant="solid" type="primary" onClick={showModal}>
                <span>Transfert</span>
            </Button>
            <Modal
                title="Transférer vers Sage"
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
                            onChange={(value) => setCompany(value)}
                            placeholder="Sélectionnez la société"
                            className="w-full"
                        >
                            <Select.Option value="sqlsrv_inter">Intercocina</Select.Option>
                            <Select.Option value="sqlsrv_serie">AstiDkora</Select.Option>
                            <Select.Option value="sqlsrv_asti">Seriemoble</Select.Option>
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
                            options={suppliers} // assuming suppliers is the state from SetSuppliers
                        />
                    </Form.Item>

                    <div className='mt-3'>
                        <Form.Item >
                        <Button type="primary" htmlType="submit" className="w-full ">
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