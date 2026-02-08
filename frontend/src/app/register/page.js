import RegisterForm from "./components/RegisterForm";

// Componente principal de la página de registro
export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans overflow-hidden">
            <div className="flex flex-col md:flex-row h-screen">

                {/* Sección del Formulario (Izquierda) */}
                <RegisterForm />

                {/* Sección de la Imagen (Derecha) */}
                <div className="hidden md:block md:w-1/2 relative">
                    <img
                        src="https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2069&auto=format&fit=crop"
                        alt="Personas entrenando en un gimnasio moderno"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
                </div>
            </div>
        </div>
    );
}
