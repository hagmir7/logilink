import React, { useState } from 'react';
import { Loader2, AlertCircle, CheckCircle, Eye, EyeOff, User, Mail, Phone, Lock } from 'lucide-react';
import { api } from '../utils/api';

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [errorsMessage, setErrorsMessage] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorsMessage([]);
        setIsLoading(true);

        try {
            const response = await api.post('register', formData);
            setIsError(false);
            if (response.data.status === "error") {
                setErrorsMessage(response.data.errors);
            } else {
                setMessage('Utilisateur enregistré avec succès !');
                // Reset form after successful registration
                setFormData({
                    full_name: '',
                    name: '',
                    email: '',
                    phone: '',
                    password: '',
                    password_confirmation: '',
                });
            }
        } catch (err) {
            console.log(err);
            setIsError(true);
            setMessage("Échec de l'enregistrement");
        } finally {
            setIsLoading(false);
        }

        setTimeout(() => {
            setErrorsMessage([]);
            if (!isError) setMessage('');
        }, 5000);
    };

    return (
        <div className="w-full max-w-md mx-auto mt-3">

            {message && (
                <div className={`mb-4 p-4 rounded-lg flex items-center ${isError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {isError ?
                        <AlertCircle className="w-5 h-5 mr-2" /> :
                        <CheckCircle className="w-5 h-5 mr-2" />
                    }
                    <span>{message}</span>
                </div>
            )}

            {errorsMessage.length > 0 && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
                    {errorsMessage.map((msg, index) => (
                        <div key={index} className="flex items-center gap-2 mb-1">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{msg}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="space-y-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        name="full_name"
                        placeholder="Nom complet"
                        value={formData.full_name}
                        onChange={handleChange}
                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        required
                    />
                </div>

                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        name="name"
                        placeholder="Nom d'utilisateur"
                        value={formData.name}
                        onChange={handleChange}
                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        required
                    />
                </div>

                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="email"
                        name="email"
                        placeholder="Adresse e-mail"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        required
                    />
                </div>

                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="tel"
                        name="phone"
                        placeholder="Numéro de téléphone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        required
                    />
                </div>

                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Mot de passe"
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        required
                    />
                    <div
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    >
                        {showPassword ?
                            <EyeOff className="h-5 w-5 text-gray-400" /> :
                            <Eye className="h-5 w-5 text-gray-400" />
                        }
                    </div>
                </div>

                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="password_confirmation"
                        placeholder="Confirmer le mot de passe"
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        required
                    />
                    <div
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    >
                        {showConfirmPassword ?
                            <EyeOff className="h-5 w-5 text-gray-400" /> :
                            <Eye className="h-5 w-5 text-gray-400" />
                        }
                    </div>
                </div>
            </div>

            <div
                onClick={handleSubmit}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 flex items-center justify-center font-medium mt-6 cursor-pointer"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="animate-spin mr-2 h-5 w-5" />
                        Traitement en cours...
                    </>
                ) : (
                    "S'inscrire"
                )}
            </div>
        </div>
    );
};

export default RegisterForm;