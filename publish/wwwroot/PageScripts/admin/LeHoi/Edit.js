const baseUrl = getRootLink();
let translations = [];
const ckeditorQuiDinhEdit = CKEDITOR.replace('quyDinhEdit');
const ckeditorNoiDungEdit = CKEDITOR.replace('gioiThieuLeHoiEdit');
const ckeditordanhGiaEdit = CKEDITOR.replace('danhGiaEdit');

$(document).ready(function () {
    console.log(123)
    //#region Xử lý các function chung
    $("#DiaDiemCoSanAdd").attr("multiple", "multiple")
    initDatePicker();
    initDanhMucChung_NoAll(37, "#theLoaiEdit", "Thể loại lễ hội")
    initDanhMucChung_NoAll(38, "#capDoEdit", "")
    initDanhMucChung_NoAll(39, "#capQuanLyEdit", "")
    initDanhMucChung_NoAll(6, "#tanSuatEdit", "")
    initToChuc_NoAll(122, "#donViToChucEdit", "", "")
    initDanhMucChung_NoAll(1, "#danTocEdit", "")
    initDanhMucChung_NoAll(9, "#linhVucEdit", "")
    initNgonNgu("#ngonNguDichEdit")
    initSelect2();
    previewPicture();
    previewPictureSuKien();
    //#endregion Xử lý các function chung

    //#region Xử lý thông tin lễ hội
    setTimeout(() => {
        loadData(LeHoiId)
    }, 100);

    // Khi thay đổi Ngôn ngữ, reset các input trong phần đa ngữ
    $(document).on('change', '#ngonNguDichEdit', function () {
        let maNgonNgu = $(this).val();
        
        if (LeHoiId && maNgonNgu) {
            console.log('Chuyển Ngôn ngữ cho lễ hội hiện tại:', maNgonNgu);
            // Load bản dịch cho ngôn ngữ được chọn
            loadTranslation(LeHoiId, maNgonNgu);
        } else {
            // Nếu chưa có cơ quan (tạo mới) hoặc chưa chọn ngôn ngữ, clear các trường dịch
            if (!LeHoiId || !maNgonNgu) {
                $('#tenLeHoiDichAdd').val('');
                $('#diaChiAdd').val('');
                $('#donViPhoiHopAdd').val('');
                $('#nhanVatPhungThoAdd').val('');
                if (typeof ckeditorNoiDungAdd !== 'undefined') ckeditorNoiDungAdd.setData('');
                if (typeof ckeditorQuiDinhAdd !== 'undefined') ckeditorQuiDinhAdd.setData('');
                if (typeof ckeditordanhGiaAdd !== 'undefined') ckeditordanhGiaAdd.setData('');
            }
        }
    });

    $("#btnSaveEdit").on("click", function () {
        dataEdit()
    })
    //#endregion Xử lý thông tin lễ hội
});

//#region Function Xử lý thông tin lễ hội
function loadData(LeHoiID) {
    getDataWithApi('GET', `/api/VH_LeHoiApi/Get?MaNgonNgu=vi&LeHoiID=${LeHoiID}`).then(data => {
        console.log(data)
        if (data && data.isSuccess && data.value) {
            const lh = data.value;
            let title = `Thông tin ${lh.tenLeHoiChild}`;
            let htmlTitle = ``;
            if (lh.tenLeHoiChild) {
                htmlTitle = `<div class='mainTitle'>Chỉnh sửa ${lh.tenLeHoiChild}</div>`;
            }
            $('.TieuDe h2').html(htmlTitle);
            document.title = title;

            $("#tenLeHoiEdit").val(lh.tenLeHoi);
            $("#maDinhDanhEdit").val(lh.maDinhDanhLeHoi);
            $("#theLoaiEdit").val(lh.theLoaiID).trigger('change');
            $("#ngayBatDauEdit").val(formatDateWithoutTime(lh.ngayBatDau));
            $("#ngayKetThucEdit").val(formatDateWithoutTime(lh.ngayKetThuc));
            $("#tanSuatEdit").val(lh.tanSuatID).trigger('change');
            $("#capDoEdit").val(lh.capDoID).trigger('change');
            $("#capQuanLyEdit").val(lh.capQuanLyID).trigger('change');
            $("#soLuongThamGiaEdit").val(lh.soLuongThamGia);
            $("#thoiGianDienRaEdit").val(lh.thoiGianDienRa);
            $("#donViToChucEdit").val(lh.donViToChucID).trigger('change');
            $("#soNgayDienRaEdit").val(lh.soNgayDienRa);
            $("#namVHPHTQGEdit").val(lh.namVHPVTQG);
            $("#danTocEdit").val(lh.danTocID).trigger('change');
            $("#laTieuBieuEdit").prop('checked', lh.laTieuBieu);
            $("#laCungDinhEdit").prop('checked', lh.laCungDinh);
            $("input[name='trangThaiToChucEdit'][value='" + (lh.trangThaiToChuc ? 1 : 0) + "']").prop('checked', true);
            $("input[name='trangThaiEdit'][value='" + (lh.trangThai ? 1 : 0) + "']").prop('checked', true);
            if (lh.listIDDiaDiem) {
                console.log(lh.listIDDiaDiem, "Danh sách địa điểm đã chọn")
                let listDiaDiem = lh.listIDDiaDiem.split(',').map(x => x.trim().toLowerCase());
                $("#DiaDiemCoSanAdd").val(listDiaDiem.map(item => item)).trigger('change');
                initTableDiaDiem(listDiaDiem.map(item => item).join(','));
            }
            //Nội dung đa ngữ
            $("#ngonNguDichEdit").val(lh.maNgonNgu).trigger('change');
            $("#tenLeHoiDichEdit").val(lh.tenLeHoiChild);
            $("#diaChiEdit").val(lh.diaDiemChiTiet);
            $("#donViPhoiHopEdit").val(lh.donViPhoiHop);
            $("#nhanVatPhungThoEdit").val(lh.nhanVatPhungTho);
            $("#showAnhDaiDienDetail").val(lh.anhDaiDien);
            $("#showAnhDaiDienAdd").attr("src", lh.anhDaiDien ? `${lh.anhDaiDien}` : '/assets/images/vector/Addimage.png'); // Không có trong dữ liệu
            if (typeof ckeditorNoiDungEdit !== 'undefined') ckeditorNoiDungEdit.setData(lh.noiDung || '');
            if (typeof ckeditorQuiDinhEdit !== 'undefined') ckeditorQuiDinhEdit.setData(lh.quiDinh || '');
            if (typeof ckeditordanhGiaEdit !== 'undefined') ckeditordanhGiaEdit.setData(lh.danhGia || '');
        }
    })

}

function dataEdit() { 
    //Thông tin chung
    const id = LeHoiId;
    const TenLeHoi = $("#tenLeHoiEdit").val() || null;
    const MaDinhDanhLeHoi = $("#maDinhDanhEdit").val() || null;
    const TheLoaiID = $("#theLoaiEdit").val() || null;
    const NgayBatDau = formatDateToSaveAsString($("#ngayBatDauEdit").val()) || null;
    const NgayKetThuc = formatDateToSaveAsString($("#ngayKetThucEdit").val()) || null;
    const TanSuatID = $("#tanSuatEdit").val() || null;
    const CapDoID = $("#capDoEdit").val() || null;
    const CapQuanLyID = $("#capQuanLyEdit").val() || null;
    const SoLuongThamGia = $("#soLuongThamGiaEdit").val() || null;
    const ThoiGianDienRa = $("#thoiGianDienRaEdit").val() || null;
    const DonViToChucID = $("#donViToChucEdit").val() || null;
    const SoNgayDienRa = $("#soNgayDienRaEdit").val() || null;
    const NamVHPHTQG = $("#namVHPHTQGEdit").val() || null;
    const DanTocID = $("#danTocEdit").val() || null;
    const LaTieuBieu = $("#laTieuBieuEdit").is(":checked");
    const LaCungDinh = $("#laCungDinhEdit").is(":checked");
    const TrangThaiToChuc = $("input[name='trangThaiToChucEdit']:checked").val();
    const TrangThai = $("input[name='trangThaiEdit']:checked").val();
    const anhDaiDienDetail = $("#showAnhDaiDienDetail").val()
    const fileAnhDaiDien = $("#fileAnhDaiDienPrev")[0].files[0] || null;
    //Nội dung đa ngữ
    const MaNgonNgu = $("#ngonNguDichEdit").val();
    const TenLeHoiChild = $("#tenLeHoiDichEdit").val() || null;
    const DiaDiemChiTiet = $("#diaChiEdit").val() || null;
    const DonViPhoiHop = $("#donViPhoiHopEdit").val() || null;
    const NhanVatPhungTho = $("#nhanVatPhungThoEdit").val() || null;
    const NoiDung = ckeditorNoiDungEdit.getData();
    const QuiDinh = ckeditorQuiDinhEdit.getData();
    const DanhGia = ckeditordanhGiaEdit.getData();
    let listIDDiaDiem = $("#DiaDiemCoSanAdd").val()

    //console.log({
    //    TenLeHoi, MaDinhDanhLeHoi, TheLoaiID, NgayBatDau, NgayKetThuc, TanSuatID, CapDoID, CapQuanLyID,
    //    SoLuongThamGia, DonViToChucID, SoNgayDienRa, NamVHPHTQG, DanTocID, LaTieuBieu, LaCungDinh,
    //    TrangThaiToChuc, TrangThai,
    //    MaNgonNgu, TenLeHoiChild, DiaDiemChiTiet, DonViPhoiHop, NhanVatPhungTho, NoiDung, QuiDinh, DanhGia
    //})

    let dtChung = {
        LeHoiID: id,
        //TenLeHoi: TenLeHoi.trim(),
        MaDinhDanhLeHoi: MaDinhDanhLeHoi ? MaDinhDanhLeHoi.trim() : null,
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
        AnhDaiDienDetail: anhDaiDienDetail,

        //Nội dung đa ngữ
        MaNgonNgu: MaNgonNgu,
        TenLeHoiChild: TenLeHoiChild.trim(),
        DiaDiemChiTiet: DiaDiemChiTiet,
        DonViPhoiHop: DonViPhoiHop,
        NhanVatPhungTho: NhanVatPhungTho,
        NoiDung: NoiDung,
        QuiDinh: QuiDinh,
        DanhGia: DanhGia,
    }

    console.log(dtChung)
    console.log(MaNgonNgu, "Mã")

    let formData = new FormData()
    formData.append("File", fileAnhDaiDien)
    formData.append("RequestLeHoi", JSON.stringify(dtChung))

    if (fileAnhDaiDien == null && anhDaiDienDetail == null) {
        showNotification(0, "Vui lòng chọn ảnh đại diện")
    }
    else if (checkEmptyBlank(MaDinhDanhLeHoi)) {
        showNotification(0, "Vui lòng nhập mã định danh lễ hội")
    }
    else if (checkTagHtmlSingle(MaDinhDanhLeHoi.trim())) {
        showNotification(0, "Mã định danh lễ hội chứa ký tự không hợp lệ")
    }
    else if (checkUnique(MaDinhDanhLeHoi.trim(), id) > 0) {
        showNotification(0, "Mã định danh lễ hội đã tồn tại")
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
            type: 'PUT',
            url: `${baseUrl}/api/VH_LeHoiApi/Update`,
            async: false,
            contentType: false,
            processData: false,
            data: formData,
            success: function (data) {
                if (data.isSuccess && data.value) {
                    showNotification(1, "Chỉnh sửa lễ hội thành công");
                    setTimeout(() => {
                        window.location.href = `${baseUrl}/AdminTool/LeHoi`;
                    }, 1500);
                } else {
                    showNotification(0, "Chỉnh sửa lễ hội không thành công");
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
    getDataWithApi('GET', `/api/VH_LeHoiApi/Get?LeHoiID=${toChucID}&MaNgonNgu=${maNgonNgu}`).then(data => {
        console.log(data, "Load bản dịch lễ hội")
        if (data && data.isSuccess && data.value) {
            translations = data.value;
            // Populate các trường dịch với dữ liệu đa ngữ
            $("#tenLeHoiDichEdit").val(translations.tenLeHoiChild);
            $("#diaChiEdit").val(translations.diaDiemChiTiet);
            $("#donViPhoiHopEdit").val(translations.donViPhoiHop);
            $("#nhanVatPhungThoEdit").val(translations.nhanVatPhungTho);
            if (typeof ckeditorNoiDungAdd !== 'undefined') ckeditorNoiDungEdit.setData(translations.noiDung || '');
            if (typeof ckeditorQuiDinhAdd !== 'undefined') ckeditorQuiDinhEdit.setData(translations.quiDinh || '');
            if (typeof ckeditordanhGiaAdd !== 'undefined') ckeditordanhGiaEdit.setData(translations.danhGia || '');
        } else {
            // Nếu không có bản dịch, clear các trường dịch
            $('#tenLeHoiDichAdd').val('');
            $('#diaChiAdd').val('');
            $('#donViPhoiHopAdd').val('');
            $('#nhanVatPhungThoAdd').val('');
            if (typeof ckeditorNoiDungAdd !== 'undefined') ckeditorNoiDungAdd.setData('');
            if (typeof ckeditorQuiDinhAdd !== 'undefined') ckeditorQuiDinhAdd.setData('');
            if (typeof ckeditordanhGiaAdd !== 'undefined') ckeditordanhGiaAdd.setData('');
        }
    })
}
//#endregion Function Xử lý thông tin lễ hội

//#region function validation
const checkTagHtmlSingle = (input) => {
    console.log(input)
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

const checkUnique = (maDinhDanh, leHoiID) => {
    let result = 0
    $.ajax({
        type: "GET",
        async: false,
        url: `${baseUrl}/api/VH_LeHoiApi/CheckUnique?MaDinhDanh=${maDinhDanh}&LeHoiID=${leHoiID}`,
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

