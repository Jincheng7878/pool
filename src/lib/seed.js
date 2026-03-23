import { getMenu, setMenu } from "./storage.js";

export function ensureSeedData() {
  const menu = getMenu();
  if (menu && menu.length > 0) return;

  setMenu([
    { id: "m1", name: "Coke", price: 2.5, category: "Drinks" },
    { id: "m2", name: "Sprite", price: 2.5, category: "Drinks" },
    { id: "m3", name: "Water", price: 1.5, category: "Drinks" },
    { id: "m4", name: "Chips", price: 2.0, category: "Food" },
    { id: "m5", name: "Hot Dog", price: 4.0, category: "Food" },
  ]);
}
