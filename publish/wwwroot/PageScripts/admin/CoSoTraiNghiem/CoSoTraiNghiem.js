const baseUrl = getRootLink();
let currentFilterUrl = null;

$(document).ready(function () {
    //const params = new URLSearchParams(window.location.search);
    const DanhMucID = Number(danhMucID);
    currentFilterUrl = `${baseUrl}/api/DL_CoSoDichVuTraiNghiemApi/Gets?MaNgonNgu=vi&LoaiHinhCoSoID=${DanhMucID}`;
    initDatePicker()
    initDanhMucChung_NoAll(29, "#loai-co-so-search", "") // Loại cơ sở lưu trú
    initDanhMucChung_NoAll(49, "#phong-cach-search", "") // Phong cách cơ sở
    initNgonNgu("#ngon-ngu-search")
    initTable(DanhMucID)
    setTimeout(() => { 
        initSelect2()
    }, 500);
    initFilter_Option(DanhMucID)

    // Lắng nghe event switch sang card view
    $(document).on('viewChanged:card', function() {
        loadViewData('the');
    });
    
    // Lắng nghe event switch sang list view
    $(document).on('viewChanged:list', function() {
        loadViewData('danhSach');
    });

    // Lắng nghe event switch sang table view
    $(document).on('viewChanged:table', function() {
        initTableView();
    });

    if (DanhMucID == 193) {
        $(".TieuDe h2").text("Quản lý cơ sở kinh doanh dịch vụ - thể thao");
    } else if (DanhMucID == 194) {
        $(".TieuDe h2").text("Quản lý cơ sở chăm sóc sức khỏe");
    } else if (DanhMucID == 196) {
        $(".TieuDe h2").text("Quản lý cơ sở vui chơi giải trí");
    } else if (DanhMucID == 191) {
        $(".TieuDe h2").text("Quản lý cơ sở mua sắm");
    }
})

function initTable(DanhMucID, filterUrl = null) {
    const baseTableUrl = `${baseUrl}/api/DL_CoSoDichVuTraiNghiemApi/Gets?MaNgonNgu=vi&LoaiHinhCoSoID=${DanhMucID}`;
    if (filterUrl) {
        currentFilterUrl = filterUrl;
    } else {
        currentFilterUrl = baseTableUrl;
    }
    const tableApi = {
        url: filterUrl || baseTableUrl,
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        dataSrc: function (data) {
            //console.log(data)
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
                return `<div class="group-info have-image" id=n-"${meta.row}">
                            <div class="have-image">
                                <img src="${row.anhDaiDien || '/assets/images/vector/no-image.png'}" alt="${row.tenCoSo || ''}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                            </div>
                            <div class="group-info">
                                <div class="info-main">
                                    <a href="${baseUrl}/AdminTool/CoSoTraiNghiem/${typeName}/Details?id=${row.coSoDichVuID}" class="text-primary text-decoration-none">
                                        ${row.tenCoSo || ''}
                                    </a>
                                </div>
                                <div class="info-sub">${row.diaChi || ''}</div>
                            </div>
                        </div>`;
            }
        },
        {
            targets: 2, // Phong cách
            render: function (data, type, row, meta) {
                return row.tenDiaDiem || '-';
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
                    html += `<a href="${baseUrl}/AdminTool/CoSoTraiNghiem/${typeName}/Edit?id=${row.coSoDichVuID}" data-toggle="tooltip" title="Chỉnh sửa" class="text-yellow me-2">
                                <i class="hgi-icon hgi-edit"></i>
                            </a>`;
                }
                if (permitedDelete) {
                    html += `<i data-toggle="tooltip" title="Xóa" class="delete-command-btn text-red cursor-pointer" id="delete-${meta.row}">
                                <i class="hgi-icon hgi-delete"></i>
                            </i>`;
                }
                return html;
            }
        }
    ];

    const tableCols = [
        { "data": "stt", "width": "40px", "class": "left-align" },
        { "data": "", "class": "left-align name-text" },
        { "data": "", "width": "20%", "class": "left-align" },
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

        $('#idDelete').val(data.coSoDichVuID);
        $('#nameDelete').text(`${data.tenCoSo}`);

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


    $("#btnAdd").on('click', function () {
        window.location.href = `/AdminTool/CoSoTraiNghiem/${typeName}/Add`
    })
}

function dataDelete() {
    let id = $('#idDelete').val();
    $.ajax({
        url: `${baseUrl}/api/DL_CoSoDichVuTraiNghiemApi/Delete?CoSoDichVuID=${id}`,
        type: 'DELETE',
        contentType: 'application/json',
        success: function (data) {
            if (data && data.isSuccess && data.value) {
                showNotification(1, 'Xoá thành công')
                $('#modalDelete').modal('hide');
                $('#dataGrid').DataTable().ajax.reload();
            } else {
                showNotification(0, data.error)
            }
        },
        error: function (err) {
            showNotification(0, 'Có lỗi xảy ra, vui lòng thử lại sau')
        }
    })
}

function initFilter_Option(DanhMucID) {
    // Khởi tạo filter chung với config
    initCommonFilter({
        // HTML cho các option sắp xếp
        htmlFilterSort: `
            <li class="active" data-value="TenCoSo"><a class="option_filter">Tên cơ sở</a></li>
        `,

        // Các filter inputs (select) - không bao gồm search box và date inputs
        filterInputs: [
            '#ngon-ngu-search'
        ],
        
        // Ô search từ khóa
        searchInput: '#tu-khoa-search',
        
        // Thời gian debounce (ms)
        debounceTime: 1000,
        
        // URL API Filter
        apiUrl: `${baseUrl}/api/DL_CoSoDichVuTraiNghiemApi/Filter`,
        
        // Function build parameters cho API
        buildFilterParams: function() {
            let params = {
                MaNgonNgu: $('#ngon-ngu-search').val() || 'vi',
                LoaiHinhCoSoID: DanhMucID
            };
            
            // Từ khóa
            let tuKhoa = $('#tu-khoa-search').val();
            if (tuKhoa && tuKhoa.trim() !== '') {
                params.TuKhoa = tuKhoa;
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
        
        // Render cho Card View
        renderCardItem: function(item, index) {
            return renderCardItemHtml(item, index);
        },
        
        // Render cho List View
        renderListItem: function(item, index) {
            return renderListItemHtml(item, index);
        },
        
        // Callback sau khi render xong cards
        onCardRendered: function() {
            attachCardEventHandlers();
        },
        
        // Callback sau khi render xong list
        onListRendered: function() {
            attachListEventHandlers();
        }
    });
}

//#region CARD VIEW - HELPER FUNCTIONS
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
        actionsHtml += `<a href="${baseUrl}/AdminTool/CoSoTraiNghiem/${typeName}/Edit?id=${item.coSoDichVuID}" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa" style="color: #FFB900 !important;">
            <i class="hgi-icon hgi-edit"></i> Sửa 
        </a>`;
    }
    if (permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-card-btn" data-id="${item.coSoDichVuID}" data-name="${item.tenCoSo}" title="Xóa">
            <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }
    
    return `
        <div class="card-item" data-id="${item.coSoDichVuID}">
            <div class="card-image">
                <img src="${item.anhDaiDien || '/assets/images/vector/no-image.png'}" 
                     alt="${item.tenCoSo || '-'}" 
                     onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                <div class="card-badge">
                    <span class="TrangThai ${trangThaiClass}">${trangThaiText}</span>
                </div>
            </div>
            <div class="card-body">
                <h5 class="card-title">
                    <a href="${baseUrl}/AdminTool/CoSoTraiNghiem/${typeName}/Details?id=${item.coSoDichVuID}" class="text-decoration-none">
                        ${item.tenCoSo || '-'}
                    </a>
                </h5>
                <div class="card-info">
                    <div class="info-row">
                        <span class="info-label">Địa chỉ:</span>
                        <span class="info-value">${item.diaChi || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Địa điểm:</span>
                        <span class="info-value">${item.tenDiaDiem || '-'}</span>
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
    $('.delete-card-btn').off('click').on('click', function() {
        const coSoDichVuID = $(this).data('id');
        const tenCoSo = $(this).data('name');
        
        $('#idDelete').val(coSoDichVuID);
        $('#nameDelete').text(tenCoSo);
        $('#modalDelete').modal('show');
    });
}
//#endregion

//#region LIST VIEW - HELPER FUNCTIONS
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
        actionsHtml += `<a href="${baseUrl}/AdminTool/CoSoTraiNghiem/${typeName}/Edit?id=${item.coSoDichVuID}" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa" style="color: #FFB900 !important;">
            <i class="hgi-icon hgi-edit"></i> Sửa
        </a>`;
    }
    if (permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-list-btn" data-id="${item.coSoDichVuID}" data-name="${item.tenCoSo}" title="Xóa">
                <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }
    
    return `
        <div class="list-item" data-id="${item.coSoDichVuID}">
            <div class="list-item-image">
                <img src="${item.anhDaiDien || '/assets/images/vector/no-image.png'}" 
                     alt="${item.tenCoSo || '-'}" 
                     onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
            </div>
            <div class="list-item-content">
                <div class="list-item-header">
                    <h5 class="list-item-title">
                        <a href="${baseUrl}/AdminTool/CoSoTraiNghiem/${typeName}/Details?id=${item.coSoDichVuID}" class="text-decoration-none">
                            ${item.tenCoSo || '-'}
                        </a>
                    </h5>
                    <span class="TrangThai ${trangThaiClass}">${trangThaiText}</span>
                </div>
                <div class="list-item-body">
                    <div class="list-info-grid">
                        <div class="list-info-item">
                            <span class="list-info-label">Địa chỉ:</span>
                            <span class="list-info-value">${item.diaChi || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Địa điểm:</span>
                            <span class="list-info-value">${item.tenDiaDiem || '-'}</span>
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
    $('.delete-list-btn').off('click').on('click', function() {
        const coSoDichVuID = $(this).data('id');
        const tenCoSo = $(this).data('name');
        
        $('#idDelete').val(coSoDichVuID);
        $('#nameDelete').text(tenCoSo);
        $('#modalDelete').modal('show');
    });
}

function initTableView() {
    if (!$.fn.DataTable.isDataTable('#dataGrid')) {
        initTable(DanhMucID, currentFilterUrl);
    } else {
        const table = $('#dataGrid').DataTable();
        table.ajax.url(currentFilterUrl).load();
    }
}
//#endregion