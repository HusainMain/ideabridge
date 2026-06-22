import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useScrollStore } from '../stores/useScrollStore';
import { getLoadedTextures } from '../utils/AssetLoader';
import { FRAME_COUNT, getTimelineFrame } from '../utils/heroTimeline';
import * as THREE from 'three';

function getNearestLoadedTexture(frameIndex: number) {
  const textures = getLoadedTextures();

  for (let offset = 0; offset < FRAME_COUNT; offset++) {
    const previous = textures[frameIndex - offset];
    if (previous) return previous;

    const next = textures[frameIndex + offset];
    if (next) return next;
  }

  return undefined;
}

export function ProjectionLayer() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const { viewport } = useThree();
  const scrollProgress = useScrollStore((state) => state.scrollProgress);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const frameIndex = getTimelineFrame(scrollProgress);
    const texture = getNearestLoadedTexture(frameIndex);
    const material = mesh.material as THREE.MeshBasicMaterial;

    if (texture && material.map !== texture) {
      material.map = texture;
      material.needsUpdate = true;
    }
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial toneMapped={false} />
    </mesh>
  );
}
