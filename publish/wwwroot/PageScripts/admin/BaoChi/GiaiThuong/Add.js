const baseUrl = getRootLink();
const ckeditormoTa = CKEDITOR.replace('moTa');

$(document).ready(function () {
    console.log("Hehehehehe")
    initDatePicker();
    initLinhVucCapCha_NoAll("#linhVuc", "")
    initDanhMucChung_NoAll(64, "#loaiGiaiThuong", "")
    initDanhMucChung_NoAll(65, "#capGiaiThuong", "")
    initDanhMucChung_NoAll(66, "#hangGiaiThuong", "")
    initToChuc_NoAll("", "#toChucTraoThuong", "", 5)
    //if ($("#linhVuc").val() == null || $("#linhVuc").val() == "") {
    //    $("#ToChucDatGiai-tab, #CaNhanDatGiai-tab").hide()
    //}
    //$(document).on('change', '#linhVuc', function () {
    //    let linhVucID = $(this).val();
    //    if (linhVucID == null || linhVucID == "") {
    //        $("#ToChucDatGiai-tab, #CaNhanDatGiai-tab").hide()
    //        $("#toChucTraoThuong").prop("disabled", true);
    //    } else {
    //        $("#ToChucDatGiai-tab, #CaNhanDatGiai-tab").show()
    //        initToChuc_NoAll("", "#toChucTraoThuong", "", linhVucID) // Tổ chức trao thưởng
    //        $("#toChucTraoThuong").prop("disabled", false);
    //        if (linhVucID == 3) {
    //            initListTheThao();
    //            $(".monTheThao").show();
    //        } else {
    //            $(".monTheThao").hide();
    //            $("#monTheThao").val(null).trigger('change');
    //        }
    //    }
    //    // Reset bảng và dữ liệu
    //    isToChucDatGiaiInitialized = false;
    //    tempToChucDatGiai = [];
    //    if ($.fn.DataTable.isDataTable('#tableToChucDatGiai')) {
    //        $('#tableToChucDatGiai').DataTable().clear().draw();
    //    }
    //    // Chạy lại danh sách tổ chức đạt giải
    //    listToChucDatGiai = [];
    //    initListToChucDatGiai(linhVucID);
    //    // Nếu đang có dòng thêm mới chưa hủy thì xóa luôn dòng đó để tránh lỗi
    //    if ($('.adding').length) {
    //        $('#tableToChucDatGiai').DataTable().row('.adding').remove().draw(false);
    //    }

    //    // Reset bảng và dữ liệu
    //    isCaNhanDatGiaiInitialized = false;
    //    tempCaNhanDatGiai = [];
    //    if ($.fn.DataTable.isDataTable('#tableCaNhanDatGiai')) {
    //        $('#tableCaNhanDatGiai').DataTable().clear().draw();
    //    }
    //    // Chạy lại danh sách tổ chức đạt giải
    //    listCaNhanDatGiai = [];
    //    initListCaNhanDatGiai(linhVucID);
    //    // Nếu đang có dòng thêm mới chưa hủy thì xóa luôn dòng đó để tránh lỗi
    //    if ($('.adding').length) {
    //        $('#tableCaNhanDatGiai').DataTable().row('.adding').remove().draw(false);
    //    }
    //})
    initNgonNgu("#ngonNguDich")
    previewPicture()
    previewPictureSuKien()
    initSelect2();

    // Khởi tạo bảng tổ chức đạt giải
    initToChucDatGiaiTable(5);
    initCaNhanDatGiaiTable(5);

    // Event handler cho thay đổi Ngôn ngữ
    $(document).on('change', '#ngonNguDich', function () {
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
});

//#region Xử lý thông tin chung
function initListTheThao() {
    getDataWithApi('GET', '/api/TT_MonTheThaoApi/Gets?MaNgonNgu=vi').then(data => {
        if (data && data.isSuccess && data.value.length > 0) {
            $("#monTheThao").empty().append(`<option value="">Tất cả</option>`).attr("data-placeholder", "Chọn...");
            data.value.forEach(item => {
                $("#monTheThao").append(`<option value="${item.monTheThaoID}">${item.tenMon}</option>`);
            });
        }
    })
}

function dataAddCoSoLuuTru() {
    // Thông tin chung
    // const fileAnhDaiDien = $("#fileAnhDaiDienPrev")[0].files[0] || null;
    //const linhVucID = $("#linhVuc").val();
    const maDinhDanh = $("#maGiaiThuong").val();
    const loaiGiaiThuongID = $("#loaiGiaiThuong").val();
    const capGiaiThuongID = $("#capGiaiThuong").val();
    const hangGiaiThuongID = $("#hangGiaiThuong").val();
    const toChucTraoThuongID = $("#toChucTraoThuong").val();
    const ngayTraoGiai = formatDateToSaveAsString($("#ngayTraoGiai").val());
    const monTheThaoID = $("#monTheThao").val();
    const trangThai = $("input[name='trangThai']:checked").val() == 1 ? true : false;
    const thuTu = $("#thuTu").val();

    // Đa ngữ
    const maNgonNgu = $("#ngonNguDich").val();
    const tenGiaiThuong = $("#tenGiaiThuong").val();
    const doiTuong = $("#doiTuongGiaiThuong").val();
    const moTa = ckeditormoTa.getData();
    // const ngayBatDau = $("#ngayBatDau").val();
    // const ngayKetThuc = $("#ngayKetThuc").val();

    // tổ chức và cá nhân đạt giải  
    const ToChucDatGiaiList = getToChucDatGiaiList();
    const CaNhanDatGiaiList = getCaNhanDatGiaiList();

    const dtGiaiThuong = {
        LinhVucID: 5 || null,
        MaDinhDanh: maDinhDanh || null,
        LoaiID: loaiGiaiThuongID || null,
        CapID: capGiaiThuongID || null,
        HangID: hangGiaiThuongID || null,
        ToChucID: toChucTraoThuongID || null,
        MonTheThaoID: monTheThaoID || null,
        TrangThai: trangThai,
        MaNgonNgu: maNgonNgu,
        TenThanhTich: tenGiaiThuong,
        DoiTuong: doiTuong,
        MoTa: moTa,
        NgayTraoGiai: ngayTraoGiai,
        ThuTu: thuTu,
        ListIDTacPham: "EC4DA434-BC9A-F011-9B97-70E2842C7B2F,7C8869FB-199D-F011-9B97-70E2842C7B2F"
    };

    // Tổ chức và cá nhân đạt giải
    const dtDoiTuongDatGiai = []
    if (ToChucDatGiaiList.length > 0) {
        ToChucDatGiaiList.map(item => {
            dtDoiTuongDatGiai.push(item)
        })
    }

    if (CaNhanDatGiaiList.length > 0) {
        CaNhanDatGiaiList.map(item => {
            dtDoiTuongDatGiai.push(item)
        })
    }

    // Tài liệu truyền thông
    const requestDaPhuongTien = createRequestDaPhuongTiens();

    // Văn bản tài liệu
    // const requestVBTL = createRequestVBTLCoSo();

    //if (!linhVucID) {
    //    showNotification(0, "Vui lòng chọn lĩnh vực");
    //    return;
    //}




    let formData = new FormData();
    formData.append('EntityThanhTich', JSON.stringify(dtGiaiThuong));
    formData.append('EntityDoiTuong', JSON.stringify(dtDoiTuongDatGiai));
    // formData.append("File", fileAnhDaiDien);
    // formData.append('RequestVBTL', requestInfo.RequestVBTL);

    // Thêm tài liệu truyền thông
    for (let i = 0; i < requestDaPhuongTien.length; i++) {
        formData.append(`EntityDaPhuongTien[${i}].DaPhuongTien`, JSON.stringify(requestDaPhuongTien[i].DaPhuongTien));
        formData.append(`EntityDaPhuongTien[${i}].DaPhuongTien_NoiDung`, JSON.stringify(requestDaPhuongTien[i].DaPhuongTien_NoiDung));
        formData.append(`EntityDaPhuongTien[${i}].File`, requestDaPhuongTien[i].File[0]);
    }

    // Thêm văn bản tài liệu
    // for (let i = 0; i < requestVBTL.length; i++) {
    //     formData.append(`EntityVanBan[${i}].RequestVanBan`, JSON.stringify(requestVBTL[i].RequestVanBan));
    //     formData.append(`EntityVanBan[${i}].File`, requestVBTL[i].File[0]);
    // }   

    $.ajax({
        type: 'POST',
        url: `${baseUrl}/api/DM_ThanhTichApi/Add`,
        async: false,
        contentType: false,
        processData: false,
        data: formData,
        success: function (data) {
            if (data.isSuccess && data.value) {
                showNotification(1, "Thêm mới giải thưởng thành công");
                setTimeout(function () {
                    window.location.href = `${baseUrl}/AdminTool/GiaiThuong/GiaiThuong`;
                }, 2000);
            } else {
                showNotification(0, "Thêm mới giải thưởng không thành công");
                console.log(data.error);
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
}
//#endregion Xử lý thông tin chung

//#region Xử lý tổ chức đạt giải
let tempToChucDatGiai = [];
let allToChucDatGiai = []; // danh sách gốc lấy từ API
let isToChucDatGiaiInitialized = false;

let editingRowNode = null;   // node (tr) hiện đang edit / add
let editingOldID = null;     // DoiTuongID cũ (nếu đang edit)
let originalRowData = null;  // để restore khi hủy
let table = null;

function initToChucDatGiaiTable(IDLinhVuc) {
    // Lấy danh sách gốc (nếu chưa lấy hoặc muốn refresh)
    if (!isToChucDatGiaiInitialized) {
        initListToChucDatGiai(IDLinhVuc);
        isToChucDatGiaiInitialized = true;
    } else {
        initListToChucDatGiai(IDLinhVuc); // refresh khi thay đổi lĩnh vực
    }

    // Reset data tạm
    tempToChucDatGiai = [];

    // Nếu table đã tồn tại, destroy để recreate (tránh xung đột)
    if ($.fn.DataTable.isDataTable('#tableToChucDatGiai')) {
        $('#tableToChucDatGiai').DataTable().clear().destroy();
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
            render: function (data, type, row, meta) {
                if (row._isNew) {
                    return `
                        <button type="button" class="btnSaveToChucDatGiai hgi-icon hgi-check"></button>
                        <button type="button" class="btnCancelToChucDatGiai hgi-icon hgi-cancel"></button>
                    `;
                }

                const editIcon = `<i class="edit-to-chuc-dat-giai cursor-pointer me-2" data-row-index="${meta.row}"><i class="hgi-icon hgi-edit"></i></i>`;
                const deleteIcon = `<i class="delete-to-chuc-dat-giai cursor-pointer text-danger" data-row-index="${meta.row}"><i class="hgi-icon hgi-delete"></i></i>`;
                return editIcon + deleteIcon;
            }
        }
    ];

    const tableCols = [
        { data: null, width: "40px", class: "center-align" },
        { data: "TenToChucDatGiai", class: "left-align" },
        { data: null, width: "180px", class: "center-align group-icon-action" }
    ];

    table = $('#tableToChucDatGiai').DataTable({
        data: tempToChucDatGiai,
        columns: tableCols,
        columnDefs: tableDefs,
        paging: false,
        searching: false,
        info: false,
        ordering: false,
        autoWidth: false,
        responsive: true,
        language: {
            emptyTable: "Chưa có tổ chức đạt giải nào"
        }
    });

    // Sinh select: dựa trên allToChucDatGiai (danh sách gốc)
    // Loại bỏ những mục đã có trong tempToChucDatGiai, nhưng nếu selectedId được truyền
    // thì vẫn cho phép chọn selectedId (để edit được giá trị hiện tại).
    function createSelectToChucDatGiai(selectedId = "") {
        let options = `<option value="">Chọn</option>`;

        // Tính các ID đã được chọn trong temp (trừ selectedId)
        const chosenIDs = tempToChucDatGiai.map(x => x.DoiTuongID).filter(id => id !== selectedId);

        allToChucDatGiai.forEach(t => {
            if (!chosenIDs.includes(t.toChucID) || t.toChucID === selectedId) {
                options += `<option value="${t.toChucID}" ${t.toChucID === selectedId ? "selected" : ""}>${t.tenToChuc}</option>`;
            }
        });

        return `<select id="selectToChucDatGiai" class="form-control">${options}</select>`;
    }

    // === Thêm dòng mới ===
    let newRow = null;
    $('#btnAddToChucDatGiai').off('click').on('click', function () {
        if (editingRowNode) return; // đang edit/add thì không cho thêm

        const rowData = {
            TenToChucDatGiai: createSelectToChucDatGiai(),
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
    $('#tableToChucDatGiai').off('click', '.btnSaveToChucDatGiai').on('click', '.btnSaveToChucDatGiai', function () {
        // Lấy giá trị từ select đang active (trong hàng adding)
        let $select = editingRowNode ? editingRowNode.find('#selectToChucDatGiai') : $('#selectToChucDatGiai');
        if ($select.length === 0) {
            showNotification(0, "Không tìm thấy select để lưu.");
            return;
        }

        let toChucID = $select.val();
        let tenToChuc = $select.find('option:selected').text();

        if (!toChucID) {
            showNotification(0, "Vui lòng chọn tổ chức đạt giải!");
            return;
        }

        const rowData = {
            TenToChucDatGiai: tenToChuc,
            toChucID: toChucID,
            _isNew: false
        };

        const Data = {
            DoiTuongID: toChucID,
            TenToChucDatGiai: tenToChuc,
            LoaiDoiTuong: 0,
            TrangThai: true
        };

        // Cập nhật hàng trên DataTable (sử dụng editingRowNode)
        if (editingRowNode) {
            table.row(editingRowNode).data(rowData).draw(false);
        } else {
            table.row('.adding').data(rowData).draw(false);
        }

        // Nếu đang edit (editingOldID khác null) => xóa phần tử cũ khỏi temp
        if (editingOldID) {
            tempToChucDatGiai = tempToChucDatGiai.filter(x => x.DoiTuongID !== editingOldID);
        }

        // Nếu phần tử mới đã tồn tại thì update, ngược lại push
        let idx = tempToChucDatGiai.findIndex(x => x.DoiTuongID === toChucID);
        if (idx > -1) tempToChucDatGiai[idx] = Data;
        else tempToChucDatGiai.push(Data);

        // Render lại bảng từ temp (đảm bảo stt chính xác)
        table.clear().rows.add(tempToChucDatGiai).draw();

        // Reset trạng thái edit/add
        editingRowNode = null;
        editingOldID = null;
        originalRowData = null;
        newRow = null;
    });

    // === Hủy thêm/chỉnh sửa ===
    $('#tableToChucDatGiai').off('click', '.btnCancelToChucDatGiai').on('click', '.btnCancelToChucDatGiai', function () {
        if (!editingRowNode) {
            // fallback: tìm row .adding
            editingRowNode = $('#tableToChucDatGiai').find('tr.adding');
        }

        if (originalRowData && editingRowNode && originalRowData.TenToChucDatGiai) {
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
    $('#tableToChucDatGiai').off('click', '.edit-to-chuc-dat-giai').on('click', '.edit-to-chuc-dat-giai', function () {
        if (editingRowNode) return; // đang có row mới/đang edit thì không cho edit thêm

        const rowNode = $(this).closest('tr');
        const rowData = table.row(rowNode).data();

        // Lưu lại dữ liệu gốc để restore khi cancel
        originalRowData = { ...rowData };

        // Lưu ID cũ vào biến (không lưu vào DOM)
        editingOldID = rowData.DoiTuongID || rowData.toChucID || null;

        // Tạo select và show lên hàng hiện tại, cho phép selectedId = editingOldID
        const editRowData = {
            TenToChucDatGiai: createSelectToChucDatGiai(editingOldID),
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
    $('#tableToChucDatGiai').off('click', '.delete-to-chuc-dat-giai').on('click', '.delete-to-chuc-dat-giai', function () {
        const rowNode = $(this).closest('tr');
        const rowData = table.row(rowNode).data();
        const idToRemove = rowData.DoiTuongID || rowData.toChucID;

        // Remove từ tempToChucDatGiai theo ID
        tempToChucDatGiai = tempToChucDatGiai.filter(x => x.DoiTuongID !== idToRemove);

        // Re-render table
        table.clear().rows.add(tempToChucDatGiai).draw();
    });
}

function initListToChucDatGiai(IDLinhVuc) {
    // Lưu danh sách gốc vào allToChucDatGiai
    allToChucDatGiai = []; // reset
    let data = JSON.stringify({ trangThai: true, maNgonNgu: 'vi', linhVucID: IDLinhVuc });
    getDataWithApi('POST', '/api/ToChucApi/DanhSach', data).then(res => {
        if (res && res.isSuccess && res.value && res.value.length > 0) {
            console.log(res.value.length)
            allToChucDatGiai = res.value;
        }
    });
}

function getToChucDatGiaiList() {
    return tempToChucDatGiai;
}
//#endregion Xử lý tổ chức đạt giải

//#region Xử lý cá nhân đạt giải
let tempCaNhanDatGiai = [];
let allCaNhanDatGiai = []; // danh sách gốc lấy từ API
let isCaNhanDatGiaiInitialized = false;

let editingRowNodeCaNhan = null;   // node (tr) hiện đang edit / add
let editingOldIDCaNhan = null;     // DoiTuongID cũ (nếu đang edit)
let originalRowDataCaNhan = null;  // để restore khi hủy
let tableCaNhan = null;

function initCaNhanDatGiaiTable(IDLinhVuc) {
    // Lấy danh sách gốc (nếu chưa lấy hoặc muốn refresh)
    if (!isCaNhanDatGiaiInitialized) {
        initListCaNhanDatGiai(IDLinhVuc);
        isCaNhanDatGiaiInitialized = true;
    } else {
        initListCaNhanDatGiai(IDLinhVuc); // refresh khi thay đổi lĩnh vực
    }

    // Reset data tạm
    tempCaNhanDatGiai = [];

    // Nếu table đã tồn tại, destroy để recreate (tránh xung đột)
    if ($.fn.DataTable.isDataTable('#tableCaNhanDatGiai')) {
        $('#tableCaNhanDatGiai').DataTable().clear().destroy();
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
            render: function (data, type, row, meta) {
                if (row._isNew) {
                    return `
                        <button type="button" class="btnSaveCaNhanDatGiai hgi-icon hgi-check"></button>
                        <button type="button" class="btnCancelCaNhanDatGiai hgi-icon hgi-cancel"></button>
                    `;
                }

                const editIcon = `<i class="edit-ca-nhan-dat-giai cursor-pointer me-2" data-row-index="${meta.row}"><i class="hgi-icon hgi-edit"></i></i>`;
                const deleteIcon = `<i class="delete-ca-nhan-dat-giai cursor-pointer text-danger" data-row-index="${meta.row}"><i class="hgi-icon hgi-delete"></i></i>`;
                return editIcon + deleteIcon;
            }
        }
    ];

    const tableCols = [
        { data: null, width: "40px", class: "center-align" },
        { data: "TenCaNhanDatGiai", class: "left-align" },
        { data: null, width: "180px", class: "center-align group-icon-action" }
    ];

    tableCaNhan = $('#tableCaNhanDatGiai').DataTable({
        data: tempCaNhanDatGiai,
        columns: tableCols,
        columnDefs: tableDefs,
        paging: false,
        searching: false,
        info: false,
        ordering: false,
        autoWidth: false,
        responsive: true,
        language: {
            emptyTable: "Chưa có cá nhân đạt giải nào"
        }
    });

    // Sinh select: dựa trên allCaNhanDatGiai (danh sách gốc)
    // Loại bỏ những mục đã có trong tempCaNhanDatGiai, nhưng nếu selectedId được truyền
    // thì vẫn cho phép chọn selectedId (để edit được giá trị hiện tại).
    function createSelectCaNhanDatGiai(selectedId = "") {
        let options = `<option value="">Chọn</option>`;

        // Tính các ID đã được chọn trong temp (trừ selectedId)
        const chosenIDs = tempCaNhanDatGiai.map(x => x.DoiTuongID).filter(id => id !== selectedId);

        allCaNhanDatGiai.forEach(t => {
            if (!chosenIDs.includes(t.caNhanID) || t.caNhanID === selectedId) {
                options += `<option value="${t.caNhanID}" ${t.caNhanID === selectedId ? "selected" : ""}>${t.hoTen}</option>`;
            }
        });

        return `<select id="selectCaNhanDatGiai" class="form-control">${options}</select>`;
    }

    // === Thêm dòng mới ===
    let newRowCaNhan = null;
    $('#btnAddCaNhanDatGiai').off('click').on('click', function () {
        if (editingRowNodeCaNhan) return; // đang edit/add thì không cho thêm

        const rowData = {
            TenCaNhanDatGiai: createSelectCaNhanDatGiai(),
            _isNew: true
        };

        newRowCaNhan = tableCaNhan.row.add(rowData).draw(false).node();
        $(newRowCaNhan).addClass('adding');
        editingRowNodeCaNhan = $(newRowCaNhan);
        editingOldIDCaNhan = null; // add mới => không có oldID
        originalRowDataCaNhan = null;
        initSelect2(); // khởi tạo select2 cho select vừa thêm
    });

    // === Lưu dòng mới hoặc chỉnh sửa ===
    $('#tableCaNhanDatGiai').off('click', '.btnSaveCaNhanDatGiai').on('click', '.btnSaveCaNhanDatGiai', function () {
        // Lấy giá trị từ select đang active (trong hàng adding)
        let $select = editingRowNodeCaNhan ? editingRowNodeCaNhan.find('#selectCaNhanDatGiai') : $('#selectCaNhanDatGiai');
        if ($select.length === 0) {
            showNotification(0, "Không tìm thấy select để lưu.");
            return;
        }

        let caNhanID = $select.val();
        let hoTen = $select.find('option:selected').text();

        if (!caNhanID) {
            showNotification(0, "Vui lòng chọn cá nhân đạt giải!");
            return;
        }

        const rowData = {
            TenCaNhanDatGiai: hoTen,
            caNhanID: caNhanID,
            _isNew: false
        };

        const Data = {
            DoiTuongID: caNhanID,
            TenCaNhanDatGiai: hoTen,
            LoaiDoiTuong: 1,
            TrangThai: true
        };

        // Cập nhật hàng trên DataTable (sử dụng editingRowNodeCaNhan)
        if (editingRowNodeCaNhan) {
            tableCaNhan.row(editingRowNodeCaNhan).data(rowData).draw(false);
        } else {
            tableCaNhan.row('.adding').data(rowData).draw(false);
        }

        // Nếu đang edit (editingOldIDCaNhan khác null) => xóa phần tử cũ khỏi temp
        if (editingOldIDCaNhan) {
            tempCaNhanDatGiai = tempCaNhanDatGiai.filter(x => x.DoiTuongID !== editingOldIDCaNhan);
        }

        // Nếu phần tử mới đã tồn tại thì update, ngược lại push
        let idx = tempCaNhanDatGiai.findIndex(x => x.DoiTuongID === caNhanID);
        if (idx > -1) tempCaNhanDatGiai[idx] = Data;
        else tempCaNhanDatGiai.push(Data);

        // Render lại bảng từ temp (đảm bảo stt chính xác)
        tableCaNhan.clear().rows.add(tempCaNhanDatGiai).draw();

        // Reset trạng thái edit/add
        editingRowNodeCaNhan = null;
        editingOldIDCaNhan = null;
        originalRowDataCaNhan = null;
        newRowCaNhan = null;
    });

    // === Hủy thêm/chỉnh sửa ===
    $('#tableCaNhanDatGiai').off('click', '.btnCancelCaNhanDatGiai').on('click', '.btnCancelCaNhanDatGiai', function () {
        if (!editingRowNodeCaNhan) {
            // fallback: tìm row .adding
            editingRowNodeCaNhan = $('#tableCaNhanDatGiai').find('tr.adding');
        }

        if (originalRowDataCaNhan && editingRowNodeCaNhan && originalRowDataCaNhan.TenCaNhanDatGiai) {
            // restore dữ liệu gốc (trường hợp đang edit)
            tableCaNhan.row(editingRowNodeCaNhan).data(originalRowDataCaNhan).draw(false);
        } else {
            // trường hợp add mới -> remove row
            tableCaNhan.row('.adding').remove().draw(false);
        }

        // Reset trạng thái
        editingRowNodeCaNhan = null;
        editingOldIDCaNhan = null;
        originalRowDataCaNhan = null;
        newRowCaNhan = null;
    });

    // === Chỉnh sửa dòng ===
    $('#tableCaNhanDatGiai').off('click', '.edit-ca-nhan-dat-giai').on('click', '.edit-ca-nhan-dat-giai', function () {
        if (editingRowNodeCaNhan) return; // đang có row mới/đang edit thì không cho edit thêm

        const rowNode = $(this).closest('tr');
        const rowData = tableCaNhan.row(rowNode).data();

        // Lưu lại dữ liệu gốc để restore khi cancel
        originalRowDataCaNhan = { ...rowData };

        // Lưu ID cũ vào biến (không lưu vào DOM)
        editingOldIDCaNhan = rowData.DoiTuongID || rowData.caNhanID || null;

        // Tạo select và show lên hàng hiện tại, cho phép selectedId = editingOldIDCaNhan
        const editRowData = {
            TenCaNhanDatGiai: createSelectCaNhanDatGiai(editingOldIDCaNhan),
            _isNew: true
        };

        tableCaNhan.row(rowNode).data(editRowData).draw(false);
        $(rowNode).addClass('adding');
        editingRowNodeCaNhan = $(rowNode);

        // Khởi tạo select2 cho select vừa render
        initSelect2();
        newRowCaNhan = rowNode;
    });

    // === Xóa dòng ===
    $('#tableCaNhanDatGiai').off('click', '.delete-ca-nhan-dat-giai').on('click', '.delete-ca-nhan-dat-giai', function () {
        const rowNode = $(this).closest('tr');
        const rowData = tableCaNhan.row(rowNode).data();
        const idToRemove = rowData.DoiTuongID || rowData.caNhanID;

        // Remove từ tempCaNhanDatGiai theo ID
        tempCaNhanDatGiai = tempCaNhanDatGiai.filter(x => x.DoiTuongID !== idToRemove);

        // Re-render table
        tableCaNhan.clear().rows.add(tempCaNhanDatGiai).draw();
    });
}

function initListCaNhanDatGiai(IDLinhVuc) {
    // Lưu danh sách gốc vào allCaNhanDatGiai
    allCaNhanDatGiai = []; // reset
    let apiUrl = '';

    switch (parseInt(IDLinhVuc)) {
        case 2: // Văn hóa
            apiUrl = '/api/DM_CaNhan_NgheSiApi/Gets?MaNgonNgu=vi';
            getDataWithApi('GET', apiUrl).then(data => {
                if (data && data.isSuccess && data.value && data.value.length > 0) {
                    allCaNhanDatGiai = data.value;
                }
            });
            break;
        case 3: // Thể thao
            apiUrl = '/api/CaNhanTheThaoApi/DanhSach';
            getDataWithApi('GET', apiUrl).then(data => {
                if (data && data.isSuccess && data.value && data.value.length > 0) {
                    allCaNhanDatGiai = data.value;
                }
            });
            break;
        case 4: // Du lịch
            apiUrl = '/api/DM_CaNhan_HuongDanVienApi/Gets?MaNgonNgu=vi';
            getDataWithApi('GET', apiUrl).then(data => {
                if (data && data.isSuccess && data.value && data.value.length > 0) {
                    allCaNhanDatGiai = data.value;
                }
            });
            break;
        case 5: // Báo chí - xuất bản
            apiUrl = '/api/DM_CaNhan_BaoChiApi/Gets?MaNgonNgu=vi';
            getDataWithApi('GET', apiUrl).then(data => {
                console.log(data)
                if (data && data.isSuccess && data.value && data.value.length > 0) {
                    allCaNhanDatGiai = data.value;
                }
            });
            break;
    }
}

function getCaNhanDatGiaiList() {
    return tempCaNhanDatGiai;
}
//#endregion Xử lý cá nhân đạt giải
