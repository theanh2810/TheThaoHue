const baseUrl = getRootLink();
const ckeditormoTa = CKEDITOR.replace('moTa');

$(document).ready(function () {
    initDatePicker();
    initLinhVucCapCha_NoAll("#linhVuc", "") 
    initDanhMucChung_NoAll(64, "#loaiGiaiThuong", "") 
    initDanhMucChung_NoAll(65, "#capGiaiThuong", "")
    initDanhMucChung_NoAll(66, "#hangGiaiThuong", "")
    initDanhMucChung_NoAll(25, "#theLoaiID_AnPham", "")
    initDanhMucChung_NoAll(54, "#tinhTrangID_AnPham", "")
    if ($("#linhVuc").val() == null || $("#linhVuc").val() == "") {
        $("#ToChucDatGiai-tab, #CaNhanDatGiai-tab").hide()
    }
    $(document).on('change', '#linhVuc', function () {
        let linhVucID = $(this).val();
        if (linhVucID == null || linhVucID == "") {
            $("#ToChucDatGiai-tab, #CaNhanDatGiai-tab").hide()
            $("#toChucTraoThuong").prop("disabled", true);
        } else {
            console.log(123)
            $("#ToChucDatGiai-tab, #CaNhanDatGiai-tab").show()
            initToChuc_NoAll(489, "#toChucTraoThuong", "", linhVucID) // Tổ chức trao thưởng
            $("#toChucTraoThuong").prop("disabled", false);
            if (linhVucID == 3) {
                initListTheThao();
                $(".monTheThao").show();
            } else if (linhVucID == 5) {
                $("#TacPhamDatGiai-tab").show();
            } else {
                $(".monTheThao").hide();
                $("#TacPhamDatGiai-tab").hide();
                $("#monTheThao").val(null).trigger('change');
                $("#TacPhamCoSanAdd").val(null).trigger('change');
            }
            initListSuKien(linhVucID);
        }
        // Reset bảng và dữ liệu
        isToChucDatGiaiInitialized = false;
        tempToChucDatGiai = [];
        if ($.fn.DataTable.isDataTable('#tableToChucDatGiai')) {
            $('#tableToChucDatGiai').DataTable().clear().draw();
        }
        // Chạy lại danh sách tổ chức đạt giải
        listToChucDatGiai = [];
        initListToChucDatGiai(linhVucID);
        // Nếu đang có dòng thêm mới chưa hủy thì xóa luôn dòng đó để tránh lỗi
        if ($('.adding').length) {
            $('#tableToChucDatGiai').DataTable().row('.adding').remove().draw(false);
        }

        // Reset bảng và dữ liệu
        isCaNhanDatGiaiInitialized = false;
        tempCaNhanDatGiai = [];
        if ($.fn.DataTable.isDataTable('#tableCaNhanDatGiai')) {
            $('#tableCaNhanDatGiai').DataTable().clear().draw();
        }
        // Chạy lại danh sách tổ chức đạt giải
        listCaNhanDatGiai = [];
        initListCaNhanDatGiai(linhVucID);
        // Nếu đang có dòng thêm mới chưa hủy thì xóa luôn dòng đó để tránh lỗi
        if ($('.adding').length) {
            $('#tableCaNhanDatGiai').DataTable().row('.adding').remove().draw(false);
        }
    })
    initNgonNgu("#ngonNguDich")
    previewPicture()
    previewPictureSuKien()
    initSelect2();

    // Khởi tạo bảng tổ chức đạt giải
    initToChucDatGiaiTable();
    initCaNhanDatGiaiTable();

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
                $("#formGiaiThuong > .row > .col-lg-12:first-child").hide();
                break;
    
            case "HoatDongDuLich":
                $("#linhVuc").val(4).trigger('change');
                $("#linhVuc").prop("disabled", true);
                $("#formGiaiThuong > .row > .col-lg-12:first-child").hide();
                break;
    
            case "HoatDongVanHoa":
                $("#linhVuc").val(2).trigger('change');
                $("#linhVuc").prop("disabled", true);
                $("#formGiaiThuong > .row > .col-lg-12:first-child").hide();
                break;
    
            case "BaoChi":
                $("#linhVuc").val(5).trigger('change');
                $("#linhVuc").prop("disabled", true);
                $("#formGiaiThuong > .row > .col-lg-12:first-child").hide();
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
    getDataWithApi('GET', `/api/DM_SuKienApi/GetListForGiaiThuong?MaNgonNgu=vi&LinhVucID=${IDLinhVuc}`).then(data => {
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
    // const fileAnhDaiDien = $("#fileAnhDaiDienPrev")[0].files[0] || null;
    const linhVucID = $("#linhVuc").val();
    const maDinhDanh = $("#maGiaiThuong").val();
    const loaiGiaiThuongID = $("#loaiGiaiThuong").val();
    const capGiaiThuongID = $("#capGiaiThuong").val();
    const hangGiaiThuongID = $("#hangGiaiThuong").val();
    const toChucTraoThuongID = $("#toChucTraoThuong").val();
    const ngayTraoGiai = formatDateToSaveAsString($("#ngayTraoGiai").val());
    const monTheThaoID = $("#monTheThao").val() ? $("#monTheThao").val().join(',') : null;
    const trangThai = $("input[name='trangThai']:checked").val() == 1 ? true : false;
    const thuTu = $("#thuTu").val();
    const suKienID = $("#suKienLienQuan").val();
    const listTacPham = $("#TacPhamCoSanAdd").val() ? $("#TacPhamCoSanAdd").val().join(',') : null;

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
        LinhVucID: linhVucID || null,
        MaDinhDanh: maDinhDanh || null,
        LoaiID: loaiGiaiThuongID || null,
        CapID: capGiaiThuongID || null, 
        HangID: hangGiaiThuongID || null,
        ToChucID: toChucTraoThuongID || null,
        listIDMonTheThao: monTheThaoID || null,
        SuKienID: suKienID || null,
        TrangThai: trangThai,
        MaNgonNgu: maNgonNgu,
        TenThanhTich: tenGiaiThuong,
        DoiTuong: doiTuong,
        MoTa: moTa,
        NgayTraoGiai: ngayTraoGiai,
        ThuTu: thuTu,
        listIDTacPham: listTacPham || null
    };

    // Tổ chức và cá nhân đạt giải
    const dtDoiTuongDatGiai = []
    if(ToChucDatGiaiList.length > 0) {
        ToChucDatGiaiList.map(item => {
            dtDoiTuongDatGiai.push(item)
        })
    }

    if(CaNhanDatGiaiList.length > 0) {
        CaNhanDatGiaiList.map(item => {
            dtDoiTuongDatGiai.push(item)
        })
    }

    // Tài liệu truyền thông
    const requestDaPhuongTien = createRequestDaPhuongTiens();

    // Văn bản tài liệu
    // const requestVBTL = createRequestVBTLCoSo();

    if (!linhVucID) {
        showNotification(0, "Vui lòng chọn lĩnh vực");
        return;
    }

    console.log(dtDoiTuongDatGiai)

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

    if (checkEmptyBlank(maDinhDanh)) {
        showNotification(0, "Vui lòng nhập mã giải thưởng")
    }
    else if (checkTagHtmlSingle(maDinhDanh)) {
        showNotification(0, "Mã giải thưởng chứa ký tự không hợp lệ")
    }
    else if (checkEmptyBlank(ngayTraoGiai)) {
        showNotification(0, "Vui lòng nhập/chọn ngày trao thưởng")
    }
    else if (checkEmptyBlank(loaiGiaiThuongID)) {
        showNotification(0, "Vui lòng chọn loại giải thưởng")
    }
    else if (checkEmptyBlank(capGiaiThuongID)) {
        showNotification(0, "Vui lòng chọn cấp độ giải thưởng")
    }
    else if (checkEmptyBlank(hangGiaiThuongID)) {
        showNotification(0, "Vui lòng chọn hạng giải thưởng")
    }
    else if (isValidPositiveIntegerAllowEmpty(thuTu) || thuTu > 2147483647) {
        showNotification(0, "Thứ tự không hợp lệ")
    }
    else if (checkEmptyBlank(tenGiaiThuong)) {
        showNotification(0, "Vui lòng nhập tên giải thưởng")
    }
    else if (checkTagHtmlSingle(tenGiaiThuong)) {
        showNotification(0, "Tên giải thưởng chứa ký tự không hợp lệ")
    }
    else if (checkTagHtmlSingle(doiTuong)) {
        showNotification(0, "Đối tượng nhận giải thưởng chứa ký tự không hợp lệ")
    }
    else {
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
                        let path = window.location.pathname;
                        // Tách phần giữa, ví dụ: "HoatDongTheThao"
                        let section = path.split("/")[2];
                        console.log(section)
                        switch (section) {
                            case "HoatDongTheThao":
                                window.location.href = `${baseUrl}/AdminTool/HoatDongTheThao/GiaiThuong`;
                                break;

                            case "HoatDongDuLich":
                                window.location.href = `${baseUrl}/AdminTool/HoatDongDuLich/GiaiThuong`;
                                break;

                            case "HoatDongVanHoa":
                                window.location.href = `${baseUrl}/AdminTool/HoatDongVanHoa/GiaiThuong`;
                                break;

                            case "BaoChi":
                                window.location.href = `${baseUrl}/AdminTool/BaoChi/GiaiThuong`;
                                break;

                            default:
                                window.location.href = `${baseUrl}/AdminTool/GiaiThuong/GiaiThuong`;
                                break;
                        }
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
                options += `<option value="${t.caNhanID}" ${t.caNhanID === selectedId ? "selected" : ""}>${t.hoTen} - ${t.maDinhDanh}</option>`;
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
                allCaNhanDatGiai = results.flat();
                console.log("Tổng hợp cá nhân thể thao:", allCaNhanDatGiai);
            }).catch(err => {
                console.error("Lỗi khi load dữ liệu thể thao:", err);
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

//#region Xử lý tác phẩm đạt giải
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
//#endregion Xử lý tác phẩm đạt giải


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

//#endregion function validation
