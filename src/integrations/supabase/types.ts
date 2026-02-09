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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      business_profiles: {
        Row: {
          address: string | null
          city: string | null
          company_name: string
          country: string | null
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          organization_number: string | null
          phone_number: string | null
          postal_code: string | null
          updated_at: string
          user_id: string
          vat_number: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_name: string
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          organization_number?: string | null
          phone_number?: string | null
          postal_code?: string | null
          updated_at?: string
          user_id: string
          vat_number?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company_name?: string
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          organization_number?: string | null
          phone_number?: string | null
          postal_code?: string | null
          updated_at?: string
          user_id?: string
          vat_number?: string | null
          website?: string | null
        }
        Relationships: []
      }
      campaign_tiers: {
        Row: {
          campaign_id: string
          created_at: string
          id: string
          max_views: number | null
          min_views: number
          rate_per_view: number
        }
        Insert: {
          campaign_id: string
          created_at?: string
          id?: string
          max_views?: number | null
          min_views: number
          rate_per_view: number
        }
        Update: {
          campaign_id?: string
          created_at?: string
          id?: string
          max_views?: number | null
          min_views?: number
          rate_per_view?: number
        }
        Relationships: [
          {
            foreignKeyName: "campaign_tiers_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          assets_urls: string[] | null
          brand_logo_url: string | null
          brand_name: string
          business_id: string
          category: string | null
          cover_image_url: string | null
          created_at: string
          deadline: string | null
          description: string | null
          example_image_urls: string[] | null
          guidelines: string[] | null
          id: string
          is_active: boolean | null
          max_earnings: number | null
          product_visibility: string | null
          status: string | null
          title: string
          total_budget: number | null
          updated_at: string
          video_length: string | null
        }
        Insert: {
          assets_urls?: string[] | null
          brand_logo_url?: string | null
          brand_name: string
          business_id: string
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          example_image_urls?: string[] | null
          guidelines?: string[] | null
          id?: string
          is_active?: boolean | null
          max_earnings?: number | null
          product_visibility?: string | null
          status?: string | null
          title: string
          total_budget?: number | null
          updated_at?: string
          video_length?: string | null
        }
        Update: {
          assets_urls?: string[] | null
          brand_logo_url?: string | null
          brand_name?: string
          business_id?: string
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          example_image_urls?: string[] | null
          guidelines?: string[] | null
          id?: string
          is_active?: boolean | null
          max_earnings?: number | null
          product_visibility?: string | null
          status?: string | null
          title?: string
          total_budget?: number | null
          updated_at?: string
          video_length?: string | null
        }
        Relationships: []
      }
      content_submissions: {
        Row: {
          campaign_id: string
          created_at: string
          creator_id: string
          current_views: number | null
          id: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["submission_status"]
          tiktok_account_id: string
          tiktok_video_id: string | null
          tiktok_video_url: string
          updated_at: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          creator_id: string
          current_views?: number | null
          id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          tiktok_account_id: string
          tiktok_video_id?: string | null
          tiktok_video_url: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          creator_id?: string
          current_views?: number | null
          id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          tiktok_account_id?: string
          tiktok_video_id?: string | null
          tiktok_video_url?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_submissions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_submissions_tiktok_account_id_fkey"
            columns: ["tiktok_account_id"]
            isOneToOne: false
            referencedRelation: "tiktok_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_submissions_tiktok_account_id_fkey"
            columns: ["tiktok_account_id"]
            isOneToOne: false
            referencedRelation: "tiktok_accounts_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      earnings: {
        Row: {
          amount: number
          created_at: string
          creator_id: string
          id: string
          is_paid: boolean | null
          paid_at: string | null
          submission_id: string
          updated_at: string
          views_counted: number
        }
        Insert: {
          amount?: number
          created_at?: string
          creator_id: string
          id?: string
          is_paid?: boolean | null
          paid_at?: string | null
          submission_id: string
          updated_at?: string
          views_counted?: number
        }
        Update: {
          amount?: number
          created_at?: string
          creator_id?: string
          id?: string
          is_paid?: boolean | null
          paid_at?: string | null
          submission_id?: string
          updated_at?: string
          views_counted?: number
        }
        Relationships: [
          {
            foreignKeyName: "earnings_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "content_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          campaign_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          phone_number: string | null
          updated_at: string
          user_id: string
          username: string | null
          username_changed_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
          username_changed_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
          username_changed_at?: string | null
        }
        Relationships: []
      }
      tiktok_accounts: {
        Row: {
          access_token: string | null
          created_at: string
          follower_count: number | null
          id: string
          is_active: boolean | null
          refresh_token: string | null
          tiktok_user_id: string
          tiktok_username: string
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          follower_count?: number | null
          id?: string
          is_active?: boolean | null
          refresh_token?: string | null
          tiktok_user_id: string
          tiktok_username: string
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          follower_count?: number | null
          id?: string
          is_active?: boolean | null
          refresh_token?: string | null
          tiktok_user_id?: string
          tiktok_username?: string
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      tiktok_accounts_safe: {
        Row: {
          created_at: string | null
          follower_count: number | null
          id: string | null
          is_active: boolean | null
          tiktok_user_id: string | null
          tiktok_username: string | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          follower_count?: number | null
          id?: string | null
          is_active?: boolean | null
          tiktok_user_id?: string | null
          tiktok_username?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          follower_count?: number | null
          id?: string | null
          is_active?: boolean | null
          tiktok_user_id?: string | null
          tiktok_username?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_tiktok_tokens: {
        Args: { p_tiktok_account_id: string }
        Returns: {
          access_token: string
          refresh_token: string
        }[]
      }
      get_user_tiktok_accounts: {
        Args: { p_user_id: string }
        Returns: {
          created_at: string
          follower_count: number
          id: string
          is_active: boolean
          tiktok_user_id: string
          tiktok_username: string
          token_expires_at: string
          updated_at: string
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      store_tiktok_tokens: {
        Args: {
          p_access_token: string
          p_refresh_token: string
          p_tiktok_account_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "creator" | "business" | "admin"
      submission_status: "pending_review" | "approved" | "denied" | "paid"
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
    Enums: {
      app_role: ["creator", "business", "admin"],
      submission_status: ["pending_review", "approved", "denied", "paid"],
    },
  },
} as const
