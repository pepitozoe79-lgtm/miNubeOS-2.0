const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

// Configuración
const DB_PATH = path.resolve(__dirname, '../data/db/nubeos.sqlite');
const USERNAME = 'marco';
const PASSWORD = '#k&rZt^q&nsApTZ69';
const ROLE = 'admin';

console.log(`Creando usuario administrador: ${USERNAME}...`);

try {
    const db = new Database(DB_PATH, { fileMustExist: true });
    
    // Generar hash
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(PASSWORD, salt);

    // Borrar si ya existe para evitar errores de clave única y asegurar clave correcta
    db.prepare("DELETE FROM users WHERE username = ?").run(USERNAME);

    // Insertar usuario
    const stmt = db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)");
    stmt.run(USERNAME, hash, ROLE);

    console.log("------------------------------------------------------");
    console.log("✅ ¡USUARIO CREADO CON ÉXITO!");
    console.log(`Usuario: ${USERNAME}`);
    console.log(`Clave: ${PASSWORD}`);
    console.log(`Rol: ${ROLE}`);
    console.log("------------------------------------------------------");
    
    db.close();
} catch (error) {
    console.error("❌ ERROR AL CREAR EL USUARIO:");
    console.error(error.message);
    process.exit(1);
}
