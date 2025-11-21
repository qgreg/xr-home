import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// --- Scene Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202025); // Dark cozy background

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.6, 3); // Average eye height (1.6m) + distance

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.xr.enabled = true; // Enable WebXR
document.body.appendChild(renderer.domElement);

document.body.appendChild(VRButton.createButton(renderer));

// --- Controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);
controls.update();

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0x404040, 2); // Soft general light
scene.add(ambientLight);

// Warm lamp light
const lampLight = new THREE.PointLight(0xffaa55, 5, 10);
lampLight.position.set(1.2, 1.5, -1.2);
scene.add(lampLight);

// Subtle window light
const windowLight = new THREE.DirectionalLight(0xaaccff, 1);
windowLight.position.set(-2, 3, 2);
scene.add(windowLight);

// --- Cozy Room Content ---
const roomGroup = new THREE.Group();
scene.add(roomGroup);

// 1. Floor (Rug)
const rugGeometry = new THREE.CircleGeometry(2, 32);
const rugMaterial = new THREE.MeshStandardMaterial({ color: 0x885544, roughness: 0.9 });
const rug = new THREE.Mesh(rugGeometry, rugMaterial);
rug.rotation.x = -Math.PI / 2;
roomGroup.add(rug);

// 2. Armchair (Simple composition of boxes)
const chairMaterial = new THREE.MeshStandardMaterial({ color: 0xccaa88 });
const chairGroup = new THREE.Group();
roomGroup.add(chairGroup);

// Seat
const seat = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 0.8), chairMaterial);
seat.position.set(0, 0.4, 0);
chairGroup.add(seat);

// Back
const back = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.1), chairMaterial);
back.position.set(0, 0.9, -0.35);
chairGroup.add(back);

// Arms
const armGeo = new THREE.BoxGeometry(0.1, 0.4, 0.8);
const armL = new THREE.Mesh(armGeo, chairMaterial);
armL.position.set(-0.35, 0.6, 0);
chairGroup.add(armL);

const armR = new THREE.Mesh(armGeo, chairMaterial);
armR.position.set(0.35, 0.6, 0);
chairGroup.add(armR);

// Legs
const legGeo = new THREE.CylinderGeometry(0.04, 0.02, 0.3);
const legMat = new THREE.MeshStandardMaterial({ color: 0x553322 });
const positions = [
    [-0.35, 0.15, 0.35], [0.35, 0.15, 0.35],
    [-0.35, 0.15, -0.35], [0.35, 0.15, -0.35]
];
positions.forEach(pos => {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(...pos);
    chairGroup.add(leg);
});

chairGroup.position.set(0, 0, 0);
chairGroup.rotation.y = 0.2; // Slight angle

// 3. Side Table
const tableGroup = new THREE.Group();
const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.05, 32), legMat);
tableTop.position.set(0, 0.6, 0);
tableGroup.add(tableTop);
const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6), legMat);
tableLeg.position.set(0, 0.3, 0);
tableGroup.add(tableLeg);
const tableBase = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.02), legMat);
tableBase.position.set(0, 0.01, 0);
tableGroup.add(tableBase);

tableGroup.position.set(1.2, 0, -0.5);
roomGroup.add(tableGroup);

// 4. Lamp
const lampGroup = new THREE.Group();
const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.5), new THREE.MeshStandardMaterial({ color: 0x222222 }));
lampPole.position.set(0, 0.75, 0);
lampGroup.add(lampPole);
const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.3, 32, 1, true), new THREE.MeshStandardMaterial({ color: 0xffffee, transparent: true, opacity: 0.9, side: THREE.DoubleSide }));
lampShade.position.set(0, 1.5, 0);
lampGroup.add(lampShade);

lampGroup.position.copy(lampLight.position);
lampGroup.position.y = 0; // Reset Y to floor
roomGroup.add(lampGroup);

// 5. Plant
const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.1, 0.25), new THREE.MeshStandardMaterial({ color: 0xcc5522 }));
pot.position.set(0, 0.75, 0); // On top of table
tableGroup.add(pot);

const plantGeo = new THREE.DodecahedronGeometry(0.15);
const plantMat = new THREE.MeshStandardMaterial({ color: 0x44aa44 });
const plant = new THREE.Mesh(plantGeo, plantMat);
plant.position.set(0, 0.95, 0);
tableGroup.add(plant);

// --- Ready Player Me Avatar ---
const loader = new GLTFLoader();
// User's custom avatar
const avatarUrl = 'https://models.readyplayer.me/691fe9737b7a88e1f661871f.glb';

let avatar = null;
const avatarSpeed = 2.0;
const avatarTurnSpeed = 2.0;

loader.load(
    avatarUrl,
    function (gltf) {
        avatar = gltf.scene;
        avatar.scale.set(1, 1, 1);
        avatar.position.set(-1, 0, -0.5);
        avatar.rotation.y = Math.PI / 4;
        roomGroup.add(avatar);
        console.log('Avatar loaded!');
    },
    undefined,
    function (error) {
        console.error('An error occurred loading the avatar:', error);
    }
);

// --- Input Handling ---
const keyState = {};

window.addEventListener('keydown', (e) => {
    keyState[e.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (e) => {
    keyState[e.key.toLowerCase()] = false;
});

function getForwardVector(object) {
    const direction = new THREE.Vector3(0, 0, 1);
    direction.applyQuaternion(object.quaternion);
    return direction;
}

function updateAvatar(dt) {
    if (!avatar) return;

    let moveForward = 0;
    let turn = 0;

    // 1. Keyboard Input (Desktop)
    if (keyState['w'] || keyState['arrowup']) moveForward += 1;
    if (keyState['s'] || keyState['arrowdown']) moveForward -= 1;
    if (keyState['a'] || keyState['arrowleft']) turn += 1;
    if (keyState['d'] || keyState['arrowright']) turn -= 1;

    // 2. WebXR Controller Input (VR)
    const session = renderer.xr.getSession();
    if (session) {
        for (const source of session.inputSources) {
            if (source.gamepad) {
                // Left Controller (usually used for movement)
                if (source.handedness === 'left') {
                    // Up/Down on stick
                    if (Math.abs(source.gamepad.axes[3]) > 0.1) {
                        moveForward -= source.gamepad.axes[3]; // Negative is usually forward
                    }
                }

                // Right Controller (usually used for turning)
                if (source.handedness === 'right') {
                    // Left/Right on stick
                    if (Math.abs(source.gamepad.axes[2]) > 0.1) {
                        turn -= source.gamepad.axes[2];
                    }
                }
            }
        }
    }

    // Apply Movement
    if (moveForward !== 0) {
        const forward = getForwardVector(avatar);
        avatar.position.add(forward.multiplyScalar(moveForward * avatarSpeed * dt));
    }

    // Apply Turning
    if (turn !== 0) {
        avatar.rotation.y += turn * avatarTurnSpeed * dt;
    }

    // Camera Follow (Only on Desktop / Non-XR)
    if (!renderer.xr.isPresenting) {
        // Simple follow cam: Position camera behind and above avatar
        // We need to calculate the offset relative to the avatar's rotation
        const relativeOffset = new THREE.Vector3(0, 1.6, -2.5); // Behind by 2.5m, Up by 1.6m
        const cameraOffset = relativeOffset.applyMatrix4(avatar.matrixWorld);

        // Smoothly interpolate camera position
        camera.position.lerp(cameraOffset, 0.1);

        // Look at avatar (slightly above feet)
        const lookTarget = avatar.position.clone().add(new THREE.Vector3(0, 1.2, 0));
        controls.target.lerp(lookTarget, 0.1);
        controls.update();
    }
}

const clock = new THREE.Clock();

// --- Animation Loop ---
renderer.setAnimationLoop(function () {
    const dt = clock.getDelta();
    updateAvatar(dt);
    renderer.render(scene, camera);
});

// --- Resize Handler ---
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
