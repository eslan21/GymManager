'use client'
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useMutation, gql } from '@apollo/client'
import { useState, useContext } from 'react';
import { AuthContext } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { isUserLogin, getDataUser } from '@/app/lib/auth'

const GET_TOKEN = gql`
mutation loginUser($input: LoginInput!){
  loginUser(input:$input){
    token
    usuario {
      fullName
      email
      phone
      birth
      role
      isActive
      createdAt
    }
  }
}
`;

export default function LoginForm() {
  //rutazs 
  const router = useRouter()


  const [loginUser] = useMutation(GET_TOKEN);
  //Mensaje 
  const [message, setMessage] = useState(null);
  const [logType, setLogType] = useState(null);


  //contexnull
  const context = useContext(AuthContext)



  // Esto asegura que el email sea válido y que la contraseña cumpla con los requisitos mínimos.
  const LoginSchema = Yup.object().shape({
    email: Yup.string()
      .email('Correo electrónico inválido. Por favor, inténtalo de nuevo.')
      .required('El correo electrónico es obligatorio.'),
    password: Yup.string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres.')
      .required('La contraseña es obligatoria.'),
  });

  // Hook useFormik para gestionar el estado del formulario, la validación y el envío.
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: LoginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      // En una aplicación real, aquí es donde llamarías a tu mutación de Apollo Client.
      // e.g., loginMutation({ variables: values });



      try {
        const { data } = await loginUser({
          variables: {
            input: {
              email: values.email,
              password: values.password,
            },
          },
        });

        if (data?.loginUser?.token) {
          const { loginUser } = data;

          /***** Construyendo fecth para las cookies */

          const response = await fetch(process.env.NEXT_PUBLIC_VERCEL_URL
            ? `/api/auth`
            : 'http://localhost:3000/api/auth', {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: loginUser.token }),
          });

          if (response.ok) {
            const result = await response.json();

            //Redirigiendo
            const { dataToken } = result;
            if (dataToken.role === "CLIENTE") router.push('/userdashboard')

            if (dataToken.role === "ADMIN") router.push('/admindashboard')

          } else {
            console.error('Error al enviar el token:', response.statusText);
          }
          /*************************************************** */
        } else {
          console.error('Error: No se recibió un token.');
        }
      } catch (error) {
        console.error('Error al iniciar sesión:', error);
        setMessage(error.message)

      } finally {
        setSubmitting(false);
        setTimeout(() => {
          setMessage(null)

        }, 2000)
      }

    },

  });

  return (
    <>

      {/* Sección del Formulario (Izquierda) */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 bg-gray-900">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Bienvenido de Vuelta
            </h1>
            <p className="text-gray-400 mt-2">¡Es hora de superar tus límites! 💪</p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Campo de Correo Electrónico */}
            {message && (
              <div className="w-full px-4 py-3 bg-red-800 border border-red-700 rounded-lg text-white text-sm mb-4">
                {message}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                placeholder="tu@email.com"
                className={`w-full px-4 py-3 bg-gray-800 border rounded-lg transition-all duration-300
                      ${formik.touched.email && formik.errors.email
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-700 focus:ring-indigo-500'}
                      focus:outline-none focus:ring-2 focus:ring-opacity-50`}
              />
              {formik.touched.email && formik.errors.email ? (
                <div className="text-red-500 text-xs mt-2">{formik.errors.email}</div>
              ) : null}
            </div>

            {/* Campo de Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                placeholder="••••••••"
                className={`w-full px-4 py-3 bg-gray-800 border rounded-lg transition-all duration-300
                      ${formik.touched.password && formik.errors.password
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-700 focus:ring-indigo-500'}
                      focus:outline-none focus:ring-2 focus:ring-opacity-50`}
              />
              {formik.touched.password && formik.errors.password ? (
                <div className="text-red-500 text-xs mt-2">{formik.errors.password}</div>
              ) : null}
            </div>

            {/* Botón de Envío */}
            <div>
              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-300"
              >
                {formik.isSubmitting ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
              </button>
            </div>
          </form>

          <p className="text-center text-gray-500 text-sm mt-8">
            ¿No tienes una cuenta? <a href="/register" className="font-medium text-indigo-400 hover:text-indigo-300">Regístrate</a>
          </p>
        </div>
      </div>

    </>
  );
}