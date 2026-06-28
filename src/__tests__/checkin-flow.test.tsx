import { renderWithProviders, screen, fireEvent, waitFor } from './test-utils';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({ id: 'c1', memberId: 'm1' }),
  Link: ({ children }: any) => children,
}));

jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'en' }],
}));

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, style }: any) =>
      React.createElement(View, { style }, children),
    SafeAreaProvider: ({ children }: any) =>
      React.createElement(React.Fragment, null, children),
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
    SafeAreaInsetsContext: {
      Provider: ({ children }: any) =>
        React.createElement(React.Fragment, null, children),
      Consumer: ({ children }: any) =>
        children({ top: 0, right: 0, bottom: 0, left: 0 }),
    },
    SafeAreaFrameContext: {
      Provider: ({ children }: any) =>
        React.createElement(React.Fragment, null, children),
      Consumer: ({ children }: any) =>
        children({ width: 320, height: 640, x: 0, y: 0 }),
    },
    initialWindowMetrics: null,
  };
});

import SearchScreen from '../app/class/[id]/search';
import CheckInScreen from '../app/class/[id]/checkin/[memberId]';

beforeEach(() => mockReplace.mockClear());

test('search filters members and shows no-results', async () => {
  await renderWithProviders(<SearchScreen />);
  // Wait for async hydration — members load after CheckInProvider effect resolves
  await waitFor(() => expect(screen.getByText(/Anna Rossi/)).toBeTruthy());
  // Type a non-matching query → empty state shows "No results"
  fireEvent.changeText(
    screen.getByPlaceholderText(/Search your name|Busca tu nombre|Cerca il tuo nome/),
    'zzzz',
  );
  await waitFor(() => expect(screen.getByText(/No results/)).toBeTruthy());
});

test('check-in navigates to success', async () => {
  await renderWithProviders(<CheckInScreen />);
  // Wait for hydration — member + session must load before the CTA renders
  const cta = await screen.findByText(/Check In/);
  fireEvent.press(cta);
  await waitFor(() =>
    expect(mockReplace).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/success' }),
    ),
  );
});
