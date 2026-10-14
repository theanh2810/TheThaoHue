const baseUrl = getRootLink();
let currentFilterUrl = null;

$(document).ready(function () {
    initDatePicker();
    initToChuc_NoAll(96, "#don-vi-cong-tac-search", "Đơn vị công tác", "");
    initDanhMucChung_NoAll(5, "#gioi-tinh-search", "Giới tính");
    initNgonNgu("#ngon-ngu-search");
    initPhuongXa("#phuong-xa-search", "Phường xã")
    initMonTheThao("#mon-the-thao-search", "Môn thể thao")

    initTable();
    setTimeout(() => { initSelect2(); }, 500);
    initFilter_Option();

    $(document).on('viewChanged:card',  function () { initCardView(); });
    $(document).on('viewChanged:list',  function () { initListView(); });
    $(document).on('viewChanged:table', function () { initTableView(); });
});

function initTable() {
    const tableApi = {
        url: `${baseUrl}/api/DM_CaNhan_ChuyenGiaApi/Filter?MaNgonNgu=vi`,
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        dataSrc: function (data) {
            if (data && data.isSuccess && data.value && data.value.length > 0) {
                data.value.forEach((item, index) => { item.stt = index + 1; });
                return data.value;
            }
            return [];
        },
    };

    const tableDefs = [
        {
            targets: 1,
            render: function (data, type, row) {
                return `<a href="${baseUrl}/AdminTool/NhanSu/ChuyenGia/Details?id=${row.caNhanID}" class="text-primary text-decoration-none">
                    <div class="group-info have-image round-image">
                        <div class="have-image">
                            <img src="${row.anhChanDung || '/assets/images/vector/no-image.png'}" alt="${row.hoTen || ''}"
                                onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                        </div>
                        <div class="group-info">
                            <div class="info-main"><div>${row.hoTen || ''}</div></div>
                            <div class="info-sub">${row.maDinhDanh || ''}</div>
                        </div>
                    </div></a>`;
            }
        },
        {
            targets: 2,
            render: function (data, type, row) {
                return formatDateWithoutTime(row.ngaySinh);
            }
        },
        {
            targets: 7,
            render: function (data, type, row) {
                return `<a href="${baseUrl}/AdminTool/NhanSu/ChuyenGia/Details?id=${row.caNhanID}">${row.soLuongMon} môn</a>`;
            }
        },
        {
            targets: 8,
            render: function (data, type, row) {
                return row.trangThai
                    ? `<span class="TrangThai green-text">Duyệt</span>`
                    : `<span class="TrangThai red-text">Chưa duyệt</span>`;
            }
        },
        {
            targets: 9,
            render: function (data, type, row, meta) {
                let html = "";
                if (permitedEdit) {
                    html += `<a href="${baseUrl}/AdminTool/NhanSu/ChuyenGia/Edit?id=${row.caNhanID}"
                                data-toggle="tooltip" title="Chỉnh sửa" class="text-yellow me-2">
                                <i class="hgi-icon hgi-edit"></i>
                             </a>`;
                }
                if (permitedDelete) {
                    html += `<i data-toggle="tooltip" title="Xóa"
                                class="delete-command-btn text-red cursor-pointer" id="delete-${meta.row}">
                                <i class="hgi-icon hgi-delete"></i>
                             </i>`;
                }
                if (!permitedEdit && !permitedDelete) html = `<span class="text-muted">Chỉ xem</span>`;
                return html;
            }
        }
    ];

    const tableCols = [
        { "data": "stt",           "width": "40px",  "class": "left-align" },
        { "data": "",              "class": "left-align name-text" },
        { "data": "",              "width": "10%",   "class": "left-align" },
        { "data": "gioiTinh", "width": "120px", "class": "left-align" },
        { "data": "diaChi", "width": "250px", "class": "left-align" },
        { "data": "dienThoai", "width": "150px", "class": "center-align" },
        { "data": "listTenToChuc", "width": "20%",   "class": "left-align" },
        { "data": "",              "width": "160px", "class": "center-align name-text" },
        { "data": "",              "width": "120px", "class": "left-align" },
        { "data": "",              "width": "120px", "class": "center-align group-icon-action" }
    ];

    if (!permitedEdit && !permitedDelete) {
        tableCols.pop();
        tableDefs.pop();
    }

    initDataTableConfigNoSearch('dataGrid', tableApi, tableDefs, tableCols);

    $('#dataGrid tbody').on('click', '.delete-command-btn', function () {
        var id = $(this).attr("id").match(/\d+/)[0];
        var data = $('#dataGrid').DataTable().row(id).data();
        $('#idDelete').val(data.caNhanID);
        $('#nameDelete').text(data.hoTen);
        $('#modalDelete').modal('show');
    });

    $("#formDelete").on("submit", function (e) {
        e.preventDefault();
        const btn = $(this).find('button[type="submit"]');
        if (btn.prop('disabled')) return;
        btn.prop('disabled', true).text('Đang xóa...');
        dataDelete();
        setTimeout(() => btn.prop('disabled', false).text('Xóa'), 1000);
    });
}

function dataDelete() {
    let id = $('#idDelete').val();
    $.ajax({
        url: `${baseUrl}/api/DM_CaNhan_ChuyenGiaApi/Delete?caNhanID=${id}`,
        type: 'DELETE',
        contentType: 'application/json',
        success: function (data) {
            if (data && data.isSuccess) {
                showNotification(1, 'Xoá thành công');
                $('#modalDelete').modal('hide');
                $('#dataGrid').DataTable().ajax.reload();
            } else {
                showNotification(0, data.error);
            }
        },
        error: function () { showNotification(0, 'Có lỗi xảy ra, vui lòng thử lại sau'); }
    });
}

function initFilter_Option() {
    initCommonFilter({
        htmlFilterSort: `
            <li class="active" data-value="HoTen"><a class="option_filter">Tên chuyên gia</a></li>
            <li class="" data-value="ToChuc"><a class="option_filter">Tên đơn vị công tác</a></li>
            <li class="" data-value="GioiTinh"><a class="option_filter">Giới tính</a></li>
        `,
        filterInputs: ['#don-vi-cong-tac-search', '#gioi-tinh-search', '#trang-thai-search', '#ngon-ngu-search', '#phuong-xa-search','#mon-the-thao-search'],
        searchInput: '#tu-khoa-search',
        debounceTime: 1000,
        apiUrl: `${baseUrl}/api/DM_CaNhan_ChuyenGiaApi/Filter`,
        buildFilterParams: function () {
            let params = { MaNgonNgu: $('#ngon-ngu-search').val() || 'vi' };
            let tuKhoa = $('#tu-khoa-search').val();
            if (tuKhoa?.trim()) params.TuKhoa = tuKhoa;
            let toChuc = $('#don-vi-cong-tac-search').val();
            if (toChuc && toChuc !== '-1') params.ToChucID = toChuc;
            let gioiTinh = $('#gioi-tinh-search').val();
            if (gioiTinh && gioiTinh !== '-1') params.GioiTinhID = gioiTinh;
            let trangThai = $('#trang-thai-search').val();
            if (trangThai && trangThai !== '-1') {
                params.TrangThai = trangThai === '1' ? true : false;
            }
            //phường xã
            let phuongXa = $('#phuong-xa-search').val();
            if (phuongXa && phuongXa !== '-1' && phuongXa !== '') {
                params.PhuongXaID = phuongXa;
            }
            // môn thể thao
            let monTheThao = $('#mon-the-thao-search').val();
            if (monTheThao && monTheThao !== '-1' && monTheThao !== '') {
                params.MonTheThaoID = monTheThao;
            }
            return params;
        },
        onFilterApplied: function (urlFilter) {
            currentFilterUrl = urlFilter;
            if ($.fn.DataTable.isDataTable('#dataGrid')) {
                $('#dataGrid').DataTable().ajax.url(urlFilter).load();
            }
        },
        renderCardItem: function (item, index) { return renderCardItemHtml(item, index); },
        renderListItem: function (item, index) { return renderListItemHtml(item, index); },
        onCardRendered: function () { attachCardEventHandlers(); },
        onListRendered: function () { attachListEventHandlers(); }
    });
}

//#region CARD VIEW
function initCardView() { loadViewData('the'); }

function renderCardItemHtml(item, index) {
    const trangThaiClass = item.trangThai ? 'green-text' : 'red-text';
    const trangThaiText  = item.trangThai ? 'Duyệt' : 'Chưa duyệt';
    let actionsHtml = '';
    if (typeof permitedEdit !== 'undefined' && permitedEdit) {
        actionsHtml += `<a href="${baseUrl}/AdminTool/NhanSu/ChuyenGia/Edit?id=${item.caNhanID}"
            class="btn btn-sm btn-outline-primary" style="color:#FFB900!important;">
            <i class="hgi-icon hgi-edit"></i> Sửa</a>`;
    }
    if (typeof permitedDelete !== 'undefined' && permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-card-btn"
            data-id="${item.caNhanID}" data-name="${item.hoTen}">
            <i class="hgi-icon hgi-delete"></i> Xóa</button>`;
    }
    return `
        <div class="card-item" data-id="${item.caNhanID}">
            <div class="card-image">
                <img src="${item.anhChanDung || '/assets/images/vector/no-image.png'}"
                    alt="${item.hoTen || ''}"
                    onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                <div class="card-badge"><span class="TrangThai ${trangThaiClass}">${trangThaiText}</span></div>
            </div>
            <div class="card-body">
                <h5 class="card-title">
                    <a href="${baseUrl}/AdminTool/NhanSu/ChuyenGia/Details?id=${item.caNhanID}" class="text-decoration-none">${item.hoTen || '-'}</a>
                </h5>
                <div class="card-info">
                    <div class="info-row"><span class="info-label">Mã:</span><span class="info-value">${item.maDinhDanh || '-'}</span></div>
                    <div class="info-row"><span class="info-label">Sinh:</span><span class="info-value">${item.ngaySinh ? formatDateWithoutTime(item.ngaySinh) : '-'}</span></div>
                    <div class="info-row"><span class="info-label">Giới tính:</span><span class="info-value">${item.gioiTinh || '-'}</span></div>
                    <div class="info-row"><span class="info-label">Môn:</span><span class="info-value">${item.soLuongMon || '0'} môn</span></div>
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
}
//#endregion

//#region LIST VIEW
function initListView() { loadViewData('danhSach'); }

function renderListItemHtml(item, index) {
    const trangThaiClass = item.trangThai ? 'green-text' : 'red-text';
    const trangThaiText  = item.trangThai ? 'Duyệt' : 'Chưa duyệt';
    let actionsHtml = '';
    if (typeof permitedEdit !== 'undefined' && permitedEdit) {
        actionsHtml += `<a href="${baseUrl}/AdminTool/NhanSu/ChuyenGia/Edit?id=${item.caNhanID}"
            class="btn btn-sm btn-outline-primary" style="color:#FFB900!important;">
            <i class="hgi-icon hgi-edit"></i> Sửa</a>`;
    }
    if (typeof permitedDelete !== 'undefined' && permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-list-btn"
            data-id="${item.caNhanID}" data-name="${item.hoTen}">
            <i class="hgi-icon hgi-delete"></i> Xóa</button>`;
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
                        <a href="${baseUrl}/AdminTool/NhanSu/ChuyenGia/Details?id=${item.caNhanID}" class="text-decoration-none">${item.hoTen || '-'}</a>
                    </h5>
                    <span class="TrangThai ${trangThaiClass}">${trangThaiText}</span>
                </div>
                <div class="list-item-body">
                    <div class="list-info-grid">
                        <div class="list-info-item"><span class="list-info-label">Mã:</span><span class="list-info-value">${item.maDinhDanh || '-'}</span></div>
                        <div class="list-info-item"><span class="list-info-label">Sinh:</span><span class="list-info-value">${item.ngaySinh ? formatDateWithoutTime(item.ngaySinh) : '-'}</span></div>
                        <div class="list-info-item"><span class="list-info-label">Giới tính:</span><span class="list-info-value">${item.gioiTinh || '-'}</span></div>
                        <div class="list-info-item"><span class="list-info-label">Môn:</span><span class="list-info-value">${item.soLuongMon || '0'} môn</span></div>
                    </div>
                </div>
            </div>
            <div class="list-item-actions">${actionsHtml}</div>
        </div>`;
}

function initTableView() {
    if (!$.fn.DataTable.isDataTable('#dataGrid')) {
        initTable();
    } else {
        $('#dataGrid').DataTable().ajax.url(currentFilterUrl).load();
    }
}

function attachListEventHandlers() {
    $('.delete-list-btn').off('click').on('click', function () {
        $('#idDelete').val($(this).data('id'));
        $('#nameDelete').text($(this).data('name'));
        $('#modalDelete').modal('show');
    });
}
//#endregion
