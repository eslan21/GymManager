const jwt = require('jsonwebtoken');
require('dotenv').config();

const getUser = (token) => {
    if (token) {
        try {
            const user = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
            return user;
        } catch (error) {
            console.error('Error al verificar el token:', error);
            return null;
        }
    }
    return null;
};

module.exports = getUser;
