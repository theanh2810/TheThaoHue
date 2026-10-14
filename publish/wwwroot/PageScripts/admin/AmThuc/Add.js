const baseUrl = getRootLink();
const ckeditormoTa = CKEDITOR.replace('moTaAdd');
const ckeditornguyenLieu = CKEDITOR.replace('nguyenLieuAdd');
const ckeditortraiNghiem = CKEDITOR.replace('traiNghiemAdd');

$(document).ready(function () {
    initDanhMucChung_NoAll(62, "#kieuMonAdd", "") // Kiểu món
    initDanhMucChung_NoAll(63, "#cheDoAnAdd", "") // Chế độ ăn
    initNgonNgu("#ngonNguDichAdd")
    previewPicture()
    previewPictureSuKien()
    initSelect2();

    // Event handler cho thay đổi Ngôn ngữ
    $(document).on('change', '#ngonNguDichAdd', function() {
        $('#tenMonAdd').val('');
        $('#moTaAdd').val('');
        $('#nguyenLieuAdd').val('');
        $('#traiNghiemAdd').val('');
    });

    $("#btnSaveAdd").on("click", function () {
        dataAddAmThuc();
    })

    $("#btnCancel").on("click", function () {
        window.location.href = `${baseUrl}/AdminTool/AmThuc/AmThuc`;
    })
});

// Xử lý thông tin chung
function dataAddAmThuc() {
    // Thông tin cơ bản
    const fileAnhDaiDien = $("#fileAnhDaiDienPrev")[0].files[0] || null;
    const kieuMonID = $("#kieuMonAdd").val();
    const cheDoAnID = $("#cheDoAnAdd").val();
    const thuTu = $("#thuTuAdd").val();
    const dacSan = $("input[name='dacSanAdd']:checked").val() == "1" ? true : false;
    const trangThai = $("input[name='trangThaiAdd']:checked").val() == "1" ? true : false;

    // Đa ngữ
    const maNgonNgu = $("#ngonNguDichAdd").val();
    const tenMon = $("#tenMonAdd").val();
    const moTa = ckeditormoTa.getData();
    const nguyenLieu = ckeditornguyenLieu.getData();
    const traiNghiem = ckeditortraiNghiem.getData();

    const dtAmThuc = {
        KieuMonID: kieuMonID || null,
        CheDoAnID: cheDoAnID || null,
        ThuTu: thuTu || 0,
        DacSan: dacSan,
        TrangThai: trangThai,
        MaNgonNgu: maNgonNgu,
        TenMon: tenMon,
        MoTa: moTa,
        NguyenLieu: nguyenLieu,
        TraiNghiem: traiNghiem
    };

    console.log(dtAmThuc);
    let requestDaPhuongTien = createRequestDaPhuongTiens();

    let formData = new FormData();
    formData.append('RequestAmThuc', JSON.stringify(dtAmThuc));
    if (fileAnhDaiDien) {
        formData.append('File', fileAnhDaiDien);
    }
    // Thêm tài liệu truyền thông
    for (let i = 0; i < requestDaPhuongTien.length; i++) {
        formData.append(`EntityDaPhuongTien[${i}].DaPhuongTien`, JSON.stringify(requestDaPhuongTien[i].DaPhuongTien));
        formData.append(`EntityDaPhuongTien[${i}].DaPhuongTien_NoiDung`, JSON.stringify(requestDaPhuongTien[i].DaPhuongTien_NoiDung));
        formData.append(`EntityDaPhuongTien[${i}].File`, requestDaPhuongTien[i].File[0]);
    }

    if (fileAnhDaiDien == null) {
        showNotification(0, "Vui lòng chọn ảnh đại diện")
    }
    else if (checkEmptyBlank(kieuMonID)) {
        showNotification(0, "Vui lòng chọn kiểu món")
    }
    else if (checkEmptyBlank(cheDoAnID)) {
        showNotification(0, "Vui lòng chọn chế độ ăn")
    }
    else if (checkEmptyBlank(tenMon)) {
        showNotification(0, "Vui lòng nhập tên món")
    }
    else if (checkTagHtmlSingle(tenMon)) {
        showNotification(0, "Tên món chứa ký tự không hợp lệ")
    }
    else {
        $.ajax({
            type: 'POST',
            url: `${baseUrl}/api/VH_AmThucApi/Add`,
            async: false,
            contentType: false,
            processData: false,
            data: formData,
            success: function (data) {
                if (data.isSuccess && data.value) {
                    showNotification(1, "Thêm mới ẩm thực thành công");
                    setTimeout(function () {
                        window.location.href = `${baseUrl}/AdminTool/AmThuc`;
                    }, 2000);
                } else {
                    showNotification(0, "Thêm mới ẩm thực không thành công");
                    console.log(data.error);
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
    }

    
}

//#region function validation
const checkTagHtmlSingle = (input) => {
    // Loại bỏ khoảng trắng đầu/cuối và kiểm tra bằng regex
    if (!input || input.trim() === "") return false; // Cho phép chuỗi rỗng hoặc toàn khoảng trắng
    const regex = /<[^>]+>/g;
    return regex.test(input);
}
//#endregion function validation
