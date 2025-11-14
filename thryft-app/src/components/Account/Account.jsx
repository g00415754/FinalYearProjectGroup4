import React, { useState } from "react";
import ProfileHeader from "./ProfileHeader";
import AccountInfo from "./AccountInfo";
import { Button } from "react-bootstrap";
import "../../styles/Account.css";
import SettingsList from "./SettingsList";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";

export default function Account() {
  const [editMode, setEditMode] = useState(false);
  const { currentUser } = useAuth();   // <-- FIXED: use correct user source

  // Fields lifted up from child component
  const [profileData, setProfileData] = useState({
    name: "",
    location: "",
  });

  const handleSave = async () => {
    if (!currentUser) return;

    const ref = doc(db, "users", currentUser.uid);

    await setDoc(
      ref,
      { profile: profileData },
      { merge: true }
    );

    alert("Information saved!");
    setEditMode(false);
  };

  return (
    <div className="account-page p-3 pb-5">
      {/* Pass currentUser to ProfileHeader */}
      <ProfileHeader
        editMode={editMode}
        setEditMode={setEditMode}
        user={currentUser}
      />

      {/* Pass currentUser to AccountInfo */}
      <AccountInfo
        editMode={editMode}
        user={currentUser}
        setProfileData={setProfileData}
        profileData={profileData}
      />

      {editMode && (
        <div className="save-btn-container">
          <Button variant="dark" size="lg" onClick={handleSave}>
            Save Information
          </Button>
        </div>
      )}

      <SettingsList />
    </div>
  );
}
