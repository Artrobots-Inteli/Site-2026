import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './App';
import { preferredRootTarget, routeForPath } from './routes';
import './styles/utilities.css';
import '../style.css';
import '../identity.css';
import '../effects/site-effects.css';
import '../components/site-content.css';
import '../components/member-directory.css';

try {
  const target = preferredRootTarget(location.pathname, localStorage.getItem('artrobots_lang'), navigator.languages, location.hash);
  if (target) location.replace(target);
} catch { /* A blocked preference store does not prevent loading the site. */ }

const container = document.getElementById('root');
if (!container) throw new Error('React root missing');
const app = <StrictMode><App {...routeForPath(location.pathname)} /></StrictMode>;
if (container.hasChildNodes()) hydrateRoot(container, app);
else createRoot(container).render(app);
