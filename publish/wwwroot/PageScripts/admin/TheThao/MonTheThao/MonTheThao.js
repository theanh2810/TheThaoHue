const baseUrl = getRootLink();

$(document).ready(function () {
    initDatePicker();
    let translations = [];

    (async function () {
        await Promise.all([
            initDanhMucChung(33, "#cach-thi-dau-search", "Cách thi đấu"),
            initDanhMucChung_NoAll(33, "#cachThiDauIDAdd", "Cách thi đấu"),
            initDanhMucChung(36, "#trang-thai-search", "Trạng thái"),
            initNgonNgu(),
        ]);
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

    async function initTable() {
        const tableApi = {
            url: `${baseUrl}/api/TT_MonTheThaoApi/Gets?MaNgonNgu=vi`,
            type: "GET",
            contentType: 'application/json; charset=utf-8',
            dataSrc: function (data) {
                if (data && data.isSuccess && data.value && data.value.length > 0) {
                    console.log(data.value, " 123");
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
                                    <a href="/AdminTool/MonTheThao/Details?id=${row.monTheThaoID}" class="text-primary text-decoration-none">
                                        ${row.tenMon || ''}
                                    </a>
                                </div>
                                <div class="info-sub">${row.maDinhDanh || ''}</div>
                            </div>`;
                }
            },
            //{
            //    targets: 4, // Cột file đính kèm
            //    render: function (data, type, row, meta) {
            //        if (row.tepKemTheo) {
            //            return `<a href="${baseUrl}${row.tepKemTheo}" target="_blank" class="hgi-icon hgi-download">`
            //        } else {
            //            return ``;
            //        }
            //    }
            //},
            {
                targets: 4, // Cột VĐV TB (click -> details)
                render: function (data, type, row, meta) {
                    const cnt = row.countVanDongVien || 0;
                    return `<a href="/AdminTool/MonTheThao/Details?id=${row.monTheThaoID}" class="text-primary text-decoration-none">${cnt}</a>`;
                }
            },
            {
                targets: 5, // Cột HLV TB (click -> details)
                render: function (data, type, row, meta) {
                    const cnt = row.countHuanLuyenVien || 0;
                    return `<a href="/AdminTool/MonTheThao/Details?id=${row.monTheThaoID}" class="text-primary text-decoration-none">${cnt}</a>`;
                }
            },
            {
                targets: 6, // Cột trạng thái
                render: function (data, type, row, meta) {
                    if (row.trangThai == true || row.trangThai == 1) {
                        return `<span class="TrangThai green-text">Hoạt động</span>`;
                    } else {
                        return `<span class="TrangThai red-text">Không hoạt động</span>`;
                    }
                }
            },
            {
                targets: 7, // Cột chức năng
                render: function (data, type, row, meta) {
                    let html = "";
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
            { "data": "tenMon", "width": "", "class": "left-align name-text" },
            { "data": "cachThiDau", "width": "20%", "class": "left-align" },
            { "data": "lichSuHinhThanh", "width": "30%", "class": "left-align" },
            { "data": "countVanDongVien", "width": "120px", "class": "center-align" },
            { "data": "countHuanLuyenVien", "width": "120px", "class": "center-align" },
            { "data": "trangThai", "width": "120px", "class": "left-align" },
            { "data": "", "width": "120px", "class": "center-align group-icon-action" }
        ];

        initDataTableConfigNoSearch('dataGrid', tableApi, tableDefs, tableCols);
    }

    async function initNgonNgu() {
        try {
            const res = await fetch('/api/NgonNguApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    trangThai: true,
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
                $("#maNgonNguAdd").empty();
                //$("#ngon-ngu-search").append(`<option value="">Tất cả</option>`);
                data.value.forEach(lang => {
                    $("#ngon-ngu-search").append(`<option value="${lang.maNgonNgu?.toLowerCase() }">${lang.tenNgonNgu}</option>`);
                    $("#maNgonNguAdd").append(`<option value="${lang.maNgonNgu?.toLowerCase()}">${lang.tenNgonNgu}</option>`);
                });
                $("#ngon-ngu-search").val('vi').trigger('change');
                $("#maNgonNguAdd").val('vi').trigger('change');
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            showNotification(0, err.message)
        }
    };

     // hàm lưu tạm cho 1 ngôn ngữ
    function saveTempTranslation() {
        let maNgonNgu = $('#maNgonNguAdd').val();
        let tenMon = $('#tenMonAdd').val();
        let luatChoi = $('#luatChoiAdd').val();
        let thanhTichNoiBat = $('#thanhTichNoiBatAdd').val();
        let moTa = $('#moTaAdd').val();
        let lichSuHinhThanh = $('#lichSuHinhThanhAdd').val();
        let coCauToChuc = $('#coCauToChucAdd').val();

        if (!maNgonNgu || !tenMon) return; // chưa chọn ngôn ngữ hoặc không nhập tên thì bỏ qua

        // kiểm tra đã có ngôn ngữ này trong mảng chưa
        console.log(translations)
        let exist = translations.find(t => t.maNgonNgu === maNgonNgu);
        if (exist) {
            exist.tenMon = tenMon?.trim();
            exist.luatChoi = luatChoi?.trim();
            exist.thanhTichNoiBat = thanhTichNoiBat?.trim();
            exist.moTa = moTa?.trim();
            exist.lichSuHinhThanh = lichSuHinhThanh?.trim();
            exist.coCauToChuc = coCauToChuc?.trim();
        } else {
            translations.push({
                maNgonNgu: maNgonNgu,
                tenMon: tenMon.trim(),
                luatChoi: luatChoi.trim(),
                thanhTichNoiBat: thanhTichNoiBat.trim(),
                moTa: moTa.trim(),
                lichSuHinhThanh: lichSuHinhThanh.trim(),
                coCauToChuc: coCauToChuc.trim(),
            });
        }
        console.log(translations)
    }

    $(document).on('click', '.edit-form', function () {
        var id = $(this).attr("ID").match(/\d+/)[0];
        var data = $('#dataGrid').DataTable().row(id).data();
        translations = []
        if (data) {
            translations = [{
                maNgonNgu: 'vi',
                tenMon: data.tenMon || '',
                luatChoi: data.luatChoi || '',
                thanhTichNoiBat: data.thanhTichNoiBat || '',
                moTa: data.moTa || '',
                lichSuHinhThanh: data.lichSuHinhThanh || '',
                coCauToChuc: data.coCauToChuc || '',
            }];
        } else {
            console.log('No data found')
        }
        console.log(translations)
        $("#modalAddTitle").text("Cập nhật môn thể thao")
        $('#monTheThaoIDAdd').val(data.monTheThaoID || "");
        $('#maDinhDanhAdd').val(data.maDinhDanh || "");
        // CachThiDauID lưu dưới dạng chuỗi "1,2,3", cần tách thành mảng
        const cachThiDauArr = data.cachThiDauID ? data.cachThiDauID.toString().split(',').map(s => s.trim()) : [];
        $('#cachThiDauIDAdd').val(cachThiDauArr).trigger('change');

        // Trạng thái: giả sử 1 là hoạt động, 139 là không hoạt động
        if (data.trangThai === "Hoạt động" || data.trangThaiID == 1 || data.trangThai == true) {
            $('input[name="trangThaiAdd"][value="1"]').prop('checked', true);
        } else {
            $('input[name="trangThaiAdd"][value="0"]').prop('checked', true);
        }
        // File đính kèm: chỉ hiển thị tên file nếu cần
        if (data.tepKemTheo) {
            $('#tepKemTheoDetail').val(data.tepKemTheo);
        }

        $('#maNgonNguAdd').val('vi').trigger('change');
        $('#tenMonAdd').val(translations[0].tenMon);
        $('#luatChoiAdd').val(translations[0].luatChoi);
        $('#thanhTichNoiBatAdd').val(translations[0].thanhTichNoiBat);
        $('#moTaAdd').val(translations[0].moTa);

        $('#lichSuHinhThanhAdd').val(translations[0].lichSuHinhThanh);
        $('#coCauToChucAdd').val(translations[0].coCauToChuc);

        $('#modalAdd').modal('show');
    });

    $(document).on('click', '.details-form', function () {
        var id = $(this).attr("ID").match(/\d+/)[0];
        var data = $('#dataGrid').DataTable().row(id).data();

        console.log(data, "Chi tiết")

        $("#modalDetailTitle").text(`Chi tiết môn ${data.ten || ""}`);

        $('#monTheThaoIDDetail').text(data.monTheThaoID || "");
        $('#maDinhDanhDetail').text(data.maDinhDanh || "");
        $('#cachThiDauIDDetail').text(data.cachThiDauID || "").trigger('change');
        $('#tenDetail').text(data.ten || "");
        $('#tenMonDetail').text(data.tenMon || "");

        $('#tenMonDetail').text(data.tenMon);
        $('#luatChoiDetail').text(data.luatChoi);
        $('#thanhTichNoiBatDetail').text(data.thanhTichNoiBat);
        $('#moTaDetail').text(data.moTa);

        // Trạng thái: giả sử 1 là hoạt động, 139 là không hoạt động
        if (data.trangThai === "Hoạt động" || data.trangThaiID == 1) {
            $('input[name="trangThaiDetail"][value="1"]').prop('checked', true);
        } else {
            $('input[name="trangThaiDetail"][value="139"]').prop('checked', true);
        }
        // File đính kèm: chỉ hiển thị tên file nếu cần
        if (data.tepKemTheo) {
            $('#tepKemTheoDetail').html(`<a href="${baseUrl}${data.tepKemTheo}" target="_blank">Tải file đính kèm</a>`);
        } else {
            $('#tepKemTheoDetail').html('');
        }

        $('#maNgonNguDetail').text('vi');
        
        $('#modalDetail').modal('show');
    });

    // Event handler cho nút xóa
    $(document).on('click', '.delete-command-btn', function () {
        console.log(12321321321)
        var id = $(this).attr("ID").match(/\d+/)[0];
        var data = $('#dataGrid').DataTable().row(id).data();

        $('#idDelete').val(data.monTheThaoID);
        $('#nameDelete').text(`${data.tenMon}`);

        $('#modalDelete').modal('show');
    });

    // Xử lý submit thêm/sửa môn thể thao
    $("#formAdd").on("submit", async function (e) {
        e.preventDefault();
        const submitBtn = $(this).find('button[type="submit"]');
        const originalText = submitBtn.text();

        // Lấy dữ liệu từ form
        const monTheThaoID = $('#monTheThaoIDAdd').val();
        const maDinhDanh = $('#maDinhDanhAdd').val();
        // Lấy mảng giá trị chọn, join thành chuỗi "1,2,3"
        const cachThiDauArr = $('#cachThiDauIDAdd').val() || [];
        const cachThiDauID = Array.isArray(cachThiDauArr) ? cachThiDauArr.join(',') : cachThiDauArr;
        //const trangThaiID = $('input[name="trangThaiAdd"]:checked').val();
        const trangThaiID = 139;

        const trangThai = $('input[name="trangThaiAdd"]:checked').val();

        const tepKemTheoDetail = $('#tepKemTheoDetail').val();
        const tepKemTheoInput = document.getElementById('tepKemTheoAdd');
        const tepKemTheo = tepKemTheoInput && tepKemTheoInput.files.length > 0 ? tepKemTheoInput.files[0] : null;
        console.log(tepKemTheo);
        // Đa ngữ
        const maNgonNgu = $('#maNgonNguAdd').val();
        const tenMon = $('#tenMonAdd').val();
        const luatChoi = $('#luatChoiAdd').val();
        const thanhTichNoiBat = $('#thanhTichNoiBatAdd').val();
        const moTa = $('#moTaAdd').val();

        const lichSuHinhThanh = $('#lichSuHinhThanhAdd').val();
        const coCauToChuc = $('#coCauToChucAdd').val();

        // Build object theo mẫu
        const dataObj = {
            MaDinhDanh: maDinhDanh,
            CachThiDauID: cachThiDauID,
            TrangThaiID: trangThaiID,
            MaNgonNgu: maNgonNgu,
            MonTheThaoID: monTheThaoID || "00000000-0000-0000-0000-000000000000",
            tenMon: tenMon,
            LuatChoi: luatChoi,
            ThanhTichNoiBat: thanhTichNoiBat,
            MoTa: moTa,
            tepKemTheoDetail: tepKemTheoDetail || null,
            TrangThai: trangThai == "1" ? true : false,
            LichSuHinhThanh: lichSuHinhThanh,
            CoCauToChuc: coCauToChuc
        };

        // Tạo form data
        let formData = new FormData();
        if (tepKemTheo) {
            formData.append('File', tepKemTheo);
        }
        formData.append('Data', JSON.stringify(dataObj));
        

        if (checkTagHtmlSingle(maDinhDanh)) {
            showNotification(0, "Mã định danh chứa ký tự không hợp lệ")
        }
        else if (!cachThiDauArr || cachThiDauArr.length === 0) {
            showNotification(0, "Vui lòng chọn ít nhất 1 cách thi đấu")
        }
        else if (checkEmptyBlank(tenMon)) {
            showNotification(0, "Vui lòng nhập tên môn")
        }
        else if (checkTagHtmlSingle(tenMon)) {
            showNotification(0, "Tên món chứa ký tự không hợp lệ")
        }
        else if (checkTagHtmlSingle(luatChoi)) {
            showNotification(0, "Luật chơi chứa ký tự không hợp lệ")
        }
        else if (checkTagHtmlSingle(moTa)) {
            showNotification(0, "Mô tả chứa ký tự không hợp lệ")
        }
        else {
            if (monTheThaoID && monTheThaoID !== "00000000-0000-0000-0000-000000000000") {
                if (checkUnique(maDinhDanh.trim(), monTheThaoID, 1) > 0) {
                    showNotification(0, "Mã định danh môn thể thao đã tồn tại")
                }
                else {
                    try {
                        $.ajax({
                            type: "PUT",
                            async: false,
                            url: `${baseUrl}/api/TT_MonTheThaoApi/Update`,
                            contentType: false,
                            processData: false,
                            data: formData,
                            success: function (data) {
                                console.log(data);
                                if (data && data.isSuccess) {
                                    showNotification(1, monTheThaoID ? 'Cập nhật môn thể thao thành công!' : 'Thêm mới môn thể thao thành công!');
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
                    }
                }
                
            }
            else {
                if (checkUnique(maDinhDanh.trim(), null, 0) > 0) {
                    showNotification(0, "Mã định danh môn thể thao đã tồn tại")
                }
                else {
                    try {
                        $.ajax({
                            type: "POST",
                            async: false,
                            url: `${baseUrl}/api/TT_MonTheThaoApi/Add`,
                            contentType: false,
                            processData: false,
                            data: formData,
                            success: function (data) {
                                console.log(data);
                                if (data && data.isSuccess) {
                                    showNotification(1, monTheThaoID ? 'Cập nhật môn thể thao thành công!' : 'Thêm mới môn thể thao thành công!');
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
                    }
                }
                
            }
        }

      

    });

    $("#tenMonAdd, #luatChoiAdd, #moTaAdd").on("blur", function () {
        saveTempTranslation();
    });

    // Xử lý xóa môn thể thao
    $("#formDelete").on("submit", function (e) {
        e.preventDefault();
        dataDelete();
    });

    async function dataDelete() {
        const monTheThaoID = $('#idDelete').val();
        if (!monTheThaoID) {
            showNotification(0, 'Không xác định được môn thể thao cần xóa!');
            return;
        }
        try {
            const res = await fetch(`${baseUrl}/api/TT_MonTheThaoApi/Delete?MonTheThaoID=${monTheThaoID}`, {
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
        $('#monTheThaoIDAdd').val("");
        $("#modalAddTitle").text("Thêm mới môn thể thao")
        $(this).find('input[type=text], textarea').val('');
        $('#cachThiDauIDAdd').val([]).trigger('change');
        $(this).find('select:not(#cachThiDauIDAdd)').val('vi').trigger('change');
        $(this).find('input[type=radio][value=1], input[type=checkbox][value=1]').prop('checked', true);
    });

    $("#maNgonNguAdd").on("change", function () {
        // nếu đã có dữ liệu cho ngôn ngữ vừa chọn thì bind lại vào form
        let maNgonNgu = $(this).val();
        console.log(maNgonNgu);
        
        // Tìm object có maNgonNgu khớp trong mảng translations
        let exist = translations.find(t => t.maNgonNgu === maNgonNgu);
        console.log(exist, "exist");
        
        if (exist) {
            $("#tenMonAdd").val(exist.tenMon || "");
            $("#luatChoiAdd").val(exist.luatChoi || "");
            $("#thanhTichNoiBatAdd").val(exist.thanhTichNoiBat || "");
            $("#moTaAdd").val(exist.moTa || "");
        } else {
            // reset nếu chưa nhập gì cho ngôn ngữ đó
            $("#tenMonAdd").val("");
            $("#luatChoiAdd").val("");
            $("#thanhTichNoiBatAdd").val("");
            $("#moTaAdd").val("");
        }
    });
});

function initFilter_Option(DanhMucID) {
    // Khởi tạo filter chung với config
    initCommonFilter({
        // HTML cho các option sắp xếp
        htmlFilterSort: `
            <li class="active" data-value="Ten"><a class="option_filter">Môn thể thao</a></li>
            <li class="" data-value="CachThiDau"><a class="option_filter">Cách thi đấu</a></li>
        `,
        
        // Các filter inputs (select) - không bao gồm search box và date inputs
        filterInputs: [
            '#cach-thi-dau-search',
            '#trang-thai-search',
            '#ngon-ngu-search'
        ],

        // Ô search từ khóa
        searchInput: '#tu-khoa-search',
        
        // Thời gian debounce (ms)
        debounceTime: 1000,
        
        // URL API Filter
        apiUrl: `${baseUrl}/api/TT_MonTheThaoApi/Filter`,
        
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

            // Cách thi đấu
            let CachThiDauID = $('#cach-thi-dau-search').val();
            if (CachThiDauID && CachThiDauID !== '-1' && CachThiDauID !== '') {
                params.CachThiDauID = CachThiDauID;
            }

            return params;
        },
        
        // Callback sau khi apply filter (cho table view)
        onFilterApplied: function(urlFilter) {
            // Reload DataTable với URL mới
            const table = $('#dataGrid').DataTable();
            table.ajax.url(urlFilter).load();
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
// Các hàm này giờ chỉ là wrapper cho backward compatibility
function initCardView() {
    // FilterAction.js sẽ tự động gọi loadViewData
    // Function này giữ lại để backward compatible với event listener
    loadViewData('the');
}

/**
* Render HTML cho 1 card item
*/
function renderCardItemHtml(item, index) {
    // Xử lý trạng thái
    const trangThaiClass = item.trangThaiID == 1 ? 'green-text' : 'red-text';
    const trangThaiText = item.trangThaiID == 1 ? 'Hoạt động' : 'Không hoạt động';
    
    // Xử lý file đính kèm
    let fileHtml = '';
    if (item.tepKemTheo) {
        fileHtml = `<div class="info-row">
                        <span class="info-label">File:</span>
                        <span class="info-value">
                            <a href="${baseUrl}${item.tepKemTheo}" target="_blank" title="Tải file">
                                <i class="hgi-icon hgi-download"></i> Tải file
                            </a>
                        </span>
                    </div>`;
    }
    
    // Xử lý chức năng
    let actionsHtml = '';
    if (typeof permitedEdit !== 'undefined' && permitedEdit) {
        actionsHtml += `<button class="btn btn-sm btn-outline-primary edit-card-btn" data-id="${item.monTheThaoID}" title="Chỉnh sửa" style="color: #FFB900 !important;">
            <i class="hgi-icon hgi-edit"></i> Sửa 
        </button>`;
    }
    if (typeof permitedDelete !== 'undefined' && permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-card-btn" data-id="${item.monTheThaoID}" data-name="${item.tenMon}" title="Xóa">
            <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }
    
    return `
        <div class="card-item" data-id="${item.monTheThaoID}">
            <div class="card-body">
                <div class="card-title">${item.tenMon || '-'}</div>
                <div class="card-info">
                    <div class="info-row">
                        <span class="info-label">Mã:</span>
                        <span class="info-value">${item.maDinhDanh || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Cách thi đấu:</span>
                        <span class="info-value">${item.cachThiDau || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Luật chơi:</span>
                        <span class="info-value">${item.luatChoi ? (item.luatChoi.length > 50 ? item.luatChoi.substring(0, 50) + '...' : item.luatChoi) : '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Trạng thái:</span>
                        <span class="info-value ${trangThaiClass}">${trangThaiText}</span>
                    </div>
                    ${fileHtml}
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
    // Event handler cho nút xóa trong card view
    $('.delete-card-btn').off('click').on('click', function() {
        const id = $(this).data('id');
        const name = $(this).data('name');
        
        $('#idDelete').val(id);
        $('#nameDelete').text(name);
        $('#modalDelete').modal('show');
    });
    
    // Event handler cho nút edit trong card view
    $('.edit-card-btn').off('click').on('click', function() {
        const id = $(this).data('id');
        // Tìm row index từ datatable
        const table = $('#dataGrid').DataTable();
        const rowIndex = table.rows().nodes().to$().index($(`[data-id="${id}"]`).closest('tr'));
        if (rowIndex >= 0) {
            $(`.edit-form[id='n-${rowIndex}']`).click();
        }
    });
}
//#endregion

//#region LIST VIEW - HELPER FUNCTIONS
// Các hàm này giờ chỉ là wrapper cho backward compatibility
function initListView() {
    // FilterAction.js sẽ tự động gọi loadViewData
    // Function này giữ lại để backward compatible với event listener
    loadViewData('danhSach');
}

/**
* Render HTML cho 1 list item
*/
function renderListItemHtml(item, index) {
    // Xử lý trạng thái
    const trangThaiClass = item.trangThaiID == 1 ? 'green-text' : 'red-text';
    const trangThaiText = item.trangThaiID == 1 ? 'Hoạt động' : 'Không hoạt động';
    
    // Xử lý file đính kèm
    let fileHtml = '';
    if (item.tepKemTheo) {
        fileHtml = `<div class="list-info-item">
                        <span class="list-info-label">File:</span>
                        <span class="list-info-value">
                            <a href="${baseUrl}${item.tepKemTheo}" target="_blank" title="Tải file">
                                <i class="hgi-icon hgi-download"></i> Tải file
                            </a>
                        </span>
                    </div>`;
    }
    
    // Xử lý chức năng
    let actionsHtml = '';
    if (typeof permitedEdit !== 'undefined' && permitedEdit) {
        actionsHtml += `<button class="btn btn-sm btn-outline-primary edit-list-btn" data-id="${item.monTheThaoID}" title="Chỉnh sửa" style="color: #FFB900 !important;">
            <i class="hgi-icon hgi-edit"></i> Sửa
        </button>`;
    }
    if (typeof permitedDelete !== 'undefined' && permitedDelete) {
        actionsHtml += `<button class="btn btn-sm btn-outline-danger delete-list-btn" data-id="${item.monTheThaoID}" data-name="${item.tenMon}" title="Xóa">
            <i class="hgi-icon hgi-delete"></i> Xóa
        </button>`;
    }
    
    return `
        <div class="list-item" data-id="${item.monTheThaoID}">
            <div class="list-item-content">
                <div class="list-item-header">
                    <h5 class="list-item-title">${item.tenMon || '-'}</h5>
                    <span class="TrangThai ${trangThaiClass}">${trangThaiText}</span>
                </div>
                <div class="list-item-body">
                    <div class="list-info-grid">
                        <div class="list-info-item">
                            <span class="list-info-label">Mã:</span>
                            <span class="list-info-value">${item.maDinhDanh || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Cách thi đấu:</span>
                            <span class="list-info-value">${item.cachThiDau || '-'}</span>
                        </div>
                        <div class="list-info-item">
                            <span class="list-info-label">Luật chơi:</span>
                            <span class="list-info-value">${item.luatChoi ? (item.luatChoi.length > 50 ? item.luatChoi.substring(0, 50) + '...' : item.luatChoi) : '-'}</span>
                        </div>
                        ${fileHtml}
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
    // Event handler cho nút xóa trong list view
    $('.delete-list-btn').off('click').on('click', function() {
        const id = $(this).data('id');
        const name = $(this).data('name');
        
        $('#idDelete').val(id);
        $('#nameDelete').text(name);
        $('#modalDelete').modal('show');
    });
    
    // Event handler cho nút edit trong list view
    $('.edit-list-btn').off('click').on('click', function() {
        const id = $(this).data('id');
        // Tìm row index từ datatable
        const table = $('#dataGrid').DataTable();
        const rowIndex = table.rows().nodes().to$().index($(`[data-id="${id}"]`).closest('tr'));
        if (rowIndex >= 0) {
            $(`.edit-form[id='n-${rowIndex}']`).click();
        }
    });
}
//#endregion

//#region function validation
const checkTagHtmlSingle = (input) => {
    // Loại bỏ khoảng trắng đầu/cuối và kiểm tra bằng regex
    if (!input || input.trim() === "") return false; // Cho phép chuỗi rỗng hoặc toàn khoảng trắng
    const regex = /<[^>]+>/g;
    return regex.test(input); // Return true nếu tìm thấy HTML tag (lỗi)
}

const isValidEmailAllowEmpty = (input) => {
    if (!input || input.trim() === "") return true; // Rỗng vẫn hợp lệ

    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
    return regex.test(input.trim()); // Return true nếu email hợp lệ
};

const isValidUrlAllowEmpty = (input) => {
    if (!input || input.trim() === "") return true; // Rỗng vẫn hợp lệ

    const regex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/;
    return regex.test(input.trim()); // Return true nếu URL hợp lệ
};
//#endregion function validation

const checkUnique = (maDinhDanh, monTheThaoID, type) => {
    let result = 0
    let url = `${baseUrl}/api/TT_MonTheThaoApi/CheckUnique?MaDinhDanh=${maDinhDanh}`
    if (type == 1) {
        url = `${url}&MonTheThaoID=${monTheThaoID}`
    }

    $.ajax({
        type: "GET",
        async: false,
        url: url,
        contentType: 'application/json;charset=utf-8',
        dataType: 'json',
        success: function (data) {
            if (data.isSuccess) {
                result = data.value
            }
        },
        error: function (err) {
            console.log(err)
        }
    })

    return result;
}