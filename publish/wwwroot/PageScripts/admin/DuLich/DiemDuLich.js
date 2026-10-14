const baseUrl = getRootLink();

$(document).ready(function () {
    initDatePicker();

    (async function () {
        await Promise.all([
            initNgonNgu(),
            initLoaiHinhKhuDuLich(),
            initCapXepHang(),
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

    /* $('#tim-kiem').on('click', async function () {
        initTable()
    });

    $('#tat-ca').on('click', async function () {
        $('#tu-khoa-search').val('');
        $('#loai-hinh-search').val('-1').trigger('change');
        $('#trang-thai-search').val('-1').trigger('change');
        $('#to-chuc-search').val('-1').trigger('change');
        $('#cap-search').val('-1').trigger('change');
        $('#ngon-ngu-search').val('vi').trigger('change');
        initTable()
    }); */


    $("#formDelete").on("submit", function (e) {
        e.preventDefault();
        dataDelete();
    });
    async function initTable() {
        const tableApi = {
            url: `${baseUrl}/api/KhuDuLichApi/DanhSach`,
            type: "POST",
            data: function (d) {
                var suDung = $('#trang-thai-search').val()
                var loaiHinh = $('#loai-hinh-search').val()
                var toChuc = $('#to-chuc-search').val()
                var cap = $('#cap-search').val()
                return JSON.stringify({
                    diemDuLich: true, // Điểm du lịch
                    tuKhoa: $('#tu-khoa-search').val() || null,
                    maNgonNgu: $('#ngon-ngu-search').val() || 'vi',
                    loaiHinhID: (loaiHinh == "-1" || loaiHinh == "" || !loaiHinh) ? null : parseInt(loaiHinh) || null,
                    toChucID: (toChuc == "-1" || toChuc == "" || !toChuc) ? null : toChuc,
                    capID: (cap == "-1" || cap == "" || !cap) ? null : parseInt(cap) || null,
                    trangThai: (suDung == "-1" || suDung == "" || !suDung) ? null : (suDung === "1" ? true : false),
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
                        <div class="have-image">
                            <img src="${row.hinhAnh || '/assets/images/vector/no-image.png'}" alt="${row.tenKhuDuLich || ''}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                        </div>
                        <div class="group-info">
                            <div class="info-main"><a href="/AdminTool/DiemDuLich/Details?id=${row.khuDuLichID}" class="detail-link">${row.tenKhuDuLich || ''}</a></div>
                            <div class="info-sub">${row.diaChi || ''}</div>
                        </div>
                    </div>`;
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
            { "data": "tenKhuDuLich", "width": "", "class": "left-align" },
            { "data": "tenLoaiHinh", "width": "220px", "class": "left-align" },
            { "data": "tenCap", "width": "220px", "class": "left-align" },
            { "data": "tenToChuc", "width": "220px", "class": "left-align" },
            { "data": "namCongNhan", "width": "150px", "class": "center-align" },
            { "data": "trangThai", "width": "120px", "class": "center-align" },
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

            let hef = `/Edit?id=${data.khuDuLichID}`;
            window.location.href += hef;
        });
        $('#dataGrid tbody').on('click', '.delete-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGrid').DataTable().row(id).data();

            $('#idDelete').val(data.khuDuLichID);
            $('#nameDelete').text(`${data.tenKhuDuLich}`);

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
            const res = await fetch(`/api/KhuDuLichApi/Xoa/${id}`, {
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

    async function initLoaiHinhKhuDuLich() {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: 61,
                    tuKhoa: null
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value) {

                $("#loai-hinh-search").append(`<option value="">Chọn loại hình</option><option value="-1">Tất cả</option>`);
                data.value.forEach(el => {
                    $("#loai-hinh-search").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
                });
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
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

                $("#cap-search").append(`<option value="">Chọn cấp</option><option value="-1">Tất cả</option>`);
                data.value.forEach(el => {
                    $("#cap-search").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
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

    //async function initTinhTrangPhiVatThe() {
    //    try {
    //        const res = await fetch('/api/DanhMucChungApi/DanhSach', {
    //            method: 'POST',
    //            headers: {
    //                'Content-Type': 'application/json'
    //            },
    //            body: JSON.stringify({
    //                loaiDanhMucID: 43,
    //                tuKhoa: null
    //            })
    //        })

    //        if (!res.ok) {
    //            var errText = await res.text();
    //            throw new Error(errText);
    //        }
    //        data = await res.json();

    //        if (data && data.isSuccess && data.value) {
    //            $("#tinh-trang-search").append(`<option value="-1">Tất cả</option>`);
    //            data.value.forEach(el => {
    //                $("#tinh-trang-search").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
    //            });
    //        } else {
    //            showNotification(0, data.error)
    //        }
    //    }
    //    catch (err) {
    //        console.log(err.message)
    //    }
    //};

    //#endregion HÀM LOAD DỮ LIỆU CHO CÁC COMBOBOX
})

function initFilter_Option() {
    // Khởi tạo filter chung với config
    initCommonFilterPost({
        // HTML cho các option sắp xếp
        htmlFilterSort: `
            <li class="active" data-value="Ten"><a class="option_filter">Tên địa điểm</a></li>
            <li class="" data-value="LoaiHinh"><a class="option_filter">Loại hình du lịch</a></li>
            <li class="" data-value="Cap"><a class="option_filter">Cấp xếp hạng</a></li>
            <li class="" data-value="ToChuc"><a class="option_filter">Tổ chức du lịch</a></li>
            <li class="" data-value="NgayCapNhat"><a class="option_filter">Ngày cập nhật</a></li>
        `,
        
        // Các filter inputs (select) - không bao gồm search box và date inputs
        filterInputs: [
            '#loai-hinh-search',
            '#cap-search',
            '#to-chuc-search',
            '#trang-thai-search',
            '#ngon-ngu-search'
        ],

        // Ô search từ khóa
        searchInput: '#tu-khoa-search',
        
        // Thời gian debounce (ms)
        debounceTime: 1000,
        
        // URL API Filter
        apiUrl: `/api/KhuDuLichApi/DanhSach`,
        
        // Function build request cho API
        buildFilterRequest: function() {
            var trangThai = $('#trang-thai-search').val();
            var loaiHinh = $('#loai-hinh-search').val();
            var toChuc = $('#to-chuc-search').val();
            var cap = $('#cap-search').val();
            
            return {
                diemDuLich: true, // Khu du lịch
                tuKhoa: $('#tu-khoa-search').val() || null,
                maNgonNgu: $('#ngon-ngu-search').val() || 'vi',
                loaiHinhID: (loaiHinh == "-1" || loaiHinh == "" || !loaiHinh) ? null : parseInt(loaiHinh) || null,
                capID: (cap == "-1" || cap == "" || !cap) ? null : parseInt(cap) || null,
                toChucID: (toChuc == "-1" || toChuc == "" || !toChuc) ? null : toChuc,
                trangThai: (trangThai == "-1" || trangThai == "" || !trangThai) ? null : (trangThai === "1" ? true : false),
                diaDiemID: null
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
        
        // Render cho Card View
        renderCardItem: function(item, index) {
            return renderCardItemHtml(item, index);
        },
        
        // Render cho List View
        renderListItem: function(item, index) {
            return renderListItemHtml(item, index);
        },
        
        // Callback sau khi render xong cards
        onCardRendered: function() {
            attachCardEventHandlers();
        },
        
        // Callback sau khi render xong list
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
    const trangThaiClass = item.trangThai ? 'green-text' : 'red-text';
    const trangThaiText = item.trangThai ? 'Sử dụng' : 'Không sử dụng';
    
    // Xử lý chức năng
    let actionsHtml = '';
    if (permitedEdit) {
        actionsHtml += `<a href="${baseUrl}/AdminTool/DiemDuLich/Edit?id=${item.khuDuLichID}" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa" style="color: #FFB900 !important;">
            <i class="hgi-icon hgi-edit"></i> Sửa 
        </a>`;
    }
    if (permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-card-btn" data-id="${item.khuDuLichID}" data-name="${item.tenKhuDuLich}" title="Xóa">
            <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }
    
    return `
        <div class="card-item" data-id="${item.khuDuLichID}">
            <div class="card-image">
                <img src="${item.hinhAnh || '/assets/images/vector/no-image.png'}" 
                     alt="${item.tenKhuDuLich || '-'}" 
                     onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                <div class="card-badge">
                    <span class="TrangThai ${trangThaiClass}">${trangThaiText}</span>
                </div>
            </div>
            <div class="card-body">
                <h5 class="card-title">
                    <a href="${baseUrl}/AdminTool/DiemDuLich/Details?id=${item.khuDuLichID}" class="text-decoration-none">
                        ${item.tenKhuDuLich || '-'}
                    </a>
                </h5>
                <div class="card-info">
                    <div class="info-row">
                        <span class="info-label">Địa chỉ:</span>
                        <span class="info-value">${item.diaChi || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Loại hình:</span>
                        <span class="info-value">${item.tenLoaiHinh || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Cấp:</span>
                        <span class="info-value">${item.tenCap || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Tổ chức:</span>
                        <span class="info-value">${item.tenToChuc || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Năm công nhận:</span>
                        <span class="info-value">${item.namCongNhan || '-'}</span>
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
        const khuDuLichID = $(this).data('id');
        const tenKhuDuLich = $(this).data('name');
        
        $('#idDelete').val(khuDuLichID);
        $('#nameDelete').text(tenKhuDuLich);
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
    const trangThaiClass = item.trangThai ? 'green-text' : 'red-text';
    const trangThaiText = item.trangThai ? 'Sử dụng' : 'Không sử dụng';
    
    // Xử lý chức năng
    let actionsHtml = '';
    if (permitedEdit) {
        actionsHtml += `<a href="${baseUrl}/AdminTool/DiemDuLich/Edit?id=${item.khuDuLichID}" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa" style="color: #FFB900 !important;">
            <i class="hgi-icon hgi-edit"></i> Sửa
        </a>`;
    }
    if (permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-list-btn" data-id="${item.khuDuLichID}" data-name="${item.tenKhuDuLich}" title="Xóa">
                <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }
    
    return `
        <div class="list-item" data-id="${item.khuDuLichID}">
            <div class="list-item-image">
                <img src="${item.hinhAnh || '/assets/images/vector/no-image.png'}" 
                     alt="${item.tenKhuDuLich || '-'}" 
                     onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
            </div>
            <div class="list-item-content">
                <div class="list-item-header">
                    <h5 class="list-item-title">
                        <a href="${baseUrl}/AdminTool/DiemDuLich/Details?id=${item.khuDuLichID}" class="text-decoration-none">
                            ${item.tenKhuDuLich || '-'}
                        </a>
                    </h5>
                    <span class="TrangThai ${trangThaiClass}">${trangThaiText}</span>
                </div>
                <div class="list-item-body">
                    <div class="list-info-grid">
                        <div class="list-info-item">
                            <span class="list-info-label">Địa chỉ:</span>
                            <span class="list-info-value">${item.diaChi || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Loại hình:</span>
                            <span class="list-info-value">${item.tenLoaiHinh || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Cấp:</span>
                            <span class="list-info-value">${item.tenCap || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Tổ chức:</span>
                            <span class="list-info-value">${item.tenToChuc || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Năm công nhận:</span>
                            <span class="list-info-value">${item.namCongNhan || '-'}</span>
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
        const khuDuLichID = $(this).data('id');
        const tenKhuDuLich = $(this).data('name');
        
        $('#idDelete').val(khuDuLichID);
        $('#nameDelete').text(tenKhuDuLich);
        $('#modalDelete').modal('show');
    });
}
//#endregion

