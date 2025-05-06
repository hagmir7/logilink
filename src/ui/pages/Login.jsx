import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Alert, Typography, Spin } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';

const { Title } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login, loading, message } = useAuth();

  // Initialize form with default values
  useEffect(() => {
    form.setFieldsValue({
      login: 'admin',
      password: 'password'
    });
    checkAuth();
  }, [form]);

  const handleSubmit = (values) => {
    login(values);
    console.log("Login attempt submitted");
  };

  const checkAuth = async () => {
    const access_token = localStorage.getItem('authToken') || false;

    if (access_token) {
      const response = await api.get('user', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      if (!response?.data?.access_token) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
      }

      if (window.electron) {
        await window.electron.loginUser({ user: response.data, access_token });
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
          <Alert
            message={message}
            type="error"
            showIcon
            className="mb-6"
          />
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
            <Input 
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="Entrez votre identifiant"
              size="large"
              className="rounded-lg"
            />
          </Form.Item>

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
        </Form>
      </div>
    </div>
  );
};

export default Login;