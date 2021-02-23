const OuterGlowShader = {
    vertexShader: [
     'precision highp float;',
    'uniform mat3 normalMatrix;',
    'uniform mat4 modelViewMatrix;',
    'uniform mat4 projectionMatrix;',
    'uniform mat4 modelMatrix;',
    'uniform mat4 viewMatrix;',
    'attribute vec3 position;',
    'attribute vec3 normal;',

    'uniform float time;',
    'uniform float cStrength;',
    'uniform float angle;',
    'attribute vec2 uv;',
    'attribute vec2 uv2;',

    'varying vec3 fPosition;',
    'varying vec3 fNormal;',


    'const vec3 cXaxis = vec3(1.0, 0.0, 0.0);',
    'const vec3 cYaxis = vec3(0.0, 1.0, 0.0);',
    'const vec3 cZaxis = vec3(0.0, 0.0, 1.0);',

    'vec4 twister(vec4 pos, float t) {',
        'float st = sin(t);',
        'float ct = cos(t);',
        'vec4 new_pos = vec4(pos);',
        'new_pos.x = pos.x * ct - pos.z * st;',
        'new_pos.z = pos.x * st + pos.z * ct;',
        'new_pos.y = pos.y;',
        'new_pos.w = pos.w;',
        'return new_pos;',
    '}',

    'vec4 vertex_distortion_main() {',
        'vec4 vertex_distortion_position = vec4(0.0);',
        'float howFarUp = position.y;',
        'vec3 directionVec = normalize(vec3(position));',
        'float xangle = dot(cXaxis, directionVec) * 5.0;',
        'float yangle = dot(cYaxis, directionVec) * 6.0;',
        'float zangle = dot(cZaxis, directionVec) * 4.5;',
        'float mTime = time * 1.05;',
        'float cosx = cos(mTime + xangle);',
        'float sinx = sin(mTime + xangle);',
        'float cosy = cos(mTime + yangle);',
        'float siny = sin(mTime + yangle);',
        'float cosz = cos(mTime + zangle);',
        'float sinz = sin(mTime + zangle);',
        'vec3 timeVec = position;',
        'timeVec.x += directionVec.x * cosx * siny * cosz * cStrength;',
        'timeVec.y += directionVec.y * sinx * cosy * sinz * cStrength;',
        'timeVec.z += directionVec.z * sinx * cosy * cosz * cStrength;',
        'float twistAngle = angle;', //* howFarUp;', 
        'vec4 twistedPosition = twister(vec4(position, 1.0), twistAngle);',
        'vec4 twistedNormal = twister(vec4(normal, 1.0), twistAngle);',
        
        'fNormal = normalize(normalMatrix * twistedNormal.xyz);',
        
        'vec4 pos = modelViewMatrix * vec4(timeVec + twistedPosition.xyz, 1.0);',
        'fPosition = pos.xyz;',
        
        'vertex_distortion_position = projectionMatrix * modelViewMatrix * vec4(timeVec + twistedPosition.xyz, 1.0);',
        
        'return vertex_distortion_position *= 1.0;',
    '}',

    'void main() {',
            'gl_Position = vertex_distortion_main(); }' 
        ].join( '\n' ),
        fragmentShader: [
        '#ifdef GL_OES_standard_derivatives',
            '#extension GL_OES_standard_derivatives : enable',
        '#endif',   

        'precision highp float;',
        'uniform vec3 transparent_color;',
        'uniform float start;',
        'uniform float end;',
        'uniform float alpha;',
        'varying vec3 fPosition;',
        'varying vec3 fNormal;',
            
        'void main() {',
            'if (!gl_FrontFacing) {',
                'discard;',
            '}',
            'vec3 normal = normalize(fNormal);',
            'vec3 eye = normalize(-fPosition.xyz);',
            'float rim = smoothstep(start, end, 1.0 - dot(normal, eye));',
            'gl_FragColor = vec4( clamp(rim, 0.0, 1.0) * alpha * transparent_color, 0.5);',
        '}'    
    ].join( '\n' ),
}    
export {OuterGlowShader};