
const swiper = new Swiper('.mySwiper', {
  slidesPerView: 8, // show 5 logos in one row
  spaceBetween: 10,      // use the fixed widths we gave via .slide-inner
  spaceBetween: 20,
  loop: true,
  speed: 2200,
  autoplay: {
    delay: 2000,
    disableOnInteraction: false,
  },
  // ensure Swiper reacts to DOM/image changes
  observer: true,
  observeParents: true,
  // update again when images are ready
  on: {
    imagesReady() { this.update(); },
    init() { this.update(); }
  }
});

// As an extra safety, update again after window load (images definitely loaded)
window.addEventListener('load', () => { swiper.update(); });
