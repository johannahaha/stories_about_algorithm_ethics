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


const PlayerControls = function ( parent,camera, domElement , helperGeo ) {
	if ( domElement === document ) console.error( 'PlayerControls: "document" should not be used as the target "domElement". Please use "renderer.domElement" instead.' );

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
	parent.rotation.reorder('YXZ');
	camera.rotation.reorder( 'YXZ' );

	//VARIABLES FOR MOUSE ROATION
	const mouse = new Vector2();
	let destination = new Euler(camera.rotation.x,camera.rotation.y,camera.rotation.z);
	destination.reorder( 'YXZ' );

	let rotationRadians = new Euler(camera.rotation.x,camera.rotation.y,camera.rotation.z);
	rotationRadians.reorder( 'YXZ' );

	let quaternion = new Quaternion();
	let lastCamRotation = new Vector3();
	let drag = 0.66;
	let scale = 1;
	// eslint-disable-next-line no-unused-vars
	let dragging = false;
	const HALF_PI = Math.PI// / 2;
	const windowSize = new Vector2( scope.domElement.offsetWidth, scope.domElement.offsetHeight);

	//VARIABLES FOR FOLLOWING PATH
	const clock = new Clock();
	let delta;
	let speed = 0.005;//0.04;//0.001;
	
	let direction = new Vector3(0,0,0);
	let binormal = new Vector3();
	this.normal = new Vector3();
	this.position = new Vector3();
	let lookAt = new Vector3();
	let lookAhead = true;
	let t=0;
	const segments = this.helperTubeGeometry.tangents.length;
	let pick,pickt,pickNext

	this.resetCam = true;

	//TODO: onTouchMove for mobile devices
	//part of this function are from this class
	//https://github.com/within-unlimited/under-neon-lights/blob/master/release/src/mouse-controls.js
	//set destination depending on mouse
	function onPointerMove( e ) {

		if ( scope.enabled === false ) return;

		e.preventDefault();

		let x = e.clientX;
		let y = e.clientY;

		let dx = (x - mouse.x) / windowSize.x;
		let dy = (y - mouse.y) / windowSize.y;

		destination.y += dx * scale;
		destination.x += dy * scale;

		mouse.set(x, y);
	}

	function onPointerDown ( e ) {

		if ( scope.enabled === false ) return;

	
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

	//rotate Cam with destination
	function rotateCam(){
		if ( scope.enabled === false )return;
		if ( scope.enableMouseControl === false ) return;

		let dx = clamp(destination.x,-HALF_PI,HALF_PI);
		let dy = clamp(destination.y,-HALF_PI,HALF_PI);

		rotationRadians.x = dx;
		rotationRadians.y = dy;
		rotationRadians.z = 0 * drag;

		quaternion.setFromEuler(rotationRadians);

		camera.quaternion.rotateTowards ( quaternion, 0.1 )
	

	}


	//this function is mainly from this three js example
	//https://github.com/mrdoob/three.js/blob/master/examples/webgl_geometry_extrude_splines.html
	//camera following tube geometry
	function followPath(){
		if ( scope.enabled === false ) return;
		if ( scope.resetCam === false ) return;

		pickt = t * segments;
		pick = Math.floor( pickt );

		scope.segment = pick;
        pickNext = ( pick + 1 ) % segments;

		//using delta to make animation more smooth
		delta = clock.getDelta();

		t += speed * delta;
        // animate camera along spline
        scope.helperTubeGeometry.parameters.path.getPointAt( t, scope.position );
        scope.position.multiplyScalar( 4);

        // interpolation
        binormal.subVectors( scope.helperTubeGeometry.binormals[ pickNext ], scope.helperTubeGeometry.binormals[ pick ] );
        binormal.multiplyScalar( pickt - pick ).add( scope.helperTubeGeometry.binormals[ pick ] );

        //tangente copied into direction
        scope.helperTubeGeometry.parameters.path.getTangentAt( t, direction );

        //if the spine is not 3d (on one y level like this path), this is always the normal.
        scope.normal.x = 0;
        scope.normal.y = 1;
        scope.normal.z = 0;

        // add offset
        scope.position.add( scope.normal.clone().multiplyScalar( scope.offset ) );

        camera.position.copy( scope.position );

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

	}	

	function clamp(v, min, max) {
		return Math.min(Math.max(v, min), max);
	}

	this.setSpeed = function (pSpeed){
		console.log("setting new speed in controls", pSpeed);
		speed = pSpeed;
	};

	//called by Scene.vue, updating controls
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

	//stop following the path, start rotating with mouse
	this.stopFollow = function (infoFollowPath){
		if (infoFollowPath) return;
		clock.stop();
		scope.resetCam = false;
		scope.resetMouse();
	}

	//start following the path, stop rotating with mouse
	this.startFollow = function (infoFollowPath){
		if (infoFollowPath) return;

		gsap.to(camera.rotation,{
			duration: 0.5,
			x:lastCamRotation.x,
			y:lastCamRotation.y,
			z:0,
			onComplete: function(){
				clock.start()
				scope.resetCam = true;
			}
		})
	}

	//reset mouse position and destination
	this.resetMouse = function(destinationQuat = camera.quaternion){
		mouse.set(0, 0);
		destination.setFromQuaternion(destinationQuat);
		destination.reorder( 'YXZ' );
	}

	//window resize
	this.handleResize = function () {
		windowSize.x = scope.domElement.offsetWidth;
		windowSize.y = scope.domElement.offsetHeight;
	};

	//connect event handlers
	this.connect = function () {

		scope.domElement.addEventListener( 'pointerdown', onPointerDown, false );
		scope.domElement.addEventListener( 'resize', this.handleResize );
		scope.enabled = true;
	

	};

	//dispose event handlers
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