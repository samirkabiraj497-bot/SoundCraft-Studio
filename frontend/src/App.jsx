import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import StudioDashboard from './components/StudioDashboard';

function App() {
  return (
    <ThemeProvider>
      <StudioDashboard />
    </ThemeProvider>
  );
}

export default App;
