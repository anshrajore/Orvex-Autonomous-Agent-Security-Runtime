export const EXIT_CODES = {
  SUCCESS: 0,
  POLICY_VIOLATION: 1,
  BLOCKED_ACTION: 2,
  SECURITY_ERROR: 3,
  CONFIGURATION_ERROR: 4,
  SANDBOX_UNAVAILABLE: 5,
  APPROVAL_DENIED: 6,
} as const;

export type ExitCode = (typeof EXIT_CODES)[keyof typeof EXIT_CODES];

export const SECURITY_EVENT_TYPES = [
  'PROCESS_START',
  'PROCESS_EXEC',
  'PROCESS_EXIT',
  'FILE_READ',
  'FILE_WRITE',
  'FILE_CREATE',
  'FILE_DELETE',
  'FILE_RENAME',
  'FILE_PERMISSION_CHANGE',
  'NETWORK_CONNECT',
  'NETWORK_LISTEN',
  'DNS_LOOKUP',
  'SECRET_ACCESS',
  'SECRET_DETECTED',
  'GIT_READ',
  'GIT_WRITE',
  'GIT_PUSH',
  'MCP_CALL',
  'MCP_RESULT',
  'BROWSER_NAVIGATION',
  'CLIPBOARD_READ',
  'CLIPBOARD_WRITE',
  'PROMPT_INJECTION_DETECTED',
  'POLICY_DECISION',
  'APPROVAL_REQUEST',
  'SESSION_START',
  'SESSION_END',
  'CHECKPOINT_CREATED',
  'ROLLBACK_EXECUTED',
] as const;

export type SecurityEventType = (typeof SECURITY_EVENT_TYPES)[number];

export type Decision = 'allow' | 'deny' | 'ask';

export type RiskLevel = 'low' | 'moderate' | 'elevated' | 'high' | 'critical';

export type SecurityProfile = 'relaxed' | 'balanced' | 'strict' | 'paranoid' | 'ci';

export type ApprovalMode = 'auto' | 'ask' | 'strict' | 'balanced';

export type TrustZone = 'TRUSTED' | 'SEMI_TRUSTED' | 'UNTRUSTED';

export type McpTrust = 'trusted' | 'verified' | 'restricted' | 'unknown' | 'blocked';

export type SandboxStrength = 'WEAK' | 'MODERATE' | 'STRONG' | 'HARDENED' | 'UNAVAILABLE';

export type ResourceClass =
  | 'PUBLIC'
  | 'PROJECT'
  | 'SENSITIVE'
  | 'SECRET'
  | 'SYSTEM'
  | 'CRITICAL';

export type Capability =
  | 'filesystem.read'
  | 'filesystem.write'
  | 'filesystem.create'
  | 'filesystem.delete'
  | 'process.execute'
  | 'network.connect'
  | 'network.listen'
  | 'dns.resolve'
  | 'secret.read'
  | 'git.read'
  | 'git.write'
  | 'git.push'
  | 'git.forcePush'
  | 'mcp.call'
  | 'browser.navigate'
  | 'clipboard.read'
  | 'clipboard.write';

export type MemoryClass =
  | 'USER'
  | 'TRUSTED_INSTRUCTION'
  | 'AGENT_GENERATED'
  | 'EXTERNAL'
  | 'UNTRUSTED'
  | 'SECRET';

export interface Actor {
  id: string;
  kind: 'agent' | 'user' | 'system';
  adapterId?: string;
}

export interface Resource {
  kind:
    | 'file'
    | 'directory'
    | 'command'
    | 'host'
    | 'mcp'
    | 'git'
    | 'secret'
    | 'env'
    | 'memory'
    | 'other';
  value: string;
  classification?: ResourceClass;
}

export interface Action {
  type: SecurityEventType | string;
  capability: Capability;
  verb: string;
}

export interface EventSource {
  origin: 'local' | 'network' | 'mcp' | 'tool' | 'user' | 'agent';
  trustZone: TrustZone;
  label?: string;
}

export interface DataProvenance {
  sourceId: string;
  trustZone: TrustZone;
  origin: EventSource['origin'];
  timestamp: string;
}

export interface ExecutionContext {
  cwd: string;
  sessionId: string;
  agentId: string;
  profile: SecurityProfile;
  dryRun: boolean;
  approvalMode: ApprovalMode;
  env: Record<string, string>;
  provenance?: DataProvenance;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  sessionId: string;
  agentId: string;
  type: SecurityEventType;
  action: Action;
  resource?: Resource;
  source?: EventSource;
  metadata: Record<string, unknown>;
}

export interface RiskFactor {
  id: string;
  category: string;
  contribution: number;
  explanation: string;
}

export interface RiskAssessment {
  score: number;
  level: RiskLevel;
  factors: RiskFactor[];
  explanation: string;
}

export interface Rule {
  id: string;
  effect: Decision;
  priority: number;
  capability?: Capability;
  description?: string;
}

export interface PolicyDecision {
  decision: Decision;
  reason: string;
  matchedRules: Rule[];
  riskScore: number;
  expiresAt?: string;
}

export interface CapabilityConstraint {
  kind: 'path' | 'domain' | 'command' | 'time' | 'once';
  value: string;
}

export interface CapabilityGrant {
  id: string;
  agentId: string;
  capability: Capability;
  scope: string;
  issuedAt: string;
  expiresAt?: string;
  source: 'policy' | 'human';
  constraints?: CapabilityConstraint[];
}

export interface SessionStatistics {
  allowed: number;
  denied: number;
  asked: number;
  filesRead: number;
  filesWritten: number;
  commands: number;
  network: number;
  secretsBlocked: number;
  mcpCalls: number;
}

export interface Session {
  id: string;
  agentId: string;
  startedAt: string;
  endedAt?: string;
  profile: SecurityProfile;
  riskScore: number;
  cwd: string;
  statistics: SessionStatistics;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  sessionId: string;
  agentId: string;
  action: string;
  resource?: string;
  decision: Decision;
  risk: RiskAssessment;
  reason: string;
}

export interface PluginContext {
  registerAdapter(adapter: unknown): void;
  registerSandbox(provider: unknown): void;
  registerDetector(detector: unknown): void;
  registerAuditSink(sink: unknown): void;
}

export interface OrvexPlugin {
  id: string;
  version: string;
  register(context: PluginContext): Promise<void>;
}

export const DEFAULT_SAFE_ENV = ['PATH', 'HOME', 'PWD', 'TERM', 'LANG', 'SHELL', 'USER', 'TMPDIR'];

export const SENSITIVE_ENV_PATTERNS = [
  /^AWS_/i,
  /TOKEN/i,
  /SECRET/i,
  /PASSWORD/i,
  /PRIVATE_KEY/i,
  /^OPENAI_/i,
  /^ANTHROPIC_/i,
  /^GITHUB_/i,
  /DATABASE_URL/i,
  /^NPM_TOKEN$/i,
];
