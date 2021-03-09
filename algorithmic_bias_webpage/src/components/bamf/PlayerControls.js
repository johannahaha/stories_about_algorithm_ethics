//part of the code are from this class
//https://github.com/within-unlimited/under-neon-lights/blob/master/release/src/mouse-controls.js
//import * as THREE from "three";
import {
	EventDispatcher,
	Vector3,
	Vector2,
	Clock,
	Euler,
	Quaternion
} from 'three';

import {gsap} from 'gsap';


const PlayerControls = function ( parent,camera, domElement , helperGeo, cameraEye, cameraHelper ) {
	if ( domElement === document ) console.error( 'PlayerControls: "document" should not be used as the target "domElement". Please use "renderer.domElement" instead.' );

	console.log("instantiating player controls");
    this.domElement = domElement;
	this.isLocked = false;
	this.helperTubeGeometry = helperGeo;
	this.enabled = false;
	this.enableMouseControl = true;
	this.segment;

	this.offset = 15;
	this.lookFar = 40;

	//
	// internals
	//

	let scope = this;

	console.log(cameraEye,cameraHelper);
	//this.domElement = domElement || window;
	//this.domElement.isWindow = !domElement;
	parent.rotation.reorder('YXZ');
	camera.rotation.reorder( 'YXZ' );
	const mouse = new Vector2();
	//const target = new Vector2();
	let destination = new Euler(camera.rotation.x,camera.rotation.y,camera.rotation.z);
	destination.reorder( 'YXZ' );

	let rotationRadians = new Euler(camera.rotation.x,camera.rotation.y,camera.rotation.z);
	rotationRadians.reorder( 'YXZ' );
	let quaternion = new Quaternion();

	//let destination = new Vector3();
	//let lastDestination = new Vector3();
	let lastCamRotation = new Vector3();
	
	let drag = 0.66;
	let scale = 1;
	// eslint-disable-next-line no-unused-vars
	let dragging = false;
	//console.log(dragging);
	const HALF_PI = Math.PI// / 2;



	const windowSize = new Vector2( scope.domElement.offsetWidth, scope.domElement.offsetHeight);


	const clock = new Clock();
	let delta;
	let speed = 0.006;//0.04;//0.001;
	
	//follow path
	let firstLoop = true;
	let direction = new Vector3(0,0,0);
	let binormal = new Vector3();
	this.normal = new Vector3();
	this.position = new Vector3();
	let lookAt = new Vector3();
	let lookAhead = true;
	let t=0;
	const segments = this.helperTubeGeometry.tangents.length;
	let pick,pickt,pickNext

	// let euler = new Euler();
	// let lastEuler = new Euler();
	// let rotationDi= new Vector3();
	// //let quaternion = new Quaternion();
	//let destinationQuat = new Quaternion();

	this.resetCam = true;

	//TODO: onTouchMove for mobile devices
	function onPointerMove( e ) {

		if ( scope.enabled === false ) return;

		//console.log("dragging mouse..");
		e.preventDefault();

		let x = e.clientX;
		let y = e.clientY;

		let dx = (x - mouse.x) / windowSize.x;
		let dy = (y - mouse.y) / windowSize.y;

		//lastDestination.copy(destination);

		destination.y += dx * scale;
		destination.x += dy * scale;

		mouse.set(x, y);


	}

	function onPointerDown ( e ) {

		if ( scope.enabled === false ) return;

		//e.preventDefault();
	
		mouse.set(e.clientX, e.clientY);
	
		scope.domElement.ownerDocument.addEventListener('pointermove', onPointerMove, false);
		scope.domElement.ownerDocument.addEventListener('pointerup', onPointerUp, false);
		dragging = true;
	}

	function onPointerUp ( e ) {
		if ( scope.enabled === false ) return;

		e.preventDefault();
		scope.domElement.ownerDocument.removeEventListener('pointermove', onPointerMove, false);
		scope.domElement.ownerDocument.removeEventListener('pointerup', onPointerUp, false);
		dragging = false;
	}

	function rotateCam(){
		if ( scope.enabled === false ){
			console.log("controls are not enabled")
			return;
		}
		if ( scope.enableMouseControl === false ) return;

		//console.log(destination);

		let dx = clamp(destination.x,-HALF_PI,HALF_PI);
		let dy = clamp(destination.y,-HALF_PI,HALF_PI);

		rotationRadians.x = dx;
		rotationRadians.y = dy;
		rotationRadians.z = 0 * drag;

		quaternion.setFromEuler(rotationRadians);

		camera.quaternion.rotateTowards ( quaternion, 0.1 )
		//camera.rotation.applyQuaternion(quaternion);
		//camera.rotation.x += ( dx - camera.rotation.x ) * drag;
		//camera.rotation.y += ( dy - camera.rotation.y ) * drag;

		//if(camera.rotation.y > 3 || camera.rotation.y < -3) camera.rotation.y = 0;
		//camera.rotation.z += ( dz - camera.rotation.z ) * drag;

		//console.log(dx,dy,dz);
		//console.log(camera.rotation.x)
	

	}

	function followPath(){
		if ( scope.enabled === false ) return;
		if ( scope.resetCam === false ) return;

		//const segments = scope.helperTubeGeometry.tangents.length;
        //if (firstLoop) {console.log("tangenten: ",scope.helperTubeGeometry.tangents);}
		pickt = t * segments;
		pick = Math.floor( pickt );

		scope.segment = pick;
        //if (firstLoop) {console.log("pick: ",pick);}
        pickNext = ( pick + 1 ) % segments;

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

        //if (firstLoop) {console.log("binormals: ",helperTubeGeometry.binormals);}
        binormal.subVectors( scope.helperTubeGeometry.binormals[ pickNext ], scope.helperTubeGeometry.binormals[ pick ] );
        binormal.multiplyScalar( pickt - pick ).add( scope.helperTubeGeometry.binormals[ pick ] );

        //tangente copied into direction
        //if (firstLoop) {console.log("t ",t);}
        scope.helperTubeGeometry.parameters.path.getTangentAt( t, direction );

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
        scope.position.add( scope.normal.clone().multiplyScalar( scope.offset ) );

		//camera.rotation.y = -camRotationY;

        camera.position.copy( scope.position );
        //cameraEye.position.copy( scope.position );

        // using arclength for stablization in look ahead

        scope.helperTubeGeometry.parameters.path.getPointAt( ( t + scope.lookFar / scope.helperTubeGeometry.parameters.path.getLength() ) % 1, lookAt );
        lookAt.multiplyScalar( 4);

        // camera orientation 2 - up orientation via normal
        if ( !lookAhead ){ 
			lookAt.copy( scope.position ).add( direction );
        }
		// Constructs a rotation matrix, looking from eye towards center oriented by the up vector. 
        camera.matrix.lookAt( camera.position, lookAt, scope.normal );
        camera.quaternion.setFromRotationMatrix( camera.matrix,camera.rotation.order );
		lastCamRotation.copy(camera.rotation);

		//rotateCam();


        if (firstLoop) {
          //console.log("end position: ",scope.position);
          firstLoop = false;
        }

        //cameraHelper.update();

	}	

	function clamp(v, min, max) {
		return Math.min(Math.max(v, min), max);
	}

	this.update = function (isMoving){
		if ( scope.enabled === false ) return;
		if (isMoving){
			if (!clock.running) {
				clock.start();
			}
			
			followPath();
		}
		else{
			if (clock.running) {
				clock.stop();
			}
			rotateCam();
		}
	};

	this.stopFollow = function (infoFollowPath){
		if (infoFollowPath) return;
		clock.stop();
		scope.resetCam = false;
		//console.log("stopping follow");
		//console.log("lastcam",lastCamRotation);
		//if(lastCamRotation.y > 2.9 && lastCamRotation.y < -2.9) lastCamRotation.y = 0;
		scope.resetMouse();
		//console.log(clock);
	}

	this.startFollow = function (infoFollowPath){
		if (infoFollowPath) return;
		//console.log("starting follow");
		//console.log(camera.rotation);
		gsap.to(camera.rotation,{
			duration: 1,
			x:lastCamRotation.x,
			y:lastCamRotation.y,
			z:0,
			onComplete: function(){
				clock.start()
				scope.resetCam = true;
			}
		})
		//clock.start();
	}

	this.resetMouse = function(destinationQuat = camera.quaternion){
		mouse.set(0, 0);
		//if(lastCamRotation.y > 2.8 && lastCamRotation.y < -2.8) lastCamRotation.y = 0;
		//destination = new Euler(0,0,0);
		//console.log("destination quat");
		//console.log(JSON.parse(JSON.stringify(destinationQuat)));
		destination.setFromQuaternion(destinationQuat);
		destination.reorder( 'YXZ' );
		// console.log("starting destination",destination);
		// console.log("check this quat");
		// console.log(JSON.parse(JSON.stringify(quaternion.setFromEuler(destination))));
	}

	this.getClock = function(){
		return clock;
	}

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