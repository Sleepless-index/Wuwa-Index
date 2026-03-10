import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import '@/styles/globals.css';
import { useTrackerStore } from '@/store/trackerStore';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Rehydrate Zustand store from localStorage on client mount
    useTrackerStore.persist.rehydrate();
  }, []);

  return <Component {...pageProps} />;
}
