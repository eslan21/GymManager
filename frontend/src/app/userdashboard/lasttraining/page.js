import LastTrainingSessions from "./components/LastTrainingSession"

export default function lastTraining() {
  return (
    <>
     <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="p-6">
             <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Últimas Visitas</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="p-4 font-semibold text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wider">Nombre</th>
                  <th className="p-4 font-semibold text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
                </tr>
              </thead>
              
                <LastTrainingSessions/>
              
            </table>
          </div>
        </div>
    </>
  )
}
