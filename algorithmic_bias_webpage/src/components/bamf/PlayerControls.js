//part of the code are from this three.js class
//https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/PointerLockControls.js

import {
	Euler,
	EventDispatcher,
	Vector3
} from '../../../build/three.module.js';

const PlayerControls = function ( camera, domElement ) {
    this.domElement = domElement;
	this.isLocked = false;

	// Set to constrain the pitch of the camera
	// Range is 0 to Math.PI radians
	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI; // radians

	//
	// internals
	//

	var scope = this;

	var changeEvent = { type: 'change' };
	var lockEvent = { type: 'lock' };
	var unlockEvent = { type: 'unlock' };

	var euler = new Euler( 0, 0, 0, 'YXZ' );

	var PI_2 = Math.PI / 2;

	var vec = new Vector3();

	function onMouseMove( event ) {

        console.log(mouseIsMoving);
		if ( scope.isLocked === false ) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		euler.setFromQuaternion( camera.quaternion );

		euler.y -= movementX * 0.002;
		euler.x -= movementY * 0.002;

		euler.x = Math.max( PI_2 - scope.maxPolarAngle, Math.min( PI_2 - scope.minPolarAngle, euler.x ) );

		camera.quaternion.setFromEuler( euler );

		scope.dispatchEvent( changeEvent );

	}

}

PlayerControls.prototype = Object.create( EventDispatcher.prototype );
PlayerControls.prototype.constructor = PlayerControls;

export { PlayerControls };