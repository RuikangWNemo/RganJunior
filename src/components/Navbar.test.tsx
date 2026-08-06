import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import Navbar from './Navbar';

function CurrentPath() {
  return <output aria-label="current path">{useLocation().pathname}</output>;
}

function renderNavbar(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <LanguageProvider>
        <Navbar />
        <CurrentPath />
      </LanguageProvider>
    </MemoryRouter>
  );
}

const originalPointerEvent = window.PointerEvent;

beforeAll(() => {
  Object.defineProperty(window, 'PointerEvent', {
    writable: true,
    value: MouseEvent,
  });
});

afterAll(() => {
  Object.defineProperty(window, 'PointerEvent', {
    writable: true,
    value: originalPointerEvent,
  });
});

describe('Navbar mobile drawer', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('rgan-lang', 'zh');
  });

  it('opens an accessible drawer and marks the current route', async () => {
    renderNavbar('/about');

    const trigger = screen.getByRole('button', { name: '打开导航菜单' });
    fireEvent.click(trigger);

    expect(await screen.findByRole('dialog', { name: '网站导航' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '关于' })).toHaveAttribute('aria-current', 'page');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes when Escape is pressed', async () => {
    renderNavbar();

    fireEvent.click(screen.getByRole('button', { name: '打开导航菜单' }));
    await screen.findByRole('dialog', { name: '网站导航' });
    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: '网站导航' })).not.toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: '打开导航菜单' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes from its visible close control', async () => {
    renderNavbar();

    fireEvent.click(screen.getByRole('button', { name: '打开导航菜单' }));
    await screen.findByRole('dialog', { name: '网站导航' });
    fireEvent.click(screen.getByRole('button', { name: '关闭导航抽屉' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: '网站导航' })).not.toBeInTheDocument();
    });
  });

  it('closes before navigating to the selected route', async () => {
    renderNavbar();

    fireEvent.click(screen.getByRole('button', { name: '打开导航菜单' }));
    await screen.findByRole('dialog', { name: '网站导航' });
    fireEvent.click(screen.getByRole('button', { name: '行动' }));

    expect(screen.queryByRole('dialog', { name: '网站导航' })).not.toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'current path' })).toHaveTextContent('/');

    await waitFor(() => {
      expect(screen.getByRole('status', { name: 'current path' })).toHaveTextContent('/actions');
    });
  });

  it('closes after a pointer interaction on the scrim', async () => {
    renderNavbar();

    fireEvent.click(screen.getByRole('button', { name: '打开导航菜单' }));
    await screen.findByRole('dialog', { name: '网站导航' });
    fireEvent.pointerDown(document.body, { button: 0, pointerType: 'touch' });

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: '网站导航' })).not.toBeInTheDocument();
    });
  });
});
