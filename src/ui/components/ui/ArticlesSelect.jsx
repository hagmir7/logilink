import React, { useEffect, useRef, useState } from "react";
import { Select, Spin } from "antd";
import { api } from "../../utils/api";

const { Option } = Select;

export default function ArticlesSelect({
  value,
  onChange,
  placeholder = "Rechercher un article",
  debounceTime = 500,
  style = { width: "100%" },
}) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  const fetchArticles = async (search = "") => {
    setLoading(true);
    try {
      const { data } = await api.get("articles/list", {
        params: { search },
      });

      setArticles(data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchArticles(value);
    }, debounceTime);
  };

  useEffect(() => {
    fetchArticles();

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <Select
      showSearch
      allowClear
      value={value}
      placeholder={placeholder}
      style={style}
      filterOption={false}
      onSearch={handleSearch}
      onChange={onChange}
      notFoundContent={loading ? <Spin size="small" /> : "Aucun article"}
    >
      {articles.map((article) => (
        <Option key={article.id} value={article.id}>
          <strong>{article.code}</strong> — {article.description}
        </Option>
      ))}
    </Select>
  );
}
