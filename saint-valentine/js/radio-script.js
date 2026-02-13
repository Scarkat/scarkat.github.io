const knob = document.getElementById('knob');
const freqDisplay = document.getElementById('freq-value');
const audioStatic = document.getElementById('audio-static');
const audioWhispers = document.getElementById('audio-whispers');
const audioMessage = document.getElementById('audio-message');

let isDragging = false;
let currentRotation = 0;
const targetFreq = 260.7;  // Frecuencia ganadora
const maxFreq = 600; // Definimos el nuevo máximo
let hasWon = false;

// Configurar volúmenes iniciales
audioStatic.volume = 0.8;
audioWhispers.volume = 0;
audioMessage.volume = 0;

// Función para manejar la rotación
function rotateKnob(e) {
    if (!isDragging || hasWon) return;

    const rect = knob.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = (e.clientX || e.touches[0].clientX) - centerX;
    const y = (e.clientY || e.touches[0].clientY) - centerY;
    
    let angle = Math.atan2(y, x) * (180 / Math.PI);
    angle += 90; // Ajuste de desfase
    
    knob.style.transform = `rotate(${angle}deg)`;
    updateFrequencies(angle);
}

function updateFrequencies(angle) {
    // Mapeamos el ángulo (-180 a 180) a un rango de frecuencia (0.0 a 360.0)
    // normalizedAngle va de 0 a 1.
    const normalizedAngle = (angle + 180) / 360;
    
    // Nueva fórmula: (0 + (0.x * 600))
    const freq = (normalizedAngle * maxFreq).toFixed(1);
    freqDisplay.innerText = freq;

    // Lógica de Audio
    const distance = Math.abs(freq - targetFreq);

    // Mantenemos el umbral de 3 unidades para que empiece a escucharse el mensaje,
    // pero recuerda que ahora 3 unidades en un rango de 360 es un espacio muy pequeño.
    if (distance < 5) { // Subí un poco el umbral a 5 para que el desvanecimiento sea más suave
        const clarity = 1 - (distance / 5); 
        audioMessage.volume = Math.pow(clarity, 2);
        audioStatic.volume = 1 - clarity;
        audioWhispers.volume = 0.3 * (1 - clarity); // Usando tu ajuste de 0.3
        
        const val = 150 + (clarity * 105);
        freqDisplay.style.color = `rgb(${val}, ${val}, ${val})`;
        
        // El margen de victoria debe ser muy pequeño para el reto
        if (distance < 0.1 && !hasWon) {
            checkWin();
        }
    } else {
        audioMessage.volume = 0;
        audioStatic.volume = 0.8;
        audioWhispers.volume = 0.3; // Mantenemos tus susurros constantes en el vacío
        freqDisplay.style.color = 'rgb(80, 80, 80)';
    }
}

function checkWin() {
    hasWon = true;
    freqDisplay.style.color = "rgb(255, 255, 255)";
    freqDisplay.classList.add('blink'); // Podrías añadir esta clase en CSS
    
    setTimeout(() => {
        const radioContainer = document.getElementById('radio-container');
        const continueContainer = document.getElementById('continue-container');

        radioContainer.style.opacity = '0';
        setTimeout(() => radioContainer.classList.add('hidden'), 2000);

        continueContainer.classList.remove('hidden');
        continueContainer.classList.add('show');
        // Aquí podrías detener la estática y dejar solo el audio claro
        audioStatic.pause();
    }, 2000);
}

// Eventos de Mouse/Touch
knob.addEventListener('mousedown', () => {
    isDragging = true;
    audioStatic.play();
    audioWhispers.play();
    audioMessage.play();
});

function nextStep() {
    window.location.href = 'room.html';
}
document.addEventListener('mousemove', rotateKnob);
document.addEventListener('mouseup', () => isDragging = false);