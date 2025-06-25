import { Button, Modal, message } from 'antd';
import { Download } from 'lucide-react';
import React, { useState } from 'react';

export default function InventoryExport({inventory_id}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);


    const handleExport = (companyId = null) => {
        setLoading(true);
        let url = `http://localhost:8000/api/inventory/${inventory_id}/export`
        if (companyId) {
            url += `?company=${companyId}`;
        }

        window.location.href = url;
        message.success('Le téléchargement va commencer...');
        setLoading(false);
        setOpen(false);
    };

    return (
        <div>
            <Button type="primary" size='large' onClick={() => setOpen(true)}>
                <Download size={16} />
                Export
            </Button>
            <Modal
                title="Exportation d'inventaire"
                centered
                open={open}
                onCancel={() => setOpen(false)}
                footer={null}
                width={600}
            >
                <div className='flex justify-between px-5 py-10 flex-wrap gap-4'>
                    <Button loading={loading} onClick={() => handleExport(null)}>TOUTES LES SOCIÉTÉS</Button>
                    <Button loading={loading} onClick={() => handleExport(1)}>INTERCOCINA</Button>
                    <Button loading={loading} onClick={() => handleExport(2)}>SERIEMOBLE</Button>
                    <Button loading={loading} onClick={() => handleExport(3)}>ASTIDCORA</Button>
                </div>
            </Modal>
        </div>
    );
}
