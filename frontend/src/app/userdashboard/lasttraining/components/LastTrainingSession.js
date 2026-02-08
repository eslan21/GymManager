'use client'
import { gql, useMutation, useQuery } from '@apollo/client'
import { useContext } from 'react';


const TRAINING_SESSIONS = gql`
   query getAttendancesByUser{
  getAttendancesByUser{
    id
    user {
      fullName
    }
    checkIn
    
  }
}
`;


export default function LastTrainingSessions() {
   const {data, loading, error} = useQuery(TRAINING_SESSIONS)

   if (loading) {
    return (
        <tbody>
            <tr>
                <td>
                    No hay datos de asistencia
                </td>
            </tr>
        </tbody>
    )    
   };
   
   const {getAttendancesByUser} = data;
 
    return (
        <>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">

               
                {getAttendancesByUser?.map((item, index) => (
                    <tr key={index}>
                        <td className="p-4 text-gray-700 dark:text-gray-400">{item.user.fullName}</td>
                        <td className="p-4 text-gray-700 dark:text-gray-400">{item.checkIn ? new Date(parseInt(item.checkIn)).toLocaleString() : 'N/A'}</td>
                    </tr>
                ))}
            </tbody>
        </>
    )
}
