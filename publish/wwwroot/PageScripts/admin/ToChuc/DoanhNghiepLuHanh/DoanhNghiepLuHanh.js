const baseUrl = getRootLink();
let currentFilterUrl = null;

// Helper function to format year
function formatYear(dateString) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return date.getFullYear();
    } catch {
        return dateString;
    }
}

$(document).ready(function () {
    initDatePicker();
    initDanhMucChung_NoAll(31, "#loai-hinh-search", "Loại hình")
    initNgonNgu("#ngon-ngu-search")
    initTable();
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

    // Lắng nghe event switch sang table view
    $(document).on('viewChanged:table', function() {
        initTableView();
    });
});

function initTable() {
    const tableApi = {
        url: `${baseUrl}/api/ToChucApi/FilterDoanhNghiepLuHanh?MaNgonNgu=vi`,
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        dataSrc: function (data) {
            console.log(data)
            if (data && data.isSuccess && data.value.length > 0) {
                console.log(data)
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
            targets: 1, // Cột tên cơ quan báo chí
            render: function (data, type, row, meta) {
                return `<div class="group-info">
                    <div class="info-main">
                        <a href="${baseUrl}/AdminTool/DoanhNghiepLuHanh/Details?id=${row.toChucID}" class="text-primary text-decoration-none">
                            ${row.tenToChuc || ''}
                        </a>
                    </div>
                    <div class="info-sub">${row.diaChi || ''}</div>
                </div>`;
            }
        },
        {
            targets: 3, 
            render: function (data, type, row, meta) {
                return formatYear(row.ngayThanhLap);
            }
        },
        {
            targets: 4, // Cột trạng thái
            render: function (data, type, row, meta) {
                if (row.trangThaiID == 1) {
                    return `<span class="TrangThai green-text">Duyệt</span>`;
                } else {
                    return `<span class="TrangThai red-text">Chưa duyệt</span>`;
                }
            }
        },
        {
            targets: 5, // Cột chức năng
            render: function (data, type, row, meta) {
                let html = "";
                if (permitedEdit) {
                    html += `<a href="${baseUrl}/AdminTool/DoanhNghiepLuHanh/Edit?id=${row.toChucID}" data-toggle="tooltip" title="Chỉnh sửa" class="text-yellow me-2">
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
        { "data": "tenToChuc", "class": "left-align name-text" },
        { "data": "loaiHinh", "width": "12%", "class": "left-align" },
        { "data": "", "width": "10%", "class": "center-align" },
        { "data": "trangThaiID", "width": "8%", "class": "left-align" },
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

        $('#idDelete').val(data.toChucID);
        $('#nameDelete').text(`${data.tenToChuc}`);

        $('#modalDelete').modal('show');
    });

    $("#formDelete").on("submit", async function (e) {
        e.preventDefault();
        
        const submitBtn = $(this).find('button[type="submit"]');
        if (submitBtn.prop('disabled')) {
            return;
        }
        
        submitBtn.prop('disabled', true);
        const originalText = submitBtn.text();
        submitBtn.text('Đang xóa...');
        
        try {
            await dataDelete();
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
        url: `${baseUrl}/api/ToChucApi/Xoa/${id}`,
        type: 'DELETE',
        contentType: 'application/json',
        success: function (data) {
            if (data && data.isSuccess && data.value) {
                showNotification(1, 'Xoá thành công')
                $('#modalDelete').modal('hide');
                // Reload data cho cả table và card/list view
                if (typeof loadViewData === 'function') {
                    loadViewData();
                } else {
                    $('#dataGrid').DataTable().ajax.reload();
                }
            } else {
                showNotification(0, data.error)
            }
        },
        error: function (err) {
            showNotification(0, 'Có lỗi xảy ra, vui lòng thử lại sau')
        }
    })
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
    const trangThaiClass = item.trangThaiID == 1 ? 'green-text' : 'red-text';
    const trangThaiText = item.trangThaiID == 1 ? 'Duyệt' : 'Chưa duyệt';
    
    // Xử lý chức năng
    let actionsHtml = '';
    if (permitedEdit) {
        actionsHtml += `<a href="${baseUrl}/AdminTool/DoanhNghiepLuHanh/Edit?id=${item.toChucID}" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa" style="color: #FFB900 !important;">
            <i class="hgi-icon hgi-edit"></i> Sửa
        </a>`;
    }
    if (permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-card-btn" data-id="${item.toChucID}" data-name="${item.tenToChuc}" title="Xóa">
            <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }
    
    return `
        <div class="card-item" data-id="${item.toChucID}">
            <div class="card-image">
                <img src="/assets/images/vector/no-image.png" 
                     alt="${item.tenToChuc || '-'}" 
                     onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                <div class="card-badge">
                    <span class="TrangThai ${trangThaiClass}">${trangThaiText}</span>
                </div>
            </div>
            <div class="card-body">
                <h5 class="card-title">
                    <a href="${baseUrl}/AdminTool/DoanhNghiepLuHanh/Details?id=${item.toChucID}" class="text-decoration-none">
                        ${item.tenToChuc || '-'}
                    </a>
                </h5>
                <div class="card-info">
                    <div class="info-row">
                        <span class="info-label">Địa chỉ:</span>
                        <span class="info-value">${item.diaChi || 'Chưa cập nhật'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Loại hình:</span>
                        <span class="info-value">${item.loaiHinh || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Năm thành lập:</span>
                        <span class="info-value">${item.ngayThanhLap ? formatYear(item.ngayThanhLap) : '-'}</span>
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
    // Xử lý trạng thái
    const trangThaiClass = item.trangThaiID == 1 ? 'green-text' : 'red-text';
    const trangThaiText = item.trangThaiID == 1 ? 'Duyệt' : 'Chưa duyệt';
    
    // Xử lý chức năng
    let actionsHtml = '';
    if (permitedEdit) {
        actionsHtml += `<a href="${baseUrl}/AdminTool/DoanhNghiepLuHanh/Edit?id=${item.toChucID}" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa" style="color: #FFB900 !important;">
            <i class="hgi-icon hgi-edit"></i> Sửa
        </a>`;
    }
    if (permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-list-btn" data-id="${item.toChucID}" data-name="${item.tenToChuc}" title="Xóa">
            <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }
    
    return `
        <div class="list-item" data-id="${item.toChucID}">
            <div class="list-item-image">
                <img src="/assets/images/vector/no-image.png" 
                     alt="${item.tenToChuc || '-'}" 
                     onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
            </div>
            <div class="list-item-content">
                <div class="list-item-header">
                    <h5 class="list-item-title">
                        <a href="${baseUrl}/AdminTool/DoanhNghiepLuHanh/Details?id=${item.toChucID}" class="text-decoration-none">
                            ${item.tenToChuc || '-'}
                        </a>
                    </h5>
                    <span class="TrangThai ${trangThaiClass}">${trangThaiText}</span>
                </div>
                <div class="list-item-body">
                    <div class="list-info-grid">
                        <div class="list-info-item">
                            <span class="list-info-label"><i class="hgi-icon hgi-location"></i> Địa chỉ:</span>
                            <span class="list-info-value">${item.diaChi || 'Chưa cập nhật'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Loại hình:</span>
                            <span class="list-info-value">${item.loaiHinh || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Năm thành lập:</span>
                            <span class="list-info-value">${item.ngayThanhLap ? formatYear(item.ngayThanhLap) : '-'}</span>
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

function initFilter_Option() {
    // Khởi tạo filter chung với config
    initCommonFilter({
        // HTML cho các option sắp xếp
        htmlFilterSort: `
            <li class="active" data-value="TenToChuc"><a class="option_filter">Tên doanh nghiệp</a></li>
            <li data-value="LoaiHinh"><a class="option_filter">Loại hình</a></li>
        `,
        
        // Các filter inputs (select) - không bao gồm search box và date inputs
        filterInputs: [
            '#loai-hinh-search',
            '#trang-thai-search',
            '#ngon-ngu-search'
        ],

        // Ô search từ khóa
        searchInput: '#tu-khoa-search',
        
        // Thời gian debounce (ms)
        debounceTime: 1000,
        
        // URL API Filter
        apiUrl: `${baseUrl}/api/ToChucApi/FilterDoanhNghiepLuHanh`,
        
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
            
            // Loại hình
            let LoaiHinhID = $('#loai-hinh-search').val();
            if (LoaiHinhID && LoaiHinhID !== '-1' && LoaiHinhID !== '') {
                params.LoaiHinhID = LoaiHinhID;
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
        
        // Callback sau khi apply filter
        onFilterApplied: function(urlFilter) {
            // Lưu URL filter vào biến global
            currentFilterUrl = urlFilter;
            // Reload DataTable nếu nó đã được khởi tạo
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

function initTableView() {
    if (!$.fn.DataTable.isDataTable('#dataGrid')) {
        initTable(currentFilterUrl);
    } else {
        const table = $('#dataGrid').DataTable();
        table.ajax.url(currentFilterUrl).load();
    }
}