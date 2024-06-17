const speakBtn = document.getElementById('speak-btn');
const saveBtn = document.getElementById('save-btn');
const inputText = document.getElementById('input-text');
const voiceSelect = document.getElementById('voice-select');
const rateSlider = document.getElementById('rate-slider');
const rateValue = document.getElementById('rate-value');

// Fetch list of voices available in the browser
let voices = [];
speechSynthesis.onvoiceschanged = () => {
  voices = speechSynthesis.getVoices();
  populateVoiceList();
};

function populateVoiceList() {
  voices.forEach((voice, index) => {
    const option = document.createElement('option');
    option.textContent = `${voice.name} (${voice.lang})`;
    option.value = index;
    voiceSelect.appendChild(option);
  });
}

rateSlider.addEventListener('input', () => {
  rateValue.textContent = rateSlider.value;
});

speakBtn.addEventListener('click', () => {
  const textToSpeak = inputText.value.trim();
  const selectedVoiceIndex = voiceSelect.value;
  const rate = rateSlider.value;

  if (textToSpeak !== '') {
    speak(textToSpeak, selectedVoiceIndex, rate);
  } else {
    alert('Please enter some text to speak.');
  }
});

saveBtn.addEventListener('click', () => {
  const textToSpeak = inputText.value.trim();
  const selectedVoiceIndex = voiceSelect.value;
  const rate = rateSlider.value;

  if (textToSpeak !== '') {
    saveSpeech(textToSpeak, selectedVoiceIndex, rate);
  } else {
    alert('Please enter some text to save.');
  }
});

function speak(text, voiceIndex, rate) {
  const utterance = new SpeechSynthesisUtterance(text);

  if (voiceIndex && voices[voiceIndex]) {
    utterance.voice = voices[voiceIndex];
  }

  utterance.rate = rate; // Speech rate: 0.1 to 2

  speechSynthesis.speak(utterance);
}

function saveSpeech(text, voiceIndex, rate) {
  const utterance = new SpeechSynthesisUtterance(text);

  if (voiceIndex && voices[voiceIndex]) {
    utterance.voice = voices[voiceIndex];
  }

  utterance.rate = rate; // Speech rate: 0.1 to 2

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
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  mediaRecorder.start();

  const source = audioContext.createMediaStreamSource(destination.stream);
  source.connect(audioContext.destination);

  utterance.onend = () => {
    mediaRecorder.stop();
    audioContext.close();
  };

  // Connect the utterance to the destination node
  speechSynthesis.speak(utterance);
}
