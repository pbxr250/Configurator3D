import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DragControls } from './DragControl2.js';
import { StateManager } from './InterfaceManager.js';


//#define 
const canvasContainerId = 'canvas_container'
const basicScale = 5;

//Scene main objects
let camera, scene, renderer, canvas,
	sceneObjects = [],
	pointLight,
	layoutPlane, gridHelper, orbitControls, dragControls,
	selector;

let textures = [];

//canvas dimensions
let WIDTH, HEIGHT;

//load object models
let cpt2Default;

//const groupMask; selectable : 11 
const groupMask = Object.freeze( {'selectable': 11,     
								 'compartment': 10,
								 'selector' : 15} ); 
//type = t1, v2, h2

let price = 0, needUpdatePrice = true;

// appState
let appState;

//
let sceneConfig = {
    'camera'       : camera,
    'scene'        : scene,
    'renderer'     : renderer,
    'canvas'       : canvas,
    'sceneObjects' : sceneObjects, // UI Draggable and movable
    'layoutPlane'  : layoutPlane,
    'gridHelper'   : gridHelper,
    'orbitControls': orbitControls,
    'dragControls' : dragControls,
    'basicScale'   : basicScale,
    'cpt2Default'  : cpt2Default
}


export function init() {
	
	let rect = document.getElementById( canvasContainerId ).getBoundingClientRect();
	WIDTH = rect.width;
	HEIGHT = rect.height;

    // init CAMERA
	camera = new THREE.PerspectiveCamera( 45, WIDTH / HEIGHT, 1, 10000 );
	camera.position.set( 0, 0, 120 );
	camera.lookAt( 0, 0, 0 );
    // init SCENE
	scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xf0f0f0 );
    scene.fog = new THREE.Fog( 0xa0a0a0, 10, 500 );
	
    layoutPlane = new THREE.Mesh( new THREE.PlaneBufferGeometry( 100, 100 ),  new THREE.MeshBasicMaterial( { visible: false } ) );
    layoutPlane.name = "layoutPlane"
    //sceneObjects.push( layoutPlane );
    scene.add( layoutPlane );

	gridHelper = new THREE.GridHelper( 100, 20, 0x444444 );
    gridHelper.rotateX( - Math.PI / 2 );
    gridHelper.position.z = -5;
	scene.add( gridHelper );

	// init LIGHTS
	let ambientLight = new THREE.AmbientLight( 0x606060 );
	scene.add( ambientLight );
	let directionalLight = new THREE.DirectionalLight( 0xffffff );
    directionalLight.position.set( 0, 1, 0 );
	directionalLight.target = layoutPlane;
    //scene.add( directionalLight );
    let hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.4 );
	hemiLight.position.set( 0, 200, 0 );
	scene.add( hemiLight );
	pointLight = new THREE.PointLight( 0xffffff, 0.2, 300 );
	pointLight.position.copy( camera.position );
	scene.add(pointLight);

	
    
    // init RENDERER
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( WIDTH, HEIGHT );
	

	document.getElementById( canvasContainerId ).appendChild( renderer.domElement );
	canvas = renderer.domElement;

	orbitControls = new OrbitControls( camera, renderer.domElement );
	orbitControls.minDistance = 20;
	orbitControls.maxDistance = 350;
	orbitControls.enablePan = true;
	//orbitControls.target.set( 0, 0, 50 );
	orbitControls.screenSpacePanning = true;
    orbitControls.update(); 

    dragControls = new DragControls( sceneObjects, camera, canvas );
    dragControls.deactivate();

    appState = new StateManager();
    initEventListeners();
    
    // Load Models
    new GLTFLoader().load( './assets/models/cpt3.gltf', onModelLoad );

    render();
}

function onWindowResize() {
	let rect = document.getElementById( canvasContainerId ).getBoundingClientRect();
	WIDTH = rect.width;
	HEIGHT = rect.height;
	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();
    renderer.setSize( WIDTH, HEIGHT );
}

function onModelLoad( gltf ) {
    let cube = gltf.scene.children[0]; // Front carcas edges
    cube.userData.groupMask = groupMask.selectable;
    cube.material = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide} );
    let innerFace = gltf.scene.children[1];
    innerFace.userData.groupMask = groupMask.selectable;
    innerFace.material = new THREE.MeshStandardMaterial( { color: 0xf2f7f4, side: THREE.DoubleSide} );
    let innerSides = gltf.scene.children[2];
    innerSides.userData.groupMask = groupMask.selectable;
    innerSides.material = new THREE.MeshStandardMaterial( { color: 0xf2f7f4, side: THREE.DoubleSide} );
    let outFaces = gltf.scene.children[3];
    outFaces.userData.groupMask = groupMask.selectable;
	outFaces.material = new THREE.MeshStandardMaterial( { color: 0xff9900, side: THREE.DoubleSide} );
	let z5door = gltf.scene.children[4];
    z5door.userData.groupMask = groupMask.selectable;
	z5door.material = new THREE.MeshStandardMaterial( { side: THREE.DoubleSide} );
	z5door.visible = false;
	z5door.userData.type = "d0"
    cpt2Default = new THREE.Object3D();
    cpt2Default.add( cube, innerFace, innerSides, outFaces, z5door );
	cpt2Default.userData.groupMask = groupMask.compartment;
	cpt2Default.userData.type = 't1';
    cpt2Default.scale.set( basicScale, basicScale, basicScale );

	let loader = new THREE.TextureLoader();
	// load a resource
	loader.load(
		// resource URL
		'./assets/textures/wood2.jpg',

		// onLoad callback
		function ( texture ) {
			// in this example we create the material when the texture is loaded
			texture.flipY=false;
			let material = new THREE.MeshStandardMaterial( {
				map: texture
			} );
			cpt2Default.children[3].material = material;
			demo();
		},

		// onProgress callback currently not supported
		undefined,

		// onError callback
		function ( err ) {
			console.error( 'An error happened in texture loader' );
		}
	);

	loader.load(
		// resource URL
		'./assets/textures/door/d1.png',
	
		// onLoad callback
		function ( texture ) {
			// in this example we create the material when the texture is loaded
			texture.flipY=false;
			//cpt2Default.children[4].material = new THREE.MeshStandardMaterial( { map: texture, side: THREE.DoubleSide} );
			cpt2Default.children[4].material.map = texture;
			cpt2Default.children[4].material.needsUpdate = true;
			cpt2Default.children[4].userData.type = "d1"
			textures.push( texture );
			render();
			loadTextures();
			//to switch to default in order to show demo correctly ( textures are loaded adn available in time)
			cpt2Default.children[4].material = new THREE.MeshStandardMaterial( { map: texture, side: THREE.DoubleSide} );
		},
	
		// onProgress callback currently not supported
		undefined,
	
		// onError callback
		function ( err ) {
			console.error( 'An error happened.' );
		}
	);

	render();
}

function loadTextures() {
	let loader = new THREE.TextureLoader();
	let texture = loader.load('./assets/textures/door/d2.png');
	texture.flipY=false;
	textures.push( texture );
	texture = loader.load('./assets/textures/door/d3.png');
	texture.flipY=false;
	textures.push( texture );
}


function demo() {
	let cptMesh = cpt2Default.clone();
	cptMesh.scale.set( basicScale * 2, basicScale, basicScale );
	cptMesh.userData.type = 'h2';
	cptMesh.position.set( 0, -10, 0 );
	cptMesh.children[4].visible = true;
	sceneObjects.push( cptMesh );
	scene.add( cptMesh );

	cptMesh = cpt2Default.clone();
	cptMesh.scale.set( basicScale, basicScale * 2, basicScale );
	cptMesh.userData.type = 'v2';
	cptMesh.position.set( -5, 5, 0 );
	cptMesh.children[4].visible = false;
	sceneObjects.push( cptMesh );
	scene.add( cptMesh );

	cptMesh = cpt2Default.clone();
	cptMesh.userData.type = 't1';
	cptMesh.position.set( 5, 0, 0 );
	cptMesh.children[4].visible = false;
	sceneObjects.push( cptMesh );
	scene.add( cptMesh );

	cptMesh = cpt2Default.clone();
	cptMesh.userData.type = 't1';
	cptMesh.position.set( 5, 10, 0 );
	cptMesh.children[4].visible = false;
	sceneObjects.push( cptMesh );
	scene.add( cptMesh );
	
	cptMesh = cpt2Default.clone();
	cptMesh.userData.type = 't1';
	cptMesh.children[4].visible = false;
	cptMesh.position.set( -5, 20, 0 );
	sceneObjects.push( cptMesh );
	scene.add( cptMesh );

	cptMesh = cpt2Default.clone();
	cptMesh.userData.type = 't1';
	cptMesh.children[4].visible = false;
	cptMesh.position.set( 5, 20, 0 );
	sceneObjects.push( cptMesh );
	scene.add( cptMesh );

	render();
}


//no need to use it
function resizeRendererToDisplaySize() {
	const canvas = renderer.domElement;
	const pixelRatio = window.devicePixelRatio;
	const width  = canvas.clientWidth  * pixelRatio | 0;
	const height = canvas.clientHeight * pixelRatio | 0;
	const needResize = canvas.width !== width || canvas.height !== height;
	if (needResize) {
	  renderer.setSize(width, height, false);
	}
	return needResize;
}



function render() {
	renderer.render( scene, camera );
	if(needUpdatePrice)
		priceCalc();
}








//     :"'._..---.._.'";
//     `.             .'
//     .'    ^   ^    `.
//    :      a   a      :                 __....._
//    :     _.-0-._     :---'""'"-....--'"        '.
//     :  .'   :   `.  :                          `,`.
//      `.: '--'--' :.'                             ; ;
//       : `._`-'_.'                                ;.'
//       `.   '"'                                   ;
//        `.               '                        ;
//         `.     `        :           `            ;
//          .`.    ;       ;           :           ;
//        .'    `-.'      ;            :          ;`.
//    __.'      .'      .'              :        ;   `.
//  .'      __.'      .'`--..__      _._.'      ;      ;
//  `......'        .'         `'""'`.'        ;......-'
//        `.......-'                 `...







 function initEventListeners() {

    window.addEventListener( 'resize', onWindowResize, false );

	orbitControls.addEventListener( 'change', function() {
		pointLight.position.copy( camera.position );
		render();
	} ); // events from orbit control go to render function

	dragControls.addEventListener( 'dragstart', onDragStart );
	dragControls.addEventListener( 'drag', onDrag );
	dragControls.addEventListener( 'dragend', onDragEnd );


    //canvas.addEventListener( 'mousemove', onDocumentMouseMove, false );
    canvas.addEventListener( 'mousedown', onMouseDownSelect, false );

    document.getElementById("gridshow").onclick = gridToggle;
    document.getElementById("movetool").onclick = moveToggle;
    document.getElementById("freeview").onclick = freeviewToggle;
}


function gridToggle() {
    if(appState.isGridOn)
		{
			scene.remove( gridHelper );
			appState.isGridOn = false;
			document.getElementById("gridshow").classList.remove("selected");
			render();
		}
		else
		{
			scene.add( gridHelper );
			appState.isGridOn = true;
			document.getElementById("gridshow").classList.add("selected");
			render();
		}
}

function moveToggle() {
    appState.orbitViewMode = false;
	//
	if( appState.isObjectSelected )
		disposeSelector();
    appState.selectMode = false;
    appState.isObjectSelected = false;
    appState.selectedObject = null;
    //
    appState.DragMode = true; // TURN this ON
    appState.isObjectDragged = false;
    appState.draggedObject = null;

    orbitControls.enabled = false;
	dragControls.activate();
	document.getElementById("movetool").classList.add("selected");
	document.getElementById("freeview").classList.remove("selected");

	canvas.removeEventListener( 'mousedown', onMouseDownSelect, false );
	render();
}

function freeviewToggle() {
    appState.orbitViewMode = true; // TURN this ON
    //
    appState.selectMode = true;
    appState.isObjectSelected = false;
    appState.selectedObject = null;
    //
    appState.DragMode = false; 
    appState.isObjectDragged = false;
    appState.draggedObject = null;

	orbitControls.reset();
    orbitControls.enabled = true;
	dragControls.deactivate();
	document.getElementById("freeview").classList.add("selected");
	document.getElementById("movetool").classList.remove("selected");

	canvas.addEventListener( 'mousedown', onMouseDownSelect, false );
}


function size1Click() {
	let cptMesh = new THREE.Object3D().copy( cpt2Default );
	cptMesh.scale.set( basicScale, basicScale, basicScale );
	cptMesh.userData.type = 't1';
	cptMesh.position.set( 0, 40, 0 );
	sceneObjects.push( cptMesh );
	scene.add( cptMesh );
	render();
	return false;
}
function size2Click() {
	let cptMesh = new THREE.Object3D().copy( cpt2Default );
	cptMesh.scale.set( basicScale * 2, basicScale, basicScale );
	cptMesh.userData.type = 'h2';
	cptMesh.position.set( 0, 40, 0 );
	sceneObjects.push( cptMesh );
	scene.add( cptMesh );
	render();
	return false;
}
function size3Click() {
	let cptMesh = new THREE.Object3D().copy( cpt2Default );
	cptMesh.scale.set( basicScale, basicScale * 2, basicScale );
	cptMesh.userData.type = 'v2';
	cptMesh.position.set( 0, 40, 0 );
	sceneObjects.push( cptMesh );
	scene.add( cptMesh );
	render();
	return false;
}


function onMouseDownSelect( event ) {
	event.preventDefault();
	let raycaster = new THREE.Raycaster();
	let mouse = new THREE.Vector2();
	let pos = getCanvasRelativePosition(event);
	mouse.set( ( pos.x / WIDTH ) * 2 - 1, - ( pos.y / HEIGHT ) * 2 + 1 );
	raycaster.setFromCamera( mouse, camera );
	var intersects = raycaster.intersectObjects( sceneObjects, true );
	if ( intersects.length > 0 ) 
	{
		for ( let i = 0; i < intersects.length; i++ )
		{
			let object = intersects[i].object;
			if( object.userData.groupMask == groupMask.selectable && 
				object.parent.userData.groupMask == groupMask.compartment )
			{
				if ( appState.isObjectSelected )//Remove selection if exists
				{	
					if ( appState.selectedObject == object.parent )
						break;
					appState.isObjectSelected = false;
					appState.selectedObject = null;
					disposeSelector();
				}
				object = object.parent;
				appState.isObjectSelected = true;
				appState.selectedObject = object;
				drawSelector( object );
				break;
			}
		}
	}
	render();
}
function getCanvasRelativePosition(event) {
	const rect = canvas.getBoundingClientRect();
	return {
	  x: event.clientX - rect.left,
	  y: event.clientY - rect.top,
	};
}


function onDragStart( event ) {
	//event.object.material.emissive.set( 0xaaaaaa );
	appState.DragMode = true; 
    appState.isObjectDragged = true;
    appState.draggedObject = event.object;
	//drawSelector( event.object );
	render();
} 

function onDrag( event ) {
	//event.object.children[3].material.emissiveIntensity = 0.2;
	//event.object.children[3].material.emissive.set( 0x51cdd6 );
    render();
} 

function onDragEnd( event ) {
	//event.object.children[3].material.emissiveIntensity = 0;
	//event.object.children[3].material.emissive.set( 0x000000 );
	//appState.DragMode = false; 
    appState.isObjectDragged = false;
	appState.draggedObject = null;
	//disposeSelector();
    render();
} 

function drawSelector( object ) {
	let geometry;
	switch(object.userData.type) {
		case 't1':
			geometry = new THREE.BoxBufferGeometry( 10, 10, 10 );
		  	break;
		case 'v2':
			geometry = new THREE.BoxBufferGeometry( 10, 20, 10 );
		  	break;
		case 'h2':
			geometry = new THREE.BoxBufferGeometry( 20, 10, 10 );
			break;
		default:
			console.log('Error in drawSelector()');
		  	return;
	}
	let edges = new THREE.EdgesGeometry( geometry );
	selector = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0x78f1fa } ) );
	selector.position.copy( object.position );
	selector.scale.set(1.1, 1.1, 1.1);
	object.attach( selector );
}

function disposeSelector() {
	selector.parent.remove( selector );
	selector.geometry.dispose();
	selector.material.dispose();
	selector = undefined;
}

export function onclickCP ( hex ) {
	if( appState.isObjectSelected ) {
		let parsedHex = parseInt( hex.substr(1), 16 );
		appState.selectedObject.children[1].material = new THREE.MeshStandardMaterial( { color: parsedHex, side: THREE.DoubleSide} );
		appState.selectedObject.children[2].material = new THREE.MeshStandardMaterial( { color: parsedHex, side: THREE.DoubleSide} );
		render();
	}
}

export function onclickImagePicker(select, picker_option, event) {
	if( appState.isObjectSelected ) {
		switch(select.option[0].value) {
			case '1':
				appState.selectedObject.children[4].userData.type = 'd0';
				appState.selectedObject.children[4].visible = false;
				break;
			case '2':
				appState.selectedObject.children[4].userData.type = 'd1';
				appState.selectedObject.children[4].visible = true;
				appState.selectedObject.children[4].material = new THREE.MeshStandardMaterial( { map: textures[0], side: THREE.DoubleSide} );
				break;
			case '3':
				appState.selectedObject.children[4].userData.type = 'd2';
				appState.selectedObject.children[4].visible = true;
				appState.selectedObject.children[4].material = new THREE.MeshStandardMaterial( { map: textures[1], side: THREE.DoubleSide} );
				break;
			case '4':
				appState.selectedObject.children[4].userData.type = 'd3';
				appState.selectedObject.children[4].visible = true;
				appState.selectedObject.children[4].material = new THREE.MeshStandardMaterial( { map: textures[2], side: THREE.DoubleSide} );
				break;
			default:
				console.log('Error in onClickImagePicker()');
				  return;
		}
		render();
	}
}

export function onclickImagePicker2(select, picker_option, event) {
	switch(select.option[0].value) {
		case '1':
			size1Click()
			break;
		case '2':
			size2Click()
			break;
		case '3':
			size3Click()
			break;
		default:
			console.log('Error in onClickImagePicker2()');
				return;
	}
}

function priceCalc() {
	price = 0;
	for ( let i = 0; i < sceneObjects.length; i++ )
	{
		switch( sceneObjects[i].userData.type ) {
			case 't1':
				price += 30;
				break;
			case 'h2':
				price += 50;
				break;
			case 'v2':
				price += 55;
				break;
			default:
				price += 0;
		}

		switch( sceneObjects[i].children[4].userData.type ) {
			case 'd0':
				price += 0;
				break;
			case 'd1':
				price += 26;
				break;
			case 'd2':
				price += 49;
				break;
			case 'd3':
				price += 55;
				break;
			default:
				price += 0;
		}
	
	document.getElementById( 'price_calc' ).innerHTML = 'USD$ ' + price;
	}
}