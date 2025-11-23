# Polihacks 2025 — Detector de estafas bancarias

Proyecto para detectar llamadas y patrones de fraude bancario, con foco en proteger a personas de la tercera edad. Incluye un backend en Node.js (API REST) y una app iOS (Swift/SwiftUI) como cliente.

**Descripción**
- **Propósito**: Identificar llamadas y comportamientos sospechosos relacionados con fraude bancario y facilitar su clasificación y gestión.
- **Componentes**: backend (`backend/`) que expone la API y lógica de detección; app iOS (`estafas-bancarias/`) como interfaz móvil.

**Características**
- **Clasificación de llamadas**: rutas para clasificar y analizar llamadas.
- **Chat / Streaming**: soporte para chat y streaming de mensajes (integraciones con modelos o servicios de IA).
- **Autenticación y roles**: manejo de usuarios, roles y sesiones.
 

**Estructura del repositorio**
- **`backend/`**: servidor Node.js (Express), rutas.
- **`backend/routes/`**: rutas principales: `GET /` y bajo `/api/v1`:
	- `/api/v1/example`(endpoint de prueba, verificar funcionamiento del backend)
	- `/api/v1/clasificar` (clasificación)
	- `/api/v1/chat` (chat)
	- `/api/v1/detection` (detección)
	- `/api/v1/chat-stream` (streaming de chat)
- **`estafas-bancarias/`**: proyecto iOS (Swift/SwiftUI) para la interfaz móvil.

**Tecnologías**
- **Backend**: Node.js, Express..
- **Frontend móvil**: Swift, SwiftUI, proyecto Xcode en `estafas-bancarias/`.

**Requisitos**
- Node.js (versión LTS recomendada, p.ej. 16/18/20)
- npm
- Xcode (para compilar la app iOS)

**Instalación y ejecución (Backend)**
- Abrir terminal y moverse al directorio del backend:

	`cd backend`

- Instalar dependencias:

	`npm install`

- Configurar variables y base de datos:
 - Configurar variables de entorno (no es necesario configurar una base de datos para ejecutar el servidor):
	- Crea un archivo `.env` en `backend/` con variables comunes, p. ej.:

	```text
	NODE_ENV=development
	PORT=3000
	JWTSECRET=tu_secreto_opcional
	GEMINI_API_KEY=tu_api_key_opcional
	```

- Iniciar servidor (desarrollo):

	`npm run dev`

	O ejecutar directamente:

	`node index.js`

**Rutas principales**
- Base API: `http://localhost:3000/api/v1` (el servidor usa por defecto el puerto `3000`, o el valor definido en la variable `PORT`)
- Rutas disponibles (revisar `backend/routes/` para detalles y payloads):
	- `/example` — ejemplos y pruebas.
	- `/clasificar` — endpoints para clasificación de llamadas/contendio.
	- `/chat` — chat y mensajería.
	- `/detection` — detección y análisis.
	- `/chat-stream` — streaming de mensajes.

**Ejecución de la app iOS**
- Abrir `estafas-bancarias/estafas-bancarias.xcodeproj` en Xcode.
- Seleccionar un simulador o dispositivo y ejecutar (⏵ Run).

**Desarrollo y testing**
- Para desarrollo backend usar `npm run dev` (incluye `nodemon` para recarga automática).
- Revisar los middlewares en `backend/middlewares/` para manejo de errores y auth.
