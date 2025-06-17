document.getElementById('buscarRegistros').addEventListener('click', () => {
    const codQR = document.getElementById('codigoQR').value.trim();
    const tabla = document.getElementById('tablaRegistros');
    const tbody = tabla.querySelector('tbody');
    const mensaje = document.getElementById('mensaje');
    tbody.innerHTML = '';
    mensaje.textContent = '';
    tabla.style.display = 'none';

    if (!codQR) {
        mensaje.textContent = 'Introduce un código QR válido.';
        return;
    }

    function formatearFecha(fecha) {
        const opciones = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'};
        return new Date(fecha).toLocaleDateString('es-ES', opciones);
    }

    fetch(`http://localhost:3001/api/registros/${codQR}`)
        .then(res => res.json())
        .then(data => {
            if (!Array.isArray(data) || data.length === 0) {
                mensaje.textContent = 'No hay registros para este código QR.';
                return;
            }
            data.forEach(registro => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${registro.cod_QR_ID}</td>
                    <td>${registro.nombre_completo}</td>
                    <td>${registro.Hora ? formatearFecha (registro.Hora) : 'No registrado'}</td>
                    <td>${registro.Estado}</td>
                    <td>${registro.Centro}</td>
                 
                `;
                tbody.appendChild(tr);
            });
            tabla.style.display = '';
        })
        .catch(err => {
            mensaje.textContent = 'Error al consultar los registros: ' + err;
        });
});