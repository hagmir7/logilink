import { useState } from 'react'
import {
    Modal, Button, Form, Input, Steps, Alert, Spin, Tag, Divider,
    message
} from 'antd'
import { PlusCircle, User, CheckCircle2, AlertCircle, Car, FileText} from 'lucide-react'
import { api } from '../utils/api'


const { Step } = Steps

/* ─── tiny status badge ─────────────────────────────────────────────────── */
function DriverTag({ found }) {
    return found
        ? <Tag color="success" icon={<CheckCircle2 size={12} className="inline mr-1" />}>Chauffeur trouvé</Tag>
        : <Tag color="warning" icon={<AlertCircle size={12} className="inline mr-1" />}>Nouveau chauffeur</Tag>
}

/* ─── Step 0 – CIN lookup ────────────────────────────────────────────────── */
function StepCin({ onFound, onNotFound, loading, setLoading }) {
    const [form] = Form.useForm()

    const handleCheck = async () => {
        const { cin } = await form.validateFields()
        setLoading(true)
        try {
            const { data } = await api.get('check-cin', { params: { cin } })
            if (data.status) {
                onFound(cin)
            } else {
                onNotFound(cin)
            }
        } catch {

        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="py-4">
            <p className="text-gray-500 text-sm mb-6">
                Entrez le CIN du chauffeur pour vérifier s'il existe déjà dans le système.
            </p>
            <Form form={form} layout="vertical">
                <Form.Item
                    name="cin"
                    label={<span className="font-semibold text-gray-700">Numéro CIN</span>}
                    rules={[
                        { required: true, message: 'Le CIN est requis' },
                        { max: 20, message: 'Max 20 caractères' },
                    ]}
                >
                    <Input
                        prefix={<User size={15} className="text-gray-400 mr-1" />}
                        placeholder="ex : AB123456"
                        size="large"
                        className="rounded-lg"
                        onPressEnter={handleCheck}
                    />
                </Form.Item>
                <Button
                    type="primary"
                    size="large"
                    block
                    loading={loading}
                    onClick={handleCheck}
                    className="rounded-lg font-semibold mt-1"
                >
                    Vérifier le CIN
                </Button>
            </Form>
        </div>
    )
}

/* ─── Step 1a – Driver found → create reception only ────────────────────── */
function StepReceptionOnly({ cin, onSubmit, loading }) {
    const [form] = Form.useForm()

    const handleSubmit = async () => {
        const values = await form.validateFields()
        onSubmit({ cin, ...values })
    }

    return (
        <div className="py-4">
            <Alert
                type="success"
                showIcon
                icon={<CheckCircle2 size={16} />}
                message="Chauffeur existant détecté"
                description={`CIN ${cin} correspond à un chauffeur enregistré. Créez directement sa réception de voyage.`}
                className="mb-6 rounded-lg"
            />
            <Form form={form} layout="vertical">
                <Form.Item
                    name="code"
                    label={<span className="font-semibold text-gray-700">Code de voyage</span>}
                    // rules={[{ required: true, message: 'Le code est requis' }]}
                >
                    <Input
                        prefix={<FileText size={15} className="text-gray-400 mr-1" />}
                        placeholder="ex : VYG-2024-001"
                        size="large"
                        className="rounded-lg"
                    />
                </Form.Item>

                <Button
                    type="primary"
                    size="large"
                    block
                    loading={loading}
                    onClick={handleSubmit}
                    className="rounded-lg font-semibold mt-1"
                    icon={<Car size={16} />}
                >
                    Créer la réception de voyage
                </Button>
            </Form>
        </div>
    )
}


function StepDriverAndReception({ cin, onSubmit, loading }) {
    const [form] = Form.useForm()

    const handleSubmit = async () => {
        const values = await form.validateFields()
        onSubmit({ ...values, cin })
    }

    return (
        <div className="py-4">
            <Alert
                type="warning"
                showIcon
                icon={<AlertCircle size={16} />}
                message="Chauffeur introuvable"
                className="mb-6 rounded-lg"
            />


            <Form form={form} layout="vertical">
                <Form.Item
                    name="full_name"
                    label={<span className="font-semibold text-gray-700">Nom complet</span>}
                    rules={[{ required: true, message: 'Le nom est requis' }]}
                >
                    <Input
                        prefix={<User size={15} className="text-gray-400 mr-1" />}
                        placeholder="ex : Ahmed Benali"
                        size="large"
                        className="rounded-lg"
                    />
                </Form.Item>

                <Form.Item
                    name="driver_code"
                    label={<span className="font-semibold text-gray-700">Matricule</span>}
                >
                    <Input
                        placeholder="ex : DRV-001"
                        size="large"
                        className="rounded-lg"
                    />
                </Form.Item>


                <Form.Item
                    name="travel_code"
                    label={<span className="font-semibold text-gray-700">Code de voyage</span>}
                >
                    <Input
                        prefix={<FileText size={15} className="text-gray-400 mr-1" />}
                        placeholder="ex : VYG-2024-001"
                        size="large"
                        className="rounded-lg"
                    />
                </Form.Item>

                <Button
                    type="primary"
                    size="large"
                    block
                    loading={loading}
                    onClick={handleSubmit}
                    className="rounded-lg font-semibold mt-1"
                    icon={<Car size={16} />}
                >
                    Créer chauffeur + réception
                </Button>
            </Form>
        </div>
    )
}

/* ─── Step 2 – Success ───────────────────────────────────────────────────── */
function StepSuccess({ driverFound }) {
    return (
        <div className="py-10 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle2 size={36} className="text-green-500" />
            </div>
            <p className="text-lg font-semibold text-gray-800">Opération réussie !</p>
            <p className="text-gray-500 text-sm max-w-xs">
                {driverFound
                    ? 'La réception de voyage a été créée pour le chauffeur existant.'
                    : 'Le nouveau chauffeur et sa réception de voyage ont été créés avec succès.'}
            </p>
        </div>
    )
}

/* ─── Main modal ─────────────────────────────────────────────────────────── */
export default function TravelModal() {
    const [open, setOpen] = useState(false)
    const [current, setCurrent] = useState(0)  
    const [driverFound, setDriverFound] = useState(null)
    const [cin, setCin] = useState('')
    const [loading, setLoading] = useState(false)

    const reset = () => {
        setCurrent(0)
        setDriverFound(null)
        setCin('')
        setLoading(false)
    }

    const handleClose = () => {
        setOpen(false)
        setTimeout(reset, 300) 
    }


    const handleFound = (cinValue) => {
        setCin(cinValue)
        setDriverFound(true)
        setCurrent(1)
    }


    const handleNotFound = (cinValue) => {
        setCin(cinValue)
        setDriverFound(false)
        setCurrent(1)
    }


    const handleSubmit = async (values) => {
        setLoading(true)
        try {
            if (driverFound) {
                await api.post('travel-receptions', {
                    cin:        cin,
                    code:       values.code,
                    company_id: Number(values.company_id),
                })
            } else {
                await api.post('travel-drivers', {
                    full_name:   values.full_name,
                    cin:         cin,
                    code:        values.driver_code,
                    travel_code: values.travel_code,
                    company_id:  Number(values.company_id),
                })
            }
            setCurrent(2)
        } catch (err) {
            console.error('Travel submit error:', err?.response?.data.message ?? err)
             console.error(err)
            message.error(err?.response?.data.message)
        } finally {
            setLoading(false)
        }
    }

    /* Steps config */
    const steps = [
        { title: 'Vérification CIN', icon: <User size={14} /> },
        { title: driverFound === null ? 'Informations' : driverFound ? 'Réception' : 'Chauffeur + Réception', icon: <FileText size={14} /> },
        { title: 'Terminé', icon: <CheckCircle2 size={14} /> },
    ]

    return (
        <>
            <Button
                type="primary"
                size="large"
                onClick={() => setOpen(true)}
                icon={<PlusCircle size={17} />}
                className="flex items-center gap-2"
            >
                <span className="hidden sm:inline">Voyage</span>
            </Button>

            <Modal
                open={open}
                onCancel={handleClose}
                footer={null}
                title={
                    <div className="flex items-center gap-3 pt-1">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Car size={18} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-base font-bold text-gray-800 leading-tight">Nouveau voyage</p>
                            {driverFound !== null && current < 2 && (
                                <DriverTag found={driverFound} />
                            )}
                        </div>
                    </div>
                }
                width={500}
                className="rounded-2xl"
                destroyOnClose
            >
                <Steps
                    current={current}
                    size="small"
                    className="mt-4 mb-2 px-1"
                    items={steps.map((s) => ({ title: s.title, icon: s.icon }))}
                />

                <Spin spinning={loading && current === 0}>
                    {current === 0 && (
                        <StepCin
                            onFound={handleFound}
                            onNotFound={handleNotFound}
                            loading={loading}
                            setLoading={setLoading}
                        />
                    )}
                    {current === 1 && driverFound === true && (
                        <StepReceptionOnly cin={cin} onSubmit={handleSubmit} loading={loading} />
                    )}
                    {current === 1 && driverFound === false && (
                        <StepDriverAndReception cin={cin} onSubmit={handleSubmit} loading={loading} />
                    )}
                    {current === 2 && (
                        <>
                            <StepSuccess driverFound={driverFound} />
                            <Button block size="large" onClick={handleClose} className="rounded-lg mb-2">
                                Fermer
                            </Button>
                        </>
                    )}
                </Spin>
            </Modal>
        </>
    )
}