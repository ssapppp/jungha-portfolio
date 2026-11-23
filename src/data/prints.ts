export const ART_SHEET_URL =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261120_071134_02d2d6ba-ed91-4c3f-87c4-1354b61b5882.png&w=1744&q=85';

export const SHEET_W = 1744;
export const SHEET_H = 2336;

export type Lang = 'KOR' | 'ENG';

const COLS: readonly [number, number][] = [
  [0, 575],
  [585, 1158],
  [1168, 1743],
];

const ROWS: readonly [number, number][] = [
  [0, 769],
  [779, 1545],
  [1555, 2335],
];

export interface PrintCrop {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ProjectMetaRow {
  label: string;
  labelKo: string;
  value: string;
  valueKo: string;
}

export interface GalleryImageItem {
  src: string;
  caption: string;
  captionKo: string;
  autoplay?: boolean;
}

export interface PrintItem {
  index: number;
  title: string;
  titleKo: string;
  artist: string;
  artistKo: string;
  year: number;
  price: number;
  description: string;
  descriptionKo: string;
  crop: PrintCrop;
  customImage?: string;
  customImageFit?: 'cover' | 'contain';
  customImageBg?: string;
  customImagePosX?: number;
  frameOrientation?: 'portrait' | 'landscape';
  projectMeta?: ProjectMetaRow[];
  galleryImages?: GalleryImageItem[];
  carouselImages?: string[];
  carouselAspect?: 'square' | 'portrait';
}

const DESC_SUFFIX =
  ', painted in flat gouache tones. Printed on archival paper with a soft matte finish.';
const DESC_SUFFIX_KO =
  ' 평면적인 과슈 톤으로 그려졌으며, 부드러운 무광 질감의 아카이벌 페이퍼에 인쇄되었습니다.';

const RAW_PRINTS: Array<{
  title: string;
  titleKo: string;
  artist: string;
  artistKo: string;
  year: number;
  price: number;
  descStart: string;
  descStartKo: string;
  fullDescription?: string;
  fullDescriptionKo?: string;
  customImage?: string;
  customImageFit?: 'cover' | 'contain';
  customImageBg?: string;
  customImagePosX?: number;
  frameOrientation?: 'portrait' | 'landscape';
  projectMeta?: ProjectMetaRow[];
  galleryImages?: GalleryImageItem[];
  carouselImages?: string[];
  carouselAspect?: 'square' | 'portrait';
}> = [
  {
    title: 'Seat of the Flamingo',
    titleKo: '홍학의 자리',
    artist: 'Book Design',
    artistKo: '북디자인',
    year: 2026,
    price: 60,
    descStart: '',
    descStartKo: '',
    fullDescription:
      'A book cover design that places clues to the mystery within vivid neon-pink typography, framing and emphasizing a single flamingo to spark the reader’s curiosity.',
    fullDescriptionKo:
      '강렬한 네온핑크로 된 타이포그래피 속에 사건의 단서들을 배치하고 홍학 한 마리를 둘러싸 강조함으로써 독자의 궁금증을 유발하는 표지 디자인을 하였습니다.',
    customImage: '/assets/aistudio/_______________8053ead1.png',
    galleryImages: [
      {
        src: '/assets/aistudio/_____2026-11-24_012103_44675308.png',
        caption: 'Concept Note',
        captionKo: '컨셉 노트',
      },
      {
        src: '/assets/aistudio/______________7cf4e617.png',
        caption: 'Book Cover Spread',
        captionKo: '북커버 전개도',
      },
      {
        src: '/assets/aistudio/1_384e9f4d_web.jpg',
        caption: 'Detail Page 01',
        captionKo: '상세페이지 01',
      },
      {
        src: '/assets/aistudio/2_5dfbcf2d.png',
        caption: 'Detail Page 02',
        captionKo: '상세페이지 02',
      },
      {
        src: '/assets/aistudio/___________1_5bae374d.png',
        caption: 'Flamingo Plush Goods',
        captionKo: '인형 굿즈',
      },
      {
        src: '/assets/aistudio/___________2_07384080.png',
        caption: 'Thermochromic Mug Goods',
        captionKo: '변온 머그컵 굿즈',
      },
    ],
    carouselImages: [
      '/assets/aistudio/2539110010_____________01_1cd99561.jpg',
      '/assets/aistudio/2539110010_____________02_1147aa33.jpg',
      '/assets/aistudio/2539110010_____________03_345296e6.jpg',
      '/assets/aistudio/2539110010_____________04_e234a8ea.jpg',
      '/assets/aistudio/2539110010_____________05_377033ba.jpg',
      '/assets/aistudio/2539110010_____________06_b8a19b8e.jpg',
      '/assets/aistudio/2539110010_____________07_6c8f839f.jpg',
      '/assets/aistudio/2539110010_____________08_e84527f7.jpg',
      '/assets/aistudio/2539110010_____________09_c195558a.jpg',
      '/assets/aistudio/2539110010_____________10_cbc5f0f2.jpg',
    ],
    projectMeta: [
      {
        label: 'Duration',
        labelKo: '작업기간',
        value: 'Approx. 3 weeks',
        valueKo: '약 3주',
      },
      {
        label: 'Contribution',
        labelKo: '기여도',
        value: '100% (Solo project)',
        valueKo: '100%(개인작업)',
      },
      {
        label: 'Role',
        labelKo: '역 할',
        value: 'Planning, Book Cover Design, Detail Page Design, Goods Design, Carousel Design',
        valueKo: '기획, 북커버 디자인, 상세페이지 디자인, 굿즈 디자인, 캐러셀 디자인',
      },
      {
        label: 'Program',
        labelKo: '프로그램',
        value: 'Photoshop, Illustrator, Procreate, AI',
        valueKo: 'Photoshop, Illustrator, Procreate, AI',
      },
    ],
  },
  {
    title: 'Design Carousel',
    titleKo: '디자인 캐러셀',
    artist: 'Carousel',
    artistKo: '캐러셀',
    year: 2026,
    price: 60,
    descStart: '',
    descStartKo: '',
    fullDescription:
      'A swipeable editorial carousel design series structured around clear typographic hierarchy and sequential visual storytelling.',
    fullDescriptionKo:
      '명확한 타이포그래피 위계와 연속적인 시각 흐름을 중심으로 구성한 카드형 캐러셀 디자인 프로젝트입니다.',
    customImage: '/assets/aistudio/_____________1_40f28699.png',
    carouselAspect: 'portrait',
    carouselImages: [
      '/assets/aistudio/_____________1_40f28699.png',
      '/assets/aistudio/_____________2_b7761d41.png',
      '/assets/aistudio/_____________3_42854f06.png',
      '/assets/aistudio/_____________4_9d78aa8d.png',
      '/assets/aistudio/_____________5_5997a475.png',
      '/assets/aistudio/_____________6_b3387b21.png',
      '/assets/aistudio/_____________7_4afca1b3.png',
      '/assets/aistudio/_____________8_a25e3682.png',
      '/assets/aistudio/_____________9_ed381bd5.png',
    ],
    projectMeta: [
      {
        label: 'Duration',
        labelKo: '작업기간',
        value: 'Approx. 2 weeks',
        valueKo: '약 2주',
      },
      {
        label: 'Contribution',
        labelKo: '기여도',
        value: '100% (Solo project)',
        valueKo: '100%(개인작업)',
      },
      {
        label: 'Role',
        labelKo: '역 할',
        value: 'Planning, Carousel Design',
        valueKo: '기획, 캐러셀 디자인',
      },
      {
        label: 'Program',
        labelKo: '프로그램',
        value: 'Photoshop, Illustrator',
        valueKo: 'Photoshop, Illustrator',
      },
    ],
  },
  {
    title: 'Nakdong River Character Contest',
    titleKo: '낙동강 캐릭터 공모전',
    artist: 'Character Design',
    artistKo: '캐릭터 디자인',
    year: 2026,
    price: 55,
    descStart: '',
    descStartKo: '',
    fullDescription:
      'Developed characters to highlight the clean waters and rich ecosystem of the Nakdong River in an approachable way. Inspired by the river’s representative wildlife—the otter and whooper swan—the design delivers the often heavy message of environmental conservation naturally through cute, friendly characters.',
    fullDescriptionKo:
      '낙동강의 깨끗한 물과 풍부한 생태환경을 친근하게 알릴 수 있는 캐릭터를 개발하고자 하였습니다. 낙동강을 대표하는 생물인 수달과 큰고니를 모티브로 삼아, 환경보호라는 다소 무겁게 느껴질 수 있는 메시지를 귀엽고 친근한 캐릭터를 통해 자연스럽게 전달하고자 했습니다.',
    customImage: '/assets/aistudio/_____2026-11-24_031235_7ff52ad5.png',
    frameOrientation: 'landscape',
    galleryImages: [
      {
        src: '/assets/aistudio/_____-01_5bef6012.jpg',
        caption: 'Character Intro & Turnaround',
        captionKo: '캐릭터 소개 및 3면도',
      },
      {
        src: '/assets/aistudio/_____-02_a183becc.jpg',
        caption: 'Character Poses & Actions',
        captionKo: '응용동작',
      },
      {
        src: '/assets/aistudio/_____-03_914d848c.jpg',
        caption: 'Goods & Applications',
        captionKo: '활용 예시',
      },
    ],
    projectMeta: [
      {
        label: 'Duration',
        labelKo: '작업기간',
        value: '1 week',
        valueKo: '1주',
      },
      {
        label: 'Contribution',
        labelKo: '기여도',
        value: '100% (Solo project)',
        valueKo: '100%(개인작업)',
      },
      {
        label: 'Role',
        labelKo: '역 할',
        value: 'Planning, Graphic Design, Character Design',
        valueKo: '기획, 그래픽 디자인, 캐릭터 디자인',
      },
      {
        label: 'Program',
        labelKo: '프로그램',
        value: 'Photoshop, Illustrator, Clipstudio, AI',
        valueKo: 'Photoshop, Illustrator, Clipstudio, AI',
      },
    ],
  },
  {
    title: 'Yeoju Cherry Blossom Festival Character Contest',
    titleKo: '여주흥천남한강벚꽃축제 캐릭터 디자인 공모전',
    artist: 'Character Design',
    artistKo: '캐릭터 디자인',
    year: 2025,
    price: 60,
    descStart: '',
    descStartKo: '',
    fullDescription:
      'Reinterpreted cherry blossoms, the symbol of the local festival, into a character to create a warm and lovable identity unique to the Yeoju Heungcheon Namhan River Cherry Blossom Festival.',
    fullDescriptionKo:
      '지역 축제의 상징인 벚꽃을 캐릭터로 재해석하여, 여주 흥천 남한강 벚꽃축제만의 따뜻하고 사랑스러운 이미지로 제작했습니다.',
    customImage: '/assets/aistudio/c_e2192b74.png',
    customImageFit: 'contain',
    customImageBg: '#F4F3F3',
    galleryImages: [
      {
        src: '/assets/aistudio/_____2026-11-24_040832_d5387462.png',
        caption: 'Beotirang — Character Sheet',
        captionKo: '벚이랑 — 캐릭터 소개 및 턴어라운드',
      },
    ],
    projectMeta: [
      {
        label: 'Duration',
        labelKo: '작업기간',
        value: '1 day',
        valueKo: '1일',
      },
      {
        label: 'Contribution',
        labelKo: '기여도',
        value: '100% (Solo project)',
        valueKo: '100%(개인작업)',
      },
      {
        label: 'Role',
        labelKo: '역 할',
        value: 'Planning, Graphic Design',
        valueKo: '기획, 그래픽 디자인',
      },
      {
        label: 'Program',
        labelKo: '프로그램',
        value: 'Illustrator',
        valueKo: 'Illustrator',
      },
    ],
  },
  {
    title: 'Gunjajihyang',
    titleKo: '군자지향',
    artist: 'Poster Design',
    artistKo: '포스터 디자인',
    year: 2026,
    price: 50,
    descStart: '',
    descStartKo: '',
    fullDescription:
      'An exhibition poster designed around the graceful curves and negative space of Joseon white porcelain. Using the silhouette of a white porcelain moon jar as the central motif, subtle gradients and delicate linework express its understated elegance. Softly layered traditional Hanja elements in the background add a Korean sensibility, harmonized with modern typography to unite tradition and contemporaneity.',
    fullDescriptionKo:
      '조선 백자의 단아한 곡선과 여백의 미를 중심으로 디자인한 전시 포스터입니다. 백자 달항아리의 형태를 메인 오브제로 활용하고, 은은한 그라데이션과 섬세한 선으로 백자 특유의 절제된 아름다움을 표현했습니다. 배경에는 전통적인 한자 요소를 은은하게 배치하여 한국적인 분위기를 더하고, 현대적인 타이포그래피와 조화시켜 전통과 현대가 공존하는 디자인을 완성했습니다.',
    customImage: '/assets/aistudio/조선 백자 포스터와 햇살 그림자.png',
    frameOrientation: 'landscape',
    galleryImages: [
      {
        src: '/assets/aistudio/최종포스터.jpg',
        caption: 'Final Poster Design',
        captionKo: '최종 포스터',
      },
      {
        src: '/assets/aistudio/포스터 목업1.png',
        caption: 'Outdoor Poster Mockup 01',
        captionKo: '포스터 목업 01',
      },
      {
        src: '/assets/aistudio/목업적용2.png',
        caption: 'Indoor Display Mockup 02',
        captionKo: '포스터 목업 02',
      },
      {
        src: '/assets/aistudio/무빙포스터.mp4',
        caption: 'Moving Poster',
        captionKo: '무빙 포스터',
      },
    ],
    projectMeta: [
      {
        label: 'Duration',
        labelKo: '작업기간',
        value: 'Approx. 2 weeks',
        valueKo: '약 2주',
      },
      {
        label: 'Contribution',
        labelKo: '기여도',
        value: '100% (Solo project)',
        valueKo: '100%(개인작업)',
      },
      {
        label: 'Role',
        labelKo: '역 할',
        value: 'Planning, Graphic Design, Poster Design',
        valueKo: '기획, 그래픽 디자인, 포스터 디자인',
      },
      {
        label: 'Program',
        labelKo: '프로그램',
        value: 'Illustrator, After Effects',
        valueKo: 'Illustrator, After Effects',
      },
    ],
  },
  {
    title: "Jeju's Jaeju",
    titleKo: '제주의 재주',
    artist: 'Poster Design',
    artistKo: '포스터 디자인',
    year: 2026,
    price: 60,
    descStart: '',
    descStartKo: '',
    fullDescription:
      'A performance poster design for “Jeju’s Jaeju” (The Music of Jaeju Becoming One with Jeju’s Nature), illustrating Jeju’s iconic coastal scenery, silver grass hills, and tangerines.',
    fullDescriptionKo:
      '‘제주의 자연과 하나 되는 재주(才姝)의 음악’ 공연을 위해 제작한 포스터 디자인으로, 제주의 바다와 자연 풍경, 억새, 감귤 등을 조화롭게 담아냈습니다.',
    customImage: '/assets/aistudio/KakaoTalk_20261112_221340818_01.png',
    customImageFit: 'contain',
    customImageBg: '#ffffff',
    galleryImages: [
      {
        src: '/assets/aistudio/KakaoTalk_20261112_221340818_01.png',
        caption: 'Poster Design',
        captionKo: '포스터 디자인',
      },
      {
        src: '/assets/aistudio/KakaoTalk_20261112_221340818.png',
        caption: 'Banner Design',
        captionKo: '배너 디자인',
      },
    ],
    projectMeta: [
      {
        label: 'Duration',
        labelKo: '작업기간',
        value: '3 days',
        valueKo: '3일',
      },
      {
        label: 'Contribution',
        labelKo: '기여도',
        value: '100% (Solo project)',
        valueKo: '100%(개인작업)',
      },
      {
        label: 'Role',
        labelKo: '역 할',
        value: 'Planning, Graphic Design, Poster Design',
        valueKo: '기획, 그래픽 디자인, 포스터 디자인',
      },
      {
        label: 'Program',
        labelKo: '프로그램',
        value: 'Photoshop, Illustrator',
        valueKo: 'Photoshop, Illustrator',
      },
    ],
  },
  {
    title: 'Bluetooth Speaker Mushroom',
    titleKo: '블루투스 스피커 버섯',
    artist: '3D Modeling',
    artistKo: '3D 모델링',
    year: 2025,
    price: 65,
    descStart: '',
    descStartKo: '',
    fullDescription:
      'A 3D product modeling project designing a mushroom-inspired Bluetooth speaker with organic, rounded forms.',
    fullDescriptionKo:
      '버섯의 유기적인 형태를 모티브로 디자인한 블루투스 스피커 3D 모델링 작업입니다.',
    customImage: '/assets/aistudio/버섯블루투스-스피커-E조.jpg',
    customImageFit: 'contain',
    customImageBg: '#ffffff',
    galleryImages: [
      {
        src: '/assets/aistudio/버섯모델링.png',
        caption: '3D Modeling',
        captionKo: '3D 모델링',
      },
      {
        src: '/assets/aistudio/KakaoTalk_20261112_203510127_04.jpg',
        caption: 'Prototype Output',
        captionKo: '실물 제작 결과물',
      },
    ],
    projectMeta: [
      {
        label: 'Duration',
        labelKo: '작업기간',
        value: 'Approx. 2 weeks',
        valueKo: '약 2주',
      },
      {
        label: 'Contribution',
        labelKo: '기여도',
        value: '70%',
        valueKo: '70%',
      },
      {
        label: 'Role',
        labelKo: '역 할',
        value: 'Planning, Rhino Modeling',
        valueKo: '기획, 라이노 모델링',
      },
      {
        label: 'Program',
        labelKo: '프로그램',
        value: 'Photoshop, Rhino',
        valueKo: 'Photoshop, Rhino',
      },
    ],
  },
  {
    title: 'Deskterior Crocodile',
    titleKo: '데스크테리어 악어',
    artist: '3D Modeling',
    artistKo: '3D 모델링',
    year: 2026,
    price: 55,
    descStart: '',
    descStartKo: '',
    fullDescription:
      'A 3D modeling project creating a playful crocodile-themed deskterior object for everyday workspace styling.',
    fullDescriptionKo:
      '데스크 공간을 개성 있게 채우는 악어 모티브의 데스크테리어 오브제 3D 모델링 작업입니다.',
    customImage: '/assets/aistudio/스크린샷 2026-11-12 235504.png',
    frameOrientation: 'landscape',
    galleryImages: [
      {
        src: '/assets/aistudio/KakaoTalk_20260320_223742096.jpg',
        caption: 'Concept Sketch',
        captionKo: '아이디어 스케치',
      },
      {
        src: '/assets/aistudio/KakaoTalk_20261112_235156453.jpg',
        caption: '3D Printed Output',
        captionKo: '3D 프린팅 실물 제작',
      },
    ],
    projectMeta: [
      {
        label: 'Duration',
        labelKo: '작업기간',
        value: '1 week',
        valueKo: '1주',
      },
      {
        label: 'Contribution',
        labelKo: '기여도',
        value: '100% (Solo project)',
        valueKo: '100%(개인작업)',
      },
      {
        label: 'Role',
        labelKo: '역 할',
        value: 'Rhino Modeling',
        valueKo: '라이노 모델링',
      },
      {
        label: 'Program',
        labelKo: '프로그램',
        value: 'Rhino, Bambustudio',
        valueKo: 'Rhino, Bambustudio',
      },
    ],
  },
  {
    title: 'Motion Graphics Works',
    titleKo: '모션 그래픽 작업들',
    artist: 'Motion Graphics',
    artistKo: '모션 그래픽',
    year: 2026,
    price: 55,
    descStart: '',
    descStartKo: '',
    fullDescription:
      'A collection of motion graphics projects exploring rhythm, typography, and dynamic visual storytelling.',
    fullDescriptionKo:
      '리듬감 있는 타이포그래피와 역동적인 시각 연출을 탐구한 모션 그래픽 작업 모음입니다.',
    customImage: '/assets/aistudio/스크린샷 2026-11-24 052932.png',
    customImageFit: 'contain',
    customImageBg: '#efefef',
    frameOrientation: 'landscape',
    galleryImages: [
      {
        src: '/assets/aistudio/드라큘라 (Dracula) 편집본.mp4',
        caption: 'Dracula — Motion Graphics',
        captionKo: '드라큘라 (Dracula) 편집본',
        autoplay: false,
      },
      {
        src: '/assets/aistudio/파티클과제.mp4',
        caption: 'Particle Motion',
        captionKo: '파티클 과제',
        autoplay: false,
      },
      {
        src: '/assets/aistudio/팝업카드 만들기.mp4',
        caption: 'Pop-up Card Motion',
        captionKo: '팝업카드 만들기',
        autoplay: false,
      },
    ],
    projectMeta: [
      {
        label: 'Duration',
        labelKo: '작업기간',
        value: 'Approx. 2 weeks',
        valueKo: '약 2주',
      },
      {
        label: 'Contribution',
        labelKo: '기여도',
        value: '100% (Solo project)',
        valueKo: '100%(개인작업)',
      },
      {
        label: 'Role',
        labelKo: '역 할',
        value: 'Planning, Motion Graphics',
        valueKo: '기획, 모션그래픽',
      },
      {
        label: 'Program',
        labelKo: '프로그램',
        value: 'After Effects, Procreate',
        valueKo: 'After Effects, Procreate',
      },
    ],
  },
];

export function getPrintCrop(i: number): PrintCrop {
  const [colStart, colEnd] = COLS[i % 3];
  const [rowStart, rowEnd] = ROWS[Math.floor(i / 3)];
  return {
    x: colStart + 6,
    y: rowStart + 6,
    w: colEnd - colStart - 12,
    h: rowEnd - rowStart - 12,
  };
}

export const PRINTS: PrintItem[] = RAW_PRINTS.map((item, i) => ({
  index: i,
  title: item.title,
  titleKo: item.titleKo,
  artist: item.artist,
  artistKo: item.artistKo,
  year: item.year,
  price: item.price,
  description: item.fullDescription ?? `${item.descStart}${DESC_SUFFIX}`,
  descriptionKo: item.fullDescriptionKo ?? `${item.descStartKo}${DESC_SUFFIX_KO}`,
  crop: getPrintCrop(i),
  customImage: item.customImage,
  customImageFit: item.customImageFit,
  customImageBg: item.customImageBg,
  customImagePosX: item.customImagePosX,
  frameOrientation: item.frameOrientation,
  projectMeta: item.projectMeta,
  galleryImages: item.galleryImages,
  carouselImages: item.carouselImages,
  carouselAspect: item.carouselAspect,
}));

export interface BilingualOption {
  id: string;
  ENG: string;
  KOR: string;
}

export const PAPER_OPTIONS: BilingualOption[] = [
  { id: 'art', ENG: 'Art Paper', KOR: '아트 페이퍼' },
  { id: 'fine', ENG: 'Fine Art Paper', KOR: '파인아트 코튼지' },
  { id: 'recycled', ENG: 'Recycled Paper', KOR: '재생지' },
];

export const SIZE_OPTIONS: BilingualOption[] = [
  { id: 'a3', ENG: '11.7 × 16.5" (A3)', KOR: '29.7 × 42.0 cm (A3)' },
  { id: 'a2', ENG: '16.5 × 23.4" (A2)', KOR: '42.0 × 59.4 cm (A2)' },
  { id: 'a1', ENG: '23.4 × 33.1" (A1)', KOR: '59.4 × 84.1 cm (A1)' },
  { id: 'a0', ENG: '33.1 × 46.8" (A0)', KOR: '84.1 × 118.9 cm (A0)' },
];

export const SIGNATURE_OPTIONS: BilingualOption[] = [
  { id: 'unsigned', ENG: 'Unsigned', KOR: '서명 없음' },
  { id: 'signed', ENG: 'Signed and Numbered', KOR: '작가 서명 및 에디션 넘버링' },
];

export const FRAME_OPTIONS: BilingualOption[] = [
  { id: 'unframed', ENG: 'Unframed', KOR: '프레임 없음' },
  { id: 'classic', ENG: 'Classic Frame', KOR: '클래식 우드 프레임' },
  { id: 'canvas', ENG: 'Framed Canvas', KOR: '블랙 캔버스 프레임' },
];

export const ACCORDION_ITEMS = [
  {
    id: 'paper',
    title: { ENG: 'Paper & Sizes', KOR: '용지 및 크기 안내' },
    body: {
      ENG: 'Art Paper is a smooth 200 gsm matte stock. Fine Art Paper is a 310 gsm cotton rag with a soft texture. Recycled Paper is 100% post-consumer fibre.',
      KOR: '아트 페이퍼는 매끈한 200gsm 무광 용지이며, 파인아트 코튼지는 부드러운 결을 지닌 310gsm 면지입니다. 재생지는 100% 재활용 섬유로 제작됩니다.',
    },
  },
  {
    id: 'delivery',
    title: { ENG: 'Delivery Info', KOR: '배송 안내' },
    body: {
      ENG: 'Prints are made to order and ship rolled in a tube within 3–5 working days. Framed pieces ship flat within 7–10 working days.',
      KOR: '모든 프린트는 주문 제작되며 지관통에 담아 영업일 기준 3–5일 내 발송됩니다. 액자 포함 작품은 평면 포장으로 7–10일 내 발송됩니다.',
    },
  },
  {
    id: 'returns',
    title: { ENG: 'Returns Policy', KOR: '교환 및 반품 안내' },
    body: {
      ENG: 'Unframed prints can be returned within 30 days in their original tube. Signed editions are final sale.',
      KOR: '프레임이 없는 프린트는 원래의 지관통 포장 상태로 수령 후 30일 이내 반품 가능합니다. 작가 서명 에디션은 교환 및 반품이 불가합니다.',
    },
  },
] as const;

export function formatMoney(usdAmount: number): string {
  return `$ ${usdAmount.toFixed(2)}`;
}

export const SMALL_SCREEN_QUERY =
  '(max-width: 819px), (orientation: portrait) and (max-width: 1100px), (orientation: landscape) and (max-height: 500px)';
