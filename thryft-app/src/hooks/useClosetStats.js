import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function useClosetStats() {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    // 🔥 Correct paths based on YOUR Closet.jsx
    const closetRef = collection(db, "users", currentUser.uid, "closet");
    const outfitsRef = collection(db, "users", currentUser.uid, "outfits");

    const unsub1 = onSnapshot(closetRef, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setItems(data);
      setLoading(false);
    });

    const unsub2 = onSnapshot(outfitsRef, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setOutfits(data);
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [currentUser]);

  // Derive categories
  const categories = [...new Set(items.map((i) => i.category))];

  // Favorites
  const favorites = items.filter((i) => i.favorite);

  // Stats returned to ClosetStats.jsx & Home.jsx
  const stats = {
    totalItems: items.length,
    favorites: favorites.length,
    wornThisMonth: 0, // optional future enhancement
    mostUsedCategory: categories[0] || null,
    colorTags: [],
    totalCategories: categories.length,
    totalOutfits: outfits.length,
  };

  return {
    items,
    outfits,
    stats,
    loading,
  };
}
