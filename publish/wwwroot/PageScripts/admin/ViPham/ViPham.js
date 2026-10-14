const baseUrl = getRootLink();
let currentFilterUrl = null;

$(document).ready(function () {
    initDatePicker()
    initNgonNgu("#ngon-ngu-search")
    initTable()
    initDanhMucChung_NoAll(67, "#hinh-thuc-search", "Loại xử phạt") 
    initDanhMucChung_NoAll(68, "#tinh-trang-search", "Tình trạng") 
    CheckDateMinMax("#ngay-phat-hien-search", "#ngay-xu-phat-search")
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
})

function initTable() {
    let linkAPI = '';
    // Lấy đường dẫn hiện tại, ví dụ: /AdminTool/HoatDongTheThao/ViPham
    let path = window.location.pathname;
    // Tách phần giữa, ví dụ: "HoatDongTheThao"
    let section = path.split("/")[2];
    switch (section) {
        case "HoatDongTheThao":
            linkAPI = '/api/DM_XuPhatViPhamApi/Filter?MaNgonNgu=vi&LinhVucID=3';
            break;

        case "HoatDongDuLich":
            linkAPI = '/api/DM_XuPhatViPhamApi/Filter?MaNgonNgu=vi&LinhVucID=4';
            break;

        case "HoatDongVanHoa":
            linkAPI = '/api/DM_XuPhatViPhamApi/Filter?MaNgonNgu=vi&LinhVucID=2';
            break;

        case "BaoChi":
            linkAPI = '/api/DM_XuPhatViPhamApi/Filter?MaNgonNgu=vi&LinhVucID=5';
            break;

        default:
            linkAPI = '/api/DM_XuPhatViPhamApi/Gets?MaNgonNgu=vi';
            break;
    }

    console.log(linkAPI)
    const tableApi = {
        url: `${baseUrl}${linkAPI}`,
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
                return `<div class="group-info" id=n-"${meta.row}">
                            <div class="group-info">
                                <div class="info-main">
                                    <a href="${baseUrl}/AdminTool/${section}/Details_ViPham?id=${row.viPhamID}" class="text-primary text-decoration-none">
                                        ${row.doiTuong || ''}
                                    </a>
                                </div>
                                <div class="info-sub">${row.maDinhDanh || ''}</div>
                            </div>
                        </div>`;
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
                    html += `<a href="${baseUrl}/AdminTool/${section}/Edit_ViPham?id=${row.viPhamID}" data-toggle="tooltip" title="Chỉnh sửa" class="text-yellow me-2">
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
        { "data": "stt", "width": "40px", "class": "center-align" },
        { "data": "", "class": "left-align name-text" },
        { "data": "countToChuc", "width": "10%", "class": "center-align" },
        { "data": "countCaNhan", "width": "10%", "class": "center-align" },
        { "data": "tenHinhThucXuPhat", "width": "15%", "class": "left-align" },
        { "data": "", "width": "10%", "class": "left-align name-text" },
        { "data": "", "width": "8%", "class": "center-align group-icon-action" }
    ];

    if (!permitedEdit && !permitedDelete) {
        tableCols.pop();
        tableDefs.pop();
    }

    initDataTableConfigNoSearch('dataGridViPham', tableApi, tableDefs, tableCols);

    // Event handler cho nút xóa
    $('#dataGridViPham tbody').on('click', '.delete-command-btn', function () {
        var id = $(this).attr("ID").match(/\d+/)[0];
        var data = $('#dataGridViPham').DataTable().row(id).data();

        $('#idDelete').val(data.viPhamID);
        $('#nameDelete').text(`${data.doiTuong}`);
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
        url: `${baseUrl}/api/DM_XuPhatViPhamApi/Delete?ViPhamID=${id}`,
        type: 'DELETE',
        contentType: 'application/json',
        success: function (data) {
            if (data && data.isSuccess) {
                showNotification(1, 'Xoá thành công')
                $('#modalDelete').modal('hide');
                $('#dataGridViPham').DataTable().ajax.reload();
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
            <li class="active" data-value="Ten"><a class="option_filter">Đối tượng vi phạm</a></li>
            <li class="" data-value="HinhThuc"><a class="option_filter">Hình thức xử phạt</a></li>
            <li class="" data-value="TinhTrang"><a class="option_filter">Tình trạng</a></li>
            <li class="" data-value="NgayPhatHien"><a class="option_filter">Ngày phát hiện</a></li>
            <li class="" data-value="NgayXuPhat"><a class="option_filter">Ngày xử phạt</a></li>
        `,
        
        // Các filter inputs (select) - không bao gồm search box và date inputs
        filterInputs: [
            '#hinh-thuc-search',
            '#tinh-trang-search',
            '#trang-thai-search',
            '#ngon-ngu-search'
        ],

        // Các date inputs - sẽ tự động format bằng formatDateToSaveAsString
        dateInputs: [
            '#ngay-phat-hien-search',
            '#ngay-xu-phat-search'
        ],

        // Ô search từ khóa
        searchInput: '#tu-khoa-search',
        
        // Thời gian debounce (ms)
        debounceTime: 1000,
        
        // URL API Filter
        apiUrl: `${baseUrl}/api/DM_XuPhatViPhamApi/Filter`,
        
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

            // Hình thức xử phạt
            let HinhThucXuPhatID = $('#hinh-thuc-search').val();
            if (HinhThucXuPhatID && HinhThucXuPhatID !== '-1' && HinhThucXuPhatID !== '') {
                params.HinhThucXuPhatID = HinhThucXuPhatID;
            }

            // Tình trạng
            let TinhTrangID = $('#tinh-trang-search').val();
            if (TinhTrangID && TinhTrangID !== '-1' && TinhTrangID !== '') {
                params.TinhTrangID = TinhTrangID;
            }

            /* // Ngày phát hiện
            let NgayPhatHien = $('#ngay-phat-hien-search').val();
            if (NgayPhatHien && NgayPhatHien.trim() !== '') {
                params.NgayPhatHien = formatDateToSaveAsString(NgayPhatHien);
            }

            // Ngày xử phạt
            let NgayXuPhat = $('#ngay-xu-phat-search').val();   
            if (NgayXuPhat && NgayXuPhat.trim() !== '') {
                params.NgayXuPhat = formatDateToSaveAsString(NgayXuPhat);
            } */

            return params;
        },
        
        // Callback sau khi apply filter
        onFilterApplied: function(urlFilter) {
            // Lưu URL filter vào biến global
            currentFilterUrl = urlFilter;
            // Reload DataTable nếu nó đã được khởi tạo
            if ($.fn.DataTable.isDataTable('#dataGridViPham')) {
                const table = $('#dataGridViPham').DataTable();
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
/**
 * Render HTML cho 1 card item
 */
function renderCardItemHtml(item, index) {
    // Xử lý trạng thái
    const trangThaiClass = item.trangThai ? 'green-text' : 'red-text';
    const trangThaiText = item.trangThai ? 'Hoạt động' : 'Không hoạt động';
    
    // Lấy section từ URL
    let section = window.location.pathname.split("/")[2];
    
    // Xử lý chức năng
    let actionsHtml = '';
    if (permitedEdit) {
        actionsHtml += `<a href="${baseUrl}/AdminTool/${section}/Edit_ViPham?id=${item.viPhamID}" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa" style="color: #FFB900 !important;">
            <i class="hgi-icon hgi-edit"></i> Sửa 
        </a>`;
    }
    if (permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-card-btn" data-id="${item.viPhamID}" data-name="${item.doiTuong}" title="Xóa">
            <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }
    
    return `
        <div class="card-item" data-id="${item.viPhamID}">
            <div class="card-body">
                <h5 class="card-title">
                    <a href="${baseUrl}/AdminTool/${section}/Details_ViPham?id=${item.viPhamID}" class="text-decoration-none">
                        ${item.doiTuong || '-'}
                    </a>
                </h5>
                <div class="card-info">
                    <div class="info-row">
                        <span class="info-label">Mã định danh:</span>
                        <span class="info-value">${item.maDinhDanh || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Tổ chức vi phạm:</span>
                        <span class="info-value">${item.countToChuc || 0}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Cá nhân vi phạm:</span>
                        <span class="info-value">${item.countCaNhan || 0}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Hình thức xử phạt:</span>
                        <span class="info-value">${item.tenHinhThucXuPhat || '-'}</span>
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
    const trangThaiText = item.trangThai ? 'Hoạt động' : 'Không hoạt động';
    
    // Lấy section từ URL
    let section = window.location.pathname.split("/")[2];
    
    // Xử lý chức năng
    let actionsHtml = '';
    if (permitedEdit) {
        actionsHtml += `<a href="${baseUrl}/AdminTool/${section}/Edit_ViPham?id=${item.viPhamID}" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa" style="color: #FFB900 !important;">
            <i class="hgi-icon hgi-edit"></i> Sửa
        </a>`;
    }
    if (permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-list-btn" data-id="${item.viPhamID}" data-name="${item.doiTuong}" title="Xóa">
            <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }
    
    return `
        <div class="list-item" data-id="${item.viPhamID}">
            <div class="list-item-content">
                <div class="list-item-header">
                    <h5 class="list-item-title">
                        <a href="${baseUrl}/AdminTool/${section}/Details_ViPham?id=${item.viPhamID}" class="text-decoration-none">
                            ${item.doiTuong || '-'}
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
                            <span class="list-info-label">Tổ chức vi phạm:</span>
                            <span class="list-info-value">${item.countToChuc || 0}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Cá nhân vi phạm:</span>
                            <span class="list-info-value">${item.countCaNhan || 0}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Hình thức xử phạt:</span>
                            <span class="list-info-value">${item.tenHinhThucXuPhat || '-'}</span>
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

function initTableView() {
    if (!$.fn.DataTable.isDataTable('#dataGridViPham')) {
        initTable();
    } else {
        const table = $('#dataGridViPham').DataTable();
        if (currentFilterUrl) {
            table.ajax.url(currentFilterUrl).load();
        } else {
            table.ajax.reload();
        }
    }
}
//#endregion

// Wrapper functions for backward compatibility
function initCardView() {
    loadViewData('the');
}

function initListView() {
    loadViewData('danhSach');
}