import type { GroceryListItem, Recipe } from '../types';

interface GroceryListTabProps {
  groceryList: GroceryListItem[];
  recipes: Recipe[];
  onCheckOff: (itemId: string) => void;
}

export default function GroceryListTab({ groceryList, recipes, onCheckOff }: GroceryListTabProps) {
  const recipeNameById = new Map(recipes.map((r) => [r.id, r.name]));

  return (
    <div className="grocery-list-tab">
      {groceryList.length === 0 && (
        <p className="empty-state">
          Nothing on the list. Add recipes to the Weekly Menu, then "add ingredients to grocery
          list" from there.
        </p>
      )}
      <ul className="grocery-list">
        {groceryList.map((item) => (
          <li key={item.id} className="grocery-list-item">
            <label className="checkbox-label">
              <input type="checkbox" onChange={() => onCheckOff(item.id)} />
              <span>
                {item.name}
                <span className="grocery-item-recipes">
                  {' '}
                  for {item.recipeIds.map((id) => recipeNameById.get(id) ?? 'unknown recipe').join(', ')}
                </span>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
