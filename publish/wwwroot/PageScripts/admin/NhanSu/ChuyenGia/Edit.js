const baseUrl = getRootLink();
const ckeditormoTaDichEdit = CKEDITOR.replace('moTaDichEdit');
const ckeditorghiChuDichEdit = CKEDITOR.replace('ghiChuDichEdit');
const ckeditorkinhNghiemThanhTichDichEdit = CKEDITOR.replace('kinhNghiemThanhTichDichEdit');
const ckeditorbangCapDichEdit = CKEDITOR.replace('bangCapDichEdit');

let tempTheThao = [];
let listTheThao = [];
let allSports = []; // chứa tất cả môn từ API

console.log(NhanSuId)

$(document).ready(function () {
    //#region Xử lý các function chung
    initDatePicker();
    initDanhMucChung_NoAll(1, "#danTocEdit", "")
    initDanhMucChung_NoAll(5, "#gioiTinhEdit", "")
    initToChuc_NoAll(96, "#donViCongTacEdit", "", "")
    initNgonNgu("#ngonNguDichEdit")
    initNgonNgu("#ngonNguDichDiaDiemEdit")
    initNgonNgu("#ngonNguDPT")
    initTinhThanhPho()
    initSelect2();
    previewPicture();
    initTableTheThao(NhanSuId);
    listTheThao = initListTheThao();
    console.log('Danh sách môn thể thao từ API:', listTheThao);

    initTableQuaTrinh(NhanSuId);

    initTableHopDong(NhanSuId);

    $('#tinhThanhPhoEdit').on('change', function () {
        let tinhID = $(this).val();
        initPhuongXa(tinhID)
    })
    //#endregion Xử lý các function chung

    //#region Xử lý lưu Thông tin chuyên gia
    setTimeout(() => {
        loadData(NhanSuId)
    }, 300);

    $("#formNhanSuEdit").on("submit", function (e) {
        e.preventDefault(); // Ngăn chặn hành vi mặc định của form
        dataEdit();
    });

    // Khi thay đổi Ngôn ngữ, reset các input trong phần đa ngữ
    $(document).on('change', '#ngonNguDichEdit', function () {
        let maNgonNgu = $(this).val();
        
        if (NhanSuId && maNgonNgu) {
            console.log('Chuyển Ngôn ngữ cho lễ hội hiện tại:', maNgonNgu);
            // Load bản dịch cho ngôn ngữ được chọn
            loadTranslation(NhanSuId, maNgonNgu);
        } else {
            // Nếu chưa có cơ quan (tạo mới) hoặc chưa chọn ngôn ngữ, clear các trường dịch
            if (!NhanSuId || !maNgonNgu) {
                $("#ngonNguDichEdit").val('');
                $("#hoVaTenEdit").val('');
                $("#diaChiEdit").val('');
                $("#noiLamViecEdit").val('');
                if (typeof ckeditormoTaDichEdit !== 'undefined') ckeditormoTaDichEdit.setData('');
                if (typeof ckeditorghiChuDichEdit !== 'undefined') ckeditorghiChuDichEdit.setData('');
                if (typeof ckeditorkinhNghiemThanhTichDichEdit !== 'undefined') ckeditorkinhNghiemThanhTichDichEdit.setData('');
                if (typeof ckeditorbangCapDichEdit !== 'undefined') ckeditorbangCapDichEdit.setData('');
            }
        }
    });
    //#endregion Xử lý lưu Thông tin chuyên gia
})

//#region Function Xử lý chung
function initTinhThanhPho() {
    getDataWithApi('GET', '/api/CapTinhApi/Gets').then(data => {
        if (data && data.isSuccessed && data.resultObj) {
            $("#tinhThanhPhoEdit").empty().append(`<option value="">Chọn</option>`);
            data.resultObj.forEach(item => {
                const displayText = item.noiDung || item.tenTinh || 'Không rõ tên';
                $("#tinhThanhPhoEdit").append(`<option value="${item.tinhID}">${displayText}</option>`);
            });
        }
    })
}

function initPhuongXa(tinhID = null) {
    getDataWithApi('GET', `/api/CapXaApi/GetByMaTinh?MaNgonNgu=vi&MaTinh=${tinhID ? `${tinhID}` : ''}`).then(data => {
        $("#phuongXaEdit").empty().append(`<option value="">Chọn</option>`);
        if (data && data.isSuccess && data.value) {
            data.value.forEach(item => {
                const displayText = item.noiDung || item.tenXa || 'Không rõ tên';
                $("#phuongXaEdit").append(`<option value="${item.xaID}">${displayText}</option>`);
            });
        }
    })
}

function previewPicture() {
    // Xử lý preview ảnh bìa
    $('.group_image_input #fileAnhDaiDienPrev').on('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                $('#showAnhDaiDienEdit').attr('src', ev.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            $('#showAnhDaiDienEdit').attr('src', '/assets/images/vector/AddImage.png');
        }
    });
}
//#endregion Function Xử lý chung

//#region Function Thông tin chuyên gia
function loadData(id) {
    getDataWithApi('GET', `/api/DM_CaNhan_ChuyenGiaApi/Get?CaNhanID=${id}&maNgonNgu=vi`).then(data => {
        if (data && data.isSuccess && data.value) {
            const item = data.value;
            console.log('Dữ liệu chuyên gia:', item);
            $("#maDinhDanhEdit").val(item.maDinhDanh || '');
            $("#showAnhDaiDienEdit").attr('src', item.anhChanDung || '/assets/images/vector/no-image.png');
            $("#showAnhDaiDienDetail").val(item.anhChanDung || '');
            $("#gioiTinhEdit").val(item.gioiTinhID || '').trigger('change');
            $("#ngaySinhEdit").val(formatDateWithoutTime(item.ngaySinh) || '');
            $("#danTocEdit").val(item.danTocID || '').trigger('change');
            $("#soDienThoaiEdit").val(item.dienThoai || '');
            $("#hopThuEdit").val(item.hopThu || '');
            $("#tinhThanhPhoEdit").val(item.tinhID || '').trigger('change');
            setTimeout(() => {
                $("#phuongXaEdit").val(item.xaID || '').trigger('change');
            }, 300);
            //$("#soTheEdit").val(item.soThe || '');
            //$("#ngayCapEdit").val(formatDateWithoutTime(item.ngayCap) || '');
            //$("#coQuanCapEdit").val(item.coQuanCap || '');
            $("#namKinhNghiemEdit").val(item.namKinhNghiem || '');
            $("#donViCongTacEdit").val(item.listIDToChuc ? item.listIDToChuc.split(',').map(item =>item.trim().toLowerCase()).filter(item => item !== '') : null).trigger('change');
            $("#thuTuEdit").val(item.thuTu || '');
            if (item.trangThai) {
                $("input[name='trangThai'][value='1']").prop('checked', true);
            } else {
                $("input[name='trangThai'][value='0']").prop('checked', true);
            }
            $("#ngonNguDichEdit").val(item.maNgonNgu || '').trigger('change');
            $("#hoVaTenEdit").val(item.hoTen || '');
            $("#diaChiEdit").val(item.diaChi || '');
            $("#noiLamViecEdit").val(item.noiLamViec || '');
            if (typeof ckeditormoTaDichEdit !== 'undefined') ckeditormoTaDichEdit.setData(item.moTa || '');
            if (typeof ckeditorghiChuDichEdit !== 'undefined') ckeditorghiChuDichEdit.setData(item.ghiChu || '');
            if (typeof ckeditorkinhNghiemThanhTichDichEdit !== 'undefined') ckeditorkinhNghiemThanhTichDichEdit.setData(item.kinhNghiemThanhTich || '');
            if (typeof ckeditorbangCapDichEdit !== 'undefined') ckeditorbangCapDichEdit.setData(item.bangCap || '');
        }
    })
}

function dataEdit() {
    const fileAnhDaiDien = $("#fileAnhDaiDienPrev")[0].files[0] || null;
    const maDinhDanh = $("#maDinhDanhEdit").val();
    const gioiTinh = $("#gioiTinhEdit").val();
    const ngaySinh = $("#ngaySinhEdit").val();
    const danToc = $("#danTocEdit").val();
    const soDienThoai = $("#soDienThoaiEdit").val();
    const hopThu = $("#hopThuEdit").val();
    const tinhThanhPho = $("#tinhThanhPhoEdit").val();
    const phuongXa = $("#phuongXaEdit").val();
    const anhChanDungDetail = $("#showAnhDaiDienDetail").val() || '';
    const namKinhNghiem = $("#namKinhNghiemEdit").val();
    const donViCongTac = $("#donViCongTacEdit").val().map(item => item).join(',');
    //const soThe = $("#soTheEdit").val();
    //const ngayCap = $("#ngayCapEdit").val();
    //const coQuanCap = $("#coQuanCapEdit").val();
    //const thuTu = $("#thuTuEdit").val();
    const trangThai = $("input[name='trangThai']:checked").val() == 1 ? true : false;

    // Đa ngữ
    const ngonNguDich = $("#ngonNguDichEdit").val();
    const hoVaTen = $("#hoVaTenEdit").val();
    const diaChi = $("#diaChiEdit").val();
    const noiLamViec = $("#noiLamViecEdit").val();
    const moTa = ckeditormoTaDichEdit.getData();
    const ghiChu = ckeditorghiChuDichEdit.getData();
    const kinhNghiemThanhTich = ckeditorkinhNghiemThanhTichDichEdit.getData();
    const bangCap = ckeditorbangCapDichEdit.getData();

    // Kết quả trả về dạng object
    const dtChung = {
        MaDinhDanh: maDinhDanh,
        gioiTinh: gioiTinh,
        NgaySinh: formatDateToSaveAsString(ngaySinh),
        DanTocID: danToc,
        DienThoai: soDienThoai,
        HopThu: hopThu,
        TinhID: tinhThanhPho,
        XaID: phuongXa,
        anhChanDungDetail: anhChanDungDetail,
        CaNhanID: NhanSuId,
        NamKinhNghiem: namKinhNghiem,
        ToChucID: donViCongTac,
        //ngayCap,
        //coQuanCap,
        //thuTu,
        TrangThai: trangThai,
        MaNgonNgu: ngonNguDich,
        HoTen: hoVaTen,
        DiaChi: diaChi,
        NoiLamViec: noiLamViec,
        MoTa: moTa,
        GhiChu: ghiChu,
        KinhNghiemThanhTich: kinhNghiemThanhTich,
        BangCap: bangCap,
    };

    console.log(dtChung)

    let formData = new FormData()
    formData.append('RequestChuyenGia', JSON.stringify(dtChung))
    formData.append("File", fileAnhDaiDien)

    if (fileAnhDaiDien == null && anhChanDungDetail == null) {
        showNotification(0, "Vui lòng chọn ảnh đại diện")
    }
    else if (checkEmptyBlank(maDinhDanh)) {
        showNotification(0, "Vui lòng nhập mã định danh (CCCD/Hộ chiếu)")
    }
    else if (checkTagHtmlSingle(maDinhDanh)) {
        showNotification(0, "Mã định danh (CCCD/Hộ chiếu) chứa ký tự không hợp lệ")
    }
    else if (checkUniqueIdentifier(maDinhDanh, NhanSuId) > 0) {
        showNotification(0, "Mã định danh (CCCD/Hộ chiếu) đã tồn tại")
    }
    else if (checkEmptyBlank(gioiTinh)) {
        showNotification(0, "Vui lòng chọn giới tính")
    }
    else if (isFutureDate(ngaySinh)) {
        showNotification(0, "Ngày sinh không hợp lệ")
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
        showNotification(0, "Vui lòng nhập họ và tên chuyên gia")
    }
    else if (checkTagHtmlSingle(hoVaTen)) {
        showNotification(0, "Họ và tên chuyên gia chứa ký tự không hợp lệ")
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
            url: `${baseUrl}/api/DM_CaNhan_ChuyenGiaApi/Update`,
            async: false,
            contentType: false,
            processData: false,
            data: formData,
            success: function (data) {
                if (data.isSuccess && data.value) {
                    showNotification(1, "Chỉnh sửa chuyên gia thành công");
                    console.log(data)
                    setTimeout(() => {
                        window.location.href = `${baseUrl}/AdminTool/NhanSu/ChuyenGia`;
                    }, 1500);
                } else {
                    showNotification(0, "Chỉnh sửa chuyên gia không thành công");
                    console.log(data.error)
                }
            },
            error: function (err) {
                console.log(err)
            }
        })
    }
    console.log('Dữ liệu chuyên gia:', dtChung);
}

function loadTranslation(nhanSuId, maNgonNgu) {
    getDataWithApi('GET', `/api/DM_CaNhan_ChuyenGiaApi/Get?CaNhanID=${nhanSuId}&maNgonNgu=${maNgonNgu}`).then(data => {
        console.log(data, "Load bản dịch lễ hội")
        $("#ngonNguDichEdit").val(maNgonNgu).trigger("change.select2");
        if (data && data.isSuccess && data.value) {
            translations = data.value;
            // Populate các trường dịch với dữ liệu đa ngữ
            $("#hoVaTenEdit").val(translations.hoTen || '');
            $("#diaChiEdit").val(translations.diaChi || '');
            $("#noiLamViecEdit").val(translations.noiLamViec || '');
            if (typeof ckeditormoTaDichEdit !== 'undefined') ckeditormoTaDichEdit.setData(translations.moTa || '');
            if (typeof ckeditorghiChuDichEdit !== 'undefined') ckeditorghiChuDichEdit.setData(translations.ghiChu || '');
            if (typeof ckeditorkinhNghiemThanhTichDichEdit !== 'undefined') ckeditorkinhNghiemThanhTichDichEdit.setData(translations.kinhNghiemThanhTich || '');
            if (typeof ckeditorbangCapDichEdit !== 'undefined') ckeditorbangCapDichEdit.setData(translations.bangCap || '');
        } else {
            // Nếu không có bản dịch, clear các trường dịch
            $("#hoVaTenEdit").val('');
            $("#diaChiEdit").val('');
            $("#noiLamViecEdit").val('');
            if (typeof ckeditormoTaDichEdit !== 'undefined') ckeditormoTaDichEdit.setData('');
            if (typeof ckeditorghiChuDichEdit !== 'undefined') ckeditorghiChuDichEdit.setData('');
            if (typeof ckeditorkinhNghiemThanhTichDichEdit !== 'undefined') ckeditorkinhNghiemThanhTichDichEdit.setData('');
            if (typeof ckeditorbangCapDichEdit !== 'undefined') ckeditorbangCapDichEdit.setData('');
        }
    })
}
//#endregion Function Thông tin chuyên gia


//#region Function Xử lý bảng thể chất
function initTableTheThao(id) {
    const tableApi = {
        url: `${baseUrl}/api/DM_CaNhan_ChuyenGiaApi/GetListMon?CaNhanID=${id}&maNgonNgu=vi`,
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
            targets: 0,
            render: function (data, type, row, meta) {
                return parseInt(meta.row) + 1;
            }
        },
        {
            targets: 2,
            render: function (data, type, row) {
                if (row._isNew) {
                    //return `
                    //    <input type="checkbox" id="monChinhAdd" name="monChinh" ${hasMainSport() ? "disabled" : ""} ${row.monTheThaoChinh ? "" : "checked"}>
                    //`;
                    return data;
                } else {
                    return row.monTheThaoChinh ? `<span class="TrangThai green-text">Có</span>` : `<span class="TrangThai red-text">Không</span>`;
                }
            }
        },
        {
            targets: 3,
            render: function (data, type, row, meta) {
                if (row._isNew) {
                    return `
                        <button type="button" class="btnSave hgi-icon hgi-check"></button>
                        <button type="button" class="btnCancel hgi-icon hgi-cancel"></button>
                    `;
                }

                const editIcon = `<i class="edit-monTheThao cursor-pointer me-2" 
                                    data-index="${meta.row + 1}">
                                    <i class="hgi-icon hgi-edit"></i></i>`;
                const deleteIcon = row.isExisting
                    ? `<i class="delete-existing-monTheThao cursor-pointer text-danger" 
                            data-id="${row.monTheThaoID}">
                            <i class="hgi-icon hgi-delete"></i></i>`
                    : `<i class="delete-monTheThao cursor-pointer text-danger" 
                            data-index="${meta.row + 1}">
                            <i class="hgi-icon hgi-delete"></i></i>`;
                return editIcon + deleteIcon;
            }
        }
    ];

    const tableCols = [
        { data: null, width: "40px", class: "center-align" },
        { data: "tenMon", class: "left-align" },
        { data: "monTheThaoChinh", width: "180px", class: "left-align" },
        { data: null, width: "120px", class: "center-align group-icon-action" }
    ];

    const table = $('#tableTheThao').DataTable({
        ajax: tableApi,
        columns: tableCols,
        columnDefs: tableDefs,
        paging: false,
        searching: false,
        info: false,
        ordering: false,
        autoWidth: false,
        responsive: true,
        language: {
            emptyTable: "Chưa có môn thể thao nào"
        }
    });

    // Lấy danh sách tất cả môn ngay khi init
    initListTheThao();
    // Hàm sinh select, loại bỏ môn đã có trong bảng

    // === Thêm dòng mới ===
    let newRow = null;
    let originalRowData = null;

    $('#btnEditRow').on('click', function () {
        if (newRow) return;

        const rowData = {
            stt: table.rows().count() + 1,
            tenMon: createSelectSport(),
            monTheThaoChinh: `<input type="checkbox" id="monChinhAdd" name="monChinh" ${hasMainSport() ? "disabled" : ""}>`,
            _isNew: true
        };

        newRow = table.row.add(rowData).draw(false).node();
        $(newRow).addClass('adding');
        initSelect2();
    });

    // === Hủy thêm hoặc chỉnh sửa dòng ===
    $('#tableTheThao').on('click', '.btnCancel', function () {
        if (originalRowData) {
            // Nếu đang edit, restore dữ liệu gốc
            table.row(newRow).data(originalRowData).draw(false);
            $(newRow).removeClass('adding');
            originalRowData = null;
        } else {
            // Nếu đang add mới, remove dòng "ảo"
            table.row('.adding').remove().draw(false);
            // hoặc reload để chắc chắn đồng bộ
            // table.ajax.reload();
        }
        newRow = null;
    });

    // === Chỉnh sửa dòng ===
    $('#tableTheThao').on('click', '.edit-monTheThao', function () {
        if (newRow) return; // đang có row thêm mới thì không cho edit

        const rowNode = $(this).closest('tr');
        const rowData = table.row(rowNode).data();

        // Lưu lại dữ liệu gốc để restore khi cancel
        originalRowData = { ...rowData };

        const editRowData = {
            stt: rowData.stt,
            tenMon: createSelectSport(rowData.monTheThaoID),
            monTheThaoChinh: `
                <input type="checkbox" id="monChinhAdd" name="monChinh"
                    ${(!rowData.monTheThaoChinh && hasMainSport()) ? "disabled" : ""}
                    ${rowData.monTheThaoChinh ? "checked" : ""}>
            `,
            _isNew: true
        };

        table.row(rowNode).data(editRowData).draw(false);
        $(rowNode).addClass('adding');
        initSelect2();
        newRow = rowNode;
    });

    // === Lưu dòng mới hoặc chỉnh sửa (AddRelation / UpdateRelation) ===
    $('#tableTheThao').on('click', '.btnSave', function () {
        let monTheThaoID = $('#selectMonTheThao').val();
        let monTheThaoText = $('#selectMonTheThao option:selected').text();
        let monTheThaoChinh = $('#monChinhAdd').is(':checked');

        if (!monTheThaoID) {
            showNotification(0, "Vui lòng chọn môn thể thao!");
            return;
        }

        const request = {
            caNhanID: id,   // id từ initTableTheThao(id)
            monTheThaoID: monTheThaoID,
            vaiTro: 10, // Chuyên gia
            monTheThaoChinh: monTheThaoChinh
        };

        // Nếu có originalRowData => đang chỉnh sửa => Update
        const isEdit = originalRowData !== null;
        const apiUrl = isEdit
            ? `${baseUrl}/api/DM_CaNhan_ChuyenGiaApi/UpdateRelation`
            : `${baseUrl}/api/DM_CaNhan_ChuyenGiaApi/AddRelation`;
        const method = isEdit ? "PUT" : "POST";

        $.ajax({
            url: apiUrl,
            type: method,
            data: JSON.stringify(request),
            contentType: "application/json",
            success: function (res) {
                if (res && res.isSuccess) {
                    showNotification(1, isEdit ? "Cập nhật môn thể thao thành công!" : "Thêm môn thể thao thành công!");
                    table.ajax.reload();
                } else {
                    showNotification(0, res.message || "Không thể lưu dữ liệu!");
                    // Restore nếu là edit và fail
                    if (isEdit && originalRowData && newRow) {
                        table.row(newRow).data(originalRowData).draw(false);
                    } else if (!isEdit) {
                        // Nếu thêm mới fail thì remove dòng "ảo"
                        table.row('.adding').remove().draw(false);
                    }
                }
            },
            error: function () {
                showNotification(0, "Có lỗi xảy ra khi gọi API!");
                if (isEdit && originalRowData && newRow) {
                    table.row(newRow).data(originalRowData).draw(false);
                } else if (!isEdit) {
                    table.row('.adding').remove().draw(false);
                }
            }
        });

        newRow = null;
        originalRowData = null;
    });

    // === Xử lý checkbox monTheThaoChinh ===
    $('#tableTheThao').on('change', 'input[name="monChinh"]', function () {
        if ($(this).is(':checked')) {
            // Uncheck tất cả checkbox khác
            $('input[name="monChinh"]').not(this).prop('checked', false);
        }
    });

    // === Xóa dòng (dùng API DeleteRelation) ===
    $('#tableTheThao').on('click', '.delete-monTheThao', function () {
        const rowNode = $(this).closest('tr');
        const rowData = table.row(rowNode).data();

        console.log('Dữ liệu dòng cần xóa:', rowData);

        $('#idDelete').val(rowData.monTheThaoID);
        $('#nameDelete').text(`${rowData.tenMon}`);
        $('#modalDelete').modal('show');
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

    function hasMainSport() {
        return tempTheThao.some(x => x.monTheThaoChinh === true);
    }

    function createSelectSport(selectedId = "") {
        let options = `<option value="">Chọn</option>`;

        // Lấy danh sách môn đã gắn cho VĐV
        const existingSports = $('#tableTheThao').DataTable().data().toArray()
            .map(r => r.monTheThaoID);

        allSports.forEach(s => {
            // Bỏ qua nếu môn đã có và không phải môn đang edit
            if (existingSports.includes(s.monTheThaoID) && s.monTheThaoID !== selectedId) {
                return;
            }
            options += `<option value="${s.monTheThaoID}" ${s.monTheThaoID === selectedId ? "selected" : ""}>${s.tenMon}</option>`;
        });

        return `<select id="selectMonTheThao" class="form-control">${options}</select>`;
    }

    function dataDelete() {
        let monTheThaoID = $('#idDelete').val();
        $.ajax({
            url: `${baseUrl}/api/DM_CaNhan_ChuyenGiaApi/DeleteRelation?CaNhanID=${NhanSuId}&MonTheThaoID=${monTheThaoID}`,
            type: "DELETE",
            success: function (res) {
                if (res && res.isSuccess) {
                    showNotification(1, "Xóa môn thể thao thành công!");
                    table.ajax.reload();
                    $('#modalDelete').modal('hide');
                } else {
                    showNotification(0, res.message || "Không thể xóa môn thể thao!");
                }
            },
            error: function () {
                showNotification(0, "Có lỗi xảy ra khi gọi API xóa!");
            }
        });
    }
}

function initListTheThao() {
    return $.ajax({
        url: `${baseUrl}/api/TT_MonTheThaoApi/Gets?MaNgonNgu=vi`,
        type: "GET",
        contentType: "application/json",
        success: function (res) {
            if (res && res.isSuccess) {
                allSports = res.value || [];
            }
        }
    });
}
//#endregion Function Xử lý bảng thể chất

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

const checkUniqueIdentifier = (maDinhDanh, caNhanID) => {
    let result = 0

    $.ajax({
        type: "GET",
        async: false,
        url: `${baseUrl}/api/CSDL_JsonApi/CheckUnique?MaDinhDanh=${maDinhDanh}&CaNhanID=${caNhanID}`,
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