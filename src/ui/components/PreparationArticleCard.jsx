import React from "react";
import { Button, Tag, Spin } from "antd";

const PreparationArticleCard = ({
  item,
  index,
  isElectron = false,
  loadingId = null,
  onPrepare
}) => {
  const isDisabled = item.line.next_role_id == "4";
  const isLoading = loadingId === item.line.id;

  const getProductName = () =>
    [item?.Nom, item.article?.Nom, item?.DL_Design].find(v => v && v !== "NULL") ||
    "Non spécifié";

  const getQuantityTagColor = () =>
    item.DL_QteBL == Math.floor(item.DL_Qte) ? "green" : "red";

  const getDimension = field =>
    item[field] > 0
      ? Math.floor(item[field])
      : item?.article?.[field]
      ? Math.floor(item.article[field])
      : "N/A";

  // 🔥 Only difference
  const titleText = isElectron ? "text-2xl" : "text-lg"; // smaller only
  const baseFont = isElectron ? "text-base" : "text-sm"; // general size
  const tagStyle = {
    fontSize: isElectron ? "18px" : "14px",
    padding: isElectron ? "8px 16px" : "5px 10px",
    fontWeight: 600
  };

  return (
    <div
      key={index}
      className={`bg-white border border-gray-300 rounded-lg shadow-sm  transition-shadow duration-200 mb-4 
      ${isElectron ? "p-6 rounded-xl" : "p-2"} 
      ${isDisabled ? "opacity-50 pointer-events-none" : ""}`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h3 className={`${titleText} font-semibold text-gray-900 leading-tight`}>
          {getProductName()} {item?.Description} {item?.Poignee}
        </h3>

        {/* <Button
          key={item.line.id}
          onClick={() => onPrepare(item.line.id)}
          style={
            isElectron
              ? { fontSize: "18px", height: "52px", borderRadius: "8px" }
              : { fontSize: "14px", height: "40px" }
          }
          disabled={isLoading}
          color={item.line.status.color}
        >
          {isLoading ? (
            <>
              <Spin size="small" style={{ marginRight: 8 }} /> Préparation...
            </>
          ) : (
            item.line?.status?.name
          )}
        </Button> */}
      </div>

      {/* Reference */}
      <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
        <div className="flex flex-col gap-1">
          <span className={`${baseFont} text-gray-500 uppercase tracking-wide font-medium`}>
            Référence
          </span>
          <span className={`${isElectron ? "text-lg" : "text-sm"} font-semibold text-gray-900`}>
            {item.AR_Ref || "N/A"}
          </span>
        </div>

        <div className="flex gap-2">
          <Tag color={getQuantityTagColor()} style={tagStyle}>
            {Math.floor(item.DL_QteBL)}
          </Tag>
          <Tag color={item.line.status.color} style={tagStyle}>
            {item.line?.status?.name}
          </Tag>
          <Tag color="blue" style={tagStyle}>
            {Math.floor(item.EU_Qte || 0)}
            <small>
              {item.EU_Qte !== item.DL_Qte ? ` (${Math.floor(item.DL_Qte)}m)` : ""}
            </small>
          </Tag>
        </div>
      </div>

      {/* Dimensions */}
      <div className={`grid grid-cols-4 gap-3 ${baseFont}`}>
        <div className="bg-gray-50 rounded-md p-2 border border-gray-100">
          <div className="text-gray-500 font-medium mb-1">Hauteur</div>
          <div className="font-bold text-gray-900">{getDimension("Hauteur")}</div>
        </div>
        <div className="bg-gray-50 rounded-md p-2 border border-gray-100">
          <div className="text-gray-500 font-medium mb-1">Largeur</div>
          <div className="font-bold text-gray-900">{getDimension("Largeur")}</div>
        </div>
        <div className="bg-gray-50 rounded-md p-2 border border-gray-100">
          <div className="text-gray-500 font-medium mb-1">Profondeur</div>
          <div className="font-bold text-gray-900">
            {item.Profondeur ? Math.floor(item.Profondeur) : Math.floor(item.article?.Profonduer) || "N/A"}
          </div>
        </div>
        <div className="bg-gray-50 rounded-md p-2 border border-gray-100">
          <div className="text-gray-500 font-medium mb-1">Épaisseur</div>
          <div className="font-bold text-gray-900">
            {item.Episseur ? Math.floor(item.Episseur) : Math.floor(item.article?.Episseur) || "N/A"}
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className={`grid grid-cols-2 gap-3 mt-4 ${baseFont}`}>
        <div className="bg-gray-50 rounded-md p-2 border border-gray-100">
          <div className="text-gray-500 font-medium mb-1">Couleur</div>
          <div className="font-bold text-gray-900">
            {item.article?.Couleur || item.Couleur || "N/A"}
          </div>
        </div>
        <div className="bg-gray-50 rounded-md p-2 border border-gray-100">
          <div className="text-gray-500 font-medium mb-1">Chant</div>
          <div className="font-bold text-gray-900">
            {item.article?.Chant || item.Chant || "N/A"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreparationArticleCard;
