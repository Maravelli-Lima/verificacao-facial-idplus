async function startVerification() {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const result = document.getElementById('result');

  result.innerText = '🔄 Carregando modelos...';

  await Promise.all([
    faceapi.nets.tinyFaceDetector.load('/verificacao-facial-idplus/models'),
    faceapi.nets.faceLandmark68Net.load('/verificacao-facial-idplus/models')
  ]);

  result.innerText = '📷 Capturando vídeo...';

  const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
  video.srcObject = stream;

  video.onloadedmetadata = () => {
    video.play();
    detectarFace();
  };

  async function detectarFace() {
    const options = new faceapi.TinyFaceDetectorOptions();
    const detections = await faceapi.detectSingleFace(video, options).withFaceLandmarks();

    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    faceapi.matchDimensions(canvas, video);
    const resized = faceapi.resizeResults(detections, video);

    if (detections) {
      faceapi.draw.drawDetections(canvas, resized);
      faceapi.draw.drawFaceLandmarks(canvas, resized);
      result.innerText = '✅ Rosto detectado com sucesso!';
    } else {
      result.innerText = '❌ Nenhum rosto detectado. Tente novamente.';
    }

    setTimeout(detectarFace, 1000); // tenta a cada 1 segundo
  }
}



