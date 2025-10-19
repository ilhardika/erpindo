export type Database = {
  public: {
    Tables: Record<
      string,
      {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
      }
    >
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Tables<T extends string> = Record<string, unknown>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type TablesInsert<T extends string> = Record<string, unknown>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type TablesUpdate<T extends string> = Record<string, unknown>
