import React, { useState, useEffect } from 'react';
import { Button, Modal, Select, message } from 'antd';
import { ReceiptText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'

const { Option } = Select;

const PrintWithListPrinters = ({ docentete, palettes = [], btnSize }) => {
    const [visible, setVisible] = useState(false);
    const [printers, setPrinters] = useState([]);
    const [selectedPrinter, setSelectedPrinter] = useState(null);
    const {user} = useAuth()

    useEffect(() => {
        const fetchPrinters = async () => {
            try {
                const printersList = await window.electron.getPrinters();
                setPrinters(printersList);
            } catch (error) {
                message.error('Échec du chargement des imprimantes');
            }
        };
        fetchPrinters();
    }, []);


    const handlePrint = async () => {
        if (!selectedPrinter) {
            message.warning('Veuillez sélectionner une imprimante.');
            return;
        }
        
        try {
            await window.electron.printPaletteTickets(selectedPrinter, { 
                docentete,
                palettes: palettes.length > 0 ? palettes :  docentete?.document?.palettes?.filter(palette => palette?.company_id == user?.company_id)
            });
            message.success("L'impression a commencé !");
            setVisible(false);
        } catch (error) {
            console.error(error);
            message.error("L'impression a échoué.");
        }
    };



    return (
        <div>
            <Button type="primary" onClick={() => setVisible(true)} size={btnSize}>
                <ReceiptText />
                Billets
            </Button>

            <Modal
                title="Sélectionner l'imprimante"
                open={visible}
                onOk={handlePrint}
                onCancel={() => setVisible(false)}
                okText="Imprimer"
                cancelText="Annuler"
            >
   
                <Select
                    style={{ width: '100%' }}
                    placeholder="Sélectionnez une imprimante"
                    onChange={value => setSelectedPrinter(value)}
                >
                    {printers.map((printer, index) => (
                        <Option key={index} value={printer.name}>
                            {printer.name}
                        </Option>
                    ))}
                </Select>
            </Modal>
        </div>
    );
};

export default PrintWithListPrinters;