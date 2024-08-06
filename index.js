const cors= require('cors');

// Creación de la API
const express = require('express')
const mysql = require('mysql')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt');


// Se crea la app en express
const app = express()

// Uso de cors
app.use(cors());

// Configuración de la cabecera donde se solicita permita
// peticiones de todos los sitios y todos los metodos que consuma la app
app.use(function(req, res, next){
    res.setHeader('Access-control-Allow-Origin','*')
    res.setHeader('Access-control-Allow-Methods','*')
    next()
})

// En este punto se utiliza el bodyparser
app.use(bodyParser.json())

// Se configura el puerto a utilizar
const PUERTO = 3000

// Se crea la instancia de la conexión a Base de datos
const connection = mysql.createConnection(
    {
        host: 'localhost',
        // nombre de la base de datos
        database: 'CitasMedicas',
        // credenciales de mysql
        user: 'root',
        password: '123456'
    }
)
// Puerto a utilizar y se muestra mensaje de ejecución
app.listen(PUERTO, () => {
  console.log(`Servidor corriendo en el puerto ${PUERTO}`)
})

// Verificar que la conexión sea exitosa
connection.connect(error => {
  if (error) throw error
  console.log('Conexión exitosa a la BD')
})

// Se crea la raíz de la API
app.get('/', (req, res) => {
  res.send('API')
})

// Endpoint para el registro
app.post('/register',async (req, res) => {
  const { email, firstname, lastname, userType, password } = req.body;

  // Hash de la contraseña
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error('Error hasheando la contraseña:', err.stack);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }

    const query = 'INSERT INTO Psicopedagogia ( NombreP, ApellidoP, Puesto,EmailP, Contraseña) VALUES (?, ?, ?, ?, ?)';
    connection.query(query, [ firstname, lastname, userType,email, hashedPassword], (err, results) => {
      if (err) {
        console.error('Error ejecutando la consulta:', err.stack);
        return res.status(500).json({ message: 'Error interno del servidor' });
      }

      return res.status(201).json({ message: 'Usuario registrado exitosamente' });
    });
  });
});

// Endpoint para el login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM Psicopedagogia WHERE EmailP = ?';
  connection.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error ejecutando la consulta:', err.stack);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }

    if (results.length > 0) {
      // Comparar contraseñas
      bcrypt.compare(password, results[0].Contraseña, (err, result) => {
        if (result) {
          const nuevoRegistro = {
            IdPsico: results[0].IdPsico,
            NombreP: results[0].NombreP,
            ApellidoP: results[0].ApellidoP,
            Puesto: results[0].Puesto,
            EmailP: results[0].EmailP,
            Fecha: new Date()
          };

          return res.status(201).json({ message: 'Login exitoso', registro: nuevoRegistro });
        } else {
          return res.status(400).json({ message: 'Credenciales inválidas' });
        }
      });
    } else {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }
  });
});


