const baseUrl = getRootLink();
let currentFilterUrl = null;

$(document).ready(function () {
    initDatePicker();

    (async function () {
        initTable();
        setTimeout(() => { 
            initSelect2()
        }, 500);
        initFilter_Option()
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

    async function initTable() {
        const tableApi = {
            url: `${baseUrl}/api/RPT_YeuCauBaoCaoApi/GetByToChuc`,
            type: "GET",
            contentType: 'application/json; charset=utf-8',
            dataSrc: function (data) {
                if (data && data.isSuccess && data.value && data.value.length > 0) {
                    console.log(data.value);
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
                        <a href="${baseUrl}/AdminTool/ThongKeBaoCao/BaoCao_Detail?YCID=${row.id}" class="text-primary text-decoration-none">
                            ${row.tieuDe || ''}
                        </a>
                    </div>
                </div>`;
                }
            },
            {
                targets: 2, // Cột bắt đầu
                render: function (data, type, row, meta) {
                    if (row.tuNgay) {
                        return formatDateWithoutTime(row.tuNgay);
                    }
                    return '-';
                }
            },
            {
                targets: 3, // Cột kết thúc
                render: function (data, type, row, meta) {
                    if (row.denNgay) {
                        return formatDateWithoutTime(row.denNgay);
                    }
                    return '-';
                }
            },
            {
                targets: 4, // Trạng thái
                render: function (data, type, row, meta) {
                    if (row.daBaoCao) {
                        return `Đã báo cáo`
                    }
                    return 'Chưa báo cáo';
                }
            },
            {
                targets: 5, // Cột chức năng
                render: function (data, type, row, meta) {
                    let html = "";
                    console.log(row, "Tình trạng báo cáo");
                    if (!row.typeExists) {
                        html += `<a data-toggle="tooltip" href="/AdminTool/ThongKeBaoCao/BaoCao_Add?YCID=${row.id}" title="Báo cáo" class="text-yellow edit-form" id="n-${meta.row}">
                                    <i class="hgi-icon hgi-report"></i>
                                </a>`;
                    }
                    if (row.typeExists && !row.daBaoCao) {
                        html += `<a data-toggle="tooltip" title="Chuyển trạng thái" class="text-yellow edit-form changeStatus" id="n-${meta.row}">
                                    <i class="hgi-icon hgi-status"></i>
                                </a>
                                <a data-toggle="tooltip" href="/AdminTool/ThongKeBaoCao/BaoCao_Edit?YCID=${row.id}" title="Chỉnh sửa" class="text-yellow edit-form" id="n-${meta.row}">
                                    <i class="hgi-icon hgi-edit"></i>
                                </a>`;
                    }
                    if (row.daBaoCao) {
                        // html = `<span class="TrangThai green-text">Đã báo cáo</span>`;
                        //<i class="hgi hgi-stroke hgi-rounded hgi-icon hgi-undo"></i>
                        if (typeof permitedEdit !== 'undefined' && permitedEdit) {
                            html += ` <button data-toggle="tooltip" title="Lấy lại" class="text-red thu-hoi-btn cursor-pointer" id="thu-hoi-${meta.row}">
                                        Yêu cầu lấy lại 
                                    </button>`;
                        }
                    }
                    if ((!permitedEdit && !permitedDelete) || (typeof permitedEdit === 'undefined' && typeof permitedDelete === 'undefined')) {
                        html = `<span class="text-muted">Chỉ xem</span>`;
                    }
                    return html;
                }
            }
        ];

        const tableCols = [
            { "data": "stt", "width": "40px", "class": "text-center" },
            { "data": "tieuDe", "width": "", "class": "text-left name-text" },
            { "data": "batDau", "width": "250px", "class": "text-left" },
            { "data": "ketThuc", "width": "250px", "class": "text-left" },
            { "data": "", "width": "250px", "class": "text-left" },
            { "data": "", "width": "250px", "class": "text-center group-icon-action" }
        ];

        initDataTableConfigNoSearch('dataGrid', tableApi, tableDefs, tableCols);
    }

    // Event handler cho nút xóa
    $(document).on('click', '.delete-command-btn', function () {
        var id = $(this).attr("ID").match(/\d+/)[0];
        var data = $('#dataGrid').DataTable().row(id).data();

        $('#idDelete').val(data.id);
        $('#nameDelete').text(`${data.tieuDe}`);

        $('#modalDelete').modal('show');
    });

    // Xử lý xóa báo cáo
    $("#formDelete").on("submit", function (e) {
        e.preventDefault();
        dataDelete();
    });

    async function dataDelete() {
        const baoCaoID = $('#idDelete').val();
        if (!baoCaoID) {
            showNotification(0, 'Không xác định được báo cáo cần xóa!');
            return;
        }
        try {
            const res = await fetch(`${baseUrl}/api/RPT_BaoCaoApi/Delete?ID=${baoCaoID}`, {
                method: 'DELETE'
            });
            if (!res.ok) {
                const errText = await res.text();
                showNotification(0, errText || 'Xóa thất bại!');
                return;
            }
            const result = await res.json();
            if (result && result.isSuccess) {
                showNotification(1, 'Xóa thành công!');
                $('#modalDelete').modal('hide');
                initTable();
            } else {
                showNotification(0, result.error || 'Xóa thất bại!');
            }
        } catch (err) {
            showNotification(0, err.message || 'Xóa thất bại!');
        }
    }


    // Modal change status
    $(document).on('click', '.changeStatus', function () {
        var id = $(this).attr("ID").match(/\d+/)[0];
        var data = $('#dataGrid').DataTable().row(id).data();
        $('#idChangeStatus').val(data.id);
        $('#idChangeStatus').attr('data-tochucid', data.toChucID);
        $('#nameChangeStatus').text(data.tieuDe);
        $('#modalChangeStatus').modal('show');
    });

    //Handle change status (nộp báo cáo)
    $("#buttonChangeStatus").on('click', function () {
        let ID = $("#idChangeStatus").val();
        let toChucID = $("#idChangeStatus").attr('data-tochucid');
        let dataBuilder = { "yeuCauBaoCaoID": parseInt(ID), "toChucID": toChucID, "daBaoCao": true, "lyDoThuHoi": null };
        $.ajax({
            type: "PUT",
            async: false,
            url: `${baseUrl}/api/RPT_YeuCauBaoCaoApi/UpdateStatus`,
            contentType: 'application/json;charset=utf-8',
            data: JSON.stringify(dataBuilder),
            success: function (data) {
                console.log(data);
                if (data.isSuccess && data.value) {
                    showNotification(1, 'Nộp báo cáo thành công!');
                    $('#modalChangeStatus').modal('hide');
                    initTable();
                } else {
                    showNotification(0, data.error || 'Nộp báo cáo thất bại!');
                }
            },
            error: function (err) { console.log(err); }
        });
    });

    // Mở modal lấy lại báo cáo
    $(document).on('click', '.thu-hoi-btn', function () {
        var rowIndex = $(this).attr('id').replace('thu-hoi-', '');
        var data = $('#dataGrid').DataTable().row(parseInt(rowIndex)).data();
        console.log("data thu hồi", data)
        $('#idThuHoi').val(data.id);
        $('#toChucThuHoiID').val(data.toChucID);
        $('#nameThuHoi').text(data.tieuDe);
        $('#lyDoThuHoiInput').val('');
        $('#modalThuHoi').modal('show');
    });

    // Xác nhận lấy lại báo cáo
    $('#btnConfirmThuHoi').on('click', function () {
        const id = $('#idThuHoi').val();
        const toChucID = $('#toChucThuHoiID').val();
        const lyDo = $('#lyDoThuHoiInput').val().trim();
        if (!lyDo) {
            showNotification(0, 'Vui lòng nhập lý do lấy lại báo cáo!');
            return;
        }
        const btn = $(this);
        btn.prop('disabled', true).text('Đang xử lý...');
        $.ajax({
            type: 'PUT',
            url: `${baseUrl}/api/RPT_YeuCauBaoCaoApi/UpdateStatus`,
            contentType: 'application/json;charset=utf-8',
            data: JSON.stringify({
                YeuCauBaoCaoID: id,
                ToChucID: toChucID,
                daBaoCao: false,
                lyDoThuHoi: lyDo
            }),
            success: function (data) {
                if (data.isSuccess && data.value) {
                    showNotification(1, 'Lấy lại báo cáo thành công!');
                    $('#modalThuHoi').modal('hide');
                    initTable();
                } else {
                    showNotification(0, data.error || 'Lấy lại báo cáo thất bại!');
                }
            },
            error: function (err) { console.log(err); showNotification(0, 'Có lỗi xảy ra!'); },
            complete: function () { btn.prop('disabled', false).html('<i class="hgi-icon hgi-undo"></i> Xác nhận lấy lại'); }
        });
    });

    // Reset modal thu hồi khi đóng
    $('#modalThuHoi').on('hidden.bs.modal', function () {
        $('#lyDoThuHoiInput').val('');
        $('#idThuHoi').val('');
    });
});

function initFilter_Option(DanhMucID) {
    // Khởi tạo filter chung với config
    initCommonFilter({
        // HTML cho các option sắp xếp
        htmlFilterSort: `
            <li class="active" data-value="TieuDe"><a class="option_filter">Tiêu đề</a></li>
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
        apiUrl: `${baseUrl}/api/RPT_YeuCauBaoCaoApi/Filter`,
        
        // Function build parameters cho API
        buildFilterParams: function() {
            let params = {
                MaNgonNgu: $('#ngon-ngu-search').val() || 'vi',
                LoaiDanhMucID: DanhMucID
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
        
        // Callback sau khi apply filter (cho table view)
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

//#region CARD VIEW - HELPER FUNCTIONS
function initCardView() {
    loadViewData('the');
}

function renderCardItemHtml(item, index) {
    const trangThaiClass = item.suDung ? 'green-text' : 'red-text';
    const trangThaiText = item.suDung ? 'Hoạt động' : 'Không hoạt động';
    const batDauText = item.batDau ? new Date(item.batDau).toLocaleDateString('vi-VN') : '-';
    const ketThucText = item.ketThuc ? new Date(item.ketThuc).toLocaleDateString('vi-VN') : '-';
    
    let actionsHtml = '';
    console.log(item, "Tình trạng báo cáo trong card");
    if (!item.typeExists) {
        actionsHtml += `<a href="/AdminTool/ThongKeBaoCao/BaoCao_Add?YCID=${item.id}" class="btn btn-sm btn-outline-primary" title="Báo cáo" style="color:#00a6f4!important">
                            <i class="hgi-icon hgi-report"></i> Báo cáo
                        </a>`;
    }
    if (item.typeExists && !item.daBaoCao) {
        actionsHtml += `<button class="btn btn-sm btn-outline-warning changeStatus-card" data-id="${item.id}" data-name="${item.tieuDe}" title="Chuyển trạng thái" style="color:#009966!important">
                            <i class="hgi-icon hgi-status"></i> Chuyển trạng thái
                        </button>
                        <a href="/AdminTool/ThongKeBaoCao/BaoCao_Edit?YCID=${item.id}" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa">
                            <i class="hgi-icon hgi-edit"></i> Chỉnh sửa
                        </a>`;
    }
    if (item.daBaoCao) {
        actionsHtml = `<button class="btn btn-sm btn-outline-warning text-muted" data-name="${item.tieuDe}" title="Chuyển trạng thái" style="color:#6c757d!important">
                            Đã báo cáo
                        </button>`;
    }
    if ((!permitedEdit && !permitedDelete) || (typeof permitedEdit === 'undefined' && typeof permitedDelete === 'undefined')) {
        actionsHtml = `<span class="text-muted">Chỉ xem</span>`;
    }
    
    return `
        <div class="card-item" data-id="${item.id}">
            <div class="card-body">
                <div class="card-title">${item.tieuDe || '-'}</div>
                <div class="card-info">
                    <div class="info-row">
                        <span class="info-label">Bắt đầu:</span>
                        <span class="info-value">${batDauText}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Kết thúc:</span>
                        <span class="info-value">${ketThucText}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Tổ chức:</span>
                        <span class="info-value">${item.tenToChuc || '-'}</span>
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
    $('.changeStatus-card').off('click').on('click', function() {
        const id = $(this).data('id');
        const name = $(this).data('name');
        
        $('#idChangeStatus').val(id);
        $('#nameChangeStatus').text(name);
        $('#modalChangeStatus').modal('show');
    });
}
//#endregion

//#region LIST VIEW - HELPER FUNCTIONS
function initListView() {
    loadViewData('danhSach');
}

function renderListItemHtml(item, index) {
    const trangThaiClass = item.suDung ? 'green-text' : 'red-text';
    const trangThaiText = item.suDung ? 'Hoạt động' : 'Không hoạt động';
    const batDauText = item.batDau ? new Date(item.batDau).toLocaleDateString('vi-VN') : '-';
    const ketThucText = item.ketThuc ? new Date(item.ketThuc).toLocaleDateString('vi-VN') : '-';
    
    let actionsHtml = "";
    console.log(item, "Tình trạng báo cáo trong list");
    if (!item.typeExists) {
        actionsHtml += `<a href="/AdminTool/ThongKeBaoCao/BaoCao_Add?YCID=${item.id}" class="btn btn-sm btn-outline-primary" title="Báo cáo" style="color:#00a6f4!important">
                            <i class="hgi-icon hgi-report"></i> Báo cáo
                        </a>`;
    }
    if (item.typeExists && !item.daBaoCao) {
        actionsHtml += `<button class="btn btn-sm btn-outline-warning changeStatus-list" data-id="${item.id}" data-name="${item.tieuDe}" title="Chuyển trạng thái" style="color:#009966!important">
                            <i class="hgi-icon hgi-status"></i> Chuyển trạng thái
                        </button>
                        <a href="/AdminTool/ThongKeBaoCao/BaoCao_Edit?YCID=${item.id}" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa">
                            <i class="hgi-icon hgi-edit"></i> Chỉnh sửa
                        </a>`;
    }
    if (item.daBaoCao) {
        actionsHtml = `<span class="text-muted">Đã báo cáo</span>`;
    }
    if ((!permitedEdit && !permitedDelete) || (typeof permitedEdit === 'undefined' && typeof permitedDelete === 'undefined')) {
        actionsHtml = `<span class="text-muted">Chỉ xem</span>`;
    }
    
    return `
        <div class="list-item" data-id="${item.id}">
            <div class="list-item-content">
                <div class="list-item-header">
                    <h5 class="list-item-title">${item.tieuDe || '-'}</h5>
                </div>
                <div class="list-item-body">
                    <div class="list-info-grid">
                        <div class="list-info-item">
                            <span class="list-info-label">Bắt đầu - Kết thúc:</span>
                            <span class="list-info-value">${batDauText} đến ${ketThucText}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Tổ chức:</span>
                            <span class="list-info-value">${item.tenToChuc || '-'}</span>
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
    $('.changeStatus-list').off('click').on('click', function() {
        const id = $(this).data('id');
        const name = $(this).data('name');
        
        $('#idChangeStatus').val(id);
        $('#nameChangeStatus').text(name);
        $('#modalChangeStatus').modal('show');
    });
}
//#endregion

//#region function validation
const checkTagHtmlSingle = (input) => {
    if (!input || input.trim() === "") return false;
    const regex = /<[^>]+>/g;
    return regex.test(input);
}

function initTableView() {
    if (!$.fn.DataTable.isDataTable('#dataGrid')) {
        initTable(currentFilterUrl);
    } else {
        const table = $('#dataGrid').DataTable();
        table.ajax.url(currentFilterUrl).load();
    }
}

const isValidEmailAllowEmpty = (input) => {
    if (!input || input.trim() === "") return false;
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
    return !regex.test(input.trim());
};

const isValidUrlAllowEmpty = (input) => {
    if (!input || input.trim() === "") return false;
    const regex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/;
    return !regex.test(input.trim());
};
//#endregion function validation
