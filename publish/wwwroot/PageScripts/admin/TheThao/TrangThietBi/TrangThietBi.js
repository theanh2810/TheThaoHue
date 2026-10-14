const baseUrl = getRootLink();

$(document).ready(function () {
    initDatePicker();

    (async function () {
        await Promise.all([
            initNgonNgu(),
            initLoaiThietBi(),
            initTinhTrangThietBi(),
            initToChuc(),
        ]);
        initTable();
        setTimeout(() => { 
            initSelect2()
        }, 500);
        initFilter_Option()
    })();

    // Lắng nghe event switch sang card view
    $(document).on('viewChanged:card', function() {
        loadViewData('the');
    });
    
    // Lắng nghe event switch sang list view
    $(document).on('viewChanged:list', function() {
        loadViewData('danhSach');
    });

    /* OLD FILTER EVENTS - Commented for reference
    $('#tim-kiem').on('click', async function () {
        initTable()
    });

    $('#tat-ca').on('click', async function () {
        $('#tu-khoa-search').val('');
        $('#loai-thiet-bi-search').val('-1').trigger('change');
        $('#tinh-trang-search').val('-1').trigger('change');
        $('#to-chuc-search').val('-1').trigger('change');
        $('#ngon-ngu-search').val('vi').trigger('change');
        $('#su-dung-search').val('-1').trigger('change');
        initTable()
    });
    */

    $("#formDelete").on("submit", function (e) {
        e.preventDefault();
        dataDelete();
    });
    async function initTable() {
        const tableApi = {
            url: `${baseUrl}/api/TrangThietBiApi/DanhSach`,
            type: "POST",
            data: function (d) {
                var suDung = $('#su-dung-search').val()
                var loaiThietBi = $('#loai-thiet-bi-search').val()
                var toChuc = $('#to-chuc-search').val()
                var tinhTrang = $('#tinh-trang-search').val()

                return JSON.stringify({
                    tuKhoa: $('#tu-khoa-search').val() || null,
                    maNgonNgu: $('#ngon-ngu-search').val() || 'vi',
                    loaiThietBiID: (loaiThietBi == "-1" || loaiThietBi == "" || !loaiThietBi) ? null : parseInt(loaiThietBi) || null,
                    toChucID: (toChuc == "-1" || toChuc == "" || !toChuc) ? null : toChuc,
                    tinhTrangID: (tinhTrang == "-1" || tinhTrang == "" || !tinhTrang) ? null : parseInt(tinhTrang) || null,
                    suDung: (suDung == "-1" || suDung == "" || !suDung) ? null : (suDung === "1" ? true : false),
                });
            },
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
                targets: 1,
                render: function (data, type, row, meta) {
                    return `<div class="group-info have-image">
                                <div class="have-image">
                                    <img src="${row.anhDaiDien || '/assets/images/vector/no-image.png'}" alt="${row.tenThietBi || ''}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                                </div>
                                <div class="group-info">
                                    <div class="info-main">
                                        <a href="${baseUrl}/AdminTool/TrangThietBi/Details?id=${row.thietBiID}" class="text-primary text-decoration-none">
                                            ${row.tenThietBi || ''}
                                        </a>
                                    </div>
                                </div>
                            </div>`;
                }
            },
            {
                targets: 5,
                render: function (data, type, row, meta) {
                    if (data) {
                        return `<i class="hgi-icon hgi-check"></i>`;
                    }
                    else {
                        return `<i class="hgi-icon hgi-cancel"></i>`;
                    }
                }
            },
            {
                targets: 6,
                render: function (data, type, row, meta) {
                    let html = ""
                    if (permitedEdit) {
                        html += `<i data-toggle="tooltip" title="Chỉnh sửa" class="edit-command-btn text-yellow" id=n-"${meta.row}">
                                    <i class="hgi-icon hgi-edit"></i>
                                </i>`;
                    }
                    if (permitedDelete) {
                        html += `<i data-toggle="tooltip" title="Xoá" class="delete-command-btn text-red" id=n-"${meta.row}">
                                    <i class="hgi-icon hgi-delete"></i>
                                </i>`
                    }
                    return html
                }
            }
        ];

        const tableCols = [
            { "data": "stt", "width": "40px", "class": "center-align" },
            { "data": "tenThietBi", "width": "", "class": "left-align" },
            { "data": "tenLoaiThietBi", "width": "250px", "class": "left-align" },
            { "data": "tenToChuc", "width": "250px", "class": "left-align" },
            { "data": "tenTinhTrang", "width": "220px", "class": "left-align" },
            { "data": "suDung", "width": "120px", "class": "center-align" },
            { "data": "", "width": "120px", "class": "center-align group-icon-action" },
        ];

        if (!permitedEdit && !permitedDelete) {
            tableCols.pop();
            tableDefs.pop();
        }

        initDataTableConfigNoSearch('dataGrid', tableApi, tableDefs, tableCols);

        $('#dataGrid tbody').on('click', '.edit-command-btn', async function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGrid').DataTable().row(id).data();

            let hef = `/Edit?id=${data.thietBiID}`;
            window.location.href += hef;
        });
        $('#dataGrid tbody').on('click', '.delete-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGrid').DataTable().row(id).data();

            $('#idDelete').val(data.thietBiID);
            $('#nameDelete').text(`${data.tenThietBi}`);

            $('#modalDelete').modal('show');
        });
    }

    async function dataDelete() {
        let id = $('#idDelete').val();

        try {
            const res = await fetch(`/api/TrangThietBiApi/Xoa/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }

            data = await res.json();

            if (data && data.isSuccess && data.value) {
                showNotification(1, 'Xoá thành công')
                $('#modalDelete').modal('hide');

                // Kiểm tra view hiện tại và reload tương ứng
                const currentView = getCurrentViewType();
                if (currentView === 'the' || currentView === 'danhSach') {
                    loadViewData(currentView);
                } else {
                    $('#dataGrid').DataTable().ajax.reload();
                }
            } else {
                console.log(data.error)
            }

        }
        catch (err) {
            showNotification(0, err.message)
        }
    }

    //#region HÀM LOAD DỮ LIỆU CHO CÁC COMBOBOX
    async function initNgonNgu() {
        try {
            const res = await fetch('/api/NgonNguApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    trangThai: null,
                    tuKhoa: null
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value) {
                data.value.forEach(lang => {
                    $("#ngon-ngu-search").append(`<option value="${lang.maNgonNgu?.toLowerCase()}">${lang.tenNgonNgu}</option>`);
                });
                $("#ngon-ngu-search").val('vi').trigger('change');
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            showNotification(0, err.message)
        }
    };

    async function initLoaiThietBi() {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: 78,
                    tuKhoa: null
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value) {

                $("#loai-thiet-bi-search").append(`<option value="">Chọn loại thiết bị</option><option value="-1">Tất cả</option>`);
                data.value.forEach(el => {
                    $("#loai-thiet-bi-search").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
                });
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };

    async function initTinhTrangThietBi() {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: 79,
                    tuKhoa: null
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value) {

                $("#tinh-trang-search").append(`<option value="">Chọn tình trạng</option><option value="-1">Tất cả</option>`);
                data.value.forEach(el => {
                    $("#tinh-trang-search").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
                });
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };

    async function initToChuc() {
        try {
            const res = await fetch('/api/ToChucApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiToChucID: 96,
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value) {

                $("#to-chuc-search").append(`<option value="">Chọn tổ chức</option><option value="-1">Tất cả</option>`);
                data.value.forEach(el => {
                    $("#to-chuc-search").append(`<option value="${el.toChucID}">${el.tenToChuc}</option>`);
                });
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };

    //#endregion HÀM LOAD DỮ LIỆU CHO CÁC COMBOBOX
})

function initFilter_Option() {
    // Khởi tạo filter chung với config
    initCommonFilterPost({
        // HTML cho các option sắp xếp
        htmlFilterSort: `
            <li class="active" data-value="Ten"><a class="option_filter">Tên thiết bị</a></li>
            <li class="" data-value="Loai"><a class="option_filter">Loại thiết bị</a></li>
            <li class="" data-value="ToChuc"><a class="option_filter">Đơn vị quản lý</a></li>
            <li class="" data-value="TinhTrang"><a class="option_filter">Tình trạng</a></li>
        `,
        
        // Các filter inputs (select) - không bao gồm search box và date inputs
        filterInputs: [
            '#loai-thiet-bi-search',
            '#tinh-trang-search',
            '#to-chuc-search',
            '#su-dung-search',
            '#ngon-ngu-search'
        ],

        // Ô search từ khóa
        searchInput: '#tu-khoa-search',
        
        // Thời gian debounce (ms)
        debounceTime: 1000,
        
        // URL API Filter
        apiUrl: `/api/TrangThietBiApi/DanhSach`,
        
        // Function build request cho API
        buildFilterRequest: function() {
            var suDung = $('#su-dung-search').val();
            var loaiThietBi = $('#loai-thiet-bi-search').val();
            var toChuc = $('#to-chuc-search').val();
            var tinhTrang = $('#tinh-trang-search').val();
            
            return {
                tuKhoa: $('#tu-khoa-search').val() || null,
                maNgonNgu: $('#ngon-ngu-search').val() || 'vi',
                loaiThietBiID: (loaiThietBi == "-1" || loaiThietBi == "" || !loaiThietBi) ? null : parseInt(loaiThietBi) || null,
                toChucID: (toChuc == "-1" || toChuc == "" || !toChuc) ? null : toChuc,
                tinhTrangID: (tinhTrang == "-1" || tinhTrang == "" || !tinhTrang) ? null : parseInt(tinhTrang) || null,
                suDung: (suDung == "-1" || suDung == "" || !suDung) ? null : (suDung === "1" ? true : false)
                // type và typeSort sẽ được thêm tự động bởi FilterAction_Post.js
            };
        },
        
        // Callback sau khi apply filter
        onFilterApplied: function(data) {
            // Xử lý response data
            data.value.forEach((item, index) => {
                item.stt = index + 1;
            });
            if (data.isSuccess && data.value) {
                $('#dataGrid').DataTable().clear().rows.add(data.value).draw();
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
    const suDungClass = item.suDung ? 'green-text' : 'red-text';
    const suDungText = item.suDung ? 'Hiển thị' : 'Không hiển thị';
    
    // Xử lý chức năng
    let actionsHtml = '';
    if (permitedEdit) {
        actionsHtml += `<a href="${baseUrl}/AdminTool/TrangThietBi/Edit?id=${item.thietBiID}" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa" style="color: #FFB900 !important;">
            <i class="hgi-icon hgi-edit"></i> Sửa
        </a>`;
    }
    if (permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-card-btn" data-id="${item.thietBiID}" data-name="${item.tenThietBi}" title="Xóa">
            <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }
    
    return `
        <div class="card-item" data-id="${item.thietBiID}">
            <div class="card-image">
                <img src="${item.anhDaiDien || '/assets/images/vector/no-image.png'}" 
                     alt="${item.tenThietBi || '-'}" 
                     onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                <div class="card-badge">
                    <span class="TrangThai ${suDungClass}">${suDungText}</span>
                </div>
            </div>
            <div class="card-body">
                <h5 class="card-title">
                    <a href="${baseUrl}/AdminTool/TrangThietBi/Details?id=${item.thietBiID}" class="text-decoration-none">
                        ${item.tenThietBi || '-'}
                    </a>
                </h5>
                <div class="card-info">
                    <div class="info-row">
                        <span class="info-label">Loại:</span>
                        <span class="info-value">${item.tenLoaiThietBi || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Tổ chức:</span>
                        <span class="info-value">${item.tenToChuc || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Tình trạng:</span>
                        <span class="info-value">${item.tenTinhTrang || '-'}</span>
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
    const suDungClass = item.suDung ? 'green-text' : 'red-text';
    const suDungText = item.suDung ? 'Hiển thị' : 'Không hiển thị';
    
    // Xử lý chức năng
    let actionsHtml = '';
    if (permitedEdit) {
        actionsHtml += `<a href="${baseUrl}/AdminTool/TrangThietBi/Edit?id=${item.thietBiID}" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa" style="color: #FFB900 !important;">
            <i class="hgi-icon hgi-edit"></i> Sửa
        </a>`;
    }
    if (permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-list-btn" data-id="${item.thietBiID}" data-name="${item.tenThietBi}" title="Xóa">
            <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }
    
    return `
        <div class="list-item" data-id="${item.thietBiID}">
            <div class="list-item-image">
                <img src="${item.anhDaiDien || '/assets/images/vector/no-image.png'}" 
                     alt="${item.tenThietBi || '-'}" 
                     onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
            </div>
            <div class="list-item-content">
                <div class="list-item-header">
                    <h5 class="list-item-title">
                        <a href="${baseUrl}/AdminTool/TrangThietBi/Details?id=${item.thietBiID}" class="text-decoration-none">
                            ${item.tenThietBi || '-'}
                        </a>
                    </h5>
                    <span class="TrangThai ${suDungClass}">${suDungText}</span>
                </div>
                <div class="list-item-body">
                    <div class="list-info-grid">
                        <div class="list-info-item">
                            <span class="list-info-label">Loại:</span>
                            <span class="list-info-value">${item.tenLoaiThietBi || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Tổ chức:</span>
                            <span class="list-info-value">${item.tenToChuc || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Tình trạng:</span>
                            <span class="list-info-value">${item.tenTinhTrang || '-'}</span>
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

/**
 * Load view data (card hoặc list)
 */
function loadViewData(viewType) {
    // Nếu viewType là 'the', load card view; nếu là 'danhSach', load list view
    // Hàm này được gọi từ event listener khi user switch view
}

