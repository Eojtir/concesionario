// src/components/directory/PersonFormModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  FiX, FiSave, FiUser, FiMail, FiPhone, 
  FiMapPin, FiCreditCard, FiDollarSign, FiCheckCircle, FiChevronRight, FiChevronLeft 
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import personService from '../../services/personService';

// Constantes extraídas para no recrearlas en cada renderizado
const BANCOS_CHILE = [
  'BancoEstado', 'Banco de Chile', 'BCI', 'Santander', 'Scotiabank', 
  'Itaú', 'Banco Falabella', 'Banco Ripley', 'Banco Consorcio', 'Banco Security'
];

const TIPOS_CUENTA = [
  'Cuenta Corriente', 'Cuenta Vista', 'Cuenta RUT', 'Chequera Electrónica', 'Cuenta de Ahorro'
];

const initialForm = {
  rut: '',
  nombre_completo: '',
  direccion: '',
  email: '',
  telefono: '',
  es_cliente: false,
  es_proveedor: false,
  banco: '',
  tipo_cuenta: '',
  numero_cuenta: ''
};

const PersonFormModal = ({ 
  isOpen, 
  onClose, 
  onSaved, 
  personToEdit, 
  forceCliente = false, 
  forceProveedor = false 
}) => {
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'bancarios' | 'resumen'

  // Efecto para inicializar datos y manejar roles forzados
  useEffect(() => {
    if (isOpen) {
      setActiveTab('general'); // Resetear pestaña al abrir
      if (personToEdit) {
        setFormData({
          ...initialForm,
          ...personToEdit,
          es_cliente: personToEdit.es_cliente === 1,
          es_proveedor: personToEdit.es_proveedor === 1
        });
      } else {
        setFormData({
          ...initialForm,
          es_cliente: forceCliente,
          es_proveedor: forceProveedor
        });
      }
    }
  }, [personToEdit, isOpen, forceCliente, forceProveedor]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const isGeneralDataValid = formData.rut.trim() !== '' && formData.nombre_completo.trim() !== '';

  const handleNextTab = () => {
    if (activeTab === 'general') {
      if (!isGeneralDataValid) {
        return toast.error("El RUT y el Nombre son obligatorios para continuar");
      }
      setActiveTab('bancarios');
    } else if (activeTab === 'bancarios') {
      setActiveTab('resumen');
    }
  };

  const handlePrevTab = () => {
    if (activeTab === 'resumen') setActiveTab('bancarios');
    else if (activeTab === 'bancarios') setActiveTab('general');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isGeneralDataValid) return toast.error("El RUT y el Nombre son obligatorios");

    setIsSubmitting(true);
    const toastId = toast.loading(personToEdit ? "Actualizando registro..." : "Guardando registro...");

    try {
      const payload = {
        ...formData,
        rut: formData.rut.trim().toUpperCase(),
        es_cliente: formData.es_cliente ? 1 : 0,
        es_proveedor: formData.es_proveedor ? 1 : 0
      };

      if (personToEdit) {
        await personService.update(personToEdit.id, payload);
        toast.success("Registro actualizado exitosamente", { id: toastId });
      } else {
        const res = await personService.create(payload);
        if (!res.success) throw new Error(res.message);
        toast.success("Persona registrada con éxito", { id: toastId });
      }
      
      onSaved();
      onClose();
    } catch (error) {
      toast.error(error.message || "Error al procesar la solicitud", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="flex flex-col w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header del Modal */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <FiUser className="text-blue-600" /> 
            {personToEdit ? "Editar Contacto" : "Nuevo Contacto"}
          </h2>
          <button 
            onClick={onClose} 
            aria-label="Cerrar modal"
            className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Pestañas (Tabs) Nav */}
        <div 
          role="tablist" 
          aria-label="Secciones del formulario"
          className="flex px-6 border-b border-gray-200 bg-white"
        >
          {[
            { id: 'general', label: 'Datos Generales' },
            { id: 'bancarios', label: 'Datos Bancarios' },
            { id: 'resumen', label: 'Resumen' }
          ].map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Cuerpo del Formulario */}
        <div className="p-6 overflow-y-auto bg-white">
          <form id="personForm" onSubmit={handleSubmit}>
            
            {/* TAB: Datos Generales */}
            {activeTab === 'general' && (
              <div role="tabpanel" id="panel-general" className="space-y-5 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">RUT *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FiCreditCard className="text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        name="rut" 
                        value={formData.rut} 
                        onChange={handleChange} 
                        placeholder="Ej: 12345678-9" 
                        disabled={!!personToEdit} 
                        className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-lg uppercase focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500" 
                      />
                    </div>
                    {personToEdit && <p className="mt-1 text-xs text-gray-500">El RUT no se puede modificar.</p>}
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Nombre Completo / Razón Social *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FiUser className="text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        name="nombre_completo" 
                        value={formData.nombre_completo} 
                        onChange={handleChange} 
                        placeholder="Ej: Automotora SPA" 
                        className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Dirección Física</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FiMapPin className="text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        name="direccion" 
                        value={formData.direccion} 
                        onChange={handleChange} 
                        placeholder="Ej: Av. Vitacura 1230, Santiago" 
                        className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Correo Electrónico</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FiMail className="text-gray-400" />
                      </div>
                      <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        placeholder="contacto@empresa.com" 
                        className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Teléfono</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FiPhone className="text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        name="telefono" 
                        value={formData.telefono} 
                        onChange={handleChange} 
                        placeholder="+56 9 1234 5678" 
                        className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 pt-4 border-t border-gray-100">
                  <label className={`flex items-center space-x-2 ${forceCliente ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                    <input 
                      type="checkbox" 
                      name="es_cliente" 
                      checked={formData.es_cliente} 
                      onChange={handleChange} 
                      disabled={forceCliente}
                      className="w-5 h-5 border-gray-300 rounded text-blue-600 focus:ring-blue-500 disabled:bg-gray-200" 
                    />
                    <span className="font-medium text-gray-700">Es Cliente</span>
                  </label>
                  
                  <label className={`flex items-center space-x-2 ${forceProveedor ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                    <input 
                      type="checkbox" 
                      name="es_proveedor" 
                      checked={formData.es_proveedor} 
                      onChange={handleChange} 
                      disabled={forceProveedor}
                      className="w-5 h-5 border-gray-300 rounded text-green-600 focus:ring-green-500 disabled:bg-gray-200" 
                    />
                    <span className="font-medium text-gray-700">Es Proveedor / Consignante</span>
                  </label>
                </div>
              </div>
            )}

            {/* TAB: Datos Bancarios */}
            {activeTab === 'bancarios' && (
              <div role="tabpanel" id="panel-bancarios" className="space-y-5 animate-fade-in">
                <div className="p-4 mb-4 rounded-lg bg-blue-50 border border-blue-100 flex items-start gap-3">
                  <FiDollarSign className="text-blue-500 mt-0.5" size={20} />
                  <p className="text-sm text-blue-800">
                    Los datos bancarios son opcionales y se utilizarán para realizar transferencias de pagos o devoluciones.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Banco</label>
                    <select 
                      name="banco" 
                      value={formData.banco} 
                      onChange={handleChange}
                      className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">Seleccione un banco...</option>
                      {BANCOS_CHILE.map(banco => (
                        <option key={banco} value={banco}>{banco}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Tipo de Cuenta</label>
                    <select 
                      name="tipo_cuenta" 
                      value={formData.tipo_cuenta} 
                      onChange={handleChange}
                      className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">Seleccione tipo...</option>
                      {TIPOS_CUENTA.map(tipo => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Número de Cuenta</label>
                    <input 
                      type="text" 
                      name="numero_cuenta" 
                      value={formData.numero_cuenta} 
                      onChange={handleChange} 
                      placeholder="Ej: 123456789" 
                      className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                      // Permite solo números
                      onKeyPress={(e) => {
                        if (!/[0-9]/.test(e.key)) e.preventDefault();
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Resumen */}
            {activeTab === 'resumen' && (
              <div role="tabpanel" id="panel-resumen" className="space-y-6 animate-fade-in">
                
                {/* Resumen General */}
                <div className="p-5 border border-gray-200 rounded-xl bg-gray-50">
                  <h3 className="mb-3 text-sm font-bold text-gray-500 uppercase tracking-wider">Datos Personales</h3>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-sm">
                    <div>
                      <dt className="text-gray-500">RUT</dt>
                      <dd className="font-medium text-gray-900">{formData.rut || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Nombre / Razón Social</dt>
                      <dd className="font-medium text-gray-900">{formData.nombre_completo || '—'}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-gray-500">Roles Asignados</dt>
                      <dd className="flex gap-2 mt-1">
                        {formData.es_cliente && <span className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-md">Cliente</span>}
                        {formData.es_proveedor && <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-md">Proveedor</span>}
                        {!formData.es_cliente && !formData.es_proveedor && <span className="text-gray-400">Sin roles asignados</span>}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Resumen Bancario */}
                <div className="p-5 border border-gray-200 rounded-xl bg-gray-50">
                  <h3 className="mb-3 text-sm font-bold text-gray-500 uppercase tracking-wider">Información Bancaria</h3>
                  {formData.banco || formData.tipo_cuenta || formData.numero_cuenta ? (
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-sm">
                      <div>
                        <dt className="text-gray-500">Banco</dt>
                        <dd className="font-medium text-gray-900">{formData.banco || '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Tipo de Cuenta</dt>
                        <dd className="font-medium text-gray-900">{formData.tipo_cuenta || '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Número de Cuenta</dt>
                        <dd className="font-medium text-gray-900">{formData.numero_cuenta || '—'}</dd>
                      </div>
                    </dl>
                  ) : (
                    <p className="text-sm italic text-gray-500">No se ingresaron datos bancarios.</p>
                  )}
                </div>

              </div>
            )}
          </form>
        </div>

        {/* Footer del Modal (Navegación / Acción) */}
        <div className="flex items-center justify-between p-5 border-t border-gray-200 bg-gray-50 mt-auto">
          <button 
            type="button" 
            onClick={activeTab === 'general' ? onClose : handlePrevTab} 
            disabled={isSubmitting} 
            className="flex items-center gap-2 px-5 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {activeTab === 'general' ? 'Cancelar' : <><FiChevronLeft /> Atrás</>}
          </button>
          
          {activeTab !== 'resumen' ? (
            <button 
              type="button" 
              onClick={handleNextTab}
              className="flex items-center gap-2 px-6 py-2 text-white bg-gray-800 rounded-lg hover:bg-gray-900 shadow-md transition-colors"
            >
              Siguiente <FiChevronRight />
            </button>
          ) : (
            <button 
              type="submit" 
              form="personForm" 
              disabled={isSubmitting} 
              className="flex items-center gap-2 px-6 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md disabled:opacity-70 transition-colors"
            >
              {isSubmitting ? "Procesando..." : <><FiCheckCircle /> {personToEdit ? "Confirmar y Actualizar" : "Confirmar y Guardar"}</>}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default PersonFormModal;