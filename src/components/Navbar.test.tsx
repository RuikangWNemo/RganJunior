import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { announceProgramSection } from '@/lib/programNavigation';
import Navbar from './Navbar';

function CurrentPath() {
  const location = useLocation();
  return <output aria-label="current path">{`${location.pathname}${location.hash}`}</output>;
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

  it('places the founder story after Programs and marks it as the current route', async () => {
    renderNavbar('/story');

    fireEvent.click(screen.getByRole('button', { name: '打开导航菜单' }));
    await screen.findByRole('dialog', { name: '网站导航' });

    const programs = screen.getByRole('button', { name: '项目' });
    const story = screen.getByRole('button', { name: '发起人故事' });
    expect(programs.compareDocumentPosition(story) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(story).toHaveAttribute('aria-current', 'page');
  });

  it('places Field Notes after the founder story and exposes both article views', async () => {
    renderNavbar('/field-notes/all');

    const story = screen.getByRole('link', { name: '发起人故事' });
    const fieldNotes = screen.getByRole('link', { name: '田野笔记' });
    expect(story.compareDocumentPosition(fieldNotes) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(fieldNotes).toHaveAttribute('aria-current', 'page');

    const desktopMenu = screen.getByRole('menu', { name: '田野笔记次级菜单' });
    expect(within(desktopMenu).getByRole('menuitem', { name: '精选文章' })).toHaveAttribute('href', '/field-notes');
    expect(within(desktopMenu).getByRole('menuitem', { name: '全部文章' })).toHaveAttribute('aria-current', 'location');

    fireEvent.click(screen.getByRole('button', { name: '打开导航菜单' }));
    const dialog = await screen.findByRole('dialog', { name: '网站导航' });
    expect(within(dialog).getByRole('button', { name: '精选文章' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: '全部文章' })).toHaveAttribute('aria-current', 'location');
  });

  it('places Impact after Field Notes and exposes overview and recognition', async () => {
    renderNavbar('/impact/awards');

    const fieldNotes = screen.getByRole('link', { name: '田野笔记' });
    const impact = screen.getByRole('link', { name: '影响' });
    expect(fieldNotes.compareDocumentPosition(impact) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(impact).toHaveAttribute('aria-current', 'page');

    const desktopMenu = screen.getByRole('menu', { name: '影响次级菜单' });
    expect(within(desktopMenu).getByRole('menuitem', { name: '统计' })).toHaveAttribute('href', '/impact');
    expect(within(desktopMenu).getByRole('menuitem', { name: '获奖情况' })).toHaveAttribute('aria-current', 'location');

    fireEvent.click(screen.getByRole('button', { name: '打开导航菜单' }));
    const dialog = await screen.findByRole('dialog', { name: '网站导航' });
    expect(within(dialog).getByRole('button', { name: '统计' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: '获奖情况' })).toHaveAttribute('aria-current', 'location');
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
    fireEvent.click(screen.getByRole('button', { name: '项目' }));

    expect(screen.queryByRole('dialog', { name: '网站导航' })).not.toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'current path' })).toHaveTextContent('/');

    await waitFor(() => {
      expect(screen.getByRole('status', { name: 'current path' })).toHaveTextContent('/programs');
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

  it('shows and navigates the four About chapters', async () => {
    renderNavbar('/about#method');

    fireEvent.click(screen.getByRole('button', { name: '打开导航菜单' }));
    await screen.findByRole('dialog', { name: '网站导航' });

    expect(screen.getByRole('button', { name: '我们的团队' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '我们相信' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '我们的方法' })).toHaveAttribute('aria-current', 'location');
    expect(screen.getByRole('button', { name: '空间与场域' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '空间与场域' }));

    await waitFor(() => {
      expect(screen.getByRole('status', { name: 'current path' })).toHaveTextContent('/about#places');
    });
  });

  it('exposes the four programs without descriptions in the desktop submenu', () => {
    renderNavbar('/programs#action-group');

    const menu = screen.getByRole('menu', { name: '项目次级菜单' });
    expect(within(menu).getByRole('menuitem', { name: '生活体验营' })).toHaveAttribute(
      'href',
      '/programs#life-experience-camp',
    );
    expect(within(menu).getByRole('menuitem', { name: '生活共创营' })).toHaveAttribute(
      'href',
      '/programs#life-co-creation-camp',
    );
    expect(within(menu).getByRole('menuitem', { name: '行动小组' })).toHaveAttribute(
      'aria-current',
      'location',
    );
    expect(within(menu).getByRole('menuitem', { name: '青少年研究计划' })).toHaveAttribute(
      'href',
      '/programs#public-projects',
    );
    expect(within(menu).queryByText('融入生活，产生链接')).not.toBeInTheDocument();
  });

  it('keeps Programs active on a program detail route', () => {
    renderNavbar('/programs/life-co-creation-camp');

    expect(screen.getByRole('link', { name: '项目' })).toHaveAttribute('aria-current', 'page');
    expect(
      within(screen.getByRole('menu', { name: '项目次级菜单' })).getByRole('menuitem', {
        name: '生活共创营',
      }),
    ).toHaveAttribute('aria-current', 'location');
  });

  it('moves the Programs submenu selection with the active overview section', () => {
    renderNavbar('/programs');

    const menu = screen.getByRole('menu', { name: '项目次级菜单' });
    const lifeCamp = within(menu).getByRole('menuitem', { name: '生活体验营' });
    const publicProjects = within(menu).getByRole('menuitem', { name: '青少年研究计划' });

    expect(lifeCamp).toHaveAttribute('aria-current', 'location');
    expect(publicProjects).not.toHaveAttribute('aria-current');

    act(() => announceProgramSection('public-projects'));

    expect(lifeCamp).not.toHaveAttribute('aria-current');
    expect(publicProjects).toHaveAttribute('aria-current', 'location');
  });

  it('matches the Programs submenu selection on an inquiry route', () => {
    renderNavbar('/programs/inquiry?program=action-group');

    expect(
      within(screen.getByRole('menu', { name: '项目次级菜单' })).getByRole('menuitem', {
        name: '行动小组',
      }),
    ).toHaveAttribute('aria-current', 'location');
  });

  it('switches to the hovered desktop submenu and closes it after selecting an item', () => {
    renderNavbar();

    const aboutLink = screen.getByRole('link', { name: '关于' });
    const programsLink = screen.getByRole('link', { name: '项目' });
    const aboutMenuContainer = screen.getByRole('menu', { name: '关于次级菜单' }).parentElement;
    const programsMenu = screen.getByRole('menu', { name: '项目次级菜单' });
    const programsMenuContainer = programsMenu.parentElement;

    act(() => aboutLink.focus());
    fireEvent.click(aboutLink);
    expect(aboutMenuContainer).toHaveClass('visible', 'opacity-100');
    expect(programsMenuContainer).toHaveClass('invisible', 'opacity-0');

    fireEvent.mouseEnter(programsLink);
    expect(aboutMenuContainer).toHaveClass('invisible', 'opacity-0');
    expect(programsMenuContainer).toHaveClass('visible', 'opacity-100');

    fireEvent.click(within(programsMenu).getByRole('menuitem', { name: '生活共创营' }));
    expect(aboutMenuContainer).toHaveClass('invisible', 'opacity-0');
    expect(programsMenuContainer).toHaveClass('invisible', 'opacity-0');
  });

  it('closes a fixed desktop submenu after the pointer stays outside for two seconds', () => {
    vi.useFakeTimers();

    try {
      renderNavbar();

      const aboutLink = screen.getByRole('link', { name: '关于' });
      const aboutMenuContainer = screen.getByRole('menu', { name: '关于次级菜单' }).parentElement;
      const aboutMenuRegion = aboutLink.parentElement;

      act(() => aboutLink.focus());
      fireEvent.click(aboutLink);
      fireEvent.mouseLeave(aboutMenuRegion!);

      act(() => vi.advanceTimersByTime(1_500));
      expect(aboutMenuContainer).toHaveClass('visible', 'opacity-100');

      fireEvent.mouseEnter(aboutMenuRegion!);
      act(() => vi.advanceTimersByTime(1_000));
      expect(aboutMenuContainer).toHaveClass('visible', 'opacity-100');

      fireEvent.mouseLeave(aboutMenuRegion!);
      act(() => vi.advanceTimersByTime(1_999));
      expect(aboutMenuContainer).toHaveClass('visible', 'opacity-100');

      act(() => vi.advanceTimersByTime(1));
      expect(aboutMenuContainer).toHaveClass('invisible', 'opacity-0');
    } finally {
      vi.useRealTimers();
    }
  });

  it('navigates to an Action product from the mobile drawer', async () => {
    renderNavbar('/');

    fireEvent.click(screen.getByRole('button', { name: '打开导航菜单' }));
    const dialog = await screen.findByRole('dialog', { name: '网站导航' });
    fireEvent.click(within(dialog).getByRole('button', { name: '生活共创营' }));

    await waitFor(() => {
      expect(screen.getByRole('status', { name: 'current path' })).toHaveTextContent(
        '/programs#life-co-creation-camp',
      );
    });
  });
});
