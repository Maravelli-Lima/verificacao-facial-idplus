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
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    await video.play(); // ESSENCIAL para exibir o vídeo ao vivo
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

  await new Promise(resolve => setTimeout(resolve, 200)); // Delay para garantir que o canvas atualizou

  const deteccao = await faceapi
    .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!deteccao) {
    status.textContent = "❌ Nenhum rosto detectado na referência.";
    return;
  }

  referenciaDescriptor = deteccao.descriptor;
  console.log("🔐 Referência capturada:", referenciaDescriptor);
  status.textContent = "📌 Referência capturada com sucesso.";
}

async function comparar() {
  const video = document.getElementById("video");
  const status = document.getElementById("status");

  if (!referenciaDescriptor || referenciaDescriptor.length === 0) {
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
  console.log("📏 Similaridade calculada:", distancia);

  if (distancia < 0.6) {
    status.innerHTML = `✅ Rosto compatível! Similaridade: <strong>${distancia.toFixed(2)}</strong>`;
  } else {
    status.innerHTML = `❌ Rosto diferente. Similaridade: <strong>${distancia.toFixed(2)}</strong>`;
  }
}

// Carrega modelos e ativa câmera ao abrir a página
window.onload = async () => {
  await carregarModelos();
  await iniciarCamera();
};
