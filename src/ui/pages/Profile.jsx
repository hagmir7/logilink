import { useState, useEffect } from "react";
import { Mail, Phone, Save, Loader2, Building, User } from "lucide-react";
import { useParams } from "react-router-dom";
import { api } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";
import {
  Form,
  Input,
  Button,
  Checkbox,
  Card,
  message as antMessage,
  Spin,
  Row,
  Col,
  Typography,
  Alert,
  Tooltip,
  message,
  Select,
} from "antd";

const { Title, Text } = Typography;

export default function Profile() {
  const [userData, setUserData] = useState({
    name: "",
    full_name: "",
    email: "",
    phone: "",
    company_id: "",
    roles: [],
  });
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const { id } = useParams();
  const { roles = [], permissions } = useAuth();
  const [companies, setCompanies] = useState([]);


  const fetchCompanies = async () => {
    try {
      const response = await api.get('companies');
      setCompanies(response.data.map(c => ({
        label: c.name,
        value: c.id
      })))
    } catch (error) {
      console.error(error);
      message.error(error?.response?.data?.message || "Une erreur s'est produite")
    }
  }


  useEffect(() => {
    fetchCompanies()
    fetchUserData();
  }, [id])


  const fetchUserData = async () => {
    try {
      setLoading(true);
      const url = `user/${id || ""}`;
      const response = await api.get(url);
      const data = response.data;
      setUserRoles(data.roles);

      const userRoleNames = Array.isArray(data.user.roles)
        ? data.user.roles.map((role) => role.name.toString())
        : [];

      setUserData({
        name: data.user.name || "",
        full_name: data.user.full_name || "",
        email: data.user.email || "",
        phone: data.user.phone || "",
        roles: userRoleNames,
        company_id: data?.user?.company_id,
      });
      
    } catch (err) {
      setAlert({
        type: "error",
        message: "Impossible de charger les données du profil",
        description: err.message || "Une erreur s'est produite",
      });
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async () => {
    try {
      setLoading(true);
      const payload = { ...userData };
      const token = localStorage.getItem("authToken");
      const url = `user/update/${id || ""}`;
      await api.post(url, payload, {
        headers: {
          ContentType: "application/json",
          Authorization: "Bearer " + token,
        },
      });

      antMessage.success("Profil mis à jour avec succès !");
      setAlert(null);
    } catch (err) {
      message.error(err.response.data.message)
    } finally {
      setLoading(false);
    }
  };

  if (loading && !userData.name) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin indicator={<Loader2 className="animate-spin text-blue-500" />} />
        <span className="ml-2 text-gray-600">Chargement du profil...</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 py-2">
      <div className="max-w-5xl mx-auto ">
      <Card className="mb-6 p-2 " classNames={'p-0'}>
        <Title level={4}>Profil de {userData.full_name || "l'utilisateur"}</Title>
        <Text type="secondary">
          Gérer l'informations personnelles et préférences
        </Text>
      </Card>
      <div className="my-3"></div>

      {alert && (
        <Alert
          message={alert.message}
          description={alert.description}
          type={alert.type}
          showIcon
          className="mb-4"
        />
      )}

      <Card>
        <Form layout="vertical" onFinish={handleSubmit}>
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Nom d'utilisateur"
                required
                tooltip="Identifiant unique"
              >
                <Input
                  name="name"
                  value={userData.name}
                  onChange={(e) =>
                    setUserData({ ...userData, name: e.target.value })
                  }
                  placeholder="Ex. BonnieG"
                  prefix={<User size={16} />}
                />
              </Form.Item>

              <Form.Item label="Nom complet" required>
                <Input
                  name="full_name"
                  value={userData.full_name}
                  onChange={(e) =>
                    setUserData({ ...userData, full_name: e.target.value })
                  }
                  placeholder="Ex. Bonnie Green"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Email" required>
                <Input
                  name="email"
                  type="email"
                  value={userData.email}
                  onChange={(e) =>
                    setUserData({ ...userData, email: e.target.value })
                  }
                  prefix={<Mail size={16} />}
                  placeholder="nom@exemple.com"
                />
              </Form.Item>

              <Form.Item label="Numéro de téléphone">
                <Input
                  name="phone"
                  type="tel"
                  value={userData.phone}
                  onChange={(e) =>
                    setUserData({ ...userData, phone: e.target.value })
                  }
                  prefix={<Phone size={16} />}
                  placeholder="01-23-45-67-89"
                />
              </Form.Item>

            <Form.Item label="Société">
              <Select
                options={companies}
                value={userData.company_id ? Number(userData.company_id) : null}
                onChange={(value) =>
                  setUserData({ ...userData, company_id: value })
                }
                placeholder="Sélectionnez une société"
                suffixIcon={<Building size={16} />}
              />
            </Form.Item>
            </Col>
          </Row>

          {(permissions("view:roles") || roles("supper_admin")) && (
            <div className="mt-6">
              <div className="flex items-center mb-2">
                <Title level={5} className="!mb-0">
                  Rôles utilisateur
                </Title>
                <Tooltip title="Sélectionnez les rôles pour cet utilisateur">
                  <span className="ml-2 text-white bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center text-xs cursor-help">
                    ?
                  </span>
                </Tooltip>
              </div>

              <Checkbox.Group
                value={userData.roles}
                onChange={(checkedValues) =>
                  setUserData({ ...userData, roles: checkedValues })
                }
                style={{ width: "100%" }}
              >
                <Row gutter={[16, 12]}>
                  {userRoles.map((role) => (
                    <Col key={role.id} xs={24} sm={12} md={8}>
                      <Checkbox value={role.name}>{role.name}</Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </div>
          )}

          <div className="flex justify-end pt-6 border-t mt-8">
            <Button
              type="primary"
              htmlType="submit"
              icon={!loading && <Save size={16} />}
              loading={loading}
              className="px-6"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
    </div>
  );
}
