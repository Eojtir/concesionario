import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "../../components/ui/DataTable";
import { Modal } from "../../components/ui/Modal";
import { useAuth } from "../../context/AuthProvider";
import toast from "react-hot-toast";
import api from "../../services/api";

export const CompaniesManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({
    business_name: "",
    tax_id: "",
    address: "",
    phone: "",
    contact_email: "",
    logo_url: "",
    website: "",
    status: "active",
  });

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api_company/");
      if (res.data.success) {
        setCompanies(res.data.data);
      } else {
        toast.error("Error al cargar empresas");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== "superadmin") {
      navigate("/unauthorized");
      return;
    }
    loadCompanies();
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingCompany) {
        const res = await api.put(
          `/api_company/?id=${editingCompany.id}`,
          formData,
        );
        if (res.data.success) {
          toast.success("Empresa actualizada exitosamente");
          setModalOpen(false);
          setEditingCompany(null);
          loadCompanies();
        }
      } else {
        const res = await api.post("/api_company", formData);
        if (res.data.success) {
          toast.success("Empresa creada exitosamente");
          setModalOpen(false);
          await createDefaultExpenseCategories(res.data.data.company_id);
          loadCompanies();
        }
      }
    } catch (error) {
      toast.error("Error al guardar empresa");
    }
  };

  const createDefaultExpenseCategories = async (companyId) => {
    const categories = [
      "Mecánica",
      "Chapa y Pintura",
      "Trámites / Papelería",
      "Limpieza",
      "Repuestos",
      "Otros",
    ];
    for (const category of categories) {
      await api
        .post("/api_expense_categories", { name: category })
        .catch(() => {});
    }
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setFormData({
      business_name: company.business_name,
      tax_id: company.tax_id || "",
      address: company.address || "",
      phone: company.phone || "",
      contact_email: company.contact_email || "",
      logo_url: company.logo_url || "",
      website: company.website || "",
      status: company.status,
    });
    setModalOpen(true);
  };

  const handleToggleStatus = async (company) => {
    const newStatus = company.status === "active" ? "suspended" : "active";
    try {
      const res = await api.put(`/api_company/?id=${company.id}`, {
        ...company,
        status: newStatus,
      });
      if (res.data.success) {
        toast.success(
          `Empresa ${newStatus === "active" ? "reactivada" : "suspendida"}`,
        );
        loadCompanies();
      }
    } catch (error) {
      toast.error("Error al cambiar estado");
    }
  };

  const handleDelete = async (company) => {
    if (!window.confirm(`¿Eliminar "${company.business_name}"?`)) return;

    try {
      const res = await api.delete(`/api_company/?id=${company.id}`);
      if (res.data.success) {
        toast.success("Empresa eliminada exitosamente");
        loadCompanies();
      } else {
        toast.error(res.data.message || "No se puede eliminar");
      }
    } catch (error) {
      toast.error("Error al eliminar empresa");
    }
  };

  const handleNewCompany = () => {
    setEditingCompany(null);
    setFormData({
      business_name: "",
      tax_id: "",
      address: "",
      phone: "",
      contact_email: "",
      logo_url: "",
      website: "",
      status: "active",
    });
    setModalOpen(true);
  };

  const columns = [
    { key: "id", label: "ID" },
    {
      key: "business_name",
      label: "Nombre Empresa",
      render: (row) => (
        <div>
          <div className="font-medium text-white">{row.business_name}</div>
          <div className="text-xs text-gray-400">{row.contact_email}</div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Estado",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            row.status === "active"
              ? "bg-green-600/20 text-green-400"
              : "bg-red-600/20 text-red-400"
          }`}
        >
          {row.status === "active" ? "Activa" : "Suspendida"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Creada",
      render: (row) => new Date(row.created_at).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="px-3 py-1 text-xs bg-cyan-600 hover:bg-cyan-700 text-white rounded transition"
          >
            Editar
          </button>
          <button
            onClick={() => handleToggleStatus(row)}
            className={`px-3 py-1 text-xs ${
              row.status === "active"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            } text-white rounded transition`}
          >
            {row.status === "active" ? "Suspender" : "Activar"}
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="px-3 py-1 text-xs bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded transition"
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
          Gestión de Empresas
        </h1>
        <button
          onClick={handleNewCompany}
          className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition shadow-lg"
        >
          + Nueva Empresa
        </button>
      </div>

      <DataTable columns={columns} data={companies} loading={loading} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCompany ? "Editar Empresa" : "Nueva Empresa"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre Empresa *
            </label>
            <input
              type="text"
              value={formData.business_name}
              onChange={(e) =>
                setFormData({ ...formData, business_name: e.target.value })
              }
              className="w-full px-4 py-2 bg-slate-800 border border-cyan-500/30 rounded-lg text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                RUT/NIT
              </label>
              <input
                type="text"
                value={formData.tax_id}
                onChange={(e) =>
                  setFormData({ ...formData, tax_id: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-800 border border-cyan-500/30 rounded-lg text-white"
                placeholder="99.999.999-9"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Teléfono
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-800 border border-cyan-500/30 rounded-lg text-white"
                placeholder="+569 1234 5678"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Contacto *
            </label>
            <input
              type="email"
              value={formData.contact_email}
              onChange={(e) =>
                setFormData({ ...formData, contact_email: e.target.value })
              }
              className="w-full px-4 py-2 bg-slate-800 border border-cyan-500/30 rounded-lg text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Dirección
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full px-4 py-2 bg-slate-800 border border-cyan-500/30 rounded-lg text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-800 border border-cyan-500/30 rounded-lg text-white"
                placeholder="https://concesionario.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Logo URL
              </label>
              <input
                type="url"
                value={formData.logo_url}
                onChange={(e) =>
                  setFormData({ ...formData, logo_url: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-800 border border-cyan-500/30 rounded-lg text-white"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-slate-600">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white rounded-lg transition shadow-lg"
            >
              {editingCompany ? "Actualizar" : "Crear"} Empresa
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
