const baseUrl = getRootLink();
const ckeditorgioiThieuDich = CKEDITOR.replace('gioiThieuDich');
const ckeditorghiChuDich = CKEDITOR.replace('ghiChuDich');
console.log(coQuanId)
let translations = [];
let translationsDaPhuongTien = [];
let translationsDiaDiem = [];

let tempDaPhuongTiens = [];
let RequestDaPhuongTiens = [];
let tempDaPhuongTienTranslations = [];
let currentEditingDaPhuongTienIndex = -1;

let tempAnPhams = [];
let RequestXuatBan = [];
let tempAnPhamTranslations = [];
let currentEditingAnPhamIndex = -1;

let translationsAnPham = [];

$(document).ready(function () {
    $("#DiaDiemCoSanAdd").attr("multiple", "multiple")
    initDatePicker();
    initDanhMucChung_NoAll(22, "#loaiHinh", "")
    initDanhMucChung_NoAll(39, "#loaiDoiTuong", "") // Loại đối tượng - Cấp độ
    initDanhMucChung_NoAll(42, "#trangThaiSuKien", "") // Trạng thái sự kiện
    initDanhMucChung_NoAll(25, "#theLoaiAdd", "") // Thể loại - Lĩnh vực
    initDanhMucChung_NoAll(9, "#linhVucAdd", "") // Lĩnh vực
    initNgonNgu("#ngonNguDich")
    initNgonNgu("#ngonNguDichSuKienAdd")
    initNgonNgu("#ngonNguDPT")
    initNgonNgu("#ngonNguDichDiaDiemAdd")
    initNgonNgu("#ngonNgu_AnPham")
    initDiaDiem()
    previewPicture()
    previewPictureSuKien()
    switchMediaData();
    CheckDateMinMax("#ngayBatDauAdd", "#ngayKetThucAdd")
    initTinhThanhPho()
    initSelect2();
    initTableSuKien()
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
                $('#gioiThieuDich').val('');
                $('#ghiChuDich').val('');
            }
        }
    });

    $("#modalAddDaPhuongTien").on('hidden.bs.modal', function () {
        translations = []
        $(this).find('input[type=text], textarea').val('');
        $(this).find('select').val('vi').trigger('change');
        $(this).find('input[type=radio][value=1], input[type=checkbox][value=1]').prop('checked', true);
    });

    /* $("#btnAddSuKien").on("click", function () {
        $("#thongTinSuKien").show();
        $("#danhSachSuKien").hide();
        ActionAddSuKien();
    }); */

    /* $("#btnThemAnPham").on("click", function () {
        $("#thongTinAnPham").show();
        $("#danhSachAnPham").hide();
    }); */

    $("#btnAddAnPham").on("click", function () {
        resetAnPham();
        $(".thongTinAnPham").show();
        $("#danhSachAnPham").show();
    })
    $("#btnCanceldanhSachAnPham").on("click", function () {
        $(".thongTinAnPham").hide();
        $("#danhSachAnPham").show();
        $('#btnAddAnPham').show()
        resetAnPham();
    })
    $("#btnSavedanhSachAnPham").on("click", function () {
        AnPham.ThongTinChung.save();
        $(".thongTinAnPham").hide();
        $('#btnAddAnPham').show()
        resetAnPham();
        $('#dataGridAnPham').DataTable().ajax.reload();
    })


    $("#btnAddSuKien").on("click", function () {
        resetThongTinSuKien();
        ActionAddSuKien();
        $("#thongTinSuKien").show();
    })
    $("#btnCancelsuKien").on("click", function () {
        $("#thongTinSuKien").hide();
        resetThongTinSuKien();
    })
    $("#btnSavesuKien").on("click", function () {
        // Xử lý lưu sự kiện
        const suKienID = $("#suKienId").val();
        if (suKienID) {
            dataEditSuKien()
        } else {
            dataAddSuKien()
        }
        $("#thongTinSuKien").hide();
        resetThongTinSuKien();
        $('#dataGridSuKien').DataTable().ajax.reload();
    })

    $("#btnSave").on("click", async function () {
        dataAdd(coQuanId)
    }) 

});

//#region Xử lý thông tin chung
function initTinhThanhPho() {
    getDataWithApi('GET', '/api/CapTinhApi/Gets').then(data => {
        if (data && data.isSuccessed && data.resultObj) {
            $("#tinhThanhPho").empty().append(`<option value="">Chọn</option>`);
            $("#tinhThanhPhoAdd").empty().append(`<option value="">Chọn</option>`);
            data.resultObj.forEach(item => {
                const displayText = item.noiDung || item.tenTinh || 'Không rõ tên';
                $("#tinhThanhPho").append(`<option value="${item.tinhID}">${displayText}</option>`);
                $("#tinhThanhPhoAdd").append(`<option value="${item.tinhID}">${displayText}</option>`);
            });
        }
    })
}

function initPhuongXa(tinhID = null) {
    getDataWithApi('GET', `/api/CapXaApi/GetByMaTinh?MaNgonNgu=vi&MaTinh=${tinhID ? `${tinhID}` : ''}`).then(data => {
        $("#phuongXa").empty().append(`<option value="">Chọn</option>`);
        $("#phuongXaAdd").empty().append(`<option value="">Chọn</option>`);
        if (data && data.isSuccess && data.value) {
            data.value.forEach(item => {
                const displayText = item.noiDung || item.tenXa || 'Không rõ tên';
                $("#phuongXa").append(`<option value="${item.xaID}">${displayText}</option>`);
                $("#phuongXaAdd").append(`<option value="${item.xaID}">${displayText}</option>`);
            });
        }
    })
}

function dataAdd(coQuanId) {
    //Thông tin chung
    let id = $('#coQuanId').val() || coQuanId;
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
    let gioiThieu = ckeditorgioiThieuDich.getData();
    let ghiChu = ckeditorghiChuDich.getData();

    //Thông tin dư thừa
    let coQuanChuQuan = $('#coQuanChuQuan').val();
    let phamViHoatDong = $('#phamViHoatDong').val();

    let dt = {
        "loaiToChucID": 94, // ID cho thư viện
        "linhVucID": 236, // ID cho lĩnh vực hoạt động thư viện
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
        showNotification(0, "Mã thư viện chứa ký tự không hợp lệ")
    }
    else if (maDinhDanh != null && maDinhDanh != '' && checkUnique(maDinhDanh.trim(), id)) {
        showNotification(0, "Mã thư viện đã tồn tại")
    }
    else if (checkEmptyBlank(loaiHinh)) {
        showNotification(0, "Vui lòng chọn loại hình")
    }
    else if (checkTagHtmlSingle(quyMo)) {
        showNotification(0, "Quy mô chứa ký tự không hợp lệ")
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
    else if (isFutureDate(ngayThanhLap)) {
        showNotification(0, "Ngày thành lập không hợp lệ")
    }
    else if (checkTagHtmlSingle(soGiayPhep)) {
        showNotification(0, "Số giấy phép chứa ký tự không hợp lệ")
    }
    else if (checkEmptyBlank(tenCoQuan)) {
        showNotification(0, "Vui lòng nhập tên doanh nghiệp lữ hành")
    }
    else if (checkTagHtmlSingle(tenCoQuan)) {
        showNotification(0, "Tên doanh nghiệp lữ hành chứa ký tự không hợp lệ")
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
                    showNotification(1, "Chỉnh sửa thư viện thành công");
                    setTimeout(function() {
                        window.location.href = `${baseUrl}/AdminTool/ThuVien`;
                    }, 2000);
                    console.log(data)
                } else {
                    showNotification(0, "Chỉnh sửa thư viện không thành công");
                    console.log(data.error)
                }
            },
            error: function (err) {
                console.log(err)
            }
        })
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
        loaiToChucID: 94, // thư viện
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
            ckeditorgioiThieuDich.setData(item.gioiThieu);
            ckeditorghiChuDich.setData(item.ghiChu);

            // Thông tin phụ
            $('#coQuanChuQuan').val(item.coQuanChuQuanID).trigger('change');
            $('#phamViHoatDong').val(item.phamViHoatDongID).trigger('change');
        } else {
            showNotification(0, 'Không tìm thấy thông tin thư viện');
        }
    })
}

function loadToChucTranslation(toChucID, maNgonNgu) {
    translation = [];
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
//#endregion Xử lý thông tin chung

//#region Xử lý Sự kiện
function initTableSuKien() {
    const tableApi = {
        url: `${baseUrl}/api/DM_SuKienApi/GetsByToChucID?MaNgonNgu=vi&ToChucID=${coQuanId}`,
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
                return `<div class="group-info">
                    <div class="info-main">
                        <a href="${baseUrl}/AdminTool/SuKien/Details?id=${row.suKienID}" class="text-primary text-decoration-none">
                            ${row.tenSuKien || ''}
                        </a>
                    </div>
                    <div class="info-sub">${row.maDinhDanh || ''}</div>
                </div>`;
            }
        },
        {
            targets: 2, // Thể loại
            render: function (data, type, row, meta) {
                if (row.batDau == row.ketThuc) {
                    return formatDateWithoutTime(row.batDau);
                } else {
                    return `${formatDateWithoutTime(row.batDau)} - ${formatDateWithoutTime(row.ketThuc)}`;
                }
            }
        },
        {
            targets: 3, // Cấp độ
            render: function (data, type, row, meta) {
                return row.tenCapDo || '';
            }
        },
        {
            targets: 4, // Tần suất
            render: function (data, type, row, meta) {
                return row.tenTrangThai || "";
            }
        },
        {
            targets: 5, // Trạng thái
            render: function (data, type, row, meta) {
                if (row.trangThai) {
                    return `<span class="TrangThai green-text">Duyệt</span>`;
                } else {
                    return `<span class="TrangThai red-text">Chưa duyệt</span>`;
                }
            }
        },
        {
            targets: 6, // Chức năng
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
        { "data": "", "width": "15%", "class": "left-align" },
        { "data": "", "width": "15%", "class": "left-align" },
        { "data": "", "width": "7%", "class": "left-align" },
        { "data": "", "width": "10%", "class": "left-align name-text" },
        { "data": "", "width": "8%", "class": "center-align group-icon-action" }
    ];

    initDataTableConfigNoSearch('dataGridSuKien', tableApi, tableDefs, tableCols);

    // Event handler cho nút xóa
    $('#dataGridSuKien tbody').on('click', '.delete-command-btn', function () {
        var id = $(this).attr("ID").match(/\d+/)[0];
        var data = $('#dataGridSuKien').DataTable().row(id).data();

        $('#idDelete').val(data.suKienID);
        $('#nameDelete').text(`${data.tenSuKien}`);

        $('#modalDelete').modal('show');
    });

    // Event handler cho nút chỉnh sửa
    $('#dataGridSuKien tbody').on('click', '.edit-command-btn', function () {
        var id = $(this).attr("ID").match(/\d+/)[0];
        var data = $('#dataGridSuKien').DataTable().row(id).data();

        SuKienId = data.suKienID;
        loadDataSuKien(SuKienId);

        $("#thongTinSuKien").show();
        ActionEditSuKien();
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
            dataDeleteSuKien();
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

function dataDeleteSuKien() {
    let id = $('#idDelete').val();
    let type = $('#idTypeDelete').val();

    if (type == 2) { // Xóa ấn phẩm
        return; 
    }

    $.ajax({
        url: `${baseUrl}/api/DM_SuKienApi/Delete?SuKienID=${id}`,
        type: 'DELETE',
        contentType: 'application/json',
        success: function (data) {
            if (data && data.isSuccess && data.value) {
                showNotification(1, 'Xoá thành công')
                $('#modalDelete').modal('hide');
                $('#dataGrid').DataTable().ajax.reload();
            } else {
                showNotification(0, data.error)
            }
        },
        error: function (err) {
            showNotification(0, 'Có lỗi xảy ra, vui lòng thử lại sau')
        }
    })
}

function loadDataSuKien(SuKienId) {
    getDataWithApi('GET', `/api/DM_SuKienApi/Get?MaNgonNgu=vi&SuKienID=${SuKienId}`).then(data => {
        console.log(data)
        if (data && data.isSuccess && data.value) {
            let suKien = data.value;
            $("#suKienId").val(suKien.suKienID);
            $("#maSuKien").val(suKien.maDinhDanh);
            $("#loaiDoiTuong").val(suKien.capDoID).trigger('change');
            $("#trangThaiSuKien").val(suKien.trangThaiID).trigger('change');
            $("#ngayBatDauAdd").val(formatDateWithoutTime(suKien.batDau));
            $("#ngayKetThucAdd").val(formatDateWithoutTime(suKien.batDau));
            $("#thuTu").val(suKien.thuTu);
            $("input[name='trangThai_SuKien'][value='" + (suKien.trangThai ? 1 : 0) + "']").prop("checked", true);
            if (suKien.anhDaiDien) {
                $("#showAnhDaiDienAdd").attr("src", suKien.anhDaiDien);
                $("#showAnhDaiDienDetail").val(suKien.anhDaiDien);
            }
            if (suKien.listIDDiaDiem) {
                console.log(suKien.listIDDiaDiem, "Danh sách địa điểm đã chọn")
                let listDiaDiem = suKien.listIDDiaDiem.split(',').map(x => x.trim().toLowerCase());
                $("#DiaDiemCoSanAdd").val(listDiaDiem.map(item => item)).trigger('change');
                initTableDiaDiem(listDiaDiem.map(item => item).join(','));
            }
            //Đa ngữ
            $("#ngonNguDichSuKienAdd").val(suKien.maNgonNgu).trigger('change');
            $("#tenSuKienDichAdd").val(suKien.tenSuKien);
            $("#ketQuaAdd").val(suKien.ketQua);
            $("#moTaAdd").val(suKien.moTa);
            initDaPhuongTienTable(suKien.suKienID);
        }
    })

}

function dataEditSuKien() { 
    //Thông tin chung
    const IDSuKien = SuKienId;
    const MaSuKien = $("#maSuKien").val();
    const CapDoID = $("#loaiDoiTuong").val();
    const TrangThaiSuKien = $("#trangThaiSuKien").val();
    const NgayBatDau = formatDateToSaveAsString($("#ngayBatDauAdd").val());
    const NgayKetThuc = formatDateToSaveAsString($("#ngayKetThucAdd").val());
    const ThuTu = $("#thuTu").val();
    const TrangThai = $("input[name='trangThai_SuKien']:checked").val();

    //Nội dung đa ngữ
    const MaNgonNgu = $("#ngonNguDichSuKienAdd").val();
    const TenSuKien = $("#tenSuKienDichAdd").val();
    const KetQua = $("#ketQuaAdd").val();
    const MoTa = $("#moTaAdd").val();
    const AnhDaiDienDetail =  $("#showAnhDaiDienDetail").val();
    const AnhDaiDien = $("#fileAnhDaiDienPrev")[0].files[0] || null;

    console.log(AnhDaiDien, "anhDaiDien")

    let dtChung = {
        suKienID: IDSuKien,
        TenSuKien: TenSuKien,
        MaDinhDanh: MaSuKien,
        CapDoID: CapDoID,
        BatDau: NgayBatDau,
        KetThuc: NgayKetThuc,
        TrangThaiID: TrangThaiSuKien,
        ThuTu: ThuTu,
        AnhDaiDienDetail: AnhDaiDienDetail,
        TrangThai: TrangThai == 1 ? true : false,
        ListID: $("#DiaDiemCoSanAdd").val().map(item => item).join(','),
        LinhVucID: 2,

        //Nội dung đa ngữ
        MaNgonNgu: MaNgonNgu,
        KetQua: KetQua,
        MoTa: MoTa,
    }

    console.log(dtChung)

    let formData = new FormData()
    formData.append('EntitySuKien', JSON.stringify(dtChung))
    formData.append("File", AnhDaiDien)

    if (AnhDaiDien == null && (AnhDaiDienDetail == null || AnhDaiDienDetail == "")) {
        showNotification(0, "Vui lòng chọn ảnh đại diện")
    }
    else if (checkTagHtmlSingle(MaSuKien)) {
        showNotification(0, "Mã sự kiện chứa ký tự không hợp lệ")
    }
    else if (checkUnique_SuKien(238, MaSuKien) > 0) {
        showNotification(0, "Mã sự kiện đã tồn tại")
    }
    else if (checkEmptyBlank(CapDoID)) {
        showNotification(0, "Vui lòng chọn cấp độ sự kiện")
    }
    else if (checkEmptyBlank(TrangThaiSuKien)) {
        showNotification(0, "Vui lòng chọn trạng thái sự kiện")
    }
    else if (checkEmptyBlank(NgayBatDau)) {
        showNotification(0, "Vui lòng chọn/nhập ngày bắt đầu sự kiện")
    }
    else if (checkEmptyBlank(NgayKetThuc)) {
        showNotification(0, "Vui lòng chọn/nhập ngày kết thúc sự kiện")
    }
    else if (isValidDateRange(NgayBatDau, NgayKetThuc)) {
        showNotification(0, "Ngày kết thúc sự kiện phải lớn hơn ngày bắt đầu sự kiện")
    }
    else if (checkEmptyBlank(TenSuKien)) {
        showNotification(0, "Vui lòng nhập tên sự kiện")
    }
    else if (checkTagHtmlSingle(TenSuKien)) {
        showNotification(0, "Tên sự kiện chứa ký tự không hợp lệ")
    }
    else if (checkTagHtmlSingle(KetQua)) {
        showNotification(0, "Kết quả sự kiện chứa ký tự không hợp lệ")
    }
    else if (ListIDDiaDiem.length == 0) {
        showNotification(0, "Vui lòng chọn địa điểm")
    } else {
        $.ajax({
            type: 'PUT',
            url: `${baseUrl}/api/DM_SuKienApi/Update`,
            async: false,
            contentType: false,
            processData: false,
            data: formData,
            success: function (data) {
                if (data.isSuccess && data.value) {
                    showNotification(1, "Chỉnh sửa sự kiện thành công");
                } else {
                    showNotification(0, "Chỉnh sửa sự kiện không thành công");
                    console.log(data.error)
                }
            },
            error: function (err) {
                console.log(err)
            }
        })
    }

}

function dataAddSuKien() { 
    //Thông tin chung
    const ToChucID = coQuanId
    const MaSuKien = $("#maSuKien").val();
    const CapDoID = $("#loaiDoiTuong").val();
    const TrangThaiSuKien = $("#trangThaiSuKien").val();
    const NgayBatDau = formatDateToSaveAsString($("#ngayBatDauAdd").val());
    const NgayKetThuc = formatDateToSaveAsString($("#ngayKetThucAdd").val());
    const ThuTu = $("#thuTu").val();
    const TrangThai = $("input[name='trangThai_SuKien']:checked").val();

    //Nội dung đa ngữ
    const MaNgonNgu = $("#ngonNguDichSuKienAdd").val();
    const TenSuKien = $("#tenSuKienDichAdd").val();
    const KetQua = $("#ketQuaAdd").val();
    const MoTa = $("#moTaAdd").val();
    const AnhDaiDien = $("#fileAnhDaiDienPrev")[0].files[0] || null;

    console.log(AnhDaiDien, "anhDaiDien")

    let dtChung = {
        ToChucID: ToChucID,
        TenSuKien: TenSuKien,
        MaDinhDanh: MaSuKien,
        CapDoID: CapDoID,
        BatDau: NgayBatDau,
        KetThuc: NgayKetThuc,
        TrangThaiID: TrangThaiSuKien,
        ThuTu: ThuTu,
        TrangThai: TrangThai == 1 ? true : false,
        ListID: $("#DiaDiemCoSanAdd").val() ? $("#DiaDiemCoSanAdd").val().join(",") : null, 
        LinhVucID: 238,
        VaiTroID: 1, //Vai trò tổ chức sự kiện - Mặc định là 1 (Tổ chức)
        XepHangID: 1, //Xếp hạng sự kiện - Mặc định là 1 (Bình thường)

        //Nội dung đa ngữ
        MaNgonNgu: MaNgonNgu,
        KetQua: KetQua,
        MoTa: MoTa,
    }

    let requestDaPhuongTien = createRequestDaPhuongTiens();
    let formData = new FormData()
    formData.append('EntitySuKien', JSON.stringify(dtChung))
    formData.append("File", AnhDaiDien)
    for (let i = 0; i < requestDaPhuongTien.length; i++) {
        formData.append(`EntityDaPhuongTien[${i}].DaPhuongTien`, JSON.stringify(requestDaPhuongTien[i].DaPhuongTien));
        formData.append(`EntityDaPhuongTien[${i}].DaPhuongTien_NoiDung`, JSON.stringify(requestDaPhuongTien[i].DaPhuongTien_NoiDung));
        formData.append(`EntityDaPhuongTien[${i}].File`, requestDaPhuongTien[i].File[0]);
    }

    if (AnhDaiDien == null) {
        showNotification(0, "Vui lòng chọn ảnh đại diện")
    }
    else if (checkTagHtmlSingle(MaSuKien)) {
        showNotification(0, "Mã sự kiện chứa ký tự không hợp lệ")
    }
    else if (checkUnique_SuKien(238, MaSuKien) > 0) {
        showNotification(0, "Mã sự kiện đã tồn tại")
    }
    else if (checkEmptyBlank(CapDoID)) {
        showNotification(0, "Vui lòng chọn cấp độ sự kiện")
    }
    else if (checkEmptyBlank(TrangThaiSuKien)) {
        showNotification(0, "Vui lòng chọn trạng thái sự kiện")
    }
    else if (checkEmptyBlank(NgayBatDau)) {
        showNotification(0, "Vui lòng chọn/nhập ngày bắt đầu sự kiện")
    }
    else if (checkEmptyBlank(NgayKetThuc)) {
        showNotification(0, "Vui lòng chọn/nhập ngày kết thúc sự kiện")
    }
    else if (isValidDateRange(NgayBatDau, NgayKetThuc)) {
        showNotification(0, "Ngày kết thúc sự kiện phải lớn hơn ngày bắt đầu sự kiện")
    }
    else if (checkEmptyBlank(TenSuKien)) {
        showNotification(0, "Vui lòng nhập tên sự kiện")
    }
    else if (checkTagHtmlSingle(TenSuKien)) {
        showNotification(0, "Tên sự kiện chứa ký tự không hợp lệ")
    }
    else if (checkTagHtmlSingle(KetQua)) {
        showNotification(0, "Kết quả sự kiện chứa ký tự không hợp lệ")
    }
    else if (ListIDDiaDiem.length == 0) {
        showNotification(0, "Vui lòng chọn địa điểm")
    } else {
        $.ajax({
            type: 'POST',
            url: `${baseUrl}/api/DM_SuKienApi/Add`,
            async: false,
            contentType: false,
            processData: false,
            data: formData,
            success: function (data) {
                console.log(data)
                if (data.isSuccess && data.value) {
                    showNotification(1, "Thêm mới sự kiện thành công");
                } else {
                    showNotification(0, "Thêm mới sự kiện không thành công");
                    console.log(data.error)
                }
            },
            error: function (err) {
                console.log(err)
            }
        })
    }

}
//#endregion Xử lý Sự kiện

//#region Function Xử lý thông tin tọa độ, vị trí bản đồ
function initDiaDiem() {
    let dt = JSON.stringify({
        "maNgonNgu": "vi",
        "trangThai": true
    })

    getDataWithApi('POST', '/api/DiaDiemApi/DanhSach', dt).then(data => {
        console.log(data)
        if (data && data.isSuccess && data.value) {
            console.log(data)
            $("#DiaDiemCoSanAdd").empty().append(`<option value="">Chọn</option>`);
            data.value.forEach(item => {
                const displayText = item.tenDiaDiem || item.noiDung || 'Không rõ tên';
                $("#DiaDiemCoSanAdd").append(`<option value="${item.diaDiemID || item.id}">${displayText}</option>`);
            });
        }
    })
}

function dataAddDiaDiem() {
    //Thông tin địa điểm
    const DiaDiemID = null; //Chưa có trường địa điểm trong form thêm sự kiện
    const DiaDiemCapChaID = null //Chưa có trường địa điểm trong form thêm sự kiện
    const LinhVucID = $("#linhVucAdd").val();
    const XaID = $("#phuongXaAdd").val();
    const TinhID = $("#tinhThanhPhoAdd").val();
    const KinhDo = $("#kinhDoAdd").val();
    const ViDo = $("#viDoAdd").val();
    const CaoDo = $("#caoDoAdd").val();
    const BanDo = null; //Chưa có trường địa điểm trong form thêm sự kiện
    const HinhAnh = null; //Chưa có trường địa điểm trong form thêm sự kiện
    const NguoiKhuyetTat = $("#nguoiKhuyetTatAdd").is(":checked");
    const NhaVeSinh = $("#nhaVeSinhAdd").is(":checked");
    const BaiDoXe = $("#baiDoXeAdd").is(":checked");

    //Thông tin địa điểm dịch
    const MaNgonNguDiaDiem = $("#ngonNguDichDiaDiemAdd").val();
    const ThoiGianHoatDong = $("#thoiGianHoatDongDichAdd").val();
    const TenDiaDiem = $("#tenDiaDiemDichAdd").val();
    const SucChua = $("#sucChuaDichAdd").val();
    const HeToaDo = null; //Chưa có trường địa điểm trong form thêm sự kiện
    const DiaChiDiaDiem = $("#diaChiDichAdd").val();
    const MoTaDiaDiem = $("#moTaDichAdd").val();

    let diaDiem = {
        DiaDiemID: DiaDiemID,
        DiaDiemCapChaID: DiaDiemCapChaID,
        LinhVucID: LinhVucID,
        XaID: XaID,
        TinhID: TinhID,
        KinhDo: KinhDo,
        ViDo: ViDo,
        CaoDo: CaoDo,
        BanDo: BanDo,
        HinhAnh: HinhAnh,
        NguoiKhuyetTat: NguoiKhuyetTat,
        NhaVeSinh: NhaVeSinh,
        BaiDoXe: BaiDoXe,
    }


    let diaDiem_NoiDung = [{
        //Nội dung đa ngữ
        DiaDiemID: DiaDiemID,
        MaNgonNgu: MaNgonNguDiaDiem,
        ThoiGianHoatDong: ThoiGianHoatDong,
        TenDiaDiem: TenDiaDiem,
        SucChua: SucChua,
        HeToaDo: HeToaDo,
        DiaChi: DiaChiDiaDiem,
        MoTa: MoTaDiaDiem
    }]

    let formData = new FormData()
    formData.append("DiaDiem", JSON.stringify(diaDiem))
    formData.append("DiaDiem_NoiDung", JSON.stringify(diaDiem_NoiDung))

    $.ajax({
        type: 'POST',
        url: `${baseUrl}/api/DiaDiemApi/ThemMoi`,
        async: false,
        contentType: false,
        processData: false,
        data: formData,
        success: function (data) {
            console.log(data)
            if (data.isSuccess && data.value) {
                // Lưu lại id địa điểm vừa thêm mới
                var newDiaDiemId = data.value.diaDiemID || data.value.id || data.value;
                console.log("Địa điểm vừa thêm mới có ID:", newDiaDiemId);
                // Lưu lại các giá trị select đã chọn trước đó
                var prevDiaDiem = $('#DiaDiemCoSanAdd').val();
                console.log("Giá trị đã chọn trước đó:", prevDiaDiem);
                let dt = JSON.stringify({
                    "maNgonNgu": "vi",
                    "trangThai": true
                })
                console.log(dt)
                getDataWithApi('POST', '/api/DiaDiemApi/DanhSach', dt).then(data => {
                    console.log(data)
                    if (data && data.isSuccess && data.value) {
                        var $select = $('#DiaDiemCoSanAdd');
                        var prevValues = Array.isArray(prevDiaDiem) ? prevDiaDiem : [prevDiaDiem];
                        $select.empty();
                        $select.append('<option value="">Chọn</option>');
                        data.value.forEach(function (item) {
                            console.log(item, "Danh sách địa điểm")
                            var selected = '';
                            if (prevValues.includes(item.diaDiemID?.toString()) || prevValues.includes(item.id?.toString())) selected = 'selected';
                            if (item.diaDiemID == newDiaDiemId || item.id == newDiaDiemId) selected = 'selected';
                            $select.append(`<option value="${item.diaDiemID || item.id}" ${selected}>${item.tenDiaDiem || item.noiDung || 'Không rõ tên'}</option>`);
                        });
                        prevValues.push(newDiaDiemId)
                        $select.trigger('change.select2');
                        initTableDiaDiem(prevValues.map(item => item).join(','));
                    }
                })
                $('#modalAddDiaDiem').modal('hide');
            }
        },
        error: function (err) {
            console.log(err)
        }
    })
}

function initTableDiaDiem(list) {
    const tableApi = {
        url: `${baseUrl}/api/DiaDiemApi/GetMulti?ListID=${list}&MaNgonNgu=vi`,
        type: "GET",
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
        { "data": "stt", "width": "40px", "class": "center-align" },
        { "data": "tenDiaDiem", "class": "left-align name-text" },
        { "data": "diaChi", "width": "30%", "class": "left-align" },
        { "data": "", "width": "30%", "class": "left-align" }
    ];

    initDataTableConfigNoSearch('dataGridDiaDiem', tableApi, tableDefs, tableCols);
}

function loadTranslationDiaDiem(diaDiemID, maNgonNgu) {
    getDataWithApi('GET', `/api/DiaDiemApi/GetByID?MaNgonNgu=${maNgonNgu}&DiaDiemID=${diaDiemID}`).then(data => {
        console.log(data, "Load bản dịch địa điểm")
        if (data && data.isSuccess && data.value) {
            translationsDiaDiem = data.value;
            // Populate các trường dịch với dữ liệu đa ngữ
            $("#thoiGianHoatDongDichEdit").val(translationsDiaDiem.thoiGianHoatDong);
            $("#tenDiaDiemDichEdit").val(translationsDiaDiem.tenDiaDiem);
            $("#sucChuaDichEdit").val(translationsDiaDiem.sucChua);
            $("#diaChiDichEdit").val(translationsDiaDiem.diaChi);
            $("#moTaDichEdit").val(translationsDiaDiem.moTa);
        } else {
            // Nếu không có bản dịch, clear các trường dịch
            $("#thoiGianHoatDongDichEdit").val('');
            $("#tenDiaDiemDichEdit").val('');
            $("#sucChuaDichEdit").val('');
            $("#diaChiDichEdit").val('');
            $("#moTaDichEdit").val('');
        }
    })
}
//#endregion Function Xử lý thông tin tọa độ, vị trí bản đồ

//#region Function Xử lý tài liệu truyền thông khi thêm mới
function initTempDaPhuongTienTable() {
    // Khởi tạo DataTable cho bảng tài liệu truyền thông tạm
    console.log(tempDaPhuongTiens)
    const tableApi = {
        data: tempDaPhuongTiens,
        dataSrc: function (data) {
            console.log(data)
            return data.map((item, index) => ({
                ...item,
                stt: index + 1
            }));
        }
    };

    const tableDefs = [
        {
            targets: 1,
            render: function (data, type, row, meta) {
                return `<div class="group-info have-image">
                    <div class="have-image">
                        <img src="${row.duongDanHinhAnhBia || '/assets/images/vector/no-image.png'}" alt="${row.tenDaPhuongTien || ''}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                    </div>
                    <div class="group-info">
                    <div class="info-main"><div>${row.tieuDe || ''}</div></div>
                    <div class="info-sub">${row.TacGia || ''}</div></div>
                </div>`;
            }
        },
        {
            targets: 2,
            render: function (data, type, row, meta) {
                if (row.LoaiMedia == 1) {
                    return `Hình ảnh`;
                } else if (row.LoaiMedia == 2) {
                    return `Video`;
                } else if (row.LoaiMedia == 3) {
                    return `Audio`;
                } else if (row.LoaiMedia == 4) {
                    return `File khác`;
                }
                return ``;
            }
        },
        {
            targets: 4, // Cột chức năng
            render: function (data, type, row, meta) {
                const editIcon = `<i data-toggle="tooltip" title="Chỉnh sửa" class="edit-temp-DaPhuongTien text-yellow cursor-pointer me-2" data-index="${meta.row}">
                    <i class="hgi-icon hgi-edit"></i>
                </i>`;

                const deleteIcon = row.isExisting
                    ? `<i data-toggle="tooltip" title="Xóa khỏi hệ thống" class="delete-existing-DaPhuongTien text-red cursor-pointer" data-index="${meta.row}" data-id="${row.DaPhuongTienID}">
                        <i class="hgi-icon hgi-delete"></i>
                    </i>`
                    : `<i data-toggle="tooltip" title="Xóa khỏi danh sách" class="delete-temp-DaPhuongTien text-red cursor-pointer" data-index="${meta.row}">
                        <i class="hgi-icon hgi-delete"></i>
                    </i>`;

                return editIcon + deleteIcon;;
            }
        }
    ];

    const tableCols = [
        { "data": "stt", "width": "40px", "class": "center-align" },
        { "data": "", "width": "", "class": "left-align" },
        { "data": "", "width": "15%", "class": "left-align" },
        { "data": "TacGia", "width": "15%", "class": "left-align" },
        { "data": "", "width": "120px", "class": "center-align group-icon-action" }
    ];

    // Destroy existing DataTable if exists
    if ($.fn.DataTable.isDataTable('#dataGridDaPhuongTien')) {
        $('#dataGridDaPhuongTien').DataTable().destroy();
    }

    $('#dataGridDaPhuongTien').DataTable({
        data: tempDaPhuongTiens.map((item, index) => ({ ...item, stt: index + 1 })),
        columns: tableCols,
        columnDefs: tableDefs,
        paging: false,
        searching: false,
        info: false,
        ordering: false,
        autoWidth: false,
        responsive: true,
        language: {
            emptyTable: "Chưa có tài liệu truyền thông nào"
        }
    });
}

function refreshTempDaPhuongTienTable() {
    // Cập nhật dữ liệu cho DataTable
    if ($.fn.DataTable.isDataTable('#dataGridDaPhuongTien')) {
        const table = $('#dataGridDaPhuongTien').DataTable();
        const dataWithStt = tempDaPhuongTiens.map((item, index) => ({ ...item, stt: index + 1 }));
        table.clear().rows.add(dataWithStt).draw();
    } else {
        initTempDaPhuongTienTable();
    }
}

function editTempDaPhuongTien(index) {
    currentEditingDaPhuongTienIndex = index;
    const item = tempDaPhuongTiens[index];

    // Populate form
    $('input[name="loaiMediaDPT"][value="' + item.loaiMedia + '"]').prop('checked', true);
    if (item.loaiMedia == 1) {
        $("#fileHinhAnh").removeClass("d-none");
        $("#fileVideo, #fileAmThanh, #fileKhac").addClass("d-none");
        $("#fileDPT").attr("accept", ".jpg,.jpeg,.png,.gif,.webp,.bmp");
    } else if (item.loaiMedia == 2) {
        $("#fileVideo").removeClass("d-none");
        $("#fileHinhAnh, #fileAmThanh, #fileKhac").addClass("d-none");
        $("#fileDPT").attr("accept", ".mp4,.mov,.avi,.mkv,.webm");
    } else if (item.loaiMedia == 3) {
        $("#fileAmThanh").removeClass("d-none");
        $("#fileHinhAnh, #fileVideo, #fileKhac").addClass("d-none");
        $("#fileDPT").attr("accept", ".mp3,.wav,.ogg,.flac");
    } else if (item.loaiMedia == 4) {
        $("#fileKhac").removeClass("d-none");
        $("#fileHinhAnh, #fileVideo, #fileAmThanh").addClass("d-none");
        $("#fileDPT").attr("accept", "*/*");
    }
    $("#fileDPT").val(''); // Reset input file

    $("#tacGiaDPT").val(item.TacGia);
    $("#thuTuDPT").val(item.ThuTuHienThi);
    $('input[name="trangThaiDPT"][value="' + (item.suDung ? "1" : "0") + '"]').prop('checked', true);

    // Hiển thị ảnh bìa nếu có
    if (item.duongDanHinhAnhBia) {
        $('#showhinhAnhAdd').attr('src', item.duongDanHinhAnhBia);
    }

    //Nội dung đa ngữ
    $('#ngonNguDPT').val('vi').trigger('change');
    $('#tieuDeDPT').val(item.tieuDe);
    $('#moTaDPT').val(item.moTa);

    $('#modalAddDaPhuongTien').modal('show');
}

function resetDaPhuongTienModal() {
    $("#hinhAnhAdd").val('');
    $('#showhinhAnhAdd').attr('src', '/assets/images/vector/addImage.png');
    $("#tacGiaAdd").val('');
    $("#thuTuAdd").val('');
    $('input[name="trangThaiAdd"][value="1"]').prop('checked', true);
    $('#ngonNguAnPhamAdd').val('vi').trigger('change');
    $('#tenFileAdd').val('');
    $('#moTaFileAdd').val('');
}

function saveDaPhuongTienToTemp() {
    let loaiMedia = $("input[name='loaiMediaDPT']:checked").val();
    let fileDPT = $("#fileDPT")[0].files[0] || null;
    let tacGia = $("#tacGiaDPT").val();
    let thuTu = $("#thuTuDPT").val();
    let trangThai = $("input[name='trangThaiDPT']:checked").val();
    let duongDanFile = $("#duongDanFileDPT").val();
    let previewAnhBiaSrc = $('#showhinhAnhAdd').attr('src');

    let maNgonNgu = $("#ngonNguDPT").val();
    let tieuDe = $("#tieuDeDPT").val().trim();
    let moTa = $("#moTaDPT").val().trim();

    const DaPhuongTienData = {
        LoaiMedia: Number(loaiMedia),
        DuongDanFile: duongDanFile,
        duongDanHinhAnhBia: previewAnhBiaSrc !== '/assets/images/vector/addImage.png' ? previewAnhBiaSrc : null,
        TacGia: tacGia,
        ThuTuHienThi: thuTu || 1,
        SuDung: trangThai == "1" ? true : false,
        maNgonNgu: maNgonNgu,
        tieuDe: tieuDe,
        moTa: moTa
    };

    const DaPhuongTien = {
        LoaiMedia: Number(loaiMedia),
        LoaiDoiTuong: "DM_SuKien",
        DuongDanFile: duongDanFile,
        TacGia: tacGia,
        ThuTuHienThi: thuTu || 1,
        SuDung: trangThai == "1" ? true : false
    };

    const DaPhuongTien_NoiDung = [{
        maNgonNgu: maNgonNgu,
        tieuDe: tieuDe,
        moTa: moTa
    }]

    const FileDinhKem = [];
    if (fileDPT) {
        FileDinhKem.push(fileDPT);
    }


    try {
        if (currentEditingDaPhuongTienIndex >= 0) {
            // Nếu là tài liệu truyền thông đã tồn tại và được chỉnh sửa, cập nhật ngay lập tức
            if (tempDaPhuongTiens[currentEditingDaPhuongTienIndex].isExisting) {
                updateExistingDaPhuongTien(DaPhuongTienData);
            }
            tempDaPhuongTiens[currentEditingDaPhuongTienIndex] = DaPhuongTienData;
        } else {
            tempDaPhuongTiens.push(DaPhuongTienData);
            RequestDaPhuongTiens.push({
                DaPhuongTien: DaPhuongTien,
                DaPhuongTien_NoiDung: DaPhuongTien_NoiDung,
                File: FileDinhKem
            });
        }

        refreshTempDaPhuongTienTable();
        $('#modalAddDaPhuongTien').modal('hide');
        showNotification(1, currentEditingDaPhuongTienIndex >= 0 ? 'Cập nhật thành công' : 'Thêm thành công');
    } catch (error) {
        // Lỗi đã được hiển thị trong updateExistingDaPhuongTien
        console.error('Lỗi khi lưu tài liệu truyền thông:', error);
    }
}

function createTempDaPhuongTiens() {
    const newDaPhuongTiens = tempDaPhuongTiens.filter(ap => !ap.isExisting);
    const listDaPhuongTien = [];
    for (let i = 0; i < newDaPhuongTiens.length; i++) {
        console.log(newDaPhuongTiens[i])
        listDaPhuongTien.push(newDaPhuongTiens[i]);
    }
    return listDaPhuongTien;
}

function createRequestDaPhuongTiens() {
    const requestDaPhuongTiens = RequestDaPhuongTiens.filter(ap => !ap.isExisting);
    const listDaPhuongTien = [];
    for (let i = 0; i < requestDaPhuongTiens.length; i++) {
        console.log(requestDaPhuongTiens[i])
        listDaPhuongTien.push(requestDaPhuongTiens[i]);
    }
    return listDaPhuongTien;
}
//#endregion Function Xử lý tài liệu truyền thông khi thêm mới

//#region Function Xử lý tài liệu truyền thông khi chỉnh sửa
function initDaPhuongTienTable(ID) {
    // Khởi tạo DataTable cho bảng tài liệu truyền thông tạm
    const tableApi = {
        url: `${baseUrl}/api/DaPhuongTienApi/DanhSach`,
        type: "POST",
        data: function (d) {
            return JSON.stringify({
                "doiTuongSoHuuID": ID,
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
                return `<div class="group-info have-image">
                    <div class="have-image">
                        <img src="${row.duongDanFile || '/assets/images/vector/no-image.png'}" alt="${row.tenDaPhuongTien || ''}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                    </div>
                    <div class="group-info">
                    <div class="info-main"><div>${row.tieuDe || ''}</div></div>
                    <div class="info-sub">${row.TacGia || ''}</div></div>
                </div>`;
            }
        },
        {
            targets: 2,
            render: function (data, type, row, meta) {
                if (row.loaiMedia == 1) {
                    return `Hình ảnh`;
                } else if (row.loaiMedia == 2) {
                    return `Video`;
                } else if (row.loaiMedia == 3) {
                    return `Audio`;
                } else if (row.loaiMedia == 4) {
                    return `File khác`;
                }
                return ``;
            }
        },
        {
            targets: 4, // Cột chức năng
            render: function (data, type, row, meta) {
                const editIcon = `<i data-toggle="tooltip" title="Chỉnh sửa" class="edit-DaPhuongTien text-yellow cursor-pointer me-2" data-index="${meta.row}" id="${meta.row}">
                    <i class="hgi-icon hgi-edit"></i>
                </i>`;

                const deleteIcon = `<i data-toggle="tooltip" title="Xóa khỏi danh sách" class="delete-DaPhuongTien text-red cursor-pointer" data-index="${meta.row}" id="${meta.row}">
                        <i class="hgi-icon hgi-delete"></i>
                    </i>`;

                return editIcon + deleteIcon;;
            }
        }
    ];

    const tableCols = [
        { "data": "stt", "width": "40px", "class": "center-align" },
        { "data": "", "width": "", "class": "left-align" },
        { "data": "", "width": "15%", "class": "left-align" },
        { "data": "tacGia", "width": "15%", "class": "left-align" },
        { "data": "", "width": "120px", "class": "center-align group-icon-action" }
    ];

    // Destroy existing DataTable if exists
    if ($.fn.DataTable.isDataTable('#dataGridDaPhuongTien')) {
        $('#dataGridDaPhuongTien').DataTable().destroy();
    }

    initDataTableConfigNoSearch('dataGridDaPhuongTien', tableApi, tableDefs, tableCols);
}

function dataAddDaPhuongTien() {
    let daPhuongTienID = $('#idDPT').val() || null
    let loaiMedia = $("input[name='loaiMediaDPT']:checked").val();
    let fileDPT = $("#fileDPT")[0].files[0] || null;
    let tacGia = $("#tacGiaDPT").val();
    let thuTu = $("#thuTuDPT").val();
    let trangThai = $("input[name='trangThaiDPT']:checked").val();
    let duongDanFile = $("#duongDanFileDPT").val();

    let maNgonNgu = $("#ngonNguDPT").val();
    let tieuDe = $("#tieuDeDPT").val().trim();
    let moTa = $("#moTaDPT").val().trim();

    const DaPhuongTien = {
        LoaiMedia: Number(loaiMedia),
        LoaiDoiTuong: "VH_LeHoi",
        doiTuongSoHuuID: SuKienId,
        DuongDanFile: duongDanFile,
        TacGia: tacGia,
        ThuTuHienThi: thuTu || 1,
        SuDung: trangThai == "1" ? true : false
    };

    const DaPhuongTien_NoiDung = [{
        maNgonNgu: maNgonNgu,
        tieuDe: tieuDe,
        moTa: moTa
    }]

    const FileDinhKem = [];
    if (fileDPT) {
        FileDinhKem.push(fileDPT);
    }

    console.log(DaPhuongTien, DaPhuongTien_NoiDung, FileDinhKem)

    let formData = new FormData();
    formData.append('DaPhuongTien', JSON.stringify(DaPhuongTien));
    formData.append('DaPhuongTien_NoiDung', JSON.stringify(DaPhuongTien_NoiDung));
    if (fileDPT) formData.append('File', fileDPT);

    if (daPhuongTienID != null) {
        $.ajax({
            type: 'PUT',
            url: `${baseUrl}/api/DaPhuongTienApi/ChinhSua/${daPhuongTienID}`,
            async: false,
            contentType: false,
            processData: false,
            data: formData,
            success: function (data) {
                if (data.isSuccess && data.value) {
                    showNotification(1, "Chỉnh sửa tài liệu truyền thông thành công");
                    $('#modalAddDaPhuongTien').modal('hide');
                    initDaPhuongTienTable(SuKienId);
                } else {
                    showNotification(0, "Chỉnh sửa tài liệu truyền thông không thành công");
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
            url: `${baseUrl}/api/DaPhuongTienApi/ThemMoi`,
            async: false,
            contentType: false,
            processData: false,
            data: formData,
            success: function (data) {
                if (data.isSuccess && data.value) {
                    showNotification(1, "Thêm mới tài liệu truyền thông thành công");
                    $('#modalAddDaPhuongTien').modal('hide');
                    initDaPhuongTienTable(SuKienId);
                } else {
                    showNotification(0, "Thêm mới tài liệu truyền thông không thành công");
                    console.log(data.error) 
                }
            },
            error: function (err) {
                console.log(err)
            }
        })
    }
}

function loadDataDaPhuongTien_FromTable(data) {
    console.log(data, "data tài liệu truyền thông")
    $('#idDPT').val(data.daPhuongTienID);
    // Các input text
    $("input[name='loaiMediaDPT'][value='" + data.loaiMedia + "']").prop("checked", true);
    if (data.duongDanFile) {
        $("#showFileEdit").text(data.duongDanFile);
        $("#duongDanFileDPT").val(data.duongDanFile);
        $("#showhinhAnhAdd").attr("src", data.duongDanFile);
    } else {
        $("#showFileEdit").text("");
    }
    $("#tacGiaDPT").val(data.tacGia);
    $("#thuTuDPT").val(data.thuTuHienThi);
    $(`input[name='trangThaiAdd'][value='${data.suDung ? 1 : 0}']`).prop('checked', true);

    // Radio trạng thái
    $(`input[name='trangThaiAdd'][value='${data.suDung ? 1 : 0}']`).prop('checked', true);

    $('#ngonNguDPT').val('vi').trigger('change');
    loadTranslationDaPhuongTien(data.daPhuongTienID, 'vi');
}

function loadTranslationDaPhuongTien(daPhuongTienID, maNgonNgu) {
    getDataWithApi('GET', `/api/DaPhuongTienApi/BanDich/${daPhuongTienID}/${maNgonNgu}`).then(data => {
        console.log(data, "Load bản dịch tài liệu truyền thông")
        if (data && data.isSuccess && data.value) {
            translationsDaPhuongTien = data.value;
            var banDich = translationsDaPhuongTien.find(el => el.maNgonNgu === maNgonNgu)
            // Populate các trường dịch với dữ liệu đa ngữ
            $('#tieuDeDPT').val(banDich.tieuDe);
            $('#moTaDPT').val(banDich.moTa);
        } else {
            // Nếu không có bản dịch, clear các trường dịch
            $("#tieuDeDPT").val('');
            $("#moTaDPT").val('');
        }  
    })
}
//#endregion Function Xử lý tài liệu truyền thông khi chỉnh sửa

//#region Action Xử lý sự kiện khi thêm mới
function ActionAddSuKien() {
    //#region Xử lý thông tin sự kiện
    $(document).on('change', '#ngonNguDichSuKienAdd', function () {
        $('#tenSuKienDichAdd').val('');
        $('#diaChiAdd').val('');
        $('#noiDungAdd').val('');
    });
    //#endregion Xử lý thông tin sự kiện

    //#region Xử lý tọa độ, vị trí bản đồ
    $(document).on('change', '#DiaDiemCoSanAdd', function () {
        let listDiaDiem = $(this).val();
        initTableDiaDiem(listDiaDiem.map(item => item).join(','));
    });

    $("#btnAddDiaDiem").on("click", function () {
        dataAddDiaDiem()
    })
    //#endregion Xử lý tọa độ, vị trí bản đồ

    //#region Xử lý Tài liệu truyền thông
    $('#btnAddDaPhuongTien').on('click', function () {
        currentEditingDaPhuongTienIndex = -1;
        tempDaPhuongTienTranslations = [];
        resetDaPhuongTienModal();
        $('#modalAddDaPhuongTien').modal('show');
    });

    $(document).on('click', '.edit-temp-DaPhuongTien', function () {
        const index = $(this).data('index');
        editTempDaPhuongTien(index);
    });

    $(document).on('click', '.delete-temp-DaPhuongTien', function () {
        const index = $(this).data('index');
        tempDaPhuongTiens.splice(index, 1);
        refreshTempDaPhuongTienTable();
    });

    $("#formAddDaPhuongTien").on("submit", function (e) {
        e.preventDefault();
        saveDaPhuongTienToTemp();
    });
    //#endregion Xử lý Tài liệu truyền thông
}
//#endregion Action Xử lý sự kiện khi thêm mới

//#region Action Xử lý sự kiện khi chỉnh sửa
function ActionEditSuKien() {
    //#region Xử lý thông tin sự kiện
    $(document).on('change', '#ngonNguDichAdd', function () {
        let maNgonNgu = $(this).val();
        
        if (SuKienId && maNgonNgu) {
            console.log('Chuyển Ngôn ngữ cho sự kiện hiện tại:', maNgonNgu);
            // Load bản dịch cho ngôn ngữ được chọn
            loadTranslationSuKien(SuKienId, maNgonNgu);
        } else {
            // Nếu chưa có cơ quan (tạo mới) hoặc chưa chọn ngôn ngữ, clear các trường dịch
            if (!SuKienId || !maNgonNgu) {
                $("#tenSuKienDichAdd").val('');
                $("#ketQuaAdd").val('');
                $("#moTaAdd").val('');
            }
        }
    });
    //#endregion Xử lý thông tin sự kiện

    //#region Xử lý tọa độ, vị trí bản đồ
    $("#modalAddDiaDiem").on('hidden.bs.modal', function () {
        translationsDiaDiem = []
        resetModal(this)
    })

    $(document).on('change', '#DiaDiemCoSanAdd', function () {
        let listDiaDiem = $(this).val();
        initTableDiaDiem(listDiaDiem.map(item => item).join(','));
    });

    $("#btnAddDiaDiem").on("click", function () {
        dataAddDiaDiem()
    })
    //#endregion Xử lý tọa độ, vị trí bản đồ

    //#region Xử lý Tài liệu truyền thông
    $("#modalAddDaPhuongTien").on('hidden.bs.modal', function () {
        translationsDaPhuongTien = []
        resetModal(this)
    })

    $('#btnAddDaPhuongTien').on('click', function () {
        $('#modalAddDaPhuongTien').modal('show');
        resetModal(this)
    });

    $("#formAddDaPhuongTien").on("submit", function (e) {
        e.preventDefault();
        dataAddDaPhuongTien();
    });

    $("#ngonNguDPT").on("change", function () {
        let maNgonNgu = $(this).val();
        let exist = translationsDaPhuongTien.find(t => t.maNgonNgu === maNgonNgu);

        if (exist) {
            $("#tieuDeDPT").val(exist.tieuDe);
            $("#moTaDPT").val(exist.moTa);
        } else {
            // reset nếu chưa có dữ liệu
            $("#tieuDeDPT").val("");
            $("#moTaDPT").val("");
        }
        console.log("Sau khi đổi ngôn ngữ:", translationsDaPhuongTien);
    });

    $(document).on('click', '.edit-DaPhuongTien', function () {
        var id = $(this).attr("ID").match(/\d+/)[0];
        var data = $('#dataGridDaPhuongTien').DataTable().row(id).data();
        loadDataDaPhuongTien_FromTable(data);

        $("#modalAddDaPhuongTien").modal("show");
    });

    $(document).on('click', '.delete-DaPhuongTien', function () {
        var id = $(this).attr("ID").match(/\d+/)[0];
        var data = $('#dataGridDaPhuongTien').DataTable().row(id).data();

        $('#idDelete').val(data.daPhuongTienID);
        $('#nameDelete').text(`${data.tieuDe}`);

        $('#modalDelete').modal('show');
    });

    $("#formDelete").on("submit", function (e) {
        e.preventDefault();
        deleteDaPhuongTien();
    });
    //#endregion Xử lý Tài liệu truyền thông
}

function loadTranslationSuKien(SuKienId, maNgonNgu) {
    getDataWithApi('GET', `/api/DM_SuKienApi/Get?SuKienID=${SuKienId}&MaNgonNgu=${maNgonNgu}`).then(data => {
        console.log(data, "Load bản dịch sự kiện")
        if (data && data.isSuccess && data.value) {
            translations = data.value;
            // Populate các trường dịch với dữ liệu đa ngữ
            $("#tenSuKienDichAdd").val(translations.tenSuKien);
            $("#ketQuaAdd").val(translations.ketQua);
            $("#moTaAdd").val(translations.moTa);
        } else {
            // Nếu không có bản dịch, clear các trường dịch
            $("#tenSuKienDichAdd").val('');
            $("#ketQuaAdd").val('');
            $("#moTaAdd").val('');
        }
    })
}

function deleteDaPhuongTien() {
    let id = $('#idDelete').val();
    let type = $('#idTypeDelete').val();
    if (type == 2) {
        return;
    }
    $.ajax({
        type: 'DELETE',
        url: `${baseUrl}/api/DaPhuongTienApi/Xoa/${id}`,
        async: false,
        contentType: "application/json, charset=utf-8",
        success: function (data) {
            if (data.isSuccess && data.value) {
                showNotification(1, "Xoá tài liệu truyền thông thành công");
                $('#modalDelete').modal('hide');
                $('#dataGridDaPhuongTien').DataTable().ajax.reload();
            } else {
                showNotification(0, "Xoá tài liệu truyền thông không thành công");
                console.log(data.error)
            }
        },
        error: function (err) {
            console.log(err)
        }
    })
}
//#endregion Action Xử lý sự kiện khi chỉnh sửa

//#region CKEditor Functions
function getGioiThieuData() {
    return ckeditorgioiThieuDich.getData();
}

function getGhiChuData() {
    return ckeditorghiChuDich.getData();
}

function setGioiThieuData(data) {
    ckeditorgioiThieuDich.setData(data);
}

function setGhiChuData(data) {
    ckeditorghiChuDich.setData(data);
}
//#endregion CKEditor Functions

function resetThongTinSuKien() {
    $('#tenSuKienAdd').val('');
    $('#ngayBatDauAdd').val('');
    $('#ngayKetThucAdd').val('');
    $('#thoiGianHoatDongAdd').val('');
    $('#sucChuaAdd').val('');
    $('#diaChiAdd').val('');
    $('#ketQuaAdd').val('');
    $('#moTaAdd').val('');
    setGioiThieuData('');
    setGhiChuData('');
    $('#ngonNguDichAdd').val('vi').trigger('change');
    $('#tenSuKienDichAdd').val('');
    $('#ketQuaDichAdd').val('');
    $('#moTaDichAdd').val('');
    setGioiThieuData('');
    setGhiChuData('');
    $('#DiaDiemCoSanAdd').val(null).trigger('change');
    initTableDiaDiem('');
    tempDaPhuongTiens = [];
    RequestDaPhuongTiens = [];
    refreshTempDaPhuongTienTable();
    translations = {};
    translationsDiaDiem = [];
    translationsDaPhuongTien = [];
    SuKienId = null;
    currentEditingDaPhuongTienIndex = -1;
    tempDaPhuongTienTranslations = [];
    resetModal('#modalAddDiaDiem');
    resetModal('#modalAddDaPhuongTien');
}

function resetAnPham() {
    translationsAnPham = []
    const form = $("#formInputs_AnPham");
    // Reset tất cả input type text, number, hidden
    form.find("input[type='text'], input[type='number'], input[type='hidden']").val("");
    form.find("select").val("").trigger("change");
    $("#suDung_AnPham").prop("checked", true);
    $("#anhDaiDien_AnPham").val("");
    $("#previewAnhDaiDien_AnPham").attr("src", "/assets/images/vector/addImage.png");
    $("#thuTu_AnPham").val(1);

    //$('#tenAnPhamAdd').val('');
    //$('#ngayPhatHanhAdd').val('');
    //$('#donViPhatHanhAdd').val('');
    //$('#soTrangAdd').val('');
    //$('#ngonNguAnPhamAdd').val('vi').trigger('change');
    //$('#loaiAnPhamAdd').val('').trigger('change');
    //$('#tenAnPhamDichAdd').val('');
    //$('#moTaAnPhamDichAdd').val('');
    //translationsAnPham = [];
    //AnPhamId = null;
    //$('#idAnPham').val('');
    //$('#showFileEditAnPham').text('');
    //$('#duongDanFileAnPham').val('');
    //$('#hinhAnhAnPhamAdd').val('');
    //$('#showhinhAnhAnPhamAdd').attr('src', '/assets/images/vector/addImage.png');
    //$('#tenFileAnPhamAdd').val('');
    //$('#moTaFileAnPhamAdd').val('');
    //currentEditingAnPhamIndex = -1;
    //tempAnPhamTranslations = [];
    //tempAnPhams = [];
    //RequestAnPhams = [];
    //resetModal('#modalAddAnPham');
    //resetModal('#modalAddFileDinhKemAnPham');
    //$('#modalAddAnPham').find('.modal-title').text('Thêm ấn phẩm');
    //$('#modalAddAnPham').find('#btnSaveAnPham').text('Thêm ấn phẩm');
    //$('#modalAddAnPham').find('#btnSaveAnPham').removeClass('btn-warning').addClass('btn-primary');
    //$('#modalAddFileDinhKemAnPham').find('.modal-title').text('Thêm file đính kèm');
    //$('#modalAddFileDinhKemAnPham').find('#btnSaveFileDinhKemAnPham').text('Thêm file đính kèm');
    //currentEditingFileDinhKemAnPhamIndex = -1;
    //tempFileDinhKemAnPhamTranslations = [];
    //tempFileDinhKemAnPhams = [];
    //RequestFileDinhKemAnPhams = [];
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

const isInvalidPriceRange = (minValue, maxValue) => {
    // Cho phép rỗng (nếu 1 trong 2 trống thì không tính là lỗi)
    if (
        minValue === undefined || maxValue === undefined ||
        minValue === null || maxValue === null ||
        minValue === "" || maxValue === ""
    ) {
        return false;
    }

    // Nếu có ký tự không hợp lệ (chỉ cho phép số và dấu chấm)
    const validFormat = /^[0-9.]+$/;
    if (!validFormat.test(minValue) || !validFormat.test(maxValue)) {
        return true; // lỗi vì chứa text hoặc ký tự lạ
    }

    // Loại bỏ dấu chấm ngăn cách nghìn (VD: "1.000.000" → "1000000")
    const cleanMin = String(minValue).replace(/\./g, "");
    const cleanMax = String(maxValue).replace(/\./g, "");

    const min = parseFloat(cleanMin);
    const max = parseFloat(cleanMax);

    // Nếu không phải số hợp lệ thì lỗi
    if (isNaN(min) || isNaN(max)) return true;

    // Trả về true nếu giá cao nhất nhỏ hơn giá thấp nhất
    return max < min;
};

const isValidDateRange = (ngayCap, ngayHetHan) => {
    // Nếu thiếu 1 trong 2 → không lỗi
    if (!ngayCap || !ngayHetHan) return false;



    //const start = new Date(formatDateToSaveAsString(ngayCap));
    //const end = new Date(formatDateToSaveAsString(ngayHetHan));

    // Nếu ngày không hợp lệ
    /* if (isNaN(ngayCap) || isNaN(ngayHetHan)) return true;*/

    return ngayHetHan < ngayCap;
};

const checkUnique = (maDinhDanh, toChucID) => {
    let result = 0
    let url = `${baseUrl}/api/ToChucApi/CheckUnique?MaDinhDanh=${maDinhDanh}&LoaiToChucID=94`
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

const checkUnique_SuKien = (linhVucID, maDinhDanh) => {
    let result = 0
    $.ajax({
        type: "GET",
        async: false,
        url: `${baseUrl}/api/DM_SuKienApi/CheckUnique?LinhVucID=${linhVucID}&MaDinhDanh=${maDinhDanh}`,
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

    return result;
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

const isValidPhoneNumber = (value) => {
    const regex = /^$|^\d{10,11}$/;
    return !regex.test(value);
}
//#endregion function validation
