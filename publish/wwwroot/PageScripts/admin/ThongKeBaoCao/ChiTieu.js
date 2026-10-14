const baseUrl = getRootLink();
let currentFilterUrl = null;
const ckeditormotaAdd = CKEDITOR.replace('moTaAdd');

$(document).ready(function () {
    initDatePicker();
    let translations = [];

    (async function () {
        await Promise.all([
            initDanhMucChung_NoAll(86, "#donViTinhAdd", "Đơn vị tính"),
            initNhomChiTieu()
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
    
    // Lắng nghe event switch sang list view
    $(document).on('viewChanged:list', function() {
        initListView();
    });

    // Lắng nghe event switch sang table view
    $(document).on('viewChanged:table', function() {
        initTableView();
    });

    function initNhomChiTieu() {
        getDataWithApi('GET', '/api/RPT_NhomChiTieuApi/Gets').then(data => {
            if (data && data.isSuccess && data.value) {
                $("#nhomChiTieuAdd").empty().append(`<option value="">Chọn</option>`);
                $("#nhom-chi-tieu-search").empty().append(`<option value="">Chọn</option>`);
                data.value.forEach(item => {
                    const displayText = item.nhomChiTieu || 'Không rõ tên';
                    $("#nhomChiTieuAdd").append(`<option value="${item.id}">${displayText}</option>`);
                    $("#nhom-chi-tieu-search").append(`<option value="${item.id}">${displayText}</option>`);
                });
            }
        })
    }

    async function initTable() {
        const tableApi = {
            url: `${baseUrl}/api/RPT_ChiTieuApi/Gets`,
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
                targets: 3, // Cột trạng thái
                render: function (data, type, row, meta) {
                    if (row.suDung) {
                        return `<span class="TrangThai green-text">Hoạt động</span>`;
                    } else {
                        return `<span class="TrangThai red-text">Không hoạt động</span>`;
                    }
                }
            },
            {
                targets: 4, // Cột chức năng
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
            { "data": "chiTieu", "width": "", "class": "left-align name-text" },
            { "data": "nhomChiTieu", "width": "40%", "class": "left-align" },
            { "data": "suDung", "width": "120px", "class": "left-align" },
            { "data": "", "width": "120px", "class": "center-align group-icon-action" }
        ];

        initDataTableConfigNoSearch('dataGrid', tableApi, tableDefs, tableCols);
    }

    $(document).on('click', '.edit-form', function () {
        var id = $(this).attr("ID").match(/\d+/)[0];
        var data = $('#dataGrid').DataTable().row(id).data();
        translations = []
        if (data) {
            translations = data
        } else {
            console.log(data.error)
        }
        console.log(translations)
        $("#modalAddTitle").text("Cập nhật chỉ tiêu")
        $('#chiTieuIDAdd').val(data.id || "");
        $('#nhomChiTieuAdd').val(data.nhomChiTieuID || "").trigger('change');
        $('#donViTinhAdd').val(data.donViTinhID || "").trigger('change');
        $('#chiTieuAdd').val(data.chiTieu || "");
        ckeditormotaAdd.setData(data.moTa || "");
        $('#thuTuAdd').val(data.thuTu || "");

        // Trạng thái
        if (data.suDung) {
            $('input[name="trangThaiAdd"][value="1"]').prop('checked', true);
        } else {
            $('input[name="trangThaiAdd"][value="0"]').prop('checked', true);
        }

        $('#modalAdd').modal('show');
    });

    // Event handler cho nút xóa
    $(document).on('click', '.delete-command-btn', function () {
        console.log(12321321321)
        var id = $(this).attr("ID").match(/\d+/)[0];
        var data = $('#dataGrid').DataTable().row(id).data();

        $('#idDelete').val(data.id);
        $('#nameDelete').text(`${data.chiTieu}`);

        $('#modalDelete').modal('show');
    });

    // Xử lý submit thêm/sửa chỉ tiêu
    $("#formAdd").on("submit", async function (e) {
        e.preventDefault();
        const submitBtn = $(this).find('button[type="submit"]');
        if (submitBtn.prop('disabled')) return;
        //submitBtn.prop('disabled', true);
        //const originalText = submitBtn.text();
        //submitBtn.text('Đang xử lý...');
        
        // Lấy dữ liệu từ form
        const chiTieuID = $('#chiTieuIDAdd').val();
        const nhomChiTieu = $('#nhomChiTieuAdd').val();
        const donViTinh = $('#donViTinhAdd').val();
        const chiTieu = $('#chiTieuAdd').val();
        const moTa = ckeditormotaAdd.getData();
        const thuTu = $('#thuTuAdd').val();
        const sudung = $('input[name="trangThaiAdd"]:checked').val() === "1" ? true : false;

        // Build object theo mẫu
        const dataObj = {
            nhomChiTieu: nhomChiTieu,
            donViTinh: donViTinh,
            chiTieu: chiTieu,
            moTa: moTa,
            thuTu: thuTu
        };

        const dataObj_update = {
            nhomChiTieu: nhomChiTieu,
            donViTinh: donViTinh,
            chiTieu: chiTieu,
            moTa: moTa,
            thuTu: thuTu,
            id: chiTieuID,
            suDung: sudung
        }

        if (checkEmptyBlank(nhomChiTieu)) {
            showNotification(0, "Vui lòng chọn nhóm chỉ tiêu")
        }
        else if (checkEmptyBlank(donViTinh)) {
            showNotification(0, "Vui lòng chọn đơn vị tính")
        }
        else if (checkEmptyBlank(chiTieu)) {
            showNotification(0, "Vui lòng nhập tên chỉ tiêu!");
        }
        else if (checkTagHtmlSingle(chiTieu)) {
            showNotification(0, "Tên chỉ tiêu chứa ký tự không hợp lệ")
        }
        else if (isValidPositiveIntegerAllowEmpty(thuTu) || Number(thuTu) > 255) {
            showNotification(0, "Thứ tự không hợp lệ")
        }
        else {
            submitBtn.prop('disabled', true);
            const originalText = submitBtn.text();
            submitBtn.text('Đang xử lý...');
            if (chiTieuID && chiTieuID !== "00000000-0000-0000-0000-000000000000") {
                try {
                    $.ajax({
                        type: "PUT",
                        url: `${baseUrl}/api/RPT_ChiTieuApi/Update`,
                        data: JSON.stringify(dataObj_update),
                        contentType: 'application/json; charset=utf-8',
                        success: function (data) {
                            console.log(data);
                            if (data && data.isSuccess) {
                                showNotification(1, chiTieuID ? 'Cập nhật chỉ tiêu thành công!' : 'Thêm mới chỉ tiêu thành công!');
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
                        url: `${baseUrl}/api/RPT_ChiTieuApi/Add`,
                        data: JSON.stringify(dataObj),
                        contentType: 'application/json; charset=utf-8',
                        success: function (data) {
                            console.log(data);
                            if (data && data.isSuccess) {
                                showNotification(1, chiTieuID ? 'Cập nhật chỉ tiêu thành công!' : 'Thêm mới chỉ tiêu thành công!');
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

    // Xử lý xóa chỉ tiêu
    $("#formDelete").on("submit", function (e) {
        e.preventDefault();
        dataDelete();
    });

    async function dataDelete() {
        const chiTieuID = $('#idDelete').val();
        if (!chiTieuID) {
            showNotification(0, 'Không xác định được chỉ tiêu cần xóa!');
            return;
        }
        try {
            const res = await fetch(`${baseUrl}/api/RPT_ChiTieuApi/Delete?ID=${chiTieuID}`, {
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
        $(this).find('input[type=text], textarea').val('');
        $(this).find('select').val('vi').trigger('change');
        $(this).find('input[type=radio][value=1], input[type=checkbox][value=1]').prop('checked', true);
        ckeditormotaAdd.setData('');
    });
});

function initFilter_Option(DanhMucID) {
    // Khởi tạo filter chung với config
    initCommonFilter({
        // HTML cho các option sắp xếp
        htmlFilterSort: `
            <li class="active" data-value="ChiTieu"><a class="option_filter">Chỉ tiêu</a></li>
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
        apiUrl: `${baseUrl}/api/RPT_ChiTieuApi/Filter`,
        
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
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-card-btn" data-id="${item.id}" data-name="${item.chiTieu}" title="Xóa">
            <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }
    
    return `
        <div class="card-item" data-id="${item.id}">
            <div class="card-body">
                <div class="card-title">${item.chiTieu || '-'}</div>
                <div class="card-info">
                    <div class="info-row">
                        <span class="info-label">Nhóm chỉ tiêu:</span>
                        <span class="info-value">${item.nhomChiTieu || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Đơn vị tính:</span>
                        <span class="info-value">${item.donViTinh || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Mô tả:</span>
                        <span class="info-value">${item.moTa ? (item.moTa.length > 60 ? item.moTa.substring(0, 60) + '...' : item.moTa) : '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Thứ tự:</span>
                        <span class="info-value">${item.thuTu || '-'}</span>
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
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-list-btn" data-id="${item.id}" data-name="${item.chiTieu}" title="Xóa">
            <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }
    
    return `
        <div class="list-item" data-id="${item.id}">
            <div class="list-item-content">
                <div class="list-item-header">
                    <h5 class="list-item-title">${item.chiTieu || '-'}</h5>
                    <span class="TrangThai ${trangThaiClass}">${trangThaiText}</span>
                </div>
                <div class="list-item-body">
                    <div class="list-info-grid">
                        <div class="list-info-item">
                            <span class="list-info-label">Nhóm chỉ tiêu:</span>
                            <span class="list-info-value">${item.nhomChiTieu || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Đơn vị tính:</span>
                            <span class="list-info-value">${item.donViTinh || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Mô tả:</span>
                            <span class="list-info-value">${item.moTa ? (item.moTa.length > 80 ? item.moTa.substring(0, 80) + '...' : item.moTa) : '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Thứ tự:</span>
                            <span class="list-info-value">${item.thuTu || '-'}</span>
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
