const baseUrl = getRootLink();

$(document).ready(function () {
    // Lấy ID từ URL hoặc từ view
    const params = new URLSearchParams(window.location.search);
    const CoSoHoTroId = params.get("id")
    
    if (CoSoHoTroId) {
        loadDataDetails(CoSoHoTroId);
    }
});

//#region Xử lý thông tin chung
function loadDataDetails(id) {
    getDataWithApi('GET', `/api/DL_DichVuTienIchApi/Get?MaNgonNgu=vi&DichVuTienIchID=${id}`).then(data => {
        if (data && data.isSuccess && data.value) {
            const item = data.value;
            console.log('Dữ liệu chi tiết điểm giao dịch:', item);
            
            // Hiển thị ảnh đại diện
            if (item.anhDaiDien) {
                $("#anhDaiDien").attr("src", item.anhDaiDien);
            }
            
            // Hiển thị thông tin cơ bản
            $("#diaDiemCoSoHoTroDetails").text(item.tenDiaDiem || 'Chưa cập nhật');
            $("#dienThoaiCoSoHoTroDetails").text(item.dienThoai || 'Chưa cập nhật');
            $("#trangThaiCoSoHoTroDetails").html(item.trangThai ? 
                '<span class="TrangThai green-text">Hoạt động</span>' : 
                '<span class="TrangThai red-text">Không hoạt động</span>');
            $("#diaChiCoSoHoTroDetails").text(item.diaChi || 'Chưa cập nhật');
            
            // Hiển thị thông tin người tạo/cập nhật
            $("#nguoiTao").text(item.tenNguoiTao || '-');
            $("#ngayTao").text(item.ngayTao ? formatDateWithoutTime(item.ngayTao) : '-');
            $("#nguoiCapNhat").text(item.tenNguoiCapNhat || '-');
            $("#ngayCapNhat").text(item.ngayCapNhat ? formatDateWithoutTime(item.ngayCapNhat) : '-');
            
            // Cập nhật tiêu đề trang
            $("#pageTitle").text(`Chi tiết ${item.tenCoSo || 'điểm giao dịch'}`);

            // Cập nhật bảng
            initTableDiaDiem(item.diaDiemID);
            document.title = `Chi tiết ${item.tenCoSo || 'điểm giao dịch'}`;
        } else {
            showNotification(0, "Không tìm thấy dữ liệu điểm giao dịch");
        }
    }).catch(error => {
        console.error('Lỗi khi tải dữ liệu:', error);
        showNotification(0, "Lỗi khi tải dữ liệu chi tiết");
    });
}
//#endregion