import {
  Collapse,
  message,
  Modal,
  Space,
  Skeleton,
  Popconfirm,
  Empty,
} from "antd";
import { api } from "../../utils/api";
import { useEffect, useState, useCallback } from "react";
import PaletteArticleCard from "./PaletteArticleCard";
import ArticlesSelect from "./ArticlesSelect";
import { Plus, Trash } from "lucide-react";

const EmplacementModal = ({
  selectedEmplacement,
  setSelectedEmplacement,
  inventory_id,
}) => {
  const [emplacement, setEmplacement] = useState(null);
  const [palettes, setPalettes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [articleId, setArticleId] = useState(null);

  const getEmplacement = useCallback(async () => {
    if (!selectedEmplacement) return;

    setLoading(true);
    try {
      const url = inventory_id
        ? `emplacement/${selectedEmplacement}/inventory/${inventory_id}`
        : `emplacement/${selectedEmplacement}`;

      const response = await api.get(url);
      setEmplacement(response.data);
      setPalettes(response?.data?.palettes || []);
    } catch (error) {
      message.error(error?.response?.data?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }, [selectedEmplacement, inventory_id]);

  useEffect(() => {
    if (selectedEmplacement) {
      setEmplacement(null);
      getEmplacement();
    }
  }, [selectedEmplacement, getEmplacement]);

  const handleCancel = () => {
    setSelectedEmplacement(null);
    setArticleId(null);
  };

  const handleDelete = async (palette_code) => {
    try {
      await api.delete(`palettes/${palette_code}`);
      setPalettes((prev) => prev.filter((p) => p.code !== palette_code));
      message.success("Palette supprimée");
    } catch {
      message.error("Erreur");
    }
  };

  const handleAddArticle = async (palette_code) => {
    if (!articleId) {
      message.warning("Veuillez sélectionner un article");
      return;
    }

    try {
      await api.post(`palettes/${palette_code}/add-article`, {
        article_stock_id: articleId,
      });

      message.success("Article ajouté");
      setArticleId(null);
      getEmplacement();
    } catch (error) {
      message.error(error?.response?.data?.message || "Erreur");
    }
  };

  return (
    <Modal
      title={`Emplacement ${selectedEmplacement}`}
      open={!!selectedEmplacement}
      onCancel={handleCancel}
      centered
      maskClosable={false}
      onOk={handleCancel}
      cancelText="Annuler"
      width="70%"
    >
      {loading ? (
        <Skeleton active />
      ) : (
        <Space direction="vertical" className="w-full">
          {palettes.length === 0 ? (
            <Empty description="Aucune palette trouvée" />
          ) : (
            palettes.map((palette) => (
              <Collapse
                key={palette.code}
                items={[
                  {
                    key: palette.code,
                    label: (
                      <div className="flex justify-between items-center w-full">
                        <span className="font-semibold">{palette.code}</span>

                        <div className="flex items-center gap-3">
                          <Popconfirm
                            title="Ajouter un article"
                            okText="Ajouter"
                            cancelText="Annuler"
                            style={{width:600}}
                            description={
                              <ArticlesSelect
                                value={articleId}
                                onChange={setArticleId}
                              />
                            }
                            onConfirm={() =>
                              handleAddArticle(palette.code)
                            }
                            onCancel={() => setArticleId(null)}
                          >
                            <button className="text-green-600 bg-green-100 border border-green-200 p-1.5 rounded-full">
                              <Plus size={14} />
                            </button>
                          </Popconfirm>

                          <Popconfirm
                            title="Supprimer cette palette ?"
                            okText="Oui"
                            cancelText="Non"
                            onConfirm={() => handleDelete(palette.code)}
                          >
                            <button className="text-red-600 bg-red-100 border border-red-200 p-1.5 rounded-full">
                              <Trash size={14} />
                            </button>
                          </Popconfirm>
                        </div>
                      </div>
                    ),
                    children: (
                      <PaletteArticleCard
                        palette={palette}
                        inventory_id={inventory_id}
                      />
                    ),
                  },
                ]}
              />
            ))
          )}
        </Space>
      )}
    </Modal>
  );
};

export default EmplacementModal;