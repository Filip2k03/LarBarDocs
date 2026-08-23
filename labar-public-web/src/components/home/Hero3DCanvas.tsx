import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const Hero3DCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInteractive, setIsInteractive] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // --- Scene & Camera ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xf7f7f5, 0.035);

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(4.8, 3.2, 5.8);
    camera.lookAt(0, 0.6, 0);

    // --- Renderer ---
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
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xe2e8f0, 0.6);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffaf0, 1.4);
    sunLight.position.set(8, 12, 6);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 25;
    sunLight.shadow.camera.left = -6;
    sunLight.shadow.camera.right = 6;
    sunLight.shadow.camera.top = 6;
    sunLight.shadow.camera.bottom = -6;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xffd23f, 0.4);
    fillLight.position.set(-8, 6, -6);
    scene.add(fillLight);

    // --- Ground Grid & Road Plane ---
    const groundGeo = new THREE.PlaneGeometry(30, 30);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    scene.add(ground);

    // Stylized Road Grid Lines
    const gridHelper = new THREE.GridHelper(20, 20, 0xe2e8f0, 0xf1f5f9);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Stylized Asphalt Road Segment
    const roadGeo = new THREE.PlaneGeometry(3.6, 20);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.8,
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.005, 0);
    road.receiveShadow = true;
    scene.add(road);

    // Center Dashed Yellow Line
    for (let i = -8; i <= 8; i += 2) {
      const stripeGeo = new THREE.PlaneGeometry(0.12, 1.0);
      const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffd23f });
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(0, 0.01, i);
      scene.add(stripe);
    }

    // --- Construct High-Precision 3D LaBar Taxi Model ---
    const carGroup = new THREE.Group();

    // Materials
    const bodyPaintMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.1,
    });

    const redAccentMat = new THREE.MeshStandardMaterial({
      color: 0xe53935,
      roughness: 0.3,
      metalness: 0.2,
    });

    const goldAccentMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.2,
      metalness: 0.6,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      roughness: 0.1,
      transmission: 0.6,
      thickness: 0.5,
      transparent: true,
      opacity: 0.85,
    });

    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x171717,
      roughness: 0.8,
      metalness: 0.1,
    });

    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.2,
      metalness: 0.85,
    });

    const lightGlowMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const tailLightMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
    const taxiSignMat = new THREE.MeshStandardMaterial({
      color: 0xffd23f,
      emissive: 0xffd23f,
      emissiveIntensity: 0.35,
      roughness: 0.2,
    });

    // 1. Lower Chassis & Body Base
    const lowerBodyGeo = new THREE.BoxGeometry(1.6, 0.45, 3.4);
    const lowerBody = new THREE.Mesh(lowerBodyGeo, bodyPaintMat);
    lowerBody.position.y = 0.42;
    lowerBody.castShadow = true;
    lowerBody.receiveShadow = true;
    carGroup.add(lowerBody);

    // 2. Red LaBar Racing / Fleet Accent Strip along the sides
    const stripGeo = new THREE.BoxGeometry(1.62, 0.08, 3.42);
    const strip = new THREE.Mesh(stripGeo, redAccentMat);
    strip.position.y = 0.35;
    carGroup.add(strip);

    // 3. Cabin / Greenhouse Roof (Passenger Compartment)
    const cabinGeo = new THREE.BoxGeometry(1.35, 0.5, 1.8);
    const cabin = new THREE.Mesh(cabinGeo, bodyPaintMat);
    cabin.position.set(0, 0.85, -0.15);
    cabin.castShadow = true;
    carGroup.add(cabin);

    // 4. Windshield & Windows
    const frontWindshieldGeo = new THREE.BoxGeometry(1.3, 0.45, 0.1);
    const frontWindshield = new THREE.Mesh(frontWindshieldGeo, glassMat);
    frontWindshield.position.set(0, 0.82, 0.76);
    frontWindshield.rotation.x = 0.38;
    carGroup.add(frontWindshield);

    const rearWindshieldGeo = new THREE.BoxGeometry(1.3, 0.45, 0.1);
    const rearWindshield = new THREE.Mesh(rearWindshieldGeo, glassMat);
    rearWindshield.position.set(0, 0.82, -1.06);
    rearWindshield.rotation.x = -0.38;
    carGroup.add(rearWindshield);

    const sideWindowsGeo = new THREE.BoxGeometry(1.38, 0.35, 1.6);
    const sideWindows = new THREE.Mesh(sideWindowsGeo, glassMat);
    sideWindows.position.set(0, 0.84, -0.15);
    carGroup.add(sideWindows);

    // 5. Roof Illuminated Taxi Light Sign (LaBar Yellow Sign)
    const taxiSignGeo = new THREE.BoxGeometry(0.55, 0.14, 0.28);
    const taxiSign = new THREE.Mesh(taxiSignGeo, taxiSignMat);
    taxiSign.position.set(0, 1.16, -0.15);
    taxiSign.castShadow = true;
    carGroup.add(taxiSign);

    const taxiSignStandGeo = new THREE.BoxGeometry(0.3, 0.05, 0.15);
    const taxiSignStand = new THREE.Mesh(taxiSignStandGeo, redAccentMat);
    taxiSignStand.position.set(0, 1.11, -0.15);
    carGroup.add(taxiSignStand);

    // 6. Front Headlights & Rear Taillights
    const headlightGeo = new THREE.BoxGeometry(0.25, 0.12, 0.05);
    const leftLight = new THREE.Mesh(headlightGeo, lightGlowMat);
    leftLight.position.set(-0.55, 0.48, 1.71);
    carGroup.add(leftLight);

    const rightLight = new THREE.Mesh(headlightGeo, lightGlowMat);
    rightLight.position.set(0.55, 0.48, 1.71);
    carGroup.add(rightLight);

    const taillightGeo = new THREE.BoxGeometry(0.25, 0.1, 0.05);
    const leftTail = new THREE.Mesh(taillightGeo, tailLightMat);
    leftTail.position.set(-0.55, 0.48, -1.71);
    carGroup.add(leftTail);

    const rightTail = new THREE.Mesh(taillightGeo, tailLightMat);
    rightTail.position.set(0.55, 0.48, -1.71);
    carGroup.add(rightTail);

    // 7. Wheels & Rims
    const wheelRadius = 0.28;
    const wheelWidth = 0.18;
    const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 24);
    wheelGeo.rotateZ(Math.PI / 2);

    const rimGeo = new THREE.CylinderGeometry(wheelRadius * 0.65, wheelRadius * 0.65, wheelWidth + 0.01, 16);
    rimGeo.rotateZ(Math.PI / 2);

    const wheelPositions = [
      [-0.8, wheelRadius, 1.0], // Front Left
      [0.8, wheelRadius, 1.0],  // Front Right
      [-0.8, wheelRadius, -1.0], // Rear Left
      [0.8, wheelRadius, -1.0],  // Rear Right
    ];

    const wheels: THREE.Mesh[] = [];

    wheelPositions.forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(wheelGeo, tireMat);
      wheel.position.set(x, y, z);
      wheel.castShadow = true;

      const rim = new THREE.Mesh(rimGeo, rimMat);
      wheel.add(rim);

      carGroup.add(wheel);
      wheels.push(wheel);
    });

    scene.add(carGroup);

    // --- Interactive Mouse & Touch Drag Controls ---
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let targetRotationY = 0.65;
    let targetRotationX = 0.08;
    let rotationVelocityY = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      setIsInteractive(true);
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

      targetRotationY += deltaX * 0.008;
      targetRotationX = Math.max(-0.2, Math.min(0.35, targetRotationX + deltaY * 0.004));
      rotationVelocityY = deltaX * 0.004;

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

    // --- 60fps Animation Loop ---
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle auto-rotation when idle
      if (!isDragging) {
        targetRotationY += 0.004;
      }

      // Smooth damping
      carGroup.rotation.y += (targetRotationY - carGroup.rotation.y) * 0.08;
      carGroup.rotation.x += (targetRotationX - carGroup.rotation.x) * 0.08;

      // Suspension & floating oscillation
      carGroup.position.y = Math.sin(elapsedTime * 2.5) * 0.035;

      // Wheel idle spin
      wheels.forEach((w) => {
        w.rotation.x = elapsedTime * 3.0;
      });

      renderer.render(scene, camera);
    };

    animate();

    // --- Resize Handling ---
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // --- Cleanup on Unmount ---
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

  return (
    <div className="relative w-full h-[360px] sm:h-[420px] lg:h-[480px] rounded-4xl overflow-hidden cursor-grab active:cursor-grabbing select-none">
      <div ref={containerRef} className="w-full h-full" />

      {/* 3D Scene Controls Badge Overlay */}
      <div className="absolute bottom-4 left-4 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-brand-border/80 shadow-soft text-[11px] font-bold text-neutral-700">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Interactive 3D Taxi • Drag to Rotate (60fps)</span>
      </div>
    </div>
  );
};
