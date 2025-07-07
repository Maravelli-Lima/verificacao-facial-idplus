const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';

let referenceDescriptor = null;

async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  document.getElementById('video').srcObject = stream;
}

async function loadModels() {
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
}

function captureCanvas() {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  canvas.style.display = 'block';
  const context = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas;
}

async function startVerification() {
  const result = document.getElementById('result');
  result.innerText = '🔄 Capturando referência...';
  result.style.color = 'black';

  const canvasRef = captureCanvas();
  const ref = await faceapi
    .detectSingleFace(canvasRef, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!ref) {
    result.innerText = '❌ Nenhum rosto detectado na referência.';
    return;
  }

  referenceDescriptor = ref.descriptor;
  result.innerText = '✅ Referência capturada. Aguardando para comparação...';

  setTimeout(async () => {
    const canvasComp = captureCanvas();
    const comp = await faceapi
      .detectSingleFace(canvasComp, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!comp) {
      result.innerText = '❌ Nenhum rosto detectado na verificação.';
      return;
    }

    const distance = faceapi.euclideanDistance(referenceDescriptor, comp.descriptor);
    const threshold = 0.6;
    if (distance < threshold) {
      result.innerText = '✅ Mesma pessoa (confiança alta).';
      result.style.color = 'green';
    } else {
      result.innerText = '❌ Pessoa diferente (confiança baixa).';
      result.style.color = 'red';
    }
  }, 3000);
}

loadModels().then(setupCamera);


