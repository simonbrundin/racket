// Goal Entity Interface
// Representerar ett mål i trädstrukturen med stöd för flera föräldrar och barn

export interface Goal {
  id: string;
  title: string;
  image_url?: string;
  icon_url?: string;
  is_completed: boolean;
  parent_ids: string[]; // Array av referenser till föräldermål
  child_ids: string[];  // Array av referenser till barnmål
}