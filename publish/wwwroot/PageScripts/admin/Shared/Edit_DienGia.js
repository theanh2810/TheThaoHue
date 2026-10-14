const ckeditormoTaDichAdd = CKEDITOR.replace('moTaDichAdd');
const ckeditorghiChuDichAdd = CKEDITOR.replace('ghiChuDichAdd');
const ckeditornoiDungDGAdd = CKEDITOR.replace('noiDungDG');

let translationsThuyetTrinh = [];

$(document).ready(function () {
    //#region Xử lý các function chung
    initDatePicker();
    initDanhMucChung_NoAll(1, "#danTocAdd", "")
    initDanhMucChung_NoAll(2, "#chucDanhAdd", "")
    initDanhMucChung_NoAll(5, "#gioiTinhAdd", "")
    initDanhMucChung_NoAll(84, "#vaiTroDG", "") // Loại văn bản
    initNgonNgu("#ngonNguDichDGAdd")
    initNgonNgu("#ngonNguDG")
    initTinhThanhPho()
    initDanhSachDienGia()
    initSelect2()
    previewPictureDienGia()

    const paramsDPT = new URLSearchParams(window.location.search);
    const IDSuKien = paramsDPT.get("id")

    $("#DienGia-tab").show();

    $('#tinhThanhPhoAdd').on('change', function () {
        let tinhID = $(this).val();
        initPhuongXa(tinhID)
    })

    initTable_DienGia(IDSuKien);
    //#endregion Xử lý các function chung

    //#region Xử lý lưu Thông tin diễn giả
    $("#btnAddBaiThuyetTrinh").on("click", function (e) {
        $("#formDienGia").show();
        $("#DienGiaCoSanAdd").attr('disabled', false);
    })

    $("#btnCancelBaiTT").on("click", function (e) {
        $("#formDienGia").hide();
        resetValueThuyetTrinh();
    })
    
    $("#formNhanSuAdd").on("submit", function (e) {
        e.preventDefault(); // Ngăn chặn hành vi mặc định của form
        dataAddDG();
    });

    $("#btnSaveAddBaiTT").on("click", function (e) {
        e.preventDefault();
        dataAddTT(IDSuKien);
    });

    $(document).on('change', '#ngonNguDG', function () {
        const DienGiaSuKienID = $("#dienGiaSuKienIDDG").val();
        if (DienGiaSuKienID) {
            const selectedLang = $(this).val();
            initThuyetTrinh(selectedLang, DienGiaSuKienID);
        } else {
            $("#viTriChucVuDG").val('');
            $("#chuDeDG").val('');
            $("#batDauDG").val('');
            $("#ketThucDG").val('');
            $("#diaDiemDG").val('');
            $("#thuTuThuyetTrinhDG").val('');
            if (typeof ckeditornoiDungDGAdd !== 'undefined') ckeditornoiDungDGAdd.setData('');
        }
    })

    $(document).on('change', '#ngonNguDichAdd', function() {
        $("#ngonNguDichAdd").val('');
        $("#hoVaTenAdd").val('');
        $("#diaChiAdd").val('');
        $("#noiLamViecAdd").val('');
        if (typeof ckeditormoTaDichAdd !== 'undefined') ckeditormoTaDichAdd.setData('');
        if (typeof ckeditorghiChuDichAdd !== 'undefined') ckeditorghiChuDichAdd.setData('');
    });

    $("#buttonDelete").on("click", function (e) {
        e.preventDefault(); // ⛔ Ngăn form submit & reload trang

        let type = $("#idTypeDelete").val();
        if (type === 'diengia') {
            deleteBaiThuyetTrinh();
        }
    });

    $("#modalDienGia").on("hidden.bs.modal", function () {
        resetValueDienGia();
    })
    //#endregion Xử lý lưu Thông tin diễn giả
})

//#region Function Xử lý chung
function initTinhThanhPho() {
    getDataWithApi('GET', '/api/CapTinhApi/Gets').then(data => {
        if (data && data.isSuccessed && data.resultObj) {
            $("#tinhThanhPhoAdd").empty().append(`<option value="">Chọn</option>`);
            data.resultObj.forEach(item => {
                const displayText = item.noiDung || item.tenTinh || 'Không rõ tên';
                $("#tinhThanhPhoAdd").append(`<option value="${item.tinhID}">${displayText}</option>`);
            });
        }
    })
}

function initPhuongXa(tinhID = null) {
    getDataWithApi('GET', `/api/CapXaApi/GetByMaTinh?MaNgonNgu=vi&MaTinh=${tinhID ? `${tinhID}` : ''}`).then(data => {
        $("#phuongXaAdd").empty().append(`<option value="">Chọn</option>`);
        if (data && data.isSuccess && data.value) {
            data.value.forEach(item => {
                const displayText = item.noiDung || item.tenXa || 'Không rõ tên';
                $("#phuongXaAdd").append(`<option value="${item.xaID}">${displayText}</option>`);
            });
        }
    })
}

function initDanhSachDienGia() {
    getDataWithApi('GET', '/api/DM_CaNhan_DienGiaApi/Gets?MaNgonNgu=vi').then(data => {
        if (data && data.isSuccess && data.value.length > 0) {
            $("#DienGiaCoSanAdd").empty();
            data.value.forEach(item => {
                const displayText = item.hoTen || 'Không rõ tên';
                $("#DienGiaCoSanAdd").append(`<option value="${item.caNhanID}">${displayText}</option>`);
            });
        }
    })
}

function previewPictureDienGia() {
    // Xử lý preview ảnh bìa
    $('.group_image_input #fileAnhDaiDienDGPrev').on('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                $('#showAnhDaiDienDGAdd').attr('src', ev.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            $('#showAnhDaiDienDGAdd').attr('src', '/assets/images/vector/addImage.png');
        }
    });
}

function initTable_DienGia(IDSuKien) {
    const tableApi = {
        url: `${baseUrl}/api/DM_DienGia_SuKienApi/GetsBySuKien?SuKienID=${IDSuKien}&MaNgonNgu=vi`,
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        dataSrc: function (data) {
            console.log(data)
            if (data && data.isSuccess && data.value.length > 0) {
                console.log(data.value)
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
                        <img src="${row.anhDaiDien || '/assets/images/vector/no-image.png'}" alt="${row.hoTen || ''}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                    </div>
                    <div class="group-info">
                    <div class="info-main"><div>${row.hoTen || ''}</div></div>
                    <div class="info-sub">${row.viTriChucVu || ''}</div></div>
                </div>`;
            }
        },
        {
            targets: 3,
            render: function (data, type, row, meta) {
                if (row.batDau && row.ketThuc) {
                    return `${formatDateTime(row.batDau)} <br> ${formatDateTime(row.ketThuc)}`
                } else if (row.batDau && !row.ketThuc) {
                    return `${formatDateTime(row.batDau)}`
                } else {
                    return `-`
                }
            }
        },
        {
            targets: 5,
            render: function (data, type, row, meta) {
                if (row.tepKemTheo) {
                    return `<a href="${baseUrl}${row.tepKemTheo}" target="_blank" class="hgi-icon hgi-download"></a>`;
                }
                return '';
            }
        },
        {
            targets: 6, // Cột chức năng
            render: function (data, type, row, meta) {
                const editIcon = `<i data-toggle="tooltip" title="Chỉnh sửa" class="edit-DienGia text-yellow cursor-pointer me-2" data-index="${meta.row}" id="${meta.row}">
                    <i class="hgi-icon hgi-edit"></i>
                </i>`;

                const deleteIcon = `<i data-toggle="tooltip" title="Xóa khỏi danh sách" class="delete-DienGia text-red cursor-pointer" data-index="${meta.row}" id="${meta.row}">
                        <i class="hgi-icon hgi-delete"></i>
                    </i>`;

                return editIcon + deleteIcon;;
            }
        }
    ];

    const tableCols = [
        { "data": "stt", "width": "40px", "class": "center-align" },
        { "data": "", "class": "left-align" },
        { "data": "chuDe", "width": "20%", "class": "left-align" },
        { "data": "", "width": "15%", "class": "left-align" },
        { "data": "diaDiem", "width": "20%", "class": "left-align" },
        { "data": "", "width": "8%", "class": "center-align" },
        { "data": "", "width": "120px", "class": "center-align group-icon-action" }
    ];

    initDataTableConfigNoSearch('dataGridDienGia', tableApi, tableDefs, tableCols);

    // Event cho xóa bài thuyết trình
    $(document).on('click', '.delete-DienGia', function() {
        const index = $(this).data('index');
        const table = $('#dataGridDienGia').DataTable();
        const rowData = table.row(index).data();
        $('#idDelete').val(rowData.dienGiaSuKienID);
        $('#nameDelete').text(`${rowData.chuDe || 'chủ đề này'}`);
        $('#idTypeDelete').val('diengia');
        $('#modalDelete').modal('show');
    });

    // Event cho chỉnh sửa bài thuyết trình
    $(document).on('click', '.edit-DienGia', function() {
        const index = $(this).data('index');
        const table = $('#dataGridDienGia').DataTable();
        const rowData = table.row(index).data();
        initThuyetTrinh('vi', rowData.caNhanID);
        $("#formDienGia").show();
    });
}
//#endregion Function Xử lý chung

//#region Function Thông tin diễn giả
function dataAddDG() {
    const fileAnhDaiDien = $("#fileAnhDaiDienDGPrev")[0].files[0] || null;
    const maDinhDanh = $("#maDinhDanhAdd").val();
    const gioiTinh = $("#gioiTinhAdd").val();
    const ngaySinh = $("#ngaySinhAdd").val();
    const danToc = $("#danTocAdd").val();
    const soDienThoai = $("#soDienThoaiAdd").val(); 
    const hopThu = $("#hopThuAdd").val();
    const tinhThanhPho = $("#tinhThanhPhoAdd").val();
    const phuongXa = $("#phuongXaAdd").val();
    const trangThai = $("input[name='thamGiaDG']:checked").val() == 1 ? true : false;

    // Đa ngữ
    const ngonNguDich = $("#ngonNguDichDGAdd").val();
    const hoVaTen = $("#hoVaTenAdd").val();
    const diaChi = $("#diaChiAdd").val();
    const noiLamViec = $("#noiLamViecAdd").val();
    const moTa = ckeditormoTaDichAdd.getData();
    const ghiChu = ckeditorghiChuDichAdd.getData();

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
        TrangThai: trangThai,
        MaNgonNgu: ngonNguDich,
        HoTen: hoVaTen,
        DiaChi: diaChi,
        NoiLamViec: noiLamViec,
        MoTa: moTa,
        GhiChu: ghiChu
    };

    let formData = new FormData()
    formData.append('RequestDienGia', JSON.stringify(dtChung))
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
    else if (checkUniqueDG(maDinhDanh) > 0) {
        showNotification(0, "Mã định danh (CCCD/Hộ chiếu) đã tồn tại")
    }
    else if (checkEmptyBlank(gioiTinh)) {
        showNotification(0, "Vui lòng chọn giới tính")
    }
    else if (checkTagHtmlSingle(soDienThoai)) {
        showNotification(0, "Số điện thoại chứa ký tự không hợp lệ")
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
        showNotification(0, "Vui lòng nhập họ và tên hướng dẫn viên")
    }
    else if (checkTagHtmlSingle(hoVaTen)) {
        showNotification(0, "Họ và tên hướng dẫn viên chứa ký tự không hợp lệ")
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
            url: `${baseUrl}/api/DM_CaNhan_DienGiaApi/Add`,
            async: false,
            contentType: false,
            processData: false,
            data: formData,
            success: function (data) {
                if (data.isSuccess && data.value) {
                    showNotification(1, "Thêm mới diễn giả thành công");
                    console.log(data)
                    setTimeout(() => {
                        $("#modalDienGia").modal('hide');
                    }, 1500);
                    var newDienGiaID = data.value.caNhanID
                    $("#DienGiaCoSanAdd").append(`<option value="${newDienGiaID}" selected>${data.value.hoTen}</option>`);
                    $("#DienGiaCoSanAdd").val(newDienGiaID).trigger('change');
                } else {
                    showNotification(0, "Thêm mới diễn giả không thành công");
                    console.log(data.error)
                }
            },
            error: function (err) {
                console.log(err)
            }
        })
    }

  

    console.log('Dữ liệu diễn giả:', dtChung);
}

function dataAddTT(IDSuKien) {
    const SuKienID = IDSuKien;
    const DienGiaSuKienID = $("#dienGiaSuKienIDDG").val();
    const CaNhanID = $("#DienGiaCoSanAdd").val();
    const VaiTroID = $("#vaiTroDG").val();
    const TrangThai = $("input[name='trangThaiDG']:checked").val() == 1 ? true : false;
    const ThuTuTrinhDien = $("#thuTuDG").val();

    const MaNgonNgu = $("#ngonNguDG").val();
    const ViTriChucVu = $("#viTriChucVuDG").val();
    const ChuDe = $("#chuDeDG").val();
    const NoiDung = ckeditornoiDungDGAdd.getData();
    const BatDau = $("#batDauDG").val();
    const KetThuc = $("#ketThucDG").val();
    const DiaDiem = $("#diaDiemDG").val();
    const ThuTu = $("#thuTuThuyetTrinhDG").val();
    const TepKemTheo = $("#tepKemTheoDG")[0].files[0] || null;
    const TepKemTheoDetail = $("#tepKemTheoDetailDG").val();

    const dtDGChung = {
        SuKienID: SuKienID,
        CaNhanID: CaNhanID,
        VaiTroID: VaiTroID,
        TrangThai: TrangThai,
        ThuTuTrinhDien: ThuTuTrinhDien, 
        MaNgonNgu: MaNgonNgu,
        ViTriChucVu: ViTriChucVu,
        ChuDe: ChuDe,   
        NoiDung: NoiDung,
        BatDau: BatDau,
        KetThuc: KetThuc,
        DiaDiem: DiaDiem,
        ThuTu: ThuTu
    };

    const dtDGChung_Edit = {
        ...dtDGChung,
        DienGiaSuKienID: DienGiaSuKienID,
        TepKemTheoDetail: TepKemTheoDetail
    }

    let formDataDG = new FormData()
    formDataDG.append('EntityDienGia', JSON.stringify(dtDGChung))
    if (TepKemTheo) {
        formDataDG.append("File", TepKemTheo)
    }

    let formDataDG_Edit = new FormData()
    formDataDG_Edit.append('EntityDienGia', JSON.stringify(dtDGChung_Edit))
    if (TepKemTheo) {
        formDataDG_Edit.append("File", TepKemTheo)
    }

    if (checkEmptyBlank(VaiTroID)) {
        showNotification(0, "Vui lòng chọn vai trò")
    }
    else if (isValidPositiveIntegerAllowEmpty(ThuTuTrinhDien) || Number(ThuTuTrinhDien) > 2147483647) {
        showNotification(0, "Thứ tự không hợp lệ")
    }
    else if (checkEmptyBlank(ViTriChucVu)) {
        showNotification(0, "Vui lòng chọn chức vụ")
    }
    else if (checkTagHtmlSingle(ViTriChucVu)) {
        showNotification(0, "Vị trí chức vụ chứa ký tự không hợp lệ")
    }
    else if (checkEmptyBlank(ChuDe)) {
        showNotification(0, "Vui lòng nhập chủ đề thuyết trình")
    }
    else if (checkTagHtmlSingle(ChuDe)) {
        showNotification(0, "Chủ đề thuyết trình chứa ký tự không hợp lệ")
    }
    else if (checkTagHtmlSingle(DiaDiem)) {
        showNotification(0, "Địa điểm chứa ký tự không hợp lệ")
    }
    else if (isValidPositiveIntegerAllowEmpty(ThuTu) || Number(ThuTu) > 2147483647) {
        showNotification(0, "Thứ tự thuyết trình không hợp lệ")
    }
    else if (validateDateRange(BatDau, KetThuc)) {
        showNotification(0, "Thời gian thuyết trình không hợp lệ")
    }
    else {
        if (DienGiaSuKienID) {
            $.ajax({
                type: 'PUT',
                url: `${baseUrl}/api/DM_DienGia_SuKienApi/Update`,
                async: false,
                contentType: false,
                processData: false,
                data: formDataDG_Edit,
                success: function (data) {
                    if (data.isSuccess && data.value) {
                        showNotification(1, "Chỉnh sửa thông tin bài thuyết trình thành công");
                        console.log(data)
                    } else {
                        showNotification(0, "Chỉnh sửa thông tin bài thuyết trình không thành công");
                        console.log(data.error)
                    }
                }
            })
        }
        else {
            $.ajax({
                type: 'POST',
                url: `${baseUrl}/api/DM_DienGia_SuKienApi/Add`,
                async: false,
                contentType: false,
                processData: false,
                data: formDataDG,
                success: function (data) {
                    if (data.isSuccess && data.value) {
                        showNotification(1, "Thêm mới thông tin bài thuyết trình thành công");
                        console.log(data)
                    } else {
                        showNotification(0, "Thêm mới thông tin bài thuyết trình không thành công");
                        console.log(data.error)
                    }
                }
            })
        }
    }

   

}

function initThuyetTrinh(lang, IDThuyetTrinh) {
    getDataWithApi('GET', `/api/DM_DienGia_SuKienApi/GetsByCaNhan?MaNgonNgu=${lang}&CaNhanID=${IDThuyetTrinh}`).then(data => {
        if (data && data.isSuccess && data.value.length > 0) {
            console.log(data.value)
            let caNhanData = data.value[0]
            $("#DienGiaCoSanAdd").attr('disabled', true);
            $("#dienGiaSuKienIDDG").val(caNhanData.dienGiaSuKienID);
            $("#DienGiaCoSanAdd").val(caNhanData.caNhanID).trigger('change');
            $("#vaiTroDG").val(caNhanData.vaiTroID).trigger('change');
            $("input[name='trangThaiDG'][value='" + (caNhanData.trangThai ? 1 : 0) + "']").prop("checked", true);
            $("#thuTuDG").val(caNhanData.thuTu);

            $("#viTriChucVuDG").val(caNhanData.viTriChucVu);
            $("#chuDeDG").val(caNhanData.chuDe);
            ckeditornoiDungDGAdd.setData(caNhanData.noiDung || '');
            $("#batDauDG").val(caNhanData.batDau);
            $("#ketThucDG").val(caNhanData.ketThuc);
            $("#diaDiemDG").val(caNhanData.diaDiem);
            $("#thuTuThuyetTrinhDG").val(caNhanData.thuTuThuyetTrinh);
            $("#tepKemTheoDetailDG").val(caNhanData.tepKemTheo);
            $("#tepKemTheoDetailDG_Name").html(`File hiện tại: <a id="tepKemTheoLinkDG" href="${baseUrl + caNhanData.tepKemTheo}" target="_blank">Xem file</a>`);
        }
    })
}

function deleteBaiThuyetTrinh() {
    let id = $('#idDelete').val();
    $.ajax({
        type: 'DELETE',
        url: `${baseUrl}/api/DM_DienGia_SuKienApi/Delete?DienGiaSuKienID=${id}`,
        async: false,
        contentType: "application/json, charset=utf-8",
        success: function (data) {
            if (data.isSuccess && data.value) {
                showNotification(1, "Xoá bài thuyết trình thành công");
                $('#modalDelete').modal('hide');
                //$('#dataGridDienGia').DataTable().ajax.reload();
            } else {
                showNotification(0, "Xoá bài thuyết trình không thành công");
                console.log(data.error)
            }
        },
        error: function (err) {
            console.log(err)
        }
    })
}

function resetValueThuyetTrinh() {
    $("#dienGiaSuKienIDDG").val('');
    $("#DienGiaCoSanAdd").val('').trigger('change');
    $("#vaiTroDG").val('').trigger('change');
    $("#thuTuDG").val('');
    $("input[name='trangThaiDG'][value='1']").prop("checked", true);

    $("#ngonNguDG").val('vi').trigger('change');
    $("#viTriChucVuDG").val('');
    $("#chuDeDG").val('');
    ckeditornoiDungDGAdd.setData('');
    $("#batDauDG").val('');
    $("#ketThucDG").val('');
    $("#diaDiemDG").val('');
    $("#thuTuThuyetTrinhDG").val('');
    $("#tepKemTheoDetailDG").val('');
    $("#tepKemTheoDetailDG_Name").html(`File hiện tại: <a id="tepKemTheoLinkDG" href="" target="_blank" style="display:none">Xem file</a>`);
    $("#DienGiaCoSanAdd").attr('disabled', false);
}

function resetValueDienGia() {
    $("#fileAnhDaiDienDGPrev").val('');
    $("#maDinhDanhAdd").val('');
    $("#gioiTinhAdd").val('');
    $("#ngaySinhAdd").val('');
    $("#danTocAdd").val('');
    $("#soDienThoaiAdd").val(''); 
    $("#hopThuAdd").val('');
    $("#tinhThanhPhoAdd").val('');
    $("#phuongXaAdd").val('');
    $("input[name='thamGiaDG'][value='1']").prop("checked", true);

    // Đa ngữ
    $("#ngonNguDichDGAdd").val('vi').trigger('change');
    $("#hoVaTenAdd").val('');
    $("#diaChiAdd").val('');
    $("#noiLamViecAdd").val('');
    ckeditormoTaDichAdd.setData('');
    ckeditorghiChuDichAdd.setData('');
}
//#endregion Function Thông tin diễn giả

//#region validation
const checkUniqueDG = (maDinhDanh) => {
    let result = 0

    $.ajax({
        type: "GET",
        async: false,
        url: `${baseUrl}/api/CSDL_JsonApi/CheckUnique?MaDinhDanh=${maDinhDanh}`,
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

const validateDateRange = (startStr, endStr) => {
    const start = new Date(startStr);
    const end = new Date(endStr);

    if (isNaN(start) || isNaN(end)) {
        return  false;
    }

    if (end < start) {
        return true
    }
}
//#endregion validation


