$(document).ready(function () {
    initSelect2();

    let lang = currentLang
    let viewDetailText,
        noDataText,
        phoneText,
        workExperienceText,
        yearText,
        foreignLanguageText,
        contactText,
        updatingText;

    ; (async function () {
        const res = await fetch(`/lang/${lang}.json`);
        if (!res.ok) return;
        const translations = await res.json();

        viewDetailText = translations['viewDetail']
        updatingText = translations['updating']
        noDataText = translations['noData']
        phoneText = translations['phone']
        workExperienceText = translations['workExperience']
        yearText = translations['year']
        foreignLanguageText = translations['foreignLanguage']
        contactText = translations['contact']

        initializeData();
    })();

    // Khởi tạo các biến data
    let listHDVDuLich = [];
    let currentPage = 1;
    const itemsPerPage = 9;

    // Hàm khởi tạo và xử lý data chính
    async function initializeData() {
        try {
            const response = await getDataWithApi('GET', `/api/v1/DL_StatisticalApi/StatisticalHuongDanVien?MaNgonNgu=${lang}`);
            console.log(response)
            if (response && response.isSuccess) {
                // Cập nhật data
                listHDVDuLich = response.value || [];

                // Sau khi có data, gọi các hàm render
                renderlistHDVDuLich();
                // Thêm các hàm render khác nếu cần
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    }

    //#region Lấy data từ dữ liệu danh sách di tích
    function renderlistHDVDuLich() {   
        if (listHDVDuLich && listHDVDuLich.length > 0) {
            // Tính toán phân trang
            const totalItems = listHDVDuLich.length;
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const currentItems = listHDVDuLich.slice(startIndex, endIndex);

            // Render danh sách
            let html = '';
            currentItems.forEach(item => {
                let url = lang === 'vi' ? `/DuLich/HDVDuLichDetail?id=${item.caNhanID}` : `/${lang}/DuLich/HDVDuLichDetail?id=${item.caNhanID}`;
                html += `
                    <div class="card-item-human">
                        <div class="group_info">
                            <div class="anhDaiDien">
                                <img class="anhDaiDien_Nguoi" src="${item.anhChanDung || '/assets/images/vector/no-image.png'}" alt="${item.hoTen || ''}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                            </div>
                            <div class="thongTinHDV">
                                <div class="hdv-name">${item.hoTen}</div>
                                <div class="hdv-sdt"><label><i class="hgi-icon hgi-phone-label"></i>${phoneText}: </label>${item.dienThoai || "-"}</div>
                                <div class="hdv-kinhnghiem"><label><i class="hgi-icon hgi-certificate-label"></i>${workExperienceText}: </label>${item.namKinhNghiem == null ? "-" : `${item.namKinhNghiem} ${yearText}`}</div>
                                <div class="hdv-ngoaingu"><label><i class="hgi-icon hgi-globe-label"></i>${foreignLanguageText}: </label>${item.ngoaiNgu || "-"}</div>
                            </div>
                        </div>
                        <div class="group_function">
                            ${item.dienThoai ? `<div class="lienHe"><a class="phone" href="tel:${item.dienThoai}">${contactText}</a></div>` : ''}
                            <div class="chitiet">
                                <a href="${url}">${viewDetailText}</a>
                            </div>
                        </div>
                    </div>
                `;
            })
            html += '</ul>';
            $('#card-list-HDVDuLich').html(html);

            // Render pagination nếu có nhiều hơn 12 items
            renderPagination(totalPages, totalItems);
        } else {
            $('#card-list-HDVDuLich').html(`<p class="text-center">${noDataText}</p>`);
            $('#paginationHDVDuLich').hide();
        }
    }

    function renderPagination(totalPages, totalItems) {
        // Ẩn pagination nếu tổng số items <= 12
        if (totalItems <= itemsPerPage) {
            $('#paginationHDVDuLich').hide();
            return;
        }

        $('#paginationHDVDuLich').show();
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
        $('#paginationHDVDuLich').html(html);

        // Xử lý click pagination
        $('.page-link').on('click', function (e) {
            e.preventDefault();
            const page = parseInt($(this).data('page'));
            if (page && page !== currentPage) {
                currentPage = page;
                renderlistHDVDuLich();
                // Scroll to top of list
                $('html, body').animate({
                    scrollTop: $('#leHoiList').offset().top - 100
                }, 300);
            }
        });
    }
    //#endregion Lấy data từ dữ liệu danh sách di tích
})