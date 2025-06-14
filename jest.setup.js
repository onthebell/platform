import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '';
  },
  useParams() {
    return {};
  },
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: props => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />;
  },
}));

// Mock Firebase Auth
jest.mock('@/lib/firebase/auth', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
  }),
}));

// Mock Firebase Firestore
jest.mock('@/lib/firebase/firestore', () => ({
  getPosts: jest.fn(() => Promise.resolve([])),
  getPostById: jest.fn(() => Promise.resolve(null)),
  createPost: jest.fn(() => Promise.resolve('test-id')),
  updatePost: jest.fn(() => Promise.resolve()),
  deletePost: jest.fn(() => Promise.resolve()),
  subscribeToUserNotifications: jest.fn().mockImplementation((userId, callback) => {
    // Simulate real-time subscription by calling callback with mock data
    setTimeout(() => {
      callback([]);
    }, 0);
    // Return unsubscribe function
    return jest.fn();
  }),
}));

// Firebase Comments mocks are handled in individual test files to avoid conflicts

// Comment hook mocks are handled in individual test files to avoid conflicts

// Mock Leaflet and React Leaflet
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: () => <div data-testid="marker" />,
  Popup: ({ children }) => <div data-testid="popup">{children}</div>,
}));

jest.mock('leaflet', () => ({
  icon: jest.fn(() => ({})),
  divIcon: jest.fn(() => ({})),
}));

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock window.confirm
global.confirm = jest.fn(() => true);

// Mock Firebase Config
jest.mock('@/lib/firebase/config', () => {
  // Create mock instances for Firebase services
  const mockAuth = {
    currentUser: null,
    onAuthStateChanged: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
  };

  const mockDb = {
    collection: jest.fn(),
    doc: jest.fn(),
  };

  const mockStorage = {
    ref: jest.fn(() => ({
      put: jest.fn(),
      getDownloadURL: jest.fn(),
      delete: jest.fn(),
    })),
  };

  return {
    auth: mockAuth,
    db: mockDb,
    storage: mockStorage,
    default: {},
  };
});

// Mock Firebase Firestore functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => ({})),
  doc: jest.fn(() => ({})),
  getDocs: jest.fn(() => Promise.resolve({ docs: [], size: 0, empty: true })),
  getDoc: jest.fn(() => Promise.resolve({ exists: () => false, data: () => ({}) })),
  addDoc: jest.fn(() => Promise.resolve({ id: 'mock-id' })),
  setDoc: jest.fn(() => Promise.resolve()),
  updateDoc: jest.fn(() => Promise.resolve()),
  deleteDoc: jest.fn(() => Promise.resolve()),
  query: jest.fn(() => ({})),
  where: jest.fn(() => ({})),
  orderBy: jest.fn(() => ({})),
  limit: jest.fn(() => ({})),
  onSnapshot: jest.fn(() => jest.fn()),
  runTransaction: jest.fn(() => Promise.resolve()),
  writeBatch: jest.fn(() => ({
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    commit: jest.fn(() => Promise.resolve()),
  })),
  increment: jest.fn(val => ({ increment: val })),
  Timestamp: {
    fromDate: jest.fn(date => ({ toDate: () => date })),
    now: jest.fn(() => ({ toDate: () => new Date() })),
  },
}));
