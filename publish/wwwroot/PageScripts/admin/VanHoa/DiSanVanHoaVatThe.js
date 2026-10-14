const baseUrl = getRootLink();


$(document).ready(function () {
    initSelect2();
    initDatePicker();
    let translations = [];

    $(function () {
        // Khi load lại trang, nếu có hash thì mở đúng tab
        var hash = window.location.hash;
        if (hash) {
            $('.nav-tabs a[href="' + hash + '"]').tab('show');
        }

        $('.nav-tabs a').on('shown.bs.tab', function (e) {
            var target = $(e.target).attr('href');
            history.replaceState(null, null, target);
        });
    });

    (async function () {
        await Promise.all([
            initNgonNgu(),
            initCapXepHang(),
            initLoaiHinhDiTich(),
            initDonViQuanLy(),
            initBaoTang(),
            initChatLieu(),
            initLoaiHienVat(),
            initTinhTrang()
        ]);
        initTable();
        initTableHienVat();

        // Initialize filters after data is loaded
        setTimeout(function() {
            initSelect2();
            
            // Only init filter for active tab initially
            const activeTab = $('#diTichTab .nav-link.active').attr('id');
            if (activeTab === 'di-tich-tab') {
                initFilter_DiTich();
            } else if (activeTab === 'hien-vat-tab') {
                initFilter_HienVat();
            }
            
            // Add view change event listeners
            initViewEventListeners();
            
            // Add tab change event listeners to init filters when tab is shown
            $('#diTichTab a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
                const targetTab = $(e.target).attr('href');
                if (targetTab === '#di-tich') {
                    // Init DiTich filter if not already initialized
                    if (!$('#cardViewContainer').hasClass('filter-initialized')) {
                        initFilter_DiTich();
                        $('#cardViewContainer').addClass('filter-initialized');
                    } else {
                        // Update filter config to DiTich
                        initFilter_DiTich();
                    }
                } else if (targetTab === '#hien-vat') {
                    // Init HienVat filter if not already initialized
                    if (!$('#cardViewContainerHienVat').hasClass('filter-initialized')) {
                        initFilter_HienVat();
                        $('#cardViewContainerHienVat').addClass('filter-initialized');
                    } else {
                        // Update filter config to HienVat
                        initFilter_HienVat();
                    }
                }
            });
        }, 500);    })();

    // Old button handlers removed - now using FilterAction_Post

    $("#formDelete").on("submit", function (e) {
        e.preventDefault();
        let type = $('#idTypeDelete').val();
        if (type == 1)
            dataDeleteDiTich();
        else if (type == 2) {
            dataDeleteHienVat();
        }
    });

    function initFilter_DiTich() {
        initCommonFilterPost({
            htmlFilterSort: `
                <li class="active" data-value="Ten"><a class="option_filter">Tên di tích</a></li>
                <li data-value="LoaiHinh"><a class="option_filter">Loại hình</a></li>
                <li data-value="CapXepHang"><a class="option_filter">Cấp xếp hạng</a></li>
                <li data-value="DonViQuanLy"><a class="option_filter">Đơn vị quản lý</a></li>
                <li data-value="TinhTrang"><a class="option_filter">Tình trạng</a></li>
            `,
            filterInputs: [
                '#loai-hinh-di-tich-search',
                '#don-vi-quan-ly-search',
                '#cap-xep-hang-search',
                '#tinh-trang-search',
                '#trang-thai-search',
                '#ngon-ngu-search'
            ],
            searchInput: '#tu-khoa-search',
            debounceTime: 1000,
            apiUrl: `/api/DiTichApi/DanhSach`,
            sortListSelector: '#sortList_option',
            filterNangCaoSelector: '.Filter_nangCao',
            filterSapXepSelector: '.Filter_sapXep',
            filterGiaoDienSelector: '.Filter_giaoDien',
            filterCollapsedNangCao: '#Filter_collapsed_nangCao',
            filterCollapsedSapXep: '#Filter_collapsed_sapXep',
            filterCollapsedBang: '#Filter_collapsed_Bang',
            tableViewContainer: '#tableViewContainer',
            cardViewContainer: '#cardViewContainer',
            listViewContainer: '#listViewContainer',
            cardViewGrid: '#cardViewGrid',
            listViewItems: '#listViewItems',
            cardViewPagination: '#cardViewPagination',
            listViewPagination: '#listViewPagination',
            buildFilterRequest: function() {
                var loaiHinh = $('#loai-hinh-di-tich-search').val();
                var donViQuanLy = $('#don-vi-quan-ly-search').val();
                var capXepHang = $('#cap-xep-hang-search').val();
                var tinhTrang = $('#tinh-trang-search').val();
                var trangThai = $('#trang-thai-search').val();

                return {
                    tuKhoa: $('#tu-khoa-search').val() || null,
                    maNgonNgu: $('#ngon-ngu-search').val() || 'vi',
                    loaiHinhID: (loaiHinh == "-1" || loaiHinh == "" || !loaiHinh) ? null : parseInt(loaiHinh) || null,
                    toChucQuanLyID: (donViQuanLy == "-1" || donViQuanLy == "" || !donViQuanLy) ? null : donViQuanLy || null,
                    capXepHangID: (capXepHang == "-1" || capXepHang == "" || !capXepHang) ? null : parseInt(capXepHang) || null,
                    trangThaiID: (tinhTrang == "-1" || tinhTrang == "" || !tinhTrang) ? null : parseInt(tinhTrang) || null,
                    suDung: (trangThai == "-1" || trangThai == "" || !trangThai) ? null : (trangThai === "1" ? true : false)
                };
            },
            onFilterApplied: function(data) {
                if (data && data.isSuccess && data.value) {
                    data.value.forEach((item, index) => {
                        item.stt = index + 1;
                    });
                    $('#dataGrid').DataTable().clear().rows.add(data.value).draw();
                }
            },
            
            // Render function cho Card view DiTich
            renderCardItem: function(item, index) {
                return renderCardItemDiTich(item, index);
            },
            
            // Render function cho List view DiTich
            renderListItem: function(item, index) {
                return renderListItemDiTich(item, index);
            },
            
            // Callback sau khi render card view
            onCardRendered: function() {
                attachCardEventHandlersDiTich();
            },
            
            // Callback sau khi render list view
            onListRendered: function() {
                attachListEventHandlersDiTich();
            }
        });
    }

    function initFilter_HienVat() {
        initCommonFilterPost({
            htmlFilterSort: `
                <li class="active" data-value="Ten"><a class="option_filter">Tên hiện vật</a></li>
                <li data-value="Loai"><a class="option_filter">Loại hiện vật</a></li>
                <li data-value="ChatLieu"><a class="option_filter">Chất liệu</a></li>
                <li data-value="BaoTang"><a class="option_filter">Nơi lưu giữ</a></li>
                <li data-value="TinhTrang"><a class="option_filter">Tình trạng</a></li>
            `,
            filterInputs: [
                '#chat-lieu-hien-vat-search',
                '#bao-tang-hien-vat-search',
                '#phuong-thuc-hien-vat-search',
                '#loai-hien-vat-search',
                '#tinh-trang-hien-vat-search',
                '#ngon-ngu-hien-vat-search'
            ],
            searchInput: '#tu-khoa-hien-vat-search',
            debounceTime: 1000,
            apiUrl: `/api/HienVatApi/DanhSach`,
            sortListSelector: '#sortList_option_hienVat',
            filterNangCaoSelector: '.Filter_nangCao_hienVat',
            filterSapXepSelector: '.Filter_sapXep_hienVat',
            filterGiaoDienSelector: '.Filter_giaoDien_hienVat',
            filterCollapsedNangCao: '#Filter_collapsed_nangCao_HienVat',
            filterCollapsedSapXep: '#Filter_collapsed_sapXep_hienVat',
            filterCollapsedBang: '#Filter_collapsed_Bang_hienVat',
            tableViewContainer: '#tableViewContainerHienVat',
            cardViewContainer: '#cardViewContainerHienVat',
            listViewContainer: '#listViewContainerHienVat',
            cardViewGrid: '#cardViewGridHienVat',
            listViewItems: '#listViewItemsHienVat',
            cardViewPagination: '#cardViewPaginationHienVat',
            listViewPagination: '#listViewPaginationHienVat',
            buildFilterRequest: function() {
                var chatLieu = $('#chat-lieu-hien-vat-search').val();
                var baoTang = $('#bao-tang-hien-vat-search').val();
                var phuongThuc = $('#phuong-thuc-hien-vat-search').val();
                var loaiHienVat = $('#loai-hien-vat-search').val();
                var tinhTrang = $('#tinh-trang-hien-vat-search').val();
                var trangThai = $('#trang-thai-hien-vat-search').val();

                return {
                    tuKhoa: $('#tu-khoa-hien-vat-search').val()?.trim() || null,
                    maNgonNgu: $('#ngon-ngu-hien-vat-search').val() || 'vi',
                    chatLieuID: (chatLieu == "-1" || chatLieu == "" || !chatLieu) ? null : parseInt(chatLieu) || null,
                    baoTangID: (baoTang == "-1" || baoTang == "" || !baoTang) ? null : baoTang || null,
                    phuongThucTangMuaID: (phuongThuc == "-1" || phuongThuc == "" || !phuongThuc) ? null : parseInt(phuongThuc) || null,
                    loaiHienVatID: (loaiHienVat == "-1" || loaiHienVat == "" || !loaiHienVat) ? null : parseInt(loaiHienVat) || null,
                    tinhTrangID: (tinhTrang == "-1" || tinhTrang == "" || !tinhTrang) ? null : parseInt(tinhTrang) || null,
                    suDung: (trangThai == "-1" || trangThai == "" || !trangThai) ? null : (trangThai === "1" ? true : false)
                };
            },
            onFilterApplied: function(data) {
                if (data && data.isSuccess && data.value) {
                    data.value.forEach((item, index) => {
                        item.stt = index + 1;
                    });
                    $('#dataGridHienVat').DataTable().clear().rows.add(data.value).draw();
                }
            },
            
            // Render function cho Card view HienVat
            renderCardItem: function(item, index) {
                return renderCardItemHienVat(item, index);
            },
            
            // Render function cho List view HienVat
            renderListItem: function(item, index) {
                return renderListItemHienVat(item, index);
            },
            
            // Callback sau khi render card view
            onCardRendered: function() {
                attachCardEventHandlersHienVat();
            },
            
            // Callback sau khi render list view
            onListRendered: function() {
                attachListEventHandlersHienVat();
            }
        });
    }

    async function initTable() {
        const tableApi = {
            url: `${baseUrl}/api/DiTichApi/DanhSach`,
            type: "POST",
            data: function (d) {
                var suDung = $('#trang-thai-search').val()
                var loaiHinh = $('#loai-hinh-di-tich-search').val()
                var donViQuanLy = $('#don-vi-quan-ly-search').val()
                var capXepHang = $('#cap-xep-hang-search').val()
                var tinhTrang = $('#tinh-trang-search').val()
                return JSON.stringify({
                    tuKhoa: $('#tu-khoa-search').val() || null,
                    maNgonNgu: $('#ngon-ngu-search').val() || 'vi',
                    loaiHinhID: (loaiHinh == "-1" || loaiHinh == "" || !loaiHinh) ? null : parseInt(loaiHinh) || null,
                    toChucQuanLyID: (donViQuanLy == "-1" || donViQuanLy == "" || !donViQuanLy) ? null : parseInt(donViQuanLy) || null,
                    capXepHangID: (capXepHang == "-1" || capXepHang == "" || !capXepHang) ? null : parseInt(capXepHang) || null,
                    trangThaiID: (tinhTrang == "-1" || tinhTrang == "" || !tinhTrang) ? null : parseInt(tinhTrang) || null,
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
                    return `<a href="/AdminTool/DiSanVanHoaVatThe/DiTich/Details?id=${row.diTichID}"><div class="group-info have-image detail-command-btn" id=n-"${meta.row}">
                        <div class="have-image">
                            <img src="${row.anhDaiDien || '/assets/images/vector/no-image.png'}" alt="${row.tenDiTich || ''}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                        </div>
                        <div class="group-info">
                        <div class="info-main"><div>${row.tenDiTich || ''}</div></div>
                        <div class="info-sub">${row.maDinhDanh || ''}</div></div>
                    </div></a>`;
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
            { "data": "tenDiTich", "width": "", "class": "left-align" },
            { "data": "tenCapXepHang", "width": "220px", "class": "left-align" },
            { "data": "tenToChucQuanLy", "width": "220px", "class": "center-align" },
            { "data": "tenLoaiHinh", "width": "120px", "class": "center-align" },
            { "data": "tenTrangThai", "width": "120px", "class": "center-align" },
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

            let hef = `/AdminTool/DiSanVanHoaVatThe/DiTich/Edit?id=${data.diTichID}`;
            window.location.href = hef;
        });
        $('#dataGrid tbody').on('click', '.delete-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGrid').DataTable().row(id).data();

            $('#idDelete').val(data.diTichID);
            $('#idTypeDelete').val(1);
            $('#nameDelete').text(`${data.tenDiTich}`);

            $('#modalDelete').modal('show');
        });

        $('#dataGrid tbody').on('click', '.detail-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGrid').DataTable().row(id).data();

            $('#linhVucChuyenSauDetail').text(data.tenLinhVucChuyenSau || "");
            $('#tanSuatDetail').text(data.tenTanSuat || "");
            $('#trangThaiDetail').text(data.trangThai == true ? "Đã phát hành" : "Chưa phát hành");

            $('#ngonNguDetail').text(data.tenNgonNgu || "");
            $('#tenAnPhamDetail').text(data.tenAnPham || "");
            $('#doiTuongDocGiaDetail').text(data.doiTuongDocGia || "");

            // Thông tin audit
            $('#ngayTaoDetail').text(formatDateTime(data.ngayCapNhat));
            $('#nguoiTaoDetail').text(data.tenNguoiCapNhat || "");
            $('#ngayCapNhatDetail').text(formatDateTime(data.ngayHieuChinh));
            $('#nguoiCapNhatDetail').text(data.tenNguoiHieuChinh || "");

            $('#modalDetail').modal('show');
        });

    }

    async function dataDeleteDiTich() {
        let id = $('#idDelete').val();

        try {
            const res = await fetch(`/api/DiTichApi/Xoa/${id}`, {
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
                reloadCurrentViewDiTich();
            } else {
                console.log(data.error)
            }

        }
        catch (err) {
            showNotification(0, err.message)
        }
    }

    async function initTableHienVat() {
        const tableApi = {
            url: `${baseUrl}/api/HienVatApi/DanhSach`,
            type: "POST",
            data: function (d) {
                var chatLieu = $('#chat-lieu-hien-vat-search').val();
                var baoTang = $('#bao-tang-hien-vat-search').val();
                var phuongThuc = $('#phuong-thuc-hien-vat-search').val();
                var loaiHienVat = $('#loai-hien-vat-search').val();
                var tinhTrang = $('#tinh-trang-hien-vat-search').val();
                var trangThai = $('#trang-thai-hien-vat-search').val();

                return JSON.stringify({
                    tuKhoa: $('#tu-khoa-hien-vat-search').val()?.trim() || null,
                    maNgonNgu: $('#ngon-ngu-hien-vat-search').val() || 'vi',
                    chatLieuID: (chatLieu == "-1" || chatLieu == "" || !chatLieu) ? null : parseInt(chatLieu) || null,
                    baoTangID: (baoTang == "-1" || baoTang == "" || !baoTang) ? null : parseInt(baoTang) || null,
                    phuongThucTangMuaID: (phuongThuc == "-1" || phuongThuc == "" || !phuongThuc) ? null : parseInt(phuongThuc) || null,
                    loaiHienVatID: (loaiHienVat == "-1" || loaiHienVat == "" || !loaiHienVat) ? null : parseInt(loaiHienVat) || null,
                    tinhTrangID: (tinhTrang == "-1" || tinhTrang == "" || !tinhTrang) ? null : parseInt(tinhTrang) || null,
                    suDung: (trangThai == "-1" || trangThai == "" || !trangThai) ? null : (trangThai === "1" ? true : false)

                })
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
                targets: 1, // Cột tên di sản hiện vật
                render: function (data, type, row, meta) {
                    return `<a href="/AdminTool/DiSanVanHoaVatThe/HienVat/Details?id=${row.hienVatID}"><div class="group-info have-image">
                        <div class="have-image">
                            <img style="object-fit:contain;" src="${row.anhDaiDien || '/assets/images/vector/no-image.png'}" alt="${row.tenHienVat || ''}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                        </div>
                        <div class="group-info">
                        <div class="info-main"><div>${row.tenHienVat || ''}</div></div>
                        <div class="info-sub">${row.maHienVat || ''}</div></div>
                    </div></a>`;
                }
            },
            {
                targets: 4,
                render: function (data, type, row, meta) {
                    if (data == 1) {
                        return `Mua`;
                    } else if (data == 2) {
                        return `Hiến tặng`;
                    }
                    return ``;
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
            { "data": "tenHienVat", "width": "25%", "class": "left-align" },
            { "data": "tenLoaiHienVat", "width": "120px", "class": "left-align" },
            { "data": "tenChatLieu", "width": "120px", "class": "left-align" },
            { "data": "phuongThucTangMuaID", "width": "120px", "class": "center-align" },
            { "data": "tenBaoTang", "width": "120px", "class": "center-align" },
            { "data": "tenTinhTrang", "width": "120px", "class": "center-align" },
            { "data": "suDung", "width": "120px", "class": "center-align" },
            { "data": "", "width": "120px", "class": "center-align group-icon-action" },
        ];

        if (!permitedEdit && !permitedDelete) {
            tableCols.pop();
            tableDefs.pop();
        }

        initDataTableConfigNoSearch('dataGridHienVat', tableApi, tableDefs, tableCols);

        $('#dataGridHienVat tbody').on('click', '.edit-command-btn', async function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGridHienVat').DataTable().row(id).data();

            let hef = `/AdminTool/DiSanVanHoaVatThe/HienVat/Edit?id=${data.hienVatID}`;
            window.location.href = hef;
        });
        $('#dataGridHienVat tbody').on('click', '.delete-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGridHienVat').DataTable().row(id).data();

            $('#idDelete').val(data.hienVatID);
            $('#idTypeDelete').val(2);
            $('#nameDelete').text(`${data.tenHienVat}`);

            $('#modalDelete').modal('show');
        });

        //$('#dataGrid tbody').on('click', '.detail-command-btn', function () {
        //    var id = $(this).attr("ID").match(/\d+/)[0];
        //    var data = $('#dataGrid').DataTable().row(id).data();

        //    $('#linhVucChuyenSauDetail').text(data.tenLinhVucChuyenSau || "");
        //    $('#tanSuatDetail').text(data.tenTanSuat || "");
        //    //$('#thuTuDetail').text(data.thuTu);
        //    $('#trangThaiDetail').text(data.trangThai == true ? "Đã phát hành" : "Chưa phát hành");

        //    $('#ngonNguDetail').text(data.tenNgonNgu || "");
        //    $('#tenAnPhamDetail').text(data.tenAnPham || "");
        //    $('#doiTuongDocGiaDetail').text(data.doiTuongDocGia || "");

        //    // Thông tin audit
        //    $('#ngayTaoDetail').text(formatDateTime(data.ngayCapNhat));
        //    $('#nguoiTaoDetail').text(data.tenNguoiCapNhat || "");
        //    $('#ngayCapNhatDetail').text(formatDateTime(data.ngayHieuChinh));
        //    $('#nguoiCapNhatDetail').text(data.tenNguoiHieuChinh || "");

        //    $('#modalDetail').modal('show');
        //});

    }

    async function dataDeleteHienVat() {
        let id = $('#idDelete').val();

        try {
            const res = await fetch(`/api/HienVatApi/Xoa/${id}`, {
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
                reloadCurrentViewHienVat();
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

    async function initLoaiHinhDiTich() {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: 18,
                    tuKhoa: null
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value) {
                $("#loai-hinh-di-tich-search").empty();

                $("#loai-hinh-di-tich-search").append(`<option value="">Chọn tổ chức</option><option value="-1">Tất cả</option>`);
                data.value.forEach(el => {
                    $("#loai-hinh-di-tich-search").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
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
                $("#cap-xep-hang-search").append(`<option value="">Chọn tổ chức</option><option value="-1">Tất cả</option>`);
                data.value.forEach(el => {
                    $("#cap-xep-hang-search").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
                });
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };

    async function initDonViQuanLy() {
        try {
            const res = await fetch('/api/ToChucApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiToChucID: 122
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();


            if (data && data.isSuccess && data.value) {
                $("#don-vi-quan-ly-search").empty();
                $("#don-vi-quan-ly-search").append(`<option value="">Chọn tổ chức</option><option value="-1">Tất cả<option>`);
                data.value.forEach(el => {
                    $("#don-vi-quan-ly-search").append(`<option value="${el.toChucID}">${el.tenToChuc}</option>`);
                });
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };

    async function initChatLieu() {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: 35,
                    tuKhoa: null
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value) {
                $("#chat-lieu-hien-vat-search").append(`<option value="">Chọn chất liệu</option><option value="-1">Tất cả</option>`);

                data.value.forEach(el => {
                    $("#chat-lieu-hien-vat-search").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
                });
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };

    async function initBaoTang() {
        try {
            const res = await fetch('/api/ToChucApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiToChucID: 95
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            $("#bao-tang-hien-vat-search").append(`<option value="">Chọn tổ chức</option><option value="-1">Tất cả</option>`);
            if (data && data.isSuccess && data.value) {
                data.value.forEach(el => {
                    $("#bao-tang-hien-vat-search").append(`<option value="${el.toChucID}">${el.tenToChuc}</option>`);
                });
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };

    async function initLoaiHienVat() {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: 45,
                    tuKhoa: null
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value) {
                $("#loai-hien-vat-search").empty();

                $("#loai-hien-vat-search").append(`<option value="">Chọn tổ chức</option><option value="-1">Tất cả</option>`);
                data.value.forEach(el => {
                    $("#loai-hien-vat-search").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
                });
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };

    //Dùng cho cả di tích và hiện vật
    async function initTinhTrang() {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: 87,
                    tuKhoa: null
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value) {
                $("#tinh-trang-hien-vat-search").empty();
                $("#tinh-trang-search").empty(); // di tich

                $("#tinh-trang-hien-vat-search").append(`<option value="">Chọn tình trạng</option><option value="-1">Tất cả</option>`);
                $("#tinh-trang-search").append(`<option value="">Chọn tình trạng</option><option value="-1">Tất cả</option>`);
                data.value.forEach(el => {
                    $("#tinh-trang-hien-vat-search").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
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
    //async function initLinhVuc() {
    //    try {
    //        const res = await fetch(`/api/LinhVucApi/Gets`, {
    //            method: 'Get'
    //        })
    //        if (!res.ok) {
    //            var errText = await res.text();
    //            throw new Error(errText);
    //        }
    //        var data = await res.json()

    //        for (let i = 0; i < data.value.length; i++) {
    //            $('#linh-vuc-hien-vat-search').append(`<option value="${data.value[i].linhVucID}">${data.value[i].ten}</option>`)
    //        }

    //        return data
    //    }
    //    catch (err) {
    //        showNotification(0, err.message)
    //    }
    //}
//#endregion

//#region VIEW EVENT LISTENERS
function initViewEventListeners() {
    // Event listeners cho DiTich và HienVat
    $(document).on('viewChanged:card', function() {
        const activeTab = $('#diTichTab .nav-link.active').attr('id');
        if (activeTab === 'di-tich-tab') {
            initCardViewDiTich();
        } else if (activeTab === 'hien-vat-tab') {
            initCardViewHienVat();
        }
    });
    
    $(document).on('viewChanged:list', function() {
        const activeTab = $('#diTichTab .nav-link.active').attr('id');
        if (activeTab === 'di-tich-tab') {
            initListViewDiTich();
        } else if (activeTab === 'hien-vat-tab') {
            initListViewHienVat();
        }
    });
}
//#endregion

//#region DI TICH CARD/LIST VIEW FUNCTIONS
function initCardViewDiTich() {
    // FilterAction_Post.js sẽ tự động gọi loadViewData
    loadViewDataDiTich('the');
}

function initListViewDiTich() {
    // FilterAction_Post.js sẽ tự động gọi loadViewData
    loadViewDataDiTich('danhSach');
}

function loadViewDataDiTich(viewType) {
    // Sử dụng FilterAction_Post.js để load data
    loadViewData(viewType, null, false);
}

function renderCardItemDiTich(item, index) {
   
    // Xử lý trạng thái
    const trangThaiClass = item.suDung ? 'green-text' : 'red-text';
    const trangThaiText = item.suDung ? 'Hoạt động' : 'Không hoạt động';
    
    // Xử lý chức năng
    let actionsHtml = '';
    if (permitedEdit) {
        actionsHtml += `<a href="${baseUrl}/AdminTool/DiSanVanHoaVatThe/DiTich/Edit?id=${item.diTichID}" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa" style="color: #FFB900 !important;">
            <i class="hgi-icon hgi-edit"></i> Sửa 
        </a>`;
    }
    if (permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-card-btn-ditich" data-id="${item.diTichID}" data-name="${item.tenDiTich}" title="Xóa">
            <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }
    
    return `
        <div class="card-item" data-id="${item.diTichID}">
            <div class="card-image">
                <img src="${item.anhDaiDien || '/assets/images/vector/no-image.png'}" 
                        alt="${item.tenDiTich || ''}" 
                        onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                <div class="card-badge">
                    <span class="TrangThai ${item.suDung ? 'green-text' : 'red-text'}">${trangThaiText}</span>
                </div>
            </div>
            <div class="card-body">
                <h5 class="card-title">
                    <a href="${baseUrl}/AdminTool/DiSanVanHoaVatThe/DiTich/Details?id=${item.diTichID}" class="text-decoration-none">
                        ${item.tenDiTich || '-'}
                    </a>
                </h5>
                <div class="card-info">
                    <div class="info-row">
                        <span class="info-label">Cấp xếp hạng:</span>
                        <span class="info-value">${item.tenCapXepHang || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Đơn vị quản lý:</span>
                        <span class="info-value">${item.tenToChucQuanLy || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Loại hình:</span>
                        <span class="info-value">${item.tenLoaiHinh || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Tình trạng:</span>
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

function renderListItemDiTich(item, index) {
    // Xử lý trạng thái
    const trangThaiClass = item.suDung ? 'green-text' : 'red-text';
    const trangThaiText = item.suDung ? 'Hoạt động' : 'Không hoạt động';
    
    // Xử lý chức năng
    let actionsHtml = '';
    if (permitedEdit) {
        actionsHtml += `<a href="${baseUrl}/AdminTool/DiSanVanHoaVatThe/DiTich/Edit?id=${item.diTichID}" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa" style="color: #FFB900 !important;">
            <i class="hgi-icon hgi-edit"></i> Sửa
        </a>`;
    }
    if (permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-list-btn-ditich" data-id="${item.diTichID}" data-name="${item.tenDiTich}" title="Xóa">
            <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }
    
    return `
        <div class="list-item" data-id="${item.diTichID}">
            <div class="list-item-image">
                <img src="${item.anhDaiDien || '/assets/images/vector/no-image.png'}" 
                    alt="${item.tenDiTich || ''}" 
                    onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
            </div>
            <div class="list-item-content">
                <div class="list-item-header">
                    <h5 class="list-item-title">
                        <a href="${baseUrl}/AdminTool/DiSanVanHoaVatThe/DiTich/Details?id=${item.diTichID}" class="text-decoration-none">
                            ${item.tenDiTich || '-'}
                        </a>
                    </h5>
                    <span class="TrangThai ${trangThaiClass}">${trangThaiText}</span>
                </div>
                <div class="list-item-body">
                    <div class="list-info-grid">
                        <div class="list-info-item">
                            <span class="list-info-label">Cấp xếp hạng:</span>
                            <span class="list-info-value">${item.tenCapXepHang || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Đơn vị quản lý:</span>
                            <span class="list-info-value">${item.tenToChucQuanLy || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Loại hình:</span>
                            <span class="list-info-value">${item.tenLoaiHinh || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Tình trạng:</span>
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

function attachCardEventHandlersDiTich() {
    $('.delete-card-btn-ditich').off('click').on('click', function() {
        const id = $(this).data('id');
        const name = $(this).data('name');
        
        $('#idDelete').val(id);
        $('#idTypeDelete').val(1);
        $('#nameDelete').text(name);
        $('#modalDelete').modal('show');
    });
}

function attachListEventHandlersDiTich() {
    $('.delete-list-btn-ditich').off('click').on('click', function() {
        const id = $(this).data('id');
        const name = $(this).data('name');
        
        $('#idDelete').val(id);
        $('#idTypeDelete').val(1);
        $('#nameDelete').text(name);
        $('#modalDelete').modal('show');
    });
}

function reloadCurrentViewDiTich() {
    const config = window._filterConfigPost;
    if (!config) return;
    
    const currentView = getCurrentViewType(config);
    
    if (currentView === 'bangBieu') {
        $('#dataGrid').DataTable().ajax.reload();
    } else if (currentView === 'the') {
        loadViewDataDiTich('the');
    } else if (currentView === 'danhSach') {
        loadViewDataDiTich('danhSach');
    }
}
//#endregion

//#region HIEN VAT CARD/LIST VIEW FUNCTIONS
function initCardViewHienVat() {
    // FilterAction_Post.js sẽ tự động gọi loadViewData
    loadViewDataHienVat('the');
}

function initListViewHienVat() {
    // FilterAction_Post.js sẽ tự động gọi loadViewData
    loadViewDataHienVat('danhSach');
}

function loadViewDataHienVat(viewType) {
    // Sử dụng FilterAction_Post.js để load data
    loadViewData(viewType, null, false);
}

function renderCardItemHienVat(item, index) {
    // Xử lý phương thức tặng/mua
    let phuongThucText = '';
    if (item.phuongThucTangMuaID === 1) {
        phuongThucText = 'Mua';
    } else if (item.phuongThucTangMuaID === 2) {
        phuongThucText = 'Hiến tặng';
    }
    
    // Xử lý trạng thái
    const trangThaiClass = item.suDung ? 'green-text' : 'red-text';
    const trangThaiText = item.suDung ? 'Sử dụng' : 'Không sử dụng';
    
    // Xử lý chức năng
    let actionsHtml = '';
    if (permitedEdit) {
        actionsHtml += `<a href="${baseUrl}/AdminTool/DiSanVanHoaVatThe/HienVat/Edit?id=${item.hienVatID}" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa" style="color: #FFB900 !important;">
            <i class="hgi-icon hgi-edit"></i> Sửa 
        </a>`;
    }
    if (permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-card-btn-hienvat" data-id="${item.hienVatID}" data-name="${item.tenHienVat}" title="Xóa">
            <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }
    
    return `
        <div class="card-item" data-id="${item.hienVatID}">
            <div class="card-image">
                <img src="${item.anhDaiDien || '/assets/images/vector/no-image.png'}" 
                        alt="${item.tenHienVat || ''}" 
                        onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" 
                        style="object-fit:contain;" />
                <div class="card-badge">
                    <span class="TrangThai ${item.suDung ? 'green-text' : 'red-text'}">${trangThaiText}</span>
                </div>
            </div>
            <div class="card-body">
                <h5 class="card-title">
                    <a href="${baseUrl}/AdminTool/DiSanVanHoaVatThe/HienVat/Details?id=${item.hienVatID}" class="text-decoration-none">
                        ${item.tenHienVat || '-'}
                    </a>
                </h5>
                <div class="card-info">
                    <div class="info-row">
                        <span class="info-label">Loại hiện vật:</span>
                        <span class="info-value">${item.tenLoaiHienVat || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Chất liệu:</span>
                        <span class="info-value">${item.tenChatLieu || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Phương thức:</span>
                        <span class="info-value">${phuongThucText || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Nơi lưu giữ:</span>
                        <span class="info-value">${item.tenBaoTang || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Số lượng:</span>
                        <span class="info-value">${item.soLuong || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Tình trạng:</span>
                        <span class="info-value">${item.tenTinhTrang || '-'}</span>
                    </div>
                </div>
            </div>
            <div class="card-footer">
                ${actionsHtml}
            </div>
        </div>
    `;
}

function renderListItemHienVat(item, index) {
    // Xử lý phương thức tặng/mua
    let phuongThucText = '';
    if (item.phuongThucTangMuaID === 1) {
        phuongThucText = 'Mua';
    } else if (item.phuongThucTangMuaID === 2) {
        phuongThucText = 'Hiến tặng';
    }
   
    // Xử lý trạng thái
    const trangThaiClass = item.suDung ? 'green-text' : 'red-text';
    const trangThaiText = item.suDung ? 'Sử dụng' : 'Không sử dụng';
    
    // Xử lý chức năng
    let actionsHtml = '';
    if (permitedEdit) {
        actionsHtml += `<a href="${baseUrl}/AdminTool/DiSanVanHoaVatThe/HienVat/Edit?id=${item.hienVatID}" class="btn btn-sm btn-outline-primary" title="Chỉnh sửa" style="color: #FFB900 !important;">
            <i class="hgi-icon hgi-edit"></i> Sửa
        </a>`;
    }
    if (permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-list-btn-hienvat" data-id="${item.hienVatID}" data-name="${item.tenHienVat}" title="Xóa">
            <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }
    
    return `
        <div class="list-item" data-id="${item.hienVatID}">
            <div class="list-item-image">
                <img src="${item.anhDaiDien || '/assets/images/vector/no-image.png'}" 
                    alt="${item.tenHienVat || ''}" 
                    onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" 
                    style="object-fit:contain;" />
            </div>
            <div class="list-item-content">
                <div class="list-item-header">
                    <h5 class="list-item-title">
                        <a href="${baseUrl}/AdminTool/DiSanVanHoaVatThe/HienVat/Details?id=${item.hienVatID}" class="text-decoration-none">
                            ${item.tenHienVat || '-'}
                        </a>
                    </h5>
                    <span class="TrangThai ${trangThaiClass}">${trangThaiText}</span>
                </div>
                <div class="list-item-body">
                    <div class="list-info-grid">
                        <div class="list-info-item">
                            <span class="list-info-label">Loại hiện vật:</span>
                            <span class="list-info-value">${item.tenLoaiHienVat || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Chất liệu:</span>
                            <span class="list-info-value">${item.tenChatLieu || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Phương thức:</span>
                            <span class="list-info-value">${phuongThucText || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Nơi lưu giữ:</span>
                            <span class="list-info-value">${item.tenBaoTang || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Số lượng:</span>
                            <span class="list-info-value">${item.soLuong || '-'}</span>
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

function attachCardEventHandlersHienVat() {
    $('.delete-card-btn-hienvat').off('click').on('click', function() {
        const id = $(this).data('id');
        const name = $(this).data('name');
        
        $('#idDelete').val(id);
        $('#idTypeDelete').val(2);
        $('#nameDelete').text(name);
        $('#modalDelete').modal('show');
    });
}

function attachListEventHandlersHienVat() {
    $('.delete-list-btn-hienvat').off('click').on('click', function() {
        const id = $(this).data('id');
        const name = $(this).data('name');
        
        $('#idDelete').val(id);
        $('#idTypeDelete').val(2);
        $('#nameDelete').text(name);
        $('#modalDelete').modal('show');
    });
}

function reloadCurrentViewHienVat() {
    const config = window._filterConfigPost;
    if (!config) return;
    
    const currentView = getCurrentViewType(config);
    
    if (currentView === 'bangBieu') {
        $('#dataGridHienVat').DataTable().ajax.reload();
    } else if (currentView === 'the') {
        loadViewDataHienVat('the');
    } else if (currentView === 'danhSach') {
        loadViewDataHienVat('danhSach');
    }
}
//#endregion
})