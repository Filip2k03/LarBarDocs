import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export const Hero3DCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // --- 1. Scene & Atmosphere ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xf7f7f5, 0.022);

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
    camera.position.set(4.6, 1.8, 5.2);
    camera.lookAt(0, 0.4, 0);

    // --- 2. Lightweight High-Performance WebGL Renderer ---
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // --- 3. Cinematic Studio Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xe2e8f0, 0.85);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    // Key Sun Light
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.4);
    sunLight.position.set(5, 10, 6);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 25;
    sunLight.shadow.camera.left = -4;
    sunLight.shadow.camera.right = 4;
    sunLight.shadow.camera.top = 4;
    sunLight.shadow.camera.bottom = -4;
    sunLight.shadow.bias = -0.0004;
    sunLight.shadow.radius = 2.0;
    scene.add(sunLight);

    // Golden Rim Backlight for luxury supercar contours
    const rimLight = new THREE.DirectionalLight(0xffd23f, 1.3);
    rimLight.position.set(-6, 4, -6);
    scene.add(rimLight);

    // Soft Blue Fill Light
    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.6);
    fillLight.position.set(-4, 3, 5);
    scene.add(fillLight);

    // --- 4. Infinite Moving Cinematic Highway & Ground Grid ---
    const groundGeo = new THREE.PlaneGeometry(36, 36);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.9,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.005;
    ground.receiveShadow = true;
    scene.add(ground);

    // Stylized Concentric Radar Rings
    for (let r = 1.6; r <= 6.8; r += 1.3) {
      const ringGeo = new THREE.RingGeometry(r, r + 0.02, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xe2e8f0,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.001;
      scene.add(ring);
    }

    // Modern Asphalt Road
    const roadGeo = new THREE.PlaneGeometry(4.0, 24, 32, 32);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.7,
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.003, 0);
    road.receiveShadow = true;
    scene.add(road);

    // Moving Highway Golden Lane Dashes
    const dashesCount = 12;
    const dashes: THREE.Mesh[] = [];
    const stripeGeo = new THREE.PlaneGeometry(0.12, 1.2);
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffd23f });

    for (let i = 0; i < dashesCount; i++) {
      const dash = new THREE.Mesh(stripeGeo, stripeMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(0, 0.008, (i - dashesCount / 2) * 2.0);
      scene.add(dash);
      dashes.push(dash);
    }

    // Outer White Road Edge Lines
    const edgeGeo = new THREE.PlaneGeometry(0.06, 24);
    const edgeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const leftEdge = new THREE.Mesh(edgeGeo, edgeMat);
    leftEdge.rotation.x = -Math.PI / 2;
    leftEdge.position.set(-1.85, 0.006, 0);
    scene.add(leftEdge);

    const rightEdge = new THREE.Mesh(edgeGeo, edgeMat);
    rightEdge.rotation.x = -Math.PI / 2;
    rightEdge.position.set(1.85, 0.006, 0);
    scene.add(rightEdge);

    // --- 5. Load Original Lamborghini 3D Model with Original Materials ---
    const carGroup = new THREE.Group();
    scene.add(carGroup);

    const loader = new GLTFLoader();
    loader.load(
      '/models/lamborghini3d.glb',
      (gltf) => {
        const model = gltf.scene;

        // Auto-center and normalize model scale
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const targetLength = 3.9;
        const scaleFactor = targetLength / Math.max(size.x, size.y, size.z);
        model.scale.setScalar(scaleFactor);

        model.position.x = -center.x * scaleFactor;
        model.position.z = -center.z * scaleFactor;
        model.position.y = -box.min.y * scaleFactor;

        // Enable realistic shadows on all original meshes without overriding materials
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        });

        // Set initial sleek dynamic driving angle
        carGroup.rotation.y = 0.48;

        carGroup.add(model);
        setIsLoaded(true);
      },
      undefined,
      (error) => {
        console.error('Error loading original Lamborghini GLB:', error);
      }
    );

    // --- 6. Smooth Cinematic 60fps Driving Animation Loop ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Move road lane dashes smoothly to simulate forward driving speed
      const drivingSpeed = 4.5;
      dashes.forEach((dash, idx) => {
        let z = dash.position.z + drivingSpeed * 0.016;
        if (z > 12) {
          z -= dashesCount * 2.0;
        }
        dash.position.z = z;
      });

      // Subtle dynamic camera drift for cinematic feeling
      camera.position.x = 4.6 + Math.sin(elapsedTime * 0.4) * 0.15;
      camera.position.y = 1.8 + Math.cos(elapsedTime * 0.5) * 0.08;
      camera.lookAt(0, 0.4, 0);

      // Realistic sports suspension engine vibration & road bumps
      if (carGroup) {
        carGroup.position.y = Math.sin(elapsedTime * 8.0) * 0.005 + Math.cos(elapsedTime * 14.0) * 0.002;
        carGroup.rotation.z = Math.sin(elapsedTime * 2.5) * 0.004; // subtle chassis roll
      }

      renderer.render(scene, camera);
    };

    animate();

    // --- 7. Window Resize Handler ---
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // --- 8. Cleanup ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[320px] sm:h-[400px] lg:h-[450px] rounded-4xl overflow-hidden pointer-events-none select-none bg-gradient-to-b from-white/40 via-transparent to-white/60">
      {/* 3D WebGL Canvas (Click-through background) */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Subtle Luxury Fleet Badge Overlay */}
      {isLoaded && (
        <div className="absolute bottom-3 left-4 flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md border border-brand-border/70 text-[10px] sm:text-[11px] font-bold text-neutral-700 shadow-soft">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>LaBar VIP Fleet • Live Dynamic 3D</span>
        </div>
      )}
    </div>
  );
};
