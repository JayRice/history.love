export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      app_calendar_events: {
        Row: {
          created_at: string
          created_by: string
          doc: Json
          id: string
          relationship_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          doc?: Json
          id?: string
          relationship_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          doc?: Json
          id?: string
          relationship_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_calendar_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_calendar_events_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      app_games: {
        Row: {
          created_at: string
          created_by: string
          doc: Json
          id: string
          relationship_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          doc?: Json
          id?: string
          relationship_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          doc?: Json
          id?: string
          relationship_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_games_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_games_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      app_memories: {
        Row: {
          created_at: string
          created_by: string
          doc: Json
          id: string
          relationship_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          doc?: Json
          id?: string
          relationship_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          doc?: Json
          id?: string
          relationship_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_memories_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_memories_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      app_notifications: {
        Row: {
          created_at: string
          doc: Json
          id: string
          read_at: string | null
          recipient_id: string
        }
        Insert: {
          created_at?: string
          doc?: Json
          id?: string
          read_at?: string | null
          recipient_id: string
        }
        Update: {
          created_at?: string
          doc?: Json
          id?: string
          read_at?: string | null
          recipient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_events: {
        Row: {
          actor_id: string | null
          created_at: string
          event_type: string
          id: string
          payload: Json
          subject_id: string | null
          subject_type: string | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          payload?: Json
          subject_id?: string | null
          subject_type?: string | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json
          subject_id?: string | null
          subject_type?: string | null
        }
        Relationships: []
      }
      blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
          mode: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
          mode?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
          mode?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocks_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocks_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      device_tokens: {
        Row: {
          created_at: string
          profile_id: string
          token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          profile_id: string
          token: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          profile_id?: string
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_tokens_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age_verified: boolean
          avatar_path: string | null
          birth_month: number | null
          birth_year: number | null
          city: string | null
          comms_prefs: Json
          created_at: string
          display_name: string
          handle: string | null
          id: string
          legacy_meta: Json | null
          legal_name: string | null
          pronouns: string | null
          search_status: string
          search_visible_at: string | null
          state: string | null
          updated_at: string
          verification_state: Json
        }
        Insert: {
          age_verified?: boolean
          avatar_path?: string | null
          birth_month?: number | null
          birth_year?: number | null
          city?: string | null
          comms_prefs?: Json
          created_at?: string
          display_name?: string
          handle?: string | null
          id: string
          legacy_meta?: Json | null
          legal_name?: string | null
          pronouns?: string | null
          search_status?: string
          search_visible_at?: string | null
          state?: string | null
          updated_at?: string
          verification_state?: Json
        }
        Update: {
          age_verified?: boolean
          avatar_path?: string | null
          birth_month?: number | null
          birth_year?: number | null
          city?: string | null
          comms_prefs?: Json
          created_at?: string
          display_name?: string
          handle?: string | null
          id?: string
          legacy_meta?: Json | null
          legal_name?: string | null
          pronouns?: string | null
          search_status?: string
          search_visible_at?: string | null
          state?: string | null
          updated_at?: string
          verification_state?: Json
        }
        Relationships: []
      }
      relationship_confirmations: {
        Row: {
          confirmed_at: string
          id: string
          profile_id: string
          prompt_cycle: number | null
          relationship_id: string
        }
        Insert: {
          confirmed_at?: string
          id?: string
          profile_id: string
          prompt_cycle?: number | null
          relationship_id: string
        }
        Update: {
          confirmed_at?: string
          id?: string
          profile_id?: string
          prompt_cycle?: number | null
          relationship_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "relationship_confirmations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_confirmations_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      relationship_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          attempt_count: number
          code_hash: string
          created_at: string
          expires_at: string
          id: string
          invited_email_hash: string | null
          inviter_id: string
          max_attempts: number
          relationship_id: string
          revoked_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          attempt_count?: number
          code_hash: string
          created_at?: string
          expires_at?: string
          id?: string
          invited_email_hash?: string | null
          inviter_id: string
          max_attempts?: number
          relationship_id: string
          revoked_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          attempt_count?: number
          code_hash?: string
          created_at?: string
          expires_at?: string
          id?: string
          invited_email_hash?: string | null
          inviter_id?: string
          max_attempts?: number
          relationship_id?: string
          revoked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "relationship_invitations_accepted_by_fkey"
            columns: ["accepted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_invitations_inviter_id_fkey"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_invitations_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      relationship_members: {
        Row: {
          created_at: string
          id: string
          joined_at: string | null
          left_at: string | null
          member_status: string
          profile_id: string
          relationship_id: string
          role: string
          visibility_consent_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          joined_at?: string | null
          left_at?: string | null
          member_status?: string
          profile_id: string
          relationship_id: string
          role?: string
          visibility_consent_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          joined_at?: string | null
          left_at?: string | null
          member_status?: string
          profile_id?: string
          relationship_id?: string
          role?: string
          visibility_consent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "relationship_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_members_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      relationship_status_events: {
        Row: {
          actor_id: string | null
          confirmation_state: string
          created_at: string
          effective_at: string
          id: string
          new_status: string
          prior_status: string | null
          relationship_id: string
        }
        Insert: {
          actor_id?: string | null
          confirmation_state?: string
          created_at?: string
          effective_at?: string
          id?: string
          new_status: string
          prior_status?: string | null
          relationship_id: string
        }
        Update: {
          actor_id?: string | null
          confirmation_state?: string
          created_at?: string
          effective_at?: string
          id?: string
          new_status?: string
          prior_status?: string | null
          relationship_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "relationship_status_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_status_events_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      relationship_visibility_grants: {
        Row: {
          history_visibility: string
          id: string
          partner_identity_visibility: boolean
          profile_id: string
          relationship_id: string
          status_visibility: string
          updated_at: string
        }
        Insert: {
          history_visibility?: string
          id?: string
          partner_identity_visibility?: boolean
          profile_id: string
          relationship_id: string
          status_visibility?: string
          updated_at?: string
        }
        Update: {
          history_visibility?: string
          id?: string
          partner_identity_visibility?: boolean
          profile_id?: string
          relationship_id?: string
          status_visibility?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "relationship_visibility_grants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_visibility_grants_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      relationships: {
        Row: {
          active_game_id: string | null
          created_at: string
          created_by: string
          end_date: string | null
          id: string
          legacy_meta: Json | null
          relationship_type: string
          start_date: string | null
          status: string
          updated_at: string
          verification_state: string
        }
        Insert: {
          active_game_id?: string | null
          created_at?: string
          created_by: string
          end_date?: string | null
          id?: string
          legacy_meta?: Json | null
          relationship_type?: string
          start_date?: string | null
          status?: string
          updated_at?: string
          verification_state?: string
        }
        Update: {
          active_game_id?: string | null
          created_at?: string
          created_by?: string
          end_date?: string | null
          id?: string
          legacy_meta?: Json | null
          relationship_type?: string
          start_date?: string | null
          status?: string
          updated_at?: string
          verification_state?: string
        }
        Relationships: [
          {
            foreignKeyName: "relationships_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_consents: {
        Row: {
          accepted_at: string
          consent_type: string
          device_meta: Json
          id: string
          ip_hash: string | null
          policy_version: string
          profile_id: string
          withdrawn_at: string | null
        }
        Insert: {
          accepted_at?: string
          consent_type: string
          device_meta?: Json
          id?: string
          ip_hash?: string | null
          policy_version: string
          profile_id: string
          withdrawn_at?: string | null
        }
        Update: {
          accepted_at?: string
          consent_type?: string
          device_meta?: Json
          id?: string
          ip_hash?: string | null
          policy_version?: string
          profile_id?: string
          withdrawn_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_consents_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: { Args: { p_code: string }; Returns: string }
      accept_policy: {
        Args: { p_consent_type: string; p_policy_version: string }
        Returns: string
      }
      archive_active_game: { Args: never; Returns: undefined }
      complete_onboarding: {
        Args: {
          p_avatar_path?: string
          p_display_name?: string
          p_handle?: string
          p_meta?: Json
        }
        Returns: undefined
      }
      confirm_relationship: {
        Args: { p_relationship_id: string }
        Returns: string
      }
      create_invitation: {
        Args: { p_relationship_type?: string; p_start_date?: string }
        Returns: {
          code: string
          invitation_id: string
          relationship_id: string
        }[]
      }
      end_active_game: { Args: never; Returns: undefined }
      is_handle_taken: { Args: { p_handle: string }; Returns: boolean }
      leave_relationship: { Args: never; Returns: undefined }
      revoke_invitation: {
        Args: { p_invitation_id: string }
        Returns: undefined
      }
      start_game: { Args: { p_doc: Json }; Returns: string }
      update_profile_meta: { Args: { p_patch: Json }; Returns: undefined }
      wyr_choose: {
        Args: { p_choice: number; p_game_id: string }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

