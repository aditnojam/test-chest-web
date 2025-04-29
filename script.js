import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let pawn, plane;
const loader = new GLTFLoader();

// Load chess pawn model (replace 'scene.gltf' with your model path)
loader.load('scene.gltf', (gltf) => {
    pawn = gltf.scene;
    pawn.scale.set(0.5, 0.5, 0.5); // Adjust scale as needed
    pawn.position.set(0, 0.5, 0);
    scene.add(pawn);
}, undefined, (error) => {
    console.error('Error loading GLTF model:', error);
});

// Create a plane as the base
const planeGeometry = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });
plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = Math.PI / 2;
scene.add(plane);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 1, 1);
scene.add(directionalLight);

// Camera position
camera.position.set(0, 2, 5);
camera.lookAt(0, 0, 0);

// Raycaster for click detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Animation variables
let targetPosition = null;
const speed = 0.05;

// Click event
window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(plane);

    if (intersects.length > 0) {
        const point = intersects[0].point;
        targetPosition = new THREE.Vector3(point.x, 0.5, point.z); // Keep pawn above plane
    }
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    if (pawn && targetPosition) {
        const direction = targetPosition.clone().sub(pawn.position);
        if (direction.length() > 0.01) {
            direction.normalize().multiplyScalar(speed);
            pawn.position.add(direction);
        } else {
            pawn.position.copy(targetPosition);
            targetPosition = null;
        }
    }

    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});