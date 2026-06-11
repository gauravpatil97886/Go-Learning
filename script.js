/* ═══════════════════════════════════════════════════════════════
   GoForge — script.js
   "Forge Your Go Mastery"
   Full SPA: markdown rendering, sidebar navigation, search,
   theme toggling, progress tracking, bookmarks, hash routing,
   table of contents, reading progress, stats modal.
   © 2026 Gaurav Patil — GoForge Platform. All Rights Reserved.
   ═══════════════════════════════════════════════════════════════ */

/* ── PLATFORM CONFIG ─────────────────────────────────────────── */
const PLATFORM = {
  name:      'GoForge',
  tagline:   'Forge Your Go Mastery',
  version:   '2.0',
  copyright: '© 2026 Gaurav Patil — GoForge Platform. All Rights Reserved.',
};

/* ── SVG ICON LIBRARY (Lucide-style, 20×20 @ 24 viewBox) ─────── */
const ICONS = {
  foundations:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
  intermediate:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  concurrency:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  advanced:       `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
  applications:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  patterns:       `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  practice:       `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,
  interview:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
  'ctc-prep':     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  'system-design':`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>`,
  'dsa-go':       `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>`,
  blogs:          `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  goroutine:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  channel:        `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  target:         `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  search:         `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  progress:       `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  moon:           `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  offline:        `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 17l4 4 4-4"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/></svg>`,
  diagram:        `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>`,
  gesture:        `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
  play:           `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
  arrow:          `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,
};

/* ── NAVIGATION DATA ─────────────────────────────────────────── */
const NAVIGATION = [
  { id: 'foundations', title: 'Foundations', color: '#00ACD7',
    desc: 'Variables, types, functions, interfaces & error handling.',
    topics: [
      { title: 'Getting Started',     path: '01-foundations/01-getting-started.md' },
      { title: 'Variables & Types',   path: '01-foundations/02-variables-types.md' },
      { title: 'Functions & Methods', path: '01-foundations/03-functions-methods.md' },
      { title: 'Interfaces',          path: '01-foundations/04-interfaces.md' },
      { title: 'Error Handling',      path: '01-foundations/05-error-handling.md' },
      { title: 'Control Flow',        path: '01-foundations/06-control-flow.md' },
      { title: 'Closures',            path: '01-foundations/07-closures.md' },
      { title: 'Strings & Runes',     path: '01-foundations/08-strings-runes.md' },
    ]},
  { id: 'intermediate', title: 'Intermediate', color: '#7c3aed',
    desc: 'Packages, pointers, structs, slices, maps & type system.',
    topics: [
      { title: 'Packages & Modules',  path: '02-intermediate/01-packages-modules.md' },
      { title: 'Pointers & Memory',   path: '02-intermediate/02-pointers-memory.md' },
      { title: 'Structs & Embedding', path: '02-intermediate/03-structs-embedding.md' },
      { title: 'Arrays & Slices',     path: '02-intermediate/04-arrays-slices.md' },
      { title: 'Maps',                path: '02-intermediate/05-maps.md' },
      { title: 'Type System',         path: '02-intermediate/06-type-system.md' },
    ]},
  { id: 'concurrency', title: 'Concurrency', color: '#f59e0b',
    desc: 'Goroutines, channels, select, sync primitives & context.',
    topics: [
      { title: 'Concurrency Basics',  path: '03-concurrency/01-foundations.md' },
      { title: 'Goroutines',          path: '03-concurrency/02-goroutines.md' },
      { title: 'Channels',            path: '03-concurrency/03-channels.md' },
      { title: 'Select Statement',    path: '03-concurrency/04-select.md' },
      { title: 'Sync Primitives',     path: '03-concurrency/05-sync-primitives.md' },
      { title: 'Atomic Operations',   path: '03-concurrency/06-atomic.md' },
      { title: 'Context Package',     path: '03-concurrency/07-context.md' },
      { title: 'Advanced Patterns',   path: '03-concurrency/08-advanced-patterns.md' },
    ]},
  { id: 'advanced', title: 'Advanced', color: '#10b981',
    desc: 'Generics, reflection, testing, memory & performance.',
    topics: [
      { title: 'Generics',                 path: '04-advanced/01-generics.md' },
      { title: 'Reflection',               path: '04-advanced/02-reflection.md' },
      { title: 'Testing & Benchmarking',   path: '04-advanced/03-testing-benchmarking.md' },
      { title: 'Memory & GC',              path: '04-advanced/04-memory-gc.md' },
      { title: 'Performance',              path: '04-advanced/05-performance.md' },
    ]},
  { id: 'applications', title: 'Applications', color: '#ef4444',
    desc: 'HTTP servers, REST APIs, databases, microservices & CLI.',
    topics: [
      { title: 'HTTP & Web Servers', path: '05-applications/01-http-web.md' },
      { title: 'REST API Design',    path: '05-applications/02-rest-api.md' },
      { title: 'Databases',          path: '05-applications/03-databases.md' },
      { title: 'Microservices',      path: '05-applications/04-microservices.md' },
      { title: 'CLI Tools',          path: '05-applications/05-cli-tools.md' },
    ]},
  { id: 'patterns', title: 'Patterns', color: '#8b5cf6',
    desc: 'Design patterns, concurrency patterns & functional style.',
    topics: [
      { title: 'Design Patterns',       path: '06-patterns/01-design-patterns.md' },
      { title: 'Concurrency Patterns',  path: '06-patterns/02-concurrency-patterns.md' },
      { title: 'Error Patterns',        path: '06-patterns/03-error-patterns.md' },
      { title: 'Functional Patterns',   path: '06-patterns/04-functional-patterns.md' },
    ]},
  { id: 'practice', title: 'Practice', color: '#06b6d4',
    desc: 'Hands-on coding exercises at every difficulty level.',
    topics: [
      { title: 'Variables & Types',        path: 'coding-practice/foundations/01-variables-types.md', level: 'mixed' },
      { title: 'Functions & Closures',     path: 'coding-practice/foundations/02-functions-closures.md', level: 'mixed' },
      { title: 'Interfaces Practice',      path: 'coding-practice/foundations/03-interfaces.md', level: 'mixed' },
      { title: 'Error Handling Practice',  path: 'coding-practice/foundations/04-error-handling.md', level: 'mixed' },
      { title: 'Arrays & Slices',          path: 'coding-practice/intermediate/01-arrays-slices.md', level: 'mixed' },
      { title: 'Maps Practice',            path: 'coding-practice/intermediate/02-maps.md', level: 'mixed' },
      { title: 'Structs Practice',         path: 'coding-practice/intermediate/03-structs.md', level: 'mixed' },
      { title: 'Goroutines Practice',      path: 'coding-practice/concurrency/01-goroutines.md', level: 'mixed' },
      { title: 'Channels Practice',        path: 'coding-practice/concurrency/02-channels.md', level: 'mixed' },
      { title: 'Sync Primitives',          path: 'coding-practice/concurrency/03-sync-primitives.md', level: 'mixed' },
      { title: 'Context Practice',         path: 'coding-practice/concurrency/04-context.md', level: 'mixed' },
      { title: 'Concurrency Patterns',     path: 'coding-practice/concurrency/05-patterns.md', level: 'mixed' },
      { title: 'Debug This: Real Bugs',    path: 'coding-practice/concurrency/06-debugging-exercises.md', level: 'advanced' },
      { title: 'Generics Practice',        path: 'coding-practice/advanced/01-generics.md', level: 'mixed' },
      { title: 'Testing Practice',         path: 'coding-practice/advanced/02-testing.md', level: 'mixed' },
      { title: 'HTTP APIs Practice',       path: 'coding-practice/applications/01-http-apis.md', level: 'mixed' },
      { title: 'Databases Practice',       path: 'coding-practice/applications/02-databases.md', level: 'mixed' },
    ]},
  { id: 'interview', title: 'Interview', color: '#f97316',
    desc: 'Google, Uber, Stripe-style Q&A and system design challenges.',
    topics: [
      { title: 'Beginner Q&A',           path: 'interview-prep/beginner.md',                level: 'beginner' },
      { title: 'Intermediate Q&A',       path: 'interview-prep/intermediate.md',            level: 'intermediate' },
      { title: 'Advanced Q&A',           path: 'interview-prep/advanced.md',                level: 'advanced' },
      { title: 'Concurrency Interviews', path: 'interview-prep/concurrency-interviews.md',  level: 'advanced' },
      { title: 'Behavioral (STAR)',      path: 'interview-prep/behavioral.md',              level: 'mixed' },
      { title: 'Google Style',           path: 'interview-prep/company-google.md',          level: 'advanced' },
      { title: 'Amazon Style',           path: 'interview-prep/company-amazon.md',          level: 'advanced' },
      { title: 'Microsoft Style',        path: 'interview-prep/company-microsoft.md',       level: 'advanced' },
      { title: 'Uber Style',             path: 'interview-prep/company-uber.md',            level: 'advanced' },
      { title: 'Stripe Style',           path: 'interview-prep/company-stripe.md',          level: 'advanced' },
      { title: 'Razorpay Style',         path: 'interview-prep/company-razorpay.md',        level: 'advanced' },
    ]},
  { id: 'ctc-prep', title: 'CTC Prep', color: '#f59e0b',
    desc: 'Band-by-band roadmap: crack 10 LPA, 20 LPA, 30+ LPA roles.',
    topics: [
      { title: 'CTC Roadmap Overview',   path: 'ctc-prep/roadmap.md',       level: 'mixed' },
      { title: '8–15 LPA Guide',         path: 'ctc-prep/10-15-lpa.md',     level: 'intermediate' },
      { title: '15–25 LPA Guide',        path: 'ctc-prep/15-25-lpa.md',     level: 'advanced' },
      { title: '25+ LPA Senior Guide',   path: 'ctc-prep/25-plus-lpa.md',   level: 'advanced' },
    ]},
  { id: 'system-design', title: 'System Design', color: '#06b6d4',
    desc: 'Architecture, scale, databases, caching, full case studies.',
    topics: [
      { title: 'SD Fundamentals',        path: 'system-design/01-fundamentals.md',         level: 'advanced' },
      { title: 'Databases & Storage',    path: 'system-design/02-databases-storage.md',    level: 'advanced' },
      { title: 'Caching & Messaging',    path: 'system-design/03-caching-messaging.md',    level: 'advanced' },
      { title: 'Case Studies',           path: 'system-design/04-case-studies.md',         level: 'advanced' },
    ]},
  { id: 'dsa-go', title: 'DSA in Go', color: '#ec4899',
    desc: 'LeetCode-style problems solved in idiomatic Go — arrays to DP.',
    topics: [
      { title: 'Arrays & Strings',       path: 'dsa-go/01-arrays-strings.md',      level: 'mixed' },
      { title: 'Trees & Graphs',         path: 'dsa-go/02-trees-graphs.md',        level: 'mixed' },
      { title: 'Dynamic Programming',    path: 'dsa-go/03-dynamic-programming.md', level: 'advanced' },
      { title: 'Concurrent DS & Heap',   path: 'dsa-go/04-concurrency-ds.md',      level: 'advanced' },
    ]},
  { id: 'blogs', title: 'Industry Blogs', color: '#34D058',
    desc: 'Real engineering blogs from companies running Go in production.',
    topics: [
      { title: 'Engineering Blogs', path: '__blogs__' },
    ]},
];

/* ── HOME PAGE DATA ──────────────────────────────────────────── */
/* Goal-oriented entry points. `sections` drives the lesson count. */
const HOME_PATHS = [
  { title: 'Learn Go from Zero', color: '#00ACD7', icon: 'foundations',
    desc: 'Syntax to production patterns — the full curriculum in reading order.',
    sections: ['foundations', 'intermediate', 'concurrency', 'advanced', 'applications', 'patterns'],
    metaNote: 'lessons', target: '01-foundations/01-getting-started.md' },
  { title: 'Crack the Interview', color: '#f97316', icon: 'interview',
    desc: 'Company-style Q&A, behavioral rounds and CTC-band roadmaps.',
    sections: ['interview', 'ctc-prep'],
    metaNote: 'guides · 6 companies', target: 'interview-prep/beginner.md' },
  { title: 'Master DSA in Go', color: '#ec4899', icon: 'dsa-go',
    desc: '100 LeetCode-style problems solved in idiomatic Go.',
    sections: ['dsa-go'],
    metaNote: 'tracks · 100 problems', target: 'dsa-go/01-arrays-strings.md' },
  { title: 'Design Systems at Scale', color: '#06b6d4', icon: 'system-design',
    desc: 'Architecture, storage, caching and complete case studies.',
    sections: ['system-design'],
    metaNote: 'modules · 5 case studies', target: 'system-design/01-fundamentals.md' },
];

/* The six practice difficulty levels (colors come from --l1…--l6 tokens). */
const HOME_LEVELS = [
  { lvl: 'L1', name: 'Beginner',   note: 'Syntax & basics',   path: 'coding-practice/foundations/01-variables-types.md' },
  { lvl: 'L2', name: 'Easy',       note: 'Apply concepts',    path: 'coding-practice/foundations/02-functions-closures.md' },
  { lvl: 'L3', name: 'Medium',     note: 'Combine ideas',     path: 'coding-practice/intermediate/01-arrays-slices.md' },
  { lvl: 'L4', name: 'Advanced',   note: 'Tricky & deep',     path: 'coding-practice/concurrency/01-goroutines.md' },
  { lvl: 'L5', name: 'Interview',  note: 'Company-style',     path: 'coding-practice/concurrency/05-patterns.md' },
  { lvl: 'L6', name: 'Production', note: 'Real-world bugs',   path: 'coding-practice/concurrency/06-debugging-exercises.md' },
];

/* Platform capabilities shown in the home feature strip. */
const HOME_FEATURES = [
  { icon: 'search',   title: 'Fuzzy Search',        desc: 'Jump to any topic with Ctrl + K', action: 'openSearch()' },
  { icon: 'progress', title: 'Progress Tracking',   desc: 'Every finished topic, remembered locally' },
  { icon: 'moon',     title: 'Dark & Light Themes', desc: 'Gold-on-navy or clean paper' },
  { icon: 'offline',  title: 'Offline-Friendly',    desc: 'Lessons cached for instant reloads' },
  { icon: 'diagram',  title: 'Mermaid Diagrams',    desc: 'Architecture rendered inline' },
  { icon: 'gesture',  title: 'Built for Mobile',    desc: 'Gestures, bottom nav, fully responsive' },
];

/* ── APP STATE ───────────────────────────────────────────────── */
const STATE = {
  currentPath:    null,
  progress:       {},
  bookmarks:      [],
  recentTopics:   [],
  searchOpen:     false,
  sidebarOpen:    false,
  searchSelected: -1,
  searchIndex:    [],
  theme:          'dark',
  tocObserver:    null,
};

/* ── CONTENT CACHE (stale-while-revalidate) ──────────────────── */
const CONTENT_CACHE = {
  prefix: 'gf-md-',
  maxEntry: 300 * 1024,          // skip caching files > 300KB
  indexKey: 'gf-md-index',       // LRU order tracking

  get(path) {
    try { return localStorage.getItem(this.prefix + path); } catch { return null; }
  },

  set(path, md) {
    if (md.length > this.maxEntry) return;
    try {
      localStorage.setItem(this.prefix + path, md);
      this.touch(path);
    } catch {
      // Quota exceeded — evict the 5 least recently used entries and retry once
      this.evict(5);
      try { localStorage.setItem(this.prefix + path, md); this.touch(path); } catch {}
    }
  },

  touch(path) {
    try {
      let idx = JSON.parse(localStorage.getItem(this.indexKey) || '[]');
      idx = [path, ...idx.filter(p => p !== path)].slice(0, 60);
      localStorage.setItem(this.indexKey, JSON.stringify(idx));
    } catch {}
  },

  evict(n) {
    try {
      const idx = JSON.parse(localStorage.getItem(this.indexKey) || '[]');
      idx.slice(-n).forEach(p => localStorage.removeItem(this.prefix + p));
      localStorage.setItem(this.indexKey, JSON.stringify(idx.slice(0, -n)));
    } catch {}
  },
};

/* ── LOCAL STORAGE KEYS ──────────────────────────────────────── */
const KEYS = {
  progress:  'gf-progress-v2',
  bookmarks: 'gf-bookmarks-v2',
  recent:    'gf-recent-v2',
  theme:     'gf-theme-v1',
};

/* ── MOBILE BACK-GESTURE MODAL HANDLING ──────────────────────── */
/* Touch devices have no ESC key. When an overlay opens on mobile we
   push a history entry, so the phone's back gesture closes the overlay
   instead of leaving the page. Closing via a button consumes that
   entry silently. */

let _modalHistoryArmed = false;
let _suppressNextPop   = false;

function armModalHistory() {
  if (window.innerWidth > 768 || _modalHistoryArmed) return;
  history.pushState({ gfModal: true }, '');
  _modalHistoryArmed = true;
}

function disarmModalHistory() {
  if (!_modalHistoryArmed) return;
  _modalHistoryArmed = false;
  _suppressNextPop = true;
  history.back();
}

/** Close whichever overlay is open. Returns true if something closed. */
function closeAnyOverlay() {
  if (STATE.searchOpen) { closeSearch(); return true; }
  const stats = document.getElementById('stats-modal');
  if (stats && stats.style.display === 'flex') { closeStatsModal(); return true; }
  const mobToc = document.getElementById('mob-toc-panel');
  if (mobToc && mobToc.classList.contains('open')) { closeMobTOC(); return true; }
  if (STATE.sidebarOpen && window.innerWidth <= 1024) { closeSidebar(); return true; }
  return false;
}

/* ── GLOBAL ERROR REPORTER ───────────────────────────────────── */
/* Any uncaught JS error or promise rejection surfaces as an on-page
   banner with a pre-filled GitHub issue link, so users can report it. */

const ERROR_REPORT_REPO = 'https://github.com/gauravpatil97886/GoForge/issues/new';
let _errorToastCount = 0;

function showErrorToast(message, detail) {
  // Cap simultaneous toasts so an error loop can't flood the page
  if (_errorToastCount >= 3 || !document.body) return;
  _errorToastCount++;

  const issueTitle = encodeURIComponent(`[Bug] ${String(message).slice(0, 80)}`);
  const issueBody = encodeURIComponent(
    `**Error:** ${message}\n\n` +
    `**Details:**\n\`\`\`\n${String(detail || 'n/a').slice(0, 1500)}\n\`\`\`\n\n` +
    `**Page:** ${location.href}\n` +
    `**Browser:** ${navigator.userAgent}\n` +
    `**Time:** ${new Date().toISOString()}`
  );

  const toast = document.createElement('div');
  toast.className = 'error-toast';
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <div class="error-toast-head">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span class="error-toast-title">Something went wrong</span>
      <button class="error-toast-close" aria-label="Dismiss">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="error-toast-msg"></div>
    <div class="error-toast-actions">
      <a href="${ERROR_REPORT_REPO}?title=${issueTitle}&body=${issueBody}" target="_blank" rel="noopener noreferrer" class="error-toast-report">Report this issue</a>
      <button class="error-toast-reload">Reload page</button>
    </div>`;

  toast.querySelector('.error-toast-msg').textContent = String(message).slice(0, 200);
  toast.querySelector('.error-toast-close').addEventListener('click', () => {
    toast.remove();
    _errorToastCount--;
  });
  toast.querySelector('.error-toast-reload').addEventListener('click', () => location.reload());

  document.body.appendChild(toast);

  // Auto-dismiss after 20s
  setTimeout(() => {
    if (toast.isConnected) { toast.remove(); _errorToastCount--; }
  }, 20000);
}

window.addEventListener('error', e => {
  const detail = e.error?.stack || `${e.filename || ''}:${e.lineno || ''}:${e.colno || ''}`;
  showErrorToast(e.message || 'Unknown script error', detail);
});

window.addEventListener('unhandledrejection', e => {
  const reason = e.reason;
  const msg = (reason && reason.message) || String(reason) || 'Unhandled promise rejection';
  showErrorToast(msg, reason && reason.stack);
});

/* ══════════════════════════════════════════════════════════════
   INITIALIZATION
   ══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  if (location.protocol === 'file:') {
    showFileProtocolBanner();
  }
  loadPersistedState();
  loadFontScale();
  initLibraries();
  buildSearchIndex();
  renderNav();
  bindEventListeners();
  handleInitialRoute();
});

function showFileProtocolBanner() {
  const banner = document.createElement('div');
  banner.id = 'file-protocol-banner';
  banner.style.cssText = [
    'position:fixed', 'top:0', 'left:0', 'right:0', 'z-index:9999',
    'background:#c0392b', 'color:#fff', 'padding:10px 16px',
    'font-family:monospace', 'font-size:13px', 'line-height:1.5',
    'display:flex', 'align-items:center', 'justify-content:space-between',
    'gap:12px', 'box-shadow:0 2px 8px rgba(0,0,0,0.4)'
  ].join(';');
  banner.innerHTML = `
    <span>
      ⚠️ <strong>Local file detected:</strong>
      Markdown files cannot be loaded via <code>file://</code> — browsers block fetch() for local files.
      Run a local server: <code>cd /home/choice/Go-Learning && python3 -m http.server 8080</code>
      then open <a href="http://localhost:8080" style="color:#ffe082">http://localhost:8080</a>
    </span>
    <button onclick="this.parentElement.remove()" style="background:transparent;border:1px solid rgba(255,255,255,.5);color:#fff;padding:4px 10px;border-radius:4px;cursor:pointer;white-space:nowrap">✕ Dismiss</button>
  `;
  document.body.prepend(banner);
}

/** Restore state from localStorage */
function loadPersistedState() {
  // Progress
  try {
    const p = JSON.parse(localStorage.getItem(KEYS.progress) || '{}');
    STATE.progress = (p && typeof p === 'object') ? p : {};
  } catch { STATE.progress = {}; }

  // Bookmarks
  try {
    const b = JSON.parse(localStorage.getItem(KEYS.bookmarks) || '[]');
    STATE.bookmarks = Array.isArray(b) ? b : [];
  } catch { STATE.bookmarks = []; }

  // Recent topics
  try {
    const r = JSON.parse(localStorage.getItem(KEYS.recent) || '[]');
    STATE.recentTopics = Array.isArray(r) ? r : [];
  } catch { STATE.recentTopics = []; }

  // Theme: saved → system preference → dark
  const savedTheme = localStorage.getItem(KEYS.theme);
  if (savedTheme === 'light' || savedTheme === 'dark') {
    STATE.theme = savedTheme;
  } else {
    STATE.theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  applyTheme(STATE.theme, false);
}

/** Configure marked.js and mermaid */
function initLibraries() {
  // Custom marked renderer — intercept code blocks for mermaid + copy buttons
  const renderer = new marked.Renderer();

  renderer.code = function (codeOrToken, langArg) {
    // marked v4: code(code, lang)  |  marked v5+: code({text, lang, ...})
    const code = (codeOrToken && typeof codeOrToken === 'object') ? (codeOrToken.text || '') : (codeOrToken || '');
    const lang = (codeOrToken && typeof codeOrToken === 'object') ? codeOrToken.lang : langArg;

    if (lang === 'mermaid') {
      // Literal \n in node labels renders as raw text — convert to <br/> line breaks
      const src = code.replace(/\\n/g, '<br/>');
      return `<div class="mermaid-wrap"><div class="mermaid" data-mermaid-src="${escapeAttr(src)}">${escapeHtml(src)}</div></div>`;
    }
    let highlighted;
    try {
      if (lang && hljs.getLanguage(lang)) {
        highlighted = hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
      } else {
        highlighted = hljs.highlightAuto(code).value;
      }
    } catch {
      highlighted = escapeHtml(code);
    }
    const langLabel = lang || 'text';
    const safeCode  = escapeAttr(code);
    return `<pre><div class="code-block-chrome">
      <span class="code-lang">${escapeHtml(langLabel)}</span>
      <button class="copy-btn" data-raw="${safeCode}" onclick="handleCopyBtn(this)">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        Copy
      </button>
    </div><code class="hljs language-${escapeHtml(langLabel)}">${highlighted}</code></pre>`;
  };

  // Heading renderer — works with both marked v4 and v5+ token API
  renderer.heading = function (textOrToken, levelArg) {
    const text  = (textOrToken && typeof textOrToken === 'object') ? (textOrToken.text || '') : (textOrToken || '');
    const level = (textOrToken && typeof textOrToken === 'object') ? textOrToken.depth : levelArg;
    const slug  = slugify(text);
    return `<h${level} id="${slug}">${text}</h${level}>`;
  };

  marked.use({ renderer, gfm: true, breaks: false });

  // Mermaid
  mermaid.initialize(mermaidConfig(STATE.theme));
}

/** Theme-aware mermaid configuration (shared by init + theme toggle) */
function mermaidConfig(theme) {
  const dark = theme === 'dark';
  return {
    startOnLoad:   false,
    theme:         dark ? 'dark' : 'default',
    securityLevel: 'loose',
    fontFamily:    'JetBrains Mono, monospace',
    // Render at natural size — wide flowcharts scroll instead of shrinking to unreadable
    flowchart: { useMaxWidth: false, htmlLabels: true, curve: 'basis' },
    sequence:  { useMaxWidth: false },
    state:     { useMaxWidth: false },
    er:        { useMaxWidth: false },
    journey:   { useMaxWidth: false },
    themeVariables: dark ? {
      background:         '#141B2D',
      primaryColor:       '#1a2236',
      primaryTextColor:   '#E6EDF3',
      primaryBorderColor: '#00ACD7',
      lineColor:          '#8B949E',
      secondaryColor:     '#1F2940',
      tertiaryColor:      '#10182B',
      fontSize:           '15px',
      fontFamily:         'JetBrains Mono, monospace',
    } : {
      background:         '#FFFFFF',
      primaryColor:       '#EDF4FB',
      primaryTextColor:   '#1C1A14',
      primaryBorderColor: '#0369A1',
      lineColor:          '#475569',
      secondaryColor:     '#F4EFE3',
      tertiaryColor:      '#FAFAF7',
      fontSize:           '15px',
      fontFamily:         'JetBrains Mono, monospace',
    },
  };
}

/** Build flat search index from NAVIGATION */
function buildSearchIndex() {
  STATE.searchIndex = [];
  for (const section of NAVIGATION) {
    for (const topic of section.topics) {
      STATE.searchIndex.push({
        title:     topic.title,
        path:      topic.path,
        section:   section.title,
        sectionId: section.id,
        icon:      ICONS[section.id] || ICONS.foundations,
        color:     section.color,
        level:     topic.level || null,
      });
    }
  }
}

/** Handle initial URL hash or show welcome */
function handleInitialRoute() {
  const hash = location.hash.slice(1);
  if (hash) {
    const match = STATE.searchIndex.find(t => t.path === hash);
    if (match) {
      loadTopic(match.path, false);
      return;
    }
  }
  showWelcome();
}

/* ══════════════════════════════════════════════════════════════
   NAVIGATION RENDERING
   ══════════════════════════════════════════════════════════════ */

/** Build the full sidebar nav tree */
function renderNav() {
  const nav = document.getElementById('nav-tree');
  if (!nav) return;
  nav.innerHTML = '';
  for (const section of NAVIGATION) {
    nav.appendChild(buildSectionEl(section));
  }
  updateProgressDisplay();
  updateSidebarStats();
}

/** Create a collapsible sidebar section */
function buildSectionEl(section) {
  const wrapper  = document.createElement('div');
  wrapper.className = 'nav-section';
  wrapper.dataset.id = section.id;

  const hasActive = section.topics.some(t => t.path === STATE.currentPath);
  if (hasActive) wrapper.classList.add('open');

  // Section header
  const header = document.createElement('div');
  header.className = 'nav-section-header';
  header.setAttribute('role', 'button');
  header.setAttribute('tabindex', '0');
  header.setAttribute('aria-expanded', String(hasActive));
  header.innerHTML = `
    <span class="nav-section-dot" style="background:${section.color};color:${section.color}"></span>
    <span class="nav-section-icon" style="color:${section.color}">${ICONS[section.id] || ICONS.foundations}</span>
    <span class="nav-section-title">${escapeHtml(section.title)}</span>
    <span class="nav-section-count" style="--count-color:${section.color}">${section.topics.length}</span>
    <svg class="nav-chevron" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <path d="m9 18 6-6-6-6"/>
    </svg>`;

  header.addEventListener('click', () => toggleSection(wrapper));
  header.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection(wrapper); }
  });

  // Topics list
  const topicList = document.createElement('div');
  topicList.className = 'nav-topics';
  topicList.style.display = hasActive ? 'block' : 'none';

  for (const topic of section.topics) {
    topicList.appendChild(buildTopicItem(topic));
  }

  wrapper.appendChild(header);
  wrapper.appendChild(topicList);
  return wrapper;
}

/** Build a single nav topic item */
function buildTopicItem(topic) {
  const item = document.createElement('div');
  item.className = 'nav-topic' + (topic.path === STATE.currentPath ? ' active' : '');
  item.dataset.path = topic.path;
  item.setAttribute('role', 'treeitem');
  item.setAttribute('tabindex', '0');
  item.setAttribute('aria-label', topic.title);

  const isDone = !!STATE.progress[topic.path];
  item.innerHTML = `
    <input type="checkbox" class="nav-checkbox" ${isDone ? 'checked' : ''}
      aria-label="Mark '${escapeAttr(topic.title)}' complete"
      data-path="${escapeAttr(topic.path)}" />
    <span class="nav-topic-title">${escapeHtml(topic.title)}</span>`;

  item.addEventListener('click', e => {
    if (e.target.classList.contains('nav-checkbox')) return;
    loadTopic(topic.path);
    if (window.innerWidth <= 1024) closeSidebar();
  });
  item.addEventListener('keydown', e => {
    if (e.key === 'Enter') loadTopic(topic.path);
  });

  const cb = item.querySelector('.nav-checkbox');
  cb.addEventListener('change', e => {
    e.stopPropagation();
    toggleProgress(topic.path, cb.checked);
  });

  return item;
}

/** Toggle section open/closed */
function toggleSection(wrapper) {
  const isOpen    = wrapper.classList.contains('open');
  const topicList = wrapper.querySelector('.nav-topics');
  const header    = wrapper.querySelector('.nav-section-header');
  wrapper.classList.toggle('open', !isOpen);
  topicList.style.display = isOpen ? 'none' : 'block';
  header.setAttribute('aria-expanded', String(!isOpen));
}

/** Update which nav item is highlighted as active */
function updateActiveNav(path) {
  document.querySelectorAll('.nav-topic').forEach(el => {
    el.classList.toggle('active', el.dataset.path === path);
  });

  if (!path) return;
  const item = document.querySelector(`.nav-topic[data-path="${CSS.escape(path)}"]`);
  if (item) {
    const section = item.closest('.nav-section');
    if (section && !section.classList.contains('open')) toggleSection(section);
    setTimeout(() => item.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 120);
  }
}

/** Filter nav items by query string */
function filterSidebar(query) {
  const q = query.trim().toLowerCase();
  document.querySelectorAll('.nav-section').forEach(section => {
    const items = section.querySelectorAll('.nav-topic');
    let visible = 0;
    items.forEach(item => {
      const title = item.querySelector('.nav-topic-title').textContent.toLowerCase();
      const match = !q || title.includes(q);
      item.style.display = match ? '' : 'none';
      if (match) visible++;
    });
    section.style.display = (visible === 0 && q) ? 'none' : '';
    if (q && visible > 0) {
      section.querySelector('.nav-topics').style.display = 'block';
      section.classList.add('open');
    }
  });
}

/* ══════════════════════════════════════════════════════════════
   TOPIC LOADING & RENDERING
   ══════════════════════════════════════════════════════════════ */

/** Load a markdown topic by file path */
async function loadTopic(path, pushHistory = true) {
  STATE.currentPath = path;

  if (pushHistory) {
    history.pushState({ path }, '', `#${path}`);
  } else {
    history.replaceState({ path }, '', `#${path}`);
  }

  // Special route: Industry Blogs view (not a markdown file)
  if (path === '__blogs__') {
    updateActiveNav(path);
    renderBlogsView();
    showPanel('content');
    window.scrollTo({ top: 0, behavior: 'instant' });
    return;
  }

  trackRecent(path);
  updateActiveNav(path);

  // Serve instantly from cache if available (stale-while-revalidate)
  const cached = CONTENT_CACHE.get(path);
  if (cached) {
    await renderMarkdown(cached, path);
    CONTENT_CACHE.touch(path);
    // Revalidate in background — re-render only if content changed
    revalidateTopic(path, cached);
    return;
  }

  showPanel('loading');

  const fullUrl = new URL(path, window.location.href).href;
  try {
    const res = await fetch(fullUrl, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const md = await res.text();
    // If server returned HTML instead of markdown (Jekyll redirect), detect it
    if (md.trimStart().startsWith('<!DOCTYPE') || md.trimStart().startsWith('<html')) {
      throw new Error('HTML_RESPONSE');
    }
    CONTENT_CACHE.set(path, md);
    await renderMarkdown(md, path);
  } catch (err) {
    console.warn('GoForge load failed:', fullUrl, err.message);
    showPanel('error');
    const errEl = document.getElementById('error-message');
    if (!errEl) return;
    if (location.protocol === 'file:') {
      errEl.innerHTML = `<strong>Local file detected:</strong> Use a local server.<br>
        <code>cd GoForge && python3 -m http.server 8080</code><br>
        Then open <a href="http://localhost:8080">http://localhost:8080</a>`;
    } else if (err.message === 'HTML_RESPONSE') {
      errEl.innerHTML = `GitHub Pages is still serving an old deployment.<br>
        <strong>Fix:</strong> Go to your repo <a href="https://github.com/gauravpatil97886/GoForge/settings/pages" target="_blank">Settings → Pages</a>
        and change Source to <strong>GitHub Actions</strong>, then wait 2 minutes.`;
    } else {
      const issueUrl = `${ERROR_REPORT_REPO}?title=${encodeURIComponent(`[Content] Failed to load ${path}`)}&body=${encodeURIComponent(`**Topic:** ${path}\n**Error:** ${err.message}\n**URL:** ${fullUrl}\n**Browser:** ${navigator.userAgent}`)}`;
      errEl.innerHTML = `Failed to load: <code>${path}</code><br>
        <small>Status: <strong>${err.message}</strong> &nbsp;|&nbsp; URL: <code>${fullUrl}</code></small><br><br>
        Try refreshing in a minute — GitHub Pages may still be deploying.<br>
        If it keeps failing, <a href="${issueUrl}" target="_blank" rel="noopener noreferrer">report this issue</a> so it gets fixed.`;
    }
  }
}

/** Background revalidation: fetch fresh copy; re-render only if it changed */
async function revalidateTopic(path, cachedMd) {
  try {
    const res = await fetch(new URL(path, window.location.href).href, { cache: 'no-store' });
    if (!res.ok) return;
    const fresh = await res.text();
    if (fresh.trimStart().startsWith('<!DOCTYPE') || fresh.trimStart().startsWith('<html')) return;
    if (fresh !== cachedMd) {
      CONTENT_CACHE.set(path, fresh);
      // Only re-render if the user is still on this topic
      if (STATE.currentPath === path) await renderMarkdown(fresh, path);
    }
  } catch { /* offline or network error — cached copy stays */ }
}

/** Prefetch next/prev topics into cache so navigation feels instant */
function prefetchNeighbors(path) {
  const idx = STATE.searchIndex.findIndex(t => t.path === path);
  [STATE.searchIndex[idx + 1], STATE.searchIndex[idx - 1]].forEach(entry => {
    if (!entry || !entry.path.endsWith('.md') || CONTENT_CACHE.get(entry.path)) return;
    fetch(new URL(entry.path, window.location.href).href)
      .then(r => r.ok ? r.text() : null)
      .then(md => {
        if (md && !md.trimStart().startsWith('<!DOCTYPE') && !md.trimStart().startsWith('<html')) {
          CONTENT_CACHE.set(entry.path, md);
        }
      })
      .catch(() => {});
  });
}

/** Parse and inject markdown into the DOM */
async function renderMarkdown(markdown, path) {
  // Restore chrome that the blogs view may have hidden
  const metaBar = document.getElementById('topic-meta');
  const footNav = document.getElementById('content-footer-nav');
  if (metaBar) metaBar.style.display = '';
  if (footNav) footNav.style.display = '';

  const body = document.getElementById('markdown-body');
  let html;
  try {
    html = marked.parse(markdown);
  } catch (e) {
    // Fallback: render as plain preformatted text if marked crashes
    console.warn('GoForge: marked.parse failed, using plain fallback:', e.message);
    html = `<pre style="white-space:pre-wrap;word-break:break-word;font-family:var(--font-mono);font-size:0.82rem;color:var(--text-secondary)">${escapeHtml(markdown)}</pre>`;
  }
  body.innerHTML = html;

  // Intercept internal .md link clicks — load within SPA instead of navigating away
  const currentDir = path.includes('/') ? path.substring(0, path.lastIndexOf('/') + 1) : '';

  // In-page anchor links (e.g. a file's own table of contents) must scroll,
  // not change the routing hash — the router would treat it as a topic path
  body.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const id = decodeURIComponent(link.getAttribute('href').slice(1));
      const target = document.getElementById(id);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  body.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('#') || href.startsWith('mailto:')) return;
    if (!href.endsWith('.md') && !href.includes('.md#')) return;
    link.setAttribute('target', '');
    link.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      let rel = href.startsWith('./') ? href.slice(2) : href.startsWith('/') ? href.slice(1) : href;
      const parts = (currentDir + rel).split('/');
      const out = [];
      for (const p of parts) {
        if (p === '..') out.pop();
        else if (p && p !== '.') out.push(p);
      }
      loadTopic(out.join('/'));
    });
  });

  // Wrap tables for horizontal scroll on mobile
  body.querySelectorAll('table').forEach(table => {
    if (table.parentElement.classList.contains('table-scroll-wrap')) return;
    const wrap = document.createElement('div');
    wrap.className = 'table-scroll-wrap';
    table.parentNode.insertBefore(wrap, table);
    wrap.appendChild(table);
  });

  // Highlight any remaining unhighlighted code blocks
  document.querySelectorAll('#markdown-body pre code:not(.hljs)').forEach(block => {
    hljs.highlightElement(block);
  });

  // Content panel must be visible BEFORE mermaid runs — diagrams rendered
  // inside a display:none container measure text as zero-width and edge
  // label layout throws ("Could not find a suitable point...")
  showPanel('content');

  // Render mermaid diagrams
  await renderMermaidDiagrams();

  // Add copy buttons to code blocks that don't have them
  addCopyButtons();

  // Breadcrumb
  updateBreadcrumb(path);

  // Topic meta (reading time, level)
  updateTopicMeta(markdown, path);

  // Footer prev/next
  renderFooterNav(path);

  // TOC
  generateTOC();

  // Bookmark state
  updateBookmarkBtn(path);

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'instant' });

  // Reading progress
  setupReadingProgress();

  // Warm the cache for adjacent topics (instant prev/next)
  prefetchNeighbors(path);
}

/** Run mermaid on all .mermaid elements — one bad diagram must not block the rest */
async function renderMermaidDiagrams() {
  const nodes = document.querySelectorAll('#markdown-body .mermaid');
  if (!nodes.length) return;
  for (const node of nodes) {
    if (node.getAttribute('data-processed')) continue;
    try {
      await mermaid.run({ nodes: [node] });
    } catch (e) {
      node.classList.add('mermaid-failed');
      node.innerHTML = '<div class="mermaid-error">Diagram failed to render</div>';
      console.error('Mermaid render error:', e);
    }
  }
}

/** Reset rendered diagrams back to source so they can re-render (theme change) */
function resetMermaidDiagrams() {
  document.querySelectorAll('#markdown-body .mermaid').forEach(el => {
    const src = el.getAttribute('data-mermaid-src');
    if (!src) return;
    el.removeAttribute('data-processed');
    el.classList.remove('mermaid-failed');
    el.textContent = src;
  });
}

/** Add copy buttons to any pre blocks without chrome */
function addCopyButtons() {
  document.querySelectorAll('#markdown-body pre').forEach(pre => {
    if (pre.querySelector('.code-block-chrome')) return;
    const code = pre.querySelector('code');
    if (!code) return;

    const rawText = code.textContent || '';
    const langClass = [...code.classList].find(c => c.startsWith('language-'));
    const lang = langClass ? langClass.replace('language-', '') : 'code';

    const chrome = document.createElement('div');
    chrome.className = 'code-block-chrome';
    chrome.innerHTML = `
      <span class="code-lang">${escapeHtml(lang)}</span>
      <button class="copy-btn" data-raw="${escapeAttr(rawText)}" onclick="handleCopyBtn(this)">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        Copy
      </button>`;
    pre.insertBefore(chrome, pre.firstChild);
    if (code) code.style.paddingTop = '46px';
  });
}

/** Handle copy button click */
async function handleCopyBtn(btn) {
  const text = btn.dataset.raw || btn.closest('pre')?.querySelector('code')?.textContent || '';
  try {
    await navigator.clipboard.writeText(text);
    btn.classList.add('copied');
    btn.innerHTML = `
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      Copied!`;
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = `
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        Copy`;
    }, 2200);
  } catch {
    btn.textContent = 'Failed';
    setTimeout(() => { btn.textContent = 'Copy'; }, 1400);
  }
}

/** Update breadcrumb trail */
function updateBreadcrumb(path) {
  const entry = STATE.searchIndex.find(t => t.path === path);
  const secEl = document.getElementById('breadcrumb-section');
  const topEl = document.getElementById('breadcrumb-topic');
  if (secEl) secEl.textContent = entry ? entry.section : '';
  if (topEl) topEl.textContent = entry ? entry.title : '';
}

/** Update topic meta bar (reading time, level badge) */
function updateTopicMeta(markdown, path) {
  const timeEl  = document.getElementById('meta-time');
  const levelEl = document.getElementById('meta-level');
  const entry   = STATE.searchIndex.find(t => t.path === path);

  // Estimate reading time
  const mins = estimateReadTime(markdown);
  if (timeEl) {
    timeEl.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      ${mins} min read`;
  }

  // Level badge
  if (levelEl) {
    const level = entry?.level;
    const levelMap = {
      beginner:     { label: 'Beginner',     color: 'var(--l1)' },
      easy:         { label: 'Easy',         color: 'var(--l2)' },
      medium:       { label: 'Medium',       color: 'var(--l3)' },
      advanced:     { label: 'Advanced',     color: 'var(--l4)' },
      interview:    { label: 'Interview',    color: 'var(--l5)' },
      production:   { label: 'Production',   color: 'var(--l6)' },
      intermediate: { label: 'Intermediate', color: 'var(--l3)' },
      mixed:        { label: 'Mixed',        color: 'var(--accent)' },
    };
    if (level && levelMap[level]) {
      const { label, color } = levelMap[level];
      levelEl.textContent = label;
      levelEl.style.color = color;
      levelEl.style.borderColor = color;
      levelEl.style.background = `${color}18`;
      levelEl.style.display = '';
    } else {
      levelEl.style.display = 'none';
    }
  }

  // Mark done button
  updateMarkDoneBtn();
}

/** Estimate reading time (words ÷ 200) */
function estimateReadTime(text) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Render prev/next topic navigation */
function renderFooterNav(path) {
  const flat = STATE.searchIndex;
  const idx  = flat.findIndex(t => t.path === path);

  const prevBtn   = document.getElementById('prev-btn');
  const nextBtn   = document.getElementById('next-btn');
  const prevTitle = document.getElementById('prev-title');
  const nextTitle = document.getElementById('next-title');

  const prev = flat[idx - 1];
  const next = flat[idx + 1];

  if (prevBtn) {
    prevBtn.style.visibility = prev ? 'visible' : 'hidden';
    if (prev && prevTitle) {
      prevTitle.textContent = prev.title;
      prevBtn.onclick = () => loadTopic(prev.path);
    }
  }
  if (nextBtn) {
    nextBtn.style.visibility = next ? 'visible' : 'hidden';
    if (next && nextTitle) {
      nextTitle.textContent = next.title;
      nextBtn.onclick = () => loadTopic(next.path);
    }
  }
}

/* ══════════════════════════════════════════════════════════════
   TABLE OF CONTENTS
   ══════════════════════════════════════════════════════════════ */

/** Generate TOC from h2/h3 headings in rendered content */
function generateTOC() {
  const toc    = document.getElementById('toc');
  const tocNav = document.getElementById('toc-nav');
  if (!toc || !tocNav) return;

  // Disconnect previous observer
  if (STATE.tocObserver) { STATE.tocObserver.disconnect(); STATE.tocObserver = null; }

  const headings = [...document.querySelectorAll('#markdown-body h2, #markdown-body h3')];

  if (headings.length < 3) {
    toc.hidden = true;
    return;
  }

  tocNav.innerHTML = headings.map(h => {
    const isH3    = h.tagName === 'H3';
    const id      = h.id || slugify(h.textContent);
    if (!h.id) h.id = id;
    return `<a href="#${id}" class="toc-link${isH3 ? ' toc-h3' : ''}" data-id="${id}"
      onclick="event.preventDefault();scrollToHeading('${id}')">${escapeHtml(h.textContent)}</a>`;
  }).join('');

  toc.hidden = false;

  // IntersectionObserver to highlight active heading
  const links = tocNav.querySelectorAll('a[data-id]');
  STATE.tocObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('toc-active'));
        const active = tocNav.querySelector(`a[data-id="${entry.target.id}"]`);
        if (active) active.classList.add('toc-active');
      }
    });
  }, { rootMargin: `-${58 + 16}px 0px -70% 0px`, threshold: 0 });

  headings.forEach(h => STATE.tocObserver.observe(h));
}

function scrollToHeading(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 58;
  const top = el.getBoundingClientRect().top + window.scrollY - offset - 16;
  window.scrollTo({ top, behavior: 'smooth' });
}

/* ══════════════════════════════════════════════════════════════
   READING PROGRESS
   ══════════════════════════════════════════════════════════════ */

/** Thin gradient bar that fills as the user scrolls */
function setupReadingProgress() {
  const fill = document.getElementById('reading-progress-fill');
  if (!fill) return;

  const update = () => {
    const scrollTop    = window.scrollY;
    const docHeight    = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    const pct = docHeight <= windowHeight ? 100 : (scrollTop / (docHeight - windowHeight)) * 100;
    fill.style.width = Math.min(100, Math.max(0, pct)) + '%';
  };

  // Remove previous listener if any
  if (window._readingProgressHandler) {
    window.removeEventListener('scroll', window._readingProgressHandler, { passive: true });
  }
  window._readingProgressHandler = update;
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ══════════════════════════════════════════════════════════════
   PANEL MANAGEMENT
   ══════════════════════════════════════════════════════════════ */

function showPanel(name) {
  const welcome  = document.getElementById('welcome');
  const wrapper  = document.getElementById('content-wrapper');
  const loading  = document.getElementById('loading');
  const errorEl  = document.getElementById('error-state');

  if (welcome)  welcome.style.display  = (name === 'welcome')  ? '' : 'none';
  if (wrapper)  wrapper.style.display  = (name === 'content')  ? '' : 'none';
  if (loading)  loading.style.display  = (name === 'loading')  ? 'flex' : 'none';
  if (errorEl)  errorEl.style.display  = (name === 'error')    ? 'flex' : 'none';
}

/* ══════════════════════════════════════════════════════════════
   WELCOME SCREEN
   ══════════════════════════════════════════════════════════════ */

function showWelcome() {
  STATE.currentPath = null;
  history.replaceState({}, '', location.pathname + location.search);
  updateActiveNav(null);
  renderWelcome();
  showPanel('welcome');
  updateMarkDoneBtn();
}

/** Render the full welcome screen HTML — composed from section builders */
function renderWelcome() {
  const container = document.getElementById('welcome');
  if (!container) return;

  container.innerHTML =
    renderHomeHero() +
    renderHomePaths() +
    renderHomeJourney() +
    renderHomePractice() +
    renderHomeInterview() +
    renderHomeBlogsTeaser() +
    renderHomeFeatures() +
    renderHomeFooter();
}

/* ── HOME §1: Hero — value prop, CTAs, stats band ────────────── */
function renderHomeHero() {
  const lastVisited = STATE.recentTopics.find(p => STATE.searchIndex.some(t => t.path === p));
  const lastEntry   = lastVisited ? STATE.searchIndex.find(t => t.path === lastVisited) : null;
  const { total, pct } = calculateStats();
  const blogCount = (typeof BLOGS !== 'undefined') ? BLOGS.length : 70;

  const primaryCta = lastEntry
    ? `<button class="btn-hero btn-hero-primary" onclick="loadTopic('${escapeAttr(lastEntry.path)}')"
         aria-label="Continue ${escapeAttr(lastEntry.title)}">
         ${ICONS.play}<span class="btn-hero-stack"><span class="btn-hero-over">Continue learning</span><span class="btn-hero-main">${escapeHtml(lastEntry.title)}</span></span>${ICONS.arrow}
       </button>`
    : `<button class="btn-hero btn-hero-primary" onclick="loadTopic('01-foundations/01-getting-started.md')"
         aria-label="Start learning Go">
         ${ICONS.play}<span class="btn-hero-main">Start Learning</span>${ICONS.arrow}
       </button>`;

  return `
    <div class="welcome-hero">
      <div class="welcome-badge">
        <span class="badge-dot"></span>
        Free & Open Source · Go 1.22+
      </div>
      <h1 class="hero-title">Forge Your<br><span class="gradient-text">Go Mastery</span></h1>
      <p class="hero-subtitle">
        One platform for the whole journey — language foundations, concurrency,
        system design, DSA and top-company interview prep. No paywall, no signup.
      </p>
      <div class="hero-cta-row">
        ${primaryCta}
        <button class="btn-hero btn-hero-secondary" onclick="loadTopic('coding-practice/foundations/01-variables-types.md')"
          aria-label="Open coding practice">${ICONS.practice}<span class="btn-hero-main">Practice Coding</span></button>
        <button class="btn-hero btn-hero-ghost" onclick="loadTopic('__blogs__')"
          aria-label="Browse industry blogs">Go in Production ${ICONS.arrow}</button>
      </div>
      <div class="hero-statband" aria-label="Platform stats">
        <span>${total} lessons</span>
        <span>800+ questions</span>
        <span>100 DSA problems</span>
        <span>${blogCount} industry blogs</span>
        ${pct > 0 ? `<span class="statband-progress">${pct}% complete</span>` : ''}
      </div>
    </div>`;
}

/* ── HOME §2: Choose your path — goal-oriented entry points ──── */
function renderHomePaths() {
  const cards = HOME_PATHS.map(p => {
    const count = NAVIGATION
      .filter(s => p.sections.includes(s.id))
      .reduce((n, s) => n + s.topics.length, 0);
    return `<button class="path-card" style="--path-color:${p.color}"
      onclick="loadTopic('${escapeAttr(p.target)}')" aria-label="${escapeAttr(p.title)}">
      <span class="path-icon" style="color:${p.color}">${ICONS[p.icon] || ICONS.foundations}</span>
      <span class="path-title">${escapeHtml(p.title)}</span>
      <span class="path-desc">${escapeHtml(p.desc)}</span>
      <span class="path-meta">${count} ${escapeHtml(p.metaNote)}<span class="path-arrow">${ICONS.arrow}</span></span>
    </button>`;
  }).join('');
  return `
    <div class="welcome-section">
      <div class="welcome-section-title">Choose Your Path</div>
      <div class="home-paths">${cards}</div>
    </div>`;
}

/* ── HOME §3: Learning journey — vertical roadmap of sections ── */
function renderHomeJourney() {
  const sections = NAVIGATION.filter(s => s.id !== 'blogs');
  const nodes = sections.map((s, i) => {
    const done = s.topics.filter(t => STATE.progress[t.path]).length;
    const tot  = s.topics.length;
    const pct  = tot ? Math.round((done / tot) * 100) : 0;
    return `<button class="journey-node" style="--node-color:${s.color};--i:${i}"
      onclick="loadFirstTopic('${escapeAttr(s.id)}')" aria-label="Start ${escapeAttr(s.title)}">
      <span class="journey-num">${String(i + 1).padStart(2, '0')}</span>
      <span class="journey-head">
        <span class="journey-icon" style="color:${s.color}">${ICONS[s.id] || ICONS.foundations}</span>
        <span class="journey-title">${escapeHtml(s.title)}</span>
        <span class="journey-count">${done}/${tot}</span>
      </span>
      <span class="journey-desc">${escapeHtml(s.desc)}</span>
      <span class="journey-bar"><span class="journey-bar-fill" style="width:${pct}%"></span></span>
    </button>`;
  }).join('');
  return `
    <div class="welcome-section">
      <div class="welcome-section-title">The Learning Journey</div>
      <div class="journey">${nodes}</div>
    </div>`;
}

/* ── HOME §4: Practice ladder — six difficulty levels ────────── */
function renderHomePractice() {
  const pills = HOME_LEVELS.map((l, i) => `
    <button class="level-pill" style="--lv:var(--l${i + 1})"
      onclick="loadTopic('${escapeAttr(l.path)}')" aria-label="Practice ${escapeAttr(l.name)} level">
      <span class="level-tag">${l.lvl}</span>
      <span class="level-name">${escapeHtml(l.name)}</span>
      <span class="level-note">${escapeHtml(l.note)}</span>
    </button>`).join('');
  return `
    <div class="welcome-section">
      <div class="welcome-section-title">Practice Ladder</div>
      <p class="home-section-lede">800+ hands-on questions, every one solved and explained — climb from syntax drills to production debugging.</p>
      <div class="level-ladder">${pills}</div>
    </div>`;
}

/* ── HOME §5: Interview & company prep ───────────────────────── */
function renderHomeInterview() {
  const interview = NAVIGATION.find(s => s.id === 'interview');
  const ctc       = NAVIGATION.find(s => s.id === 'ctc-prep');
  const companies = (interview?.topics || []).filter(t => t.path.startsWith('interview-prep/company-'));
  const bands     = (ctc?.topics || []).filter(t => t.path.includes('-lpa'));

  const coChips = companies.map(t => `
    <button class="co-chip" onclick="loadTopic('${escapeAttr(t.path)}')"
      aria-label="${escapeAttr(t.title)} interview guide">${escapeHtml(t.title.replace(' Style', ''))}</button>`).join('');
  const ctcChips = bands.map(t => `
    <button class="co-chip ctc-chip" onclick="loadTopic('${escapeAttr(t.path)}')"
      aria-label="${escapeAttr(t.title)}">${escapeHtml(t.title.replace(' Guide', '').replace(' Senior', ''))}</button>`).join('');

  return `
    <div class="welcome-section">
      <div class="welcome-section-title">Interview & Company Prep</div>
      <div class="home-interview">
        <div class="home-interview-copy">
          <h3 class="home-interview-title">Prep for the company<br>you actually want</h3>
          <p class="home-interview-desc">
            Real interview formats from six top companies, behavioral rounds in STAR
            format, and salary-band roadmaps that tell you exactly what each tier expects.
          </p>
          <button class="btn-hero btn-hero-ghost" onclick="loadTopic('interview-prep/beginner.md')"
            aria-label="All interview guides">All interview guides ${ICONS.arrow}</button>
        </div>
        <div class="home-interview-chips">
          <div class="chip-group-label">Company-style rounds</div>
          <div class="chip-row">${coChips}</div>
          <div class="chip-group-label">CTC-band roadmaps</div>
          <div class="chip-row">${ctcChips}</div>
        </div>
      </div>
    </div>`;
}

/* ── HOME §6: Industry blogs teaser — real data from BLOGS ───── */
function renderHomeBlogsTeaser() {
  if (typeof BLOGS === 'undefined' || !BLOGS.length) return '';
  const picks = [];
  const seen  = new Set();
  for (const b of BLOGS) {
    if (seen.has(b.company)) continue;
    seen.add(b.company);
    picks.push(b);
    if (picks.length === 3) break;
  }
  const cards = picks.map(b => {
    const color = (typeof BLOG_CATEGORY_COLORS !== 'undefined' && BLOG_CATEGORY_COLORS[b.category]) || 'var(--accent)';
    return `<a class="home-blog-card" href="${escapeAttr(b.url)}" target="_blank" rel="noopener noreferrer"
      style="--blog-color:${color}" aria-label="Read ${escapeAttr(b.title)} (opens in new tab)">
      <span class="home-blog-top">
        <span class="home-blog-mono">${escapeHtml(b.company.slice(0, 2).toUpperCase())}</span>
        <span class="home-blog-co">${escapeHtml(b.company)}</span>
        <span class="home-blog-year">${escapeHtml(b.year)}</span>
      </span>
      <span class="home-blog-title">${escapeHtml(b.title)}</span>
      <span class="home-blog-summary">${escapeHtml(b.summary)}</span>
    </a>`;
  }).join('');
  return `
    <div class="welcome-section">
      <div class="welcome-section-title">Go in Production</div>
      <p class="home-section-lede">How real engineering teams run Go at scale — curated posts straight from the source.</p>
      <div class="home-blogs-grid">${cards}</div>
      <button class="home-blogs-all" onclick="loadTopic('__blogs__')"
        aria-label="View all engineering blog posts">View all ${BLOGS.length} engineering posts ${ICONS.arrow}</button>
    </div>`;
}

/* ── HOME §7: Feature strip — platform capabilities ──────────── */
function renderHomeFeatures() {
  const items = HOME_FEATURES.map(f => {
    const inner = `
      <span class="feature-icon">${ICONS[f.icon] || ICONS.target}</span>
      <span class="feature-text">
        <span class="feature-title">${escapeHtml(f.title)}</span>
        <span class="feature-desc">${escapeHtml(f.desc)}</span>
      </span>`;
    return f.action
      ? `<button class="feature-item feature-action" onclick="${f.action}" aria-label="${escapeAttr(f.title)}">${inner}</button>`
      : `<div class="feature-item">${inner}</div>`;
  }).join('');
  return `
    <div class="welcome-section">
      <div class="welcome-section-title">Built Like a Product</div>
      <div class="feature-strip">${items}</div>
    </div>`;
}

/* ── HOME §8: Footer — quick links + brand ───────────────────── */
function renderHomeFooter() {
  const col = (label, links) => `
    <div class="home-footer-col">
      <div class="home-footer-head">${label}</div>
      ${links.map(([title, fn]) => `<button class="home-footer-link" onclick="${fn}">${escapeHtml(title)}</button>`).join('')}
    </div>`;
  return `
    <div class="home-footer">
      <div class="home-footer-grid">
        <div class="home-footer-brand">
          <div class="home-footer-logo">Go<span>Forge</span></div>
          <p class="home-footer-tag">${escapeHtml(PLATFORM.tagline)}. Built with plain HTML, CSS &amp; JavaScript — no frameworks, no tracking, works offline.</p>
        </div>
        ${col('Learn', [
          ['Foundations',     `loadFirstTopic('foundations')`],
          ['Concurrency',     `loadFirstTopic('concurrency')`],
          ['Advanced Go',     `loadFirstTopic('advanced')`],
          ['Design Patterns', `loadFirstTopic('patterns')`],
        ])}
        ${col('Practice', [
          ['Coding Practice', `loadFirstTopic('practice')`],
          ['DSA in Go',       `loadFirstTopic('dsa-go')`],
          ['System Design',   `loadFirstTopic('system-design')`],
          ['Search Topics',   `openSearch()`],
        ])}
        ${col('Prep', [
          ['Interview Q&A',   `loadFirstTopic('interview')`],
          ['CTC Roadmaps',    `loadFirstTopic('ctc-prep')`],
          ['Industry Blogs',  `loadTopic('__blogs__')`],
          ['Behavioral (STAR)', `loadTopic('interview-prep/behavioral.md')`],
        ])}
      </div>
      <div class="home-footer-meta">${escapeHtml(PLATFORM.copyright)}</div>
    </div>`;
}

/** Load the first topic of a given section ID */
function loadFirstTopic(sectionId) {
  const section = NAVIGATION.find(s => s.id === sectionId);
  if (section?.topics?.length) loadTopic(section.topics[0].path);
}

/* ══════════════════════════════════════════════════════════════
   SEARCH
   ══════════════════════════════════════════════════════════════ */

function openSearch() {
  STATE.searchOpen    = true;
  STATE.searchSelected = -1;

  const overlay = document.getElementById('search-overlay');
  const modal   = document.getElementById('search-modal');
  const input   = document.getElementById('search-input');

  overlay.hidden = false;
  modal.hidden   = false;
  document.body.style.overflow = 'hidden';
  armModalHistory();

  input.value = '';
  setTimeout(() => input.focus(), 40);
  renderSearchResults('');
}

function closeSearch() {
  STATE.searchOpen = false;
  disarmModalHistory();
  document.getElementById('search-overlay').hidden = true;
  document.getElementById('search-modal').hidden   = true;
  document.body.style.overflow = '';
}

/** Simple fuzzy search with scoring */
function fuzzySearch(query, items) {
  if (!query.trim()) return items.slice(0, 20);
  const q = query.toLowerCase();

  const scored = [];
  for (const item of items) {
    const title   = item.title.toLowerCase();
    const section = item.section.toLowerCase();
    let score = -1;

    if (title === q)            score = 120;
    else if (title.startsWith(q)) score = 100;
    else if (title.includes(q)) score = 80;
    else if (section.includes(q)) score = 40;
    else {
      // Character-order fuzzy matching
      let ti = 0, qi = 0, matched = 0;
      while (ti < title.length && qi < q.length) {
        if (title[ti] === q[qi]) { qi++; matched++; }
        ti++;
      }
      if (qi === q.length) score = matched * 8;
    }

    if (score >= 0) scored.push({ item, score });
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, 16).map(r => r.item);
}

/** Render search results list */
function renderSearchResults(query) {
  const container = document.getElementById('search-results');
  if (!container) return;

  const results = fuzzySearch(query, STATE.searchIndex);
  STATE.searchSelected = -1;

  if (results.length === 0) {
    container.innerHTML = `
      <div class="search-empty">
        <div class="search-empty-icon">🔍</div>
        <p>No results for "<strong>${escapeHtml(query)}</strong>"</p>
        <p class="search-empty-tips">Try: "goroutine", "channel", "interface", "error"</p>
      </div>`;
    return;
  }

  // Group results by section for a cleaner display
  let lastSection = null;
  let html = '';
  for (let i = 0; i < results.length; i++) {
    const item = results[i];
    if (item.section !== lastSection) {
      if (lastSection !== null) html += `<div style="height:1px"></div>`;
      html += `<div class="search-section-divider">
        <span style="display:inline-flex;align-items:center;gap:5px">
          <span style="width:6px;height:6px;border-radius:50%;background:${item.color};display:inline-block"></span>
          ${escapeHtml(item.section)}
        </span>
      </div>`;
      lastSection = item.section;
    }
    html += `<div class="search-result-item" role="option" data-path="${escapeAttr(item.path)}" data-index="${i}"
      onclick="selectSearchResult('${escapeAttr(item.path)}')" aria-selected="false">
      <div class="sri-icon" style="color:${item.color}">${item.icon}</div>
      <div class="sri-body">
        <div class="sri-title">${highlightQuery(item.title, query)}</div>
      </div>
    </div>`;
  }

  container.innerHTML = html;
}

/** Highlight matching text in search results */
function highlightQuery(text, query) {
  if (!query.trim()) return escapeHtml(text);
  const re = new RegExp(`(${escapeRegex(query.trim())})`, 'gi');
  return escapeHtml(text).replace(re, '<mark>$1</mark>');
}

function selectSearchResult(path) {
  closeSearch();
  loadTopic(path);
}

function moveSearchSelection(dir) {
  const items = document.querySelectorAll('.search-result-item');
  if (!items.length) return;
  if (STATE.searchSelected >= 0) items[STATE.searchSelected]?.classList.remove('selected');
  STATE.searchSelected = (STATE.searchSelected + dir + items.length) % items.length;
  const sel = items[STATE.searchSelected];
  if (sel) {
    sel.classList.add('selected');
    sel.scrollIntoView({ block: 'nearest' });
  }
}

/* ══════════════════════════════════════════════════════════════
   THEME
   ══════════════════════════════════════════════════════════════ */

function toggleTheme() {
  applyTheme(STATE.theme === 'dark' ? 'light' : 'dark');
}

function applyTheme(theme, save = true) {
  STATE.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);

  // Swap highlight.js CSS
  const hljsLink = document.getElementById('hljs-theme');
  if (hljsLink) {
    hljsLink.href = theme === 'dark'
      ? 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css'
      : 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css';
  }

  // Update mermaid theme + re-render diagrams from stored source
  try {
    mermaid.initialize(mermaidConfig(theme));
    resetMermaidDiagrams();
    renderMermaidDiagrams();
  } catch (e) { /* non-fatal */ }

  if (save) localStorage.setItem(KEYS.theme, theme);
}

/* ══════════════════════════════════════════════════════════════
   PROGRESS TRACKING
   ══════════════════════════════════════════════════════════════ */

function toggleProgress(path, checked) {
  if (checked) {
    STATE.progress[path] = true;
  } else {
    delete STATE.progress[path];
  }
  saveProgress();
  updateProgressDisplay();
  updateSidebarStats();
  updateMarkDoneBtn();
}

function toggleCurrentProgress() {
  if (!STATE.currentPath) return;
  const isDone = !!STATE.progress[STATE.currentPath];
  toggleProgress(STATE.currentPath, !isDone);

  // Sync sidebar checkbox
  const cb = document.querySelector(`.nav-checkbox[data-path="${CSS.escape(STATE.currentPath)}"]`);
  if (cb) cb.checked = !isDone;
}

function saveProgress() {
  try { localStorage.setItem(KEYS.progress, JSON.stringify(STATE.progress)); } catch {}
}

function calculateStats() {
  const total     = STATE.searchIndex.length;
  const completed = Object.keys(STATE.progress).filter(k => STATE.progress[k]).length;
  const pct       = total ? Math.round((completed / total) * 100) : 0;
  return { total, completed, pct };
}

function updateProgressDisplay() {
  const { completed, total, pct } = calculateStats();

  // Header pill
  const headerFill = document.getElementById('progress-fill');
  const headerText = document.getElementById('progress-text');
  if (headerFill) headerFill.style.width = pct + '%';
  if (headerText) headerText.textContent = pct + '%';

  // Sidebar footer bar
  const sbFill = document.getElementById('sidebar-progress-fill');
  const sbText = document.getElementById('sidebar-progress-text');
  if (sbFill) sbFill.style.width = pct + '%';
  if (sbText) sbText.textContent = `${completed} / ${total}`;
}

function updateSidebarStats() {
  const { completed } = calculateStats();
  const doneEl = document.getElementById('stat-done');
  if (doneEl) doneEl.textContent = completed;
}

function updateMarkDoneBtn() {
  const btn      = document.getElementById('btn-mark-done');
  const textEl   = document.getElementById('mark-done-text');
  if (!btn || !textEl) return;

  if (!STATE.currentPath) {
    btn.classList.remove('done');
    textEl.textContent = 'Mark Complete';
    return;
  }
  const isDone = !!STATE.progress[STATE.currentPath];
  btn.classList.toggle('done', isDone);
  textEl.textContent = isDone ? 'Completed ✓' : 'Mark Complete';
}

/* ══════════════════════════════════════════════════════════════
   BOOKMARKS
   ══════════════════════════════════════════════════════════════ */

function toggleBookmark() {
  if (!STATE.currentPath) return;
  const idx = STATE.bookmarks.indexOf(STATE.currentPath);
  if (idx >= 0) {
    STATE.bookmarks.splice(idx, 1);
  } else {
    STATE.bookmarks.unshift(STATE.currentPath);
  }
  try { localStorage.setItem(KEYS.bookmarks, JSON.stringify(STATE.bookmarks)); } catch {}
  updateBookmarkBtn(STATE.currentPath);
}

function updateBookmarkBtn(path) {
  const btn    = document.getElementById('btn-bookmark');
  const textEl = document.getElementById('bookmark-text');
  if (!btn || !textEl) return;

  const isBookmarked = STATE.bookmarks.includes(path);
  btn.classList.toggle('bookmarked', isBookmarked);

  // Update icon
  const svgPath = isBookmarked
    ? '<path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" fill="currentColor"/>'
    : '<path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>';
  btn.querySelector('svg').innerHTML = svgPath;
  textEl.textContent = isBookmarked ? 'Bookmarked' : 'Bookmark';
}

/* ══════════════════════════════════════════════════════════════
   STATS MODAL
   ══════════════════════════════════════════════════════════════ */

function showStats() {
  const modal = document.getElementById('stats-modal');
  const body  = document.getElementById('stats-body');
  if (!modal || !body) return;

  const { total, completed, pct } = calculateStats();

  const sectionRows = NAVIGATION.map(section => {
    const done = section.topics.filter(t => STATE.progress[t.path]).length;
    const tot  = section.topics.length;
    const sp   = tot ? Math.round((done / tot) * 100) : 0;
    return `<div class="stats-section-row">
      <span class="stats-section-dot" style="background:${section.color}"></span>
      <span class="stats-section-icon" style="color:${section.color};display:flex;align-items:center">${ICONS[section.id] || ICONS.foundations}</span>
      <span class="stats-section-name">${escapeHtml(section.title)}</span>
      <span class="stats-section-bar">
        <span class="stats-section-bar-fill" style="width:${sp}%;background:${section.color}"></span>
      </span>
      <span class="stats-section-count" style="color:${section.color}">${done}/${tot}</span>
    </div>`;
  }).join('');

  body.innerHTML = `
    <div class="stats-overview">
      <div class="stats-big-num">${pct}%</div>
      <div class="stats-big-label">${completed} of ${total} topics completed</div>
      <div class="stats-overall-bar">
        <div class="stats-overall-fill" style="width:${pct}%"></div>
      </div>
    </div>
    <div style="margin-top:16px">
      ${sectionRows}
    </div>
    <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border)">
      <div style="font-size:.72rem;color:var(--text-muted);font-family:var(--font-mono)">
        Bookmarks: ${STATE.bookmarks.length} saved
      </div>
    </div>`;

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  armModalHistory();
}

function closeStatsModal() {
  disarmModalHistory();
  const modal = document.getElementById('stats-modal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

/* ══════════════════════════════════════════════════════════════
   SIDEBAR TOGGLE
   ══════════════════════════════════════════════════════════════ */

function toggleSidebar() {
  STATE.sidebarOpen ? closeSidebar() : openSidebar();
}

function openSidebar() {
  STATE.sidebarOpen = true;
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebar-overlay').style.display = 'block';
  document.getElementById('menu-toggle').setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
  armModalHistory();
}

function closeSidebar() {
  STATE.sidebarOpen = false;
  disarmModalHistory();
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').style.display = 'none';
  document.getElementById('menu-toggle').setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

/* ══════════════════════════════════════════════════════════════
   RECENT TOPICS
   ══════════════════════════════════════════════════════════════ */

function trackRecent(path) {
  STATE.recentTopics = [path, ...STATE.recentTopics.filter(p => p !== path)].slice(0, 8);
  try { localStorage.setItem(KEYS.recent, JSON.stringify(STATE.recentTopics)); } catch {}
}

/* ══════════════════════════════════════════════════════════════
   KEYBOARD SHORTCUTS & EVENT LISTENERS
   ══════════════════════════════════════════════════════════════ */

function bindEventListeners() {
  // Logo
  const logo = document.getElementById('logo');
  if (logo) logo.addEventListener('click', e => {
    e.preventDefault();
    showWelcome();
    if (window.innerWidth <= 1024) closeSidebar();
  });

  // Hamburger
  document.getElementById('menu-toggle')?.addEventListener('click', toggleSidebar);

  // Theme toggle
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

  // Search trigger
  document.getElementById('search-bar')?.addEventListener('click', openSearch);

  // Sidebar filter
  const filterInput = document.getElementById('sidebar-filter');
  const filterClear = document.getElementById('sidebar-filter-clear');
  filterInput?.addEventListener('input', e => {
    const q = e.target.value;
    if (filterClear) filterClear.style.display = q ? '' : 'none';
    filterSidebar(q);
  });
  filterClear?.addEventListener('click', () => {
    if (filterInput) filterInput.value = '';
    filterClear.style.display = 'none';
    filterSidebar('');
    filterInput?.focus();
  });

  // Search input
  document.getElementById('search-input')?.addEventListener('input', e => {
    renderSearchResults(e.target.value);
  });

  // Global keyboard shortcuts
  document.addEventListener('keydown', e => {
    // Ctrl/Cmd + K → open search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      STATE.searchOpen ? closeSearch() : openSearch();
      return;
    }

    // Escape → close modals
    if (e.key === 'Escape') {
      if (STATE.searchOpen) { closeSearch(); return; }
      const statsModal = document.getElementById('stats-modal');
      if (statsModal?.style.display === 'flex') { closeStatsModal(); return; }
      if (STATE.sidebarOpen && window.innerWidth <= 1024) { closeSidebar(); return; }
    }

    // Arrow navigation in search
    if (STATE.searchOpen) {
      if (e.key === 'ArrowDown') { e.preventDefault(); moveSearchSelection(1); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); moveSearchSelection(-1); }
      if (e.key === 'Enter') {
        e.preventDefault();
        const selected = document.querySelector('.search-result-item.selected');
        if (selected) {
          selectSearchResult(selected.dataset.path);
        } else {
          const first = document.querySelector('.search-result-item');
          if (first) selectSearchResult(first.dataset.path);
        }
      }
    }
  });

  // Browser back/forward
  window.addEventListener('popstate', e => {
    // A close-button consumed the modal history entry — ignore this pop
    if (_suppressNextPop) { _suppressNextPop = false; return; }
    // Back pressed while an overlay is open — close it, stay on the page
    if (_modalHistoryArmed) {
      _modalHistoryArmed = false;
      closeAnyOverlay();
      return;
    }
    const path = e.state?.path || location.hash.slice(1);
    if (!path) { showWelcome(); return; }
    // Hash is an in-page heading anchor, not a topic path — just scroll to it
    if (!path.endsWith('.md') && path !== '__blogs__') {
      const anchor = document.getElementById(decodeURIComponent(path));
      if (anchor) { anchor.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    }
    loadTopic(path, false);
  });

  // Close sidebar when clicking overlay
  document.getElementById('sidebar-overlay')?.addEventListener('click', closeSidebar);

  // Responsive: auto-close sidebar on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024 && STATE.sidebarOpen) {
      closeSidebar();
    }
  });

  // Swipe right to open sidebar, left to close (mobile)
  initSwipeGestures();
}

/* ══════════════════════════════════════════════════════════════
   SWIPE GESTURES (mobile sidebar)
   ══════════════════════════════════════════════════════════════ */

function initSwipeGestures() {
  let touchStartX = 0, touchStartY = 0;
  const SWIPE_THRESHOLD = 60;
  const EDGE_ZONE = 40; // px from left edge to trigger open

  document.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', e => {
    if (!e.changedTouches.length) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    // Only horizontal swipes (angle < 45°)
    if (Math.abs(dy) > Math.abs(dx)) return;

    if (dx > SWIPE_THRESHOLD && touchStartX < EDGE_ZONE && !STATE.sidebarOpen) {
      openSidebar();
    } else if (dx < -SWIPE_THRESHOLD && STATE.sidebarOpen) {
      closeSidebar();
    }
  }, { passive: true });
}

/* ══════════════════════════════════════════════════════════════
   MOBILE TOC BOTTOM SHEET
   ══════════════════════════════════════════════════════════════ */

function openMobTOC() {
  const panel = document.getElementById('mob-toc-panel');
  const overlay = document.getElementById('mob-toc-overlay');
  const nav = document.getElementById('mob-toc-nav');
  if (!panel || !nav) return;

  // Build TOC from current headings
  const headings = [...document.querySelectorAll('#markdown-body h2, #markdown-body h3')];
  if (!headings.length) {
    nav.innerHTML = '<p style="padding:16px 20px;color:var(--text-muted);font-size:.84rem">No sections found in this topic.</p>';
  } else {
    nav.innerHTML = headings.map(h => {
      const isH3 = h.tagName === 'H3';
      const id = h.id || slugify(h.textContent);
      return `<a href="#${id}" class="${isH3 ? 'toc-h3' : ''}" onclick="closeMobTOC();scrollToHeading('${id}');return false">${escapeHtml(h.textContent)}</a>`;
    }).join('');
  }

  panel.classList.add('open');
  if (overlay) overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  armModalHistory();
}

function closeMobTOC() {
  disarmModalHistory();
  document.getElementById('mob-toc-panel')?.classList.remove('open');
  document.getElementById('mob-toc-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

/* ══════════════════════════════════════════════════════════════
   FONT SIZE CONTROLS
   ══════════════════════════════════════════════════════════════ */

const FONT_SCALES = [0.82, 0.9, 1, 1.1, 1.2, 1.35];
let fontScaleIdx = 2; // default = 1 (100%)

function changeFontSize(dir) {
  fontScaleIdx = Math.max(0, Math.min(FONT_SCALES.length - 1, fontScaleIdx + dir));
  const scale = FONT_SCALES[fontScaleIdx];
  document.documentElement.style.setProperty('--font-scale', scale);
  const label = document.getElementById('font-scale-label');
  if (label) label.textContent = Math.round(scale * 100) + '%';
  try { localStorage.setItem('gf-font-scale', fontScaleIdx); } catch {}
}

function loadFontScale() {
  try {
    const saved = parseInt(localStorage.getItem('gf-font-scale'));
    if (!isNaN(saved) && saved >= 0 && saved < FONT_SCALES.length) {
      fontScaleIdx = saved;
      const scale = FONT_SCALES[fontScaleIdx];
      document.documentElement.style.setProperty('--font-scale', scale);
      const label = document.getElementById('font-scale-label');
      if (label) label.textContent = Math.round(scale * 100) + '%';
    }
  } catch {}
}

/* ══════════════════════════════════════════════════════════════
   READING MODE
   ══════════════════════════════════════════════════════════════ */

function enterReadingMode() {
  document.body.classList.add('reading-mode');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function exitReadingMode() {
  document.body.classList.remove('reading-mode');
}

/* ══════════════════════════════════════════════════════════════
   INDUSTRY BLOGS VIEW
   ══════════════════════════════════════════════════════════════ */

const BLOG_CATEGORY_COLORS = {
  'Consumer & Delivery':        '#f59e0b',
  'Cloud & Infrastructure':     '#00C8F0',
  'Fintech & Payments':         '#34D058',
  'Streaming, Media & Gaming':  '#C084FC',
  'E-commerce & Social':        '#FF6B3C',
  'Official Go Team & Deep Dives': '#F5C000',
};

const BLOGS_STATE = { category: 'All', query: '' };

function renderBlogsView() {
  const body = document.getElementById('markdown-body');
  if (!body) return;

  // Hide topic chrome that doesn't apply to this view
  const metaBar = document.getElementById('topic-meta');
  const footNav = document.getElementById('content-footer-nav');
  const toc     = document.getElementById('toc');
  if (metaBar) metaBar.style.display = 'none';
  if (footNav) footNav.style.display = 'none';
  if (toc) toc.hidden = true;

  const secEl = document.getElementById('breadcrumb-section');
  const topEl = document.getElementById('breadcrumb-topic');
  if (secEl) secEl.textContent = 'Industry Blogs';
  if (topEl) topEl.textContent = 'Engineering Blogs';

  const blogs = (typeof BLOGS !== 'undefined' && Array.isArray(BLOGS)) ? BLOGS : [];

  if (!blogs.length) {
    body.innerHTML = `
      <div class="blogs-hero">
        <h1 class="blogs-title">Go in <span class="gradient-text">Production</span></h1>
        <p class="blogs-sub">Real engineering blogs from companies running Go at scale.</p>
      </div>
      <div class="blogs-empty">Blog collection is being curated — check back shortly.</div>`;
    return;
  }

  const categories = ['All', ...new Set(blogs.map(b => b.category))];
  const companies  = new Set(blogs.map(b => b.company)).size;

  const visible = blogs.filter(b => {
    if (BLOGS_STATE.category !== 'All' && b.category !== BLOGS_STATE.category) return false;
    if (BLOGS_STATE.query) {
      const q = BLOGS_STATE.query.toLowerCase();
      return b.company.toLowerCase().includes(q)
        || b.title.toLowerCase().includes(q)
        || (b.tags || []).some(t => t.toLowerCase().includes(q));
    }
    return true;
  });

  body.innerHTML = `
    <div class="blogs-hero">
      <h1 class="blogs-title">Go in <span class="gradient-text">Production</span></h1>
      <p class="blogs-sub">${blogs.length} hand-picked engineering posts from ${companies} companies running Go at scale. Read how the industry actually uses what you're learning.</p>
    </div>

    <div class="blogs-toolbar">
      <div class="blogs-chips">
        ${categories.map(c => `
          <button class="blog-chip${BLOGS_STATE.category === c ? ' active' : ''}"
            data-cat="${escapeAttr(c)}"
            ${c !== 'All' ? `style="--chip-color:${BLOG_CATEGORY_COLORS[c] || 'var(--accent)'}"` : ''}>
            ${escapeHtml(c)}
            <span class="blog-chip-count">${c === 'All' ? blogs.length : blogs.filter(b => b.category === c).length}</span>
          </button>`).join('')}
      </div>
      <div class="blogs-search">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input type="text" id="blogs-search-input" placeholder="Filter by company, title, or tag…" value="${escapeAttr(BLOGS_STATE.query)}" autocomplete="off" spellcheck="false" />
      </div>
    </div>

    ${visible.length === 0
      ? `<div class="blogs-empty">No posts match. Try a different filter.</div>`
      : `<div class="blogs-grid">
          ${visible.map(b => {
            const color = BLOG_CATEGORY_COLORS[b.category] || 'var(--accent)';
            return `
            <a class="blog-card" href="${escapeAttr(b.url)}" target="_blank" rel="noopener noreferrer" style="--blog-color:${color}">
              <div class="blog-card-top">
                <span class="blog-monogram">${escapeHtml(b.company.charAt(0).toUpperCase())}</span>
                <div class="blog-card-co">
                  <span class="blog-company">${escapeHtml(b.company)}</span>
                  <span class="blog-cat">${escapeHtml(b.category)}</span>
                </div>
                <svg class="blog-ext" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </div>
              <div class="blog-card-title">${escapeHtml(b.title)}</div>
              <div class="blog-card-summary">${escapeHtml(b.summary || '')}</div>
              <div class="blog-card-foot">
                ${(b.tags || []).slice(0, 3).map(t => `<span class="blog-tag">${escapeHtml(t)}</span>`).join('')}
                ${b.year ? `<span class="blog-year">${escapeHtml(b.year)}</span>` : ''}
              </div>
            </a>`;
          }).join('')}
        </div>`}
  `;

  // Wire filters
  body.querySelectorAll('.blog-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      BLOGS_STATE.category = chip.dataset.cat;
      renderBlogsView();
    });
  });
  const search = document.getElementById('blogs-search-input');
  if (search) {
    search.addEventListener('input', e => {
      BLOGS_STATE.query = e.target.value;
      const pos = e.target.selectionStart;
      renderBlogsView();
      const again = document.getElementById('blogs-search-input');
      if (again) { again.focus(); again.setSelectionRange(pos, pos); }
    });
  }
}

/* ══════════════════════════════════════════════════════════════
   UTILITY FUNCTIONS
   ══════════════════════════════════════════════════════════════ */

/** Escape HTML for safe insertion */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Escape for use inside HTML attribute values */
function escapeAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Escape for use in RegExp */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Create a URL-safe slug from text */
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
