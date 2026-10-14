const baseUrl = getRootLink();
// Biến lưu trữ tạm cho ấn phẩm/kênh phát sóng
let tempAnPhams = [];
let tempAnPhamTranslations = [];
let currentEditingAnPhamIndex = -1;
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
        dataAdd()
    })

    // Khi thay đổi Ngôn ngữ, reset các input trong phần đa ngữ
    $(document).on('change', '#ngonNguDich', function() {
        $('#tenCoQuanDich').val('');
        $('#diaChiDich').val('');
        ckeditorgioiThieuDich.setData('');
        ckeditorghiChuDich.setData('');
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

    // Event handler cho nút thêm ấn phẩm
    $('#btnThemAnPham').on('click', function() {
        currentEditingAnPhamIndex = -1;
        tempAnPhamTranslations = [];
        resetAnPhamModal();
        $('#modalAdd').modal('show');
    });

    // Event handlers cho bảng tạm
    $(document).on('click', '.edit-temp-anpham', function() {
        const index = $(this).data('index');
        editTempAnPham(index);
    });

    $(document).on('click', '.delete-temp-anpham', function() {
        const index = $(this).data('index');
        tempAnPhams.splice(index, 1);
        refreshTempAnPhamTable();
    });

    // Event handlers cho modal ấn phẩm
    /* $("#tenAnPhamAdd, #doiTuongDocGiaAdd").on("blur", function () {
        saveTempAnPhamTranslation();
    }); */

    $("#ngonNguAdd").on("change", function () {
        let maNgonNgu = $(this).val();
        let exist = tempAnPhamTranslations.find(t => t.maNgonNgu === maNgonNgu);
        if (exist) {
            $("#tenAnPhamAdd").val(exist.tenAnPham);
            $("#doiTuongDocGiaAdd").val(exist.doiTuongDocGia);
        } else {
            $("#tenAnPhamAdd").val("");
            $("#doiTuongDocGiaAdd").val("");
        }
    });

    $("#ngonNguDich").on("change", function () {
        let maNgonNgu = $(this).val();
        const coQuanId = $('#coQuanId').val();
        
        if (coQuanId && maNgonNgu) {
            console.log('Chuyển Ngôn ngữ cho cơ quan hiện tại:', maNgonNgu);
            // Load bản dịch cho ngôn ngữ được chọn
            loadToChucTranslation(coQuanId, maNgonNgu);
        } else {
            // Nếu chưa có cơ quan (tạo mới) hoặc chưa chọn ngôn ngữ, clear các trường dịch
            if (!coQuanId) {
                $('#tenCoQuanDich').val('');
                $('#diaChiDich').val('');
                $('#gioiThieuDich').val('');
            }
        }
    });

    // Submit modal ấn phẩm
    $("#formAdd").on("submit", function (e) {
        e.preventDefault();
        /* saveTempAnPhamTranslation(); */
        saveAnPhamToTemp();
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
        "loaiHinhID": loaiHinh,
        "tinhID": tinhID,
        "xaID": xaID,
        "toaDoX": toaDoX?.trim() || null,
        "toaDoY": toaDoY?.trim() || null,
        "quyMo": quyMo?.trim() || null,
        "maNgonNgu": ngonNguDich || "vi",
        "tenToChuc": tenCoQuan?.trim(),
        "diaChi": diaChi?.trim() || null,
        "gioiThieu": gioiThieu?.trim() || null,
        "ghiChu": ghiChu?.trim() || null,
        "trangThai": trangThai == '1' ? true : false,
        "thuTu": thuTu
    };

    let listAnPham = createTempAnPhams();
    console.log(listAnPham)

    let formData = new FormData();
    formData.append('reqeustToChuc', JSON.stringify(dt));
    formData.append('requestAnPham', JSON.stringify(listAnPham));

    if (checkTagHtmlSingle(maDinhDanh)) {
        showNotification(0, "Mã cơ quan báo chí chứa ký tự không hợp lệ")
    }
    else if (maDinhDanh != null && maDinhDanh != '' && checkUnique(maDinhDanh.trim()) > 0) {
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
            type: 'POST',
            url: `${baseUrl}/api/ToChucApi/AddToChucBaoChi`,
            async: false,
            contentType: false,
            processData: false,
            data: formData,
            success: function (data) {
                if (data.isSuccess && data.value) {
                    showNotification(1, "Thêm mới cơ quan báo chí thành công");
                    console.log(data)
                    setTimeout(() => {
                        window.location.href = `${baseUrl}/AdminTool/BaoChi/CoQuanBaoChi`;
                    }, 1500);
                } else {
                    showNotification(0, "Thêm mới cơ quan báo chí không thành công");
                    console.log(data.error)
                }
            },
            error: function (err) {
                console.log(err)
            }
        })
    }

   
}

// Khởi tạo bảng tạm cho ấn phẩm
function initTempAnPhamTable() {
    // Khởi tạo DataTable cho bảng ấn phẩm tạm
    const tableApi = {
        data: tempAnPhams,
        dataSrc: function(data) {
            return data.map((item, index) => ({
                ...item,
                stt: index + 1
            }));
        }
    };

    const tableDefs = [
        {
            targets: 5, // Cột trạng thái
            render: function (data, type, row, meta) {
                if (row.trangThai) {
                    return `<i class="hgi-icon hgi-check text-green"></i>`;
                } else {
                    return `<i class="hgi-icon hgi-cancel text-red"></i>`;
                }
            }
        },
        {
            targets: 6, // Cột chức năng
            render: function (data, type, row, meta) {
                const editIcon = `<i data-toggle="tooltip" title="Chỉnh sửa" class="edit-temp-anpham text-yellow cursor-pointer me-2" data-index="${meta.row}">
                    <i class="hgi-icon hgi-edit"></i>
                </i>`;
                
                const deleteIcon = row.isExisting 
                    ? `<i data-toggle="tooltip" title="Xóa khỏi hệ thống" class="delete-existing-anpham text-red cursor-pointer" data-index="${meta.row}" data-id="${row.baoChiAnPhamID}">
                        <i class="hgi-icon hgi-delete"></i>
                    </i>`
                    : `<i data-toggle="tooltip" title="Xóa khỏi danh sách" class="delete-temp-anpham text-red cursor-pointer" data-index="${meta.row}">
                        <i class="hgi-icon hgi-delete"></i>
                    </i>`;
                
                return editIcon + deleteIcon;;
            }
        }
    ];

    const tableCols = [
        { "data": "stt", "width": "40px", "class": "center-align" },
        { "data": "tenAnPham", "width": "25%", "class": "left-align" },
        { "data": "tenTanSuat", "width": "120px", "class": "left-align" },
        { "data": "tenLinhVucChuyenSau", "width": "120px", "class": "left-align" },
        { "data": null, "width": "120px", "class": "center-align", "defaultContent": "-" },
        { "data": "trangThai", "width": "120px", "class": "center-align" },
        { "data": null, "width": "120px", "class": "center-align group-icon-action" }
    ];

    // Destroy existing DataTable if exists
    if ($.fn.DataTable.isDataTable('#tableAnPham')) {
        $('#tableAnPham').DataTable().destroy();
    }

    $('#tableAnPham').DataTable({
        data: tempAnPhams.map((item, index) => ({ ...item, stt: index + 1 })),
        columns: tableCols,
        columnDefs: tableDefs,
        paging: false,
        searching: false,
        info: false,
        ordering: false,
        autoWidth: false,
        responsive: true,
        language: {
            emptyTable: "Chưa có ấn phẩm/kênh phát sóng nào"
        }
    });
}

function refreshTempAnPhamTable() {
    // Cập nhật dữ liệu cho DataTable
    if ($.fn.DataTable.isDataTable('#tableAnPham')) {
        const table = $('#tableAnPham').DataTable();
        const dataWithStt = tempAnPhams.map((item, index) => ({ ...item, stt: index + 1 }));
        table.clear().rows.add(dataWithStt).draw();
    } else {
        initTempAnPhamTable();
    }
}

function editTempAnPham(index) {
    currentEditingAnPhamIndex = index;
    const item = tempAnPhams[index];
    console.log(item)
    
    // Populate form
    $('#linhVucChuyenSauAdd').val(item.linhVucChuyenSauID).trigger('change');
    $('#tanSuatAdd').val(item.tanSuatID).trigger('change');
    $(`input[name='trangThaiAdd'][value='${item.trangThai ? "1" : "0"}']`).prop('checked', true);
    $('#ngonNguAdd').val(item.maNgonNgu).trigger('change');
    $('#tenAnPhamAdd').val(item.tenAnPham);
    $('#doiTuongDocGiaAdd').val(item.doiTuongDocGia);
    
    $('#modalAdd').modal('show');
}

function resetAnPhamModal() {
    $('#linhVucChuyenSauAdd').val('').trigger('change');
    $('#tanSuatAdd').val('').trigger('change');
    $('#ngonNguAdd').val('vi').trigger('change');
    $('#tenAnPhamAdd').val('');
    $('#doiTuongDocGiaAdd').val('');
    $('input[name="trangThaiAdd"][value="1"]').prop('checked', true);
}

function saveAnPhamToTemp() {
    let linhVucChuyenSau = $('#linhVucChuyenSauAdd').val();
    let tanSuat = $('#tanSuatAdd').val();
    let trangThai = $("input[name='trangThaiAdd']:checked").val();

    const linhVucText = $("#linhVucChuyenSauAdd option:selected").text();
    const tanSuatText = $("#tanSuatAdd option:selected").text();

    let maNgonNgu = $("#ngonNguAdd").val();
    let tenAnPham = $("#tenAnPhamAdd").val().trim();
    let doiTuongDocGia = $("#doiTuongDocGiaAdd").val().trim();

    const anPhamData = {
        linhVucChuyenSauID: linhVucChuyenSau,
        tanSuatID: tanSuat,
        trangThai: trangThai === "1",
        tenLinhVucChuyenSau: linhVucText,
        tenTanSuat: tanSuatText,
        maNgonNgu: maNgonNgu,
        tenAnPham: tenAnPham,
        doiTuongDocGia: doiTuongDocGia,
    };

    try {
        if (currentEditingAnPhamIndex >= 0) {
            // Nếu là ấn phẩm đã tồn tại và được chỉnh sửa, cập nhật ngay lập tức
            if (tempAnPhams[currentEditingAnPhamIndex].isExisting) {
                updateExistingAnPham(anPhamData);
            }
            tempAnPhams[currentEditingAnPhamIndex] = anPhamData;
        } else {
            tempAnPhams.push(anPhamData);
        }

        refreshTempAnPhamTable();
        $('#modalAdd').modal('hide');
        showNotification(1, currentEditingAnPhamIndex >= 0 ? 'Cập nhật thành công' : 'Thêm thành công');
    } catch (error) {
        // Lỗi đã được hiển thị trong updateExistingAnPham
        console.error('Lỗi khi lưu ấn phẩm:', error);
    }
}

function createTempAnPhams() {
    const newAnPhams = tempAnPhams.filter(ap => !ap.isExisting);
    const listAnPham = [];
    for (let i = 0; i < newAnPhams.length; i++) {
        listAnPham.push(newAnPhams[i]);
    }
    return listAnPham;
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