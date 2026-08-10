import { Component, type ErrorInfo, type ReactNode } from 'react';

export default class CommunityPeoplePlanetBoundary extends Component<{
  children: ReactNode;
  fallback: ReactNode;
}, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // The parent provides a complete non-WebGL fallback; no remote error payload is sent.
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
