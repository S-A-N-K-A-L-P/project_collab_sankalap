export const taskService = {
  getAll: async () => [],
  getById: async (id: string) => ({ id }),
  updateStatus: async (id: string, status: string) => ({ id, status }),
};
