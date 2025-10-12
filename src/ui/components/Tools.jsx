import React, { useState } from 'react';
import { Button, Card, Flex, FloatButton, message, Modal } from 'antd';
import { ArrowDownCircle, Copy, Grid, Grip, Import, PlusCircle, SquarePen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'


const Tools = () => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { roles } = useAuth()


    const handleShow = async (path) => {
        try {

            if (window.electron && typeof window.electron.openShow === 'function') {
                await window.electron.openShow({
                    width: 500,
                    height: 500,
                    url:path,
                })
            } else {
                navigate(path)
            }
        } catch (error) {
            console.error('Error navigating to article:', error)
            message.error(error);
        }
    }


    return (
        <Flex vertical gap="middle" align="flex-start">

        {
            roles('admin') || roles('supper_admin') ?
            <FloatButton

                style={{ height: 50, width: 50 }}
                icon={<PlusCircle size={30} style={{ marginRight: 20 }} onClick={() => setOpen(true)} className="m-0 p-0 text-gray-700" />}
                tooltip={<span>Outils</span>}
            /> : ""
        }
            

            <Modal
                title=""
                centered
                open={open}
                onOk={() => setOpen(false)}
                onCancel={() => setOpen(false)}
                footer={false}
                width={{
                    xs: '90%',
                    sm: '80%',
                    md: '70%',
                    lg: '60%',
                    xl: '50%',
                    xxl: '40%',
                }}
            >
                <div className='mt-8'>

                </div>
                <Card 
                    size="small" className='cursor-pointer hover:shadow-sm mt-5'
                    onClick={()=> handleShow("update-article-ref")}
                    >
                        <div className='flex gap-3 items-center'>
                            <SquarePen size={20}/>
                             <span className='text-md font-bold'>Modifier la référence de l'article</span>
                        </div>
                   
                </Card>
          <div className='mt-4'></div>
                <Card 
                    size="small" className='cursor-pointer hover:shadow-sm mt-5'
                    onClick={()=> handleShow("duplicate-invoice")}
                    >
                        <div className='flex gap-3 items-center'>
                            <Copy size={20}/>
                             <span className='text-md font-bold'>Duplication de facture</span>
                        </div>
                   
                </Card>

                 <div className='mt-4'></div>
                <Card 
                    size="small" className='cursor-pointer hover:shadow-sm mt-5'
                    onClick={()=> handleShow("import-movements")}
                    >
                        <div className='flex gap-3 items-center'>
                            <Import size={20}/>
                             <span className='text-md font-bold'>Import Movements</span>
                        </div>
                   
                </Card>
                <div className='mt-4'></div>
                 <Card 
                    size="small" className='cursor-pointer hover:shadow-sm mt-5'
                    onClick={()=> handleShow("import-stock")}
                    >
                        <div className='flex gap-3 items-center'>
                            <ArrowDownCircle size={20}/>
                             <span className='text-md font-bold'>Import Stock</span>
                        </div>
                   
                </Card>
            </Modal>
        </Flex>
    );
};
export default Tools;