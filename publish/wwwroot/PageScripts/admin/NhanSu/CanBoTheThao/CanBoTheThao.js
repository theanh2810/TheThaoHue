
const baseUrl = getRootLink();

$(document).ready(function () {
    initDatePicker()
    initToChuc_NoAll(96, "#don-vi-cong-tac-search", "Đơn vị công tác", "")
    initDanhMucChung_NoAll(5, "#gioi-tinh-search", "Giới tính")
    initNgonNgu("#ngon-ngu-search")
    initPhuongXa("#phuong-xa-search", "Phường xã")
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
        url: `${baseUrl}/api/DM_CaNhan_CanBoTheThaoApi/Filter?MaNgonNgu=vi`,
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
            targets: 1, // Cột tên cơ quan báo chí
            render: function (data, type, row, meta) {
                return `<a href="${baseUrl}/AdminTool/NhanSu/CanBoTheThao/Details?id=${row.caNhanID}" class="text-primary text-decoration-none"><div class="group-info have-image round-image">
                        <div class="have-image">
                            <img src="${row.anhChanDung || '/assets/images/vector/no-image.png'}" alt="${row.tenDaPhuongTien || ''}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                        </div>
                        <div class="group-info">
                        <div class="info-main"><div>${row.hoTen || ''}</div></div>
                        <div class="info-sub">${row.maDinhDanh || ''}</div></div>
                </div></a>`;
            }
        },
        {
            targets: 2,
            render: function (data, type, row, meta) {
                return formatDateWithoutTime(row.ngaySinh);
            }
        },
        {
            targets: 7, // Trạng thái
            render: function (data, type, row, meta) {
                if (row.trangThai) {
                    return `<span class="TrangThai green-text">Duyệt</span>`;
                } else {
                    return `<span class="TrangThai red-text">Chưa duyệt</span>`;
                }
            }
        },
        {
            targets: 8, // Chức năng
            render: function (data, type, row, meta) {
                let html = "";
                if (permitedEdit) {
                    html += `<a href="${baseUrl}/AdminTool/NhanSu/CanBoTheThao/Edit?id=${row.caNhanID}" data-toggle="tooltip" title="Chỉnh sửa" class="text-yellow me-2">
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
        { "data": "", "width": "20%", "class": "left-align name-text" },
        { "data": "", "width": "100px", "class": "left-align" },
        { "data": "gioiTinh", "width": "160px", "class": "left-align" },
        { "data": "diaChi", "width": "250px", "class": "left-align" },
        { "data": "dienThoai", "width": "150px", "class": "center-align" },
        { "data": "listTenToChuc", "width": "20%", "class": "left-align" },
        { "data": "", "width": "160px", "class": "left-align" },
        { "data": "", "width": "160px", "class": "center-align group-icon-action" }
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

        $('#idDelete').val(data.caNhanID);
        $('#nameDelete').text(`${data.hoTen}`);
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
        url: `${baseUrl}/api/DM_CaNhan_CanBoTheThaoApi/Delete?caNhanID=${id}`,
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
            <li class="active" data-value="HoTen"><a class="option_filter">Tên nhân sự</a></li>
            <li class="" data-value="ToChuc"><a class="option_filter">Tên tổ chức</a></li>
            <li class="" data-value="GioiTinh"><a class="option_filter">Giới tính</a></li>
        `,
        
        // Các filter inputs (select, input) - không bao gồm search box
        filterInputs: [
            '#don-vi-cong-tac-search',
            '#gioi-tinh-search',
            '#trang-thai-search',
            '#phuong-xa-search',
        ],
        
        // Ô search từ khóa
        searchInput: '#tu-khoa-search',
        
        // Thời gian debounce (ms)
        debounceTime: 1000,
        
        // URL API Filter
        apiUrl: `${baseUrl}/api/DM_CaNhan_CanBoTheThaoApi/Filter`,
        
        // Function build parameters cho API
        buildFilterParams: function() {
            let params = {
                MaNgonNgu: $('#ngon-ngu-search').val() || 'vi'
            };
            
            // Từ khóa
            let tuKhoa = $('#tu-khoa-search').val();
            if (tuKhoa && tuKhoa.trim() !== '') {
                params.TuKhoa = tuKhoa;
            }
            
            // Loại cơ sở
            let ToChucID = $('#don-vi-cong-tac-search').val();
            if (ToChucID && ToChucID !== '-1' && ToChucID !== '') {
                params.ToChucID = ToChucID;
            }

            // Loại cơ sở
            let GioiTinhID = $('#gioi-tinh-search').val();
            if (GioiTinhID && GioiTinhID !== '-1' && GioiTinhID !== '') {
                params.GioiTinhID = GioiTinhID;
            }

            // Loại cơ sở
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

            //phường xã
            let phuongXa = $('#phuong-xa-search').val();
            if (phuongXa && phuongXa !== '-1' && phuongXa !== '') {
                params.PhuongXaID = phuongXa;
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
function initCardView() {
    loadViewData('the');
}

function renderCardItemHtml(item, index) {
    const trangThaiClass = item.trangThai ? 'green-text' : 'red-text';
    const trangThaiText = item.trangThai ? 'Duyệt' : 'Chưa duyệt';
    
    let actionsHtml = '';
    if (typeof permitedEdit !== 'undefined' && permitedEdit) {
        actionsHtml += `<a href="${baseUrl}/AdminTool/NhanSu/CanBoTheThao/Edit?id=${item.caNhanID}" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa" style="color: #FFB900 !important;">
            <i class="hgi-icon hgi-edit"></i> Sửa 
        </a>`;
    }
    if (typeof permitedDelete !== 'undefined' && permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-card-btn" data-id="${item.caNhanID}" data-name="${item.hoTen}" title="Xóa">
            <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }
    
    return `
        <div class="card-item" data-id="${item.caNhanID}">
            <div class="card-image">
                <img src="${item.anhChanDung || '/assets/images/vector/no-image.png'}" 
                    alt="${item.hoTen || ''}" 
                    onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                <div class="card-badge">
                    <span class="TrangThai ${trangThaiClass}">${trangThaiText}</span>
                </div>
            </div>
            <div class="card-body">
                <h5 class="card-title">
                    <a href="${baseUrl}/AdminTool/NhanSu/CanBoTheThao/Details?id=${item.caNhanID}" class="text-decoration-none">
                        ${item.hoTen || '-'}
                    </a>
                </h5>
                <div class="card-info">
                    <div class="info-row">
                        <span class="info-label">Mã:</span>
                        <span class="info-value">${item.maDinhDanh || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Sinh:</span>
                        <span class="info-value">${item.ngaySinh ? formatDateWithoutTime(item.ngaySinh) : '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Giới tính:</span>
                        <span class="info-value">${item.gioiTinh || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Môn:</span>
                        <span class="info-value">${item.soLuongMon || '0'} môn</span>
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
}
//#endregion

//#region LIST VIEW - HELPER FUNCTIONS
function initListView() {
    loadViewData('danhSach');
}

function renderListItemHtml(item, index) {
    const trangThaiClass = item.trangThai ? 'green-text' : 'red-text';
    const trangThaiText = item.trangThai ? 'Duyệt' : 'Chưa duyệt';
    
    let actionsHtml = '';
    if (typeof permitedEdit !== 'undefined' && permitedEdit) {
        actionsHtml += `<a href="${baseUrl}/AdminTool/NhanSu/CanBoTheThao/Edit?id=${item.caNhanID}" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa" style="color: #FFB900 !important;">
            <i class="hgi-icon hgi-edit"></i> Sửa
        </a>`;
    }
    if (typeof permitedDelete !== 'undefined' && permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-list-btn" data-id="${item.caNhanID}" data-name="${item.hoTen}" title="Xóa">
            <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }
    
    return `
        <div class="list-item" data-id="${item.caNhanID}">
            <div class="list-item-image">
                <img src="${item.anhChanDung || '/assets/images/vector/no-image.png'}" 
                    alt="${item.hoTen || ''}" 
                    onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
            </div>
            <div class="list-item-content">
                <div class="list-item-header">
                    <h5 class="list-item-title">
                        <a href="${baseUrl}/AdminTool/NhanSu/CanBoTheThao/Details?id=${item.caNhanID}" class="text-decoration-none">
                            ${item.hoTen || '-'}
                        </a>
                    </h5>
                    <span class="TrangThai ${trangThaiClass}">${trangThaiText}</span>
                </div>
                <div class="list-item-body">
                    <div class="list-info-grid">
                        <div class="list-info-item">
                            <span class="list-info-label">Mã:</span>
                            <span class="list-info-value">${item.maDinhDanh || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Sinh:</span>
                            <span class="list-info-value">${item.ngaySinh ? formatDateWithoutTime(item.ngaySinh) : '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Giới tính:</span>
                            <span class="list-info-value">${item.gioiTinh || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Môn:</span>
                            <span class="list-info-value">${item.soLuongMon || '0'} môn</span>
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
}
//#endregion