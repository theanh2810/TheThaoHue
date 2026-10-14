const baseUrl = getRootLink();
console.log(diSanID)

$(document).ready(function () {
    if (diSanID) {
        loadData(diSanID);
        initTableVanBanTaiLieu(diSanID);
    }
});

function loadData(id) {
    getDataWithApi('GET', `/api/DiSanPhiVatTheApi/ChiTiet/${id}`).then(data => {
        if (data && data.isSuccess && data.value) {
            let diSan = data.value;
            console.log('Dữ liệu di sản phi vật thể:', diSan);
            let title = `Thông tin di sản phi vật thể ${diSan.tenDiSan}`;
            let htmlTitle = ``;
            if (diSan.tenDiSan) {
                htmlTitle = `<div class='mainTitle'>${diSan.tenDiSan}</div>`;
                if (diSan.maDinhDanh) {
                    htmlTitle += `<div class='subTitle'>(${diSan.maDinhDanh})</div>`;
                }
            }
            $('#pageTitle').html(htmlTitle);
            document.title = title;
            // Load thông tin cơ bản
            $("#maDinhDanh").text(diSan.maDinhDanh || '-');
            $("#anhDaiDien").attr('src', diSan.anhDaiDien || '/assets/images/vector/no-image.png');
            $("#loaiHinh").text(diSan.tenLoaiHinh || '-');
            $("#tinhTrang").text(diSan.tenTinhTrang || '-');
            $("#thuTu").text(diSan.thuTu || '-');
            $("#trangThaiSuDung").html(diSan.suDung ? `<div class="TrangThai green-text">Sử dụng</div>` : `<div class="TrangThai red-text">Không sử dụng</div>`);

            // Load đa ngữ từ banDich (bản vi)
            let banDichVi = diSan.banDich && diSan.banDich.find(b => b.maNgonNgu === 'vi');
            if (banDichVi) {
                $("#tenDiSan").text(banDichVi.tenDiSan || '-');
                $("#congDong").text(banDichVi.congDong || '-');
                $("#tinhTrangBaoTon").text(banDichVi.tinhTrang || '-');
                $("#moTa").html(decodeCkeditorHtml(banDichVi.moTa || '-'));
            } else {
                $("#tenDiSan").text('-');
                $("#congDong").text('-');
                $("#tinhTrangBaoTon").text('-');
                $("#moTa").html('-');
            }

            // Thông tin người tạo/cập nhật
            $("#nguoiTao").text(diSan.tenNguoiCapNhat || '-');
            $("#ngayTao").text(formatDateWithoutTime(diSan.ngayCapNhat) || '-');
            $("#nguoiCapNhat").text(diSan.tenNguoiHieuChinh || '-');
            $("#ngayCapNhat").text(formatDateWithoutTime(diSan.ngayHieuChinh) || '-');
        }
    });
}

function initTableVanBanTaiLieu(diSanID) {
    const tableApi = {
        url: `${baseUrl}/api/VanBanTaiLieuApi/DanhSach`,
        type: "POST",
        data: function (d) {
            return JSON.stringify({
                doiTuongSoHuuID: diSanID,
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

    initDataTableConfigNoSearch('dataGridVanBanTaiLieu', tableApi, tableDefs, tableCols);
}