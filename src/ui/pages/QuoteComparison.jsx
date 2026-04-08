import React, { useState } from 'react';
import { ConfigProvider, Layout, Modal } from 'antd';
import frFR from 'antd/locale/fr_FR';
import ComparisonList from '../components/ComparisonList';
import ComparisonDetail from '../components/ComparisonDetail';
import ComparisonForm from '../components/ComparisonForm';


const { Content } = Layout;

export default function QuoteComparison() {
    const [page, setPage] = useState('list');
    const [selectedId, setSelectedId] = useState(null);
    const [formModal, setFormModal] = useState(false);

    return (
        <ConfigProvider locale={frFR}>
            <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
                <Content style={{ maxWidth: 1200, margin: '24px auto', padding: '0 16px', width: '100%' }}>

                    {page === 'list' && (
                        <ComparisonList
                            onAdd={() => setFormModal(true)}
                            onView={(id) => { setSelectedId(id); setPage('detail'); }}
                        />
                    )}

                    {page === 'detail' && selectedId && (
                        <ComparisonDetail
                            comparisonId={selectedId}
                            onBack={() => { setPage('list'); setSelectedId(null); }}
                        />
                    )}

                    <Modal
                        title="Nouveau comparatif"
                        open={formModal}
                        onCancel={() => setFormModal(false)}
                        footer={null}
                        destroyOnClose
                    >
                        <ComparisonForm onSuccess={() => { setFormModal(false); setPage('list'); }} />
                    </Modal>
                </Content>
            </Layout>
        </ConfigProvider>
    );
}