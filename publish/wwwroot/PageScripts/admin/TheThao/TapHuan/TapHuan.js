const baseUrl = getRootLink();
const ApiUrl = baseUrl + '/api/TapHuanApi';

let dataTable;

$(document).ready(function () {
    (async function () {
        await Promise.all([
            initNgonNgu(),
            initToChuc(),
            initTrangThaiTapHuan(),
            initDatePicker(),
            initSelect2()
        ]);
        await initTable();
        setTimeout(() => initSelect2(), 500);
    })();

    bindEvents();

    $("#formDelete").on("submit", function (e) {
        e.preventDefault();
        dataDelete();
    });
});

function bindEvents() {
    // Bật/tắt bảng "Lọc nâng cao"
    $(document).on('click', '.Filter_nangCao', function (e) {
        e.preventDefault();
        $('#Filter_collapsed_nangCao').slideToggle(300);
        $(this).toggleClass('active');
    });

    // Đóng bảng lọc nâng cao khi click ra ngoài
    $(document).on('click', function (e) {
        if (!$(e.target).closest('.group_nangCao, #Filter_collapsed_nangCao').length) {
            $('#Filter_collapsed_nangCao').slideUp(300);
            $('.Filter_nangCao').removeClass('active');
        }
    });

    // Lọc theo từ khoá: gõ (debounce) hoặc nhấn Enter
    let tuKhoaTimeout = null;
    $('#tu-khoa-search').on('input', function () {
        clearTimeout(tuKhoaTimeout);
        tuKhoaTimeout = setTimeout(reloadTable, 600);
    });
    $('#tu-khoa-search').on('keypress', function (e) {
        if (e.which === 13) {
            e.preventDefault();
            clearTimeout(tuKhoaTimeout);
            reloadTable();
        }
    });

    $('#to-chuc-search, #trang-thai-search, #su-dung-search, #ngon-ngu-search, #tu-ngay-search, #den-ngay-search').on('change', function () {
        reloadTable();
    });

    $(document).on('click', '.edit-form', function () {
        var id = $(this).attr("id").match(/\d+/)[0];
        var data = $('#dataGrid').DataTable().row(id).data();
        window.location = `${baseUrl}/AdminTool/TapHuan/Edit?id=${data.tapHuanID}`;
    });

    $(document).on('click', '.delete-command-btn', function () {
        var id = $(this).attr("id").match(/\d+/)[0];
        var data = $('#dataGrid').DataTable().row(id).data();
        $('#idDelete').val(data.tapHuanID);
        $('#tenDelete').text(data.tenLop);
        $('#modalDelete').modal('show');
    });
}

function reloadTable() {
    if (dataTable) {
        dataTable.ajax.reload();
    }
}

async function initTable() {
    const tableApi = {
        url: `${ApiUrl}/DanhSach`,
        type: "POST",
        data: function (d) {
            const suDung = $('#su-dung-search').val();
            const toChuc = $('#to-chuc-search').val();
            const trangThai = $('#trang-thai-search').val();
            return JSON.stringify({
                tuKhoa:      $('#tu-khoa-search').val() || null,
                maNgonNgu:   $('#ngon-ngu-search').val() || 'vi',
                toChucID:    (toChuc && toChuc !== '-1') ? toChuc : null,
                trangThaiID: (trangThai && trangThai !== '-1') ? parseInt(trangThai) : null,
                tuNgay:      $('#tu-ngay-search').val() || null,
                denNgay:     $('#den-ngay-search').val() || null,
                suDung:      (suDung === '1') ? true : (suDung === '0' ? false : null),
            });
        },
        contentType: 'application/json; charset=utf-8',
        dataSrc: function (res) {
            if (res && res.isSuccess && res.value) {
                return res.value.map((item, i) => ({ ...item, stt: i + 1 }));
            }
            return [];
        },
    };

    const tableDefs = [
        { targets: 0, data: 'stt', width: '50px' },
        {
            targets: 1,
            data: 'tenLop',
            render: function (data, type, row) {
                return `<a href="${baseUrl}/AdminTool/TapHuan/Details?id=${row.tapHuanID}" class="text-primary font-weight-bold">${data}</a>`;
            }
        },
        {
            targets: 3,
            render: function (data) {
                return data ? new Date(data).toLocaleDateString('vi-VN') : '';
            }
        },
        {
            targets: 4,
            render: function (data) {
                return data ? new Date(data).toLocaleDateString('vi-VN') : '';
            }
        },
        {
            targets: 6,
            data: 'suDung',
            render: function (data) {
                return data
                    ? '<span class="badge badge-success">Hiển thị</span>'
                    : '<span class="badge badge-secondary">Ẩn</span>';
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
        { "data": "stt",           "width": "40px",  "class": "center-align" },
        { "data": "tenLop",        "width": "200px", "class": "left-align" },
        { "data": "tenToChuc",     "width": "25%",   "class": "left-align" },
        { "data": "batDau",        "width": "120px", "class": "center-align" },
        { "data": "ketThuc",       "width": "120px", "class": "center-align" },
        { "data": "soLuongDuKien", "width": "120px", "class": "center-align" },
        { "data": "suDung",        "width": "120px", "class": "center-align" },
        { "data": "",              "width": "120px", "class": "center-align group-icon-action" },
    ];

    initDataTableConfigNoSearch('dataGrid', tableApi, tableDefs, tableCols);
    dataTable = $('#dataGrid').DataTable();
}

async function dataDelete() {
    const id = $('#idDelete').val();
    try {
        const res = await fetch(`${ApiUrl}/Xoa/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data && data.isSuccess) {
            showNotification(1, 'Xóa thành công');
            $('#modalDelete').modal('hide');
            reloadTable();
        } else {
            showNotification(0, data.error || 'Xóa thất bại');
        }
    } catch (err) {
        showNotification(0, err.message);
    }
}

async function initTrangThaiTapHuan() {
    // Trạng thái tập huấn = danh mục chung loại 100 (đồng bộ với màn Thêm/Sửa)
    await initDanhMucChung_NoAll(100, '#trang-thai-search', 'Trạng thái');
}

async function initToChuc() {
    // Đơn vị tổ chức = tổ chức thuộc loại 96 (đồng bộ với màn Thêm/Sửa)
    try {
        const res = await fetch(`${baseUrl}/api/ToChucApi/DanhSach`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ loaiToChucID: 96 })
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (data && data.isSuccess && data.value) {
            $('#to-chuc-search')
                .empty()
                .append('<option value="">Tất cả</option>')
                .attr('data-placeholder', 'Đơn vị tổ chức');
            data.value.forEach(el => {
                $('#to-chuc-search').append(`<option value="${el.toChucID}">${el.tenToChuc}</option>`);
            });
        }
    } catch (err) {
        console.log(err.message);
    }
}

async function initNgonNgu() {
    try {
        const res = await fetch(`${baseUrl}/api/NgonNguApi/DanhSach`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trangThai: true })
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (data && data.isSuccess && data.value) {
            $('#ngon-ngu-search').empty();
            data.value.forEach(lang => {
                const isSelected = lang.maNgonNgu?.toLowerCase() === 'vi' ? 'selected' : '';
                $('#ngon-ngu-search').append(`<option value="${lang.maNgonNgu?.toLowerCase()}" ${isSelected}>${lang.tenNgonNgu}</option>`);
            });
            $('#ngon-ngu-search').val('vi');
        }
    } catch (err) {
        console.log(err.message);
    }
}

