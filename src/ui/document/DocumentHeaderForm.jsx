import { Button, DatePicker, Input, Select } from 'antd';
import React, { useEffect, useState } from 'react';

import {
  CalendarOutlined,
  DownOutlined,
} from "@ant-design/icons";
import axios from 'axios';

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const dateValue = dayjs("140223", "DDMMYY");


function LabeledField({ label, children, labelWidth = 96 }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="text-[12px] text-gray-700 text-right shrink-0 whitespace-nowrap"
        style={{ width: labelWidth }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

// `onValidate` is called with the full form snapshot whenever the user
// clicks "Valider" or presses Enter in the "Port" field.
export default function DocumentHeaderForm({ onValidate }) {

    const [clientOptions, setClientOptions] = useState([]);
    const [expeditionOptions, setExpeditionOptions] = useState([]);

    // --- controlled form state -------------------------------------------------
    const [client, setClient] = useState(null);
    const [affaire, setAffaire] = useState(null);
    const [expedition, setExpedition] = useState(null);
    const [date, setDate] = useState(dateValue);
    const [dateLivraisonStatut, setDateLivraisonStatut] = useState("Prévue");
    const [dateLivraison, setDateLivraison] = useState(dateValue);
    const [representant, setRepresentant] = useState(null);
    const [nExpedition, setNExpedition] = useState("");
    const [nDocumentSouche, setNDocumentSouche] = useState("");
    const [nDocumentNumero] = useState("23DE000438"); 
    const [reference, setReference] = useState("");
    const [type, setType] = useState(null);
    const [port, setPort] = useState("");
    // -----------------------------------------------------------------------------

    const getClinetOptions = async () => {
        try {
            const response = await axios.get('https://localhost:7244/clients?max=1000');      
            setClientOptions(response.data.map(client => ({
                value: client.intitule,
                label: client.code + " " + client.intitule
            })));
        } catch (error) {
            console.error("API Error:", error);
        }
    }

    const getExpeditionOptions = async () => {
        try {
            const response = await axios.get('https://localhost:7244/expeditions');
            setExpeditionOptions(response.data.map(expedition => ({
                value: expedition,
                label: expedition
            })));
        } catch (error) {
            console.error("API Error:", error);
        }
    }

    useEffect(() => {
        getClinetOptions();
        getExpeditionOptions();
    }, []);

    // Builds the payload and hands it off to the parent component.
    const handleValidate = () => {
        const formData = {
            clientCode: client,
            referenc:reference,
            dateLivraison:  dateLivraison ? dateLivraison.format("DDMMYY") : null,
            type,
            affaire,
            expedition,
            date: date ? date.format("DDMMYY") : null,
            dateLivraisonStatut,
            representant,
            nExpedition,
            nDocument: {
                souche: nDocumentSouche,
                numero: nDocumentNumero,
            },
            
            port,
        };

        if (typeof onValidate === "function") {
            onValidate(formData);
        } else {
            console.warn("DocumentHeaderForm: no onValidate handler provided", formData);
        }
    };

  return (

      <div className="shrink-0 bg-[#f0f0f0] px-3 py-3 grid grid-cols-3 gap-x-6 gap-y-2 border-b border-gray-300">
        {/* Column 1 */}
        <div className="flex flex-col gap-2">
          <LabeledField label="Client">
            <span className="text-[12px] text-blue-700 underline w-14 shrink-0">
              Numéro
            </span>
            <Select
                size="small"
                className="flex-1 max-w-full"
                suffixIcon={<DownOutlined style={{ fontSize: 9 }} />}
                options={clientOptions}
                value={client}
                onChange={setClient}
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) =>
                    option?.label?.toLowerCase().includes(input.toLowerCase())
                }
            />
          </LabeledField>
          <LabeledField label="Statut">
            <Select
              size="small"
              value="Archivé"
              className="w-32"
              suffixIcon={<DownOutlined style={{ fontSize: 9 }} />}
              options={[{ value: "Archivé", label: "Archivé" }]}
            />
            <Select size="small" disabled className="flex-1" />
          </LabeledField>
          <LabeledField label="Affaire">
            <Select
              size="small"
              className="flex-1"
              value={affaire}
              onChange={setAffaire}
            />
          </LabeledField>


          <LabeledField label="Expédition">
            <Select
              size="small"
              className="flex-1"
              suffixIcon={<DownOutlined style={{ fontSize: 9 }} />}
              options={expeditionOptions}
              value={expedition}
              onChange={setExpedition}
            />
          </LabeledField>
        </div>

        {/* Column 2 */}
          <div className="flex flex-col gap-2">

              <LabeledField label="Date" labelWidth={70}>
                  <DatePicker
                      size="small"
                      value={date}
                      onChange={setDate}
                      format="DDMMYY"
                      className='w-full'
                      allowClear={false}
                  />
              </LabeledField>

              <LabeledField label="Date livraison" labelWidth={70}>
                  <Select
                      size="small"
                      value={dateLivraisonStatut}
                      onChange={setDateLivraisonStatut}
                      className="w-24"
                      suffixIcon={<DownOutlined style={{ fontSize: 9 }} />}
                      options={[{ value: "Prévue", label: "Prévue" }]}
                  />
                  <DatePicker
                      size="small"
                      value={dateLivraison}
                      onChange={setDateLivraison}
                      format="DDMMYY"
                      className='w-full'
                      allowClear={false}
                  />
              </LabeledField>


              <LabeledField label="Représentant" labelWidth={70}>
                  <Select
                    size="small"
                    className="flex-1"
                    value={representant}
                    onChange={setRepresentant}
                  />
              </LabeledField>


              <LabeledField label="N° Expédition" labelWidth={70}>
                  <Input
                    size="small"
                    className="flex-1"
                    value={nExpedition}
                    onChange={(e) => setNExpedition(e.target.value)}
                  />
              </LabeledField>
          </div>

        {/* Column 3 */}
        <div className="flex flex-col gap-2">
          <LabeledField label="N° document" labelWidth={80}>
            <Select
              size="small"
              value={nDocumentSouche}
              onChange={setNDocumentSouche}
              className="w-28"
              suffixIcon={<DownOutlined style={{ fontSize: 9 }} />}
              options={[{ value: "Souche A", label: "Souche A" }]}
            />
            <Input size="small" disabled value={nDocumentNumero} className="flex-1" />
          </LabeledField>
          <LabeledField label="Référence" labelWidth={80}>
            <Input
              size="small"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="flex-1"
            />
          </LabeledField>
          <LabeledField label="Type" labelWidth={80}>
             <Select
              size="small"
              className="w-full"
              suffixIcon={<DownOutlined style={{ fontSize: 9 }} />}
              value={type}
              onChange={setType}
              options={[
                { value: "Cuisine", label: "Cuisine" },
                { value: "Placard", label: "Placard" },
                { value: "Laca", label: "Laca" },
                { value: "Stock", label: "Stock" },
                { value: "Polilaminado", label: "Polilaminado" },
                { value: "Parquet", label: "Parquet" },
            ]}
            />
          </LabeledField>
          <LabeledField label="Port" labelWidth={80}>
            <Input
              size="small"
              className="flex-1"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              onPressEnter={handleValidate}
            />
            <Button
              size="small"
              type="primary"
              ghost
              className="!border-blue-400 !text-blue-600"
              onClick={handleValidate}
            >
              Valider
            </Button>
          </LabeledField>
        </div>
      </div>

  )
}