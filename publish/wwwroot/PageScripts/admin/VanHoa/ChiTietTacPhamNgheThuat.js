const baseUrl = getRootLink();

$(document).ready(function () {
    if (tacPhamID) {
        loadData(tacPhamID);
        initTableBieuDien(tacPhamID);
    }
});

function loadData(id) {
    getDataWithApi('GET', `/api/TacPhamApi/ChiTiet/${id}?maNgonNgu=vi`).then(data => {
        if (data && data.isSuccess && data.value) {
            let tacPham = data.value;
            let title = `Thông tin tác phẩm nghệ thuật ${tacPham.tenTacPham}`;
            let htmlTitle = ``;
            if (tacPham.tenTacPham) {
                htmlTitle = `<div class='mainTitle'>${tacPham.tenTacPham}</div>`;
                if (tacPham.maDinhDanh) {
                    htmlTitle += `<div class='subTitle'>(${tacPham.maDinhDanh})</div>`;
                }
            }
            $('#pageTitle').html(htmlTitle);
            document.title = title;
            // Load thông tin cơ bản

            $("#theLoai").text(tacPham.tenTheLoai || '-');
            $("#maDinhDanh").text(tacPham.maDinhDanh || '-');
            $("#namCongBo").text(tacPham.namCongBo || '-');
            $("#thuTu").text(tacPham.thuTu || '-');
            $("#trangThai").html(tacPham.suDung ? `<div class="TrangThai green-text">Sử dụng</div>` : `<div class="TrangThai red-text">Không sử dụng</div>`);
            $("#anhDaiDien").attr('src', tacPham.hinhAnh || '/assets/images/vector/no-image.png');

            // Load đa ngữ từ banDich (bản vi)
            let banDichVi = tacPham.banDich && tacPham.banDich.find(b => b.maNgonNgu === 'vi');
            if (banDichVi) {
                $("#tenTacPham").text(banDichVi.tenTacPham || '-');
                $("#tacGia").text(banDichVi.tacGia || '-');
                $("#gioiThieu").text(banDichVi.moTa || '-');
                $("#noiDung").html(decodeCkeditorHtml(banDichVi.noiDung || '-'));
            } else {
                $("#tenTacPham").text('-');
                $("#tacGia").text('-');
                $("#gioiThieu").text('-');
                $("#noiDung").html('-');
            }

            // Thông tin người tạo/cập nhật
            $("#nguoiTao").text(tacPham.tenNguoiCapNhat || '-');
            $("#ngayTao").text(formatDateWithoutTime(tacPham.ngayCapNhat) || '-');
            $("#nguoiCapNhat").text(tacPham.tenNguoiHieuChinh || '-');
            $("#ngayCapNhat").text(formatDateWithoutTime(tacPham.ngayHieuChinh) || '-');
        }
    });
}

function initTableBieuDien(tacPhamID) {
    const tableApi = {
        url: `${baseUrl}/api/TacPhamApi/BieuDien/DanhSach${tacPhamID ? `/${tacPhamID}` : ''}`,
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
            targets: 1,
            render: function (data, type, row, meta) {
                return `<span class="detail-command-btn text-blue" id=n-"${meta.row}">${data}</span>`;
            }
        },
        {
            targets: 3,
            render: function (data, type, row, meta) {
                let ngayBieuDien = data ? formatShortDate(data) : '';
                return ngayBieuDien;
            }
        },
        {
            targets: 5,
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
        { "data": "tenSuKien", "width": "25%", "class": "left-align" },
        { "data": "moTa", "width": "120px", "class": "left-align" },
        { "data": "batDau", "width": "120px", "class": "center-align" },
        { "data": "thuTu", "width": "120px", "class": "center-align" },
        { "data": "trangThai", "width": "120px", "class": "center-align" },
    ];

    initDataTableConfigNoSearch('dataGridBieuDien', tableApi, tableDefs, tableCols);

    $('#dataGridBieuDien tbody').on('click', '.detail-command-btn', function () {
        var id = $(this).attr("ID").match(/\d+/)[0];
        var data = $('#dataGridBieuDien').DataTable().row(id).data();

        let banDichVi = data.banDich && data.banDich.find(b => b.maNgonNgu === 'vi');
        $('#modalTitleDetail').text(`Chi tiết buổi biểu diễn ${banDichVi.tenSuKien ?? ""}`)
        $('#tenChuongTrinhDetail').text(banDichVi.tenSuKien ?? "")
        $('#ngayBieuDienDetail').text(formatShortDate(data.batDau))
        $('#diaDiemToChucDetail').html(banDichVi.moTa ?? "")
        $('#noiDungCongDienDetail').html(banDichVi.noiDung ?? "")
        $('#trangThaiDetail').text(data.trangThai == true ? "Sử dụng" : "Không sử dụng")
        $('#thuTuDetail').text(data.thuTu)

        if (data.thamGia != null && data.thamGia.length > 0) {
            for (let i = 0; i < data.thamGia.length; i++) {
                if (data.thamGia[i].loaiDoiTuong == true) {
                    $('#donViThamGiaDetail').append(`<span class="badge badge-info mr-1 mb-1">${data.thamGia[i].tenDoiTuong}</span>`);
                } else {
                    $('#ngheSiThamGiaDetail').append(`<span class="badge badge-success mr-1 mb-1">${data.thamGia[i].tenDoiTuong}</span>`);
                }
            }
        }
        $('#modalDetail').modal('show');
    })
}