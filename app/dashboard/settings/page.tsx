'use client';

import { useRequireAuth } from '@/lib/hooks/userRequireAuth';
import LoadingScreen from '@/components/workout/LoadingScreen';

const SettingsPage = () => {
  const { user, loading } = useRequireAuth('/login');

  if (!user) {
    return null;
  }
  if (loading) {
    return <LoadingScreen />;
  }

  return <div>Settings Page</div>;
};

export default SettingsPage;
