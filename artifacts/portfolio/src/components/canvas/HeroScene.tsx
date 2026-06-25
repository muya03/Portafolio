import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function HeroScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // SCENE SETUP
    const scene = new THREE.Scene();
    
    // CAMERA
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;

    // RENDERER
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: true,
        powerPreference: "high-performance"
      });
    } catch (err) {
      // WebGL unavailable (e.g. headless/old browser): degrade gracefully.
      console.warn('WebGL no disponible, omitiendo escena 3D:', err);
      return;
    }
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // optimize
    mountRef.current.appendChild(renderer.domElement);

    // PARTICLES / GEOMETRY
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = window.innerWidth < 768 ? 1500 : 3500;
    const posArray = new Float32Array(particlesCount * 3);
    const colorsArray = new Float32Array(particlesCount * 3);

    // Electric Cyan Base: HSL(180, 100%, 50%) -> RGB(0, 240, 255)
    const color = new THREE.Color(0x00f0ff);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      // Spread particles in a wide field
      posArray[i] = (Math.random() - 0.5) * 100;     // x
      posArray[i + 1] = (Math.random() - 0.5) * 100; // y
      posArray[i + 2] = (Math.random() - 0.5) * 100; // z

      // Slight color variation
      const mixedColor = color.clone().offsetHSL(
        (Math.random() - 0.5) * 0.1, 
        0, 
        (Math.random() - 0.5) * 0.2
      );
      
      colorsArray[i] = mixedColor.r;
      colorsArray[i + 1] = mixedColor.g;
      colorsArray[i + 2] = mixedColor.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

    // MATERIAL
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    // MESH
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // MOUSE INTERACTION
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const onDocumentMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - windowHalfX) * 0.05;
      mouseY = (event.clientY - windowHalfY) * 0.05;
    };

    document.addEventListener('mousemove', onDocumentMouseMove);

    // ANIMATION LOOP
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const render = () => {
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera interpolation
      targetX = mouseX * 0.5;
      targetY = mouseY * 0.5;
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (-targetY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      // Rotate particle field slowly
      particlesMesh.rotation.y = elapsedTime * 0.05;
      particlesMesh.rotation.x = elapsedTime * 0.02;

      // Slight wave effect on particles
      const positions = particlesGeometry.attributes.position.array as Float32Array;
      for(let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        const x = positions[i3];
        const z = positions[i3 + 2];
        positions[i3 + 1] += Math.sin(elapsedTime + x) * 0.005;
      }
      particlesGeometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // RESIZE HANDLER
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // CLEANUP
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', onDocumentMouseMove);
      cancelAnimationFrame(animationFrameId);
      
      // Dispose Three.js objects
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
      
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    />
  );
}
