'use client'
import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import {gql, useQuery, useMutation} from '@apollo/client'
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { getMembershipInfo, MEMBERSHIP_DAYS } from '@/app/lib/membership';

const GET_USER = gql`
query getUser($id:ID!){
  getUser(id:$id){
    id
    fullName
    email
    phone
    role
    isActive
    membershipExpiresAt
  }
}
`;

const UPDATE_DATA = gql`
    mutation userUpdate($id:ID!, $input:UpdateUserInput!){
    userUpdate(id:$id, input:$input){
     id
     fullName
     email
     phone
     role
     isActive
     membershipExpiresAt
  }
}
`;

const RENEW_MEMBERSHIP = gql`
mutation renewMembership($id: ID!){
  renewMembership(id: $id){
    id
    isActive
    membershipExpiresAt
  }
}
`;

// Tarjeta con el estado de la membresía del cliente y el botón de renovación
function MembershipPanel({ user }) {
    const [renewMembership, { loading }] = useMutation(RENEW_MEMBERSHIP);
    const [feedback, setFeedback] = useState(null);

    const { expiresAt, label, daysRemaining, isExpired } = getMembershipInfo(user);

    const handleRenew = async () => {
        setFeedback(null);
        try {
            // La respuesta incluye id, así que Apollo actualiza la caché automáticamente
            await renewMembership({ variables: { id: user.id } });
            setFeedback({ ok: true, text: `Membresía renovada por ${MEMBERSHIP_DAYS} días.` });
        } catch (error) {
            setFeedback({ ok: false, text: error.message });
        }
    };

    return (
        <div className="bg-gray-900/60 border border-gray-700 rounded-md p-4 mb-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-sm text-gray-400">Membresía</div>
                    {expiresAt ? (
                        <>
                            <div className={`text-lg font-semibold ${isExpired ? 'text-rose-400' : 'text-white'}`}>
                                {isExpired ? `Vencida el ${label}` : `Vence el ${label}`}
                            </div>
                            {!isExpired ? (
                                <div className="text-xs text-gray-400">{daysRemaining} días restantes</div>
                            ) : null}
                        </>
                    ) : (
                        <div className="text-lg font-semibold text-gray-300">Sin membresía activa</div>
                    )}
                </div>
                <button
                    type="button"
                    onClick={handleRenew}
                    disabled={loading}
                    className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2 px-3 rounded-md transition disabled:opacity-50"
                >
                    {loading ? 'Renovando...' : `${expiresAt && !isExpired ? 'Extender' : 'Activar'} ${MEMBERSHIP_DAYS} días`}
                </button>
            </div>
            {feedback ? (
                <div className={`mt-3 text-sm ${feedback.ok ? 'text-emerald-400' : 'text-rose-400'}`}>{feedback.text}</div>
            ) : null}
        </div>
    );
}

const EditForm = ({ id }) => {
    const [userUpdate] = useMutation(UPDATE_DATA);
    const [submitError, setSubmitError] = useState(null);

    const router = useRouter()


    const {data, loading, error} = useQuery(GET_USER, {
        variables: { id },
        fetchPolicy: 'cache-and-network',
    })

    // Esquema de validación con Yup
    const validationSchema = Yup.object({
        fullName: Yup.string()
            .min(3, "Debe tener al menos 3 caracteres")
            .required("El nombre completo es obligatorio"),
        email: Yup.string()
            .email("Email inválido")
            .required("El email es obligatorio"),
        phone: Yup.string(),
        role: Yup.string().required("El rol es obligatorio"),
        isActive: Yup.boolean(),
    });

    if(loading && !data) return <p className="text-white">Cargando...</p>
    if(error) return <p className="text-red-500">Error: {error.message}</p>

    const user = data?.getUser;

    return (
        <div className="bg-gray-800 p-6 rounded-md shadow-md max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">Editar Usuario</h2>

            {user?.role === 'CLIENTE' ? <MembershipPanel user={user} /> : null}

            {submitError ? (
                <div className="mb-4 px-4 py-3 bg-red-800 border border-red-700 rounded-md text-white text-sm">{submitError}</div>
            ) : null}

            <Formik
                initialValues={{
                    fullName: user?.fullName || "",
                    email: user?.email || "",
                    phone: user?.phone || "",
                    role: user?.role || "",
                    isActive: user?.isActive || false,
                }}
                enableReinitialize={true}
                validationSchema={validationSchema}
                onSubmit={ async (values) => {
                    setSubmitError(null);
                    try {
                        await userUpdate({
                            variables: {
                                id,
                                input: values,
                            }
                        })
                        router.push('/admindashboard')
                    } catch (error) {
                        console.log(error)
                        setSubmitError(error.message)
                    }
                }}
            >
                {({ values }) => (
                    <Form className="space-y-4">
                        {/* Full Name */}
                        <div>
                            <label className="block text-gray-300 mb-1">Full Name</label>
                            <Field
                                type="text"
                                name="fullName"
                                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <ErrorMessage
                                name="fullName"
                                component="div"
                                className="text-red-500 text-sm mt-1"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-gray-300 mb-1">Email</label>
                            <Field
                                type="email"
                                name="email"
                                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <ErrorMessage
                                name="email"
                                component="div"
                                className="text-red-500 text-sm mt-1"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-gray-300 mb-1">Phone</label>
                            <Field
                                type="text"
                                name="phone"
                                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <ErrorMessage
                                name="phone"
                                component="div"
                                className="text-red-500 text-sm mt-1"
                            />
                        </div>

                        {/* Role */}
                        <div>
                            <label className="block text-gray-300 mb-1">Role</label>
                            <Field
                                as="select"
                                name="role"
                                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Selecciona un rol</option>
                                <option value="ADMIN">ADMIN</option>
                                <option value="ENTRENADOR">ENTRENADOR</option>
                                <option value="CLIENTE">CLIENTE</option>
                            </Field>
                            <ErrorMessage
                                name="role"
                                component="div"
                                className="text-red-500 text-sm mt-1"
                            />
                        </div>

                        {/* Active */}
                        <div className="flex items-center">
                            <Field
                                type="checkbox"
                                name="isActive"
                                className="mr-2"
                            />
                            <label className="text-gray-300">Active</label>
                        </div>
                        {values.role === 'CLIENTE' && values.isActive && !user?.isActive ? (
                            <p className="text-xs text-emerald-400">
                                Al guardar, la membresía quedará activa por {MEMBERSHIP_DAYS} días a partir de hoy.
                            </p>
                        ) : null}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition disabled:opacity-50"
                        >
                            Editar
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default EditForm;