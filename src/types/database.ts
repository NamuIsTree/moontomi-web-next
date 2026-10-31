export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      album: {
        Row: {
          album_id: number
          archive_id: number | null
          artist_id: number
          created_at: string | null
          image_id: string
          links: Json | null
          modified_at: string | null
          release: string
          title: string
          tracks: Json
        }
        Insert: {
          album_id?: number
          archive_id?: number | null
          artist_id: number
          created_at?: string | null
          image_id: string
          links?: Json | null
          modified_at?: string | null
          release: string
          title: string
          tracks?: Json
        }
        Update: {
          album_id?: number
          archive_id?: number | null
          artist_id?: number
          created_at?: string | null
          image_id?: string
          links?: Json | null
          modified_at?: string | null
          release?: string
          title?: string
          tracks?: Json
        }
        Relationships: [
          {
            foreignKeyName: "album_archive_id_fkey"
            columns: ["archive_id"]
            isOneToOne: false
            referencedRelation: "archive"
            referencedColumns: ["archive_id"]
          },
          {
            foreignKeyName: "album_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artist"
            referencedColumns: ["artist_id"]
          },
        ]
      }
      album_genre: {
        Row: {
          album_id: number
          created_at: string | null
          genre_id: number
          modified_at: string | null
        }
        Insert: {
          album_id: number
          created_at?: string | null
          genre_id: number
          modified_at?: string | null
        }
        Update: {
          album_id?: number
          created_at?: string | null
          genre_id?: number
          modified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "album_genre_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "album"
            referencedColumns: ["album_id"]
          },
          {
            foreignKeyName: "album_genre_genre_id_fkey"
            columns: ["genre_id"]
            isOneToOne: false
            referencedRelation: "genre"
            referencedColumns: ["genre_id"]
          },
        ]
      }
      archive: {
        Row: {
          archive_id: number
          created_at: string | null
          date: string
          modified_at: string | null
          rating: number
          writer: string
        }
        Insert: {
          archive_id?: number
          created_at?: string | null
          date: string
          modified_at?: string | null
          rating: number
          writer: string
        }
        Update: {
          archive_id?: number
          created_at?: string | null
          date?: string
          modified_at?: string | null
          rating?: number
          writer?: string
        }
        Relationships: []
      }
      artist: {
        Row: {
          artist_id: number
          created_at: string | null
          modified_at: string | null
          name: string
          name_en: string | null
          nation: string
          pronounce: string | null
        }
        Insert: {
          artist_id?: number
          created_at?: string | null
          modified_at?: string | null
          name: string
          name_en?: string | null
          nation: string
          pronounce?: string | null
        }
        Update: {
          artist_id?: number
          created_at?: string | null
          modified_at?: string | null
          name?: string
          name_en?: string | null
          nation?: string
          pronounce?: string | null
        }
        Relationships: []
      }
      comment: {
        Row: {
          comment_id: number
          created_at: string | null
          lecture_id: number
          modified_at: string | null
          password: string
          picks: Json
          rating: number
          text: string
          writer: string
        }
        Insert: {
          comment_id?: number
          created_at?: string | null
          lecture_id: number
          modified_at?: string | null
          password: string
          picks?: Json
          rating: number
          text: string
          writer: string
        }
        Update: {
          comment_id?: number
          created_at?: string | null
          lecture_id?: number
          modified_at?: string | null
          password?: string
          picks?: Json
          rating?: number
          text?: string
          writer?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_lecture_id_fkey"
            columns: ["lecture_id"]
            isOneToOne: false
            referencedRelation: "lecture"
            referencedColumns: ["lecture_id"]
          },
        ]
      }
      genre: {
        Row: {
          category: string
          created_at: string | null
          genre_id: number
          modified_at: string | null
          name: string
        }
        Insert: {
          category: string
          created_at?: string | null
          genre_id?: number
          modified_at?: string | null
          name: string
        }
        Update: {
          category?: string
          created_at?: string | null
          genre_id?: number
          modified_at?: string | null
          name?: string
        }
        Relationships: []
      }
      lecture: {
        Row: {
          album_id: number
          created_at: string | null
          date: string | null
          lecture_id: number
          modified_at: string | null
          rating: number | null
          season_id: number
        }
        Insert: {
          album_id: number
          created_at?: string | null
          date?: string | null
          lecture_id?: number
          modified_at?: string | null
          rating?: number | null
          season_id: number
        }
        Update: {
          album_id?: number
          created_at?: string | null
          date?: string | null
          lecture_id?: number
          modified_at?: string | null
          rating?: number | null
          season_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "lecture_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: true
            referencedRelation: "album"
            referencedColumns: ["album_id"]
          },
          {
            foreignKeyName: "lecture_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "season"
            referencedColumns: ["season_id"]
          },
        ]
      }
      review: {
        Row: {
          content: string
          created_at: string | null
          description: string
          image_id: string
          modified_at: string | null
          password: string
          review_id: number
          title: string
          type: string
          views: number
          writer: string
        }
        Insert: {
          content: string
          created_at?: string | null
          description: string
          image_id: string
          modified_at?: string | null
          password: string
          review_id?: number
          title: string
          type: string
          views?: number
          writer: string
        }
        Update: {
          content?: string
          created_at?: string | null
          description?: string
          image_id?: string
          modified_at?: string | null
          password?: string
          review_id?: number
          title?: string
          type?: string
          views?: number
          writer?: string
        }
        Relationships: []
      }
      season: {
        Row: {
          color: string
          created_at: string | null
          image_id: string
          modified_at: string | null
          name: string
          season_id: number
        }
        Insert: {
          color: string
          created_at?: string | null
          image_id: string
          modified_at?: string | null
          name: string
          season_id?: number
        }
        Update: {
          color?: string
          created_at?: string | null
          image_id?: string
          modified_at?: string | null
          name?: string
          season_id?: number
        }
        Relationships: []
      }
      single: {
        Row: {
          archive_id: number | null
          artist_id: number
          created_at: string | null
          image_id: string
          links: Json | null
          modified_at: string | null
          release: string
          single_id: number
          title: string
        }
        Insert: {
          archive_id?: number | null
          artist_id: number
          created_at?: string | null
          image_id: string
          links?: Json | null
          modified_at?: string | null
          release: string
          single_id?: number
          title: string
        }
        Update: {
          archive_id?: number | null
          artist_id?: number
          created_at?: string | null
          image_id?: string
          links?: Json | null
          modified_at?: string | null
          release?: string
          single_id?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "single_archive_id_fkey"
            columns: ["archive_id"]
            isOneToOne: false
            referencedRelation: "archive"
            referencedColumns: ["archive_id"]
          },
          {
            foreignKeyName: "single_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artist"
            referencedColumns: ["artist_id"]
          },
        ]
      }
      single_genre: {
        Row: {
          created_at: string | null
          genre_id: number
          modified_at: string | null
          single_id: number
        }
        Insert: {
          created_at?: string | null
          genre_id: number
          modified_at?: string | null
          single_id: number
        }
        Update: {
          created_at?: string | null
          genre_id?: number
          modified_at?: string | null
          single_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "single_genre_genre_id_fkey"
            columns: ["genre_id"]
            isOneToOne: false
            referencedRelation: "genre"
            referencedColumns: ["genre_id"]
          },
          {
            foreignKeyName: "single_genre_single_id_fkey"
            columns: ["single_id"]
            isOneToOne: false
            referencedRelation: "single"
            referencedColumns: ["single_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_comment: {
        Args: {
          p_lecture_id: number
          p_password: string
          p_picks: Json
          p_rating: number
          p_text: string
          p_writer: string
        }
        Returns: Json
      }
      create_review: {
        Args: {
          p_content: string
          p_description: string
          p_image_id: string
          p_password: string
          p_title: string
          p_type: string
          p_writer: string
        }
        Returns: Json
      }
      increment_review_views: {
        Args: { p_review_id: number }
        Returns: undefined
      }
      update_comment: {
        Args: {
          p_comment_id: number
          p_password: string
          p_picks: Json
          p_rating: number
          p_text: string
        }
        Returns: Json
      }
      update_review: {
        Args: {
          p_content: string
          p_description: string
          p_image_id: string
          p_password: string
          p_review_id: number
          p_title: string
          p_type: string
          p_writer: string
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
}
