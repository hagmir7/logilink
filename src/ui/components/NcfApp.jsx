import { useState, useCallback, useMemo, useEffect } from "react";
import {
  Steps, Form, Input, InputNumber, DatePicker, Select, Radio, Checkbox,
  Button, Card, message, Divider, Result, ConfigProvider, Table,
  Space, Modal, Tooltip, Empty, Dropdown, Spin,
} from "antd";
import {
  FileTextOutlined, SearchOutlined, ToolOutlined, ExperimentOutlined,
  AuditOutlined, CheckCircleOutlined, PlusOutlined, MinusCircleOutlined,
  ArrowLeftOutlined, ArrowRightOutlined, CheckOutlined, EyeOutlined,
  DeleteOutlined, EditOutlined, ReloadOutlined,
  ExclamationCircleOutlined, ClockCircleOutlined, MoreOutlined,
  AppstoreOutlined, UnorderedListOutlined, LoadingOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { api } from "../utils/api";


const { TextArea } = Input;

/* ══════════════════════════════════════════════════════════════
   CONSTANTS
   ══════════════════════════════════════════════════════════════ */
const DETECTION_OPTIONS = [
  { value: "approvisionnement", label: "Approvisionnement" },
  { value: "controle_qualite", label: "Contrôle Qualité" },
  { value: "production", label: "Production" },
  { value: "autre", label: "Autre" },
];
const NATURE_OPTIONS = [
  { value: "quantitative", label: "Quantitative" },
  { value: "qualitative", label: "Qualitative" },
  { value: "documentaire", label: "Documentaire" },
  { value: "autre", label: "Autre" },
];
const ECART_OPTIONS = [
  { value: "erreur_quantite", label: "Erreur de quantité" },
  { value: "defaut_emballage", label: "Défaut d'emballage" },
  { value: "defaut_visuel", label: "Défaut visuel" },
  { value: "dimensions_non_conformes", label: "Dimensions non conformes" },
  { value: "produit_endommage", label: "Produit endommagé" },
  { value: "etiquetage_manquant", label: "Étiquetage manquant" },
  { value: "autre", label: "Autre" },
];
const GRAVITE_MAP = {
  mineure: { label: "Mineure", color: "#16a34a", bg: "#f0fdf4" },
  majeure: { label: "Majeure", color: "#ea580c", bg: "#fff7ed" },
  critique: { label: "Critique", color: "#dc2626", bg: "#fef2f2" },
};
const STATUS_MAP = {
  draft: { label: "Brouillon", color: "#64748b", bg: "#f8fafc", icon: <EditOutlined /> },
  pending_analysis: { label: "Analyse", color: "#2563eb", bg: "#eff6ff", icon: <ExperimentOutlined /> },
  pending_followup: { label: "Suivi", color: "#d97706", bg: "#fffbeb", icon: <ClockCircleOutlined /> },
  closed: { label: "Clôturée", color: "#16a34a", bg: "#f0fdf4", icon: <CheckCircleOutlined /> },
};
const DECISION_PROV = [
  { value: "accepte", label: "Accepté" },
  { value: "accepte_sous_reserve", label: "Accepté sous réserve" },
  { value: "refuse_retour", label: "Refusé / Retour" },
];
const DECISION_FINALE_OPTIONS = [
  { value: "accepte_apres_correction", label: "Accepté après correction" },
  { value: "refuse_definitivement", label: "Refusé définitivement" },
  { value: "accepte_avec_derogation", label: "Accepté avec dérogation" },
];

/* ── Date helpers ── */
const DATE_FIELDS = [
  "date", "date_reception", "date_detection", "date_execution",
  "date_previsionnelle", "date_verification", "date_cloture",
];

const toFormValues = (record) => {
  if (!record) return {};
  const values = { ...record };
  DATE_FIELDS.forEach((f) => {
    if (values[f]) values[f] = dayjs(values[f]);
  });
  if (values.signatures) {
    values.signatures = values.signatures.map((s) => ({
      ...s,
      date: s.date ? dayjs(s.date) : null,
    }));
  }
  return values;
};

const toPayload = (values) => {
  const payload = { ...values };
  DATE_FIELDS.forEach((f) => {
    if (payload[f]?.format) payload[f] = payload[f].format("YYYY-MM-DD");
  });
  if (payload.signatures) {
    payload.signatures = payload.signatures.map((s) => ({
      ...s,
      date: s.date?.format ? s.date.format("YYYY-MM-DD") : s.date,
    }));
  }
  return payload;
};

/* ══════════════════════════════════════════════════════════════
   STEP FORM COMPONENTS
   ══════════════════════════════════════════════════════════════ */
const Step1 = ({ form }) => {
  const det = Form.useWatch("detectee_par", form);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
      <Form.Item label="Fournisseur" name="fournisseur" rules={[{ required: true, message: "Requis" }]}>
        <Input placeholder="Nom du fournisseur" />
      </Form.Item>
      <Form.Item label="Réf. commande / contrat" name="reference_commande">
        <Input placeholder="Référence" />
      </Form.Item>
      <Form.Item label="Bon de livraison N°" name="bon_livraison">
        <Input placeholder="N° BL" />
      </Form.Item>
      <Form.Item label="Date de réception" name="date_reception">
        <DatePicker className="w-full" format="DD/MM/YYYY" />
      </Form.Item>
      <Form.Item label="Code article / Lot" name="code_article">
        <Input placeholder="Code article" />
      </Form.Item>
      <Form.Item label="Produit concerné" name="produit_concerne" rules={[{ required: true, message: "Requis" }]}>
        <Input placeholder="Désignation produit" />
      </Form.Item>
      <Form.Item label="Qté réceptionnée" name="quantite_receptionnee" rules={[{ required: true }]}>
        <InputNumber className="w-full" min={0} />
      </Form.Item>
      <Form.Item label="Qté non conforme" name="quantite_non_conforme" rules={[{ required: true }]}>
        <InputNumber className="w-full" min={0} />
      </Form.Item>
      <Form.Item label="Détectée par" name="detectee_par" rules={[{ required: true }]}>
        <Select options={DETECTION_OPTIONS} placeholder="Sélectionner" />
      </Form.Item>
      {det === "autre" && (
        <Form.Item label="Préciser" name="detectee_par_autre" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      )}
      <Form.Item label="Date de détection" name="date_detection" rules={[{ required: true }]}>
        <DatePicker className="w-full" format="DD/MM/YYYY" />
      </Form.Item>
    </div>
  );
};

const Step2 = ({ form }) => {
  const types = Form.useWatch("types_ecart", form) || [];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
      <Form.Item label="Nature de la NC" name="nature_nc" rules={[{ required: true }]} className="md:col-span-2">
        <Radio.Group buttonStyle="solid">
          {NATURE_OPTIONS.map((o) => (
            <Radio.Button key={o.value} value={o.value}>{o.label}</Radio.Button>
          ))}
        </Radio.Group>
      </Form.Item>
      <Form.Item label="Type d'écart" name="types_ecart" rules={[{ required: true }]} className="md:col-span-2">
        <Checkbox.Group>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {ECART_OPTIONS.map((o) => (
              <Checkbox key={o.value} value={o.value}>{o.label}</Checkbox>
            ))}
          </div>
        </Checkbox.Group>
      </Form.Item>
      {types.includes("autre") && (
        <Form.Item label="Préciser" name="type_ecart_autre" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      )}
      <Form.Item label="Description détaillée" name="description_detaillee" rules={[{ required: true }]} className="md:col-span-2">
        <TextArea rows={4} placeholder="Décrire la non-conformité..." />
      </Form.Item>
      <Form.Item label="Preuves jointes" name="preuves_jointes" valuePropName="checked">
        <Checkbox>Oui</Checkbox>
      </Form.Item>
      <Form.Item label="Réf. lot / série" name="reference_lot">
        <Input />
      </Form.Item>
      <Form.Item label="Gravité" name="gravite" rules={[{ required: true }]} className="md:col-span-2">
        <Radio.Group buttonStyle="solid">
          {Object.entries(GRAVITE_MAP).map(([k, v]) => (
            <Radio.Button key={k} value={k}>
              <span style={{ color: v.color }}>{v.label}</span>
            </Radio.Button>
          ))}
        </Radio.Group>
      </Form.Item>
    </div>
  );
};

const Step3 = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
    <Form.Item label="Décision provisoire" name="decision_provisoire" rules={[{ required: true }]} className="md:col-span-2">
      <Radio.Group buttonStyle="solid">
        {DECISION_PROV.map((o) => (
          <Radio.Button key={o.value} value={o.value}>{o.label}</Radio.Button>
        ))}
      </Radio.Group>
    </Form.Item>
    <Form.Item label="Mesures immédiates" name="mesures_immediates" rules={[{ required: true }]} className="md:col-span-2">
      <TextArea rows={4} placeholder="Mesures prises..." />
    </Form.Item>
    <Form.Item label="Responsable" name="responsable_action" rules={[{ required: true }]}>
      <Input placeholder="Nom & prénom" />
    </Form.Item>
    <Form.Item label="Date d'exécution" name="date_execution" rules={[{ required: true }]}>
      <DatePicker className="w-full" format="DD/MM/YYYY" />
    </Form.Item>
  </div>
);

const Step4 = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
    <Form.Item label="Causes probables" name="causes_probables" rules={[{ required: true }]} className="md:col-span-2">
      <TextArea rows={3} />
    </Form.Item>
    <Form.Item label="Cause principale" name="cause_principale" rules={[{ required: true }]} className="md:col-span-2">
      <TextArea rows={3} />
    </Form.Item>
    <Form.Item label="Action corrective" name="action_corrective" rules={[{ required: true }]} className="md:col-span-2">
      <TextArea rows={3} />
    </Form.Item>
    <Form.Item label="Responsable" name="responsable_action_corrective" rules={[{ required: true }]}>
      <Input />
    </Form.Item>
    <Form.Item label="Date prévisionnelle" name="date_previsionnelle" rules={[{ required: true }]}>
      <DatePicker className="w-full" format="DD/MM/YYYY" />
    </Form.Item>
  </div>
);

const Step5 = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
    <Form.Item label="Responsable du suivi" name="responsable_suivi" rules={[{ required: true }]}>
      <Input />
    </Form.Item>
    <Form.Item label="Date de vérification" name="date_verification" rules={[{ required: true }]}>
      <DatePicker className="w-full" format="DD/MM/YYYY" />
    </Form.Item>
    <Form.Item label="Action réalisée ?" name="action_realisee" rules={[{ required: true }]}>
      <Radio.Group buttonStyle="solid">
        <Radio.Button value={true}>Oui</Radio.Button>
        <Radio.Button value={false}>Non</Radio.Button>
      </Radio.Group>
    </Form.Item>
    <Form.Item label="Action efficace ?" name="action_efficace" rules={[{ required: true }]}>
      <Radio.Group buttonStyle="solid">
        <Radio.Button value={true}>Oui</Radio.Button>
        <Radio.Button value={false}>Non</Radio.Button>
      </Radio.Group>
    </Form.Item>
    <Form.Item label="N° FNC" name="fnc_reference">
      <Input />
    </Form.Item>
    <Form.Item label="Date de clôture" name="date_cloture">
      <DatePicker className="w-full" format="DD/MM/YYYY" />
    </Form.Item>
  </div>
);

const Step6 = () => (
  <div className="space-y-4">
    <Form.Item label="Décision finale" name="decision_finale" rules={[{ required: true }]}>
      <Radio.Group buttonStyle="solid">
        {DECISION_FINALE_OPTIONS.map((o) => (
          <Radio.Button key={o.value} value={o.value}>{o.label}</Radio.Button>
        ))}
      </Radio.Group>
    </Form.Item>
    <Divider orientation="left" plain>
      <span className="text-xs text-gray-500 uppercase tracking-wider">Signatures</span>
    </Divider>
    <Form.List name="signatures" initialValue={[{ entite: "achats" }, { entite: "direction" }]}>
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, ...rest }) => (
            <div key={key} className="grid grid-cols-1 md:grid-cols-4 gap-x-3 items-start p-4 rounded-xl mb-3"
              style={{ background: "#f8fafc", border: "1px solid #e8edf2" }}>
              <Form.Item {...rest} name={[name, "entite"]} label="Entité" rules={[{ required: true }]}>
                <Select options={[{ value: "achats", label: "Achats" }, { value: "direction", label: "Direction" }]} />
              </Form.Item>
              <Form.Item {...rest} name={[name, "nom_prenom"]} label="Nom & Prénom" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item {...rest} name={[name, "date"]} label="Date" rules={[{ required: true }]}>
                <DatePicker className="w-full" format="DD/MM/YYYY" />
              </Form.Item>
              <div className="flex items-end gap-1">
                <Form.Item {...rest} name={[name, "visa"]} label="Visa" className="flex-1">
                  <Input />
                </Form.Item>
                {fields.length > 1 && (
                  <Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => remove(name)} className="mb-6" />
                )}
              </div>
            </div>
          ))}
          <Button type="dashed" onClick={() => add({ entite: "achats" })} icon={<PlusOutlined />} block>
            Ajouter
          </Button>
        </>
      )}
    </Form.List>
  </div>
);

const STEPS = [
  { title: "Informations", desc: "Générales", icon: <FileTextOutlined />, C: Step1 },
  { title: "Description", desc: "Non-conformité", icon: <SearchOutlined />, C: Step2 },
  { title: "Traitement", desc: "Immédiat", icon: <ToolOutlined />, C: Step3 },
  { title: "Analyse", desc: "Des causes", icon: <ExperimentOutlined />, C: Step4 },
  { title: "Suivi", desc: "Efficacité", icon: <AuditOutlined />, C: Step5 },
  { title: "Décision", desc: "Finale", icon: <CheckCircleOutlined />, C: Step6 },
];

/* ══════════════════════════════════════════════════════════════
   STAT CARD
   ══════════════════════════════════════════════════════════════ */
const StatCard = ({ label, value, color, bg, icon, active, onClick }) => (
  <button onClick={onClick} className="text-left w-full border-0"
    style={{
      background: active ? color : bg, borderRadius: 14, padding: "16px 20px",
      cursor: "pointer", transition: "all 0.2s",
      outline: active ? `2px solid ${color}` : "2px solid transparent", outlineOffset: 2,
    }}>
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
    colorPrimary: "#1e3a5f", borderRadius: 10,
    fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
    colorBgContainer: "#ffffff",
  },
  components: {
    Steps: { colorPrimary: "#1e3a5f" },
    Button: { primaryColor: "#ffffff", colorPrimary: "#1e3a5f" },
    Radio: { buttonSolidCheckedBg: "#1e3a5f" },
    Table: { headerBg: "#f8fafc", headerColor: "#475569", rowHoverBg: "#f8fafc" },
  },
};

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
export default function NcfApp() {
  const [view, setView] = useState("list");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 15, total: 0 });
  const [filterStatus, setFilterStatus] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [savedRef, setSavedRef] = useState("");
  const [detailModal, setDetailModal] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  /* ── Fetch list ── */
  const fetchList = useCallback(async (page = 1, status = null, search = "") => {
    setLoading(true);
    try {
      const params = { page, per_page: 15 };
      if (status && status !== "critique") params.status = status;
      if (search) params.search = search;
      const { data: res } = await api.get("/ncf", { params });
      let items = res.data || res;
      // handle "critique" filter client-side since API filters by status
      if (status === "critique") {
        items = items.filter((r) => r.gravite === "critique");
      }
      setData(Array.isArray(items) ? items : []);
      if (res.meta || res.total) {
        setPagination({
          current: res.meta?.current_page || res.current_page || page,
          pageSize: res.meta?.per_page || res.per_page || 15,
          total: res.meta?.total || res.total || 0,
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
    if (view === "list") fetchList(1, filterStatus, searchText);
  }, [view, filterStatus, searchText, fetchList]);

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
    total: pagination.total || data.length,
    draft: data.filter((d) => d.status === "draft").length,
    pending: data.filter((d) => d.status === "pending_analysis" || d.status === "pending_followup").length,
    closed: data.filter((d) => d.status === "closed").length,
    critique: data.filter((d) => d.gravite === "critique").length,
  }), [data, pagination.total]);

  /* ── Actions ── */
  const openNewForm = () => {
    form.resetFields();
    setCurrent(0);
    setEditingId(null);
    setSavedRef("");
    setView("form");
  };

  const openEditForm = (record) => {
    form.setFieldsValue(toFormValues(record));
    setCurrent(Math.max(0, (record.current_step || 1) - 1));
    setEditingId(record.id);
    setView("form");
  };

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

  const handleNext = useCallback(async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const payload = toPayload(values);
      const step = current + 1;

      if (step === 1 && !editingId) {
        // Create new NCF
        const { data: res } = await api.post("/ncf", payload);
        const created = res.data || res;
        setEditingId(created.id);
        setSavedRef(created.reference);
        message.success(`Fiche ${created.reference} créée`);
      } else {
        // Update step
        const id = editingId;
        await api.put(`/ncf/${id}/step/${step}`, payload);
        message.success(`Étape ${step} enregistrée`);
      }

      if (current < STEPS.length - 1) {
        setCurrent((c) => c + 1);
      } else {
        setView("completed");
      }
    } catch (err) {
      if (err?.response?.data?.errors) {
        const serverErrors = err.response.data.errors;
        const fieldErrors = Object.entries(serverErrors).map(([name, messages]) => ({
          name, errors: Array.isArray(messages) ? messages : [messages],
        }));
        form.setFields(fieldErrors);
        message.error("Erreurs de validation");
      } else if (err?.errorFields) {
        message.warning("Veuillez remplir les champs obligatoires");
      } else {
        message.error("Erreur serveur");
        console.error(err);
      }
    } finally {
      setSaving(false);
    }
  }, [current, form, editingId]);

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
        <Dropdown trigger={["click"]} menu={{
          items: [
            { key: "view", icon: <EyeOutlined />, label: "Voir détails", onClick: () => fetchDetail(record.id) },
            { key: "edit", icon: <EditOutlined />, label: "Continuer", onClick: () => openEditForm(record) },
            { type: "divider" },
            { key: "delete", icon: <DeleteOutlined />, label: "Supprimer", danger: true, onClick: () => handleDelete(record.id) },
          ],
        }}>
          <Button type="text" size="small" icon={<MoreOutlined />} className="text-gray-400" />
        </Dropdown>
      ),
    },
  ];

  /* ════════════════ COMPLETED ════════════════ */
  if (view === "completed") {
    return (
      <ConfigProvider theme={THEME}>
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(160deg, #f0f4f8, #e2e8f0)" }}>
          <Card style={{ borderRadius: 20, maxWidth: 480, width: "100%" }}>
            <Result
              status="success"
              title="Fiche NCF Enregistrée"
              subTitle={savedRef ? `Référence : ${savedRef}` : "Fiche mise à jour avec succès"}
              extra={
                <Space>
                  <Button size="large" onClick={() => { setView("list"); setEditingId(null); }} icon={<UnorderedListOutlined />}>
                    Liste
                  </Button>
                  <Button type="primary" size="large" onClick={openNewForm} icon={<PlusOutlined />}>
                    Nouvelle
                  </Button>
                </Space>
              }
            />
          </Card>
        </div>
      </ConfigProvider>
    );
  }

  /* ════════════════ STEP FORM ════════════════ */
  if (view === "form") {
    const { C } = STEPS[current];
    return (
      <ConfigProvider theme={THEME}>
        <div className="min-h-screen p-3 md:p-8" style={{ background: "linear-gradient(160deg, #f0f4f8, #e2e8f0)" }}>
          <div className="max-w-5xl mx-auto">
            <button onClick={() => setView("list")}
              className="flex items-center gap-2 text-sm mb-5 bg-transparent border-0 cursor-pointer"
              style={{ color: "#64748b" }}>
              <ArrowLeftOutlined /> Retour à la liste
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase mb-3"
                style={{ background: "#1e3a5f", color: "#fff" }}>
                <FileTextOutlined /> {editingId ? `Modifier — ${savedRef || `#${editingId}`}` : "Nouvelle fiche"}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: "#1e3a5f" }}>
                Fiche NC Fournisseur
              </h1>
            </div>

            {/* Stepper */}
            <div className="mb-5 overflow-x-auto pb-2">
              <Steps current={current} size="small" className="min-w-[700px]"
                onChange={(v) => { if (v < current) setCurrent(v); }}>
                {STEPS.map((s, i) => (
                  <Steps.Step key={i}
                    title={<span className="text-xs font-medium">{s.title}</span>}
                    description={<span className="text-xs">{s.desc}</span>}
                    icon={
                      <div className="flex items-center justify-center w-8 h-8 rounded-full text-sm"
                        style={{ background: i <= current ? "#1e3a5f" : "#e2e8f0", color: i <= current ? "#fff" : "#94a3b8", transition: "all 0.3s" }}>
                        {i < current ? <CheckOutlined /> : s.icon}
                      </div>
                    }
                  />
                ))}
              </Steps>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 rounded-full mb-6" style={{ background: "#e2e8f0" }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${((current + 1) / STEPS.length) * 100}%`, background: "linear-gradient(90deg, #1e3a5f, #2d5a8e)" }} />
            </div>

            {/* Form card */}
            <Card style={{ borderRadius: 16, border: "1px solid #e8edf2" }}>
              <div className="flex items-center gap-3 mb-5 pb-4" style={{ borderBottom: "2px solid #f1f5f9" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: "#eef2f7", color: "#1e3a5f" }}>
                  {STEPS[current].icon}
                </div>
                <div>
                  <h2 className="text-base font-bold m-0" style={{ color: "#1e3a5f" }}>{STEPS[current].title}</h2>
                  <span className="text-xs" style={{ color: "#94a3b8" }}>Étape {current + 1}/{STEPS.length}</span>
                </div>
              </div>

              <Form form={form} layout="vertical" requiredMark="optional" size="middle">
                <C form={form} />
              </Form>

              <div className="flex justify-between mt-8 pt-5" style={{ borderTop: "2px solid #f1f5f9" }}>
                <Button size="large" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}
                  icon={<ArrowLeftOutlined />} style={{ borderRadius: 10 }}>
                  Précédent
                </Button>
                <Button type="primary" size="large" loading={saving} onClick={handleNext}
                  style={{ borderRadius: 10, minWidth: 160 }}>
                  {current === STEPS.length - 1
                    ? <span className="flex items-center gap-2"><CheckCircleOutlined /> Valider & Clôturer</span>
                    : <span className="flex items-center gap-2">Suivant <ArrowRightOutlined /></span>}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </ConfigProvider>
    );
  }

  /* ════════════════ LIST VIEW ════════════════ */
  return (
    <ConfigProvider theme={THEME}>
      <div className="min-h-screen p-3 md:p-8" style={{ background: "linear-gradient(160deg, #f0f4f8, #e2e8f0)" }}>
        <div className=" mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase mb-2"
                style={{ background: "#1e3a5f", color: "#fff" }}>
                <FileTextOutlined /> ENR_ACH_07
              </div>
              <h1 className="text-xl md:text-3xl font-bold tracking-tight m-0" style={{ color: "#1e3a5f" }}>
                Fiches NC Fournisseur
              </h1>
              <p className="text-sm m-0 mt-1" style={{ color: "#64748b" }}>Gestion des non-conformités fournisseur</p>
            </div>
            <Button type="primary" size="large" icon={<PlusOutlined />} onClick={openNewForm}
              style={{ borderRadius: 12 }}>
              Nouvelle Fiche
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <StatCard label="Total" value={stats.total} color="#1e3a5f" bg="#eef2f7"
              icon={<AppstoreOutlined />} active={!filterStatus} onClick={() => setFilterStatus(null)} />
            <StatCard label="Brouillons" value={stats.draft} color="#64748b" bg="#f8fafc"
              icon={<EditOutlined />} active={filterStatus === "draft"} onClick={() => toggleFilter("draft")} />
            <StatCard label="En cours" value={stats.pending} color="#d97706" bg="#fffbeb"
              icon={<ClockCircleOutlined />} active={filterStatus === "pending"} onClick={() => toggleFilter("pending")} />
            <StatCard label="Clôturées" value={stats.closed} color="#16a34a" bg="#f0fdf4"
              icon={<CheckCircleOutlined />} active={filterStatus === "closed"} onClick={() => toggleFilter("closed")} />
            <StatCard label="Critiques" value={stats.critique} color="#dc2626" bg="#fef2f2"
              icon={<ExclamationCircleOutlined />} active={filterStatus === "critique"} onClick={() => toggleFilter("critique")} />
          </div>

          {/* Search */}
          <Card style={{ borderRadius: 14, border: "1px solid #e8edf2", marginBottom: 16 }}
            styles={{ body: { padding: "12px 16px" } }}>
            <div className="flex items-center gap-3">
              <Input prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                placeholder="Rechercher par référence, fournisseur ou produit..."
                value={searchText} onChange={(e) => setSearchText(e.target.value)}
                allowClear variant="borderless" size="large" style={{ fontSize: 14 }} />
              <Tooltip title="Réinitialiser">
                <Button type="text" icon={<ReloadOutlined />} onClick={() => { setFilterStatus(null); setSearchText(""); }} />
              </Tooltip>
            </div>
          </Card>

          {/* Table */}
          <Card style={{ borderRadius: 16, border: "1px solid #e8edf2", overflow: "hidden" }}
            styles={{ body: { padding: 0 } }}>
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
                onChange: (page) => fetchList(page, filterStatus, searchText),
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
              <div className="text-center p-3 rounded-xl"
                style={{ background: detailModal.gravite ? GRAVITE_MAP[detailModal.gravite]?.bg : "#f8fafc" }}>
                <div className="text-lg font-bold"
                  style={{ color: detailModal.gravite ? GRAVITE_MAP[detailModal.gravite]?.color : "#94a3b8" }}>
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
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                      style={{ background: m.bg, color: m.color }}>
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
              <Button block size="large" icon={<EditOutlined />}
                onClick={() => { openEditForm(detailModal); setDetailModal(null); }}
                style={{ borderRadius: 10 }}>
                Continuer
              </Button>
              <Button block size="large" danger icon={<DeleteOutlined />}
                onClick={() => { handleDelete(detailModal.id); setDetailModal(null); }}
                style={{ borderRadius: 10 }}>
                Supprimer
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </ConfigProvider>
  );
}