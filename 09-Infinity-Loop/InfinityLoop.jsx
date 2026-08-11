import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function InfinityLoop() {
  const meshRef = useRef();

  const curve = useMemo(() => {
    class LemniscateCurve extends THREE.Curve {
      getPoint(t, optionalTarget = new THREE.Vector3()) {
        const tRad = t * Math.PI * 2;
        const scale = 3.0; 
        const sinT = Math.sin(tRad);
        const cosT = Math.cos(tRad);
        
        const x = (scale * cosT) / (1 + sinT * sinT);
        const y = (scale * sinT * cosT) / (1 + sinT * sinT);
        const z = Math.sin(tRad * 2) * 0.2; 

        return optionalTarget.set(x, y, z);
      }
    }
    return new LemniscateCurve();
  }, []);

  const shaderMat = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying float vProgress;
        uniform float uTime;

        void main() {
          vUv = uv;
          vProgress = uv.x;
          
          vec3 transformed = position;
          float noise = sin(transformed.x * 8.0 + uTime * 15.0) * cos(transformed.y * 8.0 + uTime * 12.0);
          transformed += normal * noise * 0.03;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying float vProgress;
        uniform float uTime;

        void main() {
          vec3 blueColor = vec3(0.1, 0.4, 0.9);
          vec3 goldColor = vec3(1.0, 0.8, 0.2);
          vec3 whiteColor = vec3(1.0, 1.0, 1.0);

          vec3 color = mix(blueColor, goldColor, sin(vProgress * 6.28 + uTime) * 0.5 + 0.5);
          float spark = pow(sin(vProgress * 25.0 - uTime * 12.0), 8.0);
          color += whiteColor * spark * 1.5;

          float edgeGlow = pow(1.0 - abs(vUv.y - 0.5) * 2.0, 1.5);
          
          gl_FragColor = vec4(color * edgeGlow * 2.0, edgeGlow);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
  }, []);

  function SceneContent() {
    useFrame((state) => {
      const { clock } = state;
      if (shaderMat) {
        shaderMat.uniforms.uTime.value = clock.getElapsedTime();
      }
      if (meshRef.current) {
        meshRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.2) * 0.03;
      }
    });

    return (
      <group ref={meshRef}>
        <mesh>
          {}
          <tubeGeometry args={[curve, 400, 0.08, 12, true]} />
          <primitive object={shaderMat} attach="material" />
        </mesh>
      </group>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000000' }}>
      <Canvas camera={{ position: [0, 0, 7], fov: 60 }}>
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.5} />
        <SceneContent />
      </Canvas>
    </div>
  );
}