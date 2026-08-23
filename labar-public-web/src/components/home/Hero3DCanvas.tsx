import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export const Hero3DCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [activeColor, setActiveColor] = useState<'red' | 'white' | 'gold'>('red');
  const carMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // --- 1. Scene & Environment ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xf7f7f5, 0.025);

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 480;

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(4.8, 2.3, 5.6);
    camera.lookAt(0, 0.45, 0);

    // --- 2. High-Performance WebGL Renderer ---
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
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // --- 3. Studio Automotive Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xe2e8f0, 0.8);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    // Main Sun Key Light
    const mainSun = new THREE.DirectionalLight(0xffffff, 2.2);
    mainSun.position.set(6, 12, 7);
    mainSun.castShadow = true;
    mainSun.shadow.mapSize.width = 2048;
    mainSun.shadow.mapSize.height = 2048;
    mainSun.shadow.camera.near = 0.5;
    mainSun.shadow.camera.far = 25;
    mainSun.shadow.camera.left = -5;
    mainSun.shadow.camera.right = 5;
    mainSun.shadow.camera.top = 5;
    mainSun.shadow.camera.bottom = -5;
    mainSun.shadow.bias = -0.0003;
    mainSun.shadow.radius = 2.0;
    scene.add(mainSun);

    // Golden Rim Backlight for Supercar Edges
    const rimLight = new THREE.DirectionalLight(0xffd23f, 1.2);
    rimLight.position.set(-7, 5, -7);
    scene.add(rimLight);

    // Cool Sky Accent Fill Light
    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.7);
    fillLight.position.set(-6, 3, 6);
    scene.add(fillLight);

    // --- 4. Sleek Road & Map Ground Plane ---
    const groundGeo = new THREE.PlaneGeometry(40, 40);
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

    // Stylized Concentric Radar Waypoints
    for (let r = 1.4; r <= 7.0; r += 1.4) {
      const ringGeo = new THREE.RingGeometry(r, r + 0.025, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xe2e8f0,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.001;
      scene.add(ring);
    }

    // Modern Curved Road Surface
    const roadGeo = new THREE.PlaneGeometry(4.2, 18, 32, 32);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.7,
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.003, 0);
    road.receiveShadow = true;
    scene.add(road);

    // Center Gold Lane Markings
    for (let i = -8; i <= 8; i += 2.2) {
      const stripeGeo = new THREE.PlaneGeometry(0.12, 1.2);
      const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffd23f });
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(0, 0.008, i);
      scene.add(stripe);
    }

    // Outer White Border Lines
    const leftLineGeo = new THREE.PlaneGeometry(0.06, 18);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const leftLine = new THREE.Mesh(leftLineGeo, lineMat);
    leftLine.rotation.x = -Math.PI / 2;
    leftLine.position.set(-1.9, 0.006, 0);
    scene.add(leftLine);

    const rightLine = new THREE.Mesh(leftLineGeo, lineMat);
    rightLine.rotation.x = -Math.PI / 2;
    rightLine.position.set(1.9, 0.006, 0);
    scene.add(rightLine);

    // --- 5. Load & Configure Lamborghini 3D GLB Model ---
    const carGroup = new THREE.Group();
    scene.add(carGroup);

    // LaBar Custom Crimson Red Automotive Paint
    const crimsonRedPaint = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xe53935),
      roughness: 0.15,
      metalness: 0.25,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      reflectivity: 0.95,
    });

    const pearlWhitePaint = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xffffff),
      roughness: 0.12,
      metalness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 0.95,
    });

    const royalGoldPaint = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xffd23f),
      roughness: 0.2,
      metalness: 0.85,
      clearcoat: 0.9,
      clearcoatRoughness: 0.08,
      reflectivity: 0.95,
    });

    const loader = new GLTFLoader();
    loader.load(
      '/models/lamborghini3d.glb',
      (gltf) => {
        const model = gltf.scene;

        // Auto-center and normalize model scale
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Target length ~ 4.2 units
        const scaleFactor = 4.2 / Math.max(size.x, size.y, size.z);
        model.scale.setScalar(scaleFactor);

        // Center on X and Z, set bottom on ground Y = 0
        model.position.x = -center.x * scaleFactor;
        model.position.z = -center.z * scaleFactor;
        model.position.y = -box.min.y * scaleFactor;

        carMaterialsRef.current = [];

        // Traverse and customize materials
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            if (mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              const matName = (mat.name || mesh.name || '').toLowerCase();

              // Identify body paint elements
              if (
                matName.includes('body') ||
                matName.includes('paint') ||
                matName.includes('car') ||
                matName.includes('primary') ||
                matName.includes('exterior') ||
                matName.includes('hood') ||
                matName.includes('door') ||
                matName.includes('chassis') ||
                (!matName.includes('glass') &&
                  !matName.includes('wheel') &&
                  !matName.includes('tire') &&
                  !matName.includes('interior') &&
                  !matName.includes('window') &&
                  !matName.includes('light') &&
                  !matName.includes('chrome') &&
                  !matName.includes('carbon'))
              ) {
                // Apply LaBar Crimson Red clearcoat paint
                mesh.material = crimsonRedPaint.clone();
                carMaterialsRef.current.push(mesh.material as THREE.MeshStandardMaterial);
              } else if (matName.includes('glass') || matName.includes('window')) {
                mesh.material = new THREE.MeshPhysicalMaterial({
                  color: 0x0f172a,
                  roughness: 0.05,
                  transmission: 0.85,
                  thickness: 0.5,
                  transparent: true,
                  opacity: 0.9,
                });
              }
            }
          }
        });

        // Add Streamlined LaBar Gold VIP Taxi Roof Beacon
        const taxiPod = new THREE.Group();
        const podBodyGeo = new THREE.CylinderGeometry(0.12, 0.16, 0.55, 24);
        podBodyGeo.rotateZ(Math.PI / 2);
        podBodyGeo.scale(1.0, 0.35, 0.55);
        const podMat = new THREE.MeshStandardMaterial({
          color: 0xffd23f,
          emissive: 0xffb703,
          emissiveIntensity: 0.65,
          roughness: 0.15,
        });
        const podMesh = new THREE.Mesh(podBodyGeo, podMat);
        podMesh.castShadow = true;
        taxiPod.add(podMesh);

        // Mount base in carbon fiber / dark red
        const podBaseGeo = new THREE.BoxGeometry(0.28, 0.025, 0.14);
        const podBaseMat = new THREE.MeshStandardMaterial({ color: 0x171717, roughness: 0.3 });
        const podBase = new THREE.Mesh(podBaseGeo, podBaseMat);
        podBase.position.y = -0.05;
        taxiPod.add(podBase);

        // Position on top of roof
        taxiPod.position.set(0, 1.14, -0.15);
        model.add(taxiPod);

        carGroup.add(model);
        setIsLoaded(true);
      },
      (xhr) => {
        if (xhr.total > 0) {
          setLoadProgress(Math.round((xhr.loaded / xhr.total) * 100));
        }
      },
      (error) => {
        console.error('Error loading Lamborghini GLB:', error);
      }
    );

    // --- 6. Smooth Mouse & Touch Orbit Controls ---
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let targetRotationY = 0.65;
    let targetRotationX = 0.05;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      previousMousePosition = { x: clientX, y: clientY };
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - previousMousePosition.x;
      const deltaY = clientY - previousMousePosition.y;

      targetRotationY += deltaX * 0.007;
      targetRotationX = Math.max(-0.15, Math.min(0.28, targetRotationX + deltaY * 0.003));

      previousMousePosition = { x: clientX, y: clientY };
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    container.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // --- 7. 60fps Smooth Animation Loop ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle auto-rotation when idle
      if (!isDragging) {
        targetRotationY += 0.003;
      }

      // Smooth damping
      carGroup.rotation.y += (targetRotationY - carGroup.rotation.y) * 0.075;
      carGroup.rotation.x += (targetRotationX - carGroup.rotation.x) * 0.075;

      // Realistic suspension breathing
      carGroup.position.y = Math.sin(elapsedTime * 2.0) * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    // --- 8. Window Resize Handler ---
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // --- 9. Cleanup ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      container.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Handle color change dynamically
  const handleChangeColor = (color: 'red' | 'white' | 'gold') => {
    setActiveColor(color);
    const hex = color === 'red' ? 0xe53935 : color === 'white' ? 0xffffff : 0xffd23f;
    const roughness = color === 'gold' ? 0.2 : 0.15;
    const metalness = color === 'gold' ? 0.85 : 0.25;

    carMaterialsRef.current.forEach((mat) => {
      mat.color.setHex(hex);
      mat.roughness = roughness;
      mat.metalness = metalness;
      mat.needsUpdate = true;
    });
  };

  return (
    <div className="relative w-full h-[360px] sm:h-[440px] lg:h-[500px] rounded-4xl overflow-hidden cursor-grab active:cursor-grabbing select-none bg-gradient-to-b from-white/50 via-transparent to-white/70 border border-brand-border/60 shadow-soft">
      {/* 3D WebGL Canvas Viewport */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Loading Screen Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center gap-3 z-30 transition-opacity">
          <div className="w-10 h-10 border-3 border-brand-red border-t-transparent rounded-full animate-spin" />
          <div className="text-xs font-bold text-neutral-800">
            Loading Lamborghini 3D Model... {loadProgress > 0 && `${loadProgress}%`}
          </div>
          <div className="w-44 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-red transition-all duration-200"
              style={{ width: `${Math.max(10, loadProgress)}%` }}
            />
          </div>
        </div>
      )}

      {/* Color Customizer Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 p-1.5 rounded-full bg-white/90 backdrop-blur-md border border-brand-border shadow-soft z-20">
        <button
          type="button"
          title="LaBar Crimson Red"
          onClick={() => handleChangeColor('red')}
          className={`w-6 h-6 rounded-full bg-[#E53935] transition-transform ${
            activeColor === 'red' ? 'scale-110 ring-2 ring-neutral-900 shadow-sm' : 'opacity-80 hover:opacity-100'
          }`}
        />
        <button
          type="button"
          title="Porcelain White"
          onClick={() => handleChangeColor('white')}
          className={`w-6 h-6 rounded-full bg-white border border-neutral-300 transition-transform ${
            activeColor === 'white' ? 'scale-110 ring-2 ring-neutral-900 shadow-sm' : 'opacity-80 hover:opacity-100'
          }`}
        />
        <button
          type="button"
          title="Royal Gold"
          onClick={() => handleChangeColor('gold')}
          className={`w-6 h-6 rounded-full bg-[#FFD23F] transition-transform ${
            activeColor === 'gold' ? 'scale-110 ring-2 ring-neutral-900 shadow-sm' : 'opacity-80 hover:opacity-100'
          }`}
        />
      </div>

      {/* 3D Scene Controls Badge Overlay */}
      <div className="absolute bottom-4 left-4 pointer-events-none flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-brand-border/80 shadow-soft text-[11px] font-bold text-neutral-800 z-20">
        <span className="w-2 h-2 rounded-full bg-brand-red animate-ping" />
        <span className="w-2 h-2 rounded-full bg-brand-red -ml-4" />
        <span>Lamborghini Supercar LaBar Taxi • Interactive 3D (60fps)</span>
      </div>
    </div>
  );
};
