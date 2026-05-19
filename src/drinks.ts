import { DrinkType } from './types';

export interface DrinkSubtype {
  id: string;
  type: DrinkType;
  labelKey: string; // i18n key
  hydration: number; // 0..1 effective hydration coefficient
  icon: string; // lucide icon name
  color: string;
  emoji: string;
  defaultMl: number;
}

// 32 drink types with realistic hydration coefficients (scientific values)
export const DRINKS: DrinkSubtype[] = [
  // Water
  { id: 'water_plain', type: 'water', labelKey: 'd_water', hydration: 1.0, icon: 'Droplet', color: '#00E5FF', emoji: '💧', defaultMl: 250 },
  { id: 'water_sparkling', type: 'water', labelKey: 'd_sparkling', hydration: 1.0, icon: 'Sparkles', color: '#00B8FF', emoji: '🫧', defaultMl: 250 },
  { id: 'water_coconut', type: 'water', labelKey: 'd_coconut', hydration: 1.0, icon: 'Leaf', color: '#A3E635', emoji: '🥥', defaultMl: 200 },
  { id: 'water_lemon', type: 'water', labelKey: 'd_lemon_water', hydration: 1.0, icon: 'Citrus', color: '#FACC15', emoji: '🍋', defaultMl: 250 },
  // Tea
  { id: 'tea_black', type: 'tea', labelKey: 'd_black_tea', hydration: 0.9, icon: 'CupSoda', color: '#92400E', emoji: '🫖', defaultMl: 200 },
  { id: 'tea_green', type: 'tea', labelKey: 'd_green_tea', hydration: 0.95, icon: 'Leaf', color: '#16A34A', emoji: '🍵', defaultMl: 200 },
  { id: 'tea_herbal', type: 'tea', labelKey: 'd_herbal_tea', hydration: 1.0, icon: 'Flower', color: '#EC4899', emoji: '🌿', defaultMl: 200 },
  { id: 'tea_chamomile', type: 'tea', labelKey: 'd_chamomile', hydration: 1.0, icon: 'Flower2', color: '#FCD34D', emoji: '🌼', defaultMl: 200 },
  { id: 'tea_mint', type: 'tea', labelKey: 'd_mint_tea', hydration: 1.0, icon: 'Leaf', color: '#22C55E', emoji: '🌱', defaultMl: 200 },
  { id: 'tea_white', type: 'tea', labelKey: 'd_white_tea', hydration: 0.95, icon: 'CupSoda', color: '#E5E7EB', emoji: '🍵', defaultMl: 200 },
  // Coffee
  { id: 'coffee_espresso', type: 'coffee', labelKey: 'd_espresso', hydration: 0.5, icon: 'Coffee', color: '#451A03', emoji: '☕', defaultMl: 30 },
  { id: 'coffee_americano', type: 'coffee', labelKey: 'd_americano', hydration: 0.6, icon: 'Coffee', color: '#78350F', emoji: '☕', defaultMl: 180 },
  { id: 'coffee_latte', type: 'coffee', labelKey: 'd_latte', hydration: 0.75, icon: 'Coffee', color: '#C68F65', emoji: '☕', defaultMl: 240 },
  { id: 'coffee_cappuccino', type: 'coffee', labelKey: 'd_cappuccino', hydration: 0.75, icon: 'Coffee', color: '#A16207', emoji: '☕', defaultMl: 180 },
  { id: 'coffee_filter', type: 'coffee', labelKey: 'd_filter_coffee', hydration: 0.6, icon: 'Coffee', color: '#6B4423', emoji: '☕', defaultMl: 250 },
  { id: 'coffee_cold_brew', type: 'coffee', labelKey: 'd_cold_brew', hydration: 0.7, icon: 'Coffee', color: '#1C1917', emoji: '🧋', defaultMl: 350 },
  // Juice & smoothies
  { id: 'juice_orange', type: 'juice', labelKey: 'd_orange_juice', hydration: 0.85, icon: 'Citrus', color: '#F97316', emoji: '🍊', defaultMl: 250 },
  { id: 'juice_apple', type: 'juice', labelKey: 'd_apple_juice', hydration: 0.85, icon: 'Apple', color: '#84CC16', emoji: '🍎', defaultMl: 250 },
  { id: 'juice_grape', type: 'juice', labelKey: 'd_grape_juice', hydration: 0.85, icon: 'Grape', color: '#7C3AED', emoji: '🍇', defaultMl: 250 },
  { id: 'juice_lemon', type: 'juice', labelKey: 'd_lemonade', hydration: 0.9, icon: 'Citrus', color: '#FACC15', emoji: '🍋', defaultMl: 250 },
  { id: 'juice_smoothie', type: 'juice', labelKey: 'd_smoothie', hydration: 0.85, icon: 'Cherry', color: '#EC4899', emoji: '🥤', defaultMl: 300 },
  // Dairy
  { id: 'milk', type: 'custom', labelKey: 'd_milk', hydration: 0.85, icon: 'Milk', color: '#F3F4F6', emoji: '🥛', defaultMl: 250 },
  { id: 'almond_milk', type: 'custom', labelKey: 'd_almond_milk', hydration: 0.9, icon: 'Milk', color: '#E5D5C8', emoji: '🥛', defaultMl: 250 },
  { id: 'oat_milk', type: 'custom', labelKey: 'd_oat_milk', hydration: 0.9, icon: 'Milk', color: '#F5E6D3', emoji: '🥛', defaultMl: 250 },
  { id: 'yogurt_drink', type: 'custom', labelKey: 'd_ayran', hydration: 0.85, icon: 'CupSoda', color: '#FFFFFF', emoji: '🥛', defaultMl: 250 },
  { id: 'kefir', type: 'custom', labelKey: 'd_kefir', hydration: 0.85, icon: 'CupSoda', color: '#F9FAFB', emoji: '🥛', defaultMl: 200 },
  // Soda & energy (low/negative impact)
  { id: 'cola', type: 'custom', labelKey: 'd_cola', hydration: 0.6, icon: 'CupSoda', color: '#1F2937', emoji: '🥤', defaultMl: 330 },
  { id: 'energy', type: 'custom', labelKey: 'd_energy', hydration: 0.4, icon: 'Zap', color: '#EF4444', emoji: '⚡', defaultMl: 250 },
  { id: 'sports', type: 'custom', labelKey: 'd_sports_drink', hydration: 0.9, icon: 'Dumbbell', color: '#F59E0B', emoji: '💪', defaultMl: 500 },
  // Other
  { id: 'kombucha', type: 'custom', labelKey: 'd_kombucha', hydration: 0.85, icon: 'Sprout', color: '#A16207', emoji: '🫙', defaultMl: 250 },
  { id: 'broth', type: 'custom', labelKey: 'd_broth', hydration: 0.95, icon: 'Soup', color: '#EAB308', emoji: '🍲', defaultMl: 250 },
  { id: 'alcohol', type: 'custom', labelKey: 'd_alcohol', hydration: -0.5, icon: 'Wine', color: '#9F1239', emoji: '🍷', defaultMl: 150 },
];

export function getDrinkById(id: string): DrinkSubtype | undefined {
  return DRINKS.find((d) => d.id === id);
}
