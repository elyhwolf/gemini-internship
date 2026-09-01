// SoundRip — YouTube to MP3 Converter JS

async function convertYouTubeToMp3() {
  const urlInput = document.getElementById('ytUrlInput');
  const loader = document.getElementById('loaderBox');
  const resultBox = document.getElementById('resultBox');
  
  const url = urlInput.value.trim();
  if (!url) {
    alert("Please paste a valid YouTube video URL!");
    return;
  }

  // UI Loading State
  loader.style.display = 'flex';
  resultBox.style.display = 'none';

  try {
    const response = await fetch('http://localhost:5177/api/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url })
    });

    const data = await response.json();
    loader.style.display = 'none';

    if (data.success) {
      document.getElementById('trackTitle').textContent = data.title || 'YouTube Audio Track';
      document.getElementById('trackUploader').textContent = `Channel: ${data.uploader || 'YouTube'}`;
      document.getElementById('trackThumb').src = data.thumbnail || 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg';
      
      const audioPlayer = document.getElementById('audioPlayer');
      const downloadBtn = document.getElementById('downloadBtn');

      if (data.download_url) {
        audioPlayer.src = data.download_url;
        downloadBtn.href = data.download_url;
        if (data.filename) downloadBtn.setAttribute('download', data.filename);
      }

      resultBox.style.display = 'flex';
    } else {
      alert(`Conversion Error: ${data.message || 'Could not extract audio from this YouTube URL.'}`);
    }
  } catch (err) {
    loader.style.display = 'none';
    console.error("Conversion failed:", err);
    alert("Could not connect to converter server. Please ensure the Python server is running!");
  }
}
