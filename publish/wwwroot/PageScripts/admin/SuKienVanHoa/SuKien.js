
const baseUrl = getRootLink();

$(document).ready(function () {
    initDatePicker()
    initDanhMucChung_NoAll(39, "#cap-do-search", "Cấp độ") // Loại đối tượng - Cấp độ
    initDanhMucChung_NoAll(42, "#trang-thai-su-kien-search", "Trạng thái sự kiện") // Trạng thái sự kiện
    initNgonNgu("#ngon-ngu-search")
    initTable()
    CheckDateMinMax("#ngay-bat-dau-search", "#ngay-ket-thuc-search")
    setTimeout(() => { 
        initSelect2()
    }, 500);
    initFilter_Option()
    
    // Lắng nghe event switch sang card view
    $(document).on('viewChanged:card', function() {
        loadViewData('the');
    });
    
    // Lắng nghe event switch sang list view
    $(document).on('viewChanged:list', function() {
        loadViewData('danhSach');
    });
})

function initTable() {
    const tableApi = {
        url: `${baseUrl}/api/DM_SuKienApi/Filter?MaNgonNgu=vi&LinhVucID=238`,
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
                return `<div class="group-info have-image">
                    <div class="have-image">
                        <img src="${row.anhDaiDien || '/assets/images/vector/no-image.png'}" alt="${row.tenSuKien || ''}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                    </div>
                    <div class="group-info">
                        <div class="info-main">
                            <a href="${baseUrl}/AdminTool/SuKien/Details?id=${row.suKienID}" class="text-primary text-decoration-none">
                                ${row.tenSuKien || ''}
                            </a>
                        </div>
                        <div class="info-sub">${row.maDinhDanh || ''}</div>
                    </div>
                </div>`;
            }
        },
        {
            targets: 2, // Thể loại
            render: function (data, type, row, meta) {
                if (row.batDau == row.ketThuc) {
                    return formatDateWithoutTime(row.batDau);
                } else {
                    return `${formatDateWithoutTime(row.batDau)} - ${formatDateWithoutTime(row.ketThuc)}`;
                }
            }
        },
        {
            targets: 3, // Cấp độ
            render: function (data, type, row, meta) {
                return row.tenCapDo || '';
            }
        },
        {
            targets: 4, // Tần suất
            render: function (data, type, row, meta) {
                return row.tenTrangThai || "";
            }
        },
        {
            targets: 5, // Trạng thái
            render: function (data, type, row, meta) {
                if (row.trangThai) {
                    return `<span class="TrangThai green-text">Duyệt</span>`;
                } else {
                    return `<span class="TrangThai red-text">Chưa duyệt</span>`;
                }
            }
        },
        {
            targets: 6, // Chức năng
            render: function (data, type, row, meta) {
                let html = "";
                if (permitedEdit) {
                    html += `<a href="${baseUrl}/AdminTool/SuKienVanHoa/Edit?id=${row.suKienID}" data-toggle="tooltip" title="Chỉnh sửa" class="text-yellow me-2">
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
        { "data": "", "width": "7%", "class": "left-align" },
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

        $('#idDelete').val(data.suKienID);
        $('#nameDelete').text(`${data.tenSuKien}`);

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
        url: `${baseUrl}/api/DM_SuKienApi/Delete?SuKienID=${id}`,
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

function initFilter_Option() {
    // Khởi tạo filter chung với config
    initCommonFilter({
        // HTML cho các option sắp xếp
        htmlFilterSort: `
            <li class="active" data-value="TenSuKien"><a class="option_filter">Tên sự kiện</a></li>
            <li data-value="CapDo"><a class="option_filter">Cấp độ</a></li>
            <li class="" data-value="BatDau"><a class="option_filter">Ngày bắt đầu</a></li>
            <li class="" data-value="KetThuc"><a class="option_filter">Ngày kết thúc</a></li>
            <li class="" data-value="TrangThai"><a class="option_filter">Trạng thái sự kiện</a></li>
        `,
        
        // Các filter inputs (select) - không bao gồm search box và date inputs
        filterInputs: [
            '#cap-do-search',
            '#trang-thai-su-kien-search',
            '#trang-thai-search',
            '#ngon-ngu-search'
        ],
        
        // Các date inputs - sẽ tự động format bằng formatDateToSaveAsString
        dateInputs: [
            '#ngay-bat-dau-search',
            '#ngay-ket-thuc-search'
        ],
        
        // Ô search từ khóa
        searchInput: '#tu-khoa-search',
        
        // Thời gian debounce (ms)
        debounceTime: 1000,
        
        // URL API Filter
        apiUrl: `${baseUrl}/api/DM_SuKienApi/Filter`,
        
        // Function build parameters cho API
        buildFilterParams: function() {
            let params = {
                MaNgonNgu: $('#ngon-ngu-search').val() || 'vi',
                LinhVucID: 238
            };
            
            // Từ khóa
            let tuKhoa = $('#tu-khoa-search').val();
            if (tuKhoa && tuKhoa.trim() !== '') {
                params.TuKhoa = tuKhoa;
            }
            
            // Cấp độ
            let CapDoID = $('#cap-do-search').val();
            if (CapDoID && CapDoID !== '-1' && CapDoID !== '') {
                params.CapDoID = CapDoID;
            }
            
            // Trạng thái sự kiện
            let TrangThaiID = $('#trang-thai-su-kien-search').val();
            if (TrangThaiID && TrangThaiID !== '-1' && TrangThaiID !== '') {
                params.TrangThaiID = TrangThaiID;
            }

            // Ngày bắt đầu - RAW VALUE (sẽ được format tự động bởi applyCommonFilter)
            let NgayBatDau = $('#ngay-bat-dau-search').val();
            if (NgayBatDau && NgayBatDau.trim() !== '') {
                params.NgayBatDau = NgayBatDau;
            }

            // Ngày kết thúc - RAW VALUE (sẽ được format tự động bởi applyCommonFilter)
            let NgayKetThuc = $('#ngay-ket-thuc-search').val();
            if (NgayKetThuc && NgayKetThuc.trim() !== '') {
                params.NgayKetThuc = NgayKetThuc;
            }

            // Trạng thái
            let TrangThai = $('#trang-thai-search').val();
            if (TrangThai && TrangThai !== '-1' && TrangThai !== '') {
                switch (TrangThai) {
                    case '1':
                        TrangThai = true;
                        break;
                    case '2':
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
    // Xử lý thời gian diễn ra
    let thoiGianText = '-';
    if (item.batDau == item.ketThuc) {
        thoiGianText = formatDateWithoutTime(item.batDau);
    } else {
        thoiGianText = `${formatDateWithoutTime(item.batDau)} - ${formatDateWithoutTime(item.ketThuc)}`;
    }
    
    // Xử lý trạng thái
    const trangThaiClass = item.trangThai ? 'green-text' : 'red-text';
    const trangThaiText = item.trangThai ? 'Duyệt' : 'Chưa duyệt';
    
    // Xử lý chức năng
    let actionsHtml = '';
    if (permitedEdit) {
        actionsHtml += `<a href="${baseUrl}/AdminTool/SuKienVanHoa/Edit?id=${item.suKienID}" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa" style="color: #FFB900 !important;">
            <i class="hgi-icon hgi-edit"></i> Sửa 
        </a>`;
    }
    if (permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-card-btn" data-id="${item.suKienID}" data-name="${item.tenSuKien}" title="Xóa">
            <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }
    
    return `
        <div class="card-item" data-id="${item.suKienID}">
            <div class="card-image">
                <img src="${item.anhDaiDien || '/assets/images/vector/no-image.png'}" 
                     alt="${item.tenSuKien || '-'}" 
                     onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                <div class="card-badge">
                    <span class="TrangThai ${trangThaiClass}">${trangThaiText}</span>
                </div>
            </div>
            <div class="card-body">
                <h5 class="card-title">
                    <a href="${baseUrl}/AdminTool/SuKienVanHoa/Details?id=${item.suKienID}" class="text-decoration-none">
                        ${item.tenSuKien || '-'}
                    </a>
                </h5>
                <div class="card-info">
                    <div class="info-row">
                        <span class="info-label">Mã định danh:</span>
                        <span class="info-value">${item.maDinhDanh || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Thời gian:</span>
                        <span class="info-value">${thoiGianText}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Cấp độ:</span>
                        <span class="info-value">${item.tenCapDo || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Trạng thái sự kiện:</span>
                        <span class="info-value">${item.tenTrangThai || '-'}</span>
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
        const suKienID = $(this).data('id');
        const tenSuKien = $(this).data('name');
        
        $('#idDelete').val(suKienID);
        $('#nameDelete').text(tenSuKien);
        $('#modalDelete').modal('show');
    });
}
//#endregion

//#region LIST VIEW - HELPER FUNCTIONS
/**
 * Render HTML cho 1 list item
 */
function renderListItemHtml(item, index) {
    // Xử lý thời gian diễn ra
    let thoiGianText = '-';
    if (item.batDau == item.ketThuc) {
        thoiGianText = formatDateWithoutTime(item.batDau);
    } else {
        thoiGianText = `${formatDateWithoutTime(item.batDau)} - ${formatDateWithoutTime(item.ketThuc)}`;
    }
    
    // Xử lý trạng thái
    const trangThaiClass = item.trangThai ? 'green-text' : 'red-text';
    const trangThaiText = item.trangThai ? 'Duyệt' : 'Chưa duyệt';
    
    // Xử lý chức năng
    let actionsHtml = '';
    if (permitedEdit) {
        actionsHtml += `<a href="${baseUrl}/AdminTool/SuKienVanHoa/Edit?id=${item.suKienID}" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa" style="color: #FFB900 !important;">
            <i class="hgi-icon hgi-edit"></i> Sửa
        </a>`;
    }
    if (permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-list-btn" data-id="${item.suKienID}" data-name="${item.tenSuKien}" title="Xóa">
                <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }
    
    return `
        <div class="list-item" data-id="${item.suKienID}">
            <div class="list-item-image">
                <img src="${item.anhDaiDien || '/assets/images/vector/no-image.png'}" 
                     alt="${item.tenSuKien || '-'}" 
                     onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
            </div>
            <div class="list-item-content">
                <div class="list-item-header">
                    <h5 class="list-item-title">
                        <a href="${baseUrl}/AdminTool/SuKienVanHoa/Details?id=${item.suKienID}" class="text-decoration-none">
                            ${item.tenSuKien || '-'}
                        </a>
                    </h5>
                    <span class="TrangThai ${trangThaiClass}">${trangThaiText}</span>
                </div>
                <div class="list-item-body">
                    <div class="list-info-grid">
                        <div class="list-info-item">
                            <span class="list-info-label">Mã định danh:</span>
                            <span class="list-info-value">${item.maDinhDanh || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Thời gian:</span>
                            <span class="list-info-value">${thoiGianText}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Cấp độ:</span>
                            <span class="list-info-value">${item.tenCapDo || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Trạng thái sự kiện:</span>
                            <span class="list-info-value">${item.tenTrangThai || '-'}</span>
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
        const suKienID = $(this).data('id');
        const tenSuKien = $(this).data('name');
        
        $('#idDelete').val(suKienID);
        $('#nameDelete').text(tenSuKien);
        $('#modalDelete').modal('show');
    });
}
//#endregion