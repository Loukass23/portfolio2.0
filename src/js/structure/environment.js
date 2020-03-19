import * as THREE from 'three';
import Phenomenon from './Phenomenon';
import props from './config/defaults';
import { initUOS } from './render';


function getRandomBetween(value) {
  const floor = -value;
  return floor + Math.random() * value * 2;
}

function getArrayWithNoise(array, noise) {
  return array.map(item => item + getRandomBetween(noise));
}

function hcfp(percent) {
  return `#${new THREE.Color().setHSL(percent, 0.5, 0.5).getHexString()}`;
}


function getRandomFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function createInstance({
  rainbow = false,
  geometry,
  material,
  multiplier,
  duration,
  points,
}) {

  const attributes = [{
    name: 'aPositionStart',
    data: points[0],
    size: 3,
  },
  {
    name: 'aControlPointOne',
    data: points[1],
    size: 3,
  },
  {
    name: 'aControlPointTwo',
    data: points[2],
    size: 3,
  },
  {
    name: 'aPositionEnd',
    data: points[3],
    size: 3,
  },
  {
    name: 'aOffset',
    data: i => [i * ((1 - duration) / (multiplier - 1))],
    size: 1,
  },
  ];

  if (rainbow) {
    attributes.push({
      name: 'aColor',
      data: (i, total) => {
        const color = new THREE.Color();
        color.setHSL(i / total, 0.6, 0.7);
        return [color.r, color.g, color.b];
      },
      size: 3,
    });
  }

  const uniforms = {
    time: {
      value: 0,
    },
  };
  const vertex = `
    attribute vec3 aPositionStart;
    attribute vec3 aControlPointOne;
    attribute vec3 aControlPointTwo;
    attribute vec3 aPositionEnd;
    attribute float aOffset;
    uniform float time;
    ${rainbow ? 'attribute vec3 aColor; varying vec3 vColor;' : ''}

    float easeInOutSin(float t){
      return (1.0 + sin(${Math.PI} * t - ${Math.PI} / 2.0)) / 2.0;
    }

    vec4 quatFromAxisAngle(vec3 axis, float angle) {
      float halfAngle = angle * 0.5;
      return vec4(axis.xyz * sin(halfAngle), cos(halfAngle));
    }

    vec3 rotateVector(vec4 q, vec3 v) {
      return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
    }

    vec3 bezier4(vec3 a, vec3 b, vec3 c, vec3 d, float t) {
      return mix(mix(mix(a, b, t), mix(b, c, t), t), mix(mix(b, c, t), mix(c, d, t), t), t);
    }

    void main(){
      float tProgress = easeInOutSin(min(1.0, max(0.0, (time - aOffset)) / ${duration}));
      vec4 quatX = quatFromAxisAngle(vec3(1.0, 0.0, 0.0), -5.0 * tProgress);
      vec4 quatY = quatFromAxisAngle(vec3(0.0, 1.0, 0.0), -5.0 * tProgress);
      vec3 basePosition = rotateVector(quatX, rotateVector(quatY, position));
      vec3 newPosition = bezier4(aPositionStart, aControlPointOne, aControlPointTwo, aPositionEnd, tProgress);
      float scale = tProgress * 2.0 - 1.0;
      scale = 1.0 - scale * scale;
      basePosition *= scale;
      gl_Position = basePosition + newPosition;
      ${rainbow ? 'vColor = aColor;' : ''}
    }
  `;

  const fragment = rainbow ? [
    ['#define PHONG', 'varying vec3 vColor;'],
    ['vec4( diffuse, opacity )', 'vec4( vColor, opacity )'],
    ['vec3 totalEmissiveRadiance = emissive;', 'vec3 totalEmissiveRadiance = vColor;'],
  ] : [];

  const instProps = {
    attributes,
    uniforms,
    vertex,
    geometry,
    multiplier,
    material,
    fragment,
  };

  const instance = new Phenomenon(instProps);
  props.scene.add(instance.mesh);
  return instance;
}

export default () => {
  const ambientLight = new THREE.AmbientLight('#ffffff', 0.5);
  props.scene.add(ambientLight);

  const light = new THREE.SpotLight(0xffffff, 1, 80, Math.PI * 0.25, 1, 2);
  light.position.set(0, 40, 0);

  props.scene.add(light);




  const instances = [
    createInstance({
      geometry: new THREE.BoxGeometry(2, 2, 2),
      material: new THREE.MeshStandardMaterial({
        color: '#6c07bf',
        emissive: '#212121',
        flatShading: true,
        roughness: 0.1,
        metalness: 0.7,
      }),
      multiplier: 20,
      duration: 0.8,
      points: [
        () => getArrayWithNoise([0, 0, 0], 10),
        () => getArrayWithNoise([0, 0, 0], 8),
        () => getArrayWithNoise([0, 0, 0], 2),
        () => getArrayWithNoise([0, 0, 0], 12),
      ],
    }),
    createInstance({
      geometry: new THREE.BoxGeometry(1, 1, 1),
      material: new THREE.MeshPhongMaterial({
        color: '#d6716d',
        emissive: hcfp(0.5 / 3),
        specular: '#efefef',
        shininess: 20,
        flatShading: true,
      }),
      multiplier: 20,
      duration: 0.4,
      points: [
        () => getArrayWithNoise([-10, 0, 0], 4),
        () => getArrayWithNoise([-2.5, -10, 0], 4),
        () => getArrayWithNoise([2.5, 10, 0], 4),
        () => getArrayWithNoise([10, 0, 0], 4),
      ],
    }),
    createInstance({
      geometry: new THREE.BoxGeometry(1, 1, 1),
      material: new THREE.MeshPhongMaterial({
        color: '#a0fafb',
        emissive: hcfp(1.5 / 3),
        specular: '#000000',
        shininess: 10,
        flatShading: true,
      }),
      multiplier: 40,
      duration: 0.4,
      points: [
        () => getArrayWithNoise([0, 10, 0], 10),
        () => getArrayWithNoise([0, 0, 0], 10),
        () => getArrayWithNoise([0, 0, 0], 10),
        () => getArrayWithNoise([0, 0, 0], 10),
      ],
    }),
    createInstance({
      rainbow: true,
      geometry: new THREE.BoxGeometry(1, 1, 1),
      material: new THREE.MeshPhongMaterial({
        emissive: hcfp(2 / 3),
        specular: '#efefef',
        shininess: 20,
        flatShading: true,
      }),
      multiplier: 40,
      duration: 0.4,
      points: [
        () => getArrayWithNoise([0, 0, 0], 10),
        () => getArrayWithNoise([0, 0, 0], 0),
        () => getArrayWithNoise([0, 0, 0], 0),
        () => getArrayWithNoise([0, 0, 0], 0),
      ],
    }),
  ];
  /**
   * Build the environment.
   */
  // export default () => {
  // const ambientLight = new THREE.AmbientLight('#ffffff', 0.1);
  // props.scene.add(ambientLight);

  // const light = new THREE.SpotLight(0xffffff, 1, 80, Math.PI * 0.25, 1, 2);
  // light.position.set(0, 40, 0);

  // props.scene.add(light);
  // const lights = [];
  // lights[0] = new THREE.PointLight(0xffffff, 0.2, 0);
  // lights[1] = new THREE.PointLight(0xffffff, 0.2, 0);
  // lights[2] = new THREE.PointLight(0xffffff, 0.2, 0);

  // lights[0].position.set(0, 200, 0);
  // lights[1].position.set(100, 200, 100);
  // lights[2].position.set(-100, -200, -100);

  // props.scene.add(lights[0]);
  // props.scene.add(lights[1]);
  // props.scene.add(lights[2]);

  const geometry = new THREE.BoxGeometry(1, 1, 1);

  props.structure.cube = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry),
    new THREE.LineBasicMaterial(),

  );

  // props.structure.cube = new THREE.Mesh(geometry, material);
  // props.structure.cube.rotation.y = -0.6
  props.structure.cube.position.set(15, 12.5, 0);
  props.scene.add(props.structure.cube);
  props.phenomenons = instances;
  initUOS();
};
