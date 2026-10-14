const baseUrl = getRootLink();
let currentFilterUrl = null;
const ckeditormotaAdd = CKEDITOR.replace('noiDungAdd');

$(document).ready(function () {
    initDatePicker();
    let translations = [];

    function initNhomToChuc() {
        $.ajax({
            type: "GET",
            url: `${baseUrl}/api/NhomDonViApi/Gets`,
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                console.log(data, "data group");
                if (data && data.isSuccessed) {
                    let html = '<option value="">-- Chọn nhóm tổ chức --</option>';
                    data.resultObj.forEach(function (item) {
                        if (item.trangThai == true) {
                            html += `<option value="${item.nhomDonViID}">${item.tenNhom}</option>`;
                        }
                    });
                    $('#nhomToChucAdd').html(html);
                } else {

                }
            },
            error: function (err) {
                console.log(err);
            }
        })
    }

    function getPhuongXa(callback) {
        $.ajax({
            type: "GET",
            url: `${baseUrl}/api/CapXaApi/Gets`,
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                if (data && data.isSuccessed && data.resultObj && data.resultObj.length > 0) {
                    console.log(data, "data group");
                    //return;
                    let html = "";
                    let dt = data.resultObj.filter(e => e.tinhID == "4c83f134-1cbe-4854-8c51-3e3092e66709" && e.trangThai == true);
                    dt.forEach(function (item) {
                        html += `<option value="${item.xaID}">${item.noiDung}</option>`;
                    });
                    $('#toChucAdd').append(html);
                }
            },
            error: function (err) {
                console.log(err, "err group")
                callback("");
            }
        });
    };

    (async function () {
        initToChuc_NoAll(96, '#toChucAdd', null, null);
        //bổ sung hiển thị thêm phường xã
        getPhuongXa();
        initKyBaoCao();
        initNamBaoCao();
        initNhomToChuc();
        initTable();
        setTimeout(() => {
            initSelect2()
        }, 500);
        initFilter_Option()
    })();

    // Lắng nghe event switch sang card view
    $(document).on('viewChanged:card', function () {
        initCardView();
    });

    // Lắng nghe event switch sang list view
    $(document).on('viewChanged:list', function () {
        initListView();
    });

    // Lắng nghe event switch sang table view
    $(document).on('viewChanged:table', function () {
        initTableView();
    });

    async function initTable() {
        const tableApi = {
            url: `${baseUrl}/api/RPT_YeuCauBaoCaoApi/Gets?MaNgonNgu=vi`,
            type: "GET",
            contentType: 'application/json; charset=utf-8',
            dataSrc: function (data) {
                if (data && data.isSuccess && data.value && data.value.length > 0) {
                    console.log(data.value, " data o day ");
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
                    return `<div class="group-info">
                    <div class="info-main">
                        <a href="${baseUrl}/AdminTool/ThongKeBaoCao/YeuCauBaoCao_DonViTongHop?YCID=${row.id}" class="text-primary text-decoration-none">
                            ${row.tieuDe || ''}
                        </a>
                    </div>
                </div>`;
                }
            },
            {
                targets: 2, // Cột Kỳ báo cáo (KyBaoCao + Nam)
                render: function (data, type, row, meta) {
                    const nam = row.nam != null ? row.nam : "";
                    if (nam != "") {
                        return row.kyBaoCao + "/" + nam;
                    }
                    return row.kyBaoCao;
                }
            },
            {
                targets: 3, // Cột Tổ chức
                render: function (data, type, row, meta) {
                    return truncateText(row.tenToChuc || '', 100);
                }
            },
            {
                targets: 4, // Cột thời gian báo cáo
                render: function (data, type, row, meta) {
                    return formatTimeRangeForDisplay(row.tuNgay, row.denNgay);
                }
            },
            {
                targets: 5, // Cột trạng thái báo cáo
                render: function (data, type, row, meta) {
                    if (row.daBaoCao) {
                        return `<span class="TrangThai green-text">Đã báo cáo</span>`;
                    } else {
                        return `<span class="TrangThai red-text">Chưa báo cáo</span>`;
                    }
                }
            },
            {
                targets: 6, // Cột chức năng
                render: function (data, type, row, meta) {
                    let html = "";
                    if (row.daBaoCao) {
                        return `<span class="text-muted">Đã báo cáo</span>`;
                    }
                    if (typeof permitedEdit !== 'undefined' && permitedEdit) {
                        html += `<a data-toggle="tooltip" title="Chỉnh sửa" class="text-yellow edit-form" id="n-${meta.row}">
                                    <i class="hgi-icon hgi-edit"></i>
                                </a>`;
                    }
                    if (typeof permitedDelete !== 'undefined' && permitedDelete) {
                        html += `<a data-toggle="tooltip" title="Xóa" class="delete-command-btn text-red cursor-pointer" id="delete-${meta.row}">
                                    <i class="hgi-icon hgi-delete"></i>
                                </a>`;
                    }
                    if ((!permitedEdit && !permitedDelete) || (typeof permitedEdit === 'undefined' && typeof permitedDelete === 'undefined')) {
                        html = `<span class="text-muted">Chỉ xem</span>`;
                    }
                    return html;
                }
            }
        ];

        const tableCols = [
            { "data": "stt", "width": "40px", "class": "center-align" },
            { "data": "tieuDe", "width": "200px", "class": "left-align name-text" },
            { "data": "tenKyBaoCaoNam", "width": "", "class": "left-align" },
            { "data": "tenToChuc", "width": "300px", "class": "left-align" },
            { "data": "ngayBaoCao", "width": "250px", "class": "left-align" },
            { "data": "daBaoCao", "width": "180px", "class": "left-align" },
            { "data": "", "width": "120px", "class": "center-align group-icon-action" }
        ];

        initDataTableConfigNoSearch('dataGrid', tableApi, tableDefs, tableCols);
    }

    function truncateText(text, maxLength) {
        if (!text || typeof text !== 'string') return '';
        const stripped = text.replace(/\s+/g, ' ').trim();
        if (stripped.length <= maxLength) return escapeHtml(stripped);
        return escapeHtml(stripped.substring(0, maxLength).trim()) + '...';
    }

    function escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    $(document).on('click', '.edit-form', function () {
        var id = $(this).attr("ID").match(/\d+/)[0];
        var data = $('#dataGrid').DataTable().row(id).data();
        translations = []
        if (data) {
            translations = data
        } else {
            console.log(data.error)
        }
        console.log(translations)
        console.log(data, "data here")
        $("#modalAddTitle").text("Cập nhật yêu cầu báo cáo")
        $('#yeuCauBaoCaoIDAdd').val(data.id || "");
        $('#kyBaoCaoAdd').val(data.kyBaoCaoID || "").trigger('change');
        $('#namAdd').val(data.nam || new Date().getFullYear()).trigger('change');
        $('#tieuDeAdd').val(data.tieuDe || "");

        var arrToChuc = data.listToChucID
            ? data.listToChucID.split(',').map(item => item.trim().toLowerCase())
            : [];
        console.log(arrToChuc, "arrToChuc");
        $('#toChucAdd').val(arrToChuc).trigger('change');
        $('#dinhKyAdd').val(data.dinhKy ? "1" : "0").trigger('change');
        $('#tuNgayAdd').val(data.tuNgay ? formatDateWithoutTime(data.tuNgay) : "");
        $('#denNgayAdd').val(data.denNgay ? formatDateWithoutTime(data.denNgay) : "");
        ckeditormotaAdd.setData(data.noiDung || "");

        $('#modalAdd').modal('show');
    });

    // Event handler cho nút xóa
    $(document).on('click', '.delete-command-btn', function () {
        var id = $(this).attr("ID").match(/\d+/)[0];
        var data = $('#dataGrid').DataTable().row(id).data();

        $('#idDelete').val(data.id);
        $('#nameDelete').text(`${data.tieuDe}`);

        $('#modalDelete').modal('show');
    });

    // Xử lý submit thêm/sửa yêu cầu báo cáo
    $("#formAdd").on("submit", async function (e) {
        e.preventDefault();
        const submitBtn = $(this).find('button[type="submit"]');
        if (submitBtn.prop('disabled')) return;
        submitBtn.prop('disabled', true);
        const originalText = submitBtn.text();
        submitBtn.text('Đang xử lý...');

        // Lấy dữ liệu từ form
        const yeuCauBaoCaoID = $('#yeuCauBaoCaoIDAdd').val();
        const kyBaoCaoID = $('#kyBaoCaoAdd').val();
        const nam = $('#namAdd').val();
        const listToChucID = $("#toChucAdd").val().map(item => item).join(',');
        const dinhKy = $('#dinhKyAdd').val() === "1" ? true : false;
        const tieuDe = $('#tieuDeAdd').val();
        const tuNgay = $('#tuNgayAdd').val();
        const denNgay = $('#denNgayAdd').val();
        const noiDung = ckeditormotaAdd.getData();

        const listNhomToChucID = $("#nhomToChucAdd").val().map(item => item).join(',');

        // Build object theo mẫu
        const dataObj = {
            kyBaoCaoID: kyBaoCaoID,
            nam: nam ? parseInt(nam) : null,
            listToChucID: listToChucID,
            dinhKy: dinhKy,
            tieuDe: tieuDe,
            noiDung: noiDung,
            tuNgay: formatDateToSaveAsString(tuNgay),
            denNgay: formatDateToSaveAsString(denNgay),
            listNhomToChucID: listNhomToChucID
        };

        const dataObj_update = {
            id: yeuCauBaoCaoID,
            kyBaoCaoID: kyBaoCaoID,
            nam: nam ? parseInt(nam) : null,
            dinhKy: dinhKy,
            tieuDe: tieuDe,
            noiDung: noiDung,
            tuNgay: formatDateToSaveAsString(tuNgay),
            denNgay: formatDateToSaveAsString(denNgay),
            listNhomToChucID: listNhomToChucID
        };

        if (checkEmptyBlank(nam)) {
            showNotification(0, "Vui lòng chọn năm báo cáo!");
            submitBtn.prop('disabled', false);
            submitBtn.text(originalText);
        }
        else if (checkEmptyBlank(tieuDe)) {
            showNotification(0, "Vui lòng nhập tiêu đề báo cáo!");
            submitBtn.prop('disabled', false);
            submitBtn.text(originalText);
        }
        else if (checkEmptyBlank(tuNgay)) {
            showNotification(0, "Vui lòng chọn từ ngày!");
            submitBtn.prop('disabled', false);
            submitBtn.text(originalText);
        }
        else if (checkEmptyBlank(denNgay)) {
            showNotification(0, "Vui lòng chọn đến ngày!");
            submitBtn.prop('disabled', false);
            submitBtn.text(originalText);
        }
        else {
            if (yeuCauBaoCaoID && yeuCauBaoCaoID !== "" && yeuCauBaoCaoID !== "0") {
                try {
                    $.ajax({
                        type: "PUT",
                        url: `${baseUrl}/api/RPT_YeuCauBaoCaoApi/Update`,
                        data: JSON.stringify(dataObj_update),
                        contentType: 'application/json; charset=utf-8',
                        success: function (data) {
                            console.log(data);
                            if (data && data.isSuccess) {
                                showNotification(1, 'Cập nhật yêu cầu báo cáo thành công!');
                                $('#modalAdd').modal('hide');
                                initTable();
                            } else {
                                showNotification(0, data.error || 'Lưu dữ liệu thất bại!');
                            }
                        },
                        error: function (err) {
                            console.log(err);
                        }
                    })
                } catch (err) {
                    showNotification(0, err.message || 'Lưu dữ liệu thất bại!');
                } finally {
                    submitBtn.prop('disabled', false).text(originalText);
                }
            }
            else {
                try {
                    $.ajax({
                        type: "POST",
                        url: `${baseUrl}/api/RPT_YeuCauBaoCaoApi/Add`,
                        data: JSON.stringify(dataObj),
                        contentType: 'application/json; charset=utf-8',
                        success: function (data) {
                            console.log(data);
                            if (data && data.isSuccess) {
                                showNotification(1, 'Thêm mới yêu cầu báo cáo thành công!');
                                $('#modalAdd').modal('hide');
                                initTable();
                            } else {
                                showNotification(0, data.error || 'Lưu dữ liệu thất bại!');
                            }
                        },
                        error: function (err) {
                            console.log(err);
                        }
                    })
                } catch (err) {
                    showNotification(0, err.message || 'Lưu dữ liệu thất bại!');
                } finally {
                    submitBtn.prop('disabled', false).text(originalText);
                }
            }
        }
    });

    // Xử lý xóa yêu cầu báo cáo
    $("#formDelete").on("submit", function (e) {
        e.preventDefault();
        dataDelete();
    });

    async function dataDelete() {
        const yeuCauBaoCaoID = $('#idDelete').val();
        if (!yeuCauBaoCaoID) {
            showNotification(0, 'Không xác định được yêu cầu báo cáo cần xóa!');
            return;
        }
        try {
            const res = await fetch(`${baseUrl}/api/RPT_YeuCauBaoCaoApi/Delete?ID=${yeuCauBaoCaoID}`, {
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

    // reset modal
    $("#modalAdd").on('hidden.bs.modal', function () {
        translations = []
        $(this).find('input[type=text], input[type=date], textarea').val('');
        $('#yeuCauBaoCaoIDAdd').val('');
        $(this).find('input[type=checkbox]').prop('checked', false);
        $('#toChucAdd').val([]).trigger('change');
        $('#dinhKyAdd').val('0');
        $('#namAdd').val('').trigger('change');
        ckeditormotaAdd.setData('');
        $("#modalAddTitle").text("Thêm mới yêu cầu báo cáo");
    });
});

function initFilter_Option(DanhMucID) {
    initCommonFilter({
        htmlFilterSort: `
            <li class="active" data-value="TieuDe"><a class="option_filter">Tiêu đề</a></li>
            <li data-value="TenToChuc"><a class="option_filter">Tổ chức</a></li>
        `,
        filterInputs: ['#nam-search'],
        searchInput: '#tu-khoa-search',
        debounceTime: 1000,
        apiUrl: `${baseUrl}/api/RPT_YeuCauBaoCaoApi/Filter`,
        buildFilterParams: function () {
            let params = {
                MaNgonNgu: $('#ngon-ngu-search').val() || 'vi',
                LoaiDanhMucID: DanhMucID
            };
            let tuKhoa = $('#tu-khoa-search').val();
            if (tuKhoa && tuKhoa.trim() !== '') {
                params.TuKhoa = tuKhoa;
            }
            let nam = $('#nam-search').val();
            if (nam && nam.trim() !== '') {
                params.Nam = nam;
            }
            return params;
        },
        onFilterApplied: function (urlFilter) {
            currentFilterUrl = urlFilter;
            if ($.fn.DataTable.isDataTable('#dataGrid')) {
                $('#dataGrid').DataTable().ajax.url(urlFilter).load();
            }
        },
        renderCardItem: function (item, index) {
            return renderCardItemHtml(item, index);
        },
        renderListItem: function (item, index) {
            return renderListItemHtml(item, index);
        },
        onCardRendered: function () {
            attachCardEventHandlers();
        },
        onListRendered: function () {
            attachListEventHandlers();
        }
    });
}

//#region CARD VIEW - HELPER FUNCTIONS
function initCardView() {
    loadViewData('the');
}

function renderCardItemHtml(item, index) {
    const daBaoCao = item.daBaoCao || false;
    const trangThaiClass = daBaoCao ? 'green-text' : 'red-text';
    const trangThaiText = daBaoCao ? 'Đã báo cáo' : 'Chưa báo cáo';
    const kyBaoCaoNam = item.tenKyBaoCaoNam || '-';

    let actionsHtml = '';
    if (daBaoCao) {
        return `
        <div class="card-item" data-id="${item.id}">
            <div class="card-body">
                <div class="card-title">${item.tieuDe || '-'}</div>
                <div class="card-info">
                    <div class="info-row"><span class="info-label">Tổ chức:</span><span class="info-value">${item.tenToChuc || '-'}</span></div>
                    <div class="info-row"><span class="info-label">Kỳ báo cáo:</span><span class="info-value">${kyBaoCaoNam}</span></div>
                    <div class="info-row"><span class="info-label">Ngày báo cáo:</span><span class="info-value">${item.ngayBaoCao ? formatDateWithoutTime(item.ngayBaoCao) : '-'}</span></div>
                    <div class="info-row"><span class="info-label">Trạng thái:</span><span class="TrangThai ${trangThaiClass}">${trangThaiText}</span></div>
                </div>
            </div>
        </div>`;
    }
    if (typeof permitedEdit !== 'undefined' && permitedEdit) {
        actionsHtml += `<button class="btn btn-sm btn-outline-primary edit-card-btn" data-id="${item.id}" title="Chỉnh sửa" style="color: #FFB900 !important;"><i class="hgi-icon hgi-edit"></i> Sửa</button>`;
    }
    if (typeof permitedDelete !== 'undefined' && permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-card-btn" data-id="${item.id}" data-name="${item.tieuDe}" title="Xóa"><i class="hgi-icon hgi-delete"></i> Xóa</button>`;
    }
    return `
        <div class="card-item" data-id="${item.id}">
            <div class="card-body">
                <div class="card-title">${item.tieuDe || '-'}</div>
                <div class="card-info">
                    <div class="info-row"><span class="info-label">Tổ chức:</span><span class="info-value">${item.tenToChuc || '-'}</span></div>
                    <div class="info-row"><span class="info-label">Kỳ báo cáo:</span><span class="info-value">${kyBaoCaoNam}</span></div>
                    <div class="info-row"><span class="info-label">Ngày báo cáo:</span><span class="info-value">${item.ngayBaoCao ? formatDateWithoutTime(item.ngayBaoCao) : '-'}</span></div>
                    <div class="info-row"><span class="info-label">Trạng thái:</span><span class="TrangThai ${trangThaiClass}">${trangThaiText}</span></div>
                </div>
            </div>
            <div class="card-footer">${actionsHtml}</div>
        </div>`;
}

function attachCardEventHandlers() {
    $('.delete-card-btn').off('click').on('click', function () {
        $('#idDelete').val($(this).data('id'));
        $('#nameDelete').text($(this).data('name'));
        $('#modalDelete').modal('show');
    });
    $('.edit-card-btn').off('click').on('click', function () {
        const id = $(this).data('id');
        const table = $('#dataGrid').DataTable();
        const rows = table.rows().nodes().to$();
        let rowIndex = -1;
        rows.each(function (idx) {
            if ($(this).find('.edit-form').attr('ID') === `edit_${idx}`) rowIndex = idx;
        });
        if (rowIndex >= 0) $(rows[rowIndex]).find('.edit-form').click();
    });
}
//#endregion

function initTableView() {
    if (!$.fn.DataTable.isDataTable('#dataGrid')) {
        initTable(currentFilterUrl);
    } else {
        $('#dataGrid').DataTable().ajax.url(currentFilterUrl).load();
    }
}

//#region LIST VIEW - HELPER FUNCTIONS
function initListView() {
    loadViewData('danhSach');
}

function renderListItemHtml(item, index) {
    const daBaoCao = item.daBaoCao || false;
    const trangThaiClass = daBaoCao ? 'green-text' : 'red-text';
    const trangThaiText = daBaoCao ? 'Đã báo cáo' : 'Chưa báo cáo';
    const kyBaoCaoNam = item.tenKyBaoCaoNam || '-';

    let actionsHtml = '';
    if (item.daBaoCao) {
        return `
        <div class="list-item" data-id="${item.id}">
            <div class="list-item-content">
                <div class="list-item-header">
                    <h5 class="list-item-title">${item.tieuDe || '-'}</h5>
                    <span class="TrangThai ${trangThaiClass}">${trangThaiText}</span>
                </div>
                <div class="list-item-body">
                    <div class="list-info-grid">
                        <div class="list-info-item"><span class="list-info-label">Tổ chức:</span><span class="list-info-value">${item.tenToChuc || '-'}</span></div>
                        <div class="list-info-item"><span class="list-info-label">Kỳ báo cáo:</span><span class="list-info-value">${kyBaoCaoNam}</span></div>
                        <div class="list-info-item"><span class="list-info-label">Ngày báo cáo:</span><span class="list-info-value">${item.ngayBaoCao ? formatDateWithoutTime(item.ngayBaoCao) : '-'}</span></div>
                    </div>
                </div>
            </div>
        </div>`;
    }
    if (typeof permitedEdit !== 'undefined' && permitedEdit) {
        actionsHtml += `<button class="btn btn-sm btn-outline-primary edit-list-btn" data-id="${item.id}" title="Chỉnh sửa" style="color: #FFB900 !important;"><i class="hgi-icon hgi-edit"></i> Sửa</button>`;
    }
    if (typeof permitedDelete !== 'undefined' && permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-list-btn" data-id="${item.id}" data-name="${item.tieuDe}" title="Xóa"><i class="hgi-icon hgi-delete"></i> Xóa</button>`;
    }
    return `
        <div class="list-item" data-id="${item.id}">
            <div class="list-item-content">
                <div class="list-item-header">
                    <h5 class="list-item-title">${item.tieuDe || '-'}</h5>
                    <span class="TrangThai ${trangThaiClass}">${trangThaiText}</span>
                </div>
                <div class="list-item-body">
                    <div class="list-info-grid">
                        <div class="list-info-item"><span class="list-info-label">Tổ chức:</span><span class="list-info-value">${item.tenToChuc || '-'}</span></div>
                        <div class="list-info-item"><span class="list-info-label">Kỳ báo cáo:</span><span class="list-info-value">${kyBaoCaoNam}</span></div>
                        <div class="list-info-item"><span class="list-info-label">Ngày báo cáo:</span><span class="list-info-value">${item.ngayBaoCao ? formatDateWithoutTime(item.ngayBaoCao) : '-'}</span></div>
                    </div>
                </div>
            </div>
            <div class="list-item-actions">${actionsHtml}</div>
        </div>`;
}

function attachListEventHandlers() {
    $('.delete-list-btn').off('click').on('click', function () {
        $('#idDelete').val($(this).data('id'));
        $('#nameDelete').text($(this).data('name'));
        $('#modalDelete').modal('show');
    });
    $('.edit-list-btn').off('click').on('click', function () {
        const id = $(this).data('id');
        const table = $('#dataGrid').DataTable();
        const rows = table.rows().nodes().to$();
        let rowIndex = -1;
        rows.each(function (idx) {
            if ($(this).find('.edit-form').attr('ID') === `edit_${idx}`) rowIndex = idx;
        });
        if (rowIndex >= 0) $(rows[rowIndex]).find('.edit-form').click();
    });
}
//#endregion

//#region function validation
const checkTagHtmlSingle = (input) => {
    if (!input || input.trim() === "") return false;
    const regex = /<[^>]+>/g;
    return regex.test(input);
};

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

//#region Date formatting helper functions
function formatTimeRangeForDisplay(tuNgay, denNgay) {
    if (!tuNgay) return '-';
    const fromDate = new Date(tuNgay);
    const toDate = denNgay ? new Date(denNgay) : null;
    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };
    const fromFormatted = formatDate(fromDate);
    if (toDate) {
        const toFormatted = formatDate(toDate);
        if (fromFormatted === toFormatted) return fromFormatted;
        return `${fromFormatted} - ${toFormatted}`;
    }
    return fromFormatted;
}
//#endregion Date formatting helper functions

async function initKyBaoCao() {
    const baseUrl = getRootLink();
    try {
        const res = await fetch(`${baseUrl}/api/RPT_KyBaoCaoApi/Gets`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (data && data.isSuccess && data.value) {
            $("#kyBaoCaoAdd").empty().append(`<option value="">Tất cả</option>`).attr("data-placeholder", "Chọn kỳ báo cáo");
            data.value.forEach(item => {
                $("#kyBaoCaoAdd").append(`<option value="${item.kyBaoCaoID}">${item.kyBaoCao}</option>`);
            });
        }
    } catch (err) { console.log('Lỗi khi tải kỳ báo cáo:', err.message); }
}

function initNamBaoCao() {
    const currentYear = new Date().getFullYear();
    const startYear = 2020;
    $("#namAdd").empty().append(`<option value="">-- Chọn năm --</option>`);
    if ($('#nam-search').length) {
        $("#nam-search").empty().append(`<option value="">Tất cả</option>`);
    }
    for (let y = currentYear; y >= startYear; y--) {
        const selected = (y === currentYear) ? 'selected' : '';
        $("#namAdd").append(`<option value="${y}" ${selected}>${y}</option>`);
        if ($('#nam-search').length) {
            $("#nam-search").append(`<option value="${y}">${y}</option>`);
        }
    }
}
