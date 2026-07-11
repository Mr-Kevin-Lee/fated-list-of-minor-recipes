import { useEffect, useMemo, useState } from 'react';
import type { GroceryListItem, MatchSettings, MenuEntry, Pantry, Recipe, Season } from './types';
import { deleteRecipe, getRecipes, ingredientNamesFromRecipes, saveRecipe } from './lib/recipes';
import { addToPantry, getPantry, savePantry, startNewWeek } from './lib/pantry';
import { getMatchSettings, saveMatchSettings } from './lib/settings';
import {
  addRecipeToMenu,
  clearMenu,
  getMenu,
  removeRecipeFromMenu,
  setRecipeStatus,
} from './lib/menu';
import {
  addIngredientsForRecipe,
  checkOffItem,
  getGroceryList,
  removeRecipeFromGroceryList,
} from './lib/groceryList';
import PantryTab from './components/PantryTab';
import RecipesTab from './components/RecipesTab';
import WeeklyMenuTab from './components/WeeklyMenuTab';
import GroceryListTab from './components/GroceryListTab';

type Tab = 'pantry' | 'recipes' | 'menu' | 'grocery';

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<Tab>('pantry');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [pantry, setPantry] = useState<Pantry>({ updatedAt: '', items: [] });
  const [menu, setMenu] = useState<MenuEntry[]>([]);
  const [groceryList, setGroceryList] = useState<GroceryListItem[]>([]);
  const [settings, setSettings] = useState<MatchSettings>({
    mode: 'total',
    totalThreshold: 2,
    percentageThreshold: 25,
  });
  const [seasonFilter, setSeasonFilter] = useState<Season | 'all'>('all');

  useEffect(() => {
    (async () => {
      const [loadedRecipes, loadedPantry, loadedSettings, loadedMenu, loadedGroceryList] =
        await Promise.all([
          getRecipes(),
          getPantry(),
          getMatchSettings(),
          getMenu(),
          getGroceryList(),
        ]);
      setRecipes(loadedRecipes);
      setPantry(loadedPantry);
      setSettings(loadedSettings);
      setMenu(loadedMenu);
      setGroceryList(loadedGroceryList);
      setLoaded(true);
    })();
  }, []);

  const ingredientSuggestions = useMemo(() => ingredientNamesFromRecipes(recipes), [recipes]);

  async function handleSaveRecipe(recipe: Omit<Recipe, 'id'> & { id?: string }) {
    const saved = await saveRecipe(recipe);
    setRecipes((prev) => {
      const index = prev.findIndex((r) => r.id === saved.id);
      if (index === -1) return [...prev, saved];
      const next = [...prev];
      next[index] = saved;
      return next;
    });
  }

  async function handleDeleteRecipe(id: string) {
    await deleteRecipe(id);
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  }

  async function handlePantryChange(items: string[]) {
    const saved = await savePantry(items);
    setPantry(saved);
  }

  async function handleSettingsChange(next: MatchSettings) {
    setSettings(next);
    await saveMatchSettings(next);
  }

  async function handleAddRecipeToMenu(recipeId: string) {
    setMenu(await addRecipeToMenu(recipeId));
  }

  async function handleRemoveRecipeFromMenu(recipeId: string) {
    setMenu(await removeRecipeFromMenu(recipeId));
    setGroceryList(await removeRecipeFromGroceryList(recipeId));
  }

  async function handleMarkCooked(recipeId: string) {
    setMenu(await setRecipeStatus(recipeId, 'cooked', []));
  }

  async function handleConfirmSkip(recipeId: string, carryoverIngredients: string[]) {
    setMenu(await setRecipeStatus(recipeId, 'skipped', carryoverIngredients));
  }

  async function handleAddIngredientsToGroceryList(recipe: Recipe) {
    setGroceryList(await addIngredientsForRecipe(recipe, pantry.items));
  }

  async function handleCheckOffGroceryItem(itemId: string) {
    const bought = await checkOffItem(itemId);
    if (!bought) return;
    setGroceryList(await getGroceryList());
    setPantry(await addToPantry([bought.name]));
  }

  async function handleStartNewWeek() {
    const carryover = menu
      .filter((entry) => entry.status === 'skipped')
      .flatMap((entry) => entry.carryoverIngredients);
    setPantry(await startNewWeek(carryover));
    setMenu(await clearMenu());
  }

  if (!loaded) {
    return <p className="loading">Loading…</p>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Fated List of Minor Recipes</h1>
        <nav className="tabs">
          <button className={tab === 'pantry' ? 'active' : ''} onClick={() => setTab('pantry')}>
            Pantry
          </button>
          <button className={tab === 'recipes' ? 'active' : ''} onClick={() => setTab('recipes')}>
            Recipes
          </button>
          <button className={tab === 'menu' ? 'active' : ''} onClick={() => setTab('menu')}>
            Weekly Menu
          </button>
          <button className={tab === 'grocery' ? 'active' : ''} onClick={() => setTab('grocery')}>
            Grocery List
          </button>
        </nav>
      </header>

      <main>
        {tab === 'pantry' && (
          <PantryTab
            recipes={recipes}
            pantry={pantry}
            onPantryChange={handlePantryChange}
            seasonFilter={seasonFilter}
            onSeasonFilterChange={setSeasonFilter}
            settings={settings}
            onSettingsChange={handleSettingsChange}
            ingredientSuggestions={ingredientSuggestions}
          />
        )}
        {tab === 'recipes' && (
          <RecipesTab
            recipes={recipes}
            ingredientSuggestions={ingredientSuggestions}
            onSave={handleSaveRecipe}
            onDelete={handleDeleteRecipe}
          />
        )}
        {tab === 'menu' && (
          <WeeklyMenuTab
            recipes={recipes}
            menu={menu}
            onAddRecipe={handleAddRecipeToMenu}
            onRemoveRecipe={handleRemoveRecipeFromMenu}
            onMarkCooked={handleMarkCooked}
            onConfirmSkip={handleConfirmSkip}
            onAddIngredientsToGroceryList={handleAddIngredientsToGroceryList}
            onStartNewWeek={handleStartNewWeek}
          />
        )}
        {tab === 'grocery' && (
          <GroceryListTab
            groceryList={groceryList}
            recipes={recipes}
            onCheckOff={handleCheckOffGroceryItem}
          />
        )}
      </main>
    </div>
  );
}
