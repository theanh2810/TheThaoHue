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
    let listVuiChoiGiaiTri = [];
    let currentPage = 1;
    const itemsPerPage = 12;

    // Hàm lọc data
    function filterData() {
        // Lấy giá trị từ input search
        const tuKhoa = $('#searchBar').val().trim();

        // Gọi API với params
        const params = new URLSearchParams({
            MaNgonNgu: lang
        });

        if (tuKhoa) params.append('TuKhoa', tuKhoa);

        // Gọi API
        getDataWithApi('GET', `/api/v1/DL_StatisticalApi/StatisticalCoSoTraiNghiem?LoaiHinhCoSoID=196&${params}`)
            .then(response => {
                if (response && response.isSuccess) {
                    listVuiChoiGiaiTri = response.value || [];
                    currentPage = 1; // Reset về trang 1
                    renderlistDiTich();
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
            const response = await getDataWithApi('GET', `/api/v1/DL_StatisticalApi/StatisticalCoSoTraiNghiem?MaNgonNgu=${lang}&LoaiHinhCoSoID=196`);

            if (response && response.isSuccess) {
                // Cập nhật data
                listVuiChoiGiaiTri = response.value || [];

                // Sau khi có data, gọi các hàm render
                renderlistDiTich();
                // Thêm các hàm render khác nếu cần
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    }
    //#region Lấy data từ dữ liệu danh sách di tích
    function renderlistDiTich() {   
        if (listVuiChoiGiaiTri && listVuiChoiGiaiTri.length > 0) {
            // Tính toán phân trang
            const totalItems = listVuiChoiGiaiTri.length;
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const currentItems = listVuiChoiGiaiTri.slice(startIndex, endIndex);

            // Render danh sách
            let html = '';
            currentItems.forEach(item => {
                let url = lang === 'vi' ? `/DuLich/VuiChoiGiaiTriDetail?id=${item.coSoDichVuID}` : `/${lang}/DuLich/VuiChoiGiaiTriDetail?id=${item.coSoDichVuID}`;
                html += `
                    <div class="destination-content">
                        <div class="destination-news">
                            <a class="" href="${url}">
                                <div class="overlay border-radius"></div>
                                <img src="${item.anhDaiDien}" data-lazy data-src="${item.anhDaiDien}" class="destination-img" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';">
                            </a>
                            <div class="destination-description">
                                <div class="destination-link">
                                    <span class="destination-title">${item.tenCoSo}</span>
                                    <span class="destination-address">${item.diaChi}</span>
                                </div>
                            </div>
                            <div class="destination-caption">
                                <div class="destination-link">
                                    <span class="destination-title">${item.tenCoSo}</span>
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
            $('#gridVuiChoiGiaiTri').html(html);

            // Render pagination nếu có nhiều hơn 12 items
            renderPagination(totalPages, totalItems);
        } else {
            $('#gridVuiChoiGiaiTri').html(`<p class="text-center">${noDataText}/p>`);
            $('#paginationVuiChoiGiaiTri').hide();
        }
    }

    function renderPagination(totalPages, totalItems) {
        // Ẩn pagination nếu tổng số items <= 12
        if (totalItems <= itemsPerPage) {
            $('#paginationVuiChoiGiaiTri').hide();
            return;
        }

        $('#paginationVuiChoiGiaiTri').show();
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
        $('#paginationVuiChoiGiaiTri').html(html);

        // Xử lý click pagination
        $('.page-link').on('click', function (e) {
            e.preventDefault();
            const page = parseInt($(this).data('page'));
            if (page && page !== currentPage) {
                currentPage = page;
                renderlistDiTich();
                // Scroll to top of list
                $('html, body').animate({
                    scrollTop: $('#leHoiList').offset().top - 100
                }, 300);
            }
        });
    }
    //#endregion Lấy data từ dữ liệu danh sách di tích
})