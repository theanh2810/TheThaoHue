const baseUrl = getRootLink();
const baoCaoChinhThuc = CKEDITOR.replace('baoCaoChinhThuc');
const tinhHinhThucHien = CKEDITOR.replace('tinhHinhThucHien');
const danhGiaChung = CKEDITOR.replace('danhGiaChung');
const ketQuaThucHien = CKEDITOR.replace('ketQuaThucHien');
const hanCheNguyenNhan = CKEDITOR.replace('hanCheNguyenNhan');
const nhiemVuTrongTam = CKEDITOR.replace('nhiemVuTrongTam');
const deXuatKienNghi = CKEDITOR.replace('deXuatKienNghi');

$(document).ready(function () {
    initDatePicker();

    const params = new URLSearchParams(window.location.search);

    const YCID = params.get("YCID");

    let resYC = loadDataYC(YCID)

    //Handle save

    $("#btnSaveAdd").on('click', function () {
        //Save and redirect management page
        handleAdd(resYC, 1)
    })

    $("#btnSaveAddAndReset").on('click', function () {
        //Save and redirect edit page
        handleAdd(resYC, 0)
    })

})

const loadDataYC = (YCID) => {
    let res = null
    $.ajax({
        type: "GET",
        async: false,
        url: `${baseUrl}/api/RPT_YeuCauBaoCaoApi/Get?ID=${YCID}&MaNgonNgu=vi`,
        contentType: 'application/json;charset=utf-8',
        dataType: 'json',
        success: function (data) {
            if (data.isSuccess) {
                res = data.value.yeuCauBaoCao
                $("#tieuDeAdd").text(res.tieuDe)
                $("#toChucAdd").text(res.tenToChuc)
                res.tuNgay ? $("#batDauAdd").text(formatDateWithoutTime(res.tuNgay)) : $("#batDauAdd").text("")
                res.denNgay ? $("#ketThucAdd").text(formatDateWithoutTime(res.denNgay)) : $("#ketThucAdd").text("")
                res.noiDung ? $("#noiDungYeuCau").html(res.noiDung) : ""
            }
        },
        error: function (err) {
            console.log(err)
        }
    })

    return res
}

const handleAdd = (res, typeSave) => {
    let soKyHieu = $("#soKyHieu").val()
    let trichYeu = $("#trichYeu").val()
    let ngayBanHanh = $("#ngayBanHanh").val();
    let baoCaoChinhThucReq = baoCaoChinhThuc.getData()
    let tinhHinhThucHienReq = tinhHinhThucHien.getData()
    let danhGiaChungReq = danhGiaChung.getData()
    let ketQuaThucHienReq = ketQuaThucHien.getData()
    let hanCheNguyenNhanReq = hanCheNguyenNhan.getData()
    let nhiemVuTrongTamReq = nhiemVuTrongTam.getData()
    let deXuatKienNghiReq = deXuatKienNghi.getData()

    let dataBuilder = {
        toChucID: res.toChucID,
        yeuCauBaoCaoID: res.id,
        ngayBanHanh: formatDateToSendWithoutTime(ngayBanHanh),
        soKyHieu: soKyHieu,
        trichYeu: trichYeu,
        baoCaoChinhThuc: baoCaoChinhThucReq,
        tinhHinhThucHien: tinhHinhThucHienReq,
        danhGiaChung: danhGiaChungReq,
        ketQuaThucHien: ketQuaThucHienReq,
        hanCheNguyenNhan: hanCheNguyenNhanReq,
        nhiemVuTrongTam: nhiemVuTrongTamReq,
        deXuatKienNghi: deXuatKienNghiReq
    }

    let formData = new FormData();
    formData.append("EntityDaPhuongTien", null)
    formData.append("EntityBaoCao", JSON.stringify(dataBuilder))

    if (checkEmptyBlank(soKyHieu)) {
        showNotification(0, "Vui lòng nhập số ký hiệu")
    }
    else if (checkTagHtmlSingle(soKyHieu)) {
        showNotification(0, "Số ký hiệu không hợp lệ")
    }
    else if (checkEmptyBlank(trichYeu)) {
        showNotification(0, "Vui lòng nhập trích yếu")
    }
    else if (checkTagHtmlSingle(trichYeu)) {
        showNotification(0, "Trích yếu chứa ký tự không hợp lệ")
    }
    else if (checkEmptyBlank(ngayBanHanh)) {
        showNotification(0, "Vui lòng chọn/nhập ngày ban hành")
    }
    else if (isFutureDate(ngayBanHanh)) {
        showNotification(0, "Ngày ban hành không hợp lệ")
    }
    else {
        $.ajax({
            type: "POST",
            async: false,
            url: `${baseUrl}/api/RPT_BaoCao_KetQuaHoatDongApi/Add`,
            contentType: false,
            processData: false,
            data: formData,
            success: function (data) {
                if (data.isSuccess) {
                    showNotification(1, "Thêm mới báo cáo hoạt động thành công")
                    setTimeout(() => {
                        if (typeSave == 1) {
                            window.location.href = "/AdminTool/ThongKeBaoCao/BaoCao"
                        }
                        else {
                            window.location.href = `/AdminTool/ThongKeBaoCao/BaoCao_Edit?YCID=${res.id}`
                        }
                    }, 2000)
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

//#endregion function validation
