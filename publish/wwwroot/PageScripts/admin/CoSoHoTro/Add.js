const baseUrl = getRootLink();
const ckeditormoTaCoSo = CKEDITOR.replace('moTaCoSoAdd');
const ckeditortraiNghiemCoSo = CKEDITOR.replace('traiNghiemCoSoAdd');
const ckeditorgoiYCoSo = CKEDITOR.replace('goiYCoSoAdd');

$(document).ready(function () {
    initDatePicker();
    initDanhMucChung_NoAll(57, "#loaiCoSoAdd", "") // Loại cơ sở lưu trú
    initNgonNgu("#ngonNguDichCoSoAdd")
    previewPicture()
    previewPictureSuKien()
    initSelect2();

    // Event handler cho thay đổi Ngôn ngữ
    $(document).on('change', '#ngonNguDichCoSoAdd', function() {
        $('#tenCoSoAdd').val('');
        $('#moTaCoSoAdd').val('');
        $('#nguoiDaiDienCoSoAdd').val('');
        $('#diaChiCoSoAdd').val('');
        $('#traiNghiemCoSoAdd').val('');
        $('#goiYCoSoAdd').val('');
    });

    $("#btnSaveAdd").on("click", function () {
        dataAddCoSoLuuTru();
    })
  
});

//#region Xử lý thông tin chung
function dataAddCoSoLuuTru() {
    // Thông tin chung
    const diaDiemID = $("#DiaDiemCoSanAdd").val();
    const loaiHinhCoSoID = $("#loaiCoSoAdd").val();
    const dienThoai = $("#dienThoaiCoSoAdd").val();
    const hopThu = $("#hopThuCoSoAdd").val();
    const lienKet = $("#lienKetCoSoAdd").val();
    const trangThai = $("input[name='trangThaiCoSoAdd']:checked").val() == 1 ? true : false;
    const thuTu = $("#thuTuCoSoAdd").val()

    // Đa ngữ
    const maNgonNgu = $("#ngonNguDichCoSoAdd").val();
    const tenCoSo = $("#tenCoSoAdd").val();
    const diaChi = $("#diaChiCoSoAdd").val();
    const moTa = ckeditormoTaCoSo.getData();
    const traiNghiem = ckeditortraiNghiemCoSo.getData();
    const goiY = ckeditorgoiYCoSo.getData();
    const fileAnhDaiDien = $("#fileAnhDaiDienPrev")[0].files[0] || null;

    const dtCoSo = {
        DiaDiemID: diaDiemID || null,
        LoaiHinhCoSoID: loaiHinhCoSoID || null,
        DienThoai: dienThoai || null,
        HopThu: hopThu || null,
        LienKet: lienKet || null,
        TrangThai: trangThai,
        MaNgonNgu: maNgonNgu,
        TenCoSo: tenCoSo,
        MoTa: moTa,
        DiaChi: diaChi,
        TraiNghiem: traiNghiem,
        GoiY: goiY,
        ThuTu: thuTu
    };

    // Tài liệu truyền thông
    const requestDaPhuongTien = createRequestDaPhuongTiens();

    // Văn bản tài liệu
    const requestVBTL = createRequestVBTLCoSo();

    let formData = new FormData();
    formData.append('File', fileAnhDaiDien)
    formData.append('RequestCoSo',JSON.stringify(dtCoSo));

    // Thêm tài liệu truyền thông
    for (let i = 0; i < requestDaPhuongTien.length; i++) {
        formData.append(`EntityDaPhuongTien[${i}].DaPhuongTien`, JSON.stringify(requestDaPhuongTien[i].DaPhuongTien));
        formData.append(`EntityDaPhuongTien[${i}].DaPhuongTien_NoiDung`, JSON.stringify(requestDaPhuongTien[i].DaPhuongTien_NoiDung));
        formData.append(`EntityDaPhuongTien[${i}].File`, requestDaPhuongTien[i].File[0]);
    }

    // Thêm văn bản tài liệu
    for (let i = 0; i < requestVBTL.length; i++) {
        formData.append(`EntityVanBan[${i}].RequestVanBan`, JSON.stringify(requestVBTL[i].RequestVanBan));
        formData.append(`EntityVanBan[${i}].File`, requestVBTL[i].File[0]);
    }   

    if (fileAnhDaiDien == null) {
        showNotification(0, "Vui lòng chọn ảnh đại diện")
    }
    else if (checkTagHtmlSingle(hopThu)) {
        showNotification(0, "Hộp thư chứa ký tự không hợp lệ")
    }
    else if (isValidEmailAllowEmpty(hopThu)) {
        showNotification(0, "Hộp thư không hợp lệ")
    }
    else if (checkTagHtmlSingle(lienKet)) {
        showNotification(0, "Liên kết chứa ký tự không hợp lệ")
    }
    else if (isValidUrlAllowEmpty(lienKet)) {
        showNotification(0, "Liên kết không hợp lệ")
    }
    else if (checkEmptyBlank(loaiHinhCoSoID)) {
        showNotification(0, "Vui lòng chọn loại hình cơ sở")
    }
    else if (isValidPositiveIntegerAllowEmpty(thuTu) || thuTu >= 2147483647) {
        showNotification(0, "Thứ tự không hợp lệ")
    }
    else if (checkEmptyBlank(tenCoSo)) {
        showNotification(0, "Vui lòng nhập tên cơ sở dịch vụ hỗ trợ")
    }
    else if (checkTagHtmlSingle(tenCoSo)) {
        showNotification(0, "Tên cơ sở dịch vụ hỗ trợ chứa ký tự không hợp lệ")
    }
    else if (checkTagHtmlSingle(diaChi)) {
        showNotification(0, "Địa chỉ chứa ký tự không hợp lệ")
    }
    else if (checkEmptyBlank(diaDiemID)) {
        showNotification(0, "Vui lòng chọn địa điểm")
    }
    else {
        return
        $.ajax({
            type: 'POST',
            url: `${baseUrl}/api/DL_CoSoDichVuHoTroApi/Add`,
            async: false,
            contentType: false,
            processData: false,
            data: formData,
            success: function (data) {
                if (data.isSuccess && data.value) {
                    showNotification(1, "Thêm mới cơ sở dịch vụ hỗ trợ thành công");
                    // Redirect hoặc reset form
                    setTimeout(function () {
                        window.location.href = `${baseUrl}/AdminTool/CoSoHoTro/CoSoHoTro`;
                    }, 2000);
                } else {
                    showNotification(0, "Thêm mới cơ sở dịch vụ hỗ trợ không thành công");
                    console.log(data.error);
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
    }

  
}
//#endregion Xử lý thông tin chung

//#region function validation
const checkTagHtmlSingle = (input) => {
    // Loại bỏ khoảng trắng đầu/cuối và kiểm tra bằng regex
    if (!input || input.trim() === "") return false; // Cho phép chuỗi rỗng hoặc toàn khoảng trắng
    const regex = /<[^>]+>/g;
    return regex.test(input);
}

const isValidEmailAllowEmpty = (input) => {
    if (!input || input.trim() === "") return false; // Rỗng vẫn hợp lệ

    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
    return !regex.test(input.trim());
};

const isValidUrlAllowEmpty = (input) => {
    if (!input || input.trim() === "") return false; // Rỗng vẫn hợp lệ

    const regex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/;
    return !regex.test(input.trim());
};


//#endregion function validation
