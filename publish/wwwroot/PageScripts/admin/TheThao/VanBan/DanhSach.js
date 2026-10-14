const baseUrl = getRootLink();
const ApiUrl = baseUrl + '/api/VanBanTheThaoApi';

let dataTable;

$(document).ready(function () {
    (async function () {
        await initFilterDropdowns();
        initDataTable();
        initFilter_Option();
        bindEvents();
        initDatePicker();
        initSelect2();
    })();

    // Lắng nghe event switch sang card view
    $(document).on('viewChanged:card', function() {
        loadViewData('the');
    });
    
    // Lắng nghe event switch sang list view
    $(document).on('viewChanged:list', function() {
        loadViewData('danhSach');
    });

    $("#formDelete").on("submit", function (e) {
        e.preventDefault();
        dataDelete();
    });
});

async function initFilterDropdowns() {
    try {
        const res1 = await fetch(baseUrl + '/api/DanhMucChungApi/GetByLoaiDanhMuc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ maSo: 'LOAI_VB_THETHAO' })
        });
        const result1 = await res1.json();
        if (result1.isSuccess && result1.value && result1.value.length > 0) {
            result1.value.forEach(item => {
                $('#theLoaiID').append(`<option value="${item.danhMucID}">${item.tenDanhMuc || item.ten}</option>`);
            });
        }

        const res2 = await fetch(baseUrl + '/api/DanhMucChungApi/GetByLoaiDanhMuc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ maSo: 'CAP_BANHANH_THETHAO' })
        });
        const result2 = await res2.json();
        if (result2.isSuccess && result2.value && result2.value.length > 0) {
            result2.value.forEach(item => {
                $('#capBanHanhID').append(`<option value="${item.danhMucID}">${item.tenDanhMuc || item.ten}</option>`);
            });
        }
    } catch (error) {
        console.error('Lỗi load filter dropdowns:', error);
    }
}

function initDataTable() {
    const tableApi = {
        url: ApiUrl + '/DanhSach',
        type: 'POST',
        data: function (d) {
            return JSON.stringify({
                TuKhoa: $('#tu-khoa-search').val() || null,
                TheLoaiID: $('#theLoaiID').val() ? parseInt($('#theLoaiID').val()) : null,
                CapBanHanhID: $('#capBanHanhID').val() ? parseInt($('#capBanHanhID').val()) : null,
                TuNgay: $('#tuNgay').val() ? new Date($('#tuNgay').val()).toISOString() : null,
                DenNgay: $('#denNgay').val() ? new Date($('#denNgay').val()).toISOString() : null,
                PageNumber: 1,
                PageSize: 10
            });
        },
        contentType: 'application/json',
        dataSrc: function (res) {
            if (res && res.isSuccess && res.value) {
                return res.value.map((item, i) => ({ ...item, stt: i + 1 }));
            }
            return [];
        }
    };

    const tableDefs = [
        { targets: 0, data: 'stt', width: '50px' },
        {
            targets: 1,
            render: function (data, type, row) {
                return `<a href="${baseUrl}/AdminTool/TheThao/VanBanChiTiet?id=${row.vanBanID}" class="text-primary">${data || ''}</a>`;
            }
        },
        {
            targets: 5,
            render: function (data) {
                return data ? new Date(data).toLocaleDateString('vi-VN') : '';
            }
        },
    ];

    if (permitedEdit > 0 || permitedDelete > 0) {
        tableDefs.push({
            targets: 7,
            render: function (data, type, row, meta) {
                let html = '';
                if (permitedEdit > 0) {
                    html += `<a data-toggle="tooltip" title="Chỉnh sửa" class="text-yellow edit-form" id="n-${meta.row}">
                                <i class="hgi-icon hgi-edit"></i>
                            </a>`;
                }
                if (permitedDelete > 0) {
                    html += `<a data-toggle="tooltip" title="Xóa" class="delete-command-btn text-red cursor-pointer" id="delete-${meta.row}">
                                <i class="hgi-icon hgi-delete"></i>
                            </a>`;
                }
                return html;
            }
        });
    }

    const tableCols = [
        { "data": "stt",          "width": "40px",  "class": "center-align" },
        { "data": "soKyHieu",     "width": "120px", "class": "left-align" },
        { "data": "trichYeu",     "width": "30%",   "class": "left-align" },
        { "data": "tenTheLoai",   "width": "120px", "class": "left-align" },
        { "data": "tenCapBanHanh","width": "130px", "class": "left-align" },
        { "data": "ngayBanHanh",  "width": "120px", "class": "center-align" },
        { "data": "nguoiKy",      "width": "130px", "class": "left-align" },
        { "data": "",             "width": "100px", "class": "center-align group-icon-action" },
    ];

    if (permitedEdit <= 0 && permitedDelete <= 0) {
        tableCols.pop();
    }

    initDataTableConfigNoSearch('dataGrid', tableApi, tableDefs, tableCols);
    dataTable = $('#dataGrid').DataTable();
}

function initFilter_Option() {
    initCommonFilterPost({
        htmlFilterSort: `
            <li class="active" data-value="NgayBanHanh"><a class="option_filter">Ngày ban hành</a></li>
            <li class="" data-value="SoKyHieu"><a class="option_filter">Số ký hiệu</a></li>
            <li class="" data-value="TrichYeu"><a class="option_filter">Trích yếu</a></li>
        `,
        filterInputs: [
            '#theLoaiID',
            '#capBanHanhID'
        ],
        dateInputs: [
            '#tuNgay',
            '#denNgay'
        ],
        searchInput: '#tu-khoa-search',
        debounceTime: 1000,
        // Dùng đường dẫn TƯƠNG ĐỐI: getDataWithApi() sẽ tự prepend getRootLink().
        // Nếu dùng ApiUrl (đã có baseUrl) sẽ bị nhân đôi baseUrl -> URL sai -> filter không chạy.
        apiUrl: '/api/VanBanTheThaoApi/DanhSach',
        buildFilterRequest: function() {
            return {
                TuKhoa: $('#tu-khoa-search').val() || null,
                TheLoaiID: $('#theLoaiID').val() ? parseInt($('#theLoaiID').val()) : null,
                CapBanHanhID: $('#capBanHanhID').val() ? parseInt($('#capBanHanhID').val()) : null,
                TuNgay: $('#tuNgay').val() ? new Date($('#tuNgay').val()).toISOString() : null,
                DenNgay: $('#denNgay').val() ? new Date($('#denNgay').val()).toISOString() : null,
            };
        },
        onFilterApplied: function(data) {
            if (data && data.isSuccess && data.value) {
                data.value.forEach((item, index) => {
                    item.stt = index + 1;
                });
                $('#dataGrid').DataTable().clear().rows.add(data.value).draw();
            } else {
                $('#dataGrid').DataTable().clear().draw();
            }
        },
        renderCardItem: function(item, index) {
            return renderCardItemHtml(item, index);
        },
        renderListItem: function(item, index) {
            return renderListItemHtml(item, index);
        },
        onCardRendered: function() {
            attachCardEventHandlers();
        },
        onListRendered: function() {
            attachListEventHandlers();
        }
    });
}

function renderCardItemHtml(item, index) {
    let actionsHtml = '';
    if (permitedEdit > 0) {
        actionsHtml += `<a href="${baseUrl}/AdminTool/TheThao/VanBanAddEdit?id=${item.vanBanID}" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa" style="color: #FFB900 !important;">
            <i class="hgi-icon hgi-edit"></i> Sửa
        </a>`;
    }
    if (permitedDelete > 0) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-card-btn" data-id="${item.vanBanID}" data-so="${item.soKyHieu}" data-trich="${item.trichYeu}" title="Xóa">
            <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }

    const ngayBanHanhStr = item.ngayBanHanh ? new Date(item.ngayBanHanh).toLocaleDateString('vi-VN') : '-';

    return `
        <div class="card-item" data-id="${item.vanBanID}">
            <div class="card-body">
                <h5 class="card-title">
                    <a href="${baseUrl}/AdminTool/TheThao/VanBanChiTiet?id=${item.vanBanID}" class="text-decoration-none">
                        ${item.soKyHieu || '-'}
                    </a>
                </h5>
                <p class="card-text text-truncate-3" title="${item.trichYeu || ''}" style="height: 60px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">
                    <strong>Trích yếu:</strong> ${item.trichYeu || '-'}
                </p>
                <div class="card-info mt-2">
                    <div class="info-row d-flex justify-content-between mb-1">
                        <span class="info-label text-muted">Loại VB:</span>
                        <span class="info-value font-weight-bold">${item.tenTheLoai || '-'}</span>
                    </div>
                    <div class="info-row d-flex justify-content-between mb-1">
                        <span class="info-label text-muted">Cấp ban hành:</span>
                        <span class="info-value font-weight-bold">${item.tenCapBanHanh || '-'}</span>
                    </div>
                    <div class="info-row d-flex justify-content-between mb-1">
                        <span class="info-label text-muted">Ngày ban hành:</span>
                        <span class="info-value font-weight-bold">${ngayBanHanhStr}</span>
                    </div>
                    <div class="info-row d-flex justify-content-between mb-1">
                        <span class="info-label text-muted">Người ký:</span>
                        <span class="info-value font-weight-bold">${item.nguoiKy || '-'}</span>
                    </div>
                </div>
            </div>
            <div class="card-footer d-flex justify-content-end" style="gap: 8px;">
                ${actionsHtml}
            </div>
        </div>
    `;
}

function renderListItemHtml(item, index) {
    let actionsHtml = '';
    if (permitedEdit > 0) {
        actionsHtml += `<a href="${baseUrl}/AdminTool/TheThao/VanBanAddEdit?id=${item.vanBanID}" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa" style="color: #FFB900 !important;">
            <i class="hgi-icon hgi-edit"></i> Sửa
        </a>`;
    }
    if (permitedDelete > 0) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-list-btn" data-id="${item.vanBanID}" data-so="${item.soKyHieu}" data-trich="${item.trichYeu}" title="Xóa">
            <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }

    const ngayBanHanhStr = item.ngayBanHanh ? new Date(item.ngayBanHanh).toLocaleDateString('vi-VN') : '-';

    return `
        <div class="list-item d-flex justify-content-between align-items-center p-3 mb-2 border rounded bg-white" data-id="${item.vanBanID}">
            <div class="list-item-content w-75">
                <div class="list-item-header">
                    <h5 class="list-item-title mb-1">
                        <a href="${baseUrl}/AdminTool/TheThao/VanBanAddEdit?id=${item.vanBanID}" class="text-decoration-none">
                            ${item.soKyHieu || '-'}
                        </a>
                    </h5>
                </div>
                <div class="list-item-body">
                    <p class="mb-2 text-muted"><strong>Trích yếu:</strong> ${item.trichYeu || '-'}</p>
                    <div class="list-info-grid d-flex flex-wrap" style="gap: 16px;">
                        <div class="list-info-item">
                            <span class="list-info-label text-muted">Loại VB:</span>
                            <span class="list-info-value font-weight-bold">${item.tenTheLoai || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label text-muted">Cấp ban hành:</span>
                            <span class="list-info-value font-weight-bold">${item.tenCapBanHanh || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label text-muted">Ngày ban hành:</span>
                            <span class="list-info-value font-weight-bold">${ngayBanHanhStr}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label text-muted">Người ký:</span>
                            <span class="list-info-value font-weight-bold">${item.nguoiKy || '-'}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="list-item-actions d-flex flex-row" style="gap: 8px;">
                ${actionsHtml}
            </div>
        </div>
    `;
}

function attachCardEventHandlers() {
    $('.delete-card-btn').off('click').on('click', function() {
        const id = $(this).data('id');
        const so = $(this).data('so');
        const trich = $(this).data('trich');
        
        $('#idDelete').val(id);
        $('#tenDelete').text(so + ' - ' + trich);
        $('#modalDelete').modal('show');
    });
}

function attachListEventHandlers() {
    $('.delete-list-btn').off('click').on('click', function() {
        const id = $(this).data('id');
        const so = $(this).data('so');
        const trich = $(this).data('trich');
        
        $('#idDelete').val(id);
        $('#tenDelete').text(so + ' - ' + trich);
        $('#modalDelete').modal('show');
    });
}

function bindEvents() {
    $(document).on('click', '.edit-form', function () {
        var id = $(this).attr('id').match(/\d+/)[0];
        var data = $('#dataGrid').DataTable().row(id).data();
        window.location = `${baseUrl}/AdminTool/TheThao/VanBanAddEdit?id=${data.vanBanID}`;
    });

    $(document).on('click', '.delete-command-btn', function () {
        var id = $(this).attr('id').match(/\d+/)[0];
        var data = $('#dataGrid').DataTable().row(id).data();
        $('#idDelete').val(data.vanBanID);
        $('#tenDelete').text(data.soKyHieu + ' - ' + data.trichYeu);
        $('#modalDelete').modal('show');
    });
}

function reloadTable() {
    if (dataTable) {
        dataTable.ajax.reload();
    }
}

async function dataDelete() {
    const id = $('#idDelete').val();
    try {
        const res = await fetch(`${ApiUrl}/Xoa/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data && data.isSuccess) {
            showNotification(1, 'Xóa văn bản thành công');
            $('#modalDelete').modal('hide');

            // Kiểm tra view hiện tại và reload tương ứng
            const currentView = getCurrentViewType();
            if (currentView === 'the' || currentView === 'danhSach') {
                loadViewData(currentView);
            } else {
                reloadTable();
            }
        } else {
            showNotification(0, data.error || 'Xóa thất bại');
        }
    } catch (err) {
        showNotification(0, err.message);
    }
}

function loadViewData(viewType) {
    // Hàm này được gọi tự động từ FilterAction_Post.js để render card/list
}
