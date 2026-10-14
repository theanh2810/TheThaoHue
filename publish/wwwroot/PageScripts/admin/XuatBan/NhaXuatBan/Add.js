const baseUrl = getRootLink();
// Biến lưu trữ tạm cho ấn phẩm/kênh phát sóng
let tempAnPhams = [];
let RequestXuatBan = [];
let tempAnPhamTranslations = [];
let currentEditingAnPhamIndex = -1;
const ckeditorgioiThieuDich = CKEDITOR.replace('gioiThieuDich');
const ckeditorghiChuDich = CKEDITOR.replace('ghiChuDich');

$(document).ready(function () {
    initDatePicker();
    initDanhMucChung_NoAll(24, "#loaiHinh", "")
    initDanhMucChung_NoAll(34, "#coQuanChuQuan", "")
    initDanhMucChung_NoAll(25, "#theLoaiAdd", "")
    initNgonNgu("#ngonNguDich")
    initNgonNgu("#ngonNguAdd")
    initTinhThanhPho()
    initSelect2();
    previewPicture()

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
        "loaiToChucID": 98, // ID cho nhà xuất bản
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
        "thuTu": thuTu ? thuTu : null,
        "trangThai": trangThai == 1 ? true: false
    };



    let listAnPham = createTempAnPhams();
    let requestAnPham = createRequestAnPhams();
    console.log(listAnPham)
    console.log(requestAnPham, "requestAnPham")

    let formData = new FormData();
    formData.append('RequestToChuc', JSON.stringify(dt));
    for (let i = 0; i < requestAnPham.length; i++) {
        formData.append(`RequestXuatBan[${i}].XuatBanAnPham`, JSON.stringify(requestAnPham[i].XuatBanAnPham));
        formData.append(`RequestXuatBan[${i}].XuatBanAnPham_NoiDung`, JSON.stringify(requestAnPham[i].XuatBanAnPham_NoiDung));  
        formData.append(`RequestXuatBan[${i}].FileDinhKem`, requestAnPham[i].FileDinhKem[0]);  
    }

    if (checkTagHtmlSingle(maDinhDanh)) {
        showNotification(0, "Mã nhà xuất bản chứa ký tự không hợp lệ")
    }
    else if (maDinhDanh != null && maDinhDanh != '' && checkUnique(maDinhDanh.trim()) > 0) {
        showNotification(0, "Mã nhà xuất bản đã tồn tại")
    }
    else if (checkEmptyBlank(loaiHinh)) {
        showNotification(0, "Vui lòng chọn lĩnh vực xuất bản")
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
    else if (isValidPositiveIntegerAllowEmpty(thuTu)) {
        showNotification(0, "Thứ tự không hợp lệ")
    }
    else if (checkEmptyBlank(tenCoQuan)) {
        showNotification(0, "Vui lòng nhập tên nhà xuất bản")
    }
    else if (checkTagHtmlSingle(tenCoQuan)) {
        showNotification(0, "Tên nhà xuất bản chứa ký tự không hợp lệ")
    }
    else if (checkTagHtmlSingle(diaChi)) {
        showNotification(0, "Địa chỉ chứa ký tự không hợp lệ")
    }
    else {
        $.ajax({
            type: 'POST',
            url: `${baseUrl}/api/ToChucApi/AddNhaXuatBan`,
            async: false,
            contentType: false,
            processData: false,
            data: formData,
            success: function (data) {
                if (data.isSuccess && data.value) {
                    showNotification(1, "Thêm mới nhà xuất bản thành công");
                    console.log(data)
                    setTimeout(() => {
                        window.location.href = `${baseUrl}/AdminTool/XuatBan/NhaXuatBan`;
                    }, 1500);
                } else {
                    showNotification(0, "Thêm mới nhà xuất bản không thành công");
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
            console.log(data)
            return data.map((item, index) => ({
                ...item,
                stt: index + 1
            }));
        }
    };

    const tableDefs = [
        {
            targets: 1, // Cột tên cơ quan báo chí
            render: function (data, type, row, meta) {
                return `<div class="group-info have-image">
                    <div class="have-image">
                        <img src="${row.duongDanHinhAnhBia || '/assets/images/vector/no-image.png'}" alt="${row.tenAnPham || ''}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                    </div>
                    <div class="group-info">
                    <div class="info-main"><div>${row.tenAnPham || ''}</div></div>
                    <div class="info-sub">${row.maDinhDanhXBAP || ''}</div></div>
                </div>`;
            }
        },
        {
            targets: 3, // Năm xuất bản
            render: function (data, type, row, meta) {
                return data || '-';
            }
        },
        {
            targets: 5, // Giá bìa
            render: function (data, type, row, meta) {
                if (data && data > 0) {
                    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data);
                }
                return '-';
            }
        },
        {
            targets: 6, // Cột trạng thái
            render: function (data, type, row, meta) {
                if (row.trangThai) {
                    return `<i class="hgi-icon hgi-check text-green"></i>`;
                } else {
                    return `<i class="hgi-icon hgi-cancel text-red"></i>`;
                }
            }
        },
        {
            targets: 7, // Cột chức năng
            render: function (data, type, row, meta) {
                const editIcon = `<i data-toggle="tooltip" title="Chỉnh sửa" class="edit-temp-anpham text-yellow cursor-pointer me-2" data-index="${meta.row}">
                    <i class="hgi-icon hgi-edit"></i>
                </i>`;
                
                const deleteIcon = row.isExisting 
                    ? `<i data-toggle="tooltip" title="Xóa khỏi hệ thống" class="delete-existing-anpham text-red cursor-pointer" data-index="${meta.row}" data-id="${row.xuatBanAnPhamID}">
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
        { "data": "tenTheLoai", "width": "120px", "class": "left-align" },
        { "data": "namXuatBan", "width": "100px", "class": "center-align" },
        { "data": "", "width": "100px", "class": "center-align", "defaultContent": "-" },
        { "data": "giaBia", "width": "100px", "class": "left-align" },
        { "data": "trangThai", "width": "120px", "class": "center-align" },
        { "data": "", "width": "80px", "class": "center-align group-icon-action" }
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
            emptyTable: "Chưa có ấn phẩm nào"
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
    
    // Populate form
    $('#theLoaiAdd').val(item.theLoaiID).trigger('change');
    $('#maDinhDanhAdd').val(item.maDinhDanhXBAP || '');
    $('#maQuocTeAdd').val(item.maQuocTe || '');
    $('#namXuatBanAdd').val(item.namXuatBan || '');
    $('#soLanTaiBanAdd').val(item.soLanTaiBan || '');
    $('#soLuongInAdd').val(item.soLuongIn || '');
    $('#giaBiaAdd').val(item.giaBia || '');
    $(`input[name='trangThaiAdd'][value='${item.trangThai ? "1" : "0"}']`).prop('checked', true);

    // Hiển thị ảnh bìa nếu có
    if (item.duongDanHinhAnhBia) {
        $('#showAnhBiaAdd').attr('src', item.duongDanHinhAnhBia);
    }

    //Nội dung đa ngữ
    $('#ngonNguAdd').val('vi').trigger('change');
    $('#tenAnPhamAdd').val(item.tenAnPham);
    $('#tacGiaAdd').val(item.tacGia);
    $('#moTaAdd').val(item.moTa);
    
    $('#modalAdd').modal('show');
}

function resetAnPhamModal() {
    $('#theLoaiAdd').val('').trigger('change');
    $('#maDinhDanhAdd').val('');
    $('#maQuocTeAdd').val('');
    $('#namXuatBanAdd').val('');
    $('#soLanTaiBanAdd').val('');
    $('#soLuongInAdd').val('');
    $('#giaBiaAdd').val('');
    $('#ngonNguAdd').val('vi').trigger('change');
    $('#tenAnPhamAdd').val('');
    $('#tacGiaAdd').val('');
    $('#moTaAdd').val('');
    $('#anhBiaAdd').val('');
    $('#showAnhBiaAdd').attr('src', '/assets/images/vector/addImage.png');
    $('input[name="trangThaiAdd"][value="1"]').prop('checked', true);
}

function saveAnPhamToTemp() {
    let theLoai = $('#theLoaiAdd').val();
    let maDinhDanh = $('#maDinhDanhAdd').val();
    let maQuocTe = $('#maQuocTeAdd').val();
    let namXuatBan = $('#namXuatBanAdd').val();
    let soLanTaiBan = $('#soLanTaiBanAdd').val();
    let soLuongIn = $('#soLuongInAdd').val();
    let giaBia = $('#giaBiaAdd').val();
    let trangThai = $("input[name='trangThaiAdd']:checked").val();
    let anhBia = $('#anhBiaAdd')[0]?.files[0] || null;
    let previewAnhBiaSrc = $('#showAnhBiaAdd').attr('src');

    const theLoaiText = $("#theLoaiAdd option:selected").text();

    let maNgonNgu = $("#ngonNguAdd").val();
    let tenAnPham = $("#tenAnPhamAdd").val().trim();
    let tacGia = $("#tacGiaAdd").val().trim();
    let moTa = $("#moTaAdd").val().trim();

    const anPhamData = {
        theLoaiID: theLoai,
        maDinhDanhXBAP: maDinhDanh,
        maQuocTe: maQuocTe,
        namXuatBan: namXuatBan ? parseInt(namXuatBan) : null,
        soLanTaiBan: soLanTaiBan ? parseInt(soLanTaiBan) : 0,
        soLuongIn: soLuongIn ? parseInt(soLuongIn) : 0,
        giaBia: giaBia ? parseFloat(giaBia) : 0,
        trangThai: trangThai === "1",
        anhBiaFile: anhBia,
        duongDanHinhAnhBia: previewAnhBiaSrc !== '/assets/images/vector/addImage.png' ? previewAnhBiaSrc : null,
        tenTheLoai: theLoaiText,

        maNgonNgu: maNgonNgu,
        tenAnPham: tenAnPham,
        tacGia: tacGia,
        moTa: moTa,
    };

    const XuatBanAnPham = {
        MaDinhDanhXBAP: maDinhDanh,
        MaQuocTe: maQuocTe,
        NamXuatBan: namXuatBan !== "" ? Number(namXuatBan) : null,
        SoLanTaiBan: soLanTaiBan !== "" ? Number(soLanTaiBan) : 0,
        TheLoaiID: theLoai,
        SoLuongIn: soLuongIn !== "" ? Number(soLuongIn) : 0,
        GiaBia: giaBia !== "" ? Number(giaBia) : 0,
        TrangThai: trangThai === "1",
        tenAnPham: tenAnPham,
    }
    const XuatBanAnPham_NoiDung = [{
        maNgonNgu: maNgonNgu,
        tenAnPham: tenAnPham,
        tacGia: tacGia,
        moTa: moTa,
    }]
    const FileDinhKem = [];
    if (anhBia) {
        FileDinhKem.push(anhBia);
    }
    

    try {
        if (currentEditingAnPhamIndex >= 0) {
            // Nếu là ấn phẩm đã tồn tại và được chỉnh sửa, cập nhật ngay lập tức
            if (tempAnPhams[currentEditingAnPhamIndex].isExisting) {
                updateExistingAnPham(anPhamData);
            }
            tempAnPhams[currentEditingAnPhamIndex] = anPhamData;
        } else {
            tempAnPhams.push(anPhamData);
            RequestXuatBan.push({
                XuatBanAnPham: XuatBanAnPham,
                XuatBanAnPham_NoiDung: XuatBanAnPham_NoiDung,
                FileDinhKem: FileDinhKem
            });
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
        console.log(newAnPhams[i])
        listAnPham.push(newAnPhams[i]);
    }
    return listAnPham;
}

function createRequestAnPhams() {
    const requestAnPhams = RequestXuatBan.filter(ap => !ap.isExisting);
    const listAnPham = [];
    for (let i = 0; i < requestAnPhams.length; i++) {
        console.log(requestAnPhams[i])
        listAnPham.push(requestAnPhams[i]);
    }
    return listAnPham;
}

function previewPicture() {
    // Xử lý preview ảnh bìa
    $('#anhBiaAdd').on('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                $('#showAnhBiaAdd').attr('src', ev.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            $('#showAnhBiaAdd').attr('src', '/assets/images/vector/addImage.png');
        }
    });
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
    let url = `${baseUrl}/api/ToChucApi/CheckUnique?MaDinhDanh=${maDinhDanh}&LoaiToChucID=98`
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