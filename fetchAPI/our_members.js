document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("team_container");

  try {
    const res = await fetch(
      "https://admin.webricktech.com/items/team_members"
    );
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const { data: members } = await res.json();

    container.innerHTML = members
      .map(
        ({ name, photo, position, linkedin_url, facebook, twitter, instagram }) => `
        <div class="col-md-6 col-lg-4 mt-2-9 wow fadeInUp" data-wow-delay="200ms">
          <div class="card card-style04 border-radius-10">
            <div class="team-img border">
              <img src="https://admin.webricktech.com/assets/${photo}?width=486&height=585&fit=cover" 
                   alt="${name}" class="border-radius-10">
              <div class="card-body">
                <h3><a href="team-details.html" class="text-white">${name}</a></h3>
                <span class="text-white opacity6">${position || ""}</span>
              </div>
            </div>
            <ul class="mb-0 list-unstyled team-social">
              <li><a href="${facebook || ""}" class="text-white text-primary-hover"><i class="fa-brands fa-facebook-f"></i></a></li>
              <li><a href="${twitter || ""}" class="text-white text-primary-hover"><i class="fa-brands fa-x-twitter"></i></a></li>
              <li><a href="${linkedin_url || ""}" class="text-white text-primary-hover"><i class="fab fa-linkedin-in"></i></a></li>
              <li><a href="${instagram || ""}" class="text-white text-primary-hover"><i class="ti-instagram"></i></a></li>
            </ul>
          </div>
        </div>
      `
      )
      .join("");
  } catch (err) {
    console.error("Failed to fetch team members:", err);
    container.innerHTML =
      `<p style="color:white">Unable to load team members right now.</p>`;
  }
});