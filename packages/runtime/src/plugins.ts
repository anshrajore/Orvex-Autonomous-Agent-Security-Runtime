import type { OrvexPlugin, PluginContext } from '@orvex/core';

export class PluginRegistry {
  private readonly plugins: OrvexPlugin[] = [];

  async register(plugin: OrvexPlugin, trusted: boolean): Promise<void> {
    if (!trusted) {
      throw new Error(`Refusing to load untrusted plugin ${plugin.id}`);
    }
    const context: PluginContext = {
      registerAdapter: () => undefined,
      registerSandbox: () => undefined,
      registerDetector: () => undefined,
      registerAuditSink: () => undefined,
    };
    await plugin.register(context);
    this.plugins.push(plugin);
  }

  list(): OrvexPlugin[] {
    return [...this.plugins];
  }
}
