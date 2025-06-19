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

function getFormattedDate() {
    const now = new Date();
    const pad = n => n < 10 ? '0' + n : n;
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:00`;
}

function formatearFechaFrontend(fechaMySQL) {
    const fecha = new Date(fechaMySQL.replace(' ', 'T'));
    const pad = n => n < 10 ? '0' + n : n;
    return `${pad(fecha.getDate())}-${pad(fecha.getMonth() + 1)}-${fecha.getFullYear()} ${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
}

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
    const hora = getFormattedDate();
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
                'INSERT INTO registro_qr (cod_QR_ID, nombre_completo, Centro, Sociedad, Estado, Hora) VALUES (?, ?, ?, ?, ?, ?)',
                [cod_QR_ID, nombre_completo, Centro, Sociedad, 'Salida', hora],
                (err2, results2) => {
                    if (err2) {
                        console.error('Error al insertar salida:', err2);
                        return res.status(500).json({ error: err2.message });
                    }
                    const horaFormateada = formatearFechaFrontend(hora);
                    res.json({ message: `Salida registrada correctamente para<br> ${horaFormateada}`, 
                        results: results2 });
                
                }
            );
        }
    );
});



app.post('/api/entrada', (req, res) => {
    const { cod_QR_ID, nombre_completo, Centro, Sociedad } = req.body;
    const hora = getFormattedDate();

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
                'INSERT INTO registro_qr (cod_QR_ID, nombre_completo, Centro, Sociedad, Estado, Hora) VALUES (?, ?, ?, ?, ?, ?)',
                [cod_QR_ID, nombre_completo, Centro, Sociedad, 'Entrada', hora],
                (err2, results2) => {
                    if (err2) {
                        console.error('Error al insertar entrada:', err2);
                        return res.status(500).json({ error: err2.message });
                    }
                    const horaFormateada = formatearFechaFrontend(hora);
                    res.json({ 
                        message: `Entrada registrada correctamente para<br>${horaFormateada}`, 
                        Hora: hora,
                        results: results2 
                    });
                }
            );
        }
    );
});

app.get('/api/registros/nombre/:nombre', (req, res) => {
    const nombre = req.params.nombre;
    db.query(
        'SELECT * FROM registro_qr WHERE nombre_completo LIKE ?',
        [`%${nombre}%`],
        (err, results) => {
            if (err) return res.status(500).json({ error: err });
            res.json(results);
        }
    );
});

app.put('/api/registro/:ID/hora', (req, res) => {
    const id = req.params.ID;
    const { nuevaHora } = req.body; // Debe venir en formato 'YYYY-MM-DD HH:mm:ss'
    db.query(
        'UPDATE registro_qr SET Hora = ? WHERE ID = ?',
        [nuevaHora, id],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Hora actualizada correctamente', results });
        }
    );
});

app.delete('/api/registro/:id', (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM registro_qr WHERE ID = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Registro eliminado correctamente' });
    });
});