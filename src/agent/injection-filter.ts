const INJECTION_PATTERNS = [
  /ignore\s+(previous|all|above)/i,
  /system\s+prompt/i,
  /developer\s+mode/i,
  /reveal\s+(prompt|instructions|system)/i,
  /disregard\s+(previous|instructions)/i,
  /new\s+instructions/i,
  /override\s+instructions/i,
  /forget\s+(everything|previous)/i,
  /act\s+as\s+(admin|root|system)/i,
];

const DANGEROUS_STRINGS = [
  '<script',
  'javascript:',
  'onerror',
  'onclick',
  'onload',
  'eval(',
  'Function(',
];

export interface FilterResult {
  safe: boolean;
  reason?: string;
}

export function detectInjection(input: string): FilterResult {
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return {
        safe: false,
        reason: `Detected potential prompt injection: ${pattern.source}`,
      };
    }
  }

  const lowerInput = input.toLowerCase();
  for (const dangerous of DANGEROUS_STRINGS) {
    if (lowerInput.includes(dangerous)) {
      return {
        safe: false,
        reason: `Detected dangerous string: ${dangerous}`,
      };
    }
  }

  return { safe: true };
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}
