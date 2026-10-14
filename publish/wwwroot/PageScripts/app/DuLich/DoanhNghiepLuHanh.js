$(document).ready(function () {
    initSelect2();

    let lang = currentLang
    let viewDetailText,
        noDataText,
        updatingText;

    ; (async function () {
        const res = await fetch(`/lang/${lang}.json`);
        if (!res.ok) return;
        const translations = await res.json();

        viewDetailText = translations['viewDetail']
        updatingText = translations['updating']
        noDataText = translations['noData']

        initializeData();
    })();


    // Khởi tạo các biến data
    let listDoanhNghiepLuHanh = [];
    let currentPage = 1;
    const itemsPerPage = 12;

    // Hàm khởi tạo và xử lý data chính
    async function initializeData() {
        let request = {
            "maNgonNgu": lang,
            "loaiToChucID": 310
        }

        try {
            const response = await getDataWithApi('POST', `/api/ToChucApi/DanhSach_TrinhDien`, JSON.stringify(request));

            if (response && response.isSuccess) {
                // Cập nhật data
                listDoanhNghiepLuHanh = response.value || [];

                // Sau khi có data, gọi các hàm render
                renderlistDoanhNghiepLuHanh();
                // Thêm các hàm render khác nếu cần
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    }

    //#region Lấy data từ dữ liệu danh sách doanh nghiệp lữ hành
    function renderlistDoanhNghiepLuHanh() {   
        if (listDoanhNghiepLuHanh && listDoanhNghiepLuHanh.length > 0) {
            // Tính toán phân trang
            const totalItems = listDoanhNghiepLuHanh.length;
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const currentItems = listDoanhNghiepLuHanh.slice(startIndex, endIndex);

            // Render danh sách
            let html = '<ul class="listcard-item">';
            currentItems.forEach(item => {
                let url = lang === "vi" ? `/DuLich/DoanhNghiepLuHanhDetail?id=${item.toChucID}` : `/${lang}/DuLich/DoanhNghiepLuHanhDetail?id=${item.toChucID}`;
                html += `
                    <li class="card-item-organization">
                        <div class="tag">
                            <div class="tag_type">${item.loaiHinh}</div>
                            <div class="tag_action">
                                ${item.dienThoai ? `<a class="tag_link" href="tel:${item.dienThoai}"><i class="hgi-icon hgi-phone"></i></a>` : ''}
                                ${item.hopThu ? `<a class="tag_link" href="mailto:${item.hopThu}"><i class="hgi-icon hgi-mail"></i></a>` : ''}
                                ${item.website ? `<a class="tag_link" href="${item.website}"><i class="hgi-icon hgi-web"></i></a>` : ''}
                            </div>
                        </div>
                        <div class="tieuDe">
                            <div class="organization-name">${item.tenToChuc}</div>
                            <div class="organization-address">${item.diaChi}</div>
                        </div>
                        <div class="tomTat">
                            ${item.gioiThieu ? item.gioiThieu : updatingText}
                        </div>
                        <div class="lienHe">
                            ${item.dienThoai ? `<a class="phone" href="tel:${item.dienThoai}"><i class="hgi-icon hgi-phone"></i>${item.dienThoai}</a>` : ''}
                            ${item.hopThu ? `<a class="mail" href="mailto:${item.hopThu}"><i class="hgi-icon hgi-mail"></i>${item.hopThu}</a>` : ''}
                            ${item.website ? `<a class="website" href="${item.website}"><i class="hgi-icon hgi-web"></i>${item.website}</a>` : ''}
                        </div>
                        <div class="chitiet">
                            <a href="${url}">${viewDetailText}</a>
                        </div>
                    </li>
                `;
            })
            html += '</ul>';
            $('#cardDoanhNghiepLuHanh').html(html);

            // Render pagination nếu có nhiều hơn 12 items
            renderPagination(totalPages, totalItems);
        } else {
            $('#cardDoanhNghiepLuHanh').html(`<p class="text-center">${noDataText}</p>`);
            $('#paginationDoanhNghiepLuHanh').hide();
        }
    }

    function renderPagination(totalPages, totalItems) {
        // Ẩn pagination nếu tổng số items <= 12
        if (totalItems <= itemsPerPage) {
            $('#paginationDoanhNghiepLuHanh').hide();
            return;
        }

        $('#paginationDoanhNghiepLuHanh').show();
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
        $('#paginationDoanhNghiepLuHanh').html(html);

        // Xử lý click pagination
        $('.page-link').on('click', function (e) {
            e.preventDefault();
            const page = parseInt($(this).data('page'));
            if (page && page !== currentPage) {
                currentPage = page;
                renderlistDoanhNghiepLuHanh();
                // Scroll to top of list
                $('html, body').animate({
                    scrollTop: $('#cardDoanhNghiepLuHanh').offset().top - 100
                }, 300);
            }
        });
    }
    //#endregion Lấy data từ dữ liệu danh sách doanh nghiệp lữ hành
})