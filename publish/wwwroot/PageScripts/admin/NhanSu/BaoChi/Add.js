const baseUrl = getRootLink();
const ckeditormoTaDichAdd = CKEDITOR.replace('moTaDichAdd');
const ckeditorghiChuDichAdd = CKEDITOR.replace('ghiChuDichAdd');

$(document).ready(function () {
    //#region Xử lý các function chung
    initDatePicker();
    initDanhMucChung_NoAll(1, "#danTocAdd", "")
    initDanhMucChung_NoAll(2, "#chucDanhAdd", "")
    initDanhMucChung_NoAll(5, "#gioiTinhAdd", "")
    initToChuc_NoAll(97, "#donViCongTacAdd", "", "")
    initNgonNgu("#ngonNguDichAdd")
    initNgonNgu("#ngonNguDichDiaDiemAdd")
    initNgonNgu("#ngonNguDPT")
    initTinhThanhPho()
    initSelect2();
    previewPicture();

    $('#tinhThanhPhoAdd').on('change', function () {
        let tinhID = $(this).val();
        initPhuongXa(tinhID)
    })
    //#endregion Xử lý các function chung

    //#region Xử lý lưu thông tin nhân sự báo chí - xuất bản
    $("#formNhanSuAdd").on("submit", function (e) {
        e.preventDefault(); // Ngăn chặn hành vi mặc định của form
        dataAdd();
    });

    $(document).on('change', '#ngonNguDichAdd', function() {
        let lang = $(this).val()
        let selectedValue = $("#maDinhDanhAdd").val()
        getDataWithApi('GET', `/api/CSDL_JsonApi/GetInfoByMaDinhDanh?maNgonNgu=${lang}&maDinhDanh=${selectedValue}`).then(data => {
            if (data && data.isSuccess && data.value.length > 0) {
                let item = data.value[0];
                if ($("#maDinhDanhAdd").val() != '') {
                    $("#hoVaTenAdd").val(item.hoTen || '').attr('disabled', true);
                    $("#diaChiAdd").val(item.diaChi || '').attr('disabled', true);
                    $("#noiLamViecAdd").val(item.noiLamViec || '').attr('disabled', true);
                    if (typeof ckeditormoTaDichAdd !== 'undefined') ckeditormoTaDichAdd.setData(item.moTa || '');
                    if (typeof ckeditorghiChuDichAdd !== 'undefined') ckeditorghiChuDichAdd.setData(item.ghiChu || '');
                } 
            } else {
                $("#hoVaTenAdd").val('').attr('disabled', false);
                $("#diaChiAdd").val('').attr('disabled', false);
                $("#noiLamViecAdd").val('').attr('disabled', false);
                if (typeof ckeditormoTaDichAdd !== 'undefined') ckeditormoTaDichAdd.setData('');
                if (typeof ckeditorghiChuDichAdd !== 'undefined') ckeditorghiChuDichAdd.setData('');
            }
        })
    });

    //Thêm mới nếu tìm kiếm không có
    initSelect2CaNhan("maDinhDanhSelect", 3); // 3: Báo chí - xuất bản
    var typingTimer; // Biến để lưu trữ setTimeout
    var doneTypingInterval = 2000; // Khoảng thời gian chờ sau khi dừng nhập (2 giây)
    $('#maDinhDanhSelect').on('select2:open', function (e) {
        var inputField = $('.select2-search__field');
        inputField.on('input', function () {
            clearTimeout(typingTimer);
            typingTimer = setTimeout(function () {
                // Kiểm tra xem có phần tử "Không có kết quả" hiển thị hay không
                var noResultsElement = $('.select2-results__message');
                if (noResultsElement.text() == 'Không có kết quả') {
                    noResultsElement.text("Bấm vào đây để tiến hành thêm mới")
                    $('.select2-results__message').addClass('cus-message click-message')
                    noResultsElement.on('click', function () {
                        $("#maDinhDanhAdd_Input").show();
                        $("#maDinhDanhAdd").val('');
                        $("#maDinhDanhAdd_Select").hide();
                        $('#maDinhDanhSelect').val(null).trigger('change');
                        $('.select2-search__field').off('input'); // Gỡ bỏ sự kiện input để tránh gọi lại
                        $('#maDinhDanhSelect').select2('close');
                        $('input[type="text"]').attr('disabled', false);
                        $('select:not("#maDinhDanhSelect")').attr('disabled', false);

                        //reset toàn bộ dữ liệu
                        $("#ngonNguDichAdd").val('vi').trigger('change');
                        $("#showAnhDaiDienAdd").attr('src', '/assets/images/vector/addImage.png');
                        $("#avatarSelect").val('')
                        $("#gioiTinhAdd").val('').trigger('change');
                        $("#ngaySinhAdd").val('');
                        $("#danTocAdd").val('').trigger('change');
                        $("#soDienThoaiAdd").val('');
                        $("#hopThuAdd").val('');    
                        $("#tinhThanhPhoAdd").val('').trigger('change');
                        $("#phuongXaAdd").val('').trigger('change');
                        //$("#donViCongTacAdd").val(null).trigger('change');
                        //$("#soTheAdd").val('');
                        //$("#ngayCapAdd").val('');
                        //$("#coQuanCapAdd").val('');
                        $("#thuTuAdd").val('');
                        $("input[name='trangThai'][value='1']").prop('checked', true);
                        $("#hoVaTenAdd").val('').attr('disabled', false);
                        $("#diaChiAdd").val('').attr('disabled', false);
                        $("#noiLamViecAdd").val('').attr('disabled', false);
                        if (typeof ckeditormoTaDichAdd !== 'undefined') ckeditormoTaDichAdd.setData('');
                        if (typeof ckeditorghiChuDichAdd !== 'undefined') ckeditorghiChuDichAdd.setData('');
                    });
                }
            }, doneTypingInterval);
        });
    })

    $('#maDinhDanhSelect').on('change', function (e) {
        console.log('Giá trị đã chọn:', $(this).val());
        var selectedValue = $(this).val();
        if (selectedValue) {
            getDataWithApi('GET', `/api/CSDL_JsonApi/GetInfoByMaDinhDanh?maNgonNgu=vi&maDinhDanh=${selectedValue}`).then(data => {
                if (data && data.isSuccess && data.value) {
                    console.log('Dữ liệu nhận được từ API:', data.value);
                    let item = data.value[0];
                    $("#maDinhDanhAdd").val(item.maDinhDanh || '').attr('disabled', item.maDinhDanh ? true : false);
                    $("#avatarSelect").val(item.anhChanDung).attr('disabled', item.anhChanDung ? true : false);
                    $("#showAnhDaiDienAdd").attr('src', item.anhChanDung || '/assets/images/vector/no-image.png');
                    $("#showAnhDaiDienDetail").val(item.anhChanDung || '').attr('disabled', item.anhChanDung ? true : false);
                    $("#gioiTinhAdd").val(item.gioiTinhID || '').attr('disabled', item.gioiTinhID ? true : false).trigger('change');
                    $("#ngaySinhAdd").val(formatDateWithoutTime(item.ngaySinh) || '').attr('disabled', item.ngaySinh ? true : false);
                    $("#danTocAdd").val(item.danTocID || '').attr('disabled', item.danTocID ? true : false).trigger('change');
                    $("#soDienThoaiAdd").val(item.dienThoai || '').attr('disabled', item.dienThoai ? true : false);
                    $("#hopThuAdd").val(item.hopThu || '').attr('disabled', item.hopThu ? true : false);
                    $("#tinhThanhPhoAdd").val(item.tinhID || '').attr('disabled', item.tinhID ? true : false).trigger('change');
                    setTimeout(() => {
                        $("#phuongXaAdd").val(item.xaID || '').attr('disabled', item.xaID ? true : false).trigger('change');
                    }, 300);
                    $("#soTheAdd").val(item.soThe || '').attr('disabled', item.soThe ? true : false);
                    $("#chucDanhAdd").val(item.chucDanhID || '').attr('disabled', item.chucDanhID ? true : false).trigger('change');
                    //$("#ngayCapAdd").val(formatDateWithoutTime(item.ngayCap) || '');
                    //$("#coQuanCapAdd").val(item.coQuanCap || '');
                    console.log('Đơn vị công tác ID:', item.listIDToChuc);
                    $("#donViCongTacAdd").val(item.listIDToChuc ? item.listIDToChuc.split(',').map(x => x.trim().toLowerCase()).filter(x => x !== '') : null).attr('disabled', item.listIDToChuc ? true : false).trigger('change');
                    $("#thuTuAdd").val(item.thuTu || '').attr('disabled', item.thuTu ? true : false);
                    if (item.trangThai) {
                        $("input[name='trangThai'][value='1']").prop('checked', true);
                    } else {
                        $("input[name='trangThai'][value='0']").prop('checked', true);
                    }
                    $("#ngonNguDichAdd").val(item.maNgonNgu || '')
                    $("#hoVaTenAdd").val(item.hoTen || '').attr('disabled', item.hoTen ? true : false);
                    $("#diaChiAdd").val(item.diaChi || '').attr('disabled', item.diaChi ? true : false);
                    $("#noiLamViecAdd").val(item.noiLamViec || '').attr('disabled', item.noiLamViec ? true : false);
                    if (typeof ckeditormoTaDichAdd !== 'undefined') ckeditormoTaDichAdd.setData(item.moTa || '');
                    if (typeof ckeditorghiChuDichAdd !== 'undefined') ckeditorghiChuDichAdd.setData(item.ghiChu || '');
                }
            })
        }
    })
    //#endregion Xử lý lưu thông tin nhân sự báo chí - xuất bản
})

//#region Function Xử lý chung
function initTinhThanhPho() {
    getDataWithApi('GET', '/api/CapTinhApi/Gets').then(data => {
        if (data && data.isSuccessed && data.resultObj) {
            $("#tinhThanhPhoAdd").empty().append(`<option value="">Chọn</option>`);
            data.resultObj.forEach(item => {
                const displayText = item.noiDung || item.tenTinh || 'Không rõ tên';
                $("#tinhThanhPhoAdd").append(`<option value="${item.tinhID}">${displayText}</option>`);
            });
        }
    })
}

function initPhuongXa(tinhID = null) {
    getDataWithApi('GET', `/api/CapXaApi/GetByMaTinh?MaNgonNgu=vi&MaTinh=${tinhID ? `${tinhID}` : ''}`).then(data => {
        $("#phuongXaAdd").empty().append(`<option value="">Chọn</option>`);
        if (data && data.isSuccess && data.value) {
            data.value.forEach(item => {
                const displayText = item.noiDung || item.tenXa || 'Không rõ tên';
                $("#phuongXaAdd").append(`<option value="${item.xaID}">${displayText}</option>`);
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
            $('#showAnhDaiDienAdd').attr('src', '/assets/images/vector/addImage.png');
        }
    });
}
//#endregion Function Xử lý chung

//#region Function Thông tin nhân sự báo chí - xuất bản
function dataAdd() {
    const fileAnhDaiDien = $("#fileAnhDaiDienPrev")[0].files[0] || null;
    const avatarSelect = $("#avatarSelect").val()
    const maDinhDanh = $("#maDinhDanhAdd").val();
    const gioiTinh = $("#gioiTinhAdd").val();
    const ngaySinh = $("#ngaySinhAdd").val();
    const danToc = $("#danTocAdd").val();
    const soDienThoai = $("#soDienThoaiAdd").val();
    const hopThu = $("#hopThuAdd").val();
    const tinhThanhPho = $("#tinhThanhPhoAdd").val();
    const phuongXa = $("#phuongXaAdd").val();
    const donViCongTac = $("#donViCongTacAdd").val() ? $("#donViCongTacAdd").val().join(',') : '';
    //const soThe = $("#soTheAdd").val();
    //const ngayCap = $("#ngayCapAdd").val();
    //const coQuanCap = $("#coQuanCapAdd").val();
    const thuTu = $("#thuTuAdd").val();
    const trangThai = $("input[name='trangThai']:checked").val() == 1 ? true : false;
    const chucDanh = $("#chucDanhAdd").val();
    const soThe = $("#soTheAdd").val();

    // Đa ngữ
    const ngonNguDich = $("#ngonNguDichAdd").val();
    const hoVaTen = $("#hoVaTenAdd").val();
    const diaChi = $("#diaChiAdd").val();
    const noiLamViec = $("#noiLamViecAdd").val();
    const moTa = ckeditormoTaDichAdd.getData();
    const ghiChu = ckeditorghiChuDichAdd.getData();

    // Kết quả trả về dạng object
    const dtChung = {
        MaDinhDanh: maDinhDanh,
        gioiTinh: gioiTinh,
        NgaySinh: formatDateToSaveAsString(ngaySinh),
        DanTocID: danToc,
        DienThoai: soDienThoai,
        HopThu: hopThu,
        TinhID: tinhThanhPho,
        XaID: phuongXa,
        ToChucID: donViCongTac,
        ChucDanhID: chucDanh,
        SoThe: soThe,
        //ngayCap,
        //coQuanCap,
        //thuTu,
        TrangThai: trangThai,
        MaNgonNgu: ngonNguDich,
        HoTen: hoVaTen,
        DiaChi: diaChi,
        NoiLamViec: noiLamViec,
        MoTa: moTa,
        GhiChu: ghiChu,
        ThuTu: thuTu,
        AnhChanDung: avatarSelect
    };

    let formData = new FormData()
    formData.append('RequestCaNhanBaoChi', JSON.stringify(dtChung))
    formData.append("File", fileAnhDaiDien)

    if (fileAnhDaiDien == null && avatarSelect == '') {
        showNotification(0, "Vui lòng chọn ảnh đại diện")
    }
    else if (checkEmptyBlank(maDinhDanh)) {
        showNotification(0, "Vui lòng nhập mã định danh (CCCD/Hộ chiếu)")
    }
    else if (checkTagHtmlSingle(maDinhDanh)) {
        showNotification(0, "Mã định danh (CCCD/Hộ chiếu) chứa ký tự không hợp lệ")
    }
    else if (checkUniqueIdentifier(maDinhDanh.trim()) > 0 && (maDinhDanhSelect == '' || !maDinhDanhSelect)) {
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
    else if (soThe != null && soThe != '' && checkUniqueCardNumber(soThe.trim()) > 0) {
        showNotification(0, "Số thẻ đã tồn tại")
    }
    else if (checkEmptyBlank(chucDanh)) {
        showNotification(0, "Vui lòng chọn chức danh")
    }
    else if (isValidPositiveIntegerAllowEmpty(thuTu)) {
        showNotification(0, "Thứ tự không hợp lệ")
    }
    else if (checkEmptyBlank(hoVaTen)) {
        showNotification(0, "Vui lòng nhập họ và tên nhân sự báo chi-xuất bản")
    }
    else if (checkTagHtmlSingle(hoVaTen)) {
        showNotification(0, "Họ và tên nhân sự báo chí-xuất bản chứa ký tự không hợp lệ")
    }
    else if (checkTagHtmlSingle(diaChi)) {
        showNotification(0, "Địa chỉ chứa ký tự không hợp lệ")
    }
    else if (checkTagHtmlSingle(noiLamViec)) {
        showNotification(0, "Nơi làm việc chứa ký tự không hợp lệ")
    }
    else {
        $.ajax({
            type: 'POST',
            url: `${baseUrl}/api/DM_CaNhan_BaoChiApi/Add`,
            async: false,
            contentType: false,
            processData: false,
            data: formData,
            success: function (data) {
                if (data.isSuccess && data.value) {
                    showNotification(1, "Thêm mới nhân sự báo chí - xuất bản thành công");
                    console.log(data)
                    setTimeout(() => {
                        window.location.href = `${baseUrl}/AdminTool/NhanSu/BaoChi`;
                    }, 1500);
                } else {
                    showNotification(0, "Thêm mới nhân sự báo chí - xuất bản không thành công");
                    console.log(data.error)
                }
            },
            error: function (err) {
                console.log(err)
            }
        })
    }
  

    console.log('Dữ liệu nhân sự báo chí - xuất bản:', dtChung);
}
//#endregion Function Thông tin nhân sự báo chí - xuất bản

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

const checkUniqueIdentifier = (maDinhDanh) => {
    let result = 0

    $.ajax({
        type: "GET",
        async: false,
        url: `${baseUrl}/api/CSDL_JsonApi/CheckUnique?MaDinhDanh=${maDinhDanh}`,
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

const checkUniqueCardNumber = (soThe) => {
    let result = 0

    $.ajax({
        type: "GET",
        async: false,
        url: `${baseUrl}/api/DM_CaNhan_BaoChiApi/CheckUnique?SoThe=${soThe.trim()}`,
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
