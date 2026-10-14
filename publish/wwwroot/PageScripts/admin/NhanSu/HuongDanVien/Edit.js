const baseUrl = getRootLink();
const ckeditormoTaDichEdit = CKEDITOR.replace('moTaDichEdit');
const ckeditorghiChuDichEdit = CKEDITOR.replace('ghiChuDichEdit');

console.log(NhanSuId)

$(document).ready(function () {
    //#region Xử lý các function chung
    initDatePicker();
    initDanhMucChung_NoAll(1, "#danTocEdit", "")
    initDanhMucChung_NoAll(5, "#gioiTinhEdit", "")
    initDanhMucChung_NoAll(12, "#loaiTheNhanSu", "")
    initToChuc_NoAll(170, "#coQuanCapNhanSu", "", "")
    initToChuc_NoAll(310, "#donViCongTacEdit", "", "")
    initNgonNgu("#ngonNguDichEdit")
    initNgonNgu("#ngonNguDichDiaDiemEdit")
    initNgonNgu("#ngonNguDPT")
    initTinhThanhPho()
    initSelect2();
    previewPicture();

    $('#tinhThanhPhoEdit').on('change', function () {
        let tinhID = $(this).val();
        initPhuongXa(tinhID)
    })
    //#endregion Xử lý các function chung

    //#region Xử lý lưu thông tin hướng dẫn viên
    setTimeout(() => {
        loadData(NhanSuId)
    }, 300);

    $("#formNhanSuEdit").on("submit", function (e) {
        e.preventDefault(); // Ngăn chặn hành vi mặc định của form
        dataEdit();
    });

    // Khi thay đổi Ngôn ngữ, reset các input trong phần đa ngữ
    $(document).on('change', '#ngonNguDichEdit', function () {
        let maNgonNgu = $(this).val();
        
        if (NhanSuId && maNgonNgu) {
            console.log('Chuyển Ngôn ngữ cho lễ hội hiện tại:', maNgonNgu);
            // Load bản dịch cho ngôn ngữ được chọn
            loadTranslation(NhanSuId, maNgonNgu);
        } else {
            // Nếu chưa có cơ quan (tạo mới) hoặc chưa chọn ngôn ngữ, clear các trường dịch
            if (!NhanSuId || !maNgonNgu) {
                $("#ngonNguDichEdit").val('');
                $("#hoVaTenEdit").val('');
                $("#diaChiEdit").val('');
                $("#noiLamViecEdit").val('');
                if (typeof ckeditormoTaDichEdit !== 'undefined') ckeditormoTaDichEdit.setData('');
                if (typeof ckeditorghiChuDichEdit !== 'undefined') ckeditorghiChuDichEdit.setData('');
            }
        }
    });
    //#endregion Xử lý lưu thông tin hướng dẫn viên
})

//#region Function Xử lý chung
function initTinhThanhPho() {
    getDataWithApi('GET', '/api/CapTinhApi/Gets').then(data => {
        if (data && data.isSuccessed && data.resultObj) {
            $("#tinhThanhPhoEdit").empty().append(`<option value="">Chọn</option>`);
            data.resultObj.forEach(item => {
                const displayText = item.noiDung || item.tenTinh || 'Không rõ tên';
                $("#tinhThanhPhoEdit").append(`<option value="${item.tinhID}">${displayText}</option>`);
            });
        }
    })
}

function initPhuongXa(tinhID = null) {
    getDataWithApi('GET', `/api/CapXaApi/GetByMaTinh?MaNgonNgu=vi&MaTinh=${tinhID ? `${tinhID}` : ''}`).then(data => {
        $("#phuongXaEdit").empty().append(`<option value="">Chọn</option>`);
        if (data && data.isSuccess && data.value) {
            data.value.forEach(item => {
                const displayText = item.noiDung || item.tenXa || 'Không rõ tên';
                $("#phuongXaEdit").append(`<option value="${item.xaID}">${displayText}</option>`);
            });
        }
    })
}

function previewPicture() {
    // Xử lý preview ảnh bìa
    $('.group_image_input #fileAnhDaiDienPrev').on('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                $('#showAnhDaiDienAdd').attr('src', ev.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            $('#showAnhDaiDienAdd').attr('src', '/assets/images/vector/AddImage.png');
        }
    });
}
//#endregion Function Xử lý chung

//#region Function Thông tin hướng dẫn viên
function loadData(id) {
    getDataWithApi('GET', `/api/DM_CaNhan_HuongDanVienApi/Get?CaNhanID=${id}&maNgonNgu=vi`).then(data => {
        if (data && data.isSuccess && data.value) {
            const item = data.value;
                        console.log('Dữ liệu hướng dẫn viên:', item);
            $("#maDinhDanhEdit").val(item.maDinhDanh || '');
            $("#showAnhDaiDienAdd").attr('src', item.anhChanDung || '/assets/images/vector/Addimage.png');
            $("#showAnhDaiDienDetail").val(item.anhChanDung || '');
            $("#gioiTinhEdit").val(item.gioiTinhID || '').trigger('change');
            $("#ngaySinhEdit").val(formatDateWithoutTime(item.ngaySinh) || '');
            $("#danTocEdit").val(item.danTocID || '').trigger('change');
            $("#soDienThoaiEdit").val(item.dienThoai || '');
            $("#hopThuEdit").val(item.hopThu || '');
            $("#tinhThanhPhoEdit").val(item.tinhID || '').trigger('change');
            setTimeout(() => {
                $("#phuongXaEdit").val(item.xaID || '').trigger('change');
            }, 300);
            $("#loaiTheNhanSu").val(item.loaiTheID || '').trigger('change');
            $("#soTheNhanSu").val(item.soThe || '');
            $("#ngayCapTheEdit").val(formatDateWithoutTime(item.ngayCap) || '');
            $("#coQuanCapEdit").val(item.noiCapID || '');
            $("#thuTuEdit").val(item.thuTu || '');
            $("#ngayHetHanTheEdit").val(formatDateWithoutTime(item.ngayHetHan) || '');
            $("#namKinhNghiemEdit").val(item.namKinhNghiem || '');
            $("#donViCongTacEdit").val(item.toChucID ? item.toChucID.split(',').map(x => x.trim().toLowerCase()).filter(x => x !== '') : null).trigger('change');
            if (item.trangThai) {
                $("input[name='trangThai'][value='1']").prop('checked', true);
            } else {
                $("input[name='trangThai'][value='0']").prop('checked', true);
            }
            $("#ngonNguDichEdit").val(item.maNgonNgu || '').trigger('change');
            $("#hoVaTenEdit").val(item.hoTen || '');
            $("#diaChiEdit").val(item.diaChi || '');
            $("#noiLamViecEdit").val(item.noiLamViec || '');
            if (typeof ckeditormoTaDichEdit !== 'undefined') ckeditormoTaDichEdit.setData(item.moTa || '');
            if (typeof ckeditorghiChuDichEdit !== 'undefined') ckeditorghiChuDichEdit.setData(item.ghiChu || '');
        }
    })
}

function dataEdit() {
    const fileAnhDaiDien = $("#fileAnhDaiDienPrev")[0].files[0] || null;
    const maDinhDanh = $("#maDinhDanhEdit").val();
    const gioiTinh = $("#gioiTinhEdit").val();
    const ngaySinh = $("#ngaySinhEdit").val();
    const danToc = $("#danTocEdit").val();
    const soDienThoai = $("#soDienThoaiEdit").val();
    const hopThu = $("#hopThuEdit").val();
    const tinhThanhPho = $("#tinhThanhPhoEdit").val();
    const phuongXa = $("#phuongXaEdit").val();
    const loaiTheNhanSu = $("#loaiTheNhanSu").val();
    const soThe = $("#soTheNhanSu").val();
    const coQuanCap = $("#coQuanCapEdit").val();
    const thuTu = $("#thuTuEdit").val();
    const ngayCap = $("#ngayCapTheEdit").val();
    const ngayHetHan = $("#ngayHetHanTheEdit").val();
    const namKinhNghiem = $("#namKinhNghiemEdit").val();
    const donViCongTac = $("#donViCongTacEdit").val().map(item => item).join(',');
    const anhChanDungDetail = $("#showAnhDaiDienDetail").val() || '';
    const trangThai = $("input[name='trangThai']:checked").val() == 1 ? true : false;

    // Đa ngữ
    const ngonNguDich = $("#ngonNguDichEdit").val();
    const hoVaTen = $("#hoVaTenEdit").val();
    const diaChi = $("#diaChiEdit").val();
    const noiLamViec = $("#noiLamViecEdit").val();
    const moTa = ckeditormoTaDichEdit.getData();
    const ghiChu = ckeditorghiChuDichEdit.getData();

    // Kết quả trả về dạng object
    const dtChung = {
        MaDinhDanh: maDinhDanh,
        gioiTinhID: gioiTinh,
        NgaySinh: ngaySinh ? formatDateToSaveAsString(ngaySinh) : null,
        DanTocID: danToc,
        DienThoai: soDienThoai,
        HopThu: hopThu,
        TinhID: tinhThanhPho,
        XaID: phuongXa,
        LoaiTheID: loaiTheNhanSu,
        SoThe: soThe,
        ToChucID: donViCongTac,
        NoiCapID: coQuanCap,
        ThuTu: thuTu,
        NgayHetHan: ngayHetHan ? formatDateToSaveAsString(ngayHetHan) : null,
        NgayCap: ngayCap ? formatDateToSaveAsString(ngayCap) : null,
        NamKinhNghiem: namKinhNghiem,
        anhChanDungDetail: anhChanDungDetail,
        CaNhanID: NhanSuId,
        TrangThai: trangThai,
        MaNgonNgu: ngonNguDich,
        HoTen: hoVaTen,
        DiaChi: diaChi,
        NoiLamViec: noiLamViec,
        MoTa: moTa,
        GhiChu: ghiChu
    };


    let formData = new FormData()
    formData.append('RequestHuongDanVien', JSON.stringify(dtChung))
    formData.append("File", fileAnhDaiDien)
    if (fileAnhDaiDien == null && anhChanDungDetail == null) {
        showNotification(0, "Vui lòng chọn ảnh đại diện")
    }
    else if (checkEmptyBlank(maDinhDanh)) {
        showNotification(0, "Vui lòng nhập mã định danh (CCCD/Hộ chiếu)")
    }
    else if (checkTagHtmlSingle(maDinhDanh)) {
        showNotification(0, "Mã định danh (CCCD/Hộ chiếu) chứa ký tự không hợp lệ")
    }
    else if (checkUniqueIdentifier(maDinhDanh, NhanSuId) > 0) {
        showNotification(0, "Mã định danh (CCCD/Hộ chiếu) đã tồn tại")
    }
    else if (checkEmptyBlank(gioiTinh)) {
        showNotification(0, "Vui lòng chọn giới tính")
    }
    else if (isFutureDate(ngaySinh)) {
        showNotification(0, "Ngày sinh không hợp lệ")
    }
    else if (checkTagHtmlSingle(soDienThoai)) {
        showNotification(0, "Số điện thoại chứa ký tự không hợp lệ")
    }
    else if (isValidPhoneNumber(soDienThoai)) {
        showNotification(0, "Số điện thoại không hợp lệ")
    }
    else if (checkTagHtmlSingle(hopThu)) {
        showNotification(0, "Hộp thư chứa ký tự không hợp lệ")
    }
    else if (isValidEmailAllowEmpty(hopThu)) {
        showNotification(0, "Hộp thư không hợp lệ")
    }
    else if (checkEmptyBlank(tinhThanhPho)) {
        showNotification(0, "Vui lòng chọn Tỉnh/Thành phố")
    }
    else if (checkEmptyBlank(phuongXa)) {
        showNotification(0, "Vui lòng chọn Phường/Xã/Đặc khu")
    }
    else if (checkTagHtmlSingle(soThe)) {
        showNotification(0, "Số thẻ chứa ký tự không hợp lệ")
    }
    else if (soThe != null && soThe != '' && checkUniqueCardNumber(soThe, NhanSuId) > 0) {
        showNotification(0, "Số thẻ đã tồn tại")
    }
    else if (isValidDateRange(ngayCap, ngayHetHan)) {
        showNotification(0, "Ngày hết hạn thẻ phải lơn hơn ngày cấp")
    }
    else if (isValidPositiveIntegerAllowEmpty(namKinhNghiem) || Number(namKinhNghiem) > 126) {
        showNotification(0, "Năm kinh nghiệm không hợp lệ")
    }
    else if (isValidPositiveIntegerAllowEmpty(thuTu) || Number(thuTu) > 2147483647) {
        showNotification(0, "Thứ tự không hợp lệ")
    }
    else if (checkEmptyBlank(hoVaTen)) {
        showNotification(0, "Vui lòng nhập họ và tên hướng dẫn viên")
    }
    else if (checkTagHtmlSingle(hoVaTen)) {
        showNotification(0, "Họ và tên hướng dẫn viên chứa ký tự không hợp lệ")
    }
    else if (checkTagHtmlSingle(diaChi)) {
        showNotification(0, "Địa chỉ chứa ký tự không hợp lệ")
    }
    else if (checkTagHtmlSingle(noiLamViec)) {
        showNotification(0, "Nơi làm việc chứa ký tự không hợp lệ")
    }
    else {
        $.ajax({
            type: 'PUT',
            url: `${baseUrl}/api/DM_CaNhan_HuongDanVienApi/Update`,
            async: false,
            contentType: false,
            processData: false,
            data: formData,
            success: function (data) {
                if (data.isSuccess && data.value) {
                    showNotification(1, "Chỉnh sửa hướng dẫn viên thành công");
                    console.log(data)
                    setTimeout(() => {
                        window.location.href = `${baseUrl}/AdminTool/NhanSu/HuongDanVien`;
                    }, 1500);
                } else {
                    showNotification(0, "Chỉnh sửa hướng dẫn viên không thành công");
                    console.log(data.error)
                }
            },
            error: function (err) {
                console.log(err)
            }
        })
    }
    

    console.log('Dữ liệu hướng dẫn viên:', dtChung);
}

function loadTranslation(nhanSuId, maNgonNgu) {
    getDataWithApi('GET', `/api/DM_CaNhan_HuongDanVienApi/Get?CaNhanID=${nhanSuId}&maNgonNgu=${maNgonNgu}`).then(data => {
        console.log(data, "Load bản dịch hướng dẫn viên")
        $("#ngonNguDichEdit").val(maNgonNgu).trigger("change.select2");
        if (data && data.isSuccess && data.value) {
            translations = data.value;
            // Populate các trường dịch với dữ liệu đa ngữ
            $("#hoVaTenEdit").val(translations.hoTen || '');
            $("#diaChiEdit").val(translations.diaChi || '');
            $("#noiLamViecEdit").val(translations.noiLamViec || '');
            if (typeof ckeditormoTaDichEdit !== 'undefined') ckeditormoTaDichEdit.setData(translations.moTa || '');
            if (typeof ckeditorghiChuDichEdit !== 'undefined') ckeditorghiChuDichEdit.setData(translations.ghiChu || '');
        } else {
            // Nếu không có bản dịch, clear các trường dịch
            $("#hoVaTenEdit").val('');
            $("#diaChiEdit").val('');
            $("#noiLamViecEdit").val('');
            if (typeof ckeditormoTaDichEdit !== 'undefined') ckeditormoTaDichEdit.setData('');
            if (typeof ckeditorghiChuDichEdit !== 'undefined') ckeditorghiChuDichEdit.setData('');
        }
    })
}
//#endregion Function Thông tin hướng dẫn viên

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

const isValidDateRange = (ngayCap, ngayHetHan) => {
    // Nếu thiếu 1 trong 2 → không lỗi
    if (!ngayCap || !ngayHetHan) return false;

    const start = new Date(formatDateToSaveAsString(ngayCap));
    const end = new Date(formatDateToSaveAsString(ngayHetHan));

    // Nếu ngày không hợp lệ
    if (isNaN(start) || isNaN(end)) return true;

    return end < start;
};

const checkUniqueIdentifier = (maDinhDanh, caNhanID) => {
    let result = 0

    $.ajax({
        type: "GET",
        async: false,
        url: `${baseUrl}/api/CSDL_JsonApi/CheckUnique?MaDinhDanh=${maDinhDanh}&CaNhanID=${caNhanID}`,
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

    return result
}

const checkUniqueCardNumber = (soThe, caNhanID) => {
    let result = 0

    $.ajax({
        type: 'GET',
        async: false,
        url: `${baseUrl}/api/DM_CaNhan_HuongDanVienApi/CheckUnique?SoThe=${soThe}&CaNhanID=${caNhanID}`,
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

    return result
}
const isFutureDate = (dateStr) => {
    // dateStr dạng dd/MM/yyyy

    if (!dateStr || dateStr.trim() === "") return false;

    const [day, month, year] = dateStr.split("/").map(Number);

    const inputDate = new Date(year, month - 1, day); // JS: month = 0–11
    const today = new Date();

    // reset today to 00:00:00 để so sánh chính xác theo ngày
    today.setHours(0, 0, 0, 0);

    return inputDate > today;
}

const isValidPhoneNumber = (value) => {
    const regex = /^$|^\d{10,11}$/;
    return !regex.test(value);
}
//#endregion function validation
