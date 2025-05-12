const fs = require('fs');
const path = require('path');
const { encriptarPassword } = require('../helpers/bcryptjs.helper');

// Ruta del archivo JS con los usuarios
const filePath = path.join(__dirname, '../db/usuarios.js');

// Función para registrar un usuario
const registrarUsuario = (nombre, correo, contrasena) => {
  let listaUsuarios = [];

  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const match = fileContent.match(/const listaUsuarios = (\[[\s\S]*?\]);/);
    if (match) {
      try {
        listaUsuarios = eval(`(${match[1]})`);
      } catch (error) {
        return { error: true, message: 'Error al leer los usuarios existentes.' };
      }
    }
  }

  // Verificar si el correo ya existe
  const userExists = listaUsuarios.some(user => user.correo === correo);
  if (userExists) {
    return { error: true, message: 'El correo ya está registrado.' };
  }

  // Encriptar la contraseña
  const contrasenaEncriptada = encriptarPassword(contrasena);

  // Calcular nuevo ID
  const nuevoId = listaUsuarios.length > 0
    ? Math.max(...listaUsuarios.map(u => u.id || 0)) + 1
    : 1;

  // Crear el nuevo usuario
  const nuevoUsuario = {
    nombre,
    id: nuevoId,
    correo,
    contrasena: contrasenaEncriptada
  };

  listaUsuarios.push(nuevoUsuario);

  // Formatear el contenido como archivo JS válido
  const nuevoContenido = `const listaUsuarios = ${JSON.stringify(listaUsuarios, null, 2)};\n\nmodule.exports = { listaUsuarios };`;

  fs.writeFileSync(filePath, nuevoContenido, 'utf8');

  return { error: false, message: 'Usuario registrado exitosamente.' };
};

module.exports = { registrarUsuario };
