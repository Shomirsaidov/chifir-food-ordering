export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    telegram_id: number
                    username: string | null
                    first_name: string | null
                    last_name: string | null
                    photo_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    telegram_id: number
                    username?: string | null
                    first_name?: string | null
                    last_name?: string | null
                    photo_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    telegram_id?: number
                    username?: string | null
                    first_name?: string | null
                    last_name?: string | null
                    photo_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            admins: {
                Row: {
                    id: string
                    telegram_username: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    telegram_username: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    telegram_username?: string
                    created_at?: string
                }
            }
            categories: {
                Row: {
                    id: string
                    name: string
                    sort_order: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    sort_order?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    sort_order?: number
                    created_at?: string
                }
            }
            menu_items: {
                Row: {
                    id: string
                    category_id: string
                    name: string
                    description: string | null
                    price: number
                    image_url: string | null
                    image_loc: string | null
                    is_active: boolean
                    sort_order: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    category_id: string
                    name: string
                    description?: string | null
                    price: number
                    image_url?: string | null
                    is_active?: boolean
                    sort_order?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    category_id?: string
                    name?: string
                    description?: string | null
                    price?: number
                    image_url?: string | null
                    is_active?: boolean
                    sort_order?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            orders: {
                Row: {
                    id: string
                    user_id: string
                    table_location: string | null
                    comment: string | null
                    total_amount: number
                    status: 'new' | 'in_progress' | 'ready'
                    delivery_type: 'delivery' | 'pickup'
                    delivery_address: string | null
                    delivery_coordinates: { lat: number; lng: number } | null
                    phone_number: string | null
                    payment_method: 'cash' | 'transfer'
                    utensils_count: number
                    cash_change_from: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    table_location?: string | null
                    comment?: string | null
                    total_amount: number
                    status?: 'new' | 'in_progress' | 'ready'
                    delivery_type?: 'delivery' | 'pickup'
                    delivery_address?: string | null
                    delivery_coordinates?: { lat: number; lng: number } | null
                    phone_number?: string | null
                    payment_method?: 'cash' | 'transfer'
                    utensils_count?: number
                    cash_change_from?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    table_location?: string | null
                    comment?: string | null
                    total_amount?: number
                    status?: 'new' | 'in_progress' | 'ready'
                    delivery_type?: 'delivery' | 'pickup'
                    delivery_address?: string | null
                    delivery_coordinates?: { lat: number; lng: number } | null
                    phone_number?: string | null
                    payment_method?: 'cash' | 'transfer'
                    utensils_count?: number
                    cash_change_from?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            order_items: {
                Row: {
                    id: string
                    order_id: string
                    menu_item_id: string
                    menu_item_name: string
                    quantity: number
                    price: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    order_id: string
                    menu_item_id: string
                    menu_item_name: string
                    quantity: number
                    price: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    order_id?: string
                    menu_item_id?: string
                    menu_item_name?: string
                    quantity?: number
                    price?: number
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

export type User = Database['public']['Tables']['users']['Row']
export type Admin = Database['public']['Tables']['admins']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type MenuItem = Database['public']['Tables']['menu_items']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']

export type OrderStatus = 'new' | 'in_progress' | 'ready'

export interface CartItem {
    menuItem: MenuItem
    quantity: number
}

export interface OrderWithItems extends Order {
    items: OrderItem[]
    user?: User
}
