import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Alert, Typography, Modal, AutoComplete } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import Connection from '../components/Connection';
import { Link } from 'lucide-react';

const { Title } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login, loading, message } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usernames, setUsernames] = useState([]);
  const [appVersion, setAppVersion] = useState('');

  /* Load saved usernames */
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('usernames') || '[]');
    setUsernames(saved);
  }, []);

  /* Load Electron app version */
  useEffect(() => {
    const loadVersion = async () => {
      if (window.electron?.version) {
        const version = await window.electron.version();
        setAppVersion(version);
      }
    };
    loadVersion();
  }, []);

  /* Default credentials in dev + verify authentication */
  useEffect(() => {
    form.setFieldsValue({
      login: import.meta.env.MODE === 'development' ? 'admin' : '',
      password: import.meta.env.MODE === 'development' ? 'password' : ''
    });
    checkAuth();
  }, [form]);

  /* Submit login */
  const handleSubmit = async (values) => {
    await login(values); // wait processing

    // ⛔ Do not save username if login failed
    const token = localStorage.getItem('authToken');
    if (!token) return; // Login failed ➝ no saving

    // 🔥 Save username only when login success
    const updated = Array.from(new Set([values.login, ...usernames]));
    localStorage.setItem('usernames', JSON.stringify(updated));
    setUsernames(updated);
  };

  /* Auto navigation if already logged in */
  const checkAuth = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const response = await api.get('user', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (window.electron) {
      await window.electron.user({ user: response.data, access_token: token });
    } else {
      navigate('/');
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-100 via-red-50 to-red-200 min-h-screen flex justify-center items-center p-6">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <img
            className="h-20 mx-auto mb-4"
            src="https://intercocina.com/assets/imgs/intercocina-logo.png"
            alt="Intercocina"
          />
          <Title level={2} className="text-gray-800">Connectez-vous</Title>
        </div>

        {message && <Alert message={message} type="error" showIcon className="mb-6" />}

        <Form form={form} layout="vertical" onFinish={handleSubmit}>

          <Form.Item
            name="login"
            label="Nom d'utilisateur ou e-mail"
            rules={[{ required: true, message: "Veuillez entrer votre identifiant" }]}
          >
            <AutoComplete
              options={usernames.map(u => ({ value: u }))}
              placeholder="Entrez votre identifiant"
              // allowClear
              size="large"
              className="rounded-lg w-full"
            >
              <Input prefix={<UserOutlined className="text-gray-400" />} size="large" />
            </AutoComplete>
          </Form.Item>

          <Form.Item
            name="password"
            label="Mot de passe"
            rules={[{ required: true, message: "Veuillez entrer votre mot de passe" }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Entrez votre mot de passe"
              size="large"
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item className="mt-4">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              className="bg-red-600 hover:bg-red-700 rounded-lg"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </Form.Item>
        </Form>

        <Modal title="Type de connexion" open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={false}>
          <Connection />
        </Modal>

        <div className="mt-6 text-center">
          <Button onClick={() => setIsModalOpen(true)}>
            <Link size={18} />
          </Button>
        </div>

        {window.electron && <div className="text-center mt-5 text-gray-700">v{appVersion}</div>}

      </div>
    </div>
  );
};

export default Login;
