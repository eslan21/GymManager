'use client'
import { useContext } from "react";
import { AuthContext} from '@/app/context/AuthContext'

const SearchBar = () => {

  const context = useContext(AuthContext);
    const { setSearchInput} = context;


  const inputChange = (e)=>{
    console.log(e.target.value)
    setSearchInput(e.target.value)
   
  }

  return (
    <div className="flex items-center bg-gray-800 text-gray-300 rounded-md px-3 py-2 shadow-md w-full max-w-md">
      {/* Icono de lupa */}
      <svg
        className="w-5 h-5 text-gray-400 mr-2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-4.35-4.35M16.65 11.65A6 6 0 1111.65 6a6 6 0 015 5.65z"
        />
      </svg>

      {/* Input */}
      <input
        onChange={(e)=>inputChange(e)}
        type="text"
        placeholder="Buscar..."
        className="w-full bg-transparent outline-none text-gray-200 placeholder-gray-500"
      />
    </div>
  );
};

export default SearchBar;