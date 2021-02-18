const OuterGlowShader = {
    vertexShader: [
     'precision highp float;',
     'uniform mat3 normalMatrix;',
     'uniform mat4 modelViewMatrix;',
     'uniform mat4 projectionMatrix;',
     'attribute vec3 position;',
     'attribute vec3 normal;',
     'varying vec3 fNormal;',
     'varying vec3 fPosition;',

     'vec4 transparent_main() {',
        'vec4 transparent_position = vec4(0.0);',
        'fNormal = normalize(normalMatrix * normal);',
        'vec4 pos = modelViewMatrix * vec4(position, 1.0);',
        'fPosition = pos.xyz;',
        'transparent_position = projectionMatrix * pos;',
        'return transparent_position *= 1.0;',
      '}',
      
      'void main() {',
        'gl_Position = transparent_main(); }'
    
    ].join( '\n' ),
    fragmentShader: [
     '#ifdef GL_OES_standard_derivatives',
        '#extension GL_OES_standard_derivatives : enable',
     '#endif',   

     'precision highp float;',
     'uniform vec3 color;',
     'uniform float start;',
     'uniform float end;',
     'uniform float alpha;',
     'varying vec3 fPosition;',
     'varying vec3 fNormal;',
        
    'void main() {',
        'if (!gl_FrontFacing)', 
        '{',
            'discard;',
        '}',
        'vec3 normal = normalize(fNormal);',
        'vec3 eye = normalize(-fPosition.xyz);',
        'float rim = smoothstep(start, end, 1.0 - dot(normal, eye));',
        'gl_FragColor = vec4( clamp(rim, 0.0, 1.0) * alpha * color, 0.5);',
    '}'    
        ].join( '\n' ),
}    
export {OuterGlowShader};