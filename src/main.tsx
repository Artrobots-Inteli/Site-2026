import React from 'react';
import { createRoot } from 'react-dom/client';
import LeagueApp from './LeagueApp';
import './league.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><LeagueApp /></React.StrictMode>);
