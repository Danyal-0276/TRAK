/** One-shot admin tab to open after returning from profile / external navigation. */
let pendingAdminTab = null;

export function queueAdminTab(tab) {
  pendingAdminTab = tab;
}

export function takeQueuedAdminTab() {
  const tab = pendingAdminTab;
  pendingAdminTab = null;
  return tab;
}
