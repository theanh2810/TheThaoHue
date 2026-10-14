// Shared functions for editing Giay Chung Nhan with DB persistence
const ckeditornoiDungVBTLCoSo = CKEDITOR.replace('noiDungVBTLCoSo');
let currentEditingVBTLIndexCoSo = -1;

// Event handlers for VBTL in edit mode
$(document).ready(function() {
    const paramsVBTL = new URLSearchParams(window.location.search);
    const ID_Object = paramsVBTL.get("id")
    initVBTLTableCoSo(ID_Object);
    initToChuc_NoAll(170, "#coQuanBanHanhVBTLCoSo", "", "") // Cơ quan ban hành văn bản
    initDanhMucChung_NoAll(53, "#loaiVanBanCoSo", "") // Loại văn bản
    CheckDateMinMax("#ngayBanHanhVBTLCoSo", "#ngayHieuLucVBTLCoSo")
    CheckDateMinMax("#ngayHieuLucVBTLCoSo", "#ngayHetHanVBTLCoSo")
    // Event cho thêm văn bản tài liệu
    $(document).on('click', '#btnVBTLCoSo', function() {
        resetVBTLFormCoSo();
        $('#modalVBTLCoSo').modal('show');
    });

    // Event cho lưu văn bản tài liệu
    $(document).on('click', '#btnSaveVBTLCoSo', function() {
        saveVBTLToCoSo(ID_Object);
    });

    // Event cho xóa văn bản tài liệu
    $(document).on('click', '.delete-VBTL-CoSo', function() {
        const index = $(this).data('index');
        const table = $('#tableGiayChungNhan').DataTable();
        const rowData = table.row(index).data();
        $('#idDelete').val(rowData.vanBanID);
        $('#nameDelete').text(`${rowData.trichYeu || 'văn bản này'}`);
        $('#idTypeDelete').val('vanban');
        $('#modalDelete').modal('show');
    });

    // Event cho chỉnh sửa văn bản tài liệu
    $(document).on('click', '.edit-VBTL-CoSo', function() {
        const index = $(this).data('index');
        const table = $('#tableGiayChungNhan').DataTable();
        const rowData = table.row(index).data();
        loadVBTLToFormCoSo(rowData);
        $('#modalVBTLCoSo').modal('show');
    });
});

function initVBTLTableCoSo(id) {
    const tableApi = {
        url: `${baseUrl}/api/DL_CoSoLuuTruApi/GetsVanBan?MaNgonNgu=vi&CoSoLuuTruID=${id}`,
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        dataSrc: function (data) {
            if (data && data.isSuccess && data.value.length > 0) {
                return data.value.map((item, index) => ({ ...item, stt: index + 1 }));
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
            targets: 1,
            render: function (data, type, row, meta) {
                return `<div class="group-info">
                            <div class="info-main">
                                <a class="text-primary text-decoration-none">
                                    ${row.trichYeu || ''}
                                </a>
                            </div>
                            <div class="info-sub">${row.soKyHieu || ''}</div>
                        </div>`;
            }
        },
        {
            targets: 2,
            render: function (data, type, row, meta) {
                return row.tenLoaiVanBan || '';
            }
        },
        {
            targets: 3,
            render: function (data, type, row, meta) {
                return row.tenToChuc || '';
            }
        },
        {
            targets: 4,
            render: function (data, type, row, meta) {
                return row.ngayBanHanh ? formatDateWithoutTime(row.ngayBanHanh) : '';
            }
        },
        {
            targets: 5,
            render: function (data, type, row, meta) {
                return row.ngayHieuLuc ? formatDateWithoutTime(row.ngayHieuLuc) : '';
            }
        },
        {
            targets: 6,
            render: function (data, type, row, meta) {
                if (row.duongDanFile) {
                    return `<a href="${baseUrl}${row.duongDanFile}" target="_blank" class="hgi-icon hgi-download"></a>`;
                }
                return '';
            }
        },
        {
            targets: 7,
            render: function (data, type, row, meta) {
                const editIcon = `<i data-toggle="tooltip" title="Chỉnh sửa" class="edit-VBTL-CoSo text-yellow cursor-pointer me-2" data-index="${meta.row}">
                    <i class="hgi-icon hgi-edit"></i>
                </i>`;
                const deleteIcon = `<i data-toggle="tooltip" title="Xóa" class="delete-VBTL-CoSo text-red cursor-pointer" data-index="${meta.row}">
                    <i class="hgi-icon hgi-delete"></i>
                </i>`;
                return editIcon + deleteIcon;
            }
        }
    ];

    const tableCols = [
        { "data": "stt", "width": "40px", "class": "center-align" },
        { "data": "", "class": "left-align" },
        { "data": "LoaiVanBan", "width": "15%", "class": "left-align" },
        { "data": "TenCoQuanBanHanh", "width": "15%", "class": "left-align" },
        { "data": "NgayBanHanh", "width": "10%", "class": "center-align" },
        { "data": "NgayHieuLuc", "width": "10%", "class": "center-align" },
        { "data": "", "width": "8%", "class": "center-align" },
        { "data": "", "width": "120px", "class": "center-align group-icon-action" }
    ];

    if ($.fn.DataTable.isDataTable('#tableGiayChungNhan')) {
        $('#tableGiayChungNhan').DataTable().destroy();
    }

    $('#tableGiayChungNhan').DataTable({
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
            emptyTable: "Chưa có văn bản tài liệu nào"
        }
    });
}

function refreshVBTLTableCoSo() {
    if ($.fn.DataTable.isDataTable('#tableGiayChungNhan')) {
        const table = $('#tableGiayChungNhan').DataTable();
        table.ajax.reload();
    } else {
        initVBTLTableCoSo(ID_Object);
    }
}

function resetVBTLFormCoSo() {
    $('#soKyHieuVBTLCoSo').val('');
    $('#trichYeuVBTLCoSo').val('');
    $('#loaiVanBanCoSo').val('');
    $('#coQuanBanHanhVBTLCoSo').val('').trigger('change');
    $('#ngayBanHanhVBTLCoSo').val('');
    $('#ngayHieuLucVBTLCoSo').val('');
    $('#ngayHetHanVBTLCoSo').val('');
    $('#nguoiKyVBTLCoSo').val('');
    ckeditornoiDungVBTLCoSo.setData('');
    $('#tepDinhKemVBTLCoSo').val('');
    currentEditingVBTLIndexCoSo = -1;
}

function loadVBTLToFormCoSo(data) {
    console.log(data)
    $('#soKyHieuVBTLCoSo').val(data.soKyHieu);
    $('#trichYeuVBTLCoSo').val(data.trichYeu);
    $('#loaiVanBanCoSo').val(data.loaiVanBanID).trigger('change');
    $('#coQuanBanHanhVBTLCoSo').val(data.coQuanBanHanhID).trigger('change');
    $('#ngayBanHanhVBTLCoSo').val(data.ngayBanHanh ? formatDateWithoutTime(data.ngayBanHanh) : '');
    $('#ngayHieuLucVBTLCoSo').val(data.ngayHieuLuc ? formatDateWithoutTime(data.ngayHieuLuc) : '');
    $('#ngayHetHanVBTLCoSo').val(data.ngayHetHan ? formatDateWithoutTime(data.ngayHetHan) : '');
    $('#nguoiKyVBTLCoSo').val(data.nguoiKy);
    $("#duongDanFileDetail").val(data.duongDanFile)
    ckeditornoiDungVBTLCoSo.setData(data.noiDung);
    // File không load lại
    currentEditingVBTLIndexCoSo = data.vanBanID;
}

function saveVBTLToCoSo(ID_Object) {
    const soKyHieu = $('#soKyHieuVBTLCoSo').val().trim();
    const trichYeu = $('#trichYeuVBTLCoSo').val().trim();
    const loaiVanBanID = $('#loaiVanBanCoSo').val();
    const coQuanBanHanhID = $('#coQuanBanHanhVBTLCoSo').val();
    const ngayBanHanh = $('#ngayBanHanhVBTLCoSo').val();
    const ngayHieuLuc = $('#ngayHieuLucVBTLCoSo').val();
    const ngayHetHan = $('#ngayHetHanVBTLCoSo').val();
    const nguoiKy = $('#nguoiKyVBTLCoSo').val().trim();
    const noiDung = ckeditornoiDungVBTLCoSo.getData();
    const tepDinhKem = $('#tepDinhKemVBTLCoSo')[0].files[0] || null;
    let duongDanFileDetail = $("#duongDanFileDetail").val()

    //if (!soKyHieu || !trichYeu || !coQuanBanHanhID) {
    //    showNotification(0, 'Vui lòng nhập đầy đủ thông tin bắt buộc!');
    //    return;
    //}
    if (checkEmptyBlank(loaiVanBanID)) {
        showNotification(0, "Vui lòng chọn loại văn bản")
    }
    else if (checkEmptyBlank(soKyHieu)) {
        showNotification(0, "Vui lòng nhập số ký hiệu")
    }
    else if (checkTagHtmlSingle(soKyHieu)) {
        showNotification(0, "Số ký hiệu chứa ký tự không hợp lệ")
    }
    else if (checkTagHtmlSingle(trichYeu)) {
        showNotification(0, "Trích yếu chứa ký tự không hợp lệ")
    }
    else if (checkEmptyBlank(coQuanBanHanhID)) {
        showNotification(0, "Vui lòng chọn cơ quan ban hành")
    }
    else if (isValidDateRange(ngayBanHanh, ngayHieuLuc)) {
        showNotification(0, "Ngày hiệu lực không hợp lệ")
    }
    else if (isValidDateRange(ngayHieuLuc, ngayHetHan)) {
        showNotification(0, "Ngày hết hạn không hợp lệ")
    }
    else if (tepDinhKem == null && duongDanFileDetail == null) {
        showNotification(0, "Vui lòng chọn tệp đính kèm")
    }
    else if (tepDinhKem != null && (!fileAccepted.includes(tepDinhKem.name.split(".")[tepDinhKem.name.split(".").length - 1].toLowerCase()))) {
        showNotification(0, "Tệp đính kèm không hợp lệ")
    }
    else {
        const request = {
            VanBanID: currentEditingVBTLIndexCoSo !== -1 ? currentEditingVBTLIndexCoSo : null,
            DoiTuongSoHuuID: ID_Object,
            SoKyHieu: soKyHieu,
            TrichYeu: trichYeu,
            LoaiVanBanID: loaiVanBanID,
            CoQuanBanHanhID: coQuanBanHanhID,
            NgayBanHanh: formatDateToSaveAsString(ngayBanHanh),
            NgayHieuLuc: formatDateToSaveAsString(ngayHieuLuc),
            NgayHetHan: formatDateToSaveAsString(ngayHetHan),
            NguoiKy: nguoiKy,
            NoiDung: noiDung,
            duongDanFileDetail: duongDanFileDetail
        };

        let formData = new FormData();
        formData.append('RequestVanBan', JSON.stringify(request));
        if (tepDinhKem) formData.append('File', tepDinhKem);

        const isEdit = currentEditingVBTLIndexCoSo !== -1;
        const apiUrl = isEdit
            ? `${baseUrl}/api/DL_CoSoLuuTruApi/UpdateVanBan`
            : `${baseUrl}/api/DL_CoSoLuuTruApi/AddVanBan`;
        const method = isEdit ? "PUT" : "POST";

        $.ajax({
            url: apiUrl,
            type: method,
            data: formData,
            contentType: false,
            processData: false,
            success: function (data) {
                if (data.isSuccess) {
                    showNotification(1, isEdit ? 'Cập nhật thành công' : 'Thêm thành công');
                    refreshVBTLTableCoSo();
                    $('#modalVBTLCoSo').modal('hide');
                    currentEditingVBTLIndexCoSo = -1;
                } else {
                    showNotification(0, data.error || 'Lỗi khi lưu');
                }
            },
            error: function (err) {
                console.log(err);
                showNotification(0, 'Lỗi khi lưu văn bản');
            }
        });
    }
}

function dataDeleteVBTL() {
    let vanBanID = $('#idDelete').val();
    $.ajax({
        url: `${baseUrl}/api/DL_CoSoLuuTruApi/DeleteVanBan?VanBanID=${vanBanID}`,
        type: "DELETE",
        success: function (res) {
            if (res.isSuccess) {
                showNotification(1, "Xóa văn bản thành công");
                refreshVBTLTableCoSo();
                $('#modalDelete').modal('hide');
            } else {
                showNotification(0, "Xóa văn bản không thành công");
            }
        },
        error: function () {
            showNotification(0, "Lỗi khi xóa văn bản");
        }
    });
}

const isValidDateRange = (ngayCap, ngayHetHan) => {
    // Nếu thiếu 1 trong 2 → không lỗi
    if (!ngayCap || !ngayHetHan) return false;

    const start = new Date(formatDateToSaveAsString(ngayCap));
    const end = new Date(formatDateToSaveAsString(ngayHetHan));

    // Nếu ngày không hợp lệ
    if (isNaN(start) || isNaN(end)) return true;

    return end < start;
};

const fileAccepted = ['doc', 'docx', 'pdf']

