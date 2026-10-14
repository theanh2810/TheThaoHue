function getRootLink() {
    const url = window.location;
    if (!checkEmptyBlank(url.port)) {
        const APIURL = url.protocol + "//" + url.hostname + ":" + url.port;
        return APIURL;
    }

    const APIURLWP = url.protocol + "//" + url.hostname;
    
    return APIURLWP;
};

const DEFAULT_LANG = "vi";

let loadingCountFlag = 0;

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateString(length) {
    let result = '';
    const charactersLength = CHARACTERS.length;
    for (let i = 0; i < length; i++) {
        result += CHARACTERS.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
};

function toggleLoadingModal(type) {
    if (Number(type) == 0) {
        //HIDE
        loadingCountFlag--;

        if (loadingCountFlag == 0) {
            if (!($('#modalLoadingData').hasClass('d-none'))) {
                $('#modalLoadingData').addClass('d-none')
            }
        }
    }
    else if (Number(type) == 1) {
        //SHOW
        if (loadingCountFlag == 0) {
            if ($('#modalLoadingData').hasClass('d-none')) {
                $('#modalLoadingData').removeClass('d-none')
            }
        }

        loadingCountFlag++;
    }
};

function initSelect2() {
    $('.select-ns').each(function() {
        $(this).select2({
            width: $(this).data('width') ? $(this).data('width') : $(this).hasClass('w-100') ? '100%' : 'style',
            language: "vi",
            placeholder: $(this).attr('placeholder') || $(this).data('placeholder') || 'Chọn...',
            minimumResultsForSearch: -1,
            dropdownParent: $('.content-wrapper').length > 0 ? $('.content-wrapper') : $('body')
        });
    });

    $('select:not(.select-ns)').each(function() {
        $(this).select2({
            width: $(this).data('width') ? $(this).data('width') : $(this).hasClass('w-100') ? '100%' : 'style',
            language: "vi",
            placeholder: $(this).attr('placeholder') || $(this).data('placeholder') || 'Chọn...',
            minimumResultsForSearch: 1,
            dropdownParent: $('.content-wrapper').length > 0 ? $('.content-wrapper') : $('body'),
            allowClear: true
        });
    });

    $('select.hid-dup-slt:not(.select-ns)').select2({
        width: $(this).data('width') ? $(this).data('width') : $(this).hasClass('w-100') ? '100%' : 'style',
        language: "vi",
        placeholder: $(this).data('placeholder'),
        dropdownParent: $('.content-wrapper').length > 0 ? $('.content-wrapper') : $('body'),
        templateResult: function (option, container) {
            //VER 1.0
            if ($(option.element).attr("data-s2hid") == "true") {
                $(container).css("display", "none");
                //$(container).prop('disabled', true);
            }

            if ($(option.element).attr("data-s2fhid") == "true") {
                $(container).css("display", "none");
                //$(container).prop('disabled', true);
            }

            //VER 2.0
            //if ($(option.element).attr("data-s2fhid") == "true") {
            //    $(container).css("display", "none");
            //    $(container).prop("disabled", true);
            //}
            //else if ($(option.element).attr("data-s2fhid") == "false") {
            //    $(option.element).prop("disabled", false);
            //}

            //if ($(option.element).attr("data-s2hid") == "true") {
            //    $(container).css("display", "none");
            //    $(option.element).prop("disabled", true);
            //}
            //else if ($(option.element).attr("data-s2hid") == "false") {
            //    $(option.element).prop("disabled", false);
            //}

            return option.text;
        }
    });
};

function initSelect2CaNhan(id, vaiTro) {
    $(`#${id}`).select2({
        width: $(this).data('width') ? $(this).data('width') : $(this).hasClass('w-100') ? '100%' : 'style',
        placeholder: $(this).data('placeholder'),
        minimumInputLength: 4,
        language: "vi",
        language: {
            noResults: function () {
                return "Không có kết quả";
            },
            searching: function () {
                return "Đang tìm kiếm…";
            },
            inputTooShort: function (args) {
                var remainingChars = args.minimum - args.input.length;
                return "Vui lòng nhập thêm ít nhất " + remainingChars + " ký tự";
            },
            inputTooLong: function (args) {
                var overChars = args.input.length - args.maximum;
                return "Vui lòng xóa bớt " + overChars + " ký tự";
            },
            errorLoading: function () {
                return "Không thể tải kết quả.";
            },
            loadingMore: function () {
                return "Đang tải thêm kết quả…";
            }
        },
        ajax: {
            url: baseUrl + '/api/CSDL_JsonApi/GetInfoByMaDinhDanh?VaiTroID=' + vaiTro,
            dataType: 'json',
            type: 'GET',
            delay: 1000,
            data: function (params) {
                return {
                    MaDinhDanh: params.term || '', 
                    MaNgonNgu: 'vi'
                };
            },
            processResults: function (data) {
                if (!data || !data.isSuccess || !data.value) {
                    return { results: [] };
                }
                const results = data.value.map(item => ({
                    id: item.maDinhDanh,                    
                    text: `${item.maDinhDanh} (${item.hoTen})` 
                }));
                console.log('Kết quả xử lý cho Select2:', results);
                return {
                    results: results
                };
            },
            cache: true  // Nên bật cache để giảm request lặp lại
        },
    });
};

function initDateTimePicker() {
    $('.dd-mm-yyyy').datetimepicker({
        "allowInputToggle": true,
        "showClose": false,
        "showClear": false,
        "showTodayButton": false,
        "format": "DD/MM/YYYY",
        "locale": 'vi',
    })

    $('.mm-yyyy').datetimepicker({
        "allowInputToggle": true,
        "showClose": false,
        "showClear": false,
        "showTodayButton": false,
        "format": "MM/YYYY",
        "locale": 'vi',
    })

    $('.yyyy').datetimepicker({
        "allowInputToggle": true,
        "showClose": false,
        "showClear": false,
        "showTodayButton": false,
        "format": "YYYY",
        "locale": 'vi',
    })

    $('.inputdatetime').datetimepicker({
        "allowInputToggle": true,
        "showClose": false,
        "showClear": false,
        "showTodayButton": false,
        "format": "DD/MM/YYYY HH:mm:ss",
        "locale": 'vi',
    })

    $('.hh-mm-ss').datetimepicker({
        "allowInputToggle": true,
        "showClose": false,
        "showClear": false,
        "showTodayButton": false,
        "format": "HH:mm:ss",
        "locale": 'vi',
    })
};
function initTooltip() {
    $('.form-label [data-toggle="tooltip"]').tooltip({
        "container": "div.content-wrapper"
    });
};

function initDatePicker() {
    if ($.datepicker && !$.datepicker._customOffsetPatched) {
        $.datepicker._customOffsetPatched = true;
        const originalCheckOffset = $.datepicker._checkOffset;
        $.datepicker._checkOffset = function (inst, offset, isFixed) {
            if (isFixed && inst.input && inst.input.length > 0) {
                var rect = inst.input[0].getBoundingClientRect();
                var dpWidth = inst.dpDiv.outerWidth();
                var dpHeight = inst.dpDiv.outerHeight();
                
                offset.top = rect.bottom;
                offset.left = rect.left;
                
                var viewHeight = document.documentElement.clientHeight;
                var viewWidth = document.documentElement.clientWidth;
                
                if (offset.left + dpWidth > viewWidth) {
                    offset.left = viewWidth - dpWidth - 10;
                }
                if (offset.left < 0) {
                    offset.left = 0;
                }
                
                if (offset.top + dpHeight > viewHeight && rect.top - dpHeight > 0) {
                    offset.top = rect.top - dpHeight;
                }
                
                return offset;
            }
            return originalCheckOffset.apply(this, arguments);
        };
    }

    $(".datepicker").datepicker({
        dateFormat: 'dd/mm/yy',
        showOtherMonths: true,
        selectOtherMonths: true,
        prevText: '',
        nextText: '',
        changeMonth: true,
        changeYear: true,
        yearRange: "-40:+40"
    });

    $(".dd-mm-yyyy").datepicker({
        dateFormat: 'dd/mm/yy',
        showOtherMonths: true,
        selectOtherMonths: true,
        prevText: '',
        nextText: '',
        changeMonth: true,
        changeYear: true,
        yearRange: "-40:+40"
    })

    if ($(".hh-mm-ss").length > 0) {
        $(".hh-mm-ss").datetimepicker({
            format: 'Y-m-d H:i:00',   // Định dạng hiển thị (YYYY-MM-DD HH:mm:ss)
            step: 1,                 // Bước của phút (hoặc giây nếu bạn có bật seconds)
            datepicker: true,        // Có chọn ngày
            timepicker: true,        // Có chọn giờ
        });
    }
}

function saveDataTablePage(tablename, sessname) {
    //click paging
    $(`#${tablename}`).on('page.dt', function () {
        const info = $(`#${tablename}`).DataTable().page.info();
        if (info) {
            let pagesize = info.length != null && Number(info.length) || 20;
            let pageindex = info.page != null && Number(info.page) || 0;
            let start = info.start != null && Number(info.start) || 0;
            let end = info.end != null && Number(info.end) || pagesize;

            setDataTablePageSession(sessname, pagesize, pageindex, start, end);
        };
    });

    //change pagesize
    $(document).on('change', `#${tablename}_wrapper .dt-length select`, function () {
        const info = $(`#${tablename}`).DataTable().page.info();
        if (info) {
            let pagesize = info.length != null && Number(info.length) || 20;
            let pageindex = info.page != null && Number(info.page) || 0;
            let start = info.start != null && Number(info.start) || 0;
            let end = info.end != null && Number(info.end) || pagesize;

            setDataTablePageSession(sessname, pagesize, pageindex, start, end);
        };
    });
};

function setDataTablePageSession(sessname, pagesize, pageindex, start, end) {
    const save = {
        "type": sessname,
        "pagesize": pagesize,
        "pageindex": pageindex,
        "start": start,
        "end": end
    };

    sessionStorage.setItem("pageData", JSON.stringify(save));
};

function setDataTablePage(tablename, sessname) {
    const pageData = sessionStorage.getItem("pageData");

    if (pageData) {
        const data = JSON.parse(pageData);

        if (data && data.type == sessname) {
            $(`#${tablename}_wrapper .dt-length select`).val(data.pagesize).trigger('change');
            $(`#${tablename}`).DataTable().page(data.pageindex).draw('page');
        }
        else {
            sessionStorage.setItem("pageData", null);
        }
    }
}

function updateDataTableControls(api) {
    const pageInfo = api.page.info();
    const wrapper = $(api.table().container());

    wrapper.find('.dt-length select').addClass('select-ns');
    wrapper.find('.dt-paging').toggle(pageInfo.length !== -1 && pageInfo.length < pageInfo.recordsDisplay);
    wrapper.find('.dataTables_bottom').toggle(pageInfo.recordsDisplay > 0);
}

function initDataTableConfig(element, api, defs, cols, order, btnCustom) {
    $(`#${element}`).DataTable({
        "pageLength": 10,
        "autoWidth": false,
        "searching": true, // Bật tính năng tìm kiếm
        "search": {
            "delay": 2000 // Độ trễ 500ms khi gõ để tránh gọi API quá nhiều
        },
        "ordering": order == null || order == false ? false : true,
        "bInfo": false,
        "bDestroy": true,
        //"bLengthChange": false,
        "lengthMenu": [5, 10, 15, 20, 25, 50, 100],
        "dom": 'rf<"dataTables_inner customize_scrollbar"t>i<"dataTables_bottom"lp>',
        //"dom": '<"dataTables_filter"f>rt<"datatable_bottom datatable_total_button"<"total"<"#total-record-tktd">>i<"dataTables_filter"lp>>',
        "filter": true,
        "order": order != null ? order : [],
        "language": {
            "sProcessing": "Đang xử lý...",
            "sLengthMenu": "_MENU_",
            "sZeroRecords": "Không có dữ liệu",
            "sEmptyTable": "Bảng trống",
            "sInfo": "Hiện dòng _START_ đến _END_ trong tổng _TOTAL_ dòng",
            "sInfoEmpty": "Hiện dòng 0 đến 0 trong tổng 0 dòng",
            "sInfoFiltered": "(lọc từ _MAX_ tổng số bản ghi)",
            "sSearch": "",
            "sSearchPlaceholder": "Nhập từ khóa...",
            "sLoadingRecords": "Đang tải...",
            "paginate": {
                next: '<i class="icon-fluent icon_fluent_chevron_right_filled"></i>',
                previous: '<i class="icon-fluent icon_fluent_chevron_left_filled"></i>'
            }
        },
        "ajax": api,
        "columnDefs": defs,
        "columns": cols,
        "buttons": [btnCustom],
        "drawCallback": function() {
            const tableApi = this.api();
            updateDataTableControls(tableApi);

            // Đánh lại số thứ tự (Stt) cho cột đầu tiên khi có search hoặc paging
            const startIndex = tableApi.page.info().start;
            tableApi.column(0, {search: 'applied', order: 'applied'}).nodes().each(function(cell, i) {
                cell.innerHTML = startIndex + i + 1;
            });
        }
    });

    $(`#${element}`).on('draw.dt', function () {
        $('[data-toggle="tooltip"]').tooltip({
            "container": $('.content-wrapper').length > 0 ? "div.content-wrapper" : "body"
        })
    });

    // Đánh lại Stt khi có tìm kiếm hoặc sắp xếp
    $(`#${element}`).DataTable().on('order.dt search.dt', function () {
        let api = $(`#${element}`).DataTable();
        let startIndex = api.page.info().start;
        api.column(0, {search: 'applied', order: 'applied'}).nodes().each(function(cell, i) {
            cell.innerHTML = startIndex + i + 1;
        });
    });

    // Thêm placeholder cho ô search
    $(`#${element}_wrapper .dt-search input`).attr('placeholder', 'Nhập từ khóa...');

    $('.dt-length select').select2({
        width: $(this).data('width') ? $(this).data('width') : $(this).hasClass('w-100') ? '100%' : 'style',
        language: "vi",
        placeholder: $(this).data('placeholder'),
        minimumResultsForSearch: Infinity,
        dropdownParent: $('.content-wrapper').length > 0 ? $('.content-wrapper') : $('body')
    });
};

function initDataTableConfigNoSearch(element, api, defs, cols, order, btnCustom) {
    $(`#${element}`).DataTable({
        "pageLength": 10,
        "autoWidth": false,
        "ordering": order == null || order == false ? false : true,
        "bInfo": false,
        "bDestroy": true,
        //"bLengthChange": false,
        "lengthMenu": [5, 10, 15, 20, 25, 50, 100],
        "dom": 'r<"dataTables_inner customize_scrollbar"t>i<"dataTables_bottom"lp>',
        //"dom": '<"dataTables_filter"f>rt<"datatable_bottom datatable_total_button"<"total"<"#total-record-tktd">>i<"dataTables_filter"lp>>',
        "filter": false,
        "order": order != null ? order : [],
        "language": {
            "sProcessing": "Đang xử lý...",
            "sLengthMenu": "_MENU_",
            "sZeroRecords": "Không có dữ liệu",
            "sEmptyTable": "Bảng trống",
            "sInfo": "Hiện dòng _START_ đến _END_ trong tổng _TOTAL_ dòng",
            "sInfoEmpty": "Hiện dòng 0 đến 0 trong tổng 0 dòng",
            "sSearch": "Tìm kiếm",
            "sLoadingRecords": "Đang tải...",
            "paginate": {
                next: '<i class="icon-fluent icon_fluent_chevron_right_filled"></i>',
                previous: '<i class="icon-fluent icon_fluent_chevron_left_filled"></i>'
            }
        },
        "ajax": api,
        "columnDefs": defs,
        "columns": cols,
        "buttons": [btnCustom],
        "drawCallback": function () {
            updateDataTableControls(this.api());
        }
    });

    $(`#${element}`).on('draw.dt', function () {
        $('[data-toggle="tooltip"]').tooltip({
            "container": $('.content-wrapper').length > 0 ? "div.content-wrapper" : "body"
        })
    });

    // $(`#${element}`).DataTable().on('order.dt search.dt', function () {
    //     let i = 1;
    //     $(`#${element}`).DataTable().cells(null, 0, { search: 'applied', order: 'applied' }).every(function (cell) {
    //         this.data(i++);
    //     });
    // }).draw();

    $('.dt-length select').select2({
        theme: 'bootstrap4',
        width: $(this).data('width') ? $(this).data('width') : $(this).hasClass('w-100') ? '100%' : 'style',
        language: "vi",
        placeholder: $(this).data('placeholder'),
        minimumResultsForSearch: Infinity,
        dropdownParent: $('.content-wrapper').length > 0 ? $('.content-wrapper') : $('body')
    });
};

function initDataTableDataSourceConfig(element, data, defs, cols, order) {
    $(`#${element}`).DataTable({
        "pageLength": 20,
        "autoWidth": false,
        "ordering": true,
        "bInfo": false,
        //"bLengthChange": false,
        "lengthMenu": [5, 10, 15, 20, 25, 50, 100],
        "dom": 'r<"dataTables_inner customize_scrollbar"t>i<"dataTables_bottom"lp>',
        //"dom": '<"dataTables_filter"f>rt<"datatable_bottom datatable_total_button"<"total"<"#total-record-tktd">>i<"dataTables_filter"lp>>',
        "filter": false,
        "order": order != null ? order : [],
        "language": {
            "sProcessing": "Đang xử lý...",
            "sLengthMenu": "_MENU_",
            "sZeroRecords": "Không có dữ liệu",
            "sEmptyTable": "Bảng trống",
            "sInfo": "Hiện dòng _START_ đến _END_ trong tổng _TOTAL_ dòng",
            "sInfoEmpty": "Hiện dòng 0 đến 0 trong tổng 0 dòng",
            "sSearch": "Tìm kiếm",
            "sLoadingRecords": "Đang tải...",
            "paginate": {
                next: '<i class="icon-fluent icon_fluent_chevron_right_filled"></i>',
                previous: '<i class="icon-fluent icon_fluent_chevron_left_filled"></i>'
            }
        },
        "dataSrc": data,
        "columnDefs": defs,
        "columns": cols,
        "drawCallback": function () {
            updateDataTableControls(this.api());
        }
    });

    $(`#${element}`).on('draw.dt', function () {
        $('[data-toggle="tooltip"]').tooltip({
            "container": $('.content-wrapper').length > 0 ? "div.content-wrapper" : "body"
        })
    });

    $('.dt-length select').select2({
        theme: 'bootstrap4',
        width: $(this).data('width') ? $(this).data('width') : $(this).hasClass('w-100') ? '100%' : 'style',
        language: "vi",
        placeholder: $(this).data('placeholder'),
        minimumResultsForSearch: Infinity,
        dropdownParent: $('.content-wrapper').length > 0 ? $('.content-wrapper') : $('body')
    });
};

function initDataTableRowGroupConfig(element, api, defs, cols, dataSrc, dataScroll) {
    var collapsedGroups = {};

    $(`#${element}`).DataTable({
        //"pageLength": 10,
        "autoWidth": false,
        "ordering": false,
        "bInfo": false,
        "bLengthChange": false,
        //"lengthMenu": [10, 15, 20, 25, 50, 100],
        //"dom": 'rti<"dataTables_bottom"lp>',
        //"dom": '<"dataTables_filter"f>rt<"datatable_bottom datatable_total_button"<"total"<"#total-record-tktd">>i<"dataTables_filter"lp>>',
        "filter": false,
        "language": {
            "sProcessing": "Đang xử lý...",
            "sLengthMenu": "_MENU_",
            "sZeroRecords": "Không có dữ liệu",
            "sEmptyTable": "Bảng trống",
            "sInfo": "Hiện dòng _START_ đến _END_ trong tổng _TOTAL_ dòng",
            "sInfoEmpty": "Hiện dòng 0 đến 0 trong tổng 0 dòng",
            "sSearch": "Tìm kiếm",
            "sLoadingRecords": "Đang tải...",
            "paginate": {
                // next: '<i class="ft-chevron-right paging-chevron">',
                // previous: '<i class="ft-chevron-left paging-chevron">'
                next: '<i class="icon-fluent icon_fluent_chevron_right_filled"></i>',
                previous: '<i class="icon-fluent icon_fluent_chevron_left_filled"></i>'
            }
        },
        "scrollY": '75vh',
        "scrollX": true,
        "scrollCollapse": true,
        "ajax": api,
        "paging": false,
        "columnDefs": defs,
        "columns": cols,
        //"scroller": true,
        // "fnDrawCallback": function(oSettings) {
        //     if (oSettings._iDisplayLength >= oSettings.fnRecordsDisplay()) {
        //         $(oSettings.nTableWrapper).find('.dataTables_paginate').hide();
        //     } else {
        //          $(oSettings.nTableWrapper).find('.dataTables_paginate').show();
        //     }
        // },
        rowGroup: {
            // Uses the 'row group' plugin
            dataSrc: dataSrc != undefined ? dataSrc : false,
            startRender: function (rows, group) {
                if (dataSrc != undefined) {
                    var collapsed = !!collapsedGroups[group];
                    var colSpan = $(`#${element}`).DataTable().columns(':visible').count();
                    
                    var data = group.substring(group.indexOf('(') + 1).replace(')', '').toLowerCase();

                    rows.nodes().each(function (r) {
                        r.style.display = collapsed ? 'none' : '';
                    });
                    var icon = collapsed ? '<i class="icon-fluent icon_fluent_chevron_down_regular"></i>' : '<i class="icon-fluent icon_fluent_chevron_up_regular"></i>';

                    // Add category name to the <tr>. NOTE: Hardcoded colspan
                    return $('<tr/>')
                        .append('<td colspan="' + (colSpan > 0 ? colSpan : 1) + '" class="bg-blue-light text-medium">' + icon + ' ' + group + '</td>')
                        .attr('data-name', group)
                        .addClass('cursor-pointer')
                        .toggleClass('collapsed', collapsed)
                        .attr('data-scroll', data == dataScroll.toLowerCase() ? dataScroll : '');
                }
                return $(`#${element} tbody tr.group.group-start`).empty().remove();
            }
        },
    });

    $(`#${element}`).on('draw.dt', function () {
        $('[data-toggle="tooltip"]').tooltip({
            "container": $('.content-wrapper').length > 0 ? "div.content-wrapper" : "body"
        })

        if (dataScroll && dataScroll != '') {
            var rowIndex = $(`#${element} tbody tr[data-scroll="${dataScroll}"]`).index();
            if (rowIndex != -1) {
                $(`#${element}`).DataTable().row(rowIndex).scrollTo();
            }
        }
    });

    $(`#${element} tbody`).on('click', 'tr.group-start', function () {
        var name = $(this).data('name');

        collapsedGroups[name] = !collapsedGroups[name];
        $(`#${element}`).DataTable().draw(false);
    });

    // $('.dataTables_length select').select2({
    //     theme: 'bootstrap4',
    //     width: $(this).data('width') ? $(this).data('width') : $(this).hasClass('w-100') ? '100%' : 'style',
    //     language: "vi",
    //     placeholder: $(this).data('placeholder'),
    //     minimumResultsForSearch: Infinity,
    //     dropdownParent: $('.content-wrapper')
    // });
}

function initDataTableFooterConfig(element, data, defs, cols, fnFooter, btnCustom) {
    // btnCustom : tùy chỉnh export file
    $(`#${element}`).DataTable({
        "pageLength": 20,
        "autoWidth": false,
        "ordering": false,
        "bInfo": false,
        "bDestroy": true,
        //"bLengthChange": false,
        "lengthMenu": [5, 10, 15, 20, 25, 50, 100],
        "dom": 'Bfr<"dataTables_inner customize_scrollbar"t>i<"dataTables_bottom"lp>',
        //"dom": '<"dataTables_filter"f>rt<"datatable_bottom datatable_total_button"<"total"<"#total-record-tktd">>i<"dataTables_filter"lp>>',
        "filter": false,
        "language": {
            "sProcessing": "Đang xử lý...",
            "sLengthMenu": "_MENU_",
            "sZeroRecords": "Không có dữ liệu",
            "sEmptyTable": "Bảng trống",
            "sInfo": "Hiện dòng _START_ đến _END_ trong tổng _TOTAL_ dòng",
            "sInfoEmpty": "Hiện dòng 0 đến 0 trong tổng 0 dòng",
            "sSearch": "Tìm kiếm",
            "sLoadingRecords": "Đang tải...",
            "paginate": {
                next: '<i class="icon-fluent icon_fluent_chevron_right_filled"></i>',
                previous: '<i class="icon-fluent icon_fluent_chevron_left_filled"></i>'
            }
        },
        "ajax": data,
        "columnDefs": defs,
        "columns": cols,
        "drawCallback": function () {
            updateDataTableControls(this.api());
        },
        "data" : data,
        "fnFooterCallback": fnFooter,
        "buttons": [ btnCustom ]
    });

    $(`#${element}`).on('draw.dt', function () {
        $('[data-toggle="tooltip"]').tooltip({
            "container": $('.content-wrapper').length > 0 ? "div.content-wrapper" : "body"
        })
    });

    $('.dt-length select').select2({
        theme: 'bootstrap4',
        width: $(this).data('width') ? $(this).data('width') : $(this).hasClass('w-100') ? '100%' : 'style',
        language: "vi",
        placeholder: $(this).data('placeholder'),
        minimumResultsForSearch: Infinity,
        dropdownParent: $('.content-wrapper').length > 0 ? $('.content-wrapper') : $('body')
    });
}

function initDataTableDashboardConfig(element, data, defs, cols) {
    $(`#${element}`).DataTable({
        //"pageLength": 10,
        "autoWidth": false,
        "ordering": false,
        "bInfo": false,
        "bLengthChange": false,
        //"lengthMenu": [10, 15, 20, 25, 50, 100],
        "dom": 'r<"dataTables_inner customize_scrollbar"t>i<"dataTables_bottom"lp>',
        "filter": false,
        "language": {
            "sProcessing": "Đang xử lý...",
            "sLengthMenu": "_MENU_",
            "sZeroRecords": "Không có dữ liệu",
            "sEmptyTable": "Bảng trống",
            "sInfo": "Hiện dòng _START_ đến _END_ trong tổng _TOTAL_ dòng",
            "sInfoEmpty": "Hiện dòng 0 đến 0 trong tổng 0 dòng",
            "sSearch": "Tìm kiếm",
            "sLoadingRecords": "Đang tải...",
            "paginate": {
                next: '<i class="icon-fluent icon_fluent_chevron_right_filled"></i>',
                previous: '<i class="icon-fluent icon_fluent_chevron_left_filled"></i>'
            }
        },
        "ajax": data,
        "columnDefs": defs,
        "columns": cols,
        "drawCallback": function () {
            updateDataTableControls(this.api());
        }
    });

    $(`#${element}`).on('draw.dt', function () {
        $('[data-toggle="tooltip"]').tooltip({
            "container": $('.content-wrapper').length > 0 ? "div.content-wrapper" : "body"
        })
    });

    $('.dt-length select').select2({
        theme: 'bootstrap4',
        width: $(this).data('width') ? $(this).data('width') : $(this).hasClass('w-100') ? '100%' : 'style',
        language: "vi",
        placeholder: $(this).data('placeholder'),
        minimumResultsForSearch: Infinity,
        dropdownParent: $('.content-wrapper').length > 0 ? $('.content-wrapper') : $('body')
    });
};

// function resizeDatatable(element){
//     $(`#${element}`).DataTable().ajax.reload().draw();
//     console.log('resize')
// }

// window.addEventListener("resizeDatatable", resizeDatatable(element));

function getFileNameFromInput(name) {
    let filename = null;
    if (name && name != "") {
        filename = name.split('.').slice(0, -1).join('.');
    }

    return filename;
};

function checkEmptyBlank(str) {
    if (!str) {
        return true
    }

    if (str == null || str.toString().trim().length === 0) {
        return true
    }

    return false
};

function getFileNameFromUrl(url) {
    let filename = null;
    if (url && url != "") {
        let xuLyFile = null;
        xuLyFile = url.substring(url.lastIndexOf('\\') + 1);
        if (xuLyFile) {
            filename = xuLyFile.substring(xuLyFile.lastIndexOf('/') + 1);
        }
    }

    return filename;
};

function getExtension(filename) {
    var parts = filename.split('.');
    return parts[parts.length - 1];
};

function getExtensionTag(filename) {
    const parts = filename.split('.');
    const extensionFileExt = parts[parts.length - 1];
    const extensionFile = extensionFileExt.toLowerCase();
    let tagFileClass = "";

    if (extensionFile == 'csv' || extensionFile == 'xlsx' || extensionFile == 'xls') {
        tagFileClass = 'tagfile-success';
    } else if (extensionFile == 'doc' || extensionFile == 'docx') {
        tagFileClass = 'tagfile-info';
    } else if (extensionFile == 'json' || extensionFile == 'jpg') {
        tagFileClass = 'tagfile-warning';
    } else if (extensionFile == 'rdf') {
        tagFileClass = 'tagfile-info-dark';
    } else if (extensionFile == 'pdf') {
        tagFileClass = 'tagfile-danger';
    } else {
        tagFileClass = 'tagfile-dark';
    }

    return `<span class="tagfile ${tagFileClass}">${extensionFile}</span>`
};

function getExtensionTags(arr) {
    if (arr && arr.length > 0) {
        let extlist = [];
        arr.forEach((filename) => {
            let parts = filename.split('.');
            let extension = parts[parts.length - 1];

            extlist.push(extension);
        });

        if (extlist.length > 0) {
            let uniq = [...new Set(extlist)];

            let result = '';

            uniq.forEach((extensionFileExt) => {
                let tagFileClass = "";
                const extensionFile = extensionFileExt.toLowerCase();

                if (extensionFile == 'csv' || extensionFile == 'xlsx' || extensionFile == 'xls') {
                    tagFileClass = 'tagfile-success';
                } else if (extensionFile == 'doc' || extensionFile == 'docx') {
                    tagFileClass = 'tagfile-info';
                } else if (extensionFile == 'json' || extensionFile == 'jpg') {
                    tagFileClass = 'tagfile-warning';
                } else if (extensionFile == 'rdf') {
                    tagFileClass = 'tagfile-info-dark';
                } else if (extensionFile == 'pdf') {
                    tagFileClass = 'tagfile-danger';
                } else {
                    tagFileClass = 'tagfile-dark';
                }

                result += `<span class="tagfile ${tagFileClass}">${extensionFile}</span>`
            });

            return result;
        };
    }

    return '';
};

function getExtensionViewer(data) {
    const checkarr = Array.isArray(data);

    if (checkarr == true && data && data.length > 0) {
        let extlist = [];

        data.forEach((filename) => {
            let parts = filename.split('.');
            let extension = parts[parts.length - 1];

            extlist.push(extension);
        });

        if (extlist.length > 0) {
            let uniq = [...new Set(extlist)];

            let result = [];

            uniq.forEach((extensionFileExt) => {
                let tagFileNumber = 7;
                const extensionFile = extensionFileExt.toLowerCase();

                if (extensionFile == 'csv' || extensionFile == 'xlsx' || extensionFile == 'xls') {
                    tagFileNumber = 1;
                }
                else if (extensionFile == 'doc' || extensionFile == 'docx') {
                    tagFileNumber = 2;
                }
                else if (extensionFile == 'json') {
                    tagFileNumber = 3;
                }
                else if (extensionFile == 'jpg') {
                    tagFileNumber = 4;
                }
                else if (extensionFile == 'rdf') {
                    tagFileNumber = 5;
                }
                else if (extensionFile == 'pdf') {
                    tagFileNumber = 6;
                }

                result.push(tagFileNumber);
            });

            return result;
        };
    }
    else {
        const parts = data.split('.');
        const extensionFileExt = parts[parts.length - 1];
        const extensionFile = extensionFileExt.toLowerCase();
        let tagFileNumber = 7;

        if (extensionFile == 'csv' || extensionFile == 'xlsx' || extensionFile == 'xls') {
            tagFileNumber = 1;
        }
        else if (extensionFile == 'doc' || extensionFile == 'docx') {
            tagFileNumber = 2;
        }
        else if (extensionFile == 'json') {
            tagFileNumber = 3;
        }
        else if (extensionFile == 'jpg') {
            tagFileNumber = 4;
        }
        else if (extensionFile == 'rdf') {
            tagFileNumber = 5;
        }
        else if (extensionFile == 'pdf') {
            tagFileNumber = 6;
        }

        return tagFileNumber;
    }

    return 7;
};

function checkFileAccept(filename) {
    if (filename != null && filename != "") {
        const accept = ["doc", "docx", "pdf", "xls", "xlsx", "rtf", "ppt", "pptx", "zip", "rar"];
        let ext = getExtension(filename);
        const chk = accept.indexOf(ext.toLowerCase());

        if (chk != -1) {
            return true;
        }
    }

    return false;
};

function formatDate(date, flag) {
    if (date != null && date != "") {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear(),
            hour = d.getHours(),
            minute = d.getMinutes(),
            second = d.getSeconds()

        if (month.length < 2) month = '0' + month
        if (day.length < 2) day = '0' + day
        if (hour < 10) hour = '0' + hour
        if (minute < 10) minute = '0' + minute
        if (second < 10) second = '0' + second

        let datepart = [day, month, year].join('/');
        let timepart = [hour, minute, second].join(':');

        return `${datepart} ${timepart}`;
    }

    if (flag == 1) {
        return null;
    }

    return "";
};

//to yyyy-MM-dd
function formatDateWithoutTime(date, flag) {
    if (date != null && date != "") {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear()

        if (month.length < 2) month = '0' + month
        if (day.length < 2) day = '0' + day

        let datepart = [day, month, year].join('/');

        return `${datepart}`;
    }

    if (flag == 1) {
        return null;
    }

    return "";
};

function formatYear(date, flag) {
    if (date != null && date != "") {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear()

        if (month.length < 2) month = '0' + month
        if (day.length < 2) day = '0' + day

        let datepart = [year];

        return `${datepart}`;
    }

    if (flag == 1) {
        return null;
    }

    return "";
};

//formart dd/MM/yyyy hh:mm:ss --> dd/MM/yyyy
function formatShortDate(date, flag) {
    if (date != null && date != "") {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear()

        if (month.length < 2) month = '0' + month
        if (day.length < 2) day = '0' + day

        let shortDate = [day, month, year].join('/');

        return shortDate;
    }

    if (flag == 1) {
        return null;
    }

    return "";
};

function formatDateMonth(date, flag) {
    if (date != null && date != "") {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate()

        if (month.length < 2) month = '0' + month
        if (day.length < 2) day = '0' + day

        return [day, month].join('/');
    }

    if (flag == 1) {
        return null;
    }

    return "";
};

function formatDateSetMax(date, flag) {
    if (date != null && date != "") {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear()

        if (month.length < 2) month = '0' + month
        if (day.length < 2) day = '0' + day

        return [year, month, day].join('-');
    }

    if (flag == 1) {
        return null;
    }

    return "";
};

function formatDateToSend(date) {
    if (date != null && date != "") {
        const dateMomentObject = moment(date, "DD/MM/YYYY");
        const dateObject = dateMomentObject.toDate();

        const utcDate = new Date(Date.UTC(dateObject.getFullYear(), dateObject.getMonth(), dateObject.getDate(), dateObject.getHours(), dateObject.getMinutes()))

        return utcDate;
    }

    return null;
};

function formatDateToSendWithoutTime(date) {
    if (date != null && date != "") {
        const dateMomentObject = moment(date, "DD/MM/YYYY");
        const dateObject = dateMomentObject.toDate();

        const utcDate = new Date(Date.UTC(dateObject.getFullYear(), dateObject.getMonth(), dateObject.getDate()))

        return utcDate;
    }

    return null;
};

//Function convert date format dd/MM/yyyy HH:mm:ss -> yyyy-MM-ddTHH:mm:ss
function formatDateToSaveAsString(date) {
    if (date != null && date != "") {
        const dateMomentObject = moment(date, "DD/MM/YYYY HH:mm:ss");
        const dateObject = dateMomentObject.toDate();
        const utcDate = new Date(dateObject.toString().split('GMT')[0] + ' UTC').toISOString().split('.')[0];
        
        return utcDate;
    }

    return null;
};
function formatDateToSaveAsStringV2(date) {
    if (date != null && date != "") {
        const dateMomentObject = moment(date, "YYYY/MM/DD HH:mm:ss");
        const dateObject = dateMomentObject.toDate();
        const utcDate = new Date(dateObject.toString().split('GMT')[0] + ' UTC').toISOString().split('.')[0];

        return utcDate;
    }

    return null;
};


//dd/mm/yyyy -> yyyy-mm-dd
function formatDateToSearch(date) {
    if (date != null && date != "") {
        const newdate = date.split("/").reverse().join("-");

        return newdate;
    }

    return null;
};

//format ddMMyyyyHHmmSS
function formatDateCurrent() {
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear(),
        hour = d.getHours(),
        minute = d.getMinutes(),
        second = d.getSeconds()

    if (month.length < 2) month = '0' + month
    if (day.length < 2) day = '0' + day
    if (hour < 10) hour = '0' + hour
    if (minute < 10) minute = '0' + minute
    if (second < 10) second = '0' + second

    return `${day}${month}${year}${hour}${minute}${second}`
};

// format date to dd/MM/yyyy HH:mm:ss
function formatDateTime(date, flag) {
    if (date != null && date !== "") {
        var d = new Date(date);

        var day = ('0' + d.getDate()).slice(-2);
        var month = ('0' + (d.getMonth() + 1)).slice(-2);
        var year = d.getFullYear();

        var hours = ('0' + d.getHours()).slice(-2);
        var minutes = ('0' + d.getMinutes()).slice(-2);
        var seconds = ('0' + d.getSeconds()).slice(-2);

        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }

    if (flag === 1) {
        return null;
    }

    return "";
}

// format date to dd/MM/yyyy HH:mm:ss
function formatDateTimeWithoutHours(date, flag) {
    if (date != null && date !== "") {
        var d = new Date(date);

        var day = ('0' + d.getDate()).slice(-2);
        var month = ('0' + (d.getMonth() + 1)).slice(-2);
        var year = d.getFullYear();

        var hours = ('0' + d.getHours()).slice(-2);
        var minutes = ('0' + d.getMinutes()).slice(-2);
        var seconds = ('0' + d.getSeconds()).slice(-2);

        return `${day}/${month}/${year}`;
    }

    if (flag === 1) {
        return null;
    }

    return "";
}
function delayAction(time) {
    return new Promise(resolve => setTimeout(resolve, time));
};

function getDataWithApiNgoai(method, uri, data) {
    if (data) {
        return $.ajax({
            type: method,
            contentType: 'application/json; charset=utf-8',
            url: uri,
            data: data
        });
    }

    return $.ajax({
        type: method,
        contentType: 'application/json; charset=utf-8',
        url: uri,
    });
};

function getDataWithApi(method, uri, data) {
    const APIURL = getRootLink();

    toggleLoadingModal(1);

    if (data) {
        return $.ajax({
            type: method,
            contentType: 'application/json; charset=utf-8',
            url: APIURL + uri,
            data: data,
            error: function (err) {
                console.log(err);
                showNotification(0, 'Đã xảy ra lỗi, vui lòng thử lại sau!')
            },
            complete: function (e) {
                delayAction(100)
                    .then(() => {
                        toggleLoadingModal(0);
                    });
            }
        });
    }

    return $.ajax({
        type: method,
        contentType: 'application/json; charset=utf-8',
        url: APIURL + uri,
        complete: function (e) {
            delayAction(100)
                .then(() => {
                    toggleLoadingModal(0);
                });
        }
    });
};

function getDataWithApiHeader(method, uri, data, header) {
    const APIURL = getRootLink();

    if (data) {
        return $.ajax({
            type: method,
            contentType: 'application/json; charset=utf-8',
            headers: header,
            url: APIURL + uri,
            data: data
        });
    }

    return $.ajax({
        type: method,
        contentType: 'application/json; charset=utf-8',
        headers: header,
        url: APIURL + uri,
    });
};

function getDataWithApiNgoaiHeader(method, uri, data, header) {
    if (header) {
        if (data) {
            return $.ajax({
                type: method,
                contentType: 'application/json; charset=utf-8',
                headers: header,
                url: uri,
                data: data
            });
        }

        return $.ajax({
            type: method,
            contentType: 'application/json; charset=utf-8',
            headers: header,
            url: uri,
        });
    }
    else {
        if (data) {
            return $.ajax({
                type: method,
                contentType: 'application/json; charset=utf-8',
                url: uri,
                data: data
            });
        }

        return $.ajax({
            type: method,
            url: uri,
        });
    }
};

function getDataWithApiFormData(method, uri, data) {
    const APIURL = getRootLink();

    toggleLoadingModal(1);

    return $.ajax({
        type: method,
        url: APIURL + uri,
        processData: false,
        mimeType: "multipart/form-data",
        contentType: false,
        data: data,
        complete: function (e) {
            delayAction(100)
                .then(() => {
                    toggleLoadingModal(0);
                });
        }
    });
};

function getDupValue(arr1, arr2) {
    if (arr1 && arr1.length > 0 && arr2 && arr2.length > 0) {
        const intersections = arr1.filter(e => arr2.indexOf(e) !== -1);
        return intersections;
    }

    return null;
};

//Bỏ giá trị dup tại các select khác đã chọn trước đó
$(document).on('change', '.remove-dup-slt', function (e) {
    const current = $(this).attr('id');
    const carr = $(this).val();
    $('.remove-dup-slt').each(function (index, ele) {
        if (current != ele.id) {
            let aarr = $(ele).val();
            const res = getDupValue(carr, aarr);
            if (res && res.length > 0) {
                res.forEach((el) => {
                    const i = aarr.indexOf(el);
                    if (i > -1) {
                        aarr.splice(i, 1);
                    }
                });

                $(ele).val(aarr).trigger('change');
            }
        }
    });
});

//Ẩn giá trị này mà các select khác có thể chọn
$(document).on('change', '.hid-dup-slt', function (e) {
    const current = $(this).attr('id');
    const carr = $(this).val();
    $('.hid-dup-slt').each(function (index, ele) {
        if (current != ele.id) {
            $(ele).children(`option`).attr('data-s2hid', 'false');
            const check = Array.isArray(carr);
            if (carr && carr.length > 0 && check == true) {
                carr.forEach((el) => {
                    const checkLow = $(ele).children(`option[value="${el.toLowerCase()}"]`).length;
                    if (checkLow) {
                        $(ele).children(`option[value="${el.toLowerCase()}"]`).attr('data-s2hid', 'true');
                    }
                    else {
                        $(ele).children(`option[value="${el.toUpperCase()}"]`).attr('data-s2hid', 'true');
                    }
                });
            }
            else if (carr && check == false) {
                const checkLow = $(ele).children(`option[value="${carr.toLowerCase()}"]`).length;
                if (checkLow) {
                    $(ele).children(`option[value="${carr.toLowerCase()}"]`).attr('data-s2hid', 'true');
                }
                else {
                    $(ele).children(`option[value="${carr.toUpperCase()}"]`).attr('data-s2hid', 'true');
                }
            }
        }
    });
});

//VER 2.0
//$(document).on('change', '.hid-dup-slt', function (e) {
//    const current = $(this).attr('id');
//    const carr = $(this).val();
//    $('.hid-dup-slt').each(function (index, ele) {
//        if (current != ele.id) {
//            $(ele).children(`option`).attr('data-s2hid', 'false');
//            if (carr && carr.length > 0) {
//                carr.forEach((el) => {
//                    //Ẩn ở các select khác
//                    const checkLow = $(ele).children(`option[value="${el.toLowerCase()}"]`).length;
//                    if (checkLow) {
//                        $(ele).children(`option[value="${el.toLowerCase()}"]`).attr('data-s2hid', 'true');
//                    }
//                    else {
//                        $(ele).children(`option[value="${el.toUpperCase()}"]`).attr('data-s2hid', 'true');
//                    }
//                });
//            };
//        }
//    });
//});

//$(document).on('select2:unselect', '.hid-dup-slt', function (e) {
//    const current = $(this).attr('id');
//    const carr = $(this).val();
//    const data = e.params.data;

//    let fhid = false;
//    let hid = false;
//    const efhid = $(data.element);
//    if (efhid) {
//        fhid = $(data.element).data('s2fhid');
//        hid = $(data.element).data('s2hid');
//    }

//    if (fhid == true || fhid == 'true') {
//        $(`.hid-dup-slt option[value="${data.id.toLowerCase()}"]`).attr('data-s2fhid', 'false');
//    }

//    if (hid == true || hid == 'true') {
//        $(`.hid-dup-slt option[value="${data.id.toLowerCase()}"]`).attr('data-s2hid', 'false');
//    }
//});

function showNotification(type, message) {
    //0 - danger, 1 - success, 2 - info, 3 - warning
    $('div[data-notify="container"]').remove();
    let icon;
    switch(type) {
        case 0:
            icon = 'hgi-icon hgi-danger';
            type = 'danger';
            break;
        case 1:
            icon = 'hgi-icon hgi-success';
            type = 'success';
            break;
        case 2:
            icon = 'hgi-icon hgi-info';
            type = 'info';
            break;
        case 3:
            icon = 'hgi-icon hgi-warning';
            type = 'warning';
            break;
        default:
            icon = 'hgi-icon hgi-info';
            type = 'info';
    }

    $.notify(
        {
            icon: icon,
            message: message
        },
        {
            type: type,
            delay: 3000,
            placement: {
                from: "bottom",
                align: "center"
            },
            animate: {
                enter: 'animated fadeInDown',
                exit: 'animated fadeOutUp'
            },
        }
    );
};

function CheckTagHTML(str) {
    var regex = /<\/?[\w\s]*>|<.+[\W]>/
    return str.match(regex) == null ? false : true;
};

function previewImgUpload(input, des, pre) {
    //input đầu vào
    //id div append ảnh preview
    //id div ảnh có sẵn (trường hợp edit)
    if (input && input.files && input.files[0]) {
        if (pre != null && pre != "") {
            if (!($(`#${pre}`).hasClass('d-none'))) {
                $(`#${pre}`).addClass('d-none')
            };
        };

        var reader = new FileReader();
        reader.onload = function (e) {
            let html = `
                        <div class="imgPreview">
                            <img src="${e.target.result}" />
                            <i class="icon-fluent icon_fluent_dismiss_circle_filled delete-command-btn imgPreviewRemoveBtn" data-parent="${input.id}" data-pre="${pre != null && pre != "" && pre || ""}"></i>
                        </div>
                    `;

            $(`#${des}`).append(html);
        };

        reader.readAsDataURL(input.files[0]);
    }
};

$(document).on('click', '.imgPreviewRemoveBtn', function () {
    const input = $(this).data('parent');
    const parent = $(this).parent('.imgPreview');
    const pre = $(this).data('pre');

    if (parent) {
        parent.remove();
    };

    if (input != null && input != "") {
        $(`#${input}`).val('');
    };

    if (pre != null && pre != "") {
        if ($(`#${pre}`).hasClass('d-none')) {
            $(`#${pre}`).removeClass('d-none')
        };
    };
});

function countFieldInData(type, data, element) {
    //type = 0, find with id; = 1, find with name (OD_Element - ID/Name)
    //data - array
    //element - value need to find to count
    let result = 0;

    if (type == null) {
        type = 0;
    };

    if (data && data.length > 0) {
        let found = [];
        if (type == 0) {
            found = data.filter(x => x.elementID == element);
        }
        else {
            found = data.filter(x => x.elementName == element);
        };

        if (found && found.length > 0) {
            result = found.length;
        };
    }

    return result;
};

//------INPUT RENDER FORM

function returnButtonAddInForm(id, datatype, required, repeat, elementid) {
    //id: id wrapper
    //datatype
    //required - required OD_ClassSchema
    //repeat - repeatable OD_ClassSchema
    //elementid
    if (repeat == true) {
        const btn = `<div class="text-right">
                        <span class="add-field" data-location="${id}" data-foidt="${datatype}" data-foireq="${required}" data-foirep="${repeat}" data-foieid="${elementid}"><i class="icon-fluent icon_fluent_add_filled"></i>Thêm mới</span>
                    </div>`;

        return btn;
    }

    return '';
}


$(document).on('click', '.add-field', function () {
    const id = $(this).data('location');

    const datatype = $(this).data('foidt');
    const required = $(this).data('foireq');
    const repeat = $(this).data('foirep');
    const element = $(this).data('foieid');

    if (id) {
        const random = generateString(9);
        const inputadd = returnInputInForm(datatype, random.trim(), "", required, repeat, null, element, 1, false, 1, null, null);
        
        $(`#${id}`).append(inputadd);

        initDateTimePicker();
        initSelect2();
        initLangInput(`edt-${random.trim()}`);
    };
});

$(document).on('click', '.form-input-delete-new', function () {
    $(this).closest('.field-item').remove();
});

$(document).on('blur', '.input-int-only', function () {
    const cval = $(this).val();

    if (cval != null && cval != "") {
        $(this).val(parseInt(cval));
    };
});

$(document).on('blur', '.input-int-not-negative', function () {
    const cval = $(this).val();

    if (cval != null && cval != "") {
        if (Number(cval) < 0) {
            $(this).val(0);
            showNotification(0, 'Dữ liệu phải lớn hơn 0!');
        }
        else {
            $(this).val(parseInt(cval));
        }
    };
});

$(document).on('blur', '.input-byte', function () {
    const cval = $(this).val();

    if (cval != null && cval != "") {
        if (Number(cval) < 0) {
            $(this).val(0);
            showNotification(0, 'Dữ liệu phải lớn hơn 0!');
        }
        else if (Number(cval) > 255) {
            $(this).val(255);
            showNotification(0, 'Dữ liệu phải nhỏ hơn 255!');
        }
        else {
            $(this).val(parseInt(cval));
        }
    };
});

$(document).on('blur', '.input-num-short', function () {
    const cval = $(this).val();

    if (cval != null && cval != "") {
        if (Number(cval) < -32768) {
            $(this).val(-32768);
            showNotification(0, 'Dữ liệu phải lớn hơn -32768!');
        }
        else if (Number(cval) > 32767) {
            $(this).val(32767);
            showNotification(0, 'Dữ liệu phải nhỏ hơn 32767!');
        }
        else {
            $(this).val(parseInt(cval));
        }
    };
});

function imgUploadForm(id) {
    $(document).on('click', `#edt-${id}-ImgEdit > img`, function () {
        $(`#edt-${id}`).click();
    });

    $(document).on('change', `#edt-${id}`, function () {
        previewImgUpload(this, `edt-${id}-ImgEditPreview`, `edt-${id}-ImgEdit`);
    });

    //$(document).on('click', `#edt-${id}-ImgDelete`, function () {
    //    $(`#edt-${id}-ImgEdit img`).attr("src", "/assets/images/icons/imageUpload.png");
    //    $(`#edt-${id}-ImgEdit img`).addClass("cursor-pointer");
    //    if (!($(`#edt-${id}-ImgDelete`).hasClass('d-none'))) {
    //        $(`#edt-${id}-ImgDelete`).addClass('d-none')
    //    };

    //    $(`#edt-${id}-DeleteEdit`).val('1');
    //});
};

//------INPUT RENDER FORM

//Giáo dục -> Giao duc
function removeAccents(str) {
    return str.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D');
};

//Giáo dục -> Giao-duc
function convertToUrlTitle(str) {
    const con = str.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D');

    const result = con.replace(/ /g, '-');
    
    return result;
};

function renderDataToShow(data) {
    let result = '';

    if (data.isArray == true && data.data.length > 1) {
        result = data.data.join('; ');
    }
    else if (data.isArray == true && data.data.length == 1) {
        result = data.data[0];
    }
    else {
        result = data.data;
    }

    return result;
};

//Phục vụ select multiple
function convertFindDataToArray(data) {
    let arr = [];

    if (data.isArray == true) {
        arr = data.data;
    }
    else {
        arr.push(data.data);
    }

    return arr;
};


function checkValidate(id, message) {
    $(`#${id}`).text('');
    $(`#${id}`).addClass('show');
    $(`#${id}`).text(message);
};

$(document).on('hidden.bs.modal', function() {
	if ($('.modal.show').length) {
		$('body').addClass('modal-open');
	}
});

function ConvertTitleToUrl(str) {
    //str = str.toLowerCase();
    if (str.length > 0) {
        str.trim();
    }

    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");

    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "T");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");

    // Some system encode vietnamese combining accent as individual utf-8 characters
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư

    str = str.replace(/(\r\n|\n|\r)/gm, "");    //Xuống dòng

    //str = str.replace(/[^\w\s]/gi, ''); //remove special characters

    var url = str.split(" ");

    return url.join('-')
};

function removeAllSpace(str) {
    return str.replace(/\s/g, '')
}

function checkURL(str) {
    var regex = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/
    return regex.test(str)
}

function GetClassExtension(extensionext) {
    var extensionClass = '';

    if (extensionext != null && extensionext != '' && extensionext != 'Not found') {
        const extension = extensionext.toLowerCase();

        if (extension == '.pdf') extensionClass = "tagfile tagfile-danger";
        else if (extension == '.doc' || extension == '.docx') extensionClass = "tagfile tagfile-info";
        else if (extension == '.xls' || extension == '.xlsx' || extension == '.csv') {
            extensionClass = "tagfile tagfile-success";
        } else if (extension == '.json' || extension == '.jpg' || extension == '.jpeg') {
            extensionClass = "tagfile tagfile-warning";
        } else if (extension == '.rdf' || extension == '.xml') {
            extensionClass = "tagfile tagfile-info-dark";
        } else {
            extensionClass = "tagfile tagfile-dark";
        }
    }

    return extensionClass;
};

function checkExtensionForSetting(data) {
    let extlist = [];

    if (data && data.isArray == true && data.data && data.data.length > 0) {
        data.data.forEach((filename) => {
            let parts = filename.split('.');
            let extension = parts[parts.length - 1];

            const extensionFile = extension.toLowerCase();
            if (extensionFile == 'csv' || extensionFile == 'xlsx' || extensionFile == 'xls' || extensionFile == 'json') {
                const dt = {
                    "name": filename,
                    "ext": extensionFile
                };

                extlist.push(dt);
            }
        });
    }
    else if (data && data.isArray == false && data.data) {
        let parts = data.data.split('.');
        let extension = parts[parts.length - 1];

        const extensionFile = extension.toLowerCase();
        if (extensionFile == 'csv' || extensionFile == 'xlsx' || extensionFile == 'xls' || extensionFile == 'json') {
            const dt = {
                "name": data.data,
                "ext": extensionFile
            };

            extlist.push(dt);
        }
    }

    return extlist;
};

function initCheckDatatype() {
    // số
    $(".check-num").on("input", function (e) {
        $(this).val(function (index, value) {
            if (!/^\d*$/.test(value)) {
                showNotification(0, 'Dữ liệu nhập vào phải là số');
                return value.replace(/\D/g, '');
            }
            return value;
        });
    });

    // Số điện thoại
    $(".check-phone").on("input", function (e) {
        $(this).val(function (index, value) {
            if (!/^[0-9.+-\s\(\)]*$/.test(value)) {
                showNotification(0, 'Số điện thoại chỉ bao gồm ký tự số, khoảng trắng và các ký tự +, - , (), dấu .');
                return value.replace(/[^\d()+\-\s\b]/g, '');
            }
            return value;
        });
    });

    //html
    $(".check-html").on("input", function (e) {
        $(this).val(function (index, value) {
            if (/<[^>]*>/g.test(value)) {
                showNotification(0, 'Dữ liệu nhập vào không hợp lệ');
                return value.replace(/<[^>]*>/g, '')
            }
            return value;
        });
    });

    //email
    $(".check-email").on("input", function (e) {
        $(this).val(function (index, value) {
            if (!/^[a-z0-9@.]+$/.test(value)) {
                showNotification(0, 'Email chỉ bao gồm chữ cái, ký tự số, ký tự @ và dấu .');
                return value.replace(/[^a-zA-Z0-9@.]/g, '');
            }
            return value;
        });
    });
};

function checkSpecialCharacter(str) {
    if (str) {
        const format = /[`@#$%^&*()_+\-=\[\]{};':"\\|<>\/~]/;
        return format.test(str);
    };

    return false;
}

async function initDanhMucChung(IDDanhMuc, elementId, placeholder) {
    const baseUrl = getRootLink();
    try {
        const res = await fetch(`${baseUrl}/api/DanhMucChungApi/DanhSach`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ loaiDanhMucID: IDDanhMuc, trangThai: true })
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (data && data.isSuccess && data.value) {
            $(elementId).empty().append(`<option value="">Tất cả</option>`).attr("data-placeholder", placeholder || "Chọn...");
            data.value.forEach(item => {
                $(elementId).append(`<option value="${item.danhMucID}">${item.tenDanhMuc}</option>`);
            });
        }
    } catch (err) { console.log('Lỗi khi tải danh mục:', err.message); }
}

async function initDanhMucChung_NoAll(IDDanhMuc, elementId, placeholder) {
    const baseUrl = getRootLink();
    try {
        const res = await fetch(`${baseUrl}/api/DanhMucChungApi/DanhSach`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ loaiDanhMucID: IDDanhMuc, trangThai: true })
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (data && data.isSuccess && data.value) {
            $(elementId).empty().append(`<option value="">Tất cả</option>`).attr("data-placeholder", placeholder || "Chọn...");
            data.value.forEach(item => {
                $(elementId).append(`<option value="${item.danhMucID}">${item.tenDanhMuc}</option>`);
            });
        }
    } catch (err) { console.log('Lỗi khi tải danh mục:', err.message); }
}

async function initToChuc_NoAll(IDDanhMuc, elementId, placeholder, IDLinhVuc) {
    const baseUrl = getRootLink();
    let request = {};
    if (!IDLinhVuc) {
        request = { loaiToChucID: IDDanhMuc, trangThai: true, maNgonNgu: 'vi' };
    } else if (!IDDanhMuc){
        request = { trangThai: true, maNgonNgu: 'vi', linhVucID: IDLinhVuc };
    } else {
        request = { loaiToChucID: IDDanhMuc, trangThai: true, maNgonNgu: 'vi', linhVucID: IDLinhVuc };
    }
    
    try {
        const res = await fetch(`${baseUrl}/api/ToChucApi/DanhSach`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (data && data.isSuccess && data.value) {
            $(elementId).empty().append(`<option value="">Tất cả</option>`).attr("data-placeholder", placeholder || "Chọn...");
            data.value.forEach(item => {
                $(elementId).append(`<option value="${item.toChucID}">${item.tenToChuc}</option>`);
            });
        }
    } catch (err) { console.log('Lỗi khi tải danh mục:', err.message); }
}

async function initLinhVuc_NoAll(elementId, placeholder) {
    const baseUrl = getRootLink();
    try {
        const res = await fetch(`${baseUrl}/api/LinhVucApi/Gets`, {
            method: 'GET',
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (data && data.isSuccess && data.value.length > 0) {
            $(elementId).empty().append(`<option value="">Tất cả</option>`).attr("data-placeholder", placeholder || "Chọn...");
            data.value.forEach(item => {
                $(elementId).append(`<option value="${item.linhVucID}">${item.ten}</option>`);
            });
        }
    } catch (err) { console.log('Lỗi khi tải danh mục:', err.message); }
}

async function initLinhVucCapCha_NoAll(elementId, placeholder) {
    const baseUrl = getRootLink();
    try {
        const res = await fetch(`${baseUrl}/api/LinhVucApi/Gets`, {
            method: 'GET',
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (data && data.isSuccess && data.value.length > 0) {
            let dataCapCha = data.value.filter(x => x.linhVucCapChaID == null && x.linhVucID != 1);
            $(elementId).empty().append(`<option value="">Tất cả</option>`).attr("data-placeholder", placeholder || "Chọn...");
            dataCapCha.forEach(item => {
                $(elementId).append(`<option value="${item.linhVucID}">${item.ten}</option>`);
            });
        }
    } catch (err) { console.log('Lỗi khi tải danh mục:', err.message); }
}

function initNgonNgu(elementId) {
    const dataNgonNgu = JSON.stringify({ 
        trangThai: true 
    })

    $.ajax({
        type: 'POST',
        async: false,
        url: getRootLink() + '/api/NgonNguApi/DanhSach',
        data: dataNgonNgu,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (data) {
            if (data && data.isSuccess && data.value) {
                $(elementId).empty();
                data.value.forEach(lang => {
                    const isSelected = lang.maNgonNgu?.toLowerCase() === 'vi' ? 'selected' : '';
                    $(elementId).append(`<option value="${lang.maNgonNgu?.toLowerCase()}" ${isSelected}>${lang.tenNgonNgu}</option>`);
                });
            }
        }
    })
   
}

function initPhuongXa(elementId, placeholder) {
    $.ajax({
        type: 'GET',
        async: false,
        url: getRootLink() + '/api/CapXaApi/Gets',
        //data: dataPhuongXa,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (data) {
            if (data && data.isSuccessed && data.resultObj) {
                $(elementId).empty().append(`<option value="">Tất cả</option>`).attr("data-placeholder", placeholder || "Chọn...");
                data.resultObj.forEach(lang => {
                    $(elementId).append(`<option value="${lang.xaID}">${lang.noiDung}</option>`);
                });
            }
        }
    })
}


function initMonTheThao(elementId, placeholder) {
    $.ajax({
        type: 'GET',
        async: false,
        url: getRootLink() + '/api/TT_MonTheThaoApi/Gets?MaNgonNgu=vi',
        //data: dataPhuongXa,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (data) {
            console.log(data, "data môn thể thao")
            if (data && data.isSuccess && data.value) {
                $(elementId).empty().append(`<option value="">Tất cả</option>`).attr("data-placeholder", placeholder || "Chọn...");
                data.value.forEach(lang => {
                    $(elementId).append(`<option value="${lang.monTheThaoID}">${lang.tenMon}</option>`);
                });
            }
        }
    })
}

function initNgonNguBase(elementId) {

    // Hủy Select2 trước khi append dữ liệu
    if ($(elementId).hasClass("select2-hidden-accessible")) {
        $(elementId).select2('destroy');
    }
    const dataNgonNgu = JSON.stringify({
        trangThai: true
    })

    $.ajax({
        type: 'POST',
        async: false,
        url: getRootLink() + '/api/NgonNguApi/DanhSach',
        data: dataNgonNgu,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (data) {
            if (data && data.isSuccess && data.value) {
                $(elementId).empty();
                data.value.forEach(lang => {
                    /* const isSelected = lang.maNgonNgu?.toLowerCase() === 'vi' ? 'selected' : '';*/
                   //${ isSelected }
                    $(elementId).append(`<option value="${lang.maNgonNgu?.toLowerCase()}" >${lang.tenNgonNgu}</option>`);
                });

                // Init lại Select2
                $(elementId).select2({
                    allowClear: false,
                    minimumResultsForSearch: Infinity
                });
            }
        }
    })

}

function resetModal(IDModal) {
    $(IDModal).find('input[type=text], input[type=number], textarea').val('');
    $(IDModal).find('select').val('vi').trigger('change');
    $(IDModal).find('input[type=radio][value=1], input[type=checkbox][value=1]').prop('checked', true);
    $(IDModal).find('.group_image_input img').attr('src', '/assets/images/vector/addImage.png');
}

function switchMediaData() {
    $("input[name='loaiMediaDPT']").on("change", function () {
        var loai = $(this).val();
        var $fileInput = $("#fileDPT");

        // Reset giá trị input file
        $fileInput.val("");

        // Ẩn tất cả div
        $("#fileHinhAnh, #fileVideo, #fileAmThanh, #fileKhac").addClass("d-none");

        // Xác định div mục tiêu & accept
        var targetDiv = "";
        var acceptTypes = "";

        if (loai === "1") { // Hình ảnh
            targetDiv = "#fileHinhAnh .group_image_input";
            acceptTypes = ".jpg,.jpeg,.png,.gif,.webp,.bmp";
        } else if (loai === "2") { // Video
            targetDiv = "#fileVideo";
            acceptTypes = ".mp4,.mov,.avi,.mkv,.webm";
        } else if (loai === "3") { // Âm thanh
            targetDiv = "#fileAmThanh";
            acceptTypes = ".mp3,.wav,.ogg,.flac";
        } else if (loai === "4") { // File khác
            targetDiv = "#fileKhac";
            acceptTypes = "*/*";
        }

        // Hiện div mục tiêu
        $(targetDiv).closest(".form-group").removeClass("d-none");

        // Di chuyển input file vào vị trí mục tiêu
        $(targetDiv).append($fileInput);

        // Gán loại file cho input
        $fileInput.attr("accept", acceptTypes);
    });
}

function previewPicture() {
    // Xử lý preview ảnh bìa
    $('.group_image_input [id*="fileDPT"]').on('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (ev) {
                $('#showhinhAnhAdd').attr('src', ev.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            $('#showhinhAnhAdd').attr('src', '/assets/images/vector/AddImage.png');
        }
    });
}
function previewPicture_WithSelector(inputId, previewId) {
    $(`#${inputId}`).on('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (ev) {
                $(`#${previewId}`).attr('src', ev.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            $(`#${previewId}`).attr('src', '/assets/images/vector/AddImage.png');
        }
    });
}

function previewPictureSuKien() {
    // Xử lý preview ảnh bìa
    $('.group_image_input #fileAnhDaiDienPrev').on('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (ev) {
                $('#showAnhDaiDienAdd').attr('src', ev.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            $('#showAnhDaiDienAdd').attr('src', '/assets/images/vector/AddImage.png');
        }
    });
}

function decodeCkeditorHtml(input) {
    const txt = document.createElement("textarea");
    txt.innerHTML = input;
    return txt.value;
}

function scrollTop() {
    $('html, body').animate({ scrollTop: 0 }, 'fast');
}


function restrictNumberInput(input, min, max, maxLength) {
    let value = input.value.replace(/[^0-9]/g, '');

    if (value.length > maxLength) {
        value = value.slice(0, maxLength);
    }

    const num = value === '' ? 0 : parseInt(value, 10);
    if (min != max) {
        if (num < min) {
            value = min.toString();
        } else if (num > max) {
            value = max.toString();
        }
    }
    input.value = value;
}

function restrictLanguageCode(input, maxLength = 4) {
    let validChars = input.value.replace(/[^a-zA-Z0-9]/g, '');

    if (validChars.length > maxLength) {
        validChars = validChars.slice(0, maxLength);
    }

    input.value = validChars.toLowerCase();
}

function restrictPhoneNumber(input, maxLength = 15) {
    let validChars = input.value.replace(/[^0-9+\-\s]/g, '');

    if (validChars.length > maxLength) {
        validChars = validChars.slice(0, maxLength);
    }

    input.value = validChars;
}

function restrictEmailInput(input, maxLength = 100) {
    let value = input.value;

    value = value.normalize("NFD").replace(/[\u0300-\u036F]/g, "");
    value = value.replace(/[^a-zA-Z0-9@._-]/g, "");

    if (value.length > maxLength) {
        value = value.slice(0, maxLength);
    }

    input.value = value.toLowerCase();
}


function restrictWebsiteInput(input, maxLength = 150) {
    let validChars = input.value.replace(/[^a-zA-Z0-9:/.?&=_\-]/g, '');

    if (validChars.length > maxLength) {
        validChars = validChars.slice(0, maxLength);
    }

    input.value = validChars.toLowerCase();
}
function restrictNoAccent(input, maxLength = 150) {
    // Loại bỏ toàn bộ ký tự có dấu bằng regex unicode
    let validChars = input.value.replace(/[^\u0000-\u007F]/g, '');

    if (validChars.length > maxLength) {
        validChars = validChars.slice(0, maxLength);
    }

    input.value = validChars;
}

function htmlDecode(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
}

function validateDocumentDates(ngayBanHanh, ngayHieuLuc, ngayHetHan) {
    const issued = new Date(formatDateToSearch(ngayBanHanh));
    const effective = ngayHieuLuc ? new Date(formatDateToSearch(ngayHieuLuc)) : null;
    const expired = ngayHetHan ? new Date(formatDateToSearch(ngayHetHan)) : null;

    // Ngày hiệu lực phải >= ngày ban hành
    if (effective && effective < issued) {
        return { valid: false, message: "Ngày ban hành không được nhỏ hơn ngày hiệu lực." };
    }

    // Ngày hết hạn phải >= ngày hiệu lực
    if (effective && expired && expired < effective) {
        return { valid: false, message: "Ngày hết hiệu lực không được nhỏ hơn ngày có hiệu lực" };
    }

    return { valid: true };
}

function validateFromToDates(start, end, message = "Ngày bắt đầu không được nhỏ hơn ngày kết thúc") {
    if (!start || !end) return { valid: true };

    const from = new Date(formatDateToSearch(start));
    const to = new Date(formatDateToSearch(end));

    return from <= to
        ? { valid: true }
        : { valid: false, message };
}

function initFilePond(id) {
    FilePond.registerPlugin(FilePondPluginFileValidateType);
    let pondFile = FilePond.create(document.querySelector(`#${id}`), {
        allowMultiple: true,
        allowAsyncTypeDetection: true,
        acceptedFileTypes: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ],
        labelIdle: `Kéo & thả file vào đây <br> 
                hoặc <span class="filepond--label-action">Chọn từ máy</span>`,
        fileValidateTypeDetectType: (source, type) => {
            let fileName = (source.name || source.file?.name || '').toLowerCase();

            return new Promise((resolve) => {
                if (fileName.endsWith('.pdf')) return resolve('application/pdf');
                if (fileName.endsWith('.doc')) return resolve('application/msword');
                if (fileName.endsWith('.dot')) return resolve('application/msword');
                if (fileName.endsWith('.docx')) return resolve('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                if (fileName.endsWith('.xls')) return resolve('application/vnd.ms-excel');
                if (fileName.endsWith('.xlsx')) return resolve('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

                return resolve(null); // không khớp → reject
            });
        },
        labelFileTypeNotAllowed: 'File không đúng định dạng!',
        fileValidateTypeLabelExpectedTypes: 'Chấp nhận: PDF, Word (.doc, .docx), Excel (.xls, .xlsx)',
        labelFileLoadError: 'File không tồn tại hoặc đã bị xóa!',
        labelFileProcessingError: 'Lỗi khi tải file lên',
    });
    return pondFile;
}

$('.year-input').each(function () {
    $(this).empty();
    var year = new Date().getFullYear();
    for (let i = year; i > 1900; i--) {
        $(this).append(`<option value="${i}">${i}</option>`);
    }
});