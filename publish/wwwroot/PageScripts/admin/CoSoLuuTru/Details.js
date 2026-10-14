const baseUrl = getRootLink();

$(document).ready(function () {
    loadCoSoLuuTruDetails();
    initTableTienNghi();
    initTablePhong();
    initTableLaoDong();
});

function loadCoSoLuuTruDetails() {
    getDataWithApi('GET', `/api/DL_CoSoLuuTruApi/Get?CoSoLuuTruID=${coSoLuuTruId}&MaNgonNgu=vi`).then(data => {
        if (data && data.isSuccess && data.value) {
            const item = data.value;
            let title = `Thông tin cơ sở ${item.tenCoSo}`; 
            let htmlTitle = ``;
            if (item.tenCoSo) {
                htmlTitle = `<div class='mainTitle'>${item.tenCoSo}</div>`;
                if (item.diaChi) {
                    htmlTitle += `<div class='subTitle'>(${item.diaChi})</div>`;
                }
            }
            $('#pageTitle').html(htmlTitle);
            document.title = title;
            $('#pageTitle').text(item.tenCoSo || '-');
            $('#tenLoaiCoSo').text(item.tenLoaiCoSo || '-');
            $('#tenPhongCach').text(item.tenPhongCach || '-');
            if (item.hangSao === 0) { 
                $('#hangSao').text('Chưa xếp hạng');
            } else if (item.hangSao === 6) {
                $('#hangSao').text('Đạt chuẩn');
            } else if (item.hangSao === 6) {
                $('#hangSao').text('Đạt chuẩn Asean');
            } else {
                $('#hangSao').text(item.hangSao ? `${item.hangSao} sao` : '-');
            }
            $('#trangThai').html(item.trangThai ? `<span class="TrangThai green-text">Hoạt động</span>` : `<span class="TrangThai red-text">Không hoạt động</span>`);
            $('#soLuongPhong').text(item.soLuongPhong || 0);
            $('#soTang').text(item.soTang || 0);
            $('#giaThapNhat').text(item.giaThapNhat || 0);
            $('#giaCaoNhat').text(item.giaCaoNhat || 0);
            $('#dienThoai').text(item.dienThoai || '-');
            $('#hopThu').text(item.hopThu || '-');
            $('#lienKet').text(item.lienKet || '-');
            $('#nguoiDaiDien').text(item.nguoiDaiDien || '-');
            $('#diaChi').text(item.diaChi || '-');
            $('#moTa').html(item.moTa || '-');
            $('#traiNghiem').html(item.traiNghiem || '-');
            $('#goiY').html(item.goiY || '-');
            $('#nguoiTao').text(item.tenNguoiTao || '-');
            $('#ngayTao').text(item.ngayTao ? new Date(item.ngayTao).toLocaleDateString('vi-VN') : '-');
            $('#nguoiCapNhat').text(item.tenNguoiCapNhat || '-');
            $('#ngayCapNhat').text(item.ngayCapNhat ? new Date(item.ngayCapNhat).toLocaleDateString('vi-VN') : '-');
            if (item.anhDaiDien) {
                $('#anhDaiDien').attr('src', baseUrl + item.anhDaiDien);
            }
            initTableDiaDiem(item.diaDiemID || '-');

            $('#nguoiTao').text(item.tenNguoiTao || '-');
            $('#ngayTao').text(formatDateWithoutTime(item.ngayTao) || '-');
            $('#nguoiCapNhat').text(item.tenNguoiCapNhat || '-');
            $('#ngayCapNhat').text(formatDateWithoutTime(item.ngayCapNhat) || '-');
        }
    });
}

function initTableTienNghi() {
    const tableApi = {
        url: `${baseUrl}/api/DL_CoSoLuuTruApi/GetsTienNghi?MaNgonNgu=vi&CoSoLuuTruID=${coSoLuuTruId}`,
        type: "GET",
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
            targets: 2,
            render: function (data, type, row) {
                return row.mienPhi ? 'Có' : 'Không';
            }
        },
        {
            targets: 3,
            render: function (data, type, row) {
                return row.trangThai ? 'Hoạt động' : 'Không hoạt động';
            }
        }
    ];

    const tableCols = [
        { "data": "stt", "width": "40px", "class": "center-align" },
        { "data": "tenTienNghi", "class": "left-align" },
        { "data": "", "width": "15%", "class": "center-align" },
        { "data": "", "width": "15%", "class": "center-align" }
    ];

    initDataTableConfigNoSearch('dataGridTienNghi', tableApi, tableDefs, tableCols);
}

function initTablePhong() {
    const tableApi = {
        url: `${baseUrl}/api/DL_CoSoLuuTruApi/GetsPhong?MaNgonNgu=vi&CoSoLuuTruID=${coSoLuuTruId}`,
        type: "GET",
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

    const tableCols = [
        { "data": "stt", "width": "40px", "class": "center-align" },
        { "data": "tenLoaiPhong", "class": "left-align" },
        { "data": "soLuong", "width": "20%", "class": "center-align" }
    ];

    initDataTableConfigNoSearch('dataGridPhong', tableApi, [], tableCols);
}

function initTableLaoDong() {
    const tableApi = {
        url: `${baseUrl}/api/DL_CoSoLuuTruApi/GetsNguoiLaoDong?MaNgonNgu=vi&CoSoLuuTruID=${coSoLuuTruId}`,
        type: "GET",
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

    const tableCols = [
        { "data": "stt", "width": "40px", "class": "center-align" },
        { "data": "tenLoaiLaoDong", "class": "left-align" },
        { "data": "soLuong", "width": "20%", "class": "center-align" }
    ];

    initDataTableConfigNoSearch('dataGridLaoDong', tableApi, [], tableCols);
}

