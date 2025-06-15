Backend para la gestión de un sistema bancario. Desarrollado con Node.js, PostgreSQL y autenticación JWT.

## 📦 Tecnologías usadas

- Node.js
- Express
- PostgreSQL
- JWT (jsonwebtoken)
- bcryptjs
- dotenv
- Arquitectura MVC
- Separación de rutas por roles (admin, cliente)

---

├── controllers/ # Lógica de cada recurso (usuarios, cuentas, tarjetas, etc.)
├── models/ # Acceso a la base de datos
├── routes/ # Rutas divididas por tipo (adminRoutes, clienteRoutes, usuarioRoutes)
├── middlewares/ # Verificación de token y roles
├── config/ # Conexión a PostgreSQL
├── app.js # Punto de entrada

##  Arquitectura general
## 🔐 Autenticación

- Se usa JWT para autenticar usuarios.
- Los tokens incluyen: `id`, `email`, `rol`, `cliente_id`.
- Se firman con la clave `JWT_SECRET` cargada desde `.env`.

---

## 🛡️ Autorización por roles

| Rol     | Permisos principales                                              |
|---------|-------------------------------------------------------------------|
| admin   | Ver todos los usuarios, crear tarjetas, eliminar cuentas, etc.   |
| cliente | Consultar sus tarjetas, hacer transacciones                      |

Control de acceso centralizado en:

- `verifyToken`: valida y decodifica el token
- `allowRoles('admin')`: middleware para proteger rutas por tipo de usuario

---

## 🔄 Flujo de datos (ejemplo: login de usuario)

1. `POST /api/usuarios/login`
2. El backend verifica el email y la contraseña (`bcryptjs`)
3. Si es válido, se firma un JWT con datos del usuario
4. El token se devuelve al frontend
5. Todas las rutas protegidas usan ese token vía `Authorization: Bearer`

---

##  Rutas principales

###  Autenticación

| Método | Ruta                     | Acceso      |
|--------|--------------------------|-------------|
| POST   | `/api/usuarios/login`    | Público     |
| POST   | `/api/usuarios/register` | Público     |
| GET    | `/api/usuarios/`         | Solo admin  |

###  Admin

| Método | Ruta                            | Descripción             |
|--------|----------------------------------|--------------------------|
| POST   | `/api/admin/crear-tarjeta`      | Crear tarjetas (admin)  |
| GET    | `/api/admin/usuarios`           | Ver todos los usuarios  |

###  Cliente

| Método | Ruta                                | Descripción                      |
|--------|--------------------------------------|----------------------------------|
| GET    | `/api/cliente/mis-tarjetas`          | Ver tarjetas del cliente actual |
| POST   | `/api/cliente/transaccion`           | Crear transacción propia        |

---

## 🌍 Variables de entorno `.env`

```env
# JWT
JWT_SECRET=miclaveultrasecreta2025

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=banco
DB_USER=postgres
DB_PASSWORD=123456


##  Arquitectura lógica

- Se utiliza una arquitectura **MVC simplificada**:  
  - Controladores para lógica de negocio  
  - Modelos para conexión con base de datos (con SP)
  - Rutas organizadas por módulo

- Se prioriza el uso de **objetos como parámetros** en los modelos, para claridad y escalabilidad.



