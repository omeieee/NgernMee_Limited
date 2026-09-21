import { internalGreeting } from './lib/impl';

/**
 * Public entry point for example deep module.
 * Callers import only from this root file, never from lib/.
 */
export function greet(name: string): string {
  return internalGreeting(name);
}
