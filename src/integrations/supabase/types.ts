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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      armacao_lente: {
        Row: {
          coloracao: string | null
          created_by: string
          diagonal_maior: string | null
          horizontal: string | null
          id: number
          id_os: number
          lente_comprada: string | null
          marca_armacao: string | null
          material_armacao: string | null
          ponte: string | null
          referencia_armacao: string | null
          tratamento: string | null
          vertical: string | null
        }
        Insert: {
          coloracao?: string | null
          created_by?: string
          diagonal_maior?: string | null
          horizontal?: string | null
          id?: number
          id_os: number
          lente_comprada?: string | null
          marca_armacao?: string | null
          material_armacao?: string | null
          ponte?: string | null
          referencia_armacao?: string | null
          tratamento?: string | null
          vertical?: string | null
        }
        Update: {
          coloracao?: string | null
          created_by?: string
          diagonal_maior?: string | null
          horizontal?: string | null
          id?: number
          id_os?: number
          lente_comprada?: string | null
          marca_armacao?: string | null
          material_armacao?: string | null
          ponte?: string | null
          referencia_armacao?: string | null
          tratamento?: string | null
          vertical?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "armacao_lente_id_os_fkey"
            columns: ["id_os"]
            isOneToOne: false
            referencedRelation: "ordem_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      cliente: {
        Row: {
          bairro: string | null
          cidade: string | null
          cpf: string | null
          created_by: string
          data_nascimento: string | null
          endereco: string | null
          id: number
          nome: string
          telefone: string | null
          user_id: string | null
        }
        Insert: {
          bairro?: string | null
          cidade?: string | null
          cpf?: string | null
          created_by?: string
          data_nascimento?: string | null
          endereco?: string | null
          id?: number
          nome: string
          telefone?: string | null
          user_id?: string | null
        }
        Update: {
          bairro?: string | null
          cidade?: string | null
          cpf?: string | null
          created_by?: string
          data_nascimento?: string | null
          endereco?: string | null
          id?: number
          nome?: string
          telefone?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ordem_servico: {
        Row: {
          created_by: string
          data_pedido: string
          id: number
          id_cliente: number
          numero_os: string
          status: string | null
        }
        Insert: {
          created_by?: string
          data_pedido: string
          id?: number
          id_cliente: number
          numero_os: string
          status?: string | null
        }
        Update: {
          created_by?: string
          data_pedido?: string
          id?: number
          id_cliente?: number
          numero_os?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ordem_servico_id_cliente_fkey"
            columns: ["id_cliente"]
            isOneToOne: false
            referencedRelation: "cliente"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamento: {
        Row: {
          created_by: string
          entrada: number | null
          forma_pagamento: string | null
          id: number
          id_os: number
          parcelas: number | null
          status: string | null
          valor_armacao: number | null
          valor_lente: number | null
          valor_parcelas: number | null
          valor_total: number
        }
        Insert: {
          created_by?: string
          entrada?: number | null
          forma_pagamento?: string | null
          id?: number
          id_os: number
          parcelas?: number | null
          status?: string | null
          valor_armacao?: number | null
          valor_lente?: number | null
          valor_parcelas?: number | null
          valor_total: number
        }
        Update: {
          created_by?: string
          entrada?: number | null
          forma_pagamento?: string | null
          id?: number
          id_os?: number
          parcelas?: number | null
          status?: string | null
          valor_armacao?: number | null
          valor_lente?: number | null
          valor_parcelas?: number | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamento_id_os_fkey"
            columns: ["id_os"]
            isOneToOne: false
            referencedRelation: "ordem_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          name: string
          role: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          name: string
          role?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          name?: string
          role?: string | null
          user_id?: string
        }
        Relationships: []
      }
      receita: {
        Row: {
          adicao_od: number | null
          adicao_oe: number | null
          altura_od: number | null
          altura_oe: number | null
          cilindrico_longe_od: number | null
          cilindrico_longe_oe: number | null
          cilindrico_perto_od: number | null
          cilindrico_perto_oe: number | null
          created_by: string
          dnp_longe_od: number | null
          dnp_longe_oe: number | null
          eixo_longe_od: number | null
          eixo_longe_oe: number | null
          eixo_perto_od: number | null
          eixo_perto_oe: number | null
          esferico_longe_od: number | null
          esferico_longe_oe: number | null
          esferico_perto_od: number | null
          esferico_perto_oe: number | null
          id: number
          id_os: number
        }
        Insert: {
          adicao_od?: number | null
          adicao_oe?: number | null
          altura_od?: number | null
          altura_oe?: number | null
          cilindrico_longe_od?: number | null
          cilindrico_longe_oe?: number | null
          cilindrico_perto_od?: number | null
          cilindrico_perto_oe?: number | null
          created_by?: string
          dnp_longe_od?: number | null
          dnp_longe_oe?: number | null
          eixo_longe_od?: number | null
          eixo_longe_oe?: number | null
          eixo_perto_od?: number | null
          eixo_perto_oe?: number | null
          esferico_longe_od?: number | null
          esferico_longe_oe?: number | null
          esferico_perto_od?: number | null
          esferico_perto_oe?: number | null
          id?: number
          id_os: number
        }
        Update: {
          adicao_od?: number | null
          adicao_oe?: number | null
          altura_od?: number | null
          altura_oe?: number | null
          cilindrico_longe_od?: number | null
          cilindrico_longe_oe?: number | null
          cilindrico_perto_od?: number | null
          cilindrico_perto_oe?: number | null
          created_by?: string
          dnp_longe_od?: number | null
          dnp_longe_oe?: number | null
          eixo_longe_od?: number | null
          eixo_longe_oe?: number | null
          eixo_perto_od?: number | null
          eixo_perto_oe?: number | null
          esferico_longe_od?: number | null
          esferico_longe_oe?: number | null
          esferico_perto_od?: number | null
          esferico_perto_oe?: number | null
          id?: number
          id_os?: number
        }
        Relationships: [
          {
            foreignKeyName: "receita_id_os_fkey"
            columns: ["id_os"]
            isOneToOne: false
            referencedRelation: "ordem_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          criado_em: string | null
          email: string
          id: string
          nome: string
          senha: string
        }
        Insert: {
          criado_em?: string | null
          email: string
          id?: string
          nome: string
          senha: string
        }
        Update: {
          criado_em?: string | null
          email?: string
          id?: string
          nome?: string
          senha?: string
        }
        Relationships: []
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
