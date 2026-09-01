const input = document.getElementById('search-input');
const resultsContainer = document.getElementById('search-results');

if (input && resultsContainer) {
  let pagefindInstance = null;
  let debounceTimeout;

  document.addEventListener('click', (e) => {
    if (
      !input.contains(e.target) &&
      !resultsContainer.contains(e.target)
    ) {
      resultsContainer.style.display = 'none';
    }
  });

  input.addEventListener('focus', () => {
    if (input.value.trim() !== '') {
      resultsContainer.style.display = 'block';
    }
  });

  input.addEventListener('input', (e) => {
    clearTimeout(debounceTimeout);

    debounceTimeout = setTimeout(async () => {
      const query = e.target.value.trim();

      if (!query) {
        resultsContainer.innerHTML = '';
        resultsContainer.style.display = 'none';
        return;
      }

      try {
        if (!pagefindInstance) {
          // Como este arquivo está em /public, o Vite não processa este import.
          pagefindInstance = await import('/pagefind/pagefind.js');
        }

        const search = await pagefindInstance.search(query);

        const results = await Promise.all(
          search.results.map((result) => result.data())
        );

        resultsContainer.style.display = 'block';

        if (results.length === 0) {
          resultsContainer.innerHTML =
            '<p class="no-results">Nenhum resultado encontrado.</p>';
          return;
        }

        resultsContainer.innerHTML = results
          .map(
            (page) => `
              <div class="result-item">
                <a href="${page.url}">
                  <h4>${page.meta.title || 'Página'}</h4>
                  <p>${page.excerpt || ''}</p>
                </a>
              </div>
            `
          )
          .join('');
      } catch (err) {
        console.error('Erro do Pagefind:', err);

        resultsContainer.innerHTML = `
          <p class="no-results" style="color: #ff6b6b; font-size: 0.8rem;">
            Erro na busca: ${err.message}
          </p>
        `;

        resultsContainer.style.display = 'block';
      }
    }, 300);
  });
}