const baseUrl = getRootLink();
const ckeditormoTaCoSoEdit = CKEDITOR.replace('moTaCoSoEdit');
const ckeditortraiNghiemCoSoEdit = CKEDITOR.replace('traiNghiemCoSoEdit');
const ckeditorgoiYCoSoEdit = CKEDITOR.replace('goiYCoSoEdit');

let listTienNghi = [];
let listPhong = [];
let listNguoiLaoDong = [];

$(document).ready(function () {
    //#region Xử lý các function chung
    initDatePicker();
    initDanhMucChung_NoAll(29, "#loaiCoSoEdit", "") // Loại cơ sở lưu trú
    initDanhMucChung_NoAll(49, "#phongCachCoSoEdit", "") // Phong cách cơ sở
    initNgonNgu("#ngonNguDichCoSoEdit")
    previewPicture()
    previewPictureSuKien()
    initSelect2();
    
    $('#tinhThanhPhoAdd').on('change', function () {
        let tinhID = $(this).val();
        initPhuongXa(tinhID)
    })

    // Event handler cho thay đổi Ngôn ngữ
    $(document).on('change', '#ngonNguDichCoSoEdit', function() {
        let maNgonNgu = $(this).val();
        if (CoSoLuuTruId && maNgonNgu) {
            loadTranslation(CoSoLuuTruId, maNgonNgu);
        } else {
            $('#tenCoSoEdit').val('');
            $('#moTaCoSoEdit').val('');
            $('#nguoiDaiDienCoSoEdit').val('');
            $('#diaChiCoSoEdit').val('');
            $('#traiNghiemCoSoEdit').val('');
            $('#goiYCoSoEdit').val('');
        }
    });

    $("#btnSaveEdit").on("click", function () {
        dataEditCoSoLuuTru();
    })

    // Khởi tạo bảng tiện nghi
    initTableTienNghi(CoSoLuuTruId);
    initTablePhong(CoSoLuuTruId);
    initTableNguoiLaoDong(CoSoLuuTruId);
    

    //Auto format value price
    attachVNDFormatter("giaThapNhatCoSoEdit")
    attachVNDFormatter("giaCaoNhatCoSoEdit")
    setTimeout(() => {
        loadData(CoSoLuuTruId)
    }, 300);

    $("#buttonDelete").on("click", function() {
        let type = $("#idTypeDelete").val();
        if (type === 'media') {
            deleteDaPhuongTien();
        } else if (type === 'vanban') {
            dataDeleteVBTL();
        } else if (type === 'phong') {
            dataDeletePhongCoSo();
        } else if (type === 'laodong') {
            dataDeleteLaoDongCoSo();
        } else if (type === 'tiennghi') {
            dataDeleteTienNghi();
        }
    })
});

//#region Xử lý thông tin chung
function loadData(id) {
    getDataWithApi('GET', `/api/DL_CoSoLuuTruApi/Get?MaNgonNgu=vi&CoSoLuuTruID=${id}`).then(data => {
        if (data && data.isSuccess && data.value) {
            const item = data.value;
            console.log('Dữ liệu cơ sở lưu trú:', item);
            let title = `Thông tin ${item.tenCoSo}`;
            let htmlTitle = ``;
            if (item.tenCoSo) {
                htmlTitle = `<div class='mainTitle'>Chỉnh sửa ${item.tenCoSo}</div>`;
            }
            $('.TieuDe h2').html(htmlTitle);
            document.title = title;
            if (item.anhDaiDien) {
                $("#showhinhAnhAdd").attr("src", item.anhDaiDien);
            }
            $("#diaDiemCoSoEdit").val(item.diaDiemID || '').trigger('change');
            $("#loaiCoSoEdit").val(item.loaiCoSoID || '').trigger('change');
            $("#phongCachCoSoEdit").val(item.phongCachCoSoID || '').trigger('change');
            $("#hangSaoCoSoEdit").val(item.hangSao || '').trigger('change');
            $("#soLuongPhongCoSoEdit").val(item.soLuongPhong || '');
            $("#soTangCoSoEdit").val(item.soTang || '');
            //$("#giaThapNhatCoSoEdit").val(item.giaThapNhat || '');
            //$("#giaCaoNhatCoSoEdit").val(item.giaCaoNhat || '');
            $("#dienThoaiCoSoEdit").val(item.dienThoai || '');
            $("#hopThuCoSoEdit").val(item.hopThu || '');
            $("#lienKetCoSoEdit").val(item.lienKet || '');
            $("#DiaDiemCoSanAdd").val(item.diaDiemID).trigger('change');
            $("#showAnhDaiDienAdd").attr("src", item.anhDaiDien || '/assets/images/vector/Addimage.png');
            $("#showAnhDaiDienDetail").val(item.anhDaiDien || '');
            if (item.trangThai) {
                $("input[name='trangThaiCoSoEdit'][value='1']").prop('checked', true);
            } else {
                $("input[name='trangThaiCoSoEdit'][value='0']").prop('checked', true);
            }
            $("#ngonNguDichCoSoEdit").val(item.maNgonNgu || '').trigger('change');
            $("#tenCoSoEdit").val(item.tenCoSo || '');
            $("#nguoiDaiDienCoSoEdit").val(item.nguoiDaiDien || '');
            $("#diaChiCoSoEdit").val(item.diaChi || '');
            if (typeof ckeditormoTaCoSoEdit !== 'undefined') ckeditormoTaCoSoEdit.setData(item.moTa || '');
            if (typeof ckeditortraiNghiemCoSoEdit !== 'undefined') ckeditortraiNghiemCoSoEdit.setData(item.traiNghiem || '');
            if (typeof ckeditorgoiYCoSoEdit !== 'undefined') ckeditorgoiYCoSoEdit.setData(item.goiY || '');
            loadDataTotalCountPhong(id)
            //Auto format value price
            // Giả sử item.giaThapNhat = 4500000
            $("#giaThapNhatCoSoEdit").val(formatVND(item.giaThapNhat || ''));
            $("#giaCaoNhatCoSoEdit").val(formatVND(item.giaCaoNhat || ''));
            //("#traiNghiemCoSoEdit").val(item.traiNghiem ||    '');
            //$("#goiYCoSoEdit").val(item.goiY || '');
        }
    })
}

function dataEditCoSoLuuTru() {
    // Thông tin chung
    const fileAnhDaiDien = $("#fileAnhDaiDienPrev")[0].files[0] || null;
    const anhDaiDienDetail = $("#showAnhDaiDienDetail").val() || null;
    const diaDiemID = $("#DiaDiemCoSanAdd").val();
    const loaiCoSoID = $("#loaiCoSoEdit").val();
    const phongCachCoSoID = $("#phongCachCoSoEdit").val();
    const hangSao = parseInt($("#hangSaoCoSoEdit").val());
    const soLuongPhong = $("#soLuongPhongCoSoEdit").val();
    const soTang = $("#soTangCoSoEdit").val();
    const giaThapNhat = $("#giaThapNhatCoSoEdit").val();
    const giaCaoNhat = $("#giaCaoNhatCoSoEdit").val();
    const dienThoai = $("#dienThoaiCoSoEdit").val();
    const hopThu = $("#hopThuCoSoEdit").val();
    const lienKet = $("#lienKetCoSoEdit").val();
    const trangThai = $("input[name='trangThaiCoSoEdit']:checked").val() == 1 ? true : false;

    // Đa ngữ
    const maNgonNgu = $("#ngonNguDichCoSoEdit").val();
    const tenCoSo = $("#tenCoSoEdit").val();
    const moTa = ckeditormoTaCoSoEdit.getData();
    const nguoiDaiDien = $("#nguoiDaiDienCoSoEdit").val();
    const diaChi = $("#diaChiCoSoEdit").val();
    const traiNghiem = ckeditortraiNghiemCoSoEdit.getData();
    const goiY = ckeditorgoiYCoSoEdit.getData();

    const dtCoSo = {
        CoSoLuuTruID: CoSoLuuTruId,
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
        GoiY: goiY,
        anhDaiDienDetail: anhDaiDienDetail
    };

   
    let formData = new FormData();
    formData.append("RequestCoSoLuuTru", JSON.stringify(dtCoSo));
    formData.append("File", fileAnhDaiDien);

    if (fileAnhDaiDien == null && anhDaiDienDetail == null) {
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
            type: 'PUT',
            url: `${baseUrl}/api/DL_CoSoLuuTruApi/Update`,
            data: formData,
            processData: false,
            contentType: false,
            success: function (data) {
                if (data.isSuccess && data.value) {
                    showNotification(1, "Chỉnh sửa cơ sở lưu trú thành công");
                    setTimeout(function () {
                        window.location.href = `${baseUrl}/AdminTool/CoSoLuuTru`;
                    }, 2000);
                } else {
                    showNotification(0, "Chỉnh sửa cơ sở lưu trú không thành công");
                    console.log(data.error);
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
    }

   
}

function loadTranslation(coSoLuuTruID, maNgonNgu) {
    getDataWithApi('GET', `/api/DL_CoSoLuuTruApi/Get?MaNgonNgu=${maNgonNgu}&CoSoLuuTruID=${coSoLuuTruID}`).then(data => {
        if (data && data.isSuccess && data.value) {
            const item = data.value;
            console.log('Dữ liệu dịch cơ sở lưu trú:', item);
            $("#tenCoSoEdit").val(item.tenCoSo || '');
            $("#nguoiDaiDienCoSoEdit").val(item.nguoiDaiDien || '');
            $("#diaChiCoSoEdit").val(item.diaChi || '');
            if (typeof ckeditormoTaCoSoEdit !== 'undefined') ckeditormoTaCoSoEdit.setData(item.moTa || '');
            if (typeof ckeditortraiNghiemCoSoEdit !== 'undefined') ckeditortraiNghiemCoSoEdit.setData(item.traiNghiem || '');
            if (typeof ckeditorgoiYCoSoEdit !== 'undefined') ckeditorgoiYCoSoEdit.setData(item.goiY || '');
        } else {
            $('#tenCoSoEdit').val('');
            $('#nguoiDaiDienCoSoEdit').val('');
            $('#diaChiCoSoEdit').val('');
            if (typeof ckeditormoTaCoSoEdit !== 'undefined') ckeditormoTaCoSoEdit.setData('');
            if (typeof ckeditortraiNghiemCoSoEdit !== 'undefined') ckeditortraiNghiemCoSoEdit.setData('');
            if (typeof ckeditorgoiYCoSoEdit !== 'undefined') ckeditorgoiYCoSoEdit.setData('');
        }
    })
}
//#endregion Xử lý thông tin chung

//#region Xử lý tiện nghi
function initTableTienNghi(id) {
    listTienNghi = initListTienNghi(id);

    const tableApi = {
        url: `${baseUrl}/api/DL_CoSoLuuTruApi/GetsTienNghi?MaNgonNgu=vi&CoSoLuuTruID=${id}`,
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
                    return `<input type="checkbox" id="mienPhiEdit" name="mienPhi" ${row.MienPhi ? "checked" : ""}>`;
                } else {
                    return row.mienPhi ? `<span class="TrangThai green-text">Có</span>` : `<span class="TrangThai red-text">Không</span>`;
                }
            }
        },
        {
            targets: 3,
            render: function (data, type, row) {
                if (row._isNew) {
                    return `<input type="checkbox" id="trangThaiTienNghiEdit" name="trangThaiTienNghi" ${row.TrangThai ? "checked" : ""}>`;
                } else {
                    return row.trangThai ? `<span class="TrangThai green-text">Hoạt động</span>` : `<span class="TrangThai red-text">Không hoạt động</span>`;
                }
            }
        },
        {
            targets: 4,
            render: function (data, type, row, meta) {
                if (row._isNew) {
                    return `
                        <button type="button" class="btnSaveTienNghi hgi-icon hgi-check"></button>
                        <button type="button" class="btnCancelTienNghi hgi-icon hgi-cancel"></button>
                    `;
                }

                const editIcon = `<i class="edit-tien-nghi cursor-pointer me-2" 
                                    data-index="${meta.row + 1}">
                                    <i class="hgi-icon hgi-edit"></i></i>`;
                const deleteIcon = `<i class="delete-tien-nghi cursor-pointer text-danger" 
                            data-index="${meta.row + 1}">
                            <i class="hgi-icon hgi-delete"></i></i>`;
                return editIcon + deleteIcon;
            }
        }
    ];

    const tableCols = [
        { data: null, width: "40px", class: "center-align" },
        { data: "tenTienNghi", class: "left-align" },
        { data: "mienPhi", width: "100px", class: "center-align" },
        { data: "trangThai", width: "120px", class: "center-align" },
        { data: null, width: "120px", class: "center-align group-icon-action" }
    ];

    const table = $('#tableTienNghiCoSoEdit').DataTable({
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
            emptyTable: "Chưa có tiện nghi nào"
        }
    });

    // Hàm sinh ra select tiện nghi (loại bỏ tiện nghi đã chọn rồi)
    function createSelectTienNghi(selectedId = "") {
        let options = `<option value="">Chọn</option>`;
        listTienNghi.forEach(t => {
            options += `<option value="${t.danhMucID}">${t.ten}</option>`;
        });
        return `<select id="selectTienNghiEdit" class="form-control">${options}</select>`;
    }

    // === Thêm dòng mới ===
    let newRow = null;
    let originalRowData = null;
    $('#btnAddTienNghiCoSoEdit').on('click', function () {
        if (newRow) return;

        const rowData = {
            stt: table.rows().count() + 1,
            tenTienNghi: createSelectTienNghi(),
            mienPhi: `<input type="checkbox" id="mienPhiEdit" name="mienPhi">`,
            trangThai: `<input type="checkbox" id="trangThaiTienNghiEdit" name="trangThaiTienNghi" checked>`,
            _isNew: true
        };

        newRow = table.row.add(rowData).draw(false).node();
        $(newRow).addClass('adding');
        initSelect2();
    });

    // === Hủy thêm dòng ===
    $('#tableTienNghiCoSoEdit').on('click', '.btnCancelTienNghi', function () {
        if (originalRowData) {
            // Nếu là edit, restore dữ liệu gốc và remove từ list
            table.row(newRow).data(originalRowData).draw(false);
            $(newRow).removeClass('adding');
            listTienNghi = listTienNghi.filter(t => t.danhMucID !== originalRowData.tienNghiID);
            originalRowData = null;
        } else {
            // Nếu là add mới, remove dòng
            table.row('.adding').remove().draw(false);
        }
        newRow = null;
    });

    // === Chỉnh sửa dòng ===
    $('#tableTienNghiCoSoEdit').on('click', '.edit-tien-nghi', function () {
        if (newRow) return;

        const rowNode = $(this).closest('tr');
        const rowData = table.row(rowNode).data();
        console.log('Dữ liệu dòng cần edit:', rowData);
        originalRowData = { ...rowData };

        // Add lại vào list options để có thể chọn lại
        listTienNghi.push({ danhMucID: parseInt(rowData.tienNghiID), ten: rowData.tenTienNghi });
        console.log('Danh sách tiện nghi sau khi thêm lại:', listTienNghi);

        const editRowData = {
            tenTienNghi: createSelectTienNghi(),
            mienPhi: `<input type="checkbox" id="mienPhiEdit" name="mienPhi" ${rowData.mienPhi ? "checked" : ""}>`,
            trangThai: `<input type="checkbox" id="trangThaiTienNghiEdit" name="trangThaiTienNghi" ${rowData.trangThai ? "checked" : ""}>`,
            _isNew: true
        };

        table.row(rowNode).data(editRowData).draw(false);
        $(rowNode).addClass('adding');
        initSelect2();
        newRow = rowNode;
    });

    // === Lưu dòng mới hoặc chỉnh sửa ===
    $('#tableTienNghiCoSoEdit').on('click', '.btnSaveTienNghi', function () {
        let danhMucID = $('#selectTienNghiEdit').val();
        let tenDanhMuc = $('#selectTienNghiEdit option:selected').text();
        let MienPhi = $('#mienPhiEdit').is(':checked');
        let TrangThai = $('#trangThaiTienNghiEdit').is(':checked');

        if (!danhMucID) {
            showNotification(0, "Vui lòng chọn tiện nghi!");
            return;
        }

        const request = {
            CoSoLuuTruID: id,
            TienNghiID: parseInt(danhMucID),
            TrangThai: TrangThai,
            MienPhi: MienPhi
        };

        const isEdit = originalRowData !== null;
        const apiUrl = isEdit
            ? `${baseUrl}/api/DL_CoSoLuuTruApi/UpdateTienNghi`
            : `${baseUrl}/api/DL_CoSoLuuTruApi/AddTienNghi`;
        const method = isEdit ? "PUT" : "POST";

        $.ajax({
            url: apiUrl,
            type: method,
            data: JSON.stringify(request),
            contentType: "application/json",
            success: function (res) {
                if (res && res.isSuccess) {
                    showNotification(1, isEdit ? "Cập nhật tiện nghi thành công!" : "Thêm tiện nghi thành công!");
                    table.ajax.reload();
                    // Remove từ list options
                    listTienNghi = listTienNghi.filter(t => t.danhMucID !== parseInt(danhMucID));
                } else {
                    showNotification(0, res.message || "Không thể lưu dữ liệu!");
                }
            },
            error: function () {
                showNotification(0, "Có lỗi xảy ra khi gọi API!");
            }
        });

        newRow = null;
        originalRowData = null;
    });

    // === Xóa dòng ===
    $('#tableTienNghiCoSoEdit').on('click', '.delete-tien-nghi', function () {
        const rowNode = $(this).closest('tr');
        const rowData = table.row(rowNode).data();

        $('#idDelete').val(rowData.tienNghiID);
        $('#nameDelete').text(`${rowData.tenTienNghi}`);
        $('#idTypeDelete').val('tiennghi');
        $('#modalDelete').modal('show');
    });
}

function initListTienNghi(id) {
    getDataWithApi('GET', `/api/DL_CoSoLuuTruApi/GetsOptionTienNghi?CoSoLuuTruID=${id}&MaNgonNgu=vi`).then(data => {
        if (data && data.isSuccess && data.value.length > 0) {
            listTienNghi.push(...data.value);
            console.log('Danh sách tiện nghi khả dụng:', listTienNghi);
        }
    })
    return listTienNghi;
}

function dataDeleteTienNghi() {
    let tienNghiID = $('#idDelete').val();
    let tenTienNghi = $('#nameDelete').text();
    $.ajax({
        url: `${baseUrl}/api/DL_CoSoLuuTruApi/DeleteTienNghi?CoSoLuuTruID=${CoSoLuuTruId}&TienNghiID=${tienNghiID}`,
        type: "DELETE",
        success: function (res) {
            if (res && res.isSuccess) {
                showNotification(1, "Xóa tiện nghi thành công!");
                $('#tableTienNghiCoSoEdit').DataTable().ajax.reload();
                // Add lại vào list options
                listTienNghi.push({ danhMucID: parseInt(tienNghiID), tenDanhMuc: tenTienNghi });
                $('#modalDelete').modal('hide');
            } else {
                showNotification(0, res.message || "Không thể xóa tiện nghi!");
            }
        },
        error: function () {
            showNotification(0, "Có lỗi xảy ra khi gọi API xóa!");
        }
    });
}
//#endregion Xử lý tiện nghi

//#region Xử lý phòng
function initTablePhong(id) {
    listPhong = initListPhong(id);

    const tableApi = {
        url: `${baseUrl}/api/DL_CoSoLuuTruApi/GetsPhong?MaNgonNgu=vi&CoSoLuuTruID=${id}`,
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
                    return `<input type="number" id="soLuongPhongEdit" name="soLuongPhong" value="${row.SoLuong || 1}" min="1">`;
                } else {
                    return row.soLuong || 1;
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

                const editIcon = `<i class="edit-phong-item cursor-pointer me-2" 
                                    data-index="${meta.row + 1}">
                                    <i class="hgi-icon hgi-edit"></i></i>`;
                const deleteIcon = `<i class="delete-phong-item cursor-pointer text-danger" 
                            data-index="${meta.row + 1}">
                            <i class="hgi-icon hgi-delete"></i></i>`;
                return editIcon + deleteIcon;
            }
        }
    ];

    const tableCols = [
        { data: null, width: "40px", class: "center-align" },
        { data: "tenLoaiPhong", class: "left-align" },
        { data: "soLuong", width: "180px", class: "center-align" },
        { data: null, width: "180px", class: "center-align group-icon-action" }
    ];

    const table = $('#tablePhongCoSoEdit').DataTable({
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
            emptyTable: "Chưa có phòng nào"
        }
    });

    // Hàm sinh ra select phòng (loại bỏ phòng đã chọn rồi)
    function createSelectPhong(selectedId = "") {
        let options = `<option value="">Chọn</option>`;
        listPhong.forEach(p => {
            options += `<option value="${p.danhMucID}">${p.ten}</option>`;
        });
        return `<select id="selectPhongEdit" class="form-control">${options}</select>`;
    }

    // === Thêm dòng mới ===
    let newRow = null;
    let originalRowDataPhong = null;
    $('#btnAddPhongCoSoEdit').on('click', function () {
        if (newRow) return;

        const rowData = {
            stt: table.rows().count() + 1,
            tenLoaiPhong: createSelectPhong(),
            soLuong: `<input type="number" id="soLuongPhongEdit" name="soLuongPhong" value="1" min="1">`,
            _isNew: true
        };

        newRow = table.row.add(rowData).draw(false).node();
        $(newRow).addClass('adding');
        initSelect2();
    });

    // === Hủy thêm dòng ===
    $('#tablePhongCoSoEdit').on('click', '.btnCancelPhong', function () {
        if (originalRowDataPhong) {
            // Nếu là edit, restore dữ liệu gốc và remove từ list
            table.row(newRowPhong).data(originalRowDataPhong).draw(false);
            $(newRowPhong).removeClass('adding');
            listPhong = listPhong.filter(t => t.danhMucID !== originalRowDataPhong.phongID);
            originalRowDataPhong = null;
        } else {
            // Nếu là add mới, remove dòng
            table.row('.adding').remove().draw(false);
        }
        newRowPhong = null;
    });

    // === Chỉnh sửa dòng ===
    $('#tablePhongCoSoEdit').on('click', '.edit-phong-item', function () {
        if (newRow) return;

        const rowNode = $(this).closest('tr');
        const rowData = table.row(rowNode).data();

        originalRowDataPhong = { ...rowData };

        // Add lại vào list options để có thể chọn lại
        listPhong.push({ danhMucID: parseInt(rowData.phongID), ten: rowData.tenLoaiPhong });

        const editRowData = {
            tenLoaiPhong: createSelectPhong(),
            soLuong: `<input type="number" id="soLuongPhongEdit" name="soLuongPhong" value="${rowData.soLuong || 1}" min="1">`,
            _isNew: true
        };

        table.row(rowNode).data(editRowData).draw(false);
        $(rowNode).addClass('adding');
        initSelect2();
        newRow = rowNode;
    });

    // === Lưu dòng mới hoặc chỉnh sửa ===
    $('#tablePhongCoSoEdit').on('click', '.btnSavePhong', function () {
        let danhMucID = $('#selectPhongEdit').val();
        let tenDanhMuc = $('#selectPhongEdit option:selected').text();
        let SoLuong = parseInt($('#soLuongPhongEdit').val()) || 1;

        if (!danhMucID) {
            showNotification(0, "Vui lòng chọn phòng!");
            return;
        }

        if (SoLuong < 1) {
            showNotification(0, "Số lượng phải lớn hơn 0!");
            return;
        }

        const request = {
            CoSoLuuTruID: id,
            LoaiPhongID: parseInt(danhMucID),
            SoLuong: SoLuong
        };

        const isEdit = originalRowDataPhong !== null;
        const apiUrl = isEdit
            ? `${baseUrl}/api/DL_CoSoLuuTruApi/UpdatePhong`
            : `${baseUrl}/api/DL_CoSoLuuTruApi/AddPhong`;
        const method = isEdit ? "PUT" : "POST";

        $.ajax({
            url: apiUrl,
            type: method,
            data: JSON.stringify(request),
            contentType: "application/json",
            success: function (res) {
                if (res && res.isSuccess) {
                    showNotification(1, isEdit ? "Cập nhật phòng thành công!" : "Thêm phòng thành công!");
                    table.ajax.reload();
                    // Remove từ list options
                    listPhong = listPhong.filter(p => p.danhMucID !== parseInt(danhMucID));

                    //Reload dữ liệu totalCountPhong
                    loadDataTotalCountPhong(id)
                } else {
                    showNotification(0, res.message || "Không thể lưu dữ liệu!");
                }
            },
            error: function () {
                showNotification(0, "Có lỗi xảy ra khi gọi API!");
            }
        });

        newRow = null;
        originalRowDataPhong = null;
    });

    // === Xóa dòng ===
    $('#tablePhongCoSoEdit').on('click', '.delete-phong-item', function () {
        const rowNode = $(this).closest('tr');
        const rowData = table.row(rowNode).data();

        $('#idDelete').val(rowData.loaiPhongID);
        $('#nameDelete').text(`${rowData.tenLoaiPhong}`);
        $('#idTypeDelete').val('phong');
        $('#modalDelete').modal('show');
    });
}

function initListPhong(id) {
    getDataWithApi('GET', `/api/DL_CoSoLuuTruApi/GetsOptionPhong?CoSoLuuTruID=${id}&MaNgonNgu=vi`).then(data => {
        if (data && data.isSuccess && data.value.length > 0) {
            listPhong.push(...data.value);
        }
    })

    return listPhong;
}
//#endregion Xử lý phòng

//#region Xử lý lao động
function initTableNguoiLaoDong(id) {
    listNguoiLaoDong = initListNguoiLaoDong(id);

    const tableApi = {
        url: `${baseUrl}/api/DL_CoSoLuuTruApi/GetsNguoiLaoDong?MaNgonNgu=vi&CoSoLuuTruID=${id}`,
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
                    return `<input type="number" id="soLuongLaoDongEdit" name="soLuongLaoDong" value="${row.SoLuong || 1}" min="1">`;
                } else {
                    return row.soLuong || 1;
                }
            }
        },
        {
            targets: 3,
            render: function (data, type, row, meta) {
                if (row._isNew) {
                    return `
                        <button type="button" class="btnSaveLaoDong hgi-icon hgi-check"></button>
                        <button type="button" class="btnCancelLaoDong hgi-icon hgi-cancel"></button>
                    `;
                }

                const editIcon = `<i class="edit-laodong-item cursor-pointer me-2" 
                                    data-index="${meta.row + 1}">
                                    <i class="hgi-icon hgi-edit"></i></i>`;
                const deleteIcon = `<i class="delete-laodong-entry cursor-pointer text-danger" 
                            data-index="${meta.row + 1}">
                            <i class="hgi-icon hgi-delete"></i></i>`;
                return editIcon + deleteIcon;
            }
        }
    ];

    const tableCols = [
        { data: null, width: "40px", class: "center-align" },
        { data: "tenLoaiLaoDong", class: "left-align" },
        { data: "soLuong", width: "180px", class: "center-align" },
        { data: null, width: "180px", class: "center-align group-icon-action" }
    ];

    const table = $('#tableNguoiLaoDongCoSoEdit').DataTable({
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
            emptyTable: "Chưa có lao động nào"
        }
    });

    // Hàm sinh ra select lao động (loại bỏ lao động đã chọn rồi)
    function createSelectLaoDong(selectedId = "") {
        let options = `<option value="">Chọn</option>`;
        listNguoiLaoDong.forEach(l => {
            options += `<option value="${l.danhMucID}">${l.ten}</option>`;
        });
        return `<select id="selectLaoDongEdit" class="form-control">${options}</select>`;
    }

    // === Thêm dòng mới ===
    let newRow = null;
    let originalRowDataLaoDong = null;
    $('#btnAddNguoiLaoDongCoSoEdit').on('click', function () {
        if (newRow) return;

        const rowData = {
            stt: table.rows().count() + 1,
            tenLoaiLaoDong: createSelectLaoDong(),
            soLuong: `<input type="number" id="soLuongLaoDongEdit" name="soLuongLaoDong" value="1" min="1">`,
            _isNew: true
        };

        newRow = table.row.add(rowData).draw(false).node();
        $(newRow).addClass('adding');
        initSelect2();
    });

    // === Hủy thêm dòng ===
    $('#tableNguoiLaoDongCoSoEdit').on('click', '.btnCancelLaoDong', function () {
        if (originalRowDataLaoDong) {
            // Nếu là edit, restore dữ liệu gốc và remove từ list
            table.row(newRow).data(originalRowDataLaoDong).draw(false);
            $(newRow).removeClass('adding');
            listNguoiLaoDong = listNguoiLaoDong.filter(t => t.danhMucID !== originalRowDataLaoDong.loaiLaoDongID);
            originalRowDataLaoDong = null;
        } else {
            // Nếu là add mới, remove dòng
            table.row('.adding').remove().draw(false);
        }
        newRow = null;
    });

    // === Chỉnh sửa dòng ===
    $('#tableNguoiLaoDongCoSoEdit').on('click', '.edit-laodong-item', function () {
        if (newRow) return;

        const rowNode = $(this).closest('tr');
        const rowData = table.row(rowNode).data();

        originalRowDataLaoDong = { ...rowData };

        // Add lại vào list options để có thể chọn lại
        listNguoiLaoDong.push({ danhMucID: parseInt(rowData.loaiLaoDongID), ten: rowData.tenLoaiLaoDong });

        const editRowData = {
            tenLoaiLaoDong: createSelectLaoDong(),
            soLuong: `<input type="number" id="soLuongLaoDongEdit" name="soLuongLaoDong" value="${rowData.soLuong || 1}" min="1">`,
            _isNew: true
        };

        table.row(rowNode).data(editRowData).draw(false);
        $(rowNode).addClass('adding');
        initSelect2();
        newRow = rowNode;
    });

    // === Lưu dòng mới hoặc chỉnh sửa ===
    $('#tableNguoiLaoDongCoSoEdit').on('click', '.btnSaveLaoDong', function () {
        let danhMucID = $('#selectLaoDongEdit').val();
        let tenDanhMuc = $('#selectLaoDongEdit option:selected').text();
        let SoLuong = $('#soLuongLaoDongEdit').val() || 1;

        if (!danhMucID) {
            showNotification(0, "Vui lòng chọn loại lao động!");
            return;
        }

        if (SoLuong < 1) {
            showNotification(0, "Số lượng phải lớn hơn 0!");
            return;
        }

        const request = {
            CoSoLuuTruID: id,
            LoaiLaoDongID: parseInt(danhMucID),
            SoLuong: SoLuong
        };

        const isEdit = originalRowDataLaoDong !== null;
        const apiUrl = isEdit
            ? `${baseUrl}/api/DL_CoSoLuuTruApi/UpdateNguoiLaoDong`
            : `${baseUrl}/api/DL_CoSoLuuTruApi/AddNguoiLaoDong`;
        const method = isEdit ? "PUT" : "POST";

        $.ajax({
            url: apiUrl,
            type: method,
            data: JSON.stringify(request),
            contentType: "application/json",
            success: function (res) {
                if (res && res.isSuccess) {
                    showNotification(1, isEdit ? "Cập nhật lao động thành công!" : "Thêm lao động thành công!");
                    table.ajax.reload();
                    // Remove từ list options
                    listNguoiLaoDong = listNguoiLaoDong.filter(l => l.danhMucID !== parseInt(danhMucID));
                } else {
                    showNotification(0, res.message || "Không thể lưu dữ liệu!");
                }
            },
            error: function () {
                showNotification(0, "Có lỗi xảy ra khi gọi API!");
            }
        });

        newRow = null;
        originalRowDataLaoDong = null;
    });

    // === Xóa dòng ===
    $('#tableNguoiLaoDongCoSoEdit').on('click', '.delete-laodong-entry', function () {
        const rowNode = $(this).closest('tr');
        const rowData = table.row(rowNode).data();

        $('#idDelete').val(rowData.loaiLaoDongID);
        $('#nameDelete').text(`${rowData.tenLoaiLaoDong}`);
        $('#idTypeDelete').val('laodong');
        $('#modalDelete').modal('show');
    });
}

function initListNguoiLaoDong(id) {
    getDataWithApi('GET', `/api/DL_CoSoLuuTruApi/GetsOptionNguoiLaoDong?CoSoLuuTruID=${id}&MaNgonNgu=vi`).then(data => {
        if (data && data.isSuccess && data.value.length > 0) {
            listNguoiLaoDong.push(...data.value);
        }
    })
    return listNguoiLaoDong;
}

function dataDeletePhongCoSo() {
    let phongID = $('#idDelete').val();
    let tenLoaiPhong = $('#nameDelete').text();
    $.ajax({
        url: `${baseUrl}/api/DL_CoSoLuuTruApi/DeletePhong?CoSoLuuTruID=${CoSoLuuTruId}&LoaiPhongID=${phongID}`,
        type: "DELETE",
        success: function (res) {
            if (res && res.isSuccess) {
                showNotification(1, "Xóa phòng thành công!");
                $('#tablePhongCoSoEdit').DataTable().ajax.reload();
                // Add lại vào list options
                listPhong.push({ danhMucID: parseInt(phongID), tenDanhMuc: tenLoaiPhong });
                loadDataTotalCountPhong(CoSoLuuTruID)
                $('#modalDelete').modal('hide');
            } else {
                showNotification(0, res.message || "Không thể xóa phòng!");
            }
        },
        error: function () {
            showNotification(0, "Có lỗi xảy ra khi gọi API xóa!");
        }
    });
}

function dataDeleteLaoDongCoSo() {
    let loaiLaoDongID = $('#idDelete').val();
    let tenLoaiLaoDong = $('#nameDelete').text();
    $.ajax({
        url: `${baseUrl}/api/DL_CoSoLuuTruApi/DeleteNguoiLaoDong?CoSoLuuTruID=${CoSoLuuTruId}&LoaiLaoDongID=${loaiLaoDongID}`,
        type: "DELETE",
        success: function (res) {
            if (res && res.isSuccess) {
                showNotification(1, "Xóa lao động thành công!");
                $('#tableNguoiLaoDongCoSoEdit').DataTable().ajax.reload();
                // Add lại vào list options
                listNguoiLaoDong.push({ danhMucID: parseInt(loaiLaoDongID), tenDanhMuc: tenLoaiLaoDong });
                $('#modalDelete').modal('hide');
            } else {
                showNotification(0, res.message || "Không thể xóa lao động!");
            }
        },
        error: function () {
            showNotification(0, "Có lỗi xảy ra khi gọi API xóa!");
        }
    });
}
//#endregion Xử lý lao động

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

//#endregion function validation


//#region auto format value price
const formatVND = (value) => {
    if (value === undefined || value === null || value === "") return "";

    // Ép về string trước khi replace
    const strValue = String(value);

    // Loại bỏ mọi ký tự không phải số
    const number = strValue.replace(/\D/g, "");
    if (number === "") return "";

    // Định dạng theo kiểu Việt Nam
    return new Intl.NumberFormat("vi-VN").format(number);
};

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


const loadDataTotalCountPhong = (id) => {
    $.ajax({
        type: "GET",
        url: `${baseUrl}/api/DL_CoSoLuuTruApi/GetsPhong?MaNgonNgu=vi&CoSoLuuTruID=${id}`,
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            if (data && data.isSuccess && data.value.length > 0) {
                let result = data.value
                let total = 0
                result.forEach((item) => {
                    total = total + Number(item.soLuong)
                })

                $("#soLuongPhongCoSoEdit").val(total)
            }
            else {
                $("#soLuongPhongCoSoEdit").val("")
            }
        },
        error: function (err) {
        }
    })
}
