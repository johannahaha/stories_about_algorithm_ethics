const SmokeShader = {
    uniforms: {
        "uniforms": {
            "time": {
                "value": 0.0,
                "name": "time",
                "displayName": null,
                "type": "f",
                "glslType": "float",
            },
            "resolution": {
                "value": {x: 1000.0, y:1000.0},
                "name": "resolution",
                "displayName": null,
                "type": "v2",
                "glslType": "vec2",
            },
            "speed": {
                "value": 1.0,
                "name": "speed",
                "displayName": null,
                "type": "f",
                "glslType": "float",
            }
         },
    },
    vertexShader: [

        'void main() {',

		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

		'}'

    ].join( '\n' ),
    fragmentShader: [
        'precision highp float;',
        'uniform float time;',
        'uniform vec2 resolution;',
        'uniform float speed;',

        '// generates pseudo-randam based on screen position',
        'float random(vec2 pos) {',
            'return fract(sin(dot(pos.xy, vec2(12.9898, 78.233))) * 43758.5453123);', 
        '}',

        '// perlin noise',
        'float noise(vec2 pos) {',
            'vec2 i = floor(pos);',
            'vec2 f = fract(pos);',
            'float a = random(i + vec2(0.0, 0.0));',
            'float b = random(i + vec2(1.0, 0.0));',
            'float c = random(i + vec2(0.0, 1.0));',
            'float d = random(i + vec2(1.0, 1.0));',
            'vec2 u = f * f * (3.0 - 2.0 * f);',
            'return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;',
        '}',
        
        '// fractional brownian motion',
        'float fbm(vec2 pos) {',
            'float v = 0.0;',
            'float a = 0.5;', 
            'vec2 shift = vec2(100.0);',
            'mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));',
            'for (int i=0; i<16; i++) {',
                'v = (sin(v*1.07)) + ( a * noise(pos) );',
                'pos = rot * pos * 2.0 + shift;',
                'a *= 0.5;',
            '}',
            'return v;',
        '}',

        'void main(void) {',
            'vec2 p = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);',

            'float time2 = (speed) * time / 2.0;',

            'vec2 q = vec2(0.0);',
            'q.x = fbm(p + 0.00 * time2);',
            'q.y = fbm(p + vec2(1.0));',
            'vec2 r = vec2(-1.0);',
            'r.x = fbm(p + 1.0 * q + vec2(1.7, 9.2) + 0.15 * time2);',
            'r.y = fbm(p + 1.0 * q + vec2(8.3, 2.8) + 0.126 * time2);',
            'float f = fbm(p + r);',
            'vec4 color = mix(',
                'vec4(0,0,0,1.0),',
                'vec4(1.5, 1.5, 1.5,1.0),',
                'clamp(length(r.x), 0.0, 1.0)',
            ');',

            'color = (f *f * f + 0.6 * f * f + 0.5 * f) * color;',

            'gl_FragColor = vec4(color);',
        '}'

    ].join( '\n' ),
};

export {SmokeShader};