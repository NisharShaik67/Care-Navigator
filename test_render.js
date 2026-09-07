import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { AppProvider } from './src/context/AppContext.jsx';
import { LandingView } from './src/views/LandingView.jsx';

try {
  const html = ReactDOMServer.renderToString(
    React.createElement(AppProvider, null, React.createElement(LandingView, null))
  );
  console.log('SUCCESS: Rendered LandingView to HTML string! Length:', html.length);
} catch (err) {
  console.error('ERROR during React rendering:', err);
}
