import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArtCrop } from './components/ArtCrop';
import {
  Gallery3D,
  GalleryHandle,
  PillState,
  PrintSlotMeta,
  ScreenRect,
} from './components/Gallery3D';
import {
  Lang,
  PRINTS,
} from './data/prints';

type ActiveView = 'gallery' | 'page' | 'list';
type InfoModalTab = 'account' | 'saved' | 'contact' | null;

interface FlyerState {
  id: number;
  printIndex: number;
  startRect: ScreenRect;
}

const COPY = {
  KOR: {
    navIndex: '목차',
    searchLabel: '검색…',
    searchPlaceholder: '작품명 또는 작가명을 검색하세요…',
    searchEmpty: (q: string) => `“${q}”에 해당하는 작품이 없습니다.`,
    hintWalk1: '스크롤 또는 드래그로 둘러보기',
    hintWalk2: '그림을 클릭해 가까이 보기',
    hintFocus1: '그림을 클릭해 작품 열기',
    hintFocus2: 'ESC 또는 바깥 클릭으로 뒤로 가기',
    toggleGallery: '갤러리',
    toggleList: '목록',
    enterCollection: '컬렉션 전체 보기 →',
    pillOpen: '작품 열기',
    viewDetails: '클릭하여 상세보기',
    collectionHeading: '컬렉션 더 보기',
    listHeading: 'PORTFOLIO — 전체 작품',
    contactTitle: 'CONTACT',
    contactLead:
      '프로젝트 협업, 디자인 외주 및 작업 문의는 아래 이메일 또는 문의 양식으로 편하게 연락해 주세요.',
    contactEmailLabel: '이메일',
    contactCopy: '복사',
    contactCopied: '복사됨 ✓',
    contactNameLabel: '이름 / 소속',
    contactNamePlaceholder: '성함 또는 회사명을 입력해 주세요',
    contactReplyLabel: '회신 받을 이메일',
    contactReplyPlaceholder: 'name@example.com',
    contactMessageLabel: '문의 내용',
    contactMessagePlaceholder: '작업 일정, 목적 등 간단한 내용을 남겨주세요',
    contactSendBtn: '이메일로 문의하기 →',
    contactSentNote: '메일 앱이 열리지 않는 경우 위 이메일 주소(bu_ge2@naver.com)를 복사해 바로 연락해 주세요.',
    zoomHint: '그림을 클릭하면 확대·축소 전환 / ESC 또는 바깥 클릭으로 닫기',
    zoomGalleryHint: '마우스 휠로 스크롤하여 순서대로 감상 · 클릭 시 확대·축소 전환 · ESC로 닫기',
    zoomCarouselHint: '좌우 화살표(←/→) 또는 하단 인디케이터로 슬라이드 넘기기 · ESC로 닫기',
    zoomInLabel: '2× 확대',
    zoomOutLabel: '원본 맞춤',
    openZoomLabel: '작품 크게 보기',
    carouselHeading: '캐러셀 디자인',
    prevSlideLabel: '이전 슬라이드',
    nextSlideLabel: '다음 슬라이드',
    accountTitle: 'ABOUT ME',
    profile: {
      kicker: '2025–2026 PARK JUNG HA',
      aboutHeading: 'About Me',
      aboutLead:
        '시각적 스토리로 사람과 브랜드를 연결하는 그래픽 디자이너, 박정하입니다.',
      aboutParagraphs: [
        '다양한 매체를 경험하며 아이디어를 시각적 결과물로 구체화 해왔습니다.',
        '브랜드, 콘텐츠, 공간, 3D 모션의 경계를 넘나들며 목적에 맞는 그래픽을 설계합니다.',
        '리서치부터 제작과 완성까지 흐름을 정리하고, 명확한 기준과 빠른 커뮤니케이션으로 결과의 밀도를 높입니다.',
      ],
      profileHeading: 'Profile',
      name: '박정하',
      role: 'Graphic Designer',
      location: 'Jeju, Korea',
      educationHeading: 'Education',
      education: [
        { line: '-제주대학교 미술학과 학사 (2018 - 2022)' },
        {
          line: '-한국폴리텍대학 제주캠퍼스',
          sub: '소프트웨어융합디자인과 (2025 - 2027)',
        },
      ],
      certificateHeading: 'Certificate',
      certificates: [
        '- GTQ 그래픽기술자격',
        '- ITQ OA 마스터(한글, 엑셀, 파워포인트)',
        '- 컴퓨터그래픽스운용기능사',
        '- 워드프로세서 1급',
        '- 전자출판기능사',
        '- 자동차 2종 보통',
      ],
      toolsHeading: 'Tools',
      tools: ['Photoshop', 'Illustrator', 'InDesign', 'After Effects', 'Rhino', 'Clipstudio'],
    },
    savedTitle: '저장한 작품',
    savedEmpty: '저장한 작품이 아직 없습니다.',
  },
  ENG: {
    navIndex: 'Index',
    searchLabel: 'Search…',
    searchPlaceholder: 'Search prints or artists…',
    searchEmpty: (q: string) => `No prints match “${q}”.`,
    hintWalk1: 'Scroll or drag to walk round',
    hintWalk2: 'Click a painting to look closer',
    hintFocus1: 'Click the painting to open it',
    hintFocus2: 'Esc or click away to step back',
    toggleGallery: 'GALLERY',
    toggleList: 'LIST',
    enterCollection: 'ENTER THE COLLECTION →',
    pillOpen: 'OPEN THE PRINT',
    viewDetails: 'Click to view details',
    collectionHeading: 'GET THE COLLECTION',
    listHeading: 'PORTFOLIO — ALL PRINTS',
    contactTitle: 'CONTACT',
    contactLead:
      'For design inquiries, collaborations, or project commissions, reach out directly by email or leave a message below.',
    contactEmailLabel: 'E-MAIL',
    contactCopy: 'COPY',
    contactCopied: 'COPIED ✓',
    contactNameLabel: 'Name / Organization',
    contactNamePlaceholder: 'Your name or studio',
    contactReplyLabel: 'Your Email',
    contactReplyPlaceholder: 'name@example.com',
    contactMessageLabel: 'Message',
    contactMessagePlaceholder: 'Share project scope, timeline, or notes',
    contactSendBtn: 'SEND INQUIRY →',
    contactSentNote: 'If your mail app did not open, copy bu_ge2@naver.com above to reach out directly.',
    zoomHint: 'Click artwork to toggle 2× detail zoom · Esc or click outside to close',
    zoomGalleryHint: 'Scroll down to view in order · Click image to toggle 2× zoom · Esc to close',
    zoomCarouselHint: 'Use arrows (←/→) or indicators to flip slides · Esc to close',
    zoomInLabel: '2× ZOOM',
    zoomOutLabel: 'FIT VIEW',
    openZoomLabel: 'Enlarge artwork',
    carouselHeading: 'CAROUSEL DESIGN',
    prevSlideLabel: 'Previous slide',
    nextSlideLabel: 'Next slide',
    accountTitle: 'ABOUT ME',
    profile: {
      kicker: '2025–2026 PARK JUNG HA',
      aboutHeading: 'About Me',
      aboutLead:
        'I am Park Jung Ha, a graphic designer connecting people and brands through visual storytelling.',
      aboutParagraphs: [
        'Across diverse media, I have shaped ideas into tangible visual outcomes.',
        'Moving seamlessly across brand, content, spatial, and 3D motion design, I craft graphics tailored to each purpose.',
        'From research through production and completion, I organize the entire workflow and elevate every detail with clear standards and swift communication.',
      ],
      profileHeading: 'Profile',
      name: 'Park Jung Ha',
      role: 'Graphic Designer',
      location: 'Jeju, Korea',
      educationHeading: 'Education',
      education: [
        { line: '- B.F.A. in Fine Arts, Jeju National University (2018 - 2022)' },
        {
          line: '- Korea Polytechnics Jeju Campus',
          sub: 'Software Convergence Design (2025 - 2027)',
        },
      ],
      certificateHeading: 'Certificate',
      certificates: [
        '- GTQ Graphic Technology Qualification',
        '- ITQ OA Master (Hangul, Excel, PowerPoint)',
        '- Craftsman Computer Graphics Operation',
        '- Word Processor Level 1',
        '- Craftsman Electronic Publishing',
        "- Driver's License (Class 2 Normal)",
      ],
      toolsHeading: 'Tools',
      tools: ['Photoshop', 'Illustrator', 'InDesign', 'After Effects', 'Rhino', 'Clipstudio'],
    },
    savedTitle: 'SAVED PRINTS',
    savedEmpty: 'No prints bookmarked yet.',
  },
} as const;

export default function App() {
  const galleryRef = useRef<GalleryHandle | null>(null);
  const pageRef = useRef<HTMLElement | null>(null);
  const pageArtRef = useRef<HTMLButtonElement | null>(null);
  const zoomStageRef = useRef<HTMLDivElement | null>(null);
  const flyerElRef = useRef<HTMLDivElement | null>(null);
  const headlineRowRef = useRef<HTMLDivElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const detailsTimerRef = useRef<number | null>(null);
  const flyerAnimRef = useRef<Animation | null>(null);

  const [reducedMotion, setReducedMotion] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );

  const [lang, setLang] = useState<Lang>('KOR');
  const t = COPY[lang];

  const [introReady, setIntroReady] = useState(false);
  const [view, setView] = useState<ActiveView>('gallery');
  const [focusedSlot, setFocusedSlot] = useState<PrintSlotMeta | null>(null);
  const [hoveringPrint, setHoveringPrint] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [pill, setPill] = useState<PillState>({ visible: false, x: 0, y: 0 });

  // Print page state
  const [activePrintIndex, setActivePrintIndex] = useState<number>(0);
  const [lastPrintIndex, setLastPrintIndex] = useState<number>(0);
  const [pageImageVisible, setPageImageVisible] = useState<boolean>(true);
  const [detailsVisible, setDetailsVisible] = useState<boolean>(true);
  const [flyer, setFlyer] = useState<FlyerState | null>(null);

  // Contact modal state
  const [contactCopied, setContactCopied] = useState<boolean>(false);
  const [contactName, setContactName] = useState<string>('');
  const [contactReplyEmail, setContactReplyEmail] = useState<string>('');
  const [contactMessage, setContactMessage] = useState<string>('');
  const [contactSent, setContactSent] = useState<boolean>(false);

  // Auxiliary interactive overlays (Search ⌘K, Saved, Detail Zoom, Account)
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [savedPrints, setSavedPrints] = useState<number[]>([]);
  const [zoomOpen, setZoomOpen] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<1 | 2>(1);
  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  const [infoModal, setInfoModal] = useState<InfoModalTab>(null);

  useEffect(() => {
    if (zoomOpen && zoomStageRef.current) {
      zoomStageRef.current.scrollTop = 0;
      zoomStageRef.current.scrollLeft = 0;
    }
  }, [zoomOpen]);

  useEffect(() => {
    document.documentElement.lang = lang === 'KOR' ? 'ko' : 'en';
  }, [lang]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const row = headlineRowRef.current;
    const h1 = headlineRef.current;
    if (!row || !h1) return;

    const updateHeadlineEnd = () => {
      const u = Math.min(window.innerWidth / 1440, window.innerHeight / 900);
      const rect = h1.getBoundingClientRect();
      if (rect.width > 0) {
        row.style.setProperty('--headline-end', `${rect.width + 18 * u}px`);
      }
    };

    updateHeadlineEnd();
    const ro = new ResizeObserver(updateHeadlineEnd);
    ro.observe(h1);
    window.addEventListener('resize', updateHeadlineEnd);
    document.fonts.ready.then(updateHeadlineEnd);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateHeadlineEnd);
    };
  }, [introReady, lang]);

  const clearPendingAnimations = useCallback(() => {
    if (detailsTimerRef.current !== null) {
      window.clearTimeout(detailsTimerRef.current);
      detailsTimerRef.current = null;
    }
    if (flyerAnimRef.current) {
      flyerAnimRef.current.cancel();
      flyerAnimRef.current = null;
    }
  }, []);

  const openPrintWithFlyer = useCallback(
    (printIndex: number, startRect: ScreenRect, fromPage = false) => {
      clearPendingAnimations();
      setActivePrintIndex(printIndex);
      setLastPrintIndex(printIndex);
      setZoomOpen(false);
      setZoomScale(1);
      setCarouselIndex(0);
      setSearchOpen(false);
      setInfoModal(null);

      setView('page');
      setPill({ visible: false, x: 0, y: 0 });
      setPageImageVisible(false);
      setDetailsVisible(false);

      if (fromPage && pageRef.current) {
        pageRef.current.scrollTo({
          top: 0,
          behavior: reducedMotion ? 'auto' : 'smooth',
        });
      } else if (pageRef.current) {
        pageRef.current.scrollTop = 0;
      }

      setFlyer({
        id: Date.now(),
        printIndex,
        startRect,
      });

      detailsTimerRef.current = window.setTimeout(
        () => {
          setDetailsVisible(true);
          detailsTimerRef.current = null;
        },
        reducedMotion ? 0 : 1000,
      );
    },
    [clearPendingAnimations, reducedMotion],
  );

  // Run Web Animations API flyer once flyer element mounts
  useEffect(() => {
    if (!flyer) return;
    const flyerEl = flyerElRef.current;
    const targetEl = pageArtRef.current;
    if (!flyerEl || !targetEl) {
      setPageImageVisible(true);
      setFlyer(null);
      return;
    }

    let rafId = 0;
    rafId = requestAnimationFrame(() => {
      const targetRect = targetEl.getBoundingClientRect();
      const { startRect } = flyer;
      const dx = targetRect.left - startRect.left;
      const dy = targetRect.top - startRect.top;
      const sx = targetRect.width / Math.max(1, startRect.width);
      const sy = targetRect.height / Math.max(1, startRect.height);

      if (reducedMotion) {
        setPageImageVisible(true);
        setFlyer(null);
        return;
      }

      const anim = flyerEl.animate(
        [
          { transform: 'translate(0px, 0px) scale(1, 1)' },
          { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
        ],
        {
          duration: 300,
          easing: 'cubic-bezier(0.25, 0.75, 0.25, 1)',
          fill: 'forwards',
        },
      );
      flyerAnimRef.current = anim;

      anim.onfinish = () => {
        flyerAnimRef.current = null;
        setPageImageVisible(true);
        setFlyer(null);
      };
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [flyer, reducedMotion]);

  const handleOpenFromGallery = useCallback(
    (printIndex: number, rect: ScreenRect) => {
      openPrintWithFlyer(printIndex, rect, false);
    },
    [openPrintWithFlyer],
  );

  const handleOpenFromCard = useCallback(
    (
      printIndex: number,
      cardEl: HTMLElement | null,
      fromPage: boolean,
    ) => {
      const artBox = cardEl?.querySelector('.print-card-art') as HTMLElement | null;
      const rect = (artBox || cardEl)?.getBoundingClientRect() ?? {
        left: window.innerWidth / 2 - 84,
        top: window.innerHeight / 2 - 112,
        width: 168,
        height: 224,
      };
      openPrintWithFlyer(
        printIndex,
        {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        },
        fromPage,
      );
    },
    [openPrintWithFlyer],
  );

  const returnToGallery = useCallback(() => {
    clearPendingAnimations();
    setFlyer(null);
    setPageImageVisible(true);
    setDetailsVisible(true);
    setZoomOpen(false);
    setSearchOpen(false);
    setInfoModal(null);

    if (view !== 'gallery') {
      setView('gallery');
      galleryRef.current?.focusNearestOuterPrint(lastPrintIndex);
    }
  }, [clearPendingAnimations, lastPrintIndex, view]);

  const jumpToProject = useCallback(
    (printIndex: number) => {
      clearPendingAnimations();
      setFlyer(null);
      setPageImageVisible(true);
      setDetailsVisible(true);
      setZoomOpen(false);
      setSearchOpen(false);
      setInfoModal(null);
      setLastPrintIndex(printIndex);
      setView('gallery');
      galleryRef.current?.focusNearestOuterPrint(printIndex);
    },
    [clearPendingAnimations],
  );

  const openList = useCallback(() => {
    clearPendingAnimations();
    setFlyer(null);
    setPageImageVisible(true);
    setZoomOpen(false);
    setSearchOpen(false);
    setInfoModal(null);
    setView('list');
  }, [clearPendingAnimations]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
        return;
      }

      if (e.key === 'Escape') {
        if (zoomOpen) {
          setZoomOpen(false);
          return;
        }
        if (searchOpen) {
          setSearchOpen(false);
          return;
        }
        if (infoModal) {
          setInfoModal(null);
          return;
        }
        if (view !== 'gallery') {
          returnToGallery();
          return;
        }
        if (focusedSlot) {
          galleryRef.current?.stepBack();
        }
        return;
      }

      if (zoomOpen) {
        const cSlides = PRINTS[activePrintIndex]?.carouselImages ?? [];
        if (cSlides.length > 1) {
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            setCarouselIndex((prev) => (prev + 1) % cSlides.length);
            return;
          }
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            setCarouselIndex((prev) => (prev - 1 + cSlides.length) % cSlides.length);
            return;
          }
        }
      }

      if (
        view === 'gallery' &&
        !searchOpen &&
        !infoModal &&
        !zoomOpen
      ) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          galleryRef.current?.stepArrow(1);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          galleryRef.current?.stepArrow(-1);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    activePrintIndex,
    focusedSlot,
    infoModal,
    returnToGallery,
    searchOpen,
    view,
    zoomOpen,
  ]);

  const activePrint = PRINTS[activePrintIndex] ?? PRINTS[0];

  const collectionCards = useMemo(() => {
    return [0, 1, 2, 3].map((offset) => PRINTS[(activePrintIndex + offset) % PRINTS.length]);
  }, [activePrintIndex]);

  const contactMailtoHref = useMemo(() => {
    const subject = encodeURIComponent(
      contactName.trim()
        ? `[Portfolio Contact] ${contactName.trim()}`
        : '[Portfolio Contact] Design Inquiry',
    );
    const bodyLines = [
      contactName.trim() ? `Name: ${contactName.trim()}` : '',
      contactReplyEmail.trim() ? `Email: ${contactReplyEmail.trim()}` : '',
      '',
      contactMessage.trim(),
    ]
      .filter((line, i, arr) => !(line === '' && i === 0 && arr[1] === ''))
      .join('\n');
    return `mailto:bu_ge2@naver.com?subject=${subject}&body=${encodeURIComponent(bodyLines)}`;
  }, [contactMessage, contactName, contactReplyEmail]);

  const handleCopyContactEmail = useCallback(() => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText('bu_ge2@naver.com').then(() => {
        setContactCopied(true);
        window.setTimeout(() => setContactCopied(false), 2000);
      });
    } else {
      setContactCopied(true);
      window.setTimeout(() => setContactCopied(false), 2000);
    }
  }, []);

  const toggleSaved = (index: number) => {
    setSavedPrints((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const filteredSearchPrints = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return PRINTS;
    return PRINTS.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.titleKo.toLowerCase().includes(q) ||
        p.artist.toLowerCase().includes(q) ||
        p.artistKo.toLowerCase().includes(q) ||
        String(p.year).includes(q),
    );
  }, [searchQuery]);

  const isOverlayOpen = view !== 'gallery';
  const galleryCursorClass = dragging
    ? 'dragging'
    : hoveringPrint
      ? 'pointer'
      : '';

  const getPrintTitle = (p: (typeof PRINTS)[number]) =>
    lang === 'KOR' ? p.titleKo : p.title;
  const getPrintArtist = (p: (typeof PRINTS)[number]) =>
    lang === 'KOR' ? p.artistKo : p.artist;
  const getPrintDesc = (p: (typeof PRINTS)[number]) =>
    lang === 'KOR' ? p.descriptionKo : p.description;

  return (
    <div className={introReady ? 'intro-ready' : ''}>
      {/* 1. Nav */}
      <header className={`nav ${isOverlayOpen ? 'solid' : ''}`}>
        <button
          type="button"
          className="nav-logo nav-fade"
          style={{ '--i': 5 } as React.CSSProperties}
          onClick={returnToGallery}
        >
          2026Portfolio
        </button>

        <nav className="nav-links" aria-label="Primary">
          <button
            type="button"
            className={`nav-link nav-fade ${view === 'list' ? 'active' : ''}`}
            style={{ '--i': 6 } as React.CSSProperties}
            onClick={openList}
          >
            {t.navIndex}
          </button>
          {(['01', '02', '03', '04', '05', '06', '07', '08'] as const).map((label, idx) => (
            <button
              key={label}
              type="button"
              className={`nav-link nav-fade ${focusedSlot?.printIndex === idx ? 'active' : ''}`}
              style={{ '--i': 7 + idx } as React.CSSProperties}
              onClick={() => jumpToProject(idx)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="nav-right">
          <button
            type="button"
            className="nav-search nav-fade"
            style={{ '--i': 15 } as React.CSSProperties}
            onClick={() => setSearchOpen(true)}
            aria-label={t.searchLabel}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: 'calc(15 * var(--u))', height: 'calc(15 * var(--u))', flexShrink: 0 }}
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span className="nav-search-label">{t.searchLabel}</span>
            <kbd className="nav-kbd">⌘K</kbd>
          </button>

          <div
            className="nav-lang nav-fade"
            style={{ '--i': 16 } as React.CSSProperties}
            role="group"
            aria-label="Language"
          >
            {(['KOR', 'ENG'] as const).map((code) => (
              <button
                key={code}
                type="button"
                className={`nav-lang-btn ${lang === code ? 'active' : ''}`}
                aria-pressed={lang === code}
                onClick={() => setLang(code)}
              >
                {code}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="nav-icon-btn nav-account nav-fade"
            style={{ '--i': 17 } as React.CSSProperties}
            onClick={() => setInfoModal('account')}
            aria-label={t.accountTitle}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: 'calc(22 * var(--u))', height: 'calc(22 * var(--u))' }}
              aria-hidden="true"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6" />
            </svg>
          </button>

          <button
            type="button"
            className="nav-icon-btn nav-heart nav-fade"
            style={{ '--i': 18 } as React.CSSProperties}
            onClick={() => setInfoModal('saved')}
            aria-label={t.savedTitle}
          >
            <svg
              viewBox="0 0 24 24"
              fill={savedPrints.length > 0 ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: 'calc(22 * var(--u))', height: 'calc(22 * var(--u))' }}
              aria-hidden="true"
            >
              <path d="M12 20.5s-7.5-4.7-9.2-9.2C1.6 8 3.6 4.8 7 4.5c2-.2 3.8.8 5 2.4 1.2-1.6 3-2.6 5-2.4 3.4.3 5.4 3.5 4.2 6.8-1.7 4.5-9.2 9.2-9.2 9.2z" />
            </svg>
          </button>

          <button
            type="button"
            className="nav-icon-btn nav-contact nav-fade"
            style={{ '--i': 19 } as React.CSSProperties}
            onClick={() => {
              setContactSent(false);
              setInfoModal('contact');
            }}
            aria-label={t.contactTitle}
            title={t.contactTitle}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: 'calc(22 * var(--u))', height: 'calc(22 * var(--u))' }}
              aria-hidden="true"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <polyline points="3 7 12 13 21 7" />
            </svg>
          </button>
        </div>
      </header>

      {/* 2. Gallery 3D Room */}
      <main id="gallery" className={galleryCursorClass}>
        <Gallery3D
          ref={galleryRef}
          lang={lang}
          suspended={isOverlayOpen}
          reducedMotion={reducedMotion}
          onIntroReady={() => setIntroReady(true)}
          onFocusChange={setFocusedSlot}
          onOpenPrint={handleOpenFromGallery}
          onPillChange={setPill}
          onHoverChange={setHoveringPrint}
          onDragChange={setDragging}
        />
        <div id="veil" className={introReady ? 'cleared' : ''} />
      </main>

      {/* 3. Gallery UI */}
      <div className={`gui ${isOverlayOpen ? 'hidden-ui' : ''}`}>
        <div className="arrows">
          <button
            type="button"
            className="arrow-btn"
            aria-label={lang === 'KOR' ? '이전 작품' : 'Previous print'}
            onClick={() => galleryRef.current?.stepArrow(-1)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: 'calc(20 * var(--u))', height: 'calc(20 * var(--u))' }}
              aria-hidden="true"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="11 6 5 12 11 18" />
            </svg>
          </button>

          <button
            type="button"
            className="arrow-btn"
            aria-label={lang === 'KOR' ? '다음 작품' : 'Next print'}
            onClick={() => galleryRef.current?.stepArrow(1)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: 'calc(20 * var(--u))', height: 'calc(20 * var(--u))' }}
              aria-hidden="true"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="13 6 19 12 13 18" />
            </svg>
          </button>
        </div>

        <div className="hint" aria-live="polite">
          <span className="mask-line">
            <span className="rise-inner" style={{ '--i': 0 } as React.CSSProperties}>
              {focusedSlot ? t.hintFocus1 : t.hintWalk1}
            </span>
          </span>
          <span className="mask-line">
            <span className="rise-inner" style={{ '--i': 1 } as React.CSSProperties}>
              {focusedSlot ? t.hintFocus2 : t.hintWalk2}
            </span>
          </span>
        </div>

        <div className="toggle" role="tablist" aria-label="View mode">
          <button
            type="button"
            role="tab"
            aria-selected={view === 'gallery'}
            className={`toggle-btn ${view !== 'list' ? 'active' : ''}`}
            onClick={returnToGallery}
          >
            {t.toggleGallery}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'list'}
            className={`toggle-btn ${view === 'list' ? 'active' : ''}`}
            onClick={openList}
          >
            {t.toggleList}
          </button>
        </div>

        <div className="caption">
          <p className="kicker">
            <span className="mask-line">
              <span className="rise-inner" style={{ '--i': 2 } as React.CSSProperties}>
                2025-2026 PARK JUNG HA
              </span>
            </span>
          </p>
          <div className="headline-row" ref={headlineRowRef}>
            <h1 className="headline" ref={headlineRef}>
              <span className="mask-line">
                <span className="rise-inner" style={{ '--i': 3 } as React.CSSProperties}>
                  PORTFOLIO
                </span>
              </span>
            </h1>
            <button
              type="button"
              className="enter-link"
              onClick={openList}
            >
              <span className="mask-line-inline">
                <span className="rise-inner" style={{ '--i': 4 } as React.CSSProperties}>
                  {t.enterCollection}
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Floating Pill */}
      <div
        id="pill"
        className={
          pill.visible && view === 'gallery' && focusedSlot ? 'visible' : ''
        }
        style={{ left: `${pill.x}px`, top: `${pill.y}px` }}
        aria-hidden="true"
      >
        {t.pillOpen}
      </div>

      {/* Flyer for Print Transition */}
      {flyer && (
        <div
          ref={flyerElRef}
          style={{
            position: 'fixed',
            left: `${flyer.startRect.left}px`,
            top: `${flyer.startRect.top}px`,
            width: `${flyer.startRect.width}px`,
            height: `${flyer.startRect.height}px`,
            transformOrigin: 'top left',
            zIndex: 28,
            pointerEvents: 'none',
          }}
        >
          <ArtCrop printIndex={flyer.printIndex} className="w-full h-full" />
        </div>
      )}

      {/* 5. Print Product Page */}
      <section
        id="page"
        ref={pageRef}
        className={view === 'page' ? 'open' : ''}
        aria-hidden={view !== 'page'}
      >
        <div className="page-wrap">
          <div
            className={`page-left ${activePrint.frameOrientation === 'landscape' ? 'landscape' : ''}`}
          >
            <button
              type="button"
              ref={pageArtRef}
              className={`page-art-frame ${activePrint.frameOrientation === 'landscape' ? 'landscape' : ''}`}
              style={{ opacity: pageImageVisible ? 1 : 0 }}
              aria-label={`${getPrintTitle(activePrint)} — ${t.openZoomLabel}`}
              onClick={() => {
                setZoomScale(1);
                setCarouselIndex(0);
                setZoomOpen(true);
              }}
            >
              <ArtCrop
                printIndex={activePrint.index}
                className="w-full h-full"
                ariaLabel={`${getPrintTitle(activePrint)} — ${getPrintArtist(activePrint)}`}
              />
              <span className="page-art-zoom-badge" aria-hidden="true">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="11" y1="8" x2="11" y2="14" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </span>
            </button>

            <div
              className={`page-meta-row ${activePrint.frameOrientation === 'landscape' ? 'landscape' : ''}`}
              style={{ opacity: detailsVisible ? 1 : 0 }}
            >
              <span>1/1</span>
              <button
                type="button"
                className="page-view-room"
                onClick={() => {
                  setZoomScale(1);
                  setCarouselIndex(0);
                  setZoomOpen(true);
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    width: 'max(15px, calc(17 * var(--w)))',
                    height: 'max(15px, calc(17 * var(--w)))',
                  }}
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="11" y1="8" x2="11" y2="14" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
                <span>{t.viewDetails}</span>
              </button>
              <button
                type="button"
                aria-label={
                  savedPrints.includes(activePrint.index)
                    ? lang === 'KOR'
                      ? '북마크 해제'
                      : 'Remove bookmark'
                    : lang === 'KOR'
                      ? '작품 북마크'
                      : 'Bookmark print'
                }
                onClick={() => toggleSaved(activePrint.index)}
                style={{
                  minWidth: '24px',
                  minHeight: '24px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill={
                    savedPrints.includes(activePrint.index)
                      ? 'currentColor'
                      : 'none'
                  }
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    width: 'max(15px, calc(17 * var(--w)))',
                    height: 'max(15px, calc(17 * var(--w)))',
                  }}
                  aria-hidden="true"
                >
                  <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
                </svg>
              </button>
            </div>
          </div>

          <div
            className="page-right"
            style={{ opacity: detailsVisible ? 1 : 0 }}
          >
            <h2 className="page-title">{getPrintTitle(activePrint)}</h2>
            <div className="page-artist spaced">
              {getPrintArtist(activePrint)}
            </div>
            <p className="page-desc">{getPrintDesc(activePrint)}</p>

            {activePrint.projectMeta && activePrint.projectMeta.length > 0 && (
              <dl className="page-project-meta">
                {activePrint.projectMeta.map((row, idx) => (
                  <div key={idx} className="page-project-meta-row">
                    <dt className="page-project-meta-label">
                      {lang === 'KOR' ? row.labelKo : row.label}
                    </dt>
                    <dd className="page-project-meta-val">
                      {lang === 'KOR' ? row.valueKo : row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>

        {/* Collection band */}
        <div
          className="collection-band"
          style={{ opacity: detailsVisible ? 1 : 0 }}
        >
          <h3 className="collection-heading">{t.collectionHeading}</h3>
          <div className="collection-row">
            {collectionCards.map((p) => (
              <button
                key={p.index}
                type="button"
                className={`print-card ${p.frameOrientation === 'landscape' ? 'landscape' : ''}`}
                onClick={(e) => handleOpenFromCard(p.index, e.currentTarget, true)}
              >
                <div
                  className={`print-card-art ${p.frameOrientation === 'landscape' ? 'landscape' : ''}`}
                >
                  <ArtCrop printIndex={p.index} className="w-full h-full" />
                </div>
                <div className="print-card-title">{getPrintTitle(p)}</div>
                <div className="print-card-artist">{getPrintArtist(p)}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 6. List View */}
      <section
        id="list"
        className={view === 'list' ? 'open' : ''}
        aria-hidden={view !== 'list'}
      >
        <h2 className="list-heading">{t.listHeading}</h2>
        <div className="list-grid">
          {PRINTS.map((p) => (
            <button
              key={p.index}
              type="button"
              className={`print-card ${p.frameOrientation === 'landscape' ? 'landscape' : ''}`}
              onClick={(e) => handleOpenFromCard(p.index, e.currentTarget, false)}
            >
              <div
                className={`print-card-art ${p.frameOrientation === 'landscape' ? 'landscape' : ''}`}
              >
                <ArtCrop printIndex={p.index} className="w-full h-full" />
              </div>
              <div className="print-card-title">{getPrintTitle(p)}</div>
              <div className="print-card-artist">{getPrintArtist(p)}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Search Overlay (⌘K) */}
      {searchOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            background: 'rgba(58, 53, 80, 0.25)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '12vh',
          }}
          onClick={() => setSearchOpen(false)}
        >
          <div
            style={{
              width: 'min(520px, 92vw)',
              background: 'var(--page)',
              border: '1px solid var(--ink-35)',
              padding: '20px',
              boxShadow: '0 18px 48px rgba(58, 53, 80, 0.16)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--ink-15)', paddingBottom: '12px' }}>
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'var(--serif)',
                  fontSize: '16px',
                  color: 'var(--ink)',
                }}
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                style={{ fontFamily: 'var(--mono)', fontSize: '11px', padding: '4px 8px' }}
              >
                ESC
              </button>
            </div>
            <div style={{ maxHeight: '340px', overflowY: 'auto', marginTop: '10px' }}>
              {filteredSearchPrints.map((p) => (
                <button
                  key={p.index}
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    openPrintWithFlyer(
                      p.index,
                      {
                        left: window.innerWidth / 2 - 90,
                        top: window.innerHeight / 2 - 120,
                        width: 180,
                        height: 240,
                      },
                      view === 'page',
                    );
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '10px 6px',
                    borderBottom: '1px solid var(--ink-15)',
                    textAlign: 'left',
                  }}
                >
                  <div
                    style={{
                      width: p.frameOrientation === 'landscape' ? '56px' : '42px',
                      aspectRatio: p.frameOrientation === 'landscape' ? '638 / 477' : '3 / 4',
                      flexShrink: 0,
                    }}
                  >
                    <ArtCrop printIndex={p.index} className="w-full h-full" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>
                      {getPrintTitle(p)}
                    </div>
                    <div style={{ fontSize: '13px', fontStyle: 'italic', color: 'var(--ink-60)' }}>
                      {getPrintArtist(p)} · {p.year}
                    </div>
                  </div>
                </button>
              ))}
              {filteredSearchPrints.length === 0 && (
                <div style={{ padding: '20px 0', textAlign: 'center', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--ink-60)' }}>
                  {t.searchEmpty(searchQuery)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Artwork Enlarge / Zoom Lightbox Modal */}
      {zoomOpen &&
        (() => {
          const gallerySlides = activePrint.galleryImages ?? [];
          const carouselSlides = activePrint.carouselImages ?? [];
          const hasGallery =
            gallerySlides.length > 0 || carouselSlides.length > 0;
          const carouselTotal = carouselSlides.length;
          const safeCarouselIdx =
            carouselTotal > 0 ? Math.min(carouselIndex, carouselTotal - 1) : 0;

          return (
            <div
              className="zoom-backdrop"
              role="dialog"
              aria-modal="true"
              aria-labelledby="zoom-modal-title"
              onClick={() => setZoomOpen(false)}
            >
              <div
                className={`zoom-modal ${hasGallery ? 'has-gallery' : ''}`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="zoom-header">
                  <div className="zoom-title-group">
                    <h3 id="zoom-modal-title" className="zoom-title">
                      {getPrintTitle(activePrint)}
                    </h3>
                    <span className="zoom-meta">
                      {getPrintArtist(activePrint)} · {activePrint.year}
                    </span>
                  </div>
                  <div className="zoom-controls">
                    <button
                      type="button"
                      className={`zoom-toggle-btn ${zoomScale === 2 ? 'active' : ''}`}
                      onClick={() => setZoomScale((prev) => (prev === 1 ? 2 : 1))}
                    >
                      {zoomScale === 1 ? t.zoomInLabel : t.zoomOutLabel}
                    </button>
                    <button
                      type="button"
                      className="zoom-close-btn"
                      onClick={() => setZoomOpen(false)}
                      aria-label="Close enlarged artwork"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div
                  ref={zoomStageRef}
                  className={`zoom-stage ${hasGallery ? 'gallery-mode' : ''}`}
                >
                  {hasGallery ? (
                    <div
                      className={`zoom-gallery-feed ${zoomScale === 2 ? 'detail' : 'fit'}`}
                    >
                      {gallerySlides.map((slide, idx) => {
                        const caption = lang === 'KOR' ? slide.captionKo : slide.caption;
                        const isVideo = /\.(mp4|webm|mov)(\?.*)?$/i.test(slide.src);
                        if (isVideo) {
                          return (
                            <div
                              key={slide.src}
                              className="zoom-feed-item"
                            >
                              <video
                                src={slide.src}
                                className="zoom-slide-img"
                                autoPlay
                                loop
                                muted
                                playsInline
                                controls
                                aria-label={`${getPrintTitle(activePrint)} ${idx + 1} — ${caption}`}
                              />
                            </div>
                          );
                        }
                        return (
                          <button
                            key={slide.src}
                            type="button"
                            className={`zoom-feed-item ${zoomScale === 2 ? 'detail' : 'fit'}`}
                            onClick={() => setZoomScale((prev) => (prev === 1 ? 2 : 1))}
                            aria-label={`${caption} — ${zoomScale === 1 ? t.zoomInLabel : t.zoomOutLabel}`}
                          >
                            <img
                              src={slide.src}
                              alt={`${getPrintTitle(activePrint)} ${idx + 1} — ${caption}`}
                              className="zoom-slide-img"
                              draggable={false}
                            />
                          </button>
                        );
                      })}

                      {carouselTotal > 0 && (
                        <div className="zoom-carousel-card">
                          <div className="zoom-carousel-top">
                            <span className="zoom-carousel-label">
                              {t.carouselHeading}
                            </span>
                            <span className="zoom-carousel-counter">
                              {String(safeCarouselIdx + 1).padStart(2, '0')} /{' '}
                              {String(carouselTotal).padStart(2, '0')}
                            </span>
                          </div>

                          <div className="zoom-carousel-stage">
                            {carouselTotal > 1 && (
                              <button
                                type="button"
                                className="zoom-carousel-arrow prev"
                                aria-label={t.prevSlideLabel}
                                onClick={() =>
                                  setCarouselIndex(
                                    (prev) => (prev - 1 + carouselTotal) % carouselTotal,
                                  )
                                }
                              >
                                ‹
                              </button>
                            )}

                            <div
                              className={`zoom-carousel-viewport ${activePrint.carouselAspect === 'portrait' ? 'portrait' : ''}`}
                            >
                              <img
                                src={carouselSlides[safeCarouselIdx]}
                                alt={`${getPrintTitle(activePrint)} ${t.carouselHeading} ${safeCarouselIdx + 1}`}
                                className="zoom-carousel-img"
                                draggable={false}
                              />
                            </div>

                            {carouselTotal > 1 && (
                              <button
                                type="button"
                                className="zoom-carousel-arrow next"
                                aria-label={t.nextSlideLabel}
                                onClick={() =>
                                  setCarouselIndex((prev) => (prev + 1) % carouselTotal)
                                }
                              >
                                ›
                              </button>
                            )}
                          </div>

                          {carouselTotal > 1 && (
                            <div className="zoom-carousel-dots" role="tablist" aria-label={t.carouselHeading}>
                              {carouselSlides.map((src, idx) => (
                                <button
                                  key={src}
                                  type="button"
                                  role="tab"
                                  aria-selected={idx === safeCarouselIdx}
                                  aria-label={`${idx + 1} / ${carouselTotal}`}
                                  className={`zoom-carousel-dot ${idx === safeCarouselIdx ? 'active' : ''}`}
                                  onClick={() => setCarouselIndex(idx)}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : activePrint.customImage ? (
                    <button
                      type="button"
                      className={`zoom-art-btn custom ${zoomScale === 2 ? 'detail' : 'fit'}`}
                      onClick={() => setZoomScale((prev) => (prev === 1 ? 2 : 1))}
                      aria-label={zoomScale === 1 ? t.zoomInLabel : t.zoomOutLabel}
                    >
                      <img
                        src={activePrint.customImage}
                        alt={`${getPrintTitle(activePrint)} — ${getPrintArtist(activePrint)}`}
                        className="zoom-slide-img"
                        draggable={false}
                      />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={`zoom-art-btn ${zoomScale === 2 ? 'detail' : 'fit'}`}
                      onClick={() => setZoomScale((prev) => (prev === 1 ? 2 : 1))}
                      aria-label={zoomScale === 1 ? t.zoomInLabel : t.zoomOutLabel}
                    >
                      <ArtCrop
                        printIndex={activePrint.index}
                        className="w-full h-full"
                        ariaLabel={`${getPrintTitle(activePrint)} — ${getPrintArtist(activePrint)}`}
                      />
                    </button>
                  )}
                </div>

                <div className="zoom-footer">
                  {gallerySlides.length > 0
                    ? t.zoomGalleryHint
                    : carouselTotal > 0
                      ? t.zoomCarouselHint
                      : t.zoomHint}
                </div>
              </div>
            </div>
          );
        })()}

      {/* Profile Modal */}
      {infoModal === 'account' && (
        <div
          className="profile-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-modal-title"
          onClick={() => setInfoModal(null)}
        >
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-head">
              <div className="profile-modal-title-wrap">
                <h3 id="profile-modal-title" className="profile-modal-title">
                  {t.accountTitle}
                </h3>
              </div>
              <button
                type="button"
                className="profile-modal-close"
                onClick={() => setInfoModal(null)}
                aria-label="Close profile"
              >
                ×
              </button>
            </div>

            <div className="profile-grid">
              <div className="profile-photo-frame">
                <img
                  src="/assets/aistudio/KakaoTalk_20261104_113926602_01a30991.jpg"
                  alt={t.profile.name}
                  className="profile-photo"
                />
              </div>

              <div className="profile-right">
                <div className="profile-details-grid">
                  <section>
                    <h4 className="profile-section-label">{t.profile.profileHeading}</h4>
                    <div className="profile-block-list">
                      <div className="profile-name">{t.profile.name}</div>
                      <div className="profile-role">{t.profile.role}</div>
                      <div className="profile-location">{t.profile.location}</div>
                    </div>
                  </section>

                  <section>
                    <h4 className="profile-section-label">{t.profile.educationHeading}</h4>
                    <ul className="profile-block-list">
                      {t.profile.education.map((item, idx) => (
                        <li key={idx}>
                          <span>{item.line}</span>
                          {'sub' in item && item.sub && (
                            <span className="profile-edu-sub">{item.sub}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section>
                    <h4 className="profile-section-label">{t.profile.certificateHeading}</h4>
                    <ul className="profile-block-list">
                      {t.profile.certificates.map((cert, idx) => (
                        <li key={idx}>{cert}</li>
                      ))}
                    </ul>
                  </section>

                  <section>
                    <h4 className="profile-section-label">{t.profile.toolsHeading}</h4>
                    <div className="profile-tools-list">
                      {t.profile.tools.map((tool) => (
                        <span key={tool} className="profile-tool-tag">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </section>
                </div>

                <section className="profile-about">
                  <p className="profile-about-lead">{t.profile.aboutLead}</p>
                  {t.profile.aboutParagraphs.map((para, idx) => (
                    <p key={idx} className="profile-about-body">
                      {para}
                    </p>
                  ))}
                </section>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved Prints Modal */}
      {infoModal === 'saved' && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            background: 'rgba(58, 53, 80, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setInfoModal(null)}
        >
          <div
            style={{
              width: 'min(480px, 92vw)',
              background: 'var(--page)',
              border: '1px solid var(--ink-35)',
              padding: '28px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontFamily: 'var(--cond)', fontSize: '24px', textTransform: 'uppercase' }}>
                {t.savedTitle}
              </h3>
              <button
                type="button"
                onClick={() => setInfoModal(null)}
                style={{ fontSize: '20px', minWidth: '28px', minHeight: '28px' }}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div>
              {savedPrints.length === 0 ? (
                <p style={{ margin: 0, fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--ink-60)' }}>
                  {t.savedEmpty}
                </p>
              ) : (
                savedPrints.map((idx) => {
                  const p = PRINTS[idx];
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setInfoModal(null);
                        openPrintWithFlyer(
                          idx,
                          {
                            left: window.innerWidth / 2 - 90,
                            top: window.innerHeight / 2 - 120,
                            width: 180,
                            height: 240,
                          },
                          view === 'page',
                        );
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 0',
                        borderBottom: '1px solid var(--ink-15)',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ width: '44px', aspectRatio: '3 / 4' }}>
                        <ArtCrop printIndex={idx} className="w-full h-full" />
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 500 }}>
                          {getPrintTitle(p)}
                        </div>
                        <div style={{ fontSize: '13px', fontStyle: 'italic', color: 'var(--ink-60)' }}>
                          {getPrintArtist(p)}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {infoModal === 'contact' && (
        <div
          className="contact-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-modal-title"
          onClick={() => setInfoModal(null)}
        >
          <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
            <div className="contact-modal-head">
              <div>
                <h3 id="contact-modal-title" className="contact-modal-title">
                  {t.contactTitle}
                </h3>
              </div>
              <button
                type="button"
                className="contact-modal-close"
                onClick={() => setInfoModal(null)}
                aria-label="Close contact"
              >
                ×
              </button>
            </div>

            <p className="contact-lead">{t.contactLead}</p>

            <div className="contact-direct-card">
              <div className="contact-direct-meta">
                <span className="contact-label">{t.contactEmailLabel}</span>
                <a href="mailto:bu_ge2@naver.com" className="contact-email-link">
                  bu_ge2@naver.com
                </a>
              </div>
              <button
                type="button"
                className="contact-copy-btn"
                onClick={handleCopyContactEmail}
              >
                {contactCopied ? t.contactCopied : t.contactCopy}
              </button>
            </div>

            <form
              className="contact-form"
              onSubmit={(e) => {
                e.preventDefault();
                setContactSent(true);
                const a = document.createElement('a');
                a.href = contactMailtoHref;
                a.click();
              }}
            >
              <label className="contact-field">
                <span className="contact-field-label">{t.contactNameLabel}</span>
                <input
                  type="text"
                  className="contact-input"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder={t.contactNamePlaceholder}
                />
              </label>

              <label className="contact-field">
                <span className="contact-field-label">{t.contactReplyLabel}</span>
                <input
                  type="email"
                  className="contact-input"
                  value={contactReplyEmail}
                  onChange={(e) => setContactReplyEmail(e.target.value)}
                  placeholder={t.contactReplyPlaceholder}
                />
              </label>

              <label className="contact-field">
                <span className="contact-field-label">{t.contactMessageLabel}</span>
                <textarea
                  rows={4}
                  required
                  className="contact-textarea"
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder={t.contactMessagePlaceholder}
                />
              </label>

              {contactSent && <p className="contact-sent-note">{t.contactSentNote}</p>}

              <button type="submit" className="contact-submit-btn">
                {t.contactSendBtn}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
