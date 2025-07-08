let referenceDescriptor = null;

async function loadModels() {
  await faceapi.nets.tinyFaceDetector.loadFromUri('./models');
  await faceapi.nets.faceLandmark68Net.loadFromUri('./models');
  await faceapi.nets.faceRecognitionNet.loadFromUri('./models');
}

async function setupCamera() {
  const video = document.getElementById('video');
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  return new Promise(r => video.onloadedmetadata = r);
}

async function handleDocumentUpload() {
  const input = document.getElementById('docInput');
  const img = document.getElementById('docPreview');
  
  input.addEventListener('change', async () => {
    const file = input.files[0];
    if (!file) return;
    img.src = URL.createObjectURL(file);
    await img.decode();
    
    const det = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
                           .withFaceLandmarks().withFaceDescriptor();
    document.getElementById('status').textContent = det
      ? '✅ Documento processado com sucesso.'
      : '❌ Não detectou rosto no documento.';
    referenceDescriptor = det?.descriptor || null;
  });
}

async function captureAndCompare() {
  const canvas = document.getElementById('canvas');
  const video = document.getElementById('video');
  const status = document.getElementById('status');
  
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  const det = await faceapi.detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
                       .withFaceLandmarks().withFaceDescriptor();
  if (!det) {
    status.textContent = '❌ Não detectou rosto na selfie.';
    return;
  }
  if (!referenceDescriptor) {
    status.textContent = '⚠️ Envie a foto do documento antes.';
    return;
  }
  
  const dist = faceapi.euclideanDistance(referenceDescriptor, det.descriptor);
  status.textContent = dist < 0.6
    ? `✅ Mesma pessoa! Similaridade: ${dist.toFixed(3)}`
    : `❌ Pessoa diferente. Similaridade: ${dist.toFixed(3)}`;
}

window.onload = async () => {
  await loadModels();
  await handleDocumentUpload();
  await setupCamera();

  document.getElementById('startBtn')
    .addEventListener('click', captureAndCompare);

  document.getElementById('status')
    .textContent = 'Tudo pronto 🎯 Faça o upload e inicie a selfie.';
};
