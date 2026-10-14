const baseUrl = getRootLink();
const ckeditormoTaCoSoEdit = CKEDITOR.replace('moTaCoSoEdit');
const ckeditortraiNghiemCoSoEdit = CKEDITOR.replace('traiNghiemCoSoEdit');
const ckeditorgoiYCoSoEdit = CKEDITOR.replace('goiYCoSoEdit');

$(document).ready(function () {
    const params = new URLSearchParams(window.location.search);
    const CoSoDichVuID = params.get("id")
    //#region Xử lý các function chung
    initDatePicker();
    initDanhMucChung_NoAll(57, "#loaiCoSoEdit", "") // Loại cơ sở lưu trú
    initNgonNgu("#ngonNguDichCoSoEdit")
    previewPicture()
    previewPictureSuKien()
    initSelect2();

    // Event handler cho thay đổi Ngôn ngữ
    $(document).on('change', '#ngonNguDichCoSoEdit', function() {
        let maNgonNgu = $(this).val();
        if (CoSoDichVuID && maNgonNgu) {
            loadTranslation(CoSoDichVuID, maNgonNgu);
        } else {
            $('#tenCoSoEdit').val('');
            $('#moTaCoSoEdit').val('');
            $('#diaChiCoSoEdit').val('');
            $('#traiNghiemCoSoEdit').val('');
            $('#goiYCoSoEdit').val('');
        }
    });

    $("#btnSaveEdit").on("click", function () {
        dataEditCoSoHoTro(CoSoDichVuID);
    })

    $("#buttonDelete").on('click', function () {
        let type = $("#idTypeDelete").val()
        switch (type) {
            case "vanban": {
                dataDeleteVBTL();
            } 
            case "media": {
                deleteDaPhuongTien();
            }
        }
        console.log($("idDelete").val())
        console.log(type)
    })

    setTimeout(() => {
        loadData(CoSoDichVuID)
    }, 300);
});

//#region Xử lý thông tin chung
function loadData(id) {
    getDataWithApi('GET', `/api/DL_CoSoDichVuHoTroApi/Get?MaNgonNgu=vi&CoSoDichVuID=${id}`).then(data => {
        if (data && data.isSuccess && data.value) {
            const item = data.value;
            console.log('Dữ liệu cơ sở lưu trú:', item);
            let title = `Thông tin ${item.tenCoSo}`; 
            let htmlTitle = ``;
            if (item.tenCoSo) {
                htmlTitle = `<div class='mainTitle'>Chỉnh sửa ${item.tenCoSo}</div>`;
            }
            $('.TieuDe h2').html(htmlTitle);
            document.title = title;
            $("#diaDiemCoSoEdit").val(item.diaDiemID || '').trigger('change');
            $("#loaiCoSoEdit").val(item.loaiHinhCoSoID || '').trigger('change');
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
            $("#showAnhDaiDienDetail").val(item.anhDaiDien || '');
            $("#showAnhDaiDienAdd").attr("src", item.anhDaiDien ? `${item.anhDaiDien}` : '/assets/images/vector/Addimage.png'); // Không có trong dữ liệu
            if (typeof ckeditormoTaCoSoEdit !== 'undefined') ckeditormoTaCoSoEdit.setData(item.moTa || '');
            if (typeof ckeditortraiNghiemCoSoEdit !== 'undefined') ckeditortraiNghiemCoSoEdit.setData(item.traiNghiem || '');
            if (typeof ckeditorgoiYCoSoEdit !== 'undefined') ckeditorgoiYCoSoEdit.setData(item.goiY || '');
            //("#traiNghiemCoSoEdit").val(item.traiNghiem ||    '');
            //$("#goiYCoSoEdit").val(item.goiY || '');
        }
    })
}

function dataEditCoSoHoTro(CoSoDichVuID) {
    // Thông tin chung
    const diaDiemID = $("#DiaDiemCoSanAdd").val();
    const loaiHinhCoSoID = $("#loaiCoSoEdit").val();
    const dienThoai = $("#dienThoaiCoSoEdit").val();
    const hopThu = $("#hopThuCoSoEdit").val();
    const lienKet = $("#lienKetCoSoEdit").val();
    const trangThai = $("input[name='trangThaiCoSoEdit']:checked").val() == 1 ? true : false;

    // Đa ngữ
    const maNgonNgu = $("#ngonNguDichCoSoEdit").val();
    const tenCoSo = $("#tenCoSoEdit").val();
    const moTa = ckeditormoTaCoSoEdit.getData();
    const diaChi = $("#diaChiCoSoEdit").val();
    const traiNghiem = ckeditortraiNghiemCoSoEdit.getData();
    const goiY = ckeditorgoiYCoSoEdit.getData();
    const thuTu = $("#thuTuCoSoAdd").val()
    const anhDaiDienDetail = $("#showAnhDaiDienDetail").val() || null;
    const fileAnhDaiDien = $("#fileAnhDaiDienPrev")[0].files[0] || null;
    const dtCoSo = {
        CoSoDichVuID: CoSoDichVuID,
        DiaDiemID: diaDiemID || null,
        LoaiHinhCoSoID: loaiHinhCoSoID || null,
        DienThoai: dienThoai,
        HopThu: hopThu || null,
        LienKet: lienKet || null,
        TrangThai: trangThai,
        MaNgonNgu: maNgonNgu,
        TenCoSo: tenCoSo,
        MoTa: moTa,
        DiaChi: diaChi,
        TraiNghiem: traiNghiem,
        GoiY: goiY,
        ThuTu: thuTu,
        AnhDaiDienDetail: anhDaiDienDetail ? anhDaiDienDetail : null
    };

    let formData = new FormData();
    formData.append("File", fileAnhDaiDien),
        formData.append("RequestCoSoDichVu", JSON.stringify(dtCoSo))

    if (fileAnhDaiDien == null && anhDaiDienDetail == null) {
        showNotification(0, "Vui lòng chọn ảnh đại diện")
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
    else if (checkEmptyBlank(loaiHinhCoSoID)) {
        showNotification(0, "Vui lòng chọn loại hình cơ sở")
    }
    else if (isValidPositiveIntegerAllowEmpty(thuTu) || thuTu >= 2147483647) {
        showNotification(0, "Thứ tự không hợp lệ")
    }
    else if (checkEmptyBlank(tenCoSo)) {
        showNotification(0, "Vui lòng nhập tên cơ sở dịch vụ hỗ trợ")
    }
    else if (checkTagHtmlSingle(tenCoSo)) {
        showNotification(0, "Tên cơ sở dịch vụ hỗ trợ chứa ký tự không hợp lệ")
    }
    else if (checkTagHtmlSingle(diaChi)) {
        showNotification(0, "Địa chỉ chứa ký tự không hợp lệ")
    }
    else if (checkEmptyBlank(diaDiemID)) {
        showNotification(0, "Vui lòng chọn địa điểm")
    }
    else {
        $.ajax({
            type: 'PUT',
            url: `${baseUrl}/api/DL_CoSoDichVuHoTroApi/Update`,
            processData: false,
            contentType: false,
            data: formData,
            success: function (data) {
                if (data.isSuccess && data.value) {
                    showNotification(1, "Chỉnh sửa cơ sở dịch vụ hỗ trợ thành công");
                    setTimeout(function () {
                        window.location.href = `${baseUrl}/AdminTool/CoSoHoTro/CoSoHoTro`;
                    }, 2000);
                } else {
                    showNotification(0, "Chỉnh sửa cơ sở dịch vụ hỗ trợ không thành công");
                    console.log(data.error);
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
    }
}

function loadTranslation(CoSoDichVuID, maNgonNgu) {
    getDataWithApi('GET', `/api/DL_CoSoDichVuHoTroApi/Get?MaNgonNgu=${maNgonNgu}&CoSoDichVuID=${CoSoDichVuID}`).then(data => {
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
//#endregion function validation
