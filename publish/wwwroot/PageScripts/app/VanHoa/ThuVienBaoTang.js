$(document).ready(function () {
    initSelect2();

    let lang = currentLang
    let noDataText,
        viewDetailText;

    ; (async function () {
        const res = await fetch(`/lang/${lang}.json`);
        if (!res.ok) return;
        const translations = await res.json();

        noDataText = translations['noData']
        viewDetailText = translations['viewDetail']


        initializeData();
    })();

    // Khởi tạo các biến data
    let listThuVienBaoTang = [];
    let currentPage = 1;
    const itemsPerPage = 12;

    // Hàm khởi tạo và xử lý data chính
    async function initializeData() {
        try {
            const response = await getDataWithApi('GET', `/api/v1/VH_StatisticalApi/StatisticalBaoTangAndThuVien?MaNgonNgu=${lang}`);

            if (response && response.isSuccess) {
                // Cập nhật data
                listThuVienBaoTang = response.value || [];

                // Sau khi có data, gọi các hàm render
                renderlistThuVienBaoTang();
                // Thêm các hàm render khác nếu cần
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    }

    //#region Lấy data từ dữ liệu danh sách di tích
    function renderlistThuVienBaoTang() {   
        if (listThuVienBaoTang && listThuVienBaoTang.length > 0) {
            // Tính toán phân trang
            const totalItems = listThuVienBaoTang.length;
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const currentItems = listThuVienBaoTang.slice(startIndex, endIndex);

            // Render danh sách
            let html = '<ul class="listcard-item">';
            currentItems.forEach(item => {
                let url = lang === 'vi' ? `/VanHoa/ThuVienBaoTangDetail?id=${item.toChucID}` : `/${lang}/VanHoa/ThuVienBaoTangDetail?id=${item.toChucID}`;
                html += `
                    <li class="card-item">
                        <div class="card-image">
                            <a href="${url}">
                                <img src="${item.anhDaiDien}" alt="${item.tenToChuc}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';">
                                <div class="card-title">${item.tenToChuc}</div>
                            </a>
                        </div>
                        <div class="card-body">
                            ${item.diaChi ? `<div class="card-address"><i class="hgi-icon hgi-address"></i>${item.diaChi || ''}</div>` : ``}
                            ${item.dienThoai ? `<div class="card-phone"><i class="hgi-icon hgi-phone"></i><a href="tel:${item.dienThoai}">${item.dienThoai || ''}</a></div>` : ``}
                            ${item.hopThu ? `<div class="card-mail"><i class="hgi-icon hgi-mail"></i><a href="mailto:${item.hopThu}">${item.hopThu || ''}</a></div>` : ``}
                            ${item.website ? `<div class="card-web"><i class="hgi-icon hgi-web"></i><a href="${item.website}">${item.website || ''}</a></div>` : ``}
                        </div>
                        <div class="chitiet">
                            <a href="${url}" data-i18n="common.viewDetail" tabindex="0">${viewDetailText}</a>
                        </div>
                    </li>
                `;
            })
            html += '</ul>';
            $('#cardThuVienBaoTang').html(html);

            // Render pagination nếu có nhiều hơn 12 items
            renderPagination(totalPages, totalItems);
        } else {
            $('#cardThuVienBaoTang').html(`<p class="text-center">${viewDetailText}</p>`);
            $('#paginationThuVienBaoTang').hide();
        }
    }

    function renderPagination(totalPages, totalItems) {
        // Ẩn pagination nếu tổng số items <= 12
        if (totalItems <= itemsPerPage) {
            $('#paginationThuVienBaoTang').hide();
            return;
        }

        $('#paginationThuVienBaoTang').show();
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
        $('#paginationThuVienBaoTang').html(html);

        // Xử lý click pagination
        $('.page-link').on('click', function (e) {
            e.preventDefault();
            const page = parseInt($(this).data('page'));
            if (page && page !== currentPage) {
                currentPage = page;
                renderlistThuVienBaoTang();
                // Scroll to top of list
                $('html, body').animate({
                    scrollTop: $('#leHoiList').offset().top - 100
                }, 300);
            }
        });
    }
    //#endregion Lấy data từ dữ liệu danh sách di tích
})