import React, { useState, useContext } from 'react';
import ProfileHeader from './ProfileHeader';
import AccountInfo from './AccountInfo';
import { Button } from 'react-bootstrap';
import '../../styles/Account.css';
import SettingsList from './SettingsList';
import { AuthContext } from '../../context/AuthContext';
import { db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function Account() {
  const [editMode, setEditMode] = useState(false);
  const { user } = useContext(AuthContext);

  // Fields lifted up from child component
  const [profileData, setProfileData] = useState({
    name: "",
    location: "",
  });

  const handleSave = async () => {
    if (!user) return;

    const ref = doc(db, "users", user.uid);

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
      <ProfileHeader editMode={editMode} setEditMode={setEditMode} user={user} />

      <AccountInfo
        editMode={editMode}
        user={user}
        setProfileData={setProfileData}   // 🔥 allow saving
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
