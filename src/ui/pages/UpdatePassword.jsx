import React, { useState, useEffect } from 'react';
import { Input, Button, Card, message, Space, Modal, Avatar, Typography, Select, Spin } from 'antd';
import { LockOutlined, UserOutlined, EyeInvisibleOutlined, EyeTwoTone, EditOutlined, SearchOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
import { api } from "../utils/api";


// Composant permettant à l’admin de mettre à jour le mot de passe de n’importe quel utilisateur
const UpdatePassword = () => {
    const [loading, setLoading] = useState(false);
    const [usersLoading, setUsersLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});

    // Récupérer les utilisateurs depuis l’API
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setUsersLoading(true);
        try {
            const response = await api.get('users');
            setUsers(response.data);

        } catch (error) {
            message.error("Échec du chargement des utilisateurs");
        } finally {
            setUsersLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!newPassword) {
            newErrors.password = "Le nouveau mot de passe est requis";
        } else if (newPassword.length < 8) {
            newErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
        }

        if (!confirmPassword) {
            newErrors.password_confirmation = "Veuillez confirmer le mot de passe";
        } else if (newPassword !== confirmPassword) {
            newErrors.password_confirmation = "Les mots de passe ne correspondent pas";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await api.post(`user/${selectedUser.id}/update-password`, {
                password: newPassword,
                password_confirmation: confirmPassword,
            });

            message.success(`Mot de passe mis à jour avec succès pour ${selectedUser.name} !`);
            resetForm();
        } catch (error) {
            console.log(error);
            
            message.error("Une erreur réseau s'est produite");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setNewPassword('');
        setConfirmPassword('');
        setErrors({});
        setModalVisible(false);
        setSelectedUser(null);
    };

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setModalVisible(true);
        setErrors({});
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto p-6">
            <Card className="shadow-sm border-0 rounded-xl">
                <div className="mb-6">
                    <Title level={4} className="flex items-center gap-3">
                        <UserOutlined className="text-blue-500" />
                        Gérer les mots de passe des utilisateurs
                    </Title>
                    <Text type="secondary">Sélectionnez un utilisateur pour mettre à jour son mot de passe</Text>
                </div>

                {/* Barre de recherche */}
                <div className="mb-6">
                    <Input
                        placeholder="Rechercher des utilisateurs par nom ou email..."
                        prefix={<SearchOutlined className="text-gray-400" />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-10"
                        allowClear
                    />
                </div>

                {/* Grille des utilisateurs */}
                {usersLoading ? (
                    <div className="text-center py-8">
                        <Spin size="large" />
                        <div className="mt-2">
                            <Text type="secondary">Chargement des utilisateurs...</Text>
                        </div>
                    </div>
                ) : filteredUsers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredUsers.map((user) => (
                            <Card
                                key={user.id}
                                className="hover:shadow-md transition-shadow cursor-pointer border border-gray-200 rounded-lg hover:border-blue-300"
                                onClick={() => handleUserSelect(user)}
                            >
                                <div className="flex items-center space-x-3 gap-2">
                                    <Avatar
                                        src={user.avatar}
                                        size={48}
                                        className="bg-blue-500"
                                    >
                                        {user.name?.charAt(0)?.toUpperCase()}
                                    </Avatar>
                                    <div className="flex-1">
                                        <Title level={5} className="mb-1">{user.name}</Title>
                                        <Text type="secondary" className="text-sm">{user.email}</Text>
                                    </div>
                                    <EditOutlined className="text-blue-500 text-lg" />
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <UserOutlined className="text-4xl text-gray-300 mb-2" />
                        <Text type="secondary">
                            {searchTerm ? "Aucun utilisateur trouvé correspondant à votre recherche" : "Aucun utilisateur disponible"}
                        </Text>
                    </div>
                )}
            </Card>

            {/* Modal de mise à jour du mot de passe */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <Avatar
                            src={selectedUser?.avatar}
                            size={40}
                            className="bg-blue-500"
                        >
                            {selectedUser?.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <div>
                            <div className="font-medium">{selectedUser?.name}</div>
                            <div className="text-sm text-gray-500">{selectedUser?.email}</div>
                        </div>
                    </div>
                }
                open={modalVisible}
                onCancel={resetForm}
                footer={null}
                className="top-20"
                width={480}
            >
                <div className="pt-4">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nouveau mot de passe
                            </label>
                            <Input.Password
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                prefix={<LockOutlined className="text-gray-400" />}
                                placeholder="Entrez le nouveau mot de passe"
                                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                className="h-10"
                                status={errors.password ? 'error' : ''}
                            />
                            {errors.password && (
                                <div className="mt-1">
                                    <Text type="danger" className="text-sm">{errors.password[0]}</Text>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirmez le nouveau mot de passe
                            </label>
                            <Input.Password
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                prefix={<LockOutlined className="text-gray-400" />}
                                placeholder="Confirmez le nouveau mot de passe"
                                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                className="h-10"
                                status={errors.password_confirmation ? 'error' : ''}
                            />
                            {errors.password_confirmation && (
                                <div className="mt-1">
                                    <Text type="danger" className="text-sm">{errors.password_confirmation[0]}</Text>
                                </div>
                            )}
                        </div>

                        <div className="pt-4">
                            <Space className="w-full justify-end">
                                <Button onClick={resetForm} className="px-6">
                                    Annuler
                                </Button>
                                <Button
                                    type="primary"
                                    onClick={handleSubmit}
                                    loading={loading}
                                    className="px-6 bg-blue-500 hover:bg-blue-600 border-0"
                                >
                                    Mettre à jour le mot de passe
                                </Button>
                            </Space>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UpdatePassword;
