//part of the code are from this three.js class
//https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/PointerLockControls.js

import {
	EventDispatcher,
	Vector3,
	Vector2,
	Clock
} from 'three';

const PlayerControls = function ( camera, domElement , helperGeo, cameraEye, cameraHelper ) {
	console.log("instantiating player controls");
    this.domElement = domElement;
	this.isLocked = false;
	this.helperTubeGeometry = helperGeo;

	//vertical angle restriction
	// this.minPolarAngle = 0; // radians
	// this.maxPolarAngle = Math.PI; // radians

	// //horizontal angle restriction
	// this.minAzimuthAngle = 0; // radians
	// this.maxAzimuthAngle = Math.PI; // radians

	//
	// internals
	//

	let scope = this;

	let changeEvent = { type: 'change' };
	let lockEvent = { type: 'lock' };
	let unlockEvent = { type: 'unlock' };

	// let movementX, movementY;

	// let euler = new Euler( 0, 0, 0, 'YXZ' );
	// let PI_2 = Math.PI / 2;

	// let rotationAngle = 0;
	// let quaternion = new Quaternion();
	// let up = new Vector3(0,1,0);

	const mouse = new Vector2();
	const target = new Vector2();
	const windowHalf = new Vector2( scope.domElement.offsetWidth / 2, scope.domElement.offsetHeight / 2 );


	const clock = new Clock();
	let delta;
	let speed = 0.001;


	
	//follow path
	let firstLoop = true;
	let direction = new Vector3(0,0,0);
	let binormal = new Vector3();
	let normal = new Vector3();
	let position = new Vector3();
	let lookAt = new Vector3();
	let lookAhead = false;
	let t=0;


	//let width = window.innerWidth;
	//let height = windown.innerHeight;
	//let vec = new Vector3();

	function onMouseMove( event ) {

        //console.log(mouseIsMoving);
		if ( scope.isLocked === false ) return;

		mouse.x = ( event.clientX - windowHalf.x );
		mouse.y = ( event.clientY - windowHalf.y );

		console.log(event);
		// movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		// movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
		// console.log(movementY);

		//X falls between A and B, and you would like Y to fall between C and D, you can apply the following linear transform:

		//Y = (X-A)/(B-A) * (D-C) + C
		//rotationAngle = (movementX-0)/(width-0)*(Math.PI-0)+0
		//console.log("anlge",rotationAngle);
		//calcEuler();

		scope.dispatchEvent( changeEvent );

	}
	// function calcEuler(){
	// 	euler.setFromQuaternion( camera.quaternion );

	// 	euler.y -= movementX * 0.002;
	// 	euler.x -= movementY * 0.002;

	// 	euler.x = Math.max( PI_2 - scope.maxPolarAngle, Math.min( PI_2 - scope.minPolarAngle, euler.x ) );
	// 	//euler.y = Math.max( PI_2 - scope.maxAzimuthAngle, Math.min( PI_2 - scope.minAzimuthAngle, euler.x ) );


	// 	camera.quaternion.setFromEuler( euler );
	// }

	function onPointerlockChange() {

		if ( scope.domElement.ownerDocument.pointerLockElement === scope.domElement ) {

			scope.dispatchEvent( lockEvent );

			scope.isLocked = true;

		} else {

			scope.dispatchEvent( unlockEvent );

			scope.isLocked = false;

		}

	}

	function onPointerlockError() {

		console.error( 'THREE.PointerLockControls: Unable to use Pointer Lock API' );

	}

	function followPath(){
		delta = clock.getDelta();

		t = speed * delta;
        // animate camera along spline
        //if (firstLoop) {console.log("direction ",direction);}
        //if (firstLoop) {console.log("t: ",t);}
        //if (firstLoop) {console.log("helperTubeGeometry: ",helperTubeGeometry.parameters);}
        scope.helperTubeGeometry.parameters.path.getPointAt( t, position );
        position.multiplyScalar( 4);

        // interpolation

        const segments = scope.helperTubeGeometry.tangents.length;
        //if (firstLoop) {console.log("tangenten: ",scope.helperTubeGeometry.tangents);}
        const pickt = t * segments;
        const pick = Math.floor( pickt );
      
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
        normal.x = 0;
        normal.y = 1;
        normal.z = 0;
        //normal.copy(binormal);

        // we move on a offset on its binormal
        position.add( normal.clone().multiplyScalar( offset ) );

        camera.position.copy( position );
        cameraEye.position.copy( position );

        // using arclength for stablization in look ahead

        scope.helperTubeGeometry.parameters.path.getPointAt( ( t + 30 / scope.helperTubeGeometry.parameters.path.getLength() ) % 1, lookAt );
        lookAt.multiplyScalar( 4);

        // camera orientation 2 - up orientation via normal
        if ( !lookAhead ){ 
          lookAt.copy( position ).add( direction );
        }
        camera.matrix.lookAt( camera.position, lookAt, normal );
        camera.quaternion.setFromRotationMatrix( camera.matrix,camera.rotation.order );
		//camera.position.applyQuaternion( quaternion.setFromAxisAngle(up,rotationAngle)); // The positive y-axis
		
		target.x = (1 - mouse.x) * 0.002;
		target.y = (1 - mouse.y) * 0.002;
		//console.log(target);
		camera.rotation.x += 0.05 * (target.y - camera.rotation.x);
		camera.rotation.y += 0.05 * (target.x - camera.rotation.y);
		//camera.quaternion.setFromEuler( euler );

		//calcEuler();
		

        if (firstLoop) {
          console.log("end position: ",position);
          firstLoop = false;
        }

        //console.log(camera);
        cameraHelper.update();

        // if (isMoving){
        //   //t += 0.00003;
        //   if (pick == 20){
        //     this.manageInformation(1);
        //   }
        // }

	}	
	this.moveForward = function () {

		// move forward parallel to the xz-plane
		// assumes camera.up is y-up

		//vec.setFromMatrixColumn( camera.matrix, 0 );

		//vec.crossVectors( camera.up, vec );

		followPath();

		//camera.position.addScaledVector( vec, distance );

	};

	this.handleResize = function () {
		console.log("resizing controls");
		if ( scope.domElement === document ) {

			windowHalf.x = window.innerWidth / 2;
			windowHalf.y = window.innerHeight / 2;

		} else {
			console.log("in the else");
			windowHalf.x = scope.domElement.offsetWidth / 2;
			windowHalf.y = scope.domElement.offsetHeight / 2;
			console.log(windowHalf.x);
		}

	};

	this.lock = function () {

		scope.domElement.requestPointerLock();

	};

	this.unlock = function () {

		scope.domElement.ownerDocument.exitPointerLock();

	};

	this.connect = function () {

		scope.domElement.ownerDocument.addEventListener( 'mousemove', onMouseMove );
		scope.domElement.ownerDocument.addEventListener( 'pointerlockchange', onPointerlockChange );
		scope.domElement.ownerDocument.addEventListener( 'pointerlockerror', onPointerlockError );

	};

	this.dispose = function () {

		scope.domElement.ownerDocument.removeEventListener( 'mousemove', onMouseMove );
		scope.domElement.ownerDocument.removeEventListener( 'pointerlockchange', onPointerlockChange );
		scope.domElement.ownerDocument.removeEventListener( 'pointerlockerror', onPointerlockError );

	};

	this.handleResize();
	this.connect();

}

PlayerControls.prototype = Object.create( EventDispatcher.prototype );
PlayerControls.prototype.constructor = PlayerControls;

export { PlayerControls };