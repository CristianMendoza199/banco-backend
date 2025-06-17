
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

const TransaccionRoutes = require('./routes/transaccionRoutes');
app.use('/api/transacciones', TransaccionRoutes);

const registrar_usuario =  require('./routes/authRoutes');
app.use('/api/auth', require('./routes/authRoutes'));

const tarjetaRoutes = require('./routes/tarjetaRoutes');
app.use('/api/tarjeta', tarjetaRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

const usuarioRoutes = require('./routes/usuarioRoutes');
app.use('/api/usuarios', usuarioRoutes);

const transferenciaRoutes = require('./routes/transferenciaRoutes');
app.use('/api/cliente', transferenciaRoutes);


// Puerto
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});




