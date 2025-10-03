import { Header } from '@common/components/header';
import { Footer } from '@common/components/footer';
import { Layout } from '@common/components/layout';
import { useQuery } from '@tanstack/react-query';
import { useScrollReset } from '@common/hooks/useScrollReset';
import { db } from '@db/client';
import type { Tables } from '@db/schema';
import ProfileComponent from '@profile/components/profile_component';
import ContentLoader from 'react-content-loader';
import { useAuthStore } from '@auth/store/auth_store';
import { useLocation } from 'wouter';
import { useEffect, useState } from 'react';

type Props = {
  id: string;
};

async function fetchUserProfile(id: string): Promise<Tables<'profiles'> | null> {
  const { data, error } = await db
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

const useQueryParams = () => {
  const [search] = useState(() => new URLSearchParams(window.location.search))
  return search
}

const useUpdateUrl = () => {
  const [, navigate] = useLocation()

  return (tab: string, userId: string) => {
    const newUrl = `/u/${userId}?tab=${tab}`
    navigate(newUrl)
  }
}

export function UserProfileDetail({ id }: Props) {
  useScrollReset()
  const currentUser = useAuthStore((state) => state.user)
  const [, navigate] = useLocation()

  const queryParams = useQueryParams()
  const updateUrl = useUpdateUrl()

  // Check if this is the current user's profile and redirect to /perfil (no kinder egg for u @🐢)
  useEffect(() => {
    if (currentUser?.id === id) {
      navigate("/perfil")
      return
    }
  }, [currentUser?.id, id, navigate])

  const {
    data: userProfile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user_profile_detail", id],
    queryFn: () => fetchUserProfile(id),
    enabled: !!id && currentUser?.id !== id, // Don't fetch if it's own profile
  })

  // Don't render anything if redirecting to own profile
  if (currentUser?.id === id) {
    return null
  }

  return (
    <Layout>
      <Header />
      <div className="mx-auto py-10">
        {isLoading && (
          <ContentLoader
            speed={2}
            width="100%"
            height={200}
            viewBox="0 0 700 200"
            backgroundColor="#ededed"
            foregroundColor="#ecebeb"
          >
            <rect x="0" y="0" rx="6" ry="6" width="60%" height="24" />
            <rect x="0" y="40" rx="4" ry="4" width="100%" height="120" />
          </ContentLoader>
        )}
        {isError && <div className="text-center text-red-600">Error al cargar el perfil.</div>}
        {userProfile && (
          <ProfileComponent
            userId={id}
            isOwnProfile={false}
            initialTab={queryParams.get("tab")}
            onTabChange={(tab) => updateUrl(tab, id)}
          />
        )}
      </div>
      <Footer />
    </Layout>
  )
}
