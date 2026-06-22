import * as THREE from 'three';

export interface LoadResult {
  loaded: number;
  missing: string[];
  loadTimeMs: number;
  count: number;
}

interface PreloadOptions {
  count: number;
  base?: string;
  concurrency?: number;
  onFirstTexture?: () => void;
  onProgress?: (loadedCount: number, totalCount: number) => void;
}

const cache: { textures: Array<THREE.Texture | undefined>; urls: string[] } = {
  textures: [],
  urls: [],
};

function getFrameUrls(count: number, base: string) {
  return Array.from(
    { length: count },
    (_, i) => `${base}ezgif-frame-${String(i + 1).padStart(3, '0')}.png`
  );
}

function prepareTexture(texture: THREE.Texture) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

function loadTexture(
  url: string,
  loader: THREE.TextureLoader
): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (texture) => resolve(prepareTexture(texture)),
      undefined,
      (err) => reject(err)
    );
  });
}

export async function preloadImageSequence({
  count,
  base = '/image_sequence/',
  concurrency = 8,
  onFirstTexture,
  onProgress,
}: PreloadOptions): Promise<LoadResult> {
  const start = performance.now();
  const expected = getFrameUrls(count, base);
  const loader = new THREE.TextureLoader();
  const missing: string[] = [];
  let loaded = 0;
  let cursor = 1;

  cache.urls = expected;
  cache.textures = new Array(count);

  const firstTexture = await loadTexture(expected[0], loader);
  cache.textures[0] = firstTexture;
  loaded += 1;
  onProgress?.(loaded, count);
  onFirstTexture?.();

  async function loadNext() {
    while (cursor < expected.length) {
      const index = cursor;
      cursor += 1;

      try {
        cache.textures[index] = await loadTexture(expected[index], loader);
        loaded += 1;
        onProgress?.(loaded, count);
      } catch {
        missing.push(expected[index]);
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, count - 1) }, () => loadNext())
  );

  return {
    loaded,
    missing,
    loadTimeMs: performance.now() - start,
    count,
  };
}

export function getLoadedTextures(): Array<THREE.Texture | undefined> {
  return cache.textures;
}

export function getTextureUrls(): string[] {
  return cache.urls;
}
