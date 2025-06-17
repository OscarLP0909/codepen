console.log("El JS se está ejecutando");

const consultarBtn = document.getElementById('consultar');
if (consultarBtn) {
  consultarBtn.addEventListener('click', () => {
    fetch('http://localhost:3001/api/items')
      .then(res => res.json())
      .then(data => {
        document.getElementById('resultado').textContent = JSON.stringify(data, null, 2);
      })
      .catch(err => {
        document.getElementById('resultado').textContent = 'Error: ' + err;
      });
  });
}

function formatearFechaFrontend(fechaMySQL) {
    const fecha = new Date(fechaMySQL.replace(' ', 'T'));
    const pad = n => n < 10 ? '0' + n : n;
    return `${pad(fecha.getDate())}-${pad(fecha.getMonth() + 1)}-${fecha.getFullYear()} ${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
}

function fichajeEntrada(cod_QR_ID) {
  fetch(`http://localhost:3001/api/persona/${cod_QR_ID}`)
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert('No encontrado');
      } else {
        // Realiza el insert con Estado 'Entrada'
        fetch('http://localhost:3001/api/entrada', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            cod_QR_ID: data.cod_QR_ID,
            nombre_completo: data.nombre_completo,
            Centro: data.Centro,
            Sociedad: data.Sociedad
          })
        })
        .then(res => res.json())
        .then(result => {
        if (result.error) {
          alert('Error al registrar entrada: ' + result.error);
        } else {
        
        mostrarModal(result.message, () => {
          window.location.href = 'index.html';
        });}
        }
        )
        .catch(err => alert('Error al registrar entrada: ' + err));
      }
    })
    .catch(err => alert('Error: ' + err));
}

function mostrarModal(mensaje, callback) {
  const modal = document.getElementById('modalMensaje');
  const texto = document.getElementById('textoModal');
  const cerrar = document.getElementById('cerrarModal');
  texto.textContent = mensaje;
  modal.style.display = 'block';

  function cerrarYCallback() {
    modal.style.display = 'none';
    cerrar.removeEventListener('click', cerrarYCallback);
    if (callback) callback();
  }

  cerrar.addEventListener('click', cerrarYCallback);

  // Cerrar al hacer clic fuera del modal
  window.onclick = function(event) {
    if (event.target == modal) {
      cerrarYCallback();
      window.onclick = null;
    }
  }
}

const startQR = document.getElementById("startQR");

if (startQR) {
  startQR.addEventListener("click", function() {
      console.log("Iniciando escaneo de QR");
      const video = document.getElementById("video");
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
              .then(function(stream) {
                  video.setAttribute("playsinline", true);
                  video.srcObject = stream;
                  video.play();
                  let canvas = document.createElement("canvas");
                  let context = canvas.getContext("2d");
                  function scan() {
                      if (video.readyState === video.HAVE_ENOUGH_DATA) {
                          canvas.width = video.videoWidth;
                          canvas.height = video.videoHeight;
                          context.drawImage(video, 0, 0, canvas.width, canvas.height);
                          let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                          let code = jsQR(imageData.data, canvas.width, canvas.height);
                          if (code) {
                              fichajeEntrada(code.data);
                              stream.getTracks().forEach(track => track.stop());
                              return;
                          }
                      }
                      requestAnimationFrame(scan);
                  }
                  requestAnimationFrame(scan);
              })
              .catch(function(error) {
                  console.error("Error accessing camera: ", error);
              });
      } else {
          alert("QR code scanning is not supported in this browser.");
      }
  });
}