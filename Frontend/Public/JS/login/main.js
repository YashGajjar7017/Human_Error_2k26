document.addEventListener("DOMContentLoaded", function () {
  const sidenav2 = document.getElementById("mySidenav2");
  if (!sidenav2) return;

  const closeBtn = sidenav2.querySelector(".closebtn");
  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      if (window.innerWidth <= 768) {
        sidenav2.style.width = "0";
        sidenav2.classList.remove("open");
      }
    });
  }

  // Assuming there is a toggle button with id "sidenavToggleBtn" to open/close sidenav on small screens
  const toggleBtn = document.getElementById("sidenavToggleBtn");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      if (sidenav2.classList.contains("open")) {
        sidenav2.style.width = "0";
        sidenav2.classList.remove("open");
      } else {
        sidenav2.style.width = "270px";
        sidenav2.classList.add("open");
      }
    });
  }
});

// Override closeNav1 to support close on small screen only
function closeNav1() {
  const sidenav2 = document.getElementById("mySidenav2");
  if (window.innerWidth <= 768) {
    sidenav2.style.width = "0";
    sidenav2.classList.remove("open");
  }
}
