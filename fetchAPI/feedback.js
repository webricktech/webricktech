document.addEventListener('DOMContentLoaded', async function () {
    const apiUrl = 'https://admin.webricktech.com/items/customer_feedback?fields=content,created_at,customer_id.company_name,customer_id.customer_photo';

    try {
        const response = await fetch(apiUrl);
        const { data } = await response.json();

        const $carousel = $('.testmonial-carousel-one');

        // Sort by created_at (newest first)
        data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Build HTML for carousel items
        let newSlidesHTML = '';
        data.forEach(item => {
            const customerName = item.customer_id?.company_name || 'Anonymous';
            const customerPhoto = item.customer_id?.customer_photo
                ? `https://admin.webricktech.com/assets/${item.customer_id.customer_photo}?width=214&height=214&fit=cover`
                : './source/avatar-placeholder.jpg';
            const comment = item.content || '';

            newSlidesHTML += `
                <div>
                    <div class="img">
                        <img src="${customerPhoto}" alt="${customerName}" class="rounded-circle">
                    </div>
                    <p class="fs-7 lh-sm mb-3 pt-4">${comment}</p>
                    <img src="./source/quote-right.png" alt="Quote" class="mb-4">
                    <p>${customerName}</p>
                </div>
            `;
        });

        // Replace current carousel items with sorted API data
        $carousel.trigger('replace.owl.carousel', newSlidesHTML).trigger('refresh.owl.carousel');

    } catch (error) {
        console.error('Error fetching feedback:', error);
    }
});
