const baseUrl = getRootLink();

$(document).ready(function () {
    if (coQuanId) {
        loadCoQuanData(coQuanId);
        /* initAnPhamTable(coQuanId); */
        initTableNhanSu(coQuanId);
    }
});

function loadCoQuanData(id) {
    let data = JSON.stringify({
        loaiToChucID: 96, // liên đoàn thể thao
        toChucID: id
    })

    getDataWithApi('POST', '/api/ToChucApi/DanhSach', data).then(data => {
        console.log(data)
        if (data && data.isSuccess && data.value) {
            displayCoQuanInfo(data.value[0]);
            updatePageTitle(data.value[0]);
        } else {
            showNotification(0, 'Không tìm thấy thông tin liên đoàn thể thao');
        }
    })
}

function displayCoQuanInfo(data) {
    // Hiển thị thông tin cơ bản
    $('#maCoQuan').text(data.maDinhDanh || '-');
    $('#loaiHinh').text(data.loaiHinh || '-');
    $('#coQuanChuQuan').text(data.coQuanChuQuan || '-');
    $('#phamViHoatDong').text(data.phamViHoatDong || '-');
    $('#soDienThoai').text(data.dienThoai || '-');
    $('#hopThu').text(data.hopThu || '-');
    $('#quyMo').text(data.quyMo || '-');
    
    // Hiển thị website với link nếu có
    if (data.website) {
        $('#website').html(`<a href="${data.website}" target="_blank" class="text-primary">${data.website}</a>`);
    } else {
        $('#website').text('-');
    }

    $('#soGiayPhep').text(data.soGiayPhepHoatDong || '-');
    $('#thuTu').text(data.thuTu || '-');
    
    // Hiển thị ngày thành lập
    if (data.ngayThanhLap) {
        const date = new Date(data.ngayThanhLap);
        $('#ngayThanhLap').text(date.toLocaleDateString('vi-VN'));
    } else {
        $('#ngayThanhLap').text('-');
    }

    // Hiển thị trạng thái
    if (data.trangThaiID == 1) {
        $('#trangThai').html('<span class="TrangThai green-text">Duyệt</span>');
    } else {
        $('#trangThai').html('<span class="TrangThai red-text">Chưa duyệt</span>');
    }

    // Hiển thị thông tin đa ngữ
    $('#ngonNguDich').text(data.ngonNguName || '-');
    $('#tenCoQuanDich').text(data.tenToChuc || '-');
    $('#diaChiDich').text(data.diaChi || '-');
    $('#gioiThieuDich').html(data.gioiThieu || '-');
    $('#ghiChuDich').html(data.ghiChu || '-');

    $('#nguoiTao').text(data.tenNguoiTao || '-');
    $('#ngayTao').text(formatDateWithoutTime(data.ngayTao) || '-');
    $('#nguoiCapNhat').text(data.tenNguoiCapNhat || '-');
    $('#ngayCapNhat').text(formatDateWithoutTime(data.ngayCapNhat) || '-');
}

function updatePageTitle(data) {
    let title = `Thông tin ${data.tenToChuc}`;
    let htmlTitle = ``;
    if (data.tenToChuc) {
        htmlTitle = `<div class='mainTitle'>${data.tenToChuc}</div>`;
        if (data.maDinhDanh) {
            htmlTitle += `<div class='subTitle'>(${data.maDinhDanh})</div>`;
        }
    }
    $('#pageTitle').html(htmlTitle);
    document.title = title;
}

function initAnPhamTable(id) {
    const tableApi = {
        url: `${baseUrl}/api/BaoChiAnPhamApi/DanhSach`,
        type: "POST",
        data: function (d) {
            return JSON.stringify({
                toChucID: id,
                trangThai: null, // Load cả active và inactive
                tuKhoa: null,
                maNgonNgu: "vi"
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
            targets: 5, // Cột trạng thái
            render: function (data, type, row, meta) {
                if (row.trangThai) {
                    return `<span class="TrangThai green-text">Đã phát hành</span>`;
                } else {
                    return `<span class="TrangThai yellow-text">Chưa phát hành</span>`;
                }
            }
        }
    ];

    const tableCols = [
        { "data": "stt", "width": "40px", "class": "center-align" },
        { "data": "tenAnPham", "class": "left-align" },
        { "data": "tenTanSuat", "width": "12%", "class": "left-align" },
        { "data": "tenLinhVucChuyenSau", "width": "15%", "class": "left-align" },
        { "data": "luotTiepCan", "width": "12%", "class": "left-align" },
        { "data": "trangThai", "width": "10%", "class": "left-align" }
    ];

    initDataTableConfigNoSearch('tableAnPham', tableApi, tableDefs, tableCols);
}

function initTableNhanSu(coQuanID) {
    const tableApi = {
        url: `${baseUrl}/api/CaNhanApi/GetByToChuc`,
        type: "POST",
        data: function (d) {
            return JSON.stringify({
                toChucID: coQuanID,
                maNgonNgu: "vi"
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
            targets: 1, // Họ và tên
            render: function (data, type, row, meta) {
                return `<div class="group-info have-image round-image">
                        <div class="have-image">
                            <img src="${row.anhChanDung || '/assets/images/vector/no-image.png'}" alt="" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                        </div>
                        <div class="group-info">
                        <div class="info-main"><div>${row.hoTen || ''}</div></div>
                        <div class="info-sub">${row.maDinhDanh || ''}</div></div>
                </div>`;
            }
        },
        {
            targets: 2, // Ngày sinh
            render: function (data, type, row, meta) {
                return formatDateWithoutTime(row.ngaySinh);
            }
        },
        {
            targets: 4, // Trạng thái
            render: function (data, type, row, meta) {
                if (row.trangThaiID == 1) {
                    return `<span class="TrangThai green-text">Duyệt</span>`;
                } else {
                    return `<span class="TrangThai red-text">Chưa duyệt</span>`;
                }
            }
        },
    ];

    const tableCols = [
        { "data": "stt", "width": "40px", "class": "center-align" },
        { "data": "", "class": "left-align name-text" },
        { "data": "", "width": "15%", "class": "left-align" },
        { "data": "gioiTinh", "width": "15%", "class": "left-align" },
        { "data": "", "width": "15%", "class": "left-align" },
    ];

    initDataTableConfigNoSearch('tableNhanSu', tableApi, tableDefs, tableCols);
}
