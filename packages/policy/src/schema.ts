import { z } from 'zod';

const decision = z.enum(['allow', 'deny', 'ask']);
const profile = z.enum(['relaxed', 'balanced', 'strict', 'paranoid', 'ci']);
const mcpTrust = z.enum(['trusted', 'verified', 'restricted', 'unknown', 'blocked']);

const pathList = z.array(z.string()).default([]);

const fsSection = z
  .object({
    default: decision.optional(),
    read: z.object({ allow: pathList.optional(), deny: pathList.optional() }).optional(),
    write: z.object({ allow: pathList.optional(), deny: pathList.optional() }).optional(),
    create: z.object({ allow: pathList.optional(), deny: pathList.optional() }).optional(),
    delete: z
      .object({
        default: decision.optional(),
        allow: pathList.optional(),
        deny: pathList.optional(),
      })
      .optional(),
  })
  .default({});

export const PolicyDocumentSchema = z.object({
  version: z.number().int().min(1).default(1),
  profile: profile.default('balanced'),
  filesystem: fsSection,
  process: z
    .object({
      default: decision.optional(),
      allow: z.array(z.string()).optional(),
      deny: z.array(z.string()).optional(),
    })
    .default({}),
  network: z
    .object({
      default: decision.optional(),
      allow: z.array(z.string()).optional(),
      deny: z.array(z.string()).optional(),
    })
    .default({}),
  secrets: z
    .object({
      default: decision.optional(),
    })
    .default({ default: 'deny' }),
  mcp: z
    .object({
      default: decision.optional(),
      servers: z
        .record(
          z.object({
            trust: mcpTrust,
          }),
        )
        .optional(),
    })
    .default({}),
  git: z
    .object({
      protectedBranches: z.array(z.string()).optional(),
    })
    .default({}),
  environment: z
    .object({
      allow: z.array(z.string()).optional(),
      deny: z.array(z.string()).optional(),
    })
    .optional(),
  limits: z
    .object({
      maxProcesses: z.number().int().positive().optional(),
      maxMemoryMb: z.number().int().positive().optional(),
      maxExecutionMinutes: z.number().int().positive().optional(),
      maxDiskMb: z.number().int().positive().optional(),
    })
    .optional(),
});

export type PolicyDocument = z.infer<typeof PolicyDocumentSchema>;
