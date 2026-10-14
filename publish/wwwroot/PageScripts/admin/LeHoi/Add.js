const baseUrl = getRootLink();
const ckeditorQuiDinhAdd = CKEDITOR.replace('quyDinhAdd');
const ckeditorNoiDungAdd = CKEDITOR.replace('gioiThieuLeHoiAdd');
const ckeditordanhGiaAdd = CKEDITOR.replace('danhGiaAdd');

$(document).ready(function () {
    $("#DiaDiemCoSanAdd").attr("multiple", "multiple")
    initDatePicker();
    initDanhMucChung_NoAll(37, "#theLoaiAdd", "Thể loại lễ hội")
    initDanhMucChung_NoAll(38, "#capDoAdd", "")
    initDanhMucChung_NoAll(39, "#capQuanLyAdd", "")
    initDanhMucChung_NoAll(6, "#tanSuatAdd", "")
    initToChuc_NoAll(122, "#donViToChucAdd", "", "")
    initDanhMucChung_NoAll(1, "#danTocAdd", "")
    initDanhMucChung_NoAll(9, "#linhVucAdd", "")
    initNgonNgu("#ngonNguDichAdd")
    initSelect2();
    previewPicture();
    previewPictureSuKien()

    $("#btnSaveAdd").on("click", function () {
        dataAdd()
    })

    // Khi thay đổi Ngôn ngữ, reset các input trong phần đa ngữ
    $(document).on('change', '#ngonNguDichAdd', function() {
        $('#tenLeHoiDichAdd').val('');
        $('#diaChiAdd').val('');
        $('#donViPhoiHopAdd').val('');
        $('#nhanVatPhungThoAdd').val('');
        if (typeof ckeditorNoiDungAdd !== 'undefined') ckeditorNoiDungAdd.setData('');
        if (typeof ckeditorQuiDinhAdd !== 'undefined') ckeditorQuiDinhAdd.setData('');
        if (typeof ckeditordanhGiaAdd !== 'undefined') ckeditordanhGiaAdd.setData('');
    });
});

function dataAdd() {
    //Thông tin chung
    const TenLeHoi = $("#tenLeHoiAdd").val();
    const MaDinhDanhLeHoi = $("#maDinhDanhAdd").val();
    const TheLoaiID = $("#theLoaiAdd").val();
    const NgayBatDau = formatDateToSaveAsString($("#ngayBatDauAdd").val());
    const NgayKetThuc = formatDateToSaveAsString($("#ngayKetThucAdd").val());
    const TanSuatID = $("#tanSuatAdd").val();
    const CapDoID = $("#capDoAdd").val();
    const CapQuanLyID = $("#capQuanLyAdd").val();
    const SoLuongThamGia = $("#soLuongThamGiaAdd").val();
    const ThoiGianDienRa = $("#thoiGianDienRaAdd").val();
    const DonViToChucID = $("#donViToChucAdd").val();
    const SoNgayDienRa = $("#soNgayDienRaAdd").val();
    const NamVHPHTQG = $("#namVHPHTQGAdd").val();
    const DanTocID = $("#danTocAdd").val();
    const LaTieuBieu = $("#laTieuBieuAdd").is(":checked");
    const LaCungDinh = $("#laCungDinhAdd").is(":checked");
    const TrangThaiToChuc = $("input[name='trangThaiToChucAdd']:checked").val();
    const TrangThai = $("input[name='trangThaiAdd']:checked").val();
    const fileAnhDaiDien = $("#fileAnhDaiDienPrev")[0].files[0] || null;

    //Nội dung đa ngữ
    const MaNgonNgu = $("#ngonNguDichAdd").val();
    const TenLeHoiChild = $("#tenLeHoiDichAdd").val();
    const DiaDiemChiTiet = $("#diaChiAdd").val();
    const DonViPhoiHop = $("#donViPhoiHopAdd").val();
    const NhanVatPhungTho = $("#nhanVatPhungThoAdd").val();
    const NoiDung = ckeditorNoiDungAdd.getData();
    const QuiDinh = ckeditorQuiDinhAdd.getData();
    const DanhGia = ckeditordanhGiaAdd.getData();
    let listIDDiaDiem = $("#DiaDiemCoSanAdd").val()

    let dtChung = {
        TenLeHoi: TenLeHoi,
        MaDinhDanhLeHoi: MaDinhDanhLeHoi,
        TheLoaiID: TheLoaiID,
        NgayBatDau: null,
        NgayKetThuc: null,
        TanSuatID: TanSuatID,
        CapDoID: CapDoID,
        CapQuanLyID: CapQuanLyID,
        SoLuongThamGia: SoLuongThamGia,
        DonViToChucID: DonViToChucID,
        SoNgayDienRa: SoNgayDienRa,
        ThoiGianDienRa: ThoiGianDienRa,
        NamVHPHTQG: NamVHPHTQG,
        DanTocID: DanTocID,
        LaTieuBieu: LaTieuBieu,
        LaCungDinh: LaCungDinh,
        TrangThaiToChuc: TrangThaiToChuc == 1 ? true : false,
        TrangThai: TrangThai == 1 ? true : false,
        ListIDDiaDiem: $("#DiaDiemCoSanAdd").val().map(item => item).join(','),

        //Nội dung đa ngữ
        MaNgonNgu: MaNgonNgu,
        TenLeHoiChild: TenLeHoiChild,
        DiaDiemChiTiet: DiaDiemChiTiet,
        DonViPhoiHop: DonViPhoiHop,
        NhanVatPhungTho: NhanVatPhungTho,
        NoiDung: NoiDung,
        QuiDinh: QuiDinh,
        DanhGia: DanhGia,
    }

    let requestDaPhuongTien = createRequestDaPhuongTiens();

    let formData = new FormData()
    formData.append('EntityLeHoi', JSON.stringify(dtChung))
    formData.append("File", fileAnhDaiDien)
    for (let i = 0; i < requestDaPhuongTien.length; i++) {
        formData.append(`EntityDaPhuongTien[${i}].DaPhuongTien`, JSON.stringify(requestDaPhuongTien[i].DaPhuongTien));
        formData.append(`EntityDaPhuongTien[${i}].DaPhuongTien_NoiDung`, JSON.stringify(requestDaPhuongTien[i].DaPhuongTien_NoiDung));  
        formData.append(`EntityDaPhuongTien[${i}].File`, requestDaPhuongTien[i].FileDinhKem[0]);  
    }

    if (fileAnhDaiDien == null) {
        showNotification(0, "Vui lòng chọn ảnh đại diện")
    }
    else if (checkEmptyBlank(MaDinhDanhLeHoi)) {
        showNotification(0, "Vui lòng nhập mã định danh lễ hội")
    }
    else if (checkTagHtmlSingle(MaDinhDanhLeHoi)) {
        showNotification(0, "Mã định danh lễ hội chứa ký tự không hợp lệ")
    }
    else if (checkUnique(MaDinhDanhLeHoi) > 0) {
        showNotification(0, "Mã định danh lễ hội tồn tại")
    }
    else if (checkEmptyBlank(TheLoaiID)) {
        showNotification(0, "Vui lòng chọn loại hình")
    }
    else if (checkEmptyBlank(CapDoID)) {
        showNotification(0, "Vui lòng chọn cấp độ")
    }
    else if (checkEmptyBlank(TanSuatID)) {
        showNotification(0, "Vui lòng chọn tần suất")
    }
    else if (checkTagHtmlSingle(ThoiGianDienRa)) {
        showNotification(0, "Thời gian diễn ra chứa ký tự không hợp lệ")
    }
    else if (isValidPositiveIntegerAllowEmpty(SoNgayDienRa) || Number(SoNgayDienRa) > 2147483648) {
        showNotification(0, "Số ngày diễn ra không hợp lệ")
    }
    else if (isValidPositiveIntegerAllowEmpty(SoLuongThamGia) || Number(SoLuongThamGia) > 2147483648) {
        showNotification(0, "Số lượng tham gia không hợp lệ")
    }
    else if (isValidPositiveIntegerAllowEmpty(NamVHPHTQG) || Number(NamVHPHTQG) > 2147483648) {
        showNotification(0, "Năm đưa vào danh mục di sản VHPVT quốc gia không hợp lệ")
    }
    else if (checkEmptyBlank(TenLeHoiChild)) {
        showNotification(0, "Vui lòng nhập tên lễ hội")
    }
    else if (checkTagHtmlSingle(TenLeHoiChild)) {
        showNotification(0, "Tên lễ hội chứa ký tự không hợp lệ")
    }
    else if (checkTagHtmlSingle(DiaDiemChiTiet)) {
        showNotification(0, "Địa điểm diễn ra chứa ký tự không hợp lệ")
    }
    else if (checkTagHtmlSingle(DonViPhoiHop)) {
        showNotification(0, "Đơn vị phối hợp chứa ký tự không hợp lệ")
    }
    else if (checkTagHtmlSingle(NhanVatPhungTho)) {
        showNotification(0, "Nhân vật phụng thờ chứa ký tự không hợp lệ")
    }
    else if (listIDDiaDiem.length == 0) {
        showNotification(0, "Vui lòng chọn địa điểm")
    }
    else {
        $.ajax({
            type: 'POST',
            url: `${baseUrl}/api/VH_LeHoiApi/Add`,
            async: false,
            contentType: false,
            processData: false,
            data: formData,
            success: function (data) {
                if (data.isSuccess && data.value) {
                    showNotification(1, "Thêm mới lễ hội thành công");
                    console.log(data)
                    setTimeout(() => {
                        window.location.href = `${baseUrl}/AdminTool/Lehoi`;
                    }, 1500);
                } else {
                    showNotification(0, "Thêm mới lễ hội không thành công");
                    console.log(data.error)
                }
            },
            error: function (err) {
                console.log(err)
            }
        })
    }

  
}

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

const checkUnique = (maDinhDanh) => {
    let result = 0
    $.ajax({
        type: "GET",
        async: false,
        url: `${baseUrl}/api/VH_LeHoiApi/CheckUnique?MaDinhDanh=${maDinhDanh}`,
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
//#endregion function validation
