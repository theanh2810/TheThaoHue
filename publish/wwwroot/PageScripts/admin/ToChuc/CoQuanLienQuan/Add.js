const baseUrl = getRootLink();
const ckeditorgioiThieuDich = CKEDITOR.replace('gioiThieuDich');
const ckeditorghiChuDich = CKEDITOR.replace('ghiChuDich');

$(document).ready(function () {
    initDatePicker();
    initDanhMucChung_NoAll(85, "#loaiHinh", "")
    initDanhMucChung_NoAll(34, "#coQuanChuQuan", "")
    initNgonNgu("#ngonNguDich")
    initTinhThanhPho()
    initSelect2();
    if (isEdit && coQuanId) {
        setTimeout(function() {
            loadCoQuanData(coQuanId)
        }, 100);
    }

    // Event handler cho thay đổi tỉnh/thành phố
    $(document).on('change', '#tinhThanhPho', function() {
        const tinhID = $(this).val();
        if (tinhID) {
            initPhuongXa(tinhID);
        } else {
            $("#phuongXa").empty().append(`<option value="">Chọn</option>`);
        }
    });

    // Khi thay đổi Ngôn ngữ, reset các input trong phần đa ngữ
    $(document).on('change', '#ngonNguDich', function() {
        let maNgonNgu = $(this).val();
        const coQuanId = $('#coQuanId').val();
        
        if (coQuanId && maNgonNgu) {
            // Load bản dịch cho ngôn ngữ được chọn
            loadToChucTranslation(coQuanId, maNgonNgu);
        } else {
            // Nếu chưa có cơ quan (tạo mới) hoặc chưa chọn ngôn ngữ, clear các trường dịch
            if (!coQuanId) {
                $('#tenCoQuanDich').val('');
                $('#diaChiDich').val('');
                if (typeof ckeditorgioiThieuDich !== 'undefined') ckeditorgioiThieuDich.setData('');
                if (typeof ckeditorghiChuDich !== 'undefined') ckeditorghiChuDich.setData('');
            }
        }
    });

    $("#formToChuc").on("submit", function (e) {
        e.preventDefault();
        
        const submitBtn = $(this).find('button[type="submit"]');
        if (submitBtn.prop('disabled')) {
            return;
        }
        
        submitBtn.prop('disabled', true);
        const originalText = submitBtn.find('#submitText').text();
        submitBtn.find('#submitText').text('Đang xử lý...');
        
        try {
            dataAdd();
        } catch (error) {
            console.error('Lỗi khi xử lý form:', error);
        } finally {
            setTimeout(() => {
                submitBtn.prop('disabled', false);
                submitBtn.find('#submitText').text(originalText);
            }, 1000);
        }
    });
});

function initTinhThanhPho() {
    getDataWithApi('GET', '/api/CapTinhApi/Gets').then(data => {
        if (data && data.isSuccessed && data.resultObj) {
            $("#tinhThanhPho").empty().append(`<option value="">Chọn</option>`);
            data.resultObj.forEach(item => {
                const displayText = item.noiDung || item.tenTinh || 'Không rõ tên';
                $("#tinhThanhPho").append(`<option value="${item.tinhID}">${displayText}</option>`);
            });
        }
    })
}

function initPhuongXa(tinhID = null) {
    getDataWithApi('GET', `/api/CapXaApi/GetByMaTinh?MaNgonNgu=vi&MaTinh=${tinhID ? `${tinhID}` : ''}`).then(data => {
        $("#phuongXa").empty().append(`<option value="">Chọn</option>`);
        if (data && data.isSuccess && data.value) {
            data.value.forEach(item => {
                const displayText = item.noiDung || item.tenXa || 'Không rõ tên';
                $("#phuongXa").append(`<option value="${item.xaID}">${displayText}</option>`);
            });
        }
    })
}

function dataAdd() {
    //Thông tin chung
    let id = $('#coQuanId').val();
    let maDinhDanh = $('#maCoQuan').val();
    let loaiHinh = $('#loaiHinh').val();
    let quyMo = $('#quyMo').val();
    let dienThoai = $('#soDienThoai').val();
    let hopThu = $('#hopThu').val();
    let website = $('#website').val();
    let tinhID = $('#tinhThanhPho').val();
    let xaID = $('#phuongXa').val();
    let ngayThanhLap = $('#ngayThanhLap').val();
    let soGiayPhep = $('#soGiayPhep').val();
    let thuTu = $('#thuTu').val();
    let trangThai = $("input[name='trangThai']:checked").val();

    //Đa ngữ
    let ngonNguDich = $('#ngonNguDich').val();
    let tenCoQuan = $('#tenCoQuanDich').val();
    let diaChi = $('#diaChiDich').val();
    let gioiThieu = typeof ckeditorgioiThieuDich !== 'undefined' ? ckeditorgioiThieuDich.getData() : '';
    let ghiChu = typeof ckeditorghiChuDich !== 'undefined' ? ckeditorghiChuDich.getData() : '';

    //Thông tin dư thừa
    let coQuanChuQuan = $('#coQuanChuQuan').val();
    let phamViHoatDong = $('#phamViHoatDong').val();

    let dt = {
        "loaiToChucID": 437, // ID cho đơn vị doanh nghiệp lữ hành
        "linhVucID": 5, // ID cho lĩnh vực văn hóa
        "maDinhDanh": maDinhDanh?.trim() || null,
        "trangThaiID": parseInt(trangThai) || 1,
        "hopThu": hopThu?.trim() || null,
        "dienThoai": dienThoai?.trim() || null,
        "website": website?.trim() || null,
        "ngayThanhLap": formatDateToSendWithoutTime(ngayThanhLap) || null,
        "soGiayPhepHoatDong": soGiayPhep?.trim() || null,
        "coQuanChuQuanID": parseInt(coQuanChuQuan) || 0,
        "phamViHoatDongID": parseInt(phamViHoatDong) || 0,
        "loaiHinhID": loaiHinh,
        "tinhID": tinhID,
        "xaID": xaID,
        "quyMo": quyMo?.trim() || null,
        "thuTu": thuTu ? thuTu : null,
        "trangThai": trangThai == 1 ? true: false,
        "toChuc_NoiDungs": [
            {
                "id": 0,
                "maNgonNgu": ngonNguDich || "vi",
                "tenToChuc": tenCoQuan?.trim(),
                "diaChi": diaChi?.trim() || null,
                "gioiThieu": gioiThieu?.trim() || null,
                "ghiChu": ghiChu?.trim() || null
            }
        ]
    };


    if (checkTagHtmlSingle(maDinhDanh)) {
        showNotification(0, "Mã cơ quan dịch vụ chứa ký tự không hợp lệ")
    }
    else if (maDinhDanh != null && maDinhDanh != '' && checkUnique(maDinhDanh.trim(), id ? id : null) > 0) {
        showNotification(0, "Mã cơ quan dịch vụ đã tổn tại")
    }
    else if (checkEmptyBlank(loaiHinh)) {
        showNotification(0, "Vui lòng chọn loại hình")
    }
    //else if (checkTagHtmlSingle(quyMo)) {
    //    showNotification(0, "Quy mô chứa ký tự không hợp lệ")
        //}

    else if (checkTagHtmlSingle(dienThoai)) {
        showNotification(0, "Số điện thoại chứa ký tự không hợp lệ")
    }
    else if (isValidPhoneNumber(dienThoai)) {
        showNotification(0, "Số điện thoại không hợp lệ")
    }
    else if (checkTagHtmlSingle(hopThu)) {
        showNotification(0, "Hộp thư chứa ký tự không hợp lệ")
    }
    else if (isValidEmailAllowEmpty(hopThu)) {
        showNotification(0, "Hộp thư không hợp lệ")
    }
    else if (checkTagHtmlSingle(website)) {
        showNotification(0, "Website chứa ký tự không hợp lệ")
    }
    else if (isValidUrlAllowEmpty(website)) {
        showNotification(0, "Website không hợp lệ")
    }
    else if (checkEmptyBlank(tinhID)) {
        showNotification(0, "Vui lòng chọn tỉnh/thành phố")
    }
    else if (checkEmptyBlank(xaID)) {
        showNotification(0, "Vui lòng chọn xã/phường/đặc khu")
    }
    else if (ngayThanhLap != null && (new Date(formatDateToSendWithoutTime(ngayThanhLap))) > new Date()) {
        showNotification(0, "Ngày thành lập không hợp lệ")
    }
    else if (checkTagHtmlSingle(soGiayPhep)) {
        showNotification(0, "Số giấy phép chứa ký tự không hợp lệ")
    }
    else if (isValidPositiveIntegerAllowEmpty(thuTu) || thuTu > 2147483647) {
        showNotification(0, "Thứ tự không hợp lệ")
    }
    else if (checkEmptyBlank(tenCoQuan)) {
        showNotification(0, "Vui lòng nhập tên cơ quan dịch vụ")
    }
    else if (checkTagHtmlSingle(tenCoQuan)) {
        showNotification(0, "Tên cơ quan dịch vụ chứa ký tự không hợp lệ")
    }
    else if (checkTagHtmlSingle(diaChi)) {
        showNotification(0, "Địa chỉ chứa ký tự không hợp lệ")
    }
    else {
        if (checkEmptyBlank(id)) {
            $.ajax({
                type: 'POST',
                url: `${baseUrl}/api/ToChucApi/ThemMoi`,
                async: false,
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(dt),
                success: function (data) {
                    if (data.isSuccess && data.value) {
                        showNotification(1, "Thêm mới cơ quan liên quan thành công");
                        console.log(data)
                        setTimeout(() => {
                            window.location.href = `${baseUrl}/AdminTool/CoQuanLienQuan/CoQuanLienQuan`;
                        }, 1500);
                    } else {
                        showNotification(0, "Thêm mới cơ quan liên quan không thành công");
                        console.log(data.error)
                    }
                },
                error: function (err) {
                    console.log(err)
                }
            })
        }
        else {
            $.ajax({
                type: 'PUT',
                url: `${baseUrl}/api/ToChucApi/ChinhSua/${id}`,
                async: false,
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(dt),
                success: function (data) {
                    if (data.isSuccess && data.value) {
                        showNotification(1, "Chỉnh sửa cơ quan liên quan thành công");
                        console.log(data)
                        setTimeout(() => {
                            window.location.href = `${baseUrl}/AdminTool/CoQuanLienQuan/CoQuanLienQuan`;
                        }, 1500);
                    } else {
                        showNotification(0, "Chỉnh sửa cơ quan liên quan không thành công");
                        console.log(data.error)
                    }
                },
                error: function (err) {
                    console.log(err)
                }
            })
        }
    }


   
}

function initTable() {
    const tableApi = {
        url: `${baseUrl}/api/DiaDiemApi/DanhSach`,
        type: "POST",
        data: function () {
            return JSON.stringify({
                diaDiemID: list,
                maNgonNgu: "vi",
                trangThai: true
            });
        },
        contentType: 'application/json; charset=utf-8',
        dataSrc: function (data) {
            console.log(data)
            if (data && data.isSuccess && data.value.length > 0) {
                data.value.forEach((item, index) => {
                    item.stt = index + 1;
                });
                return data.value;
            }
            return [];
        },
    };

    const tableDefs = [
        {
            targets: 3, // Cột số lượng cán bộ
            render: function (data, type, row, meta) {
                return `<div class="group-info">
                            <div class="">Kinh độ: ${row.kinhDo ? row.kinhDo : "-"}</div>
                            <div class="">Vĩ độ: ${row.viDo ? row.viDo : "-"}</div>
                        </div>`;
            }
        }
    ];

    const tableCols = [
        { "data": "stt", "width": "40px", "class": "left-align" },
        { "data": "tenDiaDiem", "class": "left-align name-text" },
        { "data": "diaChi", "width": "30%", "class": "left-align" },
        { "data": "", "width": "30%", "class": "left-align" }
    ];

    initDataTableConfigNoSearch('dataGridDiaDiem', tableApi, tableDefs, tableCols);
}

function loadCoQuanData(id) {
    console.log(id)
    let data = JSON.stringify({
        loaiToChucID: 437, // đơn vị doanh nghiệp lữ hành
        toChucID: id
    })

    getDataWithApi('POST', '/api/ToChucApi/DanhSach', data).then(data => {
        console.log(data)
        if (data && data.isSuccess && data.value) {
            const item = data.value[0];
            // Thông tin chung
            $('#pageTitle').text(`Chỉnh sửa ${item.tenToChuc}`);
            $('#coQuanId').val(item.toChucID);
            $('#maCoQuan').val(item.maDinhDanh);
            $('#loaiHinh').val(item.loaiHinhID).trigger('change');
            $('#quyMo').val(item.quyMo);
            $('#soDienThoai').val(item.dienThoai);
            $('#hopThu').val(item.hopThu);
            $('#website').val(item.website);
            $('#tinhThanhPho').val(item.tinhID).trigger('change');
            setTimeout(function() {
                $('#phuongXa').val(item.xaID).trigger('change');
            }, 100);
            $('#ngayThanhLap').val(formatDateWithoutTime(item.ngayThanhLap));
            $('#soGiayPhep').val(item.soGiayPhepHoatDong);
            $('#thuTu').val(item.thuTu || 1);
            $(`input[name="trangThai"][value="${item.trangThaiID}"]`).prop('checked', true);

            // Đa ngữ
            $('#tenCoQuanDich').val(item.tenToChuc);
            $('#diaChiDich').val(item.diaChi);
            if (typeof ckeditorgioiThieuDich !== 'undefined') ckeditorgioiThieuDich.setData(item.gioiThieu || '');
            if (typeof ckeditorghiChuDich !== 'undefined') ckeditorghiChuDich.setData(item.ghiChu || '');

            // Thông tin phụ
            $('#coQuanChuQuan').val(item.coQuanChuQuanID).trigger('change');
            $('#phamViHoatDong').val(item.phamViHoatDongID).trigger('change');
        } else {
            showNotification(0, 'Không tìm thấy thông tin đơn vị doanh nghiệp lữ hành');
        }
    })
}

function loadToChucTranslation(toChucID, maNgonNgu) {
    getDataWithApi('GET', `/api/ToChucApi/BanDich/${toChucID}?maNgonNgu=${maNgonNgu}`).then(data => {
        if (data && data.isSuccess && data.value.length > 0) {
            const translation = data.value[0];
            // Populate các trường dịch với dữ liệu đa ngữ
            $('#tenCoQuanDich').val(translation.tenToChuc || '');
            $('#diaChiDich').val(translation.diaChi || '');
            if (typeof ckeditorgioiThieuDich !== 'undefined') ckeditorgioiThieuDich.setData(translation.gioiThieu || '');
            if (typeof ckeditorghiChuDich !== 'undefined') ckeditorghiChuDich.setData(translation.ghiChu || '');
        } else {
            // Nếu không có bản dịch, clear các trường dịch
            $('#tenCoQuanDich').val('');
            $('#diaChiDich').val('');
            if (typeof ckeditorgioiThieuDich !== 'undefined') ckeditorgioiThieuDich.setData('');
            if (typeof ckeditorghiChuDich !== 'undefined') ckeditorghiChuDich.setData('');
        }
    })
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

const checkUnique = (maDinhDanh, toChucID) => {
    let result = 0
    let url = `${baseUrl}/api/ToChucApi/CheckUnique?MaDinhDanh=${maDinhDanh}&LoaiToChucID=437`
    if (toChucID) {
        url = `${url}&ToChucID=${toChucID}`
    }
    $.ajax({
        type: "GET",
        async: false,
        url: url,
        contentType: 'application/json;charset=utf-8',
        dataType: 'json',
        success: function (data) {
            console.log(data)
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

const isValidPhoneNumber = (value) => {
    const regex = /^$|^\d{10,11}$/;
    return !regex.test(value);
}
//#endregion function validation