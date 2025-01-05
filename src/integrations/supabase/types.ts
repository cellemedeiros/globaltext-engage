export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      badges: {
        Row: {
          created_at: string | null
          description: string
          id: string
          image_url: string | null
          name: string
          threshold: number | null
          type: Database["public"]["Enums"]["badge_type"]
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          image_url?: string | null
          name: string
          threshold?: number | null
          type: Database["public"]["Enums"]["badge_type"]
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          image_url?: string | null
          name?: string
          threshold?: number | null
          type?: Database["public"]["Enums"]["badge_type"]
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string | null
          id: number
          message: string | null
          name: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: number
          message?: string | null
          name?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: number
          message?: string | null
          name?: string | null
        }
        Relationships: []
      }
      freelancer_applications: {
        Row: {
          cover_letter: string | null
          created_at: string
          cv_url: string
          email: string
          id: string
          languages: string[]
          linkedin_url: string | null
          name: string
          phone: string | null
          portfolio_url: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          years_of_experience: number
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string
          cv_url: string
          email: string
          id?: string
          languages: string[]
          linkedin_url?: string | null
          name: string
          phone?: string | null
          portfolio_url?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          years_of_experience: number
        }
        Update: {
          cover_letter?: string | null
          created_at?: string
          cv_url?: string
          email?: string
          id?: string
          languages?: string[]
          linkedin_url?: string | null
          name?: string
          phone?: string | null
          portfolio_url?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          years_of_experience?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          country: string | null
          created_at: string
          first_name: string | null
          id: string
          is_approved_translator: boolean | null
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          country?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          is_approved_translator?: boolean | null
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          country?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          is_approved_translator?: boolean | null
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount_paid: number
          expires_at: string
          id: string
          plan_name: string
          started_at: string | null
          status: string
          user_id: string
          words_remaining: number | null
        }
        Insert: {
          amount_paid: number
          expires_at: string
          id?: string
          plan_name: string
          started_at?: string | null
          status?: string
          user_id: string
          words_remaining?: number | null
        }
        Update: {
          amount_paid?: number
          expires_at?: string
          id?: string
          plan_name?: string
          started_at?: string | null
          status?: string
          user_id?: string
          words_remaining?: number | null
        }
        Relationships: []
      }
      translations: {
        Row: {
          admin_review_notes: string | null
          admin_review_status: string | null
          admin_reviewed_at: string | null
          admin_reviewer_id: string | null
          ai_translated_at: string | null
          ai_translated_content: string | null
          amount_paid: number
          completed_at: string | null
          content: string | null
          created_at: string | null
          deadline: string | null
          document_name: string
          file_path: string | null
          id: string
          price_offered: number
          source_language: string
          status: string
          subscription_id: string | null
          target_language: string
          translated_file_path: string | null
          translator_id: string | null
          user_id: string
          word_count: number
        }
        Insert: {
          admin_review_notes?: string | null
          admin_review_status?: string | null
          admin_reviewed_at?: string | null
          admin_reviewer_id?: string | null
          ai_translated_at?: string | null
          ai_translated_content?: string | null
          amount_paid: number
          completed_at?: string | null
          content?: string | null
          created_at?: string | null
          deadline?: string | null
          document_name: string
          file_path?: string | null
          id?: string
          price_offered?: number
          source_language: string
          status?: string
          subscription_id?: string | null
          target_language: string
          translated_file_path?: string | null
          translator_id?: string | null
          user_id: string
          word_count: number
        }
        Update: {
          admin_review_notes?: string | null
          admin_review_status?: string | null
          admin_reviewed_at?: string | null
          admin_reviewer_id?: string | null
          ai_translated_at?: string | null
          ai_translated_content?: string | null
          amount_paid?: number
          completed_at?: string | null
          content?: string | null
          created_at?: string | null
          deadline?: string | null
          document_name?: string
          file_path?: string | null
          id?: string
          price_offered?: number
          source_language?: string
          status?: string
          subscription_id?: string | null
          target_language?: string
          translated_file_path?: string | null
          translator_id?: string | null
          user_id?: string
          word_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "translations_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "translations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      translator_badges: {
        Row: {
          badge_id: string
          earned_at: string | null
          id: string
          translator_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string | null
          id?: string
          translator_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string | null
          id?: string
          translator_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "translator_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_translator: {
        Args: {
          application_id: string
          reviewer_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      badge_type:
        | "first_translation"
        | "translations_milestone"
        | "words_milestone"
        | "speed_milestone"
        | "quality_milestone"
      user_role: "client" | "translator"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
