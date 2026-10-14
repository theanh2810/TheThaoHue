const baseUrl = getRootLink();

$(document).ready(function () {

    const params = new URLSearchParams(window.location.search);
    const CoSoLuuTruId = params.get("id")
    //#region Xử lý các function chung
    initDatePicker();
    initSelect2();

    // Event handler cho thay đổi Ngôn ngữ
    $("#btnSaveEdit").on("click", function () {
        dataEditNhaVSCongCong(CoSoLuuTruId);
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
        }
    })
}

function dataEditNhaVSCongCong(CoSoLuuTruId) {
    // Thông tin chung
    const diaDiemID = $("#DiaDiemCoSanAdd").val();
    const dienThoai = $("#dienThoaiCoSoEdit").val();
    const trangThai = $("input[name='trangThaiCoSoEdit']:checked").val() == 1 ? true : false;
    const thuTu = $("#thuTuCoSoAdd").val()
    //const anhDaiDienDetail = $("#showAnhDaiDienDetail").val()
   // const fileAnhDaiDien = $("#fileAnhDaiDienPrev")[0].files[0] || null;
    const dtCoSo = {
        DichVuTienIchID: CoSoLuuTruId,
        DiaDiemID: diaDiemID || null,
        NhomDichVuID: 295,
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
                    showNotification(1, "Chỉnh sửa điểm vệ sinh công cộng thành công");
                    setTimeout(function () {
                        window.location.href = `${baseUrl}/AdminTool/TienIchKhac/DiemVSCongCong`;
                    }, 2000);
                } else {
                    showNotification(0, "Chỉnh sửa điểm vệ sinh công cộng không thành công");
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
