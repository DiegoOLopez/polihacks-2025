// Importamos Express
const express = require('express');

const cookieParser = require('cookie-parser');

const passport = require('./utils/auth');

// Mnadamos a llamar el Router
const routerAPI = require('./routes');
const { logErrors, errorHandler, boomErrorHandler, ormErrorHandler } = require('./middlewares/error.handler');
const {checkApiKey} = require('./middlewares/auth.handler')
// Instalado?
const cors = require('cors');


const whiteList = [
  'http://localhost' // para desarrollo
];

const corsOptions = {
  origin: (origin, callback) => {
    // Permitir sin origin (Postman, SSR)
    if (!origin || whiteList.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};



// Inicializamos la API
const app = express();
const port = process.env.PORT || 8080;
// Aplicacion de CORS
app.use(cors(corsOptions));
// 👇 Habilita respuesta automática a preflight OPTIONS
app.options(/(.*)/, cors(corsOptions));
app.use(cookieParser()); // Middleware para parsear cookies
app.use(express.json());
// RUTA
app.get('/', checkApiKey, (req, res) => {
  res.send('Hola mi server en express');
});


// Passport
app.use(passport.initialize());

// ROUTER API
routerAPI(app);

app.use(logErrors);
app.use(ormErrorHandler);
app.use(boomErrorHandler);
app.use(errorHandler);

// APP LISTEN
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${port}/`);
});