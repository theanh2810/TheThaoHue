const baseUrl = getRootLink();

$(document).ready(function () {
    if (nhanSuId) {
        loadData(nhanSuId);
    }
});

function loadData(id) {
    getDataWithApi('GET', `/api/DM_CaNhan_ChuyenGiaApi/Get?CaNhanID=${id}&maNgonNgu=vi`).then(data => {
        if (data && data.isSuccess && data.value) {
            let cg = data.value;
            let htmlTitle = cg.hoTen
                ? `<div class='mainTitle'>${cg.hoTen}</div>` + (cg.maDinhDanh ? `<div class='subTitle'>(${cg.maDinhDanh})</div>` : '')
                : '';
            $('#pageTitle').html(htmlTitle);
            document.title = `Chuyên gia: ${cg.hoTen || ''}`;

            $("#maDinhDanh").text(cg.maDinhDanh || '-');
            $("#anhDaiDien").attr('src', cg.anhChanDung || '/assets/images/vector/no-image.png');
            $("#gioiTinh").text(cg.gioiTinh || '-');
            $("#ngaySinh").text(formatDateWithoutTime(cg.ngaySinh) || '-');
            $("#danToc").text(cg.danToc || '-');
            $("#soDienThoai").text(cg.dienThoai || '-');
            $("#hopThu").text(cg.hopThu || '-');
            $("#trangThai").html(cg.trangThai
                ? `<div class="TrangThai green-text">Duyệt</div>`
                : `<div class="TrangThai red-text">Chưa duyệt</div>`);
            $("#donViCongTac").text(cg.listTenToChuc || '-');
            $("#diaChi").text(cg.diaChi || '-');
            $("#noiLamViec").text(cg.noiLamViec || '-');
            $("#kinhNghiemThanhTich").html(decodeCkeditorHtml(cg.kinhNghiemThanhTich || '-'));
            $("#bangCap").html(decodeCkeditorHtml(cg.bangCap || '-'));
            $("#moTanhanSu").html(decodeCkeditorHtml(cg.moTa || '-'));
            $("#ghiChu").html(decodeCkeditorHtml(cg.ghiChu || '-'));
            $("#nguoiTao").text(cg.tenNguoiTao || '-');
            $("#ngayTao").text(formatDateWithoutTime(cg.ngayCapNhat) || '-');
            $("#nguoiCapNhat").text(cg.tenNguoiCapNhat || '-');
            $("#ngayCapNhat").text(formatDateWithoutTime(cg.ngayHieuChinh) || '-');
        }
    });
    initTableTheThao(id);
    initTableHopDong(id);
}

function initTableTheThao(id) {
    const tableApi = {
        url: `${baseUrl}/api/DM_CaNhan_ChuyenGiaApi/GetListMon?CaNhanID=${id}&maNgonNgu=vi`,
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        dataSrc: function (data) {
            if (data && data.isSuccess && data.value && data.value.length > 0) {
                data.value.forEach((item, index) => { item.stt = index + 1; });
                return data.value;
            }
            return [];
        },
    };
    const tableDefs = [
        { targets: 0, data: 'stt', width: '50px' },
        { targets: 2, render: function (data, type, row) { return row.monTheThaoChinh ? `<span class="TrangThai green-text">Có</span>` : `<span class="TrangThai red-text">Không</span>`; } }
    ];
    const tableCols = [
        { "data": "stt", "width": "50px", "class": "center-align" },
        { "data": "tenMonTheThao", "class": "left-align" },
        { "data": "monTheThaoChinh", "width": "120px", "class": "center-align" }
    ];
    initDataTableConfigNoSearch('tableTheThao', tableApi, tableDefs, tableCols);
}

function initTableHopDong(id) {
    const tableApi = {
        url: `${baseUrl}/api/CaNhanHopDongMuaVuApi/GetByCaNhan/${id}`,
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        dataSrc: function (data) {
            if (data && data.isSuccess && data.value && data.value.length > 0) {
                data.value.forEach((item, index) => { item.stt = index + 1; });
                return data.value;
            }
            return [];
        },
    };
    const tableDefs = [
        { targets: 0, data: 'stt', width: '50px' },
        { targets: 4, render: function (data) { return data ? formatDateWithoutTime(data) : ''; } },
        { targets: 5, render: function (data) { return data ? formatDateWithoutTime(data) : ''; } },
        { targets: 6, render: function (data) { return (data !== null && data !== undefined && data !== '') ? Number(data).toLocaleString('vi-VN') : ''; } },
        { targets: 7, render: function (data, type, row) { return row.tenTrangThai || ''; } },
        { targets: 8, render: function (data, type, row) { return row.fileDinhKem ? `<a href="${row.fileDinhKem}" target="_blank"><i class="hgi-icon hgi-file-attachment"></i></a>` : ''; } }
    ];
    const tableCols = [
        { "data": "stt", "width": "50px", "class": "center-align" },
        { "data": "soHopDong", "class": "left-align" },
        { "data": "tenMuaVu", "class": "left-align" },
        { "data": "tenToChuc", "class": "left-align" },
        { "data": "tuNgay", "width": "100px", "class": "center-align" },
        { "data": "denNgay", "width": "100px", "class": "center-align" },
        { "data": "giaTri", "width": "120px", "class": "right-align" },
        { "data": "trangThai", "width": "110px", "class": "center-align" },
        { "data": null, "width": "60px", "class": "center-align" }
    ];
    initDataTableConfigNoSearch('tableHopDong', tableApi, tableDefs, tableCols);
}
