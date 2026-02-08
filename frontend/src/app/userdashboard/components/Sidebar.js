'use client'
import { useRouter } from 'next/navigation';
import {deleteCookies} from '@/app/lib/auth'


import {
    ChartBarIcon,
    UsersIcon,
    FireIcon,
    Cog6ToothIcon,
    ArrowLeftOnRectangleIcon,
    XMarkIcon,
  } from '@heroicons/react/24/outline';

  
  export function Sidebar({ isOpen, setIsOpen }) {

  const router = useRouter()
      
  const navItems = [
    { name: 'Dashboard', href: '/userdashboard', icon: <ChartBarIcon className="h-6 w-6" /> },
   // { name: 'Miembros', href: '#', icon: <UsersIcon className="h-6 w-6" /> },
    { name: 'Asistencia', href: '/userdashboard/lasttraining/', icon: <FireIcon className="h-6 w-6" /> },
    //{ name: 'Ajustes', href: '#', icon: <Cog6ToothIcon className="h-6 w-6" /> },
  ];

  const sessionEnded = async ()=> {
     await deleteCookies('token');
    router.push('/login')
  }
    return (
      <>
        {/* Fondo oscuro para móvil cuando el menú está abierto */}
        <div 
          className={`fixed inset-0 bg-black/50 z-30 md:hidden ${isOpen ? 'block' : 'hidden'}`}
          onClick={() => setIsOpen(false)}
        ></div>
  
        <aside
          className={`fixed top-0 left-0 h-full bg-gray-800 text-white flex flex-col z-40 transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            md:relative md:translate-x-0 md:transition-all md:duration-300 flex-shrink-0
            ${isOpen ? 'md:w-64' : 'md:w-20'}`}
        >
          {/* Cabecera de la barra lateral */}
          <div className="flex items-center justify-between p-4 h-16 border-b border-gray-700">
            <h1 className={`text-xl font-bold whitespace-nowrap transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'md:opacity-0 md:hidden'}`}>
              GymPro
            </h1>
            <button onClick={() => setIsOpen(false)} className="p-2 rounded-lg hover:bg-gray-700 md:hidden">
               <XMarkIcon className="h-7 w-7" />
            </button>
          </div>
  
          {/* Navegación Principal */}
          <nav className="flex-1 px-3 py-4 space-y-2">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center p-3 rounded-lg hover:bg-indigo-600 group"
              >
                {item.icon}
                <span
                  className={`ml-4 font-medium whitespace-nowrap transition-opacity ${
                    isOpen ? 'opacity-100' : 'md:opacity-0 md:hidden'
                  }`}
                >
                  {item.name}
                </span>
              </a>
            ))}
          </nav>
  
          {/* Pie de la barra lateral (Cerrar Sesión) */}
          <div className="p-3 border-t border-gray-700">
            <button onClick={sessionEnded} className="flex items-center p-3 rounded-lg hover:bg-red-600 group">
              <ArrowLeftOnRectangleIcon className="h-6 w-6" />
              <span className={`ml-4 font-medium whitespace-nowrap transition-opacity ${
                  isOpen ? 'opacity-100' : 'md:opacity-0 md:hidden'
                }`}>
                Cerrar Sesión
              </span>
            </button>
          </div>
        </aside>
      </>
    );
  }
  
  