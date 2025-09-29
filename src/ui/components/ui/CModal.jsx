import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import RoleForm from '../RoleForm';


const CModal = ({ label, title, icon, children }) => {
    const [modal, setModal] = useState(false);
    return (
        <>
            <Button type="default" size='large' onClick={() => setModal(true)}>
                {icon && (
                    <div className='shrink-0 flex items-center justify-center mb-1'>
                        {typeof icon === 'function' ? icon() : icon}
                    </div>
                )}
                {label}
            </Button>
            <Modal
                title={title}
                centered
                open={modal}
                onCancel={() => setModal(false)}
                cancelText="Annuler"
                footer={false}

            >
                {children}
            </Modal>
        </>
    );
};
export default CModal;