/**
 * Script de utilidad para verificar la conexión a MongoDB
 * Ejecutar con: node api/utils/testConnection.js
 */

const mongoose = require("mongoose");
const colors = require("colors");
require("dotenv").config();

const mongoUserName = process.env.MONGO_USERNAME;
const mongoPassword = process.env.MONGO_PASSWORD;
const mongoHost = process.env.MONGO_HOST;
const mongoPort = process.env.MONGO_PORT;
const mongoDatabase = process.env.MONGO_DATABASE;

const uri =
  "mongodb://" +
  mongoUserName +
  ":" +
  mongoPassword +
  "@" +
  mongoHost +
  ":" +
  mongoPort +
  "/" +
  mongoDatabase +
  "?authSource=admin";

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  authSource: "admin",
};

console.log("\n========================================".cyan);
console.log("   Verificando Conexión a MongoDB".cyan);
console.log("========================================".cyan);
console.log("\nConfiguracion:".yellow);
console.log(`  Host: ${mongoHost}`.gray);
console.log(`  Port: ${mongoPort}`.gray);
console.log(`  Database: ${mongoDatabase}`.gray);
console.log(`  Username: ${mongoUserName}`.gray);
console.log("\nConectando...\n".yellow);

mongoose.connect(uri, options).then(
  async () => {
    console.log("✓ Conexión exitosa a MongoDB!".green.bold);
    
    // Obtener información de la base de datos
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log("\n========================================".cyan);
    console.log("   Información de la Base de Datos".cyan);
    console.log("========================================".cyan);
    console.log(`\nColecciones encontradas: ${collections.length}\n`.yellow);
    
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`  📁 ${collection.name}: ${count} documentos`.gray);
    }
    
    console.log("\n========================================".green);
    console.log("   ✓ Verificación Completada".green);
    console.log("========================================".green);
    console.log("\n");
    
    await mongoose.connection.close();
    process.exit(0);
  },
  (err) => {
    console.log("\n========================================".red);
    console.log("   ✗ Error de Conexión".red);
    console.log("========================================".red);
    console.log("\n");
    console.error(err);
    console.log("\n");
    process.exit(1);
  }
);
