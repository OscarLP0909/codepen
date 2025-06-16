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

function fichajeSalida(cod_QR_ID) {
  fetch(`http://localhost:3001/api/persona/${cod_QR_ID}`)
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert('No encontrado');
      } else {
        // Aquí haces el POST para registrar la salida
        fetch('http://localhost:3001/api/salida', {
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
          alert(result.message || 'Salida registrada correctamente');
        })
        .catch(err => alert('Error al registrar salida: ' + err));
      }
    })
    .catch(err => alert('Error: ' + err));
}

const salidaQRBtn = document.getElementById("salidaQR");
if (salidaQRBtn) {
  salidaQRBtn.addEventListener("click", function() {
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
                              // Solo una vez la consulta al backend
                              fichajeSalida(code.data);
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