import { message } from 'antd';
import { api } from './api';

export default async function downloadPurchaseFile(fileId, filename) {
  try {
    const { data } = await api.get(`download/purchase-file/${fileId}`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = Object.assign(document.createElement('a'), { href: url, download: filename });
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
    message.error('Téléchargement échoué');
  }
}
