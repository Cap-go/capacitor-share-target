import { WebPlugin } from '@capacitor/core';

import type { CapacitorShareTargetPlugin } from './definitions';

export class CapacitorShareTargetWeb extends WebPlugin implements CapacitorShareTargetPlugin {
  async getPluginVersion(): Promise<{ version: string }> {
    return { version: 'web' };
  }
}
