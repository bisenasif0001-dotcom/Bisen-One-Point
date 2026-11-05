import React, { Component, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { routeInfo } from '../data/siteRoutes';
import NotFoundPage from '../pages/NotFoundPage';

class RouteBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return <div role="alert" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2rem' }}>Let’s open that again.</h1>
      <p style={{ margin: '1rem 0' }}>This page could not load. Check your connection and try again.</p>
      <button type="button" className="btn-primary" onClick={() => window.location.reload()}>Reload page</button>
      <a href="/" style={{ display: 'block', marginTop: '1.5rem' }}>Return home</a>
    </div>;
  }
}

export default function RouteScreen({ children }) {
  const location = useLocation();
  const info = routeInfo(location.pathname);
  useEffect(() => {
    document.title = info.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', info.description);
    const robots = document.querySelector('meta[name="robots"]');
    const allowed = document.documentElement.dataset.indexable === 'true' && info.indexable;
    robots?.setAttribute('content', allowed ? 'index, follow' : 'noindex, nofollow');
    const canonical = document.querySelector('link[rel="canonical"]');
    canonical?.setAttribute('href', `${window.location.origin}${info.canonical}`);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', info.title);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', `${window.location.origin}${info.canonical}`);
  }, [info.title, info.description, info.indexable, info.canonical]);
  return <RouteBoundary key={location.pathname}>{info.known ? children : <NotFoundPage />}</RouteBoundary>;
}
