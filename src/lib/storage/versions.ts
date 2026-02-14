import { UIRoot } from '@/types';

export interface Version {
  id: string;
  timestamp: number;
  ast: UIRoot;
  code: string;
  intent: string;
}

const MAX_VERSIONS = 50;
const STORAGE_KEY = 'uiforge_versions';

export class VersionManager {
  private versions: Version[] = [];
  private isClient: boolean;

  constructor() {
    this.isClient = typeof window !== 'undefined';
    if (this.isClient) {
      this.loadFromStorage();
    }
  }

  add(ast: UIRoot, code: string, intent: string): Version {
    const version: Version = {
      id: `v${this.versions.length + 1}`,
      timestamp: Date.now(),
      ast,
      code,
      intent,
    };

    this.versions.push(version);

    if (this.versions.length > MAX_VERSIONS) {
      this.versions.shift();
    }

    this.saveToStorage();
    return version;
  }

  get(id: string): Version | null {
    return this.versions.find((v) => v.id === id) || null;
  }

  getAll(): Version[] {
    return [...this.versions];
  }

  clear(): void {
    this.versions = [];
    this.saveToStorage();
  }

  private loadFromStorage(): void {
    if (!this.isClient) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.versions = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load versions from storage:', error);
      this.versions = [];
    }
  }

  private saveToStorage(): void {
    if (!this.isClient) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.versions));
    } catch (error) {
      console.error('Failed to save versions to storage:', error);
    }
  }
}
