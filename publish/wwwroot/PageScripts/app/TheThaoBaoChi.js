$(document).ready(function () {
    initSelect2();
    let lang = localStorage.getItem('lang') || 'vi';

    $('#ngon-ngu').on('change', function (e) {
        lang = $(this).val();
        localStorage.setItem('lang', lang);
        initializeData(); // Reload data when language changes
    });

    // Khởi tạo các biến data
    let listBanner = [];
    let listToChucBaoChi = [];
    let listVDV = [];
    let listMonTT = [];
    let listSuKien = [];
    let listAnPham = []

    // Hàm khởi tạo và xử lý data chính
    async function initializeData() {
        let rqAnPham = {
            "pageIndex": 1,
            "pageSize": 15,
            "maNgonNgu": lang
        }
        try {
            const response = await getDataWithApi('GET', `/api/v1/TT_BCHomeApi/Performance?MaNgonNgu=${lang}`);
            const responseAnPham = await getDataWithApi('POST', `/api/XuatBanAnPhamApi/v1/Gets`, JSON.stringify(rqAnPham));
            console.log(response)
            console.log(responseAnPham)
            if (responseAnPham.isSuccess && responseAnPham.value.length > 0) {
                listAnPham = responseAnPham.value
                renderAnPhamXuatBan()
            }
            if (response && response.isSuccess) {
                // Cập nhật data
                listBanner = response.value.listBanner
                listToChucBaoChi = response.value.listBaoChi
                listToChucTheThao = response.value.listTheThao
                listVDV = response.value.listCaNhan
                listMonTT = response.value.listMonTheThao
                listSuKien = response.value.listSuKien

                // Sau khi có data, gọi các hàm render
                renderBanner()
                renderToChucBaoChi()
                renderToChucTheTheo()
                renderSuKien()
                renderVDV()
                renderTT()
                // Thêm các hàm render khác nếu cần
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    }
    // Gọi hàm khởi tạo khi trang load
    initializeData();

  

    //#region Render Banner
    function renderBanner() {
        if (listBanner && listBanner.length > 0) {
            let html = `<div class="slick-wrapper">`
            listBanner.forEach(item => {
                html += `
                    <div class="slide-item">
                        <div class="overlay-full"></div>
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
                                    ${item.gioiThieu ? item.gioiThieu : 'Đang cập nhật'}
                                </div>
                            </div>
                            <div class="group_function">
                                <div class="lienHe">
                                    ${item.dienThoai ? `<a class="phone" href="tel:${item.dienThoai}"><i class="hgi-icon hgi-phone"></i>${item.dienThoai}</a>` : ''}
                                    ${item.hopThu ? `<a class="mail" href="mailto:${item.hopThu}"><i class="hgi-icon hgi-mail"></i>${item.hopThu}</a>` : ''}
                                    ${item.website ? `<a class="website" href="${item.website}"><i class="hgi-icon hgi-web"></i>${item.website}</a>` : ''}
                                </div>
                                <div class="chitiet">
                                    <a href="">Xem chi tiết </a>
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
    function renderToChucTheTheo() {
        if (listToChucTheThao && listToChucTheThao.length > 0) {
            let html = `<div class="slick-organization navigation-hover slick-flex slick-height-equal">`;
            listToChucTheThao.forEach(item => {
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
                                    ${item.gioiThieu ? item.gioiThieu : 'Đang cập nhật'}
                                </div>
                            </div>
                            <div class="group_function">
                                <div class="lienHe">
                                    ${item.dienThoai ? `<a class="phone" href="tel:${item.dienThoai}"><i class="hgi-icon hgi-phone"></i>${item.dienThoai}</a>` : ''}
                                    ${item.hopThu ? `<a class="mail" href="mailto:${item.hopThu}"><i class="hgi-icon hgi-mail"></i>${item.hopThu}</a>` : ''}
                                    ${item.website ? `<a class="website" href="${item.website}"><i class="hgi-icon hgi-web"></i>${item.website}</a>` : ''}
                                </div>
                                <div class="chitiet">
                                    <a href="">Xem chi tiết </a>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                `
            })
            html += `</div>`;
            $('#card-list-theThao').html(html);
            setTimeout(() => {
                $('#card-list-theThao .slick-organization').slick({
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
                        }
                    ]
                });
            }, 150);
        }
    }
    //#endregion Lấy data từ dữ liệu hiệp hội thể thao

    //#region Lấy data từ dữ liệu sự kiện thể thao
    function renderSuKien() {
        if (listSuKien && listSuKien.length > 0) {
            let html = ``
            let mainSlider = `<div class="main-slider"><div class="event-slider-for">`;
            let navSlider = `<div class="special-thumb-container"><div class="special-thumb"><div class="event-slider-nav">`;
            listSuKien.forEach(item => {
                mainSlider += `<div class="slide-item">
                    <div class="main-content-left">
                        <div class="div-img">
                            <div class="overlay-background"></div>
                            <div class="image-event">
                                <a style="background-image: url('${item.anhDaiDien}')" href="/VanHoa/SuKienDetail?id=${item.suKienID}">
                                    <img src="${item.anhDaiDien}" alt="${item.tenSuKien || ''}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="main-content-right">
                        <div class="container">
                            <div class="div-right" style="margin-top: 100px;">
                                <div class="item-event">
                                    <span class="type-event">${item.typeSuKien}</span>
                                </div>
                                <div class="title-event">
                                    <a href="/VanHoa/SuKienDetail?id=${item.suKienID}">
                                        <span class="takeplace">${item.tenSuKien}</span>
                                    </a>
                                </div>

                                <!--Location and Coundown-->
                                <div class="info-event">
                                    <span class="date-event">${formatDateWithoutTime(item.batDau)} - ${formatDateWithoutTime(item.ketThuc)}</span>
                                    <span class="location-event">${item.listTenDiaDiem}</span>
                                    <div class="btn-event">
                                        <a class="event-details" href="/VanHoa/SuKienDetail?id=${item.suKienID}" >
                                            <span>Xem chi tiết</span>
                                            <i class="hgi-icon hgi-white-arrow"></i>
                                        </a>
                                    </div>
                                    <span class="countdown-event-group">
                                        <div class="countdown-event">
                                            <div class="divlock" data-date="${item.batDau}"></div>
                                            <div class="countdown-responsive">
                                                <div class="divlock-DayHour" data-date="${item.batDau}"></div>
                                                <div class="divlock-MinSec" data-date="${item.batDau}"></div>
                                            </div>
                                        </div>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`

                navSlider += `<div class="thumb-item">
                            <h4>${item.tenSuKien}</h4>
                        </div>`
            })
            mainSlider += `</div></div>`;
            navSlider += `</div></div></div>`;
            html = mainSlider;
            $('#suKienTT').html(html);
            setTimeout(() => {
                // Khởi tạo TimeCircles - GIỮ NGUYÊN
                $(".divlock").TimeCircles({
                    circle_bg_color: "rgb(255, 255, 255, 0.4)",
                    fg_width: 0.05,
                    bg_width: 0.2,
                    count_past_zero: false,
                    time: {
                        Days: {
                            show: true,
                            text: "Ngày",
                            color: "#f97f58"
                        },
                        Hours: {
                            show: true,
                            text: "Giờ",
                            color: "#f97f58"
                        },
                        Minutes: {
                            show: true,
                            text: "Phút",
                            color: "#f97f58"
                        },
                        Seconds: {
                            show: true,
                            text: "Giây",
                            color: "#f97f58"
                        }
                    },
                });

                $(".divlock-DayHour").TimeCircles({
                    circle_bg_color: "rgb(255, 255, 255, 0.4)",
                    fg_width: 0.05,
                    bg_width: 0.2,
                    count_past_zero: false,
                    time: {
                        Days: {
                            show: true,
                            text: "Ngày",
                            color: "#f97f58"
                        },
                        Hours: {
                            show: true,
                            text: "Giờ",
                            color: "#f97f58"
                        },
                        Minutes: {
                            show: false,
                            text: "Phút",
                            color: "#f97f58"
                        },
                        Seconds: {
                            show: false,
                            text: "Giây",
                            color: "#f97f58"
                        }
                    },
                });

                $(".divlock-MinSec").TimeCircles({
                    circle_bg_color: "rgb(255, 255, 255, 0.4)",
                    fg_width: 0.05,
                    bg_width: 0.2,
                    count_past_zero: false,
                    time: {
                        Days: {
                            show: false,
                            text: "Ngày",
                            color: "#f97f58"
                        },
                        Hours: {
                            show: false,
                            text: "Giờ",
                            color: "#f97f58"
                        },
                        Minutes: {
                            show: true,
                            text: "Phút",
                            color: "#f97f58"
                        },
                        Seconds: {
                            show: true,
                            text: "Giây",
                            color: "#f97f58"
                        }
                    },
                });

                // Khởi tạo Slick Slider - THAY THẾ SWIPER
                // Main slider
                $('.event-slider-for').slick({
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    arrows: false,
                    fade: true,
                    asNavFor: '.event-slider-nav',
                    autoplay: false,
                    autoplaySpeed: 8000,
                    speed: 1000,
                    pauseOnHover: false,
                    pauseOnFocus: false
                });

                // Thumbnail slider
                $('.event-slider-nav').slick({
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    asNavFor: '.event-slider-for',
                    dots: false,
                    arrows: true,
                    centerMode: false,
                    focusOnSelect: true,
                    prevArrow: '<button type="button" class="slick-prev"><span class="material-icons-outlined">west</span></button>',
                    nextArrow: '<button type="button" class="slick-next"><span class="material-icons-outlined">east</span></button>',
                });
            }, 150);
        }
    }
    //#endregion Lấy data từ dữ liệu sự kiện thể thao

    //#region Lấy data từ dữ liệu vận động viên
    function renderVDV() {
        if (listVDV && listVDV.length > 0) {
            let html = `<div class="slick-vdv navigation-hover slick-flex slick-height-equal">`;
            listVDV.forEach(item => {
                html += `
                    <div class="slide-item">
                        <div class="card-item-organization">
                            <div class="group_info">
                                <div class="anhDaiDien">
                                    <img src="${item.anhChanDung || '/assets/images/vector/no-image.png'}" alt="${item.tenVDV || ''}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                                </div>
                                <div class="thongTinVDV">
                                    <div class="organization-name">${item.hoTen}</div>
                                    <div class="organization-address">${item.tenMon ? item.tenMon : "Đang cập nhật"}</div>
                                </div>
                                <div class="tomTat">
                                    ${item.ghiChu ? item.ghiChu : 'Đang cập nhật'}
                                </div>
                            </div>
                            <div class="group_function">
                                <div class="giaiThuong">
                                    <i class="hgi-icon hgi-reward"></i>
                                    <span>${item.giaiThuong ? item.giaiThuong : "Đang cập nhật"}</span>
                                </div>
                                <div class="chitiet">
                                    <a href="">Xem chi tiết </a>
                                </div>
                            </div>  
                        </div>
                    </div>
                `
            })
            html += `</div>`;
            $('#card-list-vdv').html(html);
            setTimeout(() => {
                $('.slick-vdv').slick({
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
    //#endregion Lấy data từ dữ liệu vận động viên

    //#region Lấy data từ dữ liệu môn thể thao
    function renderTT() {
        if (listMonTT && listMonTT.length > 0) {
            let html = `<div class="slick-monTT navigation-hover slick-flex slick-height-equal">`;
            listMonTT.forEach(item => {
                html += `
                    <div class="slide-item">
                        <div class="card-item-organization">
                            <div class="group_info">
                                <div class="thongTinMonTT">
                                    <div class="organization-name">${item.tenMon}</div>
                                    <div class="organization-address">${item.cachThiDau}</div>
                                </div>
                                <div class="tomTat">
                                    ${item.luatChoi ? item.luatChoi : 'Đang cập nhật'}
                                </div>
                            </div>
                        </div>
                    </div>
                `
            })
            html += `</div>`;
            $('#monTT-list').html(html);
            setTimeout(() => {
                $('.slick-monTT').slick({
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
})