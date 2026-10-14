const baseUrl = getRootLink();

$(document).ready(function () {
    loadData();
});

function loadData() {

    if (!CoSoTraiNghiemId) {
        showNotification(0, "Không tìm thấy ID cơ sở trải nghiệm");
        return;
    }

    $.ajax({
        type: 'GET',
        url: `${baseUrl}/api/DL_CoSoDichVuTraiNghiemApi/Get?CoSoDichVuID=${CoSoTraiNghiemId}&MaNgonNgu=vi`,
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
                $("#tenCoSoTraiNghiemDetails").text(item.tenCoSo || '-');
                $("#diaDiemCoSoTraiNghiemDetails").text(item.tenDiaDiem || '-');
                //$("#loaiCoSoTraiNghiemDetails").text(item.tenLoaiCoSo || '-');
                //$("#phongCachCoSoTraiNghiemDetails").text(item.tenPhongCachCoSo || '-');
                $("#loaiDichVuAnUongDetails").text(item.tenLoaiDichVuAnUong || '-');
                //$("#hangSaoCoSoTraiNghiemDetails").text(item.hangSao ? `${item.hangSao} sao` : '-');
                $("#sucChuaCoSoTraiNghiemDetails").text(item.sucChua || '-');
                $("#diemDanhGiaCoSoTraiNghiemDetails").text(item.diemDanhGia || '-');
                $("#soLuotDanhGiaCoSoTraiNghiemDetails").text(item.soLuotDanhGia || '-');
                $("#dienThoaiCoSoTraiNghiemDetails").text(item.dienThoai || '-');
                $("#hopThuCoSoTraiNghiemDetails").text(item.hopThu || '-');
                $("#lienKetCoSoTraiNghiemDetails").text(item.lienKet || '-');
                $("#gioMoCuaCoSoTraiNghiemDetails").text(item.gioMoCua || '-');
                $("#gioDongCuaCoSoTraiNghiemDetails").text(item.gioDongCua || '-');
                $("#ngayNghiHangTuanCoSoTraiNghiemDetails").text(
                    item.ngayNghiHangTuan == 'Su' ? "Chủ nhật" :
                    item.ngayNghiHangTuan == 'Mo' ? "Thứ hai" :
                    item.ngayNghiHangTuan == 'Tu' ? "Thứ ba" :
                    item.ngayNghiHangTuan == 'We' ? "Thứ tư" :
                    item.ngayNghiHangTuan == 'Th' ? "Thứ năm" :
                    item.ngayNghiHangTuan == 'Fr' ? "Thứ sáu" :
                    item.ngayNghiHangTuan == 'Sa' ? "Thứ bảy" : '-'
                );
                $("#banVeCoSoTraiNghiemDetails").text(item.banVe ? "Có" : "Không");
                $("#nguoiDaiDienCoSoTraiNghiemDetails").text(item.nguoiDaiDien || '-');
                $("#diaChiCoSoTraiNghiemDetails").text(item.diaChi || '-');
                $("#moTaCoSoTraiNghiemDetails").html(item.moTa || '-');
                $("#traiNghiemCoSoTraiNghiemDetails").html(item.traiNghiem || '-');
                $("#goiYCoSoTraiNghiemDetails").html(item.goiY || '-');
                $("#trangThaiCoSoTraiNghiemDetails").html(item.trangThai ? `<span class="TrangThai green-text">Hoạt động</span>` : `<span class="TrangThai red-text">Không hoạt động</span>`);
                $("#anhDaiDien").attr('src', item.anhDaiDien || '/assets/images/vector/no-image.png');

                $('#nguoiTao').text(item.tenNguoiTao || '-');
                $('#ngayTao').text(formatDateWithoutTime(item.ngayTao) || '-');
                $('#nguoiCapNhat').text(item.tenNguoiCapNhat || '-');
                $('#ngayCapNhat').text(formatDateWithoutTime(item.ngayCapNhat) || '-');
            } else {
                showNotification(0, "Không tìm thấy dữ liệu cơ sở trải nghiệm");
            }
        },
        error: function (err) {
            console.log(err);
            showNotification(0, "Lỗi khi tải dữ liệu");
        }
    });
}
