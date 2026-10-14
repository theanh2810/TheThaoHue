$(document).ready(function () {
    const paramsDPT = new URLSearchParams(window.location.search);
    const ID_Object = paramsDPT.get("id")
    let currentPage = 1;
    const itemsPerPage = 4;

    let lang = currentLang
    let noDataText,
        shareText,
        categoryTypeText,
        recognitionDateText,
        managingOrganizationText,
        rankingLevelText,
        conditionText,
        addressText,
        historicalPeriodText,
        descriptionText,
        updatingText;


    ; (async function () {
        const res = await fetch(`/lang/${lang}.json`);
        if (!res.ok) return;
        const translations = await res.json();

        noDataText = translations['noData']
        shareText = translations['share']
        updatingText = translations['updating']
        categoryTypeText = translations['categoryType']
        recognitionDateText = translations['recognitionDate']
        managingOrganizationText = translations['managingOrganization']
        rankingLevelText = translations['rankingLevel']
        conditionText = translations['condition']
        addressText = translations['address']
        historicalPeriodText = translations['historicalPeriod']
        descriptionText = translations['description']

        initializeData();
    })();

    let request = {
        "diTichID": ID_Object,
        "maNgonNgu": lang,
        "isThongTinTrungTu": false,
        "isDaPhuongTien": true,
        "isVanBanTaiLieu": false
    }

    function initializeData() {
        getDataWithApi('POST', `/api/DiTichApi/v1/GetDetail`, JSON.stringify(request)).then(response => {
            if (response && response.isSuccess && response.value) {
                let data = response.value;

                //#region Thêm tiêu đề
                let title = `<h1>${data.tenDiTich}</h1><div class="sharing"><i class="hgi-icon hgi-share"></i>${shareText}</div>`;
                $("#detail-title").html(title);
                $("#current-page").text(data.tenDiTich);
                document.title = `${data.tenDiTich}`;
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

                if (ID_Object == '33d8ea69-cabd-45f7-8aed-20acea52a734') {
                    $('#group_vr360').show();
                    let html_vr360 = `
                    <div class="group-corner-button with-title">
                        <h4>Thông tin VR360</h4>
                    </div>
                    <iframe src="https://baotangsonla.vn/3dnhatusonla/ThamQuanAo/index.html" 
                            width="100%" 
                            height="600" 
                            frameborder="0" 
                            allowfullscreen 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking">
                    </iframe>
                `;
                    $('#group_vr360').html(html_vr360);
                }
                //#endregion Thêm thư viện đa phương tiện

                //#region Thêm nôi dung chi tiết
                let html_noidung = '';
                if (data.anhDaiDien && images.length < 5) {
                    html_noidung += `<div class="anhDaiDien"><img src="${data.anhDaiDien}" data-lazy data-src="${data.anhDaiDien}" class="destination-img" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';"></div>`
                }
                if (data.nienDai) {
                    html_noidung += `<div class="nienDai"><div class="group-corner-button with-title"><h4>${historicalPeriodText}</h4></div><div class="group_lehoi_content">${data.nienDai}</div></div>`
                }
                if (data.moTaDiTich) {
                    html_noidung += `<div class="moTaDiTich"><div class="group-corner-button with-title"><h4>${descriptionText}</h4></div><div class="group_lehoi_content">${data.moTaDiTich}</div></div>`
                }
                $('#group_gioiThieu').html(html_noidung)
                //#endregion Thêm nôi dung chi tiết

                //#region Thêm thông tin lễ hội
                let html_info = `
                <ul class="info-list">
                    ${data.tenLoaiHinh ? `<li><label>${categoryTypeText}:</label> ${data.tenLoaiHinh}</li>` : ''}
                    ${data.ngayCongNhan ? `<li><label>${recognitionDateText}:</label> ${formatDateWithoutTime(data.ngayCongNhan)}</li>` : ''}
                    ${data.tenToChucQuanLy ? `<li><label>${managingOrganizationText}:</label> ${data.tenToChucQuanLy}</li>` : ''}
                    ${data.tenCapXepHang ? `<li><label>${rankingLevelText}:</label> ${data.tenCapXepHang}</li>` : ''}
                    ${data.tenTrangThai ? `<li><label>${conditionText}:</label> ${data.tenTrangThai}</li>` : ''}
                    ${data.diaChiChiTiet ? `<li><label>${addressText}:</label> ${data.diaChiChiTiet}</li>` : ''}
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

        getDataWithApi('GET', `/api/v1/VH_StatisticalApi/StatisticalDiTich?MaNgonNgu=${lang}`).then(response => {
            let listDiTich = response.value.filter(item => item.diTichID != ID_Object) || [];
            if (listDiTich && listDiTich.length > 0) {
                // Tính toán phân trang
                const totalItems = listDiTich.length;
                const totalPages = Math.ceil(totalItems / itemsPerPage);
                const startIndex = (currentPage - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const currentItems = listDiTich.slice(startIndex, endIndex);

                // Render danh sách
                let html = '<ul class="list-festival">';
                currentItems.forEach(item => {
                    let url = lang === 'vi' ? `/VanHoa/DiTichVanHoaDetail?id=${item.diTichID}` : `/${lang}/VanHoa/DiTichVanHoaDetail?id=${item.diTichID}`;
                    html += `
                    <li class="festival-item">
                        <div class="festival-image">
                            <a href="${url}">
                                <img src="${item.anhDaiDien || '/assets/images/vector/no-image.png'}" alt="${item.tenDiTich || ''}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                            </a>
                        </div>
                        <div class="festival-info">
                            <h3 class="festival-title">
                                <a href="${url}">${item.tenDiTich || ''}</a>
                            </h3>
                            <div class="festival-description">${item.moTa ? item.moTa : updatingText}</div>
                        </div>
                    </li>
                `
                })
                html += '</ul>';
                $('#diTichList').html(html);

            } else {
                $('#diTichList').html(`<p class="text-center">${noDataText}</p>`);
                $('#paginationDiTich').hide();
            }
        })
    }
});
