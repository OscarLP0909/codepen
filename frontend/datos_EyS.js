function formatearParaUsuario(fechaMySQL) {
    if (!fechaMySQL) return '';
    const fecha = new Date(fechaMySQL.replace(' ', 'T'));
    const pad = n => n < 10 ? '0' + n : n;
    return `${pad(fecha.getDate())}/${pad(fecha.getMonth() + 1)}/${fecha.getFullYear()}, ${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
}

document.getElementById('buscarRegistros').addEventListener('click', () => {
    const nombre = document.getElementById('nombrePersona').value.trim();
    const tabla = document.getElementById('tablaRegistros');
    const tbody = tabla.querySelector('tbody');
    const mensaje = document.getElementById('mensaje');
    tbody.innerHTML = '';
    mensaje.textContent = '';
    tabla.style.display = 'none';

    if (!nombre) {
        mensaje.textContent = 'Introduce un nombre válido.';
        return;
    }

    fetch(`http://localhost:3001/api/registros/nombre/${encodeURIComponent(nombre)}`)
        .then(res => res.json())
        .then(data => {
            if (!Array.isArray(data) || data.length === 0) {
                mensaje.textContent = 'No hay registros para este nombre.';
                return;
            }
            data.forEach(registro => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${registro.cod_QR_ID}</td>
                    <td>${registro.nombre_completo}</td>
                    <td>${registro.Sociedad}</td>
                    <td>${registro.Centro}</td>
                    <td>${registro.Estado}</td>
                    <td>${registro.Hora ? formatearParaUsuario(registro.Hora) : ''}</td>
                    <td>
                        <button class="editarHoraBtn" data-id="${registro.ID}" data-hora="${registro.Hora}">✏️</button>
                        <button class="borrarRegistroBtn" data-id="${registro.ID}" title="Eliminar registro">🗑️</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
            tabla.style.display = '';
        })
        .catch(err => {
            mensaje.textContent = 'Error al consultar los registros: ' + err;
        });
});

function convertirAFormatoMySQL(fechaUsuario) {
    // fechaUsuario: 'dd-MM-yyyy, HH:mm'
    const [fecha, hora] = fechaUsuario.split(',');
    if (!fecha || !hora) return null;
    const [dia, mes, anio] = fecha.trim().split('-');
    const [horas, minutos] = hora.trim().split(':');
    if (!dia || !mes || !anio || !horas || !minutos) return null;
    return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')} ${horas.padStart(2, '0')}:${minutos.padStart(2, '0')}:00`;
}

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('editarHoraBtn')) {
        const id = e.target.getAttribute('data-id');
        const horaActual = e.target.getAttribute('data-hora') || '';
        // Formatea la hora actual para mostrarla en el prompt en formato dd-MM-yyyy, HH:mm
        let horaActualFormateada = '';
        if (horaActual) {
            const fecha = new Date(horaActual.replace(' ', 'T'));
            const pad = n => n < 10 ? '0' + n : n;
            horaActualFormateada = `${pad(fecha.getDate())}-${pad(fecha.getMonth() + 1)}-${fecha.getFullYear()}, ${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
        }
        const nuevaHoraUsuario = prompt('Introduce la nueva hora (dd-MM-yyyy, HH:mm):', horaActualFormateada);
        if (nuevaHoraUsuario) {
            const nuevaHora = convertirAFormatoMySQL(nuevaHoraUsuario);
            if (!nuevaHora) {
                alert('Formato incorrecto. Usa dd-MM-yyyy, HH:mm');
                return;
            }
            fetch(`http://localhost:3001/api/registro/${id}/hora`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nuevaHora })
            })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                document.getElementById('buscarRegistros').click();
            })
            .catch(err => alert('Error al actualizar la hora: ' + err));
        }
    }
    if (e.target.classList.contains('borrarRegistroBtn')) {
        const id = e.target.getAttribute('data-id');
        if (confirm('¿Seguro que quieres eliminar este registro?')) {
            fetch(`http://localhost:3001/api/registro/${id}`, {
                method: 'DELETE'
            })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                document.getElementById('buscarRegistros').click();
            })
            .catch(err => alert('Error al eliminar el registro: ' + err));
        }
    }
});