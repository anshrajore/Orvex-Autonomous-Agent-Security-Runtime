import net from 'node:net';

const BLOCKED_IPS = new Set(['169.254.169.254', 'metadata.google.internal']);
const PRIVATE = [
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^0\.0\.0\.0$/,
];

function extractHostname(value: string): string {
  const candidate = value.trim();
  try {
    const url = candidate.includes('://') ? new URL(candidate) : new URL(`tcp://${candidate}`);
    return url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  } catch {
    return candidate.replace(/^\[|\]$/g, '').split('/')[0]?.split(':')[0]?.toLowerCase() ?? candidate.toLowerCase();
  }
}

export function isSensitiveDestination(host: string): boolean {
  const hostname = extractHostname(host);
  if (BLOCKED_IPS.has(hostname) || hostname === 'metadata.google.internal') return true;
  if (hostname === 'localhost' || hostname === '::1' || hostname === '0:0:0:0:0:0:0:1') return true;
  if (hostname.startsWith('::ffff:127.')) return true;
  if (PRIVATE.some((re) => re.test(hostname))) return true;
  return false;
}

export function parseCidrMatch(cidr: string, ip: string): boolean {
  const [base, bitsRaw] = cidr.split('/');
  const bits = Number(bitsRaw);
  if (!base || !Number.isFinite(bits)) return ip === cidr;
  const ipNum = ipToInt(ip);
  const baseNum = ipToInt(base);
  if (ipNum === null || baseNum === null) return false;
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return (ipNum & mask) === (baseNum & mask);
}

function ipToInt(ip: string): number | null {
  if (!net.isIP(ip)) return null;
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4) return null;
  return (((parts[0] ?? 0) << 24) | ((parts[1] ?? 0) << 16) | ((parts[2] ?? 0) << 8) | (parts[3] ?? 0)) >>> 0;
}
