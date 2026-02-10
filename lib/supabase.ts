import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Regulation {
    id: string
    code: string
    name: string
    category: string
    description?: string
    placement_rules: Record<string, any>
    quantity_formula?: string
    specifications: Record<string, any>
    created_at: string
}

export interface Session {
    id: string
    file_name: string
    file_url?: string
    status: 'processing' | 'completed' | 'failed'
    floor_data?: Record<string, any>
    total_area?: number
    created_at: string
    completed_at?: string
}

export interface DetectedElement {
    id: string
    session_id: string
    element_type: string
    confidence?: number
    bbox?: Record<string, any>
    metadata?: Record<string, any>
    created_at: string
}

export interface Requirement {
    id: string
    session_id: string
    regulation_id?: string
    signage_type: string
    quantity: number
    locations?: Record<string, any>[]
    specifications?: Record<string, any>
    priority: 'low' | 'medium' | 'high' | 'critical'
    created_at: string
}
