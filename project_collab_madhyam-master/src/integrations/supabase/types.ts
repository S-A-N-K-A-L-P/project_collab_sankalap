export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T];

export interface Database {
  public: {
    Enums: {
      app_role: "admin" | "head" | "member" | "user";
    };
  };
}
