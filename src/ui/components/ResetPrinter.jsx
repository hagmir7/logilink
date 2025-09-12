import { Button, message } from 'antd'
import { Wrench } from 'lucide-react';
import React, { useState } from 'react'
import { api } from '../utils/api';

export default function ResetPrinter({ document, fetchData }) {
    const [loading, setLoading] = useState(false)


    const resetPrinter = async () => {
        setLoading(true);
        try {
            await api.get(`documents/reset-print/${document.id}`);
            fetchData();
            message.success("Réinitialiser d'imprment avec succès");
            setLoading(false);

        } catch (error) {
            setLoading(false);
            console.error(error);

            message.error(error?.response?.data?.message);
        }
    }


    return (
        <div>
            {document?.companies?.length > 0 &&
                document.companies?.every((company) => Number(company.pivot?.printed) === 1) && (
                    <Button onClick={resetPrinter} loading={loading} color="cyan" variant="outlined">
                        {
                            !loading ? <div className="flex justify-center items-center">
                                <Wrench size={18} />
                            </div> : ''
                        }
                    </Button>
                )}
        </div>
    )
}
