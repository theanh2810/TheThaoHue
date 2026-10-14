const baseUrl = getRootLink();
const url = DanhMucID == 58 ? "AdminTool/TienIchKhac/DiemGiaoDich" : "AdminTool/TienIchKhac/DuongDayNong"

$(document).ready(function () {
    if (DanhMucID == 59) {
        $("#contentH2").html("Thêm mới đường dây nóng")
        $("#contentLabel").html(`Loại nhóm dịch vụ <span class="text-danger">*</span>`)
    }
    initDatePicker();
    initDanhMucChung_NoAll(`${DanhMucID}`, "#loaiCoSoAdd", "")
    initSelect2();

    $("#btnSaveAdd").on("click", function () {
        dataAddCoSoLuuTru(DanhMucID);
    })

    $("#btnCancel").on("click", function () {
        window.location.href = `${baseUrl}/${url}`;
    })
    initTempDaPhuongTienTableCoSo();

    // Event cho thêm tài liệu truyền thông
    $(document).on('click', '#btnAddDaPhuongTienCoSo', function () {
        $('#modalAddDaPhuongTienCoSo').modal('show');
        resetDaPhuongTienFormCoSo();
    });
});

//#region Xử lý thông tin chung
function dataAddCoSoLuuTru(DanhMucID) {
    // Thông tin chung
    const diaDiemID = $("#DiaDiemCoSanAdd").val();
    const nhomDichVuID = $("#loaiCoSoAdd").val();
    const dienThoai = $("#dienThoaiCoSoAdd").val();
    const trangThai = $("input[name='trangThaiCoSoAdd']:checked").val() == 1 ? true : false;
    const thuTu = $("#thuTuCoSoAdd").val()

    const dtCoSo = {
        DiaDiemID: diaDiemID || null,
        NhomDichVuID: nhomDichVuID || null,
        DienThoai: dienThoai || null,
        TrangThai: trangThai,
        ThuTu: thuTu
    };

    // Tài liệu truyền thông
    const requestDaPhuongTien = createRequestDaPhuongTiens();

    let formData = new FormData();
    formData.append('EntityDichVu', JSON.stringify(dtCoSo));

    // Thêm tài liệu truyền thông
    for (let i = 0; i < requestDaPhuongTien.length; i++) {
        formData.append(`EntityDaPhuongTien[${i}].DaPhuongTien`, JSON.stringify(requestDaPhuongTien[i].DaPhuongTien));
        formData.append(`EntityDaPhuongTien[${i}].DaPhuongTien_NoiDung`, JSON.stringify(requestDaPhuongTien[i].DaPhuongTien_NoiDung));
        formData.append(`EntityDaPhuongTien[${i}].File`, requestDaPhuongTien[i].File[0]);
    }

    if (checkEmptyBlank(diaDiemID)) {
        showNotification(0, "Vui lòng chọn địa điểm")
    }
    else if (checkEmptyBlank(nhomDichVuID)) {
        showNotification(0, "Vui lòng chọn loại điểm giao dịch")
    }
    else if (checkTagHtmlSingle(dienThoai)) {
        showNotification(0, "Điện thoại chứa ký tự không hợp lệ")
    }
    else if (isValidPhoneNumber(dienThoai)) {
        showNotification(0, "Điện thoại không hợp lệ")
    }
    else if (isValidPositiveIntegerAllowEmpty(thuTu) || Number(thuTu) > 2147483647) {
        showNotification(0, "Thứ tự không hợp lệ")
    }
    else {
        $.ajax({
            type: 'POST',
            url: `${baseUrl}/api/DL_DichVuTienIchApi/Add`,
            async: false,
            contentType: false,
            processData: false,
            data: formData,
            success: function (data) {
                if (data.isSuccess && data.value) {
                    showNotification(1, `Thêm mới ${DanhMucID == 58 ? "điểm giao dịch" : "đường dây nóng"} thành công`);
                    // Redirect hoặc reset form
                    setTimeout(function () {
                        window.location.href = `${baseUrl}/${url}`;
                    }, 2000);
                } else {
                    showNotification(0, `Thêm mới ${DanhMucID == 58 ? "điểm giao dịch" : "đường dây nóng"} không thành công`);
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

const isValidPhoneNumber = (value) => {
    const regex = /^$|^\d{10,11}$/;
    return !regex.test(value);
}

const isValidPositiveIntegerAllowEmpty = (value) => {
    // Cho phép rỗng
    if (value === undefined || value === null || value === "") {
        return false;
    }

    // Ép về string để xử lý
    const str = String(value);

    // Phải là chuỗi toàn ký tự số
    if (!/^\d+$/.test(str)) return true;

    // Ép về số
    const num = parseInt(str, 10);

    // Phải là số nguyên dương > 0
    return num <= 0;
};
//#endregion function validation