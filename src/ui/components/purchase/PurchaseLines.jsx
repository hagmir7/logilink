import React from 'react';
import { Form, Button, Empty } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import PurchaseLineRow from './PurchaseLineRow';
import FormListSkeleton from '../ui/FormListSkeleton';
import { STATUS } from '../../constants/purchaseStatus';

const EMPTY_IMAGE = 'https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg';

export default function PurchaseLines({ loading, canEdit, ...rowProps }) {
  return (
    <div className="p-4 rounded-lg bg-white mt-3 shadow-sm border border-gray-100">
      <Form.List name="lines">
        {(fields, { add, remove }) => (
          <div className="space-y-3">
            {fields.length > 0 ? (
              fields.map((field) => (
                <PurchaseLineRow
                  key={field.key}
                  field={field}
                  canEdit={canEdit}
                  fileCount={rowProps.getFileCount(field.name)}
                  onRemove={remove}
                  {...rowProps}
                />
              ))
            ) : loading ? (
              <FormListSkeleton rows={5} />
            ) : (
              <div className="py-8 text-gray-400 text-center">
                <Empty image={EMPTY_IMAGE} description="Aucune ligne d'achat. Cliquez ci-dessous pour ajouter." />
              </div>
            )}

            <div className="w-1/4 mx-auto">
              <Button
                type="dashed"
                block
                icon={<PlusOutlined />}
                disabled={!canEdit}
                onClick={() => add({ checked: false, status: STATUS.DRAFT })}
                className="border-2 border-dashed hover:border-blue-400 hover:text-blue-500 transition-colors"
              >
                Ajouter une ligne
              </Button>
            </div>
          </div>
        )}
      </Form.List>
    </div>
  );
}
