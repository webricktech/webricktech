document.addEventListener('DOMContentLoaded', function() {
    // Configuration
    const config = {
        postsPerPage: 4,
        recentPostsCount: 3
    };

    // State
    const state = {
        currentPage: 1,
        totalPosts: 0,
        allPosts: [],
        filteredPosts: []
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

    // Functions
    function fetchPosts() {
        fetch('https://admin.webricktech.com/items/posts')
            .then(response => response.json())
            .then(data => {
                state.allPosts = data.data;
                state.totalPosts = state.allPosts.length;
                state.filteredPosts = [...state.allPosts];
                
                // Sort by date (newest first)
                state.filteredPosts.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
                
                renderPosts();
                renderRecentPosts();
                renderPagination();
            })
            .catch(error => {
                console.error('Error fetching posts:', error);
                elements.postsContainer.innerHTML = `
                    <div class="alert alert-danger">
                        Could not load blog posts. Please try again later.
                    </div>
                `;
            });
    }

    async function renderPosts() {
    const startIndex = (state.currentPage - 1) * config.postsPerPage;
    const endIndex = startIndex + config.postsPerPage;
    const postsToShow = state.filteredPosts.slice(startIndex, endIndex);

    // Clear existing posts
    elements.postsContainer.innerHTML = '';

    // Add new posts (await the creation of each)
    for (const post of postsToShow) {
        const postElement = await createPostElement(post);
        elements.postsContainer.appendChild(postElement);
    }
}


    async function createPostElement(post) {
        const postDate = post.updated_at || post.created_at;
        const formattedDate = postDate ? new Date(postDate).toLocaleDateString('en-US', {
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        }) : 'No date';

        const article = document.createElement('article');
        article.className = 'card card-style02 rounded mt-2-2 wow fadeInUp';
        article.setAttribute('data-wow-delay', '100ms');
        article.style.visibility = 'visible';
        article.style.animationName = 'fadeInUp';

        article.innerHTML = `
            <div class="blog-img position-relative overflow-hidden image-hover rounded-top">
                <img src="https://admin.webricktech.com/assets/${post.blog_image || './source/blog-01.jpg'}" alt="${post.title || 'Blog post'}">
                <span><a href="#">${post.category}</a></span>
            </div>
            <div class="card-body p-1-6 p-lg-2-3">
                <h4 class="h3 mb-3"><a href="blog-details.html?slug=${post.slug}">${post.title || 'No title'}</a></h4>
                <p class="mb-3">${post.content || 'No content available.'}</p>
                <div class="blog-author">
                    <div class="me-auto">
                        <span class="blog-date">${formattedDate}</span>
                        <div class="author-name">
                            By <a href="#">${await getAuthorName(post.author_id)}</a>
                        </div>
                    </div>
                    <div class="blog-like">
                        <a href="#">
                            <i class="fa-regular fa-message text-primary"></i>
                            <span class="font-weight-600 align-middle">0</span>
                        </a>
                    </div>
                </div>
            </div>
        `;

        return article;
    }

    function renderRecentPosts() {
        // Get most recent posts
        const recentPosts = [...state.allPosts]
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, config.recentPostsCount);

        // Clear existing recent posts
        elements.recentPostsContainer.innerHTML = '';

        // Add new recent posts
        recentPosts.forEach((post, index) => {
            const postDate = post.published_at || post.updated_at || post.created_at;
            const formattedDate = postDate ? new Date(postDate).toLocaleDateString('en-US', {
                month: 'short', 
                day: 'numeric', 
                year: 'numeric'
            }) : 'No date';

            const recentPostDiv = document.createElement('div');
            recentPostDiv.className = 'd-flex mb-4';
            recentPostDiv.innerHTML = `
                <div class="flex-shrink-0">
                    <img src="https://admin.webricktech.com/assets/${post.blog_image}?width=50&quality=60&fit=contain" alt="${post.title}" class="rounded">
                </div>
                <div class="flex-grow-1 ms-3">
                    <h4 class="mb-2 h6"><a href="blog-details.html?slug=${post.slug}" class="text-white text-primary-hover">${post.title || 'Recent Post'}</a></h4>
                    <span class="text-white opacity8 small">${formattedDate}</span>
                </div>
            `;
            elements.recentPostsContainer.appendChild(recentPostDiv);
        });
    }

    function renderPagination() {
        const totalPages = Math.ceil(state.filteredPosts.length / config.postsPerPage);
        
        // Clear existing pagination
        elements.paginationControls.innerHTML = '';
        
        // Previous button
        const prevLi = document.createElement('li');
        prevLi.innerHTML = `<a href="#posts-container" class="${state.currentPage === 1 ? 'disabled' : ''}"><i class="ti-arrow-left"></i></a>`;
        prevLi.addEventListener('click', (e) => {
            e.preventDefault();
            if (state.currentPage > 1) {
                state.currentPage--;
                renderPosts();
                renderPagination();
            }
        });
        elements.paginationControls.appendChild(prevLi);
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            const pageLi = document.createElement('li');
            if (i === state.currentPage) pageLi.className = 'active';
            pageLi.innerHTML = `<a href="#posts-container">${i.toString().padStart(2, '0')}</a>`;
            pageLi.addEventListener('click', (e) => {
                e.preventDefault();
                state.currentPage = i;
                renderPosts();
                renderPagination();
            });
            elements.paginationControls.appendChild(pageLi);
        }
        
        // Next button
        const nextLi = document.createElement('li');
        nextLi.innerHTML = `<a href="#posts-container" class="${state.currentPage === totalPages ? 'disabled' : ''}"><i class="ti-arrow-right"></i></a>`;
        nextLi.addEventListener('click', (e) => {
            e.preventDefault();
            if (state.currentPage < totalPages) {
                state.currentPage++;
                renderPosts();
                renderPagination();
            }
        });
        elements.paginationControls.appendChild(nextLi);
    }

    function searchPosts() {
        const searchTerm = elements.searchInput.value.toLowerCase();
        
        if (searchTerm === '') {
            state.filteredPosts = [...state.allPosts];
        } else {
            state.filteredPosts = state.allPosts.filter(post => 
                (post.title && post.title.toLowerCase().includes(searchTerm)) ||
                (post.content && post.content.toLowerCase().includes(searchTerm))
            );
        }
        
        state.currentPage = 1;
        renderPosts();
        renderPagination();
    }

    async function getAuthorName(authorId) {
        
        const url = `https://admin.webricktech.com/items/team_members?fields=name&filter[id][_eq]=${authorId}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            if (data.data && data.data.length > 0) {
                return data.data[0].name;
            } else {
                return "Contributor"; // fallback if no author found
            }
        } catch (error) {
            console.error("Error fetching author name:", error);
            return "Contributor";
        }
    }


    function getCategory(post) {
        const categoryMap = {
            'seo': 'SEO',
            'marketing': 'Marketing',
            'serverless': 'Technology',
            'branding': 'Business'
        };
        
        for (const [key, value] of Object.entries(categoryMap)) {
            if (post.slug.includes(key)) return value;
        }
        return 'General';
    }

    function setupEventListeners() {
        // Search functionality
        elements.searchButton.addEventListener('click', searchPosts);
        elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchPosts();
        });
    }
});