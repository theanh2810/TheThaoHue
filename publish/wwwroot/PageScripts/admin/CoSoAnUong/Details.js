const baseUrl = getRootLink();
console.log(CoSoAnUongId)
$(document).ready(function () {
    loadData();
});

function loadData() {

    if (!CoSoAnUongId) {
        showNotification(0, "Không tìm thấy ID cơ sở ăn uống");
        return;
    }

    $.ajax({
        type: 'GET',
        url: `${baseUrl}/api/DL_CoSoAnUongApi/Get?CoSoAnUongID=${CoSoAnUongId}&MaNgonNgu=vi`,
        success: function (data) {
            if (data.isSuccess && data.value) {
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
                // Thông tin chung
                $("#tenCoSoAnUongDetails").text(item.tenCoSo || '-');
                $("#diaDiemCoSoAnUongDetails").text(item.tenDiaDiem || '-');
                //$("#loaiCoSoAnUongDetails").text(item.tenLoaiCoSo || '-');
                //$("#phongCachCoSoAnUongDetails").text(item.tenPhongCachCoSo || '-');
                $("#loaiDichVuAnUongDetails").text(item.tenLoaiDichVu || '-');
                //$("#hangSaoCoSoAnUongDetails").text(item.hangSao ? `${item.hangSao} sao` : '-');
                $("#sucChuaCoSoAnUongDetails").text(item.sucChua || '-');
                $("#diemDanhGiaCoSoAnUongDetails").text(item.diemDanhGia || '-');
                $("#soLuotDanhGiaCoSoAnUongDetails").text(item.soLuotDanhGia || '-');
                $("#dienThoaiCoSoAnUongDetails").text(item.dienThoai || '-');
                $("#hopThuCoSoAnUongDetails").text(item.hopThu || '-');
                $("#lienKetCoSoAnUongDetails").text(item.lienKet || '-');
                $("#gioMoCuaCoSoAnUongDetails").text(item.gioMoCua || '-');
                $("#gioDongCuaCoSoAnUongDetails").text(item.gioDongCua || '-');
                $("#ngayNghiHangTuanCoSoAnUongDetails").text(item.ngayNghiHangTuan || '-');
                $("#tiecGiaDinhCoSoAnUongDetails").prop('checked', item.tiecGiaDinh);
                $("#tiecDongNguoiCoSoAnUongDetails").prop('checked', item.tiecDongNguoi);
                $("#coPhongRiengCoSoAnUongDetails").prop('checked', item.coPhongRieng);
                $("#coVuiChoiTreEmCoSoAnUongDetails").prop('checked', item.coVuiChoiTreEm);
                $("#chuanDuLichCoSoAnUongDetails").prop('checked', item.chuanDuLich);
                $("#nguoiDaiDienCoSoAnUongDetails").text(item.nguoiDaiDien || '-');
                $("#diaChiCoSoAnUongDetails").text(item.diaChi || '-');
                $("#moTaCoSoAnUongDetails").html(item.moTa || '-');
                $("#traiNghiemCoSoAnUongDetails").html(item.traiNghiem || '-');
                $("#goiYCoSoAnUongDetails").html(item.goiY || '-');
                $("#trangThaiCoSoAnUongDetails").html(item.trangThai ? `<span class="TrangThai green-text">Hoạt động</span>` : `<span class="TrangThai red-text">Không hoạt động</span>`);
                $("#anhDaiDien").attr('src', item.anhDaiDien || '/assets/images/vector/no-image.png');

                // Load loại ẩm thực
                initTableLoaiAmThuc(CoSoAnUongId);

                // Load món ăn
                initTableMonAn(CoSoAnUongId);

                initTableDiaDiem(item.diaDiemID || '-');

                $('#nguoiTao').text(item.tenNguoiTao || '-');
                $('#ngayTao').text(formatDateWithoutTime(item.ngayTao) || '-');
                $('#nguoiCapNhat').text(item.tenNguoiCapNhat || '-');
                $('#ngayCapNhat').text(formatDateWithoutTime(item.ngayCapNhat) || '-');
            } else {
                showNotification(0, "Không tìm thấy dữ liệu cơ sở ăn uống");
            }
        },
        error: function (err) {
            console.log(err);
            showNotification(0, "Lỗi khi tải dữ liệu");
        }
    });
}

function initTableLoaiAmThuc(CoSoAnUongId) {
    const tableApi = {
        url: `${baseUrl}/api/DL_CoSoAnUongApi/GetByCoSo?MaNgonNgu=vi&CoSoAnUongID=${CoSoAnUongId}`,
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
            targets: 0,
            render: function (data, type, row, meta) {
                return parseInt(meta.row) + 1;
            }
        },
        {
            targets: 2,
            render: function (data, type, row) {
                if (row._isNew) {
                    return `<input type="checkbox" id="trangThaiLoaiAmThucEdit" name="trangThaiLoaiAmThuc" ${row.TrangThai ? "checked" : ""}>`;
                } else {
                    return row.trangThai ? `<span class="TrangThai green-text">Hoạt động</span>` : `<span class="TrangThai red-text">Không hoạt động</span>`;
                }
            }
        },
    ];

    const tableCols = [
        { data: null, width: "40px", class: "center-align" },
        { data: "tenLoaiAmThuc", class: "left-align" },
        { data: "trangThai", width: "180px", class: "left-align" },
    ];

    $('#tableLoaiAmThucCoSoAnUong').DataTable({
        ajax: tableApi,
        columns: tableCols,
        columnDefs: tableDefs,
        paging: false,
        searching: false,
        info: false,
        ordering: false,
        autoWidth: false,
        responsive: true,
        language: {
            emptyTable: "Chưa có loại ẩm thực nào"
        }
    });
}

function initTableMonAn(CoSoAnUongId) {
    const tableApi = {
        url: `${baseUrl}/api/DL_CoSoAnUong_AmThucApi/GetByCoSoAnUong?MaNgonNgu=vi&CoSoAnUongID=${CoSoAnUongId}`,
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
            targets: 0,
            render: function (data, type, row, meta) {
                return parseInt(meta.row) + 1;
            }
        },
        {
            targets: 2,
            render: function (data, type, row) {
                return row.trangThai ? `<span class="TrangThai green-text">Hoạt động</span>` : `<span class="TrangThai red-text">Không hoạt động</span>`;
            }
        },
    ];

    const tableCols = [
        { data: null, width: "40px", class: "center-align" },
        { data: "tenMon", class: "left-align" },
        { data: "trangThai", width: "180px", class: "left-align" },
    ];

    $('#tableMonAnCoSoAnUong').DataTable({
        ajax: tableApi,
        columns: tableCols,
        columnDefs: tableDefs,
        paging: false,
        searching: false,
        info: false,
        ordering: false,
        autoWidth: false,
        responsive: true,
        language: {
            emptyTable: "Chưa có món ăn nào"
        }
    });
}
