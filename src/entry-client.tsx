import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import App from 'app/App';

// If we don't have the app element, something has gone EXTREMELY wrong.
 
const root = createRoot(document.getElementById('app')!);

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
