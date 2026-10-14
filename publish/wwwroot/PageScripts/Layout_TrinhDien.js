const baseUrl = getRootLink();
initSelect2()

// Hàm để khởi tạo observer
function initObserver() {
    //console.log(123)
    var observer = new IntersectionObserver(onIntersect);
    document.querySelectorAll(".ModTinBaiNewTrinhDienTinBaiC div[id*='mvcContainer'] [data-lazy]").forEach((img) => {
        /*observer.observe(img);*/
        const url = img.getAttribute("data-src");
        //console.log(url)
        if (url && !url.startsWith('data:')) {
            // Loại bỏ trường hợp img base64 (data:image/...)
            const cleanUrl = url.split('?')[0];
            const random = getRandomNumber(6);
            // Bổ sung truy vấn ngẫu nhiên để tránh cache
            const bustCacheUrl = `${cleanUrl}?v=${random}`;
            img.setAttribute("data-src", bustCacheUrl);
            observer.observe(img);
        } else if (url && url.startsWith('data:')) {
            // Đối với ảnh base64, chỉ quan sát mà không thêm cache busting
            observer.observe(img);
        }
    });

    $("img").on("error", function() {
        $(this).attr("src", '/DesktopModules/MVC/TinBaiNew/Assets/image/Noimg.png');
    });
    refreshAllImages();
};

async function onIntersect(entries) {
    await Promise.all(entries.map(async (entry) => {
        if (entry.target.getAttribute("data-processed") || !entry.isIntersecting)
            return;

        entry.target.setAttribute("src", entry.target.getAttribute("data-src"));
        entry.target.setAttribute("data-processed", true);
    }));
};

// Lazy Load Images using Intersection Observer
(function () {
    var observer = new IntersectionObserver(onIntersect);
    document.querySelectorAll("[data-lazy]").forEach((img) => {
        observer.observe(img);
    });

    function onIntersect(entries) {
        entries.forEach((entry) => {
            if (entry.target.getAttribute("data-processed") || !entry.isIntersecting)
                    return true;

            entry.target.setAttribute("src", entry.target.getAttribute("data-src"));
            entry.target.setAttribute("data-processed", true);
        });
    }
})();

function getFileExtension(path) {
    return path.split('.').pop().toLowerCase();
}


$(document).ready(function () {
    $('#language').on('change', async function (e) {
        lang = $(this).val();
        localStorage.setItem('lang', lang || "vi");

        changeUrlLanguage(lang);
    })
});

async function replaceTranslation(lang) {
    try {
        const res = await fetch(`/lang/${lang}.json`);
        if (!res.ok) return;

        const translations = await res.json();
        //const translations = flattenJson(translationsRaw);

        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (!key || !translations[key]) return;

            if (el.tagName === "INPUT") {
                el.placeholder = translations[key];
            } else if (el.tagName === "A") {
                const href = el.getAttribute("href");
                if (!href) return;
               
                if (href.startsWith("/") && lang !== "vi") {
                    if (href.startsWith(`/${lang}`)) return;

                    if (href === "/") {
                        el.setAttribute("href", `/${lang}`);
                    } else {
                        el.setAttribute("href", `/${lang}${href}`);
                    }
                }

                el.textContent = translations[key];
            } else {
                el.textContent = translations[key];
            }
        });
    } catch (err) {
        console.error(err);
    }
}

// Khi layout load xong thì dịch ban đầu
document.addEventListener("DOMContentLoaded", async () => {
    localStorage.setItem('lang', currentLang);
    await replaceTranslation(currentLang);
});

// Khi view con thông báo render xong (ví dụ sau khi append dữ liệu)
document.addEventListener("pageRendered", async () => {
    localStorage.setItem('lang', currentLang);
    const lang = localStorage.getItem('lang') || 'vi';
    await replaceTranslation(lang);
});

function changeUrlLanguage(lang) {
    const selectedLang = lang.toLowerCase();
    let currentPath = window.location.pathname;
    const segments = currentPath.split('/').filter(x => x);

    if (selectedLang === 'vi') {
        if (segments.length > 0 && segments[0].length === 2 && /^[a-z]{2}$/i.test(segments[0])) {
            segments.shift();
        }
        const newPath = segments.length === 0 ? '/' : '/' + segments.join('/');
        const newUrl = newPath + window.location.search + window.location.hash;
        window.location.href = newUrl;
        return;
    }

    if (segments.length === 0) {
        segments.unshift(selectedLang);
    } else if (segments[0].length === 2 && /^[a-z]{2}$/i.test(segments[0])) {
        segments[0] = selectedLang;
    } else {
        segments.unshift(selectedLang);
    }

    const newPath = '/' + segments.join('/');
    const newUrl = newPath + window.location.search + window.location.hash;
    window.location.href = newUrl;
}

//function flattenJson(obj, parentKey = '', result = {}) {
//    for (const [key, value] of Object.entries(obj)) {
//        const newKey = parentKey ? `${parentKey}.${key}` : key;
//        if (typeof value === 'object' && value !== null) {
//            flattenJson(value, newKey, result);
//        } else {
//            result[newKey] = value;
//        }
//    }
//    return result;
//}

// Định nghĩa dữ liệu đa ngôn ngữ cho các ngày
const daysI18n = {
    vi: {
        Mo: "Thứ Hai",
        Tu: "Thứ Ba",
        We: "Thứ Tư",
        Th: "Thứ Năm",
        Fr: "Thứ Sáu",
        Sa: "Thứ Bảy",
        Su: "Chủ Nhật",
    },
    en: {
        Mo: "Monday",
        Tu: "Tuesday",
        We: "Wednesday",
        Th: "Thursday",
        Fr: "Friday",
        Sa: "Saturday",
        Su: "Sunday",
    }
};

// Hàm chuyển đổi, ví dụ input: "Sa-Su" hoặc "Mo-Tu-We"
function translateDays(input, lang = 'vi') {
    const map = daysI18n[lang];
    if (!map) throw new Error(`Ngôn ngữ ${lang} chưa được hỗ trợ.`);

    // Tách theo dấu gạch ngang, rồi map từng phần tử sang ngôn ngữ tương ứng
    const parts = input.split('-');
    const translated = parts.map(d => map[d] || d);
    return translated.join(', ');
}

function getFileExtension(path) {
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

function initMiniMap(lat, lng, mapElementId) {
    require([
        "esri/Map",
        "esri/views/MapView",
        "esri/Basemap",
        "esri/Graphic",
        "esri/layers/GraphicsLayer",
        "esri/geometry/Point"
    ], function (Map, MapView, Basemap, Graphic, GraphicsLayer, Point) {
        
        const baseMap = Basemap.fromId("osm");
        
        const map = new Map({
            basemap: baseMap
        });
        
        const view = new MapView({
            container: mapElementId,
            map: map,
            center: [lng, lat],
            zoom: 15,
            constraints: {
                minZoom: 10,
                maxZoom: 20
            },
            ui: {
                components: ["attribution"]
            }
        });
        
        const pointLayer = new GraphicsLayer();
        map.add(pointLayer);
        
        // Tạo marker tại vị trí
        const point = new Point({
            longitude: lng,
            latitude: lat
        });
        
        const markerSymbol = {
            type: "picture-marker",
            url: `/assets/images/icons/map_pointer.png`,
            width: "44px",
            height: "44px"
        };
        
        const pointGraphic = new Graphic({
            geometry: point,
            symbol: markerSymbol
        });
        
        pointLayer.add(pointGraphic);
        
        return view;
    });
}

async function initDanhMuc_Filter(IDDanhMuc) {
    const baseUrl = getRootLink();
    try {
        const res = await fetch(`${baseUrl}/api/DanhMucChungApi/DanhSach_Filter`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ loaiDanhMucID: IDDanhMuc, trangThai: true })
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (data && data.isSuccess && data.value) {
            return data.value;
        }
    } catch (err) { console.log('Lỗi khi tải danh mục:', err.message); }
}

// Function chung để render filter checkbox
function renderFilter(list, prefix, title = '') {
    const randomId = `filter_${prefix}`;
    let html = '<div class="filter-widget">';
    if (title) {
        html += `
            <h4 class="filter-title" data-toggle="collapse" data-target="#${randomId}">
                <span>${title}</span>
                <i class="hgi-icon hgi-dropdown"></i>
            </h4>
            <div class="filter-options collapse show" id="${randomId}">`;
    } else {
        html += '<div class="filter-options">';
    }
    list.forEach(item => {
        html += `<div class="filter_option">
            <input type="checkbox" class="filter_Checkbox" id="${prefix}_${item.danhMucID}" value="${item.danhMucID}">
            <label for="${prefix}_${item.danhMucID}">${item.tenDanhMuc}</label>
        </div>`;
    });
    if (title) {
        html += '</div></div>';
    } else {
        html += '</div></div>';
    }
    return html;
}