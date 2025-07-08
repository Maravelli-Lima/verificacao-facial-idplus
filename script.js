async function carregarModelos() {
  const MODEL_URL = location.origin + '/verificacao-facial-idplus/models';

  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    
    document.getElementById('status').innerText = "✅ Modelos carregados!";
  } catch (error) {
    document.getElementById('status').innerText = "❌ Erro ao carregar modelos: " + error.message;
  }
}

async function iniciarVerificacao() {
  const video = document.createElement('video');
  const container = document.querySelector('.container');
  const status = document.getElementById('status');
  container.appendChild(video);

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    await video.play();

    const canvas = faceapi.createCanvasFromMedia(video);
    container.appendChild(canvas);

    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    const detections = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detections) {
      status.innerText = "✅ Rosto detectado com sucesso!";
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



