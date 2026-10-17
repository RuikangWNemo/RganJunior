import { Component, useEffect, useState, type ErrorInfo, type ReactNode } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import RouteViewport from './RouteViewport';

export function RouteFeedback({ failed = false }: { failed?: boolean }) {
  const { t } = useLanguage();
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setSlow(true), 8000);
    return () => window.clearTimeout(timer);
  }, []);
  return <RouteViewport><section className="flex min-h-svh items-center justify-center bg-background px-6 py-28 text-foreground" style={{ fontFamily: 'system-ui, sans-serif' }}>
    <div className="max-w-lg space-y-5">
      <h1 className="text-2xl" style={{ fontFamily: 'inherit' }}>{failed ? t('页面暂时未能打开', 'This page could not be opened') : t('正在打开页面…', 'Opening the page…')}</h1>
      <p role={failed ? 'alert' : 'status'} className="leading-7">{failed
        ? t('页面文件可能未下载完整，或加载时遇到了问题。请重新加载，或先返回首页。', 'A page file may not have downloaded, or the page encountered an error. Reload or return home.')
        : slow ? t('加载时间比平时长，请检查网络，或重新加载页面。', 'Loading is taking longer than usual. Check your connection or reload the page.')
        : t('正在加载内容，请稍候。', 'Loading content. Please wait.')}</p>
      {(slow || failed) && <div className="flex flex-wrap gap-6">
        <button type="button" className="min-h-11 underline" onClick={() => window.location.reload()}>{t('重新加载页面', 'Reload page')}</button>
        <a className="inline-flex min-h-11 items-center underline" href="/">{t('返回首页', 'Return home')}</a>
      </div>}
    </div>
  </section></RouteViewport>;
}

export default class RouteErrorBoundary extends Component<{ children: ReactNode; resetKey: string }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Page render failed', error, info.componentStack); }
  componentDidUpdate(previous: Readonly<{ children: ReactNode; resetKey: string }>) {
    if (this.state.failed && previous.resetKey !== this.props.resetKey) this.setState({ failed: false });
  }
  render() { return this.state.failed ? <RouteFeedback failed /> : this.props.children; }
}
