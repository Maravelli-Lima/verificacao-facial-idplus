// Carregar e exibir a imagem do documento
document.getElementById('docUpload').addEventListener('change', function (event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const img = document.getElementById('docImage');
    img.src = e.target.result;
    document.getElementById('status').textContent = "✅ Documento carregado. Agora capture a selfie.";
  };
  reader.readAsDataURL(file);
});

// Iniciar câmera e capturar selfie
async function iniciarSelfie() {
  const video = document.createElement('video');
  video.autoplay = true;
  video.width = 320;
  video.height = 240;
  document.body.appendChild(video);

  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;

  const captureButton = document.createElement('button');
  captureButton.textContent = '📸 Capturar Selfie';
  document.body.appendChild(captureButton);

  captureButton.onclick = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    canvas.getContext('2d').drawImage(video, 0, 0);
    document.body.appendChild(canvas);

    stream.getTracks().forEach(track => track.stop());
    video.remove();
    captureButton.remove();

    document.getElementById('status').textContent = "✅ Selfie capturada. Pronto para comparar.";
  };
}

// Botão de iniciar selfie
document.getElementById('btnStart').addEventListener('click', () => {
  const docImg = document.getElementById('docImage').src;
  if (!docImg || docImg.includes("undefined")) {
    document.getElementById('status').textContent = "⚠️ Por favor, carregue o documento antes.";
    return;
  }
  iniciarSelfie();
});
