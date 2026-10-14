let renderData = [];
let dataXa = [];

const url = window.location;
const BASEURL = url.protocol + "//" + url.hostname + ":" + url.port;
const IMGURL = url.protocol + "//" + url.hostname;

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
        "esri/intl",
        "esri/config"
    ], function (Map, MapView, TileLayer, FeatureLayer, GraphicsLayer, Basemap, BasemapGallery, Expand, Measurement, Search, Locate, Popup, Print, Graphic, Expand, Zoom, Point, Polyline, PictureMarkerSymbol, Query, intl, esriConfig) {
        //esriConfig.request.timeout = 600000;

        intl.setLocale("vi");

        const ACTIONFEATURE = [
            {
                title: "Tài liệu",
                id: "images",
                className: "esri-icon-media",
                type: "button",
            },
        ];

        //const baseMap = new Basemap({
        //    baseLayers: [
        //        new TileLayer({
        //            url: "https://gishue.hue.gov.vn/server/rest/services/BDHC/BASEMAPHUE/MapServer",
        //            title: "Bản đồ hành chính"
        //        })
        //    ],
        //    title: "Bản đồ hành chính",
        //    id: "bhcmap"
        //});

        const baseMap = Basemap.fromId("topo-vector");

        var map = new Map({
            basemap: baseMap,
        });

        var view = new MapView({
            container: "viewDiv",
            map: map,
            center: [107.58187424988465, 16.47854071159178],
            //scale: 36000,
            zoom: 1,
            constraints: {
                /*minZoom: 10*/
            },
            ui: {
                components: ["attribution"]
            }
        });

        const textLayer = new GraphicsLayer({
            id: "textLayer",
            //minScale: 9050
            visible: false
        });
        map.add(textLayer, 0);

        const pointLayer = new GraphicsLayer();
        map.add(pointLayer, 0);

        $('#toggleLabel').on('change', function () {
            if (this.checked) {
                textLayer.visible = true;
            } else {
                textLayer.visible = false;
            }
        });

        //view.when(() => {
        //    view.watch("zoom", (evt) => {
        //        if (Number.isInteger(evt)) {
        //            console.log(evt)
        //        }
        //    });
        //});

        //view.watch("scale", function (newScale) {
        //    console.log("scale: ", newScale);
        //});

        const queryLayer = new FeatureLayer({
            url: "https://gishue.hue.gov.vn/server/rest/services/BDHC/BASEMAPHUE/MapServer/154",
            name: "querylayer",
            visible: false
        });

        async function getDataSelectXa(layer) {
            const query = new Query();
            query.where = `1=1`;
            query.outFields = ["*"];
            query.returnGeometry = true;

            const res = await layer.queryFeatures(query);
            if (res) {
                dataXa.push(...res.features)
                //$(`#cap-xa`).empty();
                res.features.forEach((el) => {
                    $('#cap-xa').append(`<option value=${el.attributes.maDonViHanhChinh}>${el.attributes.diaDanh}</option>`)
                });
            }
        }

        getDataSelectXa(queryLayer);

        $(`#cap-xa`).on('select2:select', function (e) {
            const value = e.params.data.id;
            if (value != "-1") {
                const found = dataXa.find(x => x.attributes.maDonViHanhChinh == value);

                if (found) {
                    view.goTo({
                        center: [found.geometry.longitude, found.geometry.latitude],
                        scale: 4800
                        //zoom: 16
                    });
                }
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
        const locateBtn = new Locate({
            view: view
        });

        view.ui.add(locateBtn, {
            position: "top-right"
        });

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

        //TREE
        const treeData = [
            {
                id: "1",
                text: "Di sản vật thể",
                type: "point",
                icon: `${BASEURL}/lib/img/Do.png`,
                children: [
                    {
                        id: "1_1",
                        tid: "1",
                        text: "Di tích lịch sử",
                    },
                    {
                        id: "1_2",
                        tid: "2",
                        text: "Di tích kiến trúc nghệ thuật",
                    },
                    {
                        id: "1_3",
                        tid: "3",
                        text: "Di tích khảo cổ",
                    },
                    {
                        id: "1_4",
                        tid: "4",
                        text: "Danh lam thắng cảnh",
                    },
                ],
            },
            {
                id: "2",
                text: "Di sản tư liệu",
                type: "point",
                icon: `${BASEURL}/lib/img/Vang.png`,
                children: [
                    {
                        id: "2_1",
                        tid: "1",
                        text: "Tài liệu dạng văn bản",
                    },
                    {
                        id: "2_2",
                        tid: "2",
                        text: "Tài liệu không phải dạng văn bản",
                    },
                    {
                        id: "2_3",
                        tid: "3",
                        text: "Tài liệu nghe nhìn",
                    },
                    {
                        id: "2_4",
                        tid: "4",
                        text: "Tài liệu ảo",
                    },
                ],
            },
            {
                id: "3",
                text: "Di sản phi vật thể",
                type: "point",
                icon: `${BASEURL}/lib/img/Xanh.png`,
                children: [
                    {
                        id: "3_1",
                        tid: "1",
                        text: "Di sản truyền khẩu",
                    },
                    {
                        id: "3_2",
                        tid: "2",
                        text: "Nghệ thuật trình diễn",
                    },
                    {
                        id: "3_3",
                        tid: "3",
                        text: "Tập quán xã hội, lễ hội truyền thống",
                    },
                    {
                        id: "3_4",
                        tid: "4",
                        text: "Tri thức dân gian",
                    },
                    {
                        id: "3_5",
                        tid: "5",
                        text: "Nghề thủ công truyền thống",
                    },
                ],
            }
        ];


        let tree = new Tree('#map-sidebar', {
            data: treeData,
            closeDepth: 3,
            values: ['1_1', '1_2', '1_3', '1_4', '2_1', '2_2', '2_3', '2_4', '3_1', '3_2', '3_3', '3_4', '3_5']
        });

        //const symbolVT = {
        //    type: "picture-marker",
        //    //url: `${IMGURL}/Content/Do.png`,
        //    //url: 'https://lh3.googleusercontent.com/lFr0-3UOxyrPLngLgi3qsScDA6fqB_SHbX3NBpy1V1tX3OioJHLf8lG6PkjURAP7sJYfCkfeyEYIK7wzFeIdwuliMRCI0_uXcl-bo9UT-87aiEx9E7Lxkw0qOxVLJ69gj3FLmw4bTsWbqi2DLlTJl-TaVpW4iRpGKof-2blXcZFy5wcAb7Un2_PxJhQqfjGZwhQPTwTfHAl0PajkF3s7Uu47I9zP-tFDmGsU2gTYWCTA3pkpIAgIrASD-3uzCUuoZIYIAMipOzxdj8NMYZowGzdIgpBoiFufDk8XHtDrUzbU8wS-aHpK_4E0sr_pF-ZLq3NQnLDdXWS0hoOwjCj8pS-hx8kh1V0oTz305b4cQ3trScut_rjWTvMoTavfRLcATQcBndBb6EdQdOPiudAf3hDSo2QMVk8075eN7vM3YijhUd2uVlHYedgjsECfUW1Nzsu7RTdsgXmXwUJu0lbGWSR7xHrIMRr8wHmgU654kVqM3Hdo4FQXSO92qgAx7mLYiCyQHI0tUqoGtxwAuGH5DiD3s2AJJXDiQVJNQ94Ul0y1t4Y5nRoKYTynf-cHUtIPUoU7HFSimu7MocxN4whApRfU4awyKn79yyvimTPXVSQpSbXaw-Wx-ZupbdwKaxupqtQZ7KbXzQx2RpqAx9uLZguYB_OYFOXsDRhupFQecyeIVbwkXuR06yyw0Ie5yt1dZCx3QuoGgMHf1FY_YJVbCdr4xCyUQG_RrfEtx2gdRCnFKbW106edQvAmFO55PQliQU0zZowc-jPxy09qtUuh09cOl1jqLBRXNuJVJA6xU1WC5XHGf-t6-kKcfA4eDSyBJ8jZxuYwBN31OBjdn7NL___IGRqejFN6QMV8un_nGl3uMRONapL54FLtXPd3We4FwBPkueMep7Rd6EI_6WeO2Sr-SXpYzfAYK-8q4t1RcBjX9g6Wx3YClC4WL4gOo8-TpWy7WEynRJFh-I9uQPVDjnXS4h-L0lnUZKEZW10aF_ItWVQB-ReUGfA=s96-no?authuser=1',
        //    url: 'https://static.arcgis.com/images/Symbols/Shapes/BlackStarLargeB.png',
        //    width: "24px",
        //    height: "24px"
        //};

        //const symbolTL = {
        //    type: "picture-marker",
        //    //url: `${IMGURL}/Content/Vang.png`,
        //    //url: 'https://lh3.googleusercontent.com/NzKRnDe2JYADt_D7sN0Wg40QgqhCu_xApdXyzd36UJsckOtccxiHIw_A_z3jeYokBchBd7nOi-4Y05JO3mTlQtdnXEwthEtIXrfUoAL_9pyVp35Fm2KpZ8KQ0rczvx2nEOg7b4dANcD6Y1bhtC_SrVq6QS-x7f1iITB1ptam1JK792S_1_IPFmaxFmb2Rz4kxIvB1qNRID0NslMrTLxeYegnCFC6_vksF9VMA0fkD4EljjWvYADW4tfIdXBXxH33OGahoRo6937pDvbH2hGaSrOw8X4oKCaiI1uiviI8hZqXgmv9VyUhEO3RhXfV5yV6ANF74t8cN35K7uVd7QKJcjElkNBcHRq634kJSrLKk9zaQrehz-OvjCK1oPfkglTnyGHTqfuT-GhAOHHYuN6ARo4xmDEF8Fc6_WFdK9oed6mOEJ1ZG7riHRSv2JRoy8npj68t-mD7hPQBqp3OmgUV7WXCnY6ZC-fD4yX39K8A2Sf0721LFs832-TBzVk-zdrgybSYZ1x89KI5JWMeTGcPw_ikBren6QfmMyFJDXi6uFEn5b-nKd-ELZcPAa3EHZSROLocv553x2sorkP7bmg6McjkNVz3K2nlhncQVApcChIsPfGXZ5YWh_LPfOcu5h5696V2Y0XwqZI8lb4e7S3ZcYlrGaaFbHm09rDJ_Ydjay2A-ueVWLORobozVp4pDvzVicVQ2jPLxxY55ThggYLv6SMRDxlXdSJSX2aoRuiYyUU80bNE36nqX_XPm78VxaDDocTFM9YOgKgTbmy4hAOKCEDbrC6ORVcjz225fbRaCq0wZo75eBILFrxUNR4WC6F5c8MKW9uBpU7vgCKYDM_dcX2sft0nGvoWEpjI-KPKuChqWHn1xgBOqvAbjzl1KxQ9-In8vD6LP6luu7jPjHo3DhgW3fpAOXaK8t5PMPLtcknu_a2SPyjALbxBBOmDtsFZ2UssmERZFsAHTTS1F5ZnHpHPG7rEqN8PEXZksmULv0Qopp4U55vLtgc=s96-no?authuser=1',
        //    url: 'https://static.arcgis.com/images/Symbols/Shapes/BlackStarLargeB.png',
        //    width: "24px",
        //    height: "24px"
        //};

        //const symbolPVT = {
        //    type: "picture-marker",
        //    //url: `${IMGURL}/Content/Xanh.png`,
        //    //url: 'https://lh3.googleusercontent.com/IyBkxHZreX9rlt2WI6wiws5VpvLdhdX6hso6Jzdwr_bYo40MQE6PqzhHvgNXDdIGFsv6W1HJdjCy0kv2qNAmCogR6DgLRq-773MS_w5OEPJGMFmfcfCjhCA8ZfCOwRQ0XvRW3xmBexT8GEeCG2HBbTWKBd-5UKnayhkgR5AuYShxtImhOG62DHDzFDdwMOSKmdvuYkvHG9bAOa3xypd34v5BfrtEzw1Gr06WTV6DJ6hHCRZzJaF0HyhtqS0NPSTW7nQqSVny48iR3F9i4KMeqExl6wQJ1EL8GFkgqn0o7Jqpg-qiWK31sFp-TZIFt3DGN1-BopD0e46OKegnesLxq9j2S7GcTDjZ19K5kT6JMWpHK7Nu4BPYoElFvRj98LXr3PpiPOx8jEBZC2p85CRRGxBIBg6-1tFyvikw1YyTwU2YdqsWklzYubv3wxbo5ihArzEXSLWiwbIo-JY7-N8AjFzZCmyLCdDvi9Ma0ZFyWTGswsi0CsUum_i4d43q5WCFk6kI14zbbOwuyE5iffIyZmpbeOuHM7YoJKMQRoF4NPCnkYU7xOShNTgyPJNuC_uDFxerQKvOFksTxTqkWSIie_PI_g1Bx6tfQXQcTmsX6q4kp1I327sMFaLOJ3ea7uNEYbDWykWVPdA9Y70SbxiCMiJI4ybGSRXYgvWz7eCWkIEP6AMD_P_eAwxAjLlJBvMkYX793JrjIfIDpxeXau1BZbpASZWXlaDtbgB1umlqeEQ2_WQYHnWMYVpfnzvtgTYAFbARSYr6qHqA5yfR5JFxd8eJ8ugMEZdat-4W4tKgsK4o8CbDZTdMZJEY9nxGmghZgHEhTPc6fsSpGAwt2CiNlt7t7qBnKU1-LN8Zmw1gzOYk57lkIU09BS22GdnxtxMyxvAlwGcvXipcU-L8yncvKTd6MJqbBFnHUHlVI2ktvcd419qEgM4AADXToUa3CcuX_5cCfV5jPPbufopO_izVbRzahxRzgFP0sHayekcLa7PwOAhJWsl9kP4=s96-no?authuser=1',
        //    url: 'https://static.arcgis.com/images/Symbols/Shapes/BlackStarLargeB.png',
        //    width: "24px",
        //    height: "24px"
        //};

        //const symbolVT = {
        //    type: "picture-marker",
        //    contentType: 'image/png',
        //    url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAACxLAAAsSwGlPZapAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAABfSSURBVHgB7V1trFZVdl7nvPeDy+VDhHtBYwE/mnTU0ETpH6yJSVOnJv1RSQz9MUyamOJMk5mOVVKjNGK088dJ7UdMgT81oFU0gV927DQmmqkYE4hpB52aOCpiEAYUQbjAhffdXc++e+27zjr7nPPeCxfea1zJfs/nez7W91p7n7WJrgA45zK9Li11nj6WOqfp2t2c183+WQ1VCK47fyrncqv6b4F43xKEunohj1CNVPlf2Cf/z9R65bXVdbIqyftGcr0Gg8yCOglLiwDL1Xq/nJ+ZbaIiUUr7LFHN88TjVuXNKgI1iLk+J4Uguy8i2SKeW44m+x9//PFclkpSkupHE5QMsc3xSqnqCaKkDGTFi+rzSZ1XxdF5qt13332tsN4K6y2zXjg/EEWav3YgUErq7LPWHestybAPktjWDy27S8gXhGnkmtanloV211139SXO061ADHP/EuOkmMduXzECdOkOprjIIl0jpcDNAaFo/aHZ7UK7/fbb43lYV//3xMF1raQYadPPFd8htV6Bj2kRY1p/wg0Z3BT+AsT7P1XcM+5nZPkdX3/9dbZv3z455m6++ebs/fffj9vqf6S2PfC5FM7V+1Pr9h3sOVninPj+IMrEK5WP0UxAN7rPqBttVLVebsmSAocGjhUuHght8KabbhrEcuXKlXN42dSG1HmDqg0wUQYgGUFSRDq01JVUlHr2KqmYUpA4begC4XpXlmoK4VpPJ5EemkfkddddN8TLISyvueaaubxeano/1uU/NEmYSMiw9ATBfY3tKBhwVx2h+/esOHbpCVFDabte1aKeD9wmHF9CukIeEDqMNjIyMk8tfVuyZMl8Xs4Py3mJNkyKSLgupAMNRBBCUGAAZTMiMZQXpd9VG/ASnmgmwagUvV8fLyGdFMcrY+kRD4QI0sG9S5cu9UinSUQKkheEthDtKgZZR1u0aBGWC66++mo5b35okSAiHeF+kRikCEGGCFR2ay0OsgZczQwYZBOlPZuo50mpGcWBXm9zE8R7hIfmkR0QC2QD51ctXLhwEa8vkuWCBQuuxrpsy3k0QRhNpPlKgoaD2orEoElpFEJY22BjlRQ+ZD25/6LBFXMxGpL6XtQNFQlQQLpBfORwmkAm2tVAMi8Xz58/fzEvl6QaH/MtbPtzw/88UVRboNSWqKloL7REKOfAMlVW53q6LjOyjeASmUSzTmSCKGNs+4Kxi+oGL2vUjEZ8RLpB6Ehoo9yWDg8PL5WlNGyHNqraSLiGJYZXV5oQShKi50Qq/gAz4d2Mcc6q1PIlAZfIxyfWo9rRQZTW9aJuRMcHVSCIF870XE6TXA2EL33uuedu//jjj3/85Zdfbjt16tTPz507t398fPygM9Butz/l/b86ffr0z48cOfKz/fv3/8W2bdv+QBFlJFx3sSVEaPMCY2hCaE9JbEOu0xkzYoxT7lfiolUGN7qW4H7h+tDwgmJUFwa9rRHvkf7OO+/cywjfCqS6i4QLFy58euLEiZdwzXnz5mmpENXmCYFnEm9LubKREIoINl7Iu8kvTZsoysOJyTQ3GcL7pQrx+1SwI6IsruCweDPBsArylwAxDz744E1Hjx59mpF+ws0QgBiQJkgV37NKIuYHRpH4Qoig3VXtJWl1VGmAnbs4W6A3Y+o3XLRgaEXng/PDC2hd7xEfOM9z/OVAvAXc64svvtgGQvAzjIpEkDLU4ZnFQAsz9UueyWZaqZzcm3rWtIsTU65mS6URJKgS3170veh6cJqom9HPPvvs7y4n4i2IRNCEjfDScFUAqrELKp3RShBBcFnCa1eEcAmDKxdU+7zeg+pJIV9x/nyLfIg+OI+N6VuuRwCECNIwEhhEpEEkwaskG7ipDKuVhsq4oGtwiZw+VQdYXuerNMKwil69hxPEfORKc30VdDqdrw4dOrSJJoy0JkK0C4GxvDpSXp6NmgtqaMpId8GQuIoO7HDxQj4n6P2odrjN04Y2IH8UrqTrcYA9IuUpkZIEiZ4lsacTekESbA4sydB6vRud7yid/9CekN2OksIvAsK1Pv/8839m9bOOpgHu1Bid37OXOr/5lNyRo9TmJfE+d3ps8kGXLqF82QjlNyyn1o3LqW/VdyhbNkLTgZMnT+5kF/lHNPHuHTYJna+++qqDdTRmNMeS3AnHpQE6ICL6CFyxrwC7/WPavoIpEYD1PjpFsldeeSVjEUSHiUc8P1DODxQRzw+c8wP7dUZ6zpz/en9//600BQDSx3e9Ru3//TW3/6PpQH7jChq49+5pEeP8+fP7BwYG/ogC0gMR2hSIooiARiwBHcYLcOSeeOIJ2+Hj8egSnTXJKM6clIUb5LiB+o/ndjZMGRvUnDlcuF9EEcifMucL4s/v/s8Ch18s9P/xnTS4/t4pEUJJQkc1Z7Y7zIyOmVFLghNJCOulnjOBXK3XdTKD6yNRwP0U1M4nn3ySsxehVU+UhAMHDjw8FeSf276LTq9/kMaf331JkQ84/1+/pFPf/xs6t2N31//heGUdS+9TlPBy2D2NavfMmTMlvb958+ZMqR2/zyXc0UgAN2mxo77SF2TRktUs3JBYDP2SDReZB8zZo3iAc/MbqQvoHD5Kp3+4aUYQb2F8xwSR3eGjXZ3PzsSGw4cPb+DVjAni343fK+d8U8ZGGeo34xxUyeiyGtJcnwUpEIpEZEcCYGdoJEZEEQUXzNja+yvCDuAvQe/blrNPvZw5pCvkn//FL2mMkd/5zQG6XNA5coxO/9UmurBnX1fnj46ObuR3WsEqKWeVRCwVntHYdc3Ypc4+/PDD+P4BR1lg2EkKVKigrGJfwfAK8jFSAdw/NjaWs+rxyOZIFw8BQ9tijwdJqRYbq72tVut3qAGgcsD1VxIG1q/1tqEJzp49u2doaAgntpkInTzPO8ePH49GmV3TDhNC7EPBHsgyZYT7EvcqeT1Yf+ONN+R4wRVl9RNVDwjEof2fzxbkA6CSAE1EmDNnzhpWRX+5bNmybZxdFRzhvYHwjO1ggXHZafH/U7YzIl8TotLoUtnnzzA2B/qOuUHcThAwY47IWRxbW7ZsWbFu3brdTQSA6J/Z/I/USzD08Abqu/vO2nMYcSceffTR1c8+++xxZraCJ0RlL8lKQdIbys0N9NIpw+sB0gBKK58fkDFH+Hz4Pffc80AT8mFwzz69jXoNzm55vtEwM/IWPvTQQxsY+XbsEMEg0wSTkjmmJaCUnsjNDazhLRzGD+t+v8G5Hn8T5n6/f+vWrct5vdHlHNv40xn3dKYDiD/GnvinxvMWL1684ZFHHkGaxUb/HkRlByi5p9YlzV2xTzMTLwjAeiwLukyf43X+sWPH/DZzf4Zod82aNXewYVpANQC9744co14FeGJNcQKkYOPGjRuQYsE2u6l+NwecJbUtXqOAZu5oA7RBCOtyAeyLohbGZnrks+eTB88HuZ4W/w+ph3116sf7+hwI9Tpk8+bS8PZn/LIKYAuY2X6X373D79wOeaLoEVHRFpAs3SSCI75LKiicJ8iXwbKZFi0EXox8BCY5PJ/XX3/9D5t0/1Qi0CsJPhXCaZA6gBTs3bv3Dry77IM7rk/Bj9IeWcoAg/Fz45c6UqEzgN3PuIGoL4TgGP2UcWDir8PSUav7wf0XOBUwW+D87tc8IeqA/f57sJSkIzNlptITvn300UfotNL5iJiUizbAXlj0FLJ69hi8Hw7B/fX4xhQuSBygrKEaQEZzNkE3UsB2DwQosDRww0wK4njcIUFnEpiS5nHC+CUCKBsQl+Jasavll5wLiTdG2qFJ/Yzvqn+ZXoQmpsE7493JGF4waUhNyD7PzJKasN9IZCY8Fl0lJ+Qh7287WuK3Wvv37//TW2655d+qHnS2GN8UzNu1tdYYs0v+19dff/2/04QB7qhllTEuBWSlbGj89CNQNHS6EBGlEm/Qe7dQDcw29aOhKVnHcc8tYVl5jjgxep+2sXkIvrSO8iIhuQwB6LYUzJ07t54A6D6cpdBuyNAODg5C9fpYCEsJTsNhm0Pz4Ex/OyTAi4UQQlOH1U9cZ93ml0r/+5v19fUtpxq4nGnmSw3ut/VBI3ezFmwfB6fQCPHvpesF9a7jLq+CBOka+bDe0s3GVt0fRmP/3x/nGMBfhI1RbfTb6eHItwk6H9YzDwdjXvcwLmSXC16iQCYfHfqNyTgr2t5S8KCMsM51aCPc0ks+/7dUA1/fvZ5mK8AAwxDXnpNlGFWnjbBjdd3m9DX6B+zICd034AmShy0Jj70qsr05AGT7TLTn2BfO6BsMTcGYgqiWWQVhtAQx8uNBa09JBbt5YsCQ7wGjQC1WP36dk00YtFQYLXHq1Cn6FkgyA1g4CcbIZEENTPYJSz+w/0fQUQgchGqhm80fYCnQYtTd0w3PpW8ysBbQOPF4EodF9ukRJQCdFRUJcME9ikdghGFAQhTsQcb+BGp74J6wg1T7hLOXAPnSJbXHOSN8ULRASM244AV5nGK8EBVHFnqwcYAki2IaInTEZPBh5ZP/IFZO3wyNe8hO1j1k68YVNFuhaRAXE+Akp6QLne9BBUkuyB9I2ICJP6h0tPbtJW8RLww3VIlVIXvKElAbaWUNXNTLgHGmdYBh7WJDkR0Ou70RBs5CHCUJOauGCj1iJb0uVMNFxKLDBnC0F6/B1KexsbHPqO4lbqx/iV6GJunld98fNIhjrRDVDbQFcKaKjXgwPWIT/QHqYDxR9wWLGK1cuVKP6vLr3CHhuE9gP9VA/5rVNFuh7/e/U3uc1c17wIFss5uOBSTAOitwanLTITORjg65N5uv9kZYOhMA6IxnIyzDEKPV/28GqgEEM61Vv0ezDTCyukl9vvvuu7+CFqBikOX7A7TzAnj55Zd1RjRKgx6aqAcMeTcUvTyUGN+CxjrPp1nXr19/sMkTaq2q56RehIF7v1t7HB4Q3h0SIDFAiJM8roLzQrKtRkMUrpNrpJOiIlPQhUyejHUpHA+ekAfOBr5GdS+z9k9mXTzQpH7OnDnzFokayfOOPgb9r1zQAqjs84QR1n3Cujcs2AF/EaamvVAkGEYGcN/nf1ANQA31N3BUL0H/3Xc2qp8PPvhgJwUchASl04GqdkHVADfpc3ei+uv6hOM+nZYmo44ggqtXr36L1VBtPDCbpGBw/dra41A/eGcKOOAUPXb7dA0pTSGZUHwx4yo+2NPJuNgfYDvm1dcfCMgQ7ZWye/gAj2pgtkgBkN/E/eyQ/IyUFuB3T2EXKtxJGiIrjjrMwj4XbYD01svJoBqScuIJiVWHi8XulyaAT7k++eST25qkYPD7azm4WUG9CvnSERpoGCWNQVlvv/02PL+IA3Y/4zpsJ5V1fyHQ1cc153v9JHnqRL9AbPgujLmg0C+AbwPYFvwtB2oPUw2gg2bsB4/13PhQqMfhLX/fyP3Hjx/ftmLFisdY9frcP79vmzulOtw71uHeQcddtB3YTPloj2iyI54m0v0x8E3aAJrsF/ApiRARO9Zn0bcNH2dQoHyHO6X9f7qRAiS4Bn/4Peo1mLNxQyPyoftfffXVrRiaHjriO8ATNAKQz3hxiXKZHlSuTTs9zkpA4T+m+X1qjKjuLYuScOjQoR+wN/AkNcD49l10rgc+0ABA7w908ZUM6kqsWrXqJXY725wBkF6wqu8CCk1SPlnq+wCNfPOxXkHPwxsyAUbBFiAzeO21127F5zzUAANsDwa/1/zSMw3dIh/cf8MNN7zE6ecOI9/jQ+v+MBrOawpSXK5GQRRHPAQoeEEA0fvYh08txR2FKlLeUGGgESmXFMd27tz54yZVBAARhh7/yRVxT3FPfBXTDfLxLi+++OKfkeF4Ffm60HElw1D8PuAujIIoqB+XKlWgvCG9JDNSrvCxHnMC1A48I91Z79vhw4cfYHf1KeoCvGF++Ke+DMHlAOR55m7+SdepcvbvN7Fkb8HHeeH7MDsc3Xs/rB1EBREVh6STcm4K6r7wmaq9sfxZXdRTGFHe0NCQz/qpfoKCHsTHbPAYqBuEMCLm7fiHGVdJ4HqonOF/fapr5B87duxpRj7ewzsmixYtiu/I3mAnqJ4O8IHzxWmh4HIK82ZNn6kmPtSI61BFKkVdGLKCjgcWP8/17JLhy5lCiUeWln+ZytfykIZzO3bRhV9cuuHsQDwi8f61352SupNSBbBt/B4XKDAYOxltFfWWDK/h+sJY0EoJ6AKcWfc3D501vi+UkS8PBDfNL/nhfzQ+Pv4edQmQBujm4R3P0Bxe5hfRpdnihJrn+Oef8bp+KshHsQ6pExF8fq3/pX+kkA2QzEFAfkn1hGMFTZOUgAQUhiPKOnIdrJL0F4NxEBenaPHpEsZNetvALzHtcjWQivb//JraHx3wo9Wwrb8184hFvwNy+MuWUIu7EvvuWD1t454o0lHS+1A9wfBqp4T0ulPlCRrwWwaXrgddGKJu60DTZFFWXydOFW1CBaoRDliedj0OKJdJk6XL8OxSW9QW8Yu14/TEEE5VUDT4bJ6xybn01COuTASdhpAirboscSQCN6n37OvFoSxYL5YswzOxQ7EJzxhKlpWQj4pgpth3rCWqqijaPuC6AVppApilpqiNfnOqqQ1Nk2XmdZ3QkRdeeOH2MKKgJwCdK6Fon5QpE+T7Yq5Sqiy8W5wMQsoZKwIk50CbFjhXqA8tyNe2INaJ1pUTpX4cFYv3WSJ4lYTQ/koSAlzPEvkYhRpxUoFdl60kNfcAqWJ9iYqJKWYtMfWUCaAgtV2qGa2KdUsRv1g1N9T29yUspRI6OA9FVC934VbYIxSNJVU9F4gPz6irJHrOD6qnUMxbMWFK7dBFEaCGIJbKQghbxnJAZqwgVTcaLwjjrOtGQ+/u2LHjtpmWiBTiw3PoQt56fgFdxHuA6mfYsHgqfQ0zJSI0nFzpGZEp3k2T88GUyhirKrVRLXEbRaFtFNy+FMTANeDZ7NmzR4p3x3L2Cvme61VZ/VIFdUrPrFE5F5lsNyG9kSKumKhz5r94x8xk+Xy+SH3gnYVppWy8INdAlUV8d5zs/Nm+ffvy22677VZ8DMjh/q34LAhf5dhPY5GtxFhNDqAOcuAHpL/35ptv7rn//vs/xQhmPDuShfiyx3cFThRc8q/I126HL1sksynFlwCF8Txq3Rk8uap0w7TAGU/Iuery9YoLtCQUpEGKner5Yqjoruq5BKTAt51PQCZx8BM5BI6OTcrTq7ZEquCqaU4WqnlmYlliVa7eTmcSOd9O3kCGgVPc3iQBlakIO2LO9BkU+jblmBnU69eRH0fD5zrIGErB05BL6YQO/hjqM3L8MuTc21T8/Ee3C5ybj9uM6DY/hz+Xief3McLbSCOg5ierNN9wnKWj8E0vkmoynJCfUed2YnZTpxn0+1XhzFWkHizU5oJk/EpqvzNVFvEjBUvDw/qGkQHouAARwviimC/COou+zrG0gRz2mCIxuLXZaHtkAZEKcdiOBIJKCTmbthCPEe6PoeAqP4Mmpk4xtNGPK9ujo6Md26lCZUSTenm/S+NG4egS6qQ0lFSTcssKsQIVJ/UpqCWaNNTits5NzDOjm1chSpXEaatU3KHnE4tzitWomtI0VqoetH6nQprGejqyn2YSqnSdKwdtVTOkxqkLJaqkQAg1FWEkBplJ3fSEblSevG3Y/G9uYgK3wmx6ZKY2pERwReVA9MqA9WtddcCWJdZLKQw74Q8V55CcYwgSDbgKkgTRQ6p8fmEaQ1K+vAoU+9Wsq6l5ACwB9LslcXI5VE7qpkTNnFGQBipymZ0fOBJDxRFxHkg04WgzcaedN1L+G5EtTSbk0RNEk8pkEpVm8U6+ex1erjgkpKM0l7AhiFVPqbmDB7psen7hfipP+Jya6LlJ1RTc8S40wcyCvWnCENm/2PRFKpL2xNBJPmlmGlo7La3fp2a+s61luL30DE7NkGpjoKp3rtp3xSHBHXWnWy8jEsTMVFSaQ14hvJU4XhqpQWWkJ1WnfWY3U3NDziSkRFS5bNF+uHJnT6ZdWZk+kMoGMjaTky8tQ5PrEiWi2G7eo+dhmuJoOzEyda24TQnuNTGH5uoqFUNmPT43fQse7DxcBWmhSR1dlaOyNqlkl1y614/segq+EYSqQsBFvFzKHS4cs/e5BPecXdBNqD5Fw117r6r7dYPwb9VRApoQOBWk9Zob+f9M7sGwMplzgAAAAABJRU5ErkJggg==',
        //    width: "24px",
        //    height: "24px"
        //};

        //const symbolTL = {
        //    type: "picture-marker",
        //    contentType: 'image/png',
        //    url: 'data:image/png;base64,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',
        //    width: "24px",
        //    height: "24px"
        //};

        //const symbolPVT = {
        //    type: "picture-marker",
        //    contentType: 'image/png',
        //    url: 'data:image/png;base64,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',
        //    width: "24px",
        //    height: "24px"
        //};

        const symbolVT = {
            type: "simple-marker",
            style: 'triangle',
            color: "#F2455C",
            size: "16px",
            outline: {
                color: [255, 255, 255],
                width: 2
            }
        };

        const symbolTL = {
            type: "simple-marker",
            style: 'square',
            color: "#FEC500",
            size: "16px",
            outline: {
                color: [255, 255, 255],
                width: 2
            }
        };

        const symbolPVT = {
            type: "simple-marker",
            style: 'circle',
            color: "#26D283",
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

        function getData() {
            const keyword = $('#map-search').val();
            const values = tree.values;

            if (renderData) {
                pointLayer.removeAll();
                textLayer.removeAll();
            }

            renderData = [];

            const request = {
                "tukhoa": keyword,
                "tinh": "0",
                "huyen": "0",
                "type": 1
            };

            $.ajax({
                type: 'POST',
                async: false,
                url: '/Home/GetsMap',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(request),
                success: function (data) {
                    if (data) {
                        renderData.push(...data);
                    }
                },
                error: function (err) {
                    //console.log("end fetch")
                    alert('Lỗi.');
                }
            });

            if (renderData) {
                let arr = [];
                let text = [];

                renderData.forEach((el) => {
                    if (values.includes(el.loaihinhid)) {
                        const point = {
                            type: "point",
                            longitude: parseFloat(el.lng.replace(/,/g, '.')),
                            latitude: parseFloat(el.lat.replace(/,/g, '.')),
                        };

                        const pointGraphic = new Graphic({
                            attributes: {
                                id: el.id,
                                fid: el.fid,
                                loai: el.loai,
                                loaihinh: el.loaihinh,
                                tenloai: returnTenLoai(el.loai),
                                ten: el.ten,
                                tenkhac: el.tenkhac,
                                tenloaihinh: el.tenloaihinh,
                                tinh: el.tinh,
                                tentinh: el.tentinh,
                                huyen: el.huyen,
                                tenhuyen: el.tenhuyen,
                                xa: el.xa,
                                tenxa: el.tenxa,
                                diachi: el.diachi
                            },
                            geometry: point,
                            symbol: el.loai == 1 ? symbolVT : el.loai == 2 ? symbolTL : symbolPVT,
                            popupTemplate: {
                                title: '{ten}',
                                content: [{
                                    type: "fields",
                                    fieldInfos: [{
                                        fieldName: "ten",
                                        label: 'Tên phổ biến',
                                    }, {
                                        fieldName: "tenkhac",
                                        label: 'Tên khác',
                                    }, {
                                        fieldName: "tenloai",
                                        label: 'Loại',
                                    }, {
                                        fieldName: "tenloaihinh",
                                        label: 'Loại hình',
                                    }, {
                                        fieldName: "diachi",
                                        label: 'Địa chỉ',
                                    }, {
                                        fieldName: "tenxa",
                                        label: 'Xã',
                                    }, 
                                    //{
                                    //    fieldName: "tenhuyen",
                                    //    label: 'Huyện',
                                    //}, {
                                    //    fieldName: "tentinh",
                                    //    label: 'Tỉnh',
                                    //}
                                    ]
                                }],
                                actions: ACTIONFEATURE,
                            }
                        });

                        const textGraphic = new Graphic({
                            geometry: point,
                            symbol: returnTextPosition(el.tenviettat, el.loai)
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
                color: "#D41111",
                text: `${data}`,
                horizontalAlignment: 'center',
                xoffset: 0,
                yoffset: 10,
            }

            if (loai == 1) {
                sym = {
                    type: "text",
                    color: "#D41111",
                    text: `${data}`,
                    horizontalAlignment: 'center',
                    xoffset: 0,
                    yoffset: 10,
                }

                return sym;
            }
            else if (loai == 2) {
                sym = {
                    type: "text",
                    color: "#D41111",
                    text: `${data}`,
                    horizontalAlignment: 'center',
                    xoffset: 0,
                    yoffset: -15,
                }

                return sym;
            }
            else if (loai == 3) {
                sym = {
                    type: "text",
                    color: "#D41111",
                    text: `${data}`,
                    horizontalAlignment: 'left',
                    xoffset: 10,
                    yoffset: -2,
                }

                return sym;
            }

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

        view.when(() => {
            view.popup.on("trigger-action", async (evt) => {
                if (evt.action.id === "images") {
                    $('#imgContent').empty();
                    $('#downloadContent').empty();

                    $('.owl-carousel').owlCarousel('destroy');

                    const mPopup = view.popup;
                    if (mPopup && mPopup.selectedFeature && mPopup.selectedFeature.attributes) {
                        const id = mPopup.selectedFeature.attributes.id;
                        const loai = mPopup.selectedFeature.attributes.loai;

                        if (id && loai) {
                            const found = renderData.find(x => (x.id == id && x.loai == loai));
                            if (found) {
                                if (found.files && found.files.length > 0) {
                                    let html = '';
                                    let htmlDown = '';

                                    found.files.forEach((el) => {
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
                                    });

                                    $('#imgContent').append(html);
                                    $('#downloadContent').append(htmlDown);
                                    $('.owl-carousel').owlCarousel({
                                        items: 1,
                                        loop: false,
                                        //autoplay: false,
                                        //autoplayTimeout: 5000,
                                        //autoplayHoverPause: false,
                                        margin: 0,
                                        nav: true,
                                        navText: ["<i class='icon icon-prev'></i>", "<i class='icon icon-next'></i>"],
                                        dots: false
                                    });
                                    $('#imgModal').modal('show');
                                }
                            }
                        }
                    }
                };
            });
        });

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