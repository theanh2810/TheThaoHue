const baseUrl = getRootLink();
const ckeditorgioiThieuDich = CKEDITOR.replace('gioiThieuDich');
const ckeditorghiChuDich = CKEDITOR.replace('ghiChuDich');
var coQuanTranslations = [];
$(document).ready(function () {
    ; (async function () {
        await Promise.all([
            initSelect2(),
            initTinhThanhPho(),
            initDatePicker(),
            initNgonNgu("#ngonNguDich"),
        ]);
        if (!checkEmptyBlank(coQuanID)) {
            initCoQuanBanHanh(coQuanID)
        }
    })();

    // Event handler cho thay đổi tỉnh/thành phố
    $(document).on('change', '#tinhThanhPho', function() {
        const tinhID = $(this).val();
        if (tinhID) {
            initPhuongXa(tinhID);
        } else {
            $("#phuongXa").empty().append(`<option value="">Chọn</option>`);
        }
    });

    $("#btnSaveAndNext").on("click", async function (e) {
        e.preventDefault();
        coQuanTranslations = coQuanTranslations.filter(t => t.tenToChuc && t.tenToChuc.trim() !== '')

        const submitBtn = $(this)
        if (submitBtn.prop('disabled')) {
            return; // Disable submit button để tránh spam
        }
        
        submitBtn.prop('disabled', true);
        $("#btnSaveAndClose").prop('disabled', true);
        const originalText = submitBtn.text();
        submitBtn.text('Đang xử lý...');
        
        try {
            await dataAdd(false);
        } catch (error) {
            console.error('Lỗi khi xử lý form:', error);
        } finally {
            setTimeout(() => {
                submitBtn.prop('disabled', false);
                $("#btnSaveAndClose").prop('disabled', false);
                submitBtn.text(originalText);
            }, 1000);
            scrollTop();
        }
    })
    $("#btnSaveAndClose").on("click", async function (e) {
        e.preventDefault();
        
        const submitBtn = $(this)
        if (submitBtn.prop('disabled')) {
            return; // Disable submit button để tránh spam
        }
        
        submitBtn.prop('disabled', true);
        $("#btnSaveAndNext").prop('disabled', true);
        const originalText = submitBtn.text();
        submitBtn.text('Đang xử lý...');
        
        try {
            await dataAdd(true);
        } catch (error) {
            console.error('Lỗi khi xử lý form:', error);
        } finally {
            setTimeout(() => {
                submitBtn.prop('disabled', false);
                $("#btnSaveAndNext").prop('disabled', false);
                submitBtn.text(originalText);
            }, 1000);
        }
    })

    //#region TRANSLATION CHANGE LANGUAGE
    $("#tenCoQuanDich, #diaChiDich").on("blur", function () {
        saveTempCoQuanTranslation();
    });

    ckeditorgioiThieuDich.on("change", function () {
        saveTempCoQuanTranslation()
    })

    ckeditorghiChuDich.on("change", function () {
        saveTempCoQuanTranslation()
    })


    // Sự kiện đổi ngôn ngữ → bind lại dữ liệu đã lưu
    $("#ngonNguDich").on("change", function () {
        let maNgonNgu = $(this).val();
        let exist = coQuanTranslations.find(t => t.maNgonNgu === maNgonNgu);

        if (exist) {
            $("#tenCoQuanDich").val(exist.tenToChuc);
            $("#diaChiDich").val(exist.diaChi);
            ckeditorghiChuDich.setData(exist.ghiChu);
            ckeditorgioiThieuDich.setData(exist.gioiThieu);
        } else {
            // reset nếu chưa có dữ liệu
            $("#tenCoQuanDich").val("");
            $("#diaChiDich").val("");
            ckeditorghiChuDich.setData("");
            ckeditorgioiThieuDich.setData("");
        }
    });
    //#endregion TRANSLATION CHANGE LANGUAGE
   
    $("#modalAdd").on('hidden.bs.modal', function () {
        translations = []
        $(this).find('input[type=text], textarea').val('');
        $(this).find('select').val('vi').trigger('change');
        $(this).find('input[type=radio][value=1], input[type=checkbox][value=1]').prop('checked', true);
    });
});

async function initTinhThanhPho() {
    await getDataWithApi('GET', '/api/CapTinhApi/Gets').then(data => {
        if (data && data.isSuccessed && data.resultObj) {
            $("#tinhThanhPho").empty().append(`<option value="">Chọn</option>`);
            data.resultObj.forEach(item => {
                const displayText = item.noiDung || item.tenTinh || 'Không rõ tên';
                $("#tinhThanhPho").append(`<option value="${item.tinhID}">${displayText}</option>`);
            });
        }
    })
}

async function initPhuongXa(tinhID = null) {
    await getDataWithApi('GET', `/api/CapXaApi/GetByMaTinh?MaNgonNgu=vi&MaTinh=${tinhID ? `${tinhID}` : ''}`).then(data => {
        $("#phuongXa").empty().append(`<option value="">Chọn</option>`);
        if (data && data.isSuccess && data.value) {
            data.value.forEach(item => {
                const displayText = item.noiDung || item.tenXa || 'Không rõ tên';
                $("#phuongXa").append(`<option value="${item.xaID}">${displayText}</option>`);
            });
        }
    })
}

async function dataAdd(isReturn) {
    //Thông tin chung
    let id = $('#coQuanId').val();
    let maDinhDanh = $('#maCoQuan').val();
    let dienThoai = $('#soDienThoai').val();
    let hopThu = $('#hopThu').val();
    let website = $('#website').val();
    let tinhID = $('#tinhThanhPho').val();
    let xaID = $('#phuongXa').val();
    let ngayThanhLap = $('#ngayThanhLap').val();
    let soGiayPhep = $('#soGiayPhep').val();
    let thuTu = $('#thuTu').val();
    let trangThai = $("input[name='trangThai']:checked").val();

    // Lấy bản dịch tiếng Việt (bắt buộc phải có)
    let tenTiengViet = coQuanTranslations.find(el => el.maNgonNgu === 'vi')?.tenToChuc || null;

    if (checkEmptyBlank(tenTiengViet) || checkEmptyBlank(maDinhDanh) || checkEmptyBlank(ngayThanhLap) || checkEmptyBlank(soGiayPhep)) {
        showNotification(0, 'Vui lòng nhập đầy đủ thông tin bắt buộc (*), bao gồm bản dịch tiếng Việt');
        return null;
    }

    let dt = {
        "toChucID": id || null,
        "loaiToChucID": loaiToChucID,
        "maDinhDanh": maDinhDanh?.trim() || null,
        "trangThaiID": parseInt(trangThai),
        "hopThu": hopThu?.trim() || null,
        "dienThoai": dienThoai?.trim() || null,
        "website": website?.trim() || null,
        "ngayThanhLap": formatDateToSearch(ngayThanhLap),
        "soGiayPhepHoatDong": soGiayPhep?.trim() || null,
        "tinhID": tinhID,
        "xaID": xaID,
        "thuTu": parseInt(thuTu) || 1,
        "toChuc_NoiDungs": coQuanTranslations
    };

    const isAdd = checkEmptyBlank(coQuanID);

    const url = isAdd
        ? '/api/ToChucApi/ThemMoi'
        : `/api/ToChucApi/ChinhSua/${coQuanID}`;

    const method = isAdd ? 'POST' : 'PUT';

    try {
        const res = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(dt)
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText);
        }

        const data = await res.json();

        if (!data || !data.isSuccess || !data.value) {
            return showNotification(0, data.error);
        }

        showNotification(1, isAdd ? 'Thêm mới cơ quan ban hành thành công' : 'Chỉnh sửa cơ quan ban hành thành công');

        if (isReturn) {
            setTimeout(() => window.location.href = '/AdminTool/CoQuanBanHanh', 1500);
        } else {
            coQuanID = data.value.toChucID;
            initCoQuanBanHanh(data.value.toChucID);
        }
    } catch (err) {
        //console.log(err.message);
    }

    //try {
    //    const response = await fetch(`${baseUrl}/api/ToChucApi/ThemMoi`, {
    //        method: 'POST',
    //        headers: {
    //            'Content-Type': 'application/json; charset=utf-8'
    //        },
    //        body: JSON.stringify(dt)
    //    });

    //    const data = await response.json();

    //    if (data && data.isSuccess && data.value) {
    //        showNotification(1, "Thêm mới cơ quan ban hành thành công");
    //    } else {
    //        showNotification(0, data.error);
    //    }
    //} catch (err) {
    //    console.log(err);
    //    showNotification(0, "Có lỗi xảy ra khi thêm mới");
    //    return null;
    //}
}

function initCoQuanBanHanh(id) {
    let data = JSON.stringify({
        loaiToChucID: loaiToChucID,
        toChucID: id
    })

    getDataWithApi('POST', '/api/ToChucApi/DanhSach', data).then(data => {
        if (data && data.isSuccess && data.value) {
            const item = data.value[0];
            // Thông tin chung
            $('#pageTitle').text(`Chỉnh sửa cơ quan ban hành ${item.tenToChuc}`);
            $('#coQuanId').val(item.toChucID);
            $('#maCoQuan').val(item.maDinhDanh);
            $('#soDienThoai').val(item.dienThoai);
            $('#hopThu').val(item.hopThu);
            $('#website').val(item.website);
            $('#tinhThanhPho').val(item.tinhID).trigger('change');
            setTimeout(function() {
                $('#phuongXa').val(item.xaID).trigger('change');
            }, 100);
            $('#ngayThanhLap').val(formatShortDate(item.ngayThanhLap));
            $('#soGiayPhep').val(item.soGiayPhepHoatDong);
            $('#thuTu').val(item.thuTu || 1);
            $(`input[name="trangThai"][value="${item.trangThaiID}"]`).prop('checked', true);
        }
    })

    // Đa ngữ
    getDataWithApi('GET', `/api/ToChucApi/BanDich/${id}`).then(data => {
        if (data && data.isSuccess && data.value.length > 0) {
            coQuanTranslations = data.value;
            $('#ngonNguDich').val('vi').trigger('change');
        } else {
            showNotification(0, "Không tải được dữ liệu đa ngữ");
        }
    })
}

function saveTempCoQuanTranslation() {
    let maNgonNgu = $("#ngonNguDich").val();
    let tenToChuc = $("#tenCoQuanDich").val().trim();
    let diaChi = $("#diaChiDich").val().trim();
    let gioiThieu = ckeditorgioiThieuDich.getData().trim();
    let ghiChu = ckeditorghiChuDich.getData().trim();
    if (!maNgonNgu) return; // phải chọn ngôn ngữ

    // tìm index ngôn ngữ trong mảng
    let index = coQuanTranslations.findIndex(t => t.maNgonNgu === maNgonNgu);

    if (!tenToChuc && !diaChi && !gioiThieu && !ghiChu) {
        // Nếu tất cả đều trống → xóa bản dịch
        if (index !== -1) {
            coQuanTranslations.splice(index, 1);
        }
    } else {
        if (index !== -1) {
            // cập nhật bản dịch đã có
            coQuanTranslations[index].tenToChuc = tenToChuc;
            coQuanTranslations[index].diaChi = diaChi;
            coQuanTranslations[index].gioiThieu = gioiThieu;
            coQuanTranslations[index].ghiChu = ghiChu;
        } else {
            // thêm mới
            coQuanTranslations.push({
                maNgonNgu: maNgonNgu,
                tenToChuc: tenToChuc,
                diaChi: diaChi,
                gioiThieu: gioiThieu,
                ghiChu: ghiChu
            });
        }
    }
}