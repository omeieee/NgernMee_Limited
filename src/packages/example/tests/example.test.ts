import { describe, it, expect } from 'vitest';
import { greet } from '../index';

describe('example deep module', () => {
  it('exercises behavior only through the public entry point', () => {
    expect(greet('NgernMee')).toBe('Hello from deep module, NgernMee!');
  });
});
