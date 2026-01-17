import { Outlet } from 'react-router-dom';
import Navbar from '../components/ui/Navbar'; // Asumo que moverás tu navbar aquí
// import Sidebar from '../components/ui/Sidebar'; // Futura expansión

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* El Navbar fijo arriba */}
      <Navbar /> 
     
      {/* Contenido dinámico (donde se renderizan las rutas hijas) */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <Outlet /> 
      </main>
    </div>
  );
};

export default MainLayout;