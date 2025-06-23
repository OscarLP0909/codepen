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

let registroIdEditar = null;

document.addEventListener('click', function(e) {
    // Botón editar hora
    if (e.target.classList.contains('editarHoraBtn')) {
        registroIdEditar = e.target.getAttribute('data-id');
        const horaActual = e.target.getAttribute('data-hora') || '';
        const modal = document.getElementById('modalEditarHora');
        const inputFecha = document.getElementById('inputFecha');
        const inputHora = document.getElementById('inputHora');
        // Rellena los campos si hay hora actual
        if (horaActual) {
            const fecha = new Date(horaActual.replace(' ', 'T'));
            inputFecha.value = fecha.toISOString().slice(0,10);
            inputHora.value = fecha.toTimeString().slice(0,5);
        } else {
            inputFecha.value = '';
            inputHora.value = '';
        }
        modal.style.display = 'block';
    }

    // Botón borrar registro (sin cambios)
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

// Cerrar modal
document.getElementById('cerrarEditarHora').onclick = function() {
    document.getElementById('modalEditarHora').style.display = 'none';
};

// Guardar nueva hora
document.getElementById('guardarHoraBtn').onclick = function() {
    const fecha = document.getElementById('inputFecha').value;
    const hora = document.getElementById('inputHora').value;
    if (!fecha || !hora) {
        alert('Debes seleccionar fecha y hora');
        return;
    }
    // Formato MySQL: YYYY-MM-DD HH:mm:ss
    const nuevaHora = `${fecha} ${hora}:00`;
    fetch(`http://localhost:3001/api/registro/${registroIdEditar}/hora`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nuevaHora })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        document.getElementById('modalEditarHora').style.display = 'none';
        document.getElementById('buscarRegistros').click();
    })
    .catch(err => alert('Error al actualizar la hora: ' + err));
};