$(document).ready(function () {
    const paramsDPT = new URLSearchParams(window.location.search);
    const ID_Object = paramsDPT.get("id")
    let currentPage = 1;
    const itemsPerPage = 4;

    let lang = currentLang
    let noDataText,
        callText,
        sendEmailText,
        websiteText,
        shareText,
        addressText,
        categoryTypeText,
        phoneText,
        establishmentDateText,
        emailText,
        licenseNumberText,
        scaleText,
        introductionText,
        eventsText,
        viewDetailText;

    ; (async function () {
        const res = await fetch(`/lang/${lang}.json`);
        if (!res.ok) return;
        const translations = await res.json();

        noDataText = translations['noData']
        viewDetailText = translations['viewDetail']
        callText = translations['call'];
        sendEmailText = translations['sendEmail'];
        websiteText = translations['website'];
        shareText = translations['share'];
        addressText = translations['address'];
        categoryTypeText = translations['categoryType'];
        phoneText = translations['phone'];
        establishmentDateText = translations['establishmentDate'];
        emailText = translations['email'];
        licenseNumberText = translations['licenseNumber'];
        scaleText = translations['scale'];
        introductionText = translations['introduction'];
        eventsText = translations['events'];





        initializeData();
    })();

    function initializeData() {
        getDataWithApi('GET', `/api/v1/VH_StatisticalApi/PerformanceDetailBaoTang?MaNgonNgu=${lang}&ToChucID=${ID_Object}`).then(response => {
            if (response && response.isSuccess && response.value) {
                let data = response.value.identityBaoTang;
                let listHienVat = response.value.listHienVat || [];
                let listSuKien = response.value.listSuKien || [];

                //#region Thêm tiêu đề
                let title = `<h1>${data.tenToChuc}</h1>
            <div class="function-bar">
                ${data.dienThoai ? `<div class="phone"><a href="tel:${data.dienThoai}"><i class="hgi-icon hgi-tag-phone"></i>${callText}</a></div>` : ""}
                ${data.hopThu ? `<div class="mail"><a href="mailto:${data.hopThu}"><i class="hgi-icon hgi-tag-mail"></i>${sendEmailText}</a></div>` : ""}
                ${data.website ? `<div class="website"><a href="${data.website}"><i class="hgi-icon hgi-tag-web"></i>${websiteText}</a></div>` : ""}
                <div class="sharing"><i class="hgi-icon hgi-share"></i>${shareText}</div>
            </div>`;
                $("#detail-title").html(title);
                $("#current-page").text(data.tenToChuc);
                document.title = `${data.tenToChuc}`;
                //#endregion Thêm tiêu đề

                //#region Thêm thông tin lễ hội
                let html_info = `<div id="group_thongTin" style="position: relative;top:0">
                <ul class="info-list big-list">
                    <li><label>${addressText}:</label> ${data.diaChi || '-'}</li>
                    <li><label>${categoryTypeText}:</label> ${data.loaiHinh || '-'}</li>
                    <li><label>${phoneText}:</label> ${data.dienThoai || '-'}</li>
                    <li><label>${establishmentDateText}:</label> ${data.ngayThanhLap ? formatDateWithoutTime(data.ngayThanhLap) : '-'}</li>
                    <li><label>${emailText}:</label> ${data.hopThu || '-'}</li>
                    <li><label>${licenseNumberText}:</label> ${data.soGiayPhepHoatDong || '-'}</li>
                    <li><label>${websiteText}:</label> ${data.website ? `<a href="data.website">${data.website}</a>` : '-'}</li>
                    <li><label>${scaleText}:</label> ${data.quyMo || '-'}</li>
                </ul></div>
            `;
                //#endregion Thêm thông tin lễ hội

                //#region Thêm nôi dung chi tiết
                let html_noidung = html_info;
                if (data.anhDaiDien) {
                    html_noidung += `<div class="anhDaiDien"><img src="${data.anhDaiDien}" data-lazy data-src="${data.anhDaiDien}" class="destination-img" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';"></div>`
                }
                if (data.gioiThieu) {
                    html_noidung += `<div class="gioiThieu"><div class="group-corner-button with-title"><h4>${introductionText}</h4></div><div class="group_lehoi_content">${data.gioiThieu}</div></div>`
                }
                $('#group_gioiThieu').html(html_noidung)
                //#endregion Thêm nôi dung chi tiết

                //#region Thêm nội dung hiện vật
                if (listHienVat && listHienVat.length > 0) {
                    let html = `<div class="group-corner-button with-title">
                    <h4>Hiện vật</h4>
                </div><div class="slide-list navigation-hover">`;
                    listHienVat.forEach(item => {
                        let url = lang === "vi" ? `/VanHoa/LeHoiDetail?id=${item.hienVatID}` : `/${lang}/VanHoa/LeHoiDetail?id=${item.hienVatID}`;
                        html += `
                        <div class="slide-food food-item">
                            <div class="list-item">
                                <div class="list-image">
                                    <a href="${url}">
                                        <img src="${item.anhDaiDien || '/assets/images/vector/no-image.png'}" alt="${item.tenHienVat || ''}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                                    </a>
                                </div>
                                <div class="list-info">
                                    <h3 class="list-title">
                                        <a href="${url}">${item.tenHienVat || ''}</a>
                                    </h3>
                                </div>
                            </div>
                        </div>
                    `
                    })
                    html += '</div>';
                    $('#group_hienVat').html(html);
                    setTimeout(() => {
                        $('#group_hienVat .slide-list').slick({
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
                    $('#group_hienVat').hide();
                }
                //#endregion Thêm nội dung hiện vật

                //#region Thêm nội dung sự kiện
                if (listSuKien && listSuKien.length > 0) {
                    let html = `<div class="group-corner-button with-title">
                    <h4>${eventsText}</h4>
                    </div><div class="slide-list navigation-hover event-main">`;
                    listSuKien.forEach(item => {
                        const dateFormatted = formatDateDisplay(item.batDau);
                        let url = lang === "vi" ? `/VanHoa/SuKienDetail?id=${item.suKienID}` : `/${lang}/VanHoa/SuKienDetail?id=${item.suKienID}`;
                        html += `
                        <div class="slide-food food-item list-event">
                            <div class="item_img">
                                <a href="${url}"><img src="${item.anhDaiDien}" alt="${item.tenSuKien}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';"></a>
                                <div class="event_status expired">${item.tenTrangThai || ''}</div>
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
                        </div>
                    `
                    })
                    html += '</div>';
                    $('#group_suKien').html(html);
                    setTimeout(() => {
                        $('#group_suKien .slide-list').slick({
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
                    $('#group_suKien').hide();
                }
                //#endregion Thêm nội dung sự kiện
            } else {
                $('#detailContent').html(`<p class="text-center">${noDataText}</p>`);
            }
        })
            .catch(error => {
                console.error('Error loading detail:', error);
                $('#detailContent').html('<p class="text-center text-danger">Đã xảy ra lỗi khi tải dữ liệu</p>');
            });

        getDataWithApi('GET', `/api/v1/VH_StatisticalApi/StatisticalBaoTangAndThuVien?MaNgonNgu=${lang}`).then(response => {
            let listThuVienBaoTang = response.value.filter(item => item.toChucID != ID_Object) || [];
            if (listThuVienBaoTang && listThuVienBaoTang.length > 0) {
                // Tính toán phân trang
                const totalItems = listThuVienBaoTang.length;
                const totalPages = Math.ceil(totalItems / itemsPerPage);
                const startIndex = (currentPage - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const currentItems = listThuVienBaoTang.slice(startIndex, endIndex);

                // Render danh sách
                let html = '<ul class="listcard-item">';
                currentItems.forEach(item => {
                    let url = lang === "vi" ? `/VanHoa/ThuVienBaoTangDetail?id=${item.toChucID}` : `/${lang}/VanHoa/ThuVienBaoTangDetail?id=${item.toChucID}`;
                    html += `
                    <li class="card-item">
                        <div class="card-image">
                            <a href="${url}">
                                <img src="${item.anhDaiDien}" alt="${item.tenToChuc}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';">
                                <div class="card-title">${item.tenToChuc}</div>
                            </a>
                        </div>
                        <div class="card-body">
                            ${item.diaChi ? `<div class="card-address"><i class="hgi-icon hgi-address"></i>${item.diaChi || ''}</div>` : ``}
                            ${item.dienThoai ? `<div class="card-phone"><i class="hgi-icon hgi-phone"></i><a href="tel:${item.dienThoai}">${item.dienThoai || ''}</a></div>` : ``}
                            ${item.hopThu ? `<div class="card-mail"><i class="hgi-icon hgi-mail"></i><a href="mailto:${item.hopThu}">${item.hopThu || ''}</a></div>` : ``}
                            ${item.website ? `<div class="card-web"><i class="hgi-icon hgi-web"></i><a href="${item.website}">${item.website || ''}</a></div>` : ``}
                        </div>
                    </li>
                `;
                })
                html += '</ul>';
                $('#ThuVienBaoTangRelatedList').html(html);
            } else {
                $('#ThuVienBaoTangRelatedList').html(`<p class="text-center">${noDataText}</p>`);
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