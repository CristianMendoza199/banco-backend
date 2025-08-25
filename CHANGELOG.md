# Changelog

## [0.2.0] - 2025-08-16
### Added
- ➕ **Solicitudes de crédito**:
  - Endpoint para crear solicitudes de crédito (`POST /api/solicitudes/crear`).
  - Endpoint para listar solicitudes de crédito (por cliente y admin).
- ➕ **Créditos**:
  - Endpoint para asignar créditos (`POST /api/creditos/crear`).
  - Generación automática de cuotas (`cuotas_credito`) al crear un crédito.
  - Endpoint para consultar cuotas de un crédito (`GET /api/creditos/:id/cuotas`).
  - Endpoint para pagar cuotas (`POST /api/creditos/cuotas/pagar`).
- ➕ **Transacciones**:
  - Todas las transferencias ahora registran en la tabla `transacciones`.
  - Débitos y créditos en una transferencia se manejan como operación atómica (`BEGIN/COMMIT/ROLLBACK`).
- ➕ **Logs de auditoría** con `logService` en operaciones sensibles (creación de crédito, pagos, transferencias).

### Fixed
- 🐛 Error en login (`/api/auth/login`) corregido por mala definición de ruta (`app.use('/api/auth', authRoutes)`).
- 🐛 Ajustado `asignarCredito` para usar `monto_total` (antes intentaba usar la columna inexistente `monto`).
- 🐛 Se corrigieron errores en el controlador de transferencias (`pool` no definido, `transferenciaModel` faltante).
- 🐛 Bug de inserción en cuotas de crédito: corregido el uso de parámetros en el `INSERT`.

### Changed
- 🔄 El endpoint de creación de créditos ahora solo puede ser ejecutado por **admin**.
- 🔄 Los clientes ya no crean créditos directamente: deben hacer una **solicitud de crédito** que queda en estado pendiente.
- 🔄 Rutas ajustadas para usar seguridad con `verifyToken` y `allowRoles`.

---

## [0.1.0] - 2025-08-10
### Added
- **Usuarios & Autenticación**:
  - Registro de usuarios (`POST /api/auth/register`).
  - Login con JWT (`POST /api/auth/login`).
  - Recuperación y restablecimiento de contraseña (`/api/auth/recuperar`, `/api/auth/reset-password`).
- **Tickets de soporte**:
  - Crear tickets (`POST /api/tickets/crear`).
  - Consultar tickets (`GET /api/tickets`).
- **Transacciones iniciales**:
  - Endpoint para registrar depósitos y retiros en `transacciones`.
  - Exportar historial de transacciones a PDF.

---

📌 **Notas**:  
- Se decidió separar el flujo de **créditos** en 2 fases: *solicitud* (cliente) y *aprobación* (admin).  
- Se reforzó la seguridad en todas las rutas con middlewares de roles y JWT.  
