const baseUrl = getRootLink();
const ckeditorMoTaAdd = CKEDITOR.replace('moTaAdd');
let translations = [];

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
    //endregion Xử lý các function chung


    //#region Xử lý thông tin sự kiện
    setTimeout(() => {
        loadData(SuKienId)
    }, 100);

    // Khi thay đổi Ngôn ngữ, reset các input trong phần đa ngữ
    $(document).on('select2:select', '#ngonNguDichAdd', function (e) {
        let maNgonNgu = e.params.data.id;
        console.log("Chọn:", maNgonNgu);
        
        if (SuKienId && maNgonNgu) {
            console.log('Chuyển Ngôn ngữ cho sự kiện hiện tại:', maNgonNgu);
            // Load bản dịch cho ngôn ngữ được chọn
            loadTranslation(SuKienId, maNgonNgu);
        } else {
            // Nếu chưa có cơ quan (tạo mới) hoặc chưa chọn ngôn ngữ, clear các trường dịch
            if (!SuKienId || !maNgonNgu) {
                $("#tenSuKienDichAdd").val('');
                $("#ketQuaAdd").val('');
                if (typeof ckeditorMoTaAdd !== 'undefined') ckeditorMoTaAdd.setData('');
            }
        }
    });

    $("#btnSaveAdd").on("click", function () {
        dataAdd()
    })
    //endregion Xử lý thông tin sự kiện

    //Btn-back
    $("#btnBackLocation").on('click', function () {
        window.location.href = `/AdminTool/SuKienTheThao/SuKien`
    })
});

//#region Function Xử lý thông tin sự kiện
function loadData(SuKienId) {
    getDataWithApi('GET', `/api/DM_SuKienApi/Get?MaNgonNgu=vi&SuKienID=${SuKienId}`).then(data => {
        console.log(data, "dataaSuKien")
        if (data && data.isSuccess && data.value) {
            let suKien = data.value;
            $("#maSuKien").val(suKien.maDinhDanh);
            $("#loaiDoiTuong").val(suKien.capDoID).trigger('change');
            $("#trangThaiSuKien").val(suKien.trangThaiID).trigger('change');
            $("#ngayBatDauAdd").val(formatDateWithoutTime(suKien.batDau));
            $("#ngayKetThucAdd").val(formatDateWithoutTime(suKien.ketThuc));
            $("#thuTu").val(suKien.thuTu);
            $("input[name='trangThai'][value='" + (suKien.trangThai ? 1 : 0) + "']").prop("checked", true);
            if (suKien.anhDaiDien) {
                $("#showAnhDaiDienAdd").attr("src", suKien.anhDaiDien);
                $("#showAnhDaiDienDetail").val(suKien.anhDaiDien);
            }
            if (suKien.listIDDiaDiem) {
                console.log(suKien.listIDDiaDiem, "Danh sách địa điểm đã chọn")
                let listDiaDiem = suKien.listIDDiaDiem.split(',').map(x => x.trim().toLowerCase());
                $("#DiaDiemCoSanAdd").val(listDiaDiem.map(item => item)).trigger('change');
                initTableDiaDiem(listDiaDiem.map(item => item).join(','));
            }
            //Đa ngữ
            $("#tenSuKienDichAdd").val(suKien.tenSuKien);
            $("#ketQuaAdd").val(suKien.ketQua);
            if (typeof ckeditorMoTaAdd !== 'undefined') ckeditorMoTaAdd.setData(suKien.moTa || '');
            initDaPhuongTienTable(suKien.suKienID);
        }
    })

}

function dataAdd() { 
    //Thông tin chung
    const IDSuKien = SuKienId;
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
    const AnhDaiDienDetail =  $("#showAnhDaiDienDetail").val();
    const AnhDaiDien = $("#fileAnhDaiDienPrev")[0].files[0] || null;

    console.log(AnhDaiDien, "anhDaiDien")

    let dtChung = {
        suKienID: IDSuKien,
        TenSuKien: TenSuKien,
        MaDinhDanh: MaSuKien,
        CapDoID: CapDoID,
        BatDau: NgayBatDau,
        KetThuc: NgayKetThuc,
        TrangThaiID: TrangThaiSuKien,
        ThuTu: ThuTu,
        AnhDaiDienDetail: AnhDaiDienDetail,
        TrangThai: TrangThai == 1 ? true : false,
        ListID: $("#DiaDiemCoSanAdd").val().map(item => item).join(','),
        LinhVucID: 235,

        //Nội dung đa ngữ
        MaNgonNgu: MaNgonNgu,
        KetQua: KetQua,
        MoTa: MoTa,
    }

    console.log(dtChung)

    let formData = new FormData()
    formData.append('EntitySuKien', JSON.stringify(dtChung))
    formData.append("File", AnhDaiDien)

    if (AnhDaiDien == null && AnhDaiDienDetail == null) {
        showNotification(0, "Vui lòng chọn ảnh đại diện")
    }
    else if (checkTagHtmlSingle(MaSuKien)) {
        showNotification(0, "Mã sự kiện chứa ký tự không hợp lệ")
    }
    else if (checkUnique(235, MaSuKien, IDSuKien) > 0) {
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
    else if (isValidPositiveIntegerAllowEmpty(ThuTu)) {
        showNotification(0, "Thứ tự không hợp lệ")
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
    else {
        $.ajax({
            type: 'PUT',
            url: `${baseUrl}/api/DM_SuKienApi/Update`,
            async: false,
            contentType: false,
            processData: false,
            data: formData,
            success: function (data) {
                if (data.isSuccess && data.value) {
                    showNotification(1, "Chỉnh sửa sự kiện thành công");
                    setTimeout(() => {
                        window.location.href = `${baseUrl}/AdminTool/SuKienTheThao/SuKien`;
                    }, 1500);
                } else {
                    showNotification(0, "Chỉnh sửa sự kiện không thành công");
                    console.log(data.error)
                }
            },
            error: function (err) {
                console.log(err)
            }
        })
    }

    
}

function loadTranslation(toChucID, maNgonNgu) {
    getDataWithApi('GET', `/api/DM_SuKienApi/Get?SuKienID=${toChucID}&MaNgonNgu=${maNgonNgu}`).then(data => {
        console.log(data, "Load bản dịch sự kiện")
        $("#ngonNguDichAdd").val(maNgonNgu).trigger("change.select2");
        if (data && data.isSuccess && data.value) {
            translations = data.value;
            // Populate các trường dịch với dữ liệu đa ngữ
            $("#tenSuKienDichAdd").val(translations.tenSuKien);
            $("#ketQuaAdd").val(translations.ketQua);
            if (typeof ckeditorMoTaAdd !== 'undefined') ckeditorMoTaAdd.setData(translations.moTa || '');
        } else {
            // Nếu không có bản dịch, clear các trường dịch
            $("#tenSuKienDichAdd").val('');
            $("#ketQuaAdd").val('');
            if (typeof ckeditorMoTaAdd !== 'undefined') ckeditorMoTaAdd.setData('');
        }
    })
}
//endregion Function Xử lý thông tin sự kiện

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

/* const isValidPositiveIntegerAllowEmpty = (value) => {
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
}; */
const checkUnique = (linhVucID, maDinhDanh, suKienID) => {
    console.log(linhVucID, maDinhDanh, suKienID)
    let result = 0
    $.ajax({
        type: "GET",
        async: false,
        url: `${baseUrl}/api/DM_SuKienApi/CheckUnique?LinhVucID=${linhVucID}&MaDinhDanh=${maDinhDanh}&SuKienID=${suKienID}`,
        contentType: 'application/json;charset=utf-8',
        dataType: 'json',
        success: function (data) {
            console.log(data)
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