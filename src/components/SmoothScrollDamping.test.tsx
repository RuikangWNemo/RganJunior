import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import SmoothScrollDamping from './SmoothScrollDamping';
let height = 10000; let y = 7000; let next = 0; const frames = new Map<number, FrameRequestCallback>();
beforeEach(() => {
  height = 10000; y = 7000; next = 0; frames.clear();
  vi.spyOn(window,'matchMedia').mockImplementation(query => ({ matches: !query.includes('reduced-motion'), addEventListener: vi.fn(), removeEventListener: vi.fn() }) as unknown as MediaQueryList);
  vi.spyOn(window,'requestAnimationFrame').mockImplementation(callback => { frames.set(++next,callback); return next; });
  vi.spyOn(window,'cancelAnimationFrame').mockImplementation(id => { frames.delete(id); });
  vi.spyOn(window,'scrollY','get').mockImplementation(() => y);
  vi.spyOn(document.documentElement,'scrollHeight','get').mockImplementation(() => height);
  vi.spyOn(window,'scrollTo').mockImplementation(options => { y = Math.max(0,Math.min((options as ScrollToOptions).top ?? 0,height-window.innerHeight)); });
});
afterEach(() => vi.restoreAllMocks());
function frame() { act(() => { const [id, callback] = [...frames][0]; frames.delete(id); callback(0); }); }
it('clamps both scrolling positions when a long page becomes short during inertia', () => {
  render(<SmoothScrollDamping />); fireEvent.wheel(document.body,{deltaY:120,deltaMode:1});
  expect(frames.size).toBe(1); height = 1600; y = 1600 - window.innerHeight;
  frame(); expect(window.scrollTo).toHaveBeenLastCalledWith({top:y,left:0,behavior:'auto'}); expect(frames.size).toBe(0);
});
it('cancels a queued Windows line-wheel frame when navigation resets the viewport', () => {
  render(<SmoothScrollDamping />); fireEvent.wheel(document.body,{deltaY:3,deltaMode:1});
  expect(frames.size).toBe(1);
  act(() => window.dispatchEvent(new Event('rgan:smooth-scroll-sync')));
  expect(frames.size).toBe(0);
});
it('yields to native scrollbar or keyboard position changes instead of pulling back', () => {
  render(<SmoothScrollDamping />); fireEvent.wheel(document.body,{deltaY:120});
  y = 200; fireEvent.scroll(window); expect(frames.size).toBe(0);
});
