import React, { useEffect, useState } from "react";
import {
    Loader2,
    AlertCircle,
    Eye,
    EyeOff,
    User,
    Mail,
    Phone,
    Lock,
    Building,
} from "lucide-react";
import {
    Form,
    Input,
    Button,
    Alert,
    message as antMessage,
    Row,
    Col,
    Select,
} from "antd";
import { api } from "../utils/api";

export default function RegisterForm({ fetchData }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [errorsMessage, setErrorsMessage] = useState([]);

    const [companies, setCompanies] = useState([]);
    const [services, setServices] = useState([]);


    const fetchCompanies = async () => {
        try {
            const response = await api.get('companies');
            setCompanies(response.data.map(c => ({
                label: c.name,
                value: c.id
            })))
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || "Une erreur s'est produite")
        }
    }

     const fetchServices = async () => {
        try {
            const response = await api.get('services');
            setServices(response.data.map(c => ({
                label: c.name,
                value: c.id
            })))
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || "Une erreur s'est produite")
        }
    }


    useEffect(() => {
        fetchCompanies();
        fetchServices();
    }, [])

    const handleSubmit = async (values) => {
        setLoading(true);
        setErrorsMessage([]);
        try {
            const response = await api.post("register", values);
            antMessage.success("Utilisateur enregistré avec succès !");
            form.resetFields();
            fetchData()
            if (response?.data?.user?.id) {
                handleShow(response?.data?.user?.id);
            }

        } catch (err) {
            antMessage.error(err?.response?.data?.message || "Échec de l'enregistrement");
        } finally {
            setLoading(false);
        }
    };

    const handleShow = async (id) => {
        try {
            const url = `profile/${id}`
            if (window.electron && typeof window.electron.openShow === 'function') {
                await window.electron.openShow({
                    width: 1100,
                    height: 750,
                    url,
                    resizable: true,
                })
            } else {
                navigate(`layout/profile/${id}`)
            }
        } catch (error) {
            console.error('Error navigating :', error)
        }
    }

    return (
        <div className="w-full max-w-2xl mx-auto mt-6">
            {errorsMessage.length > 0 && (
                <Alert
                    type="error"
                    message="Erreurs de validation"
                    description={
                        <div>
                            {errorsMessage.map((msg, i) => (
                                <div key={i} className="flex items-center gap-2 mb-1">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                                    <span>{msg}</span>
                                </div>
                            ))}
                        </div>
                    }
                    showIcon
                    className="mb-4"
                />
            )}

            <Form
                layout="vertical"
                form={form}
                onFinish={handleSubmit}
                requiredMark={false}
            >
                {/* 👇 Row 1 */}
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Nom complet"
                            name="full_name"
                            rules={[{ required: true, message: "Veuillez entrer le nom complet" }]}
                        >
                            <Input
                                prefix={<User size={16} className="text-gray-400" />}
                                placeholder="Nom complet"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Nom d'utilisateur"
                            name="name"
                            rules={[
                                { required: true, message: "Veuillez entrer un nom d'utilisateur" },
                            ]}
                        >
                            <Input
                                prefix={<User size={16} className="text-gray-400" />}
                                placeholder="Nom d'utilisateur"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {/* 👇 Row 2 */}
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Adresse e-mail"
                            name="email"
                            rules={[
                                { required: true, message: "Veuillez entrer un e-mail" },
                                { type: "email", message: "Adresse e-mail invalide" },
                            ]}
                        >
                            <Input
                                prefix={<Mail size={16} className="text-gray-400" />}
                                placeholder="nom@exemple.com"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Numéro de téléphone"
                            name="phone"
                            rules={[
                                { required: false, message: "Veuillez entrer un numéro de téléphone" },
                            ]}
                        >
                            <Input
                                prefix={<Phone size={16} className="text-gray-400" />}
                                placeholder="06 12 34 56 78"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {/* 👇 Row 3 */}
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Mot de passe"
                            name="password"
                            rules={[
                                { required: true, message: "Veuillez entrer un mot de passe" },
                            ]}
                        >
                            <Input.Password
                                prefix={<Lock size={16} className="text-gray-400" />}
                                placeholder="Mot de passe"
                                iconRender={(visible) =>
                                    visible ? <EyeOff size={16} /> : <Eye size={16} />
                                }
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Confirmer le mot de passe"
                            name="password_confirmation"
                            dependencies={["password"]}
                            rules={[
                                { required: true, message: "Veuillez confirmer le mot de passe" },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue("password") === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(
                                            new Error("Les mots de passe ne correspondent pas")
                                        );
                                    },
                                }),
                            ]}
                        >
                            <Input.Password
                                prefix={<Lock size={16} className="text-gray-400" />}
                                placeholder="Confirmer le mot de passe"
                                iconRender={(visible) =>
                                    visible ? <EyeOff size={16} /> : <Eye size={16} />
                                }
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item label="Service" name="service_id">
                            <Select
                                options={services}

                                placeholder="Sélectionnez une service"
                                suffixIcon={<Building size={16} />}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item label="Société" name="company_id">
                            <Select
                                options={companies}

                                placeholder="Sélectionnez une société"
                                suffixIcon={<Building size={16} />}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {/* 👇 Submit Button */}
                <Form.Item className="mb-0">
                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                        size="large"
                        loading={loading}
                        icon={!loading && <Loader2 size={16} className="animate-spin-slow" />}
                    >
                        {loading ? "Traitement en cours..." : "S'inscrire"}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}
