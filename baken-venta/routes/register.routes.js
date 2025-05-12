const express = require('express');
const { registrarUsuario } = require('../controllers/register.controller');

const router = express.Router();

// Ruta para registrar un usuario
router.post('/', (req, res) => {
    const { username, email, password } = req.body;

    // Validar que todos los campos estén presentes
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Faltan datos obligatorios.' });
    }

    // Validar formato del correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'El correo electrónico no es válido.' });
    }

    // Llamar al controlador para registrar al usuario
    const result = registrarUsuario(username, email, password);
    if (result.error) {
        return res.status(400).json({ message: result.message });
    }

    res.status(201).json({ message: 'Usuario registrado exitosamente.' });
});

module.exports = router;