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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      article_categories: {
        Row: {
          created_at: string
          created_by: string | null
          id: number
          is_active: boolean
          name_en: string | null
          name_zh: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: never
          is_active?: boolean
          name_en?: string | null
          name_zh: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: never
          is_active?: boolean
          name_en?: string | null
          name_zh?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      community_applications: {
        Row: {
          additional_info: string | null
          assigned_reviewer_id: string | null
          attempt_number: number
          contribution: string | null
          created_at: string
          decided_at: string | null
          decided_by: string | null
          decision_reason: string | null
          form_version: string
          hopes: string | null
          id: number
          motivation: string
          reviewed_at: string | null
          status: string
          submitted_at: string | null
          updated_at: string
          user_id: string
          withdrawn_at: string | null
        }
        Insert: {
          additional_info?: string | null
          assigned_reviewer_id?: string | null
          attempt_number: number
          contribution?: string | null
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_reason?: string | null
          form_version?: string
          hopes?: string | null
          id?: never
          motivation?: string
          reviewed_at?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id: string
          withdrawn_at?: string | null
        }
        Update: {
          additional_info?: string | null
          assigned_reviewer_id?: string | null
          attempt_number?: number
          contribution?: string | null
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_reason?: string | null
          form_version?: string
          hopes?: string | null
          id?: never
          motivation?: string
          reviewed_at?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
          withdrawn_at?: string | null
        }
        Relationships: []
      }
      community_memberships: {
        Row: {
          application_id: number | null
          approved_at: string
          approved_by: string
          created_at: string
          ended_at: string | null
          member_since: string
          status: string
          suspended_at: string | null
          suspended_by: string | null
          suspension_reason: string | null
          suspension_source: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          application_id?: number | null
          approved_at?: string
          approved_by: string
          created_at?: string
          ended_at?: string | null
          member_since?: string
          status?: string
          suspended_at?: string | null
          suspended_by?: string | null
          suspension_reason?: string | null
          suspension_source?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          application_id?: number | null
          approved_at?: string
          approved_by?: string
          created_at?: string
          ended_at?: string | null
          member_since?: string
          status?: string
          suspended_at?: string | null
          suspended_by?: string | null
          suspension_reason?: string | null
          suspension_source?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_memberships_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "community_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      community_reports: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          details: string | null
          id: number
          message_id: number | null
          reported_user_id: string
          reporter_user_id: string
          resolution_note: string | null
          resolved_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category: string
          created_at?: string
          details?: string | null
          id?: never
          message_id?: number | null
          reported_user_id: string
          reporter_user_id: string
          resolution_note?: string | null
          resolved_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          details?: string | null
          id?: never
          message_id?: number | null
          reported_user_id?: string
          reporter_user_id?: string
          resolution_note?: string | null
          resolved_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_reports_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "direct_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          joined_at: string
          last_read_at: string | null
          left_at: string | null
          muted_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          joined_at?: string
          last_read_at?: string | null
          left_at?: string | null
          muted_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          joined_at?: string
          last_read_at?: string | null
          left_at?: string | null
          muted_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "direct_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      direct_conversations: {
        Row: {
          created_at: string
          created_by: string
          direct_key: string
          id: string
          last_message_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          direct_key: string
          id?: string
          last_message_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          direct_key?: string
          id?: string
          last_message_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          id: number
          sender_user_id: string
          status: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: never
          sender_user_id: string
          status?: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: never
          sender_user_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "direct_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      field_note_authors: {
        Row: {
          author_order: number
          contribution_role: string | null
          field_note_id: number
          person_id: number
        }
        Insert: {
          author_order?: number
          contribution_role?: string | null
          field_note_id: number
          person_id: number
        }
        Update: {
          author_order?: number
          contribution_role?: string | null
          field_note_id?: number
          person_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "field_note_authors_field_note_id_fkey"
            columns: ["field_note_id"]
            isOneToOne: false
            referencedRelation: "field_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_note_authors_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      field_note_collaborators: {
        Row: {
          created_at: string
          field_note_id: number
          invited_by: string
          revoked_at: string | null
          revoked_by: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          field_note_id: number
          invited_by: string
          revoked_at?: string | null
          revoked_by?: string | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          field_note_id?: number
          invited_by?: string
          revoked_at?: string | null
          revoked_by?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "field_note_collaborators_field_note_id_fkey"
            columns: ["field_note_id"]
            isOneToOne: false
            referencedRelation: "field_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      field_note_comment_events: {
        Row: {
          actor_user_id: string | null
          created_at: string
          event_payload: Json
          event_type: string
          field_note_id: number
          id: number
          thread_id: string
        }
        Insert: {
          actor_user_id?: string | null
          created_at?: string
          event_payload?: Json
          event_type: string
          field_note_id: number
          id?: never
          thread_id: string
        }
        Update: {
          actor_user_id?: string | null
          created_at?: string
          event_payload?: Json
          event_type?: string
          field_note_id?: number
          id?: never
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "field_note_comment_events_field_note_id_fkey"
            columns: ["field_note_id"]
            isOneToOne: false
            referencedRelation: "field_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_note_comment_events_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "field_note_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      field_note_comments: {
        Row: {
          created_at: string
          created_by: string
          deleted_at: string | null
          field_note_id: number
          id: string
          resolved_at: string | null
          resolved_by: string | null
          thread_snapshot: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          deleted_at?: string | null
          field_note_id: number
          id: string
          resolved_at?: string | null
          resolved_by?: string | null
          thread_snapshot?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          field_note_id?: number
          id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          thread_snapshot?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "field_note_comments_field_note_id_fkey"
            columns: ["field_note_id"]
            isOneToOne: false
            referencedRelation: "field_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      field_note_media: {
        Row: {
          field_note_id: number
          media_asset_id: number
          sort_order: number
          usage_role: string
        }
        Insert: {
          field_note_id: number
          media_asset_id: number
          sort_order?: number
          usage_role?: string
        }
        Update: {
          field_note_id?: number
          media_asset_id?: number
          sort_order?: number
          usage_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "field_note_media_field_note_id_fkey"
            columns: ["field_note_id"]
            isOneToOne: false
            referencedRelation: "field_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_note_media_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      field_note_revisions: {
        Row: {
          change_note: string | null
          changed_by: string | null
          content_html_snapshot: string | null
          content_json_snapshot: Json | null
          content_schema_version: number
          content_snapshot: string
          created_at: string
          field_note_id: number
          id: number
          revision_number: number
          source: string
          title_snapshot: string
        }
        Insert: {
          change_note?: string | null
          changed_by?: string | null
          content_html_snapshot?: string | null
          content_json_snapshot?: Json | null
          content_schema_version?: number
          content_snapshot: string
          created_at?: string
          field_note_id: number
          id?: never
          revision_number: number
          source?: string
          title_snapshot: string
        }
        Update: {
          change_note?: string | null
          changed_by?: string | null
          content_html_snapshot?: string | null
          content_json_snapshot?: Json | null
          content_schema_version?: number
          content_snapshot?: string
          created_at?: string
          field_note_id?: number
          id?: never
          revision_number?: number
          source?: string
          title_snapshot?: string
        }
        Relationships: [
          {
            foreignKeyName: "field_note_revisions_field_note_id_fkey"
            columns: ["field_note_id"]
            isOneToOne: false
            referencedRelation: "field_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      field_note_share_links: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string | null
          field_note_id: number
          id: number
          last_used_at: string | null
          permission: string
          revoked_at: string | null
          revoked_by: string | null
          token_hash: string
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at?: string | null
          field_note_id: number
          id?: never
          last_used_at?: string | null
          permission?: string
          revoked_at?: string | null
          revoked_by?: string | null
          token_hash: string
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string | null
          field_note_id?: number
          id?: never
          last_used_at?: string | null
          permission?: string
          revoked_at?: string | null
          revoked_by?: string | null
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "field_note_share_links_field_note_id_fkey"
            columns: ["field_note_id"]
            isOneToOne: false
            referencedRelation: "field_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      field_note_topics: {
        Row: {
          field_note_id: number
          topic_id: number
        }
        Insert: {
          field_note_id: number
          topic_id: number
        }
        Update: {
          field_note_id?: number
          topic_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "field_note_topics_field_note_id_fkey"
            columns: ["field_note_id"]
            isOneToOne: false
            referencedRelation: "field_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_note_topics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      field_notes: {
        Row: {
          approved_at: string | null
          archived_at: string | null
          category_id: number | null
          collaboration_mode: string
          content: string
          content_html: string | null
          content_json: Json | null
          content_schema_version: number
          cover_media_id: number | null
          created_at: string
          created_by: string
          excerpt: string | null
          featured: boolean
          id: number
          language: string
          published_at: string | null
          reviewed_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: string
          submitted_at: string | null
          subtitle: string | null
          title: string
          translation_of_id: number | null
          updated_at: string
          visibility: string
        }
        Insert: {
          approved_at?: string | null
          archived_at?: string | null
          category_id?: number | null
          collaboration_mode?: string
          content?: string
          content_html?: string | null
          content_json?: Json | null
          content_schema_version?: number
          cover_media_id?: number | null
          created_at?: string
          created_by?: string
          excerpt?: string | null
          featured?: boolean
          id?: never
          language?: string
          published_at?: string | null
          reviewed_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: string
          submitted_at?: string | null
          subtitle?: string | null
          title: string
          translation_of_id?: number | null
          updated_at?: string
          visibility?: string
        }
        Update: {
          approved_at?: string | null
          archived_at?: string | null
          category_id?: number | null
          collaboration_mode?: string
          content?: string
          content_html?: string | null
          content_json?: Json | null
          content_schema_version?: number
          cover_media_id?: number | null
          created_at?: string
          created_by?: string
          excerpt?: string | null
          featured?: boolean
          id?: never
          language?: string
          published_at?: string | null
          reviewed_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: string
          submitted_at?: string | null
          subtitle?: string | null
          title?: string
          translation_of_id?: number | null
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "field_notes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "article_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_notes_cover_media_id_fkey"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_notes_translation_of_id_fkey"
            columns: ["translation_of_id"]
            isOneToOne: false
            referencedRelation: "field_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      identity_labels: {
        Row: {
          archived_at: string | null
          color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          description_en: string | null
          icon: string | null
          id: number
          is_active: boolean
          is_core: boolean
          is_public: boolean
          name_en: string | null
          name_zh: string
          planet_slug: string | null
          selectable_on_signup: boolean
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          description_en?: string | null
          icon?: string | null
          id?: never
          is_active?: boolean
          is_core?: boolean
          is_public?: boolean
          name_en?: string | null
          name_zh: string
          planet_slug?: string | null
          selectable_on_signup?: boolean
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          description_en?: string | null
          icon?: string | null
          id?: never
          is_active?: boolean
          is_core?: boolean
          is_public?: boolean
          name_en?: string | null
          name_zh?: string
          planet_slug?: string | null
          selectable_on_signup?: boolean
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      legal_documents: {
        Row: {
          body_markdown: string
          content_sha256: string
          created_at: string
          created_by: string | null
          document_key: string
          document_type: string
          effective_at: string | null
          id: number
          is_material_change: boolean
          locale: string
          published_at: string | null
          status: string
          summary: string
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          body_markdown: string
          content_sha256: string
          created_at?: string
          created_by?: string | null
          document_key: string
          document_type: string
          effective_at?: string | null
          id?: never
          is_material_change?: boolean
          locale?: string
          published_at?: string | null
          status?: string
          summary: string
          title: string
          updated_at?: string
          version: number
        }
        Update: {
          body_markdown?: string
          content_sha256?: string
          created_at?: string
          created_by?: string | null
          document_key?: string
          document_type?: string
          effective_at?: string | null
          id?: never
          is_material_change?: boolean
          locale?: string
          published_at?: string | null
          status?: string
          summary?: string
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string
          file_size: number
          height: number | null
          id: number
          media_type: string
          mime_type: string
          owner_user_id: string | null
          status: string
          storage_bucket: string
          storage_path: string
          taken_at: string | null
          updated_at: string
          uploaded_by: string | null
          visibility: string
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          file_size: number
          height?: number | null
          id?: never
          media_type: string
          mime_type: string
          owner_user_id?: string | null
          status?: string
          storage_bucket: string
          storage_path: string
          taken_at?: string | null
          updated_at?: string
          uploaded_by?: string | null
          visibility?: string
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          file_size?: number
          height?: number | null
          id?: never
          media_type?: string
          mime_type?: string
          owner_user_id?: string | null
          status?: string
          storage_bucket?: string
          storage_path?: string
          taken_at?: string | null
          updated_at?: string
          uploaded_by?: string | null
          visibility?: string
          width?: number | null
        }
        Relationships: []
      }
      member_blocks: {
        Row: {
          blocked_user_id: string
          blocker_user_id: string
          created_at: string
        }
        Insert: {
          blocked_user_id: string
          blocker_user_id: string
          created_at?: string
        }
        Update: {
          blocked_user_id?: string
          blocker_user_id?: string
          created_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          archived_at: string | null
          body_en: string | null
          body_zh: string | null
          created_at: string
          expires_at: string | null
          id: number
          notification_type: string
          read_at: string | null
          title_en: string
          title_zh: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          archived_at?: string | null
          body_en?: string | null
          body_zh?: string | null
          created_at?: string
          expires_at?: string | null
          id?: never
          notification_type: string
          read_at?: string | null
          title_en: string
          title_zh: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          archived_at?: string | null
          body_en?: string | null
          body_zh?: string | null
          created_at?: string
          expires_at?: string | null
          id?: never
          notification_type?: string
          read_at?: string | null
          title_en?: string
          title_zh?: string
          user_id?: string
        }
        Relationships: []
      }
      people: {
        Row: {
          avatar_media_id: number | null
          bio: string | null
          city: string | null
          country: string | null
          created_at: string
          display_name: string
          full_name_private: string | null
          id: number
          is_public: boolean
          joined_at: string | null
          name_en: string | null
          name_zh: string | null
          nature_name: string | null
          profile_visibility: string
          region: string | null
          show_real_name: boolean
          slug: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_media_id?: number | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          display_name: string
          full_name_private?: string | null
          id?: never
          is_public?: boolean
          joined_at?: string | null
          name_en?: string | null
          name_zh?: string | null
          nature_name?: string | null
          profile_visibility?: string
          region?: string | null
          show_real_name?: boolean
          slug: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_media_id?: number | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          display_name?: string
          full_name_private?: string | null
          id?: never
          is_public?: boolean
          joined_at?: string | null
          name_en?: string | null
          name_zh?: string | null
          nature_name?: string | null
          profile_visibility?: string
          region?: string | null
          show_real_name?: boolean
          slug?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "people_avatar_media_id_fkey"
            columns: ["avatar_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          created_at: string
          description: string | null
          id: number
          is_sensitive: boolean
          permission_key: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: never
          is_sensitive?: boolean
          permission_key: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: never
          is_sensitive?: boolean
          permission_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      person_identity_labels: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          identity_label_id: number
          is_primary: boolean
          person_id: number
          valid_from: string | null
          valid_until: string | null
          visibility: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          identity_label_id: number
          is_primary?: boolean
          person_id: number
          valid_from?: string | null
          valid_until?: string | null
          visibility?: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          identity_label_id?: number
          is_primary?: boolean
          person_id?: number
          valid_from?: string | null
          valid_until?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "person_identity_labels_identity_label_id_fkey"
            columns: ["identity_label_id"]
            isOneToOne: false
            referencedRelation: "identity_labels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_identity_labels_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_participants: {
        Row: {
          cancelled_at: string | null
          checked_in_at: string | null
          joined_at: string
          session_id: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          checked_in_at?: string | null
          joined_at?: string
          session_id: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          checked_in_at?: string | null
          joined_at?: string
          session_id?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "practice_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_sessions: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          capacity: number
          created_at: string
          created_by: string
          description: string | null
          ends_at: string
          facilitator_user_id: string
          id: number
          published_at: string | null
          starts_at: string
          status: string
          timezone: string
          title: string
          updated_at: string
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          capacity?: number
          created_at?: string
          created_by: string
          description?: string | null
          ends_at: string
          facilitator_user_id: string
          id?: never
          published_at?: string | null
          starts_at: string
          status?: string
          timezone?: string
          title: string
          updated_at?: string
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          capacity?: number
          created_at?: string
          created_by?: string
          description?: string | null
          ends_at?: string
          facilitator_user_id?: string
          id?: never
          published_at?: string | null
          starts_at?: string
          status?: string
          timezone?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: string
          avatar_media_id: number | null
          bio: string | null
          city: string | null
          country: string | null
          created_at: string
          display_name: string
          onboarding_completed_at: string | null
          preferred_language: string
          region: string | null
          registered_at: string
          timezone: string
          updated_at: string
          user_id: string
          username: string | null
          website: string | null
        }
        Insert: {
          account_status?: string
          avatar_media_id?: number | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          display_name?: string
          onboarding_completed_at?: string | null
          preferred_language?: string
          region?: string | null
          registered_at: string
          timezone?: string
          updated_at?: string
          user_id: string
          username?: string | null
          website?: string | null
        }
        Update: {
          account_status?: string
          avatar_media_id?: number | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          display_name?: string
          onboarding_completed_at?: string | null
          preferred_language?: string
          region?: string | null
          registered_at?: string
          timezone?: string
          updated_at?: string
          user_id?: string
          username?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_avatar_media_id_fkey"
            columns: ["avatar_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          granted_by: string | null
          permission_id: number
          role_id: number
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          permission_id: number
          role_id: number
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          permission_id?: number
          role_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: number
          is_active: boolean
          is_system: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: never
          is_active?: boolean
          is_system?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: never
          is_active?: boolean
          is_system?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          email: string
          id: number
          preferred_language: string
          status: string
          subscribed_at: string
          unsubscribed_at: string | null
          updated_at: string
          user_id: string | null
          verified_at: string | null
        }
        Insert: {
          email: string
          id?: never
          preferred_language?: string
          status?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
          updated_at?: string
          user_id?: string | null
          verified_at?: string | null
        }
        Update: {
          email?: string
          id?: never
          preferred_language?: string
          status?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
          updated_at?: string
          user_id?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      subscription_preferences: {
        Row: {
          category: string
          created_at: string
          email_enabled: boolean
          in_app_enabled: boolean
          subscriber_id: number
          updated_at: string
          web_push_enabled: boolean
        }
        Insert: {
          category: string
          created_at?: string
          email_enabled?: boolean
          in_app_enabled?: boolean
          subscriber_id: number
          updated_at?: string
          web_push_enabled?: boolean
        }
        Update: {
          category?: string
          created_at?: string
          email_enabled?: boolean
          in_app_enabled?: boolean
          subscriber_id?: number
          updated_at?: string
          web_push_enabled?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "subscription_preferences_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          archived_at: string | null
          color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          icon: string | null
          id: number
          is_active: boolean
          name_en: string | null
          name_zh: string
          parent_id: number | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: never
          is_active?: boolean
          name_en?: string | null
          name_zh: string
          parent_id?: number | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: never
          is_active?: boolean
          name_en?: string | null
          name_zh?: string
          parent_id?: number | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          expires_at: string | null
          role_id: number
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          expires_at?: string | null
          role_id: number
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          expires_at?: string | null
          role_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          allow_messages: boolean
          created_at: string
          email_notifications: boolean
          in_app_notifications: boolean
          reduced_motion: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_messages?: boolean
          created_at?: string
          email_notifications?: boolean
          in_app_notifications?: boolean
          reduced_motion?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_messages?: boolean
          created_at?: string
          email_notifications?: boolean
          in_app_notifications?: boolean
          reduced_motion?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      archive_growth_record: {
        Args: { target_growth_record_id: number }
        Returns: undefined
      }
      assign_user_role: {
        Args: {
          role_expires_at?: string
          target_role_id: number
          target_user_id: string
        }
        Returns: undefined
      }
      attach_growth_media: {
        Args: {
          media_caption?: string
          media_is_primary?: boolean
          media_sort_order?: number
          target_growth_record_id: number
          target_media_asset_id: number
        }
        Returns: undefined
      }
      authorize_field_note_collaboration_server: {
        Args: {
          candidate_share_token_hash?: string
          target_field_note_id: number
          target_user_id: string
        }
        Returns: {
          can_comment: boolean
          can_manage_collaboration: boolean
          can_read: boolean
          can_write: boolean
          collaboration_mode: string
          collaborator_role: string
          content_json: Json
          content_schema_version: number
          excerpt: string
          field_note_id: number
          is_owner: boolean
          legacy_content: string
          note_language: string
          note_status: string
          note_visibility: string
          share_link_used: boolean
          title: string
          user_avatar_media_id: number
          user_display_name: string
        }[]
      }
      begin_guardian_otp_server: {
        Args: {
          request_token: string
          target_expires_at: string
          target_otp_hash: string
          target_phone_ciphertext: string
          target_phone_last4: string
          target_phone_lookup_hash: string
          target_provider_delivery_hash: string
        }
        Returns: string
      }
      block_community_member: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      cancel_practice_participation: {
        Args: { target_session_id: number }
        Returns: undefined
      }
      check_in_practice_participant: {
        Args: { target_session_id: number; target_user_id: string }
        Returns: undefined
      }
      checkpoint_field_note_server: {
        Args: {
          candidate_share_token_hash?: string
          create_revision?: boolean
          target_change_note?: string
          target_content: string
          target_content_html: string
          target_content_json: Json
          target_excerpt: string
          target_field_note_id: number
          target_schema_version: number
          target_source?: string
          target_title: string
          target_user_id: string
        }
        Returns: number
      }
      complete_community_onboarding: {
        Args: {
          account_username: string
          person_avatar_media_id?: number
          person_bio?: string
          person_city?: string
          person_country?: string
          person_display_name: string
          person_name_en?: string
          person_name_zh?: string
          person_nature_name?: string
          person_region?: string
          requested_allow_messages?: boolean
          requested_language?: string
          requested_profile_visibility?: string
          requested_show_real_name?: boolean
          requested_timezone?: string
        }
        Returns: number
      }
      consume_api_rate_limit_server: {
        Args: {
          target_block_seconds: number
          target_key_hash: string
          target_max_attempts: number
          target_scope: string
          target_window_seconds: number
        }
        Returns: {
          allowed: boolean
          remaining_attempts: number
          retry_after_seconds: number
        }[]
      }
      create_community_application: {
        Args: {
          application_additional_info?: string
          application_contribution?: string
          application_form_version?: string
          application_hopes?: string
          application_motivation?: string
        }
        Returns: number
      }
      create_direct_conversation: {
        Args: { target_user_id: string }
        Returns: string
      }
      create_direct_conversation_with_person: {
        Args: { target_person_id: number }
        Returns: string
      }
      create_field_note_share_link_server: {
        Args: {
          actor_user_id: string
          target_expires_at?: string
          target_field_note_id: number
          target_token_hash: string
        }
        Returns: number
      }
      create_growth_record: {
        Args: {
          growth_note: string
          growth_observed_at: string
          growth_observed_timezone: string
          growth_title: string
          target_person_id: number
        }
        Returns: number
      }
      create_guardian_consent_request_server: {
        Args: {
          target_application_id: number
          target_contact_channel: string
          target_contact_ciphertext: string
          target_contact_last4: string
          target_contact_lookup_hash: string
          target_expires_at: string
          target_guardian_name: string
          target_guardian_relationship: string
          target_legal_document_id: number
          target_minor_user_id: string
          target_token_hash: string
        }
        Returns: string
      }
      create_practice_session: {
        Args: {
          session_access_notes?: string
          session_capacity?: number
          session_description: string
          session_ends_at: string
          session_meeting_url?: string
          session_starts_at: string
          session_timezone?: string
          session_title: string
        }
        Returns: number
      }
      create_role: {
        Args: {
          role_description?: string
          role_name: string
          role_slug: string
        }
        Returns: number
      }
      decline_guardian_consent_server: {
        Args: { decline_reason?: string; request_token: string }
        Returns: undefined
      }
      decline_manual_guardian_confirmation_server: {
        Args: {
          target_actor_user_id: string
          target_application_id: number
          target_reason: string
        }
        Returns: undefined
      }
      find_or_create_field_note_tag: {
        Args: { tag_name_en?: string; tag_name_zh: string }
        Returns: {
          archived_at: string | null
          color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          icon: string | null
          id: number
          is_active: boolean
          name_en: string | null
          name_zh: string
          parent_id: number | null
          slug: string
          sort_order: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "topics"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_audit_logs: {
        Args: { before_created_at?: string; page_size?: number }
        Returns: {
          action: string
          actor_user_id: string
          after_data: Json
          before_data: Json
          created_at: string
          entity_id: string
          entity_type: string
          id: number
          metadata: Json
        }[]
      }
      get_community_identity_stats_admin: { Args: never; Returns: Json }
      get_community_person_by_slug: {
        Args: { person_slug: string }
        Returns: {
          avatar_media_id: number
          bio: string
          city: string
          country: string
          display_name: string
          id: number
          joined_at: string
          name_en: string
          name_zh: string
          nature_name: string
          profile_visibility: string
          region: string
          slug: string
        }[]
      }
      get_guardian_consent_request: {
        Args: { request_token: string }
        Returns: {
          contact_channel: string
          contact_last4: string
          document_body_markdown: string
          document_key: string
          document_locale: string
          document_summary: string
          document_title: string
          document_version: number
          expires_at: string
          guardian_name: string
          guardian_relationship: string
          legal_document_id: number
          minor_age_band: string
          minor_display_label: string
          otp_required: boolean
          request_id: string
          request_status: string
        }[]
      }
      get_manual_guardian_review_server: {
        Args: { target_actor_user_id: string; target_application_id: number }
        Returns: {
          consented_at: string
          contact_channel: string
          contact_ciphertext: string
          contact_last4: string
          document_effective_at: string
          document_key: string
          document_locale: string
          document_status: string
          document_title: string
          document_version: number
          guardian_name: string
          guardian_relationship: string
          legal_document_id: number
          request_created_at: string
          request_id: string
          request_status: string
          reviewer_note: string
          verification_basis: string
          verification_method: string
        }[]
      }
      get_my_community_application: {
        Args: never
        Returns: {
          additional_info: string
          attempt_number: number
          contribution: string
          created_at: string
          decided_at: string
          decision_reason: string
          form_version: string
          hopes: string
          id: number
          motivation: string
          status: string
          submitted_at: string
          updated_at: string
        }[]
      }
      get_my_community_profile: {
        Args: never
        Returns: {
          account_display_name: string
          allow_messages: boolean
          avatar_media_id: number
          bio: string
          city: string
          country: string
          full_name_private: string
          joined_at: string
          name_en: string
          name_zh: string
          nature_name: string
          onboarding_completed_at: string
          person_display_name: string
          person_id: number
          person_slug: string
          profile_visibility: string
          region: string
          show_real_name: boolean
          user_id: string
          username: string
        }[]
      }
      get_my_community_state: {
        Args: never
        Returns: {
          account_status: string
          age_band: string
          application_status: string
          destination: string
          guardian_consent_status: string
          identity_verification_status: string
          membership_status: string
          onboarding_completed: boolean
          person_id: number
          user_id: string
        }[]
      }
      get_my_guardian_consent_state: {
        Args: never
        Returns: {
          age_band: string
          can_complete_onboarding: boolean
          eligible_for_membership_approval: boolean
          guardian_consent_status: string
          identity_verification_status: string
          latest_request_expires_at: string
          latest_request_id: string
          latest_request_status: string
          legal_document_id: number
          legal_document_title: string
        }[]
      }
      get_my_permissions: {
        Args: never
        Returns: {
          permission_key: string
        }[]
      }
      get_practice_session_access: {
        Args: { target_session_id: number }
        Returns: {
          access_notes: string
          available_now: boolean
          meeting_url: string
        }[]
      }
      get_website_analytics_dashboard: {
        Args: { target_range?: string }
        Returns: Json
      }
      has_permission: { Args: { permission_key: string }; Returns: boolean }
      initialize_field_note_collab_document_server: {
        Args: {
          candidate_schema_version: number
          candidate_yjs_state: string
          target_field_note_id: number
        }
        Returns: {
          schema_version: number
          yjs_state: string
        }[]
      }
      invite_field_note_collaborator_server: {
        Args: {
          actor_user_id: string
          target_field_note_id: number
          target_role?: string
          target_user_id: string
        }
        Returns: undefined
      }
      join_practice_session: {
        Args: { target_session_id: number }
        Returns: string
      }
      list_community_identity_labels_admin: {
        Args: never
        Returns: {
          color: string
          description_en: string
          description_zh: string
          icon: string
          id: number
          is_active: boolean
          is_core: boolean
          is_public: boolean
          name_en: string
          name_zh: string
          planet_slug: string
          selectable_on_signup: boolean
          slug: string
          sort_order: number
          updated_at: string
        }[]
      }
      list_community_identity_members_admin: {
        Args: { page_size?: number; search_query?: string }
        Returns: {
          display_name: string
          latest_assigned_at: string
          membership_status: string
          nature_name: string
          person_id: number
          planet_slugs: string[]
          primary_identity_slug: string
          secondary_identity_slugs: string[]
          user_id: string
        }[]
      }
      list_community_people: {
        Args: {
          before_joined_at?: string
          before_person_id?: number
          page_size?: number
        }
        Returns: {
          avatar_media_id: number
          bio: string
          city: string
          country: string
          display_name: string
          id: number
          identity_labels: Json
          joined_at: string
          name_en: string
          name_zh: string
          nature_name: string
          planet_slugs: string[]
          primary_identity_color: string
          primary_identity_name_en: string
          primary_identity_name_zh: string
          primary_identity_slug: string
          primary_planet_slug: string
          profile_visibility: string
          region: string
          slug: string
        }[]
      }
      list_community_reports: {
        Args: { page_size?: number; report_statuses?: string[] }
        Returns: {
          category: string
          created_at: string
          details: string
          id: number
          message_id: number
          reported_user_id: string
          reporter_user_id: string
          status: string
        }[]
      }
      list_direct_conversations: {
        Args: never
        Returns: {
          conversation_id: string
          conversation_status: string
          last_message_at: string
          last_message_body: string
          muted: boolean
          other_avatar_media_id: number
          other_display_name: string
          other_nature_name: string
          other_person_slug: string
          other_user_id: string
          unread_count: number
        }[]
      }
      list_direct_messages: {
        Args: {
          before_message_id?: number
          page_size?: number
          target_conversation_id: string
        }
        Returns: {
          body: string
          conversation_id: string
          created_at: string
          edited_at: string
          id: number
          sender_user_id: string
          status: string
        }[]
      }
      list_growth_records: {
        Args: {
          before_observed_at?: string
          before_record_id?: number
          include_archived?: boolean
          page_size?: number
          target_person_id: number
        }
        Returns: {
          archived_at: string
          created_at: string
          id: number
          media: Json
          note: string
          observed_at: string
          observed_timezone: string
          person_id: number
          recorded_by: string
          title: string
          updated_at: string
        }[]
      }
      list_membership_application_identity_declarations: {
        Args: { target_application_ids?: number[] }
        Returns: {
          application_id: number
          primary_identity_slug: string
          secondary_identity_slugs: string[]
          user_id: string
        }[]
      }
      list_membership_applications: {
        Args: {
          application_statuses?: string[]
          before_application_id?: number
          before_created_at?: string
          page_size?: number
        }
        Returns: {
          additional_info: string | null
          age_band: string
          assigned_reviewer_id: string
          contribution: string | null
          created_at: string
          display_name: string
          guardian_consent_status: string
          hopes: string | null
          id: number
          identity_verification_status: string
          motivation: string
          nature_name: string
          status: string
          submitted_at: string
          updated_at: string
          user_id: string
          username: string
        }[]
      }
      list_practice_sessions: {
        Args: {
          after_session_id?: number
          after_starts_at?: string
          include_past?: boolean
          page_size?: number
        }
        Returns: {
          capacity: number
          description: string
          ends_at: string
          facilitator_display_name: string
          facilitator_nature_name: string
          id: number
          my_participation_status: string
          participant_count: number
          starts_at: string
          status: string
          timezone: string
          title: string
          waitlist_count: number
        }[]
      }
      list_signup_identity_options: {
        Args: never
        Returns: {
          color: string
          description_en: string
          description_zh: string
          icon: string
          id: number
          name_en: string
          name_zh: string
          planet_slug: string
          slug: string
          sort_order: number
        }[]
      }
      load_field_note_collab_document_server: {
        Args: { target_field_note_id: number }
        Returns: {
          schema_version: number
          yjs_state: string
        }[]
      }
      load_field_note_collab_seed_server: {
        Args: { target_field_note_id: number }
        Returns: {
          content_json: Json
          legacy_content: string
          schema_version: number
        }[]
      }
      mark_conversation_read: {
        Args: { target_conversation_id: string }
        Returns: undefined
      }
      mark_notification_read: {
        Args: { target_notification_id: number }
        Returns: undefined
      }
      materialize_field_note_server: {
        Args: {
          target_content: string
          target_content_html: string
          target_content_json: Json
          target_field_note_id: number
          target_schema_version: number
        }
        Returns: boolean
      }
      publish_practice_session: {
        Args: { target_session_id: number }
        Returns: undefined
      }
      record_field_note_comment_server: {
        Args: {
          actor_user_id: string
          candidate_share_token_hash?: string
          target_event_type: string
          target_field_note_id: number
          target_resolved?: boolean
          target_thread_id: string
          target_thread_snapshot: Json
        }
        Returns: undefined
      }
      record_manual_guardian_confirmation_server: {
        Args: {
          affirmed_guardianship: boolean
          affirmed_joining: boolean
          affirmed_notice_read: boolean
          target_actor_user_id: string
          target_application_id: number
          target_confirmed_at: string
          target_reviewer_note?: string
          target_verification_basis: string
          target_verification_method: string
        }
        Returns: number
      }
      record_website_analytics_event_server: {
        Args: {
          target_device_category?: string
          target_engaged_seconds?: number
          target_event_type: string
          target_language?: string
          target_path: string
          target_referrer_host?: string
          target_session_id: string
          target_source_category: string
          target_utm_campaign?: string
          target_utm_medium?: string
          target_utm_source?: string
          target_view_id: string
        }
        Returns: boolean
      }
      remove_growth_media: {
        Args: { target_growth_record_id: number; target_media_asset_id: number }
        Returns: {
          media_asset_id: number
          storage_bucket: string
          storage_path: string
        }[]
      }
      report_direct_message: {
        Args: {
          report_category: string
          report_details?: string
          target_message_id: number
        }
        Returns: number
      }
      request_application_changes: {
        Args: {
          applicant_message: string
          reviewer_internal_note?: string
          target_application_id: number
        }
        Returns: undefined
      }
      request_subscription: {
        Args: {
          requested_categories?: string[]
          subscriber_email: string
          subscriber_language?: string
        }
        Returns: undefined
      }
      resolve_community_report: {
        Args: {
          resolution_status: string
          target_report_id: number
          target_resolution_note: string
        }
        Returns: undefined
      }
      resolve_login_email_server: {
        Args: { login_identifier: string }
        Returns: string
      }
      restore_community_membership: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      review_community_application: {
        Args: {
          applicant_message: string
          review_decision: string
          reviewer_internal_note?: string
          target_application_id: number
        }
        Returns: undefined
      }
      review_community_application_with_identities: {
        Args: {
          applicant_message: string
          confirmed_primary_identity_slug?: string
          confirmed_secondary_identity_slugs?: string[]
          review_decision: string
          reviewer_internal_note?: string
          target_application_id: number
        }
        Returns: undefined
      }
      review_minor_identity_verification: {
        Args: {
          review_decision: string
          target_evidence_reference_hash?: string
          target_minor_user_id: string
          target_reviewer_note: string
          target_verification_method: string
        }
        Returns: number
      }
      revoke_field_note_collaborator_server: {
        Args: {
          actor_user_id: string
          target_field_note_id: number
          target_user_id: string
        }
        Returns: undefined
      }
      revoke_field_note_share_link_server: {
        Args: { actor_user_id: string; target_field_note_id: number }
        Returns: undefined
      }
      revoke_user_role: {
        Args: { target_role_id: number; target_user_id: string }
        Returns: undefined
      }
      save_field_note_metadata: {
        Args: {
          target_category_id: number
          target_field_note_id: number
          target_topic_ids?: number[]
          target_visibility?: string
        }
        Returns: undefined
      }
      send_direct_message: {
        Args: { message_body: string; target_conversation_id: string }
        Returns: number
      }
      set_community_member_identities_admin: {
        Args: {
          primary_identity_slug: string
          secondary_identity_slugs?: string[]
          target_person_id: number
        }
        Returns: undefined
      }
      set_role_permissions: {
        Args: { permission_keys: string[]; target_role_id: number }
        Returns: undefined
      }
      set_website_analytics_reporting_start_date: {
        Args: { target_date: string }
        Returns: Json
      }
      store_field_note_collab_document_server: {
        Args: {
          target_field_note_id: number
          target_schema_version: number
          target_yjs_state: string
        }
        Returns: undefined
      }
      submit_community_application: {
        Args: {
          application_additional_info?: string
          application_contribution?: string
          application_hopes?: string
          application_motivation: string
          target_application_id: number
        }
        Returns: string
      }
      suspend_community_membership: {
        Args: { target_reason: string; target_user_id: string }
        Returns: undefined
      }
      unblock_community_member: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      update_community_identity_label_admin: {
        Args: {
          target_color?: string
          target_description_en?: string
          target_description_zh?: string
          target_is_active?: boolean
          target_label_id: number
          target_name_en?: string
          target_name_zh: string
          target_planet_slug?: string
          target_selectable_on_signup?: boolean
          target_sort_order?: number
        }
        Returns: undefined
      }
      update_growth_record: {
        Args: {
          growth_note: string
          growth_observed_at: string
          growth_observed_timezone: string
          growth_title: string
          target_growth_record_id: number
        }
        Returns: undefined
      }
      update_my_community_profile: {
        Args: {
          person_bio?: string
          person_city?: string
          person_country?: string
          person_display_name: string
          person_full_name_private?: string
          person_name_en?: string
          person_name_zh?: string
          person_nature_name?: string
          person_region?: string
          requested_allow_messages?: boolean
          requested_profile_visibility?: string
          requested_show_real_name?: boolean
        }
        Returns: undefined
      }
      verify_guardian_otp_server: {
        Args: {
          affirmed_guardianship: boolean
          affirmed_joining: boolean
          affirmed_notice_read: boolean
          request_token: string
          submitted_otp_hash: string
          target_challenge_id: string
          target_ip_hash?: string
          target_user_agent_hash?: string
        }
        Returns: string
      }
      withdraw_community_application: {
        Args: { target_application_id: number }
        Returns: undefined
      }
      withdraw_guardian_consent_server: {
        Args: {
          target_reason: string
          target_request_id: string
          target_withdrawal_verification_hash: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
