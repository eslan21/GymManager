'use client'
import { Formik, Form, Field, ErrorMessage } from "formik";
import {gql, useQuery, useMutation} from '@apollo/client'
import * as Yup from "yup";
import { useRouter } from "next/navigation";

const GET_USER = gql`
query getUser($id:ID!){
  getUser(id:$id){
    fullName
    email
    phone
    role
    isActive
  }
}
`;

const UPDATE_DATA = gql`
    mutation userUpdate($id:ID!, $input:UpdateUserInput!){
    userUpdate(id:$id, input:$input){
    
     fullName
     email
     phone
     role
     isActive
  }

}


`;

const EditForm = ({ id }) => {
    const [userUpdate] = useMutation(UPDATE_DATA);

    const router = useRouter()


    const {data, loading, error} = useQuery(GET_USER, {
        variables: { id }
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

    if(loading) return <p className="text-white">Cargando...</p>
    if(error) return <p className="text-red-500">Error: {error.message}</p>

    const user = data?.getUser;

    return (
        <div className="bg-gray-800 p-6 rounded-md shadow-md max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">Editar Usuario</h2>

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
                    //Construir el mutation


                   
                    try {

                       const {data} =  await userUpdate({
                            variables: {
                                id,
                                input: values,
                            }
                        })
                        router.push('/admindashboard')
                    } catch (error) {
                        console.log(error)
                    }

                   
                }}
            >
                {() => (
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