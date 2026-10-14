$(document).ready(function () {
    const paramsDPT = new URLSearchParams(window.location.search);
    const ID_Object = paramsDPT.get("id")
    let currentPage = 1;
    const itemsPerPage = 4;

    let lang = currentLang
    let noDataText,
        eventTypeText,
        timeText,
        descriptionText,
        addressText;


    ; (async function () {
        const res = await fetch(`/lang/${lang}.json`);
        if (!res.ok) return;
        const translations = await res.json();

        noDataText = translations['noData']
        addressText = translations['address']
        eventTypeText = translations['eventType']
        timeText = translations['time']
        descriptionText = translations['description']


        initializeData();
    })();

    function initializeData() {
        getDataWithApi('GET', `/api/DM_SuKienApi/Get?MaNgonNgu=${lang}&SuKienID=${ID_Object}`).then(response => {
            if (response && response.isSuccess && response.value) {
                let data = response.value;

                //#region Thêm tiêu đề
                let title = `<h1>${data.tenSuKien}</h1>`;
                if (data.anhDaiDien) {
                    title += `<div class="anhDaiDien"><div class="overlay"></div><img src="${data.anhDaiDien}" data-lazy data-src="${data.anhDaiDien}" class="destination-img" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';"></div>`
                }
                $("#detail-title").html(title);
                $("#current-page").text(data.tenSuKien);
                document.title = `${data.tenSuKien}`;
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
                    const maxVisible = 6;
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
                    $('#animated-thumbnails-gallery-2').html(html_images);
                    imageInitContainer = document.getElementById('animated-thumbnails-gallery-2');
                    $("#detail-gallery").hide();

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
                //#region Thêm thông tin
                html_noidung += `
                <ul class="info-list">
                    ${data.tenLinhVuc ? `<li><label>${eventTypeText}:</label> ${data.tenLinhVuc}</li>` : ''}
                    ${data.batDau ? `<li><label>${timeText}:</label>${formatDateWithoutTime(data.batDau)} - ${formatDateWithoutTime(data.ketThuc)}</li>` : ''}
                    ${data.listTenDiaDiem ? `<li><label>${addressText}:</label> ${data.listTenDiaDiem}</li>` : ''}
                </ul>
            `;
                //#endregion Thêm thông tin
                if (data.moTa) {
                    html_noidung += `<div class="moTa"><div class="group-corner-button with-title"><h4>${descriptionText}</h4></div><div class="group_lehoi_content">${data.moTa}</div></div>`
                }

                $('#group_gioiThieu').html(html_noidung)
                //#endregion Thêm nôi dung chi tiết
            } else {
                $('#detailContent').html(`<p class="text-center">${noDataText}</p>`);
            }
        })
            .catch(error => {
                console.error('Error loading detail:', error);
                $('#detailContent').html('<p class="text-center text-danger">Đã xảy ra lỗi khi tải dữ liệu</p>');
            });

        getDataWithApi('GET', `/api/v1/VH_StatisticalApi/StatisticalSuKienVanHoa?MaNgonNgu=${lang}`).then(response => {
            let listSuKien = response.value || [];
            console.log(listSuKien)
            listSuKien = listSuKien.filter(item => item.suKienID != ID_Object)
            if (listSuKien && listSuKien.length > 0) {
                let html = '<ul class="event-item">';
                listSuKien.forEach(item => {
                    // Format ngày tháng
                    const dateFormatted = formatDateDisplay(item.batDau);
                    let url = lang === "vi" ? `/VanHoa/SuKienDetail?id=${item.suKienID}` : `/${lang}/VanHoa/SuKienDetail?id=${item.suKienID}`;
                    html += `
                    <li class="card-event-item">
                        <div class="item_img">
                            <a href="${url}"><img src="${item.anhDaiDien}" alt="${item.tenSuKien}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';"></a>
                            <div class="event_status expired">Sự kiện ${item.tenTrangThai || ''}</div>
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
                `
                })
                html += '</ul>';
                $('#SuKienRelatedList').html(html);

            } else {
                $('#SuKienRelatedList').html(`<p class="text-center">${noDataText}</p>`);
            }
        })
    }
});

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