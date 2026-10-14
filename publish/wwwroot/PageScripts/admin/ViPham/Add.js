const baseUrl = getRootLink();
const ckeditormoTa = CKEDITOR.replace('moTa');

$(document).ready(function () {
    initDatePicker();
    CheckDateMinMax("#ngayPhatHien", "#ngayXuPhat")
    initLinhVucCapCha_NoAll("#linhVuc", "") 
    initDanhMucChung_NoAll(67, "#hinhThucXuPhat", "") 
    initDanhMucChung_NoAll(68, "#tinhTrang", "")
    initDanhMucChung_NoAll(25, "#theLoaiID_AnPham", "")
    initDanhMucChung_NoAll(54, "#tinhTrangID_AnPham", "")
    if ($("#linhVuc").val() == null || $("#linhVuc").val() == "") {
        $("#ToChucViPham-tab, #CaNhanViPham-tab").hide()
    }
    $(document).on('change', '#linhVuc', function () {
        let linhVucID = $(this).val();
        if (linhVucID == null || linhVucID == "") {
            $("#ToChucViPham-tab, #CaNhanViPham-tab").hide()
            $("#toChucXuPhat").prop("disabled", true);
        } else {
            $("#ToChucViPham-tab, #CaNhanViPham-tab").show()
            initToChuc_NoAll(490, "#toChucXuPhat", "", linhVucID) // Tổ chức trao thưởng
            $("#toChucXuPhat").prop("disabled", false);
            if (linhVucID == 3) {
                initListTheThao();
                $(".monTheThao").show();
            } else if (linhVucID == 5) {
                $("#TacPhamViPham-tab").show();
            } else {
                $(".monTheThao").hide();
                $("#TacPhamViPham-tab").hide();
                $("#monTheThao").val(null).trigger('change');
                $("#TacPhamCoSanAdd").val(null).trigger('change');
            }
            initListSuKien(linhVucID);
        }
        // Reset bảng và dữ liệu
        isToChucViPhamInitialized = false;
        tempToChucViPham = [];
        if ($.fn.DataTable.isDataTable('#tableToChucViPham')) {
            $('#tableToChucViPham').DataTable().clear().draw();
        }
        // Chạy lại danh sách tổ chức vi phạm
        listToChucViPham = [];
        initListToChucViPham(linhVucID);
        // Nếu đang có dòng thêm mới chưa hủy thì xóa luôn dòng đó để tránh lỗi
        if ($('.adding').length) {
            $('#tableToChucViPham').DataTable().row('.adding').remove().draw(false);
        }

        // Reset bảng và dữ liệu
        isCaNhanViPhamInitialized = false;
        tempCaNhanViPham = [];
        if ($.fn.DataTable.isDataTable('#tableCaNhanViPham')) {
            $('#tableCaNhanViPham').DataTable().clear().draw();
        }
        // Chạy lại danh sách tổ chức vi phạm
        listCaNhanViPham = [];
        initListCaNhanViPham(linhVucID);
        // Nếu đang có dòng thêm mới chưa hủy thì xóa luôn dòng đó để tránh lỗi
        if ($('.adding').length) {
            $('#tableCaNhanViPham').DataTable().row('.adding').remove().draw(false);
        }
    })
    initNgonNgu("#ngonNguDich")
    previewPicture()
    previewPictureSuKien()
    initSelect2();

    // Khởi tạo bảng tổ chức vi phạm
    initToChucViPhamTable();
    initCaNhanViPhamTable();

    // Lọc danh mục từng phần
    // Lấy đường dẫn hiện tại, ví dụ: /AdminTool/HoatDongTheThao/ViPham
    let path = window.location.pathname;

    // Tách phần giữa, ví dụ: "HoatDongTheThao"
    let section = path.split("/")[2];
    console.log(section)
    setTimeout(() => {
        switch (section) {
            case "HoatDongTheThao":
                $("#linhVuc").val(3).trigger('change');
                $("#linhVuc").prop("disabled", true);
                $("#formViPham > .row > .col-lg-12:first-child").hide();
                break;
    
            case "HoatDongDuLich":
                $("#linhVuc").val(4).trigger('change');
                $("#linhVuc").prop("disabled", true);
                $("#formViPham > .row > .col-lg-12:first-child").hide();
                break;
    
            case "HoatDongVanHoa":
                $("#linhVuc").val(2).trigger('change');
                $("#linhVuc").prop("disabled", true);
                $("#formViPham > .row > .col-lg-12:first-child").hide();
                break;
    
            case "BaoChi":
                $("#linhVuc").val(5).trigger('change');
                $("#linhVuc").prop("disabled", true);
                $("#formViPham > .row > .col-lg-12:first-child").hide();
                break;
    
            default:
                break;
        }
    }, 500);

    // Event handler cho thay đổi Ngôn ngữ
    $(document).on('change', '#ngonNguDich', function() {
        $('#tenCoSoAdd').val('');
        $('#moTaCoSoAdd').val('');
        $('#nguoiDaiDienCoSoAdd').val('');
        $('#diaChiCoSoAdd').val('');
        $('#traiNghiemCoSoAdd').val('');
        $('#goiYCoSoAdd').val('');
    });

    $("#btnSaveAdd").on("click", function () {
        dataAddGiaiThuong();
    })

    $("#btnSavedanhSachAnPham").on("click", function () {
        dataAddTacPham();
    })

    $("#ngonNgu_AnPham").on('change', function (e) {
        $("#tenTacPham_AnPham").val("");
        ckeditormoTaTacPham.setData("");
        $("#tacGia_AnPham").val("");
        $("#nhaXuatBan_AnPham").val("");
    });

    $("#modalTacPham").on('hidden.bs.modal', function () {
        resetFormTacPham()
    })

    $(document).on('change', '#TacPhamCoSanAdd', function () {
        console.log(123)
        let listTacPham = $(this).val();
        listTacPham = listTacPham.filter(item => item !="");
        console.log("Giá trị đã chọn:", listTacPham);
        if (listTacPham) {
            console.log(456)
            initTableTacPham(Array.isArray(listTacPham) ? listTacPham.join(',') : listTacPham);
        }
    });

    // Xử lý giao diện văn bản tài liệu
    $(".loaiVanBan_group").hide();
    $("#TaiLieuViPham .with-title h4").text("Danh sách văn bản tài liệu vi phạm");
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

function initListSuKien(IDLinhVuc) {
    getDataWithApi('GET', `/api/DM_SuKienApi/Filter?MaNgonNgu=vi&LinhVucID=${IDLinhVuc}`).then(data => {
        if (data && data.isSuccess && data.value.length > 0) {
            $("#suKienLienQuan").empty().append(`<option value="">Tất cả</option>`).attr("data-placeholder", "Chọn...");
            data.value.forEach(item => {
                $("#suKienLienQuan").append(`<option value="${item.suKienID}">${item.tenSuKien}</option>`);
            });
        }
    })
}

function dataAddGiaiThuong() {
    // Thông tin chung
    const linhVucID = $("#linhVuc").val();
    const maDinhDanh = $("#maDinhDanh").val();
    const ngayPhatHien = $("#ngayPhatHien").val();
    const ngayXuPhat = $("#ngayXuPhat").val();
    const toChucID = $("#toChucXuPhat").val();
    const hinhThucXuPhatID = $("#hinhThucXuPhat").val();
    const tinhTrangID = $("#tinhTrang").val();
    const thuTu = $("#thuTu").val();
    const trangThai = $("input[name='trangThai']:checked").val() == 1 ? true : false;
    const listTacPham = $("#TacPhamCoSanAdd").val() ? $("#TacPhamCoSanAdd").val().join(',') : null;

    // Đa ngữ
    const maNgonNgu = $("#ngonNguDich").val();
    // const tenViPham = $("#tenViPham").val();
    const doiTuong = $("#doiTuongViPham").val();
    const moTa = ckeditormoTa.getData();

    // tổ chức và cá nhân vi phạm  
    const ToChucViPhamList = getToChucViPhamList();
    const CaNhanViPhamList = getCaNhanViPhamList();


    const dtViPham = {
        LinhVucID: linhVucID || null,
        MaDinhDanh: maDinhDanh || null,
        NgayPhatHien: ngayPhatHien ? formatDateToSaveAsString(ngayPhatHien) : null,
        NgayXuPhat: ngayXuPhat ? formatDateToSaveAsString(ngayXuPhat) : null,
        ToChucID: toChucID || null,
        HinhThucXuPhatID: hinhThucXuPhatID || null,
        TinhTrangID: tinhTrangID || null,
        ThuTu: thuTu,
        TrangThai: trangThai,
        MaNgonNgu: maNgonNgu,
        // TenViPham: tenViPham,
        DoiTuong: doiTuong,
        MoTa: moTa,
        listIDTacPham: listTacPham || null
    };

    // Tổ chức và cá nhân vi phạm
    const dtDoiTuongViPham = []
    if (ToChucViPhamList.length > 0) {
        ToChucViPhamList.map(item => {
            dtDoiTuongViPham.push(item)
        })
    }

    if (CaNhanViPhamList.length > 0) {
        CaNhanViPhamList.map(item => {
            dtDoiTuongViPham.push(item)
        })
    }

    // Tài liệu truyền thông
    // const requestDaPhuongTien = createRequestDaPhuongTiens();

    // Văn bản tài liệu
    const requestVBTL = createRequestVBTLCoSo();

    if (!linhVucID) {
        showNotification(0, "Vui lòng chọn lĩnh vực");
        return;
    }

    let formData = new FormData();
    formData.append('EntityViPham', JSON.stringify(dtViPham));
    formData.append('EntityDoiTuong', JSON.stringify(dtDoiTuongViPham));

    // Thêm tài liệu truyền thông
    // for (let i = 0; i < requestDaPhuongTien.length; i++) {
    //     formData.append(`EntityDaPhuongTien[${i}].DaPhuongTien`, JSON.stringify(requestDaPhuongTien[i].DaPhuongTien));
    //     formData.append(`EntityDaPhuongTien[${i}].DaPhuongTien_NoiDung`, JSON.stringify(requestDaPhuongTien[i].DaPhuongTien_NoiDung));
    //     formData.append(`EntityDaPhuongTien[${i}].File`, requestDaPhuongTien[i].File[0]);
    // }

    // Thêm văn bản tài liệu
    for (let i = 0; i < requestVBTL.length; i++) {
        formData.append(`EntityVanBan[${i}].RequestVanBan`, JSON.stringify(requestVBTL[i].RequestVanBan));
        formData.append(`EntityVanBan[${i}].File`, requestVBTL[i].File[0]);
    }   

    if (maDinhDanh != null && maDinhDanh != '' && checkUnique(maDinhDanh) > 0) {
        showNotification(0, "Mã bảo tàng đã tồn tại")
    }
    else if (checkTagHtmlSingle(maDinhDanh)) {
        showNotification(0, "Mã định danh chứa ký tự không hợp lệ")
    }
    else if (checkEmptyBlank(ngayPhatHien)) {
        showNotification(0, "Vui lòng chọn/nhập ngày phát hiện")
    }
    else if (isValidDateRange(ngayPhatHien, ngayXuPhat)) {
        showNotification(0, "Ngày xử phạt không hợp lệ")
    }
    else if (checkEmptyBlank(hinhThucXuPhatID)) {
        showNotification(0, "Vui lòng chọn hình thức xử phạt")
    }
    else if (checkEmptyBlank(toChucID)) {
        showNotification(0, "Vui lòng chọn tổ chức xử phạt")
    }
    else if (checkEmptyBlank(tinhTrangID)) {
        showNotification(0, "Vui lòng chọn tình trạng")
    }
    else if (isValidPositiveIntegerAllowEmpty(thuTu) || thuTu > 2147483647) {
        showNotification(0, "Thứ tự không hợp lệ")
    }
    else if (checkTagHtmlSingle(doiTuong)) {
        showNotification(0, "Đối tượng vi phạm chứa ký tự không hợp lệ")
    }
    else {
        $.ajax({
            type: 'POST',
            url: `${baseUrl}/api/DM_XuPhatViPhamApi/Add`,
            async: false,
            contentType: false,
            processData: false,
            data: formData,
            success: function (data) {
                if (data.isSuccess && data.value) {
                    showNotification(1, "Thêm mới vi phạm thành công");
                    setTimeout(function () {
                        let path = window.location.pathname;
                        // Tách phần giữa, ví dụ: "HoatDongTheThao"
                        let section = path.split("/")[2];
                        console.log(section)
                        switch (section) {
                            case "HoatDongTheThao":
                                window.location.href = `${baseUrl}/AdminTool/HoatDongTheThao/ViPham`;
                                break;

                            case "HoatDongDuLich":
                                window.location.href = `${baseUrl}/AdminTool/HoatDongDuLich/ViPham`;
                                break;

                            case "HoatDongVanHoa":
                                window.location.href = `${baseUrl}/AdminTool/HoatDongVanHoa/ViPham`;
                                break;

                            case "BaoChi":
                                window.location.href = `${baseUrl}/AdminTool/BaoChi/ViPham`;
                                break;

                            default:
                                window.location.href = `${baseUrl}/AdminTool/ViPham/ViPham`;
                                break;
                        }
                    }, 2000);
                } else {
                    showNotification(0, "Thêm mới vi phạm không thành công");
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

//#region Xử lý tổ chức vi phạm
let tempToChucViPham = [];
let allToChucViPham = []; // danh sách gốc lấy từ API
let isToChucViPhamInitialized = false;

let editingRowNode = null;   // node (tr) hiện đang edit / add
let editingOldID = null;     // DoiTuongID cũ (nếu đang edit)
let originalRowData = null;  // để restore khi hủy
let table = null;

function initToChucViPhamTable(IDLinhVuc) {
    // Lấy danh sách gốc (nếu chưa lấy hoặc muốn refresh)
    if (!isToChucViPhamInitialized) {
        initListToChucViPham(IDLinhVuc);
        isToChucViPhamInitialized = true;
    } else {
        initListToChucViPham(IDLinhVuc); // refresh khi thay đổi lĩnh vực
    }

    // Reset data tạm
    tempToChucViPham = [];

    // Nếu table đã tồn tại, destroy để recreate (tránh xung đột)
    if ($.fn.DataTable.isDataTable('#tableToChucViPham')) {
        $('#tableToChucViPham').DataTable().clear().destroy();
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
                        <button type="button" class="btnSaveToChucViPham hgi-icon hgi-check"></button>
                        <button type="button" class="btnCancelToChucViPham hgi-icon hgi-cancel"></button>
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
        { data: "TenToChucViPham", class: "left-align" },
        { data: null, width: "180px", class: "center-align group-icon-action" }
    ];

    table = $('#tableToChucViPham').DataTable({
        data: tempToChucViPham,
        columns: tableCols,
        columnDefs: tableDefs,
        paging: false,
        searching: false,
        info: false,
        ordering: false,
        autoWidth: false,
        responsive: true,
        language: {
            emptyTable: "Chưa có tổ chức vi phạm nào"
        }
    });

    // Sinh select: dựa trên allToChucViPham (danh sách gốc)
    // Loại bỏ những mục đã có trong tempToChucViPham, nhưng nếu selectedId được truyền
    // thì vẫn cho phép chọn selectedId (để edit được giá trị hiện tại).
    function createSelectToChucViPham(selectedId = "") {
        let options = `<option value="">Chọn</option>`;

        // Tính các ID đã được chọn trong temp (trừ selectedId)
        const chosenIDs = tempToChucViPham.map(x => x.DoiTuongID).filter(id => id !== selectedId);

        allToChucViPham.forEach(t => {
            if (!chosenIDs.includes(t.toChucID) || t.toChucID === selectedId) {
                options += `<option value="${t.toChucID}" ${t.toChucID === selectedId ? "selected" : ""}>${t.tenToChuc}</option>`;
            }
        });

        return `<select id="selectToChucViPham" class="form-control">${options}</select>`;
    }

    // === Thêm dòng mới ===
    let newRow = null;
    $('#btnAddToChucViPham').off('click').on('click', function () {
        if (editingRowNode) return; // đang edit/add thì không cho thêm

        const rowData = {
            TenToChucViPham: createSelectToChucViPham(),
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
    $('#tableToChucViPham').off('click', '.btnSaveToChucViPham').on('click', '.btnSaveToChucViPham', function () {
        // Lấy giá trị từ select đang active (trong hàng adding)
        let $select = editingRowNode ? editingRowNode.find('#selectToChucViPham') : $('#selectToChucViPham');
        if ($select.length === 0) {
            showNotification(0, "Không tìm thấy select để lưu.");
            return;
        }

        let toChucID = $select.val();
        let tenToChuc = $select.find('option:selected').text();

        if (!toChucID) {
            showNotification(0, "Vui lòng chọn tổ chức vi phạm!");
            return;
        }

        const rowData = {
            TenToChucViPham: tenToChuc,
            toChucID: toChucID,
            _isNew: false
        };

        const Data = {
            DoiTuongID: toChucID,
            TenToChucViPham: tenToChuc,
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
            tempToChucViPham = tempToChucViPham.filter(x => x.DoiTuongID !== editingOldID);
        }

        // Nếu phần tử mới đã tồn tại thì update, ngược lại push
        let idx = tempToChucViPham.findIndex(x => x.DoiTuongID === toChucID);
        if (idx > -1) tempToChucViPham[idx] = Data;
        else tempToChucViPham.push(Data);

        // Render lại bảng từ temp (đảm bảo stt chính xác)
        table.clear().rows.add(tempToChucViPham).draw();

        // Reset trạng thái edit/add
        editingRowNode = null;
        editingOldID = null;
        originalRowData = null;
        newRow = null;
    });

    // === Hủy thêm/chỉnh sửa ===
    $('#tableToChucViPham').off('click', '.btnCancelToChucViPham').on('click', '.btnCancelToChucViPham', function () {
        if (!editingRowNode) {
            // fallback: tìm row .adding
            editingRowNode = $('#tableToChucViPham').find('tr.adding');
        }

        if (originalRowData && editingRowNode && originalRowData.TenToChucViPham) {
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
    $('#tableToChucViPham').off('click', '.edit-to-chuc-dat-giai').on('click', '.edit-to-chuc-dat-giai', function () {
        if (editingRowNode) return; // đang có row mới/đang edit thì không cho edit thêm

        const rowNode = $(this).closest('tr');
        const rowData = table.row(rowNode).data();

        // Lưu lại dữ liệu gốc để restore khi cancel
        originalRowData = { ...rowData };

        // Lưu ID cũ vào biến (không lưu vào DOM)
        editingOldID = rowData.DoiTuongID || rowData.toChucID || null;

        // Tạo select và show lên hàng hiện tại, cho phép selectedId = editingOldID
        const editRowData = {
            TenToChucViPham: createSelectToChucViPham(editingOldID),
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
    $('#tableToChucViPham').off('click', '.delete-to-chuc-dat-giai').on('click', '.delete-to-chuc-dat-giai', function () {
        const rowNode = $(this).closest('tr');
        const rowData = table.row(rowNode).data();
        const idToRemove = rowData.DoiTuongID || rowData.toChucID;

        // Remove từ tempToChucViPham theo ID
        tempToChucViPham = tempToChucViPham.filter(x => x.DoiTuongID !== idToRemove);

        // Re-render table
        table.clear().rows.add(tempToChucViPham).draw();
    });
}

function initListToChucViPham(IDLinhVuc) {
    // Lưu danh sách gốc vào allToChucViPham
    allToChucViPham = []; // reset
    let data = JSON.stringify({ trangThai: true, maNgonNgu: 'vi', linhVucID: IDLinhVuc });
    getDataWithApi('POST', '/api/ToChucApi/DanhSach', data).then(res => {
        if (res && res.isSuccess && res.value && res.value.length > 0) {
            allToChucViPham = res.value;
        }
    });
}

function getToChucViPhamList() {
    return tempToChucViPham;
}
//#endregion Xử lý tổ chức vi phạm

//#region Xử lý cá nhân vi phạm
let tempCaNhanViPham = [];
let allCaNhanViPham = []; // danh sách gốc lấy từ API
let isCaNhanViPhamInitialized = false;

let editingRowNodeCaNhan = null;   // node (tr) hiện đang edit / add
let editingOldIDCaNhan = null;     // DoiTuongID cũ (nếu đang edit)
let originalRowDataCaNhan = null;  // để restore khi hủy
let tableCaNhan = null;

function initCaNhanViPhamTable(IDLinhVuc) {
    // Lấy danh sách gốc (nếu chưa lấy hoặc muốn refresh)
    if (!isCaNhanViPhamInitialized) {
        initListCaNhanViPham(IDLinhVuc);
        isCaNhanViPhamInitialized = true;
    } else {
        initListCaNhanViPham(IDLinhVuc); // refresh khi thay đổi lĩnh vực
    }

    // Reset data tạm
    tempCaNhanViPham = [];

    // Nếu table đã tồn tại, destroy để recreate (tránh xung đột)
    if ($.fn.DataTable.isDataTable('#tableCaNhanViPham')) {
        $('#tableCaNhanViPham').DataTable().clear().destroy();
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
                        <button type="button" class="btnSaveCaNhanViPham hgi-icon hgi-check"></button>
                        <button type="button" class="btnCancelCaNhanViPham hgi-icon hgi-cancel"></button>
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
        { data: "TenCaNhanViPham", class: "left-align" },
        { data: null, width: "180px", class: "center-align group-icon-action" }
    ];

    tableCaNhan = $('#tableCaNhanViPham').DataTable({
        data: tempCaNhanViPham,
        columns: tableCols,
        columnDefs: tableDefs,
        paging: false,
        searching: false,
        info: false,
        ordering: false,
        autoWidth: false,
        responsive: true,
        language: {
            emptyTable: "Chưa có cá nhân vi phạm nào"
        }
    });

    // Sinh select: dựa trên allCaNhanViPham (danh sách gốc)
    // Loại bỏ những mục đã có trong tempCaNhanViPham, nhưng nếu selectedId được truyền
    // thì vẫn cho phép chọn selectedId (để edit được giá trị hiện tại).
    function createSelectCaNhanViPham(selectedId = "") {
        let options = `<option value="">Chọn</option>`;

        // Tính các ID đã được chọn trong temp (trừ selectedId)
        const chosenIDs = tempCaNhanViPham.map(x => x.DoiTuongID).filter(id => id !== selectedId);

        allCaNhanViPham.forEach(t => {
            if (!chosenIDs.includes(t.caNhanID) || t.caNhanID === selectedId) {
                options += `<option value="${t.caNhanID}" ${t.caNhanID === selectedId ? "selected" : ""}>${t.hoTen} - ${t.maDinhDanh}</option>`;
            }
        });

        return `<select id="selectCaNhanViPham" class="form-control">${options}</select>`;
    }

    // === Thêm dòng mới ===
    let newRowCaNhan = null;
    $('#btnAddCaNhanViPham').off('click').on('click', function () {
        if (editingRowNodeCaNhan) return; // đang edit/add thì không cho thêm

        const rowData = {
            TenCaNhanViPham: createSelectCaNhanViPham(),
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
    $('#tableCaNhanViPham').off('click', '.btnSaveCaNhanViPham').on('click', '.btnSaveCaNhanViPham', function () {
        // Lấy giá trị từ select đang active (trong hàng adding)
        let $select = editingRowNodeCaNhan ? editingRowNodeCaNhan.find('#selectCaNhanViPham') : $('#selectCaNhanViPham');
        if ($select.length === 0) {
            showNotification(0, "Không tìm thấy select để lưu.");
            return;
        }

        let caNhanID = $select.val();
        let hoTen = $select.find('option:selected').text();

        if (!caNhanID) {
            showNotification(0, "Vui lòng chọn cá nhân vi phạm!");
            return;
        }

        const rowData = {
            TenCaNhanViPham: hoTen,
            caNhanID: caNhanID,
            _isNew: false
        };

        const Data = {
            DoiTuongID: caNhanID,
            TenCaNhanViPham: hoTen,
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
            tempCaNhanViPham = tempCaNhanViPham.filter(x => x.DoiTuongID !== editingOldIDCaNhan);
        }

        // Nếu phần tử mới đã tồn tại thì update, ngược lại push
        let idx = tempCaNhanViPham.findIndex(x => x.DoiTuongID === caNhanID);
        if (idx > -1) tempCaNhanViPham[idx] = Data;
        else tempCaNhanViPham.push(Data);

        // Render lại bảng từ temp (đảm bảo stt chính xác)
        tableCaNhan.clear().rows.add(tempCaNhanViPham).draw();

        // Reset trạng thái edit/add
        editingRowNodeCaNhan = null;
        editingOldIDCaNhan = null;
        originalRowDataCaNhan = null;
        newRowCaNhan = null;
    });

    // === Hủy thêm/chỉnh sửa ===
    $('#tableCaNhanViPham').off('click', '.btnCancelCaNhanViPham').on('click', '.btnCancelCaNhanViPham', function () {
        if (!editingRowNodeCaNhan) {
            // fallback: tìm row .adding
            editingRowNodeCaNhan = $('#tableCaNhanViPham').find('tr.adding');
        }

        if (originalRowDataCaNhan && editingRowNodeCaNhan && originalRowDataCaNhan.TenCaNhanViPham) {
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
    $('#tableCaNhanViPham').off('click', '.edit-ca-nhan-dat-giai').on('click', '.edit-ca-nhan-dat-giai', function () {
        if (editingRowNodeCaNhan) return; // đang có row mới/đang edit thì không cho edit thêm

        const rowNode = $(this).closest('tr');
        const rowData = tableCaNhan.row(rowNode).data();

        // Lưu lại dữ liệu gốc để restore khi cancel
        originalRowDataCaNhan = { ...rowData };

        // Lưu ID cũ vào biến (không lưu vào DOM)
        editingOldIDCaNhan = rowData.DoiTuongID || rowData.caNhanID || null;

        // Tạo select và show lên hàng hiện tại, cho phép selectedId = editingOldIDCaNhan
        const editRowData = {
            TenCaNhanViPham: createSelectCaNhanViPham(editingOldIDCaNhan),
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
    $('#tableCaNhanViPham').off('click', '.delete-ca-nhan-dat-giai').on('click', '.delete-ca-nhan-dat-giai', function () {
        const rowNode = $(this).closest('tr');
        const rowData = tableCaNhan.row(rowNode).data();
        const idToRemove = rowData.DoiTuongID || rowData.caNhanID;

        // Remove từ tempCaNhanViPham theo ID
        tempCaNhanViPham = tempCaNhanViPham.filter(x => x.DoiTuongID !== idToRemove);

        // Re-render table
        tableCaNhan.clear().rows.add(tempCaNhanViPham).draw();
    });
}

function initListCaNhanViPham(IDLinhVuc) {
    // Lưu danh sách gốc vào allCaNhanViPham
    allCaNhanViPham = []; // reset
    let apiUrl = '';
    
    switch (parseInt(IDLinhVuc)) {
        case 2: // Văn hóa
            apiUrl = '/api/DM_CaNhan_NgheSiApi/Gets?MaNgonNgu=vi';
            getDataWithApi('GET', apiUrl).then(data => {
                if (data && data.isSuccess && data.value && data.value.length > 0) {
                    allCaNhanViPham = data.value;
                }
            });
            break;
        case 3: // Thể thao
            const apiList = [
                { url: '/api/DM_CaNhan_CanBoTheThaoApi/Gets?MaNgonNgu=vi', loai: 'Cán bộ thể thao' },
                { url: '/api/DM_CaNhan_HuanLuyenVienApi/Gets?MaNgonNgu=vi', loai: 'Huấn luyện viên' },
                { url: '/api/DM_CaNhan_TrongTaiApi/Gets?MaNgonNgu=vi', loai: 'Trọng tài' },
                { url: '/api/DM_CaNhan_VanDongVienApi/Gets?MaNgonNgu=vi', loai: 'Vận động viên' }
            ];
            Promise.all(apiList.map(api =>
                getDataWithApi('GET', api.url).then(res => {
                    if (res && res.isSuccess && res.value) {
                        // Gắn thêm trường loaiCaNhan vào từng phần tử
                        return res.value.map(item => ({
                            ...item,
                            loaiCaNhan: api.loai
                        }));
                    }
                    return [];
                })
            )).then(results => {
                // Gộp tất cả kết quả lại thành 1 mảng duy nhất
                allCaNhanViPham = results.flat();
                console.log("Tổng hợp cá nhân thể thao:", allCaNhanViPham);
            }).catch(err => {
                console.error("Lỗi khi load dữ liệu thể thao:", err);
            });

            break;
        case 4: // Du lịch
            apiUrl = '/api/DM_CaNhan_HuongDanVienApi/Gets?MaNgonNgu=vi';
            getDataWithApi('GET', apiUrl).then(data => {
                if (data && data.isSuccess && data.value && data.value.length > 0) {
                    allCaNhanViPham = data.value;
                }
            });
            break;
        case 5: // Báo chí - xuất bản
            apiUrl = '/api/DM_CaNhan_BaoChiApi/Gets?MaNgonNgu=vi';
            getDataWithApi('GET', apiUrl).then(data => {
                if (data && data.isSuccess && data.value && data.value.length > 0) {
                    allCaNhanViPham = data.value;
                }
            });
            break;
    }
}

function getCaNhanViPhamList() {
    return tempCaNhanViPham;
}
//#endregion Xử lý cá nhân vi phạm

//#region Xử lý tác phẩm vi phạm
async function initTableTacPham(listTacPham) {
    console.log('Danh sách tác phẩm:', listTacPham);
    const tableApi = {
        url: `${baseUrl}/api/DM_ThanhTichApi/GetMultiTacPham?ListIDTacPham=${listTacPham}&MaNgonNgu=vi`,
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        dataSrc: function (data) {
            console.log(data)
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
            targets: 1,
            render: function (data, type, row, meta) {
                return `<div class="group-info have-image">
                        <div class="have-image">
                            <img src="${row.hinhAnh || '/images/no-image.png'}" alt="${row.tenTacPham || ''}" onerror="this.onerror=null;this.src='/images/no-image.png';" />
                        </div>
                        <div class="group-info">
                        <div class="info-main"><div>${row.tenTacPham || ''}</div></div>
                        <div class="info-sub">${row.maDinhDanh || ''}</div></div>
                    </div>`;
            }
        },
        {
            targets: 4,
            render: function (data, type, row, meta) {
                if (data) {
                    return `<i class="hgi-icon hgi-check"></i>`;
                }
                else {
                    return `<i class="hgi-icon hgi-cancel"></i>`;
                }
            }
        },
    ];

    const tableCols = [
        { "data": "stt", "width": "40px", "class": "center-align" },
        { "data": "tenTacPham", "width": "", "class": "left-align" },
        { "data": "tenTheLoai", "width": "220px", "class": "left-align" },
        { "data": "tacGia", "width": "220px", "class": "center-align" },
        { "data": "suDung", "width": "120px", "class": "center-align" },
    ];

    initDataTableConfigNoSearch('dataGridTacPham', tableApi, tableDefs, tableCols);
}

function initDanhSachTacPham() {
    let options = ``;
    getDataWithApi('POST', '/api/TacPhamApi/DanhSach', JSON.stringify({ maNgonNgu: 'vi', linhVucID: 5})).then(data => {
        if (data && data.isSuccess && data.value.length > 0) {
            data.value.forEach(item => {
                options += `<option value="${item.tacPhamID}">${item.tenTacPham}</option>`;
            });
        }
        $('#TacPhamCoSanAdd').html(options).val('').trigger('change');
    })
}

async function dataAddTacPham() {
    let tacPhamTranslations = [];
    let tacPhamID = $('#tacPhamID').val();
    let anhDaiDien = $('#fileAnhDaiDienPrev')[0]?.files[0] || null;
    let urlAnhDaiDien = $('#urlfileAnhDaiDienPrev').val() || null;

    let theLoaiID = $('#theLoaiID_AnPham').val() || null;
    let tinhTrangID = $('#tinhTrangID_AnPham').val() || null;
    let maDinhDanh = $('#maDinhDanh_AnPham').val()?.trim() || null;
    let namCongBo = $('#namCongBo_AnPham').val() || null;
    let suDung = $('input[name="trangThai_AnPham"]:checked').val() === "1";
    let thuTu = $('#thuTu_AnPham').val() || 1;

    let maNgonNgu = $("#ngonNguDich_AnPham").val() || 'vi';
    let tenTacPham = $("#tenTacPham_AnPham").val()?.trim() || null;
    let moTa = ckeditormoTaTacPham.getData() || null;
    let tacGia = $("#tacGia_AnPham").val()?.trim() || null;
    let nhaXuatBan = $("#nhaXuatBan_AnPham").val()?.trim() || null;


    // Gom object thông tin chung
    let TacPham = {
        TacPhamID: tacPhamID || null,
        TheLoaiID: theLoaiID,
        TinhTrangID: tinhTrangID || null,
        linhVucID: 5,
        MaDinhDanh: maDinhDanh,
        NamCongBo: namCongBo,
        ThuTu: thuTu != "" ? Number(thuTu) : 1,
        SuDung: suDung == '1' ? true : false,
        HinhAnh: urlAnhDaiDien
    };

    tacPhamTranslations.push({
        maNgonNgu: maNgonNgu,
        tenTacPham: tenTacPham,
        moTa: moTa,
        tacGia: tacGia,
        nhaXuatBan: nhaXuatBan
    });

    // Chuẩn bị formData để gửi lên server
    let formData = new FormData();
    formData.append("TacPham", JSON.stringify(TacPham));
    formData.append("TacPham_NoiDung", JSON.stringify(tacPhamTranslations)); // mảng bản dịch
    if (anhDaiDien) {
        formData.append("HinhAnh", anhDaiDien);
    }

    $.ajax({
        type: 'POST',
        url: `${baseUrl}/api/TacPhamApi/ThemMoi`,
        async: false,
        contentType: false,
        processData: false,
        data: formData,
        success: function (data) {
            console.log(data)
            if (data.isSuccess && data.value) {
                // Lưu lại id địa điểm vừa thêm mới
                var newtacPhamID = data.value.tacPhamID || data.value.id || data.value;
                console.log("Địa điểm vừa thêm mới có ID:", newtacPhamID);
                // Lưu lại các giá trị select đã chọn trước đó
                var prevTacPham = $('#TacPhamCoSanAdd').val();
                console.log("Giá trị đã chọn trước đó:", prevTacPham);
                let dt = JSON.stringify({
                    maNgonNgu: "vi",
                    linhVucID: 5
                })
                console.log(dt)
                getDataWithApi('POST', '/api/TacPhamApi/DanhSach', dt).then(data => {
                    console.log(data)
                    if (data && data.isSuccess && data.value) {
                        var $select = $('#TacPhamCoSanAdd');
                        var prevValues = Array.isArray(prevTacPham) ? prevTacPham : [prevTacPham];
                        $select.empty();
                        $select.append('<option value="">Chọn</option>');
                        data.value.forEach(function (item) {
                            console.log(item, "Danh sách địa điểm")
                            var selected = '';
                            if (prevValues.includes(item.tacPhamID?.toString()) || prevValues.includes(item.id?.toString())) selected = 'selected';
                            if (item.tacPhamID == newtacPhamID || item.id == newtacPhamID) selected = 'selected';
                            $select.append(`<option value="${item.tacPhamID || item.id}" ${selected}>${item.tenTacPham || item.noiDung || 'Không rõ tên'}</option>`);
                        });
                        prevValues.push(newtacPhamID)
                        $select.trigger('change.select2');
                        if (prevValues) {
                            initTableTacPham(Array.isArray(prevValues) ? prevValues.join(',') : prevValues);
                        }
                    }
                })
                showNotification(1, "Thêm mới tác phẩm thành công");
                $('#modalTacPham').modal('hide');
            }
        },
        error: function (err) {
            showNotification(0, "Thêm mới tác phẩm không thành công");
            console.log(err)
        }
    })
}

function resetFormTacPham() {
    $('#tacPhamID').val('');
    $('#theLoaiID_AnPham').val('').trigger('change');
    $('#tinhTrangID_AnPham').val('').trigger('change');
    $('#maDinhDanh_AnPham').val('');
    $('#namCongBo_AnPham').val('');
    $('#thuTu_AnPham').val('1');
    $('#urlfileAnhDaiDienPrev').val('');
    $('#fileAnhDaiDienPrev').val(null);
    $('#showAnhDaiDienAdd').attr('src', '/assets/images/vector/addImage.png');
    $('input[name="trangThai_AnPham"][value="1"]').prop('checked', true);
    $("#tenTacPham_AnPham").val("");
    ckeditormoTaTacPham.setData("");
    $("#tacGia_AnPham").val("");
    $("#nhaXuatBan_AnPham").val("");
}
//#endregion Xử lý tác phẩm vi phạm

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

const checkUnique = (maDinhDanh, toChucID) => {
    let result = 0
    let url = `${baseUrl}/api/ToChucApi/CheckUnique?MaDinhDanh=${maDinhDanh}&LoaiToChucID=95`
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

/* const isValidPositiveIntegerAllowEmpty = (value) => {
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

const isValidDateRange = (start, end) => {
    
    // Nếu thiếu 1 trong 2 → không lỗi
    if (!start || !end) return false;

   
    // Nếu ngày không hợp lệ
   // if (isNaN(start) || isNaN(end)) return true;

    return end < start;
}; */

//#endregion function validation

