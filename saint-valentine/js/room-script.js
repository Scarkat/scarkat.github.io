let piecesFound = 0;
const totalPieces = 3;
let isGameStarted = false;
let isZoomed = false; // Para bloquear la linterna si estamos en zoom

const overlay = document.getElementById('flashlight-overlay');
const clickScreen = document.getElementById('click-to-illuminate');
const roomItems = document.querySelectorAll('.item');

// Elementos del Zoom
const zoomModal = document.getElementById('zoom-modal');
const zoomedImage = document.getElementById('zoomed-image');
const zoomedCaption = document.getElementById('zoomed-caption');

// Elementos del Final
const finalContainer = document.getElementById('final-step-container');
const finishBtn = document.getElementById('finish-btn');

// --- INICIO DEL JUEGO ---
clickScreen.addEventListener('click', () => {
    isGameStarted = true;
    clickScreen.style.opacity = '0';
    document.getElementById('snd-ambient').play();
    setTimeout(() => clickScreen.style.display = 'none', 2000);
});

// --- MOVIMIENTO DE LINTERNA ---
document.addEventListener('mousemove', (e) => {
    if (!isGameStarted || isZoomed) return; // Si está en zoom, la linterna no se mueve
    
    overlay.style.setProperty('--x', e.clientX + 'px');
    overlay.style.setProperty('--y', e.clientY + 'px');

    checkProximity(e.clientX, e.clientY);
});

function checkProximity(x, y) {
    roomItems.forEach(item => {
        const rect = item.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.hypot(x - centerX, y - centerY);

        if (distance < 150) {
            item.classList.add('illuminated');
        } else {
            item.classList.remove('illuminated');
        }
    });
}

// --- LÓGICA DE CLIC EN LAS FOTOS (ZOOM Y RECOLECCIÓN) ---
roomItems.forEach(item => {
    if(item.classList.contains('memory-piece')) {
        item.addEventListener('click', () => {
            // Solo funciona si está iluminada por la linterna
            if(!item.classList.contains('illuminated')) return;

            // 1. Recolectar (si no lo estaba ya)
            if (!item.classList.contains('collected')) {
                collectPiece(item);
            }

            // 2. Activar Zoom (Petición 2)
            openZoom(item);
        });
    }
});

function collectPiece(item) {
    item.classList.add('collected');
    piecesFound++;
    
    document.getElementById('snd-find').currentTime = 0;
    document.getElementById('snd-find').play();
    
    const progress = (piecesFound / totalPieces) * 100;
    document.getElementById('fill').style.width = `${progress}%`;

    if (piecesFound === totalPieces) {
        showFinalButton(); // CAMBIO: Ya no llamamos a endGame() directamente
    }
}

// --- FUNCIONES DE ZOOM ---
function openZoom(item) {
    isZoomed = true; // Bloquea el movimiento de la linterna
    const imgSrc = item.querySelector('img').src;
    const captionText = item.getAttribute('data-info');

    zoomedImage.src = imgSrc;
    zoomedCaption.innerText = captionText;
    
    // 1. ELIMINAR 'hidden' para permitir que el display sea 'flex'
    zoomModal.classList.remove('hidden');
    
    // 2. Añadir 'active' después de un breve instante para que la transición de opacidad funcione
    setTimeout(() => {
        zoomModal.classList.add('active');
    }, 10);

    // Opcional: Ocultar el círculo de la linterna para que no estorbe el zoom
    overlay.style.opacity = '0';
}

// Cerrar zoom al hacer clic fuera de la imagen (en el fondo del modal)
zoomModal.addEventListener('click', (e) => {
    if(e.target === zoomModal || e.target.classList.contains('close-hint')) {
        closeZoom();
    }
});

function closeZoom() {
    // 1. Quitar la clase de animación
    zoomModal.classList.remove('active');
    
    // 2. Esperar a que termine la transición de opacidad (500ms en tu CSS) para volver a poner 'hidden'
    setTimeout(() => {
        if (!isZoomed) { // Doble verificación por si se abrió otra foto rápido
            zoomModal.classList.add('hidden');
        }
    }, 500);

    isZoomed = false; // Desbloquea la linterna
    overlay.style.opacity = '1'; // Vuelve a mostrar la linterna
}

// --- LÓGICA DEL FINAL MANUAL (Petición 3) ---
function showFinalButton() {
    // Muestra el botón en lugar de terminar el juego
    setTimeout(() => {
        finalContainer.classList.remove('hidden');
    }, 1000);
}

// Listener para el botón final
finishBtn.addEventListener('click', () => {
    finalContainer.classList.add('hidden'); // Oculta el botón
    closeZoom(); // Asegura que el zoom esté cerrado
    endGame(); // Ahora sí, ejecuta la transición final
});


function endGame() {
    // El efecto de "flash-out" original
    setTimeout(() => {
        const flash = document.createElement('div');
        flash.className = 'flash-out';
        document.body.appendChild(flash);

        // Desvanecer audio lentamente (opcional pero recomendado)
        const ambient = document.getElementById('snd-ambient');
        let vol = 1;
        const fade = setInterval(() => {
            if(vol > 0) {
                vol -= 0.1;
                ambient.volume = vol.toFixed(1);
            } else {
                clearInterval(fade);
                ambient.pause();
            }
        }, 200);

        setTimeout(() => {
            // AQUÍ VA LA URL DE TU PÁGINA FINAL DE PROPUESTA
            window.location.href = "final.html";
            console.log("Transición a la página final..."); 
        }, 3000);
    }, 500);
}