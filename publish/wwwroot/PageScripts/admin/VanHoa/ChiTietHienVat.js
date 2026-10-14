const baseUrl = getRootLink();
console.log(hienVatId)

$(document).ready(function () {
    if (hienVatId) {
        loadData(hienVatId);
    }
});

function loadData(id) {
    getDataWithApi('GET', `/api/HienVatApi/ChiTiet/${id}`).then(data => {
        if (data && data.isSuccess && data.value) {
            let hienVat = data.value;
            let title = `Thông tin hiện vật ${hienVat.tenHienVat}`;
            let htmlTitle = ``;
            if (hienVat.tenHienVat) {
                htmlTitle = `<div class='mainTitle'>${hienVat.tenHienVat}</div>`;
                if (hienVat.maHienVat) {
                    htmlTitle += `<div class='subTitle'>(${hienVat.maHienVat})</div>`;
                }
            }
            $('#pageTitle').html(htmlTitle);
            document.title = title;
            // Load thông tin cơ bản
            $("#loaiHienVat").text(hienVat.tenLoaiHienVat || '-');
            $("#maHienVat").text(hienVat.maHienVat || '-');
            $("#chatLieu").text(hienVat.tenChatLieu || '-');
            $("#phuongThucTangMua").text(hienVat.phuongThucTangMuaID == 1 ? "Mua" : hienVat.phuongThucTangMuaID == 2 ? "Hiến tặng" : "");
            $("#baoTang").text(hienVat.tenBaoTang || '-');
            $("#tinhTrang").text(hienVat.tenTinhTrang || '-');
            $("#thuTu").text(hienVat.thuTu || '-');
            $("#trangThaiSuDung").html(hienVat.trangThai ? `<div class="TrangThai green-text">Sử dụng</div>` : `<div class="TrangThai red-text">Không sử dụng</div>`);
            $("#anhDaiDien").attr('src', hienVat.anhDaiDien || '/assets/images/vector/no-image.png');

            // Load đa ngữ từ banDich (bản vi)
            let banDichVi = hienVat.banDich && hienVat.banDich.find(b => b.maNgonNgu === 'vi');
            if (banDichVi) {
                $("#tenHienVat").text(banDichVi.tenHienVat || '-');
                $("#tenGoiKhac").text(banDichVi.tenGoiKhac || '-');
                $("#soLuong").text(banDichVi.soLuong || '-');
                $("#mauSac").html(banDichVi.mauSac || '-');
                $("#kichThuoc").html(banDichVi.kichThuoc || '-');
                $("#nienDai").html(banDichVi.nienDai || '-');
                $("#nguonGoc").html(decodeCkeditorHtml(banDichVi.nguonGoc || '-'));
                $("#khaoTa").html(decodeCkeditorHtml(banDichVi.khaoTa || '-'));
                $("#tinhTrangSuuTam").html(banDichVi.tinhTrangSuuTam || '-');
                $("#hoanCanhSuuTam").html(banDichVi.hoanCanhSuuTam || '-');
                $("#chuHienVat").html(banDichVi.chuHienVat || '-');
                $("#nguoiSuuTam").html(banDichVi.nguoiSuuTam || '-');
            } else {
                $("#tenHienVat").text('-');
                $("#tenGoiKhac").text('-');
                $("#soLuong").text('-');
                $("#mauSac").html('-');
                $("#kichThuoc").html('-');
                $("#nienDai").html('-');
                $("#nguonGoc").html('-');
                $("#khaoTa").html('-');
                $("#tinhTrangSuuTam").html('-');
                $("#hoanCanhSuuTam").html('-');
                $("#chuHienVat").html('-');
                $("#nguoiSuuTam").html('-');
            }

            // Thông tin người tạo/cập nhật
            $("#nguoiTao").text(hienVat.tenNguoiCapNhat || '-');
            $("#ngayTao").text(formatDateWithoutTime(hienVat.ngayCapNhat) || '-');
            $("#nguoiCapNhat").text(hienVat.tenNguoiHieuChinh || '-');
            $("#ngayCapNhat").text(formatDateWithoutTime(hienVat.ngayHieuChinh) || '-');
        }
    });
}