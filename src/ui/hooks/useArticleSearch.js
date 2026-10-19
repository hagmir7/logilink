import { useState } from 'react';
import { message } from 'antd';

const CLOSED = { open: false, lineIndex: null, value: '' };

/** F4 article search on a line + inserting the selected article(s). */
export default function useArticleSearch(form) {
  const [modal, setModal] = useState({});

  const onKeyDown = (event, lineIndex, field) => {
    if (event.key !== 'F4') return;
    event.preventDefault();
    const line = (form.getFieldValue('lines') || [])[lineIndex];
    if (!line) return;
    setModal({ open: true, lineIndex, value: line[field] || '' });
  };

  const onSelect = (articles, lineIndex) => {
    const lines = [...(form.getFieldValue('lines') || [])];
    const [first, ...rest] = articles;
    if (!first || lineIndex == null || lineIndex < 0 || lineIndex >= lines.length) return;

    lines[lineIndex] = { ...lines[lineIndex], code: first.code, description: first.description };
    lines.splice(
      lineIndex + 1,
      0,
      ...rest.map((a) => ({
        code: a.code,
        description: a.description,
        quantity: 1,
        unit: '',
        estimated_price: 0,
        status: '1',
        checked: false,
      }))
    );

    form.setFieldsValue({ lines });
    message.success(rest.length ? `${articles.length} articles ajoutés` : 'Article ajouté à la ligne');
  };

  return {
    onKeyDown,
    searchProps: {
      searchModalOpen: modal.open,
      lineId: modal.lineIndex,
      inputValue: modal.value,
      onCancel: () => setModal(CLOSED),
      onSelect,
    },
  };
}
