import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Trash2, Sparkles, Clock } from "lucide-react";
import "../../styles/ItemCard.css";

/* =========================================================
   Human-friendly "time ago" converter
========================================================= */
function timeAgo(date) {
  if (!date) return "Never";
  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

/* =========================================================
   MAIN CARD COMPONENT
========================================================= */
export default function ItemCard({
  item,
  onImageClick,
  onDelete,
  onToggleFavorite,
  onMarkWorn,
}) {
  const [flipped, setFlipped] = useState(false);

  const lastWornDate =
    item.lastWorn?.toDate?.() ?? (item.lastWorn ? new Date(item.lastWorn) : null);

  return (
    <div className="flip-wrapper">

      {/* HOTSPOTS MUST BE OUTSIDE flip-inner */}
      {!flipped && (
        <div
          className="flip-hotspot-front"
          onClick={() => setFlipped(true)}
        />
      )}

      {flipped && (
        <div
          className="flip-hotspot-back"
          onClick={() => setFlipped(false)}
        />
      )}

      <motion.div
        className={`flip-inner ${flipped ? "flipped" : ""}`}
        transition={{ duration: 0.45 }}
      >

        {/* ======================================================
            FRONT — FULL IMAGE
        ====================================================== */}
        <div className="item-card-front full-image-front">

          <img
            src={item.image}
            alt={item.name}
            className="front-full-image no-flip"
            onClick={(e) => {
              e.stopPropagation();
              onImageClick();
            }}
          />

          <div className="front-gradient"></div>

          <div className="front-category-badge">{item.category}</div>

          <div className="front-item-name">{item.name}</div>
        </div>

        {/* ======================================================
            BACK — METADATA
        ====================================================== */}
        <div className="item-card-back">

          <div className="back-content no-flip">

            <p className="back-title">{item.name}</p>

            {/* Metadata */}
            <div className="meta-block no-flip">
              <div className="meta-row">
                <span className="meta-label">Category</span>
                <span className="meta-value">{item.category}</span>
              </div>

              <div className="meta-row">
                <span className="meta-label">Colour Tag</span>
                <span className="meta-value">{item.colorTag}</span>
              </div>

              <div className="meta-row">
                <span className="meta-label">Season</span>
                <span className="meta-value">{item.seasonTag}</span>
              </div>

              <div className="meta-row">
                <span className="meta-label">Worn</span>
                <span className="meta-value">{item.timesWorn || 0} times</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="action-row">

              <button
                className={`icon-btn no-flip ${item.favorite ? "active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(item);
                }}
              >
                <Heart size={26} />
              </button>

              <button
                className="icon-btn no-flip"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkWorn(item);
                }}
              >
                <Sparkles size={26} />
              </button>

              <button
                className="icon-btn delete no-flip"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item);
                }}
              >
                <Trash2 size={26} />
              </button>

            </div>

            <div className="worn-stats no-flip">
              <Clock size={16} />
              <span>{item.timesWorn || 0} wears</span>
            </div>

          </div>
        </div>

      </motion.div>
    </div>
  );
}
