const baseUrl = getRootLink();

$(document).ready(function () {
    initDatePicker();

    (async function () {
        await Promise.all([
            initNgonNgu(),
            initLinhVucXucTien(),
            initToChuc(),
            initDoiTuongHuongToi(),
            initPhuongThucTruyenThong(),
            initTrangThaiXucTien(),
            initHinhThucXucTien(),
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

    /* $('#tim-kiem').on('click', async function () {
        initTable()
    });

    $('#tat-ca').on('click', async function () {
        $('#tu-khoa-search').val('');
        $('#linh-vuc-search').val('-1').trigger('change');
        $('#trang-thai-search').val('-1').trigger('change');
        $('#to-chuc-search').val('-1').trigger('change');
        $('#doi-tuong-search').val('-1').trigger('change');
        $('#hinh-thuc-search').val('-1').trigger('change');
        $('#truyen-thong-search').val('-1').trigger('change');
        $('#ngon-ngu-search').val('vi').trigger('change');
        $('#su-dung-search').val('-1').trigger('change');
        initTable()
    }); */

    $("#formDelete").on("submit", function (e) {
        e.preventDefault();
        dataDelete();
    });

    async function initTable() {
        const tableApi = {
            url: `${baseUrl}/api/ThongTinXucTienApi/DanhSach`,
            type: "POST",
            data: function (d) {
                var suDung = $('#su-dung-search').val()
                var linhVuc = $('#linh-vuc-search').val()
                var toChuc = $('#to-chuc-search').val()
                var doiTuong = $('#doi-tuong-search').val()
                var hinhThuc = $('#hinh-thuc-search').val()
                var truyenThong = $('#truyen-thong-search').val()
                var trangThai = $('#trang-thai-search').val()

                return JSON.stringify({
                    tuKhoa: $('#tu-khoa-search').val() || null,
                    maNgonNgu: $('#ngon-ngu-search').val() || 'vi',
                    linhVucID: (linhVuc == "-1" || linhVuc == "" || !linhVuc) ? null : parseInt(linhVuc) || null,
                    doiTuongID: (doiTuong == "-1" || doiTuong == "" || !doiTuong) ? null : parseInt(doiTuong) || null,
                    hinhThucID: (hinhThuc == "-1" || hinhThuc == "" || !hinhThuc) ? null : parseInt(hinhThuc) || null,
                    truyenThongID: (truyenThong == "-1" || truyenThong == "" || !truyenThong) ? null : parseInt(truyenThong) || null,
                    trangThaiID: (trangThai == "-1" || trangThai == "" || !trangThai) ? null : parseInt(trangThai) || null,
                    suDung: (suDung == "-1" || suDung == "" || !suDung) ? null : (suDung === "1" ? true : false),
                    toChucID: toChuc == "-1" ? null : toChuc,
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
                    return `<div class="group-info have-image" id=n-"${meta.row}">
                        <div class="group-info">
                            <div class="info-main"><a disabled href="/AdminTool/ThongTinXucTien/Details?id=${row.xucTienID}" class="detail-link">${row.tieuDe || ''}</a></div>
                        </div>
                    </div>`;
                }
            },
            {
                targets: 7,
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
                targets: 8,
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
            { "data": "tieuDe", "width": "", "class": "left-align" },
            { "data": "tenLinhVuc", "width": "220px", "class": "left-align" },
            { "data": "tenDoiTuong", "width": "220px", "class": "left-align" },
            { "data": "tenToChuc", "width": "220px", "class": "left-align" },
            { "data": "tenTruyenThong", "width": "220px", "class": "left-align" },
            { "data": "tenTrangThai", "width": "120px", "class": "left-align" },
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

            let hef = `/Edit?id=${data.xucTienID}`;
            window.location.href += hef;
        });
        $('#dataGrid tbody').on('click', '.delete-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGrid').DataTable().row(id).data();

            $('#idDelete').val(data.xucTienID);
            $('#nameDelete').text(`${data.tieuDe}`);

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
            const res = await fetch(`/api/ThongTinXucTienApi/Xoa/${id}`, {
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
                // Reload data cho cả table và card/list view
                if (typeof loadViewData === 'function') {
                    loadViewData();
                }
                $('#dataGrid').DataTable().ajax.reload();
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

    async function initLinhVucXucTien() {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: 76,
                    tuKhoa: null
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value) {

                $("#linh-vuc-search").append(`<option value="">Chọn</option><option value="-1">Tất cả</option>`);
                data.value.forEach(el => {
                    $("#linh-vuc-search").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
                });
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };

    async function initDoiTuongHuongToi() {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: 73,
                    tuKhoa: null
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value) {

                $("#doi-tuong-search").append(`<option value="">Chọn</option><option value="-1">Tất cả</option>`);
                data.value.forEach(el => {
                    $("#doi-tuong-search").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
                });
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };

    async function initHinhThucXucTien() {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: 74,
                    tuKhoa: null
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value) {

                $("#hinh-thuc-search").append(`<option value="">Chọn</option><option value="-1">Tất cả</option>`);
                data.value.forEach(el => {
                    $("#hinh-thuc-search").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
                });
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };

    async function initPhuongThucTruyenThong() {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: 75,
                    tuKhoa: null
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value) {

                $("#truyen-thong-search").append(`<option value="">Chọn</option><option value="-1">Tất cả</option>`);
                data.value.forEach(el => {
                    $("#truyen-thong-search").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
                });
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };

    async function initTrangThaiXucTien() {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: 77,
                    tuKhoa: null
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value) {

                $("#trang-thai-search").append(`<option value="">Chọn</option><option value="-1">Tất cả</option>`);
                data.value.forEach(el => {
                    $("#trang-thai-search").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
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
                    loaiToChucID: 310,
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value) {

                $("#to-chuc-search").append(`<option value="">Chọn</option><option value="-1">Tất cả</option>`);
                data.value.forEach(el => {
                    $("#to-chuc-search").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
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
            <li class="active" data-value="TieuDe"><a class="option_filter">Tiêu đề</a></li>
            <li class="" data-value="LinhVuc"><a class="option_filter">Lĩnh vực</a></li>
            <li class="" data-value="DoiTuong"><a class="option_filter">Đối tượng hướng tới</a></li>
            <li class="" data-value="TruyenThong"><a class="option_filter">Phương thức truyền thông</a></li>
            <li class="" data-value="TrangThai"><a class="option_filter">Trạng thái</a></li>
            <li class="" data-value="NgayCapNhat"><a class="option_filter">Ngày cập nhật</a></li>
        `,
        
        // Các filter inputs (select) - không bao gồm search box và date inputs
        filterInputs: [
            '#linh-vuc-search',
            '#doi-tuong-search',
            '#hinh-thuc-search',
            '#truyen-thong-search',
            '#trang-thai-search',
            '#su-dung-search',
            '#ngon-ngu-search'
        ],

        // Ô search từ khóa
        searchInput: '#tu-khoa-search',
        
        // Thời gian debounce (ms)
        debounceTime: 1000,
        
        // URL API Filter
        apiUrl: `/api/ThongTinXucTienApi/DanhSach`,
        
        // Function build request cho API
        buildFilterRequest: function() {
            var suDung = $('#su-dung-search').val();
            var linhVuc = $('#linh-vuc-search').val();
            var doiTuong = $('#doi-tuong-search').val();
            var hinhThuc = $('#hinh-thuc-search').val();
            var truyenThong = $('#truyen-thong-search').val();
            var trangThai = $('#trang-thai-search').val();
            
            return {
                tuKhoa: $('#tu-khoa-search').val() || null,
                maNgonNgu: $('#ngon-ngu-search').val() || 'vi',
                linhVucID: (linhVuc == "-1" || linhVuc == "" || !linhVuc) ? null : parseInt(linhVuc) || null,
                doiTuongID: (doiTuong == "-1" || doiTuong == "" || !doiTuong) ? null : parseInt(doiTuong) || null,
                hinhThucID: (hinhThuc == "-1" || hinhThuc == "" || !hinhThuc) ? null : parseInt(hinhThuc) || null,
                truyenThongID: (truyenThong == "-1" || truyenThong == "" || !truyenThong) ? null : parseInt(truyenThong) || null,
                trangThaiID: (trangThai == "-1" || trangThai == "" || !trangThai) ? null : parseInt(trangThai) || null,
                suDung: (suDung == "-1" || suDung == "" || !suDung) ? null : (suDung === "1" ? true : false),
                toChucID: null
                // type và typeSort sẽ được thêm tự động bởi FilterAction_Post.js
            };
        },
        
        // Callback sau khi apply filter
        onFilterApplied: function(data) {
            // Xử lý response data
            if (data.isSuccess && data.value) {
                // Thêm STT cho từng item
                data.value.forEach((item, index) => {
                    item.stt = index + 1;
                });
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
    // Xử lý trạng thái hiển thị
    const suDungClass = item.suDung ? 'green-text' : 'red-text';
    const suDungText = item.suDung ? 'Hiển thị' : 'Không hiển thị';
    
    // Xử lý chức năng
    let actionsHtml = '';
    if (permitedEdit) {
        actionsHtml += `<a href="${baseUrl}/AdminTool/ThongTinXucTien/Edit?id=${item.xucTienID}" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa" style="color: #FFB900 !important;">
            <i class="hgi-icon hgi-edit"></i> Sửa
        </a>`;
    }
    if (permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-card-btn" data-id="${item.xucTienID}" data-name="${item.tieuDe}" title="Xóa">
            <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }
    
    return `
        <div class="card-item" data-id="${item.xucTienID}">
            <div class="card-body">
                <h5 class="card-title">
                    <a href="${baseUrl}/AdminTool/ThongTinXucTien/Details?id=${item.xucTienID}" class="text-decoration-none">
                        ${item.tieuDe || '-'}
                    </a>
                </h5>
                <div class="card-info">
                    <div class="info-row">
                        <span class="info-label">Lĩnh vực:</span>
                        <span class="info-value">${item.tenLinhVuc || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Đối tượng:</span>
                        <span class="info-value">${item.tenDoiTuong || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Truyền thông:</span>
                        <span class="info-value">${item.tenTruyenThong || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Trạng thái:</span>
                        <span class="info-value">${item.tenTrangThai || '-'}</span>
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
    // Xử lý trạng thái hiển thị
    const suDungClass = item.suDung ? 'green-text' : 'red-text';
    const suDungText = item.suDung ? 'Hiển thị' : 'Không hiển thị';
    
    // Xử lý chức năng
    let actionsHtml = '';
    if (permitedEdit) {
        actionsHtml += `<a href="${baseUrl}/AdminTool/ThongTinXucTien/Edit?id=${item.xucTienID}" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa" style="color: #FFB900 !important;">
            <i class="hgi-icon hgi-edit"></i> Sửa
        </a>`;
    }
    if (permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-list-btn" data-id="${item.xucTienID}" data-name="${item.tieuDe}" title="Xóa">
            <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }
    
    return `
        <div class="list-item" data-id="${item.xucTienID}">
            <div class="list-item-content">
                <div class="list-item-header">
                    <h5 class="list-item-title">
                        <a href="${baseUrl}/AdminTool/ThongTinXucTien/Details?id=${item.xucTienID}" class="text-decoration-none">
                            ${item.tieuDe || '-'}
                        </a>
                    </h5>
                    <span class="TrangThai ${suDungClass}">${suDungText}</span>
                </div>
                <div class="list-item-body">
                    <div class="list-info-grid">
                        <div class="list-info-item">
                            <span class="list-info-label">Lĩnh vực:</span>
                            <span class="list-info-value">${item.tenLinhVuc || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Đối tượng:</span>
                            <span class="list-info-value">${item.tenDoiTuong || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Truyền thông:</span>
                            <span class="list-info-value">${item.tenTruyenThong || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Trạng thái:</span>
                            <span class="list-info-value">${item.tenTrangThai || '-'}</span>
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


