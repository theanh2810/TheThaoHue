$(document).ready(function () {
    initSelect2();
    let currentPage = 1;
    const pageSize = 12;

    let lang = currentLang
    let noDataText,
        viewDetailText;

    ; (async function () {
        const res = await fetch(`/lang/${lang}.json`);
        if (!res.ok) return;
        const translations = await res.json();

        noDataText = translations['noData']
        viewDetailText = translations['viewDetail']

        loadTacPhamList()
    })();

    $('#searchKeyword').on('keyup', debounce(function () {
        currentPage = 1;
        loadTacPhamList();
    }, 500));

    $('#filterTheLoai').on('change', function () {
        currentPage = 1;
        loadTacPhamList();
    });

    function loadTacPhamList() {
        const keyword = $('#searchKeyword').val();
        const theLoai = $('#filterTheLoai').val();

        const requestData = {
            pageIndex: currentPage,
            pageSize: pageSize,
            maNgonNgu: lang,
            keyword: keyword
        };

        getDataWithApi('POST', '/api/TacPhamApi/v1/GetsPaging', JSON.stringify(requestData))
            .then(response => {
                if (response && response.isSuccess) {
                    renderTacPhamList(response.value);
                    renderPagination(response.totalPages || 1);
                }
            })
            .catch(error => {
                console.error('Error loading tac pham list:', error);
            });
    }

    function renderTacPhamList(data) {
        let html = '';
        
        if (data && data.length > 0) {
            data.forEach(item => {
                html += `
                    <div class="col-md-4 col-sm-6 mb-4">
                        <div class="card-item">
                            <a href="/${lang}/VanHoa/TacPhamNgheNhatDetail?id=${item.tacPhamID}">
                                <div class="card-image">
                                    <img src="${item.anhDaiDien || '/assets/images/vector/no-image.png'}" 
                                         alt="${item.tenTacPham}"
                                         onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';">
                                </div>
                                <div class="card-body">
                                    <span class="card-category">${item.theLoai || ''}</span>
                                    <h3 class="card-title">${item.tenTacPham}</h3>
                                    <div class="card-author">${item.tacGia || ''}</div>
                                    <p class="card-text">${item.moTa || ''}</p>
                                </div>
                            </a>
                        </div>
                    </div>
                `;
            });
        } else {
            html = `<div class="col-12"><p class="text-center">${noDataText}</p></div>`;
        }

        $('#tacPhamList').html(html);
    }

    function renderPagination(totalPages) {
        let html = '<ul class="pagination">';
        
        for (let i = 1; i <= totalPages; i++) {
            html += `<li class="page-item ${i === currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" data-page="${i}">${i}</a>
                     </li>`;
        }
        
        html += '</ul>';
        $('#paginationTacPham').html(html);

        $('.page-link').on('click', function (e) {
            e.preventDefault();
            currentPage = parseInt($(this).data('page'));
            loadTacPhamList();
        });
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
});
