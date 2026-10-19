import { useState } from 'react';

/** Files attached per line (keyed by line index) + upload modal state. */
export default function useLineFiles() {
  const [files, setFiles] = useState({});
  const [index, setIndex] = useState(null);
  const [open, setOpen] = useState(false);

  const current = index === null ? [] : files[index] || [];

  const onChange = ({ fileList }) =>
    setFiles((prev) => ({
      ...prev,
      [index]: fileList.map(({ uid, name, status, url, originFileObj, existing, fileId }) => ({
        uid, name, status, url, originFileObj, existing: existing || false, fileId,
      })),
    }));

  return {
    files,
    setFiles,
    index,
    open,
    current,
    onChange,
    openFor: (i) => { setIndex(i); setOpen(true); },
    close: () => setOpen(false),
    count: (i) => files[i]?.length || 0,
    previewImages: current.filter((f) => f.existing && f.url).map((f) => f.url),
  };
}
