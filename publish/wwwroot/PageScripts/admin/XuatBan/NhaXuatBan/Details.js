const baseUrl = getRootLink();
console.log(coQuanId)
$(document).ready(function () {
    if (coQuanId) {
        loadCoQuanData(coQuanId);
        initAnPhamTable(coQuanId);
    }
});

function loadCoQuanData(id) {
    let data = JSON.stringify({
        loaiToChucID: 98, // cơ quan báo chí
        toChucID: id
    })

    getDataWithApi('POST', '/api/ToChucApi/DanhSach', data).then(data => {
        console.log(data)
        if (data && data.isSuccess && data.value) {
            displayCoQuanInfo(data.value[0]);
            updatePageTitle(data.value[0]);
        } else {
            showNotification(0, 'Không tìm thấy thông tin cơ quan báo chí');
        }
    })
}

function displayCoQuanInfo(data) {
    // Hiển thị thông tin cơ bản
    $('#maCoQuan').text(data.maDinhDanh || '-');
    $('#loaiHinh').text(data.loaiHinh || '-');
    $('#coQuanChuQuan').text(data.coQuanChuQuan || '-');
    $('#phamViHoatDong').text(data.loaiHinh || '-');
    $('#soDienThoai').text(data.dienThoai || '-');
    $('#hopThu').text(data.hopThu || '-');
    $('#quyMo').text(data.quyMo || '-');
    $('#toaDoX').text(data.toaDoX || '-');
    $('#toaDoY').text(data.toaDoY || '-');
    
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

function initAnPhamTable(coQuanBaoChiID) {
    const tableApi = {
        url: `${baseUrl}/api/XuatBanAnPhamApi/DanhSach`,
        type: "POST",
        data: function (d) {
            return JSON.stringify({
                nhaXuatBanID: coQuanBaoChiID,
                maNgonNgu: 'vi'
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
            targets: 1, // Cột tên cơ quan báo chí
            render: function (data, type, row, meta) {
                return `<div class="group-info have-image">
                    <div class="have-image">
                        <img src="${row.duongDanHinhAnhBia || '/assets/images/vector/no-image.png'}" alt="${row.tenAnPham || ''}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                    </div>
                    <div class="group-info">
                    <div class="info-main"><div>${row.tenAnPham || ''}</div></div>
                    <div class="info-sub">${row.maDinhDanhXBAP || ''}</div></div>
                </div>`;
            }
        },
        {
            targets: 3, // Năm xuất bản
            render: function (data, type, row, meta) {
                return data || '-';
            }
        },
        {
            targets: 5, // Giá bìa
            render: function (data, type, row, meta) {
                if (data && data > 0) {
                    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data);
                }
                return '-';
            }
        },
        {
            targets: 6, // Cột trạng thái
            render: function (data, type, row, meta) {
                if (row.trangThai) {
                    return `<i class="hgi-icon hgi-check text-green"></i>`;
                } else {
                    return `<i class="hgi-icon hgi-cancel text-red"></i>`;
                }
            }
        }
    ];

    const tableCols = [
        { "data": "stt", "width": "40px", "class": "center-align" },
        { "data": "tenAnPham", "width": "25%", "class": "left-align" },
        { "data": "tenTheLoai", "width": "120px", "class": "left-align" },
        { "data": "namXuatBan", "width": "100px", "class": "center-align" },
        { "data": "", "width": "100px", "class": "center-align", "defaultContent": "-" },
        { "data": "giaBia", "width": "100px", "class": "left-align" },
        { "data": "trangThai", "width": "120px", "class": "center-align" }
    ];

    initDataTableConfigNoSearch('tableAnPham', tableApi, tableDefs, tableCols);
}
