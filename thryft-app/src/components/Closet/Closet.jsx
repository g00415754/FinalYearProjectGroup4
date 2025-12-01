import React, { useState, useEffect, useMemo } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "../../styles/Closet.css";

import { db, storage } from "../../firebase";
import useClosetStats from "../../hooks/useClosetStats";

import { detectDominantColorFromURL } from "./ColorDetection";
import inferSeasonFromData from "./SeasonalSorter";
import AddItemModal from "./AddItemModal";

// Firebase
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc,
  writeBatch,
  Timestamp
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";

import { useAuth } from "../../context/AuthContext";

// Icons
import {
  Shirt,
  Inbox,
  ShoppingBag,
  Gem,
  Star,
  Layers,
  Trash,
} from "lucide-react";

// Components
import CategoryBar from "./CategoryBar";
import ClosetStats from "./ClosetStats";
import ItemCard from "./ItemCard";

// ---------------------------------------------------------
// CATEGORY + TAG CONSTANTS
// ---------------------------------------------------------

const TAG_OPTIONS = [
  "Casual",
  "Formal",
  "Summer",
  "Winter",
  "Travel",
  "Sporty",
  "Night Out",
  "Comfy",
];

const COLOR_SWATCHES = [
  "#FFB7C5",
  "#C4B5FD",
  "#A5F3FC",
  "#FDE68A",
  "#D1FAE5",
  "#FBCFE8",
  "#E5E7EB",
];

// Helper for Lucide icons inside categories
const getLucideIcon = (name, size = 16) => {
  const icons = {
    Shirt: <Shirt size={size} />,
    Inbox: <Inbox size={size} />,
    ShoppingBag: <ShoppingBag size={size} />,
    Gem: <Gem size={size} />,
    Layers: <Layers size={size} />,
  };
  return icons[name] || null;
};

// ---------------------------------------------------------
// MAIN CLOSET COMPONENT
// ---------------------------------------------------------

export default function Closet() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Unified data source
  const { items, outfits, stats, loading } = useClosetStats();

  // Local UI states
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortMode, setSortMode] = useState("Newest");
  const [tagFilter, setTagFilter] = useState("All");
  const [seasonFilter, setSeasonFilter] = useState("All");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Outfit editing
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [newTagValue, setNewTagValue] = useState("");

  // Category modals
  const [customCategories, setCustomCategories] = useState([]);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState(COLOR_SWATCHES[0]);
  const [newCategoryIconType, setNewCategoryIconType] = useState("emoji");
  const [emojiInput, setEmojiInput] = useState("");
  const [selectedLucideIcon, setSelectedLucideIcon] = useState("");

  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [reassignTargetCategory, setReassignTargetCategory] = useState("");

  // ---------------------------------------------------------
  // FETCH CUSTOM CATEGORIES ONLY
  // ---------------------------------------------------------

  useEffect(() => {
    if (!currentUser) return;

    return onSnapshot(
      collection(db, "users", currentUser.uid, "customCategories"),
      (snapshot) => {
        setCustomCategories(
          snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
        );
      }
    );
  }, [currentUser]);

  // ---------------------------------------------------------
  // CATEGORY SYSTEM
  // ---------------------------------------------------------

  const BASE_CATEGORIES = [
    { name: "All", icon: <Layers size={16} /> },
    { name: "Tops", icon: <Shirt size={16} /> },
    { name: "Bottoms", icon: <Inbox size={16} /> },
    { name: "Shoes", icon: <ShoppingBag size={16} /> },
    { name: "Accessories", icon: <Gem size={16} /> },
  ];

  const SPECIAL_CATEGORY = {
    name: "Saved Outfits",
    icon: <Star size={16} className="text-yellow-500" />,
  };

  const mergedCategories = [
    ...BASE_CATEGORIES,
    ...customCategories
      .map((cat) => ({
        name: cat.name,
        color: cat.color,
        iconType: cat.iconType,
        icon:
          cat.iconType === "emoji"
            ? cat.icon
            : getLucideIcon(cat.icon),
        id: cat.id,
        isCustom: true,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  ];

  const categories = [...mergedCategories, SPECIAL_CATEGORY];

  const showingOutfits = activeCategory === "Saved Outfits";

  // ---------------------------------------------------------
  // FILTERED ITEMS
  // ---------------------------------------------------------

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        activeCategory === "All" || item.category === activeCategory;

      const matchesFavorite = !showFavoritesOnly || item.favorite;

      const matchesSeason =
        seasonFilter === "All" || item.seasonTag === seasonFilter;

      return matchesSearch && matchesCategory && matchesFavorite && matchesSeason;
    });
  }, [items, search, activeCategory, showFavoritesOnly, seasonFilter]);

  // ---------------------------------------------------------
  // FILTERED OUTFITS
  // ---------------------------------------------------------

  let filteredOutfits = outfits.map((outfit) => {
    const previewItems = items.filter((i) => outfit.items?.includes(i.id));
    return { ...outfit, previewItems };
  });

  if (tagFilter !== "All") {
    filteredOutfits = filteredOutfits.filter((o) =>
      o.tags?.includes(tagFilter)
    );
  }

  filteredOutfits.sort((a, b) => {
    if (sortMode === "Newest")
      return b.createdAt?.toDate() - a.createdAt?.toDate();
    if (sortMode === "Oldest")
      return a.createdAt?.toDate() - b.createdAt?.toDate();
    if (sortMode === "A-Z") return (a.name || "").localeCompare(b.name || "");
    if (sortMode === "Z-A") return (b.name || "").localeCompare(a.name || "");
    return 0;
  });

  // ---------------------------------------------------------
  // RECENTLY WORN
  // ---------------------------------------------------------

  const recentlyWornItems = useMemo(() => {
    return items
      .filter((i) => i.lastWorn)
      .sort((a, b) => b.lastWorn?.toMillis?.() - a.lastWorn?.toMillis?.())
      .slice(0, 10);
  }, [items]);

  // ---------------------------------------------------------
  // FIRESTORE ACTIONS
  // ---------------------------------------------------------

  const handleDeleteItem = async (item) => {
    if (!currentUser) return;

    await deleteDoc(
      doc(db, "users", currentUser.uid, "closet", item.id)
    );

    if (item.image) {
      try {
        await deleteObject(ref(storage, item.image));
      } catch (err) {
        console.warn("Image missing:", err);
      }
    }
  };

  const toggleFavorite = async (item) => {
    if (!currentUser) return;
    const refDoc = doc(db, "users", currentUser.uid, "closet", item.id);
    await updateDoc(refDoc, { favorite: !item.favorite });
  };

  const markItemWorn = async (item) => {
    if (!currentUser) return;
    const refDoc = doc(db, "users", currentUser.uid, "closet", item.id);
    await updateDoc(refDoc, {
      timesWorn: (item.timesWorn || 0) + 1,
      lastWorn: Timestamp.now(),
    });
  };

  const requestDeleteCategory = (cat) => {
    setCategoryToDelete(cat);
    setShowDeleteCategoryModal(true);
  };

  // ---------------------------------------------------------
  // CATEGORY MODALS (unchanged from your version)
  // ---------------------------------------------------------

  const AddCategoryModalComponent = () => (
    <Modal
      show={showAddCategoryModal}
      onHide={() => setShowAddCategoryModal(false)}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>New Category</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Name */}
        <div className="mb-3">
          <label className="font-semibold">Category Name</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="e.g., Dresses"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
        </div>

        {/* Icon */}
        <div className="mb-3">
          <label className="font-semibold block mb-2">Icon Type</label>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={newCategoryIconType === "emoji"}
                onChange={() => setNewCategoryIconType("emoji")}
              />
              Emoji
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={newCategoryIconType === "lucide"}
                onChange={() => setNewCategoryIconType("lucide")}
              />
              Icon
            </label>
          </div>
        </div>

        {newCategoryIconType === "emoji" && (
          <div className="mb-3">
            <label className="font-semibold block mb-1">Emoji</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg text-2xl"
              placeholder="Tap to enter emoji"
              value={emojiInput}
              onChange={(e) => setEmojiInput(e.target.value)}
            />
          </div>
        )}

        {newCategoryIconType === "lucide" && (
          <div className="mb-3">
            <label className="font-semibold block mb-1">Select Icon</label>
            <div className="grid grid-cols-4 gap-2">
              {["Shirt", "Inbox", "ShoppingBag", "Gem", "Layers"].map((icon) => (
                <button
                  key={icon}
                  className="border rounded-lg p-2"
                  onClick={() => setSelectedLucideIcon(icon)}
                >
                  {getLucideIcon(icon)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Color */}
        <div className="mb-3">
          <label className="font-semibold block mb-1">Color</label>

          <div className="flex flex-wrap gap-2">
            {COLOR_SWATCHES.map((c) => (
              <button
                key={c}
                onClick={() => setNewCategoryColor(c)}
                className={`w-8 h-8 rounded-full border ${
                  newCategoryColor === c ? "border-black" : ""
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowAddCategoryModal(false)}>
          Cancel
        </Button>

        <Button
          variant="success"
          disabled={
            !newCategoryName.trim() ||
            (newCategoryIconType === "emoji" && !emojiInput.trim()) ||
            (newCategoryIconType === "lucide" && !selectedLucideIcon)
          }
          onClick={async () => {
            const icon =
              newCategoryIconType === "emoji" ? emojiInput : selectedLucideIcon;

            await addDoc(
              collection(db, "users", currentUser.uid, "customCategories"),
              {
                name: newCategoryName,
                color: newCategoryColor,
                iconType: newCategoryIconType,
                icon,
              }
            );

            setNewCategoryName("");
            setEmojiInput("");
            setSelectedLucideIcon("");
            setNewCategoryIconType("emoji");
            setShowAddCategoryModal(false);
          }}
        >
          Add Category
        </Button>
      </Modal.Footer>
    </Modal>
  );

  // Delete category modal
  const DeleteCategoryModalComponent = () => (
    <Modal
      show={showDeleteCategoryModal}
      onHide={() => setShowDeleteCategoryModal(false)}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Delete Category</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>
          Removing <strong>{categoryToDelete?.name}</strong>. Items inside will
          need reassignment.
        </p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowDeleteCategoryModal(false)}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            setShowDeleteCategoryModal(false);
            setShowReassignModal(true);
          }}
        >
          Continue
        </Button>
      </Modal.Footer>
    </Modal>
  );

  const ReassignModalComponent = () => (
    <Modal
      show={showReassignModal}
      onHide={() => setShowReassignModal(false)}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Reassign Items</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="mb-2">
          Items from <strong>{categoryToDelete?.name}</strong> will be moved to:
        </p>

        <Form.Select
          value={reassignTargetCategory}
          onChange={(e) => setReassignTargetCategory(e.target.value)}
        >
          <option value="">Select category</option>
          {categories
            .filter((c) => c.name !== "Saved Outfits" && c.name !== categoryToDelete?.name)
            .map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
        </Form.Select>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowReassignModal(false)}>
          Cancel
        </Button>

        <Button
          variant="danger"
          disabled={!reassignTargetCategory}
          onClick={async () => {
            const batch = writeBatch(db);

            items.forEach((item) => {
              if (item.category === categoryToDelete.name) {
                const refDoc = doc(
                  db,
                  "users",
                  currentUser.uid,
                  "closet",
                  item.id
                );
                batch.update(refDoc, {
                  category: reassignTargetCategory,
                });
              }
            });

            const catRef = doc(
              db,
              "users",
              currentUser.uid,
              "customCategories",
              categoryToDelete.id
            );

            batch.delete(catRef);
            await batch.commit();

            setShowReassignModal(false);
            setCategoryToDelete(null);
          }}
        >
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );

  // ---------------------------------------------------------
  // RETURN — FULL UI
  // ---------------------------------------------------------

  return (
    <>
      <div className="closet-page pb-32">

        <h1 className="closet-title text-3xl font-bold px-4 pt-6 text-gray-900">
          My Closet
        </h1>
        <p className="closet-subtitle px-4 mb-3">
          Curate your wardrobe like a magazine spread.
        </p>

        {/* BUILD OUTFIT BUTTON */}
        <button
          onClick={() => navigate("/outfits")}
          className="ml-4 px-4 py-2 bg-thryftGreen text-white rounded-lg shadow hover:scale-105 transition"
        >
          Build an Outfit
        </button>

        {/* STATS */}
        <ClosetStats stats={stats} />

        {/* SEARCH */}
        {!showingOutfits && (
          <div className="px-4 mt-4">
            <input
              type="text"
              placeholder="Search items..."
              className="w-full px-4 py-2 rounded-lg border shadow-sm focus:ring-2 focus:ring-thryftGreen"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}

        <div className="section-divider">Categories</div>

        {/* CATEGORY BAR */}
        <CategoryBar
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          showFavoritesOnly={showFavoritesOnly}
          setShowFavoritesOnly={setShowFavoritesOnly}
          seasonFilter={seasonFilter}
          setSeasonFilter={setSeasonFilter}
          onAddCategory={() => setShowAddCategoryModal(true)}
          onRequestDeleteCategory={requestDeleteCategory}
        />

        {/* SAVED OUTFITS */}
        {showingOutfits && (
          <>
            <div className="px-4 mb-4 flex justify-between items-center">
              <div>
                <label className="font-semibold mr-2">Sort:</label>
                <select
                  className="border px-2 py-1 rounded"
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value)}
                >
                  <option>Newest</option>
                  <option>Oldest</option>
                  <option>A-Z</option>
                  <option>Z-A</option>
                </select>
              </div>

              <div>
                <label className="font-semibold mr-2">Tag:</label>
                <select
                  className="border px-2 py-1 rounded"
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                >
                  <option>All</option>
                  {TAG_OPTIONS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="section-divider">Saved Looks</div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 px-4">
              {filteredOutfits.map((outfit) => (
                <motion.div
                  key={outfit.id}
                  layout
                  onClick={() => {
                    setSelectedOutfit(outfit);
                    setRenameValue(outfit.name || "");
                  }}
                  className="closet-outfit-card editorial-card bg-white rounded-xl shadow-md p-2 cursor-pointer hover:scale-[1.02] transition"
                >
                  {/* Outfit Preview */}
                  <div className="rounded-lg overflow-hidden h-[180px] grid grid-rows-2 grid-cols-2 gap-1">
                    <img
                      src={outfit.previewItems[0]?.image}
                      className="col-span-2 row-span-1 object-cover w-full h-full"
                    />
                    <img
                      src={outfit.previewItems[1]?.image}
                      className="object-cover w-full h-full"
                    />
                    <div className="relative">
                      <img
                        src={outfit.previewItems[2]?.image}
                        className="object-cover w-full h-full"
                      />
                      {outfit.previewItems.length > 3 && (
                        <div className="absolute inset-0 bg-black/50 text-white flex items-center justify-center text-sm font-semibold rounded">
                          +{outfit.previewItems.length - 3}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Name */}
                  <p className="text-center mt-2 font-medium">
                    {outfit.name || "Untitled Outfit"}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap justify-center gap-1 mt-1">
                    {outfit.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-gray-200 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* RECENTLY WORN */}
        {!showingOutfits && recentlyWornItems.length > 0 && (
          <>
            <div className="section-divider">Recently Worn</div>

            <div className="px-4 mb-3 overflow-x-auto scrollbar-hide">
              <div className="flex gap-3">
                {recentlyWornItems.map((item) => (
                  <div
                    key={item.id}
                    className="min-w-[120px] flex-shrink-0 editorial-card polaroid"
                  >
                    <img
                      src={item.image}
                      className="w-full h-[90px] object-cover rounded-lg"
                    />
                    <div className="polaroid-label text-xs mt-1">
                      {item.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* WARDROBE */}
        {!showingOutfits && (
          <>
            <div className="section-divider">Your Wardrobe</div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 px-4">
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onImageClick={() => setSelectedItem(item)}
                  onDelete={() => handleDeleteItem(item)}
                  onToggleFavorite={() => toggleFavorite(item)}
                  onMarkWorn={() => markItemWorn(item)}
                />
              ))}
            </div>
          </>
        )}

        {/* ADD ITEM BUTTON */}
        {!showingOutfits && (
          <button
            type="button"
            onClick={() => setShowAddItemModal(true)}
            className="fixed bottom-[120px] right-6 bg-thryftGreen text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-4xl hover:scale-110 transition z-[9999]"
          >
            +
          </button>
        )}

        {/* BACK TO TOP */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-[120px] left-6 bg-gray-800 text-white w-12 h-12 rounded-full shadow-xl flex items-center justify-center text-xl hover:scale-110 transition z-[9999]"
        >
          ↑
        </button>
      </div>

      {/* OUTFIT DETAIL MODAL */}
      {selectedOutfit && (
        <Modal show centered size="lg" onHide={() => setSelectedOutfit(null)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Outfit</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {/* Rename */}
            <div className="mb-3">
              <label className="font-semibold">Outfit Name</label>
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="w-full border rounded px-3 py-2 mt-1"
              />
              <button
                className="mt-2 px-4 py-1 bg-thryftGreen text-white rounded"
                onClick={async () => {
                  await updateDoc(
                    doc(db, "users", currentUser.uid, "outfits", selectedOutfit.id),
                    { name: renameValue }
                  );
                }}
              >
                Save
              </button>
            </div>

            {/* Tags */}
            <div className="mb-3">
              <label className="font-semibold">Tags</label>

              <div className="flex flex-wrap gap-2 mt-2">
                {selectedOutfit.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-200 rounded-full text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button
                      onClick={async () => {
                        const updated = selectedOutfit.tags.filter((t) => t !== tag);
                        await updateDoc(
                          doc(db, "users", currentUser.uid, "outfits", selectedOutfit.id),
                          { tags: updated }
                        );
                      }}
                    >
                      <Trash size={14} />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Tag */}
              <div className="flex gap-2 mt-3">
                <input
                  value={newTagValue}
                  onChange={(e) => setNewTagValue(e.target.value)}
                  className="border rounded px-3 py-1 flex-1"
                  placeholder="Add tag..."
                />
                <button
                  className="bg-thryftGreen text-white px-4 rounded"
                  onClick={async () => {
                    if (!newTagValue.trim()) return;
                    const updated = [...(selectedOutfit.tags || []), newTagValue];
                    await updateDoc(
                      doc(db, "users", currentUser.uid, "outfits", selectedOutfit.id),
                      { tags: updated }
                    );
                    setNewTagValue("");
                  }}
                >
                  Add
                </button>
              </div>
            </div>

            {/* Delete outfit */}
            <button
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
              onClick={async () => {
                await deleteDoc(
                  doc(db, "users", currentUser.uid, "outfits", selectedOutfit.id)
                );
                setSelectedOutfit(null);
              }}
            >
              Delete Outfit
            </button>
          </Modal.Body>
        </Modal>
      )}

      {/* CATEGORY MODALS */}
      <AddCategoryModalComponent />
      <DeleteCategoryModalComponent />
      <ReassignModalComponent />

      {/* ADD ITEM MODAL */}
      <AddItemModal
        show={showAddItemModal}
        onHide={() => setShowAddItemModal(false)}
        currentUser={currentUser}
        customCategories={customCategories}
      />
    </>
  );
}
