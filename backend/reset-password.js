const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

// Configuración
const DB_PATH = path.resolve(__dirname, '../data/db/nubeos.sqlite');
const TARGET_USER = "admin";
const NEW_PASSWORD = "admin123";

console.log(`Intentando restablecer contraseña para: ${TARGET_USER}...`);

try {
    const db = new Database(DB_PATH, { fileMustExist: true });
    
    // Generar nuevo hash
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(NEW_PASSWORD, salt);

    // Actualizar base de datos
    const stmt = db.prepare("UPDATE users SET password = ? WHERE username = ?");
    const info = stmt.run(hash, TARGET_USER);

    if (info.changes === 0) {
        console.log("⚠️ Error: El usuario 'admin' no existe en la base de datos.");
        console.log("Sugerencia: Ejecuta 'node src/scripts/setup.js' primero para inicializar el sistema.");
    } else {
        console.log("------------------------------------------------------");
        console.log("✅ ¡ÉXITO! Contraseña actualizada correctamente.");
        console.log(`Usuario: ${TARGET_USER}`);
        console.log(`Nueva clave: ${NEW_PASSWORD}`);
        console.log("------------------------------------------------------");
    }
    
    db.close();
} catch (error) {
    console.error("❌ ERROR FATAL:");
    if (error.code === 'SQLITE_CANTOPEN') {
        console.error(`No se pudo abrir la base de datos en: ${DB_PATH}`);
        console.error("Asegúrate de que la carpeta 'data/db' existe.");
    } else {
        console.error(error.message);
    }
    process.exit(1);
}
