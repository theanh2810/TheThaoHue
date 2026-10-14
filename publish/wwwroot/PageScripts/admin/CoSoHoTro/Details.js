const baseUrl = getRootLink();

$(document).ready(function () {
    loadData();
});

function loadData() {

    if (!CoSoHoTroId) {
        showNotification(0, "Không tìm thấy ID cơ sở trải nghiệm");
        return;
    }

    $.ajax({
        type: 'GET',
        url: `${baseUrl}/api/DL_CoSoDichVuHoTroApi/Get?CoSoDichVuID=${CoSoHoTroId}&MaNgonNgu=vi`,
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
                $("#tenCoSoHoTroDetails").text(item.tenCoSo || '');
                $("#diaDiemCoSoHoTroDetails").text(item.tenDiaDiem || '');
                //$("#loaiCoSoHoTroDetails").text(item.tenLoaiCoSo || '');
                //$("#phongCachCoSoHoTroDetails").text(item.tenPhongCachCoSo || '');
                $("#loaiDichVuAnUongDetails").text(item.tenLoaiDichVuAnUong || '');
                //$("#hangSaoCoSoHoTroDetails").text(item.hangSao ? `${item.hangSao} sao` : '');
                $("#sucChuaCoSoHoTroDetails").text(item.sucChua || '');
                $("#diemDanhGiaCoSoHoTroDetails").text(item.diemDanhGia || '');
                $("#soLuotDanhGiaCoSoHoTroDetails").text(item.soLuotDanhGia || '');
                $("#dienThoaiCoSoHoTroDetails").text(item.dienThoai || '');
                $("#hopThuCoSoHoTroDetails").text(item.hopThu || '');
                $("#lienKetCoSoHoTroDetails").text(item.lienKet || '');
                $("#gioMoCuaCoSoHoTroDetails").text(item.gioMoCua || '');
                $("#gioDongCuaCoSoHoTroDetails").text(item.gioDongCua || '');

                $("#nguoiDaiDienCoSoHoTroDetails").text(item.nguoiDaiDien || '');
                $("#diaChiCoSoHoTroDetails").text(item.diaChi || '');
                $("#moTaCoSoHoTroDetails").html(item.moTa || '');
                $("#traiNghiemCoSoHoTroDetails").html(item.traiNghiem || '');
                $("#goiYCoSoHoTroDetails").html(item.goiY || '');
                $("#trangThaiCoSoHoTroDetails").html(item.trangThai ? `<span class="TrangThai green-text">Hoạt động</span>` : `<span class="TrangThai red-text">Không hoạt động</span>`);
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
