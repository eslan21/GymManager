import LoginForm from "./components/LoginForm";


// Componente principal de la aplicación que renderiza la página de inicio de sesión.
export default   function App() {
 
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <div className="flex flex-col md:flex-row h-screen">
        
        {/* Sección del Formulario (Izquierda) */}
        <LoginForm/>

        {/* Sección de la Imagen (Derecha) */}
        <div className="hidden md:block md:w-1/2 relative">
          <img
            src="https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=2071&auto=format&fit=crop"
            alt="Mujer levantando pesas en un gimnasio con ambiente oscuro"
            className="w-full h-full object-cover"
            
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
        </div>
      </div>
    </div>
  );
}
