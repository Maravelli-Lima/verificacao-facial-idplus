window.onload = async () => {
  const video = document.getElementById("video");

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.onloadedmetadata = () => {
      video.play();
    };
    console.log("✅ Câmera ativada");
  } catch (err) {
    console.error("❌ Erro ao acessar a câmera:", err);
    alert("Erro ao acessar a câmera: " + err.message);
  }
};
