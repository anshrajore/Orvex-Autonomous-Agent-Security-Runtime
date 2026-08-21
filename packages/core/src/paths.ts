import { homedir, platform } from 'node:os';
import path from 'node:path';

export function orvexHome(): string {
  const override = process.env.ORVEX_HOME;
  if (override && override.length > 0) {
    return path.resolve(override);
  }
  return path.join(homedir(), '.orvex');
}

export function orvexPaths() {
  const home = orvexHome();
  return {
    home,
    sessions: path.join(home, 'sessions'),
    audit: path.join(home, 'audit'),
    checkpoints: path.join(home, 'checkpoints'),
    policies: path.join(home, 'policies'),
    cache: path.join(home, 'cache'),
    config: path.join(home, 'config'),
    plugins: path.join(home, 'plugins'),
    globalConfig: path.join(home, 'config', 'config.yml'),
  };
}

export function userConfigPath(): string {
  if (platform() === 'win32') {
    const appData = process.env.APPDATA;
    if (appData) {
      return path.join(appData, 'orvex', 'config.yml');
    }
  }
  return path.join(homedir(), '.config', 'orvex', 'config.yml');
}

export function projectPolicyPath(cwd = process.cwd()): string {
  return path.join(cwd, '.orvex.yml');
}
