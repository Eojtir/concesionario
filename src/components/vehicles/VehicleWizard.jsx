/* eslint-disable react-refresh/only-export-components */
// src/components/vehicles/VehicleWizard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FiChevronRight, FiChevronLeft, FiSave, FiTruck, FiLayers } from "react-icons/fi";
import { SubmitLoading } from '../ui/SubmitLoading';
import { Loading } from '../ui/Loading';
import vehicleService from "../../services/vehicleService";
import lotService from "../../services/lotService";
import contractService from "../../services/contractService";

import wizardService from "../../services/wizardService";
import reportService from "../../services/reportService";

import Step1Origin from "./Step1Origin";
import Step2VehicleData from "./Step2VehicleData";
import Step3Financial from "./Step3Financial";


const initialFormState = {
  // Control de IDs para filtrado relacional en memoria
  type_id: "",
  mark_id: "",
  model_id: "",

  // Datos originales requeridos por tus servicios y backend
  origen_vehiculo: "PROPIO",
  lot_id: "",
  entry_date: new Date().toLocaleDateString("en-CA"),
  
  // Paso 2: Datos Técnicos Obligatorios
  make: "", model: "", year: new Date().getFullYear(),
  plate: "", vin: "", nro_motor: "", color: "", 
  tipo_vehiculo: "", 
  kilometraje: "",            
  status: "available", combustible: "GASOLINA", nro_llaves: 2, vcto_rev_tecnica: "",

  // Paso 3: Financiero Global
  purchase_price: "", 
  sale_price: "",
  profit_margin: 25,
  
  // Paso 3: Campos Financieros de Consignación
  id_proveedor: "", 
  precio_esperado: "", 
  precio_minimo: "",
  tipo_contrato: "CONSIGNACION",
  duracion: 30,
  rebaja_maxima_permitida: 500000,
  porcentaje_comision: 3.5,
  comision_minima: 150000,
  gastos_administrativos: 25000,
  multa_retiro_anticipado: 100000,
  
  checklist: {
    p_circulacion: false, insc_reg_civil: false, seguro_obligatorio: false,
    triangulos: false, gata_llave: false, repuesto: false,
    rev_tecnica: false, extintor: false, copia_llave: false,
    manual: false, cert_anotaciones: false, transf_firmada: false 
  }
};

const VehicleWizard = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [currentStep, setCurrentStep] = useState(0); 
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [lots, setLots] = useState([]);
  
  const [wizardConfig, setWizardConfig] = useState({ types: [], marks: [], models: [] , proveedores: []});
  const [loading, setLoading] = useState({ page: false, submit: false, message: "" });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(prev => ({ ...prev, page: true }));
        
        const lotsRes = await lotService.getAll();
        const fetchedLots = lotsRes.data || lotsRes || [];
        setLots(fetchedLots);

        const wizardJson = await wizardService.getWizardData();
        let currentWizardData = { types: [], marks: [], models: [], proveedores: [] };

        if (wizardJson.success && wizardJson.data) {
          currentWizardData = wizardJson.data;
          setWizardConfig(wizardJson.data); 
        } else {
          toast.error(wizardJson.message || "No se pudo estructurar el catálogo.");
        }

 if (isEditMode) {
        
          const vehicle = await vehicleService.getById(id);
          
          if (vehicle.entry_date) vehicle.entry_date = vehicle.entry_date.split(" ")[0];
          if (vehicle.vcto_rev_tecnica) vehicle.vcto_rev_tecnica = vehicle.vcto_rev_tecnica.split(" ")[0];

          // 2. Encontrar IDs correspondientes para los selects dinámicos
          const foundType = currentWizardData.types.find(t => t.name.toUpperCase() === vehicle.tipo_vehiculo?.toUpperCase());
          const foundMark = currentWizardData.marks.find(m => m.name.toUpperCase() === vehicle.make?.toUpperCase());
          const foundModel = currentWizardData.models.find(m => m.name.toUpperCase() === vehicle.model?.toUpperCase());

          // 3. Mapear el Checklist plano del Backend ("1"/"0") al objeto de booleanos (true/false) que usa tu UI
          const mappedChecklist = {
            p_circulacion: vehicle.p_circulacion === "1" || vehicle.p_circulacion === 1,
            insc_reg_civil: vehicle.insc_reg_civil === "1" || vehicle.insc_reg_civil === 1,
            seguro_obligatorio: vehicle.seguro_obligatorio === "1" || vehicle.seguro_obligatorio === 1,
            triangulos: vehicle.triangulos === "1" || vehicle.triangulos === 1,
            gata_llave: vehicle.gata_llave === "1" || vehicle.gata_llave === 1,
            repuesto: vehicle.repuesto === "1" || vehicle.repuesto === 1,
            rev_tecnica: vehicle.chk_rev_tecnica === "1" || vehicle.chk_rev_tecnica === 1, // 👈 backend usa chk_rev_tecnica
            extintor: vehicle.extintor === "1" || vehicle.extintor === 1,
            copia_llave: vehicle.copia_llave === "1" || vehicle.copia_llave === 1,
            manual: vehicle.manual === "1" || vehicle.manual === 1,
            cert_anotaciones: vehicle.cert_anotac === "1" || vehicle.cert_anotac === 1,    // 👈 backend usa cert_anotac
            transf_firmada: vehicle.transf_firmada === "1" || vehicle.transf_firmada === 1
          };

          // 4. Inyectar TODO al estado del formulario
          setFormData(prev => ({ 
            ...prev, 
            ...vehicle, // Absorbe precios, comisiones, id_proveedor, duracion, etc.
            type_id: foundType ? foundType.id.toString() : "",
            mark_id: foundMark ? foundMark.id.toString() : "",
            model_id: foundModel ? foundModel.id.toString() : "",
            checklist: mappedChecklist // Sobrescribimos con el checklist mapeado en booleanos
          }));

          // Saltamos directo al paso de Datos Técnicos para que el usuario empiece a editar
          setCurrentStep(2);
        }
      } catch (err) {
        console.error(err);
        toast.error("Error al conectar con los servicios del servidor");
      } finally {
        setLoading(prev => ({ ...prev, page: false }));
      }
    };
    
    loadInitialData();
  }, [id, isEditMode]);

  // 🌟 NUEVO: Función para recargar el catálogo silenciosamente (útil para el Modal de Proveedores)
  const refreshProviders = async () => {
    try {
      const wizardJson = await wizardService.getWizardData();
      if (wizardJson.success && wizardJson.data) {
        setWizardConfig(wizardJson.data);
      }
    } catch (error) {
      console.error("Error al refrescar catálogo:", error);
    }
  };

  const availableMarks = wizardConfig.marks.filter(m => m.type_id === parseInt(formData.type_id));
  const availableModels = wizardConfig.models.filter(m => m.mark_id === parseInt(formData.mark_id));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith("chk_")) {
      const chkName = name.replace("chk_", "");
      setFormData(prev => ({ ...prev, checklist: { ...prev.checklist, [chkName]: checked } }));
      return;
    }

    setFormData(prev => {
      let updated = { 
        ...prev, 
        [name]: type === 'checkbox' ? checked : (name === 'plate' ? value.toUpperCase() : value) 
      };

      if (name === "type_id") {
        const selected = wizardConfig.types.find(t => t.id === parseInt(value));
        updated.tipo_vehiculo = selected ? selected.name.toUpperCase() : "";
        updated.mark_id = ""; updated.make = "";
        updated.model_id = ""; updated.model = "";
      }
      
      if (name === "mark_id") {
        const selected = wizardConfig.marks.find(m => m.id === parseInt(value));
        updated.make = selected ? selected.name.toUpperCase() : "";
        updated.model_id = ""; updated.model = "";
      }

      if (name === "model_id") {
        const selected = wizardConfig.models.find(m => m.id === parseInt(value));
        updated.model = selected ? selected.name.toUpperCase() : "";
      }

      if (updated.origen_vehiculo === 'CONSIGNADO') {
        if (name === 'precio_esperado') {
          updated.purchase_price = updated.precio_esperado;
        } 
        else if (name === 'precio_minimo') {
          updated.purchase_price = updated.precio_minimo || updated.precio_esperado;
        }
      }

      if (['purchase_price', 'profit_margin', 'precio_esperado', 'precio_minimo'].includes(name)) {
        const cost = parseFloat(updated.purchase_price || 0);
        const margin = parseFloat(updated.profit_margin || 0);
        
        if (cost > 0) {
          updated.sale_price = Math.round(cost * (1 + margin / 100));
        } else {
          updated.sale_price = ""; 
        }
      }
      
      return updated;
    });

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 0) {
      if (!formData.type_id) newErrors.type_id = "Debe clasificar el tipo de vehículo.";
    }
    if (step === 1) {
      if (!formData.lot_id) newErrors.lot_id = "Seleccione un lote.";
      if (!formData.entry_date) newErrors.entry_date = "Fecha requerida.";
    }
    if (step === 2) {
      if (!formData.mark_id) newErrors.mark_id = "Marca requerida.";
      if (!formData.model_id) newErrors.model_id = "Modelo requerido.";
      if (!formData.plate) newErrors.plate = "Patente requerida.";
      if (!formData.vin) newErrors.vin = "VIN requerido.";
      if (!formData.nro_motor) newErrors.nro_motor = "Nro de Motor requerido.";
      if (!formData.color) newErrors.color = "Color requerido.";
      if (!formData.vcto_rev_tecnica) newErrors.vcto_rev_tecnica = "Revisión Técnica requerida.";
    }
    if (step === 3) {
      if (!formData.purchase_price || formData.purchase_price <= 0) newErrors.purchase_price = "El precio de costo es requerido.";
      if (!formData.sale_price || formData.sale_price <= 0) newErrors.sale_price = "El precio de venta es requerido.";
      
      if (formData.origen_vehiculo === 'CONSIGNADO') {
        if (!formData.id_proveedor) newErrors.id_proveedor = "Proveedor requerido.";
        if (!formData.precio_esperado || formData.precio_esperado <= 0) newErrors.precio_esperado = "Precio del dueño requerido.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setLoading({ page: false, submit: true, message: "Guardando vehículo..." });
    const toastId = toast.loading("Registrando vehículo...");

    try {
      const vehiclePayload = {
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year),
        plate: formData.plate,
        vin: formData.vin,
        nro_motor: formData.nro_motor,
        color: formData.color,
        status: formData.status,
        combustible: formData.combustible,
        nro_llaves: parseInt(formData.nro_llaves),
        vcto_rev_tecnica: formData.vcto_rev_tecnica,
        lot_id: parseInt(formData.lot_id),
        entry_date: formData.entry_date,
        origen_vehiculo: formData.origen_vehiculo,
        purchase_price: parseFloat(formData.purchase_price || 0), 
        sale_price: parseFloat(formData.sale_price || 0),      
        attributes_json: JSON.stringify(formData.checklist),
        tipo_vehiculo: formData.tipo_vehiculo,
        kilometraje: parseInt(formData.kilometraje?.toString().replace(/\D/g, "") || 0, 10)
      };

      let vehicleResponse = isEditMode 
        ? await vehicleService.update(id, vehiclePayload)
        : await vehicleService.create(vehiclePayload);

      if (!vehicleResponse || vehicleResponse.success === false) {
        throw new Error(vehicleResponse?.message || "Error al procesar la API del vehículo.");
      }

      const savedVehicleId = vehicleResponse?.data?.vehicle_id || id;
      if (!savedVehicleId) throw new Error("La API guardó el vehículo pero no retornó su ID.");

      if (formData.origen_vehiculo === 'CONSIGNADO' && !isEditMode) {
        setLoading(prev => ({ ...prev, message: "Creando datos del contrato..." }));
        toast.loading("Creando datos del contrato...", { id: toastId });

        const contractPayload = {
          vehicle_id: parseInt(savedVehicleId),
          id_proveedor: parseInt(formData.id_proveedor),
          precio_esperado: parseFloat(formData.precio_esperado),
          
          checklist: {
            p_circulacion: !!formData.checklist.p_circulacion,
            insc_reg_civil: !!formData.checklist.insc_reg_civil,
            seguro_obligatorio: !!formData.checklist.seguro_obligatorio,
            triangulos: !!formData.checklist.triangulos,
            gata_llave: !!formData.checklist.gata_llave,
            repuesto: !!formData.checklist.repuesto,
            rev_tecnica: !!formData.checklist.rev_tecnica,
            extintor: !!formData.checklist.extintor,
            copia_llave: !!formData.checklist.copia_llave,
            manual: !!formData.checklist.manual,
            cert_anotaciones: !!formData.checklist.cert_anotaciones,
            transf_firmada: !!formData.checklist.transf_firmada
          },

          precio_minimo: parseFloat(formData.precio_minimo || formData.precio_esperado),
          tipo_contrato: formData.tipo_contrato || 'CONSIGNACION',
          duracion: parseInt(formData.duracion || 30),
          rebaja_maxima_permitida: parseFloat(formData.rebaja_maxima_permitida || 500000),
          porcentaje_comision: parseFloat(formData.porcentaje_comision || 3.5),
          comision_minima: parseFloat(formData.comision_minima || 150000),
          gastos_administrativos: parseFloat(formData.gastos_administrativos || 25000),
          multa_retiro_anticipado: parseFloat(formData.multa_retiro_anticipado || 100000)
        };

        const contractResponse = await contractService.create(contractPayload);
        
        if (!contractResponse || (contractResponse.success === false && !contractResponse.data)) {
          throw new Error(contractResponse?.message || "El vehículo se creó, pero falló la generación del contrato.");
        }

        const generatedContractId = contractResponse?.data?.contrato_id;
        
        if (!generatedContractId) {
          throw new Error("El contrato se guardó pero el servidor no devolvió la clave 'contrato_id' para el PDF.");
        }

        setLoading(prev => ({ ...prev, message: "Estructurando formato oficial y PDF..." }));
        toast.loading("Estructurando formato oficial y PDF...", { id: toastId });



// 👇 Reemplazamos el fetch por la llamada a Axios limpia y segura
        const reportResult = await reportService.generateContract(generatedContractId);

        // La respuesta ya viene parseada en JSON gracias a Axios
        if (reportResult.status === "success" && reportResult.data?.url_descarga) {
          
          // Construimos la URL si viene relativa, o la usamos directo si es absoluta
          const pdfUrl = reportResult.data.url_descarga.startsWith('http') 
            ? reportResult.data.url_descarga 
            : `${import.meta.env.VITE_API_URL || 'https://clientes.inverprado.com'}${reportResult.data.url_descarga}`;

          const nuevaVentana = window.open(pdfUrl, "_blank");
          if (!nuevaVentana) {
            toast.error("Contrato generado. Habilite las ventanas emergentes para visualizarlo de inmediato.", { id: toastId, duration: 6000 });
          }
        } else {
          throw new Error(reportResult.message || "Falló la renderización del archivo PDF.");
        }
      }

      toast.success(isEditMode ? "Vehículo actualizado" : "Vehículo y Contrato generados con éxito", { id: toastId });
      setTimeout(() => navigate("/vehicles"), 2000);

    } catch (error) {
      toast.error(error.message || "Ocurrió un error en la transacción", { id: toastId });
      setLoading({ page: false, submit: false, message: "" });
    }
  };

  if (loading.page) return <Loading />;

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50 relative">
      
      {loading.submit && <SubmitLoading message={loading.message} />}

      <div className="max-w-4xl mx-auto">
        
        <div className="bg-white rounded-t-2xl p-6 shadow-sm border-b">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">{isEditMode ? "Editar Vehículo" : "Registrar Vehículo"}</h1>
            <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Paso {currentStep + 1} de 4
            </span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${((currentStep + 1) / 4) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-white shadow-xl min-h-[400px]">
          
          {currentStep === 0 && (
            <div className="p-8">
              <h2 className="text-xl font-bold text-gray-700 mb-2 flex items-center gap-2">
                <FiLayers className="text-blue-500" /> Clasificación Inicial del Vehículo
              </h2>
              <p className="text-sm text-gray-500 mb-6">Seleccione la categoría correspondiente para filtrar marcas y modelos autorizados.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {wizardConfig.types.map((type) => {
                  const isSelected = formData.type_id === type.id.toString();
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => handleChange({ target: { name: "type_id", value: type.id.toString() } })}
                      className={`p-6 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                        isSelected 
                          ? "border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-600/20" 
                          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                      }`}
                    >
                      <div>
                        <p className={`font-bold text-lg ${isSelected ? "text-blue-700" : "text-gray-800"}`}>
                          {type.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Catálogo dinámico activo</p>
                      </div>
                      <FiTruck className={`text-2xl ${isSelected ? "text-blue-600" : "text-gray-400"}`} />
                    </button>
                  );
                })}
              </div>
              {errors.type_id && <p className="text-red-500 text-xs font-semibold mt-3">{errors.type_id}</p>}
            </div>
          )}

          {currentStep === 1 && <Step1Origin formData={formData} handleChange={handleChange} errors={errors} lots={lots} />}
          
          {currentStep === 2 && (
            <Step2VehicleData 
              formData={formData} 
              handleChange={handleChange} 
              errors={errors} 
              isEditMode={isEditMode} 
              availableMarks={availableMarks} 
              availableModels={availableModels}
            />
          )}
          
          {/* 🌟 AQUÍ PASAMOS LA FUNCIÓN refreshProviders AL STEP 3 */}
          {currentStep === 3 && (
            <Step3Financial 
              formData={formData} 
              handleChange={handleChange} 
              errors={errors} 
              mockProveedores={wizardConfig.proveedores} 
              onRefreshProviders={refreshProviders} // <--- SE INYECTA LA FUNCIÓN AQUÍ
            />
          )}
        </div>

        <div className="bg-gray-50 rounded-b-2xl p-6 border-t flex justify-between items-center shadow-sm">
          <button 
            type="button" 
            onClick={currentStep === 0 ? () => navigate("/vehicles") : () => setCurrentStep(s => s - 1)} 
            disabled={loading.submit} 
            className="px-5 py-2.5 text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {currentStep === 0 ? "Cancelar" : "Atrás"}
          </button>
          
          {currentStep < 3 ? (
            <button 
              type="button" 
              onClick={() => validateStep(currentStep) ? setCurrentStep(s => s + 1) : toast.error("Complete los campos obligatorios")} 
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Siguiente
            </button>
          ) : (
            <button 
              onClick={handleSubmit} 
              disabled={loading.submit} 
              className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg hover:from-green-600 shadow-md flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
            >
              <FiSave /> Finalizar Registro
            </button>
          ) }
        </div>

      </div>
    </div>
  );
};

export default VehicleWizard;