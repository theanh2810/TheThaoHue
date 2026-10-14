const baseUrl = getRootLink();
let currentFilterUrl = null;
const ckeditormotaAdd = CKEDITOR.replace('moTaAdd');

// Variables for nhom chi tieu table
let tempNhomChiTieu = [];
let allNhomChiTieu = [];
let editingRowNodeNhomChiTieu = null;
let editingOldIDNhomChiTieu = null;
let originalRowDataNhomChiTieu = null;
let tableNhomChiTieu = null;

$(document).ready(function () {
    initDatePicker();
    let translations = [];

    (async function () {
        await Promise.all([
            initNhomChiTieu(),
            initNhomChiTieu_Select()
        ]);
        initTable();
        setTimeout(() => { 
            initSelect2()
        }, 500);
        initFilter_Option()
    })();

    // Lắng nghe event switch sang card view
    $(document).on('viewChanged:card', function() {
        initCardView();
    });

    function initNhomChiTieu() {
        getDataWithApi('GET', '/api/RPT_NhomChiTieuApi/Gets').then(data => {
            if (data && data.isSuccess && data.value) {
                allNhomChiTieu = data.value;
                initNhomChiTieuTable();
            }
        })
    }

    function initNhomChiTieu_Select() {
        getDataWithApi('GET', '/api/RPT_NhomChiTieuApi/Gets').then(data => {
            if (data && data.isSuccess && data.value) {
                $("#nhom-chi-tieu-search").empty().append(`<option value="">Chọn</option>`);
                data.value.forEach(item => {
                    const displayText = item.nhomChiTieu || 'Không rõ tên';
                    $("#nhom-chi-tieu-search").append(`<option value="${item.id}">${displayText}</option>`);
                });
            }
        })
    }

    function initNhomChiTieuTable() {
        tempNhomChiTieu = [];

        if ($.fn.DataTable.isDataTable('#tableNhomChiTieuMauBaoCao')) {
            $('#tableNhomChiTieuMauBaoCao').DataTable().clear().destroy();
        }

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
                    if (row._isNew) {
                        return createSelectNhomChiTieu(row.NhomChiTieuID || "");
                    }
                    return row.TenNhomChiTieu || '-';
                }
            },
            {
                targets: 2,
                render: function (data, type, row, meta) {
                    if (row._isNew) {
                        return `<input type="number" id="thuTuNhomChiTieuAdd" class="form-control" placeholder="Nhập thứ tự..." value="${row.ThuTu || 1}">`;
                    }
                    return row.ThuTu || 1;
                }
            },
            {
                targets: 3,
                render: function (data, type, row, meta) {
                    if (row._isNew) {
                        return `
                            <button type="button" class="btnSaveNhomChiTieu hgi-icon hgi-check"></button>
                            <button type="button" class="btnCancelNhomChiTieu hgi-icon hgi-cancel"></button>
                        `;
                    }
                    const editIcon = `<i style="margin-right:8px;" class="edit-nhom-chi-tieu cursor-pointer me-2" data-row-index="${meta.row}"><i class="hgi-icon hgi-edit"></i></i>`;
                    const deleteIcon = `<i class="delete-nhom-chi-tieu cursor-pointer text-danger" data-row-index="${meta.row}"><i class="hgi-icon hgi-delete"></i></i>`;
                    return editIcon + deleteIcon;
                }
            }
        ];

        const tableCols = [
            { data: null, width: "40px", class: "center-align" },
            { data: "TenNhomChiTieu", class: "left-align" },
            { data: "ThuTu", width: "120px", class: "center-align" },
            { data: null, width: "180px", class: "center-align group-icon-action" }
        ];

        tableNhomChiTieu = $('#tableNhomChiTieuMauBaoCao').DataTable({
            data: tempNhomChiTieu,
            columns: tableCols,
            columnDefs: tableDefs,
            paging: false,
            searching: false,
            info: false,
            ordering: false,
            autoWidth: false,
            responsive: true,
            language: {
                emptyTable: "Chưa có nhóm chỉ tiêu nào"
            }
        });

        function createSelectNhomChiTieu(selectedId = "") {
            let options = `<option value="">Chọn</option>`;
            // Lấy danh sách ID đã chọn (loại bỏ selectedId hiện tại)
            const selectedIDs = tempNhomChiTieu
                .filter(x => String(x.NhomChiTieuID) !== String(selectedId))
                .map(x => String(x.NhomChiTieuID));
            
            allNhomChiTieu.forEach(t => {
                // Hiển thị nếu: chưa được chọn hoặc là selectedId hiện tại
                const tIdString = String(t.id);
                const selectedIdString = String(selectedId);
                if (!selectedIDs.includes(tIdString) || tIdString === selectedIdString) {
                    options += `<option value="${t.id}" ${tIdString === selectedIdString ? "selected" : ""}>${t.nhomChiTieu}</option>`;
                }
            });
            return `<select id="selectNhomChiTieu" class="form-control">${options}</select>`;
        }

        let newRowNhomChiTieu = null;
        $('#btnAddNhomChiTieuMauBaoCao').off('click').on('click', function () {
            if (editingRowNodeNhomChiTieu) return;
            const rowData = {
                stt: tableNhomChiTieu.rows().count() + 1,
                NhomChiTieuID: "",
                TenNhomChiTieu: "",
                ThuTu: 1,
                _isNew: true
            };
            newRowNhomChiTieu = tableNhomChiTieu.row.add(rowData).draw(false).node();
            $(newRowNhomChiTieu).addClass('adding');
            editingRowNodeNhomChiTieu = $(newRowNhomChiTieu);
            editingOldIDNhomChiTieu = null;
            originalRowDataNhomChiTieu = null;
            initSelect2();
        });

        $('#tableNhomChiTieuMauBaoCao').off('click', '.btnSaveNhomChiTieu').on('click', '.btnSaveNhomChiTieu', function () {
            let $select = editingRowNodeNhomChiTieu ? editingRowNodeNhomChiTieu.find('#selectNhomChiTieu') : $('#selectNhomChiTieu');
            let $thuTu = editingRowNodeNhomChiTieu ? editingRowNodeNhomChiTieu.find('#thuTuNhomChiTieuAdd') : $('#thuTuNhomChiTieuAdd');
            
            if ($select.length === 0) {
                showNotification(0, "Không tìm thấy select để lưu.");
                return;
            }
            
            let nhomChiTieuID = $select.val();
            let tenNhomChiTieu = $select.find('option:selected').text();
            let thuTu = parseInt($thuTu.val()) || 1;
            
            if (!nhomChiTieuID) {
                showNotification(0, "Vui lòng chọn nhóm chỉ tiêu!");
                return;
            }
            
            const Data = {
                NhomChiTieuID: nhomChiTieuID,
                TenNhomChiTieu: tenNhomChiTieu,
                ThuTu: thuTu
            };
            
            // Loại bỏ ID cũ nếu đang edit (thay đổi từ một ID sang ID khác)
            if (editingOldIDNhomChiTieu && editingOldIDNhomChiTieu !== nhomChiTieuID) {
                tempNhomChiTieu = tempNhomChiTieu.filter(x => x.NhomChiTieuID !== editingOldIDNhomChiTieu);
            }
            
            // Thêm hoặc cập nhật item trong tempNhomChiTieu
            let idx = tempNhomChiTieu.findIndex(x => x.NhomChiTieuID === nhomChiTieuID);
            if (idx > -1) tempNhomChiTieu[idx] = Data;
            else tempNhomChiTieu.push(Data);
            
            // Redraw toàn bộ bảng (columnDefs sẽ render lại select với dữ liệu mới)
            tableNhomChiTieu.clear().rows.add(tempNhomChiTieu).draw();
            editingRowNodeNhomChiTieu = null;
            editingOldIDNhomChiTieu = null;
            originalRowDataNhomChiTieu = null;
            newRowNhomChiTieu = null;
            
            initSelect2();
        });

        $('#tableNhomChiTieuMauBaoCao').off('click', '.btnCancelNhomChiTieu').on('click', '.btnCancelNhomChiTieu', function () {
            if (!editingRowNodeNhomChiTieu) {
                editingRowNodeNhomChiTieu = $('#tableNhomChiTieuMauBaoCao').find('tr.adding');
            }
            if (originalRowDataNhomChiTieu && editingRowNodeNhomChiTieu && originalRowDataNhomChiTieu.TenNhomChiTieu) {
                tableNhomChiTieu.row(editingRowNodeNhomChiTieu).data(originalRowDataNhomChiTieu).draw(false);
            } else {
                tableNhomChiTieu.row('.adding').remove().draw(false);
            }
            editingRowNodeNhomChiTieu = null;
            editingOldIDNhomChiTieu = null;
            originalRowDataNhomChiTieu = null;
            newRowNhomChiTieu = null;
        });

        $('#tableNhomChiTieuMauBaoCao').off('click', '.edit-nhom-chi-tieu').on('click', '.edit-nhom-chi-tieu', function () {
            if (editingRowNodeNhomChiTieu) return;
            const rowNode = $(this).closest('tr');
            const rowData = tableNhomChiTieu.row(rowNode).data();
            originalRowDataNhomChiTieu = { ...rowData };
            editingOldIDNhomChiTieu = rowData.NhomChiTieuID || null;
            
            // Khi edit, cập nhật row data để _isNew = true (columnDefs sẽ render select)
            const editRowData = {
                ...rowData,
                ThuTu: rowData.ThuTu,
                _isNew: true
            };
            tableNhomChiTieu.row(rowNode).data(editRowData).draw(false);
            $(rowNode).addClass('adding');
            editingRowNodeNhomChiTieu = $(rowNode);
            initSelect2();
            newRowNhomChiTieu = rowNode;
        });

        $('#tableNhomChiTieuMauBaoCao').off('click', '.delete-nhom-chi-tieu').on('click', '.delete-nhom-chi-tieu', function () {
            const rowNode = $(this).closest('tr');
            const rowData = tableNhomChiTieu.row(rowNode).data();
            const idToRemove = rowData.NhomChiTieuID;
            tempNhomChiTieu = tempNhomChiTieu.filter(x => x.NhomChiTieuID !== idToRemove);
            
            // Cập nhật lại toàn bộ bảng để refresh select của các row khác
            tableNhomChiTieu.clear().rows.add(tempNhomChiTieu).draw();
        });
    }

    function getNhomChiTieuList() {
        return tempNhomChiTieu;
    }
    
    // Lắng nghe event switch sang list view
    $(document).on('viewChanged:list', function() {
        initListView();
    });

    // Lắng nghe event switch sang table view
    $(document).on('viewChanged:table', function() {
        initTableView();
    });

    async function initTable() {
        const tableApi = {
            url: `${baseUrl}/api/RPT_MauBaoCaoApi/Gets`,
            type: "GET",
            contentType: 'application/json; charset=utf-8',
            dataSrc: function (data) {
                if (data && data.isSuccess && data.value && data.value.length > 0) {
                    console.log(data.value);
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
                targets: 4, // Cột trạng thái
                render: function (data, type, row, meta) {
                    if (row.suDung) {
                        return `<span class="TrangThai green-text">Hoạt động</span>`;
                    } else {
                        return `<span class="TrangThai red-text">Không hoạt động</span>`;
                    }
                }
            },
            {
                targets: 5, // Cột chức năng
                render: function (data, type, row, meta) {
                    let html = "";
                    if (typeof permitedEdit !== 'undefined' && permitedEdit) {
                        html += `<a data-toggle="tooltip" title="Chỉnh sửa" class="text-yellow edit-form" id="n-${meta.row}">
                                    <i class="hgi-icon hgi-edit"></i>
                                </a>`;
                    }
                    if (typeof permitedDelete !== 'undefined' && permitedDelete) {
                        html += `<a data-toggle="tooltip" title="Xóa" class="delete-command-btn text-red cursor-pointer" id="delete-${meta.row}">
                                    <i class="hgi-icon hgi-delete"></i>
                                </a>`;
                    }
                    if ((!permitedEdit && !permitedDelete) || (typeof permitedEdit === 'undefined' && typeof permitedDelete === 'undefined')) {
                        html = `<span class="text-muted">Chỉ xem</span>`;
                    }
                    return html;
                }
            }
        ];

        const tableCols = [
            { "data": "stt", "width": "40px", "class": "center-align" },
            { "data": "tieuDe", "width": "", "class": "left-align name-text" },
            { "data": "listTenNhomChiTieu", "width": "25%", "class": "left-align" },
            { "data": "moTa", "width": "25%", "class": "left-align" },
            { "data": "", "width": "120px", "class": "left-align" },
            { "data": "", "width": "120px", "class": "center-align group-icon-action" }
        ];

        initDataTableConfigNoSearch('dataGrid', tableApi, tableDefs, tableCols);
    }

    $(document).on('click', '.edit-form', function () {
        var id = $(this).attr("ID").match(/\d+/)[0];
        var data = $('#dataGrid').DataTable().row(id).data();

        $("#modalAddTitle").text("Cập nhật mẫu báo cáo")
        $('#mauBaoCaoIDAdd').val(data.id || "");
        $('#tieuDeAdd').val(data.tieuDe || "");
        ckeditormotaAdd.setData(data.moTa || "");

        // Trạng thái
        if (data.suDung) {
            $('input[name="trangThaiAdd"][value="1"]').prop('checked', true);
        } else {
            $('input[name="trangThaiAdd"][value="0"]').prop('checked', true);
        }

        console.log(data)

        // Populate bảng nhóm chỉ tiêu từ API
        tempNhomChiTieu = [];
        
        // Split string thành array nếu là string
        let arrIDNhomChiTieu = [];
        let arrTenNhomChiTieu = [];
        let arrThuTu = [];
        
        if (data.listIDNhomChiTieu) {
            arrIDNhomChiTieu = typeof data.listIDNhomChiTieu === 'string' 
                ? data.listIDNhomChiTieu.split(',').map(x => x.trim()) 
                : data.listIDNhomChiTieu;
        }
        
        if (data.listTenNhomChiTieu) {
            arrTenNhomChiTieu = typeof data.listTenNhomChiTieu === 'string' 
                ? data.listTenNhomChiTieu.split(',').map(x => x.trim()) 
                : data.listTenNhomChiTieu;
        }
        
        if (data.listThuTu) {
            arrThuTu = typeof data.listThuTu === 'string' 
                ? data.listThuTu.split(',').map(x => parseInt(x.trim())) 
                : data.listThuTu;
        }
        
        // Loop qua từng ID và build tempNhomChiTieu
        if (arrIDNhomChiTieu.length > 0) {
            for (let i = 0; i < arrIDNhomChiTieu.length; i++) {
                tempNhomChiTieu.push({
                    NhomChiTieuID: arrIDNhomChiTieu[i],
                    TenNhomChiTieu: arrTenNhomChiTieu[i] || '',
                    ThuTu: arrThuTu[i] || (i + 1)
                });
            }
        }

        console.log(tempNhomChiTieu, 'tempNhomChiTieu')
        
        // Redraw bảng với dữ liệu mới
        if (tableNhomChiTieu) {
            tableNhomChiTieu.clear().rows.add(tempNhomChiTieu).draw();
        }

        $('#modalAdd').modal('show');
    });

    // Event handler cho nút xóa
    $(document).on('click', '.delete-command-btn', function () {
        console.log(12321321321)
        var id = $(this).attr("ID").match(/\d+/)[0];
        var data = $('#dataGrid').DataTable().row(id).data();

        $('#idDelete').val(data.id);
        $('#nameDelete').text(`${data.tieuDe}`);

        $('#modalDelete').modal('show');
    });

    // Xử lý submit thêm/sửa mẫu báo cáo
    $("#formAdd").on("submit", async function (e) {
        e.preventDefault();
        const submitBtn = $(this).find('button[type="submit"]');
        if (submitBtn.prop('disabled')) return;
        submitBtn.prop('disabled', true);
        const originalText = submitBtn.text();
        submitBtn.text('Đang xử lý...');
        
        // Lấy dữ liệu từ form
        const mauBaoCaoID = $('#mauBaoCaoIDAdd').val()
        const tieuDe = $('#tieuDeAdd').val();
        const moTa = ckeditormotaAdd.getData();
        const sudung = $('input[name="trangThaiAdd"]:checked').val() === "1" ? true : false;
        const nhomChiTieuList = getNhomChiTieuList();
        let isValidThuTu = false

        const listChiTieu = nhomChiTieuList.map(item => ({
            mauBaoCaoID: mauBaoCaoID ? mauBaoCaoID : null,
            nhomChiTieuID: item.NhomChiTieuID,
            thuTu: item.ThuTu
        }));

        //Check thứ tự trong nhóm chỉ tiêu
        if (listChiTieu.length > 0) {
            listChiTieu.forEach((item) => {
                if (isValidPositiveIntegerAllowEmpty(item.thuTu) || item.thuTu > 255) {
                    isValidThuTu = true
                    return;
                }
            })
        }


        // Build object theo mẫu
        const dataObj = {
            entityMauBaoCao: {
                tieuDe: tieuDe,
                moTa: moTa
            },
            listChiTieu: listChiTieu
        }


        const dataObj_Update = {
            entityMauBaoCao: {
                ID: mauBaoCaoID,  
                tieuDe: tieuDe,
                moTa: moTa
            },
            listChiTieu: listChiTieu
        }

        console.log(dataObj_Update, "dataObj_Update");
        //return;

        if (checkEmptyBlank(tieuDe)) {
            showNotification(0, "Vui lòng nhập tiêu đề mẫu báo cáo!");
            submitBtn.prop('disabled', false).text(originalText);
            return
        }
        if (checkTagHtmlSingle(tieuDe)) {
            showNotification(0, "Tiêu đề mẫu báo cáo chứa ký tự không hợp lệ")
            submitBtn.prop('disabled', false).text(originalText);
            return
        }
        if (nhomChiTieuList.length === 0) {
            showNotification(0, "Vui lòng thêm ít nhất một nhóm chỉ tiêu!");
            submitBtn.prop('disabled', false).text(originalText);
            return;
        }
        if (isValidThuTu) {
            showNotification(0, "Có ít nhất 1 thứ tự trong nhóm chỉ tiêu không hợp lệ");
            submitBtn.prop('disabled', false).text(originalText);
            return;
        }
        else {
            if (mauBaoCaoID != null && mauBaoCaoID !== "") {
                try {
                    $.ajax({
                        type: "PUT",
                        url: `${baseUrl}/api/RPT_MauBaoCaoApi/Update`,
                        data: JSON.stringify(dataObj_Update),
                        contentType: 'application/json; charset=utf-8',
                        success: function (data) {
                            console.log(data);
                            if (data && data.isSuccess) {
                                showNotification(1, mauBaoCaoID ? 'Cập nhật mẫu báo cáo thành công!' : 'Thêm mới mẫu báo cáo thành công!');
                                $('#modalAdd').modal('hide');
                                initTable();
                            } else {
                                showNotification(0, data.error || 'Lưu dữ liệu thất bại!');
                            }
                        },
                        error: function (err) {
                            console.log(err);
                        }
                    })
                } catch (err) {
                    showNotification(0, err.message || 'Lưu dữ liệu thất bại!');
                } finally {
                    submitBtn.prop('disabled', false).text(originalText);
                }
            }
            else {
                try {
                    $.ajax({
                        type: "POST",
                        url: `${baseUrl}/api/RPT_MauBaoCaoApi/Add`,
                        data: JSON.stringify(dataObj),
                        contentType: 'application/json; charset=utf-8',
                        success: function (data) {
                            console.log(data);
                            if (data && data.isSuccess) {
                                showNotification(1, mauBaoCaoID ? 'Cập nhật mẫu báo cáo thành công!' : 'Thêm mới mẫu báo cáo thành công!');
                                $('#modalAdd').modal('hide');
                                initTable();
                            } else {
                                showNotification(0, data.error || 'Lưu dữ liệu thất bại!');
                            }
                        },
                        error: function (err) {
                            console.log(err);
                        }
                    })
                } catch (err) {
                    showNotification(0, err.message || 'Lưu dữ liệu thất bại!');
                } finally {
                    submitBtn.prop('disabled', false).text(originalText);
                }
            }
        }
    });

    // Xử lý xóa mẫu báo cáo
    $("#formDelete").on("submit", function (e) {
        e.preventDefault();
        dataDelete();
    });

    async function dataDelete() {
        const mauBaoCaoID = $('#idDelete').val();
        if (!mauBaoCaoID) {
            showNotification(0, 'Không xác định được mẫu báo cáo cần xóa!');
            return;
        }
        try {
            const res = await fetch(`${baseUrl}/api/RPT_MauBaoCaoApi/Delete?ID=${mauBaoCaoID}`, {
                method: 'DELETE'
            });
            if (!res.ok) {
                const errText = await res.text();
                showNotification(0, errText || 'Xóa thất bại!');
                return;
            }
            const result = await res.json();
            if (result && result.isSuccess) {
                showNotification(1, 'Xóa thành công!');
                $('#modalDelete').modal('hide');
                initTable();
            } else {
                showNotification(0, result.error || 'Xóa thất bại!');
            }
        } catch (err) {
            showNotification(0, err.message || 'Xóa thất bại!');
        }
    }

    // reset modal
    $("#modalAdd").on('hidden.bs.modal', function () {
        translations = []
        $(this).find('input[type=text], input[type=number], textarea').val('');
        $(this).find('input[type=radio][value=1], input[type=checkbox][value=1]').prop('checked', true);
        ckeditormotaAdd.setData('');
        tempNhomChiTieu = [];
        if (tableNhomChiTieu) {
            tableNhomChiTieu.clear().draw();
        }
    });
});

function initFilter_Option(DanhMucID) {
    // Khởi tạo filter chung với config
    initCommonFilter({
        // HTML cho các option sắp xếp
        htmlFilterSort: `
            <li class="active" data-value="TieuDe"><a class="option_filter">Tiêu đề</a></li>
            <li class="" data-value="NhomChiTieu"><a class="option_filter">Nhóm chỉ tiêu</a></li>
        `,
        
        // Các filter inputs (select) - không bao gồm search box và date inputs
        filterInputs: [
            '#nhom-chi-tieu-search',
            '#trang-thai-search',
            '#ngon-ngu-search'
        ],

        // Ô search từ khóa
        searchInput: '#tu-khoa-search',
        
        // Thời gian debounce (ms)
        debounceTime: 1000,
        
        // URL API Filter
        apiUrl: `${baseUrl}/api/RPT_MauBaoCaoApi/Filter`,
        
        // Function build parameters cho API
        buildFilterParams: function() {
            let params = {
                MaNgonNgu: $('#ngon-ngu-search').val() || 'vi',
                LoaiDanhMucID: DanhMucID
            };
            
            // Từ khóa
            let tuKhoa = $('#tu-khoa-search').val();
            if (tuKhoa && tuKhoa.trim() !== '') {
                params.TuKhoa = tuKhoa;
            }

            // Trạng thái
            let TrangThai = $('#trang-thai-search').val();
            if (TrangThai && TrangThai !== '-1' && TrangThai !== '') {
                switch (TrangThai) {
                    case '1':
                        TrangThai = true;
                        break;
                    case '0':
                        TrangThai = false;
                        break;
                }
                params.TrangThai = TrangThai;
            }

            // Nhóm chỉ tiêu
            let NhomChiTieuID = $('#nhom-chi-tieu-search').val();
            if (NhomChiTieuID && NhomChiTieuID !== '-1' && NhomChiTieuID !== '') {
                params.NhomChiTieuID = NhomChiTieuID;
            }

            return params;
        },
        
        // Callback sau khi apply filter (cho table view)
        onFilterApplied: function(urlFilter) {
            currentFilterUrl = urlFilter;
            if ($.fn.DataTable.isDataTable('#dataGrid')) {
                const table = $('#dataGrid').DataTable();
                table.ajax.url(urlFilter).load();
            }
        },
        
        // Render function cho Card view
        renderCardItem: function(item, index) {
            return renderCardItemHtml(item, index);
        },
        
        // Render function cho List view
        renderListItem: function(item, index) {
            return renderListItemHtml(item, index);
        },
        
        // Callback sau khi render card view
        onCardRendered: function() {
            attachCardEventHandlers();
        },
        
        // Callback sau khi render list view
        onListRendered: function() {
            attachListEventHandlers();
        }
    });
}

//#region CARD VIEW - HELPER FUNCTIONS
// Các hàm này giờ chỉ là wrapper cho backward compatibility
function initCardView() {
    // FilterAction.js sẽ tự động gọi loadViewData
    // Function này giữ lại để backward compatible với event listener
    loadViewData('the');
}

/**
* Render HTML cho 1 card item
*/
function renderCardItemHtml(item, index) {
    // Xử lý trạng thái
    const trangThaiClass = item.suDung ? 'green-text' : 'red-text';
    const trangThaiText = item.suDung ? 'Hoạt động' : 'Không hoạt động';
    
    // Xử lý chức năng
    let actionsHtml = '';
    if (typeof permitedEdit !== 'undefined' && permitedEdit) {
        actionsHtml += `<button class="btn btn-sm btn-outline-primary edit-card-btn" data-id="${item.id}" title="Chỉnh sửa" style="color: #FFB900 !important;">
            <i class="hgi-icon hgi-edit"></i> Sửa 
        </button>`;
    }
    if (typeof permitedDelete !== 'undefined' && permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-card-btn" data-id="${item.id}" data-name="${item.tieuDe}" title="Xóa">
            <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }
    
    return `
        <div class="card-item" data-id="${item.id}">
            <div class="card-body">
                <div class="card-title">${item.tieuDe || '-'}</div>
                <div class="card-info">
                    <div class="info-row">
                        <span class="info-label">Mô tả:</span>
                        <span class="info-value">${item.moTa ? (item.moTa.length > 80 ? item.moTa.substring(0, 80) + '...' : item.moTa) : '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Trạng thái:</span>
                        <span class="TrangThai ${trangThaiClass}">${trangThaiText}</span>
                    </div>
                </div>
            </div>
            <div class="card-footer">
                ${actionsHtml}
            </div>
        </div>
    `;
}

/**
* Attach event handlers cho card view
*/
function attachCardEventHandlers() {
    // Event handler cho nút xóa trong card view
    $('.delete-card-btn').off('click').on('click', function() {
        const id = $(this).data('id');
        const name = $(this).data('name');
        
        $('#idDelete').val(id);
        $('#nameDelete').text(name);
        $('#modalDelete').modal('show');
    });
    
    // Event handler cho nút edit trong card view
    $('.edit-card-btn').off('click').on('click', function() {
        const id = $(this).data('id');
        // Tìm row trong datatable
        const table = $('#dataGrid').DataTable();
        const rows = table.rows().nodes().to$();
        let rowIndex = -1;
        rows.each(function(idx) {
            const rowData = table.row(idx).data();
            if (rowData && rowData.id === id) {
                rowIndex = idx;
                return false;
            }
        });
        if (rowIndex >= 0) {
            $(`.edit-form[id='n-${rowIndex}']`).click();
        }
    });
}
//#endregion

function initTableView() {
    if (!$.fn.DataTable.isDataTable('#dataGrid')) {
        initTable(currentFilterUrl);
    } else {
        const table = $('#dataGrid').DataTable();
        table.ajax.url(currentFilterUrl).load();
    }
}

//#region LIST VIEW - HELPER FUNCTIONS
// Các hàm này giờ chỉ là wrapper cho backward compatibility
function initListView() {
    // FilterAction.js sẽ tự động gọi loadViewData
    // Function này giữ lại để backward compatible với event listener
    loadViewData('danhSach');
}

/**
* Render HTML cho 1 list item
*/
function renderListItemHtml(item, index) {
    // Xử lý trạng thái
    const trangThaiClass = item.suDung ? 'green-text' : 'red-text';
    const trangThaiText = item.suDung ? 'Hoạt động' : 'Không hoạt động';
    
    // Xử lý chức năng
    let actionsHtml = '';
    if (typeof permitedEdit !== 'undefined' && permitedEdit) {
        actionsHtml += `<button class="btn btn-sm btn-outline-primary edit-list-btn" data-id="${item.id}" title="Chỉnh sửa" style="color: #FFB900 !important;">
            <i class="hgi-icon hgi-edit"></i> Sửa
        </button>`;
    }
    if (typeof permitedDelete !== 'undefined' && permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-list-btn" data-id="${item.id}" data-name="${item.tieuDe}" title="Xóa">
            <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }
    
    return `
        <div class="list-item" data-id="${item.id}">
            <div class="list-item-content">
                <div class="list-item-header">
                    <h5 class="list-item-title">${item.tieuDe || '-'}</h5>
                    <span class="TrangThai ${trangThaiClass}">${trangThaiText}</span>
                </div>
                <div class="list-item-body">
                    <div class="list-info-grid">
                        <div class="list-info-item">
                            <span class="list-info-label">Mô tả:</span>
                            <span class="list-info-value">${item.moTa ? (item.moTa.length > 100 ? item.moTa.substring(0, 100) + '...' : item.moTa) : '-'}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="list-item-actions">
                ${actionsHtml}
            </div>
        </div>
    `;
}

/**
* Attach event handlers cho list view
*/
function attachListEventHandlers() {
    // Event handler cho nút xóa trong list view
    $('.delete-list-btn').off('click').on('click', function() {
        const id = $(this).data('id');
        const name = $(this).data('name');
        
        $('#idDelete').val(id);
        $('#nameDelete').text(name);
        $('#modalDelete').modal('show');
    });
    
    // Event handler cho nút edit trong list view
    $('.edit-list-btn').off('click').on('click', function() {
        const id = $(this).data('id');
        // Tìm row trong datatable
        const table = $('#dataGrid').DataTable();
        const rows = table.rows().nodes().to$();
        let rowIndex = -1;
        rows.each(function(idx) {
            const rowData = table.row(idx).data();
            if (rowData && rowData.id === id) {
                rowIndex = idx;
                return false;
            }
        });
        if (rowIndex >= 0) {
            $(`.edit-form[id='n-${rowIndex}']`).click();
        }
    });
}
//#endregion

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
