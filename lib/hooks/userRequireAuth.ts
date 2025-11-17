import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export const useRequireAuth = (
  directTo: string = '/login',
  redirectIfAuth: boolean = false
) => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (redirectIfAuth) {
        // For landing pages: redirect authenticated users
        if (user) {
          router.push(directTo);
        } else {
          setUser(null);
        }
        setLoading(false);
      } else {
        // Default behavior: redirect unauthenticated users
        if (!user) {
          router.push(directTo);
        } else {
          setUser(user);
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, [router, directTo, redirectIfAuth]);

  return { user, loading };
};
