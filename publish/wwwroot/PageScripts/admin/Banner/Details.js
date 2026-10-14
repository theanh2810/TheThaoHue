
const baseUrl = getRootLink();

$(document).ready(function () {
    loadBannerDetails();
    initTableToChucBanner();
    initTableCaNhanBanner();
});

function loadBannerDetails() {
    getDataWithApi('GET', `/api/DM_BannerApi/Get?MaNgonNgu=vi&BannerID=${BannerId}`).then(data => {
        if (data && data.isSuccess && data.value) {
            const item = data.value.Banner || {};
            // Tiêu đề
            let title = `Thông tin banner ${item.doiTuong}`;
            let htmlTitle = ``;
            if (item.doiTuong) {
                htmlTitle = `<div class='mainTitle'>${item.doiTuong}</div>`;
                if (item.maDinhDanh) {
                    htmlTitle += `<div class='subTitle'>(${item.maDinhDanh})</div>`;
                }
            }
            $('#pageTitle').html(htmlTitle);
            document.title = title;

            // Thông tin cơ bản
            $('#maDinhDanh').text(item.maDinhDanh || '-');
            $('#tenLinhVuc').text(item.tenLinhVuc || '-');
            $('#tenToChucXuPhat').text(item.tenToChucXuPhat || '-');
            $('#tenHinhThucXuPhat').text(item.tenHinhThucXuPhat || '-');
            $('#ngayPhatHien').text(item.ngayPhatHien ? formatDateWithoutTime(item.ngayPhatHien) : '-');
            $('#ngayXuPhat').text(item.ngayXuPhat ? formatDateWithoutTime(item.ngayXuPhat) : '-');
            $('#tenTinhTrang').text(item.tenTinhTrang || '-');
            $('#thuTu').text(item.thuTu != null ? item.thuTu : '-');
            $('#trangThai').html(item.trangThai ? `<span class="TrangThai green-text">Duyệt</span>` : `<span class="TrangThai red-text">Chưa duyệt</span>`);
            $('#ngonNguDich').text(item.maNgonNgu || '-');
            $('#doiTuongBanner').text(item.doiTuong || '-');
            $('#moTa').html(item.moTa || '-');

            // Gán tác phẩm có sẵn
            if (item.listIDTacPham) {
                console.log(item.listIDTacPham, "Danh sách tác phẩm đã chọn")
                let listTacPham = item.listIDTacPham.split(',').map(x => x.trim().toLowerCase());
                $("#TacPhamCoSanAdd").val(listTacPham.map(item => item)).trigger('change');
                initTableTacPham(listTacPham.map(item => item).join(','));
            }

            // Người tạo/cập nhật
            $('#nguoiTao').text(item.nguoiTao || '-');
            $('#ngayTao').text(item.ngayTao ? formatDateWithoutTime(item.ngayTao) : '-');
            $('#nguoiCapNhat').text(item.nguoiCapNhat || '-');
            $('#ngayCapNhat').text(item.ngayCapNhat ? formatDateWithoutTime(item.ngayCapNhat) : '-');
        }
    });
}

function initTableToChucBanner() {
    const tableApi = {
        url: `/api/DM_BannerApi/Get?MaNgonNgu=vi&BannerID=${BannerId}`,
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        dataSrc: function (data) {
            if (data && data.isSuccess && data.value && Array.isArray(data.value.listToChuc)) {
                data.value.listToChuc.forEach((item, index) => {
                    item.stt = index + 1;
                });
                return data.value.listToChuc;
            }
            return [];
        },
    };
    const tableCols = [
        { data: "stt", width: "40px", class: "center-align" },
        { data: "tenDoiTuongBanner", class: "left-align" },
        { data: null, width: "180px", class: "center-align group-icon-action", render: () => '' }
    ];
    initDataTableConfigNoSearch('tableToChucBanner', tableApi, [], tableCols);
}

function initTableCaNhanBanner() {
    const tableApi = {
        url: `/api/DM_BannerApi/Get?MaNgonNgu=vi&BannerID=${BannerId}`,
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        dataSrc: function (data) {
            if (data && data.isSuccess && data.value && Array.isArray(data.value.listCaNhan)) {
                data.value.listCaNhan.forEach((item, index) => {
                    item.stt = index + 1;
                });
                return data.value.listCaNhan;
            }
            return [];
        },
    };
    const tableCols = [
        { data: "stt", width: "40px", class: "center-align" },
        { data: "tenDoiTuongBanner", class: "left-align" },
        { data: null, width: "180px", class: "center-align group-icon-action", render: () => '' }
    ];
    initDataTableConfigNoSearch('tableCaNhanBanner', tableApi, [], tableCols);
}

function initTableTacPham (listTacPham) {
    const tableApi = {
        url: `${baseUrl}/api/DM_ThanhTichApi/GetMultiTacPham?ListIDTacPham=${listTacPham}&MaNgonNgu=vi`,
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        dataSrc: function (data) {
            console.log(data)
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
                            <img src="${row.hinhAnh || '/images/no-image.png'}" alt="${row.tenTacPham || ''}" onerror="this.onerror=null;this.src='/images/no-image.png';" />
                        </div>
                        <div class="group-info">
                        <div class="info-main"><div>${row.tenTacPham || ''}</div></div>
                        <div class="info-sub">${row.maDinhDanh || ''}</div></div>
                    </div>`;
            }
        },
        {
            targets: 4,
            render: function (data, type, row, meta) {
                if (data) {
                    return `<i class="hgi-icon hgi-check"></i>`;
                }
                else {
                    return `<i class="hgi-icon hgi-cancel"></i>`;
                }
            }
        },
    ];

    const tableCols = [
        { "data": "stt", "width": "40px", "class": "center-align" },
        { "data": "tenTacPham", "width": "", "class": "left-align" },
        { "data": "tenTheLoai", "width": "220px", "class": "left-align" },
        { "data": "tacGia", "width": "220px", "class": "center-align" },
        { "data": "suDung", "width": "120px", "class": "center-align" },
    ];

    initDataTableConfigNoSearch('tableTacPhamBanner', tableApi, tableDefs, tableCols);
}