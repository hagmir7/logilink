import React from 'react';
import {
  DownloadOutlined,
  LeftOutlined,
  RightOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  SwapOutlined,
  UndoOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';
import { Image, Space, Button } from 'antd';

const PurchaseImages = ({ imageList }) => {
  const [current, setCurrent] = React.useState(0);

  const onDownload = (url, index) => {
    const imageUrl = typeof url === 'string' ? url : url.url;
    const filename = `fichier-achat-${index + 1}-${Date.now()}.jpg`;

    fetch(imageUrl)
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(blobUrl);
        link.remove();
      })
      .catch(err => console.error('Download failed:', err));
  };

  const onDownloadCurrent = () => {
    onDownload(imageList[current], current);
  };

  if (!imageList || imageList.length === 0) {
    return "";
  }

  return (
    <Image.PreviewGroup
      preview={{
        actionsRender: (
          _,
          {
            transform: { scale },
            actions: {
              onActive,
              onFlipY,
              onFlipX,
              onRotateLeft,
              onRotateRight,
              onZoomOut,
              onZoomIn,
              onReset,
            },
          },
        ) => (
          <Space size={12} className="toolbar-wrapper">
            <LeftOutlined 
              disabled={current === 0} 
              onClick={() => onActive?.(-1)} 
            />
            <RightOutlined
              disabled={current === imageList.length - 1}
              onClick={() => onActive?.(1)}
            />
            <DownloadOutlined onClick={onDownloadCurrent} />
            <SwapOutlined rotate={90} onClick={onFlipY} />
            <SwapOutlined onClick={onFlipX} />
            <RotateLeftOutlined onClick={onRotateLeft} />
            <RotateRightOutlined onClick={onRotateRight} />
            <ZoomOutOutlined disabled={scale === 1} onClick={onZoomOut} />
            <ZoomInOutlined disabled={scale === 50} onClick={onZoomIn} />
            <UndoOutlined onClick={onReset} />
          </Space>
        ),
        onChange: index => {
          setCurrent(index);
        },
      }}
    >
      <div className="grid grid-cols-3 gap-4">
        {imageList.map((item, index) => {
          const imageUrl = typeof item === 'string' ? item : item.url;
          return (
            <div key={imageUrl} className="relative group">
              <Image
                className="object-cover rounded overflow-hidden"
                alt={`purchase-file-${index}`}
                src={imageUrl}
                width={'100%'}
                height={200}
              />
              <Button
                icon={<DownloadOutlined />}
                size="small"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload(item, index);
                }}
              >
                Télécharger
              </Button>
            </div>
          );
        })}
      </div>
    </Image.PreviewGroup>
  );
};

export default PurchaseImages;