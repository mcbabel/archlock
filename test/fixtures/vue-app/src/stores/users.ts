import { reactive } from "vue";

export interface User {
  id: string;
  name: string;
}

export function useUsers(): User[] {
  return reactive([{ id: "1", name: "Ada" }]);
}
