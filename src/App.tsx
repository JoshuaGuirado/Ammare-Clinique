/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './store';
import Home from './pages/Home';
import Admin from './pages/Admin';
import CustomKit from './pages/CustomKit';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen text-ammare-dark font-sans flex flex-col transition-colors duration-700">
          <main className="flex-grow selection:bg-ammare-primary/20 selection:text-ammare-primary">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/meu-kit" element={<CustomKit />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppProvider>
  );
}
