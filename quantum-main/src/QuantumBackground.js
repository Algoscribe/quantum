import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const QuantumBackground = () => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const qubitGroupRef = useRef(null);
  const helixRef = useRef(null);
  const particlesMeshRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const timeRef = useRef(0);
  const animationIdRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // --- Scene / Camera / Renderer ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current = renderer;

    // --- Wireframe qubit sphere (NO purple blob) ---
    const qubitGroup = new THREE.Group();
    qubitGroupRef.current = qubitGroup;

    const sphereGeo = new THREE.SphereGeometry(10, 64, 64);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    qubitGroup.add(sphere);

    const ringGeo = new THREE.TorusGeometry(10, 0.15, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.2,
    });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    qubitGroup.add(ring1);

    const ring2 = ring1.clone();
    ring2.rotation.x = Math.PI / 2;
    qubitGroup.add(ring2);

    scene.add(qubitGroup);

    // --- Helix ---
    const helixPoints = [];
    for (let i = 0; i < 150; i++) {
      const t = (i / 150) * Math.PI * 3;
      helixPoints.push(
        new THREE.Vector3(
          Math.cos(t) * 12,
          (i / 150) * 30 - 15,
          Math.sin(t) * 12
        )
      );
    }
    const helixGeo = new THREE.BufferGeometry().setFromPoints(helixPoints);
    const helixMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.15,
    });
    const helix = new THREE.Line(helixGeo, helixMat);
    helixRef.current = helix;
    scene.add(helix);

    // --- Star particles ---
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 4000;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 200;
    }
    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3)
    );

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particlesMesh = new THREE.Points(
      particlesGeometry,
      particlesMaterial
    );
    particlesMeshRef.current = particlesMesh;
    scene.add(particlesMesh);

    // --- Mouse parallax ---
    const handleMouseMove = (e) => {
      mouseRef.current.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    document.addEventListener("mousemove", handleMouseMove);

    // --- Animation loop ---
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.01;

      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      if (qubitGroupRef.current) {
        qubitGroupRef.current.rotation.y = timeRef.current * 0.2;
        qubitGroupRef.current.rotation.x =
          Math.sin(timeRef.current * 0.3) * 0.2;
      }

      if (helixRef.current) {
        helixRef.current.rotation.y = timeRef.current * 0.08;
      }

      if (cameraRef.current) {
        cameraRef.current.position.x = mouse.x * 2;
        cameraRef.current.position.y = mouse.y * 2;
        cameraRef.current.lookAt(0, 0, 0);
      }

      if (particlesMeshRef.current) {
        particlesMeshRef.current.rotation.x += 0.0001;
        particlesMeshRef.current.rotation.y += 0.0005;
        particlesMeshRef.current.position.x +=
          (mouse.x * 5 - particlesMeshRef.current.position.x) * 0.03;
        particlesMeshRef.current.position.y +=
          (mouse.y * 5 - particlesMeshRef.current.position.y) * 0.03;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // --- Resize handling ---
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      if (rendererRef.current) rendererRef.current.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
      }}
    />
  );
};

export default QuantumBackground;
