export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      access_event: {
        Row: {
          at: string
          access: string
          code: string
          access_user_id: number | null
          access_point_id: number
          access_event_id: number
        }
        Insert: {
          at: string
          access: string
          code: string
          access_user_id?: number | null
          access_point_id: number
          access_event_id?: number
        }
        Update: {
          at?: string
          access?: string
          code?: string
          access_user_id?: number | null
          access_point_id?: number
          access_event_id?: number
        }
      }
      access_hub: {
        Row: {
          heartbeat_at: string | null
          customer_id: string
          access_hub_id: number
          name: string
          description: string
          api_token: string
        }
        Insert: {
          heartbeat_at?: string | null
          customer_id: string
          access_hub_id?: number
          name?: string
          description?: string
          api_token?: string
        }
        Update: {
          heartbeat_at?: string | null
          customer_id?: string
          access_hub_id?: number
          name?: string
          description?: string
          api_token?: string
        }
      }
      access_point: {
        Row: {
          name: string
          position: number
          access_hub_id: number
          access_point_id: number
          description: string
        }
        Insert: {
          name: string
          position: number
          access_hub_id: number
          access_point_id?: number
          description?: string
        }
        Update: {
          name?: string
          position?: number
          access_hub_id?: number
          access_point_id?: number
          description?: string
        }
      }
      access_point_to_access_user: {
        Row: {
          access_point_id: number
          access_user_id: number
        }
        Insert: {
          access_point_id: number
          access_user_id: number
        }
        Update: {
          access_point_id?: number
          access_user_id?: number
        }
      }
      access_user: {
        Row: {
          name: string
          code: string
          activate_code_at: string | null
          expire_code_at: string | null
          customer_id: string
          deleted_at: string | null
          access_user_id: number
          description: string
        }
        Insert: {
          name: string
          code: string
          activate_code_at?: string | null
          expire_code_at?: string | null
          customer_id: string
          deleted_at?: string | null
          access_user_id?: number
          description?: string
        }
        Update: {
          name?: string
          code?: string
          activate_code_at?: string | null
          expire_code_at?: string | null
          customer_id?: string
          deleted_at?: string | null
          access_user_id?: number
          description?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      connect_access_points_and_users: {
        Args: {
          access_point_ids: number[]
          access_user_ids: number[]
          customer_id: string
        }
        Returns: { access_point_id: number; access_user_id: number }[]
      }
      disconnect_access_points_and_users: {
        Args: {
          access_point_ids: number[]
          access_user_ids: number[]
          customer_id: string
        }
        Returns: { access_point_id: number; access_user_id: number }[]
      }
      get_access_hub: {
        Args: { access_hub_id: number; customer_id: string }
        Returns: {
          access_hub_id: number
          name: string
          description: string
          heartbeat_at: string
        }[]
      }
      get_access_hub_events: {
        Args: {
          access_hub_id: number
          customer_id: string
          cursor_id: number
          take: number
        }
        Returns: {
          access_event_id: number
          at: string
          access: string
          code: string
          access_user_name: string
          access_point_id: number
          access_point_name: string
        }[]
      }
      get_access_hub_with_points: {
        Args: { access_hub_id: number; customer_id: string }
        Returns: {
          access_hub_id: number
          name: string
          description: string
          heartbeat_at: string
          access_point_id: number
          access_point_name: string
          access_point_description: string
          access_point_position: number
        }[]
      }
      get_access_hubs: {
        Args: { customer_id: string }
        Returns: {
          access_hub_id: number
          name: string
          description: string
          heartbeat_at: string
        }[]
      }
      get_access_point: {
        Args: {
          access_point_id: number
          access_hub_id: number
          customer_id: string
        }
        Returns: {
          access_point_id: number
          name: string
          description: string
          position: number
        }[]
      }
      get_access_point_with_hub_and_users: {
        Args: { access_point_id: number; customer_id: string }
        Returns: {
          access_point_id: number
          name: string
          description: string
          position: number
          access_hub_name: string
          access_user_id: number
          access_user_name: string
          access_user_description: string
          access_user_code: string
        }[]
      }
      get_access_users_not_connected_to_point: {
        Args: { access_point_id: number; customer_id: string }
        Returns: { access_user_id: number; name: string }[]
      }
      get_grant_deny_stats: {
        Args: { customer_id: string }
        Returns: {
          access_hub_id: number
          name: string
          heartbeat_at: string
          access_point_id: number
          access_point_name: string
          access_point_position: number
          grant: number
          deny: number
        }[]
      }
      update_access_hub: {
        Args: {
          access_hub_id: number
          customer_id: string
          name: string
          description: string
        }
        Returns: { access_hub_id: number; name: string; description: string }[]
      }
      update_access_point: {
        Args: {
          access_point_id: number
          access_hub_id: number
          customer_id: string
          name: string
          description: string
        }
        Returns: {
          access_point_id: number
          name: string
          description: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

