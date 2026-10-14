const baseUrl = getRootLink();
let translations = [];

$(document).ready(function () {
    initSelect2();
    initFilterTinhThanhPho();
    initFormTinhThanhPho();

    (async function () {
        await initNgonNgu();
        initTable();
    })();

    // Bắt sự kiện thay đổi Tỉnh ở bộ lọc để nạp Xã tương ứng
    $('#tinhThanhPhoSearch').on('change', function () {
        let tinhID = $(this).val();
        initFilterPhuongXa(tinhID);
    });

    // Bắt sự kiện thay đổi Tỉnh ở modal để nạp Xã tương ứng
    $('#tinhThanhPhoDiaDiemAdd').on('change', function () {
        let tinhID = $(this).val();
        initFormPhuongXa(tinhID);
    });

    // Tìm kiếm
    $('#tim-kiem').on('click', function () {
        initTable();
    });

    // Tất cả (Reset bộ lọc)
    //$('#tat-ca').on('click', function () {
    //    $('#tu-khoa-search').val("");
    //    $('#tinhThanhPhoSearch').val("").trigger('change');
    //    initTable();
    //});

    // Enter trong ô tìm kiếm
    //document.getElementById("tu-khoa-search").addEventListener("keypress", function (event) {
    //    if (event.key === "Enter") {
    //        event.preventDefault();
    //        initTable();
    //    }
    //});

    // Mở modal Thêm mới
    $('#openModalAdd').on("click", function () {
        $('#idDiaDiemAdd').val('');
        $('#modalAddTitle').text("Thêm địa điểm mới");
        $('#tinhThanhPhoDiaDiemAdd').val('').trigger('change');
        $('#phuongXaDiaDiemAdd').empty().append('<option value="">Chọn</option>').trigger('change');
        $('#kinhDoAdd').val('');
        $('#viDoAdd').val('');
        $('#caoDoAdd').val('');
        $('#nguoiKhuyetTatAdd').prop('checked', false);
        $('#nhaVeSinhAdd').prop('checked', false);
        $('#baiDoXeAdd').prop('checked', false);

        translations = [];
        $('#ngonNguAdd').val('vi').trigger('change');
        $('#modalAdd').modal('show');
    });

    // Khởi tạo bản đồ khi modal hiển thị
    $("#modalAdd").on('shown.bs.modal', function () {
        initMapPickerDiaDiem('mapPickerDiaDiem');
    });

    // Hủy bản đồ khi modal đóng
    $("#modalAdd").on('hidden.bs.modal', function () {
        translations = [];
        destroyMapPickerDiaDiem();
        resetModalFields();
    });

    // Người dùng thay đổi tọa độ thủ công thì cập nhật bản đồ
    $(document).on('change', '#kinhDoAdd, #viDoAdd', function () {
        const lng = parseFloat($("#kinhDoAdd").val());
        const lat = parseFloat($("#viDoAdd").val());
        if (Number.isFinite(lng) && Number.isFinite(lat)) {
            setMapPickerMarker(lng, lat, true);
        }
    });

    // Thay đổi ngôn ngữ trong tab dịch modal
    $("#ngonNguAdd").on("change", function () {
        let maNgonNgu = $(this).val();
        let exist = translations.find(t => t.maNgonNgu === maNgonNgu);
        if (exist) {
            $("#tenDiaDiemAdd").val(exist.tenDiaDiem || "");
            $("#diaChiAdd").val(exist.diaChi || "");
            $("#moTaAdd").val(exist.moTa || "");
            $("#thoiGianHoatDongAdd").val(exist.thoiGianHoatDong || "");
            $("#sucChuaAdd").val(exist.sucChua || "");
        } else {
            $("#tenDiaDiemAdd").val("");
            $("#diaChiAdd").val("");
            $("#moTaAdd").val("");
            $("#thoiGianHoatDongAdd").val("");
            $("#sucChuaAdd").val("");
        }
    });

    // Tự động lưu tạm bản dịch khi rời khỏi ô nhập liệu
    $("#tenDiaDiemAdd, #diaChiAdd, #moTaAdd, #thoiGianHoatDongAdd, #sucChuaAdd").on("blur", function () {
        saveTempTranslation();
    });

    // Submit form thêm mới/chỉnh sửa
    $("#formAdd").on("submit", async function (e) {
        e.preventDefault();
        saveTempTranslation(); // Đảm bảo lưu thông tin hiện tại đang gõ trước khi gửi
        translations = translations.filter(t => t.tenDiaDiem && t.tenDiaDiem.trim() !== "");

        const submitBtn = $(this).find('button[type="submit"]');
        if (submitBtn.prop('disabled')) return;

        submitBtn.prop('disabled', true);
        const originalText = submitBtn.text();
        submitBtn.text('Đang xử lý...');

        try {
            await dataAddEdit();
        } catch (error) {
            console.error('Lỗi lưu địa điểm:', error);
        } finally {
            setTimeout(() => {
                submitBtn.prop('disabled', false);
                submitBtn.text(originalText);
            }, 1000);
        }
    });

    // Submit form xóa
    $("#formDelete").on("submit", async function (e) {
        e.preventDefault();
        const submitBtn = $(this).find('button[type="submit"]');
        if (submitBtn.prop('disabled')) return;

        submitBtn.prop('disabled', true);
        const originalText = submitBtn.text();
        submitBtn.text('Đang xóa...');

        try {
            await dataDelete();
        } catch (error) {
            console.error('Lỗi xóa địa điểm:', error);
        } finally {
            setTimeout(() => {
                submitBtn.prop('disabled', false);
                submitBtn.text(originalText);
            }, 1000);
        }
    });
});

//#region 1. Khởi tạo danh sách & bộ lọc
function initSelect2() {
    $('#tinhThanhPhoSearch, #phuongXaSearch, #tinhThanhPhoDiaDiemAdd, #phuongXaDiaDiemAdd, #ngonNguAdd').select2({
        theme: 'bootstrap4',
        width: '100%'
    });
}

function initFilterTinhThanhPho() {
    getDataWithApi('GET', '/api/CapTinhApi/Gets').then(data => {
        if (data && data.isSuccessed && data.resultObj) {
            $("#tinhThanhPhoSearch").empty().append(`<option value="">Tất cả</option>`);
            data.resultObj.forEach(item => {
                const displayText = item.noiDung || item.tenTinh || 'Không rõ tên';
                $("#tinhThanhPhoSearch").append(`<option value="${item.tinhID}">${displayText}</option>`);
            });
        }
    });
}

function initFilterPhuongXa(tinhID = null) {
    if (!tinhID) {
        $("#phuongXaSearch").empty().append(`<option value="">Tất cả</option>`);
        return;
    }
    getDataWithApi('GET', `/api/CapXaApi/GetByMaTinh?MaNgonNgu=vi&MaTinh=${tinhID}`).then(data => {
        $("#phuongXaSearch").empty().append(`<option value="">Tất cả</option>`);
        if (data && data.isSuccess && data.value) {
            data.value.forEach(item => {
                const displayText = item.noiDung || item.tenXa || 'Không rõ tên';
                $("#phuongXaSearch").append(`<option value="${item.xaID}">${displayText}</option>`);
            });
        }
    });
}

function initFormTinhThanhPho() {
    getDataWithApi('GET', '/api/CapTinhApi/Gets').then(data => {
        if (data && data.isSuccessed && data.resultObj) {
            $("#tinhThanhPhoDiaDiemAdd").empty().append(`<option value="">Chọn</option>`);
            data.resultObj.forEach(item => {
                const displayText = item.noiDung || item.tenTinh || 'Không rõ tên';
                $("#tinhThanhPhoDiaDiemAdd").append(`<option value="${item.tinhID}">${displayText}</option>`);
            });
        }
    });
}

function initFormPhuongXa(tinhID = null) {
    if (!tinhID) {
        $("#phuongXaDiaDiemAdd").empty().append(`<option value="">Chọn</option>`);
        return;
    }
    getDataWithApi('GET', `/api/CapXaApi/GetByMaTinh?MaNgonNgu=vi&MaTinh=${tinhID}`).then(data => {
        $("#phuongXaDiaDiemAdd").empty().append(`<option value="">Chọn</option>`);
        if (data && data.isSuccess && data.value) {
            data.value.forEach(item => {
                const displayText = item.noiDung || item.tenXa || 'Không rõ tên';
                $("#phuongXaDiaDiemAdd").append(`<option value="${item.xaID}">${displayText}</option>`);
            });
        }
    });
}

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
        });

        if (!res.ok) {
            var errText = await res.text();
            throw new Error(errText);
        }
        let data = await res.json();

        if (data && data.isSuccess && data.value) {
            $("#ngonNguAdd").empty();
            data.value.forEach(lang => {
                $("#ngonNguAdd").append(`<option value="${lang.maNgonNgu?.toLowerCase()}">${lang.tenNgonNgu}</option>`);
            });
            $("#ngonNguAdd").val('vi').trigger('change');
        } else {
            showNotification(0, data.error);
        }
    }
    catch (err) {
        showNotification(0, err.message);
    }
}
//#endregion

//#region 2. DataTable Grid
function initTable() {
    const tableApi = {
        url: `${baseUrl}/api/DiaDiemApi/DanhSach`,
        type: "POST",
        data: function (d) {
            return JSON.stringify({
                tuKhoa: null,//$('#tu-khoa-search').val() || null,
                tinhID: $('#tinhThanhPhoSearch').val() || null,
                xaID: $('#phuongXaSearch').val() || null,
                maNgonNgu: 'vi',
                trangThai: true
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
            targets: 5, // Kinh độ/Vĩ độ
            render: function (data, type, row, meta) {
                return `<div class="group-info">
                            <div>Kinh độ: ${row.kinhDo != null ? row.kinhDo : "-"}</div>
                            <div>Vĩ độ: ${row.viDo != null ? row.viDo : "-"}</div>
                        </div>`;
            }
        },
        {
            targets: 6, // Người khuyết tật
            render: function (data, type, row, meta) {
                return row.nguoiKhuyetTat ? `<i class="hgi-icon hgi-check text-success"></i>` : `<i class="hgi-icon hgi-cancel text-muted"></i>`;
            }
        },
        {
            targets: 7, // Nhà vệ sinh
            render: function (data, type, row, meta) {
                return row.nhaVeSinh ? `<i class="hgi-icon hgi-check text-success"></i>` : `<i class="hgi-icon hgi-cancel text-muted"></i>`;
            }
        },
        {
            targets: 8, // Bãi đỗ xe
            render: function (data, type, row, meta) {
                return row.baiDoXe ? `<i class="hgi-icon hgi-check text-success"></i>` : `<i class="hgi-icon hgi-cancel text-muted"></i>`;
            }
        },
        {
            targets: 9, // Chức năng
            render: function (data, type, row, meta) {
                let html = "";
                if (permitedEdit) {
                    html += `<i data-toggle="tooltip" title="Chỉnh sửa" class="edit-command-btn text-yellow" id="edit-${meta.row}">
                               <i class="hgi-icon hgi-edit"></i>
                            </i>`;
                }
                if (permitedDelete) {
                    html += `<i data-toggle="tooltip" title="Xoá" class="delete-command-btn text-red ml-2" id="delete-${meta.row}">
                               <i class="hgi-icon hgi-delete"></i>
                            </i>`;
                }
                return html;
            }
        }
    ];

    const tableCols = [
        { "data": "stt", "width": "40px", "class": "center-align" },
        { "data": "tenDiaDiem", "class": "left-align name-text font-weight-bold" },
        { "data": "tenTinh", "width": "12%", "class": "left-align" },
        { "data": "tenXa", "width": "12%", "class": "left-align" },
        { "data": "diaChi", "width": "20%", "class": "left-align" },
        { "data": null, "width": "150px", "class": "left-align" },
        { "data": "nguoiKhuyetTat", "width": "80px", "class": "center-align" },
        { "data": "nhaVeSinh", "width": "80px", "class": "center-align" },
        { "data": "baiDoXe", "width": "80px", "class": "center-align" },
        { "data": null, "width": "100px", "class": "center-align group-icon-action" }
    ];

    if (!permitedEdit && !permitedDelete) {
        tableCols.pop();
        tableDefs.pop();
    }

    initDataTableConfig('dataGrid', tableApi, tableDefs, tableCols);

    // Gắn sự kiện vào ô input tìm kiếm mặc định
    $('#dataGrid_wrapper .dt-search input')
        .unbind() // Bỏ event mặc định của DataTables
        .bind('keyup', function (e) {
            if (e.key === 'Enter' || e.keyCode === 13) {
                $('#dataGrid').DataTable().search(this.value).draw(); // Thực hiện search khi Enter
            }
        });

    $(".New_Table .dt-search input").prependTo(".New_Table .group-button").addClass("search-icon").attr("style", "width: 350px;")
    $(".New_Table .dt-search label").remove()
    // Xử lý sự kiện nút Chỉnh sửa
    $('#dataGrid tbody').off('click', '.edit-command-btn').on('click', '.edit-command-btn', async function () {
        var idx = $(this).attr("id").match(/\d+/)[0];
        var rowData = $('#dataGrid').DataTable().row(idx).data();

        $('#idDiaDiemAdd').val(rowData.diaDiemID);
        $('#modalAddTitle').text(`Chỉnh sửa địa điểm: ${rowData.tenDiaDiem}`);

        // Set các trường thông tin cơ bản
        $('#tinhThanhPhoDiaDiemAdd').val(rowData.tinhID).trigger('change');

        // Cần đợi dropdown Xã được nạp xong mới chọn giá trị
        setTimeout(() => {
            $('#phuongXaDiaDiemAdd').val(rowData.xaID).trigger('change');
        }, 300);

        $('#kinhDoAdd').val(rowData.kinhDo);
        $('#viDoAdd').val(rowData.viDo);
        $('#caoDoAdd').val(rowData.caoDo || '');

        $('#nguoiKhuyetTatAdd').prop('checked', rowData.nguoiKhuyetTat === true);
        $('#nhaVeSinhAdd').prop('checked', rowData.nhaVeSinh === true);
        $('#baiDoXeAdd').prop('checked', rowData.baiDoXe === true);

        // Load tất cả bản dịch ngôn ngữ của địa điểm này
        translations = [];
        try {
            const response = await fetch(`/api/DiaDiemApi/BanDich/${rowData.diaDiemID}`);
            if (response.ok) {
                const resData = await response.json();
                if (resData && resData.isSuccess && resData.value) {
                    translations = resData.value;
                }
            }
        } catch (err) {
            console.error('Lỗi khi tải bản dịch:', err);
        }

        // Kích hoạt hiển thị mặc định tiếng Việt
        $('#ngonNguAdd').val('vi').trigger('change');
        $('#modalAdd').modal('show');
    });

    // Xử lý sự kiện nút Xóa
    $('#dataGrid tbody').off('click', '.delete-command-btn').on('click', '.delete-command-btn', function () {
        var idx = $(this).attr("id").match(/\d+/)[0];
        var rowData = $('#dataGrid').DataTable().row(idx).data();

        $('#idDelete').val(rowData.diaDiemID);
        $('#nameDelete').text(`${rowData.tenDiaDiem}`);

        $('#modalDelete').modal('show');
    });
}
//#endregion

//#region 3. Lưu tạm bản dịch đa ngữ
function saveTempTranslation() {
    let maNgonNgu = $("#ngonNguAdd").val();
    let tenDiaDiem = $("#tenDiaDiemAdd").val().trim();
    let diaChi = $("#diaChiAdd").val().trim();
    let moTa = $("#moTaAdd").val().trim();
    let thoiGianHoatDong = $("#thoiGianHoatDongAdd").val().trim();
    let sucChua = $("#sucChuaAdd").val().trim();

    if (!maNgonNgu || !tenDiaDiem) return; // Không lưu nếu không có ngôn ngữ hoặc trống tên

    let exist = translations.find(t => t.maNgonNgu === maNgonNgu);
    if (exist) {
        exist.tenDiaDiem = tenDiaDiem;
        exist.diaChi = diaChi;
        exist.moTa = moTa;
        exist.thoiGianHoatDong = thoiGianHoatDong;
        exist.sucChua = sucChua;
    } else {
        translations.push({
            diaDiemID: $('#idDiaDiemAdd').val() || null,
            maNgonNgu: maNgonNgu,
            tenDiaDiem: tenDiaDiem,
            diaChi: diaChi,
            moTa: moTa,
            thoiGianHoatDong: thoiGianHoatDong,
            sucChua: sucChua
        });
    }
}
//#endregion

//#region 4. Gửi dữ liệu Add/Edit & Delete
async function dataAddEdit() {
    const id = $('#idDiaDiemAdd').val();
    const tinhID = $('#tinhThanhPhoDiaDiemAdd').val();
    const xaID = $('#phuongXaDiaDiemAdd').val();
    const kinhDo = $('#kinhDoAdd').val();
    const viDo = $('#viDoAdd').val();
    const caoDo = $('#caoDoAdd').val();

    const nguoiKhuyetTat = $('#nguoiKhuyetTatAdd').is(':checked');
    const nhaVeSinh = $('#nhaVeSinhAdd').is(':checked');
    const baiDoXe = $('#baiDoXeAdd').is(':checked');

    if (checkEmptyBlank(tinhID)) {
        showNotification(0, "Vui lòng chọn tỉnh/thành phố");
        return;
    }
    if (checkEmptyBlank(xaID)) {
        showNotification(0, "Vui lòng chọn phường/xã/đặc khu");
        return;
    }
    if (checkEmptyBlank(kinhDo)) {
        showNotification(0, "Vui lòng nhập kinh độ");
        return;
    }
    if (parseFloat(kinhDo) < 101 || parseFloat(kinhDo) > 109) {
        showNotification(0, 'Kinh độ phải nằm trong khoảng từ 101° đến 109° (phạm vi Việt Nam)');
        return;
    }
    if (checkEmptyBlank(viDo)) {
        showNotification(0, "Vui lòng nhập vĩ độ");
        return;
    }
    if (parseFloat(viDo) < 7 || parseFloat(viDo) > 24) {
        showNotification(0, 'Vĩ độ phải nằm trong khoảng từ 7° đến 24° (phạm vi Việt Nam)');
        return;
    }

    // Phải có ít nhất bản dịch tiếng Việt
    var tenTiengViet = translations.find(el => el.maNgonNgu === 'vi')?.tenDiaDiem || null;
    if (translations.length <= 0 || tenTiengViet == null) {
        showNotification(0, 'Vui lòng nhập đầy đủ thông tin bắt buộc (*), bắt buộc có bản dịch tiếng Việt');
        return;
    }

    let diaDiem = {
        DiaDiemID: id ? id : null,
        DiaDiemCapChaID: null,
        LinhVucID: null,
        XaID: xaID,
        TinhID: tinhID,
        KinhDo: kinhDo,
        ViDo: viDo,
        CaoDo: caoDo ? parseInt(caoDo) : null,
        NguoiKhuyetTat: nguoiKhuyetTat,
        NhaVeSinh: nhaVeSinh,
        BaiDoXe: baiDoXe,
        DiaChiSo: ""
    };

    let formData = new FormData();
    formData.append("DiaDiem", JSON.stringify(diaDiem));
    formData.append("DiaDiem_NoiDung", JSON.stringify(translations));

    let apiUrl = id ? `${baseUrl}/api/DiaDiemApi/ChinhSua/${id}` : `${baseUrl}/api/DiaDiemApi/ThemMoi`;
    let method = id ? 'PUT' : 'POST';

    // FormData gửi PUT/POST
    $.ajax({
        type: method,
        url: apiUrl,
        async: false,
        contentType: false,
        processData: false,
        data: formData,
        success: function (data) {
            if (data.isSuccess && data.value) {
                showNotification(1, id ? 'Chỉnh sửa thành công' : 'Thêm mới thành công');
                $('#dataGrid').DataTable().ajax.reload(null, false);
                $('#modalAdd').modal('hide');
            } else {
                showNotification(0, data.error || "Có lỗi xảy ra");
            }
        },
        error: function (xhr, status, error) {
            showNotification(0, "Gửi yêu cầu thất bại: " + error);
        }
    });
}

async function dataDelete() {
    let id = $('#idDelete').val();
    try {
        const res = await fetch(`/api/DiaDiemApi/Xoa/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            var errText = await res.text();
            throw new Error(errText);
        }

        let data = await res.json();

        console.log(data, "data xoas");

        if (data && data.isSuccess) {
            showNotification(1, 'Xoá thành công');
            $('#modalDelete').modal('hide');
            $('#dataGrid').DataTable().ajax.reload(null, false);
        } else {
            showNotification(0, data.error || "Không thể xóa địa điểm này");
        }
    }
    catch (err) {
        showNotification(0, err.message);
    }
}
//#endregion

//#region 5. ArcGIS Map Picker
let mapPickerView = null;
let mapPickerLayer = null;
let mapPickerGraphic = null;

function initMapPickerDiaDiem(mapElementId) {
    if (mapPickerView) {
        const lng = parseFloat($("#kinhDoAdd").val());
        const lat = parseFloat($("#viDoAdd").val());
        if (Number.isFinite(lng) && Number.isFinite(lat)) {
            setMapPickerMarker(lng, lat, true);
        }
        return;
    }

    require([
        "esri/Map",
        "esri/Basemap",
        "esri/Graphic",
        "esri/views/MapView",
        "esri/layers/WebTileLayer",
        "esri/layers/GraphicsLayer",
        "esri/geometry/Point",
        "esri/rest/locator"
    ], function (Map, Basemap, Graphic, MapView, WebTileLayer, GraphicsLayer, Point, locator) {

        function createGoogleBasemap(lyrType) {
            const googleLayer = new WebTileLayer({
                urlTemplate: `https://mt1.google.com/vt/lyrs=${lyrType}&x={col}&y={row}&z={level}`,
                subDomains: ["mt0", "mt1", "mt2", "mt3"]
            });
            let titleName = "Google Đường Phố";
            if (lyrType === "s") titleName = "Google Vệ Tinh";
            return new Basemap({
                baseLayers: [googleLayer],
                title: titleName,
                id: "google_" + lyrType
            });
        }

        const map = new Map({
            basemap: createGoogleBasemap("m")
        });

        const lng = parseFloat($("#kinhDoAdd").val());
        const lat = parseFloat($("#viDoAdd").val());
        const hasCoord = Number.isFinite(lng) && Number.isFinite(lat);

        mapPickerView = new MapView({
            container: mapElementId,
            map: map,
            zoom: hasCoord ? 16 : 15,
            center: hasCoord ? [lng, lat] : [107.58661120123165, 16.461784241085287], //hue
        });

        mapPickerLayer = new GraphicsLayer();
        map.add(mapPickerLayer);

        if (hasCoord) {
            setMapPickerMarker(lng, lat, false);
        }

        const locatorUrl = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer";

        mapPickerView.on("click", (event) => {
            const mapPoint = event.mapPoint;
            const clickLng = mapPoint.longitude;
            const clickLat = mapPoint.latitude;

            $("#kinhDoAdd").val(clickLng.toFixed(6));
            $("#viDoAdd").val(clickLat.toFixed(6));

            setMapPickerMarker(clickLng, clickLat, false);

            locator.locationToAddress(locatorUrl, { location: mapPoint })
                .then((response) => {
                    const diaChi = response.address || (response.attributes && response.attributes.Match_addr) || "";
                    if (diaChi && checkEmptyBlank($("#diaChiAdd").val())) {
                        $("#diaChiAdd").val(diaChi);
                    }
                })
                .catch((err) => {
                    console.warn("Không thể xác định địa chỉ từ tọa độ:", err);
                });
        });
    });
}

function setMapPickerMarker(lng, lat, recenter) {
    if (!mapPickerView || !mapPickerLayer) return;

    require([
        "esri/Graphic",
        "esri/geometry/Point"
    ], function (Graphic, Point) {
        const point = new Point({ longitude: lng, latitude: lat });
        const markerSymbol = {
            type: "picture-marker",
            url: "/assets/images/icons/map_pointer.png",
            width: "44px",
            height: "44px"
        };

        if (mapPickerGraphic) {
            mapPickerLayer.remove(mapPickerGraphic);
        }

        mapPickerGraphic = new Graphic({
            geometry: point,
            symbol: markerSymbol
        });

        mapPickerLayer.add(mapPickerGraphic);

        if (recenter) {
            mapPickerView.goTo({ center: [lng, lat], zoom: 16 }).catch(() => { });
        }
    });
}

function destroyMapPickerDiaDiem() {
    if (mapPickerView) {
        mapPickerView.destroy();
    }
    mapPickerView = null;
    mapPickerLayer = null;
    mapPickerGraphic = null;
}
//#endregion

//#region Helpers
function resetModalFields() {
    $('#idDiaDiemAdd').val('');
    $('#formAdd').find('input[type=text], textarea').val('');
    $('#formAdd').find('input[type=number]').val('');
    $('#formAdd').find('select').val('vi').trigger('change');
    $('#formAdd').find('input[type=checkbox]').prop('checked', false);
}
//#endregion
