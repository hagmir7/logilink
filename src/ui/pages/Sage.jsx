import { Button } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { handleShow } from '../utils/config';

export default function Sage() {
    const navigate = useNavigate();

    return (
        <div className="p-2">
            <Button onClick={() => handleShow(navigate, '/create-document')}>
                Nouveau
            </Button>
        </div>
    );
}
