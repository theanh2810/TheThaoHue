const baseUrl = getRootLink();
const ckeditormoTaCoSoAnUong = CKEDITOR.replace('moTaCoSoAnUongAdd');

$(document).ready(function () {
    initDatePicker();
    initDanhMucChung_NoAll(50, "#loaiDichVuAnUongAdd", "") // Loại dịch vụ ăn uống
    initNgonNgu("#ngonNguDichCoSoAnUongAdd")
    previewPicture()
    previewPictureSuKien()
    initSelect2();

    // Event handler cho thay đổi Ngôn ngữ
    $(document).on('change', '#ngonNguDichCoSoAnUongAdd', function() {
        $('#tenCoSoAnUongAdd').val('');
        $('#moTaCoSoAnUongAdd').val('');
        $('#nguoiDaiDienCoSoAnUongAdd').val('');
        $('#diaChiCoSoAnUongAdd').val('');
        $('#traiNghiemCoSoAnUongAdd').val('');
        $('#goiYCoSoAnUongAdd').val('');
    });

    $("#btnSaveAdd").on("click", function () {
        dataAddCoSoAnUong();
    })

    // Khởi tạo bảng loại ẩm thực
    initLoaiAmThucTable();
});

//#region Xử lý thông tin chung
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

function dataAddCoSoAnUong() {
    // Thông tin chung
    const AnhDaiDien = $("#fileAnhDaiDienPrev")[0].files[0] || null;
    const diaDiemID = $("#DiaDiemCoSanAdd").val();
    const loaiCoSoID = $("#loaiCoSoAnUongAdd").val();
    const phongCachCoSoID = $("#phongCachCoSoAnUongAdd").val();
    const loaiDichVuAnUongID = $("#loaiDichVuAnUongAdd").val();
    const hangSao = $("#hangSaoCoSoAnUongAdd").val();
    const sucChua = $("#sucChuaCoSoAnUongAdd").val();
    const diemDanhGia = $("#diemDanhGiaCoSoAnUongAdd").val();
    const soLuotDanhGia = $("#soLuotDanhGiaCoSoAnUongAdd").val();
    const dienThoai = $("#dienThoaiCoSoAnUongAdd").val();
    const hopThu = $("#hopThuCoSoAnUongAdd").val();
    const lienKet = $("#lienKetCoSoAnUongAdd").val();
    const gioMoCua = $("#gioMoCuaCoSoAnUongAdd").val();
    const gioDongCua = $("#gioDongCuaCoSoAnUongAdd").val();
    const thuTu = $("#thuTuAdd").val();
    let ngayNghiHangTuanOption = $("#ngayNghiHangTuan").val()
    let ngayNghiHangTuan = null
    if (ngayNghiHangTuanOption.length > 0) {
        ngayNghiHangTuan = ngayNghiHangTuanOption.join("-")
    }
    const tiecGiaDinh = $("#tiecGiaDinhCoSoAnUongAdd").is(':checked');
    const tiecDongNguoi = $("#tiecDongNguoiCoSoAnUongAdd").is(':checked');
    const coPhongRieng = $("#coPhongRiengCoSoAnUongAdd").is(':checked');
    const coVuiChoiTreEm = $("#coVuiChoiTreEmCoSoAnUongAdd").is(':checked');
    const chuanDuLich = $("#chuanDuLichCoSoAnUongAdd").is(':checked');
    const trangThai = $("input[name='trangThaiHoatDong']:checked").val() == 1 ? true : false;
    

    // Đa ngữ
    const maNgonNgu = $("#ngonNguDichCoSoAnUongAdd").val();
    const tenCoSo = $("#tenCoSoAnUongAdd").val();
    const moTa = ckeditormoTaCoSoAnUong.getData();
    const nguoiDaiDien = $("#nguoiDaiDienCoSoAnUongAdd").val();
    const diaChi = $("#diaChiCoSoAnUongAdd").val();
    //const traiNghiem = ckeditortraiNghiemCoSoAnUong.getData();
    //const goiY = ckeditorgoiYCoSoAnUong.getData();

    const dtCoSo = {
        DiaDiemID: diaDiemID || null,
        LoaiCoSoID: loaiCoSoID || null,
        PhongCachCoSoID: phongCachCoSoID || null,
        LoaiDichVuAnUongID: loaiDichVuAnUongID || null,
        HangSao: hangSao || null,
        SucChua: sucChua || null,
        DiemDanhGia: diemDanhGia || null,
        SoLuotDanhGia: soLuotDanhGia || 0,
        DienThoai: dienThoai || null,
        HopThu: hopThu || null,
        LienKet: lienKet || null,
        GioMoCua: gioMoCua || null,
        GioDongCua: gioDongCua || null,
        ngayNghiHangTuan: ngayNghiHangTuan,
        TiecGiaDinh: tiecGiaDinh,
        TiecDongNguoi: tiecDongNguoi,
        CoPhongRieng: coPhongRieng,
        CoVuiChoiTreEm: coVuiChoiTreEm,
        ChuanDuLich: chuanDuLich,
        TrangThai: trangThai,
        MaNgonNgu: maNgonNgu,
        TenCoSo: tenCoSo,
        MoTa: moTa,
        NguoiDaiDien: nguoiDaiDien,
        DiaChi: diaChi,
        thuTu: thuTu || null,
        //TraiNghiem: traiNghiem,
        //GoiY: goiY
    };

    let dtLoaiAmThuc = tempLoaiAmThuc;
    let requestDaPhuongTien = createRequestDaPhuongTiens();
    let requestVBTL = createRequestVBTLCoSo();

    console.log(dtLoaiAmThuc, requestDaPhuongTien)
    let formData = new FormData();
    formData.append('RequestCoSoAnUong', JSON.stringify(dtCoSo));
    formData.append('RequestLoaiAmThuc', JSON.stringify(dtLoaiAmThuc));
    formData.append("File", AnhDaiDien)

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

    if (AnhDaiDien == null) {
        showNotification(0, "Vui lòng chọn ảnh đại diện")
    }
    else if (isValidPositiveIntegerAllowEmpty(sucChua) || sucChua >= 2147483647) {
        showNotification(0, "Sức chứa không hợp lệ")
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
    else if (checkEmptyBlank(loaiDichVuAnUongID)) {
        showNotification(0, "Vui lòng chọn loại dịch vụ ăn uống")
    }
    else if (checkEmptyBlank(tenCoSo)) {
        showNotification(0, "Vui lòng nhập tên cơ sở ăn uống")
    }
    else if (checkTagHtmlSingle(tenCoSo)) {
        showNotification(0, "Tên cơ sở ăn uống chứa ký tự không hợp lệ")
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
            url: `${baseUrl}/api/DL_CoSoAnUongApi/Add`,
            async: false,
            contentType: false,
            processData: false,
            data: formData,
            success: function (data) {
                if (data.isSuccess && data.value) {
                    showNotification(1, "Thêm cơ sở ăn uống thành công");
                    setTimeout(function () {
                        window.location.href = `${baseUrl}/AdminTool/CoSoAnUong`;
                    }, 2000);
                } else {
                    showNotification(0, "Thêm cơ sở ăn uống không thành công");
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

//#region Xử lý loại ẩm thực
let tempLoaiAmThuc = [];
let allLoaiAmThuc = []; // danh sách gốc lấy từ API

let editingRowNode = null;   // node (tr) hiện đang edit / add
let editingOldID = null;     // LoaiAmThucID cũ (nếu đang edit)
let originalRowData = null;  // để restore khi hủy
let table = null;

function initLoaiAmThucTable() {
    initListLoaiAmThuc();
    tempLoaiAmThuc = [];

    // Nếu table đã tồn tại, destroy để recreate (tránh xung đột)
    if ($.fn.DataTable.isDataTable('#tableLoaiAmThucCoSoAnUong')) {
        $('#tableLoaiAmThucCoSoAnUong').DataTable().clear().destroy();
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
                    return `<input type="checkbox" id="trangThaiLoaiAmThucAdd" name="trangThaiLoaiAmThuc" ${row.TrangThai ? "checked" : ""}>`;
                } else {
                    return row.TrangThai ? `<span class="TrangThai green-text">Sử dụng</span>` : `<span class="TrangThai red-text">Không sử dụng</span>`;
                }
            }
        },
        {
            targets: 3,
            render: function (data, type, row, meta) {
                if (row._isNew) {
                    return `
                        <button type="button" class="btnSaveLoaiAmThuc hgi-icon hgi-check"></button>
                        <button type="button" class="btnCancelLoaiAmThuc hgi-icon hgi-cancel"></button>
                    `;
                }

                const editIcon = `<i class="edit-am-thuc cursor-pointer me-2" data-row-index="${meta.row}"><i class="hgi-icon hgi-edit"></i></i>`;
                const deleteIcon = `<i class="delete-am-thuc cursor-pointer text-danger" data-row-index="${meta.row}"><i class="hgi-icon hgi-delete"></i></i>`;
                return editIcon + deleteIcon;
            }
        }
    ];

    const tableCols = [
        { data: null, width: "40px", class: "center-align" },
        { data: "TenLoaiAmThuc", class: "left-align" },
        { data: "TrangThai", width: "180px", class: "left-align" },
        { data: null, width: "180px", class: "center-align group-icon-action" }
    ];

    const table = $('#tableLoaiAmThucCoSoAnUong').DataTable({
        data: tempLoaiAmThuc,
        columns: tableCols,
        columnDefs: tableDefs,
        paging: false,
        searching: false,
        info: false,
        ordering: false,
        autoWidth: false,
        responsive: true,
        language: {
            emptyTable: "Chưa có loại ẩm thực nào"
        }
    });

    // Sinh select: dựa trên allLoaiAmThuc (danh sách gốc)
    // Loại bỏ những mục đã có trong tempLoaiAmThuc, nhưng nếu selectedId được truyền
    // thì vẫn cho phép chọn selectedId (để edit được giá trị hiện tại).
    function createSelectLoaiAmThuc(selectedId = "") {
        let options = `<option value="">Chọn</option>`;

        // Tính các ID đã được chọn trong temp (trừ selectedId)
        const chosenIDs = tempLoaiAmThuc.map(x => x.LoaiAmThucID).filter(id => id !== selectedId);

        allLoaiAmThuc.forEach(t => {
            if (!chosenIDs.includes(t.danhMucID) || t.danhMucID === selectedId) {
                options += `<option value="${t.danhMucID}" ${t.danhMucID === selectedId ? "selected" : ""}>${t.tenDanhMuc}</option>`;
            }
        });

        return `<select id="selectLoaiAmThuc" class="form-control">${options}</select>`;
    }

    // === Thêm dòng mới ===
    let newRow = null;
    $('#btnAddLoaiAmThucCoSoAnUong').on('click', function () {
        if (editingRowNode) return;

        const rowData = {
            stt: table.rows().count() + 1,
            TenLoaiAmThuc: createSelectLoaiAmThuc(),
            TrangThai: `<input type="checkbox" id="trangThaiLoaiAmThucAdd" name="trangThaiLoaiAmThuc">`,
            _isNew: true
        };

        newRow = table.row.add(rowData).draw(false).node();
        $(newRow).addClass('adding');
        editingRowNode = $(newRow);
        editingOldID = null; // add mới => không có oldID
        originalRowData = null;
        initSelect2(); // khởi tạo select2 cho select vừa thêm
    });

    // === Lưu dòng mới hoặc chỉnh sửa ===
    $('#tableLoaiAmThucCoSoAnUong').off('click', '.btnSaveLoaiAmThuc').on('click', '.btnSaveLoaiAmThuc', function () {
        let $select = editingRowNode ? editingRowNode.find('#selectLoaiAmThuc') : $('#selectLoaiAmThuc');
        if ($select.length === 0) {
            showNotification(0, "Không tìm thấy select để lưu.");
            return;
        }

        let danhMucID = $select.val();
        let tenDanhMuc = $select.find('option:selected').text();
        let TrangThai = $('#trangThaiLoaiAmThucAdd').is(':checked');

        if (!danhMucID) {
            showNotification(0, "Vui lòng chọn tổ chức đạt giải!");
            return;
        }

        const rowData = {
            TenLoaiAmThuc: tenDanhMuc,
            TrangThai: TrangThai ? "Sử dụng" : "Không sử dụng",
            LoaiAmThucID: parseInt(danhMucID),
            _isNew: false
        };

        const Data = {
            LoaiAmThucID: parseInt(danhMucID),
            TenLoaiAmThuc: tenDanhMuc,
            TrangThai: TrangThai,
        };

        // Cập nhật hàng trên DataTable (sử dụng editingRowNode)
        if (editingRowNode) {
            table.row(editingRowNode).data(rowData).draw(false);
        } else {
            table.row('.adding').data(rowData).draw(false);
        }

        // Nếu đang edit (editingOldID khác null) => xóa phần tử cũ khỏi temp
        if (editingOldID) {
            tempLoaiAmThuc = tempLoaiAmThuc.filter(x => x.LoaiAmThucID !== editingOldID);
        }

        // Nếu phần tử mới đã tồn tại thì update, ngược lại push
        let idx = tempLoaiAmThuc.findIndex(x => x.LoaiAmThucID === danhMucID);
        if (idx > -1) tempLoaiAmThuc[idx] = Data;
        else tempLoaiAmThuc.push(Data);

        // Render lại bảng từ temp (đảm bảo stt chính xác)
        table.clear().rows.add(tempLoaiAmThuc).draw();

        // Reset trạng thái edit/add
        editingRowNode = null;
        editingOldID = null;
        originalRowData = null;
        newRow = null;
    });

    // === Hủy thêm dòng ===
    $('#tableLoaiAmThucCoSoAnUong').off('click', '.btnCancelLoaiAmThuc').on('click', '.btnCancelLoaiAmThuc', function () {
        if (!editingRowNode) {
            // fallback: tìm row .adding
            editingRowNode = $('#tableLoaiAmThucCoSoAnUong').find('tr.adding');
        }

        if (originalRowData && editingRowNode && originalRowData.TenLoaiAmThuc) {
            // restore dữ liệu gốc (trường hợp đang edit)
            table.row(editingRowNode).data(originalRowData).draw(false);
        } else {
            // trường hợp add mới -> remove row
            table.row('.adding').remove().draw(false);
        }

        // Reset trạng thái
        editingRowNode = null;
        editingOldID = null;
        originalRowData = null;
        newRow = null;
    });

    // === Chỉnh sửa dòng ===
    $('#tableLoaiAmThucCoSoAnUong').on('click', '.edit-am-thuc', function () {
        if (editingRowNode) return; // đang có row mới/đang edit thì không cho edit thêm

        const rowNode = $(this).closest('tr');
        const rowData = table.row(rowNode).data();

        // Lưu lại dữ liệu gốc để restore khi cancel
        originalRowData = { ...rowData };

        // Lưu ID cũ vào biến (không lưu vào DOM)
        editingOldID = rowData.LoaiAmThucID || rowData.danhMucID || null;
        console.log(rowData)

        // Tạo select và show lên hàng hiện tại, cho phép selectedId = editingOldID
        const editRowData = {
            TenLoaiAmThuc: createSelectLoaiAmThuc(rowData.LoaiAmThucID),
            TrangThai: `<input type="checkbox" id="trangThaiLoaiAmThucAdd" name="trangThaiLoaiAmThuc" ${rowData.TrangThai === "Sử dụng" ? "checked" : ""}>`,
            _isNew: true
        };

        table.row(rowNode).data(editRowData).draw(false);
        $(rowNode).addClass('adding');
        editingRowNode = $(rowNode);

        // Khởi tạo select2 cho select vừa render
        initSelect2();
        newRow = rowNode;
    });

    // === Xóa dòng ===
    $('#tableLoaiAmThucCoSoAnUong').on('click', '.delete-am-thuc', function () {
        const rowNode = $(this).closest('tr');
        const rowData = table.row(rowNode).data();
        const idToRemove = rowData.LoaiAmThucID || rowData.danhMucID;

        // Remove từ tempLoaiAmThuc theo ID
        tempLoaiAmThuc = tempLoaiAmThuc.filter(x => x.LoaiAmThucID !== idToRemove);

        // Re-render table
        table.clear().rows.add(tempLoaiAmThuc).draw();
    });
}

function initListLoaiAmThuc() {
    // Lưu danh sách gốc vào allLoaiAmThuc
    allLoaiAmThuc = []; // reset
    let data = JSON.stringify({ loaiDanhMucID: 51, trangThai: true })
    getDataWithApi('POST', '/api/DanhMucChungApi/DanhSach', data).then(res => {
        if (res && res.isSuccess && res.value && res.value.length > 0) {
            allLoaiAmThuc = res.value;
        }
    });
}

function getLoaiAmThucList() {
    return tempLoaiAmThuc;
}
//#endregion Xử lý loại ẩm thực

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

