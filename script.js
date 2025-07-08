let referenciaDescriptor = null;

async function carregarModelos() {
  const status = document.getElementById("status");
  status.textContent = "⏳ Carregando modelos...";
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('./models')
  ]);
  status.textContent = "✅ Modelos carregados. Aguardando captura.";
}

async function iniciarCamera() {
  const video = document.getElementById("video");
  const status = document.getElementById("status");

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    video.onloadedmetadata = () => {
      video.play().catch((err) => {
        status.textContent = "❌ Erro ao iniciar vídeo: " + err.message;
      });
    };
  } catch (err) {
    status.textContent = "❌ Erro ao acessar a câmera: " + err.message;
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
  console.log("📏 Similaridade:", distancia);

  if (distancia < 0.6) {
    status.innerHTML = `✅ Rosto compatível! Similaridade: <strong>${distancia.toFixed(4)}</strong>`;
  } else {
    status.innerHTML = `❌ Rosto diferente. Similaridade: <strong>${distancia.toFixed(4)}</strong>`;
  }
}

window.onload = async () => {
  await carregarModelos();
  await iniciarCamera();
};
