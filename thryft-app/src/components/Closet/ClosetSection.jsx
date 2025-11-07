import React from "react";
import Slider from "react-slick";
import "../../styles/Closet.css";

export default function ClosetSection({ category, items }) {
  const settings = {
    dots: false,
    infinite: false,
    speed: 400,
    slidesToShow: 3, // ✅ Show 3 items at a time
    slidesToScroll: 1,
    swipeToSlide: true,
    draggable: true,
    arrows: false, // clean mobile style, you can enable if you want
  };

  return (
    <div className="closet-section">
      <h2 className="closet-category">{category}</h2>
      <Slider {...settings}>
        {items.map(item => (
          <div key={item.id} className="closet-item-card">
            <img src={item.image} alt={item.name} />
            <p>{item.name}</p>
          </div>
        ))}
      </Slider>
    </div>
  );
}
