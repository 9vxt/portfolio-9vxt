let handler = null
export function onShutdown(fn) { handler = fn }
export function shutdown() { if (handler) handler() }
