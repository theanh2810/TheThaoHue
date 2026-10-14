const baseUrl = getRootLink();

$(document).ready(function () {
    initDatePicker()
    initDanhMucChung_NoAll(29, "#loai-co-so-search", "") // Loại cơ sở lưu trú
    initDanhMucChung_NoAll(49, "#phong-cach-search", "") // Phong cách cơ sở
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
        url: `${baseUrl}/api/DL_DichVuTienIchApi/GetsNVSCongCong?MaNgonNgu=vi`,
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
            targets: 1, // Tên cơ sở lưu trú
            render: function (data, type, row, meta) {
                return `<div class="group-info">
                    <div class="info-main">
                        <a href="${baseUrl}/AdminTool/TienIchKhac/DiemVSCongCong/Details?id=${row.dichVuTienIchID}" class="text-primary text-decoration-none">
                            ${row.tenNhomDichVu || ''}
                        </a>
                    </div>
                    <div class="info-sub">${row.diaChi || ''}</div>
                </div>`;
            }
        },
        {
            targets: 2, // Loại cơ sở
            render: function (data, type, row, meta) {
                return row.tenDiaDiem || '';
            }
        },

        {
            targets: 3, // Trạng thái
            render: function (data, type, row, meta) {
                if (row.trangThai) {
                    return `<span class="TrangThai green-text">Hoạt động</span>`;
                } else {
                    return `<span class="TrangThai red-text">Không hoạt động</span>`;
                }
            }
        },
        {
            targets: 4, // Chức năng
            render: function (data, type, row, meta) {
                let html = "";
                if (permitedEdit) {
                    html += `<a href="${baseUrl}/AdminTool/TienIchKhac/DiemVSCongCong/Edit?id=${row.dichVuTienIchID}" data-toggle="tooltip" title="Chỉnh sửa" class="text-yellow me-2">
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
        { "data": "", "class": "left-align name-text" },
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

        $('#idDelete').val(data.dichVuTienIchID);
        $('#nameDelete').text(`${data.tenNhomDichVu} ${data.tenDiaDiem ? `tại địa điểm ${data.tenDiaDiem}` : ''} `);

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
        url: `${baseUrl}/api/DL_DichVuTienIchApi/Delete?DichVuTienIchID=${id}`,
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

function initFilter_Option() {
    // Khởi tạo filter chung với config
    initCommonFilter({
        // HTML cho các option sắp xếp
        htmlFilterSort: `
            <li class="active" data-value="TenToChuc"><a class="option_filter">Tên địa điểm</a></li>
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
        apiUrl: `${baseUrl}/api/DL_DichVuTienIchApi/Filter`,
        
        // Function build parameters cho API
        buildFilterParams: function() {
            let params = {
                MaNgonNgu: $('#ngon-ngu-search').val() || 'vi',
                LoaiDanhMucID: 60 // Loại danh mục: Tiện ích công cộng
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
        
        // Callback sau khi apply filter
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
    // Xử lý trạng thái
    const trangThaiClass = item.trangThai ? 'green-text' : 'red-text';
    const trangThaiText = item.trangThai ? 'Hoạt động' : 'Không hoạt động';
    
    // Xử lý chức năng
    let actionsHtml = '';
    if (permitedEdit) {
        actionsHtml += `<a href="${baseUrl}/AdminTool/TienIchKhac/DiemVSCongCong/Edit?id=${item.dichVuTienIchID}" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa" style="color: #FFB900 !important;">
            <i class="hgi-icon hgi-edit"></i> Sửa
        </a>`;
    }
    if (permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-card-btn" data-id="${item.dichVuTienIchID}" data-name="${item.tenNhomDichVu}" title="Xóa">
            <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }
    
    return `
        <div class="card-item" data-id="${item.dichVuTienIchID}">
            <div class="card-body">
                <h5 class="card-title">
                    <a href="${baseUrl}/AdminTool/TienIchKhac/DiemVSCongCong/Details?id=${item.dichVuTienIchID}" class="text-decoration-none">
                        ${item.tenNhomDichVu || '-'}
                    </a>
                </h5>
                <div class="card-info">
                    <div class="info-row">
                        <span class="info-label">Địa điểm:</span>
                        <span class="info-value">${item.tenDiaDiem || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Địa chỉ:</span>
                        <span class="info-value">${item.diaChi || 'Chưa cập nhật'}</span>
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
    const trangThaiClass = item.trangThai ? 'green-text' : 'red-text';
    const trangThaiText = item.trangThai ? 'Hoạt động' : 'Không hoạt động';
    
    // Xử lý chức năng
    let actionsHtml = '';
    if (permitedEdit) {
        actionsHtml += `<a href="${baseUrl}/AdminTool/TienIchKhac/EditDiemVSCongCong?id=${item.dichVuTienIchID}" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa" style="color: #FFB900 !important;">
            <i class="hgi-icon hgi-edit"></i> Sửa
        </a>`;
    }
    if (permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-list-btn" data-id="${item.dichVuTienIchID}" data-name="${item.tenNhomDichVu}" title="Xóa">
            <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }
    
    return `
        <div class="list-item" data-id="${item.dichVuTienIchID}">
            <div class="list-item-content">
                <div class="list-item-header">
                    <h5 class="list-item-title">
                        <a href="${baseUrl}/AdminTool/TienIchKhac/DetailsDiemVSCongCong?id=${item.dichVuTienIchID}" class="text-decoration-none">
                            ${item.tenNhomDichVu || '-'}
                        </a>
                    </h5>
                    <span class="TrangThai ${trangThaiClass}">${trangThaiText}</span>
                </div>
                <div class="list-item-body">
                    <div class="list-info-grid">
                        <div class="list-info-item">
                            <span class="list-info-label"><i class="hgi-icon hgi-location"></i> Địa điểm:</span>
                            <span class="list-info-value">${item.tenDiaDiem || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Địa chỉ:</span>
                            <span class="list-info-value">${item.diaChi || 'Chưa cập nhật'}</span>
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
