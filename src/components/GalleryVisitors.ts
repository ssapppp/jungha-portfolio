import * as THREE from 'three';

export type VisitorArchetype =
  | 'handsBehind'
  | 'brochure'
  | 'contemplative'
  | 'toteBag'
  | 'stroller'
  | 'conversingA'
  | 'conversingB';

export type ChameleonCamoKind =
  | 'outerWall'
  | 'innerPillar'
  | 'goldFrame'
  | 'floor'
  | 'pastelArt';

export type ChameleonPose =
  | 'wallFlat'
  | 'pillarPeek'
  | 'frameMime'
  | 'floorCrouch'
  | 'artBlend'
  | 'pillarLean';

export interface VisitorPlacement {
  angle: number;
  radius: number;
  facingAngle: number;
  scale: number;
  archetype: VisitorArchetype;
  toneIndex: number;
  walkSpeed?: number;
  walkSpan?: number;
  phase: number;
}

export interface ChameleonPlacement {
  id: string;
  angle: number;
  radius: number;
  facingAngle: number;
  scale: number;
  camo: ChameleonCamoKind;
  pose: ChameleonPose;
  revealedPrimary: string;
  revealedSecondary: string;
  revealedAccent: string;
  phase: number;
}

export interface VisitorActor {
  group: THREE.Group;
  shadow: THREE.Mesh;
  headGroup: THREE.Group;
  torsoGroup: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  materials: THREE.MeshBasicMaterial[];
  shadowMaterial: THREE.MeshBasicMaterial;
  baseAngle: number;
  currentAngle: number;
  radius: number;
  facingAngle: number;
  archetype: VisitorArchetype;
  walkSpeed: number;
  walkSpan: number;
  phase: number;
  fadeAlpha: number;
}

export interface ChameleonHider {
  id: string;
  group: THREE.Group;
  bodyRoot: THREE.Group;
  shadow: THREE.Mesh;
  headGroup: THREE.Group;
  torsoGroup: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  eyesGroup: THREE.Group;
  revealRing: THREE.Mesh;
  revealRingMat: THREE.MeshBasicMaterial;
  primaryMat: THREE.MeshStandardMaterial;
  secondaryMat: THREE.MeshStandardMaterial;
  accentMat: THREE.MeshStandardMaterial;
  eyeMat: THREE.MeshBasicMaterial;
  shadowMaterial: THREE.MeshBasicMaterial;
  camoTex: THREE.CanvasTexture;
  revealedPrimary: THREE.Color;
  revealedSecondary: THREE.Color;
  revealedAccent: THREE.Color;
  hitMeshes: THREE.Mesh[];
  angle: number;
  pose: ChameleonPose;
  phase: number;
  found: boolean;
  revealAnim: number;
  fadeAlpha: number;
}

export interface ChameleonStatus {
  found: number;
  total: number;
}

export interface VisitorSystem {
  actors: VisitorActor[];
  chameleons: ChameleonHider[];
  chameleonMeshes: THREE.Mesh[];
  handleChameleonClick: (mesh: THREE.Mesh) => {
    matched: boolean;
    newlyFound: boolean;
    status: ChameleonStatus;
  };
  isUnfoundChameleonMesh: (mesh: THREE.Mesh) => boolean;
  resetChameleons: () => ChameleonStatus;
  getChameleonStatus: () => ChameleonStatus;
  update: (
    elapsed: number,
    dt: number,
    reducedMotion: boolean,
    focusedAngle: number | null,
  ) => void;
  dispose: () => void;
}

const OUTER_STEP = (Math.PI * 2) / 36;
const INNER_STEP = (Math.PI * 2) / 24;

const INK_PALETTE: ReadonlyArray<{
  primary: string;
  secondary: string;
  accent: string;
}> = [
  { primary: '#3A3550', secondary: '#4A4463', accent: '#5E577A' },
  { primary: '#443E5C', secondary: '#554E70', accent: '#6B6387' },
  { primary: '#35304A', secondary: '#46405E', accent: '#5A5374' },
  { primary: '#4C4564', secondary: '#5D5677', accent: '#726A8D' },
];

// Atmospheric gallery visitors (dark ink silhouettes)
const CURATED_VISITORS: ReadonlyArray<VisitorPlacement> = [
  {
    angle: -0.58,
    radius: 14.1,
    facingAngle: -0.58 + Math.PI - 0.1,
    scale: 0.96,
    archetype: 'toteBag',
    toneIndex: 1,
    phase: 1.7,
  },
  {
    angle: -1.88,
    radius: 16.3,
    facingAngle: -1.88 + 0.38,
    scale: 1.01,
    archetype: 'conversingA',
    toneIndex: 0,
    phase: 0.9,
  },
  {
    angle: -1.93,
    radius: 16.25,
    facingAngle: -1.93 - 0.46,
    scale: 0.95,
    archetype: 'conversingB',
    toneIndex: 3,
    phase: 2.1,
  },
  {
    angle: -2.75,
    radius: 14.45,
    facingAngle: 0,
    scale: 0.98,
    archetype: 'stroller',
    toneIndex: 1,
    walkSpeed: 0.046,
    walkSpan: 0.24,
    phase: 0.2,
  },
  {
    angle: 0.95,
    radius: 14.45,
    facingAngle: 0,
    scale: 1.0,
    archetype: 'stroller',
    toneIndex: 0,
    walkSpeed: 0.04,
    walkSpan: 0.22,
    phase: 3.3,
  },
];

// Meccha Chameleon-inspired hidden figures camouflaged into walls, pillar, floor, and frames
const CHAMELEON_HIDERS: ReadonlyArray<ChameleonPlacement> = [
  {
    id: 'chameleon-wall-1',
    // Visible from initial hero vista, pressed flat against outer cream wall between artworks
    angle: -1.5 * OUTER_STEP,
    radius: 17.75,
    facingAngle: -1.5 * OUTER_STEP + Math.PI,
    scale: 0.98,
    camo: 'outerWall',
    pose: 'wallFlat',
    revealedPrimary: '#F28C7D',
    revealedSecondary: '#3A3550',
    revealedAccent: '#FBE46D',
    phase: 0.5,
  },
  {
    id: 'chameleon-pillar-1',
    // Peeking slightly from the inner cream pillar between inner prints
    angle: -3 * INNER_STEP,
    radius: 12.42,
    facingAngle: -3 * INNER_STEP - 0.25,
    scale: 0.95,
    camo: 'innerPillar',
    pose: 'pillarPeek',
    revealedPrimary: '#6EB9B1',
    revealedSecondary: '#3A3550',
    revealedAccent: '#FBE46D',
    phase: 1.4,
  },
  {
    id: 'chameleon-frame-1',
    // Camouflaged half oak-frame gold / half wall-cream beside a frame, holding a rectangular pose
    angle: -7.5 * OUTER_STEP,
    radius: 17.72,
    facingAngle: -7.5 * OUTER_STEP + Math.PI,
    scale: 1.0,
    camo: 'goldFrame',
    pose: 'frameMime',
    revealedPrimary: '#FBE46D',
    revealedSecondary: '#3A3550',
    revealedAccent: '#F28C7D',
    phase: 2.3,
  },
  {
    id: 'chameleon-floor-1',
    // Crouched low on the warm sandy floor blending into the radial floor gradient
    angle: 13.5 * OUTER_STEP,
    radius: 15.15,
    facingAngle: 13.5 * OUTER_STEP + 0.5,
    scale: 0.96,
    camo: 'floor',
    pose: 'floorCrouch',
    revealedPrimary: '#7C88C4',
    revealedSecondary: '#3A3550',
    revealedAccent: '#F7D2D1',
    phase: 3.1,
  },
  {
    id: 'chameleon-art-1',
    // Painted with soft pastel art stripes blending next to an outer artwork
    angle: 7.5 * OUTER_STEP,
    radius: 17.74,
    facingAngle: 7.5 * OUTER_STEP + Math.PI + 0.12,
    scale: 0.99,
    camo: 'pastelArt',
    pose: 'artBlend',
    revealedPrimary: '#E89B82',
    revealedSecondary: '#3A3550',
    revealedAccent: '#FCEB93',
    phase: 4.0,
  },
  {
    id: 'chameleon-pillar-2',
    // Leaning into the inner pillar trying to become one with the column
    angle: -9 * INNER_STEP,
    radius: 12.44,
    facingAngle: -9 * INNER_STEP + Math.PI,
    scale: 0.97,
    camo: 'innerPillar',
    pose: 'pillarLean',
    revealedPrimary: '#86B68B',
    revealedSecondary: '#3A3550',
    revealedAccent: '#FBE46D',
    phase: 5.2,
  },
];

function wrapAngleDiff(a: number, b: number): number {
  let diff = a - b;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

function createCamoTexture(kind: ChameleonCamoKind): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  if (kind === 'outerWall') {
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#F6ECD9');
    grad.addColorStop(0.35, '#FBF3E3');
    grad.addColorStop(0.75, '#F8EDD9');
    grad.addColorStop(1, '#EFDFC4');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  } else if (kind === 'innerPillar') {
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#F7EEDD');
    grad.addColorStop(0.4, '#FFFAF0');
    grad.addColorStop(0.8, '#FDF5E6');
    grad.addColorStop(1, '#F1E1C6');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  } else if (kind === 'floor') {
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#F3E1C3');
    grad.addColorStop(0.6, '#EFDAB8');
    grad.addColorStop(1, '#EDD6B0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  } else if (kind === 'goldFrame') {
    ctx.fillStyle = '#FBF3E3';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#D3AA72';
    ctx.fillRect(0, 0, 122, 256);
    ctx.fillStyle = '#E5C697';
    ctx.fillRect(114, 0, 16, 256);
  } else {
    // pastelArt: warm wall cream with subtle painted geometric bands
    ctx.fillStyle = '#FBF3E3';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = 'rgba(251, 228, 109, 0.42)';
    ctx.fillRect(0, 40, 256, 48);
    ctx.fillStyle = 'rgba(247, 210, 209, 0.48)';
    ctx.fillRect(0, 118, 256, 54);
    ctx.fillStyle = 'rgba(211, 170, 114, 0.35)';
    ctx.fillRect(0, 198, 256, 36);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export function createGalleryVisitors(
  scene: THREE.Scene,
  shadowTex: THREE.Texture,
): VisitorSystem {
  const sharedGeometries: THREE.BufferGeometry[] = [];
  const ownMaterials: THREE.Material[] = [];
  const ownTextures: THREE.Texture[] = [];

  // Organic coat torso via LatheGeometry
  const coatPoints = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.165, 0.01),
    new THREE.Vector2(0.155, 0.14),
    new THREE.Vector2(0.132, 0.28),
    new THREE.Vector2(0.15, 0.42),
    new THREE.Vector2(0.142, 0.51),
    new THREE.Vector2(0.068, 0.55),
    new THREE.Vector2(0.0, 0.56),
  ];
  const coatTorsoGeo = new THREE.LatheGeometry(coatPoints, 20);
  coatTorsoGeo.scale(1.08, 1.0, 0.72);

  const jacketPoints = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.135, 0.01),
    new THREE.Vector2(0.128, 0.13),
    new THREE.Vector2(0.135, 0.27),
    new THREE.Vector2(0.152, 0.41),
    new THREE.Vector2(0.138, 0.48),
    new THREE.Vector2(0.065, 0.52),
    new THREE.Vector2(0.0, 0.53),
  ];
  const jacketTorsoGeo = new THREE.LatheGeometry(jacketPoints, 20);
  jacketTorsoGeo.scale(1.06, 1.0, 0.7);

  const pelvisGeo = new THREE.CylinderGeometry(0.128, 0.136, 0.14, 16);
  pelvisGeo.scale(1.08, 1.0, 0.74);

  const neckGeo = new THREE.CylinderGeometry(0.044, 0.052, 0.1, 14);
  const headGeo = new THREE.SphereGeometry(0.098, 20, 16);
  headGeo.scale(0.92, 1.1, 0.98);

  const hairBunGeo = new THREE.SphereGeometry(0.046, 14, 12);
  const beretGeo = new THREE.CylinderGeometry(0.095, 0.105, 0.038, 18);
  const scarfGeo = new THREE.TorusGeometry(0.072, 0.024, 10, 20);
  scarfGeo.rotateX(Math.PI / 2);

  const upperLimbGeo = new THREE.CylinderGeometry(0.042, 0.036, 0.26, 12);
  const lowerLimbGeo = new THREE.CylinderGeometry(0.035, 0.027, 0.24, 12);
  const handGeo = new THREE.SphereGeometry(0.03, 10, 10);

  const thighGeo = new THREE.CylinderGeometry(0.062, 0.05, 0.4, 14);
  const calfGeo = new THREE.CylinderGeometry(0.048, 0.034, 0.4, 14);
  const shoeGeo = new THREE.BoxGeometry(0.076, 0.055, 0.16);

  const toteGeo = new THREE.BoxGeometry(0.06, 0.26, 0.24);
  const toteStrapGeo = new THREE.TorusGeometry(0.12, 0.011, 8, 18, Math.PI);
  const brochureGeo = new THREE.BoxGeometry(0.15, 0.2, 0.012);
  const shadowGeo = new THREE.PlaneGeometry(0.95, 0.95);

  const eyeGeo = new THREE.SphereGeometry(0.014, 10, 10);
  const revealRingGeo = new THREE.RingGeometry(0.28, 0.36, 32);
  revealRingGeo.rotateX(-Math.PI / 2);

  sharedGeometries.push(
    coatTorsoGeo,
    jacketTorsoGeo,
    pelvisGeo,
    neckGeo,
    headGeo,
    hairBunGeo,
    beretGeo,
    scarfGeo,
    upperLimbGeo,
    lowerLimbGeo,
    handGeo,
    thighGeo,
    calfGeo,
    shoeGeo,
    toteGeo,
    toteStrapGeo,
    brochureGeo,
    shadowGeo,
    eyeGeo,
    revealRingGeo,
  );

  // 1. Build atmospheric dark-silhouette gallery visitors
  const actors: VisitorActor[] = [];

  for (const cfg of CURATED_VISITORS) {
    const tone = INK_PALETTE[cfg.toneIndex % INK_PALETTE.length];
    const primaryMat = new THREE.MeshBasicMaterial({
      color: tone.primary,
      fog: true,
    });
    const secondaryMat = new THREE.MeshBasicMaterial({
      color: tone.secondary,
      fog: true,
    });
    const accentMat = new THREE.MeshBasicMaterial({
      color: tone.accent,
      fog: true,
    });
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      fog: true,
    });

    ownMaterials.push(primaryMat, secondaryMat, accentMat, shadowMat);

    const group = new THREE.Group();
    group.scale.setScalar(cfg.scale);

    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.008;
    group.add(shadow);

    const buildLeg = (xOffset: number) => {
      const leg = new THREE.Group();
      leg.position.set(xOffset, 0.86, 0);

      const thigh = new THREE.Mesh(thighGeo, secondaryMat);
      thigh.position.y = -0.2;
      leg.add(thigh);

      const calf = new THREE.Mesh(calfGeo, secondaryMat);
      calf.position.y = -0.6;
      leg.add(calf);

      const shoe = new THREE.Mesh(shoeGeo, primaryMat);
      shoe.position.set(0, -0.832, 0.032);
      leg.add(shoe);

      return leg;
    };

    const leftLeg = buildLeg(-0.082);
    const rightLeg = buildLeg(0.082);
    group.add(leftLeg, rightLeg);

    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, 0.86, 0);
    group.add(torsoGroup);

    const pelvis = new THREE.Mesh(pelvisGeo, secondaryMat);
    pelvis.position.y = 0.04;
    torsoGroup.add(pelvis);

    const usesCoat =
      cfg.archetype === 'toteBag' || cfg.archetype === 'conversingB';
    const torsoMesh = new THREE.Mesh(
      usesCoat ? coatTorsoGeo : jacketTorsoGeo,
      primaryMat,
    );
    torsoMesh.position.y = usesCoat ? -0.02 : 0.05;
    torsoGroup.add(torsoMesh);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.54, 0.01);
    torsoGroup.add(headGroup);

    const neck = new THREE.Mesh(neckGeo, secondaryMat);
    neck.position.y = 0.04;
    headGroup.add(neck);

    const head = new THREE.Mesh(headGeo, primaryMat);
    head.position.y = 0.16;
    headGroup.add(head);

    if (cfg.archetype === 'toteBag' || cfg.archetype === 'conversingB') {
      const bun = new THREE.Mesh(hairBunGeo, primaryMat);
      bun.position.set(0, 0.21, -0.095);
      headGroup.add(bun);
    }

    const buildArm = (xOffset: number) => {
      const arm = new THREE.Group();
      arm.position.set(xOffset, 0.48, 0);

      const upper = new THREE.Mesh(upperLimbGeo, primaryMat);
      upper.position.y = -0.13;
      arm.add(upper);

      const forearmPivot = new THREE.Group();
      forearmPivot.position.y = -0.25;
      arm.add(forearmPivot);

      const lower = new THREE.Mesh(lowerLimbGeo, primaryMat);
      lower.position.y = -0.12;
      forearmPivot.add(lower);

      const hand = new THREE.Mesh(handGeo, secondaryMat);
      hand.position.y = -0.25;
      forearmPivot.add(hand);

      arm.userData.forearmPivot = forearmPivot;
      return arm;
    };

    const leftArm = buildArm(-0.195);
    const rightArm = buildArm(0.195);
    torsoGroup.add(leftArm, rightArm);

    const leftForearm = leftArm.userData.forearmPivot as THREE.Group;
    const rightForearm = rightArm.userData.forearmPivot as THREE.Group;

    if (cfg.archetype === 'toteBag') {
      leftArm.rotation.set(-0.05, 0, -0.06);
      rightArm.rotation.set(0.06, 0, 0.06);

      const tote = new THREE.Mesh(toteGeo, accentMat);
      tote.position.set(-0.2, 0.1, -0.02);
      torsoGroup.add(tote);

      const strap = new THREE.Mesh(toteStrapGeo, accentMat);
      strap.rotation.y = Math.PI / 2;
      strap.position.set(-0.17, 0.36, -0.01);
      torsoGroup.add(strap);
      headGroup.rotation.x = -0.1;
    } else if (cfg.archetype === 'conversingA') {
      leftArm.rotation.set(-0.08, 0, -0.06);
      rightArm.rotation.set(-0.56, 0.18, 0.22);
      rightForearm.rotation.set(-0.78, 0, -0.12);
      headGroup.rotation.set(-0.06, -0.24, 0);
    } else if (cfg.archetype === 'conversingB') {
      leftArm.rotation.set(-0.18, 0, -0.08);
      leftForearm.rotation.set(-0.85, 0, 0.35);
      rightArm.rotation.set(-0.06, 0, 0.06);
      headGroup.rotation.set(-0.08, 0.3, 0.04);
    }

    group.position.set(
      cfg.radius * Math.cos(cfg.angle),
      0,
      cfg.radius * Math.sin(cfg.angle),
    );
    group.lookAt(
      cfg.radius * Math.cos(cfg.angle) + Math.cos(cfg.facingAngle),
      0,
      cfg.radius * Math.sin(cfg.angle) + Math.sin(cfg.facingAngle),
    );

    scene.add(group);

    actors.push({
      group,
      shadow,
      headGroup,
      torsoGroup,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      materials: [primaryMat, secondaryMat, accentMat],
      shadowMaterial: shadowMat,
      baseAngle: cfg.angle,
      currentAngle: cfg.angle,
      radius: cfg.radius,
      facingAngle: cfg.facingAngle,
      archetype: cfg.archetype,
      walkSpeed: cfg.walkSpeed ?? 0,
      walkSpan: cfg.walkSpan ?? 0,
      phase: cfg.phase,
      fadeAlpha: 1,
    });
  }

  // 2. Build Meccha Chameleon-style camouflaged hidden figures
  const camoTextures: Record<ChameleonCamoKind, THREE.CanvasTexture> = {
    outerWall: createCamoTexture('outerWall'),
    innerPillar: createCamoTexture('innerPillar'),
    goldFrame: createCamoTexture('goldFrame'),
    floor: createCamoTexture('floor'),
    pastelArt: createCamoTexture('pastelArt'),
  };
  ownTextures.push(...Object.values(camoTextures));

  const chameleons: ChameleonHider[] = [];
  const chameleonMeshes: THREE.Mesh[] = [];
  const meshToChameleon = new Map<THREE.Mesh, ChameleonHider>();

  for (const cfg of CHAMELEON_HIDERS) {
    const camoTex = camoTextures[cfg.camo];
    const makeCamoMat = () =>
      new THREE.MeshStandardMaterial({
        color: '#ffffff',
        map: camoTex,
        emissive: '#ffffff',
        emissiveMap: camoTex,
        emissiveIntensity: 0.62,
        roughness: 0.94,
        metalness: 0.0,
        fog: true,
      });

    const primaryMat = makeCamoMat();
    const secondaryMat = makeCamoMat();
    const accentMat = makeCamoMat();
    const eyeMat = new THREE.MeshBasicMaterial({
      color: '#3A3550',
      fog: true,
    });
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
      fog: true,
    });
    const revealRingMat = new THREE.MeshBasicMaterial({
      color: cfg.revealedAccent,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
      fog: true,
    });

    ownMaterials.push(
      primaryMat,
      secondaryMat,
      accentMat,
      eyeMat,
      shadowMat,
      revealRingMat,
    );

    const group = new THREE.Group();
    group.scale.setScalar(cfg.scale);

    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.008;
    group.add(shadow);

    const revealRing = new THREE.Mesh(revealRingGeo, revealRingMat);
    revealRing.position.y = 0.02;
    revealRing.visible = false;
    group.add(revealRing);

    const bodyRoot = new THREE.Group();
    group.add(bodyRoot);

    const hitMeshes: THREE.Mesh[] = [];
    const registerHit = (m: THREE.Mesh) => {
      m.userData.chameleonId = cfg.id;
      hitMeshes.push(m);
      chameleonMeshes.push(m);
      return m;
    };

    const buildChameleonLeg = (xOffset: number) => {
      const leg = new THREE.Group();
      leg.position.set(xOffset, 0.86, 0);

      const thigh = registerHit(new THREE.Mesh(thighGeo, secondaryMat));
      thigh.position.y = -0.2;
      leg.add(thigh);

      const calfPivot = new THREE.Group();
      calfPivot.position.y = -0.4;
      leg.add(calfPivot);

      const calf = registerHit(new THREE.Mesh(calfGeo, secondaryMat));
      calf.position.y = -0.2;
      calfPivot.add(calf);

      const shoe = registerHit(new THREE.Mesh(shoeGeo, primaryMat));
      shoe.position.set(0, -0.432, 0.032);
      calfPivot.add(shoe);

      leg.userData.calfPivot = calfPivot;
      return leg;
    };

    const leftLeg = buildChameleonLeg(-0.082);
    const rightLeg = buildChameleonLeg(0.082);
    bodyRoot.add(leftLeg, rightLeg);

    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, 0.86, 0);
    bodyRoot.add(torsoGroup);

    const pelvis = registerHit(new THREE.Mesh(pelvisGeo, secondaryMat));
    pelvis.position.y = 0.04;
    torsoGroup.add(pelvis);

    const torsoMesh = registerHit(new THREE.Mesh(jacketTorsoGeo, primaryMat));
    torsoMesh.position.y = 0.05;
    torsoGroup.add(torsoMesh);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.54, 0.01);
    torsoGroup.add(headGroup);

    const neck = registerHit(new THREE.Mesh(neckGeo, secondaryMat));
    neck.position.y = 0.04;
    headGroup.add(neck);

    const head = registerHit(new THREE.Mesh(headGeo, primaryMat));
    head.position.y = 0.16;
    headGroup.add(head);

    // Expressive eyes (hidden during camouflage, revealed when spotted!)
    const eyesGroup = new THREE.Group();
    eyesGroup.position.set(0, 0.165, 0.088);
    eyesGroup.visible = false;
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.x = -0.032;
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.x = 0.032;
    eyesGroup.add(leftEye, rightEye);
    headGroup.add(eyesGroup);

    if (cfg.pose === 'frameMime' || cfg.pose === 'artBlend') {
      const beret = registerHit(new THREE.Mesh(beretGeo, accentMat));
      beret.position.set(-0.01, 0.245, -0.01);
      beret.rotation.z = 0.16;
      headGroup.add(beret);
    }

    const buildChameleonArm = (xOffset: number) => {
      const arm = new THREE.Group();
      arm.position.set(xOffset, 0.48, 0);

      const upper = registerHit(new THREE.Mesh(upperLimbGeo, primaryMat));
      upper.position.y = -0.13;
      arm.add(upper);

      const forearmPivot = new THREE.Group();
      forearmPivot.position.y = -0.25;
      arm.add(forearmPivot);

      const lower = registerHit(new THREE.Mesh(lowerLimbGeo, primaryMat));
      lower.position.y = -0.12;
      forearmPivot.add(lower);

      const hand = registerHit(new THREE.Mesh(handGeo, accentMat));
      hand.position.y = -0.25;
      forearmPivot.add(hand);

      arm.userData.forearmPivot = forearmPivot;
      return arm;
    };

    const leftArm = buildChameleonArm(-0.195);
    const rightArm = buildChameleonArm(0.195);
    torsoGroup.add(leftArm, rightArm);

    const applyCamoPose = (
      hPose: ChameleonPose,
      lArm: THREE.Group,
      rArm: THREE.Group,
      lLeg: THREE.Group,
      rLeg: THREE.Group,
      tGroup: THREE.Group,
      hGroup: THREE.Group,
      bRoot: THREE.Group,
    ) => {
      const lForearm = lArm.userData.forearmPivot as THREE.Group;
      const rForearm = rArm.userData.forearmPivot as THREE.Group;
      const lCalf = lLeg.userData.calfPivot as THREE.Group;
      const rCalf = rLeg.userData.calfPivot as THREE.Group;

      bRoot.position.set(0, 0, 0);
      tGroup.position.set(0, 0.86, 0);
      tGroup.rotation.set(0, 0, 0);
      lArm.rotation.set(0, 0, 0);
      rArm.rotation.set(0, 0, 0);
      lForearm.rotation.set(0, 0, 0);
      rForearm.rotation.set(0, 0, 0);
      lLeg.rotation.set(0, 0, 0);
      rLeg.rotation.set(0, 0, 0);
      lCalf.rotation.set(0, 0, 0);
      rCalf.rotation.set(0, 0, 0);
      hGroup.rotation.set(0, 0, 0);

      if (hPose === 'wallFlat') {
        // Flattened stiffly against wall like a sculpture relief
        lArm.rotation.set(0, 0, 0.04);
        rArm.rotation.set(0, 0, -0.04);
        hGroup.rotation.set(0, 0.14, 0);
      } else if (hPose === 'pillarPeek') {
        // Leaning sideways peeking around the pillar
        tGroup.rotation.z = -0.14;
        lArm.rotation.set(-0.2, 0, -0.2);
        rArm.rotation.set(-0.4, 0, 0.16);
        rForearm.rotation.set(-0.7, 0, 0);
        hGroup.rotation.set(0, 0.25, -0.08);
      } else if (hPose === 'frameMime') {
        // Arms raised at right angles mimicking a picture frame
        lArm.rotation.set(0, 0, -1.45);
        lForearm.rotation.set(0, 0, 1.45);
        rArm.rotation.set(0, 0, 1.45);
        rForearm.rotation.set(0, 0, -1.45);
        hGroup.rotation.set(-0.04, 0, 0);
      } else if (hPose === 'floorCrouch') {
        // Crouched low on the floor pretending to be a floor mound
        bRoot.position.y = -0.34;
        lLeg.rotation.x = -1.25;
        rLeg.rotation.x = -1.25;
        lCalf.rotation.x = 2.05;
        rCalf.rotation.x = 2.05;
        tGroup.rotation.x = 0.28;
        lArm.rotation.set(-0.85, 0, 0.14);
        rArm.rotation.set(-0.85, 0, -0.14);
        lForearm.rotation.set(-0.7, 0, -0.35);
        rForearm.rotation.set(-0.7, 0, 0.35);
        hGroup.rotation.set(0.25, 0, 0);
      } else if (hPose === 'artBlend') {
        // Contraposto statue pose blending next to an artwork
        lArm.rotation.set(0.15, 0, -0.06);
        rArm.rotation.set(-0.55, 0, 0.18);
        rForearm.rotation.set(-1.35, 0, -0.3);
        hGroup.rotation.set(-0.08, -0.22, 0.06);
      } else if (hPose === 'pillarLean') {
        // Hands pressed flat against the pillar, hiding face toward column
        tGroup.rotation.x = 0.16;
        lArm.rotation.set(-1.15, 0, -0.1);
        rArm.rotation.set(-1.15, 0, 0.1);
        lForearm.rotation.set(-0.3, 0, 0);
        rForearm.rotation.set(-0.3, 0, 0);
        hGroup.rotation.set(0.12, 0.18, 0);
      }
    };

    applyCamoPose(
      cfg.pose,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      torsoGroup,
      headGroup,
      bodyRoot,
    );

    group.position.set(
      cfg.radius * Math.cos(cfg.angle),
      0,
      cfg.radius * Math.sin(cfg.angle),
    );
    group.lookAt(
      cfg.radius * Math.cos(cfg.angle) + Math.cos(cfg.facingAngle),
      0,
      cfg.radius * Math.sin(cfg.angle) + Math.sin(cfg.facingAngle),
    );

    scene.add(group);

    const hider: ChameleonHider = {
      id: cfg.id,
      group,
      bodyRoot,
      shadow,
      headGroup,
      torsoGroup,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      eyesGroup,
      revealRing,
      revealRingMat,
      primaryMat,
      secondaryMat,
      accentMat,
      eyeMat,
      shadowMaterial: shadowMat,
      camoTex,
      revealedPrimary: new THREE.Color(cfg.revealedPrimary),
      revealedSecondary: new THREE.Color(cfg.revealedSecondary),
      revealedAccent: new THREE.Color(cfg.revealedAccent),
      hitMeshes,
      angle: cfg.angle,
      pose: cfg.pose,
      phase: cfg.phase,
      found: false,
      revealAnim: 0,
      fadeAlpha: 1,
    };

    // Store helper on group userData for clean reset
    group.userData.resetPose = () =>
      applyCamoPose(
        cfg.pose,
        leftArm,
        rightArm,
        leftLeg,
        rightLeg,
        torsoGroup,
        headGroup,
        bodyRoot,
      );

    chameleons.push(hider);
    for (const hm of hitMeshes) {
      meshToChameleon.set(hm, hider);
    }
  }

  const getChameleonStatus = (): ChameleonStatus => ({
    found: chameleons.filter((c) => c.found).length,
    total: chameleons.length,
  });

  const isUnfoundChameleonMesh = (mesh: THREE.Mesh): boolean => {
    const h = meshToChameleon.get(mesh);
    return Boolean(h && !h.found);
  };

  const applyRevealedAppearance = (h: ChameleonHider, revealed: boolean) => {
    const mats: Array<[THREE.MeshStandardMaterial, THREE.Color]> = [
      [h.primaryMat, h.revealedPrimary],
      [h.secondaryMat, h.revealedSecondary],
      [h.accentMat, h.revealedAccent],
    ];
    for (const [mat, targetColor] of mats) {
      if (revealed) {
        mat.map = null;
        mat.emissiveMap = null;
        mat.color.copy(targetColor);
        mat.emissive.copy(targetColor);
        mat.emissiveIntensity = 0.48;
      } else {
        mat.map = h.camoTex;
        mat.emissiveMap = h.camoTex;
        mat.color.set('#ffffff');
        mat.emissive.set('#ffffff');
        mat.emissiveIntensity = 0.62;
      }
      mat.needsUpdate = true;
    }
    h.eyesGroup.visible = revealed;
    h.shadowMaterial.opacity = revealed ? 0.85 : 0.48;
  };

  const handleChameleonClick = (mesh: THREE.Mesh) => {
    const h = meshToChameleon.get(mesh);
    if (!h) {
      return {
        matched: false,
        newlyFound: false,
        status: getChameleonStatus(),
      };
    }
    const newlyFound = !h.found;
    h.found = true;
    h.revealAnim = 0.001;
    applyRevealedAppearance(h, true);
    h.revealRing.visible = true;
    return {
      matched: true,
      newlyFound,
      status: getChameleonStatus(),
    };
  };

  const resetChameleons = (): ChameleonStatus => {
    for (const h of chameleons) {
      h.found = false;
      h.revealAnim = 0;
      h.revealRing.visible = false;
      h.revealRingMat.opacity = 0;
      applyRevealedAppearance(h, false);
      const resetPose = h.group.userData.resetPose as (() => void) | undefined;
      resetPose?.();
    }
    return getChameleonStatus();
  };

  const update = (
    elapsed: number,
    dt: number,
    reducedMotion: boolean,
    focusedAngle: number | null,
  ) => {
    // Update atmospheric visitors
    for (const actor of actors) {
      let targetAlpha = 1;
      if (focusedAngle !== null) {
        const diff = Math.abs(wrapAngleDiff(actor.currentAngle, focusedAngle));
        if (diff < 0.28) {
          targetAlpha = 0;
        }
      }

      const fadeStep = 1 - Math.exp(-dt * 9);
      actor.fadeAlpha += (targetAlpha - actor.fadeAlpha) * fadeStep;
      const isVisible = actor.fadeAlpha > 0.02;
      actor.group.visible = isVisible;

      if (isVisible) {
        const isFading = actor.fadeAlpha < 0.99;
        for (const mat of actor.materials) {
          if (mat.transparent !== isFading || mat.depthWrite === isFading) {
            mat.transparent = isFading;
            mat.depthWrite = !isFading;
            mat.needsUpdate = true;
          }
          mat.opacity = actor.fadeAlpha;
        }
        actor.shadowMaterial.opacity = 0.9 * actor.fadeAlpha;
      }

      if (reducedMotion) continue;

      if (actor.archetype === 'stroller') {
        const prevAngle = actor.currentAngle;
        actor.currentAngle =
          actor.baseAngle +
          Math.sin(elapsed * actor.walkSpeed * 2.4 + actor.phase) *
            actor.walkSpan;
        const velocity = actor.currentAngle - prevAngle;
        const dirSign = velocity >= 0 ? 1 : -1;

        const px = actor.radius * Math.cos(actor.currentAngle);
        const pz = actor.radius * Math.sin(actor.currentAngle);
        actor.group.position.set(px, 0, pz);

        const tangentX = -Math.sin(actor.currentAngle) * dirSign;
        const tangentZ = Math.cos(actor.currentAngle) * dirSign;
        actor.group.lookAt(px + tangentX, 0, pz + tangentZ);

        const strideCycle = elapsed * 2.6 + actor.phase;
        const strideAmp = Math.min(Math.abs(velocity) * 280, 0.34);
        actor.leftLeg.rotation.x = Math.sin(strideCycle) * strideAmp;
        actor.rightLeg.rotation.x = -Math.sin(strideCycle) * strideAmp;
        actor.leftArm.rotation.x = -Math.sin(strideCycle) * strideAmp * 0.75;
        actor.rightArm.rotation.x = Math.sin(strideCycle) * strideAmp * 0.75;
        actor.torsoGroup.position.y =
          0.86 + Math.abs(Math.sin(strideCycle)) * 0.014;
        actor.headGroup.rotation.y = Math.sin(elapsed * 0.45 + actor.phase) * 0.24;
      } else {
        const breath = Math.sin(elapsed * 1.1 + actor.phase);
        actor.torsoGroup.position.y = 0.86 + breath * 0.005;
        actor.torsoGroup.rotation.x = 0.018 + breath * 0.01;

        if (actor.archetype === 'conversingA') {
          actor.headGroup.rotation.y =
            -0.24 + Math.sin(elapsed * 0.7 + actor.phase) * 0.14;
        } else if (actor.archetype === 'conversingB') {
          actor.headGroup.rotation.y =
            0.3 + Math.sin(elapsed * 0.65 + actor.phase) * 0.12;
        } else {
          actor.headGroup.rotation.y =
            Math.sin(elapsed * 0.42 + actor.phase) * 0.16;
        }
      }
    }

    // Update Meccha Chameleon hiders
    for (const h of chameleons) {
      let targetAlpha = 1;
      if (focusedAngle !== null) {
        const diff = Math.abs(wrapAngleDiff(h.angle, focusedAngle));
        if (diff < 0.26) {
          targetAlpha = 0;
        }
      }

      const fadeStep = 1 - Math.exp(-dt * 9);
      h.fadeAlpha += (targetAlpha - h.fadeAlpha) * fadeStep;
      const isVisible = h.fadeAlpha > 0.02;
      h.group.visible = isVisible;

      if (isVisible) {
        const isFading = h.fadeAlpha < 0.99;
        for (const mat of [h.primaryMat, h.secondaryMat, h.accentMat]) {
          if (mat.transparent !== isFading || mat.depthWrite === isFading) {
            mat.transparent = isFading;
            mat.depthWrite = !isFading;
            mat.needsUpdate = true;
          }
          mat.opacity = h.fadeAlpha;
        }
        h.shadowMaterial.opacity = (h.found ? 0.85 : 0.48) * h.fadeAlpha;
      }

      // Reveal hop + ring burst animation
      if (h.revealAnim > 0) {
        h.revealAnim = Math.min(h.revealAnim + dt / 0.75, 1);
        const t = h.revealAnim;
        const hop = Math.sin(t * Math.PI) * 0.26;
        const baseY = h.pose === 'floorCrouch' ? -0.18 : 0;
        h.bodyRoot.position.y = reducedMotion ? baseY : baseY + hop;

        // Happy wave when spotted
        if (!reducedMotion && h.found) {
          const rForearm = h.rightArm.userData.forearmPivot as THREE.Group;
          h.rightArm.rotation.set(0, 0, 2.35 + Math.sin(t * Math.PI * 4) * 0.28);
          rForearm.rotation.set(0, 0, 0.35 + Math.sin(t * Math.PI * 4) * 0.2);
        }

        h.revealRing.scale.setScalar(1 + t * 2.2);
        h.revealRingMat.opacity = (1 - t) * 0.75 * h.fadeAlpha;
        if (h.revealAnim >= 1) {
          h.revealAnim = 0;
          h.revealRing.visible = false;
        }
      } else if (!reducedMotion) {
        if (h.found) {
          // Cheerful found idle: gentle sway & waving hand
          const baseY = h.pose === 'floorCrouch' ? -0.16 : 0;
          h.bodyRoot.position.y =
            baseY + Math.abs(Math.sin(elapsed * 2.2 + h.phase)) * 0.03;
          h.headGroup.rotation.y = Math.sin(elapsed * 1.4 + h.phase) * 0.22;
          const rForearm = h.rightArm.userData.forearmPivot as THREE.Group;
          h.rightArm.rotation.set(0, 0, 2.3 + Math.sin(elapsed * 4.5 + h.phase) * 0.2);
          rForearm.rotation.set(0, 0, 0.3);
        } else {
          // Very subtle nervous peek/twitch every few seconds so careful eyes can spot them
          const cycle = (elapsed * 0.55 + h.phase) % (Math.PI * 2);
          const twitch = cycle < 0.7 ? Math.sin((cycle / 0.7) * Math.PI) * 0.14 : 0;
          h.headGroup.rotation.y =
            (h.pose === 'wallFlat' ? 0.14 : h.pose === 'pillarPeek' ? 0.25 : 0) +
            twitch;
        }
      }
    }
  };

  const dispose = () => {
    for (const actor of actors) {
      scene.remove(actor.group);
    }
    for (const h of chameleons) {
      scene.remove(h.group);
    }
    for (const g of sharedGeometries) g.dispose();
    for (const m of ownMaterials) m.dispose();
    for (const t of ownTextures) t.dispose();
  };

  return {
    actors,
    chameleons,
    chameleonMeshes,
    handleChameleonClick,
    isUnfoundChameleonMesh,
    resetChameleons,
    getChameleonStatus,
    update,
    dispose,
  };
}
