$(document).ready(function () {
    initSelect2();

    let lang = currentLang
    let noDataText,
        viewDetailText,
        categoryTypeText,
        rankingLevelText;

    ; (async function () {
        const res = await fetch(`/lang/${lang}.json`);
        if (!res.ok) return;
        const translations = await res.json();

        noDataText = translations['noData']
        viewDetailText = translations['viewDetail']
        categoryTypeText = translations['categoryType']
        rankingLevelText = translations['rankingLevel']

        initializeData();
    })();

    // Hàm format ngày tháng từ ISO string
    function formatDateDisplay(dateString) {
        if (!dateString) return { day: '', monthYear: '' };
        
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        
        return {
            day: day,
            monthYear: `${month}.${year}`
        };
    }

    // Khởi tạo các biến data
    let listSuKien = [];
    let currentPage = 1;
    const itemsPerPage = 12;

    // Hàm khởi tạo và xử lý data chính
    async function initializeData() {
        try {
            const response = await getDataWithApi('GET', `/api/v1/VH_StatisticalApi/StatisticalSuKienVanHoa?MaNgonNgu=${lang}`);

            if (response && response.isSuccess) {
                // Cập nhật data
                listSuKien = response.value || [];

                // Sau khi có data, gọi các hàm render
                renderlistSuKien();
                // Thêm các hàm render khác nếu cần
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    }
    

    //#region Lấy data từ dữ liệu danh sách di tích
    function renderlistSuKien() {   
        if (listSuKien && listSuKien.length > 0) {
            console.log('listSuKien:', listSuKien);
            // Tính toán phân trang
            const totalItems = listSuKien.length;
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const currentItems = listSuKien.slice(startIndex, endIndex);

            // Render danh sách
            let html = '<ul class="event-item">';
            currentItems.forEach(item => {
                // Format ngày tháng
                const dateFormatted = formatDateDisplay(item.batDau);
                let url = lang === 'vi' ? `/VanHoa/SuKienDetail?id=${item.suKienID}` : `/${lang}/VanHoa/SuKienDetail?id=${item.suKienID}`;
                html += `
                    <li class="card-event-item">
                        <div class="item_img">
                            <a href="${url}"><img src="${item.anhDaiDien}" alt="${item.tenSuKien}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';"></a>
                            <div class="event_status expired">${item.tenTrangThai || ''}</div>
                        </div>
                        <div class="item_information">
                            <div class="information_time">
                                <h2 class="information_numbel">${dateFormatted.day}</h2>
                                <h3 class="information_date">${dateFormatted.monthYear}</h3>
                            </div>
                            <div class="information_name">
                                <a class="information_title" href="${url}">${item.tenSuKien}</a> 
                                <div class="information_event">${item.listTenDiaDiem || ''}</div> 
                            </div>
                        </div> 
                    </li>
                `;
            })
            html += '</ul>';
            $('#cardSuKien').html(html);

            // Render pagination nếu có nhiều hơn 12 items
            renderPagination(totalPages, totalItems);
        } else {
            $('#cardSuKien').html(`<p class="text-center">${noDataText}</p>`);
            $('#paginationSuKien').hide();
        }
    }

    function renderPagination(totalPages, totalItems) {
        // Ẩn pagination nếu tổng số items <= 12
        if (totalItems <= itemsPerPage) {
            $('#paginationSuKien').hide();
            return;
        }

        $('#paginationSuKien').show();
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
        $('#paginationSuKien').html(html);

        // Xử lý click pagination
        $('.page-link').on('click', function (e) {
            e.preventDefault();
            const page = parseInt($(this).data('page'));
            if (page && page !== currentPage) {
                currentPage = page;
                renderlistSuKien();
                // Scroll to top of list
                $('html, body').animate({
                    scrollTop: $('#leHoiList').offset().top - 100
                }, 300);
            }
        });
    }
    //#endregion Lấy data từ dữ liệu danh sách di tích
})