const baseUrl = getRootLink();

$(document).ready(function () {
    if (nhanSuId) {
        loadData(nhanSuId);
    }
});

function loadData(nhanSuId) {
    // Load thông tin huấn luyện viên
    getDataWithApi('GET', `/api/DM_CaNhan_HuanLuyenVienApi/Get?CaNhanID=${nhanSuId}&maNgonNgu=vi`).then(data => {
        if (data && data.isSuccess && data.value) {
            let nhanSu = data.value;
            let title = `Thông tin vận động viên ${nhanSu.hoTen}`;
            let htmlTitle = ``;
            if (nhanSu.hoTen) {
                htmlTitle = `<div class='mainTitle'>${nhanSu.hoTen}</div>`;
                if (nhanSu.maDinhDanh) {
                    htmlTitle += `<div class='subTitle'>(${nhanSu.maDinhDanh})</div>`;
                }
            }
            $('#pageTitle').html(htmlTitle);
            document.title = title;
            $("#maDinhDanh").text(nhanSu.maDinhDanh || '-');
            $("#hoVaTen").text(nhanSu.hoTen || '-');
            $("#tenGoiKhac").text(nhanSu.tenGoiKhac || '-');
            $("#anhDaiDien").attr('src', nhanSu.anhChanDung || '/assets/images/vector/no-image.png');
            $("#gioiTinh").text(nhanSu.gioiTinh || '-')
            $("#ngaySinh").text(formatDateWithoutTime(nhanSu.ngaySinh) || '-');

            $("#tinhThanhPho").text(nhanSu.tenTinh || nhanSu.tinhThanhPho || '-');
            $("#phuongXa").text(nhanSu.tenXa || nhanSu.phuongXa || '-');
            $("#quocTich").text(nhanSu.quocTich || '-');
            $("#noiDangKyKhaiSinh").text(nhanSu.noiDangKyKhaiSinh || '-');

            $("#danToc").text(nhanSu.danToc || '-');
            $("#tonGiao").text(nhanSu.tonGiao || '-');

            $("#trinhDoHocVan").text(nhanSu.trinhDoHocVan || '-');
            $("#giaoDucPhoThong").text(nhanSu.giaoDucPhoThong || '-');
            $("#trinhDoChuyenMon").text(nhanSu.trinhDoChuyenMon || '-');
            $("#hocHamHocVi").text(nhanSu.hocHamHocVi || '-');
            $("#viTriSoTruong").text(nhanSu.viTriSoTruong || '-');
            $("#chieuCao").text(nhanSu.chieuCao || '-');
            $("#canNang").text(nhanSu.canNang || '-');
            $("#nhomMau").text(nhanSu.nhomMau || '-');
            $("#tayChanThuan").text(nhanSu.tayChanThuan || '-');
            $("#capBac").text(nhanSu.capBac || '-');

            $("#soDienThoai").text(nhanSu.dienThoai || '-');
            $("#hopThu").text(nhanSu.hopThu || '-');
            $("#trangThai").html(nhanSu.trangThai ? `<div class="TrangThai green-text">Duyệt</div>` : `<div class="TrangThai red-text">Chưa duyệt</div>`);
            $("#donViCongTac").text(nhanSu.listTenToChuc || '-');

            $("#diaChi").text(nhanSu.diaChi || '-');
            $("#noiLamViec").text(nhanSu.noiLamViec || '-');
            $("#moTanhanSu").html(decodeCkeditorHtml(nhanSu.moTa || '-'));

            $("#kinhNghiemThanhTich").html(decodeCkeditorHtml(nhanSu.kinhNghiemThanhTich || '-'));
            $("#bangCap").html(decodeCkeditorHtml(nhanSu.bangCap || '-'));
            $("#ghiChu").html(decodeCkeditorHtml(nhanSu.ghiChu || '-'));

            //Thông tin cập nhật
            $("#nguoiTao").text(nhanSu.tenNguoiTao || '-');
            $("#ngayTao").text(formatDateWithoutTime(nhanSu.ngayCapNhat) || '-');
            $("#nguoiCapNhat").text(nhanSu.tenNguoiCapNhat || '-');
            $("#ngayCapNhat").text(formatDateWithoutTime(nhanSu.ngayHieuChinh) || '-');
        }
    });

    // Load tables
    initTableTheThao(nhanSuId);
    initTableQuaTrinh(nhanSuId);
    initTableThanhTich(nhanSuId);
    initTableChanThuong(nhanSuId);
    initTableQuanHeGiaDinh(nhanSuId);
}

function initTableTheThao(nhanSuId) {
    const tableApi = {
        url: `${baseUrl}/api/DM_CaNhan_HuanLuyenVienApi/GetListMon?CaNhanID=${nhanSuId}&maNgonNgu=vi`,
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        dataSrc: function (data) {
            if (data && data.isSuccess && data.value.length > 0) {
                data.value.forEach((nhanSu, index) => {
                    nhanSu.stt = index + 1;
                    nhanSu.tenMonTheThao = nhanSu.tenMonTheThao || '-';
                    nhanSu.laMonChinh = nhanSu.laMonChinh ? 'Có' : 'Không';
                });
                console.log(data.value, "value the thao chinh");
                return data.value;
            }
            return [];
        },
    };

    const tableDefs = [
        {
            targets: 2,
            render: function (data, type, row) {
                return row.monTheThaoChinh ? `<span class="TrangThai green-text">Có</span>` : `<span class="TrangThai red-text">Không</span>`;
            }
        },
    ];

    const tableCols = [
        { "data": "stt", "width": "40px", "class": "center-align" },
        { "data": "tenMon", "class": "left-align" },
        { "data": "monTheThaoChinh", "width": "20%", "class": "left-align" }
    ];

    initDataTableConfigNoSearch('tableTheThao', tableApi, tableDefs, tableCols);
}

function initTableQuaTrinh(nhanSuId) {
    const tableApi = {
        url: `${baseUrl}/api/VanDongVienQuaTrinhApi/GetByCaNhan/${nhanSuId}`,
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        data: {
            loaiNhanSu: 1
        },
        dataSrc: function (data) {
            if (data && data.isSuccess && data.value && data.value.length > 0) {
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
            render: function (data, type, row) {
                const loaiMap = { '1': 'Tuyển chọn', '2': 'Đào tạo', '3': 'Thi đấu' };
                return loaiMap[row.loaiID] || row.loaiID;
            }
        },
    ];

    const tableCols = [
        { data: "stt", width: "50px", class: "center-align" },
        { data: "loaiID", width: "120px", class: "left-align" },
        { data: "tuNgay", width: "300px", class: "center-align" },
        { data: "tenMonTheThao", class: "left-align" },
        { data: "ketQua", class: "left-align" }
    ];

    initDataTableConfigNoSearch('tableQuaTrinh', tableApi, tableDefs, tableCols);
}

function initTableThanhTich(nhanSuId) {
    const tableApi = {
        url: `${baseUrl}/api/VanDongVien_ThanhTichApi/GetByCaNhan`,
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        data: {
            caNhanID: nhanSuId,
            loaiNhanSu: 1
        },
        dataSrc: function (data) {
            if (data && data.isSuccess && data.value && data.value.length > 0) {
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
            render: function (data, type, row) {
                const map = { '1': 'Quốc tế', '2': 'Trong nước' };
                return map[row.capDo] || row.capDo || '';
            }
        }
    ];

    const tableCols = [
        { data: "stt", width: "50px", class: "center-align" },
        { data: "capDo", width: "100px", class: "center-align" },
        { data: "namThang", width: "100px", class: "center-align" },
        { data: "tenGiai", class: "left-align" },
        { data: "noiDung", class: "left-align" },
        { data: "huyChuong", class: "center-align" },
        { data: "kyLuc", class: "center-align" }
    ];

    initDataTableConfigNoSearch('tableThanhTich', tableApi, tableDefs, tableCols);
}

function initTableChanThuong(nhanSuId) {
    const tableApi = {
        url: `${baseUrl}/api/VanDongVien_ChanThuongApi/GetByCaNhan`,
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        data: {
            caNhanID: nhanSuId,
            loaiNhanSu: 1
        },
        dataSrc: function (data) {
            if (data && data.isSuccess && data.value && data.value.length > 0) {
                data.value.forEach((item, index) => {
                    item.stt = index + 1;
                });
                console.log(data.value, " chan thuong")
                return data.value;
            }
            return [];
        },
    };

    const tableDefs = [];

    const tableCols = [
        { data: "stt", width: "50px", class: "center-align" },
        { data: "namThang", width: "100px", class: "center-align" },
        { data: "moTaChanThuong", class: "left-align" },
        { data: "thoiGianPhucHoi", class: "left-align" },
        { data: "hienTrang", class: "left-align" }
    ];

    initDataTableConfigNoSearch('tableChanThuong', tableApi, tableDefs, tableCols);
}

function initTableQuanHeGiaDinh(nhanSuId) {
    const tableApi = {
        url: `${baseUrl}/api/VanDongVien_QuanHeGiaDinhApi/GetByCaNhan`,
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        data: {
            caNhanID: nhanSuId,
            loaiNhanSu: 1
        },
        dataSrc: function (data) {
            if (data && data.isSuccess && data.value && data.value.length > 0) {
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
            render: function (data, type, row) {
                const map = { '1': 'a) Bản thân', '2': 'b) Bên vợ/chồng' };
                return map[row.nhom] || row.nhom || '';
            }
        }
    ];

    const tableCols = [
        { data: "stt", width: "50px", class: "center-align" },
        { data: "nhom", width: "120px", class: "center-align" },
        { data: "quanHe", width: "100px", class: "center-align" },
        { data: "hoTen", class: "left-align" },
        { data: "namSinh", width: "80px", class: "center-align" },
        { data: "thongTin", class: "left-align" }
    ];

    initDataTableConfigNoSearch('tableQuanHeGiaDinh', tableApi, tableDefs, tableCols);
}