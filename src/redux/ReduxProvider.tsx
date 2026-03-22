'use client';
import { store } from '@/redux/store';
import { Provider as ReactReduxProvider } from 'react-redux';

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <ReactReduxProvider store={store}>{children}</ReactReduxProvider>;
}
