import { useState, useEffect } from 'react';
import { Home } from './pages/Home';
import LoadingScreen from './components/ui/LoadingScreen';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [minDisplayDone, setMinDisplayDone] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // Track when loading screen minimum display time has passed
  const handleLoadingComplete = () => {
    setMinDisplayDone(true);
  };

  // Track when actual assets are loaded (e.g., Three.js, fonts)
  useEffect(() => {
    // Wait for window load and a small delay to ensure critical assets
    const handleWindowLoad = () => {
      setTimeout(() => {
        setAssetsLoaded(true);
      }, 500);
    };

    if (document.readyState === 'complete') {
      handleWindowLoad();
    } else {
      window.addEventListener('load', handleWindowLoad);
      return () => window.removeEventListener('load', handleWindowLoad);
    }
  }, []);

  // Both conditions must be true: min display time passed AND assets loaded
  useEffect(() => {
    if (minDisplayDone && assetsLoaded) {
      setIsLoading(false);
    }
  }, [minDisplayDone, assetsLoaded]);

  return (
    <>
      {isLoading && <LoadingScreen onLoadingComplete={handleLoadingComplete} />}
      {!isLoading && <Home />}
    </>
  );
}

export default App;