import type { EntityItem } from "@/components/sea-saw-design/selector/EntitySelector";

export interface Contact extends EntityItem {
  id: string | number;
  name: string;
  email?: string;
  mobile?: string;
  phone?: string;
  title?: string;
}
