import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Badge, notification } from 'antd';
import { api } from '../utils/api';
import { useParams } from 'react-router-dom';
import BarcodeScanner from '../components/BarcodeScanner';

export default function Preparation() {
  /* ---------- state ---------- */
  const [article, setArticle] = useState({
    ref: '',
    design: '',
    profondeur: '',
    episseur: '',
    chant: '',
    qte: 0,
    color: '',
    height: '',
    width: '',
  });

  const { id } = useParams();
  const [palette, setPalette] = useState(null);
  const [line, setLine] = useState('');
  const [lines, setLines] = useState([]);

  // Fixed naming conflict: renamed api to notificationApi
  const [notificationApi, contextHolder] = notification.useNotification();

  const openNotificationWithIcon = type => {
    notificationApi[type]({
      message: 'Notification Title',
      description:
        'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
    });
  };

  /* ---------- side‑effects ---------- */
  useEffect(() => {
    const createPalette = async () => {
      try {
        const { data } = await api.post('palettes/generate', {
          document_id: id,
        });
        setPalette(data);
        setLines(data.lines || []); // Added fallback for lines
        console.log(data.lines);
      } catch (err) {
        console.error('Error creating palette:', err);
      }
    };

    if (id) createPalette();
  }, [id]);

  /* ---------- handlers ---------- */
  const handleScan = async () => {
    if (!palette) return; // nothing to scan yet

    const payload = { line, document: id, palette: palette.code };

    try {
      const { data } = await api.post('palettes/scan', payload);
      const dimensions = data.docligne?.Hauteur && data.docligne?.Largeur
        ? Math.floor(data.docligne.Hauteur) + " * " + Math.floor(data.docligne.Largeur)
        : "";

      setArticle({
        id: data.id,
        ref: data.ref ?? '',
        design: data.docligne?.Nom ? data.docligne.Nom + " " + dimensions : '',
        profondeur: data.docligne?.Profondeur ?? '',
        episseur: data.docligne?.Episseur ? Math.floor(data.docligne.Episseur).toString() : '',
        chant: data.docligne?.Chant ?? '',
        qte: data.quantity ? Math.floor(data.quantity) : 0,
        color: data.docligne?.Couleur ?? '',
        height: data.docligne?.Hauteur ? Math.floor(data.docligne.Hauteur).toString() : '',
        width: data.docligne?.Largeur ? Math.floor(data.docligne.Largeur).toString() : '',
      });
    } catch (err) {
      console.error('Error scanning:', err);
      openNotificationWithIcon('error');
    }
  };

  const handleSubmit = async () => {
    try {
      const { data } = await api.post('palettes/confirm', {
        quantity: article.qte,
        palette: palette?.code,
        line: article.id,
      });
      setPalette(data);
      setLines(data.lines || []);
      console.log(data);
      openNotificationWithIcon('success');
    } catch (err) {
      console.error('Error confirming:', err);
      openNotificationWithIcon('error');
    }
  };


  const remove = async (ln) => {

    console.log(palette)
    const { data } = await api.post('palettes/detach', {
      'line': ln,
      'palette': palette.code
    })
    console.log(data);

    setPalette(data);
    setLines(data?.lines || []);
  }

  /* ---------- UI ---------- */
  return (
    <div className='min-h-screen p-4'>
      {/* Scanner */}
      {contextHolder}
      <div className='mb-8 flex justify-center'>
        <div className='border-2 p-3 gap-3 border-gray-300 rounded-lg flex items-center bg-gray-50'>
          {/* <BarcodeScanner /> */}
          <input
            type='text'
            value={line}
            onChange={(e) => setLine(e.target.value)}
            className='border-2 w-full border-gray-300 text-lg py-2 px-4 rounded-md focus:outline-none focus:ring-2 bg-gray-200 focus:ring-blue-500'
            placeholder='Enter barcode or scan'
          />
          <button
            onClick={handleScan}
            className='py-2 px-4 border-gray-300 border-2 rounded-md hover:bg-gray-100'
            disabled={!palette || !line.trim()}
          >
            Scanner
          </button>
        </div>
      </div>

      {/* Article info */}
      <div className='space-y-4 mb-10'>
        <p className='text-md font-bold'>{palette ? palette.code : 'Loading palette...'}</p>

        <input
          type='text'
          placeholder='Designation'
          readOnly
          value={article.design} // Fixed typo: desgin -> design
          className='border-2 w-full border-gray-300 text-lg py-2 px-4 rounded-md bg-gray-200'
        />

        <div className='grid grid-cols-3 gap-3'>
          <input
            className='border-2 py-2 border-gray-300 text-lg px-4 rounded-md bg-gray-200'
            placeholder='Profondeur'
            type='text'
            value={article.profondeur}
            readOnly
          />
          <input
            className='border-2 py-2 border-gray-300 text-lg px-4 rounded-md bg-gray-200'
            type='text'
            placeholder='Chant'
            value={article.chant}
            readOnly
          />
          <input
            className='border-2 py-2 border-gray-300 text-lg px-4 rounded-md bg-gray-200'
            type='text'
            placeholder='Epaisseur'
            value={article.episseur}
            readOnly
          />
        </div>

        <div className='flex items-center gap-3'>
          <button
            onClick={() =>
              setArticle((prev) => ({ ...prev, qte: Math.max(prev.qte - 1, 0) }))
            }
            className='text-xl py-2 px-8 border-2 border-gray-300 rounded-md hover:bg-gray-100'
            disabled={article.qte <= 0}
          >
            -
          </button>

          <input
            type='number'
            className='border-2 w-full border-gray-300 text-lg py-2 px-4 text-center rounded-md'
            value={article.qte}
            min={0}
            onChange={(e) =>
              setArticle({ ...article, qte: Math.max(0, Number(e.target.value)) })
            }
          />

          <button
            onClick={() =>
              setArticle((prev) => ({ ...prev, qte: prev.qte + 1 }))
            }
            className='text-xl py-2 px-8 border-2 border-gray-300 rounded-md hover:bg-gray-100'
          >
            +
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className='grid grid-cols-2 gap-4 mb-10'>
        <button className='text-lg py-3 border-2 border-gray-300 rounded-md bg-white hover:bg-gray-100'>
          NV Palette
        </button>
        <button
          onClick={handleSubmit}
          className='text-lg py-3 rounded-md bg-cyan-600 text-white hover:bg-cyan-700'
          disabled={!palette || !article.id}
        >
          Valider
        </button>
      </div>

      {/* Demo cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
        {lines.map((item, index) => (
          <Badge.Ribbon key={item.id || index} text={item.ref} color='cyan'>
            <div className='rounded-2xl overflow-hidden bg-gray-20 shadow-sm hover:shadow-md'>
              <div className='p-4 bg-amber-50'>
                <div className='flex justify-between items-center mt-4'>
                  <div>
                    <h3 className='text-md font-bold text-gray-600'>
                      {item.article_stock?.name || 'N/A'} {
                        item.article_stock?.width && item.article_stock?.height
                          ? Math.floor(item.article_stock.height) + " * " + Math.floor(item.article_stock.width)
                          : ""
                      }
                    </h3>
                    <span className='text-sm text-gray-600'>‑ {item.article_stock?.color || 'N/A'}</span>
                  </div>
                  <span className='text-3xl font-bold text-gray-600'>
                    {item.quantity ? Math.floor(item.quantity) : 0}
                  </span>
                </div>

                <div className='flex justify-between items-center mt-4'>
                  <span className='text-sm text-gray-600'>
                    Profondeur : {item.article_stock?.depth || 'N/A'} |
                    Epaisseur : {item.article_stock?.thickness || 'N/A'} |
                    Chant : {item.article_stock?.chant || 'N/A'}
                  </span>
                  <button onClick={() => remove(item.id)} className='bg-red-500 hover:bg-red-700 p-2 rounded-full text-white'>
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>
          </Badge.Ribbon>
        ))}
      </div>
    </div>
  );
}