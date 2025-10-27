import { registerPlugin } from '@capacitor/core';

import type { CapacitorShareTargetPlugin } from './definitions';

const CapacitorShareTarget = registerPlugin<CapacitorShareTargetPlugin>('CapacitorShareTarget', {
  web: () => import('./web').then((m) => new m.CapacitorShareTargetWeb()),
});

export * from './definitions';
export { CapacitorShareTarget };
