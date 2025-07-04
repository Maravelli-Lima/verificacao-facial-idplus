<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>IDPlus - Verificação Facial</title>
  <style>
    body { font-family: sans-serif; background: #f4f4f4; text-align: center; padding: 2em; }
    .container { background: white; padding: 2em; max-width: 600px; margin: auto; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .logo { width: 150px; margin-bottom: 1em; }
    video, canvas { border-radius: 8px; margin: 1em 0; width: 100%; max-width: 400px; }
    button { background: #006eff; color: white; border: none; padding: 1em 2em; font-size: 1em; border-radius: 5px; cursor: pointer; }
    button:hover { background: #0056cc; }
    #result { font-size: 1.2em; font-weight: bold; margin-top: 1em; }
  </style>
  <script defer src="https://cdn.jsdelivr.net/npm/face-api.js"></script>
</head>
<body>
  <div class="container">
    <img src="https://cloud.tencent.com/favicon.ico" alt="IDPlus" class="logo" />
    <h1>Verificação Facial - IDPlus</h1>
    <p>Pressione o botão abaixo para iniciar a verificação.</p>

    <!-- Câmera -->
    <video id="video" autoplay playsinline></video>

    <!-- Botão único -->
    <br />
    <button onclick="startVerification()">Iniciar Verificação</button>

    <!-- Imagem capturada -->
    <canvas id="canvas" style="display:none;"></canvas>

    <!-- Resultado -->
    <div id="result"></div>
  </div>

  <script>
    let referenceDescriptor = null;

    async function setupCamera() {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      document.getElementById('video').srcObject = stream;
    }

    async function loadModels() {
      const url = 'https://cdn.jsdelivr.net/npm/face-api.js/models';
      await faceapi.nets.tinyFaceDetector.loadFromUri(url);
      await faceapi.nets.faceLandmark68Net.loadFromUri(url);
      await faceapi.nets.faceRecognitionNet.loadFromUri(url);
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
      const ref = await faceapi.detectSingleFace(canvasRef, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();

      if (!ref) {
        result.innerText = '❌ Nenhum rosto detectado na referência.';
        return;
      }

      referenceDescriptor = ref.descriptor;
      result.innerText = '✅ Referência capturada. Aguardando para comparação...';

      setTimeout(async () => {
        const canvasComp = captureCanvas();
        const comp = await faceapi.detectSingleFace(canvasComp, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();

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
  </script>
</body>
</html>

