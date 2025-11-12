import React, { useState, useRef, useEffect } from "react";
import { Card, Button, Modal, Form } from "react-bootstrap";
import "../../styles/Closet.css";
import { db, storage } from "../../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export default function Closet() {
  const [showModal, setShowModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", category: "Tops", image: null });
  const [categories, setCategories] = useState([
    { title: "Tops", items: [] },
    { title: "Bottoms", items: [] },
    { title: "Shoes", items: [] },
    { title: "Accessories", items: [] },
  ]);

  // ✅ Fetch items from Firestore on mount
  useEffect(() => {
    const fetchItems = async () => {
      const snapshot = await getDocs(collection(db, "closetItems"));
      const items = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      const grouped = ["Tops", "Bottoms", "Shoes", "Accessories"].map((cat) => ({
        title: cat,
        items: items.filter((item) => item.item_category === cat),
      }));

      setCategories(grouped);
    };

    fetchItems();
  }, []);

  // ✅ Add new item
  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = "";

      // Upload image if a file was selected
      if (newItem.image instanceof File) {
        const storageRef = ref(storage, `closetImages/${Date.now()}_${newItem.image.name}`);
        await uploadBytes(storageRef, newItem.image);
        imageUrl = await getDownloadURL(storageRef);
      }

      // Add item to Firestore
      await addDoc(collection(db, "closetItems"), {
        item_name: newItem.name,
        item_category: newItem.category,
        image_url: imageUrl || "",
        item_type: "",
        item_colour: "",
      });

      // Reset modal and form
      setShowModal(false);
      setNewItem({ name: "", category: "Tops", image: null });

      // Refresh items
      const snapshot = await getDocs(collection(db, "closetItems"));
      const items = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      const grouped = ["Tops", "Bottoms", "Shoes", "Accessories"].map((cat) => ({
        title: cat,
        items: items.filter((item) => item.item_category === cat),
      }));
      setCategories(grouped);
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  // ✅ Delete item (Firestore + Storage)
  const handleDeleteItem = async (itemId, imageUrl) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      // Delete Firestore document
      await deleteDoc(doc(db, "closetItems", itemId));

      // Delete image from Storage (if exists)
      if (imageUrl) {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      }

      // Refresh items
      const snapshot = await getDocs(collection(db, "closetItems"));
      const items = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      const grouped = ["Tops", "Bottoms", "Shoes", "Accessories"].map((cat) => ({
        title: cat,
        items: items.filter((item) => item.item_category === cat),
      }));
      setCategories(grouped);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  // ✅ Draggable scroll helper
  const useDraggableScroll = (ref) => {
    let isDown = false;
    let startX, scrollLeft;

    const handleMouseDown = (e) => {
      isDown = true;
      ref.current.classList.add("active");
      startX = e.pageX - ref.current.offsetLeft;
      scrollLeft = ref.current.scrollLeft;
    };
    const handleMouseLeave = () => {
      isDown = false;
      ref.current.classList.remove("active");
    };
    const handleMouseUp = () => {
      isDown = false;
      ref.current.classList.remove("active");
    };
    const handleMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - ref.current.offsetLeft;
      const walk = (x - startX) * 1.5;
      ref.current.scrollLeft = scrollLeft - walk;
    };

    return { handleMouseDown, handleMouseLeave, handleMouseUp, handleMouseMove };
  };

  return (
    <>
      <div className="closet-header">
        <h1>My Closet</h1>
      </div>

      <div className="closet-page container mt-4 mb-5">
        {categories.map((category, index) => {
          const scrollRef = useRef(null);
          const dragHandlers = useDraggableScroll(scrollRef);

          return (
            <div key={index} className="category-section mb-4">
              <h4 className="category-title">{category.title}</h4>
              <div
                className="scroll-container"
                ref={scrollRef}
                onMouseDown={dragHandlers.handleMouseDown}
                onMouseLeave={dragHandlers.handleMouseLeave}
                onMouseUp={dragHandlers.handleMouseUp}
                onMouseMove={dragHandlers.handleMouseMove}
              >
                {category.items.map((item, idx) => (
                  <Card key={idx} className="closet-card">
                    <Card.Img
                      variant="top"
                      src={item.image_url || "https://via.placeholder.com/200"}
                    />
                    <Card.Body>
                      <Card.Title>{item.item_name}</Card.Title>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id, item.image_url)}
                      >
                        Delete
                      </Button>
                    </Card.Body>
                  </Card>
                ))}
              </div>
              {index !== categories.length - 1 && <div className="divider-line"></div>}
            </div>
          );
        })}

        {/* Add Item Button */}
        <div className="add-item-container">
          <Button variant="dark" className="add-item-btn" onClick={() => setShowModal(true)}>
            + Add New Item
          </Button>
        </div>

        {/* Add Item Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Add New Closet Item</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleAddItem}>
              <Form.Group className="mb-3">
                <Form.Label>Item Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter item name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                >
                  <option>Tops</option>
                  <option>Bottoms</option>
                  <option>Shoes</option>
                  <option>Accessories</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Upload Image</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewItem({ ...newItem, image: e.target.files[0] })}
                />
              </Form.Group>

              <div className="d-flex justify-content-end">
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="dark" className="ms-2">
                  Add Item
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
}
