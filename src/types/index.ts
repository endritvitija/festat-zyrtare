export type SingleCountry = 'AL' | 'XK' | 'ME' | 'MK';
export type Country = SingleCountry | 'BOTH';

export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
  country: Country;
  observedDate?: string; // If observed on a different day
}
