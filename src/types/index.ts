export type Country = 'AL' | 'XK' | 'ME' | 'MK' | 'BOTH';

export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
  country: Country;
  observedDate?: string; // If observed on a different day
}
