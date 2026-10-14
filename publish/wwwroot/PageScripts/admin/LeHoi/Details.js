const baseUrl = getRootLink();
console.log(LeHoiId, "LeHoiId")

$(document).ready(function () {
    if (LeHoiId) {
        loadData(LeHoiId);
    }
});

function loadData(LeHoiId) {
    getDataWithApi('GET', `/api/VH_LeHoiApi/Get?MaNgonNgu=vi&LeHoiID=${LeHoiId}`).then(data => {
        console.log(data)
        if (data && data.isSuccess && data.value) {
            let LeHoi = data.value;
            let title = `Thông tin lễ hội ${LeHoi.tenLeHoiChild}`;
            let htmlTitle = ``;
            if (LeHoi.tenLeHoiChild) {
                htmlTitle = `<div class='mainTitle'>${LeHoi.tenLeHoiChild}</div>`;
                if (LeHoi.maDinhDanhLeHoi) {
                    htmlTitle += `<div class='subTitle'>(${LeHoi.maDinhDanhLeHoi})</div>`;
                }
            }
            $('#pageTitle').html(htmlTitle);
            document.title = title;

            $("#maDinhDanh").text(LeHoi.maDinhDanhLeHoi || '');
            $("#tenLeHoi").text(LeHoi.tenLeHoiChild || '');
            $("#theLoai").text(LeHoi.theLoai || '');
            $("#capDoLeHoi").text(LeHoi.capDo || '');
            $("#capQuanLy").text(LeHoi.capQuanLy || '');
            $("#tanSuat").text(LeHoi.tanSuat || '');
            $("#thoiGianDienRa").text(LeHoi.thoiGianDienRa || '');
            $("#soNgayDienRa").text(LeHoi.soNgayDienRa || '');
            $("#soLuongThamGia").text(LeHoi.soLuongThamGia || '');
            $("#donViToChuc").text(LeHoi.tenToChuc || '');
            $("#namVHPHTQG").text(LeHoi.namVHPHTQG || '');
            $("#danToc").text(''); // Cần API để lấy tên dân tộc từ danTocID
            let laLoai = [];
            if (LeHoi.laTieuBieu) laLoai.push('Tiêu biểu');
            if (LeHoi.laCungDinh) laLoai.push('Cung đình');
            $("#laLoaiLeHoi").text(laLoai.join(', ') || '');
            $("#trangThaiToChuc").text(LeHoi.trangThaiToChuc ? 'Đang tổ chức' : 'Không tổ chức');
            $("#trangThai").text(LeHoi.trangThai ? 'Duyệt' : 'Chưa duyệt');
            $("#ngayBatDau").text(formatDateWithoutTime(LeHoi.ngayBatDau));
            $("#ngayKetThuc").text(formatDateWithoutTime(LeHoi.ngayKetThuc));
            $("#thuTu").text(''); // Không có trong dữ liệu
            $("#diaChi").text(LeHoi.diaDiemChiTiet || '');
            $("#donViPhoiHop").text(LeHoi.donViPhoiHop || '');
            $("#nhanVatPhungTho").text(LeHoi.nhanVatPhungTho || '');
            $("#gioiThieuLeHoi").html(LeHoi.noiDung || '');
            $("#quyDinh").html(LeHoi.quiDinh || '');
            $("#danhGia").html(LeHoi.danhGia || '');
            $("#anhDaiDien").attr("src", LeHoi.anhDaiDien ? `${LeHoi.anhDaiDien}`: '/assets/images/vector/no-image.png'); // Không có trong dữ liệu
            $("#ngayCapNhat").text(formatDateWithoutTime(LeHoi.ngayCapNhat));

            $('#nguoiTao').text(LeHoi.nguoiTao || '-');
            $('#ngayTao').text(formatDateWithoutTime(LeHoi.ngayTao) || '-');
            $('#nguoiCapNhat').text(LeHoi.nguoiCapNhat || '-');
            $('#ngayCapNhat').text(formatDateWithoutTime(LeHoi.ngayCapNhat) || '-');

            if (LeHoi.listIDDiaDiem) {
                console.log(LeHoi.listIDDiaDiem, "Danh sách địa điểm đã chọn")
                let listDiaDiem = LeHoi.listIDDiaDiem.split(',').map(x => x.trim().toLowerCase());
                $("#DiaDiemCoSanAdd").val(listDiaDiem.map(item => item)).trigger('change');
                initTableDiaDiem(listDiaDiem.map(item => item).join(','));
            }
        }
    })
}