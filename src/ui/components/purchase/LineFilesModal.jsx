import React from 'react';
import { Modal, Upload, Button, message } from 'antd';
import { PaperClipOutlined, UploadOutlined } from '@ant-design/icons';
import PurchaseImages from '../ui/PurchaseImages';
import downloadPurchaseFile from '../../utils/downloadPurchaseFile';

/** `lineFiles` is the object returned by useLineFiles(). */
export default function LineFilesModal({ lineFiles, canEdit }) {
  const { open, index, current, onChange, close, previewImages } = lineFiles;

  return (
    <Modal
      open={open}
      onOk={close}
      onCancel={close}
      width={600}
      okText="Terminé"
      cancelText="Annuler"
      title={
        <div className="flex items-center gap-2">
          <PaperClipOutlined className="text-blue-500" />
          <span>Joindre des fichiers - Ligne {index !== null ? index + 1 : ''}</span>
        </div>
      }
    >
      <div className="py-4">
        <Upload
          multiple
          listType="text"
          fileList={current}
          onChange={onChange}
          beforeUpload={() => false}
          showUploadList={{ showDownloadIcon: true, showPreviewIcon: false }}
          onDownload={(file) =>
            file.fileId ? downloadPurchaseFile(file.fileId, file.name) : message.error('Fichier introuvable')
          }
        >
          <Button icon={<UploadOutlined />} disabled={!canEdit} block size="large" type="dashed">
            Cliquez ou glissez des fichiers ici
          </Button>
        </Upload>

        <PurchaseImages imageList={previewImages} />

        <p className="text-gray-500 text-sm mt-3">
          Vous pouvez joindre plusieurs fichiers (images, PDFs, documents, etc.)
        </p>
      </div>
    </Modal>
  );
}
