import React, { useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import {
  ART_SHEET_URL,
  getPrintCrop,
  Lang,
  PRINTS,
  SHEET_H,
  SHEET_W,
  SMALL_SCREEN_QUERY,
} from '../data/prints';

export interface PrintSlotMeta {
  id: string;
  wall: 'outer' | 'inner';
  slotIndex: number;
  printIndex: number;
  angle: number;
  mesh: THREE.Mesh;
}

export interface ScreenRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface PillState {
  visible: boolean;
  x: number;
  y: number;
}

export interface GalleryHandle {
  stepArrow: (dir: 1 | -1) => void;
  stepBack: () => void;
  focusNearestOuterPrint: (printIndex: number) => void;
  getProjectedRect: (mesh: THREE.Mesh) => ScreenRect;
  triggerIntro: () => void;
}

interface Gallery3DProps {
  lang: Lang;
  suspended: boolean;
  reducedMotion: boolean;
  onIntroReady: () => void;
  onFocusChange: (focused: PrintSlotMeta | null) => void;
  onOpenPrint: (printIndex: number, rect: ScreenRect) => void;
  onPillChange: (pill: PillState) => void;
  onHoverChange: (hovering: boolean) => void;
  onDragChange: (dragging: boolean) => void;
  onStartBoundChange?: (atStart: boolean) => void;
}

const R = 18;
const RIN = 12.2;
const H = 6.2;
const PW = 1.36;
const PH = (1.36 * 763) / 567;
const LW = PH;
const LH = (PH * 477) / 638;
const PY = 1.95;
const OUTER_COUNT = 36;
const INNER_COUNT = 24;
const STEP = (Math.PI * 2) / OUTER_COUNT;
const TH_START_WALL = 0.68;

interface CameraPose {
  th: number;
  r: number;
  yaw: number;
  y: number;
  pitch: number;
}

function createVerticalGradientTexture(
  stops: Array<[number, string]>,
  width = 4,
  height = 256,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  for (const [offset, color] of stops) {
    grad.addColorStop(offset, color);
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createFloorTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#EDD6B0';
  ctx.fillRect(0, 0, size, size);
  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    (size / 2) * (RIN / R),
    size / 2,
    size / 2,
    size / 2,
  );
  grad.addColorStop(0, '#EDD6B0');
  grad.addColorStop(0.55, '#F3E1C3');
  grad.addColorStop(1, '#EFDAB8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createHaloTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  grad.addColorStop(0, 'rgba(255,255,255,0.95)');
  grad.addColorStop(0.35, 'rgba(255,255,255,0.95)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  grad.addColorStop(0, 'rgba(120,90,50,0.28)');
  grad.addColorStop(0.25, 'rgba(120,90,50,0.28)');
  grad.addColorStop(1, 'rgba(120,90,50,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function drawLabelCanvas(
  canvas: HTMLCanvasElement,
  artist: string,
  title: string,
  year: number,
  labelLang: Lang,
) {
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const maxW = canvas.width - 48;
  ctx.fillStyle = '#3A3550';
  ctx.font = '500 54px "Newsreader", "Pretendard", Georgia, serif';

  const singleWidth = ctx.measureText(title).width;
  if (singleWidth <= maxW) {
    ctx.fillText(title, 30, 82);

    ctx.fillStyle = 'rgba(58,53,80,0.85)';
    ctx.font = `${labelLang === 'ENG' ? 'italic ' : ''}400 48px "Newsreader", "Pretendard", Georgia, serif`;
    ctx.fillText(artist, 30, 150, maxW);

    ctx.fillStyle = 'rgba(58,53,80,0.7)';
    ctx.font = '400 30px "DM Mono", "Pretendard", ui-monospace, monospace';
    ctx.fillText(`${year} · PRINT`, 30, 215, maxW);
    return;
  }

  // Fit slightly wider single-line titles by scaling font down, or wrap cleanly onto 2 lines
  const words = title.split(/\s+/).filter(Boolean);
  let line1 = title;
  let line2 = '';
  if (words.length > 1) {
    let bestSplit = 1;
    let bestDiff = Infinity;
    for (let i = 1; i < words.length; i++) {
      const a = words.slice(0, i).join(' ');
      const b = words.slice(i).join(' ');
      const diff = Math.abs(a.length - b.length);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestSplit = i;
      }
    }
    line1 = words.slice(0, bestSplit).join(' ');
    line2 = words.slice(bestSplit).join(' ');
  }

  if (line2) {
    let fontSize = 38;
    ctx.font = `500 ${fontSize}px "Newsreader", "Pretendard", Georgia, serif`;
    while (
      fontSize > 26 &&
      (ctx.measureText(line1).width > maxW || ctx.measureText(line2).width > maxW)
    ) {
      fontSize -= 2;
      ctx.font = `500 ${fontSize}px "Newsreader", "Pretendard", Georgia, serif`;
    }
    ctx.fillText(line1, 30, 56, maxW);
    ctx.fillText(line2, 30, 56 + fontSize + 10, maxW);

    ctx.fillStyle = 'rgba(58,53,80,0.85)';
    ctx.font = `${labelLang === 'ENG' ? 'italic ' : ''}400 42px "Newsreader", "Pretendard", Georgia, serif`;
    ctx.fillText(artist, 30, 166, maxW);

    ctx.fillStyle = 'rgba(58,53,80,0.7)';
    ctx.font = '400 30px "DM Mono", "Pretendard", ui-monospace, monospace';
    ctx.fillText(`${year} · PRINT`, 30, 224, maxW);
  } else {
    ctx.fillText(title, 30, 82, maxW);

    ctx.fillStyle = 'rgba(58,53,80,0.85)';
    ctx.font = `${labelLang === 'ENG' ? 'italic ' : ''}400 48px "Newsreader", "Pretendard", Georgia, serif`;
    ctx.fillText(artist, 30, 150, maxW);

    ctx.fillStyle = 'rgba(58,53,80,0.7)';
    ctx.font = '400 30px "DM Mono", "Pretendard", ui-monospace, monospace';
    ctx.fillText(`${year} · PRINT`, 30, 215, maxW);
  }
}

function wrapAngleNear(angle: number, reference: number): number {
  let a = angle;
  while (a - reference > Math.PI) a -= Math.PI * 2;
  while (a - reference < -Math.PI) a += Math.PI * 2;
  return a;
}

export const Gallery3D = React.forwardRef<GalleryHandle, Gallery3DProps>(
  (
    {
      lang,
      suspended,
      reducedMotion,
      onIntroReady,
      onFocusChange,
      onOpenPrint,
      onPillChange,
      onHoverChange,
      onDragChange,
      onStartBoundChange,
    },
    ref,
  ) => {
    const mountRef = useRef<HTMLDivElement | null>(null);

    const callbacksRef = useRef({
      lang,
      suspended,
      reducedMotion,
      onIntroReady,
      onFocusChange,
      onOpenPrint,
      onPillChange,
      onHoverChange,
      onDragChange,
      onStartBoundChange,
    });
    callbacksRef.current = {
      lang,
      suspended,
      reducedMotion,
      onIntroReady,
      onFocusChange,
      onOpenPrint,
      onPillChange,
      onHoverChange,
      onDragChange,
      onStartBoundChange,
    };

    const apiRef = useRef<GalleryHandle | null>(null);
    const redrawLabelsRef = useRef<((nextLang: Lang) => void) | null>(null);

    useImperativeHandle(ref, () => ({
      stepArrow: (dir) => apiRef.current?.stepArrow(dir),
      stepBack: () => apiRef.current?.stepBack(),
      focusNearestOuterPrint: (idx) =>
        apiRef.current?.focusNearestOuterPrint(idx),
      getProjectedRect: (mesh) =>
        apiRef.current?.getProjectedRect(mesh) ?? {
          left: window.innerWidth / 2 - 100,
          top: window.innerHeight / 2 - 135,
          width: 200,
          height: 270,
        },
      triggerIntro: () => apiRef.current?.triggerIntro(),
    }));

    useEffect(() => {
      const container = mountRef.current;
      if (!container) return;

      const isSoftwareGl = (() => {
        try {
          const gl = document.createElement('canvas').getContext('webgl2');
          if (!gl) return true;
          const ext = gl.getExtension('WEBGL_debug_renderer_info');
          const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
          const gpu = String(gl.getParameter(param));
          gl.getExtension('WEBGL_lose_context')?.loseContext();
          return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
        } catch {
          return false;
        }
      })();

      const smallQuery = window.matchMedia(SMALL_SCREEN_QUERY);
      const isSmallScreen = () => smallQuery.matches;
      const isPortraitSmall = () =>
        isSmallScreen() && window.innerHeight > window.innerWidth;
      const getWalkOffset = () =>
        isPortraitSmall() ? 0.14 + 0.9 * STEP : 0.14;
      const getWalkMax = () => getWalkOffset() + 0.08;
      const clampWalkTh = (th: number) => Math.min(getWalkMax(), th);

      const getWalkPose = (th: number): CameraPose => {
        if (isPortraitSmall()) {
          return { th, r: 15.4, yaw: -0.42, y: 1.9, pitch: -0.1 };
        }
        return { th, r: 15.6, yaw: -0.3, y: 1.92, pitch: -0.12 };
      };

      const getFocusPose = (
        slot: PrintSlotMeta,
        currentTh: number,
      ): CameraPose => {
        const isOuter = slot.wall === 'outer';
        const portraitSmall = isPortraitSmall();
        const r = isOuter
          ? portraitSmall
            ? R - 5.2
            : R - 4.26
          : portraitSmall
            ? RIN + 5.2
            : RIN + 4.26;
        const y = portraitSmall ? PY - 1.05 : PY - 0.52;
        const yaw = isOuter ? Math.PI / 2 : -Math.PI / 2;
        let th = wrapAngleNear(slot.angle, currentTh);
        if (th > 0.05) th -= Math.PI * 2;
        return { th, r, yaw, y, pitch: 0 };
      };

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(
        isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2),
      );
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.NoToneMapping;
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#FFF9EC');
      scene.fog = new THREE.Fog('#FFF9EC', 10, 46);

      const getFov = () =>
        window.innerWidth >= window.innerHeight ? 56 : 70;
      const camera = new THREE.PerspectiveCamera(
        getFov(),
        window.innerWidth / window.innerHeight,
        0.05,
        100,
      );

      // Lights requested in spec (basic materials are unlit)
      const hemi = new THREE.HemisphereLight(0xfffdf6, 0xe9cfa6, 1.55);
      const ambient = new THREE.AmbientLight(0xfff6e6, 0.55);
      scene.add(hemi, ambient);

      // Disposables tracking
      const geometries: THREE.BufferGeometry[] = [];
      const materials: THREE.Material[] = [];
      const textures: THREE.Texture[] = [];

      // Room textures
      const outerWallTex = createVerticalGradientTexture([
        [0, '#F5EBD8'],
        [0.2, '#FBF3E3'],
        [0.6, '#FBF3E3'],
        [0.86, '#F8EDD9'],
        [1, '#EFDFC4'],
      ]);
      const innerPillarTex = createVerticalGradientTexture([
        [0, '#F7EEDD'],
        [0.3, '#FFFAF0'],
        [0.8, '#FDF5E6'],
        [1, '#F1E1C6'],
      ]);
      const floorTex = createFloorTexture();
      const haloTex = createHaloTexture();
      const shadowTex = createShadowTexture();
      textures.push(outerWallTex, innerPillarTex, floorTex, haloTex, shadowTex);

      // Outer wall
      const outerWallGeo = new THREE.CylinderGeometry(R, R, H, 160, 1, true);
      const outerWallMat = new THREE.MeshBasicMaterial({
        map: outerWallTex,
        side: THREE.BackSide,
      });
      const outerWall = new THREE.Mesh(outerWallGeo, outerWallMat);
      outerWall.position.y = 3.1;
      scene.add(outerWall);
      geometries.push(outerWallGeo);
      materials.push(outerWallMat);

      // Inner pillar
      const innerWallGeo = new THREE.CylinderGeometry(
        RIN,
        RIN,
        H,
        120,
        1,
        true,
      );
      const innerWallMat = new THREE.MeshBasicMaterial({
        map: innerPillarTex,
        side: THREE.FrontSide,
      });
      const innerWall = new THREE.Mesh(innerWallGeo, innerWallMat);
      innerWall.position.y = 3.1;
      scene.add(innerWall);
      geometries.push(innerWallGeo);
      materials.push(innerWallMat);

      // Floor
      const floorGeo = new THREE.CircleGeometry(R, 160);
      const floorMat = new THREE.MeshBasicMaterial({ map: floorTex });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      scene.add(floor);
      geometries.push(floorGeo);
      materials.push(floorMat);

      // Ceiling
      const ceilingGeo = new THREE.CircleGeometry(R, 160);
      const ceilingMat = new THREE.MeshBasicMaterial({
        color: '#FAF1E0',
        side: THREE.BackSide,
      });
      const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
      ceiling.rotation.x = -Math.PI / 2;
      ceiling.position.y = H;
      scene.add(ceiling);
      geometries.push(ceilingGeo);
      materials.push(ceilingMat);

      // Entrance partition wall (Beginning of the corridor only)
      const startWallGeo = new THREE.PlaneGeometry(R - RIN + 0.16, H);
      const startWallMat = new THREE.MeshBasicMaterial({
        map: outerWallTex,
        side: THREE.DoubleSide,
      });
      const startTrimGeo = new THREE.PlaneGeometry(R - RIN + 0.16, 0.18);
      const startTrimMat = new THREE.MeshBasicMaterial({
        color: '#E2D1B3',
        side: THREE.DoubleSide,
      });
      const doorReliefGeo = new THREE.PlaneGeometry(2.4, 3.8);
      const doorReliefMat = new THREE.MeshBasicMaterial({
        color: '#3A3550',
        side: THREE.DoubleSide,
      });
      const doorSeamGeo = new THREE.PlaneGeometry(0.03, 3.8);
      const doorSeamMat = new THREE.MeshBasicMaterial({
        color: '#E9D392',
        side: THREE.DoubleSide,
      });
      geometries.push(startWallGeo, startTrimGeo, doorReliefGeo, doorSeamGeo);
      materials.push(startWallMat, startTrimMat, doorReliefMat, doorSeamMat);

      const startWallGroup = new THREE.Group();
      {
        const midR = (R + RIN) / 2;
        const wx = midR * Math.cos(TH_START_WALL);
        const wz = midR * Math.sin(TH_START_WALL);
        const tx = Math.sin(TH_START_WALL);
        const tz = -Math.cos(TH_START_WALL);

        startWallGroup.position.set(wx, 0, wz);
        startWallGroup.lookAt(wx + tx, 0, wz + tz);

        const wallMesh = new THREE.Mesh(startWallGeo, startWallMat);
        wallMesh.position.set(0, H / 2, 0);
        startWallGroup.add(wallMesh);

        const baseTrim = new THREE.Mesh(startTrimGeo, startTrimMat);
        baseTrim.position.set(0, 0.09, 0.01);
        startWallGroup.add(baseTrim);

        const doorRelief = new THREE.Mesh(doorReliefGeo, doorReliefMat);
        doorRelief.position.set(0, 1.9, 0.015);
        startWallGroup.add(doorRelief);

        const doorSeam = new THREE.Mesh(doorSeamGeo, doorSeamMat);
        doorSeam.position.set(0, 1.9, 0.02);
        startWallGroup.add(doorSeam);

        scene.add(startWallGroup);
      }

      // Shared print geometries & materials
      const haloGeo = new THREE.PlaneGeometry(2.1 * PW, 1.75 * PH);
      const haloMat = new THREE.MeshBasicMaterial({
        map: haloTex,
        transparent: true,
        depthWrite: false,
        fog: true,
      });
      const shadowGeo = new THREE.PlaneGeometry(1.25 * PW, 1.18 * PH);
      const shadowMat = new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
        fog: true,
      });
      const frameGeo = new THREE.BoxGeometry(PW + 0.07, PH + 0.07, 0.06);
      const frameMat = new THREE.MeshBasicMaterial({ color: '#D3AA72' });
      const printGeo = new THREE.PlaneGeometry(PW, PH);
      const haloGeoLand = new THREE.PlaneGeometry(2.1 * LW, 1.75 * LH);
      const shadowGeoLand = new THREE.PlaneGeometry(1.25 * LW, 1.18 * LH);
      const frameGeoLand = new THREE.BoxGeometry(LW + 0.07, LH + 0.07, 0.06);
      const printGeoLand = new THREE.PlaneGeometry(LW, LH);
      const labelGeo = new THREE.PlaneGeometry(0.92, (0.92 * 260) / 640);

      geometries.push(
        haloGeo,
        shadowGeo,
        frameGeo,
        printGeo,
        haloGeoLand,
        shadowGeoLand,
        frameGeoLand,
        printGeoLand,
        labelGeo,
      );
      materials.push(haloMat, shadowMat, frameMat);

      // Label textures (9 unique prints)
      const labelCanvases: HTMLCanvasElement[] = [];
      const labelMaterials: THREE.MeshBasicMaterial[] = [];
      const redrawAllLabels = (activeLang: Lang) => {
        for (let i = 0; i < PRINTS.length; i++) {
          const artistText = activeLang === 'KOR' ? PRINTS[i].artistKo : PRINTS[i].artist;
          const titleText = activeLang === 'KOR' ? PRINTS[i].titleKo : PRINTS[i].title;
          drawLabelCanvas(
            labelCanvases[i],
            artistText,
            titleText,
            PRINTS[i].year,
            activeLang,
          );
          const tex = labelMaterials[i].map;
          if (tex) tex.needsUpdate = true;
        }
      };

      for (let i = 0; i < PRINTS.length; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 260;
        const initLang = callbacksRef.current.lang;
        drawLabelCanvas(
          canvas,
          initLang === 'KOR' ? PRINTS[i].artistKo : PRINTS[i].artist,
          initLang === 'KOR' ? PRINTS[i].titleKo : PRINTS[i].title,
          PRINTS[i].year,
          initLang,
        );
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        const mat = new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
          depthWrite: false,
        });
        labelCanvases.push(canvas);
        labelMaterials.push(mat);
        textures.push(tex);
        materials.push(mat);
      }

      redrawLabelsRef.current = redrawAllLabels;

      // Print crop materials (9 unique prints, initially solid cream until sheet loads)
      const printMaterials: THREE.MeshBasicMaterial[] = [];
      for (let i = 0; i < PRINTS.length; i++) {
        const mat = new THREE.MeshBasicMaterial({ color: '#FAF1E0' });
        printMaterials.push(mat);
        materials.push(mat);
      }

      const slots: PrintSlotMeta[] = [];
      const clickableMeshes: THREE.Mesh[] = [];
      const meshToSlot = new Map<THREE.Mesh, PrintSlotMeta>();

      const addPrintGroup = (
        wall: 'outer' | 'inner',
        slotIndex: number,
        angle: number,
        printIndex: number,
      ) => {
        const group = new THREE.Group();
        const radius = wall === 'outer' ? 17.98 : 12.22;
        const gx = radius * Math.cos(angle);
        const gz = radius * Math.sin(angle);
        group.position.set(gx, 0, gz);
        if (wall === 'outer') {
          group.lookAt(0, 0, 0);
        } else {
          group.lookAt(2 * gx, 0, 2 * gz);
        }

        const isLand = PRINTS[printIndex]?.frameOrientation === 'landscape';
        const frameW = isLand ? LW : PW;
        const frameH = isLand ? LH : PH;

        const halo = new THREE.Mesh(isLand ? haloGeoLand : haloGeo, haloMat);
        halo.position.set(0, PY + 0.05, 0.005);
        group.add(halo);

        const shadow = new THREE.Mesh(isLand ? shadowGeoLand : shadowGeo, shadowMat);
        shadow.position.set(0.05, PY - 0.06, 0.01);
        group.add(shadow);

        const frame = new THREE.Mesh(isLand ? frameGeoLand : frameGeo, frameMat);
        frame.position.set(0, PY, 0.045);
        group.add(frame);

        const printMesh = new THREE.Mesh(
          isLand ? printGeoLand : printGeo,
          printMaterials[printIndex],
        );
        printMesh.position.set(0, PY, 0.077);
        printMesh.userData.halfW = frameW / 2;
        printMesh.userData.halfH = frameH / 2;
        group.add(printMesh);

        const label = new THREE.Mesh(labelGeo, labelMaterials[printIndex]);
        label.position.set(-frameW / 2 + 0.46, PY - frameH / 2 - 0.42, 0.02);
        group.add(label);

        scene.add(group);

        const meta: PrintSlotMeta = {
          id: `${wall}-${slotIndex}`,
          wall,
          slotIndex,
          printIndex,
          angle,
          mesh: printMesh,
        };
        slots.push(meta);
        clickableMeshes.push(printMesh);
        meshToSlot.set(printMesh, meta);
      };

      for (let s = 0; s < OUTER_COUNT; s++) {
        addPrintGroup('outer', s, -s * STEP, s % PRINTS.length);
      }

      for (let k = 0; k < INNER_COUNT; k++) {
        addPrintGroup(
          'inner',
          k,
          -((k + 0.5) * Math.PI * 2) / INNER_COUNT,
          (k + 4) % PRINTS.length,
        );
      }

      // Camera & Animation state
      const initialD = getWalkOffset();
      const baseWalk = getWalkPose(initialD);
      let targetTh = initialD;
      const pose: CameraPose = {
        th: callbacksRef.current.reducedMotion ? baseWalk.th : initialD + 0.16,
        r: callbacksRef.current.reducedMotion ? baseWalk.r : baseWalk.r - 0.35,
        yaw: baseWalk.yaw,
        y: baseWalk.y,
        pitch: baseWalk.pitch,
      };

      type TweenMode = 'none' | 'intro' | 'focus' | 'walkBack';
      let tweenMode: TweenMode = 'none';
      let tweenElapsed = 0;
      let tweenDuration = 0;
      let tweenStart: CameraPose = { ...pose };
      let tweenEnd: CameraPose = { ...baseWalk };

      let focusedSlot: PrintSlotMeta | null = null;
      let hoveringPrint = false;
      let hoveringFocused = false;
      let lastPointerX = window.innerWidth / 2;
      let lastPointerY = window.innerHeight / 2;

      const applyCameraPose = (p: CameraPose) => {
        const cosTh = Math.cos(p.th);
        const sinTh = Math.sin(p.th);
        const px = p.r * cosTh;
        const py = p.y;
        const pz = p.r * sinTh;

        const tx = sinTh;
        const tz = -cosTh;
        const nx = cosTh;
        const nz = sinTh;

        const cosY = Math.cos(p.yaw);
        const sinY = Math.sin(p.yaw);
        const dx = cosY * tx + sinY * nx;
        const dz = cosY * tz + sinY * nz;

        camera.position.set(px, py, pz);
        camera.lookAt(px + dx, py + p.pitch, pz + dz);
      };

      // Pre-allocated math objects for zero GC in loop
      const raycaster = new THREE.Raycaster();
      const pointerNDC = new THREE.Vector2();
      const _corner = new THREE.Vector3();
      const getProjectedRect = (mesh: THREE.Mesh): ScreenRect => {
        camera.updateMatrixWorld();
        mesh.updateWorldMatrix(true, false);
        const halfW = (mesh.userData.halfW as number | undefined) ?? PW / 2;
        const halfH = (mesh.userData.halfH as number | undefined) ?? PH / 2;
        const corners: ReadonlyArray<[number, number]> = [
          [-halfW, -halfH],
          [halfW, -halfH],
          [halfW, halfH],
          [-halfW, halfH],
        ];
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        const w = window.innerWidth;
        const h = window.innerHeight;
        for (let i = 0; i < 4; i++) {
          _corner.set(corners[i][0], corners[i][1], 0);
          _corner.applyMatrix4(mesh.matrixWorld);
          _corner.project(camera);
          const sx = (_corner.x * 0.5 + 0.5) * w;
          const sy = (-_corner.y * 0.5 + 0.5) * h;
          if (sx < minX) minX = sx;
          if (sx > maxX) maxX = sx;
          if (sy < minY) minY = sy;
          if (sy > maxY) maxY = sy;
        }
        return {
          left: minX,
          top: minY,
          width: maxX - minX,
          height: maxY - minY,
        };
      };

      const startFocusGlide = (slot: PrintSlotMeta) => {
        focusedSlot = slot;
        callbacksRef.current.onFocusChange(slot);

        const endPose = getFocusPose(slot, pose.th);
        targetTh = endPose.th;

        if (callbacksRef.current.reducedMotion) {
          Object.assign(pose, endPose);
          tweenMode = 'none';
          return;
        }

        tweenMode = 'focus';
        tweenElapsed = 0;
        tweenDuration = 0.95;
        tweenStart = { ...pose };
        tweenEnd = endPose;
      };

      const stepBack = () => {
        if (!focusedSlot && tweenMode !== 'focus') return;
        const D = getWalkOffset();
        focusedSlot = null;
        hoveringFocused = false;
        callbacksRef.current.onFocusChange(null);
        callbacksRef.current.onPillChange({ visible: false, x: 0, y: 0 });

        const walkAngle = clampWalkTh(pose.th + D);
        targetTh = walkAngle;
        const endPose = getWalkPose(walkAngle);

        if (callbacksRef.current.reducedMotion) {
          Object.assign(pose, endPose);
          tweenMode = 'none';
          return;
        }

        tweenMode = 'walkBack';
        tweenElapsed = 0;
        tweenDuration = 0.95;
        tweenStart = { ...pose };
        tweenEnd = endPose;
      };

      apiRef.current = {
        stepArrow: (dir) => {
          if (focusedSlot || tweenMode === 'focus') {
            stepBack();
            return;
          }
          const D = getWalkOffset();
          targetTh = clampWalkTh((Math.round((targetTh - D) / STEP) - dir) * STEP + D);
        },
        stepBack,
        focusNearestOuterPrint: (printIndex) => {
          let best: PrintSlotMeta | null = null;
          let bestDist = Infinity;
          for (const slot of slots) {
            if (slot.wall !== 'outer' || slot.printIndex !== printIndex) continue;
            let cand = wrapAngleNear(slot.angle, pose.th);
            if (cand > 0.05) cand -= Math.PI * 2;
            const dist = Math.abs(cand - pose.th);
            if (dist < bestDist) {
              bestDist = dist;
              best = slot;
            }
          }
          if (best) {
            startFocusGlide(best);
          }
        },
        getProjectedRect,
        triggerIntro: () => {
          introRequested = true;
          tryStartIntro();
        },
      };

      // Texture & Font loading + Intro trigger
      let artLoaded = false;
      let fontsLoaded = false;
      let readyNotified = false;
      let introRequested = false;
      let introStarted = false;
      let disposed = false;

      const tryStartIntro = () => {
        if (disposed) return;
        if (!artLoaded || !fontsLoaded) return;

        const D = getWalkOffset();
        const walkEnd = getWalkPose(D);

        if (!readyNotified) {
          readyNotified = true;
          callbacksRef.current.onIntroReady();
          targetTh = D;
          if (!introRequested) {
            Object.assign(pose, {
              ...walkEnd,
              th: D + 0.16,
              r: walkEnd.r - 0.55,
            });
          }
        }

        if (!introRequested || introStarted) return;
        introStarted = true;

        targetTh = D;
        if (callbacksRef.current.reducedMotion) {
          Object.assign(pose, walkEnd);
          tweenMode = 'none';
        } else {
          tweenMode = 'intro';
          tweenElapsed = 0;
          tweenDuration = 1.45;
          tweenStart = {
            ...walkEnd,
            th: D + 0.16,
            r: walkEnd.r - 0.55,
          };
          tweenEnd = walkEnd;
          Object.assign(pose, tweenStart);
        }
      };

      const maxAniso = renderer.capabilities.getMaxAnisotropy();
      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin('anonymous');

      const customPrintIndices = PRINTS.map((p, idx) => (p.customImage ? idx : -1)).filter(
        (idx) => idx >= 0,
      );
      let remainingTextures = 1 + customPrintIndices.length;
      const markTextureDone = () => {
        remainingTextures -= 1;
        if (remainingTextures <= 0) {
          artLoaded = true;
          tryStartIntro();
        }
      };

      loader.load(
        ART_SHEET_URL,
        (sheetTex) => {
          if (disposed) {
            sheetTex.dispose();
            return;
          }
          textures.push(sheetTex);
          for (let i = 0; i < PRINTS.length; i++) {
            if (PRINTS[i].customImage) continue;
            const crop = getPrintCrop(i);
            const tex = sheetTex.clone();
            tex.needsUpdate = true;
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.anisotropy = maxAniso;
            tex.wrapS = THREE.ClampToEdgeWrapping;
            tex.wrapT = THREE.ClampToEdgeWrapping;
            tex.repeat.set(crop.w / SHEET_W, crop.h / SHEET_H);
            tex.offset.set(
              crop.x / SHEET_W,
              1 - (crop.y + crop.h) / SHEET_H,
            );
            textures.push(tex);
            printMaterials[i].color.set('#ffffff');
            printMaterials[i].map = tex;
            printMaterials[i].needsUpdate = true;
          }
          markTextureDone();
        },
        undefined,
        () => {
          markTextureDone();
        },
      );

      for (const idx of customPrintIndices) {
        const customUrl = PRINTS[idx].customImage!;
        const customFit = PRINTS[idx].customImageFit ?? 'cover';
        const customBg = PRINTS[idx].customImageBg ?? '#ffffff';
        const isLand = PRINTS[idx].frameOrientation === 'landscape';
        const frameW = isLand ? LW : PW;
        const frameH = isLand ? LH : PH;
        loader.load(
          customUrl,
          (tex) => {
            if (disposed) {
              tex.dispose();
              return;
            }
            const img = tex.image as HTMLImageElement | undefined;
            if (customFit === 'contain' && img && img.width && img.height) {
              const cw = 1024;
              const ch = Math.round(cw * (frameH / frameW));
              const canvas = document.createElement('canvas');
              canvas.width = cw;
              canvas.height = ch;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.fillStyle = customBg;
                ctx.fillRect(0, 0, cw, ch);
                const scale = Math.min(cw / img.width, ch / img.height);
                const dw = img.width * scale;
                const dh = img.height * scale;
                ctx.drawImage(img, (cw - dw) * 0.5, (ch - dh) * 0.5, dw, dh);
                const canvasTex = new THREE.CanvasTexture(canvas);
                canvasTex.colorSpace = THREE.SRGBColorSpace;
                canvasTex.anisotropy = maxAniso;
                canvasTex.needsUpdate = true;
                tex.dispose();
                textures.push(canvasTex);
                printMaterials[idx].color.set('#ffffff');
                printMaterials[idx].map = canvasTex;
                printMaterials[idx].needsUpdate = true;
                markTextureDone();
                return;
              }
            }

            tex.colorSpace = THREE.SRGBColorSpace;
            tex.anisotropy = maxAniso;
            tex.wrapS = THREE.ClampToEdgeWrapping;
            tex.wrapT = THREE.ClampToEdgeWrapping;

            if (img && img.width && img.height) {
              const planeAspect = frameW / frameH;
              const imgAspect = img.width / img.height;
              if (imgAspect > planeAspect) {
                const repX = planeAspect / imgAspect;
                tex.repeat.set(repX, 1);
                tex.offset.set((1 - repX) * 0.5, 0);
              } else {
                const repY = imgAspect / planeAspect;
                tex.repeat.set(1, repY);
                tex.offset.set(0, (1 - repY) * 0.5);
              }
            }
            tex.needsUpdate = true;
            textures.push(tex);
            printMaterials[idx].color.set('#ffffff');
            printMaterials[idx].map = tex;
            printMaterials[idx].needsUpdate = true;
            markTextureDone();
          },
          undefined,
          () => {
            markTextureDone();
          },
        );
      }

      document.fonts.ready.then(() => {
        if (disposed) return;
        redrawAllLabels(callbacksRef.current.lang);
        fontsLoaded = true;
        tryStartIntro();
      });

      const failsafeTimer = window.setTimeout(() => {
        artLoaded = true;
        fontsLoaded = true;
        tryStartIntro();
      }, 4000);

      // Pointer, Drag, Wheel, Resize events
      let isPointerDown = false;
      let isDragging = false;
      let downX = 0;
      let downY = 0;
      let downAngle = 0;
      let lastHoverCheck = 0;

      const updateHover = (clientX: number, clientY: number) => {
        lastPointerX = clientX;
        lastPointerY = clientY;
        if (callbacksRef.current.suspended || isDragging) return;
        pointerNDC.x = (clientX / window.innerWidth) * 2 - 1;
        pointerNDC.y = -(clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(pointerNDC, camera);
        const hits = raycaster.intersectObjects(clickableMeshes, false);
        const hitMesh = hits.length > 0 ? (hits[0].object as THREE.Mesh) : null;
        const nextHovering = hitMesh !== null;
        if (nextHovering !== hoveringPrint) {
          hoveringPrint = nextHovering;
          callbacksRef.current.onHoverChange(nextHovering);
        }

        if (focusedSlot && !isSmallScreen()) {
          const isOverFocused = hitMesh === focusedSlot.mesh;
          hoveringFocused = isOverFocused;
          callbacksRef.current.onPillChange({
            visible: isOverFocused,
            x: clientX,
            y: clientY,
          });
        } else if (!focusedSlot) {
          hoveringFocused = false;
          callbacksRef.current.onPillChange({ visible: false, x: 0, y: 0 });
        }
      };

      const onPointerDown = (e: PointerEvent) => {
        if (callbacksRef.current.suspended) return;
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        isPointerDown = true;
        isDragging = false;
        downX = e.clientX;
        downY = e.clientY;
        downAngle = targetTh;
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;
        container.setPointerCapture(e.pointerId);
      };

      const onPointerMove = (e: PointerEvent) => {
        if (callbacksRef.current.suspended) return;
        if (isPointerDown) {
          const dx = e.clientX - downX;
          const dy = e.clientY - downY;
          if (!isDragging && Math.hypot(dx, dy) > 6) {
            isDragging = true;
            callbacksRef.current.onDragChange(true);
            if (focusedSlot || tweenMode === 'focus') {
              stepBack();
              downAngle = targetTh;
            }
          }
          if (isDragging) {
            const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy;
            const rate = isSmallScreen() ? 0.0042 : 0.0022;
            targetTh = clampWalkTh(downAngle + delta * rate);
            return;
          }
        }

        const now = performance.now();
        if (now - lastHoverCheck >= 16) {
          lastHoverCheck = now;
          updateHover(e.clientX, e.clientY);
        }
      };

      const onPointerUp = (e: PointerEvent) => {
        if (!isPointerDown) return;
        isPointerDown = false;
        if (container.hasPointerCapture(e.pointerId)) {
          container.releasePointerCapture(e.pointerId);
        }
        const wasDragging = isDragging;
        isDragging = false;
        callbacksRef.current.onDragChange(false);

        if (wasDragging || callbacksRef.current.suspended) return;

        // Click without dragging: raycast print planes
        pointerNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
        pointerNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(pointerNDC, camera);
        const hits = raycaster.intersectObjects(clickableMeshes, false);

        if (hits.length > 0) {
          const hitMesh = hits[0].object as THREE.Mesh;
          const slot = meshToSlot.get(hitMesh);
          if (slot) {
            if (focusedSlot && focusedSlot.id === slot.id) {
              const rect = getProjectedRect(slot.mesh);
              callbacksRef.current.onOpenPrint(slot.printIndex, rect);
            } else {
              startFocusGlide(slot);
            }
            return;
          }
        }

        if (focusedSlot) {
          stepBack();
        }
      };

      const onWheel = (e: WheelEvent) => {
        if (callbacksRef.current.suspended) return;
        e.preventDefault();
        if (focusedSlot || tweenMode === 'focus') {
          stepBack();
        }
        const dy = e.deltaMode === 1 ? e.deltaY * 33 : e.deltaY;
        targetTh = clampWalkTh(targetTh - dy * 0.0016);
      };

      const onResize = () => {
        camera.fov = getFov();
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(
          isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2),
        );
        renderer.setSize(window.innerWidth, window.innerHeight);
        if (tweenMode === 'none') {
          if (focusedSlot) {
            const p = getFocusPose(focusedSlot, pose.th);
            Object.assign(pose, p);
          } else {
            const p = getWalkPose(pose.th);
            Object.assign(pose, p);
          }
        }
      };

      const onContextLost = (e: Event) => {
        e.preventDefault();
      };

      container.addEventListener('pointerdown', onPointerDown);
      container.addEventListener('pointermove', onPointerMove);
      container.addEventListener('pointerup', onPointerUp);
      container.addEventListener('pointercancel', onPointerUp);
      container.addEventListener('wheel', onWheel, { passive: false });
      window.addEventListener('resize', onResize);
      renderer.domElement.addEventListener('webglcontextlost', onContextLost);

      // Animation loop
      let lastTime = performance.now();
      let frameId = 0;

      const afterDraw = (cb: () => void) => {
        const gl = renderer.getContext() as WebGL2RenderingContext;
        if (!gl || typeof gl.fenceSync !== 'function') {
          frameId = window.setTimeout(cb, 80);
          return;
        }
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (disposed) return;
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(() => requestAnimationFrame(cb), 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      };

      let lastAtStart = true;

      const tick = (now: number) => {
        if (disposed) return;
        const dt = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

        if (!callbacksRef.current.suspended) {
          if (tweenMode === 'intro') {
            tweenElapsed += dt;
            const rawT =
              tweenDuration > 0 ? Math.min(tweenElapsed / tweenDuration, 1) : 1;
            const e = rawT === 1 ? 1 : 1 - Math.pow(2, -10 * rawT);
            pose.th = tweenStart.th + (tweenEnd.th - tweenStart.th) * e;
            pose.r = tweenStart.r + (tweenEnd.r - tweenStart.r) * e;
            pose.yaw = tweenStart.yaw + (tweenEnd.yaw - tweenStart.yaw) * e;
            pose.y = tweenStart.y + (tweenEnd.y - tweenStart.y) * e;
            pose.pitch = tweenStart.pitch + (tweenEnd.pitch - tweenStart.pitch) * e;
            if (rawT >= 1) {
              tweenMode = 'none';
            }
          } else if (tweenMode === 'focus' || tweenMode === 'walkBack') {
            tweenElapsed += dt;
            const rawT =
              tweenDuration > 0 ? Math.min(tweenElapsed / tweenDuration, 1) : 1;
            const eTh = 1 - Math.pow(1 - rawT, 4);
            const eYaw = 1 - Math.pow(1 - rawT, 2);
            const eCub = 1 - Math.pow(1 - rawT, 3);
            pose.th = tweenStart.th + (tweenEnd.th - tweenStart.th) * eTh;
            pose.yaw = tweenStart.yaw + (tweenEnd.yaw - tweenStart.yaw) * eYaw;
            pose.r = tweenStart.r + (tweenEnd.r - tweenStart.r) * eCub;
            pose.y = tweenStart.y + (tweenEnd.y - tweenStart.y) * eCub;
            pose.pitch =
              tweenStart.pitch + (tweenEnd.pitch - tweenStart.pitch) * eCub;
            if (rawT >= 1) {
              tweenMode = 'none';
            }
          } else if (!focusedSlot) {
            if (callbacksRef.current.reducedMotion) {
              pose.th = targetTh;
            } else {
              const alpha = 1 - Math.exp(-dt / 0.36);
              pose.th += (targetTh - pose.th) * alpha;
            }
            const walkP = getWalkPose(pose.th);
            pose.r = walkP.r;
            pose.yaw = walkP.yaw;
            pose.y = walkP.y;
            pose.pitch = walkP.pitch;
          }

          startWallGroup.visible = pose.th > TH_START_WALL - Math.PI * 1.15;

          applyCameraPose(pose);
          renderer.render(scene, camera);

          const atStart = targetTh >= getWalkMax() - 0.025;
          if (atStart !== lastAtStart) {
            lastAtStart = atStart;
            callbacksRef.current.onStartBoundChange?.(atStart);
          }

          if (focusedSlot && isSmallScreen()) {
            const rect = getProjectedRect(focusedSlot.mesh);
            callbacksRef.current.onPillChange({
              visible: true,
              x: rect.left + rect.width * 0.5,
              y: rect.top + rect.height * 0.55,
            });
          } else if (focusedSlot && hoveringFocused) {
            callbacksRef.current.onPillChange({
              visible: true,
              x: lastPointerX,
              y: lastPointerY,
            });
          }
        }

        if (isSoftwareGl) {
          afterDraw(() => requestAnimationFrame(tick));
        } else {
          frameId = requestAnimationFrame(tick);
        }
      };

      applyCameraPose(pose);
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);

      return () => {
        disposed = true;
        window.clearTimeout(failsafeTimer);
        cancelAnimationFrame(frameId);
        window.clearTimeout(frameId);
        container.removeEventListener('pointerdown', onPointerDown);
        container.removeEventListener('pointermove', onPointerMove);
        container.removeEventListener('pointerup', onPointerUp);
        container.removeEventListener('pointercancel', onPointerUp);
        container.removeEventListener('wheel', onWheel);
        window.removeEventListener('resize', onResize);
        renderer.domElement.removeEventListener('webglcontextlost', onContextLost);

        for (const g of geometries) g.dispose();
        for (const m of materials) m.dispose();
        for (const t of textures) t.dispose();
        renderer.dispose();
        redrawLabelsRef.current = null;
        if (renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }
      };
    }, []);

    useEffect(() => {
      redrawLabelsRef.current?.(lang);
    }, [lang]);

    return <div ref={mountRef} className="w-full h-full" />;
  },
);

Gallery3D.displayName = 'Gallery3D';
