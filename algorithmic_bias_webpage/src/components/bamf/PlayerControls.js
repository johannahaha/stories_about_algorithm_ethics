//part of the code are from this class
//https://github.com/within-unlimited/under-neon-lights/blob/master/release/src/mouse-controls.js

import {
	EventDispatcher,
	Vector3,
	Vector2,
	Clock,
	Euler
} from 'three';

const PlayerControls = function ( camera, domElement , helperGeo, cameraEye, cameraHelper ) {
	if ( domElement === document ) console.error( 'PlayerControls: "document" should not be used as the target "domElement". Please use "renderer.domElement" instead.' );

	console.log("instantiating player controls");
    this.domElement = domElement;
	this.isLocked = false;
	this.helperTubeGeometry = helperGeo;
	this.enabled = false;
	this.segment;

	//
	// internals
	//

	let scope = this;

	//this.domElement = domElement || window;
	//this.domElement.isWindow = !domElement;

	camera.rotation.reorder( 'YXZ' );
	const mouse = new Vector2();
	//const target = new Vector2();
	const destination = new Euler(camera.rotation.x,camera.rotation.y,camera.rotation.z);
	destination.reorder( 'YXZ' );
	let drag = 0.66;
	let scale = 1;
	// eslint-disable-next-line no-unused-vars
	let dragging = false;
	//console.log(dragging);
	var HALF_PI = Math.PI / 2;



	const windowSize = new Vector2( scope.domElement.offsetWidth, scope.domElement.offsetHeight);


	const clock = new Clock();
	let delta;
	let speed = 0.001;


	
	//follow path
	let firstLoop = true;
	let direction = new Vector3(0,0,0);
	let binormal = new Vector3();
	this.normal = new Vector3();
	this.position = new Vector3();
	let lookAt = new Vector3();
	let lookAhead = false;
	let t=0;


	//TODO: onTouchMove for mobile devices
	function onPointerMove( e ) {

		if ( scope.enabled === false ) return;

		console.log("dragging mouse..");
		e.preventDefault();

		let x = e.clientX;
		let y = e.clientY;

		let dx = (x - mouse.x) / windowSize.x;
		let dy = (y - mouse.y) / windowSize.y;

		destination.y += dx * scale;
		destination.x += dy * scale;

		mouse.set(x, y);


        //console.log(mouseIsMoving);
		// if ( scope.enabled === false ) return;

		// e.preventDefault();

		// mouse.x = ( e.clientX - windowHalf.x );
		// mouse.y = ( e.clientY - windowHalf.y );

		//ClientX not working in lock mode
		// movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		// movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
		// console.log(movementY);

	}

	function onPointerDown ( e ) {

		//e.preventDefault();

		console.log("mouse is down");
	
		mouse.set(e.clientX, e.clientY);
	
		scope.domElement.ownerDocument.addEventListener('pointermove', onPointerMove, false);
		scope.domElement.ownerDocument.addEventListener('pointerup', onPointerUp, false);
		dragging = true;
	}

	function onPointerUp ( e ) {
		e.preventDefault();
		scope.domElement.ownerDocument.removeEventListener('pointermove', onPointerMove, false);
		scope.domElement.ownerDocument.removeEventListener('pointerup', onPointerUp, false);
		
		dragging = false;
	}

	function rotateCam(){
		if ( scope.enabled === false ) return;

		let dx = clamp(destination.x, - HALF_PI, HALF_PI);
		let dy = destination.y;
		let dz =  clamp(destination.z, - HALF_PI, HALF_PI);
	
		camera.rotation.x += ( dx - camera.rotation.x ) * drag;
		camera.rotation.y += ( dy - camera.rotation.y ) * drag;
		camera.rotation.z += ( dz - camera.rotation.z ) * drag;
	}

	function followPath(){
		if ( scope.enabled === false ) return;

		//using delta to make animation more smooth
		delta = clock.getDelta();

		t += speed * delta;
        // animate camera along spline
        //if (firstLoop) {console.log("direction ",direction);}
        //if (firstLoop) {console.log("t: ",t);}
        //if (firstLoop) {console.log("helperTubeGeometry: ",helperTubeGeometry.parameters);}
        scope.helperTubeGeometry.parameters.path.getPointAt( t, scope.position );
        scope.position.multiplyScalar( 4);

        // interpolation

        const segments = scope.helperTubeGeometry.tangents.length;
        //if (firstLoop) {console.log("tangenten: ",scope.helperTubeGeometry.tangents);}
        const pickt = t * segments;
        const pick = Math.floor( pickt );
		scope.segment = pick;
      
        //if (firstLoop) {console.log("pick: ",pick);}
        const pickNext = ( pick + 1 ) % segments;

        //if (firstLoop) {console.log("binormals: ",helperTubeGeometry.binormals);}
        binormal.subVectors( scope.helperTubeGeometry.binormals[ pickNext ], scope.helperTubeGeometry.binormals[ pick ] );
        binormal.multiplyScalar( pickt - pick ).add( scope.helperTubeGeometry.binormals[ pick ] );

        //tangente copied into direction
        //if (firstLoop) {console.log("t ",t);}
        scope.helperTubeGeometry.parameters.path.getTangentAt( t, direction );
        const offset = 15;

        //the bug is somewhere at the tangente, that sets the wrong direction. It works differently if the tube is in 3D
        // so if one Z value is changed.

        //if (firstLoop) {console.log("binormal ",binormal);}
        //if (firstLoop) {console.log("direction ",direction);}

        //normal.copy( binormal ).cross(direction);

        //if the spine is not 3d (on one y level), this is always the normal.
        scope.normal.x = 0;
        scope.normal.y = 1;
        scope.normal.z = 0;
        //normal.copy(binormal);

        // we move on a offset on its binormal
        scope.position.add( scope.normal.clone().multiplyScalar( offset ) );

		//camera.rotation.y = -camRotationY;

        camera.position.copy( scope.position );
        cameraEye.position.copy( scope.position );

        // using arclength for stablization in look ahead

        scope.helperTubeGeometry.parameters.path.getPointAt( ( t + 30 / scope.helperTubeGeometry.parameters.path.getLength() ) % 1, lookAt );
        lookAt.multiplyScalar( 4);

        // camera orientation 2 - up orientation via normal
        if ( !lookAhead ){ 
          lookAt.copy( scope.position ).add( direction );
        }
        camera.matrix.lookAt( camera.position, lookAt, scope.normal );
        camera.quaternion.setFromRotationMatrix( camera.matrix,camera.rotation.order );
		
		
		// target.x = (1 - mouse.x) * 0.002;
		// target.y = (1 - mouse.y) * 0.002;

		// //camRotationX += 0.05 * (target.y - camera.rotation.x);
		// camRotationY += 0.05 * (target.x - camera.rotation.y);
		// console.log(camRotationY);
		// if(camRotationY >= 0.45){
		// 	camRotationY = 0.45;
		// } 
		// if(camRotationY <= -0.45){
		// 	camRotationY = -0.45;
		// } 
		
		// //camera.rotation.x = camRotationX;
		// camera.rotation.y = camRotationY;

		rotateCam();
		
		//camera.quaternion.setFromEuler( euler );

		//calcEuler();
		

        if (firstLoop) {
          console.log("end position: ",scope.position);
          firstLoop = false;
        }

        //console.log(camera);
        cameraHelper.update();

		//when pick is 20
		
		//stop following path
		//tell scene to establish info element

        // if (isMoving){
        //   //t += 0.00003;
        //   if (pick == 20){
        //     this.manageInformation(1);
        //   }
        // }

	}	

	function clamp(v, min, max) {
		return Math.min(Math.max(v, min), max);
	}

	this.update = function (isMoving){
		if (isMoving){
			followPath();
		}
		else{
			rotateCam();
		}
	};

	// this.moveForward = function () {

	// 	// move forward parallel to the xz-plane
	// 	// assumes camera.up is y-up

	// 	//vec.setFromMatrixColumn( camera.matrix, 0 );

	// 	//vec.crossVectors( camera.up, vec );

	// 	followPath();

	// 	//camera.position.addScaledVector( vec, distance );

	// };

	this.handleResize = function () {
		console.log("resizing controls");
		windowSize.x = scope.domElement.offsetWidth;
		windowSize.y = scope.domElement.offsetHeight;
		console.log(windowSize.x);
	};

	this.connect = function () {

		scope.domElement.addEventListener( 'pointerdown', onPointerDown, false );
		scope.domElement.addEventListener( 'resize', this.handleResize );
		console.log("connected event listeners");
		scope.enabled = true;
	

	};

	this.dispose = function () {

		scope.domElement.removeEventListener( 'pointerdown', onPointerDown, false );
		scope.domElement.removeEventListener( 'resize', this.handleResize );

	};

	this.handleResize();
	//this.connect();

}


PlayerControls.prototype = Object.create( EventDispatcher.prototype );
PlayerControls.prototype.constructor = PlayerControls;

export { PlayerControls };