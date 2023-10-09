import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as dat from 'lil-gui'

// import vertexShader from './shaders/vertex.glsl';
// import fragmentShader from './shaders/fragment.glsl';

export default class Sketch {
	constructor() {
		// Sizes
		this.sizes = {
			width: window.innerWidth,
			height: window.innerHeight,
		}
		// Init Renderer
		this.canvas = document.querySelector('canvas.webgl');

		this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvas,
			antialias: true
		});
		this.renderer.setSize(this.sizes.width, this.sizes.height);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

		// Init scene
		this.scene = new THREE.Scene();
		// this.scene.background = new THREE.Color(0x8684E4);
		this.scene.background = new THREE.Color(0x330033);
		THREE.ColorManagement.enabled = false

		// Init values
		this.time = 0;
		this.clock = new THREE.Clock();
		this.model = null;
		this.speedsPos = [1, 0.8, 1.2, 1.4, 1.2];
		this.speedsRot = [1, 1.1, 1.2, 1.4, 1.2];

		this.addLoader();

		this.addLights();

		this.addCamera();

		this.addControls();

		this.addMesh();

		this.addDebug();
		
		this.render();
		
		// Resize
		window.addEventListener('resize', this.resize.bind(this));
	}

	addLoader() {
		this.loader = new GLTFLoader();
		this.loader.load('./models/letters.glb', (gltf) => {
			this.model = gltf.scene
			this.scene.add(this.model);

			this.addMesh()
		})
	}

	addLights() {
		const white = 0xffffff;
		const intensity = 6;
		this.spotLight = new THREE.SpotLight(white, intensity);
		this.spotLight.position.set(1, 1, 1);
		this.scene.add(this.spotLight);

		this.spotLightHelper = new THREE.SpotLightHelper( this.spotLight );
		this.scene.add( this.spotLightHelper );

		const green = 0xF9F863;
		const intensityGreen = 1.5;
		this.pointLight = new THREE.SpotLight(white, intensityGreen);
		this.pointLight.lookAt(0, 0, 0);
		this.pointLight.position.set(0, -1.5, 0);
		this.scene.add(this.pointLight);

		this.pointLightHelper = new THREE.SpotLightHelper( this.pointLight );
		this.scene.add( this.pointLightHelper );

		const intensityWhite = 2;
		this.pointLightWhite = new THREE.PointLight(white, intensityWhite);
		this.pointLightWhite.position.set(-1, 1, 1);
		this.scene.add(this.pointLightWhite);

		this.pointLightWhiteHelper = new THREE.PointLightHelper( this.pointLightWhite );
		this.scene.add( this.pointLightWhiteHelper );

		const intensityAmbient = 2;
		this.ambientLight = new THREE.AmbientLight(white, intensityAmbient);
		this.scene.add(this.ambientLight);

	}

	addControls() {
		this.controls = new OrbitControls(this.camera, this.canvas)
		this.controls.enableDamping = true
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

	addMesh() {
		if (this.model) {
			this.model.scale.set(0.5, 0.5, 0.5);
			this.model.position.set(0, 0, 0);
		}
	}

	addDebug() {
		const gui = new dat.GUI();
	}

	addAnim() {
		const elapsedTime = this.clock.getElapsedTime();
		if (this.model) {
			const children = this.model.children
			children.forEach((child, idx) => {
				if (child instanceof THREE.Mesh) {
					child.rotation.z = Math.sin(elapsedTime * this.speedsRot[idx]) * 0.05;
					child.position.y = Math.sin(elapsedTime * this.speedsPos[idx]) * 0.03;
				}
			})
		}
	}

	resize() {
		// Update sizes
    this.sizes.width = window.innerWidth
    this.sizes.height = window.innerHeight

    // Update camera
    this.camera.aspect = this.sizes.width / this.sizes.height
    this.camera.updateProjectionMatrix()

    // Update renderer
    this.renderer.setSize(this.sizes.width, this.sizes.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
	}

	render() {
		this.addAnim()

		// Update controls
    this.controls.update();

		this.renderer.render(this.scene, this.camera);
		this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace
		window.requestAnimationFrame(this.render.bind(this));
	}
}

new Sketch();
