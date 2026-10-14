const baseUrl = getRootLink();

$(document).ready(function () {
    if (nhanSuId) {
        loadData(nhanSuId);
    }
});

function loadData(nhanSuId) {
    // Load thông tin hướng dẫn viên
    getDataWithApi('GET', `/api/DM_CaNhan_HuongDanVienApi/Get?CaNhanID=${nhanSuId}&maNgonNgu=vi`).then(data => {
        if (data && data.isSuccess && data.value) {
            let nhanSu = data.value;
            let title = `Thông tin hướng dẫn viên ${nhanSu.hoTen}`;
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
            $("#anhDaiDien").attr('src', nhanSu.anhChanDung || '/assets/images/vector/no-image.png');
            $("#gioiTinh").text(nhanSu.tenGioiTinh || '-')
            $("#ngaySinh").text(formatDateWithoutTime(nhanSu.ngaySinh) || '-');
            $("#danToc").text(nhanSu.danToc || '-')
            $("#soDienThoai").text(nhanSu.dienThoai || '-');
            $("#hopThu").text(nhanSu.hopThu || '-');
            $("#tinhThanhPho").text(nhanSu.tenTinh || '-');
            $("#phuongXa").text(nhanSu.tenXa || '-');
            $("#donViCongTac").text(nhanSu.tenToChuc || '-');
            $("#coQuanCap").text(nhanSu.tenNoiCap || '-');
            $("#soThe").text(nhanSu.soThe || '-');
            $("#loaiThe").text(nhanSu.tenLoaiThe || '-');
            $("#ngayCap").text(formatDateWithoutTime(nhanSu.ngayCap) || '-');
            $("#ngayHetHan").text(formatDateWithoutTime(nhanSu.ngayHetHan) || '-');
            $("#namKinhNghiem").text(nhanSu.namKinhNghiem || '-');
            $("#thuTu").text(nhanSu.thuTu || '-');
            $("#trangThai").html(nhanSu.trangThai ? `<div class="TrangThai green-text">Duyệt</div>` : `<div class="TrangThai red-text">Chưa duyệt</div>`);
            $("#donViCongTac").text(nhanSu.listTenToChuc || '-');
            //$("#soThe").text(nhanSu.soThe || '-');
            //$("#ngayCap").text(formatDateWithoutTime(nhanSu.ngayCap) || '-');
            //$("#coQuanCap").text(nhanSu.coQuanCap || '-');
            $("#thuTu").text(nhanSu.thuTu || '-');
            if (nhanSu.trangThai) {
                $("input[name='trangThai'][value='1']").prop('checked', true);
            } else {
                $("input[name='trangThai'][value='0']").prop('checked', true);
            }
            $("#diaChi").text(nhanSu.diaChi || '-');
            $("#noiLamViec").text(nhanSu.noiLamViec || '-');
            $("#moTanhanSu").html(decodeCkeditorHtml(nhanSu.moTa || '-'));
            $("#ghiChu").html(decodeCkeditorHtml(nhanSu.ghiChu || '-'));

            //Thông tin cập nhật
            $("#nguoiTao").text(nhanSu.tenNguoiTao || '-');
            $("#ngayTao").text(formatDateWithoutTime(nhanSu.ngayCapNhat) || '-');
            $("#nguoiCapNhat").text(nhanSu.tenNguoiCapNhat || '-');
            $("#ngayCapNhat").text(formatDateWithoutTime(nhanSu.ngayHieuChinh) || '-');  
        }
    });
}