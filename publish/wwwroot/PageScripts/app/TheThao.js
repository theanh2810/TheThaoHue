$(document).ready(function () {
    initSelect2();

    // Xác định ngôn ngữ hiện tại
    let lang = window.currentLang || window.DEFAULT_LANG || 'vi';
    console.log('🌐 Current language:', lang);
    let viewDetailText,
        phoneText,
        workExperienceText,
        contactText,
        dayText,
        hourText,
        minuteText,
        secondText,
        yearText,
        responsibleSportsText,
        updatingText;

    ; (async function () {
        const res = await fetch(`/lang/${lang}.json`);
        if (!res.ok) return;
        const translations = await res.json();

        viewDetailText = translations['viewDetail']
        phoneText = translations['phone']
        workExperienceText = translations['workExperience']
        contactText = translations['contact']

        dayText = translations['day']
        hourText = translations['hour']
        minuteText = translations['minute']
        secondText = translations['second']
        yearText = translations['year']
        responsibleSportsText = translations['responsibleSports']
        updatingText = translations['updating']
        initializeData();
    })();

    // Khởi tạo các biến data
    let listBanner = [];
    let listToChucBaoChi = [];
    let listToChucTheThao = [];
    let listVDV = [];
    let listMonTT = [];
    let listSuKien = [];
    let listHuanLuyenVien = [];
    let listAnPham = []
    let listChuongTrinhDuAn = [];
    let listTapHuanBoiDuong = [];

    // Hàm khởi tạo và xử lý data chính
    function initializeData() {
        // Biến đếm API chính
        let mainApiCount = 0;
        const MAIN_API_TOTAL = 4;

        // Fetch tổ chức thể thao từ Statistical API
        getDataWithApi('GET', `/api/v1/TT_StatisticalApi/StatisticalToChucTheThao?MaNgonNgu=${lang}&TuKhoa=`)
            .done(function (response) {
                
                if (response && response.isSuccess && response.value) {
                    listToChucTheThao = response.value;
                    
                    renderToChucTheThao();
                }
                mainApiCount++;
                if (mainApiCount === MAIN_API_TOTAL) {
                    
                }
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.error('❌ Lỗi fetch ToChucTheThao:', errorThrown);
                mainApiCount++;
                if (mainApiCount === MAIN_API_TOTAL) {
                    
                }
            });

        // Fetch vận động viên từ Statistical API
        getDataWithApi('GET', `/api/v1/TT_StatisticalApi/StatisticalVanDongVien?MaNgonNgu=${lang}&TuKhoa=`)
            .done(function (response) {
                
                if (response && response.isSuccess && response.value) {
                    listVDV = response.value;
                    
                    renderVDV();
                }
                mainApiCount++;
                if (mainApiCount === MAIN_API_TOTAL) {
                    
                }
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.error('❌ Lỗi fetch VanDongVien:', errorThrown);
                mainApiCount++;
                if (mainApiCount === MAIN_API_TOTAL) {
                    
                }
            });

        // Fetch môn thể thao từ Statistical API
        getDataWithApi('GET', `/api/v1/TT_StatisticalApi/StatisticalMonTheThao?MaNgonNgu=${lang}&TuKhoa=`)
            .done(function (response) {
                
                if (response && response.isSuccess && response.value) {
                    listMonTT = response.value;
                    
                    renderTT();
                }
                mainApiCount++;
                if (mainApiCount === MAIN_API_TOTAL) {
                    
                }
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.error('❌ Lỗi fetch MonTheThao:', errorThrown);
                mainApiCount++;
                if (mainApiCount === MAIN_API_TOTAL) {
                    
                }
            });

        // Fetch sự kiện từ API DM_SuKienApi
        getDataWithApi('GET', `/api/DM_SuKienApi/Filter?MaNgonNgu=vi&LinhVucID=235`)
            .done(function (response) {
                
                if (response && response.isSuccess && response.value) {
                    listSuKien = response.value;
                    
                    renderSuKien();
                }
                mainApiCount++;
                if (mainApiCount === MAIN_API_TOTAL) {
                    
                }
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.error('❌ Lỗi fetch SuKien:', errorThrown);
                mainApiCount++;
                if (mainApiCount === MAIN_API_TOTAL) {
                    
                }
            });

        // Fetch chương trình / dự án từ API
        getDataWithApi('GET', `/api/DM_ChuongTrinhDuAnApi/Gets?MaNgonNgu=${lang}`)
            .done(function (response) {
                
                if (response && response.isSuccess && response.value) {
                    listChuongTrinhDuAn = response.value;
                    
                    renderChuongTrinhDuAn();
                }
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.error('❌ Lỗi fetch ChuongTrinhDuAn:', errorThrown);
            });

        // Fetch tập huấn bồi dưỡng từ Statistical API
        getDataWithApi('GET', `/api/v1/TT_StatisticalApi/StatisticalTapHuanBoiDuong?MaNgonNgu=${lang}`)
            .done(function (response) {
                
                if (response && response.isSuccess && response.value) {
                    listTapHuanBoiDuong = response.value;
                    
                    renderTapHuanBoiDuong();
                }
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.error('❌ Lỗi fetch TapHuanBoiDuong:', errorThrown);
            });


        // Fetch thống kê
        loadStatistics();
    }



    //#region Render Banner
    function renderBanner() {
        if (listBanner && listBanner.length > 0) {
            let html = `<div class="slick-wrapper">`
            listBanner.forEach(item => {
                html += `
                    <div class="slide-item">
                        <div class="overlay-full"></div>
                        <img src="${item.anhDaiDien || '/assets/images/vector/no-image.png'}" alt="${item.tenBanner || updatingText}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                        <div class="container">
                            <div class="slide-caption">
                                <h2 class="slide-title">${item.tenBanner || updatingText}</h2>
                                <span class="slide-subtitle">${item.moTa || updatingText}</span>
                            </div>
                        </div>
                    </div>
                `
            })
            html += `</div>`
            $('#sliderTheThao').html(html);
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
                    beforeChange: function (event, slick, currentSlide, nextSlide) {
                        $(".slick-slide", this).eq(currentSlide).addClass("preve-slide");
                        $(".slick-slide", this).eq(nextSlide).addClass("slide-animation");
                        if (nextSlide > 0) {
                            $slide.slick('slickSetOption', 'autoplaySpeed', 5500, true);
                        }
                    },
                    afterChange: function () {
                        $(".preve-slide", this).removeClass("preve-slide slide-animation");
                    }
                });
                $slide.find(".slick-slide").eq(0).addClass("slide-animation");
            }, 100);
        }
    }
    //#endregion Lấy data từ dữ liệu Banner

    //#region Lấy data từ dữ liệu tổ chức báo chí
    function renderToChucBaoChi() {
        if (listToChucBaoChi && listToChucBaoChi.length > 0) {
            let html = `<div class="slick-organization navigation-hover slick-flex slick-height-equal">`;
            listToChucBaoChi.forEach(item => {
                html += `
                    <div class="slide-item">
                        <div class="card-item-organization">
                            <div class="group_info">
                                <div class="tag">
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
                            </div>
                            <div class="group_function">
                                <div class="lienHe">
                                    ${item.dienThoai ? `<a class="phone" href="tel:${item.dienThoai}"><i class="hgi-icon hgi-phone"></i>${item.dienThoai}</a>` : ''}
                                    ${item.hopThu ? `<a class="mail" href="mailto:${item.hopThu}"><i class="hgi-icon hgi-mail"></i>${item.hopThu}</a>` : ''}
                                    ${item.website ? `<a class="website" href="${item.website}"><i class="hgi-icon hgi-web"></i>${item.website}</a>` : ''}
                                </div>
                                <div class="chitiet">
                                    <a href="">${viewDetailText}</a>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                `
            })
            html += `</div>`;
            $('#card-list-baoChi').html(html);
            setTimeout(() => {
                $('#card-list-baoChi .slick-organization').slick({
                    dots: false,
                    infinite: true,
                    speed: 1000,
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    autoplay: true,
                    autoplaySpeed: 8000,
                    arrows: true,
                    responsive: [
                        {
                            breakpoint: 600,
                            settings: {
                                slidesToShow: 1,
                                slidesToScroll: 1
                            }
                        },
                    ]
                });
            }, 150);
        }
    }
    //#endregion Lấy data từ dữ liệu tổ chức báo chí

    //#region Lấy data từ dữ liệu hiệp hội thể thao
    function renderToChucTheThao() {
        if (listToChucTheThao && listToChucTheThao.length > 0) {
            let html = `<div style="display:flex;flex-direction:column;gap:12px">`;
            const toChucList = listToChucTheThao.slice(0, 4);
            const borderColors = ['#0E6E7A', '#F2C94C', '#B4172A', '#12939F'];
            toChucList.forEach((item, index) => {
                let color = borderColors[index % borderColors.length];
                html += `
                <div style="background:#fff;border:1px solid #EAEFF3;border-left:4px solid ${color};border-radius:12px;padding:16px 18px;display:flex;justify-content:space-between;align-items:center">
                    <div>
                        <div style="font-weight:700;font-size:14.5px;color:#1B2A3A">${item.tenToChuc}</div>
                        <div style="color:#6B7C8C;font-size:12.5px;margin-top:3px">${item.diaChi ? item.diaChi : ""}</div>
                    </div>
                    <span style="color:#0E6E7A;font-weight:700;font-size:13px">${item.dienThoai || ''}</span>
                </div>`
            })
            html += `</div>`;
            $('#card-list-theThao').html(html);
        }
    }
    //#endregion Lấy data từ dữ liệu hiệp hội thể thao

    //#region Lấy data từ dữ liệu sự kiện thể thao
    function renderSuKien() {
        const parseEventDate = (value, endOfDay = false) => {
            if (!value) return null;

            const text = String(value);
            const dateOnly = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (dateOnly) {
                const date = new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
                if (endOfDay) date.setHours(23, 59, 59, 999);
                return date;
            }

            const date = new Date(value);
            return Number.isNaN(date.getTime()) ? null : date;
        };

        const now = new Date();
        const upcomingEvents = (listSuKien || [])
            .filter(item => {
                const startDate = parseEventDate(item.batDau);
                const endDate = parseEventDate(item.ketThuc, true);

                return startDate && (!endDate || endDate >= now);
            })
            .sort((first, second) => parseEventDate(first.batDau) - parseEventDate(second.batDau));

        if (upcomingEvents.length > 0 && document.getElementById('suKienTT')) {
            const eventSection = document.querySelector('.section-event');
            const eventContainer = document.getElementById('suKienTT');
            if (eventSection) {
                eventSection.style.setProperty('background-color', '#f4f6f9', 'important');
                eventSection.style.setProperty('padding', '0', 'important');
            }
            eventContainer.style.setProperty('width', '100vw', 'important');
            eventContainer.style.setProperty('max-width', 'none', 'important');
            eventContainer.style.setProperty('height', '340px', 'important');
            eventContainer.style.setProperty('background', 'transparent', 'important');
            eventContainer.style.setProperty('margin-bottom', '0', 'important');
            eventContainer.style.setProperty('margin-left', 'calc(50% - 50vw)', 'important');
                eventContainer.style.setProperty('margin-right', 'calc(50% - 50vw)', 'important');

            let html = ``
            let mainSlider = `<div class="event-slider-for" style="width:100% !important; height:100% !important; max-width:none !important; overflow:hidden;">`;
            upcomingEvents.forEach(item => {
                let url = "#";//lang === 'vi' ? `/VanHoa/SuKienDetail?id=${item.suKienID}` : `/${lang}/VanHoa/SuKienDetail?id=${item.suKienID}`;
                let diaDiemStr = item.listTenDiaDiem ? item.listTenDiaDiem : 'Thành phố Huế';
                let isUpcoming = parseEventDate(item.batDau) > now;
                let backgroundImage = item.anhDaiDien || item.anhDaiDienDetail;
                let backgroundStyle = backgroundImage
                    ? `background-image:linear-gradient(90deg,rgba(6,35,42,.92) 0%,rgba(6,35,42,.68) 48%,rgba(6,35,42,.2) 100%),url('${backgroundImage}');background-size:100% 100%;background-position:center;background-repeat:no-repeat;`
                    : 'background:#0c4a54;';
                mainSlider += `
                <div class="slide-item" style="${backgroundStyle}height:100% !important;padding-left:max(0px,calc((100vw - 1440px) / 2));padding-right:max(0px,calc((100vw - 1440px) / 2));box-sizing:border-box;">
                    <span style="display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.12);color:#F2C94C;font-weight:700;font-size:13px;padding:7px 14px;border-radius:999px;margin-bottom:16px;">${isUpcoming ? 'SỰ KIỆN SẮP DIỄN RA' : 'SỰ KIỆN ĐANG DIỄN RA'}</span>
                    <h1 style="font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:44px;line-height:1.1;margin:0 0 14px;">
                        <a href="${url}" style="color:#fff;text-decoration:none;">${item.tenSuKien}</a>
                    </h1>
                    <p style="font-size:16px;line-height:1.6;color:rgba(255,255,255,.9);max-width:560px;height:75px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;">
                        Khai mạc ${item.batDau ? formatDateWithoutTime(item.batDau) : ''} tại ${diaDiemStr}. Cùng theo dõi lịch thi đấu và kết quả trực tiếp trên cổng dữ liệu.
                    </p>
                    <div style="display:flex;gap:10px;margin-top:24px" class="custom-countdown" data-date="${item.batDau}">
                        <div style="background:rgba(255,255,255,.14);border-radius:12px;padding:12px 18px;text-align:center"><div class="cd-d" style="font-family:'Oswald',sans-serif;font-size:30px;font-weight:700;line-height:1">00</div><div style="font-size:10.5px;letter-spacing:.1em;opacity:.85;margin-top:4px;font-weight:600">NGÀY</div></div>
                        <div style="background:rgba(255,255,255,.14);border-radius:12px;padding:12px 18px;text-align:center"><div class="cd-h" style="font-family:'Oswald',sans-serif;font-size:30px;font-weight:700;line-height:1">00</div><div style="font-size:10.5px;letter-spacing:.1em;opacity:.85;margin-top:4px;font-weight:600">GIỜ</div></div>
                        <div style="background:rgba(255,255,255,.14);border-radius:12px;padding:12px 18px;text-align:center"><div class="cd-m" style="font-family:'Oswald',sans-serif;font-size:30px;font-weight:700;line-height:1">00</div><div style="font-size:10.5px;letter-spacing:.1em;opacity:.85;margin-top:4px;font-weight:600">PHÚT</div></div>
                        <div style="background:#F2C94C;color:#0C4A54;border-radius:12px;padding:12px 18px;text-align:center"><div class="cd-s" style="font-family:'Oswald',sans-serif;font-size:30px;font-weight:700;line-height:1">00</div><div style="font-size:10.5px;letter-spacing:.1em;margin-top:4px;font-weight:800">GIÂY</div></div>
                    </div>
                </div>`;
            })
            mainSlider += `</div>`;
            html = mainSlider;
            $('#suKienTT').html(html);
            setTimeout(() => {
                // Initialize vanilla JS countdown
                const updateCountdowns = () => {
                    $('.custom-countdown').each(function() {
                        const dateStr = $(this).attr('data-date');
                        if (!dateStr || dateStr === 'null' || dateStr === 'undefined') return;
                        
                        let targetDate;
                        // Handle DD/MM/YYYY or YYYY-MM-DD format
                        if (dateStr.includes('/')) {
                            const parts = dateStr.split(' ')[0].split('/');
                            if (parts.length === 3) {
                                targetDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`).getTime();
                            } else {
                                targetDate = new Date(dateStr).getTime();
                            }
                        } else {
                            targetDate = new Date(dateStr).getTime();
                        }
                        
                        if (isNaN(targetDate)) return;

                        const now = new Date().getTime();
                        const distance = targetDate - now;

                        if (distance < 0) {
                            $(this).find('.cd-d').text('00');
                            $(this).find('.cd-h').text('00');
                            $(this).find('.cd-m').text('00');
                            $(this).find('.cd-s').text('00');
                            return;
                        }

                        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                        $(this).find('.cd-d').text(days.toString().padStart(2, '0'));
                        $(this).find('.cd-h').text(hours.toString().padStart(2, '0'));
                        $(this).find('.cd-m').text(minutes.toString().padStart(2, '0'));
                        $(this).find('.cd-s').text(seconds.toString().padStart(2, '0'));
                    });
                };
                
                updateCountdowns();
                if (window.eventCountdownInterval) clearInterval(window.eventCountdownInterval);
                window.eventCountdownInterval = setInterval(updateCountdowns, 1000);

                // Khởi tạo Slick Slider
                $('.event-slider-for').slick({
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    arrows: true,
                    dots: true,
                    fade: true,
                    autoplay: true,
                    autoplaySpeed: 8000,
                    speed: 1000,
                    infinite: true,
                    pauseOnHover: true,
                    pauseOnFocus: false,
                    prevArrow: '<button type="button" class="slick-prev">&#10094;</button>',
                    nextArrow: '<button type="button" class="slick-next">&#10095;</button>'
                });

                // Removed nav slider as it is not used in DOM
            }, 150);
        } else {
            $('#suKienTT').empty();
        }
    }
    //#endregion Lấy data từ dữ liệu sự kiện thể thao

    //#region Lấy data từ dữ liệu chương trình / dự án
    function renderChuongTrinhDuAn() {
        if (listChuongTrinhDuAn && listChuongTrinhDuAn.length > 0) {
            let html = `<div class="slick-organization navigation-hover slick-flex slick-height-equal">`;
            listChuongTrinhDuAn.forEach(item => {
                const batDau = item.batDau ? formatDateWithoutTime(item.batDau) : '';
                const ketThuc = item.ketThuc ? formatDateWithoutTime(item.ketThuc) : '';
                const thoiGian = [batDau, ketThuc].filter(Boolean).join(' - ');
                html += `
                    <div class="slide-item" style="width: 100%;">
                        <div style="background:#fff;border:1px solid #EAEFF3;border-radius:16px;overflow:hidden;margin:0 8px; width:100%;">
                            <div style="height:8px;background:#F2C94C"></div>
                            <div style="padding:22px">
                                <div style="font-weight:700;font-size:16px;line-height:1.35;color:#1B2A3A;height:43px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${item.tenChuongTrinh || updatingText}</div>
                                ${item.tenDonVi ? `<div style="color:#6B7C8C;font-size:12.5px;margin-top:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;height:19px">${item.tenDonVi}</div>` : `<div style="height:19px;margin-top:5px"></div>`}
                                <p style="color:#6B7C8C;font-size:13.5px;line-height:1.55;margin-top:10px;height:63px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;">${item.mucDich ? item.mucDich : updatingText}</p>
                                <div style="display:flex;align-items:center;gap:8px;margin-top:16px;color:#C98A2A;font-size:13px;font-weight:600;background:#FDF8EC;padding:9px 12px;border-radius:9px"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>${thoiGian || (item.tenTrangThai || '')}</div>
                                ${item.tenTrangThai ? `<div style="display:inline-flex;align-items:center;gap:6px;margin-top:10px;font-size:12.5px;font-weight:600;color:#0E6E7A;background:#EAF3F4;padding:5px 12px;border-radius:999px;height:29px"><span style="width:7px;height:7px;border-radius:50%;background:#0E6E7A;display:inline-block;"></span>${item.tenTrangThai}</div>` : `<div style="height:29px;margin-top:10px"></div>`}
                            </div>
                        </div>
                    </div>
                `
            })
            html += `</div>`;
            $('#chuongTrinhDuAn').html(html);
            setTimeout(() => {
                if ($('#chuongTrinhDuAn').hasClass('active')) {
                    $('#chuongTrinhDuAn .slick-organization').slick({
                        dots: false,
                        infinite: true,
                        speed: 1000,
                        slidesToShow: 3,
                        slidesToScroll: 1,
                        autoplay: true,
                        autoplaySpeed: 8000,
                        arrows: true,
                        responsive: [
                            {
                                breakpoint: 1024,
                                settings: {
                                    slidesToShow: 2,
                                    slidesToScroll: 1
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
                }
            }, 150);
        }
    }
    //#endregion Lấy data từ dữ liệu chương trình / dự án


    //#region Lấy data từ dữ liệu TẬP HUẤN BỒI DƯỠNG
    function renderTapHuanBoiDuong() {
        if (listTapHuanBoiDuong && listTapHuanBoiDuong.length > 0) {
            let html = `<div class="slick-organization navigation-hover slick-flex slick-height-equal">`;
            listTapHuanBoiDuong.forEach(item => {
                const batDau = item.batDau ? formatDateWithoutTime(item.batDau) : '';
                const ketThuc = item.ketThuc ? formatDateWithoutTime(item.ketThuc) : '';
                const thoiGian = [batDau, ketThuc].filter(Boolean).join(' - ');
                html += `
                    <div class="slide-item" style="width: 100%;">
                        <div style="background:#fff;border:1px solid #EAEFF3;border-radius:16px;overflow:hidden;margin:0 8px; width: 100%;">
                            <div style="height:8px;background:#0E6E7A"></div>
                            <div style="padding:22px">
                                <div style="font-weight:700;font-size:16px;line-height:1.35;color:#1B2A3A;height:43px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${item.tenLop || updatingText}</div>
                                <p style="color:#6B7C8C;font-size:13.5px;line-height:1.55;margin-top:10px;height:42px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${item.noiDungBoiDuong ? item.noiDungBoiDuong : updatingText}</p>
                                <div style="display:flex;align-items:center;gap:8px;margin-top:16px;color:#0E6E7A;font-size:13px;font-weight:600;background:#EAF3F4;padding:9px 12px;border-radius:9px"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>${thoiGian}</div>
                            </div>
                        </div>
                    </div>
                `
            })
            html += `</div>`;
            $('#tapHuanBoiDuong').html(html);
            setTimeout(() => {
                if ($('#tapHuanBoiDuong').hasClass('active')) {
                    $('#tapHuanBoiDuong .slick-organization').slick({
                        dots: false,
                        infinite: true,
                        speed: 1000,
                        slidesToShow: 3,
                        slidesToScroll: 1,
                        autoplay: true,
                        autoplaySpeed: 8000,
                        arrows: true,
                        responsive: [
                            {
                                breakpoint: 1024,
                                settings: {
                                    slidesToShow: 2,
                                    slidesToScroll: 1
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
                }
            }, 150);
        }
    }
    //#endregion Lấy data từ dữ liệu TẬP HUẤN BỒI DƯỠNG

    //#region Lấy data từ dữ liệu vận động viên
    function renderVDV() {
        if (listVDV && listVDV.length > 0) {
            let html = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">`;
            const vdvList = listVDV.slice(0, 4);
            vdvList.forEach(item => {
                html += `
                <div style="background:#fff;border:1px solid #EAEFF3;border-radius:14px;padding:16px;display:flex;gap:14px;align-items:center;">
                    <div style="width:60px;height:60px;border-radius:12px;background:url('${item.anhChanDung || '/assets/images/vector/no-image.png'}') center/cover;flex-shrink:0;"></div>
                    <div>
                        <div style="font-weight:700;font-size:14.5px;color:#1B2A3A">${item.hoTen}</div>
                        <div style="color:#6B7C8C;font-size:12.5px;margin-top:2px">${item.viTriSoTruong ? item.viTriSoTruong : ""}</div>
                        <div style="color:#C98A2A;font-size:12px;font-weight:700;margin-top:5px">🥇 ${item.giaiThuong ? item.giaiThuong : "Đang cập nhật"}</div>
                    </div>
                </div>`
            })
            html += `</div>`;
            $('#card-list-vdv').html(html);
        }
    }
    //#endregion Lấy data từ dữ liệu vận động viên

    //#region Lấy data từ dữ liệu môn thể thao
    function renderTT() {
        if (listMonTT && listMonTT.length > 0) {
            let html = ``;
            listMonTT.forEach(item => {
                html += `
                    <span style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);padding:10px 18px;border-radius:999px;font-weight:600;font-size:14px;color:#fff;">
                        ${item.tenMon}
                    </span>
                `
            })
            $('#monTT-list').html(html);
        }
    }
    //#endregion Lấy data từ dữ liệu môn thể thao

    //#region Lấy data từ dữ liệu Ấn phẩm xuất bản
    function renderAnPhamXuatBan() {
        if (listAnPham && listAnPham.length > 0) {
            let html = `<div class="slick-anPham">`
            listAnPham.forEach(item => {
                html += `
                    <div class="slide-item">
                        <img src="${item.duongDanHinhAnhBia || '/assets/images/vector/no-image.png'}" alt="${item.tenAnPham || ''}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                        <div class="slide-caption">
                            <h2 class="slide-title">${item.tenAnPham || ''}</h2>
                        </div>
                    </div>
                `
            })
            html += `</div>`
            $('#slideAnPham').html(html);
            setTimeout(() => {
                $('.slick-anPham').slick({
                    slidesToShow: 5,
                    slidesToScroll: 1,
                    dots: false,
                    infinite: true,
                    speed: 1000,
                    autoplay: true,
                    autoplaySpeed: 5000,
                    arrows: true,
                    centerMode: true,
                    centerPadding: '0',
                    variableWidth: true,
                    responsive: [
                        {
                            breakpoint: 1200,
                            settings: {
                                slidesToShow: 4,
                                slidesToScroll: 1
                            }
                        },
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
            }, 100);
        }
    }
    //#endregion Lấy data từ dữ liệu Ấn phẩm xuất bản

    //#region Lấy data từ dữ liệu hướng dẫn viên
    function renderHLV() {
        if (listHuanLuyenVien && listHuanLuyenVien.length > 0) {
            let html = `<div class="slick-hdv navigation-hover slick-flex slick-height-equal">`;
            listHuanLuyenVien.forEach(item => {
                let url = lang === 'vi' ? `/DuLich/HDVDuLichDetail?id=${item.caNhanID}` : `/${lang}/DuLich/HDVDuLichDetail?id=${item.caNhanID}`;
                html += `
                    <div class="slide-item">
                        <div class="card-item-human">
                            <div class="group_info">
                                <div class="anhDaiDien">
                                    <img class="anhDaiDien_Nguoi" src="${item.anhChanDung || '/assets/images/vector/no-image.png'}" alt="${item.hoTen || ''}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                                </div>
                                <div class="thongTinHDV">
                                    <div class="hdv-name">${item.hoTen}</div>
                                    <div class="hdv-sdt"><label><i class="hgi-icon hgi-phone-label"></i>${phoneText}: </label>${item.dienThoai || "-"}</div>
                                    <div class="hdv-kinhnghiem"><label><i class="hgi-icon hgi-certificate-label"></i>${workExperienceText}: </label>${item.namKinhNghiem == null ? "-" : `${item.namKinhNghiem} ${yearText}`}</div>
                                    <div class="hdv-ngoaingu"><label><i class="hgi-icon hgi-globe-label"></i>${responsibleSportsText}: </label>${item.ngoaiNgu || "-"}</div>
                                </div>
                            </div>
                            <div class="group_function">
                                ${item.dienThoai ? `<div class="lienHe"><a class="phone" href="tel:${item.dienThoai}">${contactText}</a></div>` : ''}
                                <div class="chitiet">
                                    <a href="${url}">${viewDetailText}</a>
                                </div>
                            </div>
                        </div>
                    </div>
                `
            })
            html += `</div>`;
            $('#card-list-HuanLuyenVien').html(html);
            setTimeout(() => {
                $('.slick-hdv').slick({
                    dots: false,
                    infinite: true,
                    speed: 1000,
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    autoplay: true,
                    autoplaySpeed: 8000,
                    arrows: true,
                    responsive: [
                        {
                            breakpoint: 991,
                            settings: {
                                slidesToShow: 2,
                                slidesToScroll: 1,
                            }
                        },
                        {
                            breakpoint: 576,
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
    //#endregion Lấy data từ dữ liệu hướng dẫn viên

    //#region Thống kê
    // Biến lưu dữ liệu thống kê
    let statisticsData = {
        totalCount: [],
        vanDongVien: [],
        monTheThao: [],
        toChucTheThao: []
    };

    // Biến đếm API đã xong
    let statisticsApiCount = 0;
    const STATISTICS_API_TOTAL = 4;

    // Hàm fetch dữ liệu thống kê
    function loadStatistics() {
        statisticsApiCount = 0;

        // Fetch tổng đếm
        getDataWithApi('GET', `/api/v1/TT_StatisticalApi/StatisticalCount?MaNgonNgu=${lang}`)
            .done(function (response) {
                if (response && response.isSuccess && response.value) {
                    statisticsData.totalCount = response.value;
                }
                statisticsApiCount++;
                if (statisticsApiCount === STATISTICS_API_TOTAL) {
                    renderStatistics();
                }
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.warn('⚠️ Lỗi fetch StatisticalCount:', errorThrown);
                statisticsApiCount++;
                if (statisticsApiCount === STATISTICS_API_TOTAL) {
                    renderStatistics();
                }
            });

        // Fetch vận động viên
        getDataWithApi('GET', `/api/v1/TT_StatisticalApi/StatisticalVanDongVien?MaNgonNgu=${lang}&TuKhoa=`)
            .done(function (response) {
                if (response && response.isSuccess && response.value) {
                    statisticsData.vanDongVien = response.value;
                }
                statisticsApiCount++;
                if (statisticsApiCount === STATISTICS_API_TOTAL) {
                    renderStatistics();
                }
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.warn('⚠️ Lỗi fetch StatisticalVanDongVien:', errorThrown);
                statisticsApiCount++;
                if (statisticsApiCount === STATISTICS_API_TOTAL) {
                    renderStatistics();
                }
            });

        // Fetch môn thể thao
        getDataWithApi('GET', `/api/v1/TT_StatisticalApi/StatisticalMonTheThao?MaNgonNgu=${lang}&TuKhoa=`)
            .done(function (response) {
                if (response && response.isSuccess && response.value) {
                    statisticsData.monTheThao = response.value;
                }
                statisticsApiCount++;
                if (statisticsApiCount === STATISTICS_API_TOTAL) {
                    renderStatistics();
                }
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.warn('⚠️ Lỗi fetch StatisticalMonTheThao:', errorThrown);
                statisticsApiCount++;
                if (statisticsApiCount === STATISTICS_API_TOTAL) {
                    renderStatistics();
                }
            });

        // Fetch tổ chức thể thao
        getDataWithApi('GET', `/api/v1/TT_StatisticalApi/StatisticalToChucTheThao?MaNgonNgu=${lang}&TuKhoa=`)
            .done(function (response) {
                if (response && response.isSuccess && response.value) {
                    statisticsData.toChucTheThao = response.value;
                }
                statisticsApiCount++;
                if (statisticsApiCount === STATISTICS_API_TOTAL) {
                    renderStatistics();
                }
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.warn('⚠️ Lỗi fetch StatisticalToChucTheThao:', errorThrown);
                statisticsApiCount++;
                if (statisticsApiCount === STATISTICS_API_TOTAL) {
                    renderStatistics();
                }
            });
    }

    // Hàm render thống kê
    function renderStatistics() {
        const container = $('#statisticsGrid');
        if (!container.length) {
            console.warn('⚠️ #statisticsGrid không tồn tại');
            return;
        }

        let html = '';

        // Dữ liệu thống kê
        const stats = [
            {
                label: 'Vận động viên',
                value: statisticsData.vanDongVien.length || 0
            },
            {
                label: 'Môn thể thao',
                value: statisticsData.monTheThao.length || 0
            },
            {
                label: 'Đơn vị',
                value: statisticsData.toChucTheThao.length || 0
            },
            {
                label: 'Dữ liệu',
                value: statisticsData.totalCount.length || 0
            }
        ];

        stats.forEach(stat => {
            html += `
                <div style="background:rgba(255,255,255,.08);border-radius:14px;padding:18px;text-align:center">
                    <div style="font-family:'Oswald',sans-serif;font-size:38px;font-weight:700;color:#F2C94C;line-height:1">${stat.value}</div>
                    <div style="font-size:13px;opacity:.85;margin-top:4px">${stat.label}</div>
                </div>
            `;
        });

        container.html(html);
    }
    //#endregion Thống kê
})