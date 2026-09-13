import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  Input,
  Select,
  Button,
  Table,
  message,
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
import { useParams } from "react-router-dom";

/**
 * Pixel-oriented recreation of the Sage "Devis" (Quote) window
 * shown in the reference screenshot, built with Ant Design
 * components for the native-app widget look and Tailwind
 * utility classes for spacing/layout.
 *
 * NOTE: Ant Design (antd) is not part of the Claude.ai artifact
 * sandbox's bundled libraries, so this file will not render
 * inside the in-chat preview. Drop it into a project that has
 * `antd` and `@ant-design/icons` installed (plus Tailwind
 * configured) and it will render as shown in the screenshot.
 *
 *   npm install antd @ant-design/icons
 *
 * LIVE-SYNCED COLUMN WIDTHS
 * ------------------------------------------------------------
 * Both the quick-add input row and the <Table> columns read
 * their width from ONE piece of state: `widths` (a plain
 * { [columnKey]: number } map). Dragging the small resize
 * handle on the right edge of any table header updates that
 * shared state, so the input above the column resizes with it
 * automatically — there's nothing to keep in sync by hand.
 *
 * COLUMN_DEFS still holds everything that never changes for a
 * column (title, alignment, placeholder, starting width). The
 * `widths` state only tracks the numbers that can change.
 *
 * LAYOUT / SCROLL BEHAVIOR
 * ------------------------------------------------------------
 * The whole window is a full-height flex column:
 *   - title bar, toolbar, header form, quick-add row → fixed
 *     height, `shrink-0`, never scroll.
 *   - the <Table> area → `flex-1 min-h-0`, this is the ONLY
 *     part that scrolls (vertically AND horizontally). Its
 *     available height is measured live with a ResizeObserver
 *     so it stays correct if the window/viewport is resized
 *     (responsive), and passed to antd's `scroll.y` so the
 *     table header stays pinned while rows scroll underneath.
 *   - totals bar + footer buttons → `shrink-0`, rendered AFTER
 *     the flex-1 table area, so they always stay pinned to the
 *     bottom of the window, fully visible regardless of how
 *     many rows are in the grid.
 */

const COLUMN_DEFS = [
  { key: "reference", title: "Référence", defaultWidth: 95, align: "left", placeholder: "Référence" },
  { key: "designation", title: "Désignation", defaultWidth: 280, align: "left", placeholder: "Désignation" },
  { key: "hauteur", title: "Hauteur", defaultWidth: 100, align: "right", placeholder: "Hauteur" },
  { key: "largeur", title: "Largeur", defaultWidth: 100, align: "right", placeholder: "Largeur" },
  { key: "couleur", title: "Couleur", defaultWidth: 100, align: "right", placeholder: "Couleur" },
  { key: "puHt", title: "P.U. HT", defaultWidth: 90, align: "right", placeholder: "P.U. HT" },
  { key: "puTtc", title: "P.U. TTC", defaultWidth: 70, align: "right", placeholder: "P.U. TTC" },
  { key: "quantite", title: "Quantité", defaultWidth: 80, align: "right", placeholder: "Quantité" },
  { key: "qteColisee", title: "Qté colisée", defaultWidth: 80, align: "right", placeholder: "Qté colisée" },
  { key: "condition", title: "Conditionnement", defaultWidth: 110, align: "left", placeholder: "Conditionnement" },
  { key: "remise", title: "Remise", defaultWidth: 70, align: "right", placeholder: "Remise" },
];

const MIN_COLUMN_WIDTH = 50;

const lineItems = [
  {
    key: "1",
    reference: "SP000001",
    designation: "Meuble sale de bain 565*600*450 laquee",
    indent: false,
    puHt: "",
    puTtc: "",
    qte: "",
    quantite: "1,00",
    qteColisee: "1,00",
    condition: "Unité",
    qteCommandee: "1,00",
    remise: "20%",
  },
  {
    key: "2",
    reference: "SP000001",
    designation: "Vasque",
    indent: true,
    puHt: "",
    puTtc: "",
    qte: "",
    quantite: "1,00",
    qteColisee: "1,00",
    condition: "Unité",
    qteCommandee: "1,00",
    remise: "20%",
  },
  {
    key: "3",
    reference: "SP000001",
    designation: "Miroir",
    indent: true,
    puHt: "",
    puTtc: "",
    qte: "",
    quantite: "1,00",
    qteColisee: "1,00",
    condition: "Unité",
    qteCommandee: "1,00",
    remise: "20%",
  },
  {
    key: "4",
    reference: "SP000001",
    designation: "Glissieres a frain",
    indent: true,
    puHt: "",
    puTtc: "",
    qte: "",
    quantite: "2,00",
    qteColisee: "2,00",
    condition: "Unité",
    qteCommandee: "2,00",
    remise: "20%",
  },
  {
    key: "5",
    reference: "SP000001",
    designation: "Accessoires d'assemblage",
    indent: true,
    puHt: "",
    puTtc: "",
    qte: "",
    quantite: "1,00",
    qteColisee: "1,00",
    condition: "Unité",
    qteCommandee: "1,00",
    remise: "20%",
  },
  {
    key: "6",
    reference: "SP000001",
    designation: "Coloune Meuble",
    indent: true,
    puHt: "",
    puTtc: "",
    qte: "",
    quantite: "1,00",
    qteColisee: "1,00",
    condition: "Unité",
    qteCommandee: "1,00",
    remise: "20%",
  },
];

// Small drag handle rendered on the right edge of a table header.
// It doesn't own any state itself — it just reports a pixel delta
// back to whoever is listening (the parent's `widths` state).
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

  // --- Responsive vertical scroll -------------------------------------
  // The table body's available height depends on how much vertical
  // space is left in the window after every other section (title bar,
  // toolbar, header form, quick-add row, totals, footer). Rather than
  // hard-coding a pixel value, we measure the wrapping <div> live with
  // a ResizeObserver, so the scroll area — and therefore where the
  // scrollbar kicks in — always matches the actual viewport, and the
  // totals/footer stay pinned below it no matter the window size.
  const tableWrapRef = useRef(null);
  const [bodyHeight, setBodyHeight] = useState(300);

  useEffect(() => {
    const el = tableWrapRef.current;
    if (!el) return undefined;

    const HEADER_ROW_HEIGHT = 39; // approx antd small-size header row height

    const updateHeight = () => {
      const available = el.clientHeight - HEADER_ROW_HEIGHT;
      setBodyHeight(Math.max(120, available));
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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


  const create = async (data) =>{
    setDocument(data);
    // const response = await axios.post('https://localhost:7244/documents',{data})
    // console.log("Document created:", response.data);
    
  }

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
            <span className="text-[13px] text-gray-800">Devis : Archivé N° 23DE000438 CL353 ESPAGNO CUISINE</span> :
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

      {/* Toolbar */}
     {/* <DocumentToolbar /> */}
      <DocumentHeaderForm
        onValidate={async (data) =>  {
          try {
             const response = await axios.post('https://localhost:7244/documents',{data})
             console.log(response);
          } catch (error) {
            console.error(error.data)
            message.error(error?.response?.data?.message)
          }
        }}
      />

     
      {/* Quick-add input row — width per column comes straight from
          `widths`, the exact same state the table columns use below,
          so resizing a table column resizes the input above it. */}
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

      {/* Table — the only part of the window that scrolls. It grows
          to fill whatever space is left (flex-1) and is measured live
          so `scroll.y` always matches the real available height,
          keeping the antd header pinned while rows scroll beneath it.
          Everything below (bottom action bar, totals, footer) stays
          outside this flex-1 box, so it's always pinned to the
          bottom of the window regardless of row count. */}
      <div ref={tableWrapRef} className="bg-white flex-1 min-h-0">
        <Table
          columns={columns}
          dataSource={lineItems}
          pagination={false}
          size="small"
          className="whitespace-nowrap"
          rowClassName="text-[13px] whitespace-nowrap"
          scroll={{ x: totalWidth, y: bodyHeight }}
          tableLayout="fixed"
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