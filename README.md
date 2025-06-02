
## 🚀 Tecnologías utilizadas

- Node.js
- Express
- PostgreSQL
- pg (driver para PostgreSQL)
- dotenv
- cors

---

## ✅ Funcionalidades actuales

### 🔹 Clientes
- `GET /api/clientes` → Obtener todos los clientes  
- `POST /api/clientes/crear` → Crear nuevo cliente  
- `PUT /api/clientes/actualizar/:id` → Actualizar cliente  
- `DELETE /api/clientes/borrar/:id` → Eliminar cliente  

### 🔹 Créditos
- `POST /api/creditos/crear` → Asignar crédito (con SP)

---

## 🧠 Arquitectura lógica

- Se utiliza una arquitectura **MVC simplificada**:  
  - Controladores para lógica de negocio  
  - Modelos para conexión con base de datos (con SP)
  - Rutas organizadas por módulo

- Se prioriza el uso de **objetos como parámetros** en los modelos, para claridad y escalabilidad.

---

## 🧪 Cómo correr el backend

```bash
# 1. Clonar el repositorio
git clone https://github.com/usuario/banco-backend.git

# 2. Instalar dependencias
npm install

# 3. Crear archivo .env basado en .env.example

# 4. Iniciar el servidor
node src/app.js
