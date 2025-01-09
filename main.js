import * as THREE from 'three';
import TWEEN from 'three/addons/libs/tween.module.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

let camera, scene, renderer;
let controls;

const objects = [];
const targets = { table: [], sphere: [], helix: [], grid: [] };

init();
animate();

function init() {
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 3000;

    scene = new THREE.Scene();

    fetch('https://sheetdb.io/api/v1/ko70jl7ke64px')
        .then((response) => response.json())
        .then((data) => {
            populateScene(data);
            createTransformations(); // Generate transformations for sphere, helix, and grid
            transform(targets.table, 2000); // Start with the table layout
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
        });

    renderer = new CSS3DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    controls = new TrackballControls(camera, renderer.domElement);
    controls.minDistance = 500;
    controls.maxDistance = 6000;
    controls.addEventListener('change', render);

    document.getElementById('table').addEventListener('click', () => transform(targets.table, 2000));
    document.getElementById('sphere').addEventListener('click', () => transform(targets.sphere, 2000));
    document.getElementById('helix').addEventListener('click', () => transform(targets.helix, 2000));
    document.getElementById('grid').addEventListener('click', () => transform(targets.grid, 2000));

    window.addEventListener('resize', onWindowResize);
}

function populateScene(data) {
    data.forEach((entry, i) => {
        const element = document.createElement('div');
        element.className = 'element';

        // Set background color based on NetWorth
        const netWorth = parseFloat(entry.NetWorth.replace(/[^0-9.-]+/g, "")); // Remove dollar sign and any non-numeric characters

        // Set the black background as the base
        element.style.backgroundColor = 'black';

        // Apply a thin layer of color on the surface using box-shadow
        if (netWorth <= 100000) {
            element.style.backgroundImage = 'linear-gradient(rgba(255, 0, 0, 0.1), rgba(255, 0, 0, 0.1))'; // Thin Red layer on top of black
            element.style.border = '1px solid rgba(239, 48, 34, 0.7)'; // Red border
            element.style.boxShadow = '0px 0px 8px rgba(239, 48, 34, 0.6)';
        } else if (netWorth > 100000 && netWorth <= 200000) {
            element.style.backgroundImage = 'linear-gradient(rgba(255, 165, 0, 0.1), rgba(255, 165, 0, 0.1))'; // Thin Orange layer on top of black
            element.style.border = '1px solid rgba(255, 255, 102, 0.7)'; // Orange border
            element.style.boxShadow = '0px 0px 8px rgba(255, 255, 102, 0.6)';
        } else {
            element.style.backgroundImage = 'linear-gradient(rgba(255, 255, 0, 0.1), rgba(255, 255, 0, 0.1))'; // Thin Yellow layer on top of black
            element.style.border = '1px solid rgba(144, 238, 144, 0.7)'; // Yellow border
            element.style.boxShadow = '0px 0px 8px rgba(144, 238, 144, 0.6)';
        }
        const photo = document.createElement('img');
        photo.className = 'photo';
        photo.src = entry.Photo;
        element.appendChild(photo);

        const age = document.createElement('div');
        age.className = 'age';
        age.textContent = parseFloat(entry.Age);
        element.appendChild(age);

        const country = document.createElement('div');
        country.className = 'country';
        country.textContent = entry.Country;
        element.appendChild(country);

        const name = document.createElement( 'div' );
        name.className = 'name';
        name.innerHTML = entry.Name;
        element.appendChild(name);

        const interest = document.createElement( 'div' );
        interest.className = 'interest';
        interest.innerHTML = entry.Interest;
        element.appendChild(interest);

        const objectCSS = new CSS3DObject(element);
        objectCSS.position.x = Math.random() * 4000 - 2000;
        objectCSS.position.y = Math.random() * 4000 - 2000;
        objectCSS.position.z = Math.random() * 4000 - 2000;
        scene.add(objectCSS);

        objects.push(objectCSS);

        const group = i % 20; // Max of 18 groups
        const period = Math.floor(i / 20); // Max of 7 periods

        const object = new THREE.Object3D();
        object.position.x = (group - 9) * 140; // Spread out horizontally for each group
        object.position.y = (period - 3) * 180; // Spread out vertically for each period
        targets.table.push(object);
    });
}

function createTransformations() {
    const vector = new THREE.Vector3();

    // Sphere
    for (let i = 0, l = objects.length; i < l; i++) {
        const phi = Math.acos(-1 + (2 * i) / l);
        const theta = Math.sqrt(l * Math.PI) * phi;

        const object = new THREE.Object3D();
        object.position.setFromSphericalCoords(800, phi, theta);

        vector.copy(object.position).multiplyScalar(2);
        object.lookAt(vector);

        targets.sphere.push(object);
    }

// Double Helix
// DNA-like Double Helix with Opposite Curvatures and Congruent Spirals
// DNA-like Double Helix with Consistent Spiraling
// Double Helix with Regular Spiral and Congruent Curves
for (let i = 0, l = objects.length; i < l; i++) {
    const angleStep = 0.15;  // Regular angle increment for a steady spiral
    const radius = 1150;  // Constant radius for the helix curve
    const heightStep = 25;  // Even vertical spacing
    const separation = 100;  // Separation between the two helices

    // Regular vertical progression with consistent curvature
    const y1 = i * heightStep;  // Vertical step for helix 1
    const y2 = i * heightStep;  // Same vertical step for helix 2

    // Helix 1 (Clockwise)
    const theta1 = i * angleStep;  // Regular angle increment for helix 1
    const object1 = new THREE.Object3D();
    object1.position.setFromCylindricalCoords(radius + separation, theta1, y1);

    // Helix 2 (Counterclockwise)
    const theta2 = -i * angleStep;  // Opposite direction for helix 2
    const object2 = new THREE.Object3D();
    object2.position.setFromCylindricalCoords(radius - separation, theta2, y2);

    // Adjust the lookAt vector for both helices
    vector.x = object1.position.x * 2;
    vector.y = object1.position.y;
    vector.z = object1.position.z * 2;
    object1.lookAt(vector);

    vector.x = object2.position.x * 2;
    vector.y = object2.position.y;
    vector.z = object2.position.z * 2;
    object2.lookAt(vector);

    // Push both objects to the helix targets
    targets.helix.push(object1);
    targets.helix.push(object2);
}







    // Grid
    const gridLength = 5;  // number of columns
    const gridHeight = 4;   // number of rows
    const gridWidth = 10;    // number of layers in depth

    let index = 0; // To track element positions

    for (let i = 0; i < gridWidth; i++) {
        for (let j = 0; j < gridHeight; j++) {
            for (let k = 0; k < gridLength; k++) {
                const object = new THREE.Object3D();

                // X-axis: Spread horizontally across the length
                object.position.x = (k * 400) - (gridLength * 200); // Adjusting for center alignment

                // Y-axis: Spread vertically across the height
                object.position.y = (j * 400) - (gridHeight * 200); // Adjusting for center alignment

                // Z-axis: Spread across the width (depth)
                object.position.z = (i * 1000) - (gridWidth * 500); // Adjusting for center alignment

                targets.grid.push(object);
            }
        }
    }
}


function transform(targets, duration) {
    TWEEN.removeAll();

    for (let i = 0; i < objects.length; i++) {
        const object = objects[i];
        const target = targets[i];

        new TWEEN.Tween(object.position)
            .to({ x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();

        new TWEEN.Tween(object.rotation)
            .to({ x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
    }

    new TWEEN.Tween(this)
        .to({}, duration * 2)
        .onUpdate(render)
        .start();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    render();
}

function animate() {
    requestAnimationFrame(animate);

    TWEEN.update();
    controls.update();
}

function render() {
    renderer.render(scene, camera);
}
