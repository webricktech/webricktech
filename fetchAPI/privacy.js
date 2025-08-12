document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("container");

  try {
    const res = await fetch(
      "https://admin.webricktech.com/items/privacy_and_policy"
    );
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const {data} = await res.json();
    console.log("", data);

    container.innerHTML = data[0].content;
  } catch (err) {
    console.error("Failed to fetch team members:", err);
    container.innerHTML =
      `<p style="color:white">Unable to load team members right now.</p>`;
  }
});