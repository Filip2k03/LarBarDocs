import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const Hero3DCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInteractive, setIsInteractive] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // --- 1. Scene & Environment ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xf7f7f5, 0.03);

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(5.2, 2.6, 6.2);
    camera.lookAt(0, 0.5, 0);

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
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // --- 3. Studio Automotive Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xdbeafe, 0.7);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    // Main Sun Key Light
    const mainSun = new THREE.DirectionalLight(0xfffdfa, 1.8);
    mainSun.position.set(6, 10, 7);
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
    mainSun.shadow.radius = 2.5;
    scene.add(mainSun);

    // Rim / Backlight for sleek EV silhouette highlights
    const rimLight = new THREE.DirectionalLight(0xffd23f, 0.8);
    rimLight.position.set(-8, 6, -8);
    scene.add(rimLight);

    // Soft Blue Fill Light
    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.5);
    fillLight.position.set(-6, 4, 6);
    scene.add(fillLight);

    // --- 4. Ground Map & Radial Road Plane ---
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

    // Radial Stylized Concentric Waypoints & Grid
    for (let r = 1.5; r <= 6.5; r += 1.2) {
      const ringGeo = new THREE.RingGeometry(r, r + 0.03, 64);
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

    // Modern Asphalt Segment
    const roadGeo = new THREE.PlaneGeometry(3.8, 16, 32, 32);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.7,
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.003, 0);
    road.receiveShadow = true;
    scene.add(road);

    // Central Glowing Gold Highway Stripes
    for (let i = -7; i <= 7; i += 2.2) {
      const stripeGeo = new THREE.PlaneGeometry(0.12, 1.2);
      const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffd23f });
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(0, 0.008, i);
      scene.add(stripe);
    }

    // --- 5. High-Precision Tesla Model S Style EV Taxi ---
    const car = new THREE.Group();

    // Material Library
    const carPaintMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.12,
      metalness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      reflectivity: 0.9,
    });

    const crimsonRedAeroMat = new THREE.MeshPhysicalMaterial({
      color: 0xe53935,
      roughness: 0.2,
      metalness: 0.4,
      clearcoat: 0.8,
    });

    const labarGoldMat = new THREE.MeshStandardMaterial({
      color: 0xffd23f,
      roughness: 0.25,
      metalness: 0.85,
    });

    const tintedGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      roughness: 0.05,
      transmission: 0.82,
      thickness: 0.6,
      transparent: true,
      opacity: 0.92,
      reflectivity: 0.95,
    });

    const tireRubberMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.85,
      metalness: 0.1,
    });

    const alloyRimMat = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8,
      roughness: 0.2,
      metalness: 0.9,
    });

    const brakeRotorMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.35,
      metalness: 0.9,
    });

    const ledHeadlightMat = new THREE.MeshBasicMaterial({
      color: 0xf8fafc,
    });

    const ledTaillightMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
    });

    const taxiSignEmissiveMat = new THREE.MeshStandardMaterial({
      color: 0xffd23f,
      emissive: 0xffb703,
      emissiveIntensity: 0.6,
      roughness: 0.15,
    });

    // 5.1 Lower Aerodynamic Underbody & Diffuser
    const underbodyGeo = new THREE.CylinderGeometry(0.88, 0.88, 3.8, 32);
    underbodyGeo.rotateX(Math.PI / 2);
    underbodyGeo.scale(1.0, 0.28, 1.0);
    const underbody = new THREE.Mesh(underbodyGeo, carPaintMaterial);
    underbody.position.set(0, 0.38, 0);
    underbody.castShadow = true;
    underbody.receiveShadow = true;
    car.add(underbody);

    // 5.2 Sculpted Tesla Model S Fastback Body (Main Cabin & Hood Shape)
    const hoodShape = new THREE.Shape();
    hoodShape.moveTo(-0.84, -1.9);
    hoodShape.lineTo(0.84, -1.9);
    hoodShape.quadraticCurveTo(0.88, -1.2, 0.88, 0);
    hoodShape.quadraticCurveTo(0.86, 1.3, 0.78, 1.95);
    hoodShape.quadraticCurveTo(0.0, 2.05, -0.78, 1.95);
    hoodShape.quadraticCurveTo(-0.86, 1.3, -0.88, 0);
    hoodShape.quadraticCurveTo(-0.88, -1.2, -0.84, -1.9);

    const extrudeSettings = {
      depth: 0.38,
      bevelEnabled: true,
      bevelSegments: 8,
      steps: 4,
      bevelSize: 0.08,
      bevelThickness: 0.08,
    };

    const mainBodyGeo = new THREE.ExtrudeGeometry(hoodShape, extrudeSettings);
    mainBodyGeo.rotateX(-Math.PI / 2);
    const mainBody = new THREE.Mesh(mainBodyGeo, carPaintMaterial);
    mainBody.position.set(0, 0.28, 0);
    mainBody.castShadow = true;
    mainBody.receiveShadow = true;
    car.add(mainBody);

    // 5.3 Aerodynamic Crimson Red Side Skirts & Front Splitter
    const skirtGeo = new THREE.BoxGeometry(1.82, 0.06, 3.82);
    const skirt = new THREE.Mesh(skirtGeo, crimsonRedAeroMat);
    skirt.position.set(0, 0.25, 0);
    skirt.castShadow = true;
    car.add(skirt);

    // Front Aero Lip Splitter
    const frontSplitterGeo = new THREE.CylinderGeometry(0.89, 0.89, 0.05, 32, 1, false, 0, Math.PI);
    frontSplitterGeo.scale(1.02, 1.0, 0.45);
    const frontSplitter = new THREE.Mesh(frontSplitterGeo, crimsonRedAeroMat);
    frontSplitter.position.set(0, 0.23, 1.85);
    car.add(frontSplitter);

    // 5.4 Sleek Tesla Fastback Glass Canopy & Greenhouse
    const canopyShape = new THREE.Shape();
    canopyShape.moveTo(-0.68, -1.2);
    canopyShape.lineTo(0.68, -1.2);
    canopyShape.quadraticCurveTo(0.72, -0.2, 0.7, 0.5);
    canopyShape.quadraticCurveTo(0.64, 1.0, 0.58, 1.15);
    canopyShape.lineTo(-0.58, 1.15);
    canopyShape.quadraticCurveTo(-0.64, 1.0, -0.7, 0.5);
    canopyShape.quadraticCurveTo(-0.72, -0.2, -0.68, -1.2);

    const canopyExtrudeSettings = {
      depth: 0.38,
      bevelEnabled: true,
      bevelSegments: 10,
      steps: 4,
      bevelSize: 0.06,
      bevelThickness: 0.06,
    };

    const canopyGeo = new THREE.ExtrudeGeometry(canopyShape, canopyExtrudeSettings);
    canopyGeo.rotateX(-Math.PI / 2);
    const canopy = new THREE.Mesh(canopyGeo, tintedGlassMat);
    canopy.position.set(0, 0.68, -0.15);
    canopy.castShadow = true;
    car.add(canopy);

    // Panoramic All-Glass Roof Top Panel
    const roofPanelGeo = new THREE.BoxGeometry(1.22, 0.03, 1.85);
    const roofPanel = new THREE.Mesh(roofPanelGeo, tintedGlassMat);
    roofPanel.position.set(0, 1.1, -0.15);
    car.add(roofPanel);

    // 5.5 Streamlined Aerodynamic LaBar Taxi Roof Light Beacon
    const taxiPodGroup = new THREE.Group();
    const taxiPodGeo = new THREE.CylinderGeometry(0.18, 0.24, 0.68, 24);
    taxiPodGeo.rotateZ(Math.PI / 2);
    taxiPodGeo.scale(1.0, 0.35, 0.55);
    const taxiPod = new THREE.Mesh(taxiPodGeo, taxiSignEmissiveMat);
    taxiPod.castShadow = true;
    taxiPodGroup.add(taxiPod);

    // Base Mount in Crimson Red
    const mountGeo = new THREE.BoxGeometry(0.35, 0.03, 0.16);
    const mount = new THREE.Mesh(mountGeo, crimsonRedAeroMat);
    mount.position.y = -0.07;
    taxiPodGroup.add(mount);

    // LaBar Gold Emblem on Taxi Sign
    const emblemGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.02, 16);
    emblemGeo.rotateX(Math.PI / 2);
    const emblem = new THREE.Mesh(emblemGeo, labarGoldMat);
    emblem.position.set(0, 0, 0.14);
    taxiPodGroup.add(emblem);

    taxiPodGroup.position.set(0, 1.16, -0.15);
    car.add(taxiPodGroup);

    // 5.6 Signature Tesla Matrix LED Headlight Eyebrows & Projectors
    const headlightGeo = new THREE.BoxGeometry(0.32, 0.06, 0.12);
    
    // Left Headlight
    const leftHeadlight = new THREE.Mesh(headlightGeo, ledHeadlightMat);
    leftHeadlight.position.set(-0.58, 0.52, 1.86);
    leftHeadlight.rotation.y = 0.32;
    leftHeadlight.rotation.z = -0.08;
    car.add(leftHeadlight);

    // Right Headlight
    const rightHeadlight = new THREE.Mesh(headlightGeo, ledHeadlightMat);
    rightHeadlight.position.set(0.58, 0.52, 1.86);
    rightHeadlight.rotation.y = -0.32;
    rightHeadlight.rotation.z = 0.08;
    car.add(rightHeadlight);

    // Soft Headlight Beam Cones (Night/Day Visuals)
    const beamGeo = new THREE.ConeGeometry(0.8, 3.5, 24, 1, true);
    beamGeo.rotateX(-Math.PI / 2);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
    });

    const leftBeam = new THREE.Mesh(beamGeo, beamMat);
    leftBeam.position.set(-0.58, 0.48, 3.4);
    car.add(leftBeam);

    const rightBeam = new THREE.Mesh(beamGeo, beamMat);
    rightBeam.position.set(0.58, 0.48, 3.4);
    car.add(rightBeam);

    // 5.7 Continuous Tesla-Style Rear Full-Width LED Lightbar
    const tailBarGeo = new THREE.BoxGeometry(1.48, 0.05, 0.06);
    const tailBar = new THREE.Mesh(tailBarGeo, ledTaillightMat);
    tailBar.position.set(0, 0.62, -1.94);
    car.add(tailBar);

    // Rear LaBar Gold Logo
    const rearLogoGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.015, 16);
    rearLogoGeo.rotateX(Math.PI / 2);
    const rearLogo = new THREE.Mesh(rearLogoGeo, labarGoldMat);
    rearLogo.position.set(0, 0.68, -1.95);
    car.add(rearLogo);

    // 5.8 Aerodynamic Side Mirrors & Flush Door Handles
    const mirrorGeo = new THREE.BoxGeometry(0.18, 0.08, 0.12);
    const leftMirror = new THREE.Mesh(mirrorGeo, carPaintMaterial);
    leftMirror.position.set(-0.92, 0.72, 0.65);
    leftMirror.rotation.y = -0.2;
    car.add(leftMirror);

    const rightMirror = new THREE.Mesh(mirrorGeo, carPaintMaterial);
    rightMirror.position.set(0.92, 0.72, 0.65);
    rightMirror.rotation.y = 0.2;
    car.add(rightMirror);

    // Flush Chrome Door Handles
    const handleGeo = new THREE.BoxGeometry(0.02, 0.02, 0.14);
    const flHandle = new THREE.Mesh(handleGeo, alloyRimMat);
    flHandle.position.set(-0.89, 0.54, 0.35);
    car.add(flHandle);

    const frHandle = new THREE.Mesh(handleGeo, alloyRimMat);
    frHandle.position.set(0.89, 0.54, 0.35);
    car.add(frHandle);

    const rlHandle = new THREE.Mesh(handleGeo, alloyRimMat);
    rlHandle.position.set(-0.89, 0.54, -0.45);
    car.add(rlHandle);

    const rrHandle = new THREE.Mesh(handleGeo, alloyRimMat);
    rrHandle.position.set(0.89, 0.54, -0.45);
    car.add(rrHandle);

    // 5.9 High-Precision Turbine EV Wheels & Gold Brembo-Style Calipers
    const wheelRadius = 0.33;
    const tireWidth = 0.22;
    const wheelPositions = [
      [-0.88, wheelRadius, 1.2],   // Front Left
      [0.88, wheelRadius, 1.2],    // Front Right
      [-0.88, wheelRadius, -1.2],  // Rear Left
      [0.88, wheelRadius, -1.2],   // Rear Right
    ];

    const wheels: THREE.Group[] = [];

    wheelPositions.forEach(([wx, wy, wz], index) => {
      const wheelAssembly = new THREE.Group();
      wheelAssembly.position.set(wx, wy, wz);

      // Torus Smooth Curved Rubber Tire with realistic profile
      const tireGeo = new THREE.TorusGeometry(wheelRadius - 0.07, 0.08, 20, 36);
      tireGeo.rotateY(Math.PI / 2);
      const tire = new THREE.Mesh(tireGeo, tireRubberMat);
      tire.castShadow = true;
      wheelAssembly.add(tire);

      // Tire Tread / Barrel
      const barrelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, tireWidth, 32);
      barrelGeo.rotateZ(Math.PI / 2);
      const barrel = new THREE.Mesh(barrelGeo, tireRubberMat);
      barrel.scale.set(1.0, 0.95, 1.0);
      wheelAssembly.add(barrel);

      // Turbine Aero Alloy Rims (Multi-Spoke EV Design)
      const rimHubGeo = new THREE.CylinderGeometry(0.12, 0.12, tireWidth + 0.01, 24);
      rimHubGeo.rotateZ(Math.PI / 2);
      const rimHub = new THREE.Mesh(rimHubGeo, alloyRimMat);
      wheelAssembly.add(rimHub);

      // 5 Turbine Blades
      for (let s = 0; s < 5; s++) {
        const spokeGeo = new THREE.BoxGeometry(0.02, 0.22, 0.05);
        const spoke = new THREE.Mesh(spokeGeo, alloyRimMat);
        const angle = (s * Math.PI * 2) / 5;
        spoke.position.set(index % 2 === 0 ? -0.08 : 0.08, Math.sin(angle) * 0.12, Math.cos(angle) * 0.12);
        spoke.rotation.x = angle;
        wheelAssembly.add(spoke);
      }

      // Slotted Brake Rotor
      const rotorGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.02, 24);
      rotorGeo.rotateZ(Math.PI / 2);
      const rotor = new THREE.Mesh(rotorGeo, brakeRotorMat);
      wheelAssembly.add(rotor);

      // LaBar Gold Brake Caliper
      const caliperGeo = new THREE.BoxGeometry(0.06, 0.11, 0.14);
      const caliper = new THREE.Mesh(caliperGeo, labarGoldMat);
      caliper.position.set(index % 2 === 0 ? -0.04 : 0.04, 0.12, 0.08);
      wheelAssembly.add(caliper);

      car.add(wheelAssembly);
      wheels.push(wheelAssembly);
    });

    scene.add(car);

    // --- 6. Smooth Mouse / Touch Orbit Controls ---
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let targetRotationY = 0.55;
    let targetRotationX = 0.06;

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

      targetRotationY += deltaX * 0.007;
      targetRotationX = Math.max(-0.15, Math.min(0.3, targetRotationX + deltaY * 0.003));

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

    // --- 7. 60fps Smooth Render Animation Loop ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Idle smooth auto-rotation
      if (!isDragging) {
        targetRotationY += 0.0035;
      }

      // Smooth camera orbit damping
      car.rotation.y += (targetRotationY - car.rotation.y) * 0.075;
      car.rotation.x += (targetRotationX - car.rotation.x) * 0.075;

      // Realistic EV suspension breathing
      car.position.y = Math.sin(elapsedTime * 2.2) * 0.025;

      // Wheel rotation
      wheels.forEach((w) => {
        w.children[0].rotation.x = elapsedTime * 2.8;
      });

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

    // --- 9. Cleanup on Unmount ---
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
    <div className="relative w-full h-[360px] sm:h-[440px] lg:h-[500px] rounded-4xl overflow-hidden cursor-grab active:cursor-grabbing select-none bg-gradient-to-b from-white/40 via-transparent to-white/60">
      <div ref={containerRef} className="w-full h-full" />

      {/* 3D Scene Controls Badge Overlay */}
      <div className="absolute bottom-4 left-4 pointer-events-none flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-brand-border/80 shadow-soft text-[11px] font-bold text-neutral-800">
        <span className="w-2 h-2 rounded-full bg-brand-red animate-ping" />
        <span className="w-2 h-2 rounded-full bg-brand-red -ml-4" />
        <span>Tesla Model S EV LaBar Taxi • Interactive 3D (60fps)</span>
      </div>
    </div>
  );
};
