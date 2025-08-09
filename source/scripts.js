// Example script to fetch team members and populate the HTML cards
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("team_container");

  try {
    const res = await fetch("https://admin.webricktech.com/items/team_members/");
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();

    // Assuming Directus returns something like { data: [ { name, role, image, facebook, twitter, linkedin, instagram } ] }
    container.innerHTML = ""; // Clear existing placeholder

    data.data.forEach(member => {
      const card = document.createElement("div");
      card.className = "col-md-6 col-lg-4 mt-2-9 wow fadeInUp";
      card.setAttribute("data-wow-delay", "200ms");

      card.innerHTML = `
        <div class="card card-style04 border-radius-10">
          <div class="team-img border">
            <img src="${member.image ? member.image : './source/default.jpg'}" alt="${member.name}" class="border-radius-10">
            <div class="card-body">
              <h3><a href="team-details.html" class="text-white">${member.name}</a></h3>
              <span class="text-white opacity6">${member.role}</span>
            </div>
          </div>
          <ul class="mb-0 list-unstyled team-social">
            ${member.facebook ? `<li><a href="${member.facebook}" class="text-white text-primary-hover"><i class="fa-brands fa-facebook-f"></i></a></li>` : ""}
            ${member.twitter ? `<li><a href="${member.twitter}" class="text-white text-primary-hover"><i class="fa-brands fa-x-twitter"></i></a></li>` : ""}
            ${member.linkedin ? `<li><a href="${member.linkedin}" class="text-white text-primary-hover"><i class="fab fa-linkedin-in"></i></a></li>` : ""}
            ${member.instagram ? `<li><a href="${member.instagram}" class="text-white text-primary-hover"><i class="ti-instagram"></i></a></li>` : ""}
          </ul>
        </div>
      `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error("Failed to fetch team members:", err);
    container.innerHTML = `<p style="color:white">Unable to load team members right now.</p>`;
  }
});
