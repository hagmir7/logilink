import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import { api } from '../utils/api';

const DocumentLineActions = ({line_id, open, setOpne}) => {
    const handleOk = () => {
        setOpne(false);
    };
    const handleCancel = () => {
        setOpne(false);
    };
    const prepare = async () => {
        try {
            setOpne(false)
            const response = await api.post('lines/prepare', { line: line_id })
            
        } catch (error) {
            console.error(error)
        }
    }


    return (
        <>
            <Modal
                title="Document Line Action"
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={open}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <p>{line_id || "Nothing"}</p>
                <Button onClick={prepare}>Préparé</Button>
            </Modal>
        </>
    );
};
export default DocumentLineActions;