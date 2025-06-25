import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x20232a);

const makePerspectiveCamera = () => {
    return new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
}

const makeOrhtoCamera = () => {
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 20;

    const camera = new THREE.OrthographicCamera(
      -frustumSize * aspect / 2,  // left
      frustumSize * aspect / 2,   // right
      frustumSize / 2,            // top
      -frustumSize / 2,           // bottom
      0.1,                        // near
      200                        // far
    );

    camera.updateView = () => {
        const aspect = window.innerWidth / window.innerHeight;
        const frustumSize = 20;

        camera.left = -frustumSize * aspect / 2;
        camera.right = frustumSize * aspect / 2;
        camera.top = frustumSize / 2;
        camera.bottom = -frustumSize / 2;

        camera.updateProjectionMatrix();
    }

    return camera;
}

const fitViewOnModel = () => {
        // Центровка камеры на модель
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    const fov = (camera.fov || 100) * (Math.PI / 180);

    box.getSize(size);
    box.getCenter(center);

    // Подгонка камеры под размер объекта
    const maxDim = Math.max(size.x, size.y, size.z);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

    cameraZ *= 10; // немного отступа

    camera.position.set(center.x + cameraZ, center.y + cameraZ, center.z + cameraZ);
    camera.lookAt(center);

    controls.target.copy(center);
}

const camera = makeOrhtoCamera();

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

document.body.appendChild(renderer.domElement);

// Управление мышью
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Амбиентный свет (мягкий равномерный)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

// Направленный свет
const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
dirLight.position.set(5, 10, 7.5);
scene.add(dirLight);

// ✅ Сетка как в CAD
const size = 100; // общий размер
const divisions = 100; // шаг

const gridHelper = new THREE.GridHelper(size, divisions, 0x888888, 0x444444);
gridHelper.material.opacity = 0.5;
gridHelper.material.transparent = true;
scene.add(gridHelper);

const axesHelper = new THREE.AxesHelper(2); // длина осей = 2
scene.add(axesHelper);

// HDRI-фон и освещение
new RGBELoader()
  .load('bloem_field_sunrise_2k.hdr', function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    //scene.background = texture;
  });

let model = null

const loader = new GLTFLoader();
loader.load('/model.glb', (gltf) => {
    model = gltf.scene;

    scene.add(model);

    fitViewOnModel();

}, undefined, (error) => {
  console.error(error);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Обработка ресайза окна
window.addEventListener('resize', () => {
    camera.updateView();

    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Обновление модели без перезагрузки страницы
if (import.meta.hot) {
import.meta.hot.on('model-update', () => {
  loader.load('model.glb?cb=' + Date.now(), (gltf) => {

    // удаляем предыдущие
    scene.remove(model);

    model = gltf.scene;
    scene.add(model);

    console.log('🔁 Модель обновлена');
  });
});
}