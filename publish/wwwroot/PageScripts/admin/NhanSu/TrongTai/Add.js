const baseUrl = getRootLink();
const ckeditormoTaDichAdd = CKEDITOR.replace('moTaDichAdd');
const ckeditorghiChuDichAdd = CKEDITOR.replace('ghiChuDichAdd');

let tempTheThao = [];
let listTheThao = [];

$(document).ready(function () {
    //#region Xử lý các function chung
    initDatePicker();
    initDanhMucChung_NoAll(1, "#danTocAdd", "")
    initDanhMucChung_NoAll(5, "#gioiTinhAdd", "")
    initDanhMucChung_NoAll(44, "#capBacAdd", "")
    initToChuc_NoAll(96, "#donViCongTacAdd", "", "")
    initNgonNgu("#ngonNguDichAdd")
    initNgonNgu("#ngonNguDichDiaDiemAdd")
    initNgonNgu("#ngonNguDPT")
    initTinhThanhPho()
    initSelect2();
    previewPicture();
    initTableTheThao();
    listTheThao = initListTheThao();
    console.log('Danh sách môn thể thao từ API:', listTheThao);

    $('#tinhThanhPhoAdd').on('change', function () {
        let tinhID = $(this).val();
        initPhuongXa(tinhID)
    })
    //#endregion Xử lý các function chung

    //#region Xử lý lưu thông tin trọng tài
    $("#formNhanSuAdd").on("submit", function (e) {
        e.preventDefault(); // Ngăn chặn hành vi mặc định của form
        dataAdd();
    });

    $(document).on('change', '#ngonNguDichAdd', function() {
        let lang = $(this).val()
        let selectedValue = $("#maDinhDanhAdd").val()
        getDataWithApi('GET', `/api/CSDL_JsonApi/GetInfoByMaDinhDanh?maNgonNgu=${lang}&maDinhDanh=${selectedValue}`).then(data => {
            if (data && data.isSuccess && data.value.length > 0) {
                let item = data.value[0];
                if ($("#maDinhDanhAdd").val() != '') {
                    $("#hoVaTenAdd").val(item.hoTen || '').attr('disabled', true);
                    $("#diaChiAdd").val(item.diaChi || '').attr('disabled', true);
                    $("#noiLamViecAdd").val(item.noiLamViec || '').attr('disabled', true);
                    if (typeof ckeditormoTaDichAdd !== 'undefined') ckeditormoTaDichAdd.setData(item.moTa || '');
                    if (typeof ckeditorghiChuDichAdd !== 'undefined') ckeditorghiChuDichAdd.setData(item.ghiChu || '');
                } 
            } else {
                $("#hoVaTenAdd").val('').attr('disabled', false);
                $("#diaChiAdd").val('').attr('disabled', false);
                $("#noiLamViecAdd").val('').attr('disabled', false);
                if (typeof ckeditormoTaDichAdd !== 'undefined') ckeditormoTaDichAdd.setData('');
                if (typeof ckeditorghiChuDichAdd !== 'undefined') ckeditorghiChuDichAdd.setData('');
            }
        })
    });

    //Thêm mới nếu tìm kiếm không có
    initSelect2CaNhan("maDinhDanhSelect", 5); // 5: Trọng tài
    var typingTimer; // Biến để lưu trữ setTimeout
    var doneTypingInterval = 2000; // Khoảng thời gian chờ sau khi dừng nhập (2 giây)
    $('input[type="text"]').attr('disabled', true);
    $('select:not("#maDinhDanhSelect")').attr('disabled', true);
    $('#maDinhDanhSelect').on('select2:open', function (e) {
        var inputField = $('.select2-search__field');
        inputField.on('input', function () {
            clearTimeout(typingTimer);
            typingTimer = setTimeout(function () {
                // Kiểm tra xem có phần tử "Không có kết quả" hiển thị hay không
                var noResultsElement = $('.select2-results__message');
                if (noResultsElement.text() == 'Không có kết quả') {
                    noResultsElement.text("Bấm vào đây để tiến hành thêm mới")
                    $('.select2-results__message').addClass('cus-message click-message')
                    noResultsElement.on('click', function () {
                        $("#maDinhDanhAdd_Input").show();
                        $("#maDinhDanhAdd").val('');
                        $("#maDinhDanhAdd_Select").hide();
                        $('#maDinhDanhSelect').val(null).trigger('change');
                        $('.select2-search__field').off('input'); // Gỡ bỏ sự kiện input để tránh gọi lại
                        $('#maDinhDanhSelect').select2('close');
                        var doneTypingInterval = 2000; // Khoảng thời gian chờ sau khi dừng nhập (2 giây)
                        $('input[type="text"]').attr('disabled', false);
                        $('select:not("#maDinhDanhSelect")').attr('disabled', false);

                        //reset toàn bộ dữ liệu
                        $("#ngonNguDichAdd").val('vi').trigger('change');
                        $("#showAnhDaiDienAdd").attr('src', '/assets/images/vector/addImage.png');
                        $("#avatarSelect").val('')
                        $("#gioiTinhAdd").val('').trigger('change');
                        $("#ngaySinhAdd").val('');
                        $("#danTocAdd").val('').trigger('change');
                        $("#soDienThoaiAdd").val('');
                        $("#hopThuAdd").val('');    
                        $("#tinhThanhPhoAdd").val('').trigger('change');
                        $("#phuongXaAdd").val('').trigger('change');
                        //$("#donViCongTacAdd").val(null).trigger('change');
                        //$("#soTheAdd").val('');
                        //$("#ngayCapAdd").val('');
                        //$("#coQuanCapAdd").val('');
                        $("#thuTuAdd").val('');
                        $("input[name='trangThai'][value='1']").prop('checked', true);
                        $("#hoVaTenAdd").val('').attr('disabled', false);
                        $("#diaChiAdd").val('').attr('disabled', false);
                        $("#noiLamViecAdd").val('').attr('disabled', false);
                        if (typeof ckeditormoTaDichAdd !== 'undefined') ckeditormoTaDichAdd.setData('');
                        if (typeof ckeditorghiChuDichAdd !== 'undefined') ckeditorghiChuDichAdd.setData('');
                    });
                }
            }, doneTypingInterval);
        });
    })

    $('#maDinhDanhSelect').on('change', function (e) {
        console.log('Giá trị đã chọn:', $(this).val());
        var selectedValue = $(this).val();
        if (selectedValue) {
            getDataWithApi('GET', `/api/CSDL_JsonApi/GetInfoByMaDinhDanh?maNgonNgu=vi&maDinhDanh=${selectedValue}`).then(data => {
                if (data && data.isSuccess && data.value) {
                    console.log('Dữ liệu nhận được từ API:', data.value);
                    let item = data.value[0];
                    $("#maDinhDanhAdd").val(item.maDinhDanh || '').attr('disabled', item.maDinhDanh ? true : false);
                    $("#avatarSelect").val(item.anhChanDung).attr('disabled', item.anhChanDung ? true : false);
                    $("#showAnhDaiDienAdd").attr('src', item.anhChanDung || '/assets/images/vector/no-image.png');
                    $("#showAnhDaiDienDetail").val(item.anhChanDung || '').attr('disabled', item.anhChanDung ? true : false);
                    $("#gioiTinhAdd").val(item.gioiTinhID || '').attr('disabled', item.gioiTinhID ? true : false).trigger('change');
                    $("#ngaySinhAdd").val(formatDateWithoutTime(item.ngaySinh) || '').attr('disabled', item.ngaySinh ? true : false);
                    $("#danTocAdd").val(item.danTocID || '').attr('disabled', item.danTocID ? true : false).trigger('change');
                    $("#soDienThoaiAdd").val(item.dienThoai || '').attr('disabled', item.dienThoai ? true : false);
                    $("#hopThuAdd").val(item.hopThu || '').attr('disabled', item.hopThu ? true : false);
                    $("#tinhThanhPhoAdd").val(item.tinhID || '').attr('disabled', item.tinhID ? true : false).trigger('change');
                    setTimeout(() => {
                        $("#phuongXaAdd").val(item.xaID || '').attr('disabled', item.xaID ? true : false).trigger('change');
                    }, 300);
                    $("#donViCongTacAdd").val(item.listIDToChuc ? item.listIDToChuc.split(',').map(item =>item.trim().toLowerCase()).filter(item => item !== '') : null).attr('disabled', item.listIDToChuc ? true : false).trigger('change');
                    //$("#soTheAdd").val(item.soThe || '');
                    //$("#ngayCapAdd").val(formatDateWithoutTime(item.ngayCap) || '');
                    //$("#coQuanCapAdd").val(item.coQuanCap || '');
                    $("#thuTuAdd").val(item.thuTu || '').attr('disabled', item.thuTu ? true : false);
                    if (item.trangThai) {
                        $("input[name='trangThai'][value='1']").prop('checked', true);
                    } else {
                        $("input[name='trangThai'][value='0']").prop('checked', true);
                    }
                    $("#ngonNguDichAdd").val(item.maNgonNgu || '').trigger('change');
                    $("#hoVaTenAdd").val(item.hoTen || '').attr('disabled', item.hoTen ? true : false);
                    $("#diaChiAdd").val(item.diaChi || '').attr('disabled', item.diaChi ? true : false);
                    $("#noiLamViecAdd").val(item.noiLamViec || '').attr('disabled', item.noiLamViec ? true : false);
                    $("#theChatDichAdd").val(item.theChat || '').attr('disabled', item.theChat ? true : false);
                    if (typeof ckeditormoTaDichAdd !== 'undefined') ckeditormoTaDichAdd.setData(item.moTa || '');
                    if (typeof ckeditorghiChuDichAdd !== 'undefined') ckeditorghiChuDichAdd.setData(item.ghiChu || '');
                }
            })
        }
    })
    //#endregion Xử lý lưu thông tin trọng tài
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

function previewPicture() {
    // Xử lý preview ảnh bìa
    $('.group_image_input #fileAnhDaiDienPrev').on('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                $('#showAnhDaiDienAdd').attr('src', ev.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            $('#showAnhDaiDienAdd').attr('src', '/assets/images/vector/addImage.png');
        }
    });
}
//#endregion Function Xử lý chung

//#region Function Thông tin trọng tài
function dataAdd() {
    const fileAnhDaiDien = $("#fileAnhDaiDienPrev")[0].files[0] || $("#showAnhDaiDienAdd").attr('src');
    const avatarSelect = $("#avatarSelect").val()
    const maDinhDanh = $("#maDinhDanhAdd").val();
    const gioiTinh = $("#gioiTinhAdd").val();
    const ngaySinh = $("#ngaySinhAdd").val();
    const danToc = $("#danTocAdd").val();
    const soDienThoai = $("#soDienThoaiAdd").val();
    const hopThu = $("#hopThuAdd").val();
    const tinhThanhPho = $("#tinhThanhPhoAdd").val();
    const phuongXa = $("#phuongXaAdd").val();
    const donViCongTac = $("#donViCongTacAdd").val() ? $("#donViCongTacAdd").val().join(',') : '';
    const capBac = $("#capBacAdd").val();
    const namKinhNghiem = $("#namKinhNghiemAdd").val();
    //const soThe = $("#soTheAdd").val();
    //const ngayCap = $("#ngayCapAdd").val();
    //const coQuanCap = $("#coQuanCapAdd").val();
    //const thuTu = $("#thuTuAdd").val();
    const trangThai = $("input[name='trangThai']:checked").val() == 1 ? true : false;

    // Đa ngữ
    const ngonNguDich = $("#ngonNguDichAdd").val();
    const hoVaTen = $("#hoVaTenAdd").val();
    const diaChi = $("#diaChiAdd").val();
    const noiLamViec = $("#noiLamViecAdd").val();
    const moTa = ckeditormoTaDichAdd.getData();
    const ghiChu = ckeditorghiChuDichAdd.getData();

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
        CapBacID: capBac,
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
        AnhChanDung: avatarSelect
    };

    let formData = new FormData()
    formData.append('RequestTrongTai', JSON.stringify(dtChung))
    formData.append("File", fileAnhDaiDien)
    formData.append("RequestMonTheThao", JSON.stringify(tempTheThao))

    if (fileAnhDaiDien == null && avatarSelect == '') {
        showNotification(0, "Vui lòng chọn ảnh đại diện")
    }
    else if (checkEmptyBlank(maDinhDanh)) {
        showNotification(0, "Vui lòng nhập mã định danh (CCCD/Hộ chiếu)")
    }
    else if (checkTagHtmlSingle(maDinhDanh)) {
        showNotification(0, "Mã định danh (CCCD/Hộ chiếu) chứa ký tự không hợp lệ")
    }
    else if (checkUniqueIdentifier(maDinhDanh) > 0 && (maDinhDanhSelect == '' || !maDinhDanhSelect)) {
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
    else if (isValidPositiveIntegerAllowEmpty(namKinhNghiem)) {
        showNotification(0, "Năm kinh nghiệm không hợp lệ")
    }
    else if (checkEmptyBlank(hoVaTen)) {
        showNotification(0, "Vui lòng nhập họ và tên trọng tài/giám sát")
    }
    else if (checkTagHtmlSingle(hoVaTen)) {
        showNotification(0, "Họ và tên trọng tài/giám sát chứa ký tự không hợp lệ")
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
            url: `${baseUrl}/api/DM_CaNhan_TrongTaiApi/Add`,
            async: false,
            contentType: false,
            processData: false,
            data: formData,
            success: function (data) {
                if (data.isSuccess && data.value) {
                    showNotification(1, "Thêm mới trọng tài thành công");
                    console.log(data)
                    setTimeout(() => {
                        window.location.href = `${baseUrl}/AdminTool/NhanSu/TrongTai`;
                    }, 1500);
                } else {
                    showNotification(0, "Thêm mới trọng tài không thành công");
                    console.log(data.error)
                }
            },
            error: function (err) {
                console.log(err)
            }
        })
    }

}
//#endregion Function Thông tin trọng tài


//#region Function Xử lý bảng thể chất
function initTableTheThao() {
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
                    return `
                        <input type="checkbox" id="monChinhAdd" name="monChinh" ${hasMainSport() ? "disabled" : ""} ${row.monTheThaoChinh ? "" : "checked"}>
                    `;
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
        { data: "monTheThao", class: "left-align" },
        { data: "monTheThaoChinh", width: "180px", class: "left-align" },
        { data: null, width: "120px", class: "center-align group-icon-action" }
    ];

    const table = $('#tableTheThao').DataTable({
        data: tempTheThao,
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

    // Hàm sinh ra select (loại bỏ môn đã chọn rồi)
    function createSelectSport(selectedId = "") {
        let options = `<option value="">Chọn</option>`;
        listTheThao.forEach(s => {
            options += `<option value="${s.monTheThaoID}" ${s.monTheThaoID === selectedId ? "selected" : ""}>${s.tenMon}</option>`;
        });
        return `<select id="selectMonTheThao" class="form-control">${options}</select>`;
    }

    // === Thêm dòng mới ===
    let newRow = null;
    let originalRowData = null;
    $('#btnAddRow').on('click', function () {
        if (newRow) return;

        const rowData = {
            stt: table.rows().count() + 1,
            monTheThao: createSelectSport(),
            monTheThaoChinh: `<input type="checkbox" id="monChinhAdd" name="monChinh" ${hasMainSport() ? "disabled" : ""}>`,
            _isNew: true
        };

        newRow = table.row.add(rowData).draw(false).node();
        $(newRow).addClass('adding');
        initSelect2();
    });

    // === Lưu dòng mới hoặc chỉnh sửa ===
    $('#tableTheThao').on('click', '.btnSave', function () {
        let monTheThaoID = $('#selectMonTheThao').val();
        let monTheThaoText = $('#selectMonTheThao option:selected').text();
        let monTheThaoChinh = $('#monChinhAdd').is(':checked');

        if (!monTheThaoID) {
            showNotification(0, "Vui lòng chọn môn thể thao!");
            return;
        }

        // Cập nhật listTheThao (loại bỏ môn đã chọn)
        listTheThao = listTheThao.filter(s => s.monTheThaoID !== monTheThaoID);

        const rowData = {
            monTheThao: monTheThaoText,
            monTheThaoChinh: monTheThaoChinh ? "Có" : "Không",
            _isNew: false
        };

        const Data = {
            monTheThaoID: monTheThaoID,
            monTheThao: monTheThaoText,
            vaiTro: 5, // Trọng tài
            monTheThaoChinh: monTheThaoChinh
        };

        table.row('.adding').data(rowData).draw(false);

        // Nếu là edit thì replace, nếu là add thì push
        let idx = tempTheThao.findIndex(x => x.monTheThaoID === monTheThaoID);
        if (idx > -1) tempTheThao[idx] = Data;
        else tempTheThao.push(Data);

        // Đảm bảo chỉ có một monTheThaoChinh = true
        if (monTheThaoChinh) {
            tempTheThao.forEach(item => {
                if (item.monTheThaoID !== monTheThaoID) {
                    item.monTheThaoChinh = false;
                }
            });
        }

        console.log('Dữ liệu tạm thời:', tempTheThao);

        table.clear().rows.add(tempTheThao).draw();
        newRow = null;
    });

    // === Hủy thêm dòng ===
    $('#tableTheThao').on('click', '.btnCancel', function () {
        if (originalRowData) {
            // Nếu là edit, restore dữ liệu gốc
            table.row(newRow).data(originalRowData).draw(false);
            $(newRow).removeClass('adding');
            originalRowData = null;
        } else {
            // Nếu là add mới, remove dòng
            table.row('.adding').remove().draw(false);
        }
        newRow = null;
    });

    // === Chỉnh sửa dòng ===
    $('#tableTheThao').on('click', '.edit-monTheThao', function () {
        if (newRow) return; // đang có row mới thì không cho edit

        const rowNode = $(this).closest('tr');
        const rowData = table.row(rowNode).data();

        // Lưu lại dữ liệu gốc để restore khi cancel
        originalRowData = { ...rowData };

        // Add lại môn cũ vào list để chọn lại
        listTheThao.push({ monTheThaoID: rowData.monTheThaoID, tenMon: rowData.monTheThao });

        const editRowData = {
            monTheThao: createSelectSport(rowData.monTheThaoID),
            monTheThaoChinh: `<input type="checkbox" id="monChinhAdd" name="monChinh" ${(!rowData.monTheThaoChinh && hasMainSport()) ? "disabled" : ""} ${rowData.monTheThaoChinh ? "checked" : ""}>`,
            _isNew: true
        };

        table.row(rowNode).data(editRowData).draw(false);
        $(rowNode).addClass('adding');
        initSelect2();
        newRow = rowNode;
    });

    // === Xử lý checkbox monTheThaoChinh ===
    $('#tableTheThao').on('change', 'input[name="monChinh"]', function () {
        if ($(this).is(':checked')) {
            // Uncheck tất cả checkbox khác
            $('input[name="monChinh"]').not(this).prop('checked', false);
        }
    });

    // === Xóa dòng ===
    $('#tableTheThao').on('click', '.delete-monTheThao', function () {
        const index = $(this).data('index') - 1; // stt bắt đầu từ 1
        const rowData = tempTheThao[index];

        // Add lại môn vào listTheThao
        listTheThao.push({ monTheThaoID: rowData.monTheThaoID, tenMon: rowData.monTheThao });

        // Remove từ tempTheThao
        tempTheThao.splice(index, 1);

        // Re-render table
        table.clear().rows.add(tempTheThao).draw();
    });

    // === Xóa dòng existing (nếu có) ===
    $('#tableTheThao').on('click', '.delete-existing-monTheThao', function () {
        const id = $(this).data('id');
        // Giả sử gọi API xóa, nhưng vì đây là add, có lẽ không cần
        // Hoặc remove local nếu cần
        showNotification(0, "Chức năng xóa existing chưa được implement!");
    });

    // Hàm kiểm tra xem đã có môn chính chưa
    function hasMainSport() {
        return tempTheThao.some(x => x.monTheThaoChinh === true);
    }
}

function initListTheThao() {
    getDataWithApi('GET', '/api/TT_MonTheThaoApi/Gets?MaNgonNgu=vi').then(data => {
        if (data && data.isSuccess && data.value.length > 0) {
            listTheThao.push(...data.value);
        }
    })
    return listTheThao;
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

const checkUniqueIdentifier = (maDinhDanh) => {
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