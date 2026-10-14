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
        addressText,
        categoryTypeText,
        phoneText,
        establishmentDateText,
        emailText,
        licenseNumberText,
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
        addressText = translations['address']
        categoryTypeText = translations['categoryType']
        phoneText = translations['phone']
        establishmentDateText = translations['establishmentDate']
        emailText = translations['email']
        licenseNumberText = translations['licenseNumber']
        noDataText = translations['noData']

        initializeData();
    })();


   

    
    function initializeData() {
        let request = {
            "maNgonNgu": lang,
            "loaiToChucID": 310,
            "toChucID": ID_Object
        }
        getDataWithApi('POST', `/api/ToChucApi/DanhSach_TrinhDien`, JSON.stringify(request)).then(response => {
            if (response && response.isSuccess && response.value) {
                let data = response.value[0];

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
                    <li style="width:100%"><label>${addressText}:</label> ${data.diaChi || '-'}</li>
                    <li><label>${categoryTypeText}:</label> ${data.loaiHinh || '-'}</li>
                    <li><label>${phoneText}:</label> ${data.dienThoai || '-'}</li>
                    <li><label>${establishmentDateText}:</label> ${data.ngayThanhLap ? formatDateWithoutTime(data.ngayThanhLap) : '-'}</li>
                    <li><label>${emailText}:</label> ${data.hopThu || '-'}</li>
                    <li><label>${licenseNumberText}:</label> ${data.soGiayPhepHoatDong || '-'}</li>
                    <li><label>${websiteText}:</label> ${data.website ? `<a href="data.website">${data.website}</a>` : '-'}</li>
                </ul></div>
            `;
                //#endregion Thêm thông tin lễ hội

                //#region Thêm nôi dung chi tiết
                let html_noidung = html_info;
                if (data.anhDaiDien) {
                    html_noidung += `<div class="anhDaiDien"><img src="${data.anhDaiDien}" data-lazy data-src="${data.anhDaiDien}" class="destination-img" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';"></div>`
                }
                if (data.gioiThieu) {
                    html_noidung += `<div class="gioiThieu"><div class="group-corner-button with-title"><h4>Giới thiệu</h4></div><div class="group_lehoi_content">${data.gioiThieu}</div></div>`
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


        let request_sub = {
            "maNgonNgu": lang,
            "loaiToChucID": 310
        }
        getDataWithApi('POST', `/api/ToChucApi/DanhSach_TrinhDien`, JSON.stringify(request_sub)).then(response => {
            let listDoanhNghiepLuHanh = response.value.filter(item => item.toChucID != ID_Object) || [];
            if (listDoanhNghiepLuHanh && listDoanhNghiepLuHanh.length > 0) {
                // Tính toán phân trang
                const totalItems = listDoanhNghiepLuHanh.length;
                const totalPages = Math.ceil(totalItems / itemsPerPage);
                const startIndex = (currentPage - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const currentItems = listDoanhNghiepLuHanh.slice(startIndex, endIndex);

                // Render danh sách
                let html = '<ul class="listcard-item">';
                currentItems.forEach(item => {
                    let url = lang === 'vi' ? `/DuLich/DoanhNghiepLuHanhDetail?id=${item.toChucID}` : `/${lang}/DuLich/DoanhNghiepLuHanhDetail?id=${item.toChucID}`;
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
                $('#DoanhNghiepLuHanhRelatedList').html(html);
            } else {
                $('#DoanhNghiepLuHanhRelatedList').html(`<p class="text-center">${noDataText}</p>`);
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