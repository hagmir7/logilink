import dayjs from 'dayjs';

export const getBaseUrl = () =>
  (localStorage.getItem('connection_url') || 'http://192.168.1.38/api').replace(/\/$/, '');

export const docPriority = (doc) =>
  doc.urgent ? 'urgent' : doc.planned_at ? 'planned' : 'normal';

/** API document -> antd form values */
export const docToFormValues = (doc) => ({
  service_id: doc.service_id,
  user_id: doc.user_id,
  reference: doc.reference,
  note: doc.note,
  status: doc.status ? String(doc.status) : '1',
  ...(doc.planned_at && { planned_at: dayjs(doc.planned_at) }),
  lines: (doc.lines || []).map((l) => ({
    id: l.id,
    code: l.code,
    description: l.description,
    quantity: l.quantity,
    unit: l.unit,
    estimated_price: l.estimated_price,
    status: l.status ? String(l.status) : '1',
    non_compliant: l.non_compliant_count || 0,
    checked: false,
  })),
});

/** API document -> { [lineIndex]: antd Upload fileList } */
export const docToLineFiles = (doc) => {
  const base = getBaseUrl();
  const result = {};
  (doc.lines || []).forEach((line, i) => {
    if (!line.files?.length) return;
    result[i] = line.files.map((f) => ({
      uid: f.id,
      name: f.file_name || f.file_path.split('/').pop(),
      status: 'done',
      existing: true,
      fileId: f.id,
      url: `${base}/download/purchase-file/${f.id}`,
    }));
  });
  return result;
};

/** Form values -> multipart FormData. Always sends ALL lines (the checkbox is only used by the transfer). */
export const buildPurchaseFormData = ({ values, priority, lineFiles, isUpdate }) => {
  const fd = new FormData();
  fd.append('reference', values.reference);
  fd.append('status', values.status ? String(values.status) : '1');
  fd.append('note', values.note || '');
  if (values.service_id) fd.append('service_id', values.service_id);
  if (values.user_id) fd.append('user_id', values.user_id);
  if (priority === 'urgent') fd.set('urgent', '1');
  if (priority === 'planned' && values.planned_at) {
    fd.set('planned_at', values.planned_at.format('YYYY-MM-DD'));
  }
  if (isUpdate) fd.append('_method', 'PUT');

  (values.lines || []).forEach((line, i) => {
    const key = (field) => `lines[${i}][${field}]`;
    if (line.id) fd.append(key('id'), line.id);
    fd.append(key('code'), line.code || '');
    fd.append(key('description'), line.description || '');
    fd.append(key('quantity'), line.quantity || '0');
    fd.append(key('unit'), line.unit || '');
    fd.append(key('estimated_price'), line.estimated_price || '0');
    fd.append(key('status'), line.status || '1');

    (lineFiles[i] || []).forEach((f) => {
      if (f.originFileObj && !f.existing) fd.append(`${key('files')}[]`, f.originFileObj);
    });
  });

  return fd;
};