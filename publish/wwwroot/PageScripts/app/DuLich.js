$(document).ready(function () {
    initSelect2();
    //let lang = localStorage.getItem('lang') || 'vi';
    let lang = currentLang
    let viewDetailText,
        phoneText,
        foreignLanguageText,
        workExperienceText,
        contactText,
        foodAndBeverageFacilitiesText,
        accommodationText;

    ; (async function () {
        const res = await fetch(`/lang/${lang}.json`);
        if (!res.ok) return;
        const translations = await res.json();

        viewDetailText = translations['viewDetail']
        phoneText = translations['phone']
        foreignLanguageText = translations['foreignLanguage']
        workExperienceText = translations['workExperience']
        contactText = translations['contact']
        foodAndBeverageFacilitiesText = translations['foodAndBeverageFacilities']
        accommodationText = translations['accommodation']
        initializeData();
    })();

    // Khởi tạo các biến data
    let listBanner = [];
    let listDiaDiem = [];
    let listDiemDen = [];
    let listTour = [];
    let listDoanhNghiep = [];
    let listHDVDuLich = [];

    // Hàm khởi tạo và xử lý data chính
    async function initializeData() {
        try {
            //console.log(123123123)
            const response = await getDataWithApi('GET', `/api/v1/DL_StatisticalApi/Performance?MaNgonNgu=${lang}`);
            //const responseAnPham = await getDataWithApi("GET", '/api/XuatBanAnPhamApi/v1/Gets')
            //console.log(response)
            if (response && response.isSuccess) {
                // Cập nhật data
                listBanner = response.value.listBanner || [];
                listDiaDiem = response.value.listDiaDiem || [];
                listDiemDen = response.value.listDiemDen || [];
                listTour = response.value.listTour || [];
                listDoanhNghiep = response.value.listDoanhNghiep || [];
                listHDVDuLich = response.value.listHDVDuLich || [];

                // Sau khi có data, gọi các hàm render
                renderBanner();
                renderDuLich();
                renderToChuc();
                renderThamQuan();
                renderTour();
                renderHDVDuLich();
                // Thêm các hàm render khác nếu cần
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    }

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
            $('#sliderDuLich').html(html);
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

    //#region Lấy data từ dữ liệu ẩm thực
    function renderThamQuan() {
        //console.log(listDiaDiem)
        if (listDiaDiem.length > 0) {
            let html = `<div class="slick-utilities navigation-hover">`;
            listDiaDiem.forEach(item => {
                let url = item.type == "Cơ sở ăn uống" ? `/${lang}/DuLich/NhaHangDetail?id=${item.maCoSo}` : `/${lang}/DuLich/LuuTruDetail?id=${item.maCoSo}`
                let typeText = item.type == "Cơ sở ăn uống" ? foodAndBeverageFacilitiesText : accommodationText;
                html += `
                    <div class="slide-item">
                        <div class="utilities-news">
                            <a class="" href="#">
                                <img src="${item.anhDaiDien}" class="utilities-img" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                            </a>
                            <div class="utilities-description">
                                <span class="utilities-chuyenmuc"><a href="${url}">${typeText}</a></span>
                                <div class="utilities-link">
                                    <span class="utilities-title">${item.tenCoSo}</span>
                                </div>
                            </div>
                            <div class="utilities-caption">
                                <span class="utilities-chuyenmuc"><a href="${url}">${typeText}</a></span>
                                <div class="utilities-link">
                                    <span class="utilities-title">${item.tenCoSo}</span>
                                </div>
                                <div class="utilities-summary">
                                    <span class="utilities-content">${item.moTa}</span>
                                </div>
                                <div class="main-utilities-detail main-btn">
                                    <div class="btn-utilities btn-special btn-green">
                                        <a class="utilities-details btn-details" href="${url}" ><span>${viewDetailText}</span></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
            html += `</div>`;
            $('#utilities-list').html(html);

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

    //#region Render điểm đến du lịch
    function renderDuLich() {
        if (listDiemDen && listDiemDen.length > 0) {
            let html = '';
            //console.log(listDiemDen)
            // Build destination cards based on the static HTML structure in Index.cshtml
            listDiemDen.forEach((item, idx) => {
                
                const img = item.hinhAnh || '/assets/images/vector/no-image.png';
                const title = item.tenKhuDuLich || item.tenKhuDuLich || '';
                const excerpt = item.moTa || item.moTa || '';
                const id = item.khuDuLichID || item.khuDuLichID || '';

                // Create an id attribute similar to existing samples (destination-<n>)
                const elId = `destination-${idx + 1}`;

                let url = lang === 'vi' ? `/DuLich/DiemThamQuanDetail?id=${id}&type=DuLich` : `/${lang}/DuLich/DiemThamQuanDetail?id=${id}&type=DuLich`;
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
                                        <a class="destination-details btn-details" href="${url}"><span>${viewDetailText}</span></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });

            // Append generated HTML into grid
            $('#gridDuLich').html(html);
        }
    }
    //#endregion Lấy data từ dữ liệu điểm đến du lịch

    //#region Render tour du lịch
    function renderTour() {
        if (listTour && listTour.length > 0) {
            let html = `<div class="slick-tour slick-card navigation-hover slick-flex slick-height-equal">`;
            listTour.forEach(item => {
                let url = lang === 'vi' ? `/DuLich/TourDuLichDetail?id=${item.tourID}` : `/${lang}/DuLich/TourDuLichDetail?id=${item.tourID}`;
                html += `
                    <div class="slide-item">
                        <div class="card-item-tour">
                            <div class="image_tour">
                                <a href="${url}"><img src="${item.anhDaiDien || '/assets/images/vector/no-image.png'}" alt="${item.tenTour || ''}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" /></a>
                            </div>
                            <div class="tour-info">
                                <div class="tour-name"><a href="${url}">${item.tenTour || ''}</a></div>
                                <div class="tour-summary">
                                    ${item.moTa || ""}
                                </div>
                            </div>
                        </div>
                    </div>
                `
            })
            html += `</div>`;
            $('#tour-list').html(html);
            setTimeout(() => {
                $('.slick-tour').slick({
                    dots: false,
                    infinite: true,
                    speed: 500,
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
    //#endregion Render tour du lịch

    //#region Lấy data từ dữ liệu tổ chức
    function renderToChuc() {
        if (listDoanhNghiep && listDoanhNghiep.length > 0) {
            let html = `<div class="slick-organization navigation-hover slick-flex slick-height-equal">`;
            listDoanhNghiep.forEach(item => {
                let url = lang === 'vi' ? `/DuLich/DoanhNghiepLuHanhDetail?id=${item.toChucID}` : `/${lang}/DuLich/DoanhNghiepLuHanhDetail?id=${item.toChucID}`;
                html += `
                    <div class="slide-item">
                        <div class="card-item-organization">
                            <div class="tag">
                                <div class="tag_type">${item.tenLoaiHinh}</div>
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

    //#region Lấy data từ dữ liệu hướng dẫn viên
    function renderHDVDuLich() {
        if (listHDVDuLich && listHDVDuLich.length > 0) {
            let html = `<div class="slick-hdv navigation-hover slick-flex slick-height-equal">`;
            listHDVDuLich.forEach(item => {
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
                                    <div class="hdv-kinhnghiem"><label><i class="hgi-icon hgi-certificate-label"></i>${workExperienceText}: </label>${item.namKinhNghiem == null ? "-" : `${item.namKinhNghiem} năm`}</div>
                                    <div class="hdv-ngoaingu"><label><i class="hgi-icon hgi-globe-label"></i>${foreignLanguageText}: </label>${item.ngoaiNgu || "-"}</div>
                                </div>
                            </div>
                            <div class="group_function">
                                ${item.dienThoai ? `<div class="lienHe"><a class="phone" href="tel:${item.dienThoai}">${contactText}</a></div>` : ''}
                                <div class="chitiet">
                                    <a href="${url}" data-i18n="common.viewDetail">${viewDetailText}</a>
                                </div>
                            </div>
                        </div>
                    </div>
                `
            })
            html += `</div>`;
            $('#card-list-HDVDuLich').html(html);
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
})