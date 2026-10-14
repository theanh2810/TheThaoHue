const baseUrl = getRootLink();

$(document).ready(function () {
    initSelect2();
    initDatePicker();

    (async function () {
        await Promise.all([
            initNgonNgu(),
            initTinhTrangPhiVatThe(),
            initLoaiHinhPhiVatThe()
        ]);
        initTable();

        // Initialize filters after data is loaded
        setTimeout(function() {
            initSelect2();
            initFilter_Option();
        }, 500);
    })();

    // Old button handlers removed - now using FilterAction_Post

    $("#formDelete").on("submit", function (e) {
        e.preventDefault();
        dataDeleteDiSanPhiVatThe();
    });

    // Lắng nghe event switch sang card view
    $(document).on('viewChanged:card', function() {
        loadViewData('the');
    });
    
    // Lắng nghe event switch sang list view
    $(document).on('viewChanged:list', function() {
        loadViewData('danhSach');
    });

    function initFilter_Option() {
        initCommonFilterPost({
            htmlFilterSort: `
                <li class="active" data-value="TenDiSan"><a class="option_filter">Tên di sản</a></li>
                <li data-value="LoaiHinh"><a class="option_filter">Loại hình</a></li>
                <li data-value="TinhTrang"><a class="option_filter">Tình trạng</a></li>
            `,
            filterInputs: [
                '#loai-hinh-phi-vat-the-search',
                '#tinh-trang-search',
                '#trang-thai-search',
                '#ngon-ngu-search'
            ],
            searchInput: '#tu-khoa-search',
            debounceTime: 1000,
            apiUrl: `/api/DiSanPhiVatTheApi/DanhSach`,
            buildFilterRequest: function() {
                var loaiHinh = $('#loai-hinh-phi-vat-the-search').val();
                var tinhTrang = $('#tinh-trang-search').val();
                var trangThai = $('#trang-thai-search').val();

                return {
                    tuKhoa: $('#tu-khoa-search').val() || null,
                    maNgonNgu: $('#ngon-ngu-search').val() || 'vi',
                    loaiHinhID: (loaiHinh == "-1" || loaiHinh == "" || !loaiHinh) ? null : parseInt(loaiHinh) || null,
                    tinhTrangID: (tinhTrang == "-1" || tinhTrang == "" || !tinhTrang) ? null : parseInt(tinhTrang) || null,
                    suDung: (trangThai == "-1" || trangThai == "" || !trangThai) ? null : (trangThai === "1" ? true : false)
                };
            },
            onFilterApplied: function(data) {
                // Xử lý response data
                data.value.forEach((item, index) => {
                    item.stt = index + 1;
                });
                if (data.isSuccess && data.value) {
                    $('#dataGrid').DataTable().clear().rows.add(data.value).draw();
                }
            },
            renderCardItem: function(item, index) {
                return renderCardItemHtml(item, index);
            },
            renderListItem: function(item, index) {
                return renderListItemHtml(item, index);
            },
            onCardRendered: function() {
                attachCardEventHandlers();
            },
            onListRendered: function() {
                attachListEventHandlers();
            }
        });
    }

    async function initTable() {
        const tableApi = {
            url: `${baseUrl}/api/DiSanPhiVatTheApi/DanhSach`,
            type: "POST",
            data: function (d) {
                var suDung = $('#trang-thai-search').val()
                var loaiHinh = $('#loai-hinh-phi-vat-the-search').val()
                var tinhTrang = $('#tinh-trang-search').val()
                return JSON.stringify({
                    tuKhoa: $('#tu-khoa-search').val() || null,
                    maNgonNgu: $('#ngon-ngu-search').val() || 'vi',
                    loaiHinhID: (loaiHinh == "-1" || loaiHinh == "" || !loaiHinh) ? null : parseInt(loaiHinh) || null,
                    tinhTrangID: (tinhTrang == "-1" || tinhTrang == "" || !tinhTrang) ? null : parseInt(tinhTrang) || null,
                    suDung: (suDung == "-1" || suDung == "" || !suDung) ? null : (suDung === "1" ? true : false)
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
                    return `<a href="/AdminTool/DiSanVanHoaPhiVatThe/Details?id=${row.diSanID}"><div class="group-info have-image" id=n-"${meta.row}">
                        <div class="have-image">
                            <img src="${row.anhDaiDien || '/assets/images/vector/no-image.png'}" alt="${row.tenDiSan || ''}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                        </div>
                        <div class="group-info">
                        <div class="info-main"><div>${row.tenDiSan || ''}</div></div>
                        <div class="info-sub">${row.maDinhDanh || ''}</div></div>
                    </div></a>`;
                }
            },
            {
                targets: 4,
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
                targets: 5,
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
            { "data": "tenDiSan", "width": "", "class": "left-align" },
            { "data": "tenLoaiHinh", "width": "220px", "class": "left-align" },
            { "data": "tenTinhTrang", "width": "220px", "class": "center-align" },
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

            let hef = `/Edit?id=${data.diSanID}`;
            window.location.href += hef;
        });
        $('#dataGrid tbody').on('click', '.delete-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGrid').DataTable().row(id).data();

            $('#idDelete').val(data.diSanID);
            $('#nameDelete').text(`${data.tenDiSan}`);

            $('#modalDelete').modal('show');
        });

        $('#dataGrid tbody').on('click', '.detail-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGrid').DataTable().row(id).data();

            console.log(data)

            // Thông tin cơ bản
            $("#anhDaiDienDetail").attr("src", data.anhDaiDien || "/images/no-image.png");
            $("#maDinhDanhDetail").text(data.maDinhDanh || "");
            $("#loaiHinhIDDetail").text(data.tenLoaiHinh || ""); // hiển thị tên loại hình
            $("#tinhTrangIDDetail").text(data.tenTinhTrang || ""); // hiển thị tên tình trạng
            $("#thuTuDetail").text(data.thuTu || "");
            $("#suDungDetail").text(data.suDung ? "Sử dụng" : "Không sử dụng");

            // Thông tin đa ngữ (hiển thị theo ngôn ngữ hiện tại)
            $("#tenDiSanDetail").text(data.tenDiSan || "");
            $("#congDongDetail").text(data.congDong || "");
            $("#tinhTrangDetail").text(data.tinhTrang || "");
            $("#moTaDetail").text(data.moTa || "");

            $('#modalDetail').modal('show');
        });

    }

    async function dataDeleteDiSanPhiVatThe() {
        let id = $('#idDelete').val();

        try {
            const res = await fetch(`/api/DiSanPhiVatTheApi/Xoa/${id}`, {
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
                $("#ngon-ngu-search").empty();
                $("#ngonNguAdd").empty();
                $("#ngon-ngu-hien-vat-search").empty();
                //$("#ngon-ngu-search").append(`<option value="">Tất cả</option>`);
                data.value.forEach(lang => {
                    $("#ngon-ngu-search").append(`<option value="${lang.maNgonNgu?.toLowerCase()}">${lang.tenNgonNgu}</option>`);
                    $("#ngonNguAdd").append(`<option value="${lang.maNgonNgu?.toLowerCase()}">${lang.tenNgonNgu}</option>`);
                    $("#ngon-ngu-hien-vat-search").append(`<option value="${lang.maNgonNgu?.toLowerCase()}">${lang.tenNgonNgu}</option>`);
                });
                $("#ngon-ngu-search").val('vi').trigger('change');
                $("#ngonNguAdd").val('vi').trigger('change');
                $("#ngon-ngu-hien-vat-search").val('vi').trigger('change');
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            showNotification(0, err.message)
        }
    };

    async function initLoaiHinhPhiVatThe() {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: 16,
                    tuKhoa: null
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value) {

                $("#loai-hinh-phi-vat-the-search").append(`<option value="">Chọn tổ chức</option><option value="-1">Tất cả</option>`);
                data.value.forEach(el => {
                    $("#loai-hinh-phi-vat-the-search").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
                });
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };

    async function initTinhTrangPhiVatThe() {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: 43,
                    tuKhoa: null
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value) {
                $("#tinh-trang-search").append(`<option value="">Chọn tổ chức</option><option value="-1">Tất cả</option>`);
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

    //#endregion HÀM LOAD DỮ LIỆU CHO CÁC COMBOBOX
})

//#region CARD VIEW - HELPER FUNCTIONS
/**
 * Render HTML cho 1 card item
 */
function renderCardItemHtml(item, index) {
    // Xử lý trạng thái
    const suDungClass = item.suDung ? 'green-text' : 'red-text';
    const suDungText = item.suDung ? 'Sử dụng' : 'Không sử dụng';
    
    // Xử lý chức năng
    let actionsHtml = '';
    if (permitedEdit) {
        actionsHtml += `<a href="/AdminTool/DiSanVanHoaPhiVatThe/Edit?id=${item.diSanID}" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa" style="color: #FFB900 !important;">
            <i class="hgi-icon hgi-edit"></i> Sửa
        </a>`;
    }
    if (permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-card-btn" data-id="${item.diSanID}" data-name="${item.tenDiSan}" title="Xóa">
            <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }
    
    return `
        <div class="card-item" data-id="${item.diSanID}">
            <div class="card-image">
                <img src="${item.anhDaiDien || '/assets/images/vector/no-image.png'}" 
                     alt="${item.tenDiSan || '-'}" 
                     onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                <div class="card-badge">
                    <span class="TrangThai ${suDungClass}">${suDungText}</span>
                </div>
            </div>
            <div class="card-body">
                <h5 class="card-title">
                    <a href="/AdminTool/DiSanVanHoaPhiVatThe/Details?id=${item.diSanID}" class="text-decoration-none">
                        ${item.tenDiSan || '-'}
                    </a>
                </h5>
                <div class="card-info">
                    <div class="info-row">
                        <span class="info-label">Mã định danh:</span>
                        <span class="info-value">${item.maDinhDanh || 'Chưa cập nhật'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Loại hình:</span>
                        <span class="info-value">${item.tenLoaiHinh || '-'}</span>
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
    const suDungText = item.suDung ? 'Sử dụng' : 'Không sử dụng';
    
    // Xử lý chức năng
    let actionsHtml = '';
    if (permitedEdit) {
        actionsHtml += `<a href="/AdminTool/DiSanVanHoaPhiVatThe/Edit?id=${item.diSanID}" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa" style="color: #FFB900 !important;">
            <i class="hgi-icon hgi-edit"></i> Sửa
        </a>`;
    }
    if (permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-list-btn" data-id="${item.diSanID}" data-name="${item.tenDiSan}" title="Xóa">
            <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }
    
    return `
        <div class="list-item" data-id="${item.diSanID}">
            <div class="list-item-image">
                <img src="${item.anhDaiDien || '/assets/images/vector/no-image.png'}" 
                     alt="${item.tenDiSan || '-'}" 
                     onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
            </div>
            <div class="list-item-content">
                <div class="list-item-header">
                    <h5 class="list-item-title">
                        <a href="/AdminTool/DiSanVanHoaPhiVatThe/Details?id=${item.diSanID}" class="text-decoration-none">
                            ${item.tenDiSan || '-'}
                        </a>
                    </h5>
                    <span class="TrangThai ${suDungClass}">${suDungText}</span>
                </div>
                <div class="list-item-body">
                    <div class="list-info-grid">
                        <div class="list-info-item">
                            <span class="list-info-label">Mã định danh:</span>
                            <span class="list-info-value">${item.maDinhDanh || 'Chưa cập nhật'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Loại hình:</span>
                            <span class="list-info-value">${item.tenLoaiHinh || '-'}</span>
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

