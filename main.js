import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/Addons.js';
import { Easing, Tween, update as updateTween } from 'tween';


const images = [
    'death_of_socrates.jpg',
    'starry_night.jpg',
    'the_great_wave_off_kanagawa.jpg',
    'effect_of_spring_giverny.jpg',
    'mount_corcoran.jpg',
    'a_sunday_on_la_grande_jatte.jpg'
];

const titles = [
    'The Death of Socrates',
    'Starry Night',
    'The Great Wave off Kanagawa',
    'Effect of Spring, Giverny',
    'Mount Corcoran',
    'A Sunday on La Grande Jatte'
];

const artists = [
    'Jacques-Louis David',
    'Vincent Van Gogh',
    'Katsushika Hokusai',
    'Claude Monet',
    'Albert Bierstadt',
    'George Seurat'
];


const textureLoader = new THREE.TextureLoader();

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const rootNode = new THREE.Object3D();
scene.add(rootNode);

const leftArrowTexture = textureLoader.load('chevron-left.png');
const rightArrowTexture = textureLoader.load('chevron-right.png');

let count = 6;
for (let i=0; i < count; i++) {
    const texture = textureLoader.load(images[i]);
    texture.colorSpace = THREE.SRGBColorSpace;
    const baseNode = new THREE.Object3D();
    baseNode.rotation.y = i * (2 * Math.PI / count);
    rootNode.add(baseNode);
    const border = new THREE.Mesh(
        new THREE.BoxGeometry(3.2,2.2,0.09),
        new THREE.MeshStandardMaterial({ color: 0x202020 })
    );
    border.name = `Border_${i}`;
    border.position.z = -4;
    baseNode.add(border);
    const artwork = new THREE.Mesh(
        new THREE.BoxGeometry(3,2,0.1),
        new THREE.MeshStandardMaterial({ map: texture })
    );
    artwork.name = `Art${i}`;
    artwork.position.z = -4
    baseNode.add(artwork);

    const left = new THREE.Mesh(
        new THREE.BoxGeometry(0.3,0.3,0.01),
        new THREE.MeshStandardMaterial({ map: leftArrowTexture, transparent: true})
    );
    left.name = `LeftArrow`;
    left.userData = (i === count -1) ? 0 : i + 1;
    left.material.emissive = new THREE.Color(0xffffff);
    left.position.set(-1.8, 0, -4); 
    baseNode.add(left);

    const right = new THREE.Mesh(
        new THREE.BoxGeometry(0.3,0.3,0.01),
        new THREE.MeshStandardMaterial({ map: rightArrowTexture, transparent: true})
    );
    right.name = `RightArrow`;
    right.userData = (i === 0) ? count -1 : i - 1;
    right.material.emissive = new THREE.Color(0xffffff);
    right.position.set(1.8, 0, -4); 
    baseNode.add(right);

}

const spotLight = new THREE.SpotLight(0xffffff, 100, 10.0, 0.65, 0.5);
spotLight.position.set(0, 5, 0);
spotLight.target.position.set(0,0.3,-5);
scene.add(spotLight);
scene.add(spotLight.target);

const mirror = new Reflector(
    new THREE.CircleGeometry(10),
    {
       color: 0x202020,
       textureWidth: window.innerWidth,
       textureHeight: window.innerHeight 
    }
);
mirror.position.y = -1.15;
mirror.rotateX(-Math.PI / 2);
scene.add(mirror);

function rotateGallery(direciton, newIndex) {
    const deltaY = (direciton * (2 * Math.PI / count));

    new Tween(rootNode.rotation)
    .to({ y: rootNode.rotation.y + deltaY })
    .easing(Easing.Quadratic.InOut)
    .start()
    .onStart(() => {
        document.getElementById('title').style.opacity = 0;
        document.getElementById('artist').style.opacity = 0;
    })
    .onComplete(() => {
        document.getElementById('title').innerText = titles[newIndex];
        document.getElementById('artist').innerText = artists[newIndex];
        document.getElementById('title').style.opacity = 1;
        document.getElementById('artist').style.opacity = 1;
    })
}

function animate() {
    updateTween();
	renderer.render( scene, camera );
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight);
    mirror.getRenderTarget().setSize(
        window.innerWidth,
        window.innerHeight
    );
});

window.addEventListener('click', (e) => {
    const raycaster = new THREE.Raycaster();
    const mouseNDC = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1,
    );
    raycaster.setFromCamera(mouseNDC, camera);
    const intersections = raycaster.intersectObject(rootNode, true);
    if (intersections.length > 0) {
        const obj = intersections[0].object;
        const newIndex = obj.userData;
        if(obj.name === 'LeftArrow'){
            console.log('Left arrow clicked');
            rotateGallery(-1, newIndex);
        }
        if(obj.name === 'RightArrow'){
            console.log('Right arrow clicked');
            rotateGallery(1, newIndex);
        }
    }
})

document.getElementById('title').innerText = titles[0];
document.getElementById('artist').innerText = artists[0];