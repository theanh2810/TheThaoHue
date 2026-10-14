const baseUrl = getRootLink();
const ckeditormoTaCoSo = CKEDITOR.replace('moTaCoSoAdd');
const ckeditortraiNghiemCoSo = CKEDITOR.replace('traiNghiemCoSoAdd');
const ckeditorgoiYCoSo = CKEDITOR.replace('goiYCoSoAdd');

$(document).ready(function () {
    initDatePicker();
    initDanhMucChung_NoAll(29, "#loaiCoSoAdd", "") // Loại cơ sở lưu trú
    initDanhMucChung_NoAll(49, "#phongCachCoSoAdd", "") // Phong cách cơ sở
    initNgonNgu("#ngonNguDichCoSoAdd")
    previewPicture()
    previewPictureSuKien()
    initSelect2();

    // Event handler cho thay đổi Ngôn ngữ
    $(document).on('change', '#ngonNguDichCoSoAdd', function () {
        $('#tenCoSoAdd').val('');
        $('#moTaCoSoAdd').val('');
        $('#nguoiDaiDienCoSoAdd').val('');
        $('#diaChiCoSoAdd').val('');
        $('#traiNghiemCoSoAdd').val('');
        $('#goiYCoSoAdd').val('');
    });

    $("#btnSaveAdd").on("click", function () {
        dataAddCoSoLuuTru();
    })

    // Khởi tạo bảng tiện nghi
    initTienNghiTable();
    initPhongTable();
    initNguoiLaoDongTable();

    //Auto format value price
    attachVNDFormatter("giaThapNhatCoSoAdd")
    attachVNDFormatter("giaCaoNhatCoSoAdd")
});

//#region Xử lý thông tin chung
function dataAddCoSoLuuTru() {
    // Thông tin chung
    const fileAnhDaiDien = $("#fileAnhDaiDienPrev")[0].files[0] || null;
    const diaDiemID = $("#DiaDiemCoSanAdd").val();
    const loaiCoSoID = $("#loaiCoSoAdd").val();
    const phongCachCoSoID = $("#phongCachCoSoAdd").val();
    const hangSao = parseInt($("#hangSaoCoSoAdd").val());
    const soLuongPhong = $("#soLuongPhongCoSoAdd").val();
    const soTang = $("#soTangCoSoAdd").val();
    const giaThapNhat = $("#giaThapNhatCoSoAdd").val();
    const giaCaoNhat = $("#giaCaoNhatCoSoAdd").val();
    const dienThoai = $("#dienThoaiCoSoAdd").val();
    const hopThu = $("#hopThuCoSoAdd").val();
    const lienKet = $("#lienKetCoSoAdd").val();
    const trangThai = $("input[name='trangThaiCoSoAdd']:checked").val() == 1 ? true : false;

    // Đa ngữ
    const maNgonNgu = $("#ngonNguDichCoSoAdd").val();
    const tenCoSo = $("#tenCoSoAdd").val();
    const moTa = ckeditormoTaCoSo.getData();
    const nguoiDaiDien = $("#nguoiDaiDienCoSoAdd").val();
    const diaChi = $("#diaChiCoSoAdd").val();
    const traiNghiem = ckeditortraiNghiemCoSo.getData();
    const goiY = ckeditorgoiYCoSo.getData();

    // Tiện nghi
    const tienNghiList = getTienNghiList();
    const PhongList = getPhongList();
    const NguoiLaoDongList = getNguoiLaoDongList();

    const dtCoSo = {
        DiaDiemID: diaDiemID || null,
        LoaiCoSoID: loaiCoSoID || null,
        PhongCachCoSoID: phongCachCoSoID || null,
        HangSao: hangSao || null,
        SoLuongPhong: soLuongPhong || null,
        SoTang: soTang || null,
        GiaThapNhat: giaThapNhat ? getNumericValue(giaThapNhat) : null,
        GiaCaoNhat: giaCaoNhat ? getNumericValue(giaCaoNhat) : null,
        DienThoai: dienThoai || null,
        HopThu: hopThu || null,
        LienKet: lienKet || null,
        TrangThai: trangThai,
        MaNgonNgu: maNgonNgu,
        TenCoSo: tenCoSo,
        MoTa: moTa,
        NguoiDaiDien: nguoiDaiDien,
        DiaChi: diaChi,
        TraiNghiem: traiNghiem,
        GoiY: goiY
    };

    // Tiện nghi
    const dtTienNghi = tienNghiList;
    const dtPhong = PhongList;
    const dtNguoiLaoDong = NguoiLaoDongList;

    // Tài liệu truyền thông
    const requestDaPhuongTien = createRequestDaPhuongTiens();

    // Văn bản tài liệu
    const requestVBTL = createRequestVBTLCoSo();



    let formData = new FormData();
    formData.append('RequestCoSoLuuTru', JSON.stringify(dtCoSo));
    formData.append('RequestTienNghi', JSON.stringify(dtTienNghi));
    formData.append('RequestPhong', JSON.stringify(dtPhong));
    formData.append('RequestNguoiLaoDong', JSON.stringify(dtNguoiLaoDong));
    formData.append("File", fileAnhDaiDien);
    //formData.append('RequestVBTL', requestInfo.RequestVBTL);

    // Thêm tài liệu truyền thông
    for (let i = 0; i < requestDaPhuongTien.length; i++) {
        formData.append(`EntityDaPhuongTien[${i}].DaPhuongTien`, JSON.stringify(requestDaPhuongTien[i].DaPhuongTien));
        formData.append(`EntityDaPhuongTien[${i}].DaPhuongTien_NoiDung`, JSON.stringify(requestDaPhuongTien[i].DaPhuongTien_NoiDung));
        formData.append(`EntityDaPhuongTien[${i}].File`, requestDaPhuongTien[i].File[0]);
    }

    // Thêm văn bản tài liệu
    for (let i = 0; i < requestVBTL.length; i++) {
        formData.append(`EntityVanBan[${i}].RequestVanBan`, JSON.stringify(requestVBTL[i].RequestVanBan));
        formData.append(`EntityVanBan[${i}].File`, requestVBTL[i].File[0]);
    }

    //if (diaDiemID == null || diaDiemID == "") {
    //    showNotification(0, "Vui lòng chọn địa điểm");
    //    return;
    //}

    if (fileAnhDaiDien == null) {
        showNotification(0, "Vui lòng chọn ảnh đại diện")
    }
    else if (checkEmptyBlank(loaiCoSoID)) {
        showNotification(0, "Vui lòng chọn loại cơ sở")
    }
    else if (isValidPositiveIntegerAllowEmpty(soLuongPhong) || soLuongPhong >= 255) {
        showNotification(0, "Số lượng phòng không hợp lệ")
    }
    else if (isValidPositiveIntegerAllowEmpty(soTang) || soTang >= 255) {
        showNotification(0, "Số tầng không hợp lệ")
    }
    else if (isInvalidPriceRange(giaThapNhat, giaCaoNhat)) {
        showNotification(0, "Giá cao nhất phải lớn hơn giá thấp nhất")
    }
    else if (checkTagHtmlSingle(hopThu)) {
        showNotification(0, "Hộp thư chứa ký tự không hợp lệ")
    }
    else if (isValidEmailAllowEmpty(hopThu)) {
        showNotification(0, "Hộp thư không hợp lệ")
    }
    else if (checkTagHtmlSingle(lienKet)) {
        showNotification(0, "Liên kết chứa ký tự không hợp lệ")
    }
    else if (isValidUrlAllowEmpty(lienKet)) {
        showNotification(0, "Liên kết không hợp lệ")
    }
    else if (checkEmptyBlank(tenCoSo)) {
        showNotification(0, "Vui lòng nhập tên cơ sở lưu trú")
    }
    else if (checkTagHtmlSingle(tenCoSo)) {
        showNotification(0, "Tên cơ sở lưu trú chứa ký tự không hợp lệ")
    }
    else if (checkTagHtmlSingle(nguoiDaiDien)) {
        showNotification(0, "Người đại diện chứa ký tự không hợp lệ")
    }
    else if (checkTagHtmlSingle(diaChi)) {
        showNotification(0, "Địa chỉ chứa ký tự không hợp lệ")
    }
    else if (diaDiemID == null || diaDiemID == "") {
        showNotification(0, "Vui lòng chọn địa điểm");
    }

    else {
        $.ajax({
            type: 'POST',
            url: `${baseUrl}/api/DL_CoSoLuuTruApi/Add`,
            async: false,
            contentType: false,
            processData: false,
            data: formData,
            success: function (data) {
                if (data.isSuccess && data.value) {
                    showNotification(1, "Thêm mới cơ sở lưu trú thành công");
                    // Redirect hoặc reset form
                    setTimeout(function () {
                        window.location.href = `${baseUrl}/AdminTool/CoSoLuuTru`;
                    }, 2000);
                } else {
                    showNotification(0, "Thêm mới cơ sở lưu trú không thành công");
                    console.log(data.error);
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
    }



}
//#endregion Xử lý thông tin chung

//#region Xử lý tiện nghi
let tempTienNghi = [];
let allTienNghi = [];
let editingRowNodeTienNghi = null;
let editingOldIDTienNghi = null;
let originalRowDataTienNghi = null;
let tableTienNghi = null;

function initTienNghiTable() {
    initListTienNghi();
    tempTienNghi = [];

    // Nếu table đã tồn tại, destroy để recreate
    if ($.fn.DataTable.isDataTable('#tableTienNghiCoSo')) {
        $('#tableTienNghiCoSo').DataTable().clear().destroy();
    }

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
                    return `<input type="checkbox" id="mienPhiAdd" name="mienPhi" ${row.MienPhi ? "checked" : ""}>`;
                } else {
                    return row.MienPhi ? `<span class="TrangThai green-text">Có</span>` : `<span class="TrangThai red-text">Không</span>`;
                }
            }
        },
        {
            targets: 3,
            render: function (data, type, row, meta) {
                if (row._isNew) {
                    return `
                        <button type="button" class="btnSaveTienNghi hgi-icon hgi-check"></button>
                        <button type="button" class="btnCancelTienNghi hgi-icon hgi-cancel"></button>
                    `;
                }
                const editIcon = `<i class="edit-tien-nghi cursor-pointer me-2" data-row-index="${meta.row}"><i class="hgi-icon hgi-edit"></i></i>`;
                const deleteIcon = `<i class="delete-tien-nghi cursor-pointer text-danger" data-row-index="${meta.row}"><i class="hgi-icon hgi-delete"></i></i>`;
                return editIcon + deleteIcon;
            }
        }
    ];

    const tableCols = [
        { data: null, width: "40px", class: "center-align" },
        { data: "TenTienNghi", class: "left-align" },
        { data: "MienPhi", width: "180px", class: "left-align" },
        { data: null, width: "180px", class: "center-align group-icon-action" }
    ];

    tableTienNghi = $('#tableTienNghiCoSo').DataTable({
        data: tempTienNghi,
        columns: tableCols,
        columnDefs: tableDefs,
        paging: false,
        searching: false,
        info: false,
        ordering: false,
        autoWidth: false,
        responsive: true,
        language: {
            emptyTable: "Chưa có tiện nghi nào"
        }
    });

    // Sinh select tiện nghi, loại bỏ những mục đã có trong tempTienNghi, cho phép chọn lại selectedId khi edit
    function createSelectTienNghi(selectedId = "") {
        let options = `<option value="">Chọn</option>`;
        const chosenIDs = tempTienNghi.map(x => x.TienNghiID).filter(id => id !== selectedId);
        allTienNghi.forEach(t => {
            if (!chosenIDs.includes(t.danhMucID) || t.danhMucID === selectedId) {
                options += `<option value="${t.danhMucID}" ${t.danhMucID === selectedId ? "selected" : ""}>${t.tenDanhMuc}</option>`;
            }
        });
        return `<select id="selectTienNghi" class="form-control">${options}</select>`;
    }

    // === Thêm dòng mới ===
    let newRowTienNghi = null;
    $('#btnAddTienNghiCoSo').on('click', function () {
        if (editingRowNodeTienNghi) return;
        const rowData = {
            stt: tableTienNghi.rows().count() + 1,
            TenTienNghi: createSelectTienNghi(),
            MienPhi: `<input type="checkbox" id="mienPhiAdd" name="mienPhi">`,
            _isNew: true
        };
        newRowTienNghi = tableTienNghi.row.add(rowData).draw(false).node();
        $(newRowTienNghi).addClass('adding');
        editingRowNodeTienNghi = $(newRowTienNghi);
        editingOldIDTienNghi = null;
        originalRowDataTienNghi = null;
        initSelect2();
    });

    // === Lưu dòng mới hoặc chỉnh sửa ===
    $('#tableTienNghiCoSo').off('click', '.btnSaveTienNghi').on('click', '.btnSaveTienNghi', function () {
        let $select = editingRowNodeTienNghi ? editingRowNodeTienNghi.find('#selectTienNghi') : $('#selectTienNghi');
        if ($select.length === 0) {
            showNotification(0, "Không tìm thấy select để lưu.");
            return;
        }
        let danhMucID = $select.val();
        let tenDanhMuc = $select.find('option:selected').text();
        let MienPhi = $('#mienPhiAdd').is(':checked');
        if (!danhMucID) {
            showNotification(0, "Vui lòng chọn tiện nghi!");
            return;
        }
        const rowData = {
            TenTienNghi: tenDanhMuc,
            MienPhi: MienPhi ? "Có" : "Không",
            TienNghiID: parseInt(danhMucID),
            _isNew: false
        };
        const Data = {
            TienNghiID: parseInt(danhMucID),
            TenTienNghi: tenDanhMuc,
            MienPhi: MienPhi,
            TrangThai: true
        };
        if (editingOldIDTienNghi) {
            tempTienNghi = tempTienNghi.filter(x => x.TienNghiID !== editingOldIDTienNghi);
        }
        let idx = tempTienNghi.findIndex(x => x.TienNghiID === parseInt(danhMucID));
        if (idx > -1) tempTienNghi[idx] = Data;
        else tempTienNghi.push(Data);
        tableTienNghi.clear().rows.add(tempTienNghi).draw();
        editingRowNodeTienNghi = null;
        editingOldIDTienNghi = null;
        originalRowDataTienNghi = null;
        newRowTienNghi = null;
    });

    // === Hủy thêm dòng ===
    $('#tableTienNghiCoSo').off('click', '.btnCancelTienNghi').on('click', '.btnCancelTienNghi', function () {
        if (!editingRowNodeTienNghi) {
            editingRowNodeTienNghi = $('#tableTienNghiCoSo').find('tr.adding');
        }
        if (originalRowDataTienNghi && editingRowNodeTienNghi && originalRowDataTienNghi.TenTienNghi) {
            tableTienNghi.row(editingRowNodeTienNghi).data(originalRowDataTienNghi).draw(false);
        } else {
            tableTienNghi.row('.adding').remove().draw(false);
        }
        editingRowNodeTienNghi = null;
        editingOldIDTienNghi = null;
        originalRowDataTienNghi = null;
        newRowTienNghi = null;
    });

    // === Chỉnh sửa dòng ===
    $('#tableTienNghiCoSo').on('click', '.edit-tien-nghi', function () {
        if (editingRowNodeTienNghi) return;
        const rowNode = $(this).closest('tr');
        const rowData = tableTienNghi.row(rowNode).data();
        originalRowDataTienNghi = { ...rowData };
        editingOldIDTienNghi = rowData.TienNghiID || rowData.danhMucID || null;
        const editRowData = {
            TenTienNghi: createSelectTienNghi(rowData.TienNghiID),
            MienPhi: `<input type="checkbox" id="mienPhiAdd" name="mienPhi" ${rowData.MienPhi === "Có" ? "checked" : ""}>`,
            _isNew: true
        };
        tableTienNghi.row(rowNode).data(editRowData).draw(false);
        $(rowNode).addClass('adding');
        editingRowNodeTienNghi = $(rowNode);
        initSelect2();
        newRowTienNghi = rowNode;
    });

    // === Xóa dòng ===
    $('#tableTienNghiCoSo').on('click', '.delete-tien-nghi', function () {
        const rowNode = $(this).closest('tr');
        const rowData = tableTienNghi.row(rowNode).data();
        const idToRemove = rowData.TienNghiID || rowData.danhMucID;
        tempTienNghi = tempTienNghi.filter(x => x.TienNghiID !== idToRemove);
        tableTienNghi.clear().rows.add(tempTienNghi).draw();
    });
}

function initListTienNghi() {
    allTienNghi = [];
    let data = JSON.stringify({ loaiDanhMucID: 46, trangThai: true });
    getDataWithApi('POST', '/api/DanhMucChungApi/DanhSach', data).then(res => {
        if (res && res.isSuccess && res.value && res.value.length > 0) {
            allTienNghi = res.value;
        }
    });
}

function getTienNghiList() {
    return tempTienNghi;
}
//#endregion Xử lý tiện nghi

//#region Xử lý thông tin phòng
let tempPhong = [];
let allPhong = [];
let editingRowNodePhong = null;
let editingOldIDPhong = null;
let originalRowDataPhong = null;
let tablePhong = null;

function initPhongTable() {
    initListPhong();
    tempPhong = [];
    if ($.fn.DataTable.isDataTable('#tablePhongCoSo')) {
        $('#tablePhongCoSo').DataTable().clear().destroy();
    }
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
                    return `<input type="text" id="soLuongPhongAdd" name="soLuongPhongAdd" class="form-control" value="1" />`;
                } else {
                    return row.SoLuong;
                }
            }
        },
        {
            targets: 3,
            render: function (data, type, row, meta) {
                if (row._isNew) {
                    return `
                        <button type="button" class="btnSavePhong hgi-icon hgi-check"></button>
                        <button type="button" class="btnCancelPhong hgi-icon hgi-cancel"></button>
                    `;
                }
                const editIcon = `<i class="edit-phong cursor-pointer me-2" data-row-index="${meta.row}"><i class="hgi-icon hgi-edit"></i></i>`;
                const deleteIcon = `<i class="delete-phong cursor-pointer text-danger" data-row-index="${meta.row}"><i class="hgi-icon hgi-delete"></i></i>`;
                return editIcon + deleteIcon;
            }
        }
    ];
    const tableCols = [
        { data: null, width: "40px", class: "center-align" },
        { data: "TenPhong", class: "left-align" },
        { data: "SoLuong", width: "180px", class: "left-align" },
        { data: null, width: "180px", class: "center-align group-icon-action" }
    ];
    tablePhong = $('#tablePhongCoSo').DataTable({
        data: tempPhong,
        columns: tableCols,
        columnDefs: tableDefs,
        paging: false,
        searching: false,
        info: false,
        ordering: false,
        autoWidth: false,
        responsive: true,
        language: {
            emptyTable: "Chưa có phòng nào"
        }
    });
    function createSelectPhong(selectedId = "") {
        let options = `<option value="">Chọn</option>`;
        const chosenIDs = tempPhong.map(x => x.LoaiPhongID).filter(id => id !== selectedId);
        allPhong.forEach(t => {
            if (!chosenIDs.includes(t.danhMucID) || t.danhMucID === selectedId) {
                options += `<option value="${t.danhMucID}" ${t.danhMucID === selectedId ? "selected" : ""}>${t.tenDanhMuc}</option>`;
            }
        });
        return `<select id="selectPhong" class="form-control">${options}</select>`;
    }
    let newRowPhong = null;
    $('#btnAddPhongCoSo').on('click', function () {
        if (editingRowNodePhong) return;
        const rowData = {
            stt: tablePhong.rows().count() + 1,
            TenPhong: createSelectPhong(),
            SoLuong: `<input type="text" id="soLuongPhongAdd" name="soLuongPhongAdd" class="form-control" />`,
            _isNew: true
        };
        newRowPhong = tablePhong.row.add(rowData).draw(false).node();
        $(newRowPhong).addClass('adding');
        editingRowNodePhong = $(newRowPhong);
        editingOldIDPhong = null;
        originalRowDataPhong = null;
        initSelect2();
    });
    $('#tablePhongCoSo').off('click', '.btnSavePhong').on('click', '.btnSavePhong', function () {
        let $select = editingRowNodePhong ? editingRowNodePhong.find('#selectPhong') : $('#selectPhong');
        if ($select.length === 0) {
            showNotification(0, "Không tìm thấy select để lưu.");
            return;
        }
        let danhMucID = $select.val();
        let tenDanhMuc = $select.find('option:selected').text();
        let SoLuong = $('#soLuongPhongAdd').val();
        if (!danhMucID) {
            showNotification(0, "Vui lòng chọn phòng!");
            return;
        }
        const rowData = {
            TenPhong: tenDanhMuc,
            SoLuong: SoLuong,
            LoaiPhongID: parseInt(danhMucID),
            _isNew: false
        };
        const Data = {
            LoaiPhongID: parseInt(danhMucID),
            TenPhong: tenDanhMuc,
            SoLuong: SoLuong
        };
        if (editingOldIDPhong) {
            tempPhong = tempPhong.filter(x => x.LoaiPhongID !== editingOldIDPhong);
        }
        let idx = tempPhong.findIndex(x => x.LoaiPhongID === parseInt(danhMucID));
        if (idx > -1) tempPhong[idx] = Data;
        else tempPhong.push(Data);
        tablePhong.clear().rows.add(tempPhong).draw();
        editingRowNodePhong = null;
        editingOldIDPhong = null;
        originalRowDataPhong = null;
        newRowPhong = null;

        if (tempPhong.length > 0) {
            let countPhong = 0
            tempPhong.map(item => {
                countPhong = countPhong + Number(item.SoLuong)
            })

            $("#soLuongPhongCoSoAdd").val(countPhong)
            console.log(countPhong)
        }

    });
    $('#tablePhongCoSo').off('click', '.btnCancelPhong').on('click', '.btnCancelPhong', function () {
        if (!editingRowNodePhong) {
            editingRowNodePhong = $('#tablePhongCoSo').find('tr.adding');
        }
        if (originalRowDataPhong && editingRowNodePhong && originalRowDataPhong.TenPhong) {
            tablePhong.row(editingRowNodePhong).data(originalRowDataPhong).draw(false);
        } else {
            tablePhong.row('.adding').remove().draw(false);
        }
        editingRowNodePhong = null;
        editingOldIDPhong = null;
        originalRowDataPhong = null;
        newRowPhong = null;
    });
    $('#tablePhongCoSo').on('click', '.edit-phong', function () {
        if (editingRowNodePhong) return;
        const rowNode = $(this).closest('tr');
        const rowData = tablePhong.row(rowNode).data();
        originalRowDataPhong = { ...rowData };
        editingOldIDPhong = rowData.LoaiPhongID || rowData.danhMucID || null;
        console.log(rowData)
        const editRowData = {
            TenPhong: createSelectPhong(rowData.LoaiPhongID),
            SoLuong: `<input type="text" id="soLuongPhongAdd" name="soLuongPhongAdd" class="form-control" value="${rowData.SoLuong}" />`,
            _isNew: true
        };
        tablePhong.row(rowNode).data(editRowData).draw(false);
        $(rowNode).addClass('adding');
        editingRowNodePhong = $(rowNode);
        initSelect2();
        newRowPhong = rowNode;
    });
    $('#tablePhongCoSo').on('click', '.delete-phong', function () {
        const rowNode = $(this).closest('tr');
        const rowData = tablePhong.row(rowNode).data();
        const idToRemove = rowData.LoaiPhongID || rowData.danhMucID;
        tempPhong = tempPhong.filter(x => x.LoaiPhongID !== idToRemove);
        tablePhong.clear().rows.add(tempPhong).draw();

        if (tempPhong.length > 0) {
            let countPhong = 0
            tempPhong.map(item => {
                countPhong = countPhong + Number(item.SoLuong)
            })

            $("#soLuongPhongCoSoAdd").val(countPhong)
            console.log(countPhong)
        }

    });

}
function initListPhong() {
    allPhong = [];
    let data = JSON.stringify({ loaiDanhMucID: 55, trangThai: true });
    getDataWithApi('POST', '/api/DanhMucChungApi/DanhSach', data).then(res => {
        if (res && res.isSuccess && res.value && res.value.length > 0) {
            allPhong = res.value;
        }
    });
}
function getPhongList() {
    return tempPhong;
}
//#endregion Xử lý phòng

//#region Xử lý thông tin người lao động
let tempNguoiLaoDong = [];
let allNguoiLaoDong = [];
let editingRowNodeNguoiLaoDong = null;
let editingOldIDNguoiLaoDong = null;
let originalRowDataNguoiLaoDong = null;
let tableNguoiLaoDong = null;

function initNguoiLaoDongTable() {
    initListNguoiLaoDong();
    tempNguoiLaoDong = [];
    if ($.fn.DataTable.isDataTable('#tableNguoiLaoDongCoSo')) {
        $('#tableNguoiLaoDongCoSo').DataTable().clear().destroy();
    }
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
                    return `<input type="text" id="soLuongNguoiLaoDongAdd" name="soLuongNguoiLaoDongAdd" class="form-control" value="1" />`;
                } else {
                    return row.SoLuong;
                }
            }
        },
        {
            targets: 3,
            render: function (data, type, row, meta) {
                if (row._isNew) {
                    return `
                        <button type="button" class="btnSaveNguoiLaoDong hgi-icon hgi-check"></button>
                        <button type="button" class="btnCancelNguoiLaoDong hgi-icon hgi-cancel"></button>
                    `;
                }
                const editIcon = `<i class="edit-nguoi-lao-dong cursor-pointer me-2" data-row-index="${meta.row}"><i class="hgi-icon hgi-edit"></i></i>`;
                const deleteIcon = `<i class="delete-nguoi-lao-dong cursor-pointer text-danger" data-row-index="${meta.row}"><i class="hgi-icon hgi-delete"></i></i>`;
                return editIcon + deleteIcon;
            }
        }
    ];
    const tableCols = [
        { data: null, width: "40px", class: "center-align" },
        { data: "TenNguoiLaoDong", class: "left-align" },
        { data: "SoLuong", width: "180px", class: "left-align" },
        { data: null, width: "180px", class: "center-align group-icon-action" }
    ];
    tableNguoiLaoDong = $('#tableNguoiLaoDongCoSo').DataTable({
        data: tempNguoiLaoDong,
        columns: tableCols,
        columnDefs: tableDefs,
        paging: false,
        searching: false,
        info: false,
        ordering: false,
        autoWidth: false,
        responsive: true,
        language: {
            emptyTable: "Chưa có tiện nghi nào"
        }
    });
    function createSelectNguoiLaoDong(selectedId = "") {
        let options = `<option value="">Chọn</option>`;
        const chosenIDs = tempNguoiLaoDong.map(x => x.LoaiLaoDongID).filter(id => id !== selectedId);
        allNguoiLaoDong.forEach(t => {
            if (!chosenIDs.includes(t.danhMucID) || t.danhMucID === selectedId) {
                options += `<option value="${t.danhMucID}" ${t.danhMucID === selectedId ? "selected" : ""}>${t.tenDanhMuc}</option>`;
            }
        });
        return `<select id="selectNguoiLaoDong" class="form-control">${options}</select>`;
    }
    let newRowNguoiLaoDong = null;
    $('#btnAddNguoiLaoDongCoSo').on('click', function () {
        if (editingRowNodeNguoiLaoDong) return;
        const rowData = {
            stt: tableNguoiLaoDong.rows().count() + 1,
            TenNguoiLaoDong: createSelectNguoiLaoDong(),
            SoLuong: `<input type="text" id="soLuongNguoiLaoDongAdd" name="soLuongNguoiLaoDongAdd" class="form-control" value="1" />`,
            _isNew: true
        };
        newRowNguoiLaoDong = tableNguoiLaoDong.row.add(rowData).draw(false).node();
        $(newRowNguoiLaoDong).addClass('adding');
        editingRowNodeNguoiLaoDong = $(newRowNguoiLaoDong);
        editingOldIDNguoiLaoDong = null;
        originalRowDataNguoiLaoDong = null;
        initSelect2();
    });
    $('#tableNguoiLaoDongCoSo').off('click', '.btnSaveNguoiLaoDong').on('click', '.btnSaveNguoiLaoDong', function () {
        let $select = editingRowNodeNguoiLaoDong ? editingRowNodeNguoiLaoDong.find('#selectNguoiLaoDong') : $('#selectNguoiLaoDong');
        if ($select.length === 0) {
            showNotification(0, "Không tìm thấy select để lưu.");
            return;
        }
        let danhMucID = $select.val();
        let tenDanhMuc = $select.find('option:selected').text();
        let SoLuong = $('#soLuongNguoiLaoDongAdd').val();
        if (!danhMucID) {
            showNotification(0, "Vui lòng chọn loại lao động!");
            return;
        }
        const rowData = {
            TenNguoiLaoDong: tenDanhMuc,
            SoLuong: SoLuong,
            LoaiLaoDongID: parseInt(danhMucID),
            _isNew: false
        };
        const Data = {
            LoaiLaoDongID: parseInt(danhMucID),
            TenNguoiLaoDong: tenDanhMuc,
            SoLuong: SoLuong
        };
        if (editingOldIDNguoiLaoDong) {
            tempNguoiLaoDong = tempNguoiLaoDong.filter(x => x.LoaiLaoDongID !== editingOldIDNguoiLaoDong);
        }
        let idx = tempNguoiLaoDong.findIndex(x => x.LoaiLaoDongID === parseInt(danhMucID));
        if (idx > -1) tempNguoiLaoDong[idx] = Data;
        else tempNguoiLaoDong.push(Data);
        tableNguoiLaoDong.clear().rows.add(tempNguoiLaoDong).draw();
        editingRowNodeNguoiLaoDong = null;
        editingOldIDNguoiLaoDong = null;
        originalRowDataNguoiLaoDong = null;
        newRowNguoiLaoDong = null;
    });
    $('#tableNguoiLaoDongCoSo').off('click', '.btnCancelNguoiLaoDong').on('click', '.btnCancelNguoiLaoDong', function () {
        if (!editingRowNodeNguoiLaoDong) {
            editingRowNodeNguoiLaoDong = $('#tableNguoiLaoDongCoSo').find('tr.adding');
        }
        if (originalRowDataNguoiLaoDong && editingRowNodeNguoiLaoDong && originalRowDataNguoiLaoDong.TenNguoiLaoDong) {
            tableNguoiLaoDong.row(editingRowNodeNguoiLaoDong).data(originalRowDataNguoiLaoDong).draw(false);
        } else {
            tableNguoiLaoDong.row('.adding').remove().draw(false);
        }
        editingRowNodeNguoiLaoDong = null;
        editingOldIDNguoiLaoDong = null;
        originalRowDataNguoiLaoDong = null;
        newRowNguoiLaoDong = null;
    });
    $('#tableNguoiLaoDongCoSo').on('click', '.edit-nguoi-lao-dong', function () {
        if (editingRowNodeNguoiLaoDong) return;
        const rowNode = $(this).closest('tr');
        const rowData = tableNguoiLaoDong.row(rowNode).data();
        originalRowDataNguoiLaoDong = { ...rowData };
        editingOldIDNguoiLaoDong = rowData.LoaiLaoDongID || rowData.danhMucID || null;
        const editRowData = {
            TenNguoiLaoDong: createSelectNguoiLaoDong(rowData.LoaiLaoDongID),
            SoLuong: `<input type="text" id="soLuongNguoiLaoDongAdd" name="soLuongNguoiLaoDongAdd" class="form-control" value="${rowData.SoLuong}" />`,
            _isNew: true
        };
        tableNguoiLaoDong.row(rowNode).data(editRowData).draw(false);
        $(rowNode).addClass('adding');
        editingRowNodeNguoiLaoDong = $(rowNode);
        initSelect2();
        newRowNguoiLaoDong = rowNode;
    });
    $('#tableNguoiLaoDongCoSo').on('click', '.delete-nguoi-lao-dong', function () {
        const rowNode = $(this).closest('tr');
        const rowData = tableNguoiLaoDong.row(rowNode).data();
        const idToRemove = rowData.LoaiLaoDongID || rowData.danhMucID;
        tempNguoiLaoDong = tempNguoiLaoDong.filter(x => x.LoaiLaoDongID !== idToRemove);
        tableNguoiLaoDong.clear().rows.add(tempNguoiLaoDong).draw();
    });
}
function initListNguoiLaoDong() {
    allNguoiLaoDong = [];
    let data = JSON.stringify({ loaiDanhMucID: 32, trangThai: true });
    getDataWithApi('POST', '/api/DanhMucChungApi/DanhSach', data).then(res => {
        if (res && res.isSuccess && res.value && res.value.length > 0) {
            allNguoiLaoDong = res.value;
        }
    });
}

function getNguoiLaoDongList() {
    return tempNguoiLaoDong;
}
//#endregion Xử lý tiện nghi

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

//#endregion function validation


//#region auto format value price
const formatVND = (value) => {
    if (!value) return "";
    // Loại bỏ mọi ký tự không phải số
    const number = value.replace(/\D/g, "");
    if (number === "") return "";
    // Định dạng theo kiểu Việt Nam
    return new Intl.NumberFormat("vi-VN").format(number);
}

const attachVNDFormatter = (inputId) => {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.addEventListener("input", () => {
        const cursorPos = input.selectionStart;
        const oldLength = input.value.length;

        input.value = formatVND(input.value);

        // Cập nhật lại vị trí con trỏ tương đối sau khi format
        const newLength = input.value.length;
        input.selectionEnd = cursorPos + (newLength - oldLength);
    });
}

const getNumericValue = (value) => {
    if (!value || value.trim() === "") return null;
    return parseInt(value.replace(/\./g, ""), 10);
};
//#endregion auto format value price
