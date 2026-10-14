const baseUrl = getRootLink();
const ckeditormoTaCoSoEdit = CKEDITOR.replace('moTaCoSoEdit');
const ckeditortraiNghiemCoSoEdit = CKEDITOR.replace('traiNghiemCoSoEdit');
const ckeditorgoiYCoSoEdit = CKEDITOR.replace('goiYCoSoEdit');

let listTienNghi = [];
let listPhong = [];
let listNguoiLaoDong = [];

$(document).ready(function () {
    const params = new URLSearchParams(window.location.search);
    const DanhMucID = Number(danhMucID)
    const CoSoDichVuID = params.get("id")
    //#region Xử lý các function chung
    initDatePicker();
    initNgonNgu("#ngonNguDichCoSoEdit")
    previewPicture()
    previewPictureSuKien()
    initSelect2();

    $('#tinhThanhPhoAdd').on('change', function () {
        let tinhID = $(this).val();
        initPhuongXa(tinhID)
    })

    $("#btnCancel").on("click", function () {
        window.location.href = `${baseUrl}/AdminTool/CoSoTraiNghiem/${typeName}`;
    })

    // Event handler cho thay đổi Ngôn ngữ
    $(document).on('change', '#ngonNguDichCoSoEdit', function () {
        let maNgonNgu = $(this).val();
        if (CoSoDichVuID && maNgonNgu) {
            loadTranslation(CoSoDichVuID, maNgonNgu);
        } else {
            $('#tenCoSoEdit').val('');
            $('#moTaCoSoEdit').val('');
            $('#nguoiDaiDienCoSoEdit').val('');
            $('#diaChiCoSoEdit').val('');
            $('#traiNghiemCoSoEdit').val('');
            $('#goiYCoSoEdit').val('');
        }
    });

    $("#btnSaveEdit").on("click", function () {
        dataEditCoSoTraiNghiem(DanhMucID, CoSoDichVuID);
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
    })

    setTimeout(() => {
        loadData(CoSoDichVuID)
    }, 300);

    if (DanhMucID == 193) {
        $("label[for='tenCoSoAdd']").text("Tên cơ sở kinh doanh dịch vụ - thể thao")
        $("#tenCoSoAdd").attr("placeholder", "Nhập tên cơ sở kinh doanh dịch vụ - thể thao")
    } else if (DanhMucID == 194) {
        $("label[for='tenCoSoAdd']").text("Tên cơ sở chăm sóc sức khỏe")
        $("#tenCoSoAdd").attr("placeholder", "Nhập tên cơ sở chăm sóc sức khỏe")
    } else if (DanhMucID == 196) {
        $("label[for='tenCoSoAdd']").text("Tên cơ sở vui chơi giải trí")
        $("#tenCoSoAdd").attr("placeholder", "Nhập tên cơ sở vui chơi giải trí")
    } else if (DanhMucID == 191) {
        $("label[for='tenCoSoAdd']").text("Tên cơ sở mua sắm")
        $("#tenCoSoAdd").attr("placeholder", "Nhập tên cơ sở mua sắm")
    }
});

//#region Xử lý thông tin chung
function loadData(id) {
    getDataWithApi('GET', `/api/DL_CoSoDichVuTraiNghiemApi/Get?MaNgonNgu=vi&CoSoDichVuID=${id}`).then(data => {
        if (data && data.isSuccess && data.value) {
            const item = data.value;
            let title = `Thông tin ${item.tenCoSo}`; 
            let htmlTitle = ``;
            if (item.tenCoSo) {
                htmlTitle = `<div class='mainTitle'>Chỉnh sửa ${item.tenCoSo}</div>`;
            }
            $('.TieuDe h2').html(htmlTitle);
            document.title = title;
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
            $("#gioMoCua").val(item.gioMoCua)
            $("#gioDongCua").val(item.gioDongCua)
            $("#ngonNguDichCoSoEdit").val(item.maNgonNgu || '').trigger('change');
            $("#tenCoSoEdit").val(item.tenCoSo || '');
            $("#diaChiCoSoEdit").val(item.diaChi || '');
            if (typeof ckeditormoTaCoSoEdit !== 'undefined') ckeditormoTaCoSoEdit.setData(item.moTa || '');
            if (typeof ckeditortraiNghiemCoSoEdit !== 'undefined') ckeditortraiNghiemCoSoEdit.setData(item.traiNghiem || '');
            if (typeof ckeditorgoiYCoSoEdit !== 'undefined') ckeditorgoiYCoSoEdit.setData(item.goiY || '');
            $("#showAnhDaiDienDetail").val(item.anhDaiDien || '');
            $("#showAnhDaiDienAdd").attr("src", item.anhDaiDien ? `${item.anhDaiDien}` : '/assets/images/vector/Addimage.png'); // Không có trong dữ liệu
            //("#traiNghiemCoSoEdit").val(item.traiNghiem ||    '');
            //$("#goiYCoSoEdit").val(item.goiY || '');
            $("#ngayNghiHangTuan").val(item.ngayNghiHangTuan ? item.ngayNghiHangTuan.split("-").map(item => item) : "").trigger("change")
            console.log(item)
            if (item.coBanVe) {
                $("#isEnabled").prop("checked", true)
            }
            else {
                $("#isDisable").prop("checked",true)
            }
        }
    })
}

function dataEditCoSoTraiNghiem(DanhMucID, CoSoDichVuID) {
    // Thông tin chung
    const diaDiemID = $("#DiaDiemCoSanAdd").val();
    const dienThoai = $("#dienThoaiCoSoEdit").val();
    const hopThu = $("#hopThuCoSoEdit").val();
    const lienKet = $("#lienKetCoSoEdit").val();
    const trangThai = $("input[name='trangThaiCoSoEdit']:checked").val() == 1 ? true : false;
    const coBanVe = $("input[name='banVeAdd']:checked").val() == 1 ? true : false;
    const gioMoCua = $("#gioMoCua").val()
    const gioDongCua = $("#gioDongCua").val()
    let ngayNghiHangTuanOption = $("#ngayNghiHangTuan").val()
    let ngayNghiHangTuan = null
    if (ngayNghiHangTuanOption.length > 0) {
        ngayNghiHangTuan = ngayNghiHangTuanOption.join("-")
    }
    // Đa ngữ
    const maNgonNgu = $("#ngonNguDichCoSoEdit").val();
    const tenCoSo = $("#tenCoSoEdit").val();
    const moTa = ckeditormoTaCoSoEdit.getData();
    const diaChi = $("#diaChiCoSoEdit").val();
    const traiNghiem = ckeditortraiNghiemCoSoEdit.getData();
    const goiY = ckeditorgoiYCoSoEdit.getData();
    const anhDaiDienDetail = $("#showAnhDaiDienDetail").val() || null;
    const fileAnhDaiDien = $("#fileAnhDaiDienPrev")[0].files[0] || null;

    const dtCoSo = {
        CoSoDichVuID: CoSoDichVuID,
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
        NgayNghiHangTuan: ngayNghiHangTuan,
        AnhDaiDienDetail: anhDaiDienDetail
    };


    //if (diaDiemID == null || diaDiemID == "") {
    //    showNotification(0, "Vui lòng chọn địa điểm");
    //    return;
    //}

    let formData = new FormData();
        formData.append("File", fileAnhDaiDien),
        formData.append("RequestCoSo", JSON.stringify(dtCoSo))

    if (fileAnhDaiDien == null && anhDaiDienDetail == null) {
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
        
        $.ajax({
            type: 'PUT',
            url: `${baseUrl}/api/DL_CoSoDichVuTraiNghiemApi/Update`,
            data: formData,
            contentType: false,
            processData: false,
            success: function (data) {
                if (data.isSuccess && data.value) {
                    switch (Number(DanhMucID)) {
                        case 193: {
                            showNotification(1, "Chỉnh sửa cơ sở kinh doanh dịch vụ - thể thao thành công")
                            setTimeout(function () {
                                window.location.href = `${baseUrl}/AdminTool/CoSoTraiNghiem/TheThao`;
                            }, 2000);
                            break;
                        }
                        case 194: {
                            showNotification(1, "Chỉnh sửa cơ sở chăm sóc sức khỏe thành công")
                            setTimeout(function () {
                                window.location.href = `${baseUrl}/AdminTool/CoSoTraiNghiem/ChamSocSucKhoe`;
                            }, 2000);
                            break;
                        }
                        case 196: {
                            showNotification(1, "Chỉnh sửa cơ sở vui chơi giải trí thành công")
                            setTimeout(function () {
                                window.location.href = `${baseUrl}/AdminTool/CoSoTraiNghiem/VuiChoiGiaiTri`;
                            }, 2000);
                            break;
                        }
                        case 191: {
                            showNotification(1, "Chỉnh sửa cơ sở mua sắm thành công")
                            setTimeout(function () {
                                window.location.href = `${baseUrl}/AdminTool/CoSoTraiNghiem/MuaSam`;
                            }, 2000);
                            break;
                        }
                    }
                   
                } else {
                    switch (Number(DanhMucID)) {
                        case 193: {
                            showNotification(0, "Chỉnh sửa cơ sở kinh doanh dịch vụ - thể thao không thành công")
                            break;
                        }
                        case 194: {
                            showNotification(0, "Chỉnh sửa cơ sở chăm sóc sức khỏe không thành công")
                            break;
                        }
                        case 196: {
                            showNotification(0, "Chỉnh sửa cơ sở vui chơi giải trí không thành công")
                            break;
                        }
                        case 191: {
                            showNotification(0, "Chỉnh sửa cơ sở mua sắm không thành công")
                            break;
                        }
                    }
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
    }


    
}

function loadTranslation(CoSoDichVuID, maNgonNgu) {
    getDataWithApi('GET', `/api/DL_CoSoDichVuTraiNghiemApi/Get?MaNgonNgu=${maNgonNgu}&CoSoDichVuID=${CoSoDichVuID}`).then(data => {
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
        hopLe = true;
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