import { useRef, useEffect } from 'react';

const crtVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const crtFragmentShader = `
varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform float uTime;
uniform float uScanlineIntensity;
uniform float uCurvature;
uniform float uChromaticAberration;
uniform float uVignette;

void main() {
  vec2 uv = vUv;
  uv = uv - 0.5;
  float dist = length(uv);
  uv = uv * (1.0 + uCurvature * dist * dist);
  uv = uv + 0.5;

  float vig = 1.0 - uVignette * dist * (1.0 - 0.4 * sin(uTime * 0.5));

  float r = texture2D(tDiffuse, uv + vec2(uChromaticAberration * 0.01 * dist, 0.0)).r;
  float g = texture2D(tDiffuse, uv).g;
  float b = texture2D(tDiffuse, uv - vec2(uChromaticAberration * 0.01 * dist, 0.0)).b;
  vec3 color = vec3(r, g, b);

  float scanline = sin(uv.y * 600.0 + uTime * 10.0) * 0.5 + 0.5;
  color *= 1.0 - (scanline * uScanlineIntensity);

  float noise = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
  color += (noise - 0.5) * 0.05;

  color *= vig;

  color += vec3(0.01, 0.005, 0.0);

  gl_FragColor = vec4(color, 1.0);
}
`;

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

interface CRTOverlayProps {
  enabled: boolean;
}

export default function CRTOverlay({ enabled }: CRTOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const animFrameRef = useRef<number>(0);
  const uniformsRef = useRef<Record<string, THREE.IUniform> | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    // Wait for container to have size
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Scene and camera for offscreen render
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Render target
    const renderTarget = new THREE.WebGLRenderTarget(w, h, {
      type: THREE.HalfFloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
    });

    // CRT shader uniforms
    const crtUniforms = {
      tDiffuse: { value: renderTarget.texture },
      uTime: { value: 0 },
      uScanlineIntensity: { value: 0.15 },
      uCurvature: { value: 0.15 },
      uChromaticAberration: { value: 0.3 },
      uVignette: { value: 0.8 },
    };
    uniformsRef.current = crtUniforms;

    // Effect composer
    const composer = new EffectComposer(renderer, renderTarget);
    composer.setSize(w, h);

    // Render pass - renders empty scene to target (we composite the DOM underneath visually)
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // CRT shader pass
    const crtShader = {
      uniforms: crtUniforms,
      vertexShader: crtVertexShader,
      fragmentShader: crtFragmentShader,
    };
    const shaderPass = new ShaderPass(crtShader);
    composer.addPass(shaderPass);

    composerRef.current = composer;

    // Fullscreen quad for final display
    const displayScene = new THREE.Scene();
    const displayCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const displayMaterial = new THREE.ShaderMaterial({
      uniforms: crtUniforms,
      vertexShader: crtVertexShader,
      fragmentShader: crtFragmentShader,
    });
    const displayQuad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      displayMaterial
    );
    displayScene.add(displayQuad);

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      crtUniforms.uTime.value += 0.016;
      renderer.render(displayScene, displayCamera);
    };

    animate();

    const handleResize = () => {
      const nw = window.innerWidth;
      const nh = window.innerHeight;
      renderer.setSize(nw, nh);
      renderTarget.setSize(nw, nh);
      composer.setSize(nw, nh);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      renderTarget.dispose();
      displayMaterial.dispose();
      displayQuad.geometry.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 5,
        pointerEvents: 'none',
        mixBlendMode: 'screen',
        opacity: 0.25,
      }}
    />
  );
}
