// Country list with water-climate recommendation boost (extraMl added to base 35ml/kg)
export interface Country {
  code: string;
  nameTr: string;
  nameEn: string;
  flag: string;
  climateBoostMl: number; // added to daily goal for hot climates
}

export const COUNTRIES: Country[] = [
  { code: 'TR', nameTr: 'Türkiye', nameEn: 'Türkiye', flag: '🇹🇷', climateBoostMl: 200 },
  { code: 'US', nameTr: 'ABD', nameEn: 'United States', flag: '🇺🇸', climateBoostMl: 150 },
  { code: 'DE', nameTr: 'Almanya', nameEn: 'Germany', flag: '🇩🇪', climateBoostMl: 0 },
  { code: 'FR', nameTr: 'Fransa', nameEn: 'France', flag: '🇫🇷', climateBoostMl: 100 },
  { code: 'ES', nameTr: 'İspanya', nameEn: 'Spain', flag: '🇪🇸', climateBoostMl: 200 },
  { code: 'IT', nameTr: 'İtalya', nameEn: 'Italy', flag: '🇮🇹', climateBoostMl: 200 },
  { code: 'GB', nameTr: 'İngiltere', nameEn: 'United Kingdom', flag: '🇬🇧', climateBoostMl: 0 },
  { code: 'NL', nameTr: 'Hollanda', nameEn: 'Netherlands', flag: '🇳🇱', climateBoostMl: 0 },
  { code: 'SE', nameTr: 'İsveç', nameEn: 'Sweden', flag: '🇸🇪', climateBoostMl: -100 },
  { code: 'NO', nameTr: 'Norveç', nameEn: 'Norway', flag: '🇳🇴', climateBoostMl: -100 },
  { code: 'CA', nameTr: 'Kanada', nameEn: 'Canada', flag: '🇨🇦', climateBoostMl: 0 },
  { code: 'AU', nameTr: 'Avustralya', nameEn: 'Australia', flag: '🇦🇺', climateBoostMl: 300 },
  { code: 'JP', nameTr: 'Japonya', nameEn: 'Japan', flag: '🇯🇵', climateBoostMl: 150 },
  { code: 'KR', nameTr: 'G. Kore', nameEn: 'South Korea', flag: '🇰🇷', climateBoostMl: 100 },
  { code: 'CN', nameTr: 'Çin', nameEn: 'China', flag: '🇨🇳', climateBoostMl: 100 },
  { code: 'IN', nameTr: 'Hindistan', nameEn: 'India', flag: '🇮🇳', climateBoostMl: 400 },
  { code: 'BR', nameTr: 'Brezilya', nameEn: 'Brazil', flag: '🇧🇷', climateBoostMl: 300 },
  { code: 'MX', nameTr: 'Meksika', nameEn: 'Mexico', flag: '🇲🇽', climateBoostMl: 300 },
  { code: 'AR', nameTr: 'Arjantin', nameEn: 'Argentina', flag: '🇦🇷', climateBoostMl: 200 },
  { code: 'AE', nameTr: 'BAE', nameEn: 'UAE', flag: '🇦🇪', climateBoostMl: 500 },
  { code: 'SA', nameTr: 'S. Arabistan', nameEn: 'Saudi Arabia', flag: '🇸🇦', climateBoostMl: 500 },
  { code: 'EG', nameTr: 'Mısır', nameEn: 'Egypt', flag: '🇪🇬', climateBoostMl: 400 },
  { code: 'MA', nameTr: 'Fas', nameEn: 'Morocco', flag: '🇲🇦', climateBoostMl: 300 },
  { code: 'ZA', nameTr: 'G. Afrika', nameEn: 'South Africa', flag: '🇿🇦', climateBoostMl: 200 },
  { code: 'RU', nameTr: 'Rusya', nameEn: 'Russia', flag: '🇷🇺', climateBoostMl: 0 },
  { code: 'OTHER', nameTr: 'Diğer', nameEn: 'Other', flag: '🌍', climateBoostMl: 100 },
];

export function findCountry(code?: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}
