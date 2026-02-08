const { gql } = require('apollo-server');

// Se definen los typeDefs (definiciones de tipos) para GraphQL
const typeDefs = gql`

  # ------------------ ENUMS ------------------
  # Usar un enum para los roles es una buena práctica.
  # Asegura que solo se puedan usar los valores definidos (ADMIN, ENTRENADOR, CLIENTE),
  # evitando errores de tipeo y manteniendo la consistencia en la base de datos.
  enum Role {
    ADMIN
    ENTRENADOR
    CLIENTE
  }

  # ------------------ TYPES ------------------
# Define el tipo para un registro de asistencia.
 type Attendance {
  id: ID
  user: User
  checkIn: String
  checkOut: String
  
}
  # -- QR--- 
 type QRGenerated {
  id: ID
  user: User
  createdAt: String
  expiresAt: String
}
 
  # El tipo que representa a un usuario en el sistema.
  type User {
    id: ID
    fullName: String
    email: String
    phone: String
    birth: String
    role: Role
    isActive: Boolean
    createdAt: String
    membershipExpiresAt: String
  }

  # El tipo de respuesta para una autenticación exitosa.
  # Devuelve el token para futuras peticiones y los datos del usuario.
  type AuthPayload {
    token: String!
    usuario: User!
  }

  # ------------------ INPUTS ------------------

  # Define los datos necesarios para crear un nuevo usuario.
  # Usar un 'input' hace que las mutaciones sean más limpias.
  input NewUserInput {
    fullName: String!
    email: String!
    password: String! # Se necesita el password para el registro
    phone: String
    birth: String
    role: Role!
    isActive: Boolean
  }

  # Define los datos para el login.
  input LoginInput {
    email: String!
    password: String!
  }

  # Guardando QR
 input QRGeneratedInput {
  userId: ID!
}
 input UpdateUserInput {
    fullName: String
    email: String
    password: String
    phone: String
    birth: String
    role: Role
    isActive: Boolean
  }
  # ------------------ QUERYS ------------------

  type Query {
    """
    Obtiene una lista de todos los usuarios.
    (Idealmente, esta consulta debería estar protegida y solo accesible para roles de ADMIN).
    """
    getUsers: [User]

    """
    Obtiene un usuario específico por su ID.
    """
    getUser(id: ID!): User
    """
    Obtiene todos los registros de asistencia de un usuario específico.
    Útil para ver el historial de visitas de un cliente.
    """
    getAttendancesByUser: [Attendance]
    
    """
    Obtiene la asistencia del día actual.
    """
    getDailyAttendance: [Attendance]

    # Obtener QR
     findQR : QRGenerated
     findQRByAdmin(id:ID!):QRGenerated
  
    
  }

  # ------------------ MUTATIONS ------------------

  type Mutation {
    """
    Registra un nuevo usuario en el sistema.
    """
    newUser(input: NewUserInput!): User

    """
    Autentica a un usuario y devuelve un token de acceso.
    """
    loginUser(input: LoginInput!): AuthPayload
    """
    Registra la entrada (check-in) de un usuario al gimnasio.
    """
    checkIn(userId: ID!): Attendance

    """
    Registra la salida (check-out) de un usuario.
    """
    checkout(userId: ID!): Attendance

    #Guardando QR
    qrGenerator : QRGenerated
   
    #Actualizar Usuario
    userUpdate(id:ID!, input:UpdateUserInput!): User

    
    
  }
`;

module.exports = typeDefs;
