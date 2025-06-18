import '@testing-library/jest-dom';
import { vi, beforeEach, afterEach } from 'vitest';

// Mock WebSocket for testing
class MockWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  url = '';
  protocol = '';
  extensions = '';
  binaryType: 'blob' | 'arraybuffer' = 'blob';
  bufferedAmount = 0;

  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(url: string, protocols?: string | string[]) {
    this.url = url;
    // Simulate connection
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.onopen?.(new Event('open'));
    }, 10);
  }

  send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    // Mock implementation
  }

  close(code?: number, reason?: string): void {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.(new CloseEvent('close', { code, reason }));
  }

  addEventListener(type: string, listener: EventListener): void {
    // Mock implementation
  }

  removeEventListener(type: string, listener: EventListener): void {
    // Mock implementation
  }

  dispatchEvent(event: Event): boolean {
    return true;
  }
}

global.WebSocket = MockWebSocket as any;

// Mock fetch for API calls
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({}),
  text: () => Promise.resolve(''),
  blob: () => Promise.resolve(new Blob()),
});

// Mock file system operations
const fs = {
  writeFile: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn().mockResolvedValue(''),
  mkdir: vi.fn().mockResolvedValue(undefined),
  access: vi.fn().mockResolvedValue(undefined),
};

vi.mock('fs/promises', () => fs);
vi.mock('fs', () => ({
  ...fs,
  createReadStream: vi.fn(),
  createWriteStream: vi.fn(),
}));

// Mock path module
vi.mock('path', () => ({
  join: (...args: string[]) => args.join('/'),
  resolve: (...args: string[]) => args.join('/'),
  dirname: (path: string) => path.split('/').slice(0, -1).join('/'),
  basename: (path: string) => path.split('/').pop() || '',
  extname: (path: string) => {
    const parts = path.split('.');
    return parts.length > 1 ? `.${parts.pop()}` : '';
  },
}));

// Mock commander for CLI testing
vi.mock('commander', () => ({
  Command: class Command {
    name = vi.fn().mockReturnThis();
    description = vi.fn().mockReturnThis();
    version = vi.fn().mockReturnThis();
    command = vi.fn().mockReturnThis();
    option = vi.fn().mockReturnThis();
    requiredOption = vi.fn().mockReturnThis();
    action = vi.fn().mockReturnThis();
    hook = vi.fn().mockReturnThis();
    parse = vi.fn();
    parseAsync = vi.fn();
  },
}));

// Setup console mocks for cleaner test output
const originalConsole = { ...console };
beforeEach(() => {
  console.log = vi.fn();
  console.warn = vi.fn();
  console.error = vi.fn();
});

afterEach(() => {
  Object.assign(console, originalConsole);
});