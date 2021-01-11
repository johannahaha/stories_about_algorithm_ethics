<template>
    <div>
        <div id="container"></div> 
    </div>    
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Curves } from 'three/examples//jsm/curves/CurveExtras.js';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';

//VARIABLES
let scene, renderer, controls;

const direction = new THREE.Vector3();
const binormal = new THREE.Vector3();
const normal = new THREE.Vector3();
const position = new THREE.Vector3();
const lookAt = new THREE.Vector3();
let camera, cameraHelper, cameraEye, overviewCamera;
let cameraHelperOn = false;
let lookAhead = false;

let tubeGeometry, mesh, parent, sampleClosedSpline;

let box;

let guiParameters;

const points = [];
points.push( new THREE.Vector3(0, 0, 0 ));
points.push( new THREE.Vector3( 0, 1, -10 ));
points.push( new THREE.Vector3( 0, 2, -20 ));

export default {
  name: 'Scene',
  methods: {
    animateCamera: function() {

				cameraHelper.visible = cameraHelperOn;
				cameraEye.visible = cameraHelperOn;

    },
    addGeometry: function( geometry ) {

				// 3D shape
        const material = new THREE.MeshPhongMaterial( 
          { color: 0xffffff } );
        const wireframeMaterial = new THREE.MeshBasicMaterial( 
          { color: 0x000000, opacity: 0.3, wireframe: true, transparent: true } );
        
				mesh = new THREE.Mesh( geometry, material );
				const wireframe = new THREE.Mesh( geometry, wireframeMaterial );
				mesh.add( wireframe );

				parent.add( mesh );

		},
    addTube: function() {

				if ( mesh !== undefined ) {

					parent.remove( mesh );
					mesh.geometry.dispose();

				}

				const extrudePath = sampleClosedSpline;
				tubeGeometry = new THREE.TubeBufferGeometry( extrudePath, 100, 1, 3, false );

				this.addGeometry( tubeGeometry );
        mesh.scale.set(4, 4, 4);

    },
    init: function() {
        let container = document.getElementById('container');

        //SCENE
        scene = new THREE.Scene();
        scene.background = new THREE.Color('#f43df1');
        scene.background = new THREE.Color(0x2F252D);

        overviewCamera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.01, 10000 );
        overviewCamera.position.set( 0, 50, 500 );
        
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 1;
        camera.lookAt( 0, 0, 0 );

         //LIGHT
        const light = new THREE.AmbientLight( 0x404040 ); // soft white light 
        scene.add( light );

        //SPLINE
        sampleClosedSpline = new THREE.CatmullRomCurve3( [
          new THREE.Vector3( -40, - 40, 0 ),
          new THREE.Vector3( -40, 40, 0 ),
          new THREE.Vector3( -40, 140, 0 ),
          new THREE.Vector3( 40, 40, 0 ),
          new THREE.Vector3( 40, - 40, 0 )]);
        
        sampleClosedSpline.curveType = 'catmullrom';
        sampleClosedSpline.closed = true;

        //LINE
        const material = new THREE.LineBasicMaterial({
          color: 0x0000ff,
          linewidth: 10
        });
        const geometry = new THREE.BufferGeometry().setFromPoints( points );

        const line = new THREE.Line( geometry);
        //scene.add(line);

        //INFORMATION CUBE 
        const boxGeo = new THREE.BoxBufferGeometry();
        const boxMat = new THREE.MeshPhongMaterial({color:0x00ff00});
        box = new THREE.Mesh(boxGeo,boxMat);
        box.position.x = -40;
        box.position.y = 40; 
        box.position.z = 10;
        scene.add(box)

        //PARENT  FOR CAMERA
        parent = new THREE.Object3D();
        scene.add(parent);
        parent.add(camera);
        cameraHelper = new THREE.CameraHelper( camera );
        scene.add( cameraHelper );

        this.addTube();
        
        // debug camera

				cameraEye = new THREE.Mesh( new THREE.SphereBufferGeometry( 5 ), new THREE.MeshBasicMaterial( { color: 0xdddddd } ) );
				parent.add( cameraEye );

				cameraHelper.visible = cameraHelperOn;
				cameraEye.visible = cameraHelperOn;

    
        //RENDERER
        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        controls = new OrbitControls(camera, renderer.domElement);

        const gui = new GUI( { width: 300 } );
        // get the default value 
        guiParameters = {
         //material: icosaMaterial.color.getHex(),
          animationView: true
         };

        const folderCamera = gui.addFolder( 'Camera' );
				folderCamera.add(guiParameters,'animationView' ).onChange( function () {

					this.animateCamera();

				} );

        window.addEventListener( 'resize', this.onWindowResize, false );

    },
    onWindowResize: function() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			},
    animate: function() {
        requestAnimationFrame(this.animate);
        //this.mesh.rotation.x += 0.01;
        //this.mesh.rotation.y += 0.02;
        controls.update();
        this.render();
        renderer.render(scene, camera);
    },
    render: function() {
      // animate camera along spline

				const time = Date.now();
				const looptime = 20 * 2000;
				const t = ( time % looptime ) / looptime;

				tubeGeometry.parameters.path.getPointAt( t, position );
				position.multiplyScalar( 4);

				// interpolation

				const segments = tubeGeometry.tangents.length;
				const pickt = t * segments;
				const pick = Math.floor( pickt );
				const pickNext = ( pick + 1 ) % segments;

				binormal.subVectors( tubeGeometry.binormals[ pickNext ], tubeGeometry.binormals[ pick ] );
				binormal.multiplyScalar( pickt - pick ).add( tubeGeometry.binormals[ pick ] );

				tubeGeometry.parameters.path.getTangentAt( t, direction );
				const offset = 15;

				normal.copy( binormal ).cross( direction );

				// we move on a offset on its binormal

				position.add( normal.clone().multiplyScalar( offset ) );

				camera.position.copy( position );
				cameraEye.position.copy( position );

				// using arclength for stablization in look ahead

				tubeGeometry.parameters.path.getPointAt( ( t + 30 / tubeGeometry.parameters.path.getLength() ) % 1, lookAt );
				lookAt.multiplyScalar( 4);

				// camera orientation 2 - up orientation via normal
				if ( !lookAhead ){ 
          lookAt.copy( position ).add( direction );
        }
				camera.matrix.lookAt( camera.position, lookAt, normal );
				camera.quaternion.setFromRotationMatrix( camera.matrix );

				cameraHelper.update();

        renderer.render( scene, guiParameters.animationView === true ? camera : overviewCamera );
				//renderer.render( scene, camera );

    }
  },
  mounted() {
      this.init();
      this.animate();
  }
}
</script>

<style scoped>

#container {
  height: 600px;
}
</style>