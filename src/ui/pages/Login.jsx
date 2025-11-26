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

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('usernames') || '[]');
    setUsernames(saved);
  }, []);

  const [appVersion, setAppVersion] = useState('');

  useEffect(() => {
    const fetchVersion = async () => {
      if (window.electron?.version) {
        const version = await window.electron.version();
        setAppVersion(version);
      }
    };
    fetchVersion();
  }, []);

  // Initialize form default values
  useEffect(() => {
    form.setFieldsValue({
      login: import.meta.env.MODE === 'development' ? 'admin' : '',
      password: import.meta.env.MODE === 'development' ? 'password' : ''
    });
    checkAuth();
  }, [form]);

  const handleSubmit = (values) => {
    login(values);
  };

  const checkAuth = async () => {
    const access_token = localStorage.getItem('authToken') || false;
    if (access_token) {
      const response = await api.get('user', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      if (window.electron) {
        await window.electron.user({ user: response.data, access_token });
      } else {
        return navigate('/');
      }
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
            loading="lazy"
          />
          <Title level={2} className="text-gray-800">
            Connectez-vous
          </Title>
        </div>

        {message && (
          <Alert message={message} type="error" showIcon className="mb-6" />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="space-y-4"
        >
          <Form.Item
            name="login"
            label="Nom d'utilisateur ou e-mail"
            rules={[{ required: true, message: 'Veuillez entrer votre identifiant' }]}
          >
            <AutoComplete
              options={usernames.map(name => ({ value: name }))}
              onChange={(val) => form.setFieldValue('login', val)}
              value={form.getFieldValue('login')}
              placeholder="Entrez votre identifiant"
              className="w-full rounded-lg ps-12"
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                size="large"
                className="rounded-lg"
              />
            </AutoComplete>
          </Form.Item>

          <div className='mt-4'>
            <Form.Item
              name="password"
              label="Mot de passe"
              rules={[{ required: true, message: 'Veuillez entrer votre mot de passe' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Entrez votre mot de passe"
                size="large"
                className="rounded-lg"
              />
            </Form.Item>
          </div>

          <div className='mt-4'>
            <Form.Item className="mt-6">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                className="bg-red-600 hover:bg-red-700 border-red-600 rounded-lg h-12 mt-2 flex items-center"
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </Form.Item>
          </div>
        </Form>

        <Modal
          title="Type de connexion"
          open={isModalOpen}
          onCancel={handleCancel}
          classNames='mt-3'
          footer={false}
        >
          <Connection />
        </Modal>

        <div className='mt-6'>
          <Button onClick={showModal}>
            <Link color="green" size={16} />
          </Button>
        </div>
        {
          window.electron && <div className='text-center mt-5 text-gray-700'>v{appVersion}</div>
        }

      </div>
    </div>
  );
};

export default Login;
