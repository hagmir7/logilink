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
  Upload,
  Space,
  Result,
} from "antd";
import {
  FileTextOutlined,
  SearchOutlined,
  ToolOutlined,
  ExperimentOutlined,
  AuditOutlined,
  CheckCircleOutlined,
  UploadOutlined,
  PlusOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;
const { Step } = Steps;

/* ─── API helper (adjust baseURL to your Laravel backend) ─── */
const API = "http://localhost:8000/api/ncf";

const api = async (url, opts = {}) => {
  const res = await fetch(`${API}${url}`, {
    headers: { "Content-Type": "application/json", Accept: "application/json", ...opts.headers },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json();
    throw err;
  }
  return res.json();
};

/* ─── Constants ─── */
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

const DECISION_PROV_OPTIONS = [
  { value: "accepte", label: "Accepté" },
  { value: "accepte_sous_reserve", label: "Accepté sous réserve" },
  { value: "refuse_retour", label: "Refusé / Retour fournisseur" },
];

const DECISION_FINALE_OPTIONS = [
  { value: "accepte_apres_correction", label: "Accepté après correction" },
  { value: "refuse_definitivement", label: "Refusé définitivement" },
  { value: "accepte_avec_derogation", label: "Accepté avec dérogation" },
];

/* ─── Step Components ─── */

const Step1GeneralInfo = ({ form }) => {
  const detecteePar = Form.useWatch("detectee_par", form);

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
      <Form.Item label="Quantité réceptionnée" name="quantite_receptionnee" rules={[{ required: true }]}>
        <InputNumber className="w-full" min={0} />
      </Form.Item>
      <Form.Item label="Quantité non conforme" name="quantite_non_conforme" rules={[{ required: true }]}>
        <InputNumber className="w-full" min={0} />
      </Form.Item>
      <Form.Item label="Détectée par" name="detectee_par" rules={[{ required: true }]}>
        <Select options={DETECTION_OPTIONS} placeholder="Sélectionner" />
      </Form.Item>
      {detecteePar === "autre" && (
        <Form.Item label="Préciser" name="detectee_par_autre" rules={[{ required: true, message: "Requis" }]}>
          <Input placeholder="Préciser..." />
        </Form.Item>
      )}
      <Form.Item label="Date de détection" name="date_detection" rules={[{ required: true }]}>
        <DatePicker className="w-full" format="DD/MM/YYYY" />
      </Form.Item>
    </div>
  );
};

const Step2Description = ({ form }) => {
  const typesEcart = Form.useWatch("types_ecart", form) || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
      <Form.Item label="Nature de la NC" name="nature_nc" rules={[{ required: true }]}>
        <Radio.Group>
          {NATURE_OPTIONS.map((o) => (
            <Radio.Button key={o.value} value={o.value}>{o.label}</Radio.Button>
          ))}
        </Radio.Group>
      </Form.Item>
      <Form.Item label="Type d'écart constaté" name="types_ecart" rules={[{ required: true, message: "Au moins un type" }]} className="md:col-span-2">
        <Checkbox.Group>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {ECART_OPTIONS.map((o) => (
              <Checkbox key={o.value} value={o.value}>{o.label}</Checkbox>
            ))}
          </div>
        </Checkbox.Group>
      </Form.Item>
      {typesEcart.includes("autre") && (
        <Form.Item label="Préciser l'écart" name="type_ecart_autre" rules={[{ required: true }]}>
          <Input placeholder="Autre écart..." />
        </Form.Item>
      )}
      <Form.Item label="Description détaillée" name="description_detaillee" rules={[{ required: true }]} className="md:col-span-2">
        <TextArea rows={4} placeholder="Décrire la non-conformité en détail..." />
      </Form.Item>
      <Form.Item label="Preuves / photos jointes" name="preuves_jointes" valuePropName="checked">
        <Checkbox>Oui, preuves jointes</Checkbox>
      </Form.Item>
      <Form.Item label="Réf. lot / série" name="reference_lot">
        <Input placeholder="Référence lot" />
      </Form.Item>
      <Form.Item label="Gravité estimée" name="gravite" rules={[{ required: true }]}>
        <Radio.Group>
          {GRAVITE_OPTIONS.map((o) => (
            <Radio.Button key={o.value} value={o.value}>
              <Tag color={o.color} className="m-0 border-0">{o.label}</Tag>
            </Radio.Button>
          ))}
        </Radio.Group>
      </Form.Item>
    </div>
  );
};

const Step3Treatment = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
    <Form.Item label="Décision provisoire" name="decision_provisoire" rules={[{ required: true }]} className="md:col-span-2">
      <Radio.Group>
        {DECISION_PROV_OPTIONS.map((o) => (
          <Radio.Button key={o.value} value={o.value}>{o.label}</Radio.Button>
        ))}
      </Radio.Group>
    </Form.Item>
    <Form.Item label="Mesures immédiates prises" name="mesures_immediates" rules={[{ required: true }]} className="md:col-span-2">
      <TextArea rows={4} placeholder="Décrire les mesures prises..." />
    </Form.Item>
    <Form.Item label="Responsable de l'action" name="responsable_action" rules={[{ required: true }]}>
      <Input placeholder="Nom & prénom" />
    </Form.Item>
    <Form.Item label="Date d'exécution" name="date_execution" rules={[{ required: true }]}>
      <DatePicker className="w-full" format="DD/MM/YYYY" />
    </Form.Item>
  </div>
);

const Step4Analysis = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
    <Form.Item label="Analyse des causes probables" name="causes_probables" rules={[{ required: true }]} className="md:col-span-2">
      <TextArea rows={3} placeholder="Identifier les causes probables..." />
    </Form.Item>
    <Form.Item label="Cause principale identifiée" name="cause_principale" rules={[{ required: true }]} className="md:col-span-2">
      <TextArea rows={3} placeholder="Cause racine..." />
    </Form.Item>
    <Form.Item label="Proposition d'action corrective" name="action_corrective" rules={[{ required: true }]} className="md:col-span-2">
      <TextArea rows={3} placeholder="Actions correctives proposées..." />
    </Form.Item>
    <Form.Item label="Responsable de l'action" name="responsable_action_corrective" rules={[{ required: true }]}>
      <Input placeholder="Nom & prénom" />
    </Form.Item>
    <Form.Item label="Date prévisionnelle" name="date_previsionnelle" rules={[{ required: true }]}>
      <DatePicker className="w-full" format="DD/MM/YYYY" />
    </Form.Item>
  </div>
);

const Step5Followup = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
    <Form.Item label="Responsable du suivi" name="responsable_suivi" rules={[{ required: true }]}>
      <Input placeholder="Nom & prénom" />
    </Form.Item>
    <Form.Item label="Date de vérification" name="date_verification" rules={[{ required: true }]}>
      <DatePicker className="w-full" format="DD/MM/YYYY" />
    </Form.Item>
    <Form.Item label="Action réalisée ?" name="action_realisee" rules={[{ required: true }]}>
      <Radio.Group>
        <Radio.Button value={true}>Oui</Radio.Button>
        <Radio.Button value={false}>Non</Radio.Button>
      </Radio.Group>
    </Form.Item>
    <Form.Item label="Action efficace ?" name="action_efficace" rules={[{ required: true }]}>
      <Radio.Group>
        <Radio.Button value={true}>Oui</Radio.Button>
        <Radio.Button value={false}>Non</Radio.Button>
      </Radio.Group>
    </Form.Item>
    <Form.Item label="N° FNC (si récurrence)" name="fnc_reference">
      <Input placeholder="Réf. FNC liée" />
    </Form.Item>
    <Form.Item label="Date de clôture" name="date_cloture">
      <DatePicker className="w-full" format="DD/MM/YYYY" />
    </Form.Item>
  </div>
);

const Step6Decision = () => (
  <div className="space-y-6">
    <Form.Item label="Décision finale" name="decision_finale" rules={[{ required: true }]}>
      <Radio.Group>
        {DECISION_FINALE_OPTIONS.map((o) => (
          <Radio.Button key={o.value} value={o.value}>{o.label}</Radio.Button>
        ))}
      </Radio.Group>
    </Form.Item>

    <Divider orientation="left" className="text-sm">Signatures</Divider>

    <Form.List name="signatures" initialValue={[{ entite: "achats" }, { entite: "direction" }]}>
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, ...rest }) => (
            <div key={key} className="grid grid-cols-1 md:grid-cols-4 gap-x-4 items-start p-4 rounded-lg bg-slate-50 mb-3">
              <Form.Item {...rest} name={[name, "entite"]} label="Entité" rules={[{ required: true }]}>
                <Select options={[
                  { value: "achats", label: "Achats" },
                  { value: "direction", label: "Direction" },
                ]} />
              </Form.Item>
              <Form.Item {...rest} name={[name, "nom_prenom"]} label="Nom & Prénom" rules={[{ required: true }]}>
                <Input placeholder="Nom complet" />
              </Form.Item>
              <Form.Item {...rest} name={[name, "date"]} label="Date" rules={[{ required: true }]}>
                <DatePicker className="w-full" format="DD/MM/YYYY" />
              </Form.Item>
              <div className="flex items-end gap-2">
                <Form.Item {...rest} name={[name, "visa"]} label="Visa" className="flex-1">
                  <Input placeholder="Visa" />
                </Form.Item>
                {fields.length > 1 && (
                  <Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => remove(name)} className="mb-6" />
                )}
              </div>
            </div>
          ))}
          <Button type="dashed" onClick={() => add({ entite: "achats" })} icon={<PlusOutlined />} block>
            Ajouter un signataire
          </Button>
        </>
      )}
    </Form.List>
  </div>
);

/* ─── Steps Configuration ─── */
const STEPS = [
  { title: "Informations", icon: <FileTextOutlined />, component: Step1GeneralInfo },
  { title: "Description NC", icon: <SearchOutlined />, component: Step2Description },
  { title: "Traitement", icon: <ToolOutlined />, component: Step3Treatment },
  { title: "Analyse", icon: <ExperimentOutlined />, component: Step4Analysis },
  { title: "Suivi", icon: <AuditOutlined />, component: Step5Followup },
  { title: "Décision", icon: <CheckCircleOutlined />, component: Step6Decision },
];

/* ─── Main Component ─── */
export default function NcfStepForm() {
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [ncfId, setNcfId] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [savedRef, setSavedRef] = useState("");

  const formatPayload = (values) => {
    const formatted = { ...values };
    // Convert dayjs dates to ISO strings
    Object.keys(formatted).forEach((key) => {
      if (formatted[key]?.format) formatted[key] = formatted[key].format("YYYY-MM-DD");
      if (key === "signatures" && Array.isArray(formatted[key])) {
        formatted[key] = formatted[key].map((s) => ({
          ...s,
          date: s.date?.format ? s.date.format("YYYY-MM-DD") : s.date,
        }));
      }
    });
    return formatted;
  };

  const handleNext = useCallback(async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const payload = formatPayload(values);
      const step = current + 1;

      if (step === 1) {
        const data = await api("/", { method: "POST", body: JSON.stringify(payload) });
        setNcfId(data.id);
        setSavedRef(data.reference);
      } else {
        await api(`/${ncfId}/step/${step}`, { method: "PUT", body: JSON.stringify(payload) });
      }

      if (current < STEPS.length - 1) {
        setCurrent(current + 1);
      } else {
        setCompleted(true);
      }

      message.success(`Étape ${step} enregistrée`);
    } catch (err) {
      if (err?.errors) {
        message.error("Veuillez corriger les erreurs de validation");
      }
    } finally {
      setLoading(false);
    }
  }, [current, form, ncfId]);

  const handlePrev = () => setCurrent(current - 1);

  const handleReset = () => {
    form.resetFields();
    setCurrent(0);
    setNcfId(null);
    setCompleted(false);
    setSavedRef("");
  };

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg rounded-2xl">
          <Result
            status="success"
            title="Fiche NC Fournisseur Complétée"
            subTitle={`Référence : ${savedRef}`}
            extra={<Button type="primary" onClick={handleReset}>Nouvelle Fiche</Button>}
          />
        </Card>
      </div>
    );
  }

  const StepComponent = STEPS[current].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
            Fiche NC Fournisseur
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {savedRef ? `Réf. ${savedRef}` : "Nouvelle fiche de non-conformité"}
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8 overflow-x-auto">
          <Steps current={current} size="small" className="min-w-[600px]">
            {STEPS.map((s, i) => (
              <Step key={i} title={s.title} icon={s.icon} />
            ))}
          </Steps>
        </div>

        {/* Form Card */}
        <Card className=" rounded-2xl border-0">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-700">{STEPS[current].title}</h2>
          </div>

          <Form form={form} layout="vertical" requiredMark="optional" className="mt-2">
            <StepComponent form={form} />
          </Form>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-4 border-t border-slate-100">
            <Button disabled={current === 0} onClick={handlePrev}>
              Précédent
            </Button>
            <Button type="primary" loading={loading} onClick={handleNext}>
              {current === STEPS.length - 1 ? "Valider & Clôturer" : "Suivant"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
