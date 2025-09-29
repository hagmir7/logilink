import { Button, Input, message, Select } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import InputField from '../components/ui/InputField';
import { api } from '../utils/api';
import BackButton from '../components/ui/BackButton';

export default function TransferOrder() {
    const [paletteCode, setPaletteCode] = useState(null);
    const [user, setUser] = useState();
    const [users, setUsers] = useState([]);
    const [company, setCompany] = useState();
    const [companies, setCompanies] = useState([]);
    const [submitLoading, setSubmitLoading] = useState(false)

    const paletteInput = useRef();
    const sanitizeInput = (value) => value.replace(/[\[\]]/g, '');

    useEffect(() => {
        getCompanies();
        getUsers();
    }, []);

    const getUsers = async () => {
        try {
            const { data } = await api.get('users/role/livreur');
            setUsers(data.map((item) => ({ label: item.full_name, value: item.id })));
        } catch (error) {
            console.error(error);
            message.error(error.response?.data?.message || "Erreur lors du chargement des livreurs");
        }
    };

    const getCompanies = async () => {
        try {
            const { data } = await api.get('companies');
            setCompanies(data.map((item) => ({ label: item.name, value: item.id })));
        } catch (error) {
            console.error(error);
            message.error(error.response?.data?.message || "Erreur lors du chargement des sociétés");
        }
    };

    const changePalette = (value) => {
        const cleaned = sanitizeInput(value);
        setPaletteCode(cleaned);
    };

    const handleSubmit = async () => {
        setSubmitLoading(true)
        try {
            await api.post('transfer/store', {
              palette_code: paletteCode,
              to_company: company,
              transfer_by: user,
            })
            message.success("Mouvement transféré avec succès !");
            setPaletteCode(null);
            setCompany(null);
            setUser(null);
        } catch (error) {
            console.error(error);
            message.error(error.response.data.message);

        }
        setSubmitLoading(false)

    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">

            <div className='bg-white border-b border-gray-200'>
                <div className='mx-auto px-4 py-3 sm:py-4'>
                    <div className='flex items-center gap-3'>
                        <BackButton className='w-8 h-8' />
                        <div className='w-px h-6 bg-gray-300' />
                        <h1 className={`text-sm md:text-xl font-bold text-gray-900 truncate ${window.electron ? 'text-xl' : 'text-md'}`}>
                            Transfert palette de commande
                        </h1>
                    </div>
                </div>
            </div>
            {/* Entrée de référence palette */}
            <div className="flex flex-col gap-2 px-5">
                <label className={`text-gray-600 font-medium block mb-2 ${window.electron ? 'text-xl' : 'text-md'}`}>Référence Palette</label>
                <Input
                    placeholder="Saisir la référence palette"
                    size="large"
                    ref={paletteInput}
                    value={paletteCode}
                    autoFocus={true}
                    onChange={(e) => changePalette(e.target.value)}
                    allowClear
                    className="rounded-lg"
                    style={window.electron ? { fontSize: '30px', height: '60px' } : {}}
                />
                <InputField
                    value={paletteCode}
                    onChange={(e) => changePalette(e.target.value)}
                    onScan={(value) => changePalette(value)}
                />
            </div>

            {/* Sélection société */}
            <div className="px-5">
                <label className={`text-gray-600 font-medium block mb-2 ${window.electron ? 'text-xl' : 'text-md'}`}>Société destinataire</label>
                <Select
                    placeholder="Sélectionner une société"
                    size="large"
      
                    value={company}
                    onChange={setCompany}
                    options={companies}
                    allowClear
                    className={`w-full ${window.electron ? 'custom-select h-[60px]' : ''}`}
                    style={window.electron ? { height: '60px' } : {}}
                    dropdownClassName={window.electron ? 'custom-select-dropdown' : ''}
                />
            </div>

            {/* Sélection livreur */}
            <div className="px-5">
                <label className={`text-gray-600 font-medium block mb-2 ${window.electron ? 'text-xl' : 'text-md'}`}>Livreur</label>
                <Select
                    placeholder="Sélectionner un livreur"
                    size="large"
                    value={user}
                    onChange={setUser}
                    options={users}
                    allowClear
                    className={`w-full ${window.electron ? 'custom-select h-[60px]' : ''}`}
                    style={window.electron ? { height: '60px' } : {}}
                    dropdownClassName={window.electron ? 'custom-select-dropdown' : ''}
                />
            </div>

            {/* Bouton de validation */}
            <div className="px-5">
                <Button
                    type="primary"
                    size="large"
                    className="w-full font-semibold"
                    loading={submitLoading}
                    style={window.electron ? { fontSize: '30px', padding: '20px', height: '60px' } : {}}
                    onClick={handleSubmit}
                    disabled={!paletteCode || !company || !user}
                >
                    Valider le transfert
                </Button>
            </div>
        </div>
    );
}
