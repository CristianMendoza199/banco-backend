
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
const clienteRoutes = require('./routes/clienteRoutes');
app.use('/api/clientes', clienteRoutes);

const creditoRoutes = require('./routes/creditoRoutes');
app.use('/api/creditos', creditoRoutes);

const cuentaRoutes = require('./routes/cuentaRoutes');
app.use('/api/cuentas', cuentaRoutes);

// Puerto
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});




/*
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// Configuración de conexión a PostgreSQL usando variables de entorno
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
});

app.use(cors());
app.use(express.json());

// ✅ Endpoint para obtener clientes desde una stored procedure
app.get('/api/clientes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM obtener_clientes()');
    res.json(result.rows);
  } catch (error) {
    console.error(' Error al obtener clientes:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Puedes crear más endpoints para otras SP aquí...

// Iniciar el servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(` Servidor corriendo en http://localhost:${PORT}`);
});

const clienteRoutes = require('./routes/clienteRoutes');
app.use('/api/clientes', clienteRoutes);

*/