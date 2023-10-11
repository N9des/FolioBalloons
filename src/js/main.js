import * as THREE from 'three';
import { gsap } from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as dat from 'lil-gui';

import vertexShader from '../shaders/vertex.glsl';
import fragmentShader from '../shaders/fragment.glsl';

export default class Sketch {
	constructor() {
		// Sizes
		this.sizes = {
			width: window.innerWidth,
			height: window.innerHeight,
		};
		// Init Renderer
		this.canvas = document.querySelector('canvas.webgl');

		this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvas,
			antialias: true,
		});
		this.renderer.setSize(this.sizes.width, this.sizes.height);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		// Init scene
		this.scene = new THREE.Scene();
		// this.scene.background = new THREE.Color(0x8684E4);
		this.scene.background = new THREE.Color(0x330033);
		THREE.ColorManagement.enabled = false;

		// Init values
		this.time = 0;
		this.clock = new THREE.Clock();
		this.mouseClick = new THREE.Vector2();
		this.mouseMove = new THREE.Vector2();
		this.draggable = null;
		this.model = null;
		this.children = [];
		this.speedsPos = [1, 0.8, 1.2, 1.4, 1.2];
		this.speedsRot = [1, 1.1, 1.2, 1.4, 1.2];
		this.currentIntersect = null;
		this.letters = [];
		this.posXBalloon = [];
		this.utils = {
			// maValeur = lerp(maValeur, maValeurTarget, 0.09)
			lerp: (s, e, v) => s * (1 - v) + e * v,
		};

		this.addRaycaster();

		this.addLoader();

		this.addLights();

		this.addCamera();

		// this.addControls();

		this.addDebug();

		this.render();
		// Resize
		window.addEventListener('resize', this.resize.bind(this));

		// Mouse event
		window.addEventListener('mousedown', (event) => {
			this.mouseClick.x = (event.clientX / this.sizes.width) * 2 - 1;
			this.mouseClick.y = -(event.clientY / this.sizes.height) * 2 + 1;

			const found = this.intersect(this.mouseClick);
			if (found.length > 0) {
				if (found[0].object.userData.draggable) {
					this.draggable = found[0].object;
					console.log(`found draggable ${this.draggable.userData.name}`);
				}
			}
		});

		window.addEventListener('mouseup', (event) => {
			const idBalloon = this.draggable.userData.id;
			this.draggable.position.set(this.posXBalloon[idBalloon], 0, 0);
			this.draggable = null;
		});

		window.addEventListener('mousemove', (event) => {
			this.mouseMove.x = (event.clientX / this.sizes.width) * 2 - 1;
			this.mouseMove.y = -(event.clientY / this.sizes.height) * 2 + 1;
		});
	}

	intersect(pos) {
		this.raycaster.setFromCamera(pos, this.camera);
		return this.raycaster.intersectObjects(this.scene.children);
	}

	dragObject() {
		if (this.draggable !== null) {
			const found = this.intersect(this.mouseMove);
			if (found.length > 0) {
				for (let i = 0; i < found.length; i++) {
					let target = found[i].point;
					this.draggable.position.x = target.x;
					this.draggable.position.y = target.y;
				}
			}
		}
	}

	addRaycaster() {
		this.raycaster = new THREE.Raycaster();
	}

	addLoader() {
		this.loader = new GLTFLoader();
		this.loader.load('./models/letters.glb', (gltf) => {
			this.model = gltf.scene;

			// Store all letters in an array
			this.model.traverse((child) => {
				if (child instanceof THREE.Mesh) {
					this.letters.push(child);
				}
			});

			// Add each letter as a mesh in our scene
			for (let i = 0; i < this.letters.length; i++) {
				const mesh = this.letters[i];
				const name = mesh.name.toLowerCase();

				if (name === 'f') {
					this.addBalloon(mesh, -0.45, 0);
				} else if (name === 'e') {
					this.addBalloon(mesh, -0.23, 1);
				} else if (name === 'l') {
					this.addBalloon(mesh, 0, 2);
				} else if (name === 'i') {
					this.addBalloon(mesh, 0.22, 3);
				} else {
					this.addBalloon(mesh, 0.45, 4);
				}
			}

			this.onAnim();
		});
	}

	addLights() {
		const white = 0xffffff;
		const intensity = 6;
		this.spotLight = new THREE.SpotLight(white, intensity);
		this.spotLight.position.set(1, 1, 1);
		this.scene.add(this.spotLight);

		this.spotLightHelper = new THREE.SpotLightHelper(this.spotLight);
		// this.scene.add(this.spotLightHelper);

		const green = 0xf9f863;
		const intensityGreen = 1.5;
		this.pointLight = new THREE.SpotLight(white, intensityGreen);
		this.pointLight.lookAt(0, 0, 0);
		this.pointLight.position.set(0, -1.5, 0);
		this.scene.add(this.pointLight);

		this.pointLightHelper = new THREE.SpotLightHelper(this.pointLight);
		// this.scene.add(this.pointLightHelper);

		const intensityWhite = 2;
		this.pointLightWhite = new THREE.PointLight(white, intensityWhite);
		this.pointLightWhite.position.set(-1, 1, 1);
		this.scene.add(this.pointLightWhite);

		this.pointLightWhiteHelper = new THREE.PointLightHelper(
			this.pointLightWhite
		);
		// this.scene.add(this.pointLightWhiteHelper);

		const intensityAmbient = 2;
		this.ambientLight = new THREE.AmbientLight(white, intensityAmbient);
		this.scene.add(this.ambientLight);
	}

	addControls() {
		this.controls = new OrbitControls(this.camera, this.canvas);
		this.controls.enableDamping = true;
	}

	addCamera() {
		this.camera = new THREE.PerspectiveCamera(
			70,
			this.sizes.width / this.sizes.height,
			0.01,
			10
		);
		this.camera.position.z = 1;
	}

	addDebug() {
		const gui = new dat.GUI();
	}

	addBalloon(mesh, posX = 0, index) {
		mesh.scale.set(0.3, 0.3, 0.3);
		mesh.position.set(posX, 0, 0);
		mesh.userData.draggable = true;
		mesh.userData.id = index;

		this.children[index] = mesh;
		this.posXBalloon[index] = posX;
		this.scene.add(mesh);
	}

	// onEnter() {
	// 	this.currentIntersect.object.scale.set(0.31, 0.31, 0.31);
	// }

	// onLeave(mesh) {
	// 	const currentObject = mesh || this.currentIntersect;

	// 	currentObject.object.scale.set(0.3, 0.3, 0.3);
	// }

	staticAnim() {
		this.children.forEach((child, idx) => {
			if (child instanceof THREE.Mesh) {
				child.rotation.z =
					Math.sin(this.elapsedTime * this.speedsRot[idx]) * 0.05;
				child.position.y =
					Math.sin(this.elapsedTime * this.speedsPos[idx]) * 0.03;
			}
		});
	}

	onAnim() {
		this.elapsedTime = this.clock.getElapsedTime();
		if (this.model) {
			// Anim neutral state
			this.staticAnim();

			// Grab/Drop anim
			this.dragObject();

			// if (this.children.length > 0) {
			// 	this.raycaster.setFromCamera(this.mouse, this.camera);
			// 	const modelIntersects = this.raycaster.intersectObjects(
			// 		this.scene.children
			// 	);

			// 	if (modelIntersects.length > 0) {
			// 		const nearestObject = modelIntersects[modelIntersects.length - 1];

			// 		if (
			// 			!this.currentIntersect ||
			// 			(this.currentIntersect && this.currentIntersect !== nearestObject)
			// 		) {
			// 			// If we're intersecting a new object but we we were already
			// 			// intersecting another object at the same time, switch between them
			// 			this.currentIntersect && this.onLeave(this.currentIntersect);

			// 			// Scale current nearest object
			// 			this.currentIntersect = modelIntersects[modelIntersects.length - 1];
			// 			this.onEnter();
			// 		}
			// 	} else {
			// 		if (this.currentIntersect) {
			// 			// Reset scale on mouse leave
			// 			this.onLeave();
			// 			this.currentIntersect = null;
			// 		}
			// 	}
			// }
		}
	}

	resize() {
		// Update sizes
		this.sizes.width = window.innerWidth;
		this.sizes.height = window.innerHeight;

		// Update camera
		this.camera.aspect = this.sizes.width / this.sizes.height;
		this.camera.updateProjectionMatrix();

		// Update renderer
		this.renderer.setSize(this.sizes.width, this.sizes.height);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	}

	render() {
		this.onAnim();

		// Update controls
		// this.controls && this.controls.update();

		this.renderer.render(this.scene, this.camera);
		this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
		window.requestAnimationFrame(this.render.bind(this));
	}
}

new Sketch();
