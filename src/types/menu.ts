export interface Allergen {
  Name: string;
  Value: boolean;
}

export interface MenuItem {
  ID: number;
  Name: string;
  IsVegetarian: boolean;
  IsVegan?: boolean;
  NutritionReady: boolean;
  Allergens: Allergen[];
}

export interface Station {
  Name: string;
  Items: MenuItem[];
}

export interface Meal {
  ID: number;
  Name: string;
  Order: number;
  Status: string;
  Type: string;
  Hours: {
    StartTime: string;
    EndTime: string;
  };
  Stations: Station[];
}

export interface DiningMenu {
  Location: string;
  Date: string;
  IsPublished: boolean;
  Meals: Meal[];
}

export interface Filters {
  avoidMeat: boolean;
  avoidDairy: boolean;
  avoidEggs: boolean;
  avoidOil: boolean;
}
