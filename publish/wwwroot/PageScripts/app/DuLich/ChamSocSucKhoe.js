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
    let listChamSocSucKhoe = [];
    let currentPage = 1;
    const itemsPerPage = 12;

    // Hàm khởi tạo và xử lý data chính
    async function initializeData() {
        try {
            const response = await getDataWithApi('GET', `/api/v1/DL_StatisticalApi/StatisticalCoSoTraiNghiem?MaNgonNgu=${lang}&LoaiHinhCoSoID=194`);

            if (response && response.isSuccess) {
                // Cập nhật data
                listChamSocSucKhoe = response.value || [];

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
        if (listChamSocSucKhoe && listChamSocSucKhoe.length > 0) {
            // Tính toán phân trang
            const totalItems = listChamSocSucKhoe.length;
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const currentItems = listChamSocSucKhoe.slice(startIndex, endIndex);

            // Render danh sách
            let html = '';
            currentItems.forEach(item => {
                let url = lang === 'vi' ? `/DuLich/ChamSocSucKhoeDetail?id=${item.coSoDichVuID}` : `/${lang}/DuLich/ChamSocSucKhoeDetail?id=${item.coSoDichVuID}`;
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
            $('#gridChamSocSucKhoe').html(html);

            // Render pagination nếu có nhiều hơn 12 items
            renderPagination(totalPages, totalItems);
        } else {
            $('#gridChamSocSucKhoe').html(`<p class="text-center">${noDataText}</p>`);
            $('#paginationChamSocSucKhoe').hide();
        }
    }

    function renderPagination(totalPages, totalItems) {
        // Ẩn pagination nếu tổng số items <= 12
        if (totalItems <= itemsPerPage) {
            $('#paginationChamSocSucKhoe').hide();
            return;
        }

        $('#paginationChamSocSucKhoe').show();
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
        $('#paginationChamSocSucKhoe').html(html);

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