import { NO_IMAGE_URL } from '@common/constants';
import { formatDate2 } from '@common/utils';
import { Eye, MessageSquare, ThumbsUp, MoreVertical, Ban, Share2, HeartIcon } from 'lucide-react';
import ContentLoader from 'react-content-loader';
import { Link } from 'wouter';
import { useState, useRef, useEffect } from 'react';
import { db } from '@db/client';
import { useAuthStore } from '@auth/store/auth_store';
import { useMutation } from '@tanstack/react-query';
import type { RecommendedPublication } from '@home/components/feed';
import { Modal } from '@common/components/modal';
import { Share } from '@common/components/share';
import { toast } from 'sonner';

type PublicationCardProps = RecommendedPublication & {};

export function PublicationCard(publication: PublicationCardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  // const queryClient = useQueryClient();

  // Mutation to hide publication
  const hidePublicationMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await db
        .from('preferences_hidden_publications')
        .insert({
          user_id: user.id,
          publication_id: publication.id
        });

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate queries to refresh the feed
      // queryClient.invalidateQueries({ queryKey: ['damero_paginated_list'] });
    },
    onError: (error) => {
      console.error('Error hiding publication:', error);
      setIsHidden(false); // Revert the optimistic update
    }
  });

  // Mutation to unhide publication
  const unhidePublicationMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await db
        .from('preferences_hidden_publications')
        .delete()
        .eq('user_id', user.id)
        .eq('publication_id', publication.id);

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate queries to refresh the feed
      // queryClient.invalidateQueries({ queryKey: ['damero_paginated_list'] });
    },
    onError: (error) => {
      console.error('Error unhiding publication:', error);
      setIsHidden(true); // Revert the optimistic update
    }
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotInterested = () => {
    if (!user?.id) {
      toast.error('Para ocultar publicaciones necesitas iniciar sesión. ¡Regístrate gratis para personalizar tu experiencia!');
      return;
    }

    setIsHidden(true); // Optimistic update
    setIsDropdownOpen(false);
    hidePublicationMutation.mutate();
  };

  const handleInterested = () => {
    if (!user?.id) {
      toast.error('Para seguir publicaciones necesitas iniciar sesión. ¡Regístrate gratis para personalizar tu experiencia!');
      return;
    }
    toast.success(`Verás más publicaciones de ${publication.source_name}`);

    setIsDropdownOpen(false);
  };


  const handleShare = () => {
    setIsDropdownOpen(false);
    setShareOpen(true);
  };

  const handleUndo = () => {
    if (!user?.id) {
      toast.error('Para gestionar publicaciones ocultas necesitas iniciar sesión. ¡Regístrate gratis!');
      // Optionally redirect to login/signup page
      window.location.href = '/login';
      return;
    }

    setIsHidden(false); // Optimistic update
    unhidePublicationMutation.mutate();
  };

  // Hidden state view
  if (isHidden) {
    return (
      <article className='flex flex-col border border-border items-center justify-center rounded-sm bg-gray-50'>
        <div className='flex flex-col items-center justify-center p-4 gap-4'>
          <div className='flex flex-row items-center gap-5'>
            <div className='w-12 h-12 bg-gray-200 rounded-sm flex items-center justify-center'>
              <Eye size={20} className='text-gray-400' />
            </div>
            <div className='flex flex-col'>
              <h3 className='font-medium text-gray-700'>Publicación ocultada</h3>
              <p className='text-sm text-gray-500'>
                Esta publicación ha sido marcada como "No me interesa"
              </p>
            </div>
          </div>
          <button
            onClick={handleUndo}
            className='px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors'
          >
            Deshacer
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className='flex flex-col border border-border rounded-sm relative group'>
      {/* Triple dot menu button */}
      <div className='absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
        <div className='relative' ref={dropdownRef}>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDropdownOpen(!isDropdownOpen);
            }}
            className='p-1 bg-white/90 hover:bg-white rounded-full shadow-sm border border-gray-200 transition-colors'
          >
            <MoreVertical size={16} className='text-gray-600' />
          </button>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div className='absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-[200px] z-20'>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleInterested();
                }}
                className='w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2'
              >
                <HeartIcon className='max-w-4 max-h-8 text-gray-500' />
                Ver más de {publication.source_name}
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleNotInterested();
                }}
                className='w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2'
              >
                <Ban className='max-w-4 max-h-4 text-gray-500' />
                No me interesa
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleShare();
                }}
                className='w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2'
              >
                <Share2 className='max-w-4 max-h-4 text-gray-500' />
                Compartir
              </button>
            </div>
          )}
        </div>
      </div>

      <Link href={`/feed/${publication.id}`}>
        {/* Project image */}
        <img
          height={200}
          width={'100%'}
          className='object-cover h-[200px] rounded-t-sm bg-[#ededed]'
          alt={publication.title}
          src={publication.image_url ?? NO_IMAGE_URL}
        />
        {/* Project information */}
        <div className='flex flex-col p-3 min-h-[80px] h-[80px]'>
          <h2 className='font-semibold mb-1 line-clamp-2 break-words'>
            {publication.title}
          </h2>
          {/* <span className='font-semibold text-primary mt-1'>
            {formatIoaarType(project.ioarr_type)}
          </span> */}
        </div>
        <div className='flex gap-2 content-between justify-between px-3 pb-2'>
          <span>
            {
              publication.source_id && (
                <div className='flex gap-1 items-center text-sm'>
                  <img width={14} height={14} src={publication.source_image_icon_url} />
                  {publication.source_name}
                </div>
              )
            }
          </span>
          <span className='text-sm'>{formatDate2(publication.created_at)}</span>
        </div>
        {/* Project footer info */}
        <div className='flex items-center text-sm justify-between h-10 bg-gray-100 px-3 py-2 rounded-b-sm border-t border-border'>
          <div className='flex gap-4'>
            <div className='flex gap-1 items-center'>
              <ThumbsUp color='#6e6e6e' size={14} />
              {publication.upvotes - publication.downvotes}
            </div>
            <div className='flex gap-1 items-center'>
              <MessageSquare color='#6e6e6e' size={14} />
              0
            </div>
          </div>
          <div className='flex gap-1 items-center'>
            <Eye color='#6e6e6e' size={16} />
            0
          </div>
        </div>
      </Link>
      <Modal open={shareOpen} onClose={() => setShareOpen(false)}>
        <Share
          url={`${window.location.origin}/feed/${publication.id}`}
          title={publication?.title}
          shareTitle={'Comparte esta publicación'}
          content={publication?.content}
        />
      </Modal>
    </article>
  );
}

// From https://skeletonreact.com/
export function PublicationCardSkeleton() {
  return (
    <article className='flex border border-border rounded-sm'>
      <ContentLoader
        speed={2}
        width={334}
        height={350}
        viewBox="0 0 332 350"
        backgroundColor="#e0e0e0"
        foregroundColor="#ecebeb"
      >
        <rect x="81" y="69" rx="0" ry="0" width="1" height="0" />
        <rect x="0" y="0" rx="0" ry="0" width="329" height="200" />
        <rect x="1" y="309" rx="0" ry="0" width="328" height="40" />
        <rect x="9" y="213" rx="0" ry="0" width="300" height="15" />
        <rect x="9" y="234" rx="0" ry="0" width="270" height="17" />
        <rect x="11" y="280" rx="0" ry="0" width="136" height="18" />
        <rect x="248" y="280" rx="0" ry="0" width="66" height="17" />
      </ContentLoader>
    </article>
  );
}
