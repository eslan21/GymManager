'use client'
import { useRouter } from 'next/navigation';
import {isTokenExpired} from '@/app/lib/auth'
import { Sidebar } from './components/Sidebar'; // -> Así lo importarías en tu proyecto
import { Bars3Icon } from '@heroicons/react/24/outline';
import { useState , useEffect} from 'react';

export default  function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const router = useRouter()

  


  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col">
        {/* Cabecera del contenido principal */}
        <header className="flex items-center h-16 bg-white dark:bg-gray-800 shadow-md px-6 flex-shrink-0 z-10">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <Bars3Icon className="h-7 w-7 text-gray-600 dark:text-gray-300" />
          </button>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white ml-4">Dashboard</h2>
        </header>

        {/* Contenido principal de la página renderizado aquí */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}