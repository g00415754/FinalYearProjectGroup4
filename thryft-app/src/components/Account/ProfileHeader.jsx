import React, { useEffect, useState, useRef } from 'react';
import { FaPencilAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { db, storage } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

function ProfileHeader({ editMode, setEditMode }) {
  const { currentUser } = useAuth();
  const [profileData, setProfileData] = useState(null);

  const fileInputRef = useRef();

  // Load profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return;

      const userRef = doc(db, "users", currentUser.uid);
      const snap = await getDoc(userRef);

      setProfileData(snap.exists() ? snap.data() : {});
    };

    fetchProfile();
  }, [currentUser]);

  // Initials fallback
  const getInitials = () => {
    const name = profileData?.name || currentUser?.displayName || "U";
    return name.split(" ").map(n => n[0]).join("").slice(0, 2);
  };

  // Upload profile image
  const handleImageClick = () => {
    if (editMode) fileInputRef.current.click();
  };

  const handleImageUpload = async (e) => {
    if (!currentUser || !e.target.files[0]) return;

    const file = e.target.files[0];
    const storageRef = ref(storage, `profilePhotos/${currentUser.uid}`);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    await updateDoc(doc(db, "users", currentUser.uid), {
      photoURL: downloadURL
    });

    setProfileData(prev => ({ ...prev, photoURL: downloadURL }));
  };

  // Delete profile image
  const handleRemovePhoto = async () => {
    if (!currentUser) return;

    const fileRef = ref(storage, `profilePhotos/${currentUser.uid}`);

    try {
      await deleteObject(fileRef);
    } catch (error) {
      console.log("No photo to delete");
    }

    await updateDoc(doc(db, "users", currentUser.uid), {
      photoURL: ""
    });

    setProfileData(prev => ({ ...prev, photoURL: "" }));
  };

  const handleEditClick = () => setEditMode(!editMode);

  return (
    <div className="profile-header d-flex align-items-center justify-content-between mb-4 p-3">
      <div className="d-flex align-items-center">

        {/* Hidden file input */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleImageUpload}
        />

        {/* Avatar Wrapper */}
        <div className="profile-photo-wrapper">

          {/* Avatar Circle */}
          <div
            className="profile-photo-circle"
            onClick={handleImageClick}
          >
            {profileData?.photoURL ? (
              <img
                src={profileData.photoURL}
                alt="Profile"
                className="profile-photo-img"
              />
            ) : (
              <div className="initials-avatar">
                {getInitials()}
              </div>
            )}
          </div>

          {/* Delete X button overlay */}
          {editMode && profileData?.photoURL && (
            <div
              className="remove-photo-btn"
              onClick={handleRemovePhoto}
            >
              ✕
            </div>
          )}

        </div>


        {/* Name + Email */}
        <div className="ms-3">
          <h5 className="mb-1">
            {profileData?.name || currentUser?.displayName || "Your Name"}
          </h5>
          <p className="text-muted small mb-0">{currentUser?.email}</p>
        </div>
      </div>

      {/* Edit icon */}
      <div
        className={`edit-icon-circle ${editMode ? "rotate-pencil" : ""}`}
        onClick={handleEditClick}
      >
        <FaPencilAlt size={16} color={editMode ? "#ffc107" : "white"} />
      </div>
    </div>
  );
}

export default ProfileHeader;
