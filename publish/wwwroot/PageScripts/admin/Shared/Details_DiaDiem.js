function initTableDiaDiem(list) {
    console.log(list)
    const tableApi = {
        url: `${baseUrl}/api/DiaDiemApi/GetMulti?ListID=${list}&MaNgonNgu=vi`,
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        dataSrc: function (data) {
            console.log(data)
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
            targets: 3, // Cột số lượng cán bộ
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

    initDataTableConfigNoSearch('dataGridDiaDiem', tableApi, tableDefs, tableCols);
    initMapByLocations(list, 'mapDiaDiem');
}

//#region Dựng bản đồ 
/**
 * Khởi tạo bản đồ dựa trên danh sách ID địa điểm
 * @param {string} listID - Chuỗi ID các địa điểm cách nhau bởi dấu phẩy
 * @param {string} mapElementId - ID của element chứa bản đồ
 */
function initMapByLocations(listID, mapElementId) {
    console.log("Khởi tạo bản đồ cho địa điểm:", listID);
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
