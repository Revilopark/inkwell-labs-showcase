import { useState, useCallback } from 'react';
import GateScreen from '@/components/GateScreen';
import Gallery from '@/components/Gallery';
import CRTOverlay from '@/components/CRTOverlay';

export default function App() {
  const [unlocked, setUnlocked] = useState(false);

  const handleUnlock = useCallback(() => {
    setUnlocked(true);
  }, []);

  return (
    <div style={{ background: '#050505', minHeight: '100vh' }}>
      {/* Gate screen - always rendered, fades out on unlock */}
      {!unlocked && <GateScreen onUnlock={handleUnlock} />}

      {/* Gallery - rendered after unlock */}
      {unlocked && (
        <>
          <Gallery />
          <CRTOverlay enabled={true} />
        </>
      )}
    </div>
  );
}
