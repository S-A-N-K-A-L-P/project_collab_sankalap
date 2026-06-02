"use client";

/**
 * ⚠️ ISOLATION BOUNDARY ⚠️
 * This is the ONLY file in the codebase that imports "three".
 * It is loaded EXCLUSIVELY through next/dynamic(() => import(...), { ssr:false })
 * from PortfolioBackground.tsx, and ONLY when the user enabled `heavy3d`.
 *
 * Because nothing imports this file statically, bundlers place `three` + this
 * module in a SEPARATE async chunk that is fetched only when this component is
 * first rendered. If 3D is off, this chunk is never requested → three.js never
 * loads anywhere near the running page.
 *
 * Vanilla three.js (no @react-three/fiber) → zero React/Next peer deps.
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { PortfolioTheme, ThreeSceneKind } from "../../themes/registry";

function hexToColor(hex: string, fallback = "#7c5cff") {
  try { return new THREE.Color(hex); } catch { return new THREE.Color(fallback); }
}

export default function ThreeBackground({
  scene = "particles",
  theme,
}: {
  scene?: ThreeSceneKind;
  theme: PortfolioTheme;
}) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, { position: "absolute", inset: "0", width: "100%", height: "100%" });

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 6;

    const scene3 = new THREE.Scene();
    const accent = hexToColor(theme.palette.accent);
    const accent2 = hexToColor(theme.palette.accent2);

    const objects: THREE.Object3D[] = [];
    let particles: THREE.Points | null = null;

    if (scene === "globe") {
      const geo = new THREE.IcosahedronGeometry(2.4, 2);
      const mat = new THREE.MeshBasicMaterial({ color: accent, wireframe: true, transparent: true, opacity: 0.45 });
      const globe = new THREE.Mesh(geo, mat);
      scene3.add(globe); objects.push(globe);

      const halo = new THREE.Mesh(
        new THREE.IcosahedronGeometry(2.9, 1),
        new THREE.MeshBasicMaterial({ color: accent2, wireframe: true, transparent: true, opacity: 0.15 })
      );
      scene3.add(halo); objects.push(halo);
    } else if (scene === "ribbons") {
      for (let i = 0; i < 5; i++) {
        const curve = new THREE.TorusKnotGeometry(1.6 + i * 0.25, 0.03, 160, 8, 2, 3);
        const mat = new THREE.MeshBasicMaterial({ color: i % 2 ? accent2 : accent, transparent: true, opacity: 0.35 });
        const knot = new THREE.Mesh(curve, mat);
        knot.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        scene3.add(knot); objects.push(knot);
      }
    } else {
      // particles (default)
      const COUNT = 1400;
      const positions = new Float32Array(COUNT * 3);
      for (let i = 0; i < COUNT * 3; i++) positions[i] = (Math.random() - 0.5) * 16;
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({ color: accent, size: 0.045, transparent: true, opacity: 0.8 });
      particles = new THREE.Points(geo, mat);
      scene3.add(particles); objects.push(particles);
    }

    const mouse = { x: 0, y: 0 };
    const onMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove);

    const onResize = () => {
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    let raf = 0;
    let t = 0;
    const animate = () => {
      t += 0.0035;
      for (const o of objects) {
        o.rotation.y += reduced ? 0 : 0.0016;
        o.rotation.x += reduced ? 0 : 0.0008;
      }
      if (particles && !reduced) particles.rotation.y = t * 0.4;
      // subtle parallax
      camera.position.x += (mouse.x * 0.8 - camera.position.x) * 0.04;
      camera.position.y += (-mouse.y * 0.8 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);
      renderer.render(scene3, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      objects.forEach((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = (m as any).material;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose()); else mat?.dispose?.();
      });
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [scene, theme]);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}
