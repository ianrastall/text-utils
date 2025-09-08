document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const textInput = document.getElementById('text-to-speak');
    const voiceSelect = document.getElementById('voice-select');
    const speakButton = document.getElementById('speak-button');
    const stopButton = document.getElementById('stop-button');
    const rateInput = document.getElementById('rate');
    const rateValue = document.getElementById('rate-value');
    
    // State
    let voices = [];

    // --- Voice Initialization ---

    function populateVoiceList() {
        voices = speechSynthesis.getVoices();
        const selectedVoiceName = voiceSelect.value || (speechSynthesis.getVoices().find(v => v.default) || voices[0])?.name;
        voiceSelect.innerHTML = '';
        
        voices.forEach(voice => {
            const option = document.createElement('option');
            option.textContent = `${voice.name} (${voice.lang})`;
            option.value = voice.name;
            if (voice.name === selectedVoiceName) {
                option.selected = true;
            }
            voiceSelect.appendChild(option);
        });
    }

    // Populate voices when they are loaded
    speechSynthesis.onvoiceschanged = populateVoiceList;
    // Initial call in case voices are already loaded
    populateVoiceList();

    // --- Event Listeners ---

    // Update the speed display when the slider is moved
    rateInput.addEventListener('input', () => {
        rateValue.textContent = parseFloat(rateInput.value).toFixed(1);
    });

    // Speak the text
    speakButton.addEventListener('click', () => {
        const text = textInput.value.trim();
        if (!text || speechSynthesis.speaking) return;

        // Ensure any previous speech is stopped before starting a new one
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        const selectedVoice = voices.find(v => v.name === voiceSelect.value);

        utterance.voice = selectedVoice;
        utterance.rate = parseFloat(rateInput.value);
        utterance.pitch = 1; // Default pitch

        speechSynthesis.speak(utterance);
    });

    // Stop the speech
    stopButton.addEventListener('click', () => {
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
    });

    // --- Local Storage for Persistence ---

    // Load saved text from local storage if it exists
    const savedText = localStorage.getItem('tts-text');
    if (savedText) {
        textInput.value = savedText;
    }
    
    // Auto-save text to local storage on input
    textInput.addEventListener('input', () => {
        localStorage.setItem('tts-text', textInput.value);
    });
});