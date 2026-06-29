import { useNetworkState } from 'expo-network';

/**
 * Connectivity flag for the kiosk's offline-first UX.
 *
 * The app already works offline (bundled data, AsyncStorage check-ins, bundled
 * fonts, cached images) — this only drives the "Offline" indicator. Undefined
 * readings are treated as online so the kiosk never flashes a false "offline"
 * on first paint or on platforms that don't report a value.
 */
export function useOnline(): boolean {
  const { isConnected, isInternetReachable } = useNetworkState();
  return isConnected !== false && isInternetReachable !== false;
}
