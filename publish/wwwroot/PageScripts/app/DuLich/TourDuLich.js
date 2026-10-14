$(document).ready(function () {
    initSelect2();

    let lang = currentLang
    let viewDetailText,
        noDataText,
        genreText,
        categoryTypeText,
        transportationText,
        segmentText,
        updatingText;

    ; (async function () {
        const res = await fetch(`/lang/${lang}.json`);
        if (!res.ok) return;
        const translations = await res.json();

        viewDetailText = translations['viewDetail']
        updatingText = translations['updating']
        noDataText = translations['noData']

        genreText = translations['genre']
        categoryTypeText = translations['categoryType']
        transportationText = translations['transportation']
        segmentText = translations['segment']


        initializeData();
    })();

    // Khởi tạo các biến data
    let listTourDuLich = [];
    let currentPage = 1;
    const itemsPerPage = 9;

    // Hàm lọc data
    function filterData() {
        // Lấy giá trị từ input search
        const tuKhoa = $('#searchBar').val().trim();
        
        // Lấy các checkbox đã chọn
        const loaiHinhChecked = $('input[id^="loaiHinh_"]:checked').map(function() {
            return $(this).val();
        }).get();
        
        const phuongTienChecked = $('input[id^="phuongTien_"]:checked').map(function() {
            return $(this).val();
        }).get();

        const phanKhucChecked = $('input[id^="phanKhuc_"]:checked').map(function() {
            return $(this).val();
        }).get();
        
        const theLoaiChecked = $('input[id^="theLoai_"]:checked').map(function() {
            return $(this).val();
        }).get();

        // Gọi API với params
        const params = new URLSearchParams({
            MaNgonNgu: lang
        });

        if (tuKhoa) params.append('TuKhoa', tuKhoa);
        if (phanKhucChecked.length > 0) params.append('PhanKhucID', phanKhucChecked.join(','));
        if (theLoaiChecked.length > 0) params.append('TheLoaiID', theLoaiChecked.join(','));
        if (loaiHinhChecked.length > 0) params.append('LoaiHinhID', loaiHinhChecked.join(','));
        if (phuongTienChecked.length > 0) params.append('PhuongTienID', phuongTienChecked.join(','));

        // Gọi API
        getDataWithApi('GET', `/api/v1/DL_StatisticalApi/StatisticalTourDuLich?${params}`)
            .then(response => {
                if (response && response.isSuccess) {
                    listTourDuLich = response.value || [];
                    currentPage = 1; // Reset về trang 1
                    renderlistTourDuLich();
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
            const response = await getDataWithApi('GET', `/api/v1/DL_StatisticalApi/StatisticalTourDuLich?MaNgonNgu=${lang}`);

            if (response && response.isSuccess) {
                // Lấy data để tạo bảng lọc
                let listFilter_loaiHinh = await initDanhMuc_Filter(81);
                let listFilter_phuongTien = await initDanhMuc_Filter(82); 
                let listFilter_phanKhuc = await initDanhMuc_Filter(80); 
                let listFilter_theLoai = await initDanhMuc_Filter(83); 

                // Render và append các filter (sử dụng function từ Layout_TrinhDien.js)
                $('#sidebarFilter').append(renderFilter(listFilter_theLoai, 'theLoai', genreText));
                $('#sidebarFilter').append(renderFilter(listFilter_loaiHinh, 'loaiHinh', categoryTypeText));
                $('#sidebarFilter').append(renderFilter(listFilter_phuongTien, 'phuongTien', transportationText));
                $('#sidebarFilter').append(renderFilter(listFilter_phanKhuc, 'phanKhuc', segmentText));

                // Cập nhật data
                listTourDuLich = response.value || [];

                // Sau khi có data, gọi các hàm render
                renderlistTourDuLich();
                // Thêm các hàm render khác nếu cần
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    }

    //#region Lấy data từ dữ liệu danh sách lưu trú
    function renderlistTourDuLich() {   
        if (listTourDuLich && listTourDuLich.length > 0) {
            // Tính toán phân trang
            const totalItems = listTourDuLich.length;
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const currentItems = listTourDuLich.slice(startIndex, endIndex);

            // Render danh sách
            let html = `<ul class="tourList">`;
            currentItems.forEach(item => {
                let url = lang === vi ? `/DuLich/TourDuLichDetail?id=${item.tourID}` : `/${lang}/DuLich/TourDuLichDetail?id=${item.tourID}`;
                html += `
                    <li class="card-item-tour">
                        <div class="image_tour">
                            <a href="${url}"><img src="${item.anhDaiDien || '/assets/images/vector/no-image.png'}" alt="${item.tenTour || ''}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" /></a>
                        </div>
                        <div class="tour-info">
                            <div class="tour-name"><a href="${url}">${item.tenTour || ''}</a></div>
                            <div class="tour-summary">
                                ${item.moTa || updatingText}
                            </div>
                        </div>
                    </li>
                `
            })
            html += '</ul>';
            $('#tour-list').html(html);

            // Render pagination nếu có nhiều hơn 12 items
            renderPagination(totalPages, totalItems);
        } else {
            $('#tour-list').html(`<p class="text-center">${noDataText}</p>`);
            $('#paginationTourDuLich').hide();
        }
    }

    function renderPagination(totalPages, totalItems) {
        // Ẩn pagination nếu tổng số items <= 12
        if (totalItems <= itemsPerPage) {
            $('#paginationTourDuLich').hide();
            return;
        }

        $('#paginationTourDuLich').show();
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
        $('#paginationTourDuLich').html(html);

        // Xử lý click pagination
        $('.page-link').on('click', function (e) {
            e.preventDefault();
            const page = parseInt($(this).data('page'));
            if (page && page !== currentPage) {
                currentPage = page;
                renderlistTourDuLich();
                // Scroll to top of list
                $('html, body').animate({
                    scrollTop: $('#leHoiList').offset().top - 100
                }, 300);
            }
        });
    }
    //#endregion Lấy data từ dữ liệu danh sách di tích
})