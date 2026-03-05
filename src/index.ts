import { registerPlugin } from "@capacitor/core";

import type { CapacitorShareTargetPlugin } from "./definitions";

const CapacitorShareTarget = registerPlugin<CapacitorShareTargetPlugin>('CapacitorShareTarget', {
  web: () => import('./web').then((m) => new m.CapacitorShareTargetWeb()),
});

const addListener = CapacitorShareTarget.addListener.bind(CapacitorShareTarget);
CapacitorShareTarget.addListener = async (eventName, listenerFunc) => {
  const handle = await addListener(eventName, listenerFunc);
  if (eventName === 'shareReceived') {
    await CapacitorShareTarget.dispatchPendingShare();
  }
  return handle;
};

export * from './definitions';
export { CapacitorShareTarget };
