const baseUrl = getRootLink();
console.log(diTichId)

$(document).ready(function () {
    if (diTichId) {
        loadData(diTichId);
        initTableTrungTu(diTichId);
        initTableVanBanTaiLieu(diTichId);
    }
});

function loadData(id) {
    getDataWithApi('GET', `/api/DiTichApi/ChiTiet/${id}`).then(data => {
        if (data && data.isSuccess && data.value) {
            let diTich = data.value;
            console.log('Dữ liệu di tích:', diTich);
            let title = `Thông tin di tích ${diTich.tenDiTich}`;
            let htmlTitle = ``;
            if (diTich.tenDiTich) {
                htmlTitle = `<div class='mainTitle'>${diTich.tenDiTich}</div>`;
                if (diTich.maDinhDanh) {
                    htmlTitle += `<div class='subTitle'>(${diTich.maDinhDanh})</div>`;
                }
            }
            $('#pageTitle').html(htmlTitle);
            document.title = title;
            // Load thông tin cơ bản
            $("#maDiTich").text(diTich.maDinhDanh || '-');
            $("#anhDaiDien").attr('src', diTich.anhDaiDien || '/assets/images/vector/no-image.png');
            $("#loaiHinh").text(diTich.tenLoaiHinh || '-');
            $("#capXepHang").text(diTich.tenCapXepHang || '-');
            $("#ngayCongNhan").text(formatDateWithoutTime(diTich.ngayCongNhan) || '-');
            $("#donViQuanLy").text(diTich.tenToChucQuanLy || '-');
            $("#trangThai").html(diTich.suDung ? `<div class="TrangThai green-text">Đang hoạt động</div>` : `<div class="TrangThai red-text">Không hoạt động</div>`);

            // Load đa ngữ từ banDich (bản vi)
            let banDichVi = diTich.banDich && diTich.banDich.find(b => b.maNgonNgu === 'vi');
            if (banDichVi) {
                $("#ngonNguDich").text(banDichVi.maNgonNgu || '-');
                $("#tenDiTich").text(banDichVi.tenDiTich || '-');
                $("#tenGoiKhac").text(banDichVi.tenGoiKhac || '-');
                $("#nienDai").text(banDichVi.nienDai || '-');
                $("#moTaDiTich").html(decodeCkeditorHtml(banDichVi.moTaDiTich || '-'));
            } else {
                $("#ngonNguDich").text('-');
                $("#tenDiTich").text('-');
                $("#tenGoiKhac").text('-');
                $("#nienDai").text('-');
                $("#moTaDiTich").html('-');
            }

            // Thông tin người tạo/cập nhật
            $("#nguoiTao").text(diTich.tenNguoiCapNhat || '-');
            $("#ngayTao").text(formatDateWithoutTime(diTich.ngayCapNhat) || '-');
            $("#nguoiCapNhat").text(diTich.tenNguoiHieuChinh || '-');
            $("#ngayCapNhat").text(formatDateWithoutTime(diTich.ngayHieuChinh) || '-');

            initTableDiaDiem(diTich.diaDiemID);
        }
    });
}

function initTableTrungTu(diTichId) {
    const tableApi = {
        url: `${baseUrl}/api/TrungTuDiTichApi/DanhSach`,
        type: "POST",
        data: function (d) {
            return JSON.stringify({
                "diTichID": diTichId,
                "maNgonNgu": "vi"
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

    ];

    const tableCols = [
        { "data": "stt", "width": "40px", "class": "center-align" },
        { "data": "congViec", "width": "", "class": "left-align" },
        { "data": "toChucThucHien", "width": "15%", "class": "left-align" },
        { "data": "thoiGian", "width": "15%", "class": "left-align" },
        { "data": "mucDich", "width": "20%", "class": "left-align" },
    ];

    initDataTableConfigNoSearch('dataGridTrungTu', tableApi, tableDefs, tableCols);
}

function initTableVanBanTaiLieu(diTichId) {
    const tableApi = {
        url: `${baseUrl}/api/VanBanTaiLieuApi/DanhSach`,
        type: "POST",
        data: function (d) {
            return JSON.stringify({
                doiTuongSoHuuID: diTichId,
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
            targets: 0,
            render: function (data, type, row, meta) {
                return parseInt(meta.row) + 1;
            }
        },
        {
            targets: 1,
            render: function (data, type, row, meta) {
                return `<div class="group-info">
                            <div class="info-main">
                                <a class="text-primary text-decoration-none">
                                    ${row.trichYeu || ''}
                                </a>
                            </div>
                            <div class="info-sub">${row.soKyHieu || ''}</div>
                        </div>`;
            }
        },
        {
            targets: 2,
            render: function (data, type, row, meta) {
                return row.tenCoQuanBanHanh || '';
            }
        },
        {
            targets: 3,
            render: function (data, type, row, meta) {
                return row.ngayBanHanh ? formatDateWithoutTime(row.ngayBanHanh) : '';
            }
        },
        {
            targets: 4,
            render: function (data, type, row, meta) {
                return row.ngayHieuLuc ? formatDateWithoutTime(row.ngayHieuLuc) : '';
            }
        },
        {
            targets: 5,
            render: function (data, type, row, meta) {
                if (row.duongDanFile) {
                    return `<a href="${baseUrl}${row.duongDanFile}" target="_blank" class="hgi-icon hgi-download"></a>`;
                }
                return '';
            }
        },
    ];

    const tableCols = [
        { "data": "stt", "width": "40px", "class": "center-align" },
        { "data": "", "class": "left-align" },
        { "data": "tenCoQuanBanHanh", "width": "15%", "class": "left-align" },
        { "data": "NgayBanHanh", "width": "10%", "class": "center-align" },
        { "data": "NgayHieuLuc", "width": "10%", "class": "center-align" },
        { "data": "", "width": "8%", "class": "center-align" },
    ];

    initDataTableConfigNoSearch('dataGridVanBan', tableApi, tableDefs, tableCols);
}
