const baseUrl = getRootLink();
let translations = [];
const ckeditorgioiThieuDich = CKEDITOR.replace('gioiThieuDich');
const ckeditorghiChuDich = CKEDITOR.replace('ghiChuDich');

$(document).ready(function () {
    initDatePicker();
    initDanhMucChung_NoAll(22, "#loaiHinh", "")
    initDanhMucChung_NoAll(34, "#coQuanChuQuan", "")
    initDanhMucChung_NoAll(9, "#linhVucChuyenSauAdd", "")
    initDanhMucChung_NoAll(6, "#tanSuatAdd", "")
    initNgonNgu("#ngonNguDich")
    initNgonNgu("#ngonNguAdd")
    initTinhThanhPho()
    initSelect2();
    if (isEdit && coQuanId) {
        setTimeout(function() {
            loadCoQuanData(coQuanId)
            initAnPhamTable(coQuanId)
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


    $("#btnSaveAdd").on("click", function () {
        dataEdit()
    })

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
                ckeditorgioiThieuDich.setData('');
                ckeditorghiChuDich.setData('');
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
            dataEdit();
        } catch (error) {
            console.error('Lỗi khi xử lý form:', error);
        } finally {
            setTimeout(() => {
                submitBtn.prop('disabled', false);
                submitBtn.find('#submitText').text(originalText);
            }, 1000);
        }
    });

    $("#formAdd").on("submit", function (e) {
        e.preventDefault();

        const submitBtn = $(this).find('button[type="submit"]');
        if (submitBtn.prop('disabled')) {
            return;
        }
        
        submitBtn.prop('disabled', true);
        const originalText = submitBtn.find('#submitText').text();
        submitBtn.find('#submitText').text('Đang xử lý...')

        try {
            dataAddAnPham(coQuanId);
            initAnPhamTable(coQuanId);
        } catch (error) {
            console.error('Lỗi khi xử lý form:', error);
        } finally {
            setTimeout(() => {
                submitBtn.prop('disabled', false);
                submitBtn.find('#submitText').text(originalText);
            }, 1000);
        }
    });

    // Event handler cho nút thêm ấn phẩm
    $('#btnThemAnPham').on('click', function() {
        // Reset form
        $('#modalAdd').find('input[type=text], textarea, input[type=hidden]').val('');
        $('#modalAdd').find('select').val('vi').trigger('change');
        $('#modalAdd').find('input[type=radio][value=1], input[type=checkbox][value=1]').prop('checked', true);
        $('#modalAdd').modal('show');
        $('#modalAddTitle').text('Thêm mới ấn phẩm/kênh phát sóng');
    });

    $('#tableAnPham tbody').on('click', '.edit-command-btn', function () {
        var id = $(this).attr("ID").match(/\d+/)[0];
        var data = $('#tableAnPham').DataTable().row(id).data();
        $('#idAnPhamAdd').val(data.baoChiAnPhamID);

        // Các input text
        $('#tanSuatAdd').val(data.tanSuatID).trigger('change');
        $('#linhVucChuyenSauAdd').val(data.linhVucChuyenSauID).trigger('change');
        // Radio trạng thái
        $(`input[name="trangThaiAdd"][value="${data.trangThai ? "1" : "0"}"]`).prop('checked', true);

        translations = [];
        getDataWithApi('GET', `/api/BaoChiAnPhamApi/BanDich/${data.baoChiAnPhamID}`).then(data => {
            if (data && data.isSuccess && data.value) {
                translations = data.value
                var banDich_vi = translations.find(el => el.maNgonNgu === 'vi')
                $('#ngonNguAdd').val('vi').trigger('change');
                $('#tenAnPhamAdd').val(banDich_vi.tenAnPham);
                $('#doiTuongDocGiaAdd').val(banDich_vi.doiTuongDocGia);
            } else {
                console.log(data.error)
        }
        })

        $('#modalAdd').modal('show');
    });
    
    $('#tableAnPham tbody').on('click', '.delete-command-btn', function () {
        var id = $(this).attr("ID").match(/\d+/)[0];
        var data = $('#tableAnPham').DataTable().row(id).data();

        $('#idDelete').val(data.baoChiAnPhamID);
        $('#nameDelete').text(`${data.tenAnPham}`);

        $('#modalDelete').modal('show');
    });

    $("#modalAdd").on('hidden.bs.modal', function () {
        translations = []
        $(this).find('input[type=text], textarea').val('');
        $(this).find('select').val('vi').trigger('change');
        $(this).find('input[type=radio][value=1], input[type=checkbox][value=1]').prop('checked', true);
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

function dataEdit() {
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
    let toaDoX = $('#toaDoX').val();
    let toaDoY = $('#toaDoY').val();

    //Đa ngữ
    let ngonNguDich = $('#ngonNguDich').val();
    let tenCoQuan = $('#tenCoQuanDich').val();
    let diaChi = $('#diaChiDich').val();
    let gioiThieu = ckeditorgioiThieuDich.getData();
    let ghiChu = ckeditorghiChuDich.getData();

    //Thông tin dư thừa
    let coQuanChuQuan = $('#coQuanChuQuan').val();
    let phamViHoatDong = $('#phamViHoatDong').val();

    let dt = {
        "loaiToChucID": 97, // ID cho cơ quan báo chí
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
        "toaDoX": toaDoX?.trim() || null,
        "toaDoY": toaDoY?.trim() || null,
        "loaiHinhID": loaiHinh,
        "tinhID": tinhID,
        "xaID": xaID,
        "quyMo": quyMo?.trim() || null,
        "thuTu": thuTu,
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
        showNotification(0, "Mã cơ quan báo chí chứa ký tự không hợp lệ")
    }
    else if (maDinhDanh != null && maDinhDanh != '' && checkUnique(maDinhDanh.trim(), id) > 0) {
        showNotification(0, "Mã cơ quan báo chí đã tồn tại")
    }
    else if (checkEmptyBlank(loaiHinh)) {
        showNotification(0, "Vui lòng chọn loại hình")
    }
    //else if (checkTagHtmlSingle(quyMo)) {
    //    showNotification(0, "Quy mô chứa ký tự không hợp lệ")
    //}
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
        showNotification(0, "Vui lòng chọn phường/xã/đặc khu")
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
        showNotification(0, "Vui lòng nhập tên cơ quan báo chí")
    }
    else if (checkTagHtmlSingle(tenCoQuan)) {
        showNotification(0, "Tên cơ quan báo chí chứa ký tự không hợp lệ")
    }
    else if (checkTagHtmlSingle(diaChi)) {
        showNotification(0, "Địa chỉ chứa ký tự không hợp lệ")
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
                    showNotification(1, "Chỉnh sửa cơ quan báo chí thành công");
                    console.log(data)
                    setTimeout(() => {
                        window.location.href = `${baseUrl}/AdminTool/BaoChi/CoQuanBaoChi`;
                    }, 1500);
                } else {
                    showNotification(0, "Chỉnh sửa cơ quan báo chí không thành công");
                    console.log(data.error)
                }
            },
            error: function (err) {
                console.log(err)
            }
        })
    }


   
}

function loadCoQuanData(id) {
    console.log(id)
    let data = JSON.stringify({
        loaiToChucID: 97, // cơ quan báo chí
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
            $('#toaDoX').val(item.toaDoX)
            $('#toaDoY').val(item.toaDoY)
            $('#thuTu').val(item.thuTu || 1);
            $(`input[name="trangThai"][value="${item.trangThaiID}"]`).prop('checked', true);

            // Đa ngữ
            $('#tenCoQuanDich').val(item.tenToChuc);
            $('#diaChiDich').val(item.diaChi);
            ckeditorgioiThieuDich.setData(item.gioiThieu || '');
            ckeditorghiChuDich.setData(item.ghiChu || '');

            // Thông tin phụ
            $('#coQuanChuQuan').val(item.coQuanChuQuanID).trigger('change');
            $('#phamViHoatDong').val(item.phamViHoatDongID).trigger('change');
        } else {
            showNotification(0, 'Không tìm thấy thông tin cơ quan báo chí');
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
            ckeditorgioiThieuDich.setData(translation.gioiThieu || '');
            ckeditorghiChuDich.setData(translation.ghiChu || '');
        } else {
            // Nếu không có bản dịch, clear các trường dịch
            $('#tenCoQuanDich').val('');
            $('#diaChiDich').val('');
            ckeditorgioiThieuDich.setData('');
            ckeditorghiChuDich.setData('');
        }
    })
}

function initAnPhamTable(coQuanBaoChiID) {
    const tableApi = {
        url: `${baseUrl}/api/BaoChiAnPhamApi/DanhSach`,
        type: "POST",
        data: function (d) {
            return JSON.stringify({
                toChucID: coQuanBaoChiID,
                maNgonNgu: 'vi'
            });
        },
        contentType: 'application/json; charset=utf-8',
        dataSrc: function (data) {
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
            targets: 1,
            render: function (data, type, row, meta) {
                return `<span class="detail-command-btn" id=n-"${meta.row}">${data}</span>`;
            }
        },
        {
            targets: 5,
            render: function (data, type, row, meta) {
                if (row.trangThai) {
                    return `<span class="TrangThai green-text">Đã phát hành</span>`;
                }
                else {
                    return `<span class="TrangThai yellow-text">Chưa phát hành</span>`;
                }
            }
        },
        {
            targets: 6,
            render: function (data, type, row, meta) {
                let html = ""
                if (permitedEdit) {
                    html += `<i data-toggle="tooltip" title="Chỉnh sửa" class="edit-command-btn text-yellow" id=n-"${meta.row}">
                                <i class="hgi-icon hgi-edit"></i>
                            </i>`;
                }
                if (permitedDelete) {
                    html += `<i data-toggle="tooltip" title="Xoá" class="delete-command-btn text-red" id=n-"${meta.row}">
                                <i class="hgi-icon hgi-delete"></i>
                            </i>`
                }
                return html
            }
        }
    ];

    const tableCols = [
        { "data": "stt", "width": "40px", "class": "center-align" },
        { "data": "tenAnPham", "width": "", "class": "left-align name-text" },
        { "data": "tenTanSuat", "width": "15%", "class": "left-align" },
        { "data": "tenLinhVucChuyenSau", "width": "15%", "class": "left-align" },
        { "data": "soLuong", "width": "150px", "class": "center-align" },
        { "data": "trangThai", "width": "120px", "class": "left-align" },
        { "data": "", "width": "120px", "class": "center-align group-icon-action" },
    ];

    if (!permitedEdit && !permitedDelete) {
        tableCols.pop();
        tableDefs.pop();
    }

    initDataTableConfigNoSearch('tableAnPham', tableApi, tableDefs, tableCols);
}

function dataAddAnPham(coQuanBaoChiID) {
    let idAnPham = $('#idAnPhamAdd').val();
    let linhVucChuyenSau = $('#linhVucChuyenSauAdd').val() || null;
    let tanSuat = $('#tanSuatAdd').val();
    let trangThai = $("input[name='trangThaiAdd']:checked").val();

    let maNgonNgu = $("#ngonNguAdd").val();
    let tenAnPham = $("#tenAnPhamAdd").val().trim();
    let doiTuongDocGia = $("#doiTuongDocGiaAdd").val().trim();

    let thongTinChung = {
        "BaoChiAnPhamID": idAnPham || "00000000-0000-0000-0000-000000000000",
        "LinhVucChuyenSauID": linhVucChuyenSau,
        "TanSuatID": tanSuat,
        "ToChucID": coQuanBaoChiID,
        "trangThai": trangThai == "1" ? true : false,
    };

    let thongTinDaNgu = [{
        maNgonNgu: maNgonNgu,
        tenAnPham: tenAnPham.trim(),
        doiTuongDocGia: doiTuongDocGia.trim(),
    }]

    let formData = new FormData()
    formData.append("BaoChiAnPham", JSON.stringify(thongTinChung));
    formData.append("BaoChiAnPham_NoiDung", JSON.stringify(thongTinDaNgu));

    if (idAnPham) {
        $.ajax({
            type: 'PUT',
            url: `${baseUrl}/api/BaoChiAnPhamApi/ChinhSua/${idAnPham}`,
            async: false,
            contentType: false,
            processData: false,
            data: formData,
            success: function (data) {
                if (data.isSuccess && data.value) {
                    showNotification(1, "Chỉnh sửa nhà xuất bản thành công");
                    $('#modalAdd').modal('hide');
                } else {
                    showNotification(0, "Chỉnh sửa nhà xuất bản không thành công");
                    console.log(data.error)
                }
            },
            error: function (err) {
                console.log(err)
            }
        })
    } else {
        $.ajax({
            type: 'POST',
            url: `${baseUrl}/api/BaoChiAnPhamApi/ThemMoi`,
            async: false,
            contentType: false,
            processData: false,
            data: formData,
            success: function (data) {
                if (data.isSuccess && data.value) {
                    showNotification(1, "Thêm mới ấn phẩm báo chí thành công");
                    $('#modalAdd').modal('hide');
                } else {
                    showNotification(0, "Thêm mới ấn phẩm báo chí không thành công");
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

const checkUnique = (maDinhDanh, toChucID) => {
    let result = 0
    let url = `${baseUrl}/api/ToChucApi/CheckUnique?MaDinhDanh=${maDinhDanh}&LoaiToChucID=97`
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
//#endregion function validation
