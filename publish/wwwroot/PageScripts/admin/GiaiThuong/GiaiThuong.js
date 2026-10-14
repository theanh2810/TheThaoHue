const baseUrl = getRootLink();

$(document).ready(function () {
    initDatePicker()
    initNgonNgu("#ngon-ngu-search")
    initTable()
    initDanhMucChung_NoAll(64, "#loai-giai-thuong-search", "Loại giải thưởng") 
    initDanhMucChung_NoAll(65, "#cap-giai-thuong-search", "Cấp giải thưởng")
    initDanhMucChung_NoAll(66, "#hang-giai-thuong-search", "Hạng giải thưởng")
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
    let linkAPI = '';
    // Lấy đường dẫn hiện tại, ví dụ: /AdminTool/HoatDongTheThao/ViPham
    let path = window.location.pathname;
    // Tách phần giữa, ví dụ: "HoatDongTheThao"
    let section = path.split("/")[2];
    console.log(section)
    switch (section) {
        case "HoatDongTheThao":
            linkAPI = '/api/DM_ThanhTichApi/Filter?MaNgonNgu=vi&LinhVucID=3';
            break;

        case "HoatDongDuLich":
            linkAPI = '/api/DM_ThanhTichApi/Filter?MaNgonNgu=vi&LinhVucID=4';
            break;

        case "HoatDongVanHoa":
            linkAPI = '/api/DM_ThanhTichApi/Filter?MaNgonNgu=vi&LinhVucID=2';
            break;

        case "BaoChi":
            linkAPI = '/api/DM_ThanhTichApi/Filter?MaNgonNgu=vi&LinhVucID=5';
            break;

        default:
            linkAPI = '/api/DM_ThanhTichApi/Filter?MaNgonNgu=vi';
            break;
    }
    const tableApi = {
        url: `${baseUrl}${linkAPI}`,
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
                return `<div class="group-info" id=n-"${meta.row}">
                            <div class="group-info">
                                <div class="info-main">
                                    <a href="${baseUrl}/AdminTool/${section}/Details_GiaiThuong?id=${row.thanhTichID}" class="text-primary text-decoration-none">
                                        ${row.tenThanhTich || ''}
                                    </a>
                                </div>
                                <div class="info-sub">${row.tenToChuc || ''}</div>
                            </div>
                        </div>`;
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
                    html += `<a href="${baseUrl}/AdminTool/${section}/Edit_GiaiThuong?id=${row.thanhTichID}" data-toggle="tooltip" title="Chỉnh sửa" class="text-yellow me-2">
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
        { "data": "stt", "width": "40px", "class": "center-align" },
        { "data": "", "class": "left-align name-text" },
        { "data": "tenLoai", "width": "10%", "class": "left-align" },
        { "data": "tenCap", "width": "10%", "class": "left-align" },
        { "data": "tenHang", "width": "10%", "class": "left-align" },
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

        $('#idDelete').val(data.thanhTichID);
        $('#nameDelete').text(`${data.tenThanhTich}`);

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
        url: `${baseUrl}/api/DM_ThanhTichApi/Delete?ThanhTichID=${id}`,
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
    let LinhVucID = '';
    // Lấy đường dẫn hiện tại, ví dụ: /AdminTool/HoatDongTheThao/ViPham
    let path = window.location.pathname;
    // Tách phần giữa, ví dụ: "HoatDongTheThao"
    let section = path.split("/")[2];
    switch (section) {
        case "HoatDongTheThao":
            LinhVucID = 3;
            break;

        case "HoatDongDuLich":
            LinhVucID = 4;
            break;

        case "HoatDongVanHoa":
            LinhVucID = 2;
            break;

        case "BaoChi":
            LinhVucID = 5;
            break;

        default:
            break;
    }
    // Khởi tạo filter chung với config
    initCommonFilter({
        // HTML cho các option sắp xếp
        htmlFilterSort: `
            <li class="active" data-value="Ten"><a class="option_filter">Tên địa điểm</a></li>
            <li class="" data-value="Loai"><a class="option_filter">Loại giải thưởng</a></li>
            <li class="" data-value="Cap"><a class="option_filter">Cấp giải thưởng</a></li>
            <li class="" data-value="Hang"><a class="option_filter">Hạng giải thưởng</a></li>
        `,
        
        // Các filter inputs (select) - không bao gồm search box và date inputs
        filterInputs: [
            '#loai-giai-thuong-search',
            '#cap-giai-thuong-search',
            '#hang-giai-thuong-search',
            '#trang-thai-search',
            '#ngon-ngu-search'
        ],

        // Ô search từ khóa
        searchInput: '#tu-khoa-search',
        
        // Thời gian debounce (ms)
        debounceTime: 1000,
        
        // URL API Filter
        apiUrl: `${baseUrl}/api/DM_ThanhTichApi/Filter`,
        
        // Function build parameters cho API
        buildFilterParams: function() {
            let params = {
                MaNgonNgu: $('#ngon-ngu-search').val() || 'vi',
                LinhVucID: LinhVucID
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

            // Loại giải thưởng
            let LoaiID = $('#loai-giai-thuong-search').val();
            if (LoaiID && LoaiID !== '-1' && LoaiID !== '') {
                params.LoaiID = LoaiID;
            }

            // Cấp giải thưởng
            let CapID = $('#cap-giai-thuong-search').val();   
            if (CapID && CapID !== '-1' && CapID !== '') {
                params.CapID = CapID;
            }

            // Hạng giải thưởng
            let HangID = $('#hang-giai-thuong-search').val();
            if (HangID && HangID !== '-1' && HangID !== '') {
                params.HangID = HangID;
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
/**
 * Render HTML cho 1 card item
 */
function renderCardItemHtml(item, index) {
    // Xử lý trạng thái
    const trangThaiClass = item.trangThai ? 'green-text' : 'red-text';
    const trangThaiText = item.trangThai ? 'Duyệt' : 'Chưa duyệt';
    
    // Lấy section từ URL
    let section = window.location.pathname.split("/")[2];
    
    // Xử lý chức năng
    let actionsHtml = '';
    if (permitedEdit) {
        actionsHtml += `<a href="${baseUrl}/AdminTool/${section}/Edit_GiaiThuong?id=${item.thanhTichID}" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa" style="color: #FFB900 !important;">
            <i class="hgi-icon hgi-edit"></i> Sửa 
        </a>`;
    }
    if (permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-card-btn" data-id="${item.thanhTichID}" data-name="${item.tenThanhTich}" title="Xóa">
            <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }
    
    return `
        <div class="card-item" data-id="${item.thanhTichID}">
            <div class="card-body">
                <h5 class="card-title">
                    <a href="${baseUrl}/AdminTool/${section}/Details_GiaiThuong?id=${item.thanhTichID}" class="text-decoration-none">
                        ${item.tenThanhTich || '-'}
                    </a>
                </h5>
                <div class="card-info">
                    <div class="info-row">
                        <span class="info-label">Đơn vị tổ chức:</span>
                        <span class="info-value">${item.tenToChuc || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Loại giải thưởng:</span>
                        <span class="info-value">${item.tenLoai || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Cấp giải thưởng:</span>
                        <span class="info-value">${item.tenCap || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Hạng giải thưởng:</span>
                        <span class="info-value">${item.tenHang || '-'}</span>
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
/**
 * Render HTML cho 1 list item
 */
function renderListItemHtml(item, index) {
    // Xử lý trạng thái
    const trangThaiClass = item.trangThai ? 'green-text' : 'red-text';
    const trangThaiText = item.trangThai ? 'Duyệt' : 'Chưa duyệt';
    
    // Lấy section từ URL
    let section = window.location.pathname.split("/")[2];
    
    // Xử lý chức năng
    let actionsHtml = '';
    if (permitedEdit) {
        actionsHtml += `<a href="${baseUrl}/AdminTool/${section}/Edit_GiaiThuong?id=${item.thanhTichID}" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa" style="color: #FFB900 !important;">
            <i class="hgi-icon hgi-edit"></i> Sửa
        </a>`;
    }
    if (permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-list-btn" data-id="${item.thanhTichID}" data-name="${item.tenThanhTich}" title="Xóa">
            <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }
    
    return `
        <div class="list-item" data-id="${item.thanhTichID}">
            <div class="list-item-content">
                <div class="list-item-header">
                    <h5 class="list-item-title">
                        <a href="${baseUrl}/AdminTool/${section}/Details_GiaiThuong?id=${item.thanhTichID}" class="text-decoration-none">
                            ${item.tenThanhTich || '-'}
                        </a>
                    </h5>
                    <span class="TrangThai ${trangThaiClass}">${trangThaiText}</span>
                </div>
                <div class="list-item-body">
                    <div class="list-info-grid">
                        <div class="list-info-item">
                            <span class="list-info-label">Đơn vị tổ chức:</span>
                            <span class="list-info-value">${item.tenToChuc || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Loại giải thưởng:</span>
                            <span class="list-info-value">${item.tenLoai || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Cấp giải thưởng:</span>
                            <span class="list-info-value">${item.tenCap || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Hạng giải thưởng:</span>
                            <span class="list-info-value">${item.tenHang || '-'}</span>
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
        const id = $(this).data('id');
        const name = $(this).data('name');
        
        $('#idDelete').val(id);
        $('#nameDelete').text(name);
        $('#modalDelete').modal('show');
    });
}
//#endregion

// Wrapper functions for backward compatibility
function initCardView() {
    loadViewData('the');
}

function initListView() {
    loadViewData('danhSach');
}