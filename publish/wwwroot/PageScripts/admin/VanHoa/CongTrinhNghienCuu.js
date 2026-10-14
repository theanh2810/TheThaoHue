const baseUrl = getRootLink();
let currentFilterUrl = null;

$(document).ready(function () {
    initSelect2();
    initDatePicker();

    (async function () {
        await Promise.all([
            initNgonNgu(),
            initCapXepHang(),
        ]);
        initTable();
        setTimeout(() => { 
            initSelect2()
        }, 500);
        initFilter_Option();
    })();

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

    $("#formDelete").on("submit", function (e) {
        e.preventDefault();
        dataDelete();
    });
    async function initTable() {
        const tableApi = {
            url: `${baseUrl}/api/CongTrinhNghienCuuApi/DanhSach`,
            type: "POST",
            data: function (d) {
                var trangThai = $('#trang-thai-search').val()
                var suDung = $('#su-dung-search').val()
                var cap = $('#cap-search').val()
                return JSON.stringify({
                    linhVucID: 2, // Văn hóa
                    tuKhoa: $('#tu-khoa-search').val() || null,
                    maNgonNgu: $('#ngon-ngu-search').val() || 'vi',
                    capID: (cap == "-1" || cap == "" || !cap) ? null : parseInt(cap) || null,
                    suDung: (suDung == "-1" || suDung == "" || !suDung) ? null : (suDung === "1" ? true : false),
                    trangThaiID: (trangThai == "-1" || trangThai == "" || !trangThai) ? null : (trangThai === "0" ? 0 : trangThai === "1" ? 1 : trangThai === "2" ? 2 : null),
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
                    return `<div class="group-info have-image detail-command-btn" id=n-"${meta.row}">${data}</div>`;
                }
            },
            {
                targets: 3,
                render: function (data, type, row, meta) {
                    let batDau = row.batDau ? moment(row.batDau).format("DD/MM/YYYY") : "";
                    let ketThuc = row.ketThuc ? moment(row.ketThuc).format("DD/MM/YYYY") : "";

                    return ketThuc ? `${batDau} - ${ketThuc}` : batDau;
                }
            },
            {
                targets: 5,
                render: function (data, type, row, meta) {
                    if (data == 0) {
                        return `Chưa thực hiện`;
                    } else if (data == 1){
                        return `Đang thực hiện`;
                    } else if (data == 2) {
                        return `Hoàn thành`;
                    }
                }
            },
            {
                targets: 6,
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
                targets: 7,
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
            { "data": "tenCongTrinh", "width": "", "class": "left-align" },
            { "data": "tacGia", "width": "220px", "class": "left-align" },
            { "data": "", "width": "120px", "class": "center-align" },
            { "data": "tenCap", "width": "220px", "class": "left-align" },
            { "data": "trangThaiID", "width": "120px", "class": "center-align" },
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

            let hef = `/Edit?id=${data.congTrinhNghienCuuID}`;
            window.location.href += hef;
        });
        $('#dataGrid tbody').on('click', '.delete-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGrid').DataTable().row(id).data();

            $('#idDelete').val(data.congTrinhNghienCuuID);
            $('#nameDelete').text(`${data.tenCongTrinh}`);

            $('#modalDelete').modal('show');
        });

        $('#dataGrid tbody').on('click', '.detail-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGrid').DataTable().row(id).data();
           
        });

    }

    async function dataDelete() {
        let id = $('#idDelete').val();

        try {
            const res = await fetch(`/api/CongTrinhNghienCuuApi/Xoa/${id}`, {
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

    async function initCapXepHang() {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: 17,
                    tuKhoa: null
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value) {

                $("#cap-search").append(`<option value=\"\">Chọn cấp</option><option value=\"-1\">Tất cả</option>`);
                data.value.forEach(el => {
                    $("#cap-search").append(`<option value=\"${el.danhMucID}\">${el.tenDanhMuc}</option>`);
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
            <li class="active" data-value="Ten"><a class="option_filter">Tên công trình</a></li>
            <li class="" data-value="Cap"><a class="option_filter">Cấp</a></li>
        `,
        
        // Các filter inputs (select) - không bao gồm search box và date inputs
        filterInputs: [
            '#cap-search',
            '#trang-thai-search',
            '#su-dung-search',
            '#ngon-ngu-search'
        ],

        // Ô search từ khóa
        searchInput: '#tu-khoa-search',
        
        // Thời gian debounce (ms)
        debounceTime: 1000,
        
        // URL API Filter
        apiUrl: `/api/CongTrinhNghienCuuApi/DanhSach`,
        
        // Function build request cho API
        buildFilterRequest: function() {
            var trangThai = $('#trang-thai-search').val();
            var suDung = $('#su-dung-search').val();
            var cap = $('#cap-search').val();
            
            return {
                linhVucID: 2, // Văn hóa
                tuKhoa: $('#tu-khoa-search').val() || null,
                maNgonNgu: $('#ngon-ngu-search').val() || 'vi',
                capID: (cap == "-1" || cap == "" || !cap) ? null : parseInt(cap) || null,
                suDung: (suDung == "-1" || suDung == "" || !suDung) ? null : (suDung === "1" ? true : false),
                trangThaiID: (trangThai == "-1" || trangThai == "" || !trangThai) ? null : (trangThai === "0" ? 0 : trangThai === "1" ? 1 : trangThai === "2" ? 2 : null)
                // type và typeSort sẽ được thêm tự động bởi FilterAction_Post.js
            };
        },
        
        // Callback sau khi apply filter
        onFilterApplied: function(data) {
            currentFilterUrl = null; // Reset vì đây là response data pattern
            // Xử lý response data
            if (data && data.value) {
                data.value.forEach((item, index) => {
                    item.stt = index + 1;
                });
            }
            if (data && data.isSuccess && data.value && $.fn.DataTable.isDataTable('#dataGrid')) {
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
    let trangThaiClass = 'red-text';
    let trangThaiText = 'Chưa thực hiện';
    if (item.trangThaiID === 1) {
        trangThaiClass = 'orange-text';
        trangThaiText = 'Đang thực hiện';
    } else if (item.trangThaiID === 2) {
        trangThaiClass = 'green-text';
        trangThaiText = 'Hoàn thành';
    }
    
    // Thời gian
    let batDau = item.batDau ? moment(item.batDau).format("DD/MM/YYYY") : "";
    let ketThuc = item.ketThuc ? moment(item.ketThuc).format("DD/MM/YYYY") : "";
    let thoiGian = ketThuc ? `${batDau} - ${ketThuc}` : batDau;
    
    // Xử lý chức năng
    let actionsHtml = '';
    if (permitedEdit) {
        actionsHtml += `<a href="/AdminTool/CongTrinhNghienCuu/Edit?id=${item.congTrinhNghienCuuID}" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa" style="color: #FFB900 !important;">
            <i class="hgi-icon hgi-edit"></i> Sửa 
        </a>`;
    }
    if (permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-card-btn" data-id="${item.congTrinhNghienCuuID}" data-name="${item.tenCongTrinh}" title="Xóa">
            <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }
    
    return `
        <div class="card-item" data-id="${item.congTrinhNghienCuuID}">
            <div class="card-body">
                <h5 class="card-title">
                    ${item.tenCongTrinh || '-'}
                </h5>
                <div class="card-info">
                    <div class="info-row">
                        <span class="info-label">Tác giả:</span>
                        <span class="info-value">${item.tacGia || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Thời gian:</span>
                        <span class="info-value">${thoiGian || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Cấp:</span>
                        <span class="info-value">${item.tenCap || '-'}</span>
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

function initTableView() {
    if (!$.fn.DataTable.isDataTable('#dataGrid')) {
        initTable(currentFilterUrl || undefined);
    } else {
        const table = $('#dataGrid').DataTable();
        if (currentFilterUrl) {
            table.ajax.url(currentFilterUrl).load();
        }
    }
}

//#region LIST VIEW - HELPER FUNCTIONS
/**
 * Render HTML cho 1 list item
 */
function renderListItemHtml(item, index) {
    // Xử lý trạng thái
    let trangThaiClass = 'red-text';
    let trangThaiText = 'Chưa thực hiện';
    if (item.trangThaiID === 1) {
        trangThaiClass = 'orange-text';
        trangThaiText = 'Đang thực hiện';
    } else if (item.trangThaiID === 2) {
        trangThaiClass = 'green-text';
        trangThaiText = 'Hoàn thành';
    }
    
    // Thời gian
    let batDau = item.batDau ? moment(item.batDau).format("DD/MM/YYYY") : "";
    let ketThuc = item.ketThuc ? moment(item.ketThuc).format("DD/MM/YYYY") : "";
    let thoiGian = ketThuc ? `${batDau} - ${ketThuc}` : batDau;
    
    // Xử lý chức năng
    let actionsHtml = '';
    if (permitedEdit) {
        actionsHtml += `<a href="/AdminTool/CongTrinhNghienCuu/Edit?id=${item.congTrinhNghienCuuID}" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa" style="color: #FFB900 !important;">
            <i class="hgi-icon hgi-edit"></i> Sửa
        </a>`;
    }
    if (permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-list-btn" data-id="${item.congTrinhNghienCuuID}" data-name="${item.tenCongTrinh}" title="Xóa">
            <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }
    
    return `
        <div class="list-item" data-id="${item.congTrinhNghienCuuID}">
            <div class="list-item-content">
                <div class="list-item-header">
                    <h5 class="list-item-title">
                        ${item.tenCongTrinh || '-'}
                    </h5>
                    <span class="TrangThai ${trangThaiClass}">${trangThaiText}</span>
                </div>
                <div class="list-item-body">
                    <div class="list-info-grid">
                        <div class="list-info-item">
                            <span class="list-info-label">Tác giả:</span>
                            <span class="list-info-value">${item.tacGia || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Thời gian:</span>
                            <span class="list-info-value">${thoiGian || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Cấp:</span>
                            <span class="list-info-value">${item.tenCap || '-'}</span>
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

