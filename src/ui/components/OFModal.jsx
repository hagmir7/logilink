import { Button, Modal, Table, DatePicker, Input, Radio, message, Select } from 'antd'
import React, { useEffect, useState } from 'react'
import { api } from '../utils/api'

const { Option } = Select;

export default function OFModal({ articles = [] }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [dateLancement, setDateLancement] = useState(null);
    const [dateDemarrage, setDateDemarrage] = useState(null);
    const [referenceMachine, setReferenceMachine] = useState('');
    const [typeCommande, setTypeCommande] = useState('standard');

    const [quantities, setQuantities] = useState({});
    const [machines, setMachines] = useState([]);


    const getMachines = async () => {
        try {
            const response = await api.get('machines?per_page=100');
            setMachines(
                response.data.data.map(item => ({
                    label: item.machine_name
                        ? `${item.machine_id} — ${item.machine_name.trim()}`
                        : `${item.machine_id}`,
                    value: item.machine_id
                }))
            );
        } catch (error) {
            console.log(error);
            message.error(error?.response?.data?.message || 'Erreur lors du chargement des machines');
        }
    };


    useEffect(() => {
        getMachines()
    }, [])

    const handleOpen = () => {
        const initial = {};
        articles.forEach(a => {
            const ecart = parseFloat(a.max) - (Math.floor(a.stock * 100) / 100); // ✅ fixed sign
            initial[a.id] = ecart;
        });
        setQuantities(initial);
        setOpen(true);
    };

    const handleQtyChange = (id, value) => {
        setQuantities(prev => ({ ...prev, [id]: value }));
    };

    const handleSave = async () => {
        if (!dateLancement) {
            message.warning("Veuillez saisir la date de lancement prévue");
            return;
        }

        const payload = {
            date_lancement: dateLancement?.format('YYYY-MM-DD'),
            date_demarrage: dateDemarrage?.format('YYYY-MM-DD'),
            reference_machine: referenceMachine,
            type_commande: typeCommande,
            articles: articles.map(a => ({
                id: a.id,
                code: a.code,
                qte: quantities[a.id] ?? 0,
            })),
        };

        setLoading(true);
        try {
            await api.post('ordres-fabrication', payload);
            message.success("Ordre de fabrication enregistré avec succès");
            setOpen(false);
        } catch (err) {
            message.error(err?.response?.data?.message || "Erreur lors de l'enregistrement");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Référence',
            dataIndex: 'code',
            key: 'code',
            render: (code) => (
                <span className="font-mono font-bold text-gray-900">{code}</span>
            ),
        },
        {
            title: 'Désignation',
            dataIndex: 'description',
            key: 'description',
            width: '45%',
            render: (text, record) => record.description || text,
        },
        {
            title: 'Nom',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => record.name || text,
        },
        {
            title: 'Ecart',
            key: 'qte',
            align: 'center',
            render: (_, record) => {
                const ecart = parseFloat(record.max) - (Math.floor(record.stock * 100) / 100);
                const current = quantities[record.id] ?? ecart; // ✅ use state, fallback to calculated
                const isNegative = current < 0;
                return (
                    <Input
                        type="number"
                        value={current}
                        onChange={(e) => handleQtyChange(record.id, parseFloat(e.target.value) || 0)}
                        style={{
                            width: 100,
                            textAlign: 'center',
                            borderColor: isNegative ? '#f59e0b' : undefined,
                            color: isNegative ? '#b45309' : undefined,
                            fontWeight: 600,
                        }}
                        size="small"
                    />
                );
            },
        },
    ];

    return (
        <div>
            <Button
                type="primary"
                onClick={handleOpen}
                disabled={articles.length === 0}
            >
                OF ({articles.length})
            </Button>

            <Modal
                title={`Ordre de fabrication — ${articles.length} article(s) sélectionné(s)`}
                centered
                open={open}
                onOk={handleSave}
                onCancel={() => setOpen(false)}
                okText="Enregistrer"
                cancelText="Annuler"
                confirmLoading={loading}
                width={{
                    xs: '90%',
                    sm: '85%',
                    md: '75%',
                    lg: '65%',
                    xl: '55%',
                    xxl: '45%',
                }}
            >
                {/* ── Header Fields ── */}
                <div className="grid grid-cols-2 gap-4 mb-5 p-4 bg-gray-50 rounded-lg border border-gray-200">

                    {/* Date de lancement prévue */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            Date de lancement prévue <span className="text-red-500">*</span>
                        </label>
                        <DatePicker
                            value={dateLancement}
                            onChange={setDateLancement}
                            format="DD/MM/YYYY"
                            placeholder="JJ/MM/AAAA"
                            className="w-full"
                        />
                    </div>

                    {/* Date de démarrage */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            Date de démarrage
                        </label>
                        <DatePicker
                            value={dateDemarrage}
                            onChange={setDateDemarrage}
                            format="DD/MM/YYYY"
                            placeholder="JJ/MM/AAAA"
                            className="w-full"
                        />
                    </div>

                    {/* Référence Machine */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            Référence Machine
                        </label>
                        <Select
                            showSearch
                            value={referenceMachine || undefined}
                            onChange={(value) => setReferenceMachine(value)}
                            placeholder="Ex: MACH-001"
                            className="w-full"
                            optionFilterProp="label"
                            filterOption={(input, option) =>
                                (option?.label ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                            options={machines}
                        />
                    </div>

                    {/* Type de commande */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            Commande
                        </label>
                        <Radio.Group
                            value={typeCommande}
                            onChange={(e) => setTypeCommande(e.target.value)}
                            className="flex flex-col gap-1 mt-1"
                        >
                            <Radio value="standard">Standard</Radio>
                            <Radio value="speciale">Spéciale</Radio>
                        </Radio.Group>
                    </div>
                </div>

                {/* ── Articles Table ── */}
                <Table
                    dataSource={articles}
                    columns={columns}
                    rowKey="id"
                    size="small"
                    pagination={false}
                    scroll={{ y: 300 }}
                    bordered
                />
            </Modal>
        </div>
    )
}