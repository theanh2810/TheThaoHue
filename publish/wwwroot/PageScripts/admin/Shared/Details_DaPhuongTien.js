$(document).ready(function () {
    const paramsDPT = new URLSearchParams(window.location.search);
    const ID_Object = paramsDPT.get("id")
    //initTableDaPhuongTien(ID_Object)
    initGalleryDaPhuongTien(ID_Object)
})

/* function initTableDaPhuongTien(ID_Object) {
    const tableApi = {
        url: `${baseUrl}/api/DaPhuongTienApi/DanhSach`,
        type: "POST",
        data: function (d) {
            return JSON.stringify({
                "doiTuongSoHuuID": ID_Object,
            });
        },
        contentType: 'application/json; charset=utf-8',
        dataSrc: function (data) {
            if (data && data.isSuccess && data.value.length > 0) {
                data.value.forEach((item, index) => {
                    item.stt = index + 1;
                });
                return data.value;
            }
            return [];
        },
    };

    const tableDefs = [
        {
            targets: 1,
            render: function (data, type, row, meta) {
                return `<div class="group-info have-image">
                    <div class="have-image">
                        <img src="${row.duongDanFile || '/assets/images/vector/no-image.png'}" alt="${row.tenDaPhuongTien || ''}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                    </div>
                    <div class="group-info">
                    <div class="info-main"><div>${row.tieuDe || ''}</div></div>
                    <div class="info-sub">${row.tacGia || ''}</div></div>
                </div>`;
            }
        },
        {
            targets: 2,
            render: function (data, type, row, meta) {
                if (row.loaiMedia == 1) {
                    return `Hình ảnh`;
                } else if (row.loaiMedia == 2) {
                    return `Video`;
                } else if (row.loaiMedia == 3) {
                    return `Audio`;
                } else if (row.loaiMedia == 4) {
                    return `File khác`;
                }
                return ``;
            }
        }
    ];

    const tableCols = [
        { "data": "stt", "width": "40px", "class": "center-align" },
        { "data": "", "width": "", "class": "left-align" },
        { "data": "", "width": "15%", "class": "left-align" },
        { "data": "tacGia", "width": "15%", "class": "left-align" }
    ];

    initDataTableConfigNoSearch('dataGridDaPhuongTien', tableApi, tableDefs, tableCols);
} */

function initGalleryDaPhuongTien(ID_Object) {
    getDataWithApi('POST', '/api/DaPhuongTienApi/DanhSach', JSON.stringify({"doiTuongSoHuuID": ID_Object})).then(data => {
        if (data && data.isSuccess && data.value.length > 0) {
            const items = data.value;

            const videos = [];
            const audios = [];
            const images = [];
            const files = [];

            // Phân loại
            items.forEach(item => {
                const ext = getFileExtension(item.duongDanFile);
                if (item.loaiMedia == 2 || ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) {
                    videos.push(item);
                } else if (item.loaiMedia == 3 ||['mp3', 'wav', 'ogg'].includes(ext)) {
                    audios.push(item);
                } else if (item.loaiMedia == 1 ||['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) {
                    images.push(item);
                } else {
                    files.push(item);
                }
            });

            console.log("📷 Hình ảnh:", images);
            console.log("🎥 Video:", videos);
            console.log("🎵 Audio:", audios);
            console.log("📄 File khác:", files);

            // === Hiển thị Hình ảnh ===
            if (images.length > 0) {
                const maxVisible = 12;
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
                $('#animated-thumbnails-gallery').html(html_images);

                const dynamicElements = images.map(img => ({
                    src: img.duongDanFile,
                    thumb: img.duongDanFile,
                    id: img.daPhuongTienID,
                    subHtml: `<div class="lightGallery-captions"><h4>${img.tieuDe}</h4></div>`
                }));

                const imageContainer = document.getElementById('animated-thumbnails-gallery');
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

                $("#animated-thumbnails-gallery").on("click", ".gallery-item", function (e) {
                    e.preventDefault();
                    const index = $(this).index();
                    imageGallery.openGallery(index);
                });
            } else {
                $('.groupImage').hide();
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

            if (files.length > 0) {
                let html_files = '';
                files.forEach(file => {
                    html_files += `
                        <div class="file-item">
                            <div class="file-icon"><div class="hgi-icon hgi-smallfile"></div></div>
                            <div class="file-info">
                                <div class="file-title">${file.tieuDe}</div>
                                ${file.tacGia ? `<div class="file-author">(${file.tacGia || ''})</div> ` : ``}
                            </div>
                            <div class="file-download">
                                <a href="${baseUrl + file.duongDanFile}" download>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M13.0059 4.5C13.0059 3.94772 12.5581 3.5 12.0059 3.5C11.4536 3.5 11.0059 3.94772 11.0059 4.5V11H10.4116C10.236 10.9999 10.0203 10.9997 9.84387 11.0218L9.84053 11.0222C9.71408 11.038 9.13804 11.1098 8.86368 11.6754C8.58872 12.2423 8.89065 12.7424 8.95597 12.8506L8.95841 12.8546C9.05062 13.0077 9.18477 13.1785 9.29511 13.3191L9.31885 13.3493C9.61348 13.7252 9.99545 14.2094 10.3759 14.6004C10.5657 14.7955 10.783 14.9967 11.0139 15.1556C11.2191 15.2968 11.5693 15.5 12 15.5C12.4307 15.5 12.7809 15.2968 12.9861 15.1556C13.217 14.9967 13.4343 14.7955 13.6241 14.6004C14.0046 14.2094 14.3865 13.7252 14.6812 13.3493L14.7049 13.3191C14.8152 13.1785 14.9494 13.0077 15.0416 12.8546L15.044 12.8506C15.1093 12.7424 15.4113 12.2423 15.1363 11.6754C14.862 11.1098 14.2859 11.038 14.1595 11.0222L14.1561 11.0218C13.9797 10.9997 13.764 10.9999 13.5884 11H13.0059V4.5Z" fill="#00615E"/>
                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M4 15.5C4.55228 15.5 5 15.9477 5 16.5C5 17.0989 5.03256 17.5106 5.09643 17.8013C5.15781 18.0807 5.23372 18.181 5.27636 18.2236C5.31899 18.2663 5.41933 18.3422 5.69872 18.4036C5.98944 18.4674 6.40114 18.5 7 18.5H17C17.5989 18.5 18.0106 18.4674 18.3013 18.4036C18.5807 18.3422 18.681 18.2663 18.7236 18.2236C18.7663 18.181 18.8422 18.0807 18.9036 17.8013C18.9674 17.5106 19 17.0989 19 16.5C19 15.9477 19.4477 15.5 20 15.5C20.5523 15.5 21 15.9477 21 16.5C21 17.1421 20.9678 17.7259 20.857 18.2304C20.7437 18.7462 20.535 19.2407 20.1379 19.6379C19.7407 20.035 19.2462 20.2437 18.7304 20.357C18.2259 20.4678 17.6421 20.5 17 20.5H7C6.35786 20.5 5.77406 20.4678 5.26959 20.357C4.7538 20.2437 4.25926 20.035 3.86214 19.6379C3.46503 19.2407 3.25632 18.7462 3.14301 18.2304C3.03219 17.7259 3 17.1421 3 16.5C3 15.9477 3.44772 15.5 4 15.5Z" fill="#00615E"/>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    `;
                });
                $('#file-gallery').html(html_files);
            } else {
                $('.groupFile').hide();
            }
        } else {
            $(".listGallery").hide();
            $("#DaPhuongTien-tab").hide();
        }
    })
}

function getFileExtension(path) {
    if (path.split('.').pop().toLowerCase() == 'm4a') {
        return 'mp3';
    }
    return path.split('.').pop().toLowerCase();
}

// Hàm lấy thumbnail từ video
function getVideoThumbnail(videoUrl) {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.src = videoUrl;
        video.crossOrigin = "anonymous"; // cần thiết nếu file khác domain
        video.muted = true;
        video.playsInline = true;

        // fallback nếu video không load được
        const fallbackThumb = '/assets/images/vector/no-image.png';

        video.addEventListener('loadeddata', () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                const thumbnail = canvas.toDataURL('image/png');
                resolve(thumbnail || fallbackThumb);
            } catch {
                resolve(fallbackThumb);
            }
        });

        video.addEventListener('error', () => resolve(fallbackThumb));

        // Đảm bảo capture ở thời điểm có khung hình
        video.addEventListener('seeked', () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/png'));
        });

        video.currentTime = 0.5; // lấy khung ở giây 0.5
    });
}