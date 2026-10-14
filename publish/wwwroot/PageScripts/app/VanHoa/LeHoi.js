$(document).ready(function () {
    initSelect2();
    let lang = currentLang
    let viewDetailText,
        updatingText;

    ; (async function () {
        const res = await fetch(`/lang/${lang}.json`);
        if (!res.ok) return;
        const translations = await res.json();

        viewDetailText = translations['viewDetail']
        updatingText = translations['updating']
        initializeData();
    })();

    // Khởi tạo các biến data
    let listLeHoi = [];
    let countLeHoi = [];
    let currentPage = 1;
    const itemsPerPage = 12;

    // Hàm khởi tạo và xử lý data chính
    async function initializeData() {
        try {
            const response = await getDataWithApi('GET', `/api/v1/VH_StatisticalApi/StatisticalLeHoiVanHoa?MaNgonNgu=${lang}`);

            if (response && response.isSuccess) {
                // Cập nhật data
                countLeHoi = response.value.countLeHoi || [];
                listLeHoi = response.value.listLeHoi || [];

                // Sau khi có data, gọi các hàm render
                renderLeHoi();
                renderCountLeHoi();
                renderListLeHoi();
                // Thêm các hàm render khác nếu cần
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    }

    //#region Lấy data từ dữ liệu danh sách lễ hội
    function renderLeHoi() {
        if (listLeHoi && listLeHoi.length > 0) {
            let html = `<div class="slick-event">`
            listLeHoi.forEach(item => {
                let url = lang === 'vi' ? `/VanHoa/LeHoiDetail?id=${item.leHoiID}` : `/${lang}/VanHoa/LeHoiDetail?id=${item.leHoiID}`;
                html += `
                    <div class="news_list__first slick-event-item">
                        <div class="news_list__first__content col-md-5">
                            <div class="new_traditional_fetival" id="tenloailehoi">
                                <div class="new_traditional_conten">${item.theLoai}</div>
                            </div>
                            <div class="news_link_bold" id="tenlehoiid"> 
                                <a class="news_link_bold" href="${url}">${item.tenLeHoiChild}</a>
                            </div>
                            <div class="news_info_content">
                                <div class="new_traditional_conten"><i class="hgi-icon hgi-calendar"></i> ${item.thoiGianDienRa ? item.thoiGianDienRa : '-'}</div>
                                <div class="new_traditional_conten"><i class="hgi-icon hgi-location"></i> ${item.diaDiemChiTiet ? item.diaDiemChiTiet : '-'}</div>
                                <div class="new_traditional_conten"><i class="hgi-icon hgi-group"></i> ${item.tenToChuc ? item.tenToChuc : '-'}</div>
                            </div>
                                    <div class="news_content" id="gioithieuid">
                                        <span class="news_summary">${item.noiDung ? item.noiDung : updatingText}</span>
                                    </div>
                            <div class="btn-viewdetail-wrapper">
                                <a class="btn-viewdetail btn-arrow" href="${url}">${viewDetailText}</a>
                            </div>
                        </div>
                        <div class="container_module_list_img">
                            <ul class="list_img_traditional" id="hinhanhid">`
                                item.listImage.forEach(imgItem => {
                                    html += `<li class="img_tranditional_item">
                                        <a class="item_link_img" href="">
                                            <img class="item_img sub_string" src="${imgItem.duongDanFile}" data-lazy="" data-src="${imgItem.duongDanFile}" title="" data-processed="true">
                                        </a>
                                    </li>`
                                })                
                            html += `</ul>
                        </div>                
                    </div>     
                `
            })
            html += `</div>`
            $('#slideLeHoi').html(html);
            setTimeout(() => {
                $('.slick-event').slick({
                    dots: false,
                    infinite: true,
                    speed: 1000,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    autoplay: true,
                    autoplaySpeed: 8000,
                    arrows: true,
                    pauseOnFocus: true,
                    pauseOnHover: true,
                    pauseOnDotsHover: true,
                    fade: true,
                })
            }, 150);
        }
    }

    function renderCountLeHoi() {
        if (countLeHoi && countLeHoi.length > 0) {
            let html = '';
            countLeHoi.forEach(item => {
                html += `
                    <div class="count-festival-item">
                        <div class="count-festival-number">${item.totalCount}</div>
                        <div class="count-festival-label">${item.loaiLeHoi}</div>
                    </div>
                `
            })
            $('#countLeHoi').html(html);
        }
    }

    function renderListLeHoi() {   
        if (listLeHoi && listLeHoi.length > 0) {
            // Tính toán phân trang
            const totalItems = listLeHoi.length;
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const currentItems = listLeHoi.slice(startIndex, endIndex);

            // Render danh sách
            let html = '<ul class="list-festival">';
            currentItems.forEach(item => {
                let url = lang === 'vi' ? `/VanHoa/LeHoiDetail?id=${item.leHoiID}` : `/${lang}/VanHoa/LeHoiDetail?id=${item.leHoiID}`;
                html += `
                    <li class="festival-item">
                        <div class="festival-image">
                            <a href="${url}">
                                <img src="${item.anhDaiDien || '/assets/images/vector/no-image.png'}" alt="${item.tenLeHoiChild || ''}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                            </a>
                        </div>
                        <div class="festival-info">
                            <h3 class="festival-title">
                                <a href="${url}">${item.tenLeHoiChild || ''}</a>
                            </h3>
                            <div class="festival-description">${item.noiDung ? item.noiDung : ''}</div>
                        </div>
                    </li>
                `
            })
            html += '</ul>';
            $('#leHoiList').html(html);

            // Render pagination nếu có nhiều hơn 12 items
            renderPagination(totalPages, totalItems);
        } else {
            $('#leHoiList').html(`<p class="text-center">${noDataText}</p>`);
            $('#paginationLeHoi').hide();
        }
    }

    function renderPagination(totalPages, totalItems) {
        // Ẩn pagination nếu tổng số items <= 12
        if (totalItems <= itemsPerPage) {
            $('#paginationLeHoi').hide();
            return;
        }

        $('#paginationLeHoi').show();
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
        $('#paginationLeHoi').html(html);

        // Xử lý click pagination
        $('.page-link').on('click', function (e) {
            e.preventDefault();
            const page = parseInt($(this).data('page'));
            if (page && page !== currentPage) {
                currentPage = page;
                renderListLeHoi();
                // Scroll to top of list
                $('html, body').animate({
                    scrollTop: $('#leHoiList').offset().top - 100
                }, 300);
            }
        });
    }
    //#endregion Lấy data từ dữ liệu danh sách lễ hội
})