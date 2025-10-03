import { CommentInput } from './commentInput';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { db } from '@db/client';
import type { CommentType } from './commentInput';
import { CommentItem } from './commentItem';
import { useInfiniteQuery } from '@tanstack/react-query';
import { CommentSkeletonItem } from './commentSkeletonItem';

const COMMENTS_RESULTS_PER_PAGE = 4;


type commentType ={
  id: number,
  author_id: string,
  content: string | null,
  created_at: string,
  event_id: string | null,
  project_id: string | null,
  publication_id: string | null,
  profiles: {
    id: string;
    nombres: string;
    apellido_materno: string;
    apellido_paterno: string;
    avatar_url?: string;
  };
}

// TODO: implement dynamic comment retrieving and uploading
//       refer to the Trello for details
export function CommentsSection({project_id, event_id, publication_id}: CommentType) {
  //const {user} = useAuthStore();
  //const [comments, setcomments]= useState<commentType[]>([]);

  const [refresh, setRefresh] = useState(false);

  function handleRefresh() {
    setRefresh(!refresh);
  }

  const fetchComments = async ({ pageParam = 0 }) => {
    const from = pageParam * COMMENTS_RESULTS_PER_PAGE;
    const to = from + COMMENTS_RESULTS_PER_PAGE - 1;

    let query = db
      .from('comments')
      .select('*, profiles(id, nombres, apellido_paterno, apellido_materno, avatar_url)')
      .order('created_at', { ascending: true })
      .range(from, to);

    if (project_id) query = query.eq('project_id', project_id);
    if (event_id) query = query.eq('event_id', event_id);
    if (publication_id) query = query.eq('publication_id', publication_id);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data ?? [];
  };



  const {
    data: commentsPages,
    fetchNextPage,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['comments_paginated_list', project_id, event_id, refresh],
    queryFn: fetchComments,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === COMMENTS_RESULTS_PER_PAGE ? allPages.length : undefined,
  });


  /*  observer for infinite scrolling*/
  const observerTarget = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
      (entries: IntersectionObserverEntry[]) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(()=>{
    console.log('commentssection', publication_id);
    const element = observerTarget.current;
    if (!element) return;

    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(handleObserver, options);
    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleObserver]);//observerTarget


  return (

    <section className="mt-8">
      <h2 className="text-lg font-semibold border-b-2 border-red-600 w-fit mb-4">
      Comentarios
      </h2>
      <CommentInput project_id={project_id} event_id={event_id} publication_id={publication_id} handleRefresh={handleRefresh ?? (()=>{})}/>
      {
        isLoading && (
          <div className="text-center text-gray-500">Cargando comentarios...</div>
        )
      }
      {commentsPages?.pages.map((page, i) => (
        <React.Fragment key={i}>
          {page.map((comment: commentType) => (
            <CommentItem
              key={comment.id}
              id={comment.profiles.id}
              avatar={comment.profiles.avatar_url}
              author={`${comment.profiles.nombres} ${comment.profiles.apellido_paterno} ${comment.profiles.apellido_materno}`}
              created_at={new Date(comment.created_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              content={comment.content || ''}
            />
          ))}
        </React.Fragment>
      ))}
      {
        isFetchingNextPage && (
            <CommentSkeletonItem />
        )
      }
      
      {/* Target para Intersection Observer */}
      <div ref={observerTarget} style={{ height: 1 }} />
      
      {/* {
        comments.map((comment) => (
          <CommentItem
            key={comment.id}
            author={`${comment.profiles.nombres} ${comment.profiles.apellidos}`}
            created_at={new Date(comment.created_at).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
            content={comment.content || ''}
          />
        ))
      } */}



    </section>
  );
}
