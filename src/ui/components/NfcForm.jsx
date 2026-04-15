import { useState, useCallback, useEffect } from "react";
import {
  Steps, Form, Input, InputNumber, DatePicker, Select, Radio, Checkbox,
  Button, Card, message, Divider, ConfigProvider, Space, Result, Spin,
} from "antd";
import {
  FileTextOutlined, SearchOutlined, ToolOutlined, ExperimentOutlined,
  AuditOutlined, CheckCircleOutlined, PlusOutlined, MinusCircleOutlined,
  ArrowLeftOutlined, ArrowRightOutlined, CheckOutlined, UnorderedListOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useParams, useNavigate } from "react-router-dom";
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

export const toFormValues = (record) => {
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
            <div
              key={key}
              className="grid grid-cols-1 md:grid-cols-4 gap-x-3 items-start p-4 rounded-xl mb-3"
              style={{ background: "#f8fafc", border: "1px solid #e8edf2" }}
            >
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
                  <Button
                    type="text" danger
                    icon={<MinusCircleOutlined />}
                    onClick={() => remove(name)}
                    className="mb-6"
                  />
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
  { title: "Informations", desc: "Générales",      icon: <FileTextOutlined />,    C: Step1 },
  { title: "Description",  desc: "Non-conformité", icon: <SearchOutlined />,      C: Step2 },
  { title: "Traitement",   desc: "Immédiat",        icon: <ToolOutlined />,        C: Step3 },
  { title: "Analyse",      desc: "Des causes",      icon: <ExperimentOutlined />,  C: Step4 },
  { title: "Suivi",        desc: "Efficacité",      icon: <AuditOutlined />,       C: Step5 },
  { title: "Décision",     desc: "Finale",          icon: <CheckCircleOutlined />, C: Step6 },
];

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
    Steps:  { colorPrimary: "#1e3a5f" },
    Button: { primaryColor: "#ffffff", colorPrimary: "#1e3a5f" },
    Radio:  { buttonSolidCheckedBg: "#1e3a5f" },
  },
};

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   Works for both routes:
     /supplier-ncf/create      → id param is undefined → create mode
     /supplier-ncf/:id/edit    → id param is present   → edit mode
   ══════════════════════════════════════════════════════════════ */
export default function NcfForm() {
  const { id } = useParams();            // undefined on create route
  const navigate = useNavigate();

  const [form] = Form.useForm();

  /* ── Edit-mode bootstrap ── */
  const [fetching, setFetching]   = useState(!!id);   // show spinner while loading record
  const [editingId, setEditingId] = useState(id ?? null);
  const [savedRef, setSavedRef]   = useState("");
  const [current, setCurrent]     = useState(0);
  const [saving, setSaving]       = useState(false);
  const [done, setDone]           = useState(false);

  /* Fetch record when in edit mode */
  useEffect(() => {
    if (!id) return;
    setFetching(true);
    api.get(`/ncf/${id}`)
      .then(({ data: res }) => {
        const record = res.data || res;
        form.setFieldsValue(toFormValues(record));
        setSavedRef(record.reference ?? "");
        setCurrent(Math.max(0, (record.current_step || 1) - 1));
      })
      .catch(() => {
        message.error("Impossible de charger la fiche");
        navigate("/supplier-ncf");
      })
      .finally(() => setFetching(false));
  }, [id]);  // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Save step ── */
  const handleNext = useCallback(async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const payload = toPayload(values);
      const step = current + 1;

      if (step === 1 && !editingId) {
        // First step of a brand-new record
        const { data: res } = await api.post("/ncf", payload);
        const created = res.data || res;
        setEditingId(created.id);
        setSavedRef(created.reference);
        message.success(`Fiche ${created.reference} créée`);
      } else {
        await api.put(`/ncf/${editingId}/step/${step}`, payload);
        message.success(`Étape ${step} enregistrée`);
      }

      if (current < STEPS.length - 1) {
        setCurrent((c) => c + 1);
      } else {
        setDone(true);
      }
    } catch (err) {
      if (err?.response?.data?.errors) {
        form.setFields(
          Object.entries(err.response.data.errors).map(([name, messages]) => ({
            name,
            errors: Array.isArray(messages) ? messages : [messages],
          }))
        );
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

  const goBack = () => navigate("/supplier-ncf");

  /* ── Loading screen (edit fetch) ── */
  if (fetching) {
    return (
      <ConfigProvider theme={THEME}>
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: "linear-gradient(160deg, #f0f4f8, #e2e8f0)" }}
        >
          <Spin indicator={<LoadingOutlined style={{ fontSize: 36, color: "#1e3a5f" }} />} />
        </div>
      </ConfigProvider>
    );
  }

  /* ── Completed screen ── */
  if (done) {
    return (
      <ConfigProvider theme={THEME}>
        <div
          className="min-h-screen flex items-center justify-center p-4"
          style={{ background: "linear-gradient(160deg, #f0f4f8, #e2e8f0)" }}
        >
          <Card style={{ borderRadius: 20, maxWidth: 480, width: "100%" }}>
            <Result
              status="success"
              title="Fiche NCF Enregistrée"
              subTitle={savedRef ? `Référence : ${savedRef}` : "Fiche mise à jour avec succès"}
              extra={
                <Space>
                  <Button size="large" onClick={goBack} icon={<UnorderedListOutlined />}>
                    Liste
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      form.resetFields();
                      setCurrent(0);
                      setEditingId(null);
                      setSavedRef("");
                      setDone(false);
                      navigate("/supplier-ncf/create");
                    }}
                  >
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

  /* ── Form page ── */
  const { C } = STEPS[current];

  return (
    <ConfigProvider theme={THEME}>
      <div
        className="min-h-screen p-3 md:p-8"
        style={{ background: "linear-gradient(160deg, #f0f4f8, #e2e8f0)" }}
      >
        <div className="max-w-5xl mx-auto">


          {/* Page title */}
          <div className="flex items-center mb-4 gap-2">
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: "#1e3a5f" }}
            >
              Fiche NC Fournisseur
            </h1>


            <div
              className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-[12px] font-semibold uppercase"
              style={{ background: "#1e3a5f", color: "#fff" }}
            >
              <FileTextOutlined />
              {editingId ? `Modifier — ${savedRef || `#${editingId}`}` : "Nouvelle fiche"}
            </div>
            
          </div>

          {/* Stepper */}
          <div className="mb-5 overflow-x-auto pb-2">
            <Steps
              current={current}
              size="small"
              className="min-w-[700px]"
              onChange={(v) => { if (v < current) setCurrent(v); }}
            >
              {STEPS.map((s, i) => (
                <Steps.Step
                  key={i}
                  title={<span className="text-xs font-medium">{s.title}</span>}
                  description={<span className="text-xs">{s.desc}</span>}
                  icon={
                    <div
                      className="flex items-center justify-center w-8 h-8 rounded-full text-sm"
                      style={{
                        background: i <= current ? "#1e3a5f" : "#e2e8f0",
                        color: i <= current ? "#fff" : "#94a3b8",
                        transition: "all 0.3s",
                      }}
                    >
                      {i < current ? <CheckOutlined /> : s.icon}
                    </div>
                  }
                />
              ))}
            </Steps>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1 rounded-full mb-6" style={{ background: "#e2e8f0" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${((current + 1) / STEPS.length) * 100}%`,
                background: "linear-gradient(90deg, #1e3a5f, #2d5a8e)",
              }}
            />
          </div>

          {/* Form card */}
          <Card style={{ borderRadius: 16, border: "1px solid #e8edf2" }}>
            {/* Card header */}
            <div
              className="flex items-center gap-3 mb-5 pb-4"
              style={{ borderBottom: "2px solid #f1f5f9" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{ background: "#eef2f7", color: "#1e3a5f" }}
              >
                {STEPS[current].icon}
              </div>
              <div>
                <h2 className="text-base font-bold m-0" style={{ color: "#1e3a5f" }}>
                  {STEPS[current].title}
                </h2>
                <span className="text-xs" style={{ color: "#94a3b8" }}>
                  Étape {current + 1}/{STEPS.length}
                </span>
              </div>
            </div>

            {/* Fields */}
            <Form form={form} layout="vertical" requiredMark="optional" size="middle">
              <C form={form} />
            </Form>

            {/* Navigation */}
            <div
              className="flex justify-between mt-8 pt-5"
              style={{ borderTop: "2px solid #f1f5f9" }}
            >
              <Button
                size="large"
                disabled={current === 0}
                onClick={() => setCurrent((c) => c - 1)}
                icon={<ArrowLeftOutlined />}
                style={{ borderRadius: 10 }}
              >
                Précédent
              </Button>
              <Button
                type="primary"
                size="large"
                loading={saving}
                onClick={handleNext}
                style={{ borderRadius: 10, minWidth: 160 }}
              >
                {current === STEPS.length - 1 ? (
                  <span className="flex items-center gap-2">
                    <CheckCircleOutlined /> Valider &amp; Clôturer
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Suivant <ArrowRightOutlined />
                  </span>
                )}
              </Button>
            </div>
          </Card>

        </div>
      </div>
    </ConfigProvider>
  );
}