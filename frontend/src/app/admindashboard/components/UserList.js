'use client'
import {gql, useQuery} from '@apollo/client'
import { useContext, useEffect } from "react";
import { AuthContext} from '@/app/context/AuthContext'

const GET_USERTS = gql`
  query getUsers{
    getUsers{
      id
      fullName
      email
      phone
      birth
      role
      isActive
      createdAt
    }
  }
`;

  const UserList = () => {

    function filterUsersByName(users, searchInput = '') {
      // Convertir el input a minúsculas para búsqueda case-insensitive
      const searchTerm = searchInput.toLowerCase().trim();

      // Si el input está vacío, devolver el array completo
      if (!searchTerm) {
        return users;
      }

      // Filtrar usuarios cuyo fullName contenga el término de búsqueda
      return users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm)
      );
    }

    const context = useContext(AuthContext);
    const {userList, setUserList, searchInput} = context;
    
    const {data, loading, error} = useQuery(GET_USERTS);
    
    useEffect(() => {
      if(data?.getUsers) {
        
          setUserList(filterUsersByName(data.getUsers , searchInput));
      }
    }, [data, searchInput]);
    
    if(loading) return <p>Cargando..</p>
    
    

   
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 text-gray-200 rounded-md shadow-md">
          <thead>
            <tr className="bg-gray-700 text-left text-sm uppercase tracking-wider">
              <th className="px-4 py-3">Full Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3">Signed Up</th>
            </tr>
          </thead>
          <tbody>
            {userList?.map((user, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-700 hover:bg-gray-700/50 transition"
              >
                <td className="px-4 py-3">{user.fullName}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">{user.phone}</td>
                <td className="px-4 py-3">{user.role}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      user.isActive
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">{user.createdAt}</td>
                <td className="px-4 py-3">
                  <a
                    className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition"
                    href={`/admindashboard/${user.id}`}
                  >
                    Edit
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  export default UserList;