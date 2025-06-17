// server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configura tu conexión a MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Leoyloki22110909',
    database: 'Prueba_QR_Trabajo',
});

app.listen(3001, () => {
    console.log('Servidor backend corriendo en http://localhost:3001');
});

// Endpoint de ejemplo
app.get('/api/items', (req, res) => {
    db.query('SELECT * FROM registro_qr', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});


app.get('/api/persona/:cod_QR_ID', (req, res) => {
    const codigo = req.params.cod_QR_ID;
    db.query('SELECT * FROM registro_qr WHERE cod_QR_ID = ?', [codigo], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        if (results.length === 0) return res.status(404).json({ error: 'No encontrado' });
        res.json(results[0]);
    });
});


app.post('/api/salida', (req, res) => {
    const { cod_QR_ID, nombre_completo, Centro, Sociedad } = req.body;
    db.query(
        'SELECT Estado FROM registro_qr WHERE cod_QR_ID = ? ORDER BY ID DESC LIMIT 1',
        [cod_QR_ID],
        (err, results) => {
            if (err) {
                console.error('Error al consultar:', err);
                return res.status(500).json({ error: err.message });
            }
            console.log('Último registro:', results); 
            // Solo permite salida si el último registro es 'Entrada'
            if (results.length > 0 && results[0].Estado && results[0].Estado.trim().toLowerCase() !== 'entrada') {
                return res.status(400).json({ error: 'No puedes registrar salida porque hay una entrada previa sin salida para este QR.' });
            } else 
            db.query(
                'INSERT INTO registro_qr (cod_QR_ID, nombre_completo, Centro, Sociedad, Estado) VALUES (?, ?, ?, ?, ?)',
                [cod_QR_ID, nombre_completo, Centro, Sociedad, 'Salida'],
                (err2, results2) => {
                    if (err2) {
                        console.error('Error al insertar salida:', err2);
                        return res.status(500).json({ error: err2.message });
                    }
                    res.json({ message: 'Salida registrada correctamente', results: results2 });
                
                }
            );
        }
    );
});

app.post('/api/entrada', (req, res) => {
    const { cod_QR_ID, nombre_completo, Centro, Sociedad } = req.body;

    db.query(
        'SELECT Estado FROM registro_qr WHERE cod_QR_ID = ? ORDER BY ID DESC LIMIT 1',
        [cod_QR_ID],
        (err, results) => {
            if (err) {
                console.error('Error al consultar:', err);
                return res.status(500).json({ error: err.message });
            }
            console.log('Último registro:', results); 
            if (results.length > 0 && results[0].Estado && results[0].Estado.trim().toLowerCase() === 'entrada') {
                return res.status(400).json({ error: 'Ya existe una entrada sin marcar salida para este QR.' });
            }
            db.query(
                'INSERT INTO registro_qr (cod_QR_ID, nombre_completo, Centro, Sociedad, Estado) VALUES (?, ?, ?, ?, ?)',
                [cod_QR_ID, nombre_completo, Centro, Sociedad, 'Entrada'],
                (err2, results2) => {
                    if (err2) {
                        console.error('Error al insertar entrada:', err2);
                        return res.status(500).json({ error: err2.message });
                    }
                    res.json({ message: 'Entrada registrada correctamente', results: results2 });
                }
            );
        }
    );
});