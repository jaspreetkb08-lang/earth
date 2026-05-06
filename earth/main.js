// ==========================================
// Three.js Setup
// ==========================================

const canvasContainer = document.getElementById('canvas-container');

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
// Initial camera position
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
canvasContainer.appendChild(renderer.domElement);

// ==========================================
// Textures & Materials
// ==========================================
const textureLoader = new THREE.TextureLoader();

const earthMap = textureLoader.load('assets/earth_atmos_2048.jpg');
const earthNormalMap = textureLoader.load('assets/earth_normal_2048.jpg');
const earthSpecularMap = textureLoader.load('assets/earth_specular_2048.jpg');
const earthCloudsMap = textureLoader.load('assets/earth_clouds_1024.png');

// Earth Mesh
const earthGeometry = new THREE.SphereGeometry(3, 64, 64);
const earthMaterial = new THREE.MeshPhongMaterial({
    map: earthMap,
    normalMap: earthNormalMap,
    specularMap: earthSpecularMap,
    specular: new THREE.Color('grey'),
    shininess: 10
});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

// Clouds Mesh
const cloudGeometry = new THREE.SphereGeometry(3.05, 64, 64);
const cloudMaterial = new THREE.MeshPhongMaterial({
    map: earthCloudsMap,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide
});
const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
scene.add(clouds);

// ==========================================
// Lighting
// ==========================================
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(5, 3, 5);
scene.add(directionalLight);

// Point light to give it a cinematic blue glow on the dark side
const backLight = new THREE.PointLight(0x00e5ff, 1.5, 50);
backLight.position.set(-10, -5, -5);
scene.add(backLight);

// ==========================================
// Starry Background (Particles)
// ==========================================
const starsGeometry = new THREE.BufferGeometry();
const starsCount = 2000;
const posArray = new Float32Array(starsCount * 3);

for(let i = 0; i < starsCount * 3; i++) {
    // Generate stars randomly around the sphere
    posArray[i] = (Math.random() - 0.5) * 100;
}
starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const starsMaterial = new THREE.PointsMaterial({
    size: 0.05,
    color: 0xffffff,
    transparent: true,
    opacity: 0.8
});
const starsMesh = new THREE.Points(starsGeometry, starsMaterial);
scene.add(starsMesh);

// ==========================================
// Animation Loop
// ==========================================
// Position the earth slightly to the right to balance text on the left
earth.position.x = 2;
clouds.position.x = 2;

// Auto-rotation variables
let isScrolling = false;
let scrollTimeout;

function animate() {
    requestAnimationFrame(animate);

    // Natural slow rotation
    earth.rotation.y += 0.001;
    clouds.rotation.y += 0.0015;
    
    // Slow star movement
    starsMesh.rotation.y -= 0.0002;

    renderer.render(scene, camera);
}
animate();

// ==========================================
// Resize Handler
// ==========================================
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Adjust earth position for mobile
    if (window.innerWidth < 768) {
        earth.position.x = 0;
        clouds.position.x = 0;
    } else {
        earth.position.x = 2;
        clouds.position.x = 2;
    }
});

// Trigger initial resize to set position
window.dispatchEvent(new Event('resize'));

// ==========================================
// GSAP Scroll Animations
// ==========================================
gsap.registerPlugin(ScrollTrigger);

// 1. Text reveals
const revealElements = document.querySelectorAll('.gsap-reveal');
revealElements.forEach((el) => {
    gsap.to(el, {
        scrollTrigger: {
            trigger: el,
            start: "top 85%", // when top of element hits 85% of viewport
            toggleActions: "play none none reverse"
        },
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out"
    });
});

// 2. Earth Scroll Sequence
let tl = gsap.timeline({
    scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.5, // smooth scrubbing
    }
});

// Earth path as user scrolls
tl.to(earth.rotation, { x: Math.PI / 2, z: 0.5, ease: "none" }, 0)
  .to(clouds.rotation, { x: Math.PI / 2, z: 0.5, ease: "none" }, 0)
  
  // Section 2 (About) - Move earth to the left and zoom
  .to(earth.position, { x: -2, z: 2, ease: "power1.inOut" }, 0)
  .to(clouds.position, { x: -2, z: 2, ease: "power1.inOut" }, 0)
  
  // Section 3 (Features) - Move earth right and scale up massively
  .to(earth.position, { x: 3, z: 5, ease: "power1.inOut" }, 0.5)
  .to(clouds.position, { x: 3, z: 5, ease: "power1.inOut" }, 0.5)
  .to(earth.rotation, { y: Math.PI * 1.5, ease: "none" }, 0.5)
  .to(clouds.rotation, { y: Math.PI * 1.5, ease: "none" }, 0.5)
  
  // Section 4 (Footer) - Center and zoom way in to see surface detail
  .to(earth.position, { x: 0, z: 6, ease: "power2.inOut" }, 0.8)
  .to(clouds.position, { x: 0, z: 6, ease: "power2.inOut" }, 0.8)
  .to(earth.rotation, { x: Math.PI / 4, y: Math.PI * 2, ease: "none" }, 0.8)
  .to(clouds.rotation, { x: Math.PI / 4, y: Math.PI * 2, ease: "none" }, 0.8);
