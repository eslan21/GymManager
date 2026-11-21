// Importar los modelos y las dependencias necesarias
const User = require('../model/User');
const Attendance = require('../model/Attendance');
const QRmodel = require('../model/QRmodel');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const {
  MEMBERSHIP_ROLE,
  MEMBERSHIP_DAYS,
  addDays,
  isMembershipExpired,
  nextExpiration,
  deactivateExpiredMemberships,
} = require('../lib/membership');
require('dotenv').config(); // Para las variables de entorno como el JWT Secret

// Cliente de Google reutilizado entre peticiones (cachea las claves públicas de Google)
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Duración del JWT. El frontend usa la misma duración para la cookie.
const TOKEN_EXPIRES_IN = '24h';

// Función para crear un token JWT
const createToken = (user) => {
  const { id, email, fullName, role } = user;
  return jwt.sign({ id, email, fullName, role }, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
};

// ------------------ Helpers de autorización ------------------

// Exige un usuario autenticado (token válido)
const requireUser = (ctx) => {
  if (!ctx.user?.id) {
    throw new Error('No autenticado. Inicia sesión.');
  }
  return ctx.user;
};

// Exige un ADMIN. El rol se comprueba en la BD para que un usuario degradado
// no conserve permisos mientras su token siga vigente.
const requireAdmin = async (ctx) => {
  const { id } = requireUser(ctx);
  const admin = await User.findById(id).select('role');
  if (!admin || admin.role !== 'ADMIN') {
    throw new Error('Acceso denegado. Se requieren permisos de administrador.');
  }
  return admin;
};

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfToday = () => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
};

const toISO = (value) => (value ? new Date(value).toISOString() : null);

// Los resolvers son las funciones que se ejecutan para cada query o mutation
const resolvers = {
  // Fechas del usuario en formato ISO 8601 (fáciles de parsear con new Date())
  User: {
    id: (user) => (user.id || user._id)?.toString(),
    createdAt: (user) => toISO(user.createdAt),
    membershipExpiresAt: (user) => toISO(user.membershipExpiresAt),
  },

  Query: {
    // Lista de usuarios (solo ADMIN)
    getUsers: async (_, __, ctx) => {
      await requireAdmin(ctx);
      await deactivateExpiredMemberships();
      return User.find({}).sort({ createdAt: -1 });
    },

    // Un usuario por ID (solo ADMIN)
    getUser: async (_, { id }, ctx) => {
      await requireAdmin(ctx);
      await deactivateExpiredMemberships();
      const user = await User.findById(id);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      return user;
    },

    // Historial de asistencia del usuario autenticado
    getAttendancesByUser: async (_, __, ctx) => {
      const { id } = requireUser(ctx);
      return Attendance.find({ user: id }).populate('user').sort({ checkIn: -1 });
    },

    // Asistencia del día (solo ADMIN)
    getDailyAttendance: async (_, __, ctx) => {
      await requireAdmin(ctx);
      try {
        return await Attendance.find({
          checkIn: { $gte: startOfToday(), $lte: endOfToday() }
        }).populate('user').sort({ checkIn: -1 });
      } catch (error) {
        console.log(error);
        throw new Error('Error al obtener la asistencia diaria');
      }
    },

    //-*********************    QR   ********************
    findQR: async (_, __, ctx) => {
      const { id } = requireUser(ctx);
      // Devuelve null si aún no hay QR; el cliente generará uno nuevo
      return QRmodel.findOne({ user: id }).populate('user');
    },

    // Datos del usuario autenticado
    getMe: async (_, __, ctx) => {
      const { id } = requireUser(ctx);
      await deactivateExpiredMemberships();
      return User.findById(id);
    },

    // Busca un QR por su ID completo o por sus últimos 5 caracteres (solo ADMIN)
    findQRByAdmin: async (_, { id }, ctx) => {
      await requireAdmin(ctx);
      const code = (id || '').trim();
      if (!code) throw new Error('No se proporcionó un código');

      let qr = null;
      if (/^[0-9a-f]{24}$/i.test(code)) {
        qr = await QRmodel.findById(code).populate('user');
      } else if (/^[0-9a-f]{1,5}$/i.test(code)) {
        // Coincidencia por sufijo del _id, resuelta en la base de datos
        qr = await QRmodel.findOne({
          $expr: {
            $regexMatch: {
              input: { $toString: '$_id' },
              regex: `${code.toLowerCase()}$`,
            },
          },
        }).populate('user');
      }

      if (!qr) throw new Error('Código inválido o QR no generado por el usuario');
      return qr;
    },
  },

  Mutation: {
    /**
     * Registro público. Siempre crea un CLIENTE inactivo: un ADMIN debe activarlo.
     */
    newUser: async (_, { input }) => {
      const email = input.email.toLowerCase().trim();

      // Paso 1: Revisar si el usuario ya existe en la base de datos
      const userExists = await User.findOne({ email });
      if (userExists) {
        throw new Error('El correo electrónico ya está registrado.');
      }

      // Paso 2: Hashear el password
      const salt = await bcryptjs.genSalt(10);
      const password = await bcryptjs.hash(input.password, salt);

      try {
        // Paso 3: Guardar el nuevo usuario. El rol y el estado NO se toman del cliente.
        const user = new User({
          fullName: input.fullName,
          email,
          password,
          phone: input.phone || null,
          birth: input.birth,
          role: MEMBERSHIP_ROLE,
          isActive: false,
          membershipExpiresAt: null,
        });
        await user.save();
        return user;
      } catch (error) {
        console.log(error);
        throw new Error('Hubo un error al crear el nuevo usuario');
      }
    },

    /**
     * Login con email y contraseña.
     */
    loginUser: async (_, { input }) => {
      const email = input.email.toLowerCase().trim();

      // Paso 1: Verificar si el usuario existe
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('Correo o contraseña incorrectos.');
      }

      // Paso 2: Las cuentas creadas con Google no tienen contraseña
      if (!user.password) {
        throw new Error('Esta cuenta usa Google. Inicia sesión con el botón de Google.');
      }

      // Paso 3: Verificar si el password es correcto
      const correctPassword = await bcryptjs.compare(input.password, user.password);
      if (!correctPassword) {
        throw new Error('Correo o contraseña incorrectos.');
      }

      // Paso 4: Si todo es correcto, crear y firmar el token
      return {
        token: createToken(user),
        usuario: user
      };
    },

    /**
     * Login con Google.
     * Verifica el ID token emitido por Google, y busca, vincula o crea al usuario.
     */
    loginWithGoogle: async (_, { idToken }) => {
      if (!process.env.GOOGLE_CLIENT_ID) {
        throw new Error('El inicio de sesión con Google no está configurado.');
      }

      // Paso 1: Verificar la firma, audiencia y expiración del token con Google
      let payload;
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
      } catch (error) {
        console.log(error);
        throw new Error('Token de Google inválido.');
      }

      const { sub: googleId, email, email_verified, name, picture } = payload || {};
      if (!email || !email_verified) {
        throw new Error('El correo de Google no está verificado.');
      }

      // Paso 2: Buscar por googleId o, si no existe, por email para vincular la cuenta
      let user = await User.findOne({ googleId });
      if (!user) {
        user = await User.findOne({ email: email.toLowerCase() });

        if (user) {
          // Vincular una cuenta existente (registrada con email/contraseña) a Google
          user.googleId = googleId;
          if (!user.avatar && picture) user.avatar = picture;
          await user.save();
        } else {
          // Paso 3: Crear un nuevo cliente, inactivo hasta que un administrador lo active
          user = new User({
            fullName: name || email.split('@')[0],
            email,
            googleId,
            avatar: picture || null,
            role: MEMBERSHIP_ROLE,
            isActive: false,
            membershipExpiresAt: null,
          });
          await user.save();
        }
      }

      return {
        token: createToken(user),
        usuario: user
      };
    },

    //***************CheckIn (solo ADMIN)********************* */
    checkIn: async (_, { userId }, ctx) => {
      await requireAdmin(ctx);

      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado.');
      }

      // Validar membresía (solo clientes)
      if (user.role === MEMBERSHIP_ROLE && isMembershipExpired(user)) {
        if (user.isActive) {
          user.isActive = false;
          await user.save();
        }
        throw new Error('La membresía ha vencido. Por favor renueva tu suscripción.');
      }

      if (!user.isActive) {
        throw new Error('Usuario inactivo. Contacta al administrador.');
      }

      // Verificamos si el usuario ya entró hoy al gimnasio
      const alreadyIn = await Attendance.exists({
        user: userId,
        checkIn: { $gte: startOfToday(), $lte: endOfToday() },
      });
      if (alreadyIn) {
        throw new Error("El usuario ya está dentro del gimnasio.");
      }

      const newAttendance = new Attendance({ user: userId });
      await newAttendance.save();

      // Populamos el documento ANTES de devolverlo para que la respuesta de la mutación sea completa.
      return newAttendance.populate('user');
    },

    //---------------------------------------- QR Functions-----------------------------------------------------------
    qrGenerator: async (_, __, ctx) => {
      const { id } = requireUser(ctx);

      // Validando que el usuario no tenga qr creado
      const qrUserexisted = await QRmodel.findOne({ user: id });
      if (qrUserexisted) {
        throw new Error("Ya existe un QR para este usuario");
      }

      const newQR = new QRmodel({
        user: id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000)
      });

      try {
        const resultado = await newQR.save();
        return resultado.populate('user');
      } catch (error) {
        console.log('Error al guardar QR', error);
        throw new Error('No se pudo generar el código QR.');
      }
    },

    /**
     * Actualizar usuario (solo ADMIN).
     * Membresía: al activar a un CLIENTE se le asignan 30 días desde la activación;
     * al desactivarlo se elimina la fecha de vencimiento.
     */
    userUpdate: async (_, { id, input }, ctx) => {
      const admin = await requireAdmin(ctx);

      const user = await User.findById(id);
      if (!user) throw new Error("ID de usuario erroneo");

      // Evitar que un admin se quite a sí mismo el acceso
      if (admin.id === user.id && input.role && input.role !== 'ADMIN') {
        throw new Error('No puedes quitarte tu propio rol de administrador.');
      }

      const update = { ...input };

      // Nunca guardar contraseñas en texto plano
      if (update.password) {
        update.password = await bcryptjs.hash(update.password, await bcryptjs.genSalt(10));
      } else {
        delete update.password;
      }
      if (update.email) update.email = update.email.toLowerCase().trim();

      // Lógica de membresía
      const finalRole = update.role ?? user.role;
      const finalActive = update.isActive ?? user.isActive;

      if (finalRole !== MEMBERSHIP_ROLE || !finalActive) {
        // Sin membresía para no-clientes o clientes inactivos
        update.membershipExpiresAt = null;
      } else if (!user.isActive || !user.membershipExpiresAt || isMembershipExpired(user)) {
        // Activación (o cliente activo sin fecha válida): 30 días desde ahora
        update.membershipExpiresAt = addDays(new Date(), MEMBERSHIP_DAYS);
      }

      try {
        return await User.findByIdAndUpdate(id, update, { new: true, runValidators: true });
      } catch (error) {
        if (error.code === 11000) {
          throw new Error('El correo electrónico ya está registrado.');
        }
        console.log(error);
        throw new Error('No se pudo actualizar el usuario.');
      }
    },

    /**
     * Renueva la membresía de un cliente por 30 días (solo ADMIN).
     * Si aún está vigente, los días se suman al vencimiento actual.
     */
    renewMembership: async (_, { id }, ctx) => {
      await requireAdmin(ctx);

      const user = await User.findById(id);
      if (!user) throw new Error('Usuario no encontrado.');
      if (user.role !== MEMBERSHIP_ROLE) {
        throw new Error('Solo los clientes tienen membresía.');
      }

      user.membershipExpiresAt = nextExpiration(user);
      user.isActive = true;
      await user.save();
      return user;
    },

    //***************CheckOut (solo ADMIN)********************* */
    checkout: async (_, { userId }, ctx) => {
      await requireAdmin(ctx);

      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado.');
      }

      // Buscar el último registro de asistencia de HOY que no tenga checkout
      const attendance = await Attendance.findOne({
        user: userId,
        checkIn: { $gte: startOfToday(), $lte: endOfToday() },
        checkOut: null
      }).sort({ checkIn: -1 });

      if (!attendance) {
        throw new Error('No se encontró un registro de entrada activo para hoy.');
      }

      attendance.checkOut = new Date();
      await attendance.save();

      return attendance.populate('user');
    }
  },
};

module.exports = resolvers;
