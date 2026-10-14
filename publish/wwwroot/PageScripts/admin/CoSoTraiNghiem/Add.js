const baseUrl = getRootLink();
const ckeditormoTaCoSo = CKEDITOR.replace('moTaCoSoAdd');
const ckeditortraiNghiemCoSo = CKEDITOR.replace('traiNghiemCoSoAdd');
const ckeditorgoiYCoSo = CKEDITOR.replace('goiYCoSoAdd');

$(document).ready(function () {
    
    const DanhMucID = Number(danhMucID)
    initDatePicker();
    initNgonNgu("#ngonNguDichCoSoAdd")
    previewPicture()
    previewPictureSuKien()
    initSelect2();

    //flatpickr("#gioDongCua", {
    //    enableTime: true,
    //    noCalendar: true,
    //    dateFormat: "h:i K", // AM/PM
    //    time_24hr: false
    //});

    //flatpickr("#gioMoCua", {
    //    enableTime: true,
    //    noCalendar: true,
    //    dateFormat: "h:i K", // AM/PM
    //    time_24hr: false
    //});

    // Event handler cho thay đổi Ngôn ngữ
    $(document).on('change', '#ngonNguDichCoSoAdd', function() {
        $('#tenCoSoAdd').val('');
        $('#moTaCoSoAdd').val('');
        $('#nguoiDaiDienCoSoAdd').val('');
        $('#diaChiCoSoAdd').val('');
        $('#traiNghiemCoSoAdd').val('');
        $('#goiYCoSoAdd').val('');
    });

    $("#btnCancel").on("click", function () {
        window.location.href = `${baseUrl}/AdminTool/CoSoTraiNghiem/${typeName}`;
    })

    $("#btnSaveAdd").on("click", function () {
        dataAddCoSoTraiNghiem(DanhMucID);
    })

    if (DanhMucID == 193) {
        let title = "Thêm mới cơ sở kinh doanh dịch vụ - thể thao";
        $(".TieuDe h2").text(title);
        document.title = title;
        $("label[for='tenCoSoAdd']").html(`Tên cơ sở kinh doanh dịch vụ - thể thao <span class="text-danger">*</span>`)
        $("#tenCoSoAdd").attr("placeholder", "Nhập tên cơ sở kinh doanh dịch vụ - thể thao")
    } else if (DanhMucID == 194) {
        let title = "Thêm mới cơ sở chăm sóc sức khỏe";
        $(".TieuDe h2").text(title);
        document.title = title;
        $("label[for='tenCoSoAdd']").html(`Tên cơ sở chăm sóc sức khỏe <span class="text-danger">*</span>`)
        $("#tenCoSoAdd").attr("placeholder", "Nhập tên cơ sở chăm sóc sức khỏe")
    } else if (DanhMucID == 196) {
        let title = "Thêm mới cơ sở vui chơi giải trí";
        $(".TieuDe h2").text(title);
        document.title = title;
        $("label[for='tenCoSoAdd']").html(`Tên cơ sở vui chơi giải trí <span class="text-danger">*</span>`)
        $("#tenCoSoAdd").attr("placeholder", "Nhập tên cơ sở vui chơi giải trí")
    } else if (DanhMucID == 191) {
        let title = "Thêm mới cơ sở mua sắm";
        $(".TieuDe h2").text(title);
        document.title = title;
        $("label[for='tenCoSoAdd']").html(`Tên cơ sở mua sắm <span class="text-danger">*</span>`)
        $("#tenCoSoAdd").attr("placeholder", "Nhập tên cơ sở mua sắm")
    }
});

//#region Xử lý thông tin chung
function dataAddCoSoTraiNghiem(DanhMucID) {
    // Thông tin chung
    const diaDiemID = $("#DiaDiemCoSanAdd").val();
    const dienThoai = $("#dienThoaiCoSoAdd").val();
    const hopThu = $("#hopThuCoSoAdd").val();
    const lienKet = $("#lienKetCoSoAdd").val();
    const trangThai = $("input[name='trangThaiCoSoAdd']:checked").val() == 1 ? true : false;
    const coBanVe = $("input[name='banVeAdd']:checked").val() == 1 ? true : false;
    const gioMoCua = $("#gioMoCua").val()
    const gioDongCua = $("#gioDongCua").val()
    let ngayNghiHangTuanOption = $("#ngayNghiHangTuan").val()
    let ngayNghiHangTuan = null
    if (ngayNghiHangTuanOption.length > 0) {
        ngayNghiHangTuan = ngayNghiHangTuanOption.join("-")
    }


    console.log(gioDongCua, gioMoCua)

    return

    // Đa ngữ
    const maNgonNgu = $("#ngonNguDichCoSoAdd").val();
    const tenCoSo = $("#tenCoSoAdd").val();
    const moTa = ckeditormoTaCoSo.getData();
    const diaChi = $("#diaChiCoSoAdd").val();
    const traiNghiem = ckeditortraiNghiemCoSo.getData();
    const goiY = ckeditorgoiYCoSo.getData();
    const fileAnhDaiDien = $("#fileAnhDaiDienPrev")[0].files[0] || null;

    // Tài liệu truyền thông
    const requestDaPhuongTien = createRequestDaPhuongTiens();

    // Văn bản tài liệu
    const requestVBTL = createRequestVBTLCoSo();

    const dtCoSo = {
        DiaDiemID: diaDiemID || null,
        LoaiHinhCoSoID: DanhMucID,
        CoBanVe: coBanVe,
        GioMoCua: gioMoCua,
        GioDongCua: gioDongCua,
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
        NgayNghiHangTuan: ngayNghiHangTuan
    };

    let formData = new FormData();
    formData.append('RequestCoSo', JSON.stringify(dtCoSo));
    formData.append('File', fileAnhDaiDien)
    //formData.append('RequestVBTL', requestInfo.RequestVBTL);

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
    else if (isOpenTimeValid(gioMoCua, gioDongCua)) {
        showNotification(0, "Giờ đóng cửa không hợp lệ")
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
    else if (checkEmptyBlank(tenCoSo)) {
        switch (Number(DanhMucID)) {
            case 193: {
                showNotification(0, "Vui lòng nhập tên cơ sở kinh doanh dịch vụ - thể thao")
                break;
            }
            case 194: {
                showNotification(0, "Vui lòng nhập tên cơ sở chăm sóc sức khỏe")
                break;
            }
            case 196: {
                showNotification(0, "Vui lòng nhập tên cơ sở vui chơi giải trí")
                break;
            }
            case 191: {
                showNotification(0, "Vui lòng nhập tên cơ sở mua sắm")
                break;
            }
        }
    }
    else if (checkTagHtmlSingle(tenCoSo)) {
        switch (Number(DanhMucID)) {
            case 193: {
                showNotification(0, "Tên cơ sở kinh doanh dịch vụ - thể thao chứa ký tự không hợp lệ")
                break;
            }
            case 194: {
                showNotification(0, "Tên cơ sở chăm sóc sức khỏe chứa ký tự không hợp lệ")
                break;
            }
            case 196: {
                showNotification(0, "Tên cơ sở vui chơi giải trí chứa ký tự không hợp lệ")
                break;
            }
            case 191: {
                showNotification(0, "Tên cơ sở mua sắm chứa ký tự không hợp lệ")
                break;
            }
        }
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
        url: `${baseUrl}/api/DL_CoSoDichVuTraiNghiemApi/Add`,
        async: false,
        contentType: false,
        processData: false,
        data: formData,
        success: function (data) {
            if (data.isSuccess && data.value) {
                showNotification(1, "Thêm mới cơ sở dịch vụ trải nghiệm thành công");
                // Redirect hoặc reset form
                setTimeout(function() {
                    window.location.href = `${baseUrl}/AdminTool/CoSoTraiNghiem/${typeName}`;
                }, 2000);
            } else {
                showNotification(0, "Thêm mới cơ sở lưu trú không thành công");
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

//const isOpenTimeValid = (openTime, closeTime) => {
//    if (!openTime || !closeTime) return false;

//    // tách HH:mm
//    const [h1, m1] = openTime.split(":").map(Number);
//    const [h2, m2] = closeTime.split(":").map(Number);

//    // chuyển sang tổng phút
//    const t1 = h1 * 60 + m1;
//    const t2 = h2 * 60 + m2;

//    return t1 > t2;   // mở < đóng
//}

const isOpenTimeValid = (moCua, dongCua) => {

    // Nếu chưa nhập đủ thì bỏ qua validate
    if (!moCua || !dongCua) {
        return false;
    }

    // Chuyển sang phút từ 0h00
    const getMinutes = (timeStr) => {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    };

    const moPhut = getMinutes(moCua);
    const dongPhut = getMinutes(dongCua);

    let hopLe = true;

    console.log(`Mở cửa: ${moPhut} phút, Đóng cửa: ${dongPhut} phút`);

    if (dongPhut > moPhut) {
        console.log("Trường hợp bình thường: đóng cửa sau mở cửa (cùng ngày)");
        // Trường hợp bình thường: đóng cửa sau mở cửa (cùng ngày)
        hopLe = false;
    } else if (dongPhut < moPhut) {
        console.log("Trường hợp qua đêm: đóng cửa trước mở cửa (sang ngày hôm sau)");
        // Trường hợp qua đêm: ví dụ 23:00 → 05:00
        // Khoảng cách từ mở → 24:00 + từ 00:00 → đóng phải > 0 (luôn đúng nếu có nhập)
        if (dongPhut >= 720 && moPhut >= 720 || dongPhut <= 720 && moPhut <= 720) {
            // Cùng nửa ngày (cả hai đều trước hoặc sau 12:00)
            console.log("Cả hai thời điểm đều trước hoặc sau 12:00 → không hợp lệ");
            hopLe = false;
        }
    } else {
        console.log("Giờ mở và đóng cùng giờ");
        // moPhut === dongPhut → mở và đóng cùng giờ → không hợp lệ (trừ khi cho phép 24h)
        hopLe = false;
    }

    if (hopLe) {
        return false;
    } else {
        return true;
    }
}
//#endregion function validation