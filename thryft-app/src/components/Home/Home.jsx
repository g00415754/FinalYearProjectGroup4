import React from "react";
import "../../styles/Home.css";
import useClosetStats from "../../hooks/useClosetStats";

export default function Home() {
  const { stats, loading } = useClosetStats(); // <-- correctly placed

  return (
    <div className="home-page">
      <div className="home-container">

        {/* ================= HEADER ================= */}
        <header className="home-hero">
          <p className="home-eyebrow">Welcome back</p>
          <h1 className="home-title">Hi, User ✨</h1>
          <p className="home-subtitle">
            Your curated wardrobe & AI stylist, all in one place.
          </p>

          {/* Stats Row */}
          <div className="home-stats-row">
            <div className="home-stat">
              <p className="stat-number">
                {loading ? "—" : stats.totalItems}
              </p>
              <p className="stat-label">Items</p>
            </div>

            <div className="home-stat">
              <p className="stat-number">
                {loading ? "—" : stats.totalOutfits}
              </p>
              <p className="stat-label">Outfits</p>
            </div>

            <div className="home-stat">
              <p className="stat-number">
                {loading ? "—" : stats.totalCategories}
              </p>
              <p className="stat-label">Categories</p>
            </div>
          </div>
        </header>

        {/* ================= QUICK ACTIONS ================= */}
        <section className="home-section">
          <h3 className="section-title">Quick Actions</h3>

          <div className="quick-actions">
            <div className="quick-action-card">Scan Item</div>
            <div className="quick-action-card">Build Outfit</div>
            <div className="quick-action-card">Add Category</div>
          </div>
        </section>

        {/* ================= AI LOOK OF THE DAY ================= */}
        <section className="home-section">
          <div className="ai-card">
            <div className="ai-card-torn-edge"></div>

            <p className="ai-eyebrow">Thryft Editorial</p>
            <h2 className="ai-title">AI Look of the Day</h2>

            <div className="ai-card-body">
              <div className="ai-collage">
                <div className="ai-cutout ai-cutout-large">
                  <div className="ai-cutout-label">Top</div>
                </div>
                <div className="ai-cutout ai-cutout-medium">
                  <div className="ai-cutout-label">Bottom</div>
                </div>
                <div className="ai-cutout ai-cutout-small">
                  <div className="ai-cutout-label">Shoes</div>
                </div>
              </div>

              <div className="ai-copy">
                <p>
                  Soon, Thryft will style full outfits for you using the clothes you already own.
                </p>
                <button className="ai-button">Generate Look (coming soon)</button>
              </div>
            </div>
          </div>
        </section>

        {/* ================= CLOSET CATEGORIES ================= */}
        <section className="home-section">
          <h3 className="section-title">Your Closet</h3>

          <div className="closet-category-pills">
            <div className="category-pill">Tops</div>
            <div className="category-pill">Bottoms</div>
            <div className="category-pill">Shoes</div>
            <div className="category-pill">Accessories</div>
            <div className="category-pill category-pill-accent">
              Saved Outfits ⭐
            </div>
          </div>
        </section>

        {/* ================= RECENTLY ADDED ================= */}
        <section className="home-section">
          <h3 className="section-title">Recently Added</h3>

          <div className="scroll-row">
            <div className="placeholder-card">Item</div>
            <div className="placeholder-card">Item</div>
            <div className="placeholder-card">Item</div>
          </div>

          <p className="section-empty">Add something to your closet to see it here.</p>
        </section>

        {/* ================= SAVED OUTFITS ================= */}
        <section className="home-section">
          <h3 className="section-title">Saved Outfits</h3>

          <div className="scroll-row">
            <div className="outfit-card">Outfit</div>
            <div className="outfit-card">Outfit</div>
          </div>

          <p className="section-empty">Your styled looks will appear here.</p>
        </section>

        {/* ================= FRIENDS' OUTFITS ================= */}
        <section className="home-section">
          <h3 className="section-title">Friends’ Outfits of the Day</h3>

          <div className="friends-scroll">
            {/* Friend Card 1 */}
            <div className="friend-card large">
              <div className="friend-header">
                <img
                  className="friend-avatar"
                  src="https://via.placeholder.com/70"
                  alt="Friend"
                />
                <p className="friend-name">@ellie</p>
              </div>

              <div className="friend-outfit-collage large">
                <div className="friend-piece large-piece">Top</div>
                <div className="friend-piece medium-piece">Bottom</div>
                <div className="friend-piece small-piece">Shoes</div>
              </div>
            </div>

            {/* Friend Card 2 */}
            <div className="friend-card large">
              <div className="friend-header">
                <img
                  className="friend-avatar"
                  src="https://via.placeholder.com/70"
                  alt="Friend"
                />
                <p className="friend-name">@mia</p>
              </div>

              <div className="friend-outfit-collage large">
                <div className="friend-piece large-piece">Top</div>
                <div className="friend-piece medium-piece">Bottom</div>
                <div className="friend-piece small-piece">Shoes</div>
              </div>
            </div>
          </div>

          <p className="section-empty">Your friends' looks will appear here.</p>
        </section>

      </div>
    </div>
  );
}
