
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const requestId = require('./middlewares/requestId');
const responseFormat = require('./middlewares/responseFormat');
const errorHandler = require('./middlewares/errorHandler');




const app = express();
app.use(cors());
app.use(helmet());
app.use(cors({ origin: true, Credentials: true}));
app.use(express.json());


app.use(requestId());
app.use(responseFormat());

// Rutas
const clienteRoutes = require('./routes/clienteRoutes');
app.use('/api/clientes', clienteRoutes);

const creditoRoutes = require('./routes/creditoRoutes');
app.use('/api/creditos', creditoRoutes);

const cuentaRoutes = require('./routes/cuentaRoutes');
app.use('/api/cuentas', cuentaRoutes);

const TransaccionRoutes = require('./routes/transaccionRoutes');
app.use('/api/transacciones', TransaccionRoutes);

const tarjetaRoutes = require('./routes/tarjetaRoutes');
app.use('/api/tarjeta', tarjetaRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

const usuarioRoutes = require('./routes/usuarioRoutes');
app.use('/api/usuarios', usuarioRoutes);

const transferenciaRoutes = require('./routes/transferenciaRoutes');
app.use('/api/transferencia', transferenciaRoutes);

const ticketRoutes = require('./routes/ticketRoutes');
app.use('/api/tickets', ticketRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);  

const solicitudCreditoRoutes = require('./routes/solicitudCreditoRoutes');
app.use('/api/solicitudescredito', solicitudCreditoRoutes);

app.use(errorHandler);

module.exports = app;

// Puerto
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});




