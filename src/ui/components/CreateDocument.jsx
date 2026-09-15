import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  Input,
  Select,
  Button,
  Table,
  message,
  Empty,
} from "antd";
import {
  MinusOutlined,
  BorderOutlined,
  CloseOutlined,
  DownOutlined,
  CaretDownOutlined,
  CaretUpOutlined,
} from "@ant-design/icons";
import DocumentTotals from "../document/DocumentTotals";
import DocumentToolbar from "../document/DocumentToolbar";
import DocumentHeaderForm from "../document/DocumentHeaderForm";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useSearchParams } from 'react-router-dom';


const COLUMN_DEFS = [
  { key: "articleRef", title: "Référence", defaultWidth: 95, align: "left", placeholder: "Référence" },
  { key: "designation", title: "Désignation", defaultWidth: 280, align: "left", placeholder: "Désignation" },
  { key: "hauteur", title: "Hauteur", defaultWidth: 100, align: "right", placeholder: "Hauteur" },
  { key: "largeur", title: "Largeur", defaultWidth: 100, align: "right", placeholder: "Largeur" },
   { key: "chant", title: "Chant", defaultWidth: 50, align: "right", placeholder: "Chant" },
  { key: "couleur", title: "Couleur", defaultWidth: 100, align: "right", placeholder: "Couleur" },
  { key: "prixUnitaire", title: "P.U. HT", defaultWidth: 90, align: "right", placeholder: "P.U. HT" },
  { key: "", title: "P.U. TTC", defaultWidth: 70, align: "right", placeholder: "P.U. TTC" },
  { key: "quantite", title: "Quantité", defaultWidth: 80, align: "right", placeholder: "Quantité" },
  { key: "qteColisee", title: "Qté colisée", defaultWidth: 80, align: "right", placeholder: "Qté colisée" },
  // { key: "condition", title: "Conditionnement", defaultWidth: 110, align: "left", placeholder: "Conditionnement" },
  { key: "remise", title: "Remise", defaultWidth: 70, align: "right", placeholder: "Remise" },
];

const MIN_COLUMN_WIDTH = 50;


function ColumnResizeHandle({ onResize }) {
  const handleMouseDown = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;

      const handleMouseMove = (moveEvent) => {
        onResize(moveEvent.clientX - startX);
      };
      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [onResize]
  );

  return (
    <span
      onMouseDown={handleMouseDown}
      className="absolute top-0 right-0 z-10 h-full w-2 cursor-col-resize select-none hover:bg-blue-300/60"
      style={{ touchAction: "none" }}
    />
  );
}


export default function CreateDocument() {
  // The ONE source of truth for column widths. Everything else
  // (table columns, input row, total width) is derived from this.
  const [widths, setWidths] = useState(() =>
    Object.fromEntries(COLUMN_DEFS.map((c) => [c.key, c.defaultWidth]))
  );

  const { piece } = useParams();
  const [document, setDocument] = useState(null);
  

  const resizeColumn = useCallback((key, startWidth, delta) => {
    setWidths((prev) => ({
      ...prev,
      [key]: Math.max(MIN_COLUMN_WIDTH, startWidth + delta),
    }));
  }, []);

  const totalWidth = useMemo(
    () => Object.values(widths).reduce((sum, w) => sum + w, 0),
    [widths]
  );

  const tableWrapRef = useRef(null);
  const [bodyHeight, setBodyHeight] = useState(300);
  const navigation = useNavigate();
  // const [documentType, setDocumentType] = useState(null);
  const [lineItems, setLineItems] = useState([]);

  const [searchParams] = useSearchParams();


  const documentType = searchParams.get('documentType');

  useEffect(() => {
    const el = tableWrapRef.current;
    if (!el) return undefined;

    const HEADER_ROW_HEIGHT = 39;

    const updateHeight = () => {
      const available = el.clientHeight - HEADER_ROW_HEIGHT;
      setBodyHeight(Math.max(120, available));
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);


  const fetchDocument = async (piece) => {
    try {
      const response = await axios.get(`https://localhost:7244/documents/${documentType}/${piece}`);
      setDocument(response?.data);
      setLineItems(response?.data?.lignes)
    }catch (e) {
      message.error(e.response?.data?.title || "Erreur lors de la récupération du document");
      console.error("Error fetching document:", e.response?.data || e.message);
    }
  };

  useEffect(() => {
    if (piece) {
      fetchDocument(piece);
    }
  }, [piece]);



  const columns = useMemo(
    () =>
      COLUMN_DEFS.map(({ key, title, align }) => {
        const startWidth = widths[key];
        return {
          key,
          dataIndex: key,
          align,
          width: startWidth,
          title: (
            <div className="relative pr-1">
              {title}
              <ColumnResizeHandle
                onResize={(delta) => resizeColumn(key, startWidth, delta)}
              />
            </div>
          ),
          ...(key === "designation" && {
            render: (text, record) => (
              <span className={record.indent ? "pl-3" : ""}>
                {record.indent ? "+" : ""}
                {text}
              </span>
            ),
          }),
        };
      }),
    [widths, resizeColumn]
  );


  const update  = async (data) =>{
     try {
      console.log("Creating document with data:", data);
      
      const response = await axios.patch(`https://localhost:7244/documents/${documentType}/${piece}`,data);
      console.log("Document created:", response.data);
      message.success("Start Updating successfully");
      
      return response.data;
    } catch (e) {
      message.error(e.response?.data?.title);
      console.error("Error creating document:",e.response?.data || e.message);
      throw e;
    }
  }


  const create = async (data) => {
    try {
      const response = await axios.post('https://localhost:7244/documents',data);
      navigation(`/sage/documents/${response.data.piece}`);
      return response.data;
    } catch (e) {
      message.error(e.response?.data?.title);
      console.error("Error creating document:",e.response?.data || e.message);
      throw e;
    }
  };

  return (
    <div
      className="bg-[#f0f0f0] border border-gray-400 shadow-lg w-full h-screen max-h-screen flex flex-col overflow-hidden"
      style={{ fontFamily: "Segoe UI, Tahoma, sans-serif" }}
    >
      {/* Title bar */}
      <div className="shrink-0 flex items-center justify-between bg-gradient-to-b from-white to-gray-100 border-b border-gray-300 px-2 py-1">
        <div className="flex items-center justify-center gap-2">
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] font-bold">
            C
          </span>
          {
            piece ? 
            <span className="text-[13px] text-gray-800">Bone de commande : {document?.statut} N° {piece} {document?.clientCode} {document?.clientIntitule}</span> :
            <span className="text-[13px] text-gray-800">Nouveau Devis</span>
          }
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <button className="w-6 h-6 flex items-center justify-center hover:bg-gray-200">
            <MinusOutlined style={{ fontSize: 10 }} />
          </button>
          <button className="w-6 h-6 flex items-center justify-center hover:bg-gray-200">
            <BorderOutlined style={{ fontSize: 9 }} />
          </button>
          <button className="w-6 h-6 flex items-center justify-center hover:bg-red-500 hover:text-white">
            <CloseOutlined style={{ fontSize: 10 }} />
          </button>
        </div>
      </div>


     {/* <DocumentToolbar /> */}
      <DocumentHeaderForm
        piece={piece}
        document={document}
        documentType={documentType}
        onValidate={(data) =>  piece ? update(data) : create(data)}
      />

      <div className="shrink-0">
        <div
          className="flex items-center bg-white border-b border-gray-200 py-1.5 overflow-x-auto  gap-3 justify-between"
          style={{ minWidth: totalWidth }}
        >
          {COLUMN_DEFS.map(({ key, placeholder }) => (
            <div
              key={key}
              style={{ width: widths[key], flex: `0 0 ${widths[key]}px` }}
              className="px-0.5"
            >
              <Input
                size="small"
                placeholder={placeholder}
                className="w-full"
                style={{ textAlign: key === "designation" ? "left" : "right" }}
              />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end gap-1 ml-2 shrink-0 p-1">
          <Button size="small">Nouveau</Button>
          <Button size="small" disabled>
            Supprimer
          </Button>
          <Button size="small" type="primary">
            Enregistrer
          </Button>
        </div>
      </div>
      <div ref={tableWrapRef} className="bg-white flex-1 min-h-0">
        <Table
          columns={columns}
          dataSource={lineItems}
          pagination={false}
          size="small"
          // className=""

            className="
            whitespace-nowrap 
              [&_.ant-table-thead>tr>th]:!py-1
              [&_.ant-table-thead>tr>th]:!px-2
              [&_.ant-table-tbody>tr>td]:!py-1
              [&_.ant-table-tbody>tr>td]:!px-2
              [&_.ant-table-tbody>tr>td]:text-sm
            "
          rowClassName="text-[13px] whitespace-nowrap"
          scroll={{ x: totalWidth, y: bodyHeight }}
          tableLayout="fixed"
          
          locale={{ emptyText: <Empty description="No Aucun article"></Empty> }}
        />
      </div>

      {/* Bottom action bar */}
      <div className="shrink-0 flex items-center gap-1 px-2 py-1 bg-[#f0f0f0] border-t border-b border-gray-300">
        <Select size="small" defaultValue="Actions" className="w-24" suffixIcon={<DownOutlined style={{ fontSize: 9 }} />} options={[{ value: "Actions", label: "Actions" }]} />
        <Button size="small" icon={<CaretUpOutlined />} />
        <Button size="small" icon={<CaretDownOutlined />} />
      </div>

    <DocumentTotals />

      {/* Footer buttons */}
      <div className="shrink-0 flex items-center justify-end gap-2 px-3 py-2 bg-[#f0f0f0]">
        <Button size="small">Nouveau</Button>
        <Button size="small" type="primary">
          OK
        </Button>
        <Button size="small">Annuler</Button>
      </div>
    </div>
  );
}