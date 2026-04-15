import { useState, useCallback, useMemo, useEffect } from "react";
import {
  Input, Button, Card, message, ConfigProvider, Table,
  Modal, Tooltip, Empty, Dropdown,
} from "antd";
import {
  FileTextOutlined, SearchOutlined,
  CheckCircleOutlined, PlusOutlined,
  EyeOutlined,
  DeleteOutlined, EditOutlined, ReloadOutlined,
  ExclamationCircleOutlined, ClockCircleOutlined, MoreOutlined,
  AppstoreOutlined, LoadingOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { api } from "../utils/api";
import { handleShow } from "../utils/config";
import { useNavigate } from "react-router-dom";

/* ══════════════════════════════════════════════════════════════
   CONSTANTS
   ══════════════════════════════════════════════════════════════ */
const GRAVITE_MAP = {
  mineure: { label: "Mineure", color: "#16a34a", bg: "#f0fdf4" },
  majeure: { label: "Majeure", color: "#ea580c", bg: "#fff7ed" },
  critique: { label: "Critique", color: "#dc2626", bg: "#fef2f2" },
};
const STATUS_MAP = {
  draft:            { label: "Brouillon", color: "#64748b", bg: "#f8fafc", icon: <EditOutlined /> },
  pending_analysis: { label: "Analyse",   color: "#2563eb", bg: "#eff6ff", icon: <ExperimentOutlined /> },
  pending_followup: { label: "Suivi",     color: "#d97706", bg: "#fffbeb", icon: <ClockCircleOutlined /> },
  closed:           { label: "Clôturée",  color: "#16a34a", bg: "#f0fdf4", icon: <CheckCircleOutlined /> },
};
const DECISION_FINALE_OPTIONS = [
  { value: "accepte_apres_correction", label: "Accepté après correction" },
  { value: "refuse_definitivement",    label: "Refusé définitivement" },
  { value: "accepte_avec_derogation",  label: "Accepté avec dérogation" },
];

/* ══════════════════════════════════════════════════════════════
   STAT CARD
   ══════════════════════════════════════════════════════════════ */
const StatCard = ({ label, value, color, bg, icon, active, onClick }) => (
  <button
    onClick={onClick}
    className="text-left w-full border-0"
    style={{
      background: active ? color : bg,
      borderRadius: 14,
      padding: "16px 20px",
      cursor: "pointer",
      transition: "all 0.2s",
      outline: active ? `2px solid ${color}` : "2px solid transparent",
      outlineOffset: 2,
    }}
  >
    <div className="flex items-center justify-between">
      <div>
        <div className="text-2xl font-bold" style={{ color: active ? "#fff" : color }}>{value}</div>
        <div className="text-xs font-medium mt-0.5" style={{ color: active ? "rgba(255,255,255,0.85)" : "#64748b" }}>{label}</div>
      </div>
      <div className="text-xl" style={{ color: active ? "rgba(255,255,255,0.7)" : color, opacity: 0.7 }}>{icon}</div>
    </div>
  </button>
);

/* ══════════════════════════════════════════════════════════════
   THEME
   ══════════════════════════════════════════════════════════════ */
const THEME = {
  token: {
    colorPrimary: "#1e3a5f",
    borderRadius: 10,
    fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
    colorBgContainer: "#ffffff",
  },
  components: {
    Button: { primaryColor: "#ffffff", colorPrimary: "#1e3a5f" },
    Table:  { headerBg: "#f8fafc", headerColor: "#475569", rowHoverBg: "#f8fafc" },
  },
};

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
export default function NcfApp() {
  const navigate = useNavigate();

  /* ── List state ── */
  const [data, setData]             = useState([]);
  const [loading, setLoading]       = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 15, total: 0 });
  const [filterStatus, setFilterStatus] = useState(null);
  const [searchText, setSearchText]     = useState("");

  /* ── Detail modal ── */
  const [detailModal, setDetailModal]     = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  /* ── Fetch list ── */
  const fetchList = useCallback(async (pg = 1, status = null, search = "") => {
    setLoading(true);
    try {
      const params = { page: pg, per_page: 15 };
      if (status && status !== "critique") params.status = status;
      if (search) params.search = search;
      const { data: res } = await api.get("/ncf", { params });
      let items = res.data || res;
      if (status === "critique") items = items.filter((r) => r.gravite === "critique");
      setData(Array.isArray(items) ? items : []);
      if (res.meta || res.total) {
        setPagination({
          current:  res.meta?.current_page || res.current_page || pg,
          pageSize: res.meta?.per_page     || res.per_page     || 15,
          total:    res.meta?.total        || res.total        || 0,
        });
      }
    } catch (err) {
      message.error("Erreur lors du chargement des fiches");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList(1, filterStatus, searchText);
  }, [filterStatus, searchText, fetchList]);

  /* ── Fetch detail ── */
  const fetchDetail = async (id) => {
    setDetailLoading(true);
    try {
      const { data: res } = await api.get(`/ncf/${id}`);
      setDetailModal(res.data || res);
    } catch {
      message.error("Erreur lors du chargement");
    } finally {
      setDetailLoading(false);
    }
  };

  /* ── Stats ── */
  const stats = useMemo(() => ({
    total:    pagination.total || data.length,
    draft:    data.filter((d) => d.status === "draft").length,
    pending:  data.filter((d) => d.status === "pending_analysis" || d.status === "pending_followup").length,
    closed:   data.filter((d) => d.status === "closed").length,
    critique: data.filter((d) => d.gravite === "critique").length,
  }), [data, pagination.total]);

  /* ── Navigation ── */
  const goToNewForm  = ()       => handleShow(navigate, "/supplier-ncf/create", 1000, 800);
  const goToEditForm = (record) => handleShow(navigate, `/supplier-ncf/${record.id}/edit`, 1000, 800);

  /* ── Delete ── */
  const handleDelete = (id) => {
    Modal.confirm({
      title: "Supprimer cette fiche ?",
      icon: <ExclamationCircleOutlined />,
      content: "Cette action est irréversible.",
      okText: "Supprimer",
      okType: "danger",
      cancelText: "Annuler",
      onOk: async () => {
        try {
          await api.delete(`/ncf/${id}`);
          message.success("Fiche supprimée");
          fetchList(pagination.current, filterStatus, searchText);
        } catch {
          message.error("Erreur lors de la suppression");
        }
      },
    });
  };

  const toggleFilter = (key) => setFilterStatus((f) => (f === key ? null : key));

  /* ── Table columns ── */
  const columns = [
    {
      title: "Référence", dataIndex: "reference", key: "reference", width: 155,
      render: (r) => <span className="font-semibold text-sm" style={{ color: "#1e3a5f" }}>{r}</span>,
    },
    {
      title: "Date", dataIndex: "date", key: "date", width: 105,
      render: (d) => <span className="text-xs text-gray-500">{d ? dayjs(d).format("DD/MM/YYYY") : "—"}</span>,
    },
    {
      title: "Fournisseur", dataIndex: "fournisseur", key: "fournisseur",
      render: (f) => <span className="text-sm">{f}</span>,
    },
    {
      title: "Produit", dataIndex: "produit_concerne", key: "produit", ellipsis: true,
      render: (p) => <span className="text-sm text-gray-600">{p}</span>,
    },
    {
      title: "Gravité", dataIndex: "gravite", key: "gravite", width: 105, align: "center",
      render: (g) => {
        if (!g) return <span className="text-xs text-gray-400">—</span>;
        const m = GRAVITE_MAP[g];
        return m ? (
          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: m.bg, color: m.color }}>
            {m.label}
          </span>
        ) : g;
      },
    },
    {
      title: "Statut", dataIndex: "status", key: "status", width: 125, align: "center",
      render: (s) => {
        const m = STATUS_MAP[s];
        return m ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: m.bg, color: m.color }}>
            {m.icon} {m.label}
          </span>
        ) : s;
      },
    },
    {
      title: "Étape", dataIndex: "current_step", key: "step", width: 70, align: "center",
      render: (s) => (
        <span className="text-xs font-medium px-2 py-0.5 rounded-md" style={{ background: "#eef2f7", color: "#1e3a5f" }}>
          {s || 1}/6
        </span>
      ),
    },
    {
      title: "", key: "actions", width: 48, align: "center",
      render: (_, record) => (
        <Dropdown
          trigger={["click"]}
          menu={{
            items: [
              { key: "view",   icon: <EyeOutlined />,    label: "Voir détails", onClick: () => fetchDetail(record.id) },
              { key: "edit",   icon: <EditOutlined />,   label: "Continuer",    onClick: () => goToEditForm(record) },
              { type: "divider" },
              { key: "delete", icon: <DeleteOutlined />, label: "Supprimer", danger: true, onClick: () => handleDelete(record.id) },
            ],
          }}
        >
          <Button type="text" size="small" icon={<MoreOutlined />} className="text-gray-400" />
        </Dropdown>
      ),
    },
  ];

  /* ══════════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════════ */
  return (
    <ConfigProvider theme={THEME}>
      <div className="min-h-screen p-3" style={{ background: "linear-gradient(160deg, #f0f4f8, #e2e8f0)" }}>
        <div className="mx-auto">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
            <div>
              <div
                className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-semibold uppercase mb-1"
                style={{ background: "#1e3a5f", color: "#fff" }}
              >
                <FileTextOutlined /> ENR_ACH_07
              </div>
              <h1 className="text-xl font-bold tracking-tight m-0" style={{ color: "#1e3a5f" }}>
                Fiches NC Fournisseur
              </h1>
              <p className="text-sm m-0 mt-1" style={{ color: "#64748b" }}>
                Gestion des non-conformités fournisseur
              </p>
            </div>
            <Button type="primary" size="large" icon={<PlusOutlined />} onClick={goToNewForm} style={{ borderRadius: 12 }}>
              Nouvelle Fiche
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
            <StatCard label="Total"      value={stats.total}    color="#1e3a5f" bg="#eef2f7" icon={<AppstoreOutlined />}          active={!filterStatus}              onClick={() => setFilterStatus(null)} />
            <StatCard label="Brouillons" value={stats.draft}    color="#64748b" bg="#f8fafc" icon={<EditOutlined />}              active={filterStatus === "draft"}    onClick={() => toggleFilter("draft")} />
            <StatCard label="En cours"   value={stats.pending}  color="#d97706" bg="#fffbeb" icon={<ClockCircleOutlined />}       active={filterStatus === "pending"}  onClick={() => toggleFilter("pending")} />
            <StatCard label="Clôturées"  value={stats.closed}   color="#16a34a" bg="#f0fdf4" icon={<CheckCircleOutlined />}       active={filterStatus === "closed"}   onClick={() => toggleFilter("closed")} />
            <StatCard label="Critiques"  value={stats.critique} color="#dc2626" bg="#fef2f2" icon={<ExclamationCircleOutlined />} active={filterStatus === "critique"} onClick={() => toggleFilter("critique")} />
          </div>

          {/* Search */}
          <Card
            style={{ borderRadius: 14, border: "1px solid #e8edf2", marginBottom: 16 }}
            styles={{ body: { padding: "10px 10px" } }}
          >
            <div className="flex items-center gap-3">
              <Input
                prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                placeholder="Rechercher par référence, fournisseur ou produit..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                variant="borderless"
                size="large"
                style={{ fontSize: 14 }}
              />
              <Tooltip title="Réinitialiser">
                <Button
                  type="text"
                  icon={<ReloadOutlined />}
                  onClick={() => { setFilterStatus(null); setSearchText(""); }}
                />
              </Tooltip>
            </div>
          </Card>

          {/* Table */}
          <Card style={{ borderRadius: 16, border: "1px solid #e8edf2", overflow: "hidden" }} styles={{ body: { padding: 0 } }}>
            <Table
              dataSource={data}
              columns={columns}
              rowKey="id"
              loading={{ spinning: loading, indicator: <LoadingOutlined style={{ fontSize: 24, color: "#1e3a5f" }} /> }}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: false,
                showTotal: (t) => <span className="text-xs text-gray-500">{t} fiche(s)</span>,
                onChange: (pg) => fetchList(pg, filterStatus, searchText),
              }}
              locale={{ emptyText: <Empty description="Aucune fiche trouvée" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
              onRow={(record) => ({
                style: { cursor: "pointer" },
                onClick: (e) => {
                  if (e.target.closest(".ant-dropdown-trigger,.ant-btn")) return;
                  fetchDetail(record.id);
                },
              })}
              size="middle"
            />
          </Card>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        open={!!detailModal}
        onCancel={() => setDetailModal(null)}
        footer={null}
        width={580}
        title={<span style={{ color: "#1e3a5f", fontSize: 16 }}>{detailModal?.reference}</span>}
        loading={detailLoading}
      >
        {detailModal && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl" style={{ background: "#f8fafc" }}>
              <div>
                <div className="text-xs text-gray-400 mb-0.5">Fournisseur</div>
                <div className="text-sm font-medium">{detailModal.fournisseur}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-0.5">Date</div>
                <div className="text-sm">{detailModal.date ? dayjs(detailModal.date).format("DD/MM/YYYY") : "—"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-0.5">Produit</div>
                <div className="text-sm">{detailModal.produit_concerne}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-0.5">Nature NC</div>
                <div className="text-sm capitalize">{detailModal.nature_nc || "—"}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-xl" style={{ background: "#eef2f7" }}>
                <div className="text-lg font-bold" style={{ color: "#1e3a5f" }}>{detailModal.quantite_receptionnee ?? "—"}</div>
                <div className="text-xs text-gray-500">Réceptionnée</div>
              </div>
              <div className="text-center p-3 rounded-xl" style={{ background: "#fef2f2" }}>
                <div className="text-lg font-bold" style={{ color: "#dc2626" }}>{detailModal.quantite_non_conforme ?? "—"}</div>
                <div className="text-xs text-gray-500">Non conforme</div>
              </div>
              <div
                className="text-center p-3 rounded-xl"
                style={{ background: detailModal.gravite ? GRAVITE_MAP[detailModal.gravite]?.bg : "#f8fafc" }}
              >
                <div
                  className="text-lg font-bold"
                  style={{ color: detailModal.gravite ? GRAVITE_MAP[detailModal.gravite]?.color : "#94a3b8" }}
                >
                  {detailModal.gravite ? GRAVITE_MAP[detailModal.gravite]?.label : "—"}
                </div>
                <div className="text-xs text-gray-500">Gravité</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "#f8fafc" }}>
              <div className="flex items-center gap-2">
                {(() => {
                  const m = STATUS_MAP[detailModal.status] || STATUS_MAP.draft;
                  return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: m.bg, color: m.color }}>
                      {m.icon} {m.label}
                    </span>
                  );
                })()}
                <span className="text-xs" style={{ color: "#94a3b8" }}>Étape {detailModal.current_step || 1}/6</span>
              </div>
              {detailModal.decision_finale && (
                <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: "#eef2f7", color: "#1e3a5f" }}>
                  {DECISION_FINALE_OPTIONS.find((d) => d.value === detailModal.decision_finale)?.label || detailModal.decision_finale}
                </span>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                block size="large" icon={<EditOutlined />}
                onClick={() => { goToEditForm(detailModal); setDetailModal(null); }}
                style={{ borderRadius: 10 }}
              >
                Continuer
              </Button>
              <Button
                block size="large" danger icon={<DeleteOutlined />}
                onClick={() => { handleDelete(detailModal.id); setDetailModal(null); }}
                style={{ borderRadius: 10 }}
              >
                Supprimer
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </ConfigProvider>
  );
}