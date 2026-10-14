const baseUrl = getRootLink();

$(document).ready(function () {
    initDatePicker()
    initDanhMucChung_NoAll(62, "#kieu-mon-search", "Kiểu món") // Kiểu món
    initDanhMucChung_NoAll(63, "#che-do-an-search", "Chế độ ăn") // Chế độ ăn
    initNgonNgu("#ngon-ngu-search")
    initTable()
    setTimeout(() => { 
        initSelect2()
    }, 500);
    initFilter_Option()
    
    // Lắng nghe event switch sang card view
    $(document).on('viewChanged:card', function() {
        initCardView();
    });
    
    // Lắng nghe event switch sang list view
    $(document).on('viewChanged:list', function() {
        initListView();
    });
})

function initTable() {
    const tableApi = {
        url: `${baseUrl}/api/VH_AmThucApi/Filter?MaNgonNgu=vi`,
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
            targets: 1, // Tên món
            render: function (data, type, row, meta) {
                return `<div class="group-info have-image">
                        <div class="have-image">
                            <img src="${row.anhDaiDien || '/assets/images/vector/no-image.png'}" alt="${row.tenMon || ''}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                        </div>
                        <div class="group-info">
                        <div class="info-main">
                            <a href="${baseUrl}/AdminTool/AmThuc/Details?id=${row.monAnUongID}" class="text-primary text-decoration-none">
                                ${row.tenMon || ''}
                            </a>
                        </div>
                    </div>
                </div>`;
            }
        },
        {
            targets: 2, // Kiểu món
            render: function (data, type, row, meta) {
                return row.tenKieuMon || '';
            }
        },
        {
            targets: 3, // Chế độ ăn
            render: function (data, type, row, meta) {
                return row.tenCheDoAn || '';
            }
        },
        {
            targets: 4, // Đặc sản
            render: function (data, type, row, meta) {
                if (row.dacSan) {
                    return `<span class="TrangThai green-text">Có</span>`;
                } else {
                    return `<span class="TrangThai red-text">Không</span>`;
                }
            }
        },
        {
            targets: 5, // Trạng thái
            render: function (data, type, row, meta) {
                if (row.trangThai) {
                    return `<span class="TrangThai green-text">Hoạt động</span>`;
                } else {
                    return `<span class="TrangThai red-text">Không hoạt động</span>`;
                }
            }
        },
        {
            targets: 6, // Chức năng
            render: function (data, type, row, meta) {
                let html = "";
                if (permitedEdit) {
                    html += `<a href="${baseUrl}/AdminTool/AmThuc/Edit?id=${row.monAnUongID}" data-toggle="tooltip" title="Chỉnh sửa" class="text-yellow me-2">
                                <i class="hgi-icon hgi-edit"></i>
                            </a>`;
                }
                if (permitedDelete) {
                    html += `<i data-toggle="tooltip" title="Xóa" class="delete-command-btn text-red cursor-pointer" id="delete-${meta.row}">
                                <i class="hgi-icon hgi-delete"></i>
                            </i>`;
                }
                if (!permitedEdit && !permitedDelete) {
                    html = `<span class="text-muted">Chỉ xem</span>`;
                }
                return html;
            }
        }
    ];

    const tableCols = [
        { "data": "stt", "width": "40px", "class": "left-align" },
        { "data": "", "class": "left-align name-text" },
        { "data": "", "width": "15%", "class": "left-align" },
        { "data": "", "width": "15%", "class": "left-align" },
        { "data": "", "width": "10%", "class": "left-align" },
        { "data": "", "width": "10%", "class": "left-align name-text" },
        { "data": "", "width": "8%", "class": "center-align group-icon-action" }
    ];

    if (!permitedEdit && !permitedDelete) {
        tableCols.pop();
        tableDefs.pop();
    }

    initDataTableConfigNoSearch('dataGrid', tableApi, tableDefs, tableCols);

    // Event handler cho nút xóa
    $('#dataGrid tbody').on('click', '.delete-command-btn', function () {
        var id = $(this).attr("ID").match(/\d+/)[0];
        var data = $('#dataGrid').DataTable().row(id).data();

        $('#idDelete').val(data.monAnUongID);
        $('#nameDelete').text(`${data.tenMon}`);

        $('#modalDelete').modal('show');
    });

    $("#formDelete").on("submit", function (e) {
        e.preventDefault();
        
        const submitBtn = $(this).find('button[type="submit"]');
        if (submitBtn.prop('disabled')) {
            return;
        }
        
        submitBtn.prop('disabled', true);
        const originalText = submitBtn.text();
        submitBtn.text('Đang xóa...');
        
        try {
            dataDelete();
        } catch (error) {
            console.error('Lỗi khi xử lý form:', error);
        } finally {
            setTimeout(() => {
                submitBtn.prop('disabled', false);
                submitBtn.text(originalText);
            }, 1000);
        }
    });
}

function dataDelete() {
    let id = $('#idDelete').val();
    $.ajax({
        url: `${baseUrl}/api/VH_AmThucApi/Delete?MonAnUongID=${id}`,
        type: 'DELETE',
        contentType: 'application/json',
        success: function (data) {
            if (data && data.isSuccess && data.value) {
                showNotification(1, 'Xoá thành công')
                $('#modalDelete').modal('hide');
                reloadCurrentView();
            } else {
                showNotification(0, data.error)
            }
        },
        error: function (err) {
            showNotification(0, 'Có lỗi xảy ra, vui lòng thử lại sau')
        }
    })
}

function initFilter_Option() {
    // Khởi tạo filter chung với config
    initCommonFilter({
        // HTML cho các option sắp xếp
        htmlFilterSort: `
            <li class="active" data-value="Ten"><a class="option_filter">Tên địa điểm</a></li>
            <li class="" data-value="KieuMon"><a class="option_filter">Kiểu món</a></li>
            <li class="" data-value="CheDoAn"><a class="option_filter">Chế độ ăn</a></li>
        `,
        
        // Các filter inputs (select) - không bao gồm search box và date inputs
        filterInputs: [
            '#kieu-mon-search',
            '#che-do-an-search',
            '#dac-san-search',
            '#trang-thai-search',
            '#ngon-ngu-search'
        ],

        // Ô search từ khóa
        searchInput: '#tu-khoa-search',
        
        // Thời gian debounce (ms)
        debounceTime: 1000,
        
        // URL API Filter
        apiUrl: `${baseUrl}/api/VH_AmThucApi/Filter`,
        
        // Function build parameters cho API
        buildFilterParams: function() {
            let params = {
                MaNgonNgu: $('#ngon-ngu-search').val() || 'vi',
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

            // Kiểu món
            let KieuMonID = $('#kieu-mon-search').val();
            if (KieuMonID && KieuMonID !== '-1' && KieuMonID !== '') {
                params.KieuMonID = KieuMonID;
            }

            // Chế độ ăn
            let CheDoAnID = $('#che-do-an-search').val();
            if (CheDoAnID && CheDoAnID !== '-1' && CheDoAnID !== '') {
                params.CheDoAnID = CheDoAnID;
            }

            // Đặc sản
            let DacSan = $('#dac-san-search').val();
            if (DacSan && DacSan !== '-1' && DacSan !== '') {
                switch (DacSan) {
                    case '1':
                        DacSan = true;
                        break;
                    case '0':
                        DacSan = false;
                        break;
                }
                params.DacSan = DacSan;
            }

            return params;
        },
        
        // Callback sau khi apply filter (cho table view)
        onFilterApplied: function(urlFilter) {
            // Reload DataTable với URL mới
            const table = $('#dataGrid').DataTable();
            table.ajax.url(urlFilter).load();
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
    // Xử lý đặc sản
    const dacSanClass = item.dacSan ? 'green-text' : 'red-text';
    const dacSanText = item.dacSan ? 'Có' : 'Không';
    
    // Xử lý trạng thái
    const trangThaiClass = item.trangThai ? 'green-text' : 'red-text';
    const trangThaiText = item.trangThai ? 'Hoạt động' : 'Không hoạt động';
    
    // Xử lý chức năng
    let actionsHtml = '';
    if (permitedEdit) {
        actionsHtml += `<a href="${baseUrl}/AdminTool/AmThuc/Edit?id=${item.monAnUongID}" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa" style="color: #FFB900 !important;">
            <i class="hgi-icon hgi-edit"></i> Sửa 
        </a>`;
    }
    if (permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-card-btn" data-id="${item.monAnUongID}" data-name="${item.tenMon}" title="Xóa">
            <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }
    
    return `
        <div class="card-item" data-id="${item.monAnUongID}">
            <div class="card-image">
                <img src="${item.anhDaiDien || '/assets/images/vector/no-image.png'}" 
                        alt="${item.tenMon || ''}" 
                        onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                <div class="card-badge">
                    <span class="TrangThai ${item.trangThai ? 'green-text' : 'red-text'}">${trangThaiText}</span>
                </div>
            </div>
            <div class="card-body">
                <h5 class="card-title">
                    <a href="${baseUrl}/AdminTool/AmThuc/Details?id=${item.monAnUongID}" class="text-decoration-none">
                        ${item.tenMon || '-'}
                    </a>
                </h5>
                <div class="card-info">
                    <div class="info-row">
                        <span class="info-label">Kiểu món:</span>
                        <span class="info-value">${item.tenKieuMon || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Chế độ ăn:</span>
                        <span class="info-value">${item.tenCheDoAn || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Đặc sản:</span>
                        <span class="info-value"><span class="TrangThai ${dacSanClass}">${dacSanText}</span></span>
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
}
//#endregion

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
    // Xử lý đặc sản
    const dacSanClass = item.dacSan ? 'green-text' : 'red-text';
    const dacSanText = item.dacSan ? 'Có' : 'Không';
    
    // Xử lý trạng thái
    const trangThaiClass = item.trangThai ? 'green-text' : 'red-text';
    const trangThaiText = item.trangThai ? 'Hoạt động' : 'Không hoạt động';
    
    // Xử lý chức năng
    let actionsHtml = '';
    if (permitedEdit) {
        actionsHtml += `<a href="${baseUrl}/AdminTool/AmThuc/Edit?id=${item.monAnUongID}" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa" style="color: #FFB900 !important;">
            <i class="hgi-icon hgi-edit"></i> Sửa
        </a>`;
    }
    if (permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-list-btn" data-id="${item.monAnUongID}" data-name="${item.tenMon}" title="Xóa">
            <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }
    
    return `
        <div class="list-item" data-id="${item.monAnUongID}">
            <div class="list-item-image">
                <img src="${item.anhDaiDien || '/assets/images/vector/no-image.png'}" 
                    alt="${item.tenMon || ''}" 
                    onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
            </div>
            <div class="list-item-content">
                <div class="list-item-header">
                    <h5 class="list-item-title">
                        <a href="${baseUrl}/AdminTool/AmThuc/Details?id=${item.monAnUongID}" class="text-decoration-none">
                            ${item.tenMon || '-'}
                        </a>
                    </h5>
                    <span class="TrangThai ${trangThaiClass}">${trangThaiText}</span>
                </div>
                <div class="list-item-body">
                    <div class="list-info-grid">
                        <div class="list-info-item">
                            <span class="list-info-label">Kiểu món:</span>
                            <span class="list-info-value">${item.tenKieuMon || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Chế độ ăn:</span>
                            <span class="list-info-value">${item.tenCheDoAn || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Đặc sản:</span>
                            <span class="list-info-value"><span class="TrangThai ${dacSanClass}">${dacSanText}</span></span>
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
}
//#endregion

function loadViewData(viewType) {
    // FilterAction.js sẽ handle việc load data và render
    // Function này giữ lại để backward compatible
}

function reloadCurrentView() {
    const tableVisible = $('#tableViewContainer').is(':visible');
    const cardVisible = $('#cardViewContainer').is(':visible');
    const listVisible = $('#listViewContainer').is(':visible');
    
    if (tableVisible) {
        $('#dataGrid').DataTable().ajax.reload();
    } else if (cardVisible) {
        loadViewData('the');
    } else if (listVisible) {
        loadViewData('danhSach');
    }
}