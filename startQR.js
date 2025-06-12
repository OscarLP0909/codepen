document.getElementById("startQR").addEventListener("click", function() {
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
                            alert("QR detectado: " + code.data);
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