// Secuencia: F3, C4, F4, G4, F4, C4, A3, C4
const secretCombo = ['F3', 'C4', 'F4', 'G4', 'F4', 'C4', 'A3', 'C4'];
let userInput = [];
let sampler;
let reverb; // Variable para el efecto de reverb
let hintTimer;
let isGameActive = false; // Para evitar tocar cuando se desvanece

// --- Inicialización de Audio con Reverb ---
reverb = new Tone.Reverb({
    decay: 6,      // Duración del eco (en segundos). Más alto = sala más grande.
    wet: 0.6,      // Cantidad de efecto (0 a 1). 0.6 es bastante "mojado".
    preDelay: 0.1  // Pequeño retraso antes de que empiece el reverb
}).toDestination();

// Esperamos a que el reverb genere su impulso
reverb.generate();

sampler = new Tone.Sampler({
    urls: { "A1": "A1.mp3", "A2": "A2.mp3", "C4": "C4.mp3", "A4": "A4.mp3" },
    baseUrl: "https://tonejs.github.io/audio/salamander/",
    onload: () => {
        document.getElementById('loading-text').innerText = "Todo está en silencio. Haz clic.";
    }
    // IMPORTANTE: Conectamos al Reverb, no directamente al destino
}).connect(reverb);


// --- Controladores de Eventos ---
document.getElementById('start-overlay').addEventListener('click', async () => {
    await Tone.start();
    isGameActive = true;
    document.getElementById('start-overlay').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('start-overlay').style.display = 'none';
        resetHintTimer();
    }, 1500);
});

document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('mousedown', () => {
        if(!isGameActive) return;
        const note = key.dataset.note + key.dataset.octave;
        playNote(note, key);
    });
});

// --- Lógica del Juego ---
function playNote(note, element) {
    // Reproducir con reverb
    sampler.triggerAttackRelease(note, "2n");
    
    element.classList.add('playing');
    setTimeout(() => element.classList.remove('playing'), 200);

    const nextCorrectNote = secretCombo[userInput.length];
    
    if (note === nextCorrectNote) {
        userInput.push(note);
        resetHintTimer();
        if (userInput.length === secretCombo.length) win();
    } else {
        triggerError();
        userInput = [];
        resetHintTimer();
    }
}

function triggerError() {
    const v = document.getElementById('vignette');
    v.style.boxShadow = "inset 0 0 200px rgba(180, 0, 0, 0.7)";
    setTimeout(() => v.style.boxShadow = "inset 0 0 150px rgba(0,0,0,0.9)", 500);
}

function resetHintTimer() {
    clearTimeout(hintTimer);
    document.querySelectorAll('.key').forEach(k => k.classList.remove('hint'));
    
    hintTimer = setTimeout(() => {
        if(!isGameActive) return;
        const nextNote = secretCombo[userInput.length];
        const [n, o] = [nextNote.slice(0, -1), nextNote.slice(-1)];
        const keyToHint = document.querySelector(`.key[data-note="${n}"][data-octave="${o}"]`);
        if (keyToHint) keyToHint.classList.add('hint');
    }, 8000);
}

// --- Transición Final ---
function win() {
    isGameActive = false;
    clearTimeout(hintTimer);
    document.querySelectorAll('.key').forEach(k => k.classList.remove('hint'));

    const gameContainer = document.getElementById('game-container');
    const continueContainer = document.getElementById('continue-container');
    const finalSong = document.getElementById('final-song');

    // 1. Empezar el desvanecimiento visual del piano
    gameContainer.style.opacity = '0';

    // 2. Esperar un poco y reproducir la canción real
    setTimeout(() => {
        // Intenta reproducir el audio. Nota: requiere que el usuario haya interactuado antes.
        finalSong.volume = 0.5; // Volumen inicial al 50%
        finalSong.play().catch(e => console.log("Error reproduciendo audio final:", e));
        
        // Hacer un fade-in de volumen para la canción (opcional pero elegante)
        let vol = 0.5;
        const fadeAudio = setInterval(() => {
            if (vol < 1.0) {
                vol += 0.05;
                finalSong.volume = Math.min(vol, 1.0);
            } else {
                clearInterval(fadeAudio);
            }
        }, 200);

    }, 1000);

    // 3. Ocultar el piano y mostrar el botón después del desvanecimiento
    setTimeout(() => {
        gameContainer.classList.add('hidden');
        continueContainer.classList.remove('hidden');
        continueContainer.classList.add('show');
        // Removemos fade-in-slow después para que no afecte interacciones futuras
        setTimeout(() => continueContainer.classList.remove('fade-in-slow'), 4100);
    }, 3000); // Espera 3 segundos (lo que dura la transición CSS de opacidad)
}

function nextStep() {
    window.location.href = 'radio.html';
}