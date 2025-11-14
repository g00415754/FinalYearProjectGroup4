import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

function AccountInfo({ editMode, user }) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');

  // Load Firebase profile data from Firestore
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      // If Firestore has profile data, load it
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data().profile || {};
        setName(data.name || user.displayName || "");
        setLocation(data.location || "");
      } else {
        // No profile yet → fallback values
        setName(user.displayName || "");
        setLocation("");
      }
    };

    loadProfile();
  }, [user]);

  return (
    <div className="account-info p-3">
      <Form>

        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!editMode}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={user?.email || ""}
            disabled
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Nearest Charity Shop</Form.Label>
          <Form.Control
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={!editMode}
          />
        </Form.Group>

      </Form>
    </div>
  );
}

export default AccountInfo;
