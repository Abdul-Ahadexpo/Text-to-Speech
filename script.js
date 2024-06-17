const speakBtn = document.getElementById('speak-btn');
const saveBtn = document.getElementById('save-btn');
const inputText = document.getElementById('input-text');
const voiceSelect = document.getElementById('voice-select');
const rateSlider = document.getElementById('rate-slider');
const pitchSlider = document.getElementById('pitch-slider');
const volumeSlider = document.getElementById('volume-slider');
const rateValue = document.getElementById('rate-value');
const pitchValue = document.getElementById('pitch-value');
const volumeValue = document.getElementById('volume-value');
const realtimeCheckbox = document.getElementById('realtime-checkbox');

let voices = [];
let utterance = null;
let isRealtime = false; // Default: Real-time playback is off

// Fetch list of voices available in the browser
speechSynthesis.onvoiceschanged = () => {
  voices = speechSynthesis.getVoices();
  populateVoiceList();
};

function populateVoiceList() {
  voiceSelect.innerHTML = ''; // Clear existing options

  // Filter voices to include only those with specified attributes
  const filteredVoices = voices.filter(voice => voice.lang.includes('en')); // Filter English voices as an example

  filteredVoices.forEach((voice, index) => {
    const option = document.createElement('option');
    option.textContent = `${voice.name} (${voice.lang})`;
    option.value = index;
    voiceSelect.appendChild(option);
  });
}

rateSlider.addEventListener('input', () => {
  rateValue.textContent = rateSlider.value;
  if (utterance) {
    utterance.rate = rateSlider.value;
  }
});

pitchSlider.addEventListener('input', () => {
  pitchValue.textContent = pitchSlider.value;
  if (utterance) {
    utterance.pitch = pitchSlider.value;
  }
});

volumeSlider.addEventListener('input', () => {
  volumeValue.textContent = volumeSlider.value;
  if (utterance) {
    utterance.volume = volumeSlider.value;
  }
});

speakBtn.addEventListener('click', () => {
  speak();
});

saveBtn.addEventListener('click', () => {
  saveSpeech();
});

inputText.addEventListener('input', () => {
  if (isRealtime) {
    speak();
  }
});

realtimeCheckbox.addEventListener('change', () => {
  isRealtime = realtimeCheckbox.checked;
  if (!isRealtime && utterance) {
    speechSynthesis.cancel();
    utterance = null;
  }
});

function speak() {
  const textToSpeak = inputText.value.trim();
  const selectedVoiceIndex = voiceSelect.value;
  const rate = rateSlider.value;
  const pitch = pitchSlider.value;
  const volume = volumeSlider.value;

  if (textToSpeak !== '') {
    if (utterance) {
      speechSynthesis.cancel();
    }
    utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.voice = voices[selectedVoiceIndex];
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    speechSynthesis.speak(utterance);
  }
}

async function saveSpeech() {
  const textToSpeak = inputText.value.trim();
  const selectedVoiceIndex = voiceSelect.value;
  const rate = rateSlider.value;
  const pitch = pitchSlider.value;
  const volume = volumeSlider.value;

  if (textToSpeak !== '') {
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.voice = voices[selectedVoiceIndex];
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const destination = audioContext.createMediaStreamDestination();
    const mediaRecorder = new MediaRecorder(destination.stream);
    const chunks = [];

    mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'speech.wav';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    mediaRecorder.start();

    const source = audioContext.createMediaStreamSource(destination.stream);
    source.connect(audioContext.destination);

    utterance.onend = () => {
      mediaRecorder.stop();
      audioContext.close();
    };

    speechSynthesis.speak(utterance);
  }
}
