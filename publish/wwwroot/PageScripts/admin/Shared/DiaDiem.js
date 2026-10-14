let translationsDiaDiem = [];

$(document).ready(function () {
    initDiaDiem();
    initTinhThanhPhoDiaDiem();
    initTableDiaDiem();
    initNgonNgu("#ngonNguDichDiaDiem")

    console.log("chay vo day dia diem")

    if ($("#mapDiaDiem").children().length == 0) {
        $("#mapDiaDiem").css("height", 0)
    } 

    $('#tinhThanhPhoDiaDiem').on('change', function () {
        let tinhID = $(this).val();
        initPhuongXaDiaDiem(tinhID)
    })

    //#region Xử lý thông tin tọa độ, vị trí bản đồ
    // Khởi tạo bản đồ chọn vị trí khi modal hiển thị (ArcGIS cần container đã visible để tính kích thước)
    $("#modalDiaDiem").on('shown.bs.modal', function () {
        initMapPickerDiaDiem('mapPickerDiaDiem');
    })

    $("#modalDiaDiem").on('hidden.bs.modal', function () {
        translationsDiaDiem = []
        destroyMapPickerDiaDiem()
        resetModal(this)
    })

    // Khi người dùng tự nhập kinh độ/vĩ độ thì cập nhật marker trên bản đồ
    $(document).on('change', '#kinhDo, #viDo', function () {
        const lng = parseFloat($("#kinhDo").val());
        const lat = parseFloat($("#viDo").val());
        if (Number.isFinite(lng) && Number.isFinite(lat)) {
            setMapPickerMarker(lng, lat, true);
        }
    })

    $(document).on('change', '#DiaDiemCoSanAdd', function () {
        let listDiaDiem = $(this).val();
        if (listDiaDiem && listDiaDiem.length > 0) {
            $("#mapDiaDiem").css("height", "600px")
            let listID = Array.isArray(listDiaDiem) ? listDiaDiem.join(',') : listDiaDiem;
            initTableDiaDiem(listID);
            initMapByLocations(listID, 'mapDiaDiem');
        }
    });

    $("#btnDiaDiem").on("click", function () {
        dataAddDiaDiem()
    })
    //endregion Xử lý thông tin tọa độ, vị trí bản đồ
});

//#region Function Xử lý thông tin tọa độ, vị trí bản đồ
function initDiaDiem() {
    let dt = JSON.stringify({
        "maNgonNgu": "vi",
        "trangThai": true
    })

    getDataWithApi('POST', '/api/DiaDiemApi/DanhSach', dt).then(data => {
        if (data && data.isSuccess && data.value) {
            $("#DiaDiemCoSanAdd").empty().append(`<option value="">Chọn</option>`);
            data.value.forEach(item => {
                const displayText = item.tenDiaDiem || item.noiDung || 'Không rõ tên';
                $("#DiaDiemCoSanAdd").append(`<option value="${item.diaDiemID || item.id}">${displayText}</option>`);
            });
        }
    })
}

function dataAddDiaDiem() {
    //Thông tin địa điểm
    const DiaDiemID = null; //Chưa có trường địa điểm trong form thêm sự kiện
    const DiaDiemCapChaID = null //Chưa có trường địa điểm trong form thêm sự kiện
    const LinhVucID = $("#linhVuc").val();
    const XaID = $("#phuongXaDiaDiem").val();
    const TinhID = $("#tinhThanhPhoDiaDiem").val();
    const KinhDo = $("#kinhDo").val();
    const ViDo = $("#viDo").val();
    const CaoDo = $("#caoDo").val();
    const BanDo = null; //Chưa có trường địa điểm trong form thêm sự kiện
    const HinhAnh = null; //Chưa có trường địa điểm trong form thêm sự kiện
    const NguoiKhuyetTat = $("#nguoiKhuyetTat").is(":checked");
    const NhaVeSinh = $("#nhaVeSinh").is(":checked");
    const BaiDoXe = $("#baiDoXe").is(":checked");


    //Thông tin địa điểm dịch
    const MaNgonNguDiaDiem = $("#ngonNguDichDiaDiem").val();
    const ThoiGianHoatDong = $("#thoiGianHoatDongDich").val();
    const TenDiaDiem = $("#tenDiaDiemDich").val();
    const SucChua = $("#sucChuaDichDiaDiem").val();
    const HeToaDo = null; //Chưa có trường địa điểm trong form thêm sự kiện
    const DiaChiDiaDiem = $("#diaChiDichDiaDiem").val();
    const MoTaDiaDiem = $("#moTaDichDiaDiem").val();

    let diaDiem = {
        DiaDiemID: DiaDiemID,
        DiaDiemCapChaID: DiaDiemCapChaID,
        LinhVucID: LinhVucID,
        XaID: XaID,
        TinhID: TinhID,
        KinhDo: KinhDo,
        ViDo: ViDo,
        CaoDo: CaoDo,
        BanDo: BanDo,
        HinhAnh: HinhAnh,
        NguoiKhuyetTat: NguoiKhuyetTat,
        NhaVeSinh: NhaVeSinh,
        BaiDoXe: BaiDoXe,
    }


    let diaDiem_NoiDung = [{
        //Nội dung đa ngữ
        DiaDiemID: DiaDiemID,
        MaNgonNgu: MaNgonNguDiaDiem,
        ThoiGianHoatDong: ThoiGianHoatDong,
        TenDiaDiem: TenDiaDiem,
        SucChua: SucChua,
        HeToaDo: HeToaDo,
        DiaChi: DiaChiDiaDiem,
        MoTa: MoTaDiaDiem
    }]

    let formData = new FormData()
    formData.append("DiaDiem", JSON.stringify(diaDiem))
    formData.append("DiaDiem_NoiDung", JSON.stringify(diaDiem_NoiDung))

    if (checkEmptyBlank(TinhID)) {
        showNotification(0, "Vui lòng chọn tỉnh/thành phố")
    }
    else if (checkEmptyBlank(XaID)) {
        showNotification(0, "Vui lòng chọn phường/xã/đặc khu")
    }
    else if (checkEmptyBlank(KinhDo)) {
        showNotification(0, "Vui lòng nhập kinh độ")
    }
    else if (!isValidPositiveReal(KinhDo)) {
        showNotification(0, "Kinh độ không hợp lệ")
    }
    else if (KinhDo && (parseFloat(KinhDo) < 101 || parseFloat(KinhDo) > 109)) {
        showNotification(0, 'Kinh độ phải nằm trong khoảng từ 101° đến 109° (phạm vi Việt Nam)');
        $("#kinhDo").focus();
    }
    else if (checkEmptyBlank(ViDo)) {
        showNotification(0, "Vui lòng nhập vĩ độ")
    }
    else if (!isValidPositiveReal(ViDo)) {
        showNotification(0, "Vĩ độ không hợp lệ")
    }
    else if (ViDo && (parseFloat(ViDo) < 7 || parseFloat(ViDo) > 24)) {
        showNotification(0, 'Vĩ độ phải nằm trong khoảng từ 7° đến 24° (phạm vi Việt Nam)');
        $("#viDo").focus();
    }
    else if (!isValidAltitude(CaoDo)) {
        showNotification(0, "Cao độ không hợp lệ")
    }
    else if (checkTagHtmlSingle(ThoiGianHoatDong)) {
        showNotification(0, "Thời gian hoạt động chứa ký tự không hợp lệ")
    }
    else if (checkEmptyBlank(TenDiaDiem)) {
        showNotification(0, "Vui lòng nhập tên địa điểm")
    }
    else if (checkTagHtmlSingle(TenDiaDiem)) {
        showNotification(0, "Tên địa điểm chứa ký tự không hợp lệ")
    }
    else if (checkTagHtmlSingle(SucChua)) {
        showNotification(0, "Sức chứa chứa ký tự không hợp lệ")
    }
    else if (checkTagHtmlSingle(DiaChiDiaDiem)) {
        showNotification(0, "Địa chỉ chứa ký tự không hợp lệ")
    }
    else if (checkTagHtmlSingle(MoTaDiaDiem)) {
        showNotification(0, "Mô tả chứa ký tự không hợp lệ")
    }
    else {
        $.ajax({
            type: 'POST',
            url: `${baseUrl}/api/DiaDiemApi/ThemMoi`,
            async: false,
            contentType: false,
            processData: false,
            data: formData,
            success: function (data) {
                if (data.isSuccess && data.value) {
                    // Lưu lại id địa điểm vừa thêm mới
                    var newDiaDiemId = data.value.diaDiemID || data.value.id || data.value;

                    // Phát sự kiện để các view dùng chung modal này tự nạp lại danh sách địa điểm
                    // và chọn địa điểm vừa thêm (ví dụ: select đơn #diaDiemID ở CongTrinhTheThao)
                    $(document).trigger('diaDiem:added', [newDiaDiemId, data.value]);

                    // Lưu lại các giá trị select đã chọn trước đó
                    var prevDiaDiem = $('#DiaDiemCoSanAdd').val();
                    let dt = JSON.stringify({
                        "maNgonNgu": "vi",
                        "trangThai": true
                    })
                    getDataWithApi('POST', '/api/DiaDiemApi/DanhSach', dt).then(data => {
                        if (data && data.isSuccess && data.value) {
                            var $select = $('#DiaDiemCoSanAdd');
                            var prevValues = Array.isArray(prevDiaDiem) ? prevDiaDiem : [prevDiaDiem];
                            $select.empty();
                            $select.append('<option value="">Chọn</option>');
                            data.value.forEach(function (item) {
                                var selected = '';
                                if (prevValues.includes(item.diaDiemID?.toString()) || prevValues.includes(item.id?.toString())) selected = 'selected';
                                if (item.diaDiemID == newDiaDiemId || item.id == newDiaDiemId) selected = 'selected';
                                $select.append(`<option value="${item.diaDiemID || item.id}" ${selected}>${item.tenDiaDiem || item.noiDung || 'Không rõ tên'}</option>`);
                            });
                            prevValues.push(newDiaDiemId)
                            $select.trigger('change.select2');
                            if (prevValues && prevValues.length > 0) {
                                let listID = Array.isArray(prevValues) ? prevValues.join(',') : prevValues;
                                initTableDiaDiem(listID);
                                initMapByLocations(listID, 'mapDiaDiem');
                            }
                        }
                    })
                    $('#modalDiaDiem').modal('hide');
                }
            }
        })
    }

    
}

function initTableDiaDiem(list) {
    console.log(list);
    console.log("co vo day de tao dia diem")
    const tableApi = {
        url: `${baseUrl}/api/DiaDiemApi/GetMulti?ListID=${list}&MaNgonNgu=vi`,
        type: "GET",
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
            targets: 3,
            render: function (data, type, row, meta) {
                return `<div class="group-info">
                            <div class="">Kinh độ: ${row.kinhDo ? row.kinhDo : "-"}</div>
                            <div class="">Vĩ độ: ${row.viDo ? row.viDo : "-"}</div>
                        </div>`;
            }
        }
    ];

    const tableCols = [
        { "data": "stt", "width": "40px", "class": "center-align" },
        { "data": "tenDiaDiem", "class": "left-align name-text" },
        { "data": "diaChi", "width": "30%", "class": "left-align" },
        { "data": "", "width": "30%", "class": "left-align" }
    ];

    if (list && list.length > 0) {
        initDataTableConfigNoSearch('dataGridDiaDiem', tableApi, tableDefs, tableCols);
    } else {
        initDataTableConfigNoSearch('dataGridDiaDiem', '', '', tableCols);
    }
}

function loadTranslationDiaDiem(diaDiemID, maNgonNgu) {
    getDataWithApi('GET', `/api/DiaDiemApi/GetByID?MaNgonNgu=${maNgonNgu}&DiaDiemID=${diaDiemID}`).then(data => {
        if (data && data.isSuccess && data.value) {
            translationsDiaDiem = data.value;
            var banDich = translationsDiaDiem.find(el => el.maNgonNgu === maNgonNgu)
            // Populate các trường dịch với dữ liệu đa ngữ
            $('#tenDiaDiemDich').val(banDich.tenDiaDiem);
            $('#diaChiDichDiaDiem').val(banDich.diaChi);
            $('#moTaDichDiaDiem').val(banDich.moTa);
            $('#thoiGianHoatDongDichDiaDiem').val(banDich.thoiGianHoatDong);
            $('#sucChuaDichDiaDiem').val(banDich.sucChua);
        } else {
            // Nếu không có bản dịch, clear các trường dịch
            $("#tenDiaDiemDich").val('');
            $("#diaChiDichDiaDiem").val('');
            $("#moTaDichDiaDiem").val('');
            $("#thoiGianHoatDongDichDiaDiem").val('');
            $("#sucChuaDichDiaDiem").val('');
        }
    })
}
//#endregion Function Xử lý thông tin tọa độ, vị trí bản đồ

//#region Function Xử lý chung
function initTinhThanhPhoDiaDiem() {
    getDataWithApi('GET', '/api/CapTinhApi/Gets').then(data => {
        if (data && data.isSuccessed && data.resultObj) {
            $("#tinhThanhPhoDiaDiem").empty().append(`<option value="">Chọn</option>`);
            data.resultObj.forEach(item => {
                const displayText = item.noiDung || item.tenTinh || 'Không rõ tên';
                $("#tinhThanhPhoDiaDiem").append(`<option value="${item.tinhID}">${displayText}</option>`);
            });
        }
    })
}

function initPhuongXaDiaDiem(tinhID = null) {
    getDataWithApi('GET', `/api/CapXaApi/GetByMaTinh?MaNgonNgu=vi&MaTinh=${tinhID ? `${tinhID}` : ''}`).then(data => {
        $("#phuongXaDiaDiem").empty().append(`<option value="">Chọn</option>`);
        if (data && data.isSuccess && data.value) {
            data.value.forEach(item => {
                const displayText = item.noiDung || item.tenXa || 'Không rõ tên';
                $("#phuongXaDiaDiem").append(`<option value="${item.xaID}">${displayText}</option>`);
            });
        }
    })
}
//#endregion Function Xử lý chung

//#region Dựng bản đồ
// Tham chiếu tới view/marker của bản đồ chọn vị trí trong modal (kế thừa từ KnowledgeBase/Map/index.html)
let mapPickerView = null;
let mapPickerLayer = null;
let mapPickerGraphic = null;

/**
 * Khởi tạo bản đồ chọn vị trí trong modal thêm địa điểm mới.
 * Nhấp vào bản đồ để lấy tọa độ (kinh độ/vĩ độ) và đặt marker.
 * @param {string} mapElementId - ID của element chứa bản đồ
 */
function initMapPickerDiaDiem(mapElementId) {
    // Nếu đã khởi tạo rồi thì chỉ cần resize lại cho khớp container
    if (mapPickerView) {
        const lng = parseFloat($("#kinhDo").val());
        const lat = parseFloat($("#viDo").val());
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

        // Tạo nền bản đồ Google (kế thừa từ KnowledgeBase/Map/index.html)
        function createGoogleBasemap(lyrType) {
            const googleLayer = new WebTileLayer({
                urlTemplate: `https://mt1.google.com/vt/lyrs=${lyrType}&x={col}&y={row}&z={level}`,
                subDomains: ["mt0", "mt1", "mt2", "mt3"]
            });

            let titleName = "Google Bản Đồ";
            if (lyrType === "m") titleName = "Google Đường Phố";
            if (lyrType === "s") titleName = "Google Vệ Tinh";
            if (lyrType === "y") titleName = "Google Vệ Tinh (Hybrid)";

            return new Basemap({
                baseLayers: [googleLayer],
                title: titleName,
                id: "google_" + lyrType
            });
        }

        const map = new Map({
            basemap: createGoogleBasemap("m")
        });

        // Tọa độ mặc định: lấy theo giá trị đang nhập, nếu không có thì lấy trung tâm Huế
        const lng = parseFloat($("#kinhDo").val());
        const lat = parseFloat($("#viDo").val());
        const hasCoord = Number.isFinite(lng) && Number.isFinite(lat);

        console.log(hasCoord, "hasCoord")

        console.log(mapPickerView, "mapPickerView")

        mapPickerView = new MapView({
            container: mapElementId,
            map: map,
            zoom: hasCoord ? 16 : 15,
            center: hasCoord ? [lng, lat] : [107.58661120123165, 16.461784241085287],
        });

        mapPickerLayer = new GraphicsLayer();
        map.add(mapPickerLayer);

        // Nếu đã có tọa độ thì hiển thị marker sẵn
        if (hasCoord) {
            setMapPickerMarker(lng, lat, false);
        }

        const locatorUrl = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer";

        // Nhấp vào bản đồ để lấy tọa độ
        mapPickerView.on("click", (event) => {
            const mapPoint = event.mapPoint;
            const clickLng = mapPoint.longitude;
            const clickLat = mapPoint.latitude;

            console.log(`Nhấp vào bản đồ: Kinh độ=${clickLng}, Vĩ độ=${clickLat}`);

            // Cập nhật ô nhập kinh độ/vĩ độ (6 chữ số thập phân)
            $("#kinhDo").val(clickLng.toFixed(6));
            $("#viDo").val(clickLat.toFixed(6));

            // Đặt marker tại vị trí vừa nhấp
            setMapPickerMarker(clickLng, clickLat, false);

            // Lấy địa chỉ hành chính từ tọa độ (reverse geocode)
            locator.locationToAddress(locatorUrl, { location: mapPoint })
                .then((response) => {
                    const diaChi = response.address || (response.attributes && response.attributes.Match_addr) || "";
                    if (diaChi && checkEmptyBlank($("#diaChiDichDiaDiem").val())) {
                        $("#diaChiDichDiaDiem").val(diaChi);
                    }
                })
                .catch((err) => {
                    console.warn("Không lấy được địa chỉ từ tọa độ:", err);
                });
        });
    });
}

/**
 * Đặt/di chuyển marker trên bản đồ chọn vị trí.
 * @param {number} lng - Kinh độ
 * @param {number} lat - Vĩ độ
 * @param {boolean} recenter - Có đưa bản đồ về vị trí marker hay không
 */
function setMapPickerMarker(lng, lat, recenter) {
    if (!mapPickerView || !mapPickerLayer) return;

    require([
        "esri/Graphic",
        "esri/geometry/Point"
    ], function (Graphic, Point) {
        const point = new Point({ longitude: lng, latitude: lat });

        const markerSymbol = {
            type: "picture-marker",
            url: `/assets/images/icons/map_pointer.png`,
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

/**
 * Hủy bản đồ chọn vị trí khi đóng modal để tránh rò rỉ bộ nhớ và khởi tạo lại sạch sẽ.
 */
function destroyMapPickerDiaDiem() {
    if (mapPickerView) {
        mapPickerView.destroy();
    }
    mapPickerView = null;
    mapPickerLayer = null;
    mapPickerGraphic = null;
}

/**
 * Khởi tạo bản đồ dựa trên danh sách ID địa điểm
 * @param {string} listID - Chuỗi ID các địa điểm cách nhau bởi dấu phẩy
 * @param {string} mapElementId - ID của element chứa bản đồ
 */
function initMapByLocations(listID, mapElementId) {
    if (!listID || listID.length === 0) return;

    getDataWithApi('GET', `/api/DiaDiemApi/GetMulti?ListID=${listID}&MaNgonNgu=vi`).then(data => {
        console.log(data, "Dữ liệu địa điểm cho bản đồ");
        if (data && data.isSuccess && data.value && data.value.length > 0) {
            const locations = data.value
                .filter(item => item.kinhDo && item.viDo) // Chỉ lấy các địa điểm có tọa độ
                .map(item => ({
                    lat: parseFloat(item.viDo),
                    lng: parseFloat(item.kinhDo),
                    title: item.tenDiaDiem || 'Không rõ tên',
                    description: item.moTa || '',
                    diaChi: item.diaChi || ''
                }));
            
            if (locations.length === 0) {
                console.warn("Không có địa điểm nào có tọa độ hợp lệ");
                return;
            }
            
            // Sử dụng initMiniMap nếu chỉ có 1 địa điểm, initMiniMap_Multi nếu nhiều hơn
            if (locations.length === 1) {
                initMiniMap(locations[0].lat, locations[0].lng, mapElementId);
            } else {
                initMiniMap_Multi(locations, mapElementId);
            }
        }
    }).catch(err => {
        console.error("Lỗi khi load dữ liệu địa điểm:", err);
    });
}

function initMiniMap(lat, lng, mapElementId) {
    require([
        "esri/Map",
        "esri/views/MapView",
        "esri/Basemap",
        "esri/Graphic",
        "esri/layers/GraphicsLayer",
        "esri/geometry/Point"
    ], function (Map, MapView, Basemap, Graphic, GraphicsLayer, Point) {
        
        const baseMap = Basemap.fromId("osm");
        
        const map = new Map({
            basemap: baseMap
        });
        
        const view = new MapView({
            container: mapElementId,
            map: map,
            center: [lng, lat],
            zoom: 15,
            constraints: {
                minZoom: 10,
                maxZoom: 20
            },
            ui: {
                components: ["attribution"]
            }
        });
        
        const pointLayer = new GraphicsLayer();
        map.add(pointLayer);
        
        // Tạo marker tại vị trí
        const point = new Point({
            longitude: lng,
            latitude: lat
        });
        
        const markerSymbol = {
            type: "picture-marker",
            url: `/assets/images/icons/map_pointer.png`,
            width: "44px",
            height: "44px"
        };
        
        const pointGraphic = new Graphic({
            geometry: point,
            symbol: markerSymbol
        });
        
        pointLayer.add(pointGraphic);
        
        return view;
    });
}

/**
 * Hiển thị bản đồ với nhiều địa điểm
 * @param {Array} locations - Mảng các địa điểm [{lat, lng, title, description}, ...]
 * @param {string} mapElementId - ID của element chứa bản đồ
 * @param {Object} options - Các tùy chọn bổ sung {centerLat, centerLng, zoom}
 */
function initMiniMap_Multi(locations, mapElementId, options = {}) {
    require([
        "esri/Map",
        "esri/views/MapView",
        "esri/Basemap",
        "esri/Graphic",
        "esri/layers/GraphicsLayer",
        "esri/geometry/Point",
        "esri/geometry/Extent"
    ], function (Map, MapView, Basemap, Graphic, GraphicsLayer, Point, Extent) {
        
        const baseMap = Basemap.fromId("osm");
        
        const map = new Map({
            basemap: baseMap
        });
        
        // Tính toán center và zoom tự động nếu không được cung cấp
        let centerLng = options.centerLng;
        let centerLat = options.centerLat;
        let zoom = options.zoom || 12;
        
        if (!centerLng || !centerLat) {
            // Tính center từ trung bình các điểm
            const avgLng = locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length;
            const avgLat = locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length;
            centerLng = avgLng;
            centerLat = avgLat;
        }
        
        const view = new MapView({
            container: mapElementId,
            map: map,
            center: [centerLng, centerLat],
            zoom: zoom,
            constraints: {
                minZoom: 8,
                maxZoom: 20
            },
            ui: {
                components: ["attribution"]
            }
        });
        
        const pointLayer = new GraphicsLayer();
        map.add(pointLayer);
        
        // Tạo marker cho từng địa điểm
        locations.forEach((location, index) => {
            const point = new Point({
                longitude: location.lng,
                latitude: location.lat
            });
            
            const markerSymbol = {
                type: "picture-marker",
                url: `/assets/images/icons/map_pointer.png`,
                width: "44px",
                height: "44px"
            };
            
            // Tạo popup attributes nếu có title hoặc description
            const attributes = {};
            if (location.title) attributes.title = location.title;
            if (location.description) attributes.description = location.description;
            if (location.diaChi) attributes.diaChi = location.diaChi;
            
            const pointGraphic = new Graphic({
                geometry: point,
                symbol: markerSymbol,
                attributes: attributes,
                popupTemplate: location.title ? {
                    title: "{title}",
                    content: `
                        ${location.description ? `<p>${location.description}</p>` : ''}
                        ${location.diaChi ? `<p><strong>Địa chỉ:</strong> ${location.diaChi}</p>` : ''}
                        <p><strong>Tọa độ:</strong> ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}</p>
                    `
                } : null
            });
            
            pointLayer.add(pointGraphic);
        });
        
        // Auto zoom để hiển thị tất cả markers
        view.when(function() {
            if (locations.length > 1) {
                const allPoints = locations.map(loc => new Point({
                    longitude: loc.lng,
                    latitude: loc.lat
                }));
                
                // Tính extent bao phủ tất cả các điểm
                let minLng = Math.min(...locations.map(l => l.lng));
                let maxLng = Math.max(...locations.map(l => l.lng));
                let minLat = Math.min(...locations.map(l => l.lat));
                let maxLat = Math.max(...locations.map(l => l.lat));
                
                // Thêm padding 10%
                const lngPadding = (maxLng - minLng) * 0.1;
                const latPadding = (maxLat - minLat) * 0.1;
                
                const extent = new Extent({
                    xmin: minLng - lngPadding,
                    ymin: minLat - latPadding,
                    xmax: maxLng + lngPadding,
                    ymax: maxLat + latPadding,
                    spatialReference: { wkid: 4326 }
                });
                
                view.extent = extent;
            }
        });
        
        return view;
    });
}
//#endregion Dựng bản đồ

//#region validation
const isValidPositiveReal =(value) => {
    if (typeof value !== 'string' && typeof value !== 'number') return false;
    const s = String(value).trim();

    // Regex: bắt buộc bắt đầu bằng số, cho phép 1 dấu chấm, không cho dấu chấm ở đầu
    // Hợp lệ:  "1", "1.2", "123.456"
    // Không hợp lệ: ".5", "1.", "1,2", "abc"
    const re = /^\d+(\.\d+)?$/;
    if (!re.test(s)) return false;

    // Kiểm tra > 0
    const num = Number(s);
    return Number.isFinite(num) && num > 0;
}

const isValidAltitude = (value) => {
    const s = String(value).trim();

    if(s === '') return true

    const re = /^-?\d+(\.\d+)?$/;
    return re.test(s);
}
//#endregion validation


