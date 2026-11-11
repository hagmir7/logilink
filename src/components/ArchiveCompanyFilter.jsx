
import { useEffect, useState } from 'react';
import { Select, message } from 'antd';
import { api } from '../utils/api';

export default function ArchiveCompanyFilter({ value, onChange }) {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        let active = true;

        const loadCompanies = async () => {
            setLoading(true);
            try {
                const response = await api.get('companies');
                const payload = response.data;
                const list = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : Array.isArray(payload?.data?.data) ? payload.data.data : [];
                if (active) setCompanies(list);
            } catch (error) {
                if (active) messageApi.error('Impossible de charger les sociétés.');
            } finally {
                if (active) setLoading(false);
            }
        };

        loadCompanies();
        return () => { active = false; };
    }, [messageApi]);

    const options = [
        { value: 'all', label: 'Toutes les sociétés' },
        ...companies.filter(c => c.id != null).map(c => ({
            value: String(c.id),
            label: c.name || c.label || c.raison_sociale || `Société ${c.id}`,
        })),
    ];

    return (
        <>
            {contextHolder}
            <Select
                showSearch
                optionFilterProp="label"
                loading={loading}
                value={value}
                onChange={onChange}
                options={options}
                placeholder="Sélectionner une société"
                className="w-full sm:w-[230px]"
            />
        </>
    );
}
