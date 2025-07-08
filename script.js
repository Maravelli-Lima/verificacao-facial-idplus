let referenciaDescriptor = null;

async function carregarModelos() {
  const status = document.getElementById("status");
  status.textContent = "⏳ Carregando modelos...";
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('./models')
    ]);
    status.textContent = "✅ Modelos carregados. Aguardando captura.";
  } catch (e) {
    status.textContent = "❌ Erro ao carregar os modelos: " + e.message;
  }
}

async function iniciarCamera() {
  const video = document.getElementById("video");
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (err) {
    document.getElementById("status").textContent = "❌ Erro ao acessar a câmera: " + err.message;
  }
}

async function capturarReferencia() {
  const canvas = document.getElementById("canvasReferencia");
  const video = document.getElementById("video");
  const status = document.getElementById("status");

  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  canvas.style.display = "block";

  const deteccao = await faceapi
    .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!deteccao) {
    status.textContent = "❌ Nenhum rosto detectado na referência.";
    return;
  }

  referenciaDescriptor = deteccao.descriptor;
  status.textContent = "📌 Referência capturada com sucesso.";
}

async function comparar() {
  const video = document.getElementById("video");
  const status = document.getElementById("status");

  if (!referenciaDescriptor) {
    status.textContent = "⚠️ Por favor, capture uma referência primeiro.";
    return;
  }

  const deteccao = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!deteccao) {
    status.textContent = "❌ Nenhum rosto detectado ao vivo.";
    return;
  }

  const distancia = faceapi.euclideanDistance(referenciaDescriptor, deteccao.descriptor);

  if (distancia < 0.6) {
    status.innerHTML = `✅ Rosto compatível! Similaridade: ${(1 - distancia).toFixed(2)}`;
  } else {
    status.innerHTML = `❌ Rosto diferente. Similaridade: ${(1 - distancia).toFixed(2)}`;
  }
}

window.onload = async () => {
  await carregarModelos();
  await iniciarCamera();
};

