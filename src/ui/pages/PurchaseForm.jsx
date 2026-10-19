import React, { useEffect, useState } from 'react';
import { Form, Button, Tag, message } from 'antd';
import 'antd/dist/reset.css';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../utils/api';

import AchatProductSearch from '../components/AchatProductSearch';
import TransferPurchaseDocument from '../components/TransferPurchaseDocument';
import LineNonCompliantModal from '../components/LineNonCompliantModal';
import ShowLineNonCompliantModal from '../components/ShowLineNonCompliantModal';
import PurchaseHeaderFields from '../components/purchase/PurchaseHeaderFields';
import PurchaseLines from '../components/purchase/PurchaseLines';
import LineFilesModal from '../components/purchase/LineFilesModal';

import useRoles from '../hooks/useRoles';
import usePurchaseDocument from '../hooks/usePurchaseDocument';
import useLineFiles from '../hooks/useLineFiles';
import useArticleSearch from '../hooks/useArticleSearch';
import { STATUS } from '../constants/purchaseStatus';
import {
  buildPurchaseFormData,
  docPriority,
  docToFormValues,
  docToLineFiles,
} from '../utils/purchaseDocument';

const CLOSED_MODAL = { open: false, lineId: null, lineQte: null };

export default function PurchaseForm() {
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();

  const { user, hasRole } = useRoles();
  const { doc, services, users, units, loading, reload } = usePurchaseDocument(id);
  const lineFiles = useLineFiles();
  const articleSearch = useArticleSearch(form);

  const [priority, setPriority] = useState('normal');
  const [nonCompliantModal, setNonCompliantModal] = useState(CLOSED_MODAL);
  const [showNonCompliantModal, setShowNonCompliantModal] = useState(CLOSED_MODAL);

  // Permissions
  const isAdmin = hasRole('admin');
  const isOwner = Number(user.id) === Number(doc?.user_id);
  const canEdit = isAdmin || !doc || ((hasRole('dg') || isOwner) && Number(doc.status ?? 1) <= 1);

  // Fill the form whenever the document is (re)loaded
  useEffect(() => {
    if (!doc) return;
    form.setFieldsValue(docToFormValues(doc));
    setPriority(docPriority(doc));
    lineFiles.setFiles(docToLineFiles(doc));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc]);

  const getCheckedLines = () => (form.getFieldValue('lines') || []).filter((l) => l?.checked === true);

  // Open the "non conforme" modal when a saved line is switched to status 8
  const handleValuesChange = (changed, all) => {
    changed.lines?.forEach((line, i) => {
      if (String(line?.status) !== STATUS.NON_COMPLIANT) return;
      const current = all.lines?.[i];
      if (current?.id) setNonCompliantModal({ open: true, lineId: current.id, lineQte: current.quantity });
    });
  };

  const onFinish = async (values) => {
    const hide = message.loading('Enregistrement en cours...', 0);
    try {
      const formData = buildPurchaseFormData({
        values,
        priority,
        lineFiles: lineFiles.files,
        isUpdate: Boolean(id),
      });
      const { data } = await api.post(id ? `/purchase-documents/${id}` : '/purchase-documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      message.success(id ? 'Document mis à jour avec succès!' : 'Document créé avec succès!');
      if (!id) navigate(`/purchase/${data.document.id}`);
    } catch (error) {
      console.error('Submit error:', error);
      const { errors, message: msg } = error.response?.data || {};
      if (errors) Object.values(errors).forEach((e) => message.error(e[0]));
      else message.error(msg || "Erreur lors de l'enregistrement");
    } finally {
      hide();
    }
  };

  return (
    <div className="bg-gray-100 pb-32">
      <div className="rounded-xl max-w-6xl mx-auto pt-2">
        <h2 className="text-md mb-4 font-bold">
          Document d'achat{' '}
          {doc && (
            <Tag color="#f50" style={{ fontSize: 14 }} className="font-bold tracking-widest">
              {doc.code}
            </Tag>
          )}
        </h2>

        <AchatProductSearch {...articleSearch.searchProps} />

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onValuesChange={handleValuesChange}
          initialValues={{ urgent: false, status: STATUS.DRAFT }}
        >
          <PurchaseHeaderFields
            services={services}
            users={users}
            hasRole={hasRole}
            canEdit={canEdit}
            currentStatus={doc?.status}
            priority={priority}
            onPriorityChange={setPriority}
          />

          <PurchaseLines
            form={form}
            units={units}
            loading={loading}
            isAdmin={isAdmin}
            canEdit={canEdit}
            initialStatus={doc?.status}
            getFileCount={lineFiles.count}
            onOpenFiles={lineFiles.openFor}
            onSearchKeyDown={articleSearch.onKeyDown}
            onShowNonCompliant={(lineId, lineQte) => setShowNonCompliantModal({ open: true, lineId, lineQte })}
          />

        </Form>

        {/* Outside <Form>: submit events from the transfer modal must not bubble into this form */}
        <div className="fixed right-0 bottom-0 z-40 w-full flex justify-end gap-3 px-5 py-3 bg-white shadow-2xl border-t border-gray-200">
          <Button type="primary" onClick={() => form.submit()} disabled={!canEdit}>
            {doc ? 'Mettre à jour' : 'Enregistrer'}
          </Button>

          {id && isAdmin && (
            <TransferPurchaseDocument document={doc} getCheckedLines={getCheckedLines} fetchAllData={reload} />
          )}
        </div>

        <LineFilesModal lineFiles={lineFiles} canEdit={canEdit} />
      </div>

      <LineNonCompliantModal
        open={nonCompliantModal.open}
        setOpen={(open) => setNonCompliantModal((p) => ({ ...p, open }))}
        lineId={nonCompliantModal.lineId}
        lineQte={nonCompliantModal.lineQte}
        fetch={reload}
        form={form}
      />

      <ShowLineNonCompliantModal
        open={showNonCompliantModal.open}
        setOpen={(open) => setShowNonCompliantModal((p) => ({ ...p, open }))}
        lineId={showNonCompliantModal.lineId}
        lineQte={showNonCompliantModal.lineQte}
      />
    </div>
  );
}