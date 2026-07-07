"use client";

/**
 * ⚠️ ISOLATION BOUNDARY ⚠️
 * The ONLY file that imports "three". Loaded EXCLUSIVELY via
 * next/dynamic(() => import(...), { ssr:false }) from PortfolioBackground.tsx,
 * and ONLY when the user enabled `heavy3d`. When 3D is off this module's chunk
 * is never requested → three.js never loads near the running page.
 * Vanilla three.js (no @react-three/fiber) → zero React/Next peer deps.
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { PortfolioTheme, ThreeSceneKind } from "../../themes/registry";

const col = (hex: string, fb = "#7c5cff") => { try { return new THREE.Color(hex); } catch { return new THREE.Color(fb); } };

export default function ThreeBackground({
  scene = "particles",
  theme,
}: { scene?: ThreeSceneKind; theme: PortfolioTheme }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    let w = mount.clientWidth || window.innerWidth;
    let h = mount.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, { position: "absolute", inset: "0", width: "100%", height: "100%" });

    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    camera.position.z = 7;

    const root = new THREE.Scene();
    const accent = col(theme.palette.accent);
    const accent2 = col(theme.palette.accent2);
    const objects: THREE.Object3D[] = [];
    let points: THREE.Points | null = null;
    let wavePlane: THREE.Points | null = null;
    const lineMat = (c: THREE.Color, o = 0.4) => new THREE.MeshBasicMaterial({ color: c, wireframe: true, transparent: true, opacity: o });

    const add = (o: THREE.Object3D) => { root.add(o); objects.push(o); };

    switch (scene) {
      case "globe": {
        add(new THREE.Mesh(new THREE.IcosahedronGeometry(2.6, 2), lineMat(accent, 0.45)));
        add(new THREE.Mesh(new THREE.IcosahedronGeometry(3.1, 1), lineMat(accent2, 0.15)));
        break;
      }
      case "crystals": {
        for (let i = 0; i < 9; i++) {
          const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.6 + Math.random() * 0.7, 0), lineMat(i % 2 ? accent2 : accent, 0.5));
          m.position.set((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 4);
          add(m);
        }
        break;
      }
      case "ribbons": {
        for (let i = 0; i < 5; i++) {
          const m = new THREE.Mesh(new THREE.TorusKnotGeometry(1.5 + i * 0.28, 0.03, 140, 8, 2, 3),
            new THREE.MeshBasicMaterial({ color: i % 2 ? accent2 : accent, transparent: true, opacity: 0.35 }));
          m.rotation.set(Math.random() * 3, Math.random() * 3, 0); add(m);
        }
        break;
      }
      case "torusfield": {
        for (let i = 0; i < 14; i++) {
          const m = new THREE.Mesh(new THREE.TorusGeometry(0.5 + Math.random() * 0.4, 0.08, 12, 30), lineMat(i % 2 ? accent2 : accent, 0.4));
          m.position.set((Math.random() - 0.5) * 9, (Math.random() - 0.5) * 7, (Math.random() - 0.5) * 4);
          m.rotation.set(Math.random() * 3, Math.random() * 3, 0); add(m);
        }
        break;
      }
      case "boxes": {
        for (let i = 0; i < 16; i++) {
          const s = 0.4 + Math.random() * 0.8;
          const m = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), lineMat(i % 2 ? accent2 : accent, 0.45));
          m.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 7, (Math.random() - 0.5) * 5);
          m.rotation.set(Math.random() * 3, Math.random() * 3, 0); add(m);
        }
        break;
      }
      case "rings": {
        for (let i = 0; i < 6; i++) {
          const m = new THREE.Mesh(new THREE.TorusGeometry(1 + i * 0.5, 0.02, 8, 80), lineMat(i % 2 ? accent2 : accent, 0.5));
          m.rotation.x = Math.PI / 2 + i * 0.18; add(m);
        }
        break;
      }
      case "helix": {
        const strands = 2;
        for (let s = 0; s < strands; s++) {
          for (let i = 0; i < 40; i++) {
            const ang = i * 0.4 + s * Math.PI;
            const sph = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8),
              new THREE.MeshBasicMaterial({ color: s ? accent2 : accent, transparent: true, opacity: 0.8 }));
            sph.position.set(Math.cos(ang) * 1.4, (i - 20) * 0.22, Math.sin(ang) * 1.4);
            add(sph);
          }
        }
        break;
      }
      case "grid3d": {
        const g = 5, gap = 1.4; const positions: number[] = [];
        for (let x = 0; x < g; x++) for (let y = 0; y < g; y++) for (let z = 0; z < g; z++)
          positions.push((x - 2) * gap, (y - 2) * gap, (z - 2) * gap);
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
        points = new THREE.Points(geo, new THREE.PointsMaterial({ color: accent, size: 0.12, transparent: true, opacity: 0.85 }));
        add(points);
        break;
      }
      case "waves3d": {
        const seg = 40, size = 14; const positions: number[] = [];
        for (let i = 0; i <= seg; i++) for (let j = 0; j <= seg; j++)
          positions.push((i / seg - 0.5) * size, 0, (j / seg - 0.5) * size);
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
        wavePlane = new THREE.Points(geo, new THREE.PointsMaterial({ color: accent, size: 0.07, transparent: true, opacity: 0.8 }));
        wavePlane.rotation.x = -Math.PI / 2.6; wavePlane.position.y = -1.5;
        add(wavePlane);
        break;
      }
      default: { // particles
        const COUNT = 1400; const pos = new Float32Array(COUNT * 3);
        for (let i = 0; i < COUNT * 3; i++) pos[i] = (Math.random() - 0.5) * 16;
        const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        points = new THREE.Points(geo, new THREE.PointsMaterial({ color: accent, size: 0.045, transparent: true, opacity: 0.8 }));
        add(points);
      }
    }

    const mouse = { x: 0, y: 0 };
    const onMove = (e: MouseEvent) => { mouse.x = (e.clientX / window.innerWidth - 0.5) * 2; mouse.y = (e.clientY / window.innerHeight - 0.5) * 2; };
    window.addEventListener("mousemove", onMove);
    const onResize = () => {
      w = mount.clientWidth || window.innerWidth; h = mount.clientHeight || window.innerHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    let raf = 0, t = 0;
    const animate = () => {
      t += 0.016;
      const spin = reduced ? 0 : 1;
      for (const o of objects) { o.rotation.y += 0.0016 * spin; o.rotation.x += 0.0008 * spin; }
      if (scene === "rings") objects.forEach((o, i) => { o.rotation.z += 0.004 * spin * (i % 2 ? -1 : 1); });
      if (points && scene === "particles" && !reduced) points.rotation.y = t * 0.4;
      if (wavePlane) {
        const g = wavePlane.geometry as THREE.BufferGeometry;
        const arr = g.attributes.position.array as Float32Array;
        for (let i = 0; i < arr.length; i += 3) {
          const x = arr[i], z = arr[i + 2];
          arr[i + 1] = Math.sin(x * 0.6 + t) * 0.5 + Math.cos(z * 0.6 + t * 0.8) * 0.5;
        }
        g.attributes.position.needsUpdate = true;
        wavePlane.rotation.z += 0.0004 * spin;
      }
      camera.position.x += (mouse.x * 1.1 - camera.position.x) * 0.04;
      camera.position.y += (-mouse.y * 1.1 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);
      renderer.render(root, camera);
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
        const mat: any = (m as any).material;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose?.()); else mat?.dispose?.();
      });
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, theme.palette.accent, theme.palette.accent2]);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}
