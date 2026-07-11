import localforage from 'localforage';

export const store = localforage.createInstance({
  name: 'fated-list',
  storeName: 'data',
});

export const KEYS = {
  recipes: 'recipes',
  pantry: 'pantry',
  matchSettings: 'matchSettings',
  weeklyMenu: 'weeklyMenu',
  groceryList: 'groceryList',
} as const;
