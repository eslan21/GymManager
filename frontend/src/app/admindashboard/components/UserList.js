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
    const searchTerm = searchInput.toLowerCase().trim();
    if (!searchTerm) {
      return users;
    }
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
  
  if(loading) return (
    <div className="flex justify-center items-center h-64 w-full">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (error) return (
    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-center">
      Error al cargar los usuarios.
    </div>
  );

  return (
    <div className="w-full bg-[#161b22] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0d1117] border-b border-gray-800 text-xs uppercase tracking-widest text-gray-400">
              <th className="px-6 py-5 font-semibold">User</th>
              <th className="px-6 py-5 font-semibold">Contact</th>
              <th className="px-6 py-5 font-semibold">Role</th>
              <th className="px-6 py-5 font-semibold">Status</th>
              <th className="px-6 py-5 font-semibold">Signed Up</th>
              <th className="px-6 py-5 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {userList?.map((user, idx) => (
              <tr
                key={user.id || idx}
                className="hover:bg-gray-800/40 transition-all duration-300 group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-indigo-500/20 group-hover:ring-indigo-500/40 transition-all">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-200 group-hover:text-white transition-colors">{user.fullName}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-300">{user.email}</div>
                  <div className="text-xs text-gray-500 mt-1">{user.phone || 'N/A'}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-800/80 text-gray-300 border border-gray-700 shadow-sm backdrop-blur-md">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border shadow-sm backdrop-blur-md transition-colors ${
                      user.isActive
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full mr-2 ${user.isActive ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`}></span>
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                </td>
                <td className="px-6 py-4 text-right text-sm">
                  <a
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white border border-indigo-500/20 hover:border-indigo-500 rounded-lg transition-all duration-300 shadow-sm group-hover:shadow-indigo-500/20"
                    href={`/admindashboard/${user.id}`}
                  >
                    <span className="font-medium">Edit</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </a>
                </td>
              </tr>
            ))}
            {userList?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                    <svg className="w-12 h-12 mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <p className="text-lg font-medium text-gray-400">No users found</p>
                    <p className="text-sm mt-1">Try adjusting your search criteria.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;