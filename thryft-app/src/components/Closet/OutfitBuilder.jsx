import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";



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

export default function OutfitBuilder() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [items, setItems] = useState([]);
    const [selected, setSelected] = useState([]);

    // Save modal UI
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [outfitName, setOutfitName] = useState("");
    const [outfitTags, setOutfitTags] = useState([]);

    // Fetch closet items
    useEffect(() => {
        if (!currentUser) return;

        const unsub = onSnapshot(
            collection(db, "users", currentUser.uid, "closet"),
            (snapshot) => {
                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setItems(data);
            }
        );

        return () => unsub();
    }, [currentUser]);

    // Select or unselect items
    const toggleSelect = (itemId) => {
        setSelected((prev) =>
            prev.includes(itemId)
                ? prev.filter((id) => id !== itemId)
                : [...prev, itemId]
        );
    };

    // Toggle tags
    const toggleTag = (tag) => {
        setOutfitTags((prev) =>
            prev.includes(tag)
                ? prev.filter((t) => t !== tag)
                : [...prev, tag]
        );
    };

    // Save outfit to Firestore
    const saveOutfit = async () => {
        if (!selected.length || !outfitName.trim()) return;

        await addDoc(collection(db, "users", currentUser.uid, "outfits"), {
            name: outfitName.trim(),
            tags: outfitTags,
            items: selected,
            createdAt: new Date(),
        });

        // Reset
        setOutfitName("");
        setOutfitTags([]);
        setSelected([]);
        setShowSaveModal(false);

        alert("Outfit saved!");
    };

    return (
        <div className="flex justify-center">
            <div className="w-full max-w-8xl px-4">

                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 mt-4 mb-4 px-2 py-1 text-gray-800 hover:text-thryftGreen transition"
                >
                    <ChevronLeft size={24} />
                    <span className="text-lg font-medium">Back</span>
                </button>


                <h1 className="text-3xl font-bold mb-4">Build an Outfit</h1>

                {/* Selected items preview */}
                {selected.length > 0 && (
                    <motion.div
                        layout
                        className="mb-6 flex overflow-x-auto gap-4 pb-2"
                    >
                        {items
                            .filter((i) => selected.includes(i.id))
                            .map((item) => (
                                <motion.img
                                    key={item.id}
                                    src={item.image}
                                    className="h-28 w-28 object-cover rounded-xl shadow-md"
                                    layout
                                />
                            ))}
                    </motion.div>
                )}

                {/* Items grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {items.map((item) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => toggleSelect(item.id)}
                            className={`rounded-xl overflow-hidden shadow-md cursor-pointer transition 
              ${selected.includes(item.id) ? "ring-4 ring-thryftGreen" : ""}
            `}
                        >
                            <img
                                src={item.image}
                                className="w-full h-40 object-cover"
                            />
                            <p className="p-2 text-center font-medium truncate">
                                {item.name}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Save button */}
                <button
                    onClick={() => selected.length > 0 && setShowSaveModal(true)}
                    className={`fixed bottom-0 left-0 w-full py-4 text-lg font-semibold rounded-none shadow-xl transition 
    ${selected.length > 0
                            ? "bg-thryftGreen text-white hover:opacity-90"
                            : "bg-gray-300 text-gray-600 cursor-not-allowed"
                        }
  `}
                    style={{ zIndex: 9999 }}
                >
                    Save Outfit
                </button>


                {/* SAVE OUTFIT MODAL */}
                <Modal show={showSaveModal} onHide={() => setShowSaveModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Save Outfit</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {/* Outfit Name */}
                        <label className="font-semibold">Outfit Name</label>
                        <input
                            className="w-full px-3 py-2 border rounded-lg mt-2"
                            value={outfitName}
                            onChange={(e) => setOutfitName(e.target.value)}
                            placeholder="e.g. Cozy Neutral Winter"
                        />

                        {/* Tags */}
                        <div className="mt-4">
                            <label className="font-semibold">Tags</label>

                            <div className="flex flex-wrap gap-2 mt-2">
                                {TAG_OPTIONS.map((tag) => (
                                    <div
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                        className={`px-3 py-1 rounded-full border cursor-pointer transition text-sm
                    ${outfitTags.includes(tag)
                                                ? "bg-thryftGreen text-white border-thryftGreen"
                                                : "bg-white text-gray-700 border-gray-300"
                                            }
                  `}
                                    >
                                        {tag}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowSaveModal(false)}>
                            Cancel
                        </Button>

                        <Button
                            variant="success"
                            disabled={!outfitName.trim()}
                            onClick={saveOutfit}
                        >
                            Save Outfit
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );

}
