import React, { useState, useEffect } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { motion } from "framer-motion";
import { db, storage } from "../../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

import { Shirt, Inbox, ShoppingBag, Gem, FolderPlus, Star } from "lucide-react";

const TAG_OPTIONS = [
  "Streetwear",
  "Minimalist",
  "Cozy",
  "Chic",
  "Y2K",
  "Sporty",
  "Dark Academia",
  "Festival",
  "Work",
  "Boho",
  "Edgy",
  "Preppy",
];

export default function Closet() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // UI states
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const [sortMode, setSortMode] = useState("Newest");
  const [tagFilter, setTagFilter] = useState("All");

  const [showCategoryModal, setShowCategoryModal] = useState(false);


  // NEW: custom categories
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [dynamicCategories, setDynamicCategories] = useState([]);

  // BASE categories
  // Base categories (except Saved Outfits, which we will place manually at end)
  const baseCategories = [
    "All",
    "Tops",
    "Bottoms",
    "Shoes",
    "Accessories",
  ];

  // Always pinned at the end
  const SPECIAL_CATEGORY = "Saved Outfits";

  // Merge base + dynamic (custom) categories
  let merged = [...baseCategories, ...dynamicCategories];

  // Sort alphabetically BUT keep "All" at the top
  merged = merged
    .filter(cat => cat !== "All")
    .sort((a, b) => a.localeCompare(b));

  merged = ["All", ...merged];

  // Add "Saved Outfits" at the very END
  const categories = [...merged, SPECIAL_CATEGORY];


  const categoryIcons = {
    All: <FolderPlus size={16} />,
    Tops: <Shirt size={16} />,
    Bottoms: <Inbox size={16} />,
    Shoes: <ShoppingBag size={16} />,
    Accessories: <Gem size={16} />,
    "Saved Outfits": <Star size={16} className="text-yellow-500" />,
  };

  // Firestore data
  const [items, setItems] = useState([]);
  const [outfits, setOutfits] = useState([]);

  // Add Item form
  const [newItem, setNewItem] = useState({
    name: "",
    category: "Tops",
    image: null,
  });

  // Fetch closet items
  useEffect(() => {
    if (!currentUser) return;

    return onSnapshot(
      collection(db, "users", currentUser.uid, "closet"),
      (snapshot) => {
        setItems(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );
  }, [currentUser]);

  // Fetch outfits
  useEffect(() => {
    if (!currentUser) return;

    return onSnapshot(
      collection(db, "users", currentUser.uid, "outfits"),
      (snapshot) => {
        setOutfits(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );
  }, [currentUser]);

  // Add item
  const handleAddItem = async () => {
    if (!newItem.name || !newItem.image) return;

    const imgRef = ref(
      storage,
      `users/${currentUser.uid}/closet/${Date.now()}_${newItem.image.name}`
    );

    await uploadBytes(imgRef, newItem.image);
    const url = await getDownloadURL(imgRef);

    await addDoc(collection(db, "users", currentUser.uid, "closet"), {
      name: newItem.name,
      category: newItem.category,
      image: url,
    });

    setNewItem({ name: "", category: "Tops", image: null });
    setShowModal(false);
  };

  // Delete item
  const handleDelete = async (item) => {
    await deleteDoc(doc(db, "users", currentUser.uid, "closet", item.id));
    await deleteObject(ref(storage, item.image));
  };

  // Delete outfit
  const handleDeleteOutfit = async (outfit) => {
    await deleteDoc(doc(db, "users", currentUser.uid, "outfits", outfit.id));
    setSelectedOutfit(null);
  };

  // Rename outfit
  const handleRenameOutfit = async () => {
    if (!renameValue.trim() || !selectedOutfit) return;

    await updateDoc(
      doc(db, "users", currentUser.uid, "outfits", selectedOutfit.id),
      { name: renameValue.trim() }
    );

    setSelectedOutfit({ ...selectedOutfit, name: renameValue.trim() });
  };

  // NEW: Add Custom Category
  const handleAddCustomCategory = () => {
    const newCat = customCategoryInput.trim();
    if (!newCat) return;

    if (categories.includes(newCat)) {
      alert("This category already exists.");
      return;
    }

    setDynamicCategories((prev) => [...prev, newCat]);
    setCustomCategoryInput("");
  };

  // FILTER ITEMS
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || item.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  // FILTER + PREVIEW OUTFITS
  let filteredOutfits = outfits.map((outfit) => {
    const previewItems = items.filter((i) =>
      outfit.items.includes(i.id)
    );
    return { ...outfit, previewItems };
  });

  if (tagFilter !== "All") {
    filteredOutfits = filteredOutfits.filter((o) =>
      o.tags?.includes(tagFilter)
    );
  }

  filteredOutfits.sort((a, b) => {
    if (sortMode === "Newest") return b.createdAt?.toDate() - a.createdAt?.toDate();
    if (sortMode === "Oldest") return a.createdAt?.toDate() - b.createdAt?.toDate();
    if (sortMode === "A-Z") return a.name.localeCompare(b.name);
    if (sortMode === "Z-A") return b.name.localeCompare(a.name);
    return 0;
  });

  const showingOutfits = activeCategory === "Saved Outfits";

  return (
    <div className="pb-32">

      <h1 className="text-3xl font-bold px-4 pt-6 text-gray-900 mb-4">My Closet</h1>

      <button
        onClick={() => navigate("/outfits")}
        className="ml-4 px-4 py-2 bg-thryftGreen text-white rounded-lg shadow hover:scale-105 transition"
      >
        Build an Outfit
      </button>

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

      {/* CATEGORY TABS */}
      <div className="flex gap-3 overflow-x-auto px-4 py-4 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2
              ${activeCategory === cat
                ? "bg-thryftGreen text-white"
                : "bg-gray-200 text-gray-700"
              }`}
          >
            {categoryIcons[cat]}
            {cat}
          </button>

        ))}

        {/* ADD CATEGORY BUTTON */}
        <button
          onClick={() => setShowCategoryModal(true)}
          className="whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          <span className="text-xl leading-none">+</span>
          Add
        </button>

      </div>


      {/* ================== SAVED OUTFITS ================== */}
      {showingOutfits && (
        <>
          {/* SORT + FILTER */}
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
                {TAG_OPTIONS.map((tag) => (
                  <option key={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>

          {/* OUTFIT GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 px-4">
            {filteredOutfits.map((outfit) => (
              <motion.div
                key={outfit.id}
                layout
                onClick={() => {
                  setSelectedOutfit(outfit);
                  setRenameValue(outfit.name || "");
                }}
                className="bg-white rounded-xl shadow-md p-2 cursor-pointer hover:scale-[1.02] transition"
              >
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
                        +{outfit.previewItems.length - 3} more
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-center mt-2 font-medium">
                  {outfit.name || "Untitled Outfit"}
                </p>

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

      {/* ================== CLOSET ITEMS ================== */}
      {!showingOutfits && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 px-4">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-md p-2 flex flex-col gap-2 h-[260px] justify-between"
            >
              <img
                src={item.image}
                onClick={() => setSelectedItem(item)}
                className="cursor-pointer w-full h-[150px] object-cover rounded-lg transition-transform duration-300 md:hover:scale-110"
              />

              <div className="flex justify-between items-center">
                <p className="font-medium text-gray-900 truncate">
                  {item.name}
                </p>

                <span className="text-xs bg-thryftGreen text-white px-2 py-1 rounded-full">
                  {item.category}
                </span>
              </div>

              <button
                onClick={() => handleDelete(item)}
                className="text-xs text-red-500 mt-1"
              >
                Delete
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* FLOATING ADD BUTTON */}
      {!showingOutfits && (
        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-[120px] right-6 bg-thryftGreen text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-4xl hover:scale-110 transition-all duration-200 z-[9999]"
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

      {/* ITEM DETAIL MODAL */}
      <Modal
        show={selectedItem !== null}
        onHide={() => setSelectedItem(null)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedItem?.name}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <img src={selectedItem?.image} className="w-full rounded-lg mb-3" />
          <p><strong>Category:</strong> {selectedItem?.category}</p>

          <Button
            variant="danger"
            className="mt-3"
            onClick={() => {
              handleDelete(selectedItem);
              setSelectedItem(null);
            }}
          >
            Delete Item
          </Button>
        </Modal.Body>
      </Modal>

      {/* OUTFIT DETAIL MODAL */}
      <Modal
        show={selectedOutfit !== null}
        onHide={() => setSelectedOutfit(null)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Outfit</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="mb-3">
            <label className="font-semibold">Outfit Name</label>
            <input
              className="w-full mt-2 px-3 py-2 border rounded-lg"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
            />
            <button
              onClick={handleRenameOutfit}
              className="mt-2 px-3 py-1 bg-thryftGreen text-white rounded shadow"
            >
              Rename
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {selectedOutfit?.previewItems.map((item) => (
              <div key={item.id}>
                <img
                  src={item.image}
                  className="rounded-lg w-full h-32 object-cover"
                />
                <p className="text-center mt-1">{item.name}</p>
              </div>
            ))}
          </div>

          <Button
            variant="danger"
            className="mt-4"
            onClick={() => handleDeleteOutfit(selectedOutfit)}
          >
            Delete Outfit
          </Button>
        </Modal.Body>
      </Modal>

      {/* ADD ITEM MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Item</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group>
              <Form.Label className="mt-3">Category</Form.Label>
              <Form.Select
                value={newItem.category}
                onChange={(e) =>
                  setNewItem({ ...newItem, category: e.target.value })
                }
              >
                <option>Tops</option>
                <option>Bottoms</option>
                <option>Shoes</option>
                <option>Accessories</option>
                {/* dynamic categories in modal */}
                {dynamicCategories.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label className="mt-3">Image</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) =>
                  setNewItem({ ...newItem, image: e.target.files[0] })
                }
              />
            </Form.Group>

            {newItem.image && (
              <img
                src={URL.createObjectURL(newItem.image)}
                className="mt-3 w-full h-48 object-cover rounded-lg"
              />
            )}
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>

          <Button
            variant="success"
            disabled={!newItem.name || !newItem.image}
            onClick={handleAddItem}
          >
            Add Item
          </Button>
        </Modal.Footer>
      </Modal>


      {/* ADD CATEGORY MODAL */}
      <Modal
        show={showCategoryModal}
        onHide={() => setShowCategoryModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>New Category</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Enter category name"
            value={customCategoryInput}
            onChange={(e) => setCustomCategoryInput(e.target.value)}
          />
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCategoryModal(false)}>
            Cancel
          </Button>

          <Button
            variant="success"
            onClick={() => {
              handleAddCustomCategory();
              setShowCategoryModal(false);
            }}
            disabled={!customCategoryInput.trim()}
          >
            Add Category
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
}
