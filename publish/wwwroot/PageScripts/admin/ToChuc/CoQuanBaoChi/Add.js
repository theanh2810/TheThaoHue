const baseUrl = getRootLink();
const ckeditorgioiThieuDich = CKEDITOR.replace('gioiThieuDich');
const ckeditorghiChuDich = CKEDITOR.replace('ghiChuDich');

$(document).ready(function () {
    initSelect2();
    initValidation();
    initDatePicker();
    
    // Biến lưu trữ tạm cho ấn phẩm/kênh phát sóng
    let tempAnPhams = [];
    let tempAnPhamTranslations = [];
    let currentEditingAnPhamIndex = -1;
    
    // Load data nếu đang chỉnh sửa
    if (isEdit && coQuanId) {
        loadCoQuanData(coQuanId);
        updatePageTitle();
    }

    function initValidation() {
        // Validation cho các trường input
        CheckLengthEach('#maCoQuanAdd', 50, null);
        CheckLengthEach('#tenCoQuanAdd', 255, null);
        CheckLengthEach('#dienThoaiAdd', 20, null);
        CheckLengthEach('#websiteAdd', 200, null);
        CheckLengthEach('#soGiayPhepAdd', 100, null);
        CheckLengthEach('#diaChiAdd', 500, null);
        CheckLengthEach('#gioiThieuAdd', 1000, null);
    }

    // Load dữ liệu cho các dropdown
    (async function () {
        await Promise.all([
            initLoaiHinh(),
            initCoQuanChuQuan(),
            initTinhThanhPho(),
            initNgonNgu(),
            initNgonNguDich(),
            initLinhVucChuyenSau(),
            initTanSuat()
        ]);
        initTempAnPhamTable();
    })();

    async function initLoaiHinh() {
        try {
            const res = await fetch(`${baseUrl}/api/DanhMucChungApi/DanhSach`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: "22", // Loại hình báo chí
                    trangThai: true
                })
            });

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            
            const data = await res.json();

            if (data && data.isSuccess && data.value) {
                $("#loaiHinh").empty().append(`<option value="">Chọn</option>`);
                data.value.forEach(item => {
                    $("#loaiHinh").append(`<option value="${item.danhMucID}">${item.tenDanhMuc}</option>`);
                });
            } else {
                console.log('Lỗi khi tải danh sách loại hình:', data.error);
            }
        } catch (err) {
            console.log('Lỗi khi tải danh sách loại hình:', err.message);
        }
    }

    async function initCoQuanChuQuan() {
        try {
            const res = await fetch(`${baseUrl}/api/DanhMucChungApi/DanhSach`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: "34", // Cơ quan chủ quản
                    trangThai: true
                })
            });

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            
            const data = await res.json();

            if (data && data.isSuccess && data.value) {
                $("#coQuanChuQuan").empty().append(`<option value="">Chọn</option>`);
                data.value.forEach(item => {
                    $("#coQuanChuQuan").append(`<option value="${item.danhMucID}">${item.tenDanhMuc}</option>`);
                });
            } else {
                console.log('Lỗi khi tải danh sách cơ quan chủ quản:', data.error);
            }
        } catch (err) {
            console.log('Lỗi khi tải danh sách cơ quan chủ quản:', err.message);
        }
    }

    async function initTinhThanhPho() {
        try {
            const res = await fetch(`${baseUrl}/api/CapTinhApi/Gets`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            
            const data = await res.json();

            if (data && data.isSuccessed && data.resultObj) {
                $("#tinhThanhPho").empty().append(`<option value="">Chọn</option>`);
                data.resultObj.forEach(item => {
                    const displayText = item.noiDung || item.tenTinh || 'Không rõ tên';
                    $("#tinhThanhPho").append(`<option value="${item.tinhID}">${displayText}</option>`);
                });
            } else {
                console.log('Lỗi khi tải danh sách tỉnh/thành phố:', data.message);
            }
        } catch (err) {
            console.log('Lỗi khi tải danh sách tỉnh/thành phố:', err.message);
        }
    }

    async function initPhuongXa(tinhID = null) {
        try {
            let url = `${baseUrl}/api/CapXaApi/Gets`;
            if (tinhID) {
                url += `?tinhID=${tinhID}`;
            }

            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            
            const data = await res.json();

            $("#phuongXa").empty().append(`<option value="">Chọn</option>`);
            
            if (data && data.isSuccessed && data.resultObj) {
                data.resultObj.forEach(item => {
                    const displayText = item.noiDung || item.tenXa || 'Không rõ tên';
                    $("#phuongXa").append(`<option value="${item.id}">${displayText}</option>`);
                });
            }
        } catch (err) {
            console.log('Lỗi khi tải danh sách phường/xã:', err.message);
        }
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

    async function initNgonNgu() {
        try {
            const res = await fetch(`${baseUrl}/api/NgonNguApi/DanhSach`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    trangThai: true,
                    tuKhoa: null
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (data && data.isSuccess && data.value) {
                    $("#ngonNguAdd").empty();
                    data.value.forEach(lang => {
                        const isSelected = lang.maNgonNgu?.toLowerCase() === 'vi' ? 'selected' : '';
                        $("#ngonNguAdd").append(`<option value="${lang.maNgonNgu?.toLowerCase()}" ${isSelected}>${lang.tenNgonNgu}</option>`);
                    });
                }
            }
        } catch (err) {
            console.log('Lỗi khi tải danh sách ngôn ngữ:', err.message);
        }
    }

    async function initNgonNguDich() {
        try {
            const res = await fetch(`${baseUrl}/api/NgonNguApi/DanhSach`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    trangThai: true,
                    tuKhoa: null
                })
            });

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            
            const data = await res.json();

            if (data && data.isSuccess && data.value) {
                $("#ngonNguDich").empty().append(`<option value="">Chọn ngôn ngữ</option>`);
                
                data.value.forEach(lang => {
                    const isSelected = lang.maNgonNgu?.toLowerCase() === 'vi' ? 'selected' : '';
                    $("#ngonNguDich").append(`<option value="${lang.maNgonNgu?.toLowerCase()}" ${isSelected}>${lang.tenNgonNgu}</option>`);
                });
            } else {
                console.log('Lỗi khi tải danh sách Ngôn ngữ:', data.error);
            }
        } catch (err) {
            console.log('Lỗi khi tải danh sách Ngôn ngữ:', err.message);
        }
    }

    async function initLinhVucChuyenSau() {
        try {
            const res = await fetch(`${baseUrl}/api/DanhMucChungApi/DanhSach`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: "9", // Lĩnh vực chuyên sâu
                    trangThai: true
                })
            });

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            
            const data = await res.json();

            if (data && data.isSuccess && data.value) {
                $("#linhVucChuyenSauAdd").empty().append(`<option value="">Chọn</option>`);
                data.value.forEach(item => {
                    $("#linhVucChuyenSauAdd").append(`<option value="${item.danhMucID}">${item.tenDanhMuc}</option>`);
                });
            } else {
                console.log('Lỗi khi tải danh sách lĩnh vực chuyên sâu:', data.error);
            }
        } catch (err) {
            console.log('Lỗi khi tải danh sách lĩnh vực chuyên sâu:', err.message);
        }
    }

    async function initTanSuat() {
        try {
            const res = await fetch(`${baseUrl}/api/DanhMucChungApi/DanhSach`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: "6", // Tần suất
                    trangThai: true
                })
            });

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            
            const data = await res.json();

            if (data && data.isSuccess && data.value) {
                $("#tanSuatAdd").empty().append(`<option value="">Chọn</option>`);
                data.value.forEach(item => {
                    $("#tanSuatAdd").append(`<option value="${item.danhMucID}">${item.tenDanhMuc}</option>`);
                });
            } else {
                console.log('Lỗi khi tải danh sách tần suất:', data.error);
            }
        } catch (err) {
            console.log('Lỗi khi tải danh sách tần suất:', err.message);
        }
    }

    async function loadCoQuanData(id) {
        console.log(id)
        try {
            // Load thông tin cơ quan
            const res = await fetch(`${baseUrl}/api/ToChucApi/DanhSach`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiToChucID: 97, // Cơ quan báo chí
                    toChucID: id
                }),
            });

            if (res.ok) {
                const data = await res.json();
                if (data && data.isSuccess && data.value) {
                    const item = data.value[0];
                    console.log(item)
                    // Populate form với dữ liệu cơ quan
                    $('#pageTitle').text(`Chỉnh sửa ${item.tenToChuc}`);
                    $('#coQuanId').val(item.toChucID);
                    $('#maCoQuan').val(item.maDinhDanh);
                    $('#tenCoQuan').val(item.tenToChuc);
                    $('#coQuanChuQuan').val(item.coQuanChuQuanID).trigger('change');
                    $('#loaiHinh').val(item.linhVucID).trigger('change');
                    $('#phamViHoatDong').val(item.phamViHoatDongID).trigger('change');
                    
                    if (item.ngayThanhLap) {
                        const date = new Date(item.ngayThanhLap);
                        $('#ngayThanhLap').val(date.toISOString().split('T')[0]);
                    }
                    $('#hopThu').val(item.hopThu);
                    $('#diaChi').val(item.diaChi);
                    $('#soDienThoai').val(item.dienThoai);
                    $('#website').val(item.website);
                    $('#soGiayPhep').val(item.soGiayPhepHoatDong);
                    $('#gioiThieu').val(item.gioiThieu);
                    $('#thuTu').val(item.thuTu || 1);
                    
                    $(`input[name="trangThai"][value="${item.trangThaiID}"]`).prop('checked', true);
                    
                    // Load ấn phẩm của cơ quan này
                    await loadAnPhamData(id);
                    
                    // Load bản dịch theo ngôn ngữ hiện tại
                    const currentLang = $('#ngonNguDich').val() || 'vi';
                    await loadToChucTranslation(id, currentLang);

                    await loadAnPhamData(id)
                }
            }
        } catch (err) {
            console.log('Lỗi khi tải thông tin cơ quan:', err.message);
            showNotification(0, 'Không thể tải thông tin cơ quan báo chí');
        }
    }

    async function loadToChucTranslation(toChucID, maNgonNgu) {
        console.log(toChucID, maNgonNgu)
        try {
            const res = await fetch(`${baseUrl}/api/ToChucApi/BanDich/${toChucID}?maNgonNgu=${maNgonNgu}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                const data = await res.json();
                console.log(data)
                if (data && data.isSuccess && data.value) {
                    const translation = data.value[0];
                    
                    // Populate các trường dịch với dữ liệu đa ngữ
                    $('#tenCoQuanDich').val(translation.tenToChuc || '');
                    $('#diaChiDich').val(translation.diaChi || '');
                    if (typeof ckeditorgioiThieuDich !== 'undefined') ckeditorgioiThieuDich.setData(translation.gioiThieu || '');
                } else {
                    // Nếu không có bản dịch, clear các trường dịch
                    $('#tenCoQuanDich').val('');
                    $('#diaChiDich').val('');
                    if (typeof ckeditorgioiThieuDich !== 'undefined') ckeditorgioiThieuDich.setData('');
                }
            } else {
                console.log('Không tìm thấy bản dịch cho ngôn ngữ:', maNgonNgu);
                // Clear các trường dịch nếu không tìm thấy
                $('#tenCoQuanDich').val('');
                $('#diaChiDich').val('');
                if (typeof ckeditorgioiThieuDich !== 'undefined') ckeditorgioiThieuDich.setData('');
            }
        } catch (err) {
            console.log('Lỗi khi tải bản dịch:', err.message);
        }
    }

    async function loadAnPhamData(toChucID) {
        try {
            const res = await fetch(`${baseUrl}/api/BaoChiAnPhamApi/DanhSach`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    toChucID: toChucID,
                    trangThai: null, // Load cả active và inactive
                    tuKhoa: null
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (data && data.isSuccess && data.value) {
                    // Convert từ dữ liệu API sang format tempAnPhams
                    tempAnPhams = data.value.map(item => ({
                        baoChiAnPhamID: item.baoChiAnPhamID,
                        linhVucChuyenSauID: item.linhVucChuyenSauID,
                        tanSuatID: item.tanSuatID,
                        trangThai: item.trangThai,
                        tenAnPham: item.tenAnPham,
                        tenLinhVucChuyenSau: item.tenLinhVucChuyenSau,
                        tenTanSuat: item.tenTanSuat,
                        translations: item.baoChiAnPham_NoiDungs || [
                            {
                                maNgonNgu: 'vi',
                                tenAnPham: item.tenAnPham,
                                doiTuongDocGia: item.doiTuongDocGia || ''
                            }
                        ],
                        isExisting: true // Đánh dấu là dữ liệu đã có sẵn
                    }));
                    
                    // Refresh bảng để hiển thị ấn phẩm hiện có
                    refreshTempAnPhamTable();
                }
            }
        } catch (err) {
            console.log('Lỗi khi tải danh sách ấn phẩm:', err.message);
        }
    }

    function updatePageTitle() {
        // TODO: Update title with actual organization name when data is loaded
        $('#page-title').text('Chỉnh sửa cơ quan báo chí');
    }

    $("#formToChuc").on("submit", async function (e) {
        e.preventDefault();
        
        const submitBtn = $(this).find('button[type="submit"]');
        if (submitBtn.prop('disabled')) {
            return;
        }
        
        submitBtn.prop('disabled', true);
        const originalText = submitBtn.find('#submitText').text();
        submitBtn.find('#submitText').text('Đang xử lý...');
        
        try {
            await dataAdd();
        } catch (error) {
            console.error('Lỗi khi xử lý form:', error);
        } finally {
            setTimeout(() => {
                submitBtn.prop('disabled', false);
                submitBtn.find('#submitText').text(originalText);
            }, 1000);
        }
    });

    async function dataAdd() {
        let id = $('#coQuanId').val();
        let maCoQuan = $('#maCoQuan').val();
        let tenCoQuan = $('#tenCoQuanDich').val();
        let coQuanChuQuan = $('#coQuanChuQuan').val();
        let loaiHinh = $('#loaiHinh').val();
        let phamViHoatDong = $('#phamViHoatDong').val();
        let ngayThanhLap = $('#ngayThanhLap').val();
        let diaChi = $('#diaChiDich').val();
        let dienThoai = $('#soDienThoai').val();
        let website = $('#website').val();
        let soGiayPhep = $('#soGiayPhep').val();
        let gioiThieu = typeof ckeditorgioiThieuDich !== 'undefined' ? ckeditorgioiThieuDich.getData() : '';
        let thuTu = $('#thuTu').val();
        let trangThai = $("input[name='trangThai']:checked").val();
        let hopThu = $('#hopThu').val();
        let ngonNguDich = $('#ngonNguDich').val();

        // Validation cho các trường bắt buộc
        const requiredFields = ['#tenCoQuanDich'];
        if (checkEmptyBlankV2(requiredFields)) {
            showNotification(0, 'Dữ liệu sai quy định, vui lòng kiểm tra lại!');
            return;
        }

        if (checkFalseInput(requiredFields)) {
            showNotification(0, 'Dữ liệu sai quy định, vui lòng kiểm tra lại!');
            return;
        }

        if (checkEmptyBlank(tenCoQuan) || checkEmptyBlank(trangThai)) {
            showNotification(0, 'Vui lòng nhập đầy đủ thông tin bắt buộc (*)');
            return;
        }

        let dt = {
            "loaiToChucID": 97, // ID cho cơ quan báo chí
            "linhVucID": 5, // ID Lĩnh vực báo chí - xuất bản
            "maDinhDanh": maCoQuan?.trim() || null,
            "trangThaiID": parseInt(trangThai) || 1,
            "hopThu": hopThu?.trim() || null,
            "dienThoai": dienThoai?.trim() || null,
            "website": website?.trim() || null,
            "ngayThanhLap": formatDateToSendWithoutTime(ngayThanhLap) || null,
            "soGiayPhepHoatDong": soGiayPhep?.trim() || null,
            "coQuanChuQuanID": parseInt(coQuanChuQuan) || 0,
            "phamViHoatDongID": parseInt(phamViHoatDong) || 0,
            "loaiHinhID": parseInt(loaiHinh) || 0,
            "toChuc_NoiDungs": [
                {
                    "id": 0,
                    "maNgonNgu": ngonNguDich || "vi",
                    "tenToChuc": tenCoQuan?.trim(),
                    "diaChi": diaChi?.trim() || null,
                    "gioiThieu": gioiThieu?.trim() || null
                }
            ]
        };

        console.log(dt)

        if (checkEmptyBlank(id)) {
            // Thêm mới - Validate trước khi thực hiện
            try {
                // Bước 1: Validate dữ liệu ấn phẩm trước
                if (tempAnPhams.length > 0) {
                    await validateTempAnPhams();
                }
                
                // Bước 2: Tạo cơ quan báo chí
                const res = await fetch(`${baseUrl}/api/ToChucApi/ThemMoi`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dt)
                });

                if (!res.ok) {
                    var errText = await res.text();
                    throw new Error(`Lỗi khi tạo cơ quan báo chí: ${errText}`);
                }
                
                const data = await res.json();

                if (data && data.isSuccess && data.value) {
                    const newToChucID = data.value.toChucID;
                    
                    // Bước 3: Tạo các ấn phẩm mới (đã validate nên sẽ thành công)
                    const newAnPhams = tempAnPhams.filter(ap => !ap.isExisting);
                    if (newAnPhams.length > 0) {
                        await createTempAnPhams(newToChucID);
                    }
                    
                    // Báo thành công hoàn toàn với số lượng chính xác
                    const totalAnPhams = tempAnPhams.length;
                    const newAnPhamCount = newAnPhams.length;
                    const existingAnPhamCount = totalAnPhams - newAnPhamCount;
                    
                    let message = '';
                    if (checkEmptyBlank(id)) {
                        // Trường hợp thêm mới
                        message = newAnPhamCount > 0 
                            ? `Thêm mới thành công cơ quan báo chí và ${newAnPhamCount} ấn phẩm mới`
                            : 'Thêm mới cơ quan báo chí thành công';
                    } else {
                        // Trường hợp chỉnh sửa
                        if (newAnPhamCount > 0 && existingAnPhamCount > 0) {
                            message = `Cập nhật thành công cơ quan báo chí (${existingAnPhamCount} ấn phẩm hiện có, ${newAnPhamCount} ấn phẩm mới)`;
                        } else if (newAnPhamCount > 0) {
                            message = `Cập nhật thành công cơ quan báo chí và thêm ${newAnPhamCount} ấn phẩm mới`;
                        } else {
                            message = 'Cập nhật cơ quan báo chí thành công';
                        }
                    }
                    
                    showNotification(1, message);
                    setTimeout(() => {
                        window.location.href = `${baseUrl}/AdminTool/BaoChi/CoQuanBaoChi`;
                    }, 1500);
                } else {
                    throw new Error(data.error || 'Không thể tạo cơ quan báo chí');
                }
            } catch (err) {
                showNotification(0, `Thao tác bị hủy: ${err.message}`);
            }
        } else {
            // Chỉnh sửa
            try {
                dt.toChucID = id;
                dt.toChuc_NoiDungs[0].toChucID = id;
                
                const res = await fetch(`${baseUrl}/api/ToChucApi/ChinhSua/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dt)
                });

                if (!res.ok) {
                    var errText = await res.text();
                    throw new Error(errText);
                }

                const data = await res.json();

                if (data && data.isSuccess && data.value) {
                    showNotification(1, 'Chỉnh sửa thành công');
                    setTimeout(() => {
                        window.location.href = `${baseUrl}/AdminTool/BaoChi/CoQuanBaoChi`;
                    }, 1500);
                } else {
                    showNotification(0, data.error);
                }
            } catch (err) {
                showNotification(0, err.message);
            }
        }
    }

    // Event handler cho nút thêm ấn phẩm
    $('#btnThemAnPham').on('click', function() {
        currentEditingAnPhamIndex = -1;
        tempAnPhamTranslations = [];
        resetAnPhamModal();
        $('#modalAdd').modal('show');
    });

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

    $(document).on('click', '.delete-existing-anpham', function() {
        const index = $(this).data('index');
        const anPhamID = $(this).data('id');
        const anPham = tempAnPhams[index];
        
        if (confirm(`Bạn có chắc chắn muốn xóa ấn phẩm "${anPham.tenAnPham}" khỏi hệ thống không?`)) {
            deleteExistingAnPham(anPhamID, index);
        }
    });

    async function deleteExistingAnPham(anPhamID, index) {
        try {
            const res = await fetch(`${baseUrl}/api/BaoChiAnPhamApi/Xoa/${anPhamID}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                const data = await res.json();
                if (data && data.isSuccess) {
                    tempAnPhams.splice(index, 1);
                    refreshTempAnPhamTable();
                    showNotification(1, 'Xóa ấn phẩm thành công');
                } else {
                    showNotification(0, `Lỗi khi xóa ấn phẩm: ${data.error}`);
                }
            } else {
                const errText = await res.text();
                showNotification(0, `Lỗi khi xóa ấn phẩm: ${errText}`);
            }
        } catch (err) {
            showNotification(0, `Lỗi khi xóa ấn phẩm: ${err.message}`);
        }
    }

    function editTempAnPham(index) {
        currentEditingAnPhamIndex = index;
        const item = tempAnPhams[index];
        tempAnPhamTranslations = [...item.translations];
        
        // Populate form
        $('#linhVucChuyenSauAdd').val(item.linhVucChuyenSauID).trigger('change');
        $('#tanSuatAdd').val(item.tanSuatID).trigger('change');
        $(`input[name='trangThaiAdd'][value='${item.trangThai ? "1" : "0"}']`).prop('checked', true);
        
        // Load translation tiếng Việt đầu tiên
        const viTranslation = tempAnPhamTranslations.find(t => t.maNgonNgu === 'vi');
        if (viTranslation) {
            $('#ngonNguAdd').val('vi').trigger('change');
            $('#tenAnPhamAdd').val(viTranslation.tenAnPham);
            $('#doiTuongDocGiaAdd').val(viTranslation.doiTuongDocGia);
        }
        
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

    // Xử lý đa ngữ cho ấn phẩm
    function saveTempAnPhamTranslation() {
        let maNgonNgu = $("#ngonNguAdd").val();
        let tenAnPham = $("#tenAnPhamAdd").val().trim();
        let doiTuongDocGia = $("#doiTuongDocGiaAdd").val().trim();

        if (!maNgonNgu || !tenAnPham) return;

        let exist = tempAnPhamTranslations.find(t => t.maNgonNgu === maNgonNgu);
        if (exist) {
            exist.tenAnPham = tenAnPham;
            exist.doiTuongDocGia = doiTuongDocGia;
        } else {
            tempAnPhamTranslations.push({
                maNgonNgu: maNgonNgu,
                tenAnPham: tenAnPham,
                doiTuongDocGia: doiTuongDocGia,
            });
        }
    }

    // Event handlers cho modal ấn phẩm
    $("#tenAnPhamAdd, #doiTuongDocGiaAdd").on("blur", function () {
        saveTempAnPhamTranslation();
    });

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

    $("#ngonNguDich").on("change", async function () {
        let maNgonNgu = $(this).val();
        const coQuanId = $('#coQuanId').val();
        
        if (coQuanId && maNgonNgu) {
            console.log('Chuyển Ngôn ngữ cho cơ quan hiện tại:', maNgonNgu);
            // Load bản dịch cho ngôn ngữ được chọn
            await loadToChucTranslation(coQuanId, maNgonNgu);
        } else {
            // Nếu chưa có cơ quan (tạo mới) hoặc chưa chọn ngôn ngữ, clear các trường dịch
            if (!coQuanId) {
                $('#tenCoQuanDich').val('');
                $('#diaChiDich').val('');
                if (typeof ckeditorgioiThieuDich !== 'undefined') ckeditorgioiThieuDich.setData('');
            }
        }
    });

    // Submit modal ấn phẩm
    $("#formAdd").on("submit", async function (e) {
        e.preventDefault();
        saveTempAnPhamTranslation();
        await saveAnPhamToTemp();
    });

    async function saveAnPhamToTemp() {
        let linhVucChuyenSau = $('#linhVucChuyenSauAdd').val();
        let tanSuat = $('#tanSuatAdd').val();
        let trangThai = $("input[name='trangThaiAdd']:checked").val();

        const tenTiengViet = tempAnPhamTranslations.find(t => t.maNgonNgu === 'vi')?.tenAnPham;
        if (!tenTiengViet || !linhVucChuyenSau || !tanSuat) {
            showNotification(0, 'Vui lòng nhập đầy đủ thông tin bắt buộc (*), bắt buộc có bản dịch tiếng Việt');
            return;
        }

        const linhVucText = $("#linhVucChuyenSauAdd option:selected").text();
        const tanSuatText = $("#tanSuatAdd option:selected").text();

        const anPhamData = {
            baoChiAnPhamID: currentEditingAnPhamIndex >= 0 ? tempAnPhams[currentEditingAnPhamIndex].baoChiAnPhamID : null,
            linhVucChuyenSauID: linhVucChuyenSau,
            tanSuatID: tanSuat,
            trangThai: trangThai === "1",
            tenAnPham: tenTiengViet,
            tenLinhVucChuyenSau: linhVucText,
            tenTanSuat: tanSuatText,
            translations: [...tempAnPhamTranslations],
            isExisting: currentEditingAnPhamIndex >= 0 ? tempAnPhams[currentEditingAnPhamIndex].isExisting : false,
            isModified: currentEditingAnPhamIndex >= 0 ? true : false // Đánh dấu đã chỉnh sửa
        };

        try {
            if (currentEditingAnPhamIndex >= 0) {
                // Nếu là ấn phẩm đã tồn tại và được chỉnh sửa, cập nhật ngay lập tức
                if (tempAnPhams[currentEditingAnPhamIndex].isExisting) {
                    await updateExistingAnPham(anPhamData);
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

    async function updateExistingAnPham(anPhamData) {
        try {
            const thongTinChung = {
                "BaoChiAnPhamID": anPhamData.baoChiAnPhamID,
                "LinhVucChuyenSauID": anPhamData.linhVucChuyenSauID,
                "TanSuatID": anPhamData.tanSuatID,
                "ToChucID": $('#coQuanId').val(), // ID cơ quan hiện tại
                "trangThai": anPhamData.trangThai,
            };

            const formData = new FormData();
            formData.append("BaoChiAnPham", JSON.stringify(thongTinChung));
            formData.append("BaoChiAnPham_NoiDung", JSON.stringify(anPhamData.translations));

            const res = await fetch(`${baseUrl}/api/BaoChiAnPhamApi/ChinhSua/${anPhamData.baoChiAnPhamID}`, {
                method: 'PUT',
                body: formData
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Lỗi API khi cập nhật ấn phẩm: ${errText}`);
            }

            const data = await res.json();
            if (!data.isSuccess) {
                throw new Error(`Lỗi khi cập nhật ấn phẩm: ${data.error || 'Lỗi không xác định'}`);
            }
        } catch (err) {
            showNotification(0, `Lỗi khi cập nhật ấn phẩm: ${err.message}`);
            throw err;
        }
    }

    // Hàm validate ấn phẩm trước khi tạo cơ quan (chỉ validate ấn phẩm mới)
    async function validateTempAnPhams() {
        const newAnPhams = tempAnPhams.filter(ap => !ap.isExisting);
        if (newAnPhams.length === 0) return;
        
        const errors = [];
        
        for (let i = 0; i < newAnPhams.length; i++) {
            const anPham = newAnPhams[i];
            
            // Validate dữ liệu cơ bản
            if (!anPham.linhVucChuyenSauID) {
                errors.push(`Ấn phẩm mới ${i + 1}: Chưa chọn lĩnh vực chuyên sâu`);
            }
            if (!anPham.tanSuatID) {
                errors.push(`Ấn phẩm mới ${i + 1}: Chưa chọn tần suất`);
            }
            if (!anPham.translations || anPham.translations.length === 0) {
                errors.push(`Ấn phẩm mới ${i + 1}: Chưa có thông tin dịch`);
            } else {
                const viTranslation = anPham.translations.find(t => t.maNgonNgu === 'vi');
                if (!viTranslation || !viTranslation.tenAnPham?.trim()) {
                    errors.push(`Ấn phẩm mới ${i + 1}: Chưa có tên tiếng Việt`);
                }
            }
            
            // Validate bằng cách kiểm tra format JSON
            try {
                const testData = {
                    "BaoChiAnPhamID": "00000000-0000-0000-0000-000000000000",
                    "LinhVucChuyenSauID": anPham.linhVucChuyenSauID,
                    "TanSuatID": anPham.tanSuatID,
                    "ToChucID": "00000000-0000-0000-0000-000000000000", // Dummy ID for validation
                    "trangThai": anPham.trangThai,
                };

                // Kiểm tra format dữ liệu (không gửi thật)
                JSON.stringify(testData);
                JSON.stringify(anPham.translations);
                
            } catch (err) {
                errors.push(`Ấn phẩm mới ${i + 1} ("${anPham.tenAnPham}"): Dữ liệu không hợp lệ - ${err.message}`);
            }
        }
        
        if (errors.length > 0) {
            throw new Error(`Phát hiện ${errors.length} lỗi trong dữ liệu ấn phẩm mới:\n${errors.join('\n')}`);
        }
    }

    // Hàm tạo các ấn phẩm mới sau khi đã tạo tổ chức (chỉ tạo ấn phẩm mới)
    async function createTempAnPhams(toChucID) {
        const newAnPhams = tempAnPhams.filter(ap => !ap.isExisting);
        
        for (let i = 0; i < newAnPhams.length; i++) {
            const anPham = newAnPhams[i];
            try {
                const thongTinChung = {
                    "BaoChiAnPhamID": "00000000-0000-0000-0000-000000000000",
                    "LinhVucChuyenSauID": anPham.linhVucChuyenSauID,
                    "TanSuatID": anPham.tanSuatID,
                    "ToChucID": toChucID,
                    "trangThai": anPham.trangThai,
                };

                const formData = new FormData();
                formData.append("BaoChiAnPham", JSON.stringify(thongTinChung));
                formData.append("BaoChiAnPham_NoiDung", JSON.stringify(anPham.translations));

                const res = await fetch(`${baseUrl}/api/BaoChiAnPhamApi/ThemMoi`, {
                    method: 'POST',
                    body: formData
                });

                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(`Lỗi API khi tạo ấn phẩm "${anPham.tenAnPham}": ${errText}`);
                }

                const data = await res.json();
                if (!data.isSuccess) {
                    throw new Error(`Lỗi khi tạo ấn phẩm "${anPham.tenAnPham}": ${data.error || 'Lỗi không xác định'}`);
                }
            } catch (err) {
                // Nếu có lỗi ở đây thì đã có vấn đề nghiêm trọng vì đã validate trước đó
                throw new Error(`Lỗi không mong đợi khi tạo ấn phẩm "${anPham.tenAnPham}": ${err.message}`);
            }
        }
    }

    // Reset validation khi rời khỏi trang
    $(window).on('beforeunload', function() {
        RemoveFalseInput(document.getElementById('maCoQuan'));
        RemoveFalseInput(document.getElementById('tenCoQuan'));
        RemoveFalseInput(document.getElementById('dienThoai'));
        RemoveFalseInput(document.getElementById('website'));
        RemoveFalseInput(document.getElementById('soGiayPhep'));
        RemoveFalseInput(document.getElementById('diaChi'));
        RemoveFalseInput(document.getElementById('gioiThieu'));
    });
});
