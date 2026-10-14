$(document).ready(function () {
    initSelect2();
    let lang = currentLang
    ; (async function () {
        const res = await fetch(`/lang/${lang}.json`);
        if (!res.ok) return;
        const translations = await res.json();

        viewDetailText = translations['viewDetail']
        cuisineText = translations['cuisine']
        transportText = translations['transport']
        sightseeingText = translations['sightseeing']
        accommodationText = translations['accommodation']
        sportText = translations['sport']
        healthcareText = translations['healthcare']
        entertainmentText = translations['entertainment']
        shoppingText = translations['shopping']
        otherText = translations['other']
        experienceServiceText = translations['experienceService']

        getDataRelics();
        getDataPublications();
        getDataStatistics()
    })();
  
    // Xử lý sự kiện click nút tìm kiếm
    $('.btn-stick').on('click', function() {
        window.location.href = '/Home/UnderDevelopment';
    });

    //#region Lấy data từ dữ liệu Banner
    getDataWithApi('GET', `/api/DM_BannerApi/GetByLinhVuc?MaNgonNgu=${lang}&linhVucID=0`).then(data => {
        if (data && data.isSuccess && data.value.length > 0) {
            let html = `<div class="slick-wrapper">`
            data.value.forEach(item => {
                html += `
                    <div class="slide-item">
                        <div class="overlay-full"></div>
                        <img src="${item.anhDaiDien || '/assets/images/vector/no-image.png'}" alt="${item.tenBanner || ''}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                        <div class="slide-caption">
                            <h2 class="slide-title">${item.tenBanner || ''}</h2>
                            <span class="slide-subtitle">${item.moTa || ''}</span>
                        </div>
                    </div>
                `
            })
            html += `</div>`
            $('#sliderTrangChu').html(html);
            setTimeout(() => {
                var $slide = $('.slick-wrapper').slick({
                    autoplay: true,
                    autoplaySpeed: 8500,
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
    })
    //#endregion Lấy data từ dữ liệu Banner

    //#region Lấy data từ dữ liệu Địa điểm 
    // Fetch multiple place APIs in parallel, take up to 3 items from each, then shuffle and render
    const pageSizePerApi = 3;

    const apis = [
        { key: 'CongTrinhTheThaoApi', url: '/api/CongTrinhTheThaoApi/v1/Gets', body: { pageIndex: 1, pageSize: pageSizePerApi, maNgonNgu: lang } },
        { key: 'DL_CoSoAnUongApi', url: '/api/DL_CoSoAnUongApi/v1/Gets', body: { pageIndex: 1, pageSize: pageSizePerApi, maNgonNgu: lang } },
        { key: 'DL_CoSoDichVuHoTroApi', url: '/api/DL_CoSoDichVuHoTroApi/v1/Gets', body: { pageIndex: 1, pageSize: pageSizePerApi, maNgonNgu: lang } },
        { key: 'DL_CoSoDichVuTraiNghiemApi', url: '/api/DL_CoSoDichVuTraiNghiemApi/v1/Gets', body: { pageIndex: 1, pageSize: pageSizePerApi, maNgonNgu: lang, loaiHinhCoSoID: 0 } },
        { key: 'DL_CoSoLuuTruApi', url: '/api/DL_CoSoLuuTruApi/v1/Gets', body: { pageIndex: 1, pageSize: pageSizePerApi, maNgonNgu: lang } },
        { key: 'KhuDuLichApi', url: '/api/KhuDuLichApi/v1/Gets', body: { pageIndex: 1, pageSize: pageSizePerApi, maNgonNgu: lang } },
    ];

    const fetchPromises = apis.map(a => getDataWithApi('POST', a.url, JSON.stringify(a.body)).catch(err => ({ isSuccess: false, error: err })));

    Promise.all(fetchPromises).then(results => {
        // Collect values from each successful response, limit to pageSizePerApi
        let listDiaDiem = [];

        results.forEach((res, idx) => {
            const apiMeta = apis[idx];
            const sourceKey = apiMeta && apiMeta.key ? apiMeta.key : null;

            if (res && res.isSuccess && Array.isArray(res.value) && res.value.length > 0) {
                // Ensure we only take up to pageSizePerApi items
                const items = res.value.slice(0, pageSizePerApi).map(it => {
                    // tag the item with its source so we can render category
                    it.__source = sourceKey;
                    return it;
                });
                listDiaDiem = listDiaDiem.concat(items);
            }
        });

        // Shuffle listDiaDiem
        for (let i = listDiaDiem.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [listDiaDiem[i], listDiaDiem[j]] = [listDiaDiem[j], listDiaDiem[i]];
        }

        // Mapping tên chuyên mục theo các API
        function getCategoryForItem(item) {
            if (!item || !item.__source) return otherText;

            switch (item.__source) {
                case 'CongTrinhTheThaoApi':
                    return sportText;
                case 'DL_CoSoAnUongApi':
                    return cuisineText;
                case 'DL_CoSoDichVuHoTroApi':
                    return transportText;
                case 'DL_CoSoDichVuTraiNghiemApi':
                    // Use loaiHinhCoSoID on the item if present, else fall back to provided filter
                    const id = item.loaiHinhCoSoID || item.loaiHinhID || item.loaiHinh || null;
                    if (id === 194) return healthcareText;
                    if (id === 196) return entertainmentText;
                    if (id === 191) return shoppingText;
                    return experienceServiceText;
                case 'DL_CoSoLuuTruApi':
                    return accommodationText;
                case 'KhuDuLichApi':
                    return sightseeingText;
                default:
                    return otherText;
            }
        }

        // Mapping link chuyên mục theo các API
        function getCategoryLinkForItem(item) {
            if (!item || !item.__source) return 'Khác';

            switch (item.__source) {
                case 'CongTrinhTheThaoApi':
                    return '/DuLich/CongTrinhTheThaoDetail';
                case 'DL_CoSoAnUongApi':
                    return '/DuLich/NhaHangDetail';
                case 'DL_CoSoDichVuHoTroApi':
                    return '/DuLich/VanTaiDetail';
                case 'DL_CoSoDichVuTraiNghiemApi':
                    // Use loaiHinhCoSoID on the item if present, else fall back to provided filter
                    const id = item.loaiHinhCoSoID || item.loaiHinhID || item.loaiHinh || null;
                    if (id === 194) return '/DuLich/ChamSocSucKhoeDetail';
                    if (id === 196) return '/DuLich/VuiChoiGiaiTriDetail';
                    if (id === 191) return '/DuLich/MuaSamDetail';
                    return '/DuLich/DichVuTraiNghiemDetail';
                case 'DL_CoSoLuuTruApi':
                    return '/DuLich/LuuTruDetail';
                case 'KhuDuLichApi':
                    return '/DuLich/DiemThamQuanDetail';
                default:
                    return '/';
            }
        }

        // Save to a global or local variable for later use in templates
        window.listDiaDiem = listDiaDiem;

        // Render slider HTML using listDiaDiem
        if (listDiaDiem.length > 0) {
            let html = `<div class="slick-utilities navigation-hover">`;
                listDiaDiem.forEach(item => {
                // Try to find an image property; fallback to placeholder
                const id = item.khuDuLichID || item.coSoAnUongID || item.coSoDichVuHoTroID || item.coSoDichVuTraiNghiemID || item.coSoLuuTruID || item.congTrinhTheThaoID || '';
                const img = item.anhDaiDien || item.hinhAnh || '/assets/images/vector/no-image.png';
                const title = item.ten || item.tenCoSo || item.tenDiaDiem || item.tenMon || item.ten || item.tenCongTrinh || item.tenKhuDuLich || item.tenDiTich || '';
                const excerpt = item.moTa || item.tomTat || '';
                const category = getCategoryForItem(item);
                    const categoryLink = lang === "vi" ? getCategoryLinkForItem(item) : `/${lang}` + getCategoryLinkForItem(item);
                html += `
                    <div class="slide-item">
                        <div class="utilities-news">
                            <a class="" href="${categoryLink}?id=${id}">
                                <img src="${img}" class="utilities-img" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                            </a>
                            <div class="utilities-description">
                                <span class="utilities-chuyenmuc"><a href="${categoryLink}">${category}</a></span>
                                <div class="utilities-link">
                                    <span class="utilities-title">${title}</span>
                                </div>
                            </div>
                            <div class="utilities-caption">
                                <span class="utilities-chuyenmuc"><a href="${categoryLink}">${category}</a></span>
                                <div class="utilities-link">
                                    <span class="utilities-title">${title}</span>
                                </div>
                                <div class="utilities-summary">
                                    <span class="utilities-content">${excerpt}</span>
                                </div>
                                <div class="main-utilities-detail main-btn">
                                    <div class="btn-utilities btn-special btn-green">
                                        <a class="utilities-details btn-details" href="${categoryLink}?id=${id}"><span data-i18n="common.viewDetail">${viewDetailText}</span></a>
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
    }).catch(err => {
        console.error('Error fetching place APIs', err);
    });
    //#endregion Lấy data từ dữ liệu Địa điểm 

    //#region Lấy data từ dữ liệu Di tích lịch sử
    let rqDiTich = {
        "pageIndex": 1,
        "pageSize": 6,
        "maNgonNgu": lang
    }
    function getDataRelics() {
        getDataWithApi('POST', `/api/DiTichApi/v1/Gets`, JSON.stringify(rqDiTich)).then(data => {
            if (data && data.isSuccess && Array.isArray(data.value) && data.value.length > 0) {
                let html = '';

                // Build destination cards based on the static HTML structure in Index.cshtml
                data.value.forEach((item, idx) => {
                    const img = item.anhDaiDien || '/assets/images/vector/no-image.png';
                    const title = item.tenDiTich || item.ten || '';
                    const excerpt = item.moTaDiTich || item.moTa || '';
                    const id = item.diTichID || item.diTichId || '';
                    const url = lang === 'vi' ? `/VanHoa/DiTichVanHoaDetail?id=${id}` : `/${lang}/VanHoa/DiTichVanHoaDetail?id=${id}`;
                    // Create an id attribute similar to existing samples (destination-<n>)
                    const elId = `destination-${idx + 1}`;

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
                $('#gridDiTichLichSu').html(html);
            }
        })
    }
    //#endregion Lấy data từ dữ liệu Di tích lịch sử

    //#region Lấy data từ dữ liệu thống kê chung - tìm kiếm
    function getDataStatistics() {
        getDataWithApi('GET', `/api/v1/VH_StatisticalApi/StatisticalCount?maNgonNgu=${lang}`).then(data => {
            let html = ``
            if (data && data.isSuccess && data.value) {
                $('#heritage').text(`${data.value.find(x => x.typeStatistical === 1)?.soLuong || 0}`)
                $('#festival').text(`${data.value.find(x => x.typeStatistical === 8)?.soLuong || 0}`)
                //html += `<div class="item">
                //            <img class="pavilon-duotone" src="/assets/images/AI_Layout/pavilon-duotone0.svg" />
                //            <div class="content2">
                //                <div class="number"></div>
                //                <div class="content">Di tích văn hóa - lịch sử</div>
                //            </div>
                //        </div>
                //        <div class="item">
                //            <img class="ticket-star-duotone" src="/assets/images/AI_Layout/ticket-star-duotone0.svg" />
                //            <div class="content2">
                //                <div class="number">${data.value.find(x => x.typeStatistical === 8)?.soLuong || 0}</div>
                //                <div class="content">Lễ hội lớn mỗi năm</div>
                //            </div>
                //        </div>
                //        <div class="item">
                //            <img
                //                class="maps-location-01-duotone"
                //                src="/assets/images/AI_Layout/maps-location-01-duotone0.svg"
                //            />
                //            <div class="content2">
                //                <div class="number">50</div>
                //                <div class="content">Điểm đến du lịch</div>
                //            </div>
                //        </div>
                //        <div class="item">
                //            <img class="building-03-duotone" src="/assets/images/AI_Layout/building-03-duotone0.svg" />
                //            <div class="content2">
                //                <div class="number">20</div>
                //                <div class="content">Cơ quan báo chí</div>
                //            </div>
                //        </div>
                //        <div class="item">
                //            <img class="swimming-duotone" src="/assets/images/AI_Layout/swimming-duotone0.svg" />
                //            <div class="content2">
                //                <div class="number">100</div>
                //                <div class="content">Vận động viên</div>
                //            </div>
                //        </div>`
            }
            // $('#summary_static').html(html);
        })
    }
    //#endregion Lấy data từ dữ liệu thống kê chung - tìm kiếm

    //#region Lấy data từ dữ liệu Ấn phẩm xuất bản
    let rqAnPham = {
        "pageIndex": 1,
        "pageSize": 15,
        "maNgonNgu": lang
    }
    function getDataPublications() {
        getDataWithApi('POST', `/api/XuatBanAnPhamApi/v1/Gets`, JSON.stringify(rqAnPham)).then(data => {
            if (data && data.isSuccess && data.value.length > 0) {
                let html = `<div class="slick-anPham">`
                data.value.forEach(item => {
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
        })
    }
});
