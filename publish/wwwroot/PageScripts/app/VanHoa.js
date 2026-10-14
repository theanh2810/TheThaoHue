$(document).ready(function () {
    initSelect2();

    let lang = currentLang
    let viewDetailText,
        phoneText,
        foreignLanguageText,
        workExperienceText,
        contactText,
        dayText, 
        hourText,
        minuteText,
        secondText,
        ongoingEventsText,
        endedEventsText,
        featuredEventsText,
        librariesText,
        museumsText;

        ; (async function () {
            const res = await fetch(`/lang/${lang}.json`);
            if (!res.ok) return;
            const translations = await res.json();

            viewDetailText = translations['viewDetail']
            phoneText = translations['phone']
            foreignLanguageText = translations['foreignLanguage']
            workExperienceText = translations['workExperience']
            contactText = translations['contact']

            dayText = translations['day']
            hourText = translations['hour']
            minuteText = translations['minute']
            secondText = translations['second']
            ongoingEventsText = translations['ongoingEvents']
            endedEventsText = translations['endedEvents']
            featuredEventsText = translations['featuredEvents']
            librariesText = translations['libraries']
            museumsText = translations['museums']
            initializeData();
        })();

    // Khởi tạo các biến data
    let listBanner = [];
    let listLeHoi = [];
    let suKienSlide = "";
    let listDiTich = [];
    let listAmThuc = [];
    let listToChuc = [];
    let listTacPham = [];

    // Hàm khởi tạo và xử lý data chính
    async function initializeData() {
        try {
            const response = await getDataWithApi('GET', `/api/v1/VH_StatisticalApi/PerformanceVH?MaNgonNgu=${lang}`);

            if (response && response.isSuccess) {
                // Cập nhật data
                listBanner = response.value.listBanner || [];
                listLeHoi = response.value.listLeHoi || [];
                listDiTich = response.value.listDiTich || [];
                listAmThuc = response.value.listAmThuc || [];
                listToChuc = response.value.listToChuc || [];
                listTacPham = response.value.listTacPham || [];
                suKienSlide = response.value.suKienSlide;

                // Sau khi có data, gọi các hàm render
                renderBanner();
                renderDiTich();
                renderAmThuc();
                renderLeHoi();
                renderSuKien();
                renderToChuc();
                renderTacPham();
                // Thêm các hàm render khác nếu cần
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    }
    

    //#region Hàm đếm ngược thời gian
    function createCountdown(startDate, endDate, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        function updateCountdown() {
            const now = new Date().getTime();
            const start = new Date(startDate).getTime();
            const end = new Date(endDate).getTime();

            // Kiểm tra trạng thái sự kiện
            if (now < start) {
                // Sự kiện chưa diễn ra - hiển thị đếm ngược
                const distance = start - now;
                
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                // Hàm tách chữ số thành các span riêng biệt
                function splitDigits(number) {
                    const str = number.toString().padStart(2, '0');
                    return `<span class="digit">${str[0]}</span><span class="digit">${str[1]}</span>`;
                }

                container.innerHTML = `
                    <div class="countdown-container">
                        <div class="countdown-item">
                            <div class="countdown-value">${splitDigits(days)}</div>
                            <div class="countdown-label">${dayText}</div>
                        </div>
                        <div class="countdown-item">
                            <div class="countdown-value">${splitDigits(hours)}</div>
                            <div class="countdown-label">${hourText}</div>
                        </div>
                        <div class="countdown-item">
                            <div class="countdown-value">${splitDigits(minutes)}</div>
                            <div class="countdown-label">${minuteText}</div>
                        </div>
                        <div class="countdown-item">
                            <div class="countdown-value">${splitDigits(seconds)}</div>
                            <div class="countdown-label">${secondText}</div>
                        </div>
                    </div>
                `;
            } else if (now >= start && now <= end) {
                // Sự kiện đang diễn ra
                container.innerHTML = `
                    <div class="event-status">
                        <div style="text-align: center;">
                            <div>
                                ${ongoingEventsText}
                            </div>
                        </div>
                    </div>
                `;
                // Dừng interval khi sự kiện đang diễn ra
                clearInterval(window['countdown_' + containerId]);
            } else {
                // Sự kiện đã kết thúc
                container.innerHTML = `
                    <div class="event-status">
                        <div style="text-align: center;">
                            <div>
                                ${endedEventsText}
                            </div>
                        </div>
                    </div>
                `;
                // Dừng interval khi sự kiện đã kết thúc
                clearInterval(window['countdown_' + containerId]);
            }
        }

        // Cập nhật ngay lập tức
        updateCountdown();

        // Cập nhật mỗi giây nếu sự kiện chưa diễn ra
        const now = new Date().getTime();
        const start = new Date(startDate).getTime();
        if (now < start) {
            window['countdown_' + containerId] = setInterval(updateCountdown, 1000);
        }
    }
    //#endregion Hàm đếm ngược thời gian

    //#region Render Banner
    function renderBanner() {
        if (listBanner && listBanner.length > 0) {
            let html = `<div class="slick-wrapper">`
            listBanner.forEach(item => {
                html += `
                    <div class="slide-item">
                        <div class="overlay"></div>
                        <img src="${item.anhDaiDien || '/assets/images/vector/no-image.png'}" alt="${item.tenBanner || ''}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                        <div class="container">
                            <div class="slide-caption">
                                <h2 class="slide-title">${item.tenBanner || ''}</h2>
                                <span class="slide-subtitle">${item.moTa || ''}</span>
                            </div>
                        </div>
                    </div>
                `
            })
            html += `</div>`
            $('#sliderVanHoa').html(html);
            setTimeout(() => {
                var $slide = $('.slick-wrapper').slick({
                    autoplay: true,
                    autoplaySpeed: 10000,
                    arrows: false,
                    dots: true,
                    draggable: false,
                    fade: true,
                    infinite: true,
                    pauseOnFocus: false,
                    pauseOnHover: false,
                    pauseOnDotsHover: false,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    speed: 3000,
                    lazyLoad: 'ondemand',
                    mobileFirst: true,
                }).on({
                    beforeChange: function(event, slick, currentSlide, nextSlide) {
                        $(".slick-slide", this).eq(currentSlide).addClass("preve-slide");
                        $(".slick-slide", this).eq(nextSlide).addClass("slide-animation");
                        if(nextSlide > 0) {
                            $slide.slick('slickSetOption', 'autoplaySpeed', 5500, true);
                        }
                    },
                    afterChange: function() {
                        $(".preve-slide", this).removeClass("preve-slide slide-animation");
                    }
                });
                $slide.find(".slick-slide").eq(0).addClass("slide-animation");
            }, 100);
        }
    }
    //#endregion Lấy data từ dữ liệu Banner

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
                                <div class="new_traditional_conten"><i class="hgi-icon hgi-white-location"></i> ${item.diaDiemChiTiet ? item.diaDiemChiTiet : '-'}</div>
                                <div class="new_traditional_conten"><i class="hgi-icon hgi-group"></i> ${item.tenToChuc ? item.tenToChuc : '-'}</div>
                            </div>
                                    <div class="news_content" id="gioithieuid">
                                        <span class="news_summary">${item.noiDung ? item.noiDung : ''}</span>
                                    </div>
                            <div class="btn-viewdetail-wrapper">
                                <a class="btn-viewdetail btn-arrow" href="${url}" data-i18n="common.viewDetail">${viewDetailText}</a>
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
    //#endregion Lấy data từ dữ liệu danh sách lễ hội

    //#region Lấy data từ dữ liệu sự kiện văn hóa
    function renderSuKien() {
        if (suKienSlide) {
            const firstEvent = suKienSlide;
            const countdownId = 'countdown-container-' + (firstEvent.id || 'main');
            
            let html = `
                <div class="event-highlight">
                    <div class="anhDaiDien">
                        <img src="${firstEvent.anhDaiDien || '/assets/images/vector/no-image.png'}" alt="${firstEvent.tenSuKien}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';">
                    </div>
                    <div class="noiDung">
                        <div class="listNoiDung">
                            <div class="subHeader">
                                ${featuredEventsText}
                            </div>
                            <div class="tenSuKien">
                                <a href="/VanHoa/SuKienDetail?id=${firstEvent.suKienID}">${firstEvent.tenSuKien}</a>
                            </div>
                            <div class="diaDiem">
                                ${firstEvent.listTenDiaDiem || ''}
                            </div>
                        </div>
                        <div class="thoiGianSection">
                            <div class="thoiGianDienRa">
                                ${formatDateTrinhDien(firstEvent.batDau)}${firstEvent.batDau !== firstEvent.ketThuc ? ' - ' + formatDateTrinhDien(firstEvent.ketThuc) : ''}
                            </div>
                            <div id="${countdownId}"></div>
                        </div>
                    </div>
                </div>
            `;
            
            $('#suKienVanHoa').html(html);
            
            // Khởi tạo countdown
            if (firstEvent.batDau && firstEvent.ketThuc) {
                createCountdown(firstEvent.batDau, firstEvent.ketThuc, countdownId);
            }
        }
    }

    // Hàm format ngày tháng
    function formatDateTrinhDien(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
    //#endregion Lấy data từ dữ liệu sự kiện văn hóa

    //#region Render Di tích lịch sử
    function renderDiTich() {
        if (listDiTich && listDiTich.length > 0) {
            let html = '';

            // Build destination cards based on the static HTML structure in Index.cshtml
            listDiTich.forEach((item, idx) => {
                const img = item.anhDaiDien || '/assets/images/vector/no-image.png';
                const title = item.tenDiTich || item.ten || '';
                const excerpt = item.moTaDiTich || item.moTa || '';
                const id = item.diTichID || item.diTichId || '';

                // Create an id attribute similar to existing samples (destination-<n>)
                const elId = `destination-${idx + 1}`;
                let url = lang === 'vi' ? `/VanHoa/DiTichVanHoaDetail?id=${id}` : `/${lang}/VanHoa/DiTichVanHoaDetail?id=${id}`;
                html += `
                    <div id="${elId}" class="destination-content">
                        <div class="destination-news">
                            <a class="" href="${url}">
                                <div class="overlay border-radius"></div>
                                <img src="${img}" data-lazy data-src="${img}" class="destination-img" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';">
                            </a>
                            <div class="destination-description">
                                <div class="destination-link">
                                    <span class="destination-title">${title}</span>
                                </div>
                            </div>
                            <div class="destination-caption">
                                <div class="destination-link">
                                    <span class="destination-title">${title}</span>
                                </div>
                                <div class="destination-summary">
                                    <span class="destination-content">${excerpt}</span>
                                </div>
                                <div class="main-destination-detail main-btn">
                                    <div class="btn-destination">
                                        <a class="destination-details btn-details" href="${url}"><span">${viewDetailText}</span></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });

            // Append generated HTML into grid
            $('#gridDiTichLichSu').html(html);
        }
    }
    //#endregion Lấy data từ dữ liệu Di tích lịch sử

    //#region Lấy data từ dữ liệu tổ chức
    function renderToChuc() {
        if (listToChuc && listToChuc.length > 0) {
            let html = `<div class="slick-organization navigation-hover slick-flex slick-height-equal">`;
            listToChuc.forEach(item => {
                let url = lang === 'vi' ? `/VanHoa/ThuVienBaoTangDetail?id=${item.toChucID}` : `/${lang}/VanHoa/ThuVienBaoTangDetail?id=${item.toChucID}`;
                let typeText = item.type === 'Thư viện' ? librariesText : museumsText;
                html += `
                    <div class="slide-item">
                        <div class="card-item-organization">
                            <div class="group_info">
                                <div class="tag">
                                    <div class="tag_type">${typeText}</div>
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
                                    ${item.gioiThieu ? item.gioiThieu : ''}
                                </div>
                            </div>
                            <div class="group_function">
                                <div class="lienHe">
                                    ${item.dienThoai ? `<a class="phone" href="tel:${item.dienThoai}"><i class="hgi-icon hgi-phone"></i>${item.dienThoai}</a>` : ''}
                                    ${item.hopThu ? `<a class="mail" href="mailto:${item.hopThu}"><i class="hgi-icon hgi-mail"></i>${item.hopThu}</a>` : ''}
                                    ${item.website ? `<a class="website" href="${item.website}"><i class="hgi-icon hgi-web"></i>${item.website}</a>` : ''}
                                </div>
                                <div class="chitiet">
                                    <a href="${url}">${viewDetailText}</a>
                                </div>
                            </div>
                        </div>
                    </div>
                `
            })
            html += `</div>`;
            $('#card-list-toChuc').html(html);
            setTimeout(() => {
                $('.slick-organization').slick({
                    dots: false,
                    infinite: true,
                    speed: 1000,
                    slidesToShow: 4,
                    slidesToScroll: 1,
                    autoplay: true,
                    autoplaySpeed: 8000,
                    arrows: true,
                    responsive: [
                        {
                            breakpoint: 1024,
                            settings: {
                                slidesToShow: 3,    
                                slidesToScroll: 1,
                            }
                        },
                        {
                            breakpoint: 600,
                            settings: {
                                slidesToShow: 2,
                                slidesToScroll: 1   
                            }
                        },
                        {
                            breakpoint: 480,
                            settings: { 
                                slidesToShow: 1,
                                slidesToScroll: 1
                            }
                        }
                    ]
                });
            }, 150);
        }
    }
    //#endregion Lấy data từ dữ liệu tổ chức

    //#region Lấy data từ dữ liệu ẩm thực
    function renderAmThuc() {
        if (listAmThuc && listAmThuc.length > 0) {
            let html = `<div class="slick-utilities navigation-hover">`;
                listAmThuc.forEach(item => {
                    let url = lang === 'vi' ? `/VanHoa/AmThucDetail?id=${item.monAnUongID}` : `/${lang}/VanHoa/AmThucDetail?id=${item.monAnUongID}`;
                    html += `
                        <div class="slide-item">
                            <div class="utilities-news">
                                <a class="" href="${url}">
                                    <div class="overlay"></div>
                                    <img src="${item.anhDaiDien}" class="utilities-img" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                                </a>
                                <div class="utilities-description">
                                    <div class="utilities-link">
                                        <span class="utilities-title">${item.tenMon}</span>
                                    </div>
                                </div>
                                <div class="utilities-caption">
                                    <div class="utilities-link">
                                        <span class="utilities-title">${item.tenMon}</span>
                                    </div>
                                    <div class="utilities-summary">
                                        <span class="utilities-content">${item.moTa}</span>
                                    </div>
                                    <div class="main-utilities-detail main-btn">
                                        <div class="btn-utilities btn-special btn-green">
                                            <a class="utilities-details btn-details" href="${url}"><span>${viewDetailText}</span></a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
            });
            html += `</div>`;
            $('#utilities-list-amThuc').html(html);
    
            setTimeout(() => {
                $('.slick-utilities').slick({
                    dots: false,
                    infinite: true,
                    speed: 300,
                    slidesToShow: 4,
                    slidesToScroll: 1,
                    autoplay: false,
                    autoplaySpeed: 8000,
                    arrows: true,
                    responsive: [
                        {
                            breakpoint: 1024,
                            settings: {
                                slidesToShow: 3,
                                slidesToScroll: 1,
                                infinite: true,
                                dots: false
                            }
                        },
                        {
                            breakpoint: 600,
                            settings: {
                                slidesToShow: 2,
                                slidesToScroll: 1
                            }
                        },
                        {
                            breakpoint: 480,
                            settings: {
                                slidesToShow: 1,
                                slidesToScroll: 1
                            }
                        }
                    ]
                });
            }, 150);
        }
    }
    //#endregion Lấy data từ dữ liệu ẩm thực

    //#region Lấy data từ dữ liệu tác phẩm nghệ thuật
    function renderTacPham() {
        if (listTacPham && listTacPham.length > 0) {
            let html = `<div class="slick-book navigation-hover">`;
            listTacPham.forEach(item => {
                let url = "";
                html += `
                    <div class="slide-item">
                        <div class="book-item">
                            <div class="book-cover">
                                <img src="${item.hinhAnh || '/assets/images/vector/no-image.png'}" alt="${item.tenTacPham || ''}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                            </div>
                            <div class="book-info">
                                <div class="book-title">${item.tenTacPham || ''}</div>
                                <div class="book-author">${item.namCongBo || ''} - ${item.tacGia || ''}</div>
                                <div class="book-summary">${item.moTa || ''}</div>
                                <div class="book-detail">
                                    <a href="${url}">${viewDetailText}</a>
                                </div>
                            </div>
                        </div>
                    </div>
                `
            })
            html += `</div>`;
            $('#book-list').html(html);
            setTimeout(() => {
                $('.slick-book').slick({
                    dots: false,
                    infinite: true,
                    speed: 300,
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    autoplay: false,
                    autoplaySpeed: 8000,
                    arrows: true,
                    responsive: [
                        {
                            breakpoint: 1024,
                            settings: {
                                slidesToShow: 2,
                                slidesToScroll: 1,
                            }
                        },
                        {
                            breakpoint: 600,
                            settings: {
                                slidesToShow: 1,
                                slidesToScroll: 1
                            }
                        }
                    ]
                });
            }, 150);
        }
    }
    //#endregion Lấy data từ dữ liệu tác phẩm nghệ thuật
})