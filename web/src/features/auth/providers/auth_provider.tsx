import { useEffect } from 'react';
import { db } from '@db/client';
import { useAuthStore, type PeruanistaUser } from '@auth/store/auth_store';
import type { User } from '@supabase/supabase-js';
import type { Nullish } from '@common/types';

type AuthProviderProps = {
  children: React.ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { setUser, setProfileCompleted, setAuthChecked } = useAuthStore();

  useEffect(() => {
    const fetchProfile = async (user_id: string) => {
      const { data, error } = await db
        .from('profiles')
        .select('*')
        .eq('id', user_id)
        .single();

      if (error) {
        // user have no linked profile, which is fatal
        return null;
      }
      return data;
    };

    const handleSupabaseUser = async (supaUser: Nullish<User>) => {
      const user = (supaUser ?? null) as PeruanistaUser | null;

      console.log('HANDLING', supaUser);

      try {
        if (!user) return;

        const profile = await fetchProfile(user.id);
        if (!profile) return;

        user.profile = profile;
        setProfileCompleted(profile.profile_completed);
      } finally {
        setUser(user);
        setAuthChecked(true);
      }
    };

    const getSession = async () => {
      const { data: { session } } = await db.auth.getSession();
      handleSupabaseUser(session?.user);
    };

    const { data: listener } = db.auth.onAuthStateChange(async (_event, session) => {
      handleSupabaseUser(session?.user);
    });

    getSession();

    return () => {
      listener?.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
};
