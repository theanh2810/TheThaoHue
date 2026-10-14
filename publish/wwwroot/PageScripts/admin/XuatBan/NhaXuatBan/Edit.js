const baseUrl = getRootLink();
let translations = [];
const ckeditorgioiThieuDich = CKEDITOR.replace('gioiThieuDich');
const ckeditorghiChuDich = CKEDITOR.replace('ghiChuDich');

console.log(coQuanId)

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
        $(this).find('input[type=text], textarea').val('');
        $(this).find('select').val('vi').trigger('change');
        $(this).find('input[type=radio][value=1], input[type=checkbox][value=1]').prop('checked', true);
        $('#modalAdd').modal('show');
    });

    $('#tableAnPham tbody').on('click', '.edit-command-btn', function () {
        var id = $(this).attr("ID").match(/\d+/)[0];
        var data = $('#tableAnPham').DataTable().row(id).data();
        $('#idAnPhamAdd').val(data.xuatBanAnPhamID);
        if (data.duongDanHinhAnhBia) {
            // Nếu muốn preview ảnh bìa đã có sẵn từ server
            $('#showAnhBiaAdd').attr('src', data.duongDanHinhAnhBia);
        }
        $('#duongDanAnhBiaAdd').val(data.duongDanHinhAnhBia || '')
            
        // Các input text
        $('#maDinhDanhAdd').val(data.maDinhDanhXBAP || '');
        $('#maQuocTeAdd').val(data.maQuocTe || '');
        $('#namXuatBanAdd').val(data.namXuatBan || '');
        $('#soLanTaiBanAdd').val(data.soLanTaiBan || '');
        $('#theLoaiAdd').val(data.theLoaiID).trigger('change');
        $('#soLuongInAdd').val(data.soLuongIn || '');
        $('#giaBiaAdd').val(data.giaBia || '');

        // Radio trạng thái
        $(`input[name='trangThaiAdd'][value='${data.trangThai ? 1 : 0}']`).prop('checked', true);
        // Checked đặc trưng
        if (data.dacTrungSonLa === true) {
            $("#dacTrungDiaPhuongAdd").prop("checked", true);
        } else {
            $("#dacTrungDiaPhuongAdd").prop("checked", false);
        }

        translations = [];
        getDataWithApi('GET', `/api/XuatBanAnPhamApi/BanDich/${data.xuatBanAnPhamID}/vi`).then(data => {
            console.log(data)
            if (data && data.isSuccess && data.value) {
                translations = data.value
                var banDich_vi = translations.find(el => el.maNgonNgu === 'vi')
                $("#modalAddTitle").text(banDich_vi.tenAnPham)
                $('#ngonNguAdd').val('vi').trigger('change');
                $('#tenAnPhamAdd').val(banDich_vi.tenAnPham);
                $('#tacGiaAdd').val(banDich_vi.tacGia);
                $('#moTaAdd').val(banDich_vi.moTa);
            } else {
                console.log(data.error)
            }
        })

        $('#modalAdd').modal('show');
    });
    
    $('#tableAnPham tbody').on('click', '.delete-command-btn', function () {
        var id = $(this).attr("ID").match(/\d+/)[0];
        var data = $('#tableAnPham').DataTable().row(id).data();

        $('#idDelete').val(data.xuatBanAnPhamID);
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
        "toaDoX": toaDoX?.trim() || null,
        "toaDoY": toaDoY?.trim() || null,
        "tinhID": tinhID,
        "xaID": xaID,
        "quyMo": quyMo?.trim() || null,
        "thuTu": thuTu ? thuTu : null,
        "trangThai": trangThai == 1? true: false,
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
        showNotification(0, "Mã nhà xuất bản chứa ký tự không hợp lệ")
    }
    else if (maDinhDanh != null && maDinhDanh != '' && checkUnique(maDinhDanh.trim(), id)) {
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

    $.ajax({
        type: 'PUT',
        url: `${baseUrl}/api/ToChucApi/ChinhSua/${id}`,
        async: false,
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(dt),
        success: function (data) {
            if (data.isSuccess && data.value) {
                showNotification(1, "Chỉnh sửa nhà xuất bản thành công");
                console.log(data)
                setTimeout(() => {
                    window.location.href = `${baseUrl}/AdminTool/XuatBan/NhaXuatBan`;
                }, 1500);
            } else {
                showNotification(0, "Chỉnh sửa nhà xuất bản không thành công");
                console.log(data.error)
            }
        },
        error: function (err) {
            console.log(err)
        }
    })
}

function loadCoQuanData(id) {
    console.log(id)
    let data = JSON.stringify({
        loaiToChucID: 98, // nhà xuất bản
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
            $('#toaDoX').val(item.toaDoX)
            $('#toaDoY').val(item.toaDoY)
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
            showNotification(0, 'Không tìm thấy thông tin nhà xuất bản');
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
        url: `${baseUrl}/api/XuatBanAnPhamApi/DanhSach`,
        type: "POST",
        data: function (d) {
            return JSON.stringify({
                nhaXuatBanID: coQuanBaoChiID,
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
                const editIcon = `<i data-toggle="tooltip" title="Chỉnh sửa" class="edit-command-btn text-yellow cursor-pointer me-2" id="edit-${meta.row}" data-index="${meta.row}">
                    <i class="hgi-icon hgi-edit"></i>
                </i>`;
                
                const deleteIcon = `<i data-toggle="tooltip" title="Xóa khỏi danh sách" class="delete-command-btn text-red cursor-pointer" id="delete-${meta.row}" data-index="${meta.row}">
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

    initDataTableConfigNoSearch('tableAnPham', tableApi, tableDefs, tableCols);
}

function dataAddAnPham(coQuanBaoChiID) {
    let idAnPham = $('#idAnPhamAdd').val();
    let anhBia = $('#anhBiaAdd')[0]?.files[0] || null;
    let maDinhDanh = $('#maDinhDanhAdd').val()?.trim() || null;
    let maQuocTe = $('#maQuocTeAdd').val()?.trim() || null;
    let namXuatBan = $('#namXuatBanAdd').val();
    let soLanTaiBan = $('#soLanTaiBanAdd').val();
    let theLoai = $('#theLoaiAdd').val() || null;
    let soLuongIn = $('#soLuongInAdd').val();
    let giaBia = $('#giaBiaAdd').val();
    let trangThai = $("input[name='trangThaiAdd']:checked").val();
    let duongDanAnhBia = $('#duongDanAnhBiaAdd').val()

    let maNgonNgu = $("#ngonNguAdd").val();
    let tenAnPham = $("#tenAnPhamAdd").val().trim();
    let tacGia = $("#tacGiaAdd").val().trim();
    let moTa = $("#moTaAdd").val().trim();

    let thongTinChung = {
        "XuatBanAnPhamID": idAnPham || null,
        "MaDinhDanhXBAP": maDinhDanh,
        "MaQuocTe": maQuocTe,
        "NhaXuatBanID": coQuanBaoChiID,
        "NamXuatBan": namXuatBan !== "" ? Number(namXuatBan) : null,
        "SoLanTaiBan": soLanTaiBan !== "" ? Number(soLanTaiBan) : 0,
        "TheLoaiID": theLoai,
        "SoLuongIn": soLuongIn !== "" ? Number(soLuongIn) : 0,
        "GiaBia": giaBia !== "" ? Number(giaBia) : 0,
        "duongDanHinhAnhBia": duongDanAnhBia,
        "TrangThai": trangThai === "1",
    };

    let thongTinDaNgu = [{
        maNgonNgu: maNgonNgu,
        tenAnPham: tenAnPham.trim(),
        tacGia: tacGia.trim(),
        moTa: moTa.trim(),
    }]

    let formData = new FormData()
    formData.append("XuatBanAnPham", JSON.stringify(thongTinChung));
    formData.append("XuatBanAnPham_NoiDung", JSON.stringify(thongTinDaNgu));

    if (anhBia != null) { 
        formData.append("FileDinhKem", anhBia);
    }

    if (idAnPham) {
        $.ajax({
            type: 'PUT',
            url: `${baseUrl}/api/XuatBanAnPhamApi/ChinhSua/${idAnPham}`,
            async: false,
            contentType: false,
            processData: false,
            data: formData,
            success: function (data) {
                if (data.isSuccess && data.value) {
                    showNotification(1, "Chỉnh sửa ấn phẩm xuất bản thành công");
                    $('#modalAdd').modal('hide');
                } else {
                    showNotification(0, "Chỉnh sửa ấn phẩm xuất bản không thành công");
                }
            },
            error: function (err) {
                console.log(err)
            }
        })
    } else {
        $.ajax({
            type: 'POST',
            url: `${baseUrl}/api/XuatBanAnPhamApi/ThemMoi`,
            async: false,
            contentType: false,
            processData: false,
            data: formData,
            success: function (data) {
                if (data.isSuccess && data.value) {
                    showNotification(1, "Thêm mới ấn phẩm xuất bản thành công");
                    $('#modalAdd').modal('hide');
                } else {
                    showNotification(0, "Thêm mới ấn phẩm xuất bản không thành công");
                }
            },
            error: function (err) {
                console.log(err)
            }
        })
    }
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

function dataDelete() {
    let id = $('#idDelete').val();
    $.ajax({
        url: `${baseUrl}/api/ToChucApi/Xoa/${id}`,
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