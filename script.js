let docDescriptor = null;

// Carrega os modelos da face-api
async function carregarModelos() {
  const MODEL_URL = './models';
  await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
  document.getElementById('status').innerText = 'Modelos carregados. Faça upload do documento.';
}

document.addEventListener('DOMContentLoaded', () => {
  carregarModelos();

  const input = document.getElementById('docUpload');
  const img = document.getElementById('docImage');
  const status = document.getElementById('status');

  input.addEventListener('change', async () => {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      img.src = reader.result;
      status.innerText = 'Analisando documento...';
      await new Promise(r => setTimeout(r, 500)); // espera imagem carregar

      const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
      if (!detection) {
        status.innerText = 'Rosto não detectado no documento.';
        return;
      }

      docDescriptor = detection.descriptor;
      status.innerText = 'Documento analisado. Clique para capturar a selfie.';
    };
    reader.readAsDataURL(file);
  });

  const btn = document.getElementById('btnStart');
  btn.addEventListener('click', async () => {
    if (!docDescriptor) {
      status.innerText = '⚠️ Por favor, envie primeiro o documento.';
      return;
    }

    const video = document.createElement('video');
    video.autoplay = true;
    video.width = 320;
    video.height = 240;
    document.body.appendChild(video);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;

      status.innerText = 'Capturando selfie em 3 segundos...';
      await new Promise(r => setTimeout(r, 3000));

      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      stream.getTracks().forEach(t => t.stop());
      video.remove();

      const result = await faceapi.detectSingleFace(canvas).withFaceLandmarks().withFaceDescriptor();

      if (!result) {
        status.innerText = 'Nenhum rosto detectado na selfie.';
        return;
      }

      const distance = faceapi.euclideanDistance(docDescriptor, result.descriptor);
      if (distance < 0.6) {
        status.innerText = '✅ A selfie é compatível com o documento.';
      } else {
        status.innerText = '❌ Rosto da selfie diferente do documento.';
      }

    } catch (err) {
      status.innerText = 'Erro ao acessar câmera.';
      console.error(err);
    }
  });
});
