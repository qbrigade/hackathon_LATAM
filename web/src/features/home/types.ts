import type { Enums, Tables } from '@db/schema';

export type PublicationPreview = Pick<
  Tables<'publications'>,
  | 'id'
  | 'title'
  | 'content'
  | 'visibility'
  | 'upvotes'
  | 'downvotes'
  | 'impression_count'
  | 'image_url'
  | 'published_at'
  | 'created_at'
> & {
  source_id: { id: string, image_icon_url: string, name: string } | null
};

export type VoteType = Enums<'project_vote_type'>;
