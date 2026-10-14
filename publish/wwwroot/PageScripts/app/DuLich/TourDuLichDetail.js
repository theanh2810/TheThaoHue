$(document).ready(function () {
    const paramsDPT = new URLSearchParams(window.location.search);
    const ID_Object = paramsDPT.get("id")
    let currentPage = 1;
    const itemsPerPage = 4;

    let lang = currentLang
    let viewDetailText,
        shareText,
        noDataText,
        callText,
        sendEmailText,
        websiteText,
        categoryTypeText,
        segmentText,
        descriptionText,
        experienceText,
        numberOfVisitorsText,
        suggestionText,
        genreText,
        transportationText,
        timeText,
        priceText,
        pricePerPersonVNDText,
        departureText,
        mapLocationText,
        updatingText;

    ; (async function () {
        const res = await fetch(`/lang/${lang}.json`);
        if (!res.ok) return;
        const translations = await res.json();

        viewDetailText = translations['viewDetail']
        shareText = translations['share']
        callText = translations['call']
        sendEmailText = translations['sendEmail']
        websiteText = translations['website']
        categoryTypeText = translations['categoryType']
        noDataText = translations['noData']
        descriptionText = translations['description']
        experienceText = translations['experience']
        numberOfVisitorsText = translations['numberOfVisitors']
        suggestionText = translations['suggestion']
        genreText = translations['genre']
        transportationText = translations['transportation']
        timeText = translations['time']
        priceText = translations['price']
        pricePerPersonVNDText = translations['pricePerPersonVND']
        departureText = translations['departure']
        mapLocationText = translations['mapLocation']
        updatingText = translations['updating']

        initializeData();
    })();

  

    function initializeData() {
        let request = {
            "tourID": ID_Object,
            "maNgonNgu": lang,
        }
        getDataWithApi('POST', `/api/TourDuLichApi/v1/GetDetail`, JSON.stringify(request)).then(response => {
            if (response && response.isSuccess && response.value) {
                let data = response.value;
                console.log(data)

                //#region Thêm tiêu đề
                let title = `<div class="detail-title">
                <h1>${data.tenTour}</h1>
            </div>
            <div class="function-bar">
                ${data.dienThoai ? `<div class="phone"><a href="tel:${data.dienThoai}"><i class="hgi-icon hgi-tag-phone"></i>${callText}</a></div>` : ""}
                ${data.hopThu ? `<div class="mail"><a href="mailto:${data.hopThu}"><i class="hgi-icon hgi-tag-mail"></i>${sendEmailText}</a></div>` : ""}
                ${data.lienKet ? `<div class="website"><a href="${data.lienKet}"><i class="hgi-icon hgi-tag-web"></i>${websiteText}</a></div>` : ""}
                <div class="sharing"><i class="hgi-icon hgi-share"></i>${shareText}</div>
            </div>`;
                $("#detail-title").html(title);
                $("#current-page").text(data.tenTour);
                document.title = `${data.tenTour}`;
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

                    const videoPromises = videos.map(async (item, i) => {
                        const vid = item;
                        const videoUrl = baseUrl + vid.duongDanFile;
                        const thumb = await getVideoThumbnail(videoUrl);

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
                if (data.moTa) {
                    html_noidung += `<div class="moTa"><div class="group-corner-button with-title"><h4>${descriptionText}</h4></div><div class="group_lehoi_content">${data.moTa}</div></div>`
                }
                if (data.traiNghiem) {
                    html_noidung += `<div class="traiNghiem"><div class="group-corner-button with-title"><h4>${experienceText}</h4></div><div class="group_lehoi_content">${data.traiNghiem}</div></div>`
                }
                if (data.goiY) {
                    html_noidung += `<div class="goiY"><div class="group-corner-button with-title"><h4>${suggestionText}</h4></div><div class="group_lehoi_content">${data.goiY}</div></div>`
                }
                $('#group_gioiThieu').html(html_noidung)
                //#endregion Thêm nôi dung chi tiết

                //#region Thêm thông tin
                let html_info = `
                <ul class="info-list">
                    ${data.tenTheLoai ? `<li><label>${genreText}:</label> ${data.tenTheLoai}</li>` : ''}
                    ${data.tenLoaiHinh ? `<li><label>${categoryTypeText}:</label> ${data.tenLoaiHinh}</li>` : ''}
                    ${data.tenPhanKhuc ? `<li><label>${segmentText}:</label> ${data.tenPhanKhuc}</li>` : ''}
                    ${data.tenPhuongTien ? `<li><label>${transportationText}:</label> ${data.tenPhuongTien}</li>` : ''}
                    ${data.thoiGian ? `<li><label>${timeText}:</label> ${data.thoiGian}</li>` : ''}
                    ${data.giaTour ? `<li><label>${priceText}:</label> ${(data.giaTour.toLocaleString('vi-VN'))} ${pricePerPersonVNDText} </li>` : ''}
                    ${data.soKhachToiThieu ? (data.soKhachToiDa ? `<li><label>${numberOfVisitorsText}:</label> ${data.soKhachToiThieu} - ${data.soKhachToiDa}</li>` : `<li><label>${numberOfVisitorsText}:</label> ${data.soKhachToiThieu}</li>`) : ''}
                    ${data.ngayKhoiHanh ? (data.ngayKetThuc ? `<li><label>${departureText}:</label> ${formatDateWithoutTime(data.ngayKhoiHanh)} - ${formatDateWithoutTime(data.ngayKetThuc)}</li>` : `<li><label>${numberOfVisitorsText}:</label> ${formatDateWithoutTime(data.ngayKhoiHanh)}</li>`) : ''}
                </ul>
            `;

                //#region Thêm thông tin bản đồ
                html_info += `<div class="info-map"><div id="group_map" class="map-container"></div><h4>${mapLocationText}</h4></div>`;
                // Gọi với id của container div
                initMiniMap(data.viDo, data.kinhDo, "group_map");
                //#endregion Thêm thông tin bản đồ


                $('#group_thongTin').html(html_info);
                //#endregion Thêm thông tin
            } else {
                $('#detailContent').html(`<p class="text-center">${noDataText}</p>`);
            }
        })
            .catch(error => {
                console.error('Error loading detail:', error);
                $('#detailContent').html('<p class="text-center text-danger">Đã xảy ra lỗi khi tải dữ liệu</p>');
            });

        let data_sub = {
            "maNgonNgu": lang,
            "pageIndex": 1,
            "pageSize": 1000
        };

        getDataWithApi('POST', `/api/TourDuLichApi/v1/Gets`, JSON.stringify(data_sub)).then(response => {
            let listTourDuLich = response.value.filter(item => item.tourID != ID_Object) || [];
            if (listTourDuLich && listTourDuLich.length > 0) {
                const totalItems = listTourDuLich.length;
                const totalPages = Math.ceil(totalItems / itemsPerPage);
                const startIndex = (currentPage - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const currentItems = listTourDuLich.slice(startIndex, endIndex);

                let html = '<ul class="list-festival">';
                currentItems.forEach(item => {
                    let url = lang === 'vi' ? `/DuLich/TourDuLichDetail?id=${item.tourID}` : `/${lang}/DuLich/TourDuLichDetail?id=${item.tourID}`;
                    html += `
                    <li class="festival-item">
                        <div class="festival-image">
                            <a href="${url}">
                                <img src="${item.anhDaiDien || '/assets/images/vector/no-image.png'}" alt="${item.tenTour || ''}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                            </a>
                        </div>
                        <div class="festival-info">
                            <h3 class="festival-title">
                                <a href="${url}">${item.tenTour || ''}</a>
                            </h3>
                            <div class="festival-description">${item.moTa ? item.moTa : updatingText}</div>
                        </div>
                    </li>
                `
                })
                html += '</ul>';
                $('#TourDuLichList').html(html);

            } else {
                $('#TourDuLichList').html(`<p class="text-center">${noDataText}</p>`);
                $('#paginationTourDuLich').hide();
            }
        })
    }

   
});
