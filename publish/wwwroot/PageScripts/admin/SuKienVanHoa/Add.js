const baseUrl = getRootLink();
const ckeditorMoTaAdd = CKEDITOR.replace('moTaAdd');

$(document).ready(function () {

    //#region Xử lý các function chung
    $("#DiaDiemCoSanAdd").attr("multiple", "multiple")
    initSelect2()
    initValidation()
    initDatePicker()
    initDanhMucChung_NoAll(39, "#loaiDoiTuong", "") // Loại đối tượng - Cấp độ
    initDanhMucChung_NoAll(42, "#trangThaiSuKien", "") // Trạng thái sự kiện
    initDanhMucChung_NoAll(25, "#theLoaiAdd", "") // Thể loại - Lĩnh vực
    initDanhMucChung_NoAll(9, "#linhVucAdd", "") // Lĩnh vực
    initNgonNgu("#ngonNguDichAdd")
    previewPicture()
    previewPictureSuKien()
    CheckDateMinMax("#ngayBatDauAdd", "#ngayKetThucAdd")
    function initValidation() {
        CheckLengthEach('#tenSuKien', 255, null);
        CheckLengthEach('#tenDiaDiem', 255, null);
        CheckLengthEach('#diaChi', 255, null);
        CheckLengthEach('#noiDungSuKien', 1000, null);
    }
    //#endregion Xử lý các function chung

    //#region Xử lý thông tin sự kiện
    $(document).on('change', '#ngonNguDichAdd', function () {
        $('#tenSuKienDichAdd').val('');
        $('#diaChiAdd').val('');
        $('#noiDungAdd').val('');
    });

    $("#btnSaveAdd").on("click", function () {
        dataAdd()
    })

    //#endregion Xử lý thông tin sự kiện

    //Btn-back
    $("#btnBackLocation").on('click', function () {
        window.location.href = `/AdminTool/SuKienVanHoa`
    })
});

//#region Function Xử lý thông tin sự kiện
function dataAdd() { 
    //Thông tin chung
    const MaSuKien = $("#maSuKien").val();
    const CapDoID = $("#loaiDoiTuong").val();
    const TrangThaiSuKien = $("#trangThaiSuKien").val();
    const NgayBatDau = formatDateToSaveAsString($("#ngayBatDauAdd").val());
    const NgayKetThuc = formatDateToSaveAsString($("#ngayKetThucAdd").val());
    const ThuTu = $("#thuTu").val();
    const TrangThai = $("input[name='trangThai']:checked").val();

    //Nội dung đa ngữ
    const MaNgonNgu = $("#ngonNguDichAdd").val();
    const TenSuKien = $("#tenSuKienDichAdd").val();
    const KetQua = $("#ketQuaAdd").val();
    const MoTa = typeof ckeditorMoTaAdd !== 'undefined' ? ckeditorMoTaAdd.getData() : '';
    const AnhDaiDien = $("#fileAnhDaiDienPrev")[0].files[0] || null;
    let listID = $("#DiaDiemCoSanAdd").val() ? $("#DiaDiemCoSanAdd").val() : [];

    //console.log(AnhDaiDien, "anhDaiDien")

    let dtChung = {
        TenSuKien: TenSuKien,
        MaDinhDanh: MaSuKien,
        CapDoID: CapDoID,
        BatDau: NgayBatDau,
        KetThuc: NgayKetThuc,
        TrangThaiID: TrangThaiSuKien,
        ThuTu: ThuTu,
        TrangThai: TrangThai == 1 ? true : false,
        ListID: $("#DiaDiemCoSanAdd").val() ? $("#DiaDiemCoSanAdd").val().join(",") : null, 
        LinhVucID: 238, // Lĩnh vực Văn hóa

        //Nội dung đa ngữ
        MaNgonNgu: MaNgonNgu,
        KetQua: KetQua,
        MoTa: MoTa,
    }
    let requestDaPhuongTien = createRequestDaPhuongTiens();
    let formData = new FormData()
    formData.append('EntitySuKien', JSON.stringify(dtChung))
    formData.append("File", AnhDaiDien)
    for (let i = 0; i < requestDaPhuongTien.length; i++) {
        formData.append(`EntityDaPhuongTien[${i}].DaPhuongTien`, JSON.stringify(requestDaPhuongTien[i].DaPhuongTien));
        formData.append(`EntityDaPhuongTien[${i}].DaPhuongTien_NoiDung`, JSON.stringify(requestDaPhuongTien[i].DaPhuongTien_NoiDung));
        formData.append(`EntityDaPhuongTien[${i}].File`, requestDaPhuongTien[i].File[0]);
    }
    if (AnhDaiDien == null) {
        showNotification(0, "Vui lòng chọn ảnh đại diện")
    }
    else if (checkTagHtmlSingle(MaSuKien)) {
        showNotification(0, "Mã sự kiện chứa ký tự không hợp lệ")
    }
    else if (checkUnique(238, MaSuKien) > 0) {
        showNotification(0, "Mã sự kiện đã tồn tại")
    }
    else if (checkEmptyBlank(CapDoID)) {
        showNotification(0, "Vui lòng chọn cấp độ sự kiện")
    }
    else if (checkEmptyBlank(TrangThaiSuKien)) {
        showNotification(0, "Vui lòng chọn trạng thái sự kiện")
    }
    else if (checkEmptyBlank(NgayBatDau)) {
        showNotification(0, "Vui lòng chọn/nhập ngày bắt đầu sự kiện")
    }
    else if (checkEmptyBlank(NgayKetThuc)) {
        showNotification(0, "Vui lòng chọn/nhập ngày kết thúc sự kiện")
    }
    else if (isValidDateRange(NgayBatDau, NgayKetThuc)) {
        showNotification(0, "Ngày kết thúc sự kiện phải lớn hơn ngày bắt đầu sự kiện")
    }
    else if (checkEmptyBlank(TenSuKien)) {
        showNotification(0, "Vui lòng nhập tên sự kiện")
    }
    else if (checkTagHtmlSingle(TenSuKien)) {
        showNotification(0, "Tên sự kiện chứa ký tự không hợp lệ")
    }
    else if (checkTagHtmlSingle(KetQua)) {
        showNotification(0, "Kết quả sự kiện chứa ký tự không hợp lệ")
    }
    else if (listID.length == 0) {
        showNotification(0, "Vui lòng chọn địa điểm")
    }
    else {
        $.ajax({
            type: 'POST',
            url: `${baseUrl}/api/DM_SuKienApi/Add`,
            async: false,
            contentType: false,
            processData: false,
            data: formData,
            success: function (data) {
                console.log(data)
                if (data.isSuccess && data.value) {
                    showNotification(1, "Thêm mới sự kiện thành công");
                    setTimeout(() => {
                        window.location.href = `${baseUrl}/AdminTool/SuKienVanHoa`;
                    }, 1500);
                } else {
                    showNotification(0, "Thêm mới sự kiện không thành công");
                    console.log(data.error)
                }
            },
            error: function (err) {
                console.log(err)
            }
        })
    }
}
//#endregion Function Xử lý thông tin sự kiện
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

const isInvalidPriceRange = (minValue, maxValue) => {
    // Cho phép rỗng (nếu 1 trong 2 trống thì không tính là lỗi)
    if (
        minValue === undefined || maxValue === undefined ||
        minValue === null || maxValue === null ||
        minValue === "" || maxValue === ""
    ) {
        return false;
    }

    // Nếu có ký tự không hợp lệ (chỉ cho phép số và dấu chấm)
    const validFormat = /^[0-9.]+$/;
    if (!validFormat.test(minValue) || !validFormat.test(maxValue)) {
        return true; // lỗi vì chứa text hoặc ký tự lạ
    }

    // Loại bỏ dấu chấm ngăn cách nghìn (VD: "1.000.000" → "1000000")
    const cleanMin = String(minValue).replace(/\./g, "");
    const cleanMax = String(maxValue).replace(/\./g, "");

    const min = parseFloat(cleanMin);
    const max = parseFloat(cleanMax);

    // Nếu không phải số hợp lệ thì lỗi
    if (isNaN(min) || isNaN(max)) return true;

    // Trả về true nếu giá cao nhất nhỏ hơn giá thấp nhất
    return max < min;
};

const isValidDateRange = (ngayCap, ngayHetHan) => {
    // Nếu thiếu 1 trong 2 → không lỗi
    if (!ngayCap || !ngayHetHan) return false;



    //const start = new Date(formatDateToSaveAsString(ngayCap));
    //const end = new Date(formatDateToSaveAsString(ngayHetHan));

    // Nếu ngày không hợp lệ
    /* if (isNaN(ngayCap) || isNaN(ngayHetHan)) return true;*/

    return ngayHetHan < ngayCap;
};
const checkUnique = (linhVucID, maDinhDanh) => {
    let result = 0
    $.ajax({
        type: "GET",
        async: false,
        url: `${baseUrl}/api/DM_SuKienApi/CheckUnique?LinhVucID=${linhVucID}&MaDinhDanh=${maDinhDanh}`,
        contentType: 'application/json;charset=utf-8',
        dataType: 'json',
        success: function (data) {
            if (data.isSuccess) {
                result = data.value
            }
        },
        error: function (err) {
            console.log(err)
        }
    })

    return result;
}
//#endregion function validation
