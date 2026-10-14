const baseUrl = getRootLink();

$(document).ready(function () {
    if (coQuanId) {
        loadCoQuanData(coQuanId);
    }
});

//#region Function Xử lý thông tin tổ chức
function loadCoQuanData(id) {
    console.log(id);
    let data = JSON.stringify({
        loaiToChucID: 489,
        toChucID: id
    });

    getDataWithApi('POST', '/api/ToChucApi/DanhSach', data).then(data => {
        if (data && data.isSuccess && data.value && data.value.length > 0) {
            const item = data.value[0];
            console.log(item);

            // Thông tin chung
            $('#maCoQuan').text(item.maDinhDanh || '-');
            $('#linhVuc').text(item.tenLinhVuc || '-'); // Không có trong dữ liệu API
            $('#ngayThanhLap').text(item.ngayThanhLap ? formatDateWithoutTime(item.ngayThanhLap) : '-');
            $('#thuTu').text(item.thuTu || '-');
            $('#soDienThoai').text(item.dienThoai || '-');
            $('#hopThu').text(item.hopThu || '-');
            $('#website').text(item.website || '-');
            // Hiển thị trạng thái
            if (item.trangThaiID == 1) {
                $('#trangThai').html('<span class="TrangThai green-text">Duyệt</span>');
            } else {
                $('#trangThai').html('<span class="TrangThai red-text">Chưa duyệt</span>');
            }

            // Đa ngữ - dùng trực tiếp từ item vì API trả về trực tiếp
            $('#pageTitle').text(`Chi tiết ${item.tenToChuc}` || 'Chi tiết tổ chức trao giải');
            $('#tenCoQuanDich').text(item.tenToChuc || '-');
            $('#diaChiDich').text(item.diaChi || '-');
            $('#gioiThieuDich').html(item.gioiThieu || '-');
            $('#ghiChuDich').html(item.ghiChu || '-');

            // Thông tin người tạo/cập nhật
            $('#nguoiTao').text(item.tenNguoiTao || '-');
            $('#ngayTao').text(item.ngayTao ? formatDateTime(item.ngayTao) : '-');
            $('#nguoiCapNhat').text(item.tenNguoiCapNhat || '-');
            $('#ngayCapNhat').text(item.ngayCapNhat ? formatDateTime(item.ngayCapNhat) : '-');
        }
    }).catch(err => {
        console.error('Lỗi khi tải dữ liệu tổ chức:', err);
    });
}

function loadToChucTranslation(toChucID, maNgonNgu) {
    getDataWithApi('GET', `/api/ToChucApi/BanDich/${toChucID}?maNgonNgu=${maNgonNgu}`).then(data => {
        if (data && data.isSuccess && data.value) {
            const noiDung = data.value;
            $('#tenCoQuanDich').text(noiDung.tenToChuc || '-');
            $('#diaChiDich').text(noiDung.diaChi || '-');
            $('#gioiThieuDich').html(noiDung.gioiThieu || '-');
            $('#ghiChuDich').html(noiDung.ghiChu || '-');
        }
    }).catch(err => {
        console.error('Lỗi khi tải bản dịch:', err);
    });
}
//#endregion Function Xử lý thông tin tổ chức