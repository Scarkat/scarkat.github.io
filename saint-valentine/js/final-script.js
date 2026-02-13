const envelope = document.getElementById('envelope-wrapper');
const letter = document.getElementById('letter-container');
const noBtn = document.getElementById('no-btn');
const yesBtn = document.getElementById('yes-btn');
const sndFinal = document.getElementById('snd-final');

// Abrir el sobre con efecto fade-out y fade-in
envelope.addEventListener('click', () => {
    // 1. Activar sonidos inmediatamente
    document.getElementById('snd-open').play();
    
    // Iniciar música con un pequeño fade in de volumen
    sndFinal.volume = 0;
    sndFinal.play();
    let vol = 0;
    let fadeMusic = setInterval(() => {
        if (vol < 0.6) {
            vol += 0.05;
            sndFinal.volume = vol;
        } else {
            clearInterval(fadeMusic);
        }
    }, 200);

    // 2. Desaparecer el sobre (Fade-out)
    envelope.classList.add('fade-out');

    // 3. Aparecer la carta (Fade-in) tras un breve retraso
    setTimeout(() => {
        envelope.style.display = 'none';
        letter.classList.remove('hidden');
        // Pequeño delay para que el navegador registre la eliminación de hidden
        setTimeout(() => {
            letter.classList.add('fade-in');
        }, 50);
    }, 1500);
});

// El truco del botón "NO" se mantiene igual
noBtn.addEventListener('mouseover', () => {
    const x = Math.random() * (window.innerWidth - 120);
    const y = Math.random() * (window.innerHeight - 50);
    
    noBtn.style.position = 'fixed';
    noBtn.style.left = x + 'px';
    noBtn.style.top = y + 'px';
});

yesBtn.addEventListener('click', () => {
    // Aquí puedes añadir el confeti si decides usar la librería
    alert("Felicidades, has hecho a alguien muy feliz en alguna parte del mundo. ❤️ Gracias por jugar y no olvides tomar captura :) t amu");
});