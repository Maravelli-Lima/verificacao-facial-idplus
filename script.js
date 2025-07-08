async function carregarModelos() {
  const MODEL_URL = './models';

  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

  document.getElementById('status').innerText = "✅ Modelos carregados.";
}

async function iniciarVerificacao() {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const status = document.getElementById('status');
  const container = document.querySelector('.container');

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.style.display = 'block';
    canvas.style.display = 'block';
    await video.play();

    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detection) {
      status.innerText = "✅ Referência capturada com sucesso!";
    } else {
      status.innerText = "❌ Nenhum rosto detectado. Tente novamente.";
    }

    stream.getTracks().forEach(track => track.stop());
  } catch (error) {
    status.innerText = "❌ Erro ao acessar a câmera: " + error.message;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await carregarModelos();
  document.getElementById('startButton').addEventListener('click', iniciarVerificacao);
});



