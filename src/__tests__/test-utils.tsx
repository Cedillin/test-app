import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '../context/ThemeContext';
import { I18nProvider } from '../context/I18nContext';
import { CheckInProvider } from '../context/CheckInContext';

export async function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ThemeProvider><I18nProvider><CheckInProvider>{ui}</CheckInProvider></I18nProvider></ThemeProvider>,
  );
}
export * from '@testing-library/react-native';
