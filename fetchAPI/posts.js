document.addEventListener('DOMContentLoaded', () => {
// Configuration
    const config = {
        postsPerPage: 6, // Matches the 2x3 grid layout
        recentPostsCount: 3
    };

    // State
    const state = {
        currentPage: 1,
        allPosts: [],
        filteredPosts: [],
        authorsCache: new Map()
    };

    // DOM Elements
    const elements = {
        postsContainer: document.getElementById('posts-container'),
        paginationControls: document.getElementById('pagination-controls'),
        searchInput: document.getElementById('search-input'),
        searchButton: document.getElementById('search-button'),
        recentPostsContainer: document.getElementById('recent-posts')
    };

    // Initialize
    fetchPosts();
    setupEventListeners();

    // Fetch posts and preload author names in one go
    async function fetchPosts() {
        try {
            const res = await fetch('https://admin.webricktech.com/items/posts');
            const json = await res.json();
            state.allPosts = json.data || [];
            state.filteredPosts = [...state.allPosts].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

            // Preload authors to avoid multiple fetch calls
            const authorIds = [...new Set(state.allPosts.map(p => p.author_id))].filter(Boolean);
            if (authorIds.length) {
                const authorsRes = await fetch(`https://admin.webricktech.com/items/team_members?fields=id,name&filter[id][_in]=${authorIds.join(',')}`);
                const authorsJson = await authorsRes.json();
                (authorsJson.data || []).forEach(author => state.authorsCache.set(author.id, author.name));
            }

            renderPosts();
            renderRecentPosts();
            renderPagination();
        } catch (err) {
            console.error('Error fetching posts:', err);
            elements.postsContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">Could not load blog posts. Please try again later.</div>
                </div>
            `;
        }
    }

    // Render posts using DocumentFragment for minimal reflows
    async function renderPosts() {
        const startIndex = (state.currentPage - 1) * config.postsPerPage;
        const postsToShow = state.filteredPosts.slice(startIndex, startIndex + config.postsPerPage);

        const fragment = document.createDocumentFragment();
        for (const [index, post] of postsToShow.entries()) {
            const delay = index % 2 === 0 ? '200ms' : '300ms'; // Alternating animation delays
            fragment.appendChild(await createPostElement(post, delay));
        }
        elements.postsContainer.innerHTML = '';
        elements.postsContainer.appendChild(fragment);
    }

    // Create post element (no extra fetch for authors)
    async function createPostElement(post, delay) {
        const formattedDate = formatDate(post.updated_at || post.created_at);
        const authorName = state.authorsCache.get(post.author_id) || 'Contributor';

        const colDiv = document.createElement('div');
        colDiv.className = 'col-md-6 mt-2-2 wow fadeInUp';
        colDiv.setAttribute('data-wow-delay', delay);
        colDiv.style.visibility = 'visible';
        colDiv.style.animationName = 'fadeInUp';

        colDiv.innerHTML = `
            <article class="card card-style02 rounded h-100">
                <div class="blog-img position-relative overflow-hidden image-hover">
                    <img src="https://admin.webricktech.com/assets/${post.blog_image }" alt="${post.title || 'Blog post'}" class="rounded-top">
                    <span><a href="#">${post.category || getCategory(post)}</a></span>
                </div>
                <div class="card-body p-1-6 p-lg-2-3">
                    <h4 class="mb-3"><a href="blog-details.html?slug=${post.slug}">${post.title || 'No title'}</a></h4>
                    <p class="mb-3">${post.content ? post.content.substring(0, 100) + '...' : 'No content available.'}</p>
                    <div class="blog-author">
                        <div class="me-auto">
                            <span class="blog-date">${formattedDate}</span>
                            <div class="author-name">By <a href="#">${authorName}</a></div>
                        </div>
                        <div class="blog-like">
                            <a href="#"><i class="fa-regular fa-message text-primary"></i>
                            <span class="font-weight-600 align-middle">0</span></a>
                        </div>
                    </div>
                </div>
            </article>
        `;
        return colDiv;
    }

    function renderRecentPosts() {
        const recentPosts = [...state.allPosts]
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, config.recentPostsCount);

        const fragment = document.createDocumentFragment();
        recentPosts.forEach((post, i) => {
            const formattedDate = formatDate(post.published_at || post.updated_at || post.created_at, { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            });
            const div = document.createElement('div');
            div.className = 'd-flex mb-4';
            div.innerHTML = `
                <div class="flex-shrink-0">
                    <img src="https://admin.webricktech.com/assets/${post.blog_image}?width=85&height=85&quality=60&fit=cover" alt="${post.title}" class="rounded">
                </div>
                <div class="flex-grow-1 ms-3">
                    <h4 class="mb-2 h6"><a href="blog-details.html?slug=${post.slug}" class="text-white text-primary-hover">${post.title || 'Recent Post'}</a></h4>
                    <span class="text-white opacity8 small">${formattedDate}</span>
                </div>
            `;
            fragment.appendChild(div);
        });

        elements.recentPostsContainer.innerHTML = '';
        elements.recentPostsContainer.appendChild(fragment);
    }

    function renderPagination() {
        const totalPages = Math.ceil(state.filteredPosts.length / config.postsPerPage);
        if (totalPages <= 1) {
            elements.paginationControls.innerHTML = '';
            return;
        }

        const fragment = document.createDocumentFragment();
        const createButton = (label, disabled, onClick) => {
            const li = document.createElement('li');
            if (disabled) li.className = 'disabled';
            li.innerHTML = `<a href="#posts-container">${label}</a>`;
            if (!disabled) li.addEventListener('click', e => {
                e.preventDefault();
                onClick();
            });
            return li;
        };

        fragment.appendChild(createButton('<i class="ti-arrow-left"></i>', state.currentPage === 1, () => {
            state.currentPage--;
            renderPosts();
            renderPagination();
        }));

        for (let i = 1; i <= totalPages; i++) {
            const li = createButton(i.toString().padStart(2, '0'), false, () => {
                state.currentPage = i;
                renderPosts();
                renderPagination();
            });
            if (i === state.currentPage) li.className = 'active';
            fragment.appendChild(li);
        }

        fragment.appendChild(createButton('<i class="ti-arrow-right"></i>', state.currentPage === totalPages, () => {
            state.currentPage++;
            renderPosts();
            renderPagination();
        }));

        elements.paginationControls.innerHTML = '';
        elements.paginationControls.appendChild(fragment);
    }

    function searchPosts() {
        const term = elements.searchInput.value.trim().toLowerCase();
        state.filteredPosts = term
            ? state.allPosts.filter(post =>
                (post.title && post.title.toLowerCase().includes(term)) ||
                (post.content && post.content.toLowerCase().includes(term))
            )
            : [...state.allPosts];

        state.currentPage = 1;
        renderPosts();
        renderPagination();
    }

    function formatDate(dateStr, options = { year: 'numeric', month: 'long', day: 'numeric' }) {
        return dateStr ? new Date(dateStr).toLocaleDateString('en-US', options) : 'No date';
    }

    function getCategory(post) {
        const map = { seo: 'SEO', marketing: 'Marketing', serverless: 'Technology', branding: 'Business' };
        return Object.entries(map).find(([k]) => post.slug?.includes(k))?.[1] || 'General';
    }

    function setupEventListeners() {
        elements.searchButton.addEventListener('click', searchPosts);
        elements.searchInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') searchPosts();
        });
    }
});