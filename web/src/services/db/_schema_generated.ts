export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '12.2.12 (cd3cf9e)'
  }
  public: {
    Tables: {
      comments: {
        Row: {
          author_id: string
          content: string | null
          created_at: string
          event_id: string | null
          id: number
          project_id: string | null
          publication_id: string | null
        }
        Insert: {
          author_id: string
          content?: string | null
          created_at?: string
          event_id?: string | null
          id?: number
          project_id?: string | null
          publication_id?: string | null
        }
        Update: {
          author_id?: string
          content?: string | null
          created_at?: string
          event_id?: string | null
          id?: number
          project_id?: string | null
          publication_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'comments_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'random_projects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_publication_id_fkey'
            columns: ['publication_id']
            isOneToOne: false
            referencedRelation: 'publications'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_publication_id_fkey'
            columns: ['publication_id']
            isOneToOne: false
            referencedRelation: 'random_publications'
            referencedColumns: ['id']
          },
        ]
      }
      event_attendees: {
        Row: {
          created_at: string
          event_id: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'event_attendees_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'event_attendees_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      events: {
        Row: {
          active: boolean
          attendees: number
          author_id: string
          content: string
          created_at: string
          event_date: string
          geo_department: string
          geo_district: string
          id: string
          image_url: string[] | null
          impression_count: number
          published_at: string
          title: string
          updated_at: string
          visibility: Database['public']['Enums']['visibility']
        }
        Insert: {
          active?: boolean
          attendees?: number
          author_id: string
          content: string
          created_at?: string
          event_date: string
          geo_department: string
          geo_district: string
          id?: string
          image_url?: string[] | null
          impression_count?: number
          published_at: string
          title: string
          updated_at?: string
          visibility?: Database['public']['Enums']['visibility']
        }
        Update: {
          active?: boolean
          attendees?: number
          author_id?: string
          content?: string
          created_at?: string
          event_date?: string
          geo_department?: string
          geo_district?: string
          id?: string
          image_url?: string[] | null
          impression_count?: number
          published_at?: string
          title?: string
          updated_at?: string
          visibility?: Database['public']['Enums']['visibility']
        }
        Relationships: [
          {
            foreignKeyName: 'events_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'events_geo_department_fkey'
            columns: ['geo_department']
            isOneToOne: false
            referencedRelation: 'geo_pe_departments'
            referencedColumns: ['code']
          },
          {
            foreignKeyName: 'events_geo_district_fkey'
            columns: ['geo_district']
            isOneToOne: false
            referencedRelation: 'geo_pe_districts'
            referencedColumns: ['code']
          },
        ]
      }
      geo_pe_departments: {
        Row: {
          code: string
          name: string
        }
        Insert: {
          code: string
          name: string
        }
        Update: {
          code?: string
          name?: string
        }
        Relationships: []
      }
      geo_pe_districts: {
        Row: {
          code: string
          name: string
        }
        Insert: {
          code: string
          name: string
        }
        Update: {
          code?: string
          name?: string
        }
        Relationships: []
      }
      geo_pe_provinces: {
        Row: {
          code: string
          name: string
        }
        Insert: {
          code: string
          name: string
        }
        Update: {
          code?: string
          name?: string
        }
        Relationships: []
      }
      group_members: {
        Row: {
          group_id: string
          joined_at: string
          role: Database['public']['Enums']['group_member_role']
          user_id: string
        }
        Insert: {
          group_id: string
          joined_at?: string
          role?: Database['public']['Enums']['group_member_role']
          user_id: string
        }
        Update: {
          group_id?: string
          joined_at?: string
          role?: Database['public']['Enums']['group_member_role']
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'group_members_group_id_fkey'
            columns: ['group_id']
            isOneToOne: false
            referencedRelation: 'groups'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'group_members_group_id_fkey'
            columns: ['group_id']
            isOneToOne: false
            referencedRelation: 'random_groups'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'group_members_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      group_publication_comments: {
        Row: {
          active: boolean
          author_id: string
          content: string
          created_at: string
          depth: number
          downvotes: number
          group_publication_id: string
          id: string
          parent_comment_id: string | null
          path: unknown | null
          reply_count: number
          updated_at: string
          upvotes: number
        }
        Insert: {
          active?: boolean
          author_id: string
          content: string
          created_at?: string
          depth?: number
          downvotes?: number
          group_publication_id: string
          id?: string
          parent_comment_id?: string | null
          path?: unknown | null
          reply_count?: number
          updated_at?: string
          upvotes?: number
        }
        Update: {
          active?: boolean
          author_id?: string
          content?: string
          created_at?: string
          depth?: number
          downvotes?: number
          group_publication_id?: string
          id?: string
          parent_comment_id?: string | null
          path?: unknown | null
          reply_count?: number
          updated_at?: string
          upvotes?: number
        }
        Relationships: [
          {
            foreignKeyName: 'group_publication_comments_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'group_publication_comments_group_publication_id_fkey'
            columns: ['group_publication_id']
            isOneToOne: false
            referencedRelation: 'group_publications'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'group_publication_comments_group_publication_id_fkey'
            columns: ['group_publication_id']
            isOneToOne: false
            referencedRelation: 'group_publications_with_authors'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'group_publication_comments_parent_comment_id_fkey'
            columns: ['parent_comment_id']
            isOneToOne: false
            referencedRelation: 'group_comments_with_authors'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'group_publication_comments_parent_comment_id_fkey'
            columns: ['parent_comment_id']
            isOneToOne: false
            referencedRelation: 'group_publication_comments'
            referencedColumns: ['id']
          },
        ]
      }
      group_publications: {
        Row: {
          active: boolean
          author_id: string
          comment_count: number
          content: string
          created_at: string
          downvotes: number
          group_id: string
          id: string
          image_url: string[] | null
          published_at: string
          title: string
          updated_at: string
          upvotes: number
        }
        Insert: {
          active?: boolean
          author_id: string
          comment_count?: number
          content: string
          created_at?: string
          downvotes?: number
          group_id: string
          id?: string
          image_url?: string[] | null
          published_at?: string
          title: string
          updated_at?: string
          upvotes?: number
        }
        Update: {
          active?: boolean
          author_id?: string
          comment_count?: number
          content?: string
          created_at?: string
          downvotes?: number
          group_id?: string
          id?: string
          image_url?: string[] | null
          published_at?: string
          title?: string
          updated_at?: string
          upvotes?: number
        }
        Relationships: [
          {
            foreignKeyName: 'group_publications_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'group_publications_group_id_fkey'
            columns: ['group_id']
            isOneToOne: false
            referencedRelation: 'groups'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'group_publications_group_id_fkey'
            columns: ['group_id']
            isOneToOne: false
            referencedRelation: 'random_groups'
            referencedColumns: ['id']
          },
        ]
      }
      groups: {
        Row: {
          active: boolean
          created_at: string
          description: string
          facebook_group_url: string | null
          geo_department: string
          geo_district: string
          id: string
          image_url: string | null
          name: string
          owner_id: string
          updated_at: string
          whatsapp_group_url: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          description: string
          facebook_group_url?: string | null
          geo_department: string
          geo_district: string
          id?: string
          image_url?: string | null
          name: string
          owner_id: string
          updated_at?: string
          whatsapp_group_url?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string
          facebook_group_url?: string | null
          geo_department?: string
          geo_district?: string
          id?: string
          image_url?: string | null
          name?: string
          owner_id?: string
          updated_at?: string
          whatsapp_group_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'groups_geo_department_fkey'
            columns: ['geo_department']
            isOneToOne: false
            referencedRelation: 'geo_pe_departments'
            referencedColumns: ['code']
          },
          {
            foreignKeyName: 'groups_geo_district_fkey'
            columns: ['geo_district']
            isOneToOne: false
            referencedRelation: 'geo_pe_districts'
            referencedColumns: ['code']
          },
          {
            foreignKeyName: 'groups_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      kv_store: {
        Row: {
          expires_at: string | null
          key: string
          value: string
        }
        Insert: {
          expires_at?: string | null
          key: string
          value: string
        }
        Update: {
          expires_at?: string | null
          key?: string
          value?: string
        }
        Relationships: []
      }
      preferences_hidden_publications: {
        Row: {
          created_at: string
          id: string
          publication_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          publication_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          publication_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'preferences_hidden_publications_publication_id_fkey'
            columns: ['publication_id']
            isOneToOne: false
            referencedRelation: 'publications'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'preferences_hidden_publications_publication_id_fkey'
            columns: ['publication_id']
            isOneToOne: false
            referencedRelation: 'random_publications'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'preferences_hidden_publications_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          apellido_materno: string | null
          apellido_paterno: string | null
          avatar_url: string | null
          bio: string | null
          celular: string | null
          country_code: string | null
          created_at: string
          geo_department: string | null
          geo_district: string | null
          id: string
          last_geo_update: string
          nombres: string | null
          numero_documento: string | null
          phone_country_code: string | null
          profile_completed: boolean
          tipo_documento: string | null
          updated_at: string
        }
        Insert: {
          apellido_materno?: string | null
          apellido_paterno?: string | null
          avatar_url?: string | null
          bio?: string | null
          celular?: string | null
          country_code?: string | null
          created_at?: string
          geo_department?: string | null
          geo_district?: string | null
          id: string
          last_geo_update?: string
          nombres?: string | null
          numero_documento?: string | null
          phone_country_code?: string | null
          profile_completed?: boolean
          tipo_documento?: string | null
          updated_at?: string
        }
        Update: {
          apellido_materno?: string | null
          apellido_paterno?: string | null
          avatar_url?: string | null
          bio?: string | null
          celular?: string | null
          country_code?: string | null
          created_at?: string
          geo_department?: string | null
          geo_district?: string | null
          id?: string
          last_geo_update?: string
          nombres?: string | null
          numero_documento?: string | null
          phone_country_code?: string | null
          profile_completed?: boolean
          tipo_documento?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_geo_department_fkey'
            columns: ['geo_department']
            isOneToOne: false
            referencedRelation: 'geo_pe_departments'
            referencedColumns: ['code']
          },
          {
            foreignKeyName: 'profiles_geo_district_fkey'
            columns: ['geo_district']
            isOneToOne: false
            referencedRelation: 'geo_pe_districts'
            referencedColumns: ['code']
          },
        ]
      }
      project_votes: {
        Row: {
          created_at: string
          id: string
          project_id: string
          user_id: string
          vote_type: Database['public']['Enums']['project_vote_type']
          votes_count: number
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          user_id: string
          vote_type: Database['public']['Enums']['project_vote_type']
          votes_count?: number
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          user_id?: string
          vote_type?: Database['public']['Enums']['project_vote_type']
          votes_count?: number
        }
        Relationships: [
          {
            foreignKeyName: 'project_votes_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'project_votes_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'random_projects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'project_votes_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      projects: {
        Row: {
          active: boolean
          author_id: string
          content: string
          created_at: string
          geo_department: string
          geo_district: string
          id: string
          image_url: string[] | null
          impression_count: number
          ioarr_type: Database['public']['Enums']['ioarr_type']
          is_megaproject: boolean
          published_at: string
          title: string
          updated_at: string
          visibility: Database['public']['Enums']['visibility']
        }
        Insert: {
          active?: boolean
          author_id: string
          content: string
          created_at?: string
          geo_department: string
          geo_district: string
          id?: string
          image_url?: string[] | null
          impression_count?: number
          ioarr_type: Database['public']['Enums']['ioarr_type']
          is_megaproject?: boolean
          published_at: string
          title: string
          updated_at?: string
          visibility?: Database['public']['Enums']['visibility']
        }
        Update: {
          active?: boolean
          author_id?: string
          content?: string
          created_at?: string
          geo_department?: string
          geo_district?: string
          id?: string
          image_url?: string[] | null
          impression_count?: number
          ioarr_type?: Database['public']['Enums']['ioarr_type']
          is_megaproject?: boolean
          published_at?: string
          title?: string
          updated_at?: string
          visibility?: Database['public']['Enums']['visibility']
        }
        Relationships: [
          {
            foreignKeyName: 'projects_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'projects_geo_department_fkey'
            columns: ['geo_department']
            isOneToOne: false
            referencedRelation: 'geo_pe_departments'
            referencedColumns: ['code']
          },
          {
            foreignKeyName: 'projects_geo_district_fkey'
            columns: ['geo_district']
            isOneToOne: false
            referencedRelation: 'geo_pe_districts'
            referencedColumns: ['code']
          },
        ]
      }
      publication_sources: {
        Row: {
          active: boolean
          created_at: string
          feed_url: string | null
          id: string
          image_icon_url: string
          name: string
          website_url: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          feed_url?: string | null
          id?: string
          image_icon_url: string
          name: string
          website_url: string
        }
        Update: {
          active?: boolean
          created_at?: string
          feed_url?: string | null
          id?: string
          image_icon_url?: string
          name?: string
          website_url?: string
        }
        Relationships: []
      }
      publication_votes: {
        Row: {
          id: string
          publication_id: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          id?: string
          publication_id?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          id?: string
          publication_id?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'publication_votes_publication_id_fkey'
            columns: ['publication_id']
            isOneToOne: false
            referencedRelation: 'publications'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'publication_votes_publication_id_fkey'
            columns: ['publication_id']
            isOneToOne: false
            referencedRelation: 'random_publications'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'publication_votes_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      publications: {
        Row: {
          active: boolean
          author_id: string | null
          content: string
          created_at: string
          downvotes: number
          embeddings: string | null
          external_sources_url: string | null
          feed_post_hash: string | null
          id: string
          image_url: string | null
          impression_count: number
          published_at: string
          source_id: string | null
          title: string
          updated_at: string
          upvotes: number
          visibility: Database['public']['Enums']['visibility']
        }
        Insert: {
          active?: boolean
          author_id?: string | null
          content: string
          created_at?: string
          downvotes?: number
          embeddings?: string | null
          external_sources_url?: string | null
          feed_post_hash?: string | null
          id?: string
          image_url?: string | null
          impression_count?: number
          published_at: string
          source_id?: string | null
          title: string
          updated_at?: string
          upvotes?: number
          visibility?: Database['public']['Enums']['visibility']
        }
        Update: {
          active?: boolean
          author_id?: string | null
          content?: string
          created_at?: string
          downvotes?: number
          embeddings?: string | null
          external_sources_url?: string | null
          feed_post_hash?: string | null
          id?: string
          image_url?: string | null
          impression_count?: number
          published_at?: string
          source_id?: string | null
          title?: string
          updated_at?: string
          upvotes?: number
          visibility?: Database['public']['Enums']['visibility']
        }
        Relationships: [
          {
            foreignKeyName: 'publications_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'publications_source_id_fkey'
            columns: ['source_id']
            isOneToOne: false
            referencedRelation: 'publication_sources'
            referencedColumns: ['id']
          },
        ]
      }
      signup_verification_nonce: {
        Row: {
          apellido_materno: string | null
          apellido_paterno: string | null
          created_at: string
          id: string
          nombres: string | null
          numero_documento: string | null
          tipo_documento: string | null
          user_id: string
        }
        Insert: {
          apellido_materno?: string | null
          apellido_paterno?: string | null
          created_at?: string
          id?: string
          nombres?: string | null
          numero_documento?: string | null
          tipo_documento?: string | null
          user_id: string
        }
        Update: {
          apellido_materno?: string | null
          apellido_paterno?: string | null
          created_at?: string
          id?: string
          nombres?: string | null
          numero_documento?: string | null
          tipo_documento?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      group_comments_with_authors: {
        Row: {
          active: boolean | null
          author_apellidos: string | null
          author_avatar_url: string | null
          author_id: string | null
          author_nombres: string | null
          content: string | null
          created_at: string | null
          depth: number | null
          downvotes: number | null
          group_publication_id: string | null
          id: string | null
          level: number | null
          parent_comment_id: string | null
          path: unknown | null
          reply_count: number | null
          updated_at: string | null
          upvotes: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'group_publication_comments_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'group_publication_comments_group_publication_id_fkey'
            columns: ['group_publication_id']
            isOneToOne: false
            referencedRelation: 'group_publications'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'group_publication_comments_group_publication_id_fkey'
            columns: ['group_publication_id']
            isOneToOne: false
            referencedRelation: 'group_publications_with_authors'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'group_publication_comments_parent_comment_id_fkey'
            columns: ['parent_comment_id']
            isOneToOne: false
            referencedRelation: 'group_comments_with_authors'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'group_publication_comments_parent_comment_id_fkey'
            columns: ['parent_comment_id']
            isOneToOne: false
            referencedRelation: 'group_publication_comments'
            referencedColumns: ['id']
          },
        ]
      }
      group_publications_with_authors: {
        Row: {
          active: boolean | null
          author_apellidos: string | null
          author_avatar_url: string | null
          author_id: string | null
          author_nombres: string | null
          comment_count: number | null
          content: string | null
          created_at: string | null
          downvotes: number | null
          group_id: string | null
          group_name: string | null
          id: string | null
          image_url: string[] | null
          published_at: string | null
          title: string | null
          updated_at: string | null
          upvotes: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'group_publications_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'group_publications_group_id_fkey'
            columns: ['group_id']
            isOneToOne: false
            referencedRelation: 'groups'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'group_publications_group_id_fkey'
            columns: ['group_id']
            isOneToOne: false
            referencedRelation: 'random_groups'
            referencedColumns: ['id']
          },
        ]
      }
      random_groups: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          geo_department: string | null
          geo_district: string | null
          id: string | null
          image_url: string | null
          name: string | null
          owner_id: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          geo_department?: string | null
          geo_district?: string | null
          id?: string | null
          image_url?: string | null
          name?: string | null
          owner_id?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          geo_department?: string | null
          geo_district?: string | null
          id?: string | null
          image_url?: string | null
          name?: string | null
          owner_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'groups_geo_department_fkey'
            columns: ['geo_department']
            isOneToOne: false
            referencedRelation: 'geo_pe_departments'
            referencedColumns: ['code']
          },
          {
            foreignKeyName: 'groups_geo_district_fkey'
            columns: ['geo_district']
            isOneToOne: false
            referencedRelation: 'geo_pe_districts'
            referencedColumns: ['code']
          },
          {
            foreignKeyName: 'groups_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      random_projects: {
        Row: {
          active: boolean | null
          author_id: string | null
          content: string | null
          created_at: string | null
          geo_department: string | null
          geo_district: string | null
          id: string | null
          image_url: string[] | null
          impression_count: number | null
          ioarr_type: Database['public']['Enums']['ioarr_type'] | null
          is_megaproject: boolean | null
          published_at: string | null
          title: string | null
          updated_at: string | null
          visibility: Database['public']['Enums']['visibility'] | null
        }
        Insert: {
          active?: boolean | null
          author_id?: string | null
          content?: string | null
          created_at?: string | null
          geo_department?: string | null
          geo_district?: string | null
          id?: string | null
          image_url?: string[] | null
          impression_count?: number | null
          ioarr_type?: Database['public']['Enums']['ioarr_type'] | null
          is_megaproject?: boolean | null
          published_at?: string | null
          title?: string | null
          updated_at?: string | null
          visibility?: Database['public']['Enums']['visibility'] | null
        }
        Update: {
          active?: boolean | null
          author_id?: string | null
          content?: string | null
          created_at?: string | null
          geo_department?: string | null
          geo_district?: string | null
          id?: string | null
          image_url?: string[] | null
          impression_count?: number | null
          ioarr_type?: Database['public']['Enums']['ioarr_type'] | null
          is_megaproject?: boolean | null
          published_at?: string | null
          title?: string | null
          updated_at?: string | null
          visibility?: Database['public']['Enums']['visibility'] | null
        }
        Relationships: [
          {
            foreignKeyName: 'projects_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'projects_geo_department_fkey'
            columns: ['geo_department']
            isOneToOne: false
            referencedRelation: 'geo_pe_departments'
            referencedColumns: ['code']
          },
          {
            foreignKeyName: 'projects_geo_district_fkey'
            columns: ['geo_district']
            isOneToOne: false
            referencedRelation: 'geo_pe_districts'
            referencedColumns: ['code']
          },
        ]
      }
      random_publications: {
        Row: {
          active: boolean | null
          author_id: string | null
          content: string | null
          created_at: string | null
          downvotes: number | null
          external_sources_url: string | null
          feed_post_hash: string | null
          id: string | null
          image_url: string | null
          impression_count: number | null
          published_at: string | null
          source_id: string | null
          title: string | null
          updated_at: string | null
          upvotes: number | null
          visibility: Database['public']['Enums']['visibility'] | null
        }
        Insert: {
          active?: boolean | null
          author_id?: string | null
          content?: string | null
          created_at?: string | null
          downvotes?: number | null
          external_sources_url?: string | null
          feed_post_hash?: string | null
          id?: string | null
          image_url?: string | null
          impression_count?: number | null
          published_at?: string | null
          source_id?: string | null
          title?: string | null
          updated_at?: string | null
          upvotes?: number | null
          visibility?: Database['public']['Enums']['visibility'] | null
        }
        Update: {
          active?: boolean | null
          author_id?: string | null
          content?: string | null
          created_at?: string | null
          downvotes?: number | null
          external_sources_url?: string | null
          feed_post_hash?: string | null
          id?: string | null
          image_url?: string | null
          impression_count?: number | null
          published_at?: string | null
          source_id?: string | null
          title?: string | null
          updated_at?: string | null
          upvotes?: number | null
          visibility?: Database['public']['Enums']['visibility'] | null
        }
        Relationships: [
          {
            foreignKeyName: 'publications_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'publications_source_id_fkey'
            columns: ['source_id']
            isOneToOne: false
            referencedRelation: 'publication_sources'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Functions: {
      _ltree_compress: {
        Args: { '': unknown }
        Returns: unknown
      }
      _ltree_gist_options: {
        Args: { '': unknown }
        Returns: undefined
      }
      add_group_publication_comment: {
        Args: {
          p_content: string
          p_group_publication_id: string
          p_parent_comment_id?: string
        }
        Returns: {
          author_id: string
          comment_id: string
          content: string
          created_at: string
          depth: number
          downvotes: number
          group_publication_id: string
          parent_comment_id: string
          path: unknown
          reply_count: number
          updated_at: string
          upvotes: number
        }[]
      }
      binary_quantize: {
        Args: { '': string } | { '': unknown }
        Returns: unknown
      }
      create_group_and_join_admin: {
        Args: {
          p_description: string
          p_facebook_group_url?: string
          p_geo_department: string
          p_geo_district: string
          p_image_url?: string
          p_name: string
          p_whatsapp_group_url?: string
        }
        Returns: {
          active: boolean
          created_at: string
          description: string
          facebook_group_url: string
          geo_department: string
          geo_district: string
          group_id: string
          image_url: string
          name: string
          owner_id: string
          updated_at: string
          whatsapp_group_url: string
        }[]
      }
      get_comment_thread: {
        Args: { comment_id: string }
        Returns: {
          author_id: string
          author_nombres: string
          content: string
          created_at: string
          depth: number
          id: string
          level: number
        }[]
      }
      get_event_attendance_summary: {
        Args: { event_id: string }
        Returns: {
          attendees_count: number
          user_is_attending: boolean
        }[]
      }
      get_fyp: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_penalty_factor?: number
          p_similarity_threshold?: number
        }
        Returns: {
          content: string
          created_at: string
          downvotes: number
          id: string
          image_url: string
          impression_count: number
          penalty_score: number
          published_at: string
          similarity_score: number
          source_id: string
          source_image_icon_url: string
          source_name: string
          title: string
          upvotes: number
          visibility: Database['public']['Enums']['visibility']
        }[]
      }
      get_group_feed: {
        Args: {
          p_group_id: string
          p_limit?: number
          p_max_comments_per_post?: number
          p_offset?: number
        }
        Returns: {
          activity_score: number
          author_apellidos: string
          author_avatar_url: string
          author_id: string
          author_nombres: string
          comment_count: number
          comments: Json
          content: string
          created_at: string
          downvotes: number
          group_name: string
          id: string
          image_url: string[]
          published_at: string
          title: string
          upvotes: number
        }[]
      }
      get_project_vote_summary: {
        Args: { project_id: string }
        Returns: {
          golden_votes: number
          silver_votes: number
          times_user_has_votes: number
        }[]
      }
      get_projects_with_votes: {
        Args: {
          p_department?: string
          p_district?: string
          p_order_by?: string
          p_page?: number
          p_page_size?: number
          p_province?: string
          p_search?: string
        }
        Returns: {
          created_at: string
          geo_department: string
          geo_district: string
          golden_votes: number
          id: string
          image_url: string[]
          impression_count: number
          ioarr_type: Database['public']['Enums']['ioarr_type']
          silver_votes: number
          title: string
        }[]
      }
      get_vote_stats: {
        Args: { pub_id?: string }
        Returns: {
          downvotes_count: number
          publication_id: string
          total_votes: number
          upvotes_count: number
        }[]
      }
      get_votes_left: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      halfvec_avg: {
        Args: { '': number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { '': unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { '': unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { '': unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { '': unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { '': unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { '': unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { '': unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { '': unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { '': unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { '': unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { '': unknown } | { '': unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { '': string } | { '': unknown } | { '': unknown }
        Returns: string
      }
      lca: {
        Args: { '': unknown[] }
        Returns: unknown
      }
      lquery_in: {
        Args: { '': unknown }
        Returns: unknown
      }
      lquery_out: {
        Args: { '': unknown }
        Returns: unknown
      }
      lquery_recv: {
        Args: { '': unknown }
        Returns: unknown
      }
      lquery_send: {
        Args: { '': unknown }
        Returns: string
      }
      ltree_compress: {
        Args: { '': unknown }
        Returns: unknown
      }
      ltree_decompress: {
        Args: { '': unknown }
        Returns: unknown
      }
      ltree_gist_in: {
        Args: { '': unknown }
        Returns: unknown
      }
      ltree_gist_options: {
        Args: { '': unknown }
        Returns: undefined
      }
      ltree_gist_out: {
        Args: { '': unknown }
        Returns: unknown
      }
      ltree_in: {
        Args: { '': unknown }
        Returns: unknown
      }
      ltree_out: {
        Args: { '': unknown }
        Returns: unknown
      }
      ltree_recv: {
        Args: { '': unknown }
        Returns: unknown
      }
      ltree_send: {
        Args: { '': unknown }
        Returns: string
      }
      ltree2text: {
        Args: { '': unknown }
        Returns: string
      }
      ltxtq_in: {
        Args: { '': unknown }
        Returns: unknown
      }
      ltxtq_out: {
        Args: { '': unknown }
        Returns: unknown
      }
      ltxtq_recv: {
        Args: { '': unknown }
        Returns: unknown
      }
      ltxtq_send: {
        Args: { '': unknown }
        Returns: string
      }
      nlevel: {
        Args: { '': unknown }
        Returns: number
      }
      recalculate_all_vote_counts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      signup_complete: {
        Args: {
          nonce_id: string
          p_celular: string
          p_country_code: string
          p_geo_department: string
          p_geo_district: string
          p_phone_country_code: string
        }
        Returns: {
          message: string
          success: boolean
          user_id: string
        }[]
      }
      sparsevec_out: {
        Args: { '': unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { '': unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { '': unknown[] }
        Returns: number
      }
      text2ltree: {
        Args: { '': string }
        Returns: unknown
      }
      toggle_event_attendance: {
        Args: { p_event_id: string }
        Returns: undefined
      }
      update_user_geo_location: {
        Args: { p_geo_department: string; p_geo_district: string }
        Returns: {
          message: string
          success: boolean
        }[]
      }
      vector_avg: {
        Args: { '': number[] }
        Returns: string
      }
      vector_dims: {
        Args: { '': string } | { '': unknown }
        Returns: number
      }
      vector_norm: {
        Args: { '': string }
        Returns: number
      }
      vector_out: {
        Args: { '': string }
        Returns: unknown
      }
      vector_send: {
        Args: { '': string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { '': unknown[] }
        Returns: number
      }
      vote_for_project: {
        Args: { project_id: string; votes_count: number }
        Returns: undefined
      }
    }
    Enums: {
      group_member_role: 'admin' | 'moderator' | 'member'
      ioarr_type:
      | 'investment'
      | 'optimization'
      | 'extension'
      | 'repair'
      | 'replacement'
      project_vote_type: 'golden' | 'silver'
      visibility: 'draft' | 'public' | 'private'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
    DefaultSchema['Views'])
  ? (DefaultSchema['Tables'] &
    DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema['Tables']
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
  ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema['Tables']
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
  ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema['Enums']
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
  ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema['CompositeTypes']
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
  ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {
      group_member_role: ['admin', 'moderator', 'member'],
      ioarr_type: [
        'investment',
        'optimization',
        'extension',
        'repair',
        'replacement',
      ],
      project_vote_type: ['golden', 'silver'],
      visibility: ['draft', 'public', 'private'],
    },
  },
} as const;
