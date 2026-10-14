const baseUrl = getRootLink();

$(document).ready(function () {
    initDatePicker();

    (async function () {
        await Promise.all([
            initNgonNgu(),
            initSelectDanhMuc(81, "loai-hinh-search"),
            initSelectDanhMuc(83, "the-loai-search"),
            initSelectDanhMuc(82, "phuong-tien-search"),
            initSelectDanhMuc(80, "phan-khuc-search"),
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
        $('#the-loai-search').val('-1').trigger('change');
        $('#to-chuc-search').val('-1').trigger('change');
        $('#phuong-tien-search').val('-1').trigger('change');
        $('#su-dung-search').val('-1').trigger('change');
        $('#phan-khuc-search').val('-1').trigger('change');
        $('#ngon-ngu-search').val('vi').trigger('change');
        initTable()
    }); */


    $("#formDelete").on("submit", function (e) {
        e.preventDefault();
        dataDelete();
    });

    async function initTable() {
        const tableApi = {
            url: `${baseUrl}/api/TourDuLichApi/DanhSach`,
            type: "POST",
            data: function (d) {
                var suDung = $('#su-dung-search').val();
                var loaiHinh = $('#loai-hinh-search').val();
                var theLoai = $('#the-loai-search').val();
                var toChuc = $('#to-chuc-search').val();
                var phuongTien = $('#phuong-tien-search').val();
                var phanKhuc = $('#phan-khuc-search').val();

                return JSON.stringify({
                    tuKhoa: $('#tu-khoa-search').val() || null,
                    maNgonNgu: $('#ngon-ngu-search').val() || 'vi',
                    loaiHinhID: (loaiHinh == "-1" || loaiHinh == "" || !loaiHinh) ? null : parseInt(loaiHinh) || null,
                    theLoaiID: (theLoai == "-1" || theLoai == "" || !theLoai) ? null : parseInt(theLoai) || null,
                    toChucID: (toChuc == "-1" || toChuc == "" || !toChuc) ? null : toChuc,
                    phuongTienID: (phuongTien == "-1" || phuongTien == "" || !phuongTien) ? null : parseInt(phuongTien) || null,
                    phanKhucID: (phanKhuc == "-1" || phanKhuc == "" || !phanKhuc) ? null : parseInt(phanKhuc) || null,
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
                    return `<div class="group-info have-image" id=n-"${meta.row}">
                        <div class="have-image">
                            <img src="${row.anhDaiDien || '/assets/images/vector/no-image.png'}" alt="${row.tenTour || ''}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                        </div>
                        <div class="group-info">
                            <div class="info-main"><a disabled href="/AdminTool/TourDuLich/Details?id=${row.tourID}" class="detail-link">${row.tenTour || ''}</a></div>
                            <div class="info-sub">${row.maDinhDanh || ''}</div>
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
            { "data": "tenTour", "width": "", "class": "left-align" },
            { "data": "tenTheLoai", "width": "220px", "class": "left-align" },
            { "data": "tenPhanKhuc", "width": "220px", "class": "left-align" },
            { "data": "tenLoaiHinh", "width": "220px", "class": "left-align" },
            { "data": "thuTu", "width": "120px", "class": "center-align" },
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

            let hef = `/Edit?id=${data.tourID}`;
            window.location.href += hef;
        });
        $('#dataGrid tbody').on('click', '.delete-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGrid').DataTable().row(id).data();

            $('#idDelete').val(data.tourID);
            $('#nameDelete').text(`${data.tenTour}`);

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
            const res = await fetch(`/api/TourDuLichApi/Xoa/${id}`, {
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

    async function initSelectDanhMuc(loaiDanhMucID, selectId) {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    loaiDanhMucID: loaiDanhMucID,
                    tuKhoa: null
                })
            });

            if (!res.ok) {
                throw new Error(await res.text());
            }

            const data = await res.json();

            if (data && data.isSuccess && data.value) {
                const $select = $(`#${selectId}`);
                $select.empty();
                $select.append(`<option value="">Chọn</option><option value="-1">Tất cả</option>`);

                data.value.forEach(el => {
                    $select.append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
                });
            } else {
                showNotification(0, data.error || "Không có dữ liệu");
            }
        } catch (err) {
            console.error(`Lỗi khi tải dữ liệu cho #${selectId}:`, err.message);
        }
    }

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
    //            $("#tinh-trang-search").append(`<option value="">Chọn</option><option value="-1">Tất cả</option>`);
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
            <li class="active" data-value="Ten"><a class="option_filter">Tên tour</a></li>
            <li class="" data-value="LoaiHinh"><a class="option_filter">Loại hình</a></li>
            <li class="" data-value="TheLoai"><a class="option_filter">Thể loại</a></li>
            <li class="" data-value="PhanKhuc"><a class="option_filter">Phân khúc</a></li>
            <li class="" data-value="NgayCapNhat"><a class="option_filter">Ngày cập nhật</a></li>
        `,
        
        // Các filter inputs (select) - không bao gồm search box và date inputs
        filterInputs: [
            '#loai-hinh-search',
            '#the-loai-search',
            '#phan-khuc-search',
            '#su-dung-search',
            '#ngon-ngu-search'
        ],

        // Ô search từ khóa
        searchInput: '#tu-khoa-search',
        
        // Thời gian debounce (ms)
        debounceTime: 1000,
        
        // URL API Filter
        apiUrl: `/api/TourDuLichApi/DanhSach`,
        
        // Function build request cho API
        buildFilterRequest: function() {
            var suDung = $('#su-dung-search').val();
            var loaiHinh = $('#loai-hinh-search').val();
            var phanKhuc = $('#phan-khuc-search').val();
            var theLoai = $('#the-loai-search').val();
            
            return {
                tuKhoa: $('#tu-khoa-search').val() || null,
                maNgonNgu: $('#ngon-ngu-search').val() || 'vi',
                loaiHinhID: (loaiHinh == "-1" || loaiHinh == "" || !loaiHinh) ? null : parseInt(loaiHinh) || null,
                theLoaiID: (theLoai == "-1" || theLoai == "" || !theLoai) ? null : parseInt(theLoai) || null,
                phanKhucID: (phanKhuc == "-1" || phanKhuc == "" || !phanKhuc) ? null : parseInt(phanKhuc) || null,
                suDung: (suDung == "-1" || suDung == "" || !suDung) ? null : (suDung === "1" ? true : false),
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
    const trangThaiClass = item.suDung ? 'green-text' : 'red-text';
    const trangThaiText = item.suDung ? 'Sử dụng' : 'Không sử dụng';
    
    // Xử lý chức năng
    let actionsHtml = '';
    if (permitedEdit) {
        actionsHtml += `<a href="${baseUrl}/AdminTool/TourDuLich/Edit?id=${item.tourID}" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa" style="color: #FFB900 !important;">
            <i class="hgi-icon hgi-edit"></i> Sửa 
        </a>`;
    }
    if (permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-card-btn" data-id="${item.tourID}" data-name="${item.tenTour}" title="Xóa">
            <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }
    
    return `
        <div class="card-item" data-id="${item.tourID}">
            <div class="card-image">
                <img src="${item.anhDaiDien || '/assets/images/vector/no-image.png'}" 
                     alt="${item.tenTour || '-'}" 
                     onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                <div class="card-badge">
                    <span class="TrangThai ${trangThaiClass}">${trangThaiText}</span>
                </div>
            </div>
            <div class="card-body">
                <h5 class="card-title">
                    <a href="#" class="text-decoration-none" style="cursor: default;">
                        ${item.tenTour || '-'}
                    </a>
                </h5>
                <div class="card-info">
                    <div class="info-row">
                        <span class="info-label">Mã định danh:</span>
                        <span class="info-value">${item.maDinhDanh || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Thể loại:</span>
                        <span class="info-value">${item.tenTheLoai || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Loại hình:</span>
                        <span class="info-value">${item.tenLoaiHinh || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Phân khúc:</span>
                        <span class="info-value">${item.tenPhanKhuc || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Thứ tự:</span>
                        <span class="info-value">${item.thuTu || '-'}</span>
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
        const tourID = $(this).data('id');
        const tenTour = $(this).data('name');
        
        $('#idDelete').val(tourID);
        $('#nameDelete').text(tenTour);
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
    const trangThaiClass = item.suDung ? 'green-text' : 'red-text';
    const trangThaiText = item.suDung ? 'Sử dụng' : 'Không sử dụng';
    
    // Xử lý chức năng
    let actionsHtml = '';
    if (permitedEdit) {
        actionsHtml += `<a href="${baseUrl}/AdminTool/TourDuLich/Edit?id=${item.tourID}" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa" style="color: #FFB900 !important;">
            <i class="hgi-icon hgi-edit"></i> Sửa
        </a>`;
    }
    if (permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-list-btn" data-id="${item.tourID}" data-name="${item.tenTour}" title="Xóa">
                <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }
    
    return `
        <div class="list-item" data-id="${item.tourID}">
            <div class="list-item-image">
                <img src="${item.anhDaiDien || '/assets/images/vector/no-image.png'}" 
                     alt="${item.tenTour || '-'}" 
                     onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
            </div>
            <div class="list-item-content">
                <div class="list-item-header">
                    <h5 class="list-item-title">
                        <a href="#" class="text-decoration-none" style="cursor: default;">
                            ${item.tenTour || '-'}
                        </a>
                    </h5>
                    <span class="TrangThai ${trangThaiClass}">${trangThaiText}</span>
                </div>
                <div class="list-item-body">
                    <div class="list-info-grid">
                        <div class="list-info-item">
                            <span class="list-info-label">Mã định danh:</span>
                            <span class="list-info-value">${item.maDinhDanh || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Thể loại:</span>
                            <span class="list-info-value">${item.tenTheLoai || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Loại hình:</span>
                            <span class="list-info-value">${item.tenLoaiHinh || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Phân khúc:</span>
                            <span class="list-info-value">${item.tenPhanKhuc || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Thứ tự:</span>
                            <span class="list-info-value">${item.thuTu || '-'}</span>
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
        const tourID = $(this).data('id');
        const tenTour = $(this).data('name');
        
        $('#idDelete').val(tourID);
        $('#nameDelete').text(tenTour);
        $('#modalDelete').modal('show');
    });
}
//#endregion

