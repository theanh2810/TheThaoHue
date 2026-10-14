const baseUrl = getRootLink();
let dataTable = null;

$(document).ready(function () {
    registerCustomFilter();
    initTable();
    bindEvents();
    initDatePicker();
    initSelect2();
});

function initTable() {
    const tableApi = {
        url: `${baseUrl}/api/DM_ChuongTrinhDuAnApi/Gets`,
        type: "GET",
        data: function () {
            return buildFilterParams();
        },
        contentType: 'application/json; charset=utf-8',
        dataSrc: function (data) {
            if (data && data.isSuccess && data.value && data.value.length > 0) {
                data.value.forEach((item, index) => {
                    item.stt = index + 1;
                });
                populateTrangThaiFilter(data.value);
                return data.value;
            }
            return [];
        },
    };

    const tableDefs = [
        {
            targets: 0,
            // STT được đánh lại theo thứ tự đang hiển thị trong sự kiện
            // order.dt/search.dt bên dưới, nên ở đây chỉ cần trả về giá trị tạm.
            render: function (data, type, row, meta) {
                return meta.row + 1;
            }
        },
        {
            targets: 1,
            data: 'tenChuongTrinh',
            render: function (data, type, row) {
                return `<a href="${baseUrl}/AdminTool/ChuongTrinhDuAn/Details?id=${row.chuongTrinhDuAnID}" class="text-primary font-weight-bold">${data}</a>`;
            }
        },
        {
            targets: 3,
            render: function (data, type, row, meta) {
                if (!data) return '';
                return new Date(data).toLocaleDateString('vi-VN');
            }
        },
        {
            targets: 4,
            render: function (data, type, row, meta) {
                if (!data) return '';
                return new Date(data).toLocaleDateString('vi-VN');
            }
        },
        {
            targets: 5,
            render: function (data, type, row) {
                return data || '';
            }
        },
        {
            targets: 6,
            render: function (data, type, row, meta) {
                let html = '';
                html += `<a href="${baseUrl}/AdminTool/ChuongTrinhDuAn/Edit?id=${row.chuongTrinhDuAnID}" class="" title="Chỉnh sửa">
                                <i class="hgi-icon hgi-edit"></i>
                            </a>`;
                if (permitedEdit > 0) {
                    
                }
                html += `<a data-toggle="tooltip" title="Xóa" class="delete-btn text-red cursor-pointer" data-id="${row.chuongTrinhDuAnID}" data-name="${row.tenChuongTrinh}">
                                <i class="hgi-icon hgi-delete"></i>
                            </a>`;
                if (permitedDelete > 0) {
                    
                }
                return html;
            }
        }
    ];

    // if (permitedEdit > 0 || permitedDelete > 0) {
    //     tableDefs.push({
    //         targets: -1,
    //         render: function (data, type, row, meta) {
    //             let html = '';
    //             html += `<a href="${baseUrl}/AdminTool/ChuongTrinhDuAn/Edit?id=${row.chuongTrinhDuAnID}" class="btn btn-sm me-1" title="Chỉnh sửa">
    //                             <i class="hgi-icon hgi-edit"></i>
    //                         </a>`;
    //             if (permitedEdit > 0) {
                    
    //             }
    //             html += `<button type="button" class="btn btn-sm delete-btn" data-id="${row.chuongTrinhDuAnID}" data-name="${row.tenChuongTrinh}" title="Xoá">
    //                             <i class="hgi-icon hgi-delete"></i>
    //                         </button>`;
    //             if (permitedDelete > 0) {
                    
    //             }
    //             return html;
    //         }
    //     });
    // }

    const tableCols = [
        { "data": "stt", "width": "50px", "class": "center-align" },
        { "data": "tenChuongTrinh", "width": "300px", "class": "left-align" },
        { "data": "donVi", "width": "auto", "class": "left-align" },
        { "data": "batDau", "width": "100px", "class": "center-align" },
        { "data": "ketThuc", "width": "100px", "class": "center-align" },
        { "data": "tenTrangThai", "width": "100px", "class": "center-align" },
        { "data": "", "width": "120px", "class": "center-align group-icon-action" }
    ];

    // if (permitedEdit > 0 || permitedDelete > 0) {
    //     tableCols.push({ "data": "", "width": "200px", "class": "center-align" });
    // }

    initDataTableConfigNoSearch('dataGrid', tableApi, tableDefs, tableCols);
    dataTable = $('#dataGrid').DataTable();

    // initDataTableConfigNoSearch khởi tạo bảng với filter:false → các hàm lọc tuỳ
    // biến trong $.fn.dataTable.ext.search KHÔNG được chạy. Bật lại cờ filter cho
    // riêng bảng này để dataTable.draw() áp dụng bộ lọc từ khoá / lọc nâng cao.
    // (dom không chứa 'f' nên vẫn không hiển thị ô tìm kiếm mặc định của DataTables)
    const dtSettings = dataTable.settings()[0];
    if (dtSettings && dtSettings.oFeatures) {
        dtSettings.oFeatures.bFilter = true;
    }

    // Đánh lại STT theo thứ tự các dòng ĐANG HIỂN THỊ (đã áp dụng tìm kiếm/lọc
    // nâng cao và sắp xếp). Nếu chỉ dùng meta.row thì STT giữ nguyên chỉ số của
    // mảng gốc → sau khi lọc số thứ tự bị nhảy cách. draw.dt bao trùm mọi lần
    // vẽ lại (lọc, sắp xếp, tải lại ajax).
    dataTable.on('draw.dt', function () {
        dataTable
            .column(0, { search: 'applied', order: 'applied' })
            .nodes()
            .each(function (cell, i) {
                cell.innerHTML = i + 1;
            });
    });
    // Áp dụng lần đầu cho dữ liệu tải về ban đầu
    dataTable.draw(false);

    $(document).on('click', '.delete-btn', function () {
        const id = $(this).data('id');
        const name = $(this).data('name');
        $('#idDelete').val(id);
        $('#nameDelete').text(name);
        $('#modalDelete').modal('show');
    });
}

function buildFilterParams() {
    // API Gets chỉ nhận MaNgonNgu; các bộ lọc còn lại xử lý phía client
    return {
        MaNgonNgu: 'vi'
    };
}

//#region CLIENT-SIDE FILTER
/**
 * Đăng ký hàm lọc tuỳ biến của DataTables (chạy trên dữ liệu đã tải).
 * Lọc theo: từ khoá, năm, khoảng ngày (Bắt đầu), trạng thái.
 */
function registerCustomFilter() {
    // Tránh đăng ký trùng khi initTable gọi lại
    $.fn.dataTable.ext.search = $.fn.dataTable.ext.search.filter(function (fn) {
        return fn._chuongTrinhFilter !== true;
    });

    const filterFn = function (settings, searchData, dataIndex, rowData) {
        // Chỉ áp dụng cho bảng dataGrid
        if (settings.table.id !== 'dataGrid') {
            return true;
        }

        const keyword = ($('#tu-khoa-search').val() || '').trim().toLowerCase();
        const nam = $('#filterNam').val() || '';
        const tuNgay = $('#tuNgaySearch').val() || '';
        const denNgay = $('#denNgaySearch').val() || '';
        const trangThai = $('#trangThaiSearch').val() || '';

        // 1. Từ khoá: tìm trong tên chương trình, tổ chức, trạng thái
        if (keyword) {
            const haystack = [
                rowData.tenChuongTrinh,
                rowData.tenToChuc,
                rowData.tenTrangThai,
                rowData.tenLinhVuc
            ].map(v => (v || '').toString().toLowerCase()).join(' ');
            if (haystack.indexOf(keyword) === -1) {
                return false;
            }
        }

        // 2. Năm (dựa trên ngày Bắt đầu)
        if (nam) {
            if (!rowData.batDau) return false;
            const namBatDau = new Date(rowData.batDau).getFullYear();
            if (namBatDau.toString() !== nam.toString()) {
                return false;
            }
        }

        // 3. Khoảng ngày (dựa trên ngày Bắt đầu)
        if (tuNgay || denNgay) {
            if (!rowData.batDau) return false;
            const batDau = new Date(rowData.batDau);
            batDau.setHours(0, 0, 0, 0);
            if (tuNgay) {
                const tu = new Date(tuNgay);
                tu.setHours(0, 0, 0, 0);
                if (batDau < tu) return false;
            }
            if (denNgay) {
                const den = new Date(denNgay);
                den.setHours(0, 0, 0, 0);
                if (batDau > den) return false;
            }
        }

        // 4. Trạng thái
        if (trangThai) {
            if ((rowData.trangThaiID || '').toString() !== trangThai.toString()) {
                return false;
            }
        }

        return true;
    };
    filterFn._chuongTrinhFilter = true;

    $.fn.dataTable.ext.search.push(filterFn);
}

/**
 * Nạp danh sách trạng thái vào dropdown lọc từ dữ liệu đã tải (distinct).
 */
function populateTrangThaiFilter(data) {
    const $select = $('#trangThaiSearch');
    if ($select.length === 0) return;

    const current = $select.val();
    const seen = {};
    const options = [];
    data.forEach(item => {
        if (item.trangThaiID != null && !seen[item.trangThaiID]) {
            seen[item.trangThaiID] = true;
            options.push({ id: item.trangThaiID, ten: item.tenTrangThai || '' });
        }
    });

    let html = '<option value="">Tất cả trạng thái</option>';
    options.forEach(o => {
        html += `<option value="${o.id}">${o.ten}</option>`;
    });
    $select.html(html);
    if (current) $select.val(current);
}

function applyFilter() {
    if (dataTable) {
        dataTable.draw();
    }
}
//#endregion

function bindEvents() {
    $('#formDelete').on('submit', function (e) {
        e.preventDefault();
        dataDelete();
    });

    // Mở/đóng panel Lọc nâng cao
    $(document).on('click', '.Filter_nangCao', function (e) {
        e.preventDefault();
        $('#Filter_collapsed_nangCao').slideToggle(300);
        $(this).toggleClass('active');
    });

    // Đóng panel khi click ra ngoài
    $(document).on('click', function (e) {
        if (!$(e.target).closest('.group_nangCao').length) {
            $('#Filter_collapsed_nangCao').slideUp(300);
            $('.Filter_nangCao').removeClass('active');
        }
    });

    // Ô từ khoá: lọc realtime (debounce) + Enter
    let searchTimeout = null;
    $(document).on('input', '#tu-khoa-search', function () {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(applyFilter, 400);
    });
    $(document).on('keypress', '#tu-khoa-search', function (e) {
        if (e.which === 13) {
            e.preventDefault();
            clearTimeout(searchTimeout);
            applyFilter();
        }
    });

    // Các bộ lọc nâng cao: lọc ngay khi thay đổi
    $(document).on('change', '#filterNam, #tuNgaySearch, #denNgaySearch, #trangThaiSearch', function () {
        applyFilter();
    });
}

function dataDelete() {
    const id = $('#idDelete').val();
    if (!id) {
        showNotification(0, 'ID không hợp lệ');
        return;
    }

    $.ajax({
        type: 'DELETE',
        url: `${baseUrl}/api/DM_ChuongTrinhDuAnApi/Delete?ChuongTrinhDuAnID=${id}`,
        contentType: 'application/json',
        dataType: 'json',
        success: function (data) {
            if (data.isSuccess) {
                showNotification(1, 'Xoá thành công');
                $('#modalDelete').modal('hide');
                setTimeout(function () {
                    $('#dataGrid').DataTable().ajax.reload();
                }, 1000);
            } else {
                showNotification(0, data.error || 'Xoá thất bại');
            }
        },
        error: function (err) {
            showNotification(0, 'Lỗi khi xoá: ' + (err.responseJSON?.error || err.statusText));
        }
    });
}
