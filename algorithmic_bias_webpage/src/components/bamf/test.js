 import * as THREE from 'https://threejs.org/build/three.module.js';

import { MeshSurfaceSampler } from 'https://threejs.org/examples/jsm/math/MeshSurfaceSampler.js';
import { GLTFLoader } from 'https://threejs.org/examples/jsm/loaders/GLTFLoader.js';
import Stats from 'https://threejs.org/examples/jsm/libs/stats.module.js';
import { GUI } from 'https://threejs.org/examples/jsm/libs/dat.gui.module.js';
import { Curves } from 'https://threejs.org/examples/jsm/curves/CurveExtras.js';

var camera, scene, renderer, stats, splineCamera;

var direction = new THREE.Vector3();
var binormal = new THREE.Vector3();
var normal = new THREE.Vector3();
var position = new THREE.Vector3();
var lookAt = new THREE.Vector3();

var api = {

    count: 200,
    distribution: 'random',
    resample: resample,
    surfaceColor: 0xFFF784,
    backgroundColor: 0xE39469,

};

var stemMesh, blossomMesh, pointLights;
var stemGeometry, blossomGeometry;
var stemMaterial, blossomMaterial;

var sampler;
var count = api.count;
var ages = new Float32Array(count);
var scales = new Float32Array(count);
var pointLights = []
var dummy = new THREE.Object3D();

var _position = new THREE.Vector3();
var _normal = new THREE.Vector3();
var _scale = new THREE.Vector3();

var splines = { GrannyKnot: new Curves.GrannyKnot() };
var parent, surfaceGeometry, mesh, cameraHelper, cameraEye;

var params = {
    spline: 'GrannyKnot',
    scale: 4,
    extrusionSegments: 100,
    radiusSegments: 3,
    closed: true,
    animationView: true,
    lookAhead: true,
    cameraHelper: true,
};

var extrudePath = splines[params.spline];

var surfaceMaterial = new THREE.MeshLambertMaterial({ color: api.surfaceColor, wireframe: false });

var surfaceGeometry = new THREE.TubeBufferGeometry(extrudePath, params.extrusionSegments, 2, params.radiusSegments, params.closed);

var surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
var wireframe = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
surface.add(wireframe);

// NOTE: If not this setting, camera frame gose wrong position.
setScale(surface)

// Source: https://gist.github.com/gre/1650294
var easeOutCubic = function (t) {

    return (--t) * t * t + 1;

};

// Scaling curve causes particles to grow quickly, ease gradually into full scale, then
// disappear quickly. More of the particle's lifetime is spent around full scale.
var scaleCurve = function (t) {

    return Math.abs(easeOutCubic((t > 0.5 ? 1 - t : t) * 2));

};

var loader = new GLTFLoader();

loader.load('https://threejs.org/examples/models/gltf/Flower/Flower.glb', function (gltf) {

    var _stemMesh = gltf.scene.getObjectByName('Stem');
    var _blossomMesh = gltf.scene.getObjectByName('Blossom');

    stemGeometry = new THREE.InstancedBufferGeometry();
    blossomGeometry = new THREE.InstancedBufferGeometry();

    THREE.BufferGeometry.prototype.copy.call(stemGeometry, _stemMesh.geometry);
    THREE.BufferGeometry.prototype.copy.call(blossomGeometry, _blossomMesh.geometry);

    var defaultTransform = new THREE.Matrix4()
    .makeRotationX(Math.PI)
    .multiply(new THREE.Matrix4().makeScale(7, 7, 7));

    stemGeometry.applyMatrix4(defaultTransform);
    blossomGeometry.applyMatrix4(defaultTransform);

    stemMaterial = _stemMesh.material;
    blossomMaterial = _blossomMesh.material;

    // Assign random colors to the blossoms.
    var _color = new THREE.Color();
    var color = new Float32Array(count * 3);
    var blossomPalette = [0xF20587, 0xF2D479, 0xF2C879, 0xF2B077, 0xF24405];

    for (var i = 0; i < count; i++) {

    _color.setHex(blossomPalette[Math.floor(Math.random() * blossomPalette.length)]);
    _color.toArray(color, i * 3);

    }

    blossomGeometry.setAttribute('color', new THREE.InstancedBufferAttribute(color, 3));
    blossomMaterial.vertexColors = true;

    stemMesh = new THREE.InstancedMesh(stemGeometry, stemMaterial, count);
    blossomMesh = new THREE.InstancedMesh(blossomGeometry, blossomMaterial, count);

    // Instance matrices will be updated every frame.
    stemMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    blossomMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);


    scene = new THREE.Scene();
    parent = new THREE.Object3D();
    scene.add(parent);

    var sphere = new THREE.SphereBufferGeometry(0.5, 16, 8);

    var blossomPalette = [0xF20587, 0xF2D479, 0xF2C879, 0xF2B077, 0xF24405];

    for (let i = 0; i < count; i++) {

    const color = blossomPalette[Math.floor(Math.random() * blossomPalette.length)]
    let light = new THREE.PointLight(color, 0.2, 40)
    const mesh = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color }))

    light.add(mesh);
    parent.add(light)

    pointLights.push(light)
    }


    setScale(stemMesh)
    setScale(blossomMesh)

    resample();

    init();
    animate();

});

function setScale(mesh) {
    mesh.scale.set(params.scale, params.scale, params.scale);
}

function init() {
    splineCamera = new THREE.PerspectiveCamera(84, window.innerWidth / window.innerHeight, 0.01, 1000);

    cameraHelper = new THREE.CameraHelper(splineCamera);
    cameraHelper.visible = true

    parent.add(splineCamera)

    // scene.add(new THREE.HemisphereLight());

    cameraEye = new THREE.Mesh(new THREE.SphereBufferGeometry(5), new THREE.MeshBasicMaterial({ color: 0xdddddd }));
    cameraEye.visible = true
    parent.add(cameraEye)
    scene.add(cameraHelper);

    //

    parent.add(stemMesh);
    parent.add(blossomMesh);

    parent.add(surface);

    //

    var gui = new GUI();
    gui.add(api, 'count', 0, count).onChange(function () {

    stemMesh.count = api.count;
    blossomMesh.count = api.count;

    });


    gui.add(api, 'distribution').options(['random', 'weighted']).onChange(resample);
    gui.add(api, 'resample');

    //

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    //

    stats = new Stats();
    document.body.appendChild(stats.dom);

    //

    window.addEventListener('resize', onWindowResize, false);

}

function resample() {

    var vertexCount = surface.geometry.getAttribute('position').count;

    console.info('Sampling ' + count + ' points from a surface with ' + vertexCount + ' vertices...');

    //

    console.time('.build()');

    sampler = new MeshSurfaceSampler(surface)
    .setWeightAttribute(api.distribution === 'weighted' ? 'uv' : null)
    .build();

    console.timeEnd('.build()');

    //

    console.time('.sample()');

    for (var i = 0; i < count; i++) {

    ages[i] = Math.random();
    scales[i] = scaleCurve(ages[i]);

    resampleParticle(i);

    }

    console.timeEnd('.sample()');

    stemMesh.instanceMatrix.needsUpdate = true;
    blossomMesh.instanceMatrix.needsUpdate = true;

}

function resampleParticle(i) {

    sampler.sample(_position, _normal);
    _normal.add(_position);

    dummy.position.copy(_position);
    dummy.scale.set(scales[i], scales[i], scales[i]);
    dummy.lookAt(_normal);
    dummy.updateMatrix();

    stemMesh.setMatrixAt(i, dummy.matrix);
    blossomMesh.setMatrixAt(i, dummy.matrix);

    if (pointLights.length > 0) {
    const light = pointLights[i]
    light.position.x = _position.x * params.scale
    light.position.y = _position.y * params.scale
    light.position.z = _position.z * params.scale
    }
}

function updateParticle(i) {

    // Update lifecycle.

    ages[i] += 0.005;

    if (ages[i] >= 1) {

    ages[i] = 0.001;
    scales[i] = scaleCurve(ages[i]);

    resampleParticle(i);

    return;

    }

    // Update scale.

    var prevScale = scales[i];
    scales[i] = scaleCurve(ages[i]);

    // NOTE: // NOTE: relative ratio by previous scale and current value.
    //       If previous is 0.5 and current is also 0.5, it means nothing to do.
    //       If previous is 0.5 and current is 0.6, it relatively increases at 1.2
    _scale.set(scales[i] / prevScale, scales[i] / prevScale, scales[i] / prevScale);

    // Update transform.

    stemMesh.getMatrixAt(i, dummy.matrix);
    dummy.matrix.scale(_scale);
    stemMesh.setMatrixAt(i, dummy.matrix);
    blossomMesh.setMatrixAt(i, dummy.matrix);

}

function onWindowResize() {

    splineCamera.aspect = window.innerWidth / window.innerHeight;
    splineCamera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

//

function animate() {

    requestAnimationFrame(animate);

    render();

    stats.update();

}

function render() {

    if (stemMesh && blossomMesh) {

    var time = Date.now() * 0.001;


    for (var i = 0; i < api.count; i++) {

        updateParticle(i);

    }

    stemMesh.instanceMatrix.needsUpdate = true;
    blossomMesh.instanceMatrix.needsUpdate = true;


    time = Date.now();
    // var time = Date.now();
    var looptime = 20 * 10000;
    var t = (time % looptime) / looptime;

    surfaceGeometry.parameters.path.getPointAt(t, position);
    position.multiplyScalar(params.scale);

    // interpolation

    var segments = surfaceGeometry.tangents.length;
    var pickt = t * segments;
    var pick = Math.floor(pickt);
    var pickNext = (pick + 1) % segments;

    binormal.subVectors(surfaceGeometry.binormals[pickNext], surfaceGeometry.binormals[pick]);
    binormal.multiplyScalar(pickt - pick).add(surfaceGeometry.binormals[pick]);

    surfaceGeometry.parameters.path.getTangentAt(t, direction);
    var offset = 15;

    normal.copy(binormal).cross(direction);

    // we move on a offset on its binormal

    position.add(normal.clone().multiplyScalar(offset));

    splineCamera.position.copy(position);
    cameraEye.position.copy(position);

    // using arclength for stablization in look ahead

    surfaceGeometry.parameters.path.getPointAt((t + 30 / surfaceGeometry.parameters.path.getLength()) % 1, lookAt);
    lookAt.multiplyScalar(params.scale);

    // camera orientation 2 - up orientation via normal

    if (!params.lookAhead) lookAt.copy(position).add(direction);
    splineCamera.matrix.lookAt(splineCamera.position, lookAt, normal);
    splineCamera.quaternion.setFromRotationMatrix(splineCamera.matrix);

    cameraHelper.update();

    renderer.render(scene, splineCamera)
    }

}



