/**
 * Database types for the job portal schema.
 *
 * Hand-maintained to match supabase/migrations/*.sql. Once the Supabase project
 * exists these can be regenerated with:
 *
 *   npx supabase gen types typescript --project-id <ref> > lib/supabase/types.ts
 *
 * Keep this file in sync with the migrations whenever the schema changes.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      jobs: {
        Row: {
          id: string;
          title: string;
          slug: string;
          company_name: string | null;
          location: string | null;
          employment_type: string | null;
          salary: string | null;
          category_id: string | null;
          description: string | null;
          responsibilities: string | null;
          requirements: string | null;
          featured_image_url: string | null;
          featured_image_path: string | null;
          featured_image_alt: string | null;
          seo_title: string | null;
          seo_description: string | null;
          seo_keywords: string | null;
          how_to_apply: Json;
          application_url: string;
          status: string;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          company_name?: string | null;
          location?: string | null;
          employment_type?: string | null;
          salary?: string | null;
          category_id?: string | null;
          description?: string | null;
          responsibilities?: string | null;
          requirements?: string | null;
          featured_image_url?: string | null;
          featured_image_path?: string | null;
          featured_image_alt?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          seo_keywords?: string | null;
          how_to_apply?: Json;
          application_url: string;
          status?: string;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          company_name?: string | null;
          location?: string | null;
          employment_type?: string | null;
          salary?: string | null;
          category_id?: string | null;
          description?: string | null;
          responsibilities?: string | null;
          requirements?: string | null;
          featured_image_url?: string | null;
          featured_image_path?: string | null;
          featured_image_alt?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          seo_keywords?: string | null;
          how_to_apply?: Json;
          application_url?: string;
          status?: string;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "jobs_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: {
      is_admin: {
        Args: Record<never, never>;
        Returns: boolean;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];

export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];
