import { Stack } from 'expo-router';
import ReactQuerySetup from '@/app/ReactQuerySetup';

export default function RootLayout() {
  return (
    <ReactQuerySetup>
      <Stack screenOptions={{ headerShown: false }} />
    </ReactQuerySetup>
  );
}
