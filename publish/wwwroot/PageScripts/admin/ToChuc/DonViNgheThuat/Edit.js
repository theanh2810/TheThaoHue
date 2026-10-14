const baseUrl = getRootLink();
const ckeditormoTaDich = CKEDITOR.replace('moTaDichNhanSu');
const ckeditorghiChuDich = CKEDITOR.replace('ghiChuDichNhanSu');
const ckeditortacPhamVaiDien = CKEDITOR.replace('tacPhamVaiDienDichNhanSu');
const ckeditorvaiTroKienThuc = CKEDITOR.replace('vaiTroKienThucDichNhanSu');

$(document).ready(function () {
    initDatePicker();
    initDanhMucChung_NoAll(20, "#loaiHinh", "")
    initDanhMucChung_NoAll(1, "#danTocNhanSu", "")
    initDanhMucChung_NoAll(2, "#chucDanhNhanSu", "")
    initDanhMucChung_NoAll(48, "#danhHieuNhanSu", "")
    initDanhMucChung_NoAll(5, "#gioiTinhNhanSu", "")
    initNgonNgu("#ngonNguDich")
    initNgonNgu("#ngonNguDichNhanSu")
    initTinhThanhPho()
    initTinhThanhPhoNhanSu()
    previewPicture()
    previewPictureSuKien()
    initSelect2();
    if (isEdit && coQuanId) {
        setTimeout(function() {
            loadCoQuanData(coQuanId)
            initTableNhanSu();
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
    $(document).on('change', '#tinhThanhPhoNhanSu', function() {
        const tinhID = $(this).val();
        if (tinhID) {
            initPhuongXaNhanSu(tinhID);
        } else {
            $("#phuongXaNhanSu").empty().append(`<option value="">Chọn</option>`);
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
                $('#gioiThieuDich').val('');
                $('#ghiChuDich').val('');
            }
        }
    });

    $("#btnAddNhanSu").on("click", function () {
        resetDataNhanSu();
        $("#thongTinNhanSu").show();
    });

    $("#btnSavethongTinNhanSu").on("click", function () {
        // Xử lý lưu nhân sự
        const NhanSuID = $("#NhanSuId").val();
        if (NhanSuID) {
            dataEditNhanSu();
        } else {
            dataAddNhanSu();
        }
        //setTimeout(function() {
        //    resetDataNhanSu();
        //}, 2000);
    })

    $("#btnCancelthongTinNhanSu").on("click", function () {
        resetDataNhanSu();
        $("#thongTinNhanSu").hide();
        //$("#danhSachNhanSu").show();
    });

    $("#btnSave").on("click", function () {
        dataAdd(coQuanId);
    })

    $(document).on('change', '#ngonNguDichNhanSu', function () {
        let maNgonNgu = $(this).val();
        let NhanSuId = $("#NhanSuId").val();
        
        if (NhanSuId && maNgonNgu) {
            console.log('Chuyển Ngôn ngữ cho lễ hội hiện tại:', maNgonNgu);
            // Load bản dịch cho ngôn ngữ được chọn
            loadTranslation(NhanSuId, maNgonNgu);
        } else {
            // Nếu chưa có cơ quan (tạo mới) hoặc chưa chọn ngôn ngữ, clear các trường dịch
            if (!NhanSuId || !maNgonNgu) {
                $("#hoVaTenEdit").val('');
                $("#diaChiEdit").val('');
                $("#noiLamViecEdit").val('');
                if (typeof ckeditormoTaDichEdit !== 'undefined') ckeditormoTaDichEdit.setData('');
                if (typeof ckeditorghiChuDichEdit !== 'undefined') ckeditorghiChuDichEdit.setData('');
                if (typeof ckeditortacPhamVaiDienEdit !== 'undefined') ckeditortacPhamVaiDienEdit.setData('');
                if (typeof ckeditorvaiTroKienThucEdit !== 'undefined') ckeditorvaiTroKienThucEdit.setData('');
            }
        }
    });
});


//#region Function Xử lý chung
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

function initTinhThanhPhoNhanSu() {
    getDataWithApi('GET', '/api/CapTinhApi/Gets').then(data => {
        if (data && data.isSuccessed && data.resultObj) {
            $("#tinhThanhPhoNhanSu").empty().append(`<option value="">Chọn</option>`);
            data.resultObj.forEach(item => {
                const displayText = item.noiDung || item.tenTinh || 'Không rõ tên';
                $("#tinhThanhPhoNhanSu").append(`<option value="${item.tinhID}">${displayText}</option>`);
            });
        }
    })
}

function initPhuongXaNhanSu(tinhID = null) {
    getDataWithApi('GET', `/api/CapXaApi/GetByMaTinh?MaNgonNgu=vi&MaTinh=${tinhID ? `${tinhID}` : ''}`).then(data => {
        $("#phuongXaNhanSu").empty().append(`<option value="">Chọn</option>`);
        if (data && data.isSuccess && data.value) {
            data.value.forEach(item => {
                const displayText = item.noiDung || item.tenXa || 'Không rõ tên';
                $("#phuongXaNhanSu").append(`<option value="${item.xaID}">${displayText}</option>`);
            });
        }
    })
}
//#endregion Function Xử lý chung

//#region Function Xử lý thông tin tổ chức
async function dataAdd() {
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
    let gioiThieu = $('#gioiThieuDich').val();
    let ghiChu = $('#ghiChuDich').val();

    //Thông tin dư thừa
    let coQuanChuQuan = $('#coQuanChuQuan').val();
    let phamViHoatDong = $('#phamViHoatDong').val();

    let dt = {
        "loaiToChucID": 93, // ID cho đơn vị nghệ thuật
        "linhVucID": 2, // ID cho lĩnh vực văn hóa
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
        "thuTu": thuTu,
        "trangThai": trangThai,
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
        showNotification(0, "Mã đơn vị nghệ thuật chứa ký tự không hợp lệ")
    }
    else if (maDinhDanh != null && maDinhDanh != '' && checkUnique(maDinhDanh.trim(), id) > 0) {
        showNotification(0, "Mã đơn vị nghệ thuật đã tồn tại")
    }
    else if (checkEmptyBlank(loaiHinh)) {
        showNotification(0, "Vui lòng chọn loại hình")
    }
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
    else if (checkEmptyBlank(tenCoQuan)) {
        showNotification(0, "Vui lòng nhập tên đơn vị nghệ thuật")
    }
    else if (checkTagHtmlSingle(tenCoQuan)) {
        showNotification(0, "Tên đơn vị nghệ thuật ký tự không hợp lệ")
    }
    else if (checkTagHtmlSingle(diaChi)) {
        showNotification(0, "Địa chỉ chứa ký tự không hợp lệ")
    }
    else if (isValidPositiveIntegerAllowEmpty(thuTu) || Number(thuTu) > 2147483647) {
        showNotification(0, "Thứ tự không hợp lệ")
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
                    showNotification(1, "Chỉnh sửa Đơn vị nghệ thuật thành công");
                    setTimeout(() => {
                        window.location.href = `${baseUrl}/AdminTool/DonViNgheThuat`;
                    }, 1500);
                } else {
                    showNotification(0, "Chỉnh sửa Đơn vị nghệ thuật không thành công");
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
        loaiToChucID: 93, // đơn vị nghệ thuật
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
            $('#gioiThieuDich').val(item.gioiThieu);
            $('#ghiChuDich').val(item.ghiChu);

            // Thông tin phụ
            $('#coQuanChuQuan').val(item.coQuanChuQuanID).trigger('change');
            $('#phamViHoatDong').val(item.phamViHoatDongID).trigger('change');
        } else {
            showNotification(0, 'Không tìm thấy thông tin đơn vị nghệ thuật');
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
            $('#gioiThieuDich').val(translation.gioiThieu || '');
            $('#ghiChuDich').val(translation.ghiChu || '');
        } else {
            // Nếu không có bản dịch, clear các trường dịch
            $('#tenCoQuanDich').val('');
            $('#diaChiDich').val('');
            $('#gioiThieuDich').val('');
            $('#ghiChuDich').val('');
        }
    })
}
//#endregion Function Xử lý thông tin tổ chức

//#region Function Xử lý nhân sự
function initTableNhanSu() {
    const tableApi = {
        url: `${baseUrl}/api/DM_CaNhan_NgheSiApi/Gets?MaNgonNgu=vi`,
        type: "GET",
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
            targets: 1, // Cột tên cơ quan báo chí
            render: function (data, type, row, meta) {
                return `<a href="${baseUrl}/AdminTool/NhanSu/Details_NgheSi?id=${row.caNhanID}" class="text-primary text-decoration-none"><div class="group-info have-image round-image">
                        <div class="have-image">
                            <img src="${row.anhChanDung || '/assets/images/vector/no-image.png'}" alt="${row.tenDaPhuongTien || ''}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                        </div>
                        <div class="group-info">
                        <div class="info-main"><div>${row.hoTen || ''}</div></div>
                        <div class="info-sub">${row.maDinhDanh || ''}</div></div>
                </div></a>`;
            }
        },
        {
            targets: 2,
            render: function (data, type, row, meta) {
                return formatDateWithoutTime(row.ngaySinh);
            }
        },
        {
            targets: 6, // Trạng thái
            render: function (data, type, row, meta) {
                if (row.trangThai) {
                    return `<span class="TrangThai green-text">Duyệt</span>`;
                } else {
                    return `<span class="TrangThai red-text">Chưa duyệt</span>`;
                }
            }
        },
        {
            targets: 7, // Chức năng
            render: function (data, type, row, meta) {
                let html = "";
                html += `<i data-toggle="tooltip" title="Chỉnh sửa" class="edit-command-btn text-red cursor-pointer" id="edit-${meta.row}">
                            <i class="hgi-icon hgi-edit"></i>
                        </i>
                        <i data-toggle="tooltip" title="Xóa" class="delete-command-btn text-red cursor-pointer" id="delete-${meta.row}">
                            <i class="hgi-icon hgi-delete"></i>
                        </i>`;
                return html;
            }
        }
    ];

    const tableCols = [
        { "data": "stt", "width": "40px", "class": "left-align" },
        { "data": "", "class": "left-align name-text" },
        { "data": "", "width": "10%", "class": "left-align" },
        { "data": "gioiTinh", "width": "120px", "class": "left-align" },
        { "data": "tenNgheNghiep", "width": "180px", "class": "left-align" },
        { "data": "tenDanhHieu", "width": "180px", "class": "left-align" },
        { "data": "", "width": "120px", "class": "left-align" },
        { "data": "", "width": "120px", "class": "center-align group-icon-action" }
    ];

    initDataTableConfigNoSearch('dataGridNhanSu', tableApi, tableDefs, tableCols);

    // Event handler cho nút xóa
    $('#dataGridNhanSu tbody').on('click', '.delete-command-btn', function () {
        var id = $(this).attr("ID").match(/\d+/)[0];
        var data = $('#dataGridNhanSu').DataTable().row(id).data();

        $('#idDelete').val(data.caNhanID);
        $('#nameDelete').text(`${data.hoTen}`);
        $('#modalDelete').modal('show');
    });

    // Event handler cho nút chỉnh sửa
    $('#dataGridNhanSu tbody').on('click', '.edit-command-btn', function () {
        var id = $(this).attr("ID").match(/\d+/)[0];
        var data = $('#dataGridNhanSu').DataTable().row(id).data();
        console.log(data)
        NhanSuId = data.caNhanID;
        loadDataNhanSu(NhanSuId);

        $("#thongTinNhanSu").show();
    });

    $("#formDelete").on("submit", function (e) {
        e.preventDefault();
        
        const submitBtn = $(this).find('button[type="submit"]');
        if (submitBtn.prop('disabled')) {
            return;
        }
        
        submitBtn.prop('disabled', true);
        const originalText = submitBtn.text();
        submitBtn.text('Đang xóa...');
        
        try {
            dataDelete();
        } catch (error) {
            console.error('Lỗi khi xử lý form:', error);
        } finally {
            setTimeout(() => {
                submitBtn.prop('disabled', false);
                submitBtn.text(originalText);
            }, 1000);
        }
    });
}

function dataDelete() {
    let id = $('#idDelete').val();
    $.ajax({
        url: `${baseUrl}/api/DM_CaNhan_NgheSiApi/Delete?caNhanID=${id}`,
        type: 'DELETE',
        contentType: 'application/json',
        success: function (data) {
            if (data && data.isSuccess && data.value) {
                showNotification(1, 'Xoá thành công')
                $('#modalDelete').modal('hide');
                $('#dataGridNhanSu').DataTable().ajax.reload();
            } else {
                showNotification(0, data.error)
            }
        },
        error: function (err) {
            showNotification(0, 'Có lỗi xảy ra, vui lòng thử lại sau')
        }
    })
}

function dataAddNhanSu() {
    const fileAnhDaiDien = $("#fileAnhDaiDienPrev")[0].files[0] || null;
    const maDinhDanh = $("#maDinhDanhNhanSu").val();
    const gioiTinh = $("#gioiTinhNhanSu").val();
    const ngaySinh = $("#ngaySinhNhanSu").val();
    const danToc = $("#danTocNhanSu").val();
    const soDienThoai = $("#soDienThoaiNhanSu").val();
    const hopThu = $("#hopThuNhanSu").val();
    const tinhThanhPho = $("#tinhThanhPhoNhanSu").val();
    const phuongXa = $("#phuongXaNhanSu").val();
    //const soThe = $("#soTheNhanSu").val();
    //const ngayCap = $("#ngayCapNhanSu").val();
    //const coQuanCap = $("#coQuanCapNhanSu").val();
    //const thuTu = $("#thuTuNhanSu").val();
    const chucDanh = $("#chucDanhNhanSu").val();
    const danhHieu = $("#danhHieuNhanSu").val();
    const trangThai = $("input[name='trangThaiNhanSu']:checked").val() == 1 ? true : false;

    // Đa ngữ
    const ngonNguDich = $("#ngonNguDichNhanSu").val();
    const hoVaTen = $("#hoVaTenNhanSu").val();
    const diaChi = $("#diaChiNhanSu").val();
    const noiLamViec = $("#noiLamViecNhanSu").val();
    const moTa = ckeditormoTaDich.getData();
    const ghiChu = ckeditorghiChuDich.getData();
    const tacPhamVaiDien = ckeditortacPhamVaiDien.getData();
    const vaiTroKienThuc = ckeditorvaiTroKienThuc.getData();

    // Kết quả trả về dạng object
    const dtChung = {
        MaDinhDanh: maDinhDanh,
        gioiTinh: gioiTinh,
        NgaySinh: ngaySinh,
        DanTocID: danToc,
        DienThoai: soDienThoai,
        HopThu: hopThu,
        TinhID: tinhThanhPho,
        XaID: phuongXa,
        ToChucID: coQuanId,
        //ngayCap,
        //coQuanCap,
        //thuTu,
        TrangThai: trangThai,
        NgheNghiepID: chucDanh,
        DanhHieuID: danhHieu,
        MaNgonNgu: ngonNguDich,
        HoTen: hoVaTen,
        DiaChi: diaChi,
        NoiLamViec: noiLamViec,
        MoTa: moTa,
        TacPhamVaiDien: tacPhamVaiDien,
        VaiTroKienThuc: vaiTroKienThuc,
        GhiChu: ghiChu
    };



    let formData = new FormData()
    formData.append('RequestNgheSi', JSON.stringify(dtChung))
    formData.append("File", fileAnhDaiDien)

    if (fileAnhDaiDien == null) {
        showNotification(0, "Vui lòng chọn ảnh đại diện")
    }
    else if (checkEmptyBlank(maDinhDanh)) {
        showNotification(0, "Vui lòng nhập mã định danh (CCCD/Hộ chiếu)")
    }
    else if (checkTagHtmlSingle(maDinhDanh)) {
        showNotification(0, "Mã định danh (CCCD/Hộ chiếu) chứa ký tự không hợp lệ")
    }
    else if (checkUniqueIdentifier(maDinhDanh) > 0) {
        showNotification(0, "Mã định danh (CCCD/Hộ chiếu) đã tồn tại")
    }
    else if (checkEmptyBlank(gioiTinh)) {
        showNotification(0, "Vui lòng chọn giới tính")
    }
    else if (checkTagHtmlSingle(soDienThoai)) {
        showNotification(0, "Số điện thoại chứa ký tự không hợp lệ")
    }
    else if (isValidPhoneNumber(soDienThoai)) {
        showNotification(0, "Số điện thoại không hợp lệ")
    }
    else if (checkTagHtmlSingle(hopThu)) {
        showNotification(0, "Hộp thư chứa ký tự không hợp lệ")
    }
    else if (isValidEmailAllowEmpty(hopThu)) {
        showNotification(0, "Hộp thư không hợp lệ")
    }
    else if (checkEmptyBlank(tinhThanhPho)) {
        showNotification(0, "Vui lòng chọn Tỉnh/Thành phố")
    }
    else if (checkEmptyBlank(phuongXa)) {
        showNotification(0, "Vui lòng chọn Phường/Xã/Đặc khu")
    }
    else if (checkEmptyBlank(hoVaTen)) {
        showNotification(0, "Vui lòng nhập họ và tên cán bộ thể thao")
    }
    else if (checkTagHtmlSingle(hoVaTen)) {
        showNotification(0, "Họ và tên cán bộ thể thao chứa ký tự không hợp lệ")
    }
    else if (checkTagHtmlSingle(diaChi)) {
        showNotification(0, "Địa chỉ chứa ký tự không hợp lệ")
    }
    else if (checkTagHtmlSingle(noiLamViec)) {
        showNotification(0, "Nơi làm việc chứa ký tự không hợp lệ")
    }
    else {
        $.ajax({
            type: 'POST',
            url: `${baseUrl}/api/DM_CaNhan_NgheSiApi/Add`,
            async: false,
            contentType: false,
            processData: false,
            data: formData,
            success: function (data) {
                if (data.isSuccess && data.value) {
                    showNotification(1, "Thêm mới nghệ sĩ thành công");
                    console.log(data)
                    setTimeout(function() {
                        resetDataNhanSu();
                    }, 2000);
                } else {
                    showNotification(0, "Thêm mới nghệ sĩ không thành công");
                    console.log(data.error)
                }
            },
            error: function (err) {
                console.log(err)
            }
        })
    }


   

    console.log('Dữ liệu nghệ sĩ:', dtChung);
}

function loadDataNhanSu(id) {
    getDataWithApi('GET', `/api/DM_CaNhan_NgheSiApi/Get?CaNhanID=${id}&maNgonNgu=vi`).then(data => {
        if (data && data.isSuccess && data.value) {
            const item = data.value;
            console.log('Dữ liệu nghệ sĩ:', item);
            $("#NhanSuId").val(item.caNhanID || '');
            $("#maDinhDanhNhanSu").val(item.maDinhDanh || '');
            $("#showAnhDaiDienAdd").attr('src', item.anhChanDung || '/assets/images/vector/no-image.png');
            $("#showAnhDaiDienDetail").val(item.anhChanDung || '');
            $("#gioiTinhNhanSu").val(item.gioiTinhID || '').trigger('change');
            $("#ngaySinhNhanSu").val(formatDateWithoutTime(item.ngaySinh) || '');
            $("#danTocNhanSu").val(item.danTocID || '').trigger('change');
            $("#soDienThoaiNhanSu").val(item.dienThoai || '');
            $("#hopThuNhanSu").val(item.hopThu || '');
            $("#tinhThanhPhoNhanSu").val(item.tinhID || '').trigger('change');
            setTimeout(() => {
                $("#phuongXaNhanSu").val(item.xaID || '').trigger('change');
            }, 300);
            //$("#soTheNhanSu").val(item.soThe || '');
            //$("#ngayCapNhanSu").val(formatDateWithoutTime(item.ngayCap) || '');
            //$("#coQuanCapNhanSu").val(item.coQuanCap || '');
            $("#thuTuNhanSu").val(item.thuTu || '');
            $("#chucDanhNhanSu").val(item.ngheNghiepID || '').trigger('change');
            $("#danhHieuNhanSu").val(item.danhHieuID || '').trigger('change');
            if (item.trangThai) {
                $("input[name='trangThaiNhanSu'][value='1']").prop('checked', true);
            } else {
                $("input[name='trangThaiNhanSu'][value='0']").prop('checked', true);
            }
            $("#ngonNguDichNhanSu").val(item.maNgonNgu || '').trigger('change');
            $("#hoVaTenNhanSu").val(item.hoTen || '');
            $("#diaChiNhanSu").val(item.diaChi || '');
            $("#noiLamViecNhanSu").val(item.noiLamViec || '');
            if (typeof ckeditormoTaDich !== 'undefined') ckeditormoTaDich.setData(item.moTa || '');
            if (typeof ckeditorghiChuDich !== 'undefined') ckeditorghiChuDich.setData(item.ghiChu || '');
            if (typeof ckeditortacPhamVaiDien !== 'undefined') ckeditortacPhamVaiDien.setData(item.tacPhamVaiDien || '');
            if (typeof ckeditorvaiTroKienThuc !== 'undefined') ckeditorvaiTroKienThuc.setData(item.vaiTroKienThuc || '');
        }
    })
}

function dataEditNhanSu() {
    const NhanSuId = $("#NhanSuId").val();
    const fileAnhDaiDien = $("#fileAnhDaiDienPrev")[0].files[0] || null;
    const maDinhDanh = $("#maDinhDanhNhanSu").val();
    const gioiTinh = $("#gioiTinhNhanSu").val();
    const ngaySinh = $("#ngaySinhNhanSu").val();
    const danToc = $("#danTocNhanSu").val();
    const soDienThoai = $("#soDienThoaiNhanSu").val();
    const hopThu = $("#hopThuNhanSu").val();
    const tinhThanhPho = $("#tinhThanhPhoNhanSu").val();
    const phuongXa = $("#phuongXaNhanSu").val();
    const anhChanDungDetail = $("#showAnhDaiDienDetail").val() || '';
    const chucDanh = $("#chucDanhNhanSu").val();
    const danhHieu = $("#danhHieuNhanSu").val();
    //const soThe = $("#soTheNhanSu").val();
    //const ngayCap = $("#ngayCapNhanSu").val();
    //const coQuanCap = $("#coQuanCapNhanSu").val();
    //const thuTu = $("#thuTuNhanSu").val();
    const trangThai = $("input[name='trangThaiNhanSu']:checked").val() == 1 ? true : false;

    // Đa ngữ
    const ngonNguDich = $("#ngonNguDichNhanSu").val();
    const hoVaTen = $("#hoVaTenNhanSu").val();
    const diaChi = $("#diaChiNhanSu").val();
    const noiLamViec = $("#noiLamViecNhanSu").val();
    const moTa = ckeditormoTaDich.getData();
    const ghiChu = ckeditorghiChuDich.getData();
    const tacPhamVaiDien = ckeditortacPhamVaiDien.getData();
    const vaiTroKienThuc = ckeditorvaiTroKienThuc.getData();

    // Kết quả trả về dạng object
    const dtChung = {
        MaDinhDanh: maDinhDanh,
        gioiTinh: gioiTinh,
        NgaySinh: ngaySinh,
        DanTocID: danToc,
        DienThoai: soDienThoai,
        HopThu: hopThu,
        TinhID: tinhThanhPho,
        XaID: phuongXa,
        anhChanDungDetail: anhChanDungDetail,
        CaNhanID: NhanSuId,
        NgheNghiepID: chucDanh,
        DanhHieuID: danhHieu,
        ToChucID: coQuanId,
        //soThe,
        //ngayCap,
        //coQuanCap,
        //thuTu,
        TrangThai: trangThai,
        MaNgonNgu: ngonNguDich,
        HoTen: hoVaTen,
        DiaChi: diaChi,
        NoiLamViec: noiLamViec,
        MoTa: moTa,
        TacPhamVaiDien: tacPhamVaiDien,
        VaiTroKienThuc: vaiTroKienThuc,
        GhiChu: ghiChu
    };

    console.log(dtChung)

    let formData = new FormData()
    formData.append('RequestNgheSi', JSON.stringify(dtChung))
    formData.append("File", fileAnhDaiDien)

    if (fileAnhDaiDien == null && anhChanDungDetail != null) {
        showNotification(0, "Vui lòng chọn ảnh đại diện")
    }
    else if (checkEmptyBlank(maDinhDanh)) {
        showNotification(0, "Vui lòng nhập mã định danh (CCCD/Hộ chiếu)")
    }
    else if (checkTagHtmlSingle(maDinhDanh)) {
        showNotification(0, "Mã định danh (CCCD/Hộ chiếu) chứa ký tự không hợp lệ")
    }
    else if (maDinhDanh != null && maDinhDanh != '' && checkUniqueIdentifier(maDinhDanh, nhanSuId) > 0) {
        showNotification(0, "Mã định danh (CCCD/Hộ chiếu) đã tồn tại")
    }
    else if (checkEmptyBlank(gioiTinh)) {
        showNotification(0, "Vui lòng chọn giới tính")
    }
    else if (checkTagHtmlSingle(soDienThoai)) {
        showNotification(0, "Số điện thoại chứa ký tự không hợp lệ")
    }
    else if (isValidPhoneNumber(soDienThoai)) {
        showNotification(0, "Số điện thoại không hợp lệ")
    }
    else if (checkTagHtmlSingle(hopThu)) {
        showNotification(0, "Hộp thư chứa ký tự không hợp lệ")
    }
    else if (isValidEmailAllowEmpty(hopThu)) {
        showNotification(0, "Hộp thư không hợp lệ")
    }
    else if (checkEmptyBlank(tinhThanhPho)) {
        showNotification(0, "Vui lòng chọn Tỉnh/Thành phố")
    }
    else if (checkEmptyBlank(phuongXa)) {
        showNotification(0, "Vui lòng chọn Phường/Xã/Đặc khu")
    }
    else if (checkEmptyBlank(hoVaTen)) {
        showNotification(0, "Vui lòng nhập họ và tên cán bộ thể thao")
    }
    else if (checkTagHtmlSingle(hoVaTen)) {
        showNotification(0, "Họ và tên cán bộ thể thao chứa ký tự không hợp lệ")
    }
    else if (checkTagHtmlSingle(diaChi)) {
        showNotification(0, "Địa chỉ chứa ký tự không hợp lệ")
    }
    else if (checkTagHtmlSingle(noiLamViec)) {
        showNotification(0, "Nơi làm việc chứa ký tự không hợp lệ")
    }
    else {
        $.ajax({
            type: 'PUT',
            url: `${baseUrl}/api/DM_CaNhan_NgheSiApi/Update`,
            async: false,
            contentType: false,
            processData: false,
            data: formData,
            success: function (data) {
                if (data.isSuccess && data.value) {
                    showNotification(1, "Chỉnh sửa nghệ sĩ thành công");
                    console.log(data)
                    setTimeout(function() {
                        resetDataNhanSu();
                    }, 2000);
                } else {
                    showNotification(0, "Chỉnh sửa nghệ sĩ không thành công");
                    console.log(data.error)
                }
            },
            error: function (err) {
                console.log(err)
            }
        })
    }

  

    console.log('Dữ liệu nghệ sĩ:', dtChung);
}

function loadTranslation(nhanSuId, maNgonNgu) {
    getDataWithApi('GET', `/api/DM_CaNhan_NgheSiApi/Get?CaNhanID=${nhanSuId}&maNgonNgu=${maNgonNgu}`).then(data => {
        console.log(data, "Load bản dịch lễ hội")
        if (data && data.isSuccess && data.value) {
            translations = data.value;
            // Populate các trường dịch với dữ liệu đa ngữ
            $("#hoVaTenNhanSu").val(translations.hoTen || '');
            $("#diaChiNhanSu").val(translations.diaChi || '');
            $("#noiLamViecNhanSu").val(translations.noiLamViec || '');
            if (typeof ckeditormoTaDich !== 'undefined') ckeditormoTaDich.setData(translations.moTa || '');
            if (typeof ckeditorghiChuDich !== 'undefined') ckeditorghiChuDich.setData(translations.ghiChu || '');
            if (typeof ckeditortacPhamVaiDien !== 'undefined') ckeditortacPhamVaiDien.setData(translations.tacPhamVaiDien || '');
            if (typeof ckeditorvaiTroKienThuc !== 'undefined') ckeditorvaiTroKienThuc.setData(translations.vaiTroKienThuc || '');
        } else {
            // Nếu không có bản dịch, clear các trường dịch
            $("#hoVaTenNhanSu").val('');
            $("#diaChiNhanSu").val('');
            $("#noiLamViecNhanSu").val('');
            if (typeof ckeditormoTaDich !== 'undefined') ckeditormoTaDich.setData('');
            if (typeof ckeditorghiChuDich !== 'undefined') ckeditorghiChuDich.setData('');
            if (typeof ckeditortacPhamVaiDien !== 'undefined') ckeditortacPhamVaiDien.setData('');
            if (typeof ckeditorvaiTroKienThuc !== 'undefined') ckeditorvaiTroKienThuc.setData('');
        }
    })
}

function resetDataNhanSu() {
    // Hủy các action liên quan đến Sự kiện (ActionAddNhanSu/ActionEditNhanSu)
    // Reset các biến hoặc state nếu cần (tùy thuộc vào logic cụ thể, có thể không cần vì chỉ là UI)

    // Reset các giá trị của phần nhân sự
    $("#maDinhDanhNhanSu").val('');
    $("#fileAnhDaiDienPrev").val('');
    $("#showAnhDaiDienAdd").attr('src', '/assets/images/vector/Addimage.png');
    $("#showAnhDaiDienDetail").val('');
    $("#gioiTinhNhanSu").val('').trigger('change');
    $("#ngaySinhNhanSu").val('');
    $("#danTocNhanSu").val('').trigger('change');
    $("#soDienThoaiNhanSu").val('');
    $("#hopThuNhanSu").val('');
    $("#tinhThanhPhoNhanSu").val('').trigger('change');
    $("#phuongXaNhanSu").val('').trigger('change');
    $("#thuTuNhanSu").val('');
    $("#chucDanhNhanSu").val('').trigger('change');
    $("#danhHieuNhanSu").val('').trigger('change');
    $("input[name='trangThaiNhanSu'][value='1']").prop('checked', true); // Mặc định duyệt
    $("#ngonNguDichNhanSu").val('').trigger('change');
    $("#hoVaTenNhanSu").val('');
    $("#diaChiNhanSu").val('');
    $("#noiLamViecNhanSu").val('');
    if (typeof ckeditormoTaDich !== 'undefined') ckeditormoTaDich.setData('');
    if (typeof ckeditorghiChuDich !== 'undefined') ckeditorghiChuDich.setData('');
    if (typeof ckeditortacPhamVaiDien !== 'undefined') ckeditortacPhamVaiDien.setData('');
    if (typeof ckeditorvaiTroKienThuc !== 'undefined') ckeditorvaiTroKienThuc.setData('');
    $("#NhanSuId").val(''); // Reset ID nhân sự

    // Ẩn giao diện AddNhanSu, show bảng danhSachNhanSu
    $("#thongTinNhanSu").hide();
    $("#danhSachNhanSu").show();
    setTimeout(() => {
        $('#dataGridNhanSu').DataTable().ajax.reload();
        $("#ngonNguDichNhanSu").val('vi').trigger('change');
    }, 300);
}
//#endregion Function Xử lý nhân sự

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

const checkUnique = (maDinhDanh, toChucID) => {
    let result = 0
    let url = `${baseUrl}/api/ToChucApi/CheckUnique?MaDinhDanh=${maDinhDanh}&LoaiToChucID=93`
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

const isValidDateRange = (ngayCap, ngayHetHan) => {
    // Nếu thiếu 1 trong 2 → không lỗi
    if (!ngayCap || !ngayHetHan) return false;

    const start = new Date(formatDateToSaveAsString(ngayCap));
    const end = new Date(formatDateToSaveAsString(ngayHetHan));

    // Nếu ngày không hợp lệ
    if (isNaN(start) || isNaN(end)) return true;

    return end < start;
};

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

const checkUniqueIdentifier = (maDinhDanh, caNhanID) => {
    let result = 0

    let url = `${baseUrl}/api/CSDL_JsonApi/CheckUnique?MaDinhDanh=${maDinhDanh}`

    if (caNhanID) {
        url = `${url}&CaNhanID=${caNhanID}`
    }

    $.ajax({
        type: "GET",
        async: false,
        url: `${url}`,
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

const isValidPhoneNumber = (value) => {
    const regex = /^$|^\d{10,11}$/;
    return !regex.test(value);
}
//#endregion function validation
