import { useRef, useEffect, useCallback, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform vec3 uGoldColor;
uniform vec3 uSilverColor;
uniform vec3 uBgColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = rot * p * 2.1;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = (vUv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  vec2 mouse = (uMouse - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  float mouseDist = length(uv - mouse);
  float swirl = exp(-mouseDist * mouseDist * 3.0) * 0.3;
  vec2 p = uv + vec2(sin(uTime * 0.15), cos(uTime * 0.12)) * 0.08 + swirl * vec2(-(uv.y - mouse.y), uv.x - mouse.x);
  float f1 = fbm(p * 2.5 + uTime * 0.08);
  float f2 = fbm(p * 3.8 - uTime * 0.06 + vec2(f1 * 0.5, 0.0));
  float goldMask = smoothstep(0.3, 0.7, f1) * smoothstep(0.2, 0.6, f2);
  float silverMask = smoothstep(0.4, 0.8, f2) * (1.0 - goldMask * 0.5);
  vec3 color = uBgColor;
  color += uGoldColor * goldMask * 0.25;
  color += uSilverColor * silverMask * 0.15;
  color += uGoldColor * exp(-mouseDist * mouseDist * 4.0) * 0.08;
  color += (hash(vUv * uTime * 0.1) - 0.5) * 0.015;
  color *= 1.0 - length(uv) * length(uv) * 0.3;
  gl_FragColor = vec4(color, 1.0);
}
`;

interface GateScreenProps {
  onUnlock: () => void;
}

export default function GateScreen({ onUnlock }: GateScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const [activeDigit, setActiveDigit] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const animFrameRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  const CORRECT_PIN = '7124';

  // Three.js shader setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uGoldColor: { value: new THREE.Color(0.788, 0.663, 0.431) },
      uSilverColor: { value: new THREE.Color(0.545, 0.616, 0.686) },
      uBgColor: { value: new THREE.Color(0.02, 0.02, 0.02) },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth;
      mouseRef.current.y = 1 - e.clientY / window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      uniforms.uTime.value += 0.016;
      uniforms.uMouse.value.lerp(
        new THREE.Vector2(mouseRef.current.x, mouseRef.current.y),
        0.05
      );
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  // Particle trail effect
  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animId: number;

    const fade = () => {
      ctx.fillStyle = 'rgba(5, 5, 5, 0.03)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      animId = requestAnimationFrame(fade);
    };

    fade();

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 100);
      gradient.addColorStop(0, 'rgba(139, 157, 175, 0.05)');
      gradient.addColorStop(0.5, 'rgba(201, 169, 110, 0.03)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 100, 0, Math.PI * 2);
      ctx.fill();
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Auto-focus first input on mount
  useEffect(() => {
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 500);
  }, []);

  const validatePin = useCallback((digits: string[]) => {
    const entered = digits.join('');
    if (entered === CORRECT_PIN) {
      setError(false);
      // Success animation
      inputRefs.current.forEach((input) => {
        if (input) input.style.borderColor = '#4ADE80';
      });
      setTimeout(() => {
        if (formRef.current) {
          gsap.to(formRef.current, {
            opacity: 0,
            y: -20,
            duration: 0.4,
            ease: 'power2.inOut',
          });
        }
        gsap.to([canvasRef.current, particleCanvasRef.current], {
          opacity: 0,
          duration: 0.8,
          ease: 'power2.inOut',
          onComplete: onUnlock,
        });
      }, 400);
    } else if (digits.every((d) => d !== '')) {
      // All filled but incorrect
      setError(true);
      if (formRef.current) {
        gsap.to(formRef.current, {
          x: -8,
          duration: 0.05,
          yoyo: true,
          repeat: 5,
          ease: 'power2.out',
        });
      }
      inputRefs.current.forEach((input) => {
        if (input) input.style.borderColor = '#EF4444';
      });
      setTimeout(() => {
        setPin(['', '', '', '']);
        setActiveDigit(0);
        inputRefs.current.forEach((input) => {
          if (input) input.style.borderColor = 'rgba(201, 169, 110, 0.2)';
        });
        inputRefs.current[0]?.focus();
      }, 800);
    }
  }, [onUnlock]);

  const handleDigitChange = (index: number, value: string) => {
    // Only allow single digit
    const digit = value.replace(/\D/g, '').slice(-1);
    const newPin = [...pin];
    newPin[index] = digit;
    setPin(newPin);
    setError(false);

    // Reset border color
    if (inputRefs.current[index]) {
      inputRefs.current[index]!.style.borderColor = 'rgba(201, 169, 110, 0.2)';
    }

    if (digit) {
      // Move to next input
      if (index < 3) {
        setActiveDigit(index + 1);
        setTimeout(() => {
          inputRefs.current[index + 1]?.focus();
        }, 10);
      }
      // Check if complete
      setTimeout(() => {
        validatePin(newPin);
      }, 50);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (pin[index] === '' && index > 0) {
        // Move to previous input
        const newPin = [...pin];
        newPin[index - 1] = '';
        setPin(newPin);
        setActiveDigit(index - 1);
        setTimeout(() => {
          inputRefs.current[index - 1]?.focus();
        }, 10);
      } else {
        const newPin = [...pin];
        newPin[index] = '';
        setPin(newPin);
      }
      setError(false);
    } else if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      handleDigitChange(index, e.key);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pasted.length === 4) {
      const newPin = pasted.split('');
      setPin(newPin);
      setError(false);
      setTimeout(() => {
        validatePin(newPin);
      }, 50);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        cursor: 'crosshair',
      }}
    >
      {/* Shader background */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
        }}
      />
      {/* Particle trail overlay */}
      <canvas
        ref={particleCanvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
      {/* Gate form */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          ref={formRef}
          className="glass-panel"
          style={{
            padding: '56px 64px',
            maxWidth: '440px',
            width: '90%',
            pointerEvents: 'auto',
          }}
        >
          {/* Wordmark */}
          <div
            className="font-mono-label"
            style={{
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: '#6B6560',
              marginBottom: '32px',
              textAlign: 'center',
            }}
          >
            INKWELL LABS
          </div>

          {/* Headline */}
          <h1
            className="font-display"
            style={{
              fontSize: '48px',
              color: '#E8E4DC',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              marginBottom: '12px',
              textAlign: 'center',
            }}
          >
            Project Archive
          </h1>

          {/* Subhead */}
          <p
            className="font-body"
            style={{
              fontSize: '14px',
              color: '#8B9DAF',
              marginBottom: '36px',
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            Enter your 4-digit PIN to access the showcase.
          </p>

          {/* PIN Inputs */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '16px',
            }}
            onPaste={handlePaste}
          >
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onFocus={() => setActiveDigit(index)}
                className="font-mono-label"
                style={{
                  width: '56px',
                  height: '64px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${
                    activeDigit === index
                      ? 'rgba(201, 169, 110, 0.5)'
                      : 'rgba(201, 169, 110, 0.2)'
                  }`,
                  borderRadius: '8px',
                  color: '#E8E4DC',
                  fontSize: '28px',
                  textAlign: 'center',
                  letterSpacing: '0.1em',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  caretColor: '#C9A96E',
                }}
                aria-label={`PIN digit ${index + 1}`}
                aria-describedby={error ? 'pin-error' : undefined}
                autoComplete="off"
              />
            ))}
          </div>

          {/* Error message */}
          <div
            ref={errorRef}
            id="pin-error"
            role="alert"
            aria-live="polite"
            className="font-mono-label"
            style={{
              fontSize: '11px',
              color: '#EF4444',
              marginBottom: '16px',
              minHeight: '16px',
              opacity: error ? 1 : 0,
              transition: 'opacity 0.2s ease',
              textAlign: 'center',
            }}
          >
            Incorrect PIN
          </div>

          {/* Submit button */}
          <button
            onClick={() => validatePin(pin)}
            className="btn-gold"
            style={{
              width: '100%',
            }}
          >
            Enter
          </button>
        </div>
      </div>
    </div>
  );
}
