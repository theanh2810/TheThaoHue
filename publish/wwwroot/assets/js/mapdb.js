let renderData = [];
let fullData = [];
let dataXa = [];
const baseUrl = getRootLink();

const url = window.location;
const BASEURL = url.protocol + "//" + url.hostname + ":" + url.port;
const IMGURL = url.protocol + "//" + url.hostname;

let lang = $('#language').val();

const dataDirection = [
    {
        en: "enter the roundabout and keep the 2nd exit on",
        vi: "vào bùng binh và đi ra ở lối thứ 2 trên"
    },
    {
        en: "enter the roundabout and keep the 1st exit on",
        vi: "vào bùng binh và đi ra ở lối thứ 1 trên"
    },
    {
        en: "bear right onto ramp",
        vi: "sang phải vào trên đoạn đường nối",
    },
    {
        en: "turn right onto ramp",
        vi: "rẽ phải vào đoạn đường nối",
    },
    {
        en: "make sharp right onto ramp",
        vi: "sang trái ngay trên đoạn đường nối",
    },
    {
        en: "make sharp left onto ramp",
        vi: "ra trái vào đoạn đường nối",
    },
    {
        en: "turn left onto ramp",
        vi: "rẽ trái vào đoạn đường nối",
    },
    {
        en: "bear left onto ramp",
        vi: "sang trái vào đoạn đường nối",
    },
    {
        en: "take ramp on the left",
        vi: "đi dốc ở bên trái",
    },
    {
        en: "take ramp on the right",
        vi: "đi dốc ở bên phải",
    },
    {
        en: "stay on ferry for",
        vi: "ở lại phà cho",
    },
    {
        en: "enter the roundabout",
        vi: "đi vào bùng binh"
    },
    {
        en: "on the right",
        vi: "phía bên phải",
    },
    {
        en: "on the left",
        vi: "phía bên trái",
    },
    {
        en: "and go on",
        vi: "và tiến lên",
    },
    {
        en: "bear right",
        vi: "sang bên phải",
    },
    {
        en: "bear left",
        vi: "sang bên trái",
    },
    {
        en: "turn right",
        vi: "rẽ phải",
    },
    {
        en: "turn left",
        vi: "rẽ trái",
    },
    {
        en: "near left",
        vi: "gần phía bên trái",
    },
    {
        en: "near right",
        vi: "gần phía bên phải",
    },
    {
        en: "at exit",
        vi: "ở lối ra",
    },
    {
        en: "go back",
        vi: "quay lại",
    },
    {
        en: "take ramp",
        vi: "theo đường dốc",
    },
    {
        en: "the 1st",
        vi: "lối thứ 1"
    },
    {
        en: "the 2nd",
        vi: "lối thứ 2"
    },
    {
        en: "your destination",
        vi: "điểm đến của bạn"
    },
    {
        en: "northeast",
        vi: "hướng Đông Bắc",
    },
    {
        en: "southeast",
        vi: "hướng Đông Nam",
    },
    {
        en: "southwest",
        vi: "hướng Tây Nam",
    },
    {
        en: "northwest",
        vi: "hướng Tây Bắc",
    },
    {
        en: "east",
        vi: "hướng đông",
    },
    {
        en: "north",
        vi: "hướng Bắc",
    },
    {
        en: "south",
        vi: "hướng Nam",
    },
    {
        en: "west",
        vi: "hướng Tây",
    },
    {
        en: "straight",
        vi: "đi thẳng",
    },
    {
        en: "after",
        vi: "sau",
    },
    {
        en: "at",
        vi: "tại",
    },
    {
        en: "before",
        vi: "trước",
    },
    {
        en: "onto",
        vi: "trên",
    },
    {
        en: "over",
        vi: "kết thúc",
    },
    {
        en: "past",
        vi: "vừa qua",
    },
    {
        en: "through",
        vi: "xuyên qua",
    },
    {
        en: "under",
        vi: "Dưới",
    },
    {
        en: "by",
        vi: "qua",
    },
    {
        en: "near",
        vi: "ở gần",
    },
    {
        en: "start",
        vi: "bắt đầu",
    },
    {
        en: "finish",
        vi: "kết thúc",
    },
    {
        en: "arrive",
        vi: "đến",
    },
    {
        en: "depart",
        vi: "khởi hành",
    },
    {
        en: "take",
        vi: "giữ",
    },
    {
        en: "go",
        vi: "đi",
    },
    {
        en: "distance",
        vi: "khoảng cách",
    },
    {
        en: "keep",
        vi: "tiếp dục đi",
    },
    {
        en: "turn",
        vi: "rẽ",
    },
    {
        en: "right",
        vi: "bên phải",
    },
    {
        en: "left",
        vi: "bên trái",
    },
    {
        en: "first",
        vi: "đầu tiên",
    },
    {
        en: "second",
        vi: "thứ hai",
    },
    {
        en: "third",
        vi: "thứ ba",
    },
    {
        en: "fourth",
        vi: "thứ tư",
    },
    {
        en: "fifth",
        vi: "thứ năm",
    },
    {
        en: "sixth",
        vi: "thứ sáu",
    },
    {
        en: "seventh",
        vi: "thứ bảy",
    },
    {
        en: "eighth",
        vi: "thứ tám",
    },
    {
        en: "ninth",
        vi: "thứ chín",
    },
    {
        en: "tenth",
        vi: "thứ mười",
    },
    {
        en: "continue",
        vi: "tiếp tục",
    },
    {
        en: "head",
        vi: "đi thẳng",
    },
    {
        en: "on",
        vi: "trên",
    },
    {
        en: "in",
        vi: "trong",
    },
    {
        en: "and",
        vi: "và",
    },
    {
        en: "exit",
        vi: "đi ra",
    },
]

$(document).ready(function () {
    $('#cap-xa').select2({
        width: '100%',
    });

    require([
        "esri/Map",
        "esri/views/MapView",
        "esri/layers/TileLayer",
        "esri/layers/FeatureLayer",
        "esri/layers/GraphicsLayer",
        "esri/Basemap",
        "esri/widgets/BasemapGallery",
        "esri/widgets/Expand",
        "esri/widgets/Measurement",
        "esri/widgets/Search",
        "esri/widgets/Locate",
        "esri/widgets/Popup",
        "esri/widgets/Print",
        "esri/Graphic",
        "esri/widgets/Expand",
        "esri/widgets/Zoom",
        "esri/geometry/Point",
        "esri/geometry/Polyline",
        "esri/symbols/PictureMarkerSymbol",
        "esri/rest/support/Query",
        "esri/geometry/Extent",
        "esri/intl",
        "esri/config"
    ], function (Map, MapView, TileLayer, FeatureLayer, GraphicsLayer, Basemap, BasemapGallery, Expand, Measurement, Search, Locate, Popup, Print, Graphic, Expand, Zoom, Point, Polyline, PictureMarkerSymbol, Query, Extent, intl, esriConfig) {
        //esriConfig.request.timeout = 600000;

        let routerFlag = false;
        let arrPos = [];
        let routerContent = '';

        let polylineGraphic = null;

        intl.setLocale("vi");

        const ACTIONFEATURE = [
            {
                title: "Chi tiết",
                id: "images",
                className: "esri-icon-media",
                type: "button",
            },
            {
                title: "Chỉ đường",
                id: "direction",
                className: "esri-icon-applications",
                type: "button",
            },
        ];

        //const baseMap = Basemap.fromId("topo-vector");
        const baseMap = Basemap.fromId("osm");

        var map = new Map({
            basemap: baseMap,
        });

        const boxNW = { lat: 21.45390765720583, lon: 103.77362088580693 };
        const boxSE = { lat: 20.729102247798963, lon: 105.03282956830668 };

        var view = new MapView({
            container: "viewDiv",
            map: map,
            center: [103.91438443630564, 21.32688418013099],
            //scale: 36000,
            zoom: 9,
            constraints: {
                minZoom: 9,
                maxZoom: 25,
                geometry: {
                    type: "extent",
                    xmin: boxNW.lon,
                    ymin: boxSE.lat,
                    xmax: boxSE.lon,
                    ymax: boxNW.lat,
                    spatialReference: { wkid: 4326 }
                }
            },
            ui: {
                components: ["attribution"]
            },
            popup: {
                dockEnabled: true,
                dockOptions: {
                    buttonEnabled: false,
                    breakpoint: false,
                    position: "bottom-right"
                }
            },
        });

        const textLayer = new GraphicsLayer({
            id: "textLayer",
            visible: false
        });

        map.add(textLayer, 0);

        const pointLayer = new GraphicsLayer();
        map.add(pointLayer, 0);

        const graphicsLayer = new GraphicsLayer();
        map.add(graphicsLayer);

        $('#toggleLabel').on('change', function () {
            if (this.checked) {
                textLayer.visible = true;
            } else {
                textLayer.visible = false;
            }
        });

        //Search
        const searchWidget = new Search({
            view: view
        });

        view.ui.add(searchWidget, {
            position: "top-right"
        });

        //Zoom
        var zoom = new Zoom({
            view: view,
        });

        view.ui.add(zoom, "top-right");

        //Locate
        //const locateBtn = new Locate({
        //    view: view
        //});

        //view.ui.add(locateBtn, {
        //    position: "top-right"
        //});

        //BaseMap
        const basemapGallery = new BasemapGallery({
            view: view,
            container: document.createElement("div"),
            source: [Basemap.fromId("osm"), Basemap.fromId("satellite"), Basemap.fromId("gray-vector"), baseMap]
        });

        const bgExpand = new Expand({
            view: view,
            content: basemapGallery,
            expandTooltip: "Bản đồ nền"
        });

        view.ui.add(bgExpand, "bottom-left");

        //Print
        const print = new Print({
            view: view,
        });

        print.on("complete", function (results) {
            // The results are stored in the results object
            console.log("Results of the print: ", results.link);
        });

        print.on("submit", function (results) {
            // The results are stored in the event object
            console.log("Results of submitting the print: ", results.link);
        });

        const printExpand = new Expand({
            view: view,
            content: print,
            expandIconClass: "esri-icon-printer",
            expandTooltip: "In nâng cao"
        });

        view.ui.add(printExpand, "top-right");

        //Print browser btn
        var elPrint = document.createElement("div");
        elPrint.className = "esri-icon-check-mark esri-widget--button esri-widget esri-interactive";
        elPrint.title = "In nhanh";
        elPrint.addEventListener("click", function (evt) {
            window.print()
        });

        view.ui.add(elPrint, "top-right");

        //Filter toggle btn
        var eleFilter = document.createElement("div");
        eleFilter.className = "esri-icon-layers esri-widget--button esri-widget esri-interactive";
        eleFilter.title = "Lọc";
        eleFilter.addEventListener("click", function (evt) {
            $('#map-slider').toggleClass('toggle-display');
            $('#map-slider').toggleClass('d-none');
            
        });

        view.ui.add(eleFilter, "top-right");

        $('#map-sidebar-header').on('click', function () {
            $('#map-slider').toggleClass('toggle-display');
            $('#map-slider').toggleClass('d-none');
        })

        const routerPopup = new Popup({
            view: view,
            content: "",
            actions: [],
            title: 'Hướng dẫn chỉ đường',
            container: routerdesc,
        });

        routerPopup.viewModel.includeDefaultActions = false;

        view.ui.add(routerPopup, {
            position: "top-right"
        });

        let locateBtn = new Locate({
            view: view,   // Attaches the Locate button to the view
            graphic: new Graphic({
                symbol: { type: "simple-marker" }
            })
        });

        view.ui.add(locateBtn, "top-right");
        let latValue;
        let longValue;

        locateBtn.on("locate", function (event) {
            const coordinates = event.position.coords;
            latValue = coordinates.latitude;
            longValue = coordinates.longitude;
        });

        const btnClearRoute = document.createElement('div');

        btnClearRoute.className =
            "esri-icon-erase esri-widget--button esri-widget esri-interactive";
        btnClearRoute.addEventListener("click", function (evt) {
            if (graphicsLayer && polylineGraphic) {
                graphicsLayer.remove(polylineGraphic);
                routerPopup.visible = false;
            }

            arrPos = []
        });

        view.ui.add(btnClearRoute, "top-right");

        // Function to check if current view is within boundary (KHÔNG DÙNG - ĐÃ LOCK MAP VỚI CONSTRAINTS)
        // const boxNW = { lat: 21.45390765720583, lon: 103.77362088580693 };
        // const boxSE = { lat: 21.229102247798963, lon: 104.03282956830668 };

        // function isViewWithinBoundary() {
        //     const currentExtent = view.extent;
        //     const check = isPointInBox(currentExtent.center.latitude, currentExtent.center.longitude, boxNW.lat, boxNW.lon, boxSE.lat, boxSE.lon);
        //     return check;
        // }

        // function isPointInBox(pointLat, pointLon, nwLat, nwLon, seLat, seLon) {
        //     return (pointLat <= nwLat && pointLat >= seLat &&
        //         pointLon >= nwLon && pointLon <= seLon);
        // }

        // Function to center the map (KHÔNG DÙNG - ĐÃ LOCK MAP VỚI CONSTRAINTS)
        // function centerMap() {
        //     view.goTo({
        //         center: [103.91438443630564, 21.32688418013099],
        //         zoom: 9
        //     }, {
        //         duration: 1000,
        //         easing: "ease-in-out"
        //     });
        // }

        // Event listener (KHÔNG DÙNG - ĐÃ LOCK MAP VỚI CONSTRAINTS)
        // let interactionTimeout;
        // view.on(["drag", "mouse-wheel"], function () {
        //     clearTimeout(interactionTimeout);
        //     interactionTimeout = setTimeout(() => {
        //         if (!isViewWithinBoundary()) {
        //             console.log("User moved outside boundary after interaction, centering map...");
        //             centerMap();
        //         }
        //     }, 1000);
        // });

        //TREE
        const treeData = [
            {
                id: "1",
                text: "Văn hóa",
                type: "point",
                children: [
                    {
                        id: "1_1",
                        text: "Di tích lịch sử văn hóa",
                        tid: "1",
                        icon: "●",
                        color: "#FF6900",
                    },
                    {
                        id: "1_2",
                        tid: "",
                        text: "Đơn vị nghệ thuật",
                        icon: "●",
                        color: "#1447E6"
                    },
                    {
                        id: "1_3",
                        tid: "",
                        text: "Sự kiện",
                        icon: "●",
                        color: "#860ACE"
                    },
                    {
                        id: "1_4",
                        tid: "6",
                        text: "Lễ hội",
                        icon: "●",
                        color: "#CC00C8"
                    },
                    {
                        id: "1_5",
                        tid: "",
                        text: "Thư viện",
                        icon: "●",
                        color: "#A6CC00"
                    },
                    {
                        id: "1_6",
                        tid: "",
                        text: "Bảo tàng",
                        icon: "●",
                        color: "#C08B16"
                    }
                ]
            },
            {
                id: "2",
                text: "Du lịch",
                type: "point",
                children: [
                    {
                        id: "2_1",
                        tid: "2",
                        text: "Khu du lịch",
                        icon: "■",
                        color: "#096"
                    },
                    {
                        id: "2_2",
                        tid: "3",
                        text: "Điểm du lịch",
                        icon: "■",
                        color: "#1447E6"
                    },
                    {
                        id: "2_3",
                        tid: "",
                        text: "Tour du lịch",
                        icon: "■",
                        color: "#FFB900"
                    },
                    {
                        id: "2_4",
                        tid: "4",
                        text: "Ăn uống",
                        icon: "■",
                        color: "#00A6F4"
                    },
                    {
                        id: "2_5",
                        tid: "",
                        text: "Thể thao",
                        icon: "■",
                        color: "#FF6900"
                    },
                    {
                        id: "2_6",
                        tid: "",
                        text: "Chăm sóc sức khỏe",
                        icon: "■",
                        color: "#A6CC00"
                    },
                    {
                        id: "2_7",
                        tid: "",
                        text: "Vận tải",
                        icon: "■",
                        color: "#C08B16"
                    },
                    {
                        id: "2_8",
                        tid: "",
                        text: "Vui chơi, giải trí",
                        icon: "■",
                        color: "#860ACE"
                    },
                    {
                        id: "2_9",
                        tid: "",
                        text: "Mua sắm",
                        icon: "■",
                        color: "#CC00C8"
                    },
                    {
                        id: "2_10",
                        tid: "5",
                        text: "Cơ sở lưu trú du lịch",
                        icon: "■",
                        color: "#B85227"
                    },
                    {
                        id: "2_11",
                        tid: "",
                        text: "Doanh nghiệp lữ hành",
                        icon: "■",
                        color: "#B3A82B"
                    },
                    {
                        id: "2_12",
                        tid: "",
                        text: "Vệ sinh công cộng",
                        icon: "■",
                        color: "#81C512"
                    },
                    {
                        id: "2_13",
                        tid: "",
                        text: "Điểm giao dịch",
                        icon: "■",
                        color: "#0A0D99"
                    }
                ]
            },
            {
                id: "3",
                text: "Thể thao",
                type: "point",
                children: [
                    {
                        id: "3_1",
                        tid: "",
                        text: "Liên đoàn thể thao",
                        icon: "◆",
                        color: "#FF6900"
                    },
                    {
                        id: "3_2",
                        tid: "",
                        text: "Hiệp hội thể thao",
                        icon: "◆",
                        color: "#096"
                    },
                    {
                        id: "3_3",
                        tid: "",
                        text: "Hội thể thao",
                        icon: "◆",
                        color: "#FFB900"
                    },
                    {
                        id: "3_4",
                        tid: "",
                        text: "Địa điểm thể thao",
                        icon: "◆",
                        color: "#E31400"
                    }
                ]
            },
            {
                id: "4",
                text: "Báo chí - Xuất bản",
                type: "point",
                children: [
                    {
                        id: "4_1",
                        tid: "",
                        text: "Cơ quan báo chí",
                        icon: "⬟",
                        color: "#00A6F4"
                    },
                    {
                        id: "4_2",
                        tid: "",
                        text: "Nhà xuất bản",
                        icon: "⬟",
                        color: "#096"
                    },
                    {
                        id: "4_3",
                        tid: "",
                        text: "Sự kiện hoạt động báo chí",
                        icon: "⬟",
                        color: "#FF6900"
                    }
                ]
            }
        ];


        let tree = new Tree('#map-sidebar', {
            data: treeData,
            closeDepth: 2,
            values: ['1_1', '1_2', '1_3', '1_4', '1_5', '1_6', 
                    '2_1', '2_2', '2_3', '2_4', '2_5', '2_6', '2_7', '2_8', '2_9', '2_10', '2_11', '2_12', '2_13',
                    '3_1', '3_2', '3_3', '3_4', 
                    '4_1', '4_2', '4_3']
        });

        // Danh sách biểu tượng Văn hóa 
        const symbolVH_LichSuVanHoa = {
            type: "simple-marker",
            style: 'circle',
            color: "#FF6900",
            size: "16px",
            outline: {
                color: [255, 255, 255],
                width: 2
            }
        };
        const symbolVH_DanhLamThangCanh = {
            type: "simple-marker",
            style: 'circle',
            color: "#096",
            size: "16px",
            outline: {
                color: [255, 255, 255],
                width: 2
            }
        };
        const symbolVH_KienTrucNgheThuat = {
            type: "simple-marker",
            style: 'circle',
            color: "#FFB900",
            size: "16px",
            outline: {
                color: [255, 255, 255],
                width: 2
            }
        };
        const symbolVH_KhaoCo = {
            type: "simple-marker",
            style: 'circle',
            color: "#E31400",
            size: "16px",
            outline: {
                color: [255, 255, 255],
                width: 2
            }
        };
        const symbolVH_DonViNgheThuat = {
            type: "simple-marker",
            style: 'circle',
            color: "#1447E6",
            size: "16px",
            outline: {
                color: [255, 255, 255],
                width: 2
            }
        };
        const symbolVH_SuKien = {
            type: "simple-marker",
            style: 'circle',
            color: "#860ACE",
            size: "16px",
            outline: {
                color: [255, 255, 255],
                width: 2
            }
        };
        const symbolVH_LeHoi = {
            type: "simple-marker",
            style: 'circle',
            color: "#CC00C8",
            size: "16px",
            outline: {
                color: [255, 255, 255],
                width: 2
            }
        };
        const symbolVH_ThuVien = {
            type: "simple-marker",
            style: 'circle',
            color: "#A6CC00",
            size: "16px",
            outline: {
                color: [255, 255, 255],
                width: 2
            }
        };
        const symbolVH_BaoTang = {
            type: "simple-marker",
            style: 'circle',
            color: "#C08B16",
            size: "16px",
            outline: {
                color: [255, 255, 255],
                width: 2
            }
        };

        // Danh sách biểu tượng Du lịch
        const symbolDL_KhuDuLich = {
            type: "picture-marker",
            url: `${baseUrl}/assets/images/icons/diemThamQuan.png`,
            width: "28px",
            height: "28px"
        };
        const symbolDL_DiemDuLich = {
            type: "picture-marker",
            url: `${baseUrl}/assets/images/icons/diemThamQuan.png`,
            width: "28px",
            height: "28px"
        };
        const symbolDL_TourDuLich = {
            type: "simple-marker",
            style: 'square',
            color: "#FFB900",
            size: "16px",
            outline: {
                color: [255, 255, 255],
                width: 2
            }
        };
        const symbolDL_CSAnUong = {
            type: "picture-marker",
            url: `${baseUrl}/assets/images/icons/NhaHang.png`,
            width: "28px",
            height: "28px"
        };
        const symbolDL_CSTheThao = {
            type: "picture-marker",
            url: `${baseUrl}/assets/images/icons/theThao.png`,
            width: "28px",
            height: "28px"
        };
        const symbolDL_CSChamSocSK = {
            type: "picture-marker",
            url: `${baseUrl}/assets/images/icons/chamSocSucKhoe.png`,
            width: "28px",
            height: "28px"
        };
        const symbolDL_CSVanTai = {
            type: "picture-marker",
            url: `${baseUrl}/assets/images/icons/vanTai.png`,
            width: "28px",
            height: "28px"
        };
        const symbolDL_CSVuiChoiGiaiTri = {
            type: "picture-marker",
            url: `${baseUrl}/assets/images/icons/vuiChoiGiaiTri.png`,
            width: "28px",
            height: "28px"
        };
        const symbolDL_CSMuaSam = {
            type: "picture-marker",
            url: `${baseUrl}/assets/images/icons/muaSam.png`,
            width: "28px",
            height: "28px"
        };
        const symbolDL_CSLuuTru = {
            type: "picture-marker",
            url: `${baseUrl}/assets/images/icons/luuTru.png`,
            width: "28px",
            height: "28px"
        };
        const symbolDL_CSLuHanh = {
            type: "simple-marker",
            style: 'square',
            color: "#B3A82B",
            size: "16px",
            outline: {
                color: [255, 255, 255],
                width: 2
            }
        };
        const symbolDL_NhaVSCongCong = {
            type: "simple-marker",
            style: 'square',
            color: "#81C512",
            size: "16px",
            outline: {
                color: [255, 255, 255],
                width: 2
            }
        };
        const symbolDL_DiemGiaoDich = {
            type: "simple-marker",
            style: 'square',
            color: "#0A0D99",
            size: "16px",
            outline: {
                color: [255, 255, 255],
                width: 2
            }
        };

        // Danh sách biểu tượng Thể thao
        const symbolTT_LienDoanTheThao = {
            type: "simple-marker",
            style: 'diamond',
            color: "#FF6900",
            size: "16px",
            outline: {
                color: [255, 255, 255],
                width: 2
            }
        };
        const symbolTT_HiepHoiTheThao = {
            type: "simple-marker",
            style: 'diamond',
            color: "#096",
            size: "16px",
            outline: {
                color: [255, 255, 255],
                width: 2
            }
        };
        const symbolTT_HoiTheThao = {
            type: "simple-marker",
            style: 'diamond',
            color: "#FFB900",
            size: "16px",
            outline: {
                color: [255, 255, 255],
                width: 2
            }
        };
        const symbolTT_DiaDiemTheThao = {
            type: "simple-marker",
            style: 'diamond',
            color: "#E31400",
            size: "16px",
            outline: {
                color: [255, 255, 255],
                width: 2
            }
        };

        // Danh sách biểu tượng Báo chí - xuất bản
        const symbolBCXB_CoQuanBaoChi = {
            type: "simple-marker",
            style: "path",
            path: "M 0 -10 L 9.5 -3 L 5.9 8 L -5.9 8 L -9.5 -3 Z",
            color: "#00A6F4",
            size: "16px",
            outline: {
                color: [255, 255, 255],
                width: 2
            }   
        };
        const symbolBCXB_NhaXuatBan = {
            type: "simple-marker",
            style: "path",
            path: "M 0 -10 L 9.5 -3 L 5.9 8 L -5.9 8 L -9.5 -3 Z",
            color: "#096",
            size: "16px",
            outline: {
                color: [255, 255, 255],
                width: 2
            }   
        };
        const symbolBCXB_SuKien = {
            type: "simple-marker",
            style: "path",
            path: "M 0 -10 L 9.5 -3 L 5.9 8 L -5.9 8 L -9.5 -3 Z",
            color: "#FF6900",
            size: "16px",
            outline: {
                color: [255, 255, 255],
                width: 2
            }   
        };

        const basicSymbol = {
            type: "simple-marker",
            style: 'circle',
            color: "#096",
            size: "16px",
            outline: {
                color: [255, 255, 255],
                width: 2
            }
        };


        $("#map-search").keyup(function (event) {
            if (event.keyCode === 13) {
                getData();
            }
        });

        function getAllData(lang) {
            $.ajax({
                type: 'GET',
                async: false,
                url: `${baseUrl}/api/CSDL_JsonApi/JsonMap?MaNgonNgu=${lang}`,
                contentType: 'application/json; charset=utf-8',
                success: function (data) {
                    if (data) {
                        console.log(data, 'data');
                        fullData = data.value;
                        renderData = data.value;
                    }
                },
                error: function (err) {
                    //console.log("end fetch")
                    alert('Lỗi.');
                }
            });
        };

        getAllData(lang);

        $('#language').on('change', async function (e) {
            lang = $(this).val();
            localStorage.setItem('lang', lang || "vi");
            getAllData(lang);
            getData();
        })

        function filterData(data, keyword, types) {
            // Lấy danh sách tid từ tree values
            const selectedTids = getTidsFromTreeValues(types);
            
            return data.filter(item => {
                // Filter theo keyword trong tên
                const matchKeyword = !keyword || 
                    (item.tenDoiTuong && item.tenDoiTuong.toLowerCase().includes(keyword.toLowerCase()));
                
                // Filter theo typeIcon (tid) đã chọn trong tree
                const matchType = selectedTids.length === 0 || selectedTids.includes(item.typeIcon);
                
                return matchKeyword && matchType;
            });
        };

        // Helper function: Lấy danh sách tid từ tree.values
        function getTidsFromTreeValues(treeValues) {
            const tids = [];
            
            // Duyệt qua treeData để map id sang tid
            function extractTids(nodes) {
                nodes.forEach(node => {
                    if (node.children) {
                        extractTids(node.children);
                    }
                    if (node.tid && treeValues.includes(node.id)) {
                        tids.push(parseInt(node.tid));
                    }
                });
            }
            
            extractTids(treeData);
            return tids;
        };

        function getData() {
            if (view && view.popup) {
                view.popup.close();
            }

            const keyword = $('#map-search').val();
            const values = tree.values;

            if (renderData) {
                pointLayer.removeAll();
                textLayer.removeAll();
            }

            renderData = [];

            const filtered = filterData(fullData, keyword, values);
            if (filtered && filtered.length > 0) {
                renderData = filtered;
            }

            if (renderData) {
                let arr = [];
                let text = [];
                console.log(renderData, 'renderData');
                renderData.forEach((el) => {
                    if (
                        el.kinhDo != null && el.viDo != null && 
                        el.kinhDo != '' && el.viDo != '' &&
                        el.kinhDo > -180 && el.kinhDo < 180 &&
                        el.viDo > -90 && el.viDo < 90
                    ) {
                        const point = {
                            type: "point",
                            longitude: el.kinhDo,
                            latitude: el.viDo,
                        };
                        
                        let symbolDiaDiem = ''
                        switch (el.typeIcon) {
                            case 1:
                                symbolDiaDiem = symbolVH_LichSuVanHoa;
                                break;
                            case 2:
                                symbolDiaDiem = symbolDL_KhuDuLich;
                                break;
                            case 3:
                                symbolDiaDiem = symbolDL_DiemDuLich;
                                break;
                            case 4:
                                symbolDiaDiem = symbolDL_CSAnUong;
                                break;
                            case 5:
                                symbolDiaDiem = symbolDL_CSLuuTru;
                                break;  
                            case 6:
                                symbolDiaDiem = symbolVH_LeHoi;
                                break;
                            
                            default:
                                symbolDiaDiem = basicSymbol;  
                        }

                        const pointGraphic = new Graphic({
                            attributes: {
                                id: el.doiTuongID,
                                tenloai: el.loai,
                                loaihinh: el.typeIcon,
                                tenloaihinh: el.loaiHinh,
                                ten: el.tenDoiTuong,
                                anhdaidien: el.hinhAnh,
                                diachi: el.diaChi,
                                mota: el.moTa,
                                kinhDo: el.kinhDo,
                                viDo: el.viDo,
                            },
                            geometry: point,
                            symbol: symbolDiaDiem,
                            popupTemplate: {
                                title: '{ten}',
                                content: [
                                    {
                                        type: "custom",
                                        creator: function (event) {
                                            const url = event.graphic.attributes.anhdaidien;
                                            const div = document.createElement("div");

                                            if (url) {
                                                div.innerHTML = `
                                                    <img src='${url}' alt='Ảnh đại diện' class='anhDaiDien_Map' />
                                                `;
                                            } else {
                                                div.innerHTML = '<span>Không có ảnh đại diện</span>';
                                            }

                                            return div;
                                        }
                                    },
                                    {
                                        type: "fields",
                                        fieldInfos: [
                                            { fieldName: "ten", label: 'Tên' },
                                            { fieldName: "kinhDo", label: 'Kinh độ' },
                                            { fieldName: "viDo", label: 'Vĩ độ' },
                                            { fieldName: "tenloai", label: 'Loại' },
                                            { fieldName: "tenloaihinh", label: 'Loại hình' },
                                            { fieldName: "diachi", label: 'Địa chỉ' },
                                            { fieldName: "mota", label: 'Mô tả' }
                                        ]
                                    }
                                ],
                                actions: ACTIONFEATURE,
                            }
                        });

                        const textGraphic = new Graphic({
                            geometry: point,
                            symbol: returnTextPosition(el.tenDoiTuong, 1)
                        });

                        arr.push(pointGraphic);
                        text.push(textGraphic);
                    }
                });

                pointLayer.addMany(arr);
                textLayer.addMany(text);
            }
        };

        function returnTenLoai(type) {
            if (type == 1) {
                return 'Di sản văn hóa vật thể'
            } else if (type == 2) {
                return 'Di sản tư liệu'
            } else if (type == 3) {
                return 'Di sản phi vật thể'
            }
            return null;
        }

        function returnTextPosition(data, loai) {
            let sym = {
                type: "text",
                color: "#004E4B",
                text: `${data}`,
                font: {
                    size: 10,
                    weight: "900"
                },
                horizontalAlignment: 'center',
                xoffset: 0,
                yoffset: 10,
            }

            if (loai == 1) {
                sym = {
                    type: "text",
                    color: "#004E4B",
                    text: `${data}`,
                    font: {
                        size: 10,
                        weight: "900"
                    },
                    horizontalAlignment: 'center',
                    xoffset: 0,
                    yoffset: 10,
                }

                return sym;
            }
            else if (loai == 2) {
                sym = {
                    type: "text",
                    color: "#004E4B",
                    text: `${data}`,
                    font: {
                        size: 10,
                        weight: "900"
                    },
                    horizontalAlignment: 'center',
                    xoffset: 0,
                    yoffset: -15,
                }

                return sym;
            }
            else if (loai == 3) {
                sym = {
                    type: "text",
                    color: "#004E4B",
                    text: `${data}`,
                    font: {
                        size: 10,
                        weight: "900"
                    },
                    horizontalAlignment: 'left',
                    xoffset: 10,
                    yoffset: -2,
                }

                return sym;
            }

            console.log(sym, 'sym');
            return sym;
        }

        function returnHaloColor(loai, data) {
            let color = [255, 255, 255];
            if (loai == 1) {

            }
            else if (loai == 2) {

            }
            else if (loai == 3) {

            }

            return color;
        }

        getData();

        $('#filter-btn').on('click', function () {
            getData();
        });

        const escapeRegExpMatch = function (s) {
            return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        };

        const isExactMatch = (str, match) => {
            return new RegExp(`\\b${escapeRegExpMatch(match)}\\b`, 'i').test(str)
        };

        view.when(() => {
            view.popup.on("trigger-action", async (evt) => {
                if (evt.action.id === "images") {
                    //$('#imgContent').empty();
                    //$('#downloadContent').empty();

                    //$('.owl-carousel').owlCarousel('destroy');

                    //const mPopup = view.popup;
                    //if (mPopup && mPopup.selectedFeature && mPopup.selectedFeature.attributes) {
                    //    const id = mPopup.selectedFeature.attributes.id;
                    //    const loai = mPopup.selectedFeature.attributes.loai;

                    //    if (id && loai) {
                    //        const found = renderData.find(x => (x.ID == id && x.LoaiDiSan == loai));
                    //        if (found) {
                    //            let html = '';
                    //            let htmlDown = '';

                    //            if (!checkEmptyBlank(found.Anh1)) {
                    //                const resf = displayFiles(found.Anh1);
                    //                if (resf && resf.html && !checkEmptyBlank(resf.html)) {
                    //                    html += resf.html;
                    //                }

                    //                if (resf && resf.htmlDown && !checkEmptyBlank(resf.htmlDown)) {
                    //                    htmlDown += resf.htmlDown;
                    //                }
                    //            }

                    //            if (!checkEmptyBlank(found.Anh2)) {
                    //                const resf = displayFiles(found.Anh2);
                    //                if (resf && resf.html && !checkEmptyBlank(resf.html)) {
                    //                    html += resf.html;
                    //                }

                    //                if (resf && resf.htmlDown && !checkEmptyBlank(resf.htmlDown)) {
                    //                    htmlDown += resf.htmlDown;
                    //                }
                    //            }

                    //            if (!checkEmptyBlank(found.Anh3)) {
                    //                const resf = displayFiles(found.Anh3);
                    //                if (resf && resf.html && !checkEmptyBlank(resf.html)) {
                    //                    html += resf.html;
                    //                }

                    //                if (resf && resf.htmlDown && !checkEmptyBlank(resf.htmlDown)) {
                    //                    htmlDown += resf.htmlDown;
                    //                }
                    //            }

                    //            if (!checkEmptyBlank(found.Anh4)) {
                    //                const resf = displayFiles(found.Anh4);
                    //                if (resf && resf.html && !checkEmptyBlank(resf.html)) {
                    //                    html += resf.html;
                    //                }

                    //                if (resf && resf.htmlDown && !checkEmptyBlank(resf.htmlDown)) {
                    //                    htmlDown += resf.htmlDown;
                    //                }
                    //            }

                    //            if (!checkEmptyBlank(found.Video)) {
                    //                const resf = displayFiles(found.Video);
                    //                if (resf && resf.html && !checkEmptyBlank(resf.html)) {
                    //                    html += resf.html;
                    //                }

                    //                if (resf && resf.htmlDown && !checkEmptyBlank(resf.htmlDown)) {
                    //                    htmlDown += resf.htmlDown;
                    //                }
                    //            }

                    //            if (!checkEmptyBlank(html) || !checkEmptyBlank(htmlDown)) {
                    //                $('#imgContent').append(html);
                    //                $('#downloadContent').append(htmlDown);
                    //                $('.owl-carousel').owlCarousel({
                    //                    items: 1,
                    //                    loop: false,
                    //                    //autoplay: false,
                    //                    //autoplayTimeout: 5000,
                    //                    //autoplayHoverPause: false,
                    //                    margin: 0,
                    //                    nav: true,
                    //                    navText: ["<i class='icon icon-prev'></i>", "<i class='icon icon-next'></i>"],
                    //                    dots: false
                    //                });

                    //                $('#imgModal').modal('show');
                    //            }
                    //        }
                    //    }
                    //}

                    const mPopup = view.popup;
                    if (mPopup && mPopup.selectedFeature && mPopup.selectedFeature.attributes) {
                        console.log('trigger detail', mPopup.selectedFeature.attributes);
                        const id = mPopup.selectedFeature.attributes.id;
                        const loai = mPopup.selectedFeature.attributes.tenloaihinh;

                        if (id && loai) {
                            const url = window.location;
                            const BASEURL = url.protocol + "//" + url.hostname + ":" + url.port;
                            console.log(`${BASEURL}/DuLich/CoSoLuuTruDetail?id=${id}`)
                            switch (loai) {
                                case 'Di tích':
                                    window.open(`${BASEURL}/VanHoa/DiTichVanHoaDetail?id=${id}`, '_blank');
                                    break;
                                case 'Lễ hội':
                                    window.open(`${BASEURL}/VanHoa/LeHoiDetail?id=${id}`, '_blank');
                                    break;
                                case 'Bảo tàng':
                                    window.open(`${BASEURL}/VanHoa/ThuVienBaoTangDetail?id=${id}`, '_blank');
                                    break;
                                case 'Thư viện':
                                    window.open(`${BASEURL}/VanHoa/ThuVienBaoTangDetail?id=${id}`, '_blank');
                                    break;
                                case 'Khu du lịch':
                                    window.open(`${BASEURL}/DuLich/DiemThamQuanDetail?id=${id}`, '_blank');
                                    break;  
                                case 'Điểm du lịch':
                                    window.open(`${BASEURL}/DuLich/DiemThamQuanDetail?id=${id}`, '_blank');
                                    break;
                                case 'Cơ sở ăn uống':
                                    window.open(`${BASEURL}/DuLich/NhaHangDetail?id=${id}`, '_blank');
                                    break;
                                case 'Cơ sở lưu trú':
                                    window.open(`${BASEURL}/DuLich/LuuTruDetail?id=${id}`, '_blank');
                                    break;
                                default:
                                    alert('Chức năng đang cập nhật!');
                            }

                            //window.location.href = `${BASEURL}/Home/Detail?id=${id}&type=${loai}`;
                        }
                    }
                }
                else if (evt.action.id === "direction") { 
                    const mPopup = view.popup;
                    let mLat = null;
                    let mLong = null;

                    if (routerFlag == false) {
                        //Click tren map
                        if (mPopup.selectedFeature.geometry.latitude && mPopup.selectedFeature.geometry.longitude) {
                            routerFlag = true;

                            mLat = mPopup.selectedFeature.geometry.latitude;
                            mLong = mPopup.selectedFeature.geometry.longitude;

                            const item = arrPos.find(x => (x[0] == mLong && x[1] == mLat));
                            if (!item) {
                                if (polylineGraphic) {
                                    graphicsLayer.remove(polylineGraphic);
                                }

                                const des = [mLong, mLat];

                                locateBtn.locate()
                                    .then(function (pos) {
                                        const { latitude: curLat, longitude: curLong } = pos.coords

                                        const curr = [curLong, curLat];

                                        if (arrPos.length == 0) {
                                            arrPos.push(curr)
                                        }

                                        arrPos.push(des);

                                        var myHeaders = new Headers();
                                        myHeaders.append("Authorization", "5b3ce3597851110001cf624851a99071ab2944ee85a0f5e9f5e40c36");
                                        myHeaders.append("Content-Type", "application/json");

                                        var raw = JSON.stringify({
                                            "coordinates": arrPos,
                                            "continue_straight": "true"
                                        });

                                        var requestOptions = {
                                            method: 'POST',
                                            headers: myHeaders,
                                            body: raw,
                                            redirect: 'follow'
                                        };

                                        fetch("https://api.openrouteservice.org/v2/directions/foot-walking/geojson", requestOptions)
                                            .then(res => {
                                                return res.json()
                                            })
                                            .then(data => {
                                                routerContent = '';

                                                const { features } = data;
                                                const [resultFeature] = features;
                                                const { geometry, properties } = resultFeature;
                                                const { segments } = properties;
                                                const [segmentResult] = segments
                                                const { steps } = segmentResult
                                                const { coordinates } = geometry;

                                                segments.forEach((ele) => {
                                                    ele.steps.forEach((el) => {
                                                        if (el && el.instruction != null) {
                                                            //Chi duong hien tai
                                                            let str = el.instruction;

                                                            for (let i = 0; i < dataDirection.length; i++) {
                                                                let e = dataDirection[i];

                                                                const check = isExactMatch(str, e.en);

                                                                if (check) {

                                                                    const regex = new RegExp(`\\b${escapeRegExpMatch(e.en)}\\b`, 'i');

                                                                    let ar = str.replace(regex, e.vi);

                                                                    str = ar;
                                                                }
                                                            }

                                                            routerContent += `<p class="router-hd">${str}</p>`;
                                                        }
                                                    })
                                                })

                                                polylineGraphic = new Graphic({
                                                    geometry: new Polyline({
                                                        hasZ: false,
                                                        hasM: true,
                                                        paths: [...coordinates],
                                                    }),
                                                    symbol: {
                                                        type: "simple-line",
                                                        color: [226, 119, 40],
                                                        width: 3
                                                    }
                                                });

                                                graphicsLayer.add(polylineGraphic);

                                                routerPopup.content = routerContent;
                                                routerPopup.visible = true;

                                                routerFlag = false;
                                            })
                                            .catch(er => {
                                                console.log(er)
                                                routerFlag = false;
                                            })
                                    })
                                    .catch((error) => {
                                        console.log(error)
                                        routerFlag = false;
                                        alert('Cần cấp quyền cần thiết để sử dụng chức năng này!');
                                    })
                            } else {
                                routerFlag = false;
                            }
                        }
                    }
                }
            });
        });

        function checkEmptyBlank(str) {
            if (!str) {
                return true
            }

            if (str == null || str.toString().trim().length === 0) {
                return true
            }

            return false
        };

        function displayFiles(el) {
            let html = '';
            let htmlDown = '';

            let check = getFileType(el);
            if (check == "img") {
                html += `
                            <div class="item">
                                <img src="${el}" />
                            </div>
                        `
            }
            else if (check == "onvds") {
                html += `
                            <div class="item">
                                <iframe src="${el}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                            </div>
                        `
            }
            else if (check == 'vds') {
                html += `
                            <div class="item">
                                <video controls>
                                    <source src="${el}" type="video/mp4">
                                </video>
                            </div>
                        `
            }
            else {
                let name = getFileName(el);
                htmlDown += `
                                <a class="d-block" href="${el}" download>${name}</a>
                            `
            }

            const res = {
                html: html,
                htmlDown: htmlDown
            }

            return res;
        }

        function getFileType(name) {
            if (name.includes("doc") || name.includes("docx") || name.includes("DOC") || name.includes("DOCX")) {
                return "doc";
            }
            else if (name.includes("pdf") || name.includes("PDF")) {
                return "pdf";
            }
            else if (name.includes("xls") || name.includes("xlsx") || name.includes("XLS") || name.includes("XLSX")) {
                return "xls";
            }
            else if (name.includes("mp3") || name.includes("MP3")) {
                return "msc";
            }
            else if (name.includes("png") || name.includes("jpg") || name.includes("jpeg") || name.includes("PNG") || name.includes("JPG") || name.includes("JPEG")) {
                return "img";
            }
            else if (name.includes("youtu")) {
                return "onvds"
            }
            else if (name.includes("mov") || name.includes("mp4") || name.includes("MOV") || name.includes("MP4")) {
                return "vds";
            }
            else if (name.includes("vob") || name.includes("mts") || name.includes("VOB") || name.includes("MTS")) {
                return "vd";
            }
            else if (name.includes("stb") || name.includes("STB")) {
                return "stb";
            }
            else {
                return "nf";
            }
        }

        function getFileName(url) {
            if (url && url != "") {
                let filename = url.split('/').pop();
                if (filename) {
                    return filename;
                }
            }

            return null;
        }
    });
});