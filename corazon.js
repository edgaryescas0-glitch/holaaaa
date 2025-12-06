
// -----------------------------------
//   ESCENA
// -----------------------------------
const canvas = document.getElementById("canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 1000);
camera.position.z = 8;

const light = new THREE.PointLight(0x4ab3ff, 2, 50);
light.position.set(5, 5, 5);
scene.add(light);

// -----------------------------------
//      CORAZÓN BÁSICO INVERTIDO
// -----------------------------------
const path = new THREE.Path();

path.moveTo(0, -1.6);
path.bezierCurveTo(-3.6, 0.8, -1.8, 3.2, 0, 1.6);
path.bezierCurveTo(1.8, 3.2, 3.6, 0.8, 0, -1.6);

const puntos = path.getPoints(200);
const geoLinea = new THREE.BufferGeometry().setFromPoints(puntos);

const matLinea = new THREE.LineBasicMaterial({
    color: 0x00aaff,
    linewidth: 5,
});

const corazon = new THREE.Line(geoLinea, matLinea);
scene.add(corazon);

// -----------------------------------
//   PARTÍCULAS FLOTANDO
// -----------------------------------
const totalParticulas = 200;
const particulasGeometry = new THREE.BufferGeometry();

let posiciones = new Float32Array(totalParticulas * 3);

for (let i = 0; i < totalParticulas; i++) {
    let radius = 4 + Math.random() * 3;
    let angle = Math.random() * Math.PI * 2;
    let height = (Math.random() - 0.5) * 3;

    posiciones[i * 3]     = Math.cos(angle) * radius;
    posiciones[i * 3 + 1] = height;
    posiciones[i * 3 + 2] = Math.sin(angle) * radius;
}

particulasGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(posiciones, 3)
);

const particulasMaterial = new THREE.PointsMaterial({
    color: 0x4ab3ff,
    size: 0.08,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const particulas = new THREE.Points(particulasGeometry, particulasMaterial);
scene.add(particulas);

function animarParticulas() {
    const posiciones = particulas.geometry.attributes.position.array;

    for (let i = 0; i < totalParticulas; i++) {
        let index = i * 3;

        posiciones[index + 1] += Math.sin(Date.now() * 0.001 + i) * 0.002;

        let x = posiciones[index];
        let z = posiciones[index + 2];
        let angle = 0.002;

        posiciones[index]     = x * Math.cos(angle) - z * Math.sin(angle);
        posiciones[index + 2] = x * Math.sin(angle) + z * Math.cos(angle);
    }

    particulas.geometry.attributes.position.needsUpdate = true;
}
//musica
const listener = new THREE.AudioListener();
camera.add(listener);

const audio = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();

audioLoader.load("musica.mp3", buffer => {
    audio.setBuffer(buffer);
    audio.setLoop(true);
    audio.setVolume(1);
});


// Play al primer clic
window.addEventListener("click", () => {

    // 🔥 Desbloqueo obligatorio en navegadores modernos
    if (audio.context.state === "suspended") {
        audio.context.resume();
    }

    if (!audio.isPlaying) {
        audio.play();
        console.log("Audio iniciado");
    }
});

let analyser = new THREE.AudioAnalyser(audio, 128);



// ondas
const canvasOndas = document.getElementById("ondas");
const ctx = canvasOndas.getContext("2d");

// 🔥 IMPORTANTE: asignar tamaño al inicio
canvasOndas.width = window.innerWidth;
canvasOndas.height = 150;

function dibujarOndas(dataArray) {
    ctx.clearRect(0, 0, canvasOndas.width, canvasOndas.height);

    ctx.beginPath();

    const mitad = canvasOndas.width / 2;
    const slice = mitad / (dataArray.length - 1);

    //izquierda
    for (let i = dataArray.length - 1; i >= 0; i--) {
        let x = mitad - i * slice;
        let y = canvasOndas.height - (dataArray[i] / 255) * canvasOndas.height;

        if (i === dataArray.length - 1) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }

    //derecha
    for (let i = 0; i < dataArray.length; i++) {
        let x = mitad + i * slice;
        let y = canvasOndas.height - (dataArray[i] / 255) * canvasOndas.height;

        ctx.lineTo(x, y);
    }

    ctx.strokeStyle = "#ff0000ff";
    ctx.lineWidth = 3;
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#ff0000ff";
    ctx.stroke();
}





//animacion
function animar() {
    requestAnimationFrame(animar);

    let data = analyser.getFrequencyData();
    let avg = analyser.getAverageFrequency();

    let escala = 1 + avg / 250;
    corazon.scale.set(escala, escala, escala);

    corazon.rotation.y += 0.02;

    animarParticulas();
    dibujarOndas(data);

    renderer.render(scene, camera);
}
animar();

window.addEventListener("resize", () => {
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();

    canvasOndas.width = innerWidth;
    canvasOndas.height = 150;
});




