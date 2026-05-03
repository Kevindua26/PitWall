import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

// ── RB20-inspired car builder ──────────────────────────────────────────────────
function M(geom, mat, px = 0, py = 0, pz = 0, rx = 0, ry = 0, rz = 0) {
  const m = new THREE.Mesh(geom, mat);
  m.position.set(px, py, pz);
  m.rotation.set(rx, ry, rz);
  m.castShadow = m.receiveShadow = true;
  return m;
}

function buildRB20() {
  const car = new THREE.Group();

  // ── Materials — accurate RB20 reference colors ──────────────────────────
  // RB20 body: very dark navy, almost black (as seen in reference photo)
  const blue   = new THREE.MeshPhysicalMaterial({ color: 0x05091A, metalness: 0.88, roughness: 0.08, clearcoat: 1.0, clearcoatRoughness: 0.03 });
  // Darker panels / undercut
  const dkBlue = new THREE.MeshPhysicalMaterial({ color: 0x030610, metalness: 0.85, roughness: 0.12, clearcoat: 1.0 });
  // Livery yellow (engine cover stripe, endplate stripe, hub)
  const yellow = new THREE.MeshPhysicalMaterial({ color: 0xFFD000, metalness: 0.55, roughness: 0.18, clearcoat: 0.9 });
  // Carbon fibre panels
  const carbon = new THREE.MeshPhysicalMaterial({ color: 0x07070F, metalness: 0.35, roughness: 0.65 });
  // Livery red (nose accent, front wing bottom, rear wing bottom)
  const rbRed  = new THREE.MeshPhysicalMaterial({ color: 0xCC0000, metalness: 0.50, roughness: 0.22 });
  // Livery orange (mid-stripe — the RB gradient)
  const rbOrange = new THREE.MeshPhysicalMaterial({ color: 0xFF5500, metalness: 0.50, roughness: 0.22 });
  // Tyre (Pirelli black)
  const tire   = new THREE.MeshPhysicalMaterial({ color: 0x0C0C0C, roughness: 0.97, metalness: 0.0 });
  // Rim: LIME GREEN — signature Pirelli P Zero colour on RB20 18" rims
  const rim    = new THREE.MeshPhysicalMaterial({ color: 0x9AE600, metalness: 0.70, roughness: 0.12, clearcoat: 0.6 });
  // White (not used on RB20, keep as neutral fallback)
  const white  = new THREE.MeshPhysicalMaterial({ color: 0xDDDDDD, metalness: 0.40, roughness: 0.25 });

  // ── Chassis / floor ────────────────────────────────────────────────────────
  car.add(M(new THREE.BoxGeometry(4.1, 0.16, 0.82), blue,   0.0, 0.26, 0));
  car.add(M(new THREE.BoxGeometry(3.4, 0.04, 0.78), carbon, 0.1, 0.13, 0));
  // Floor edges (wide, ground effect car)
  [-0.48, 0.48].forEach(z => {
    car.add(M(new THREE.BoxGeometry(3.0, 0.025, 0.05), blue, -0.3, 0.065, z));
    car.add(M(new THREE.BoxGeometry(0.45, 0.08,  0.04), carbon, -1.45, 0.10, z));
  });

  // ── Nose (long tapering RB20 nose) ────────────────────────────────────────
  // RB20 nose: dark body, red accent where it meets front wing
  const nose = M(new THREE.CylinderGeometry(0.05, 0.30, 1.55, 14), blue, 2.75, 0.26, 0);
  nose.rotation.z = -Math.PI / 2; car.add(nose);
  // Red nose tip — matches RB20 reference
  const noseTip = M(new THREE.CylinderGeometry(0.02, 0.055, 0.55, 8), rbRed, 3.35, 0.26, 0);
  noseTip.rotation.z = -Math.PI / 2; car.add(noseTip);
  // Nose-to-wing connector (dark)
  car.add(M(new THREE.BoxGeometry(0.12, 0.10, 0.12), carbon, 2.10, 0.10, 0));

  // ── Front wing (multi-element) ─────────────────────────────────────────────
  // RB20 FW: dark body, red/yellow accent on bottom surface
  car.add(M(new THREE.BoxGeometry(1.88, 0.030, 0.44), carbon, 2.02, 0.03, 0)); // main plane: carbon
  car.add(M(new THREE.BoxGeometry(1.65, 0.022, 0.32), blue,   1.93, 0.08, 0));
  car.add(M(new THREE.BoxGeometry(1.38, 0.018, 0.23), blue,   1.83, 0.12, 0));
  // Red + yellow underside strip on FW (signature RB look)
  car.add(M(new THREE.BoxGeometry(1.60, 0.012, 0.40), rbRed,    2.02, -0.002, 0));
  car.add(M(new THREE.BoxGeometry(0.80, 0.012, 0.38), yellow,   1.78, -0.002, 0));
  // Endplates (carbon on RB20)
  [-0.92, 0.92].forEach(z => {
    car.add(M(new THREE.BoxGeometry(0.58, 0.20, 0.04), carbon, 2.00, 0.07, z));
    car.add(M(new THREE.BoxGeometry(0.32, 0.022, 0.18), carbon, 1.85, 0.17, z * 0.75));
  });

  // ── Cockpit ────────────────────────────────────────────────────────────────
  car.add(M(new THREE.BoxGeometry(0.98, 0.20, 0.58), carbon, -0.05, 0.42, 0));
  [-0.30, 0.30].forEach(z => car.add(M(new THREE.BoxGeometry(0.88, 0.04, 0.04), blue, -0.05, 0.46, z)));

  // ── Halo ───────────────────────────────────────────────────────────────────
  const halo = M(new THREE.TorusGeometry(0.265, 0.020, 9, 26, Math.PI * 1.18), carbon, -0.10, 0.55, 0);
  halo.rotation.x = Math.PI / 2; halo.rotation.z = Math.PI * 0.08; car.add(halo);
  car.add(M(new THREE.CylinderGeometry(0.020, 0.020, 0.24, 7), carbon, -0.10, 0.55, 0));

  // ── Engine cover + airbox ──────────────────────────────────────────────────
  car.add(M(new THREE.BoxGeometry(1.35, 0.30, 0.46), blue, -0.88, 0.38, 0));
  // RB20 spine livery: red → orange → yellow gradient (3 stripes)
  car.add(M(new THREE.BoxGeometry(0.45, 0.042, 0.44), rbRed,    -0.55, 0.540, 0)); // rear: red
  car.add(M(new THREE.BoxGeometry(0.38, 0.042, 0.42), rbOrange, -0.10, 0.540, 0)); // mid: orange
  car.add(M(new THREE.BoxGeometry(0.35, 0.042, 0.40), yellow,    0.20, 0.540, 0)); // front: yellow
  car.add(M(new THREE.BoxGeometry(0.18, 0.24, 0.27), carbon, -0.10, 0.64, 0)); // airbox
  // Airbox opening — dark
  car.add(M(new THREE.BoxGeometry(0.06, 0.20, 0.20), dkBlue, -0.10, 0.68, 0));

  // ── Sidepods (RB20 infamous undercut — very narrow waist) ─────────────────
  [-0.44, 0.44].forEach(z => {
    // Main sidepod
    car.add(M(new THREE.BoxGeometry(1.55, 0.13, 0.20), blue, -0.22, 0.22, z));
    // Shoulder
    car.add(M(new THREE.BoxGeometry(0.75, 0.05, 0.28), blue, 0.12, 0.30, z));
    // Inlet opening
    car.add(M(new THREE.BoxGeometry(0.28, 0.13, 0.04), carbon, 0.57, 0.24, z > 0 ? z + 0.11 : z - 0.11));
    // Undercut (the dramatic concave section)
    car.add(M(new THREE.BoxGeometry(0.60, 0.09, 0.18), dkBlue, -0.55, 0.16, z > 0 ? z - 0.01 : z + 0.01));
    // RB20 sidepod livery: subtle dark with no prominent stripe (very clean look)
    // Small Bybit-style white text area approximated as a light panel
    car.add(M(new THREE.BoxGeometry(0.70, 0.022, 0.195), white, -0.30, 0.30, z));
  });

  // ── Rear wing ──────────────────────────────────────────────────────────────
  car.add(M(new THREE.BoxGeometry(1.38, 0.035, 0.40), blue,   -1.73, 0.60, 0));
  car.add(M(new THREE.BoxGeometry(1.22, 0.028, 0.30), dkBlue, -1.73, 0.66, 0)); // DRS flap
  car.add(M(new THREE.BoxGeometry(0.92, 0.038, 0.22), carbon, -1.73, 0.31, 0)); // beam wing
  // Pylons
  [-0.44, 0.44].forEach(z => car.add(M(new THREE.BoxGeometry(0.04, 0.30, 0.04), carbon, -1.73, 0.44, z)));
  // Endplates — RB20: carbon with bottom red stripe
  [-0.64, 0.64].forEach(z => {
    car.add(M(new THREE.BoxGeometry(0.50, 0.40, 0.04), carbon, -1.73, 0.46, z));
    car.add(M(new THREE.BoxGeometry(0.50, 0.022, 0.045), rbRed,   -1.73, 0.275, z)); // red bottom
    car.add(M(new THREE.BoxGeometry(0.50, 0.022, 0.045), yellow,  -1.73, 0.640, z)); // yellow top
  });

  // ── Diffuser ───────────────────────────────────────────────────────────────
  const diff = M(new THREE.BoxGeometry(0.98, 0.11, 0.88), carbon, -1.88, 0.07, 0);
  diff.rotation.z = -0.28; car.add(diff);
  for (let i = -2; i <= 2; i++) car.add(M(new THREE.BoxGeometry(0.62, 0.055, 0.022), carbon, -1.92, 0.07, i * 0.13));

  // ── Wheels ─────────────────────────────────────────────────────────────────
  const WHEELS = [[1.53,-0.07,0.64,true],[1.53,-0.07,-0.64,true],[-1.28,-0.07,0.70,false],[-1.28,-0.07,-0.70,false]];
  WHEELS.forEach(([x, y, z, front]) => {
    const wg = new THREE.Group();
    const R = front ? 0.235 : 0.270;
    const W = front ? 0.185 : 0.235;

    // Tyre
    const tyre = new THREE.Mesh(new THREE.CylinderGeometry(R, R, W, 32), tire);
    tyre.rotation.x = Math.PI / 2; wg.add(tyre);

    // Tyre sidewall (pirelli text approximation)
    const swMat = new THREE.MeshPhysicalMaterial({ color: 0x181818, roughness: 0.98 });
    const sw = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.97, R * 0.97, W * 1.02, 32, 1, true), swMat);
    sw.rotation.x = Math.PI / 2; wg.add(sw);

    // Rim — LIME GREEN (RB20 Pirelli P Zero 18" rims)
    const r1 = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.68, R * 0.68, W * 1.06, 20), rim);
    r1.rotation.x = Math.PI / 2; wg.add(r1);

    // Centre hub — Red Bull red (matching actual car)
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.18, R * 0.18, W * 1.12, 8), rbRed);
    hub.rotation.x = Math.PI / 2; wg.add(hub);

    // 5-spoke design (lime green spokes like RB18/RB20 rims)
    for (let i = 0; i < 5; i++) {
      const sp = new THREE.Mesh(new THREE.BoxGeometry(R * 1.20, 0.022, 0.028), rim);
      sp.rotation.z = (i / 5) * Math.PI * 2;
      wg.add(sp);
    }
    // Rim outer ring accent
    const rimRing = new THREE.Mesh(new THREE.TorusGeometry(R * 0.66, 0.012, 6, 24), rim);
    rimRing.rotation.x = Math.PI / 2; wg.add(rimRing);

    wg.position.set(x, y, z);
    car.add(wg);
  });

  // ── Brake ducts ────────────────────────────────────────────────────────────
  [[1.53, 0.19, 0.52], [1.53, 0.19, -0.52]].forEach(p => car.add(M(new THREE.BoxGeometry(0.22, 0.14, 0.04), carbon, ...p)));

  // ── Suspension (visible pushrod hints) ────────────────────────────────────
  [[1.53,0.13,0.47],[1.53,0.13,-0.47],[-1.28,0.13,0.52],[-1.28,0.13,-0.52]].forEach(([x,y,z]) => {
    const arm = M(new THREE.CylinderGeometry(0.014, 0.014, 0.38, 6), carbon, x, y, z);
    arm.rotation.x = Math.PI / 2; car.add(arm);
  });

  return car;
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function F1CarScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const W = el.clientWidth, H = el.clientHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06060e, 0.038);

    // Camera
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 200);
    camera.position.set(6.5, 3.2, 8.5);
    camera.lookAt(0, 0.3, 0);

    // ── Studio lighting ────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x101828, 2.0));

    const key = new THREE.DirectionalLight(0xffffff, 5.0);
    key.position.set(5, 14, 7); key.castShadow = true;
    key.shadow.mapSize.set(4096, 4096); key.shadow.camera.near = 0.5; key.shadow.camera.far = 50;
    scene.add(key);

    // Fill & rim lights tuned to RB20 dark-navy look
    const fill  = new THREE.DirectionalLight(0x203060, 1.6); fill.position.set(-8, 4, 4);  scene.add(fill);
    const rimL  = new THREE.DirectionalLight(0x102040, 2.0); rimL.position.set(-6, 2, -8); scene.add(rimL);

    // RB team accent lights: subtle blue + warm orange/red for livery
    const rbBlue   = new THREE.PointLight(0x1030AA,  8, 14); rbBlue.position.set(-2, 3.0, 2);   scene.add(rbBlue);
    const rbOrangeL= new THREE.PointLight(0xFF5500,  5, 10); rbOrangeL.position.set(1, 2.0, 4); scene.add(rbOrangeL);
    const under    = new THREE.PointLight(0x050A1A,  3,  7); under.position.set(0, -1, 0);       scene.add(under);
    // Lime reflection from below (rim colour spill)
    const rimSpill = new THREE.PointLight(0x88DD00,  3,  6); rimSpill.position.set(0, -0.5, 2);  scene.add(rimSpill);

    // ── Reflective floor ──────────────────────────────────────────────────
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x050510, metalness: 0.6, roughness: 0.4,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.30;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(40, 40, 0x1a1a3e, 0x0d0d20);
    grid.position.y = -0.295;
    scene.add(grid);

    // ── Particles ─────────────────────────────────────────────────────────
    const N = 600;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 50;
      pos[i*3+1] = Math.random() * 20;
      pos[i*3+2] = (Math.random() - 0.5) * 50;
      // Mix dark blue and neutral white particles matching RB20 scene
      const c = Math.random() > 0.65 ? [0.08, 0.15, 0.50] : [0.85, 0.88, 1.0];
      col[i*3] = c[0]; col[i*3+1] = c[1]; col[i*3+2] = c[2];
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const pts = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.055, vertexColors: true, transparent: true, opacity: 0.75 }));
    scene.add(pts);

    // ── Car ───────────────────────────────────────────────────────────────
    const carGroup = buildRB20();
    carGroup.rotation.y = Math.PI * 0.12; // slight default angle showing 3/4 front
    scene.add(carGroup);

    // ── Idle float + light pulse ───────────────────────────────────────────
    gsap.to(carGroup.position, { y: 0.14, duration: 2.8, yoyo: true, repeat: -1, ease: 'power1.inOut' });
    gsap.to(rbBlue,    { intensity: 13, duration: 1.8, yoyo: true, repeat: -1, ease: 'power1.inOut' });
    gsap.to(rbOrangeL, { intensity: 8,  duration: 2.4, yoyo: true, repeat: -1, ease: 'power1.inOut' });
    gsap.to(rimSpill,  { intensity: 5,  duration: 2.0, yoyo: true, repeat: -1, ease: 'power1.inOut' });

    // Wheel spin
    carGroup.traverse(c => {
      if (c.isMesh && c.geometry.type === 'CylinderGeometry') {
        const r = c.geometry.parameters.radiusTop;
        if (r > 0.20) gsap.to(c.rotation, { z: Math.PI * 2, duration: 0.9, repeat: -1, ease: 'none' });
      }
    });

    // ── Scroll-driven camera orbit + car spin ─────────────────────────────
    const scrollProxy = { t: 0 };
    const scrollTL = gsap.timeline({
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: '+=2400',
        scrub: 1.8,
      }
    });
    scrollTL
      .to(scrollProxy, { t: 1, duration: 3,
        onUpdate: () => {
          const p = scrollProxy.t;
          // Phase 1 (0-0.4): swing to driver's side
          if (p < 0.4) {
            const f = p / 0.4;
            camera.position.set(6.5 - f*4, 3.2 - f*1.2, 8.5 - f*4);
            carGroup.rotation.y = Math.PI*0.12 + f * Math.PI * 0.7;
          }
          // Phase 2 (0.4-0.75): sweep to rear
          else if (p < 0.75) {
            const f = (p - 0.4) / 0.35;
            camera.position.set(2.5 - f*5.5, 2.0 + f*0.5, 4.5 - f*5.5);
            carGroup.rotation.y = Math.PI*0.82 + f * Math.PI * 0.6;
          }
          // Phase 3 (0.75-1): top-down finale
          else {
            const f = (p - 0.75) / 0.25;
            camera.position.set(-3 - f*0.5, 2.5 + f*4, -1 + f*2);
            carGroup.rotation.y = Math.PI*1.42 + f * Math.PI * 0.4;
            carGroup.rotation.x = f * 0.25;
          }
        }
      });

    // ── Mouse-hover 3D rotation ────────────────────────────────────────────
    const mouse = { tx: 0, ty: 0, cx: 0, cy: 0 };
    let mouseTimer = null;
    let isHovering = false;
    const BASE_Y = Math.PI * 0.12;

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      mouse.tx = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
      mouse.ty = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
      isHovering = true;
      clearTimeout(mouseTimer);
      mouseTimer = setTimeout(() => { isHovering = false; }, 2500);
    };
    const onLeave = () => { isHovering = false; mouse.tx = 0; mouse.ty = 0; };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);

    // ── Resize ─────────────────────────────────────────────────────────────
    const onResize = () => {
      const W2 = el.clientWidth, H2 = el.clientHeight;
      camera.aspect = W2 / H2; camera.updateProjectionMatrix();
      renderer.setSize(W2, H2);
    };
    window.addEventListener('resize', onResize);

    // ── Render loop ────────────────────────────────────────────────────────
    let raf;
    let autoTime = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      autoTime += 0.006;

      // Smooth lerp towards mouse target
      const lerpSpeed = 0.055;
      mouse.cx += (mouse.tx - mouse.cx) * lerpSpeed;
      mouse.cy += (mouse.ty - mouse.cy) * lerpSpeed;

      if (isHovering) {
        carGroup.rotation.y = BASE_Y + mouse.cx * 0.55;
        carGroup.rotation.x = mouse.cy * -0.18;
      } else {
        // Gentle auto-rotation when idle
        carGroup.rotation.y += (BASE_Y + Math.sin(autoTime) * 0.28 - carGroup.rotation.y) * 0.015;
        carGroup.rotation.x += (0 - carGroup.rotation.x) * 0.02;
        mouse.cx = 0; mouse.cy = 0;
      }

      pts.rotation.y += 0.0002;
      camera.lookAt(0, 0.3, 0);
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(mouseTimer);
      ScrollTrigger.getAll().forEach(t => t.kill());
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: '100%', cursor: 'crosshair' }}
    />
  );
}
