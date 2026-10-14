$(document).ready(function () {
    initSelect2();

    let lang = currentLang
    let noDataText,
        viewDetailText

        ; (async function () {
            const res = await fetch(`/lang/${lang}.json`);
            if (!res.ok) return;
            const translations = await res.json();

            noDataText = translations['noData']
            viewDetailText = translations['viewDetail']

            initializeData();
        })();

    // Khởi tạo các biến data
    let listAmThuc = [];
    let fullListAmThuc = []; // Lưu data gốc
    let currentPage = 1;
    const itemsPerPage = 9;

    // Hàm lọc data
    function filterData() {
        // Lấy giá trị từ input search
        const tuKhoa = $('#searchBar').val().trim();
        
        // Lấy các checkbox đã chọn
        const kieuMonChecked = $('input[id^="kieuMon_"]:checked').map(function() {
            return $(this).val();
        }).get();
        
        const cheDoAnChecked = $('input[id^="cheDoAn_"]:checked').map(function() {
            return $(this).val();
        }).get();

        // Gọi API với params
        const params = new URLSearchParams({
            MaNgonNgu: lang
        });

        if (tuKhoa) params.append('TuKhoa', tuKhoa);
        if (kieuMonChecked.length > 0) params.append('kieuMonID', kieuMonChecked.join(','));
        if (cheDoAnChecked.length > 0) params.append('cheDoAnID', cheDoAnChecked.join(','));

        // Gọi API
        getDataWithApi('GET', `/api/v1/VH_StatisticalApi/StatisticalAmThuc?${params}`)
            .then(response => {
                if (response && response.isSuccess) {
                    listAmThuc = response.value || [];
                    currentPage = 1; // Reset về trang 1
                    renderlistAmThuc();
                }
            })
            .catch(error => {
                console.error('Error filtering data:', error);
            });
    }

    // Event listener cho các checkbox
    $(document).on('change', '.filter_Checkbox', function() {
        filterData();
    });

    // Debounce timer cho search input
    let searchTimeout = null;

    // Event listener cho search input
    $(document).on('keypress', '#searchBar', function(e) {
        if (e.which === 13) { // Enter key
            e.preventDefault();
            clearTimeout(searchTimeout); // Hủy bộ đếm nếu có
            filterData();
        }
    });

    // Event listener cho input (tự động search sau 0.5 giây)
    $(document).on('input', '#searchBar', function() {
        clearTimeout(searchTimeout); // Hủy bộ đếm cũ
        searchTimeout = setTimeout(function() {
            filterData();
        }, 500); // 0.5 giây
    });

    // Event listener cho nút search (nếu có)
    $(document).on('click', '#btnSearch', function() {
        clearTimeout(searchTimeout); // Hủy bộ đếm nếu có
        filterData();
    });
    
    // Hàm khởi tạo và xử lý data chính
    async function initializeData() {
        try {
            const response = await getDataWithApi('GET', `/api/v1/VH_StatisticalApi/StatisticalAmThuc?MaNgonNgu=${lang}`);

            if (response && response.isSuccess) {
                // Lấy data để tạo bảng lọc
                let listFilter_kieuMon = await initDanhMuc_Filter(62); // Loại cơ sở lưu trú
                let listFilter_cheDoAn = await initDanhMuc_Filter(63); // Phong cách cơ sở

                // Render và append các filter (sử dụng function từ Layout_TrinhDien.js)
                $('#sidebarFilter').append(renderFilter(listFilter_kieuMon, 'kieuMon', 'Kiểu món'));
                $('#sidebarFilter').append(renderFilter(listFilter_cheDoAn, 'cheDoAn', 'Chế độ ăn'));

                // Cập nhật data
                listAmThuc = response.value || [];
                fullListAmThuc = response.value || []; // Lưu data gốc

                // Sau khi có data, gọi các hàm render
                renderlistAmThuc();
                // Thêm các hàm render khác nếu cần
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    }
   

    //#region Lấy data từ dữ liệu danh sách di tích
    function renderlistAmThuc() {   
        if (listAmThuc && listAmThuc.length > 0) {
            // Tính toán phân trang
            const totalItems = listAmThuc.length;
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const currentItems = listAmThuc.slice(startIndex, endIndex);

            // Render danh sách
            let html = '';
            currentItems.forEach(item => {
                let url = lang === 'vi' ? `/VanHoa/AmThucDetail?id=${item.monAnUongID}` : `/${lang}/VanHoa/AmThucDetail?id=${item.monAnUongID}`;
                html += `
                    <div class="destination-content">
                        <div class="destination-news">
                            <a class="" href="${url}">
                                <div class="overlay border-radius"></div>
                                <img src="${item.anhDaiDien}" data-lazy data-src="${item.anhDaiDien}" class="destination-img" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';">
                            </a>
                            <div class="destination-description">
                                <div class="destination-link">
                                    <span class="destination-title">${item.tenMon}</span>
                                </div>
                            </div>
                            <div class="destination-caption">
                                <div class="destination-link">
                                    <span class="destination-title">${item.tenMon}</span>
                                </div>
                                <div class="destination-summary">
                                    <span class="destination-content">${item.moTa}</span>
                                </div>
                                <div class="main-destination-detail main-btn">
                                    <div class="btn-destination">
                                        <a class="destination-details btn-details" href="${url}"><span>${viewDetailText}</span></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            })
            html += '</ul>';
            $('#gridAmThuc').html(html);

            // Render pagination nếu có nhiều hơn 12 items
            renderPagination(totalPages, totalItems);
        } else {
            $('#gridAmThuc').html(`<p class="text-center">${noDataText}</p>`);
            $('#paginationAmThuc').hide();
        }
    }

    function renderPagination(totalPages, totalItems) {
        // Ẩn pagination nếu tổng số items <= 12
        if (totalItems <= itemsPerPage) {
            $('#paginationAmThuc').hide();
            return;
        }

        $('#paginationAmThuc').show();
        let html = '<ul class="pagination justify-content-center">';
        
        // Nút Previous
        if (currentPage > 1) {
            html += `<li class="page-item">
                        <a class="page-link" href="#" data-page="${currentPage - 1}">
                            <i class="hgi-icon hgi-chevron-left"></i>
                        </a>
                    </li>`;
        }
        
        // Các số trang
        for (let i = 1; i <= totalPages; i++) {
            // Hiển thị trang đầu, trang cuối, trang hiện tại và 2 trang xung quanh
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                html += `<li class="page-item ${i === currentPage ? 'active' : ''}">
                            <a class="page-link" href="#" data-page="${i}">${i}</a>
                        </li>`;
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                html += `<li class="page-item disabled">
                            <span class="page-link">...</span>
                        </li>`;
            }
        }
        
        // Nút Next
        if (currentPage < totalPages) {
            html += `<li class="page-item">
                        <a class="page-link" href="#" data-page="${currentPage + 1}">
                            <i class="hgi-icon hgi-chevron-right"></i>
                        </a>
                    </li>`;
        }
        
        html += '</ul>';
        $('#paginationAmThuc').html(html);

        // Xử lý click pagination
        $('.page-link').on('click', function (e) {
            e.preventDefault();
            const page = parseInt($(this).data('page'));
            if (page && page !== currentPage) {
                currentPage = page;
                renderlistAmThuc();
                // Scroll to top of list
                $('html, body').animate({
                    scrollTop: $('#leHoiList').offset().top - 100
                }, 300);
            }
        });
    }
    //#endregion Lấy data từ dữ liệu danh sách di tích
})