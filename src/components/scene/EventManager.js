import * as THREE from 'three';


let sceneConfig, 
	appState;


export function initEventListeners( _sceneConfig, _appState ) {
	sceneConfig = _sceneConfig;
	appState    = _appState;

	sceneConfig.orbitControls.addEventListener( 'change', render );

	sceneConfig.dragControls.addEventListener( 'dragstart', onDragStart );
	sceneConfig.dragControls.addEventListener( 'drag', onDrag );
	sceneConfig.dragControls.addEventListener( 'dragend', onDragEnd );


    sceneConfig.canvas.addEventListener( 'mousemove', onDocumentMouseMove, false );
    sceneConfig.canvas.addEventListener( 'mousedown', onDocumentMouseDown, false );
    sceneConfig.canvas.addEventListener( 'mouseup', onDocumentMouseUp, false );

	document.getElementById( 'size1Button' ).onclick = size1Click;
	document.getElementById( 'size2Button' ).onclick = size2Click;
	document.getElementById( 'size3Button' ).onclick = size3Click;
}



function size1Click() {
	let cptMesh = new THREE.Object3D().copy( sceneConfig.cpt2Default );
	cptMesh.scale.set( sceneConfig.basicScale, sceneConfig.basicScale, sceneConfig.basicScale );
	cptMesh.position.set( 0, 30, 0 );
	sceneConfig.sceneObjects.push( cptMesh );
	scene.add( cptMesh );
	render();
	return false;
}
function size2Click() {
	let cptMesh = new THREE.Object3D().copy( sceneConfig.cpt2Default );
	cptMesh.scale.set( sceneConfig.basicScale, sceneConfig.basicScale, sceneConfig.basicScale*2 );
	cptMesh.position.set( 0, 30, 0 );
	sceneConfig.sceneObjects.push( cptMesh );
	scene.add( cptMesh );
	render();
	return false;
}
function size3Click() {
	let cptMesh = new THREE.Object3D().copy( sceneConfig.cpt2Default );
	cptMesh.scale.set( sceneConfig.basicScale, sceneConfig.basicScale*2, sceneConfig.basicScale );
	cptMesh.position.set( 0, 30, 0 );
	sceneConfig.sceneObjects.push( cptMesh );
	scene.add( cptMesh );
	render();
	return false;
}


function onDocumentMouseMove( event ) {
	event.preventDefault();
	if(isMouseHold)
	{
		let pos = getCanvasRelativePosition(event);
		mouse.set( ( pos.x / WIDTH ) * 2 - 1, - ( pos.y / HEIGHT ) * 2 + 1 );
		raycaster.setFromCamera( mouse, camera );
		var intersects = raycaster.intersectObjects( objects, true );
		if ( intersects.length > 0 ) {
			for ( let i = 0; i < intersects.length; i++ )
			{
				let it = intersects[i];
				if( it.object.name == "plane" )
				{
					dragObject.position.copy( it.point );
					break;
				}
			}
			
		}
		render();
	}
}
function onDocumentMouseUp( event ) {
	event.preventDefault();
	let pos = getCanvasRelativePosition(event);
	mouse.set( ( pos.x / WIDTH ) * 2 - 1, - ( pos.y / HEIGHT ) * 2 + 1 );
	raycaster.setFromCamera( mouse, camera );
	var intersects = raycaster.intersectObjects( objects, true );
	if ( intersects.length > 0 ) {
		for ( let i = 0; i < intersects.length; i++ )
		{
			let it = intersects[i];
			if( it.object.name == "plane" )
			{
				dragObject.position.copy( it.point );
				isMouseHold = false;
				break;
			}
		}
	}
	render();
}
function onDocumentMouseDown( event ) {
	event.preventDefault();
	let pos = getCanvasRelativePosition(event);
	mouse.set( ( pos.x / WIDTH ) * 2 - 1, - ( pos.y / HEIGHT ) * 2 + 1 );
	raycaster.setFromCamera( mouse, camera );
	var intersects = raycaster.intersectObjects( objects, true );
	if ( intersects.length > 0 ) 
	{
		for ( let i = 0; i < intersects.length; i++ )
		{
			let it = intersects[i];
			if( it.object.userData.groupMask == groupMask.selectable )
			{
				if( it.object.parent.userData.groupMask == groupMask.selectable )
					dragObject = it.object.parent;
				else
					dragObject = it.object;
				isMouseHold = true;
				break;
			}
		}
	}
}


function getMouseDownAction() {
	if( appState.orbitViewMode )
	{
		//Orbit controls
		//orbitControls.enabled = true;
		return;
	}
	if( appState.selectMode )
	{
		
		return;
	}
	if( appState.DragMode )
	{
		return;
	}
}

function onDragStart( event ) {
	//event.object.material.emissive.set( 0xaaaaaa );
} 

function onDrag( event ) {
	//event.object.material.emissive.set( 0xaaaaaa );
} 

function onDragEnd( event ) {
	//event.object.material.emissive.set( 0xaaaaaa );
} 


function render() {
	sceneConfig.renderer.render( sceneConfig.scene, sceneConfig.camera );
}