'use client'
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useMutation, gql } from '@apollo/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Definición de la mutación para crear un nuevo usuario
const NEW_USER = gql`
  mutation newUser($input: NewUserInput!) {
    newUser(input: $input) {
      id
      fullName
      email
      role
      isActive
    }
  }
`;

export default function RegisterForm() {
    const router = useRouter();
    const [newUser] = useMutation(NEW_USER);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(false);

    // Esquema de validación con Yup
    const RegisterSchema = Yup.object().shape({
        fullName: Yup.string()
            .required('El nombre completo es obligatorio.'),
        email: Yup.string()
            .email('Correo electrónico inválido.')
            .required('El correo electrónico es obligatorio.'),
        password: Yup.string()
            .min(6, 'La contraseña debe tener al menos 6 caracteres.')
            .required('La contraseña es obligatoria.'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Las contraseñas deben coincidir')
            .required('Confirmar contraseña es obligatorio'),
        phone: Yup.string(),
        birth: Yup.date()
            .required('La fecha de nacimiento es obligatoria.'),
    });

    const formik = useFormik({
        initialValues: {
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
            phone: '',
            birth: '',
        },
        validationSchema: RegisterSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                const { confirmPassword, ...inputValues } = values;

                // Agregamos los valores por defecto requeridos
                const input = {
                    ...inputValues,
                    role: "CLIENTE",
                    isActive: false, // Desactivado por defecto
                };

                const { data } = await newUser({
                    variables: {
                        input
                    }
                });

                setMessage(`¡Registro exitoso! Por favor espera a que un administrador active tu cuenta.`);
                setError(false);

                setTimeout(() => {
                    router.push('/login');
                }, 4000);

                resetForm();

            } catch (error) {
                console.error('Error al registrar usuario:', error);
                setMessage(error.message);
                setError(true);

                setTimeout(() => {
                    setMessage(null);
                }, 3000);
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 bg-gray-900 overflow-y-auto h-full">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                        Crea tu Cuenta
                    </h1>
                    <p className="text-gray-400 mt-2">Únete a nosotros y comienza tu transformación. 🚀</p>
                </div>

                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    {/* Mensaje de éxito o error */}
                    {message && (
                        <div className={`w-full px-4 py-3 border rounded-lg text-white text-sm mb-4 ${error ? 'bg-red-800 border-red-700' : 'bg-green-800 border-green-700'}`}>
                            {message}
                        </div>
                    )}

                    {/* Nombre Completo */}
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
                            Nombre Completo
                        </label>
                        <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.fullName}
                            placeholder="Juan Pérez"
                            className={`w-full px-4 py-2 bg-gray-800 border rounded-lg transition-all duration-300
                            ${formik.touched.fullName && formik.errors.fullName
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-700 focus:ring-indigo-500'}
                            focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                        />
                        {formik.touched.fullName && formik.errors.fullName ? (
                            <div className="text-red-500 text-xs mt-1">{formik.errors.fullName}</div>
                        ) : null}
                    </div>

                    {/* Correo Electrónico */}
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
                            className={`w-full px-4 py-2 bg-gray-800 border rounded-lg transition-all duration-300
                            ${formik.touched.email && formik.errors.email
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-700 focus:ring-indigo-500'}
                            focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                        />
                        {formik.touched.email && formik.errors.email ? (
                            <div className="text-red-500 text-xs mt-1">{formik.errors.email}</div>
                        ) : null}
                    </div>

                    <div className="flex gap-4">
                        {/* Teléfono */}
                        <div className="w-1/2">
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                                Teléfono
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.phone}
                                placeholder="555-0000"
                                className={`w-full px-4 py-2 bg-gray-800 border rounded-lg transition-all duration-300
                                ${formik.touched.phone && formik.errors.phone
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-700 focus:ring-indigo-500'}
                                focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                            />
                            {formik.touched.phone && formik.errors.phone ? (
                                <div className="text-red-500 text-xs mt-1">{formik.errors.phone}</div>
                            ) : null}
                        </div>

                        {/* Fecha de Nacimiento */}
                        <div className="w-1/2">
                            <label htmlFor="birth" className="block text-sm font-medium text-gray-300 mb-1">
                                Fecha de Nacimiento
                            </label>
                            <input
                                id="birth"
                                name="birth"
                                type="date"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.birth}
                                className={`w-full px-4 py-2 bg-gray-800 border rounded-lg transition-all duration-300 text-gray-300
                                ${formik.touched.birth && formik.errors.birth
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-700 focus:ring-indigo-500'}
                                focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                            />
                            {formik.touched.birth && formik.errors.birth ? (
                                <div className="text-red-500 text-xs mt-1">{formik.errors.birth}</div>
                            ) : null}
                        </div>
                    </div>

                    {/* Contraseña */}
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
                            className={`w-full px-4 py-2 bg-gray-800 border rounded-lg transition-all duration-300
                            ${formik.touched.password && formik.errors.password
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-700 focus:ring-indigo-500'}
                            focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                        />
                        {formik.touched.password && formik.errors.password ? (
                            <div className="text-red-500 text-xs mt-1">{formik.errors.password}</div>
                        ) : null}
                    </div>

                    {/* Confirmar Contraseña */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                            Confirmar Contraseña
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.confirmPassword}
                            placeholder="••••••••"
                            className={`w-full px-4 py-2 bg-gray-800 border rounded-lg transition-all duration-300
                            ${formik.touched.confirmPassword && formik.errors.confirmPassword
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-700 focus:ring-indigo-500'}
                            focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                        />
                        {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
                            <div className="text-red-500 text-xs mt-1">{formik.errors.confirmPassword}</div>
                        ) : null}
                    </div>

                    {/* Botón de Envío */}
                    <div>
                        <button
                            type="submit"
                            disabled={formik.isSubmitting}
                            className="w-full mt-2 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-300"
                        >
                            {formik.isSubmitting ? 'Creando cuenta...' : 'Registrarse'}
                        </button>
                    </div>
                </form>

                <p className="text-center text-gray-500 text-sm mt-6">
                    ¿Ya tienes una cuenta? <Link href="/login" className="font-medium text-indigo-400 hover:text-indigo-300">Inicia Sesión</Link>
                </p>
            </div>
        </div>
    );
}
