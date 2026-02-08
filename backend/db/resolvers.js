// Importar los modelos y las dependencias necesarias
const User = require('../model/User'); // Asegúrate de que la ruta a tu modelo sea correcta
const Attendance = require('../model/Attendance');
const QRmodel = require('../model/QRmodel');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const hasCheckedInToday = require('../lib/lib')
require('dotenv').config(); // Para las variables de entorno como el JWT Secret


// Función para crear un token JWT
const createToken = (user, secret, expiresIn) => {
  const { id, email, fullName, role } = user;
  return jwt.sign({ id, email, fullName, role }, secret, { expiresIn });
};

// Los resolvers son las funciones que se ejecutan para cada query o mutation
const resolvers = {
  Query: {
    /**
     * Resolver para obtener todos los usuarios.
     * En una aplicación real, deberías proteger esta consulta para que solo
     * los administradores puedan acceder a ella.
     */
    getUsers: async () => {
      try {
        const users = await User.find({});

        return users.map(user => ({
          ...user.toObject(),
          id: user._id.toString(),
          createdAt: user.createdAt ? user.createdAt.toISOString() : null
        }));



      } catch (error) {
        console.log(error);
        throw new Error('Hubo un error al obtener los usuarios');
      }
    },
    /**
     * Resolver para obtener un usuario por su ID.
     */
    getUser: async (_, { id }) => {
      // Comprobar si el usuario existe
      const user = await User.findById(id);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return user


    },
    getAttendancesByUser: async (_, { }, ctx) => {
      if (!ctx.user) {
        throw new Error("No hay usuario Registrado");
      };
      const { user } = ctx;


      const userExists = await User.findById(user.id);

      if (!userExists) {
        throw new Error('Usuario no encontrado');
      }
      const attend = await Attendance.find({ user: user.id }).populate('user').sort({ checkIn: -1 });

      return attend
    },
    getDailyAttendance: async () => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      try {
        const relativeAttendance = await Attendance.find({
          checkIn: { $gte: startOfDay, $lte: endOfDay }
        }).populate('user').sort({ checkIn: -1 });

        return relativeAttendance;
      } catch (error) {
        console.log(error);
        throw new Error('Error al obtener la asistencia diaria');
      }
    },
    //-*********************    QR   ********************
    findQR: async (_, { }, ctx) => {
      // 1. Obtenemos el ID del usuario desde el context
      // El path exacto (context.user._id) depende de cómo configures tu servidor
      const userId = ctx.user?.id;

      // 2. Validamos que el usuario esté autenticado
      if (!userId) {
        throw new Error("Acceso denegado. Debes iniciar sesión para ver tu QR.");
      }

      try {
        // 3. Buscamos el QR que pertenezca al usuario del contexto
        const qrFound = await QRmodel.findOne({ user: userId }).populate('user');

        // 4. Si no se encuentra, informamos al usuario
        if (!qrFound) {
          throw new Error("No se encontró un código QR para el usuario actual.");
        }


        return qrFound;

      } catch (error) {

        // Relanzamos el error para que GraphQL lo maneje
        throw new Error("Ocurrió un error al buscar el código QR.");
      }
    },
    findQRByAdmin: async (_, { id }) => {
      let qr;
      if (!id) throw new Error("No se proporciono id");


      try {

        if (id.length > 5) {
          qr = await QRmodel.findById(id).populate('user');
          console.log(qr)
        }
        // Si tiene 5 caracteres o menos, buscar por los últimos 5 dígitos
        else {
          // Obtener todos los QRs y filtrar por los últimos 5 caracteres del _id
          const allQRs = await QRmodel.find().populate('user');
          qr = allQRs.find(item => (item._id.toString().slice(-5) == id))
          console.log(qr)

        }

        if (!qr) throw new Error('No se ha Generado Id por parte del usuario')
        return qr
        //return {qr, ok : true}
      }
      catch (error) {
        console.log(error)
      }
    }

  },
  Mutation: {
    /**
     * Resolver para registrar un nuevo usuario.
     */
    newUser: async (_, { input }) => {
      const { email, password } = input;

      // Paso 1: Revisar si el usuario ya existe en la base de datos
      const userExists = await User.findOne({ email });
      if (userExists) {
        throw new Error('El correo electrónico ya está registrado.');
      }

      // Paso 2: Hashear el password
      const salt = await bcryptjs.genSalt(10);
      input.password = await bcryptjs.hash(password, salt);

      try {
        // Paso 3: Guardar el nuevo usuario en la base de datos
        const user = new User(input);
        user.save(); // Guardar en MongoDB
        return user;




      } catch (error) {
        console.log(error);
        throw new Error('Hubo un error al crear el nuevo usuario');
      }
    },
    /**
     * Resolver para el login de usuario.
     */
    loginUser: async (_, { input }) => {
      const { email, password } = input;

      // Paso 1: Verificar si el usuario existe
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('El usuario no existe.');
      }


      //Paso 3: Verificar si el password es correcto
      const correctPassword = await bcryptjs.compare(password, user.password);
      if (!correctPassword) {
        throw new Error('La contraseña es incorrecta.');
      }

      // Paso 4: Si todo es correcto, crear y firmar el token
      return {
        token: createToken(user, process.env.JWT_SECRET, "24h"),
        usuario: user
      };



    },
    //***************CheckIn********************* */
    checkIn: async (_, { userId }) => {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado.');
      }

      // Validar Membresía
      if (user.membershipExpiresAt) {
        const expirationDate = new Date(parseInt(user.membershipExpiresAt));
        const now = new Date();

        if (now > expirationDate) {
          // Si venció, desactivamos al usuario
          if (user.isActive) {
            user.isActive = false;
            await user.save();
          }
          throw new Error('La membresía ha vencido. Por favor renueva tu suscripción.');
        }
      }

      if (!user.isActive) {
        throw new Error('Usuario inactivo. Contacta al administrador.');
      }


      const attendance = await Attendance.find({ user: userId })
      //verificamos si el usuario ya entro al gimnasio
      if (hasCheckedInToday(attendance)) {
        throw new Error("El usuario ya está dentro del gimnasio.");

      }


      const newAttendance = new Attendance({ user: userId });
      await newAttendance.save();

      // Populamos el documento ANTES de devolverlo para que la respuesta de la mutación sea completa.
      return newAttendance.populate('user');
    },
    //---------------------------------------- QR Functions-----------------------------------------------------------
    qrGenerator: async (_, { }, ctx) => {

      const { user } = ctx;

      const qrUserexisted = await QRmodel.findOne({ user: user.id })

      //Validando que el usuario no tenga qr creado
      if (qrUserexisted) {

        throw new Error("Ya existe un QR para este usuario");

      }

      //datos de usuario

      let qrdata = {
        user: user.id,
        expiresAt: new Date(new Date().getTime() + 60 * 60 * 1000)
      }
      const newQR = new QRmodel(qrdata)

      try {
        // 1. Guardamos el nuevo documento QR
        let resultado = await newQR.save();

        // 2. Buscamos ESE MISMO documento por su _id y poblamos el campo 'user'
        // Usamos findById que es un atajo para findOne({ _id: ... })
        const resultadoPoblado = await QRmodel.findById(resultado._id).populate('user');


        return resultadoPoblado;

      } catch (error) {
        console.log('Error al guardar QR', error);
        // Es una buena práctica devolver el error o lanzarlo
        throw new Error('No se pudo generar el código QR.');
      }

    },
    userUpdate: async (_, { id, input }, ctx) => {
      const user = await User.findOne({ _id: id });

      if (!user) throw new Error("ID de usuario erroneo");

      // Lógica de Membresía: Si activamos al usuario, le damos 30 días
      if (input.isActive === true) {
        const now = new Date();
        const expirationDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 días
        input.membershipExpiresAt = expirationDate;
      }

      const userUpdated = await User.findByIdAndUpdate({ _id: id }, input, { new: true })

      return userUpdated;


    },
    //***************CheckOut********************* */
    checkout: async (_, { userId }) => {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado.');
      }

      // Buscar el último registro de asistencia de HOY que no tenga checkout
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const attendance = await Attendance.findOne({
        user: userId,
        checkIn: { $gte: startOfDay, $lte: endOfDay },
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