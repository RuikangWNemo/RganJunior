import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import HomeReveal from './HomeReveal';
it('leaves content visible even when IntersectionObserver never reports entry', () => {
  render(<HomeReveal><h2>正文和照片不依赖动画才显示</h2></HomeReveal>);
  expect(screen.getByRole('heading')).toBeVisible();
});
