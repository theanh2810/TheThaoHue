$(document).ready(function () {
    const paramsDPT = new URLSearchParams(window.location.search);
    const ID_Object = paramsDPT.get("id")
    let currentPage = 1;
    const itemsPerPage = 12;

    let lang = currentLang
    let shareText,
        introductionText,
        regulationsText,
        evaluationText,
        festivalTypeText,
        festivalLevelText,
        managementLevelText,
        timePeriodText,
        frequencyText,
        organizingUnitText,
        coordinatingUnitText,
        noDataText,
        signatureDishesText,
        updatingText;

    ; (async function () {
        const res = await fetch(`/lang/${lang}.json`);
        if (!res.ok) return;
        const translations = await res.json();

        updatingText = translations['updating']
        shareText = translations['share']
        introductionText = translations['introduction']
        regulationsText = translations['regulations']
        evaluationText = translations['evaluation']
        festivalTypeText = translations['festivalType']
        festivalLevelText = translations['festivalLevel']
        managementLevelText = translations['managementLevel']
        timePeriodText = translations['timePeriod']
        frequencyText = translations['frequency']
        organizingUnitText = translations['organizingUnit']
        coordinatingUnitText = translations['coordinatingUnit']
        noDataText = translations['noData']
        signatureDishesText = translations['signatureDishes']

        getDataDetail()
        getOtherFestivals()
    })();

    function getDataDetail() {
        getDataWithApi('GET', `/api/VH_LeHoiApi/Get?MaNgonNgu=${lang}&LeHoiID=${ID_Object}`).then(response => {
            if (response && response.isSuccess && response.value) {
                let data = response.value;

                //#region Thêm tiêu đề
                let title = `<h1>${data.tenLeHoiChild}</h1><div class="sharing"><i class="hgi-icon hgi-share"></i>${shareText}</div>`;
                $("#detail-title").html(title);
                $("#current-page").text(data.tenLeHoiChild);
                document.title = `${data.tenLeHoiChild}`;
                //#endregion Thêm tiêu đề

                //#region Thêm thư viện đa phương tiện
                const videos = [];
                const audios = [];
                const images = [];
                const files = [];

                data.daPhuongTien.forEach(item => {
                    const ext = getFileExtension(item.duongDanFile);
                    if (item.loaiMedia == 2 || ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) {
                        videos.push(item);
                    } else if (item.loaiMedia == 3 || ['mp3', 'wav', 'ogg'].includes(ext)) {
                        audios.push(item);
                    } else if (item.loaiMedia == 1 || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) {
                        images.push(item);
                    } else {
                        files.push(item);
                    }
                });

                // === Hiển thị Hình ảnh ===
                if (images.length > 0) {
                    const maxVisible = 5;
                    let html_images = '';

                    images.slice(0, maxVisible).forEach((img, index) => {
                        if (index === maxVisible - 1 && images.length > maxVisible) {
                            const remaining = images.length - maxVisible;
                            html_images += `
                            <a href="${img.duongDanFile}" data-id="${img.daPhuongTienID}" class="gallery-item overlay-item" style="position: relative; display: inline-block;">
                                <img src="${img.duongDanFile}" />
                                <div class="overlay-count">+${remaining}</div>
                            </a>
                        `;
                        } else {
                            html_images += `<a href="${img.duongDanFile}" data-id="${img.daPhuongTienID}" class="gallery-item"><img src="${img.duongDanFile}" /></a>`;
                        }
                    });

                    let imageInitContainer;

                    if (images.length > 4) {
                        $('#animated-thumbnails-gallery').html(html_images);
                        imageInitContainer = document.getElementById('animated-thumbnails-gallery');
                        $('.groupImage').hide();
                    } else {
                        $('#animated-thumbnails-gallery-2').html(html_images);
                        imageInitContainer = document.getElementById('animated-thumbnails-gallery-2');
                        $("#detail-gallery").hide();
                    }

                    const dynamicElements = images.map(img => ({
                        src: img.duongDanFile,
                        thumb: img.duongDanFile,
                        id: img.daPhuongTienID,
                        subHtml: `<div class="lightGallery-captions"><h4>${img.tieuDe}</h4></div>`
                    }));

                    const imageContainer = imageInitContainer;
                    const imageGallery = lightGallery(imageContainer, {
                        dynamic: true,
                        dynamicEl: dynamicElements,
                        autoplayFirstVideo: false,
                        pager: false,
                        plugins: [lgZoom, lgThumbnail, lgAutoplay, lgFullscreen],
                        mobileSettings: {
                            controls: false,
                            showCloseIcon: false,
                            download: false,
                            rotate: false
                        }
                    });

                    $(imageContainer).on("click", ".gallery-item", function (e) {
                        e.preventDefault();
                        const index = $(this).index();
                        imageGallery.openGallery(index);
                    });
                } else {
                    $('.groupImage').hide();
                    $("#detail-gallery").hide();
                }

                // === Hiển thị Video ===
                if (videos.length > 0) {
                    const maxVisible = 6;
                    let html_videos = '';
                    const dynamicVideos = [];

                    // Duyệt video và tạo thumbnail (có thể async)
                    const videoPromises = videos.map(async (item, i) => {
                        const vid = item;
                        const videoUrl = baseUrl + vid.duongDanFile;
                        const thumb = await getVideoThumbnail(videoUrl); // 👈 lấy khung đầu tiên
                        // HTML hiển thị
                        if (i === maxVisible - 1 && videos.length > maxVisible) {
                            const remaining = videos.length - maxVisible;
                            html_videos += `
                            <a href="${videoUrl}" data-id="${vid.daPhuongTienID}" class="video-item overlay-item" style="position: relative; display: inline-block;">
                                <img src="${thumb}" alt="video thumbnail">
                                <div class="play-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="50" viewBox="0 0 48 50" fill="none">
                                        <g filter="url(#filter0_d_1420_56781)">
                                            <path d="M27.881 13.6741C31.147 15.5295 33.7134 16.9875 35.5418 18.3231C37.3826 19.6678 38.7442 21.0733 39.2318 22.9265C39.5894 24.2853 39.5894 25.7149 39.2318 27.0737C38.7442 28.9269 37.3826 30.3323 35.5418 31.6771C33.7134 33.0127 31.147 34.4707 27.8812 36.3261C24.7264 38.1183 22.066 39.6297 20.0464 40.4889C18.0106 41.3547 16.1546 41.7937 14.3507 41.2825C13.025 40.9067 11.8188 40.1937 10.8471 39.2133C9.52838 37.8829 8.99902 36.0439 8.74858 33.8309C8.49996 31.6339 8.49998 28.7581 8.5 25.1003V24.8999C8.49998 21.2421 8.49996 18.3663 8.74858 16.1694C8.99902 13.9563 9.52838 12.1173 10.8471 10.7868C11.8188 9.80647 13.025 9.09345 14.3507 8.71779C16.1546 8.20663 18.0106 8.64551 20.0464 9.51143C22.066 10.3704 24.7264 11.8818 27.881 13.6741Z" fill="white"/>
                                        </g>
                                        <defs>
                                            <filter id="filter0_d_1420_56781" x="-8" y="-7" width="64" height="64" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                                            <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                                            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                                            <feOffset/>
                                            <feGaussianBlur stdDeviation="4"/>
                                            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0"/>
                                            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1420_56781"/>
                                            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1420_56781" result="shape"/>
                                            </filter>
                                        </defs>
                                    </svg>
                                </div>
                                <div class="overlay-count">+${remaining}</div>
                            </a>
                        `;
                        } else if (i < maxVisible) {
                            html_videos += `
                            <a href="${videoUrl}" data-id="${vid.daPhuongTienID}" class="video-item" style="position: relative; display: inline-block;">
                                <img src="${thumb}" alt="video thumbnail">
                                <div class="play-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="50" viewBox="0 0 48 50" fill="none">
                                        <g filter="url(#filter0_d_1420_56781)">
                                            <path d="M27.881 13.6741C31.147 15.5295 33.7134 16.9875 35.5418 18.3231C37.3826 19.6678 38.7442 21.0733 39.2318 22.9265C39.5894 24.2853 39.5894 25.7149 39.2318 27.0737C38.7442 28.9269 37.3826 30.3323 35.5418 31.6771C33.7134 33.0127 31.147 34.4707 27.8812 36.3261C24.7264 38.1183 22.066 39.6297 20.0464 40.4889C18.0106 41.3547 16.1546 41.7937 14.3507 41.2825C13.025 40.9067 11.8188 40.1937 10.8471 39.2133C9.52838 37.8829 8.99902 36.0439 8.74858 33.8309C8.49996 31.6339 8.49998 28.7581 8.5 25.1003V24.8999C8.49998 21.2421 8.49996 18.3663 8.74858 16.1694C8.99902 13.9563 9.52838 12.1173 10.8471 10.7868C11.8188 9.80647 13.025 9.09345 14.3507 8.71779C16.1546 8.20663 18.0106 8.64551 20.0464 9.51143C22.066 10.3704 24.7264 11.8818 27.881 13.6741Z" fill="white"/>
                                        </g>
                                        <defs>
                                            <filter id="filter0_d_1420_56781" x="-8" y="-7" width="64" height="64" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                                            <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                                            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                                            <feOffset/>
                                            <feGaussianBlur stdDeviation="4"/>
                                            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0"/>
                                            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1420_56781"/>
                                            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1420_56781" result="shape"/>
                                            </filter>
                                        </defs>
                                    </svg>
                                </div>
                            </a>
                        `;
                        }

                        //console.log(thumb, videoUrl, "checkVideo")

                        // Dữ liệu LightGallery
                        dynamicVideos.push({
                            thumb: thumb,
                            subHtml: `<div class="lightGallery-captions"><h4>${vid.tieuDe}</h4></div>`,
                            video: {
                                source: [{
                                    src: videoUrl,
                                    type: 'video/' + getFileExtension(vid.duongDanFile)
                                }],
                                attributes: { preload: false, controls: true }
                            }
                        });
                        $('#animated-videos-gallery').html(html_videos);
                    })

                    // Chờ tất cả thumbnail được tạo xong
                    Promise.all(videoPromises).then(() => {
                        const videoContainer = document.getElementById('animated-videos-gallery');
                        const videoGallery = lightGallery(videoContainer, {
                            dynamic: true,
                            dynamicEl: dynamicVideos,
                            plugins: [lgVideo, lgThumbnail, lgAutoplay, lgFullscreen],
                            mobileSettings: {
                                controls: true,
                                showCloseIcon: false,
                                download: false,
                                rotate: false
                            }
                        });

                        $("#animated-videos-gallery").on("click", ".video-item", function (e) {
                            e.preventDefault();
                            const index = $(this).index();
                            videoGallery.openGallery(index);
                        });
                    });
                } else {
                    $('.groupVideo').hide();
                }

                if (audios.length > 0) {
                    let html_audios = '';
                    audios.forEach(aud => {
                        html_audios += `
                        <div class="audio-item">
                            <div class="audio-info">
                                <div class="audio-title">${aud.tieuDe}</div>
                                ${aud.tacGia ? `<div class="audio-author">(${aud.tacGia || ''})</div> ` : ``}
                            </div>
                            <audio controls>
                                <source src="${baseUrl + aud.duongDanFile}" type="audio/${getFileExtension(aud.duongDanFile)}">
                                Trình duyệt của bạn không hỗ trợ thẻ audio.
                            </audio>
                        </div>
                    `;
                    });
                    $('#audio-gallery').html(html_audios);
                } else {
                    $('.groupAudio').hide();
                }
                //#endregion Thêm thư viện đa phương tiện

                //#region Thêm nôi dung chi tiết
                let html_noidung = '';
                if (data.anhDaiDien && images.length < 5) {
                    html_noidung += `<div class="anhDaiDien"><img src="${data.anhDaiDien}" data-lazy data-src="${data.anhDaiDien}" class="destination-img" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';"></div>`
                }
                if (data.noiDung) {
                    html_noidung += `<div class="noiDung"><div class="group-corner-button with-title"><h4>${introductionText}</h4></div><div class="group_lehoi_content">${data.noiDung}</div></div>`
                }
                if (data.quiDinh) {
                    html_noidung += `<div class="quiDinh"><div class="group-corner-button with-title"><h4>${regulationsText}</h4></div><div class="group_lehoi_content">${data.quiDinh}</div></div>`
                }
                if (data.danhGia) {
                    html_noidung += `<div class="danhGia"><div class="group-corner-button with-title"><h4>${evaluationText}</h4></div><div class="group_lehoi_content">${data.danhGia}</div></div>`
                }
                $('#group_gioiThieu').html(html_noidung)
                //#endregion Thêm nôi dung chi tiết

                //#region Thêm nôi dung ẩm thực
                if (data.listAmThuc && data.listAmThuc.length > 0) {
                    let html = `<div class="group-corner-button with-title">
                    <h4>${signatureDishesText}</h4>
                </div><div class="slide-list navigation-hover">`;
                    data.listAmThuc.forEach(item => {
                        let url = lang === 'vi' ? `/VanHoa/AmThucDetail?id=${item.monAnUongID}` : `/${lang}/VanHoa/AmThucDetail?id=${item.monAnUongID}`;
                        html += `
                        <div class="slide-food food-item">
                            <div class="list-item">
                                <div class="list-image">
                                    <a href="${url}">
                                        <img src="${item.anhDaiDien || '/assets/images/vector/no-image.png'}" alt="${item.tenMon || ''}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                                    </a>
                                </div>
                                <div class="list-info">
                                    <h3 class="list-title">
                                        <a href="${url}">${item.tenMon || ''}</a>
                                    </h3>
                                    <div class="list-description">${item.moTa ? item.moTa : updatingText}</div>
                                </div>
                            </div>
                        </div>
                    `
                    })
                    html += '</div>';
                    $('#group_amThuc').html(html);
                    setTimeout(() => {
                        $('.slide-list').slick({
                            slidesToShow: 3,
                            slidesToScroll: 1,
                            infinite: true,
                            arrows: true,
                            dots: false,
                            responsive: [
                                {
                                    breakpoint: 992,
                                    settings: {
                                        slidesToShow: 2
                                    }
                                },
                                {
                                    breakpoint: 576,
                                    settings: {
                                        slidesToShow: 1
                                    }
                                }
                            ]
                        })
                    }, 100);
                } else {
                    $('#group_amThuc').hide();
                }
                //#endregion Thêm nôi dung ẩm thực

                //#region Thêm thông tin lễ hội
                let html_info = `
                <ul class="info-list">
                    ${data.theLoai ? `<li><label>${festivalTypeText}:</label> ${data.theLoai}</li>` : ''}
                    ${data.capDo ? `<li><label>${festivalLevelText}:</label> ${data.capDo}</li>` : ''}
                    ${data.capQuanLy ? `<li><label>${managementLevelText}:</label> ${data.capQuanLy}</li>` : ''}
                    ${data.thoiGianDienRa ? `<li><label>${timePeriodText}:</label> ${data.thoiGianDienRa}</li>` : ''}
                    ${data.tanSuat ? `<li><label>${frequencyText}:</label> ${data.tanSuat}</li>` : ''}
                    ${data.diaDiemToChuc ? `<li><label>${organizingUnitText}:</label> ${data.diaDiemToChuc}</li>` : ''}
                    ${data.donViPhoiHop ? `<li><label>${coordinatingUnitText}:</label> ${data.donViPhoiHop}</li>` : ''}
                    ${data.namVHPHTQG ? `<li><label>Năm VHPHTQG:</label> ${data.namVHPHTQG}</li>` : ''}
                    ${data.nhanVatPhungTho ? `<li><label>Nhân vật phụng thờ:</label> ${data.nhanVatPhungTho}</li>` : ''}
                    ${data.soLuongThamGia ? `<li><label>Số người tham gia:</label> ${data.soLuongThamGia}</li>` : ''}
                    ${data.soNgayDienRa ? `<li><label>Số ngày diễn ra:</label> ${data.soNgayDienRa}</li>` : ''}
                    ${data.diaDiemToChuc ? `<li><label>Địa điểm:</label> ${data.diaDiemToChuc}</li>` : ''}
                </ul>
            `;
                $('#group_thongTin').html(html_info);
                //#endregion Thêm thông tin lễ hội
            } else {
                $('#detailContent').html(`<p class="text-center">${noDataText}</p>`);
            }
        })
            .catch(error => {
                console.error('Error loading detail:', error);
                $('#detailContent').html('<p class="text-center text-danger">Đã xảy ra lỗi khi tải dữ liệu</p>');
            });
    }

    function getOtherFestivals() {
        getDataWithApi('GET', `/api/v1/VH_StatisticalApi/StatisticalLeHoiVanHoa?MaNgonNgu=${lang}`).then(response => {
            let listLeHoi = response.value.listLeHoi || [];
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
                            <div class="festival-description">${item.noiDung ? item.noiDung : updatingText}</div>
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
        })
    }
   
});
