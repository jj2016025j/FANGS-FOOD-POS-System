// 卡片動畫
const cards = document.querySelectorAll(".cardEffect");

const cardImg = document.querySelectorAll('.card-img');

cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = e.target.getBoundingClientRect();
      
        const distanceX = e.pageX - rect.x - (rect.width / 2);
        const distanceY = e.pageY - rect.y - (rect.height / 2);
      
      
        const x = Math.sqrt(Math.abs(distanceX));
        const y = Math.sqrt(Math.abs(distanceY));
      
        const num = {
          x: distanceX < 0 ? x : - x ,
          y: distanceY > 0 ? y : - y 
        };
      
        card.style.transform = `translateZ(40px) rotateX(${num.y / 3}deg) rotateY(${num.x / 3}deg) scale(1.1)`
        cardImg.style.transform = `translateX(${num.x / 3}px) translateY(${- num.y / 3}px)`
      
      });
    card.addEventListener('mouseleave', () => {
        card.style.transform = `translateZ(0) rotateX(0deg) rotateY(0deg) scale(1)`
    });


});

document.addEventListener("DOMContentLoaded", function() {
  var navbarToggle = document.querySelector('.navbar-toggler');
  var navbarCollapse = document.querySelector('.navbar-collapse');

  navbarToggle.addEventListener('click', function() {
  navbarCollapse.classList.toggle('show');
  });
});
