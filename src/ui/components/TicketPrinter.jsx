import React, { useState, useEffect } from 'react';
import { Button, Modal, Select, message } from 'antd';
import { ReceiptText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'

const { Option } = Select;

const TicketPrinter = ({ doclignes, docentete }) => {
    const [visible, setVisible] = useState(false);
    const [printers, setPrinters] = useState([]);
    const [selectedPrinter, setSelectedPrinter] = useState(null);
    const {user, roles} = useAuth()

    useEffect(() => {
        const fetchPrinters = async () => {
            try {
                const printersList = await window.electron.getPrinters();
                setPrinters(printersList);
            } catch (error) {
                message.error('Failed to load printers');
            }
        };
        fetchPrinters();
    }, []);


    const handlePrint = async () => {
        if (!selectedPrinter) {
            message.warning('Please select a printer.');
            return;
        }
        

        try {
            const safeDoclignes = (doclignes || []).map(ticket => ({
                ...ticket,
                line: {
                    ...ticket.line,
                    quantity: Number(ticket.line?.quantity) || 0
                }
            }));

            await window.electron.printPaletteTickets(selectedPrinter, { 
                doclignes: safeDoclignes, 
                docentete : roles('admin') ? docentete?.document?.palettes : docentete?.document?.palettes?.filter(palette => palette?.company_id == user?.company_id)
            });

            
            

            message.success('Printing started!');
            setVisible(false);
        } catch (error) {
            console.error(error);
            message.error('Printing failed.');
        }
    };



    return (
        <div>
            <Button type="primary" onClick={() => setVisible(true)}>
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

export default TicketPrinter;
