import * as THREE from 'three';

export const TOON_VERTEX = /* glsl */ `
  varying vec3 vNormalV;
  varying vec3 vPos;
  void main() {
    vNormalV = normalize(normalMatrix * normal);
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const TOON_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uLineColor;
  uniform vec3 uInk;
  uniform vec3 uSheen;
  uniform vec3 uLightDir;
  uniform float uWebLines;
  uniform float uDotSize;
  varying vec3 vNormalV;
  varying vec3 vPos;

  float halftone(float amount) {
    vec2 cell = mod(gl_FragCoord.xy, uDotSize) - 0.5 * uDotSize;
    return step(length(cell) / (0.5 * uDotSize), amount);
  }

  void main() {
    vec3 n = normalize(vNormalV);
    float ndl = dot(n, normalize(uLightDir));
    vec3 base = uColor;
    if (uWebLines > 0.5) {
      float around = atan(vPos.z, vPos.x) / 6.2831853 * 6.0;
      float rings = abs(fract(vPos.y * 5.0) - 0.5);
      float spokes = abs(fract(around) - 0.5);
      base = mix(base, uLineColor, step(0.465, max(rings, spokes)));
    }
    vec3 c;
    float dots;
    if (ndl > 0.35) { c = base; dots = 0.0; }
    else if (ndl > -0.15) { c = base * 0.78; dots = 0.32; }
    else { c = base * 0.55; dots = 0.62; }
    c += vec3(0.1) * step(0.8, ndl);
    float rim = 1.0 - abs(n.z);
    c += vec3(0.16) * smoothstep(0.62, 0.92, rim) * step(-0.2, ndl);
    // Dots darken bright colors; on a near-black suit they read as a cool sheen instead.
    vec3 dotColor = dot(base, vec3(0.299, 0.587, 0.114)) < 0.05 ? uSheen : uInk;
    c = mix(c, dotColor, halftone(dots));
    gl_FragColor = vec4(c, 1.0);
    #include <colorspace_fragment>
  }
`;

type Options = {color: string; webLines?: boolean};

export function createToonMaterial({color, webLines = false}: Options): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: TOON_VERTEX,
    fragmentShader: TOON_FRAGMENT,
    uniforms: {
      uColor: {value: new THREE.Color(color)},
      uLineColor: {value: new THREE.Color('#E10600')},
      uInk: {value: new THREE.Color('#0B0B0B')},
      uSheen: {value: new THREE.Color('#3A3A48')},
      uLightDir: {value: new THREE.Vector3(0.45, 0.75, 0.55).normalize()},
      uWebLines: {value: webLines ? 1 : 0},
      uDotSize: {value: 6},
    },
  });
}
