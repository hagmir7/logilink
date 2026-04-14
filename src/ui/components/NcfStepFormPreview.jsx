import { useState, useCallback } from "react";
import {
  Steps,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Radio,
  Checkbox,
  Button,
  Card,
  message,
  Tag,
  Divider,
  Result,
  ConfigProvider,
} from "antd";
import {
  FileTextOutlined,
  SearchOutlined,
  ToolOutlined,
  ExperimentOutlined,
  AuditOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;

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
const GRAVITE_OPTIONS = [
  { value: "mineure", label: "Mineure", color: "green" },
  { value: "majeure", label: "Majeure", color: "orange" },
  { value: "critique", label: "Critique", color: "red" },
];
const DECISION_PROV = [
  { value: "accepte", label: "Accepté" },
  { value: "accepte_sous_reserve", label: "Accepté sous réserve" },
  { value: "refuse_retour", label: "Refusé / Retour" },
];
const DECISION_FINALE = [
  { value: "accepte_apres_correction", label: "Accepté après correction" },
  { value: "refuse_definitivement", label: "Refusé définitivement" },
  { value: "accepte_avec_derogation", label: "Accepté avec dérogation" },
];

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
        <Radio.Group buttonStyle="solid" size="middle">
          {NATURE_OPTIONS.map((o) => <Radio.Button key={o.value} value={o.value}>{o.label}</Radio.Button>)}
        </Radio.Group>
      </Form.Item>
      <Form.Item label="Type d'écart" name="types_ecart" rules={[{ required: true }]} className="md:col-span-2">
        <Checkbox.Group>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {ECART_OPTIONS.map((o) => <Checkbox key={o.value} value={o.value}>{o.label}</Checkbox>)}
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
          {GRAVITE_OPTIONS.map((o) => (
            <Radio.Button key={o.value} value={o.value}>
              <span style={{ color: o.color === "green" ? "#389e0d" : o.color === "orange" ? "#d46b08" : "#cf1322" }}>
                {o.label}
              </span>
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
        {DECISION_PROV.map((o) => <Radio.Button key={o.value} value={o.value}>{o.label}</Radio.Button>)}
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
      <TextArea rows={3} placeholder="Causes identifiées..." />
    </Form.Item>
    <Form.Item label="Cause principale" name="cause_principale" rules={[{ required: true }]} className="md:col-span-2">
      <TextArea rows={3} placeholder="Cause racine..." />
    </Form.Item>
    <Form.Item label="Action corrective" name="action_corrective" rules={[{ required: true }]} className="md:col-span-2">
      <TextArea rows={3} placeholder="Proposition d'action..." />
    </Form.Item>
    <Form.Item label="Responsable" name="responsable_action_corrective" rules={[{ required: true }]}>
      <Input placeholder="Nom & prénom" />
    </Form.Item>
    <Form.Item label="Date prévisionnelle" name="date_previsionnelle" rules={[{ required: true }]}>
      <DatePicker className="w-full" format="DD/MM/YYYY" />
    </Form.Item>
  </div>
);

const Step5 = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
    <Form.Item label="Responsable du suivi" name="responsable_suivi" rules={[{ required: true }]}>
      <Input placeholder="Nom & prénom" />
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
    <Form.Item label="N° FNC (récurrence)" name="fnc_reference">
      <Input placeholder="Réf. FNC" />
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
        {DECISION_FINALE.map((o) => <Radio.Button key={o.value} value={o.value}>{o.label}</Radio.Button>)}
      </Radio.Group>
    </Form.Item>
    <Divider orientation="left" plain><span className="text-xs text-gray-500 uppercase tracking-wider">Signatures</span></Divider>
    <Form.List name="signatures" initialValue={[{ entite: "achats" }, { entite: "direction" }]}>
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, ...rest }) => (
            <div key={key} className="grid grid-cols-1 md:grid-cols-4 gap-x-3 items-start p-4 rounded-xl bg-gray-50 mb-3 border border-gray-100">
              <Form.Item {...rest} name={[name, "entite"]} label="Entité" rules={[{ required: true }]}>
                <Select options={[{ value: "achats", label: "Achats" }, { value: "direction", label: "Direction" }]} />
              </Form.Item>
              <Form.Item {...rest} name={[name, "nom_prenom"]} label="Nom & Prénom" rules={[{ required: true }]}>
                <Input placeholder="Nom" />
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
          <Button type="dashed" onClick={() => add({ entite: "achats" })} icon={<PlusOutlined />} block>Ajouter</Button>
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

const theme = {
  token: {
    colorPrimary: "#1e3a5f",
    borderRadius: 10,
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    colorBgContainer: "#ffffff",
  },
  components: {
    Steps: { colorPrimary: "#1e3a5f" },
    Button: { primaryColor: "#ffffff", colorPrimary: "#1e3a5f" },
    Radio: { buttonSolidCheckedBg: "#1e3a5f" },
  },
};

export default function NcfStepForm() {
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const [completed, setCompleted] = useState(false);

  const handleNext = useCallback(async () => {
    try {
      await form.validateFields();
      if (current < STEPS.length - 1) {
        setCurrent((c) => c + 1);
      } else {
        setCompleted(true);
      }
      message.success(`Étape ${current + 1} validée`);
    } catch {
      message.warning("Veuillez remplir les champs obligatoires");
    }
  }, [current, form]);

  if (completed) {
    return (
      <ConfigProvider theme={theme}>
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)" }}>
          <Card className="w-full max-w-lg" style={{ borderRadius: 16, boxShadow: "0 8px 32px rgba(30,58,95,0.08)" }}>
            <Result
              status="success"
              title="Fiche NCF Complétée"
              subTitle="NCF-2026-0001"
              extra={
                <Button type="primary" size="large" onClick={() => { form.resetFields(); setCurrent(0); setCompleted(false); }}>
                  Nouvelle Fiche
                </Button>
              }
            />
          </Card>
        </div>
      </ConfigProvider>
    );
  }

  const { C } = STEPS[current];

  return (
    <ConfigProvider theme={theme}>
      <div className="min-h-screen p-3 md:p-8" style={{ background: "linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)" }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase mb-3"
              style={{ background: "#1e3a5f", color: "#ffffff" }}>
              <FileTextOutlined /> ENR_ACH_07
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: "#1e3a5f" }}>
              Fiche NC Fournisseur
            </h1>
            <p className="text-sm mt-1" style={{ color: "#64748b" }}>Gestion des non-conformités fournisseur</p>
          </div>

          {/* Stepper */}
          <div className="mb-6 overflow-x-auto pb-2">
            <Steps current={current} size="small" className="min-w-[700px]"
              onChange={(v) => { if (v < current) setCurrent(v); }}>
              {STEPS.map((s, i) => (
                <Steps.Step key={i} title={<span className="text-xs font-medium">{s.title}</span>} description={<span className="text-xs">{s.desc}</span>} icon={
                  <div className="flex items-center justify-center w-8 h-8 rounded-full text-sm"
                    style={{
                      background: i <= current ? "#1e3a5f" : "#e2e8f0",
                      color: i <= current ? "#fff" : "#94a3b8",
                      transition: "all 0.3s",
                    }}>
                    {i < current ? <CheckOutlined /> : s.icon}
                  </div>
                } />
              ))}
            </Steps>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1 rounded-full mb-6" style={{ background: "#e2e8f0" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${((current + 1) / STEPS.length) * 100}%`, background: "linear-gradient(90deg, #1e3a5f, #2d5a8e)" }} />
          </div>

          {/* Form */}
          <Card style={{ borderRadius: 16, border: "1px solid #e8edf2" }}>
            <div className="flex items-center gap-3 mb-5 pb-4" style={{ borderBottom: "2px solid #f1f5f9" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: "#eef2f7", color: "#1e3a5f" }}>
                {STEPS[current].icon}
              </div>
              <div>
                <h2 className="text-base font-bold m-0" style={{ color: "#1e3a5f" }}>{STEPS[current].title}</h2>
                <span className="text-xs" style={{ color: "#94a3b8" }}>Étape {current + 1} / {STEPS.length}</span>
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
              <Button type="primary" size="large" onClick={handleNext}
                style={{ borderRadius: 10, minWidth: 160 }}>
                {current === STEPS.length - 1 ? (
                  <span className="flex items-center gap-2"><CheckCircleOutlined /> Valider & Clôturer</span>
                ) : (
                  <span className="flex items-center gap-2">Suivant <ArrowRightOutlined /></span>
                )}
              </Button>
            </div>
          </Card>

          <p className="text-center mt-4 text-xs" style={{ color: "#94a3b8" }}>
            Formulaire interactif — Aperçu de la digitalisation du document ENR_ACH_07
          </p>
        </div>
      </div>
    </ConfigProvider>
  );
}
