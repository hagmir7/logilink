import React, { useEffect, useState } from 'react';
import { Select, Input, Button, message } from 'antd';

export default function Connection() {
    const [connection, setConnection] = useState('');
    const [customUrl, setCustomUrl] = useState('');

    const connections = [
        {
            label: 'Local',
            value: 'http://192.168.1.113/api/',
        },
        {
            label: 'Online',
            value: 'https://online.intercocina.space/api/',
        },
        {
            label: 'Développement',
            value: 'http://localhost:8000/api/'
        },
        {
            label: 'Personnalisée',
            value: 'custom', // triggers input field
        },
    ];

    // Load saved connection from localStorage on mount
    useEffect(() => {
        const savedConnection = localStorage.getItem('connection_url');
        if (savedConnection) setConnection(savedConnection);
    }, []);

    // Handle selection
    const handleSelect = (value) => {
        if (value === 'custom') {
            setConnection('');
            return;
        }
        setConnection(value);
        localStorage.setItem('connection_url', value);
        message.success('Connexion enregistrée ✅');
        setTimeout(() => window.location.reload(), 500);
    };

    // Handle custom URL saving
    const saveCustomUrl = () => {
        if (!customUrl.startsWith('http')) {
            message.error("L'URL doit commencer par http ou https");
            return;
        }
        setConnection(customUrl);
        localStorage.setItem('connection_url', customUrl);
        message.success('Connexion personnalisée enregistrée ✅');
        setTimeout(() => window.location.reload(), 500);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 300 }}>
            <Select
                placeholder="Type de connexion"
                options={connections}
                onChange={handleSelect}
                value={
                    connections.some(c => c.value === connection)
                        ? connection
                        : 'custom'
                }
            />

            {connection === '' || connection === 'custom' ? (
                <div style={{ display: 'flex', gap: 8 }}>
                    <Input
                        placeholder="Entrez votre URL personnalisée"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                    />
                    <Button type="primary" onClick={saveCustomUrl}>
                        Sauvegarder
                    </Button>
                </div>
            ) : null}

            {connection && connection !== 'custom' && (
                <div style={{ marginTop: 10, color: '#555' }}>
                    <strong>URL actuelle :</strong> {connection}
                </div>
            )}
        </div>
    );
}
