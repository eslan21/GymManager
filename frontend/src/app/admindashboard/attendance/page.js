import AttendanceTable from "./components/AttendanceTable";

export default function AttendancePage() {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-8">Control de Asistencia Diario</h1>
            <AttendanceTable />
        </div>
    );
}
