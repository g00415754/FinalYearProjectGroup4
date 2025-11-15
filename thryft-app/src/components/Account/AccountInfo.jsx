import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

function AccountInfo({ editMode, user, setProfileData, profileData }) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');

  // Load user profile data from Firestore
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();

        const loadedName = data.name || user.displayName || "";
        const loadedLocation = data.location || "";

        setName(loadedName);
        setLocation(loadedLocation);

        // Sync up to Account.jsx
        setProfileData({
          name: loadedName,
          location: loadedLocation,
        });

      } else {
        // If Firestore doc does not exist, create a default one
        const defaultData = {
          name: user.displayName || "",
          email: user.email,
          location: ""
        };

        await setDoc(ref, defaultData);

        setName(defaultData.name);
        setLocation("");
        setProfileData(defaultData);
      }
    };

    loadProfile();
  }, [user, setProfileData]);

  return (
    <div className="account-info p-3">
      <Form>

        {/* NAME FIELD */}
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => {
              const newName = e.target.value;
              setName(newName);
              setProfileData((prev) => ({ ...prev, name: newName }));
            }}
            disabled={!editMode}
          />
        </Form.Group>

        {/* EMAIL FIELD (always disabled) */}
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={user?.email || ""}
            disabled
          />
        </Form.Group>

        {/* GALWAY CHARITY SHOP DROPDOWN */}
        <Form.Group className="mb-3">
          <Form.Label>Nearest Charity Shop</Form.Label>

          {/* Dropdown for known Galway shops */}
          <Form.Select
            disabled={!editMode}
            value={
              ["Enable Ireland – Galway", "Oxfam Galway", "Galway Simon Charity Shop", "COPE Galway"]
                .includes(location)
                ? location
                : "Other"
            }
            onChange={(e) => {
              const selected = e.target.value;

              if (selected === "Other") {
                // Enable text field typing
                setLocation("");
                setProfileData((prev) => ({ ...prev, location: "" }));
              } else {
                setLocation(selected);
                setProfileData((prev) => ({ ...prev, location: selected }));
              }
            }}
          >
            <option value="">Select a charity shop...</option>
            <option value="Enable Ireland – Galway">Enable Ireland – Galway</option>
            <option value="Oxfam Galway">Oxfam Galway</option>
            <option value="Galway Simon Charity Shop">Galway Simon Charity Shop</option>
            <option value="COPE Galway">COPE Galway</option>
            <option value="Other">Other (type your own)</option>
          </Form.Select>

          {/* TEXT FIELD FOR CUSTOM ENTRY */}
          {(!["Enable Ireland – Galway", "Oxfam Galway", "Galway Simon Charity Shop", "COPE Galway"]
            .includes(location)) && (

              <Form.Control
                className="mt-2"
                type="text"
                placeholder="Enter your preferred charity shop"
                disabled={!editMode}
                value={location}
                onChange={(e) => {
                  const customValue = e.target.value;
                  setLocation(customValue);
                  setProfileData((prev) => ({ ...prev, location: customValue }));
                }}
              />
            )}
        </Form.Group>


      </Form>
    </div>
  );
}

export default AccountInfo;
