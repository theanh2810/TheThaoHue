const baseUrl = getRootLink();
let currentFilterUrl = null;

$(document).ready(function () {
    initDatePicker();

    (async function () {
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

    async function initTable() {
        const tableApi = {
            url: `${baseUrl}/api/RPT_BaoCaoApi/Gets?MaNgonNgu=vi`,
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
                targets: 3, // Cột bắt đầu
                render: function (data, type, row, meta) {
                    if (row.batDau) {
                        return new Date(row.batDau).toLocaleDateString('vi-VN');
                    }
                    return '-';
                }
            },
            {
                targets: 4, // Cột kết thúc
                render: function (data, type, row, meta) {
                    if (row.ketThuc) {
                        return new Date(row.ketThuc).toLocaleDateString('vi-VN');
                    }
                    return '-';
                }
            },
            {
                targets: 6, // Cột trạng thái
                render: function (data, type, row, meta) {
                    if (row.suDung) {
                        return `<span class="TrangThai green-text">Hoạt động</span>`;
                    } else {
                        return `<span class="TrangThai red-text">Không hoạt động</span>`;
                    }
                }
            },
            {
                targets: 7, // Cột chức năng
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
            { "data": "mauBaoCaoID", "width": "15%", "class": "left-align" },
            { "data": "batDau", "width": "12%", "class": "center-align" },
            { "data": "ketThuc", "width": "12%", "class": "center-align" },
            { "data": "tenToChuc", "width": "15%", "class": "left-align" },
            { "data": "", "width": "12%", "class": "left-align" },
            { "data": "", "width": "120px", "class": "center-align group-icon-action" }
        ];

        initDataTableConfigNoSearch('dataGrid', tableApi, tableDefs, tableCols);
    }

    // Event handler cho nút xóa
    $(document).on('click', '.delete-command-btn', function () {
        var id = $(this).attr("ID").match(/\d+/)[0];
        var data = $('#dataGrid').DataTable().row(id).data();

        $('#idDelete').val(data.id);
        $('#nameDelete').text(`${data.tieuDe}`);

        $('#modalDelete').modal('show');
    });

    // Xử lý xóa báo cáo
    $("#formDelete").on("submit", function (e) {
        e.preventDefault();
        dataDelete();
    });

    async function dataDelete() {
        const baoCaoID = $('#idDelete').val();
        if (!baoCaoID) {
            showNotification(0, 'Không xác định được báo cáo cần xóa!');
            return;
        }
        try {
            const res = await fetch(`${baseUrl}/api/RPT_BaoCaoApi/Delete?ID=${baoCaoID}`, {
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
        $(this).find('input[type=text], input[type=number], input[type="datetime-local"], textarea').val('');
        $(this).find('select').val('');
        $(this).find('input[type=radio][value=1], input[type=checkbox][value=1]').prop('checked', true);
        ckeditormotaAdd.setData('');
    });
});

function initFilter_Option(DanhMucID) {
    // Khởi tạo filter chung với config
    initCommonFilter({
        // HTML cho các option sắp xếp
        htmlFilterSort: `
            <li class="active" data-value="TieuDe"><a class="option_filter">Tiêu đề</a></li>
        `,
        
        // Các filter inputs (select) - không bao gồm search box và date inputs
        filterInputs: [
            '#trang-thai-search',
            '#ngon-ngu-search'
        ],

        // Ô search từ khóa
        searchInput: '#tu-khoa-search',
        
        // Thời gian debounce (ms)
        debounceTime: 1000,
        
        // URL API Filter
        apiUrl: `${baseUrl}/api/RPT_BaoCaoApi/Filter`,
        
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
function initCardView() {
    loadViewData('the');
}

function renderCardItemHtml(item, index) {
    const trangThaiClass = item.suDung ? 'green-text' : 'red-text';
    const trangThaiText = item.suDung ? 'Hoạt động' : 'Không hoạt động';
    const batDauText = item.batDau ? new Date(item.batDau).toLocaleDateString('vi-VN') : '-';
    const ketThucText = item.ketThuc ? new Date(item.ketThuc).toLocaleDateString('vi-VN') : '-';
    
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
                        <span class="info-label">Bắt đầu:</span>
                        <span class="info-value">${batDauText}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Kết thúc:</span>
                        <span class="info-value">${ketThucText}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Tổ chức:</span>
                        <span class="info-value">${item.tenToChuc || '-'}</span>
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

function attachCardEventHandlers() {
    $('.delete-card-btn').off('click').on('click', function() {
        const id = $(this).data('id');
        const name = $(this).data('name');
        
        $('#idDelete').val(id);
        $('#nameDelete').text(name);
        $('#modalDelete').modal('show');
    });
    
    $('.edit-card-btn').off('click').on('click', function() {
        const id = $(this).data('id');
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
function initListView() {
    loadViewData('danhSach');
}

function renderListItemHtml(item, index) {
    const trangThaiClass = item.suDung ? 'green-text' : 'red-text';
    const trangThaiText = item.suDung ? 'Hoạt động' : 'Không hoạt động';
    const batDauText = item.batDau ? new Date(item.batDau).toLocaleDateString('vi-VN') : '-';
    const ketThucText = item.ketThuc ? new Date(item.ketThuc).toLocaleDateString('vi-VN') : '-';
    
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
                            <span class="list-info-label">Bắt đầu - Kết thúc:</span>
                            <span class="list-info-value">${batDauText} đến ${ketThucText}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Tổ chức:</span>
                            <span class="list-info-value">${item.tenToChuc || '-'}</span>
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

function attachListEventHandlers() {
    $('.delete-list-btn').off('click').on('click', function() {
        const id = $(this).data('id');
        const name = $(this).data('name');
        
        $('#idDelete').val(id);
        $('#nameDelete').text(name);
        $('#modalDelete').modal('show');
    });
    
    $('.edit-list-btn').off('click').on('click', function() {
        const id = $(this).data('id');
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
    if (!input || input.trim() === "") return false;
    const regex = /<[^>]+>/g;
    return regex.test(input);
}

const isValidEmailAllowEmpty = (input) => {
    if (!input || input.trim() === "") return false;
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
    return !regex.test(input.trim());
};

const isValidUrlAllowEmpty = (input) => {
    if (!input || input.trim() === "") return false;
    const regex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/;
    return !regex.test(input.trim());
};
//#endregion function validation
