import { disableSound } from '../components/SoundEngine'

let handler = null
export function onShutdown(fn) { handler = fn }
export function shutdown() {
  disableSound()
  if (handler) handler()
}
