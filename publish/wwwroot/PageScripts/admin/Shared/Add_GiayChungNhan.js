// Shared functions for adding Giay Chung Nhan in temp mode
const ckeditornoiDungVBTLCoSo = CKEDITOR.replace('noiDungVBTLCoSo');
let tempVBTLCoSo = [];
let RequestVBTLCoSo = [];
let currentEditingVBTLIndexCoSo = -1;

// Event handlers for VBTL in temp mode
$(document).ready(function() {
    initDatePicker();
    initTempVBTLTableCoSo();
    CheckDateMinMax("#ngayBanHanhVBTLCoSo", "#ngayHieuLucVBTLCoSo")
    CheckDateMinMax("#ngayHieuLucVBTLCoSo", "#ngayHetHanVBTLCoSo")
    initToChuc_NoAll(170, "#coQuanBanHanhVBTLCoSo", "", "") // Cơ quan ban hành văn bản
    initDanhMucChung_NoAll(53, "#loaiVanBanCoSo", "") // Loại văn bản
    // Event cho thêm văn bản tài liệu
    $(document).on('click', '#btnVBTLCoSo', function() {
        resetVBTLFormCoSo();
        $('#modalVBTLCoSo').modal('show');
    });

    // Event cho lưu văn bản tài liệu
    $(document).on('click', '#btnSaveVBTLCoSo', function() {
        saveVBTLToTempCoSo();
    });

    // Event cho xóa văn bản tài liệu
    $(document).on('click', '.delete-temp-VBTL-CoSo', function() {
        const index = $(this).data('index');
        tempVBTLCoSo.splice(index, 1);
        if (index >= 0 && index < RequestVBTLCoSo.length) {
            RequestVBTLCoSo.splice(index, 1);
        }
        refreshTempVBTLTableCoSo();
    });

    // Event cho chỉnh sửa văn bản tài liệu
    $(document).on('click', '.edit-temp-VBTL-CoSo', function() {
        const index = $(this).data('index');
        currentEditingVBTLIndexCoSo = index;
        loadVBTLToFormCoSo(index);
        $('#modalVBTLCoSo').modal('show');
    });
});

function initTempVBTLTableCoSo() {
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
                                    ${row.TrichYeu || ''}
                                </a>
                            </div>
                            <div class="info-sub">${row.SoKyHieu || ''}</div>
                        </div>`;
            }
        },
        {
            targets: 6,
            render: function (data, type, row, meta) {
                if (row.TepDinhKem && row.TepDinhKem.name) {
                    return `<a href="${baseUrl}${row.TepDinhKem}" target="_blank" class="hgi-icon hgi-download">`
                } else {
                    return ``;
                }
            }
        },
        {
            targets: 7,
            render: function (data, type, row, meta) {
                const editIcon = `<i data-toggle="tooltip" title="Chỉnh sửa" class="edit-temp-VBTL-CoSo text-yellow cursor-pointer me-2" data-index="${meta.row}">
                    <i class="hgi-icon hgi-edit"></i>
                </i>`;
                const deleteIcon = `<i data-toggle="tooltip" title="Xóa khỏi danh sách" class="delete-temp-VBTL-CoSo text-red cursor-pointer" data-index="${meta.row}">
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
        { "data": "", "width": "10%", "class": "left-align" },
        { "data": "", "width": "120px", "class": "center-align group-icon-action" }
    ];

    if ($.fn.DataTable.isDataTable('#tableGiayChungNhan')) {
        $('#tableGiayChungNhan').DataTable().destroy();
    }

    $('#tableGiayChungNhan').DataTable({
        data: tempVBTLCoSo.map((item, index) => ({ ...item, stt: index + 1 })),
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

function refreshTempVBTLTableCoSo() {
    if ($.fn.DataTable.isDataTable('#tableGiayChungNhan')) {
        const table = $('#tableGiayChungNhan').DataTable();
        const dataWithStt = tempVBTLCoSo.map((item, index) => ({ ...item, stt: index + 1 }));
        table.clear().rows.add(dataWithStt).draw();
    } else {
        initTempVBTLTableCoSo();
    }
}

function resetVBTLFormCoSo() {
    $('#soKyHieuVBTLCoSo').val('');
    $('#trichYeuVBTLCoSo').val('');
    $('#loaiVanBanCoSo').val('').trigger('change');
    $('#coQuanBanHanhVBTLCoSo').val('').trigger('change');
    $('#ngayBanHanhVBTLCoSo').val('');
    $('#ngayHieuLucVBTLCoSo').val('');
    $('#ngayHetHanVBTLCoSo').val('');
    $('#nguoiKyVBTLCoSo').val('');
    ckeditornoiDungVBTLCoSo.setData('');
    $('#tepDinhKemVBTLCoSo').val('');
    currentEditingVBTLIndexCoSo = -1;
}

function loadVBTLToFormCoSo(index) {
    const item = tempVBTLCoSo[index];
    $('#soKyHieuVBTLCoSo').val(item.SoKyHieu);
    $('#trichYeuVBTLCoSo').val(item.TrichYeu);
    $('#loaiVanBanCoSo').val(item.LoaiVanBanID).trigger('change');
    $('#coQuanBanHanhVBTLCoSo').val(item.CoQuanBanHanhID).trigger('change');
    $('#ngayBanHanhVBTLCoSo').val(item.NgayBanHanh);
    $('#ngayHieuLucVBTLCoSo').val(item.NgayHieuLuc);
    $('#ngayHetHanVBTLCoSo').val(item.NgayHetHan);
    $('#nguoiKyVBTLCoSo').val(item.NguoiKy);
    ckeditornoiDungVBTLCoSo.setData(item.NoiDung);
    // File không thể load lại, có thể cần lưu tên file
    currentEditingVBTLIndexCoSo = index;
}

function saveVBTLToTempCoSo() {
    const soKyHieu = $('#soKyHieuVBTLCoSo').val().trim();
    const trichYeu = $('#trichYeuVBTLCoSo').val().trim();
    const loaiVanBan = $('#loaiVanBanCoSo').val();
    const tenLoaiVanBan = $('#loaiVanBanCoSo option:selected').text();
    const coQuanBanHanhID = $('#coQuanBanHanhVBTLCoSo').val().trim();
    const coQuanBanHanhText = $('#coQuanBanHanhVBTLCoSo option:selected').text();
    const ngayBanHanh = $('#ngayBanHanhVBTLCoSo').val();
    const ngayHieuLuc = $('#ngayHieuLucVBTLCoSo').val();
    const ngayHetHan = $('#ngayHetHanVBTLCoSo').val();
    const nguoiKy = $('#nguoiKyVBTLCoSo').val().trim();
    const noiDung = ckeditornoiDungVBTLCoSo.getData();
    const tepDinhKem = $('#tepDinhKemVBTLCoSo')[0].files[0] || null;

    //console.log(tepDinhKem.name.split(".")[tepDinhKem.name.split(".").length - 1])

    /* if (checkEmptyBlank(loaiVanBan)) {
        showNotification(0, "Vui lòng chọn loại văn bản")
    } */
    if (checkEmptyBlank(soKyHieu)) {
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
    else if (tepDinhKem == null) {
        showNotification(0, "Vui lòng chọn tệp đính kèm")
    }
    else if (!fileAccepted.includes(tepDinhKem.name.split(".")[tepDinhKem.name.split(".").length - 1].toLowerCase())) {
        showNotification(0, "Tệp đính kèm không hợp lệ")
    }
    else {
        const VBTLData = {
            SoKyHieu: soKyHieu,
            TrichYeu: trichYeu,
            LoaiVanBan: tenLoaiVanBan,
            LoaiVanBanID: loaiVanBan || null,
            CoQuanBanHanhID: coQuanBanHanhID,
            TenCoQuanBanHanh: coQuanBanHanhText,
            NgayBanHanh: ngayBanHanh,
            NgayHieuLuc: ngayHieuLuc,
            NgayHetHan: ngayHetHan,
            NguoiKy: nguoiKy,
            NoiDung: noiDung,
            TepDinhKem: tepDinhKem
        };

        const VBTL = {
            SoKyHieu: soKyHieu,
            TrichYeu: trichYeu,
            LoaiVanBanID: loaiVanBan,
            CoQuanBanHanhID: coQuanBanHanhID,
            TenCoQuanBanHanh: coQuanBanHanhText,
            NgayBanHanh: formatDateToSaveAsString(ngayBanHanh),
            NgayHieuLuc: formatDateToSaveAsString(ngayHieuLuc),
            NgayHetHan: formatDateToSaveAsString(ngayHetHan),
            NguoiKy: nguoiKy,
            NoiDung: noiDung,
            TrangThai: true
        };

        const FileDinhKem = [];
        if (tepDinhKem) {
            FileDinhKem.push(tepDinhKem);
        }

        if (currentEditingVBTLIndexCoSo >= 0) {
            tempVBTLCoSo[currentEditingVBTLIndexCoSo] = VBTLData;
        } else {
            tempVBTLCoSo.push(VBTLData);
            RequestVBTLCoSo.push({
                RequestVanBan: VBTL,
                File: FileDinhKem
            });
        }

        refreshTempVBTLTableCoSo();
        $('#modalVBTLCoSo').modal('hide');
        showNotification(1, currentEditingVBTLIndexCoSo >= 0 ? 'Cập nhật thành công' : 'Thêm thành công');
        currentEditingVBTLIndexCoSo = -1;
    }

    //if (!soKyHieu || !trichYeu || !coQuanBanHanhID) {
    //    showNotification(0, 'Vui lòng nhập đầy đủ thông tin bắt buộc!');
    //    return;
    //}

    
}

function createRequestVBTLCoSo() {
    const requestVBTLs = RequestVBTLCoSo.filter(vbtl => !vbtl.isExisting);
    return requestVBTLs;
}

//#region function validation
//const checkTagHtmlSingle = (input) => {
//    // Loại bỏ khoảng trắng đầu/cuối và kiểm tra bằng regex
//    if (!input || input.trim() === "") return false; // Cho phép chuỗi rỗng hoặc toàn khoảng trắng
//    const regex = /<[^>]+>/g;
//    return regex.test(input);
//}

//const isValidEmailAllowEmpty = (input) => {
//    if (!input || input.trim() === "") return false; // Rỗng vẫn hợp lệ

//    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
//    return !regex.test(input.trim());
//};

//const isValidUrlAllowEmpty = (input) => {
//    if (!input || input.trim() === "") return false; // Rỗng vẫn hợp lệ

//    const regex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/;
//    return !regex.test(input.trim());
//};

//const isInvalidPriceRange = (minValue, maxValue) => {
//    // Cho phép rỗng (nếu 1 trong 2 trống thì không tính là lỗi)
//    if (
//        minValue === undefined || maxValue === undefined ||
//        minValue === null || maxValue === null ||
//        minValue === "" || maxValue === ""
//    ) {
//        return false;
//    }

//    // Nếu có ký tự không hợp lệ (chỉ cho phép số và dấu chấm)
//    const validFormat = /^[0-9.]+$/;
//    if (!validFormat.test(minValue) || !validFormat.test(maxValue)) {
//        return true; // lỗi vì chứa text hoặc ký tự lạ
//    }

//    // Loại bỏ dấu chấm ngăn cách nghìn (VD: "1.000.000" → "1000000")
//    const cleanMin = String(minValue).replace(/\./g, "");
//    const cleanMax = String(maxValue).replace(/\./g, "");

//    const min = parseFloat(cleanMin);
//    const max = parseFloat(cleanMax);

//    // Nếu không phải số hợp lệ thì lỗi
//    if (isNaN(min) || isNaN(max)) return true;

//    // Trả về true nếu giá cao nhất nhỏ hơn giá thấp nhất
//    return max < min;
//};

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

    console.log(ngayCap, ngayHetHan )
    // Nếu thiếu 1 trong 2 → không lỗi
    if (!ngayCap || !ngayHetHan) return false;

    const start = new Date(formatDateToSaveAsString(ngayCap));
    const end = new Date(formatDateToSaveAsString(ngayHetHan));

    // Nếu ngày không hợp lệ
    if (isNaN(start) || isNaN(end)) return true;

    return end < start;
};

const fileAccepted = ['doc', 'docx', 'pdf', '']



