//const baseUrl = getRootLink();
//const pageSize = 10;

//$(document).ready(function () {
//    dtToChuc = []
//    getToChucSelect(SoLuongBoDuLieuToChuc);
//    function getToChucSelect(callback) {
//        const request = {
//            "classID": 7,
//        };

//        getDataWithApi('POST', `/api/MetadataApi/Gets`, JSON.stringify(request))
//            .then((data) => {
//                if (data && data.value && data.value.length > 0) {
//                    let arr = [];
//                    data.value.forEach((el) => {
//                        const res = findValueInData(0, el.data, 12);
//                        const orgUnique = findValueInData(0, el.data, 58);
//                        const show = renderDataToShow(res);

//                        const sl = {
//                            "orgUnique": orgUnique.data,
//                            "show": show
//                        };

//                        arr.push(sl);
//                    });

//                    dtToChuc = arr
//                }
//            })
//            .then(() => {
//                if (callback) {
//                    callback();
//                };
//            });
//    };
    
//    function SoLuongBoDuLieuToChuc() {
//        let request = {
//            tuKhoa: null
//        }
//        getDataWithApi('POST', `/api/ThongKeApi/GetsBoDuLieuTheoToChuc`, JSON.stringify(request))
//            .then((data) => {
//                if (data && data.value && data.value.length > 0) {

//                    let dtResponse = data.value;
//                    let toChuc = [], soLuong = [], luotXem = [], luotTai = []
//                    let tongBoDuLieu = 0, tongLuotXem = 0, tongLuotTai = 0, tongDuLieu12Sao = 0, tongDuLieu34Sao = 0

//                    // Tên tổ chức
//                    dtResponse.forEach(e => {
//                        dtToChuc.forEach(org => {
//                            if (e.uniqueCode == org.orgUnique) {
//                                e.TenToChuc = org.show
//                            }
//                        })
//                    });

//                    dtResponse.sort((a, b) => a.count > b.count);

//                    dtResponse.forEach(e => {
//                        toChuc.push(e.TenToChuc)
//                        soLuong.push(e.tongBoDuLieu)
//                        luotXem.push(e.luotXem)
//                        luotTai.push(e.luotTai)

//                        tongBoDuLieu += e.tongBoDuLieu;
//                        tongLuotTai += e.luotTai;
//                        tongLuotXem += e.luotXem;
//                        tongDuLieu12Sao += e.oneTwoStar;
//                        tongDuLieu34Sao += e.threeFourStar;
//                    })

//                    $('#tongSoBoDuLieu').text(tongBoDuLieu);
//                    $('#luotTai').text(tongLuotTai);
//                    $('#luotXem').text(tongLuotXem);
//                    $('#duLieu12Sao').text(tongDuLieu12Sao);
//                    $('#duLieu34Sao').text(tongDuLieu34Sao);

//                    loadHighcharts(toChuc, soLuong, luotXem, luotTai);
//                }
//            });
//    };

//    function loadHighcharts(tc, sl, lx, lt) {
//        let series = []
//        let plotOptions = {}

//        if (tc.length > 1) {
//            plotOptions = {
//                column: {
//                    borderRadius: '4px',
//                }
//            }

//            series = [
//                {
//                    name: 'Bộ dữ liệu',
//                    type: 'column',
//                    data: sl,
//                    color: '#0074E8'
//                },
//                {
//                    name: 'Lượt xem',
//                    type: 'spline',
//                    yAxis: 1,
//                    data: lx,
//                    color: '#0AB175',
//                    marker: {
//                        lineWidth: 2,
//                        lineColor: '#0AB175',
//                        fillColor: '#fff'
//                    }
//                }, {
//                    name: 'Lượt tải',
//                    type: 'spline',
//                    yAxis: 1,
//                    data: lt,
//                    color: '#0B4DCE',
//                    marker: {
//                        lineWidth: 2,
//                        lineColor: '#0B4DCE',
//                        fillColor: '#fff'
//                    }
//                }
//            ]
//        } else {
//            plotOptions = {
//                column: {
//                    borderRadius: '4px',
//                },
//                series: {
//                    groupPadding: 0.3
//                }
//            }

//            series = [
//                {
//                    name: 'Bộ dữ liệu',
//                    type: 'column',
//                    data: sl,
//                    color: '#0074E8',
//                },
//                {
//                    name: 'Lượt xem',
//                    type: 'column',
//                    yAxis: 1,
//                    data: lx,
//                    color: '#0AB175',
//                }, {
//                    name: 'Lượt tải',
//                    type: 'column',
//                    yAxis: 1,
//                    data: lt,
//                    color: '#F1B314',
//                }
//            ]
//        }

//        $('#containerStatistics').highcharts({
//            chart: {
//                style: {
//                    fontFamily: 'Inter Regular'
//                },
//                scrollablePlotArea: {
//                    minWidth: 110 * tc.length,
//                }
//            },
//            title: false,
//            xAxis: [{
//                categories: tc,
//                crosshair: true,
//                labels: {
//                    style: {
//                        fontFamily: 'Inter Medium',
//                        color: '#020F1F',
//                        fontSize: '16px',
//                        lineHeight: '24px',
//                        fontWeight: '500',
//                        textAlign: 'center',
//                        textOverflow: 'none',
//                    },
//                    //autoRotation: 0,
//                    //useHTML: true
//                },
//                lineWidth: 0,
//            }],
//            yAxis: [{ // Primary yAxis
//                min: 0,
//                labels: {
//                    style: {
//                        color: '#7A93B3',
//                        fontSize: '16px',
//                        lineHeight: '24px',
//                        textOverflow: 'none'
//                    }
//                },
//                title: {
//                    text: 'Bộ dữ liệu',
//                    style: {
//                        color: '#7A93B3',
//                        fontSize: '16px',
//                        lineHeight: '24px',
//                    },
//                    margin: 10
//                },
//            }, { // Secondary yAxis
//                min: 0,
//                title: {
//                    text: 'Lượt xem/Lượt tải',
//                    style: {
//                        color: '#7A93B3',
//                        fontSize: '16px',
//                        lineHeight: '24px',
//                    },
//                    margin: 10
//                },
//                labels: {
//                    style: {
//                        color: '#7A93B3',
//                        fontSize: '16px',
//                        lineHeight: '24px',
//                        textOverflow: 'none'
//                    }
//                },
//                opposite: true
//            }],
//            plotOptions: plotOptions,
//            tooltip: {
//                shared: true,
//                style: {
//                    fontSize: '14px',
//                    lineHeight: '22px',
//                    fontWeight: '400',
//                    color: '#020F1F'
//                },
//                backgroundColor: "#fff",
//                borderWidth: 0,
//                borderRadius: 4,
//                padding: 10,
//                formatter: function () {
//                    var tooltipCustomize = '<span class="text-semibold">' + this.x + '</span>';
//                    $.each(this.points, function () {
//                        let valueSuffixPoint = this.series.tooltipOptions.valueSuffix;
//                        if (valueSuffixPoint != undefined && valueSuffixPoint != null && valueSuffixPoint != '') {
//                            tooltipCustomize += '<br/><span style="color:' + this.point.color + '">\u25CF</span>&nbsp;' + this.series.name + ': <span class="text-semibold" style="color: var(--body);">' + this.y + this.series.tooltipOptions.valueSuffix + '</span>';
//                        } else {
//                            tooltipCustomize += '<br/><span style="color:' + this.point.color + '">\u25CF</span>&nbsp;' + this.series.name + ': <span class="text-semibold" style="color: var(--body);">' + this.y + '</span>';
//                        }
//                    });
//                    return tooltipCustomize;
//                },
//            },
//            legend: {
//                itemStyle: {
//                    fontSize: '16px',
//                    lineHeight: '24px',
//                    fontWeight: '400',
//                    color: '#020F1F',
//                    marginRight: '15'
//                },
//                itemHoverStyle: {
//                    'text-decoration': "none"
//                },
//                margin: 16,
//                itemDistance: 32,
//                symbolPadding: 8,
//                symbolRadius: 4,
//                symbolWidth: 33
//            },
//            exporting: false,
//            credits: {
//                enabled: false
//            },
//            series: series
//        });
//    }
  
//    const tableApiStatistic = {
//        url: `${baseUrl}/api/ThongKeApi/SoLieuHeThong`,
//        type: "POST",
//        async: false,
//        contentType: 'application/json; charset=utf-8',
//        data: JSON.stringify({tuKhoa: null}),
//        dataSrc: function (data) {
//            if (data && data.value && data.value.length > 0) {
//                data.value.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
//                return data.value;
//            }

//            return [];
//        },
//    };

//    const tableDefsStatistic = [];

//    const tableColsStatistic = [
//        { "data": "name", "width": "27%", "class": "left-align" },
//        { "data": "count", "width": "49%", "class": "center-align text-medium text-green" },
//        { "data": "total", "width": "24%", "class": "center-align text-medium text-blue" },
//    ];

//    initDataTableDashboardConfig('dataGridStatistic', tableApiStatistic, tableDefsStatistic, tableColsStatistic)


//    //bộ dữ liệu mới cập nhật gần đây
//    function buildData() {
//        const request = {
//            "pageIndex": 1,
//            "pageSize": pageSize,
//            "uniqueCode": $('#uniquecode').val()
//        };
//        return JSON.stringify(request)
//    }

//    const tableApiDatasetUpdateRecent = {
//        url: `${baseUrl}/api/ResourceApi/DatasetRecent`,
//        type: "POST",
//        contentType: 'application/json; charset=utf-8',
//        data: buildData,
//        dataSrc: function (data) {
//            if (data && data.value && data.value.length > 0) {
//                for (let i = 0; i < data.value.length; i++) {
//                    data.value[i].Stt = i + 1;
//                    data.value[i].TieuDe = data.value[i].title;
//                    data.value[i].ToChucCungCap = data.value[i].organizationName;
//                    data.value[i].ChuDe = data.value[i].catalogName;
//                    data.value[i].SoLuongBPP = data.value[i].totalDistribution;
//                    data.value[i].NgayCapNhat = moment(data.value[i].dateModified).format("DD/MM/YYYY");
//                    data.value[i].MucDoTruyCap = data.value[i].accessLevel;
//                }
//                dtAjax = data.value;
//                return data.value;
//            }
            
//            return [];
//        },
//    }

//    const tableDefsDatasetUpdateRecent = [
//        {
//            targets: 1,
//            render: function (data, type, row, meta) {
//                if (data != null && data != "") {
//                    return `<a class="text-name text-name text-dark text-medium detail-command-btn" data-toggle="modal" data-target="#modalDatasetDetail" id="${row.resourceID}">${data}</a>`;
//                }
//                return '';
//            }
//        },
//        {
//            targets: 5,
//            render: function (data, type, row, meta) {
//                if (data != null && data != "") {
//                    return `${moment(data, 'DD/MM/YYYY HH:mm:ss').format('DD/MM/YYYY')}`;
//                }
//                return '';
//            }
//        },
//        {
//            targets: 6,
//            render: function (data, type, row, meta) {
//                if (data == 1) {
//                    return '<span class="badge badge-success d-block">Công khai</span>'
//                } else {
//                    return '<span class="badge badge-secondary d-block">Không công khai</span>'
//                }
//            }
//        },
//    ];

//    const tableColsDatasetUpdateRecent = [
//        { "data": "Stt", "class": "center-align", "width": "5%" },
//        { "data": "TieuDe", "width": "31%", "class": "left-align text-medium" },
//        { "data": "ToChucCungCap", "width": "17%", "class": "left-align" },
//        { "data": "ChuDe", "width": "17%", "class": "left-align" },
//        { "data": "SoLuongBPP", "width": "10%", "class": "center-align" },
//        { "data": "NgayCapNhat", "width": "10%", "class": "center-align" },
//        { "data": "MucDoTruyCap", "width": "10%", "class": "center-align" },
//    ];

//    initDataTableDashboardConfig('dataGridDatasetUpdateRecent', tableApiDatasetUpdateRecent, tableDefsDatasetUpdateRecent, tableColsDatasetUpdateRecent)

//    $(document).on('click', '#dataGridDatasetUpdateRecent tbody .detail-command-btn', function () {
//        var id = $(this).attr("ID");
//        if (!checkEmptyBlank(id)) {
//            $('#idData').val(id);
//            loadDatasetInfo(id);
//            if (!$.fn.DataTable.isDataTable('#dataDistributionGrid')) {
//                initDataTableConfig('dataDistributionGrid', tableApiDistribution, tableDefsDistribution, tableColsDistribution)
//            } else {
//                $('#dataDistributionGrid').DataTable().ajax.reload().draw();
//            }
//            $(".modal-backdrop").first().css("z-index", "-1");
//        }
//    });

//    //chi tiết bộ dữ liệu
//    function loadDatasetInfo(id) {
//        const request = {
//            "ClassID": 2,
//            "ResourceID": id
//        };

//        $.ajax({
//            type: 'POST',
//            async: false,
//            url: `${baseUrl}/api/MetadataApi/Get`,
//            data: JSON.stringify(request),
//            dataType: 'json',
//            contentType: 'application/json; charset=utf-8',
//            success: function (response) {
//                if (response && response.value != null) {
//                    const td = findValueInData(0, response.value.data, 1, null, true);
//                    const cd = findValueInData(0, response.value.data, 68, 1, true);
//                    const tc = findValueInData(0, response.value.data, 5, 12, true);
//                    const gp = findValueInData(0, response.value.data, 7, null, true);
//                    const license = gp != null && gp.data != '' && getLicense(gp.data).length > 0 ? getLicense(gp.data)[0] : null;
//                    const mt = findValueInData(0, response.value.data, 2, null, true);
//                    const kgdl = findValueInData(0, response.value.data, 41, null, false);
//                    const tk = findValueInData(0, response.value.data, 16, null, false);
//                    const tscn = findValueInData(0, response.value.data, 21, null, true);
//                    const frequency = tscn != null && tscn.data != '' && getFrequency(tscn.data).length > 0 ? getFrequency(tscn.data)[0] : null;
//                    const mdtc = findValueInData(0, response.value.data, 60, null, true);
//                    //var item = response.value.data.filter(x => x.elementName == 'catalog');
//                    //const uri = item != null && item[0].detail && item[0].detail[0] ? `${baseUrl}/${item[0].detail[0].resourceName}/${item[0].resourceName}` : '';
//                    const nph = findValueInData(0, response.value.data, 3, null, true);
//                    const ntl = response.value.data.length > 0 ? response.value.data[0].dateCreated : '';
//                    const ncn = findValueInData(0, response.value.data, 4, null, true);
//                    const rate = findValueInData(0, response.value.data, 176, null, true);
//                    const userID = response.value.data.length > 0 ? response.value.data[0].createdUserID : 0;
//                    var userList = getUser() != null && getUser().length > 0 ? getUser().filter(x => x.id == userID) : null;
//                    //console.log(userList)
//                    var userName = userList != null && userList.length > 0 ? userList[0].displayName : '';

//                    $('#titleModal').text(td != null ? td.data : '');
//                    $('#titleDataset').text(td != null ? td.data : '');
//                    $('#catalogDataset').text(cd != null ? cd.data : '');
//                    $('#publisherDataset').text(tc != null ? tc.data : '');
//                    $('#licenseDataset').text(license != null ? license.name : '');
//                    $('#idDataset').text(id);
//                    $('#descDataset').text(mt != null ? mt.data : '');

//                    if (kgdl != null && kgdl.data.length > 0) {
//                        var geoHtml = '';
//                        kgdl.data.forEach(k => {
//                            geoHtml += `<span class="left-align text-medium">${k}</span>`;
//                        })
//                        $('#geoDataset').html(geoHtml);
//                    }

//                    if (tk != null && tk.data.length > 0) {
//                        var tkHtml = '';
//                        tk.data.forEach(k => {
//                            tkHtml += `<span class="badge badge-info mr-1">${k}</span>`;
//                        })
//                        $('#keyWordDataset').html(tkHtml);
//                    }

//                    $('#frequencyDataset').text(frequency != null ? frequency.name : '');

//                    if (mdtc != null && mdtc.data != '') {
//                        var cbHtml = '';
//                        if (mdtc.data == '1') {
//                            cbHtml = '<span class="badge badge-success">Công khai</span>'
//                        } else {
//                            cbHtml = '<span class="badge badge-secondary">Không công khai</span>'
//                        }
//                        $('#accessLevelDataset').html(cbHtml);
//                    }

//                    $('#rateDataset').text(rate != null && rate.data != '' ? rate.data : 0);

//                    var uri = '';
//                    if (response.value.data.length > 0 && response.value.data[0].resourceName != null) {
//                        uri = `${baseUrl}/dataset/${encodeURIComponent(response.value.data[0].resourceName)}`;
//                    }
//                    $('#urlDataset').html(response.value.uri != '' ? `<span class="text-blue-light text-medium">${uri}</span>` : '');

//                    $('#issuedDataset').text(nph != null && nph.data != '' ? moment(nph.data, 'DD/MM/YYYY HH:mm:ss').format('DD/MM/YYYY') : '');

//                    $('#createdDataset').text(ntl != '' ? moment(ntl).format('DD/MM/YYYY HH:mm:ss') : '');

//                    $('#createdUserDataset').text(userName != null ? userName : '');

//                    $('#modifiedDataset').text(ncn != null && ncn.data != '' ? ncn.data : '');
//                }
//            }
//        });
//    }

//    //danh sách bản phân phối
//    function buildDataDistribution() {
//        const request = {
//            "classID": 3,
//            "elementID": 22,
//            "value": $('#idData').val(),
//            "getExt": true,
//            "order": true,
//            "getParent": true,
//            "adminFilter": true
//        };

//        return JSON.stringify(request);
//    };

//    const tableApiDistribution = {
//        url: `${baseUrl}/api/MetadataApi/GetsWithParent`,
//        type: "POST",
//        contentType: 'application/json; charset=utf-8',
//        data: buildDataDistribution,
//        dataSrc: function (data) {
//            if (data && data.value && data.value.length > 0) {
//                for (let i = 0; i < data.value.length; i++) {
//                    data.value[i].stt = i + 1;
//                    data.value[i].TieuDe = "";
//                    data.value[i].GiayPhep = "";
//                    data.value[i].MoTa = "";
//                    data.value[i].NgayPhatHanh = "";
//                    data.value[i].TaiVe = "";

//                    const td = findValueInData(0, data.value[i].data, 1, null, true);
//                    data.value[i].TieuDe = td.data;

//                    const ph = findValueInData(0, data.value[i].data, 3, null, true);
//                    data.value[i].NgayPhatHanh = ph.data;

//                    const dk = findValueInData(0, data.value[i].data, 168, null, null, true, data.value[i].ext);
//                    data.value[i].TaiVe = dk;

//                    const mt = findValueInData(0, data.value[i].data, 2, null, true);
//                    data.value[i].MoTa = mt.data;

//                    const gp = findValueInData(0, data.value[i].data, 7, null, true);
//                    data.value[i].GiayPhep = gp != null && gp.data != '' && getLicense(gp.data).length > 0 ? getLicense(gp.data)[0].name : null;
//                }
//                $('#totalDistribution').text(data.value.length);

//                return data.value;
//            }
//            return [];
//        },
//    };

//    const tableDefsDistribution = [
//        {
//            targets: 1,
//            render: function (data, type, row, meta) {
//                if (data != null && data != "") {
//                    return `<a class="text-name text-name text-dark text-medium detail-command-btn" data-toggle="modal" data-target="#modalDistributionDetail" id="${row.resourceID}">${data}</a>`;
//                }
//                return '';
//            }
//        },
//        {
//            targets: 2,
//            render: function (data, type, row, meta) {
//                if (data != '') {
//                    return `${moment(data, 'DD/MM/YYYY HH:mm:ss').format('DD/MM/YYYY')}`;
//                }
//                return "";
//            }
//        },
//        {
//            targets: 3,
//            render: function (data, type, row, meta) {
//                if (data && data.isArray == true && data.data && data.data.length > 0) {
//                    return getExtensionTags(data.data);
//                }
//                else if (data && data.isArray == false && data.data) {
//                    return getExtensionTag(data.data);
//                }

//                return ``;
//            }
//        },
//        {
//            targets: 4,
//            render: function (data, type, row, meta) {
//                if (data && data.isArray == true && data.data && data.data.length > 0) {
//                    let download = '';
//                    data.data.forEach((el) => {
//                        download += `<a href="${el}" download><i data-toggle="tooltip" title="Tải về" class="icon-fluent icon_fluent_arrow_download_filled text-blue-light" ></i></a>`;
//                    });

//                    return download;
//                }
//                else if (data && data.isArray == false && data.data) {
//                    return `<a href="${data.data}" download><i data-toggle="tooltip" title="Tải về" class="icon-fluent icon_fluent_arrow_download_filled text-blue-light"></i></a>`;
//                }

//                return "";
//            }
//        }
//    ];

//    const tableColsDistribution = [
//        { "data": "stt", "width": "5%", "class": "stt-text center-align" },
//        { "data": "TieuDe", "width": "55%", "class": "left-align" },
//        // { "data": "GiayPhep", "width": "20%", "class": "left-align" },
//        // { "data": "MoTa", "width": "30%", "class": "left-align" },
//        { "data": "NgayPhatHanh", "width": "20%", "class": "center-align" },
//        { "data": "TaiVe", "width": "10%", "class": "center-align item-data__tagfile" },
//        { "data": "TaiVe", "width": "10%", "class": "center-align" }
//    ]; 

//    $(document).on('click', '#dataDistributionGrid tbody .detail-command-btn', function () {
//        var id = $(this).attr("ID");
//        if (!checkEmptyBlank(id)) {
//            $('#modalDatasetDetail').css("z-index", "1040");
//            $('#modalDistributionDetail').css("z-index", "1041");
//            //$('#idData').val(id);
//            loadDistributionInfo(id);
//            //if (!$.fn.DataTable.isDataTable('#dataDistributionGrid')) {
//            //    initDataTableConfig('dataDistributionGrid', tableApiDistribution, tableDefsDistribution, tableColsDistribution, false)
//            //} else {
//            //    $('#dataDistributionGrid').DataTable().ajax.reload().draw();
//            //}
//        }
//    });

//    //chi tiết bản phân phối
//    function loadDistributionInfo(id) {
//        const request = {
//            "ClassID": 3,
//            "ResourceID": id,
//            "getExt": true,
//            "getParent": true,
//            "adminFilter": true
//        };

//        $.ajax({
//            type: 'POST',
//            async: false,
//            url: `${baseUrl}/api/MetadataApi/Get`,
//            data: JSON.stringify(request),
//            dataType: 'json',
//            contentType: 'application/json; charset=utf-8',
//            success: function (response) {
//                if (response && response.value != null) {
//                    const td = findValueInData(0, response.value.data, 1, null, true);
//                    const gp = findValueInData(0, response.value.data, 7, null, true);
//                    const license = gp != null && gp.data != '' && getLicense(gp.data).length > 0 ? getLicense(gp.data)[0] : null;
//                    const mt = findValueInData(0, response.value.data, 2, null, true);
//                    const nph = findValueInData(0, response.value.data, 3, null, true);
//                    const ntl = response.value.data.length > 0 ? response.value.data[0].dateCreated : '';
//                    const userID = response.value.data.length > 0 ? response.value.data[0].createdUserID : 0;
//                    var userList = getUser() != null && getUser().length > 0 ? getUser().filter(x => x.id == userID) : null;
//                    var userName = userList != null && userList.length > 0 ? userList[0].displayName : '';
//                    const dk = findValueInData(0, response.value.data, 168, null, null, true, response.value.data.ext);
//                    const api = findValueInData(0, response.value.data, 170);

//                    $('#titleDistributeModal').text(td != null ? td.data : '');
//                    $('#titleDistribution').text(td != null ? td.data : '');
//                    $('#licenseDistribution').text(license != null ? license.name : '');
//                    $('#descDistribution').text(mt != null ? mt.data : '');
//                    $('#issuedDistribution').text(nph != null && nph.data != '' ? moment(nph.data, 'DD/MM/YYYY HH:mm:ss').format('DD/MM/YYYY') : '');
//                    $('#createdDistribution').text(ntl != '' ? moment(ntl).format('DD/MM/YYYY HH:mm:ss') : '');
//                    $('#createdUserDistribution').text(userName != null ? userName : '');

//                    var dkHtml = '';
//                    if (dk && dk.isArray == true && dk.data && dk.data.length > 0) {
//                        dk.data.forEach((el) => {
//                            var urlName = el.replace("/Upload\\Metadata\\", "");
//                            dkHtml += `<a href="${el}" target="_blank">
//                                        <span class="text-blue-light text-medium">${urlName}</span> 
//                                        <i data-toggle="tooltip" title="Tải về" class="icon-fluent icon_fluent_arrow_download_filled text-blue-light"></i>
//                                      </a>`;
//                        })
//                    }
//                    else if (dk && dk.isArray == false && dk.data) {
//                        var urlName = dk.data.replace("/Upload\\Metadata\\", "");
//                        dkHtml = `<a href="${dk.data}" target="_blank">
//                                    <span class="text-blue-light text-medium">${urlName}</span> 
//                                    <i data-toggle="tooltip" title="Tải về" class="icon-fluent icon_fluent_arrow_download_filled text-blue-light"></i>
//                                  </a>`;
//                    }

//                    var apiHtml = '';
//                    if (api && api.data) {
//                        apiHtml = `<a href="${api.data}" target="_blank" class="text-medium text-blue-light">${api.data}</a>`;
//                    }

//                    $('#fileDistribution').html(dkHtml);
//                    $('#apiDistribution').html(apiHtml);
//                }
//            }
//        });
//    }
//});

//function getLicense(uri) {
//    let dtLicense = [];
//    const request = {
//        "URI_ID": uri,
//    };

//    $.ajax({
//        type: 'POST',
//        async: false,
//        url: `${baseUrl}/api/CCLicenseApi/Gets`,
//        data: JSON.stringify(request),
//        dataType: 'json',
//        contentType: 'application/json; charset=utf-8',
//        success: function (response) {
//            if (response && response.value && response.value.length > 0) {
//                dtLicense = response.value;
//            }
//        }
//    });
//    return dtLicense;
//}

//function getFrequency(uri) {
//    let dtFrequency = [];
//    const request = {
//        "URI_ID": uri,
//    };

//    $.ajax({
//        type: 'POST',
//        async: false,
//        url: `${baseUrl}/api/FrequencyApi/Gets`,
//        data: JSON.stringify(request),
//        dataType: 'json',
//        contentType: 'application/json; charset=utf-8',
//        success: function (response) {
//            if (response && response.value && response.value.length > 0) {
//                dtFrequency = response.value;
//            }
//        }
//    });
//    return dtFrequency;
//}

//function getUser() {
//    const request = {};
//    let dtUser = [];

//    $.ajax({
//        type: 'POST',
//        async: false,
//        url: `${baseUrl}/api/AccessClaimsApi/Users`,
//        data: JSON.stringify(request),
//        dataType: 'json',
//        contentType: 'application/json; charset=utf-8',
//        success: function (response) {
//            if (response && response.length > 0) {
//                dtUser = response;
//            }
//        }
//    });
//    return dtUser;
//}

