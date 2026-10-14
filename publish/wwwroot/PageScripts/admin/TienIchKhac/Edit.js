const baseUrl = getRootLink();
const url = DanhMucID == 58 ? "AdminTool/TienIchKhac/DiemGiaoDich" : "AdminTool/TienIchKhac/DuongDayNong"

$(document).ready(function () {
    const CoSoLuuTruId = TienIchID;

    if (DanhMucID == 59) {
        $("#contentH2").html("Chỉnh sửa đường dây nóng")
        $("#contentLabel").html(`Loại nhóm dịch vụ <span class="text-danger">*</span>`)
    }
    initDatePicker();
    initDanhMucChung_NoAll(`${DanhMucID}`, "#loaiCoSoEdit", "") // Loại cơ sở lưu trú
    initSelect2();

    $("#btnSaveEdit").on("click", function () {
        dataEditCoSoLuuTru(CoSoLuuTruId, DanhMucID);
    })

    $("#btnCancel").on("click", function () {
        window.location.href = `${baseUrl}/${url}`;
    })

    setTimeout(() => {
        loadData(CoSoLuuTruId)
    }, 300);
});

//#region Xử lý thông tin chung
function loadData(id) {
    getDataWithApi('GET', `/api/DL_DichVuTienIchApi/Get?MaNgonNgu=vi&DichVuTienIchID=${id}`).then(data => {
        if (data && data.isSuccess && data.value) {
            const item = data.value;
            console.log('Dữ liệu cơ sở lưu trú:', item);
            $("#diaDiemCoSoEdit").val(item.diaDiemID || '').trigger('change');
            $("#loaiCoSoEdit").val(item.nhomDichVuID || '').trigger('change');
            $("#dienThoaiCoSoEdit").val(item.dienThoai || '');
            $("#hopThuCoSoEdit").val(item.hopThu || '');
            $("#lienKetCoSoEdit").val(item.lienKet || '');
            $("#DiaDiemCoSanAdd").val(item.diaDiemID).trigger('change');

            if (item.trangThai) {
                $("input[name='trangThaiCoSoEdit'][value='1']").prop('checked', true);
            } else {
                $("input[name='trangThaiCoSoEdit'][value='0']").prop('checked', true);
            }
            $("#ngonNguDichCoSoEdit").val(item.maNgonNgu).trigger('change');
            $("#tenCoSo").val(item.tenCoSo)
            $("#diaChiCoSoEdit").val(item.diaChi);
            $("#thuTuCoSoAdd").val(item.thuTu)
            $("#showAnhDaiDienDetail").val(item.anhDaiDien);
            $("#showAnhDaiDienAdd").attr("src", item.anhDaiDien ? `${item.anhDaiDien}` : '/assets/images/vector/Addimage.png'); // Không có trong dữ liệu
            if (typeof ckeditormoTaCoSoEdit !== 'undefined') ckeditormoTaCoSoEdit.setData(item.moTa || '');
            if (typeof ckeditortraiNghiemCoSoEdit !== 'undefined') ckeditortraiNghiemCoSoEdit.setData(item.traiNghiem || '');
            if (typeof ckeditorgoiYCoSoEdit !== 'undefined') ckeditorgoiYCoSoEdit.setData(item.goiY || '');
            //("#traiNghiemCoSoEdit").val(item.traiNghiem ||    '');
            //$("#goiYCoSoEdit").val(item.goiY || '');
        }
    })
}

function dataEditCoSoLuuTru(CoSoLuuTruId, DanhMucID) {
    // Thông tin chung
    const diaDiemID = $("#DiaDiemCoSanAdd").val();
    const nhomDichVuID = $("#loaiCoSoEdit").val()
    const dienThoai = $("#dienThoaiCoSoEdit").val();
    const trangThai = $("input[name='trangThaiCoSoEdit']:checked").val() == 1 ? true : false;
    const thuTu = $("#thuTuCoSoAdd").val()
    //const anhDaiDienDetail = $("#showAnhDaiDienDetail").val()
    // const fileAnhDaiDien = $("#fileAnhDaiDienPrev")[0].files[0] || null;
    const dtCoSo = {
        DichVuTienIchID: CoSoLuuTruId,
        DiaDiemID: diaDiemID || null,
        NhomDichVuID: nhomDichVuID, // 294 cho điểm giao dịch, 295 cho đường dây nóng
        DienThoai: dienThoai,
        TrangThai: trangThai,
        ThuTu: thuTu
        //HopThu: hopThu || null,
        //LienKet: lienKet || null,
        //TrangThai: trangThai,
        //MaNgonNgu: maNgonNgu,
        //TenCoSo: tenCoSo,
        //MoTa: moTa,
        //DiaChi: diaChi,
        //TraiNghiem: traiNghiem,
        //GoiY: goiY,
        //ThuTu: thuTu,
        //AnhDaiDienDetail: anhDaiDienDetail ? anhDaiDienDetail : null
    };


    let formData = new FormData();
    //formData.append("File", fileAnhDaiDien),
    formData.append("EntityDichVu", JSON.stringify(dtCoSo))

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
            type: 'PUT',
            url: `${baseUrl}/api/DL_DichVuTienIchApi/Update`,
            processData: false,
            contentType: false,
            data: formData,
            success: function (data) {
                if (data.isSuccess && data.value) {
                    showNotification(1, `Chỉnh sửa ${DanhMucID == 58 ? "điểm giao dich" : "đường dây nóng"}  thành công`);
                    setTimeout(function () {
                        window.location.href = `${baseUrl}/${url}`;
                    }, 2000);
                } else {
                    showNotification(0, `Chỉnh sửa ${DanhMucID == 58 ? "điểm giao dich" : "đường dây nóng"} không thành công`);
                    console.log(data.error);
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
    }

    
}

function loadTranslation(coSoLuuTruID, maNgonNgu) {
    getDataWithApi('GET', `/api/DL_CoSoDichVuHoTroApi/Get?MaNgonNgu=${maNgonNgu}&CoSoDichVuID=${coSoLuuTruID}`).then(data => {
        if (data && data.isSuccess && data.value) {
            const item = data.value;
            $("#tenCoSoEdit").val(item.tenCoSo || '');
            $("#moTaCoSoEdit").val(item.moTa || '');
            $("#diaChiCoSoEdit").val(item.diaChi || '');
            $("#traiNghiemCoSoEdit").val(item.traiNghiem || '');
            $("#goiYCoSoEdit").val(item.goiY || '');
        } else {
            $('#tenCoSoEdit').val('');
            $('#moTaCoSoEdit').val('');
            $('#diaChiCoSoEdit').val('');
            $('#traiNghiemCoSoEdit').val('');
            $('#goiYCoSoEdit').val('');
        }
    })
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