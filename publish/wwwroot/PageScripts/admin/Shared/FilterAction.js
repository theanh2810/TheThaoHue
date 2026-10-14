/**
 * FILTER ACTION - SHARED COMPONENT
 * 
 * Hướng dẫn sử dụng:
 * 
 * 1. Trong HTML cshtml, định nghĩa các filter option trong #sortList_option
 * 2. Trong file JS của view, gọi initCommonFilter() với các tham số:
 * 
 * initCommonFilter({
 *     htmlFilterSort: `<li class="active" data-value="Ten"><a class="option_filter">Tên</a></li>...`,
 *     filterInputs: ['#loai-co-so-search', '#phong-cach-search'],
 *     dateInputs: ['#ngay-bat-dau-search', '#ngay-ket-thuc-search'], // ← Các input ngày tháng
 *     searchInput: '#tu-khoa-search',
 *     debounceTime: 1000,
 *     apiUrl: '/api/DL_CoSoLuuTruApi/Filter',
 *     buildFilterParams: function() {
 *         return {
 *             MaNgonNgu: $('#ngon-ngu-search').val() || 'vi',
 *             TuKhoa: $('#tu-khoa-search').val(),
 *             LoaiCoSoID: $('#loai-co-so-search').val(),
 *             NgayBatDau: $('#ngay-bat-dau-search').val(), // ← Sẽ tự động format
 *             NgayKetThuc: $('#ngay-ket-thuc-search').val()  // ← Sẽ tự động format
 *         };
 *     },
 *     onFilterApplied: function(urlFilter) {
 *         $('#dataGrid').DataTable().ajax.url(urlFilter).load();
 *     },
 *     // ← TÙY CHỌN: Nếu muốn dùng Card/List view, thêm các hàm render:
 *     renderCardItem: function(item, index) {
 *         return `<div class="card-item">...HTML cho 1 card...</div>`;
 *     },
 *     renderListItem: function(item, index) {
 *         return `<div class="list-item">...HTML cho 1 list item...</div>`;
 *     },
 *     onCardRendered: function() { Attach events sau khi render cards },
 *     onListRendered: function() { Attach events sau khi render list }
 * });
 */

//#region MAIN INITIALIZATION FUNCTION
/**
 * Khởi tạo filter chung cho view
 * @param {Object} config - Cấu hình filter
 * @param {string} config.htmlFilterSort - HTML cho các option sắp xếp (li elements)
 * @param {Array<string>} config.filterInputs - Mảng selector của các input/select filter (không bao gồm search box và date inputs)
 * @param {Array<string>} config.dateInputs - Mảng selector của các input ngày tháng (sẽ tự động format)
 * @param {string} config.searchInput - Selector của ô search từ khóa
 * @param {number} config.debounceTime - Thời gian debounce cho search (ms), mặc định 1000
 * @param {string} config.apiUrl - URL của API Filter
 * @param {Function} config.buildFilterParams - Function trả về object chứa các parameter cho API
 * @param {Function} config.onFilterApplied - Callback function sau khi apply filter (nhận urlFilter làm tham số)
 * @param {Function} [config.renderCardItem] - Tùy chọn: Function render HTML cho 1 card item (item, index) => HTML string
 * @param {Function} [config.renderListItem] - Tùy chọn: Function render HTML cho 1 list item (item, index) => HTML string
 * @param {Function} [config.onCardRendered] - Tùy chọn: Callback sau khi render xong cards
 * @param {Function} [config.onListRendered] - Tùy chọn: Callback sau khi render xong list
 */
function initCommonFilter(config) {
    // Validate config
    if (!config || !config.apiUrl || !config.buildFilterParams || !config.onFilterApplied) {
        console.error('initCommonFilter: Thiếu config bắt buộc (apiUrl, buildFilterParams, onFilterApplied)');
        return;
    }
    
    // Set default values
    config.debounceTime = config.debounceTime || 1000;
    config.searchInput = config.searchInput || '#tu-khoa-search';
    config.filterInputs = config.filterInputs || [];
    config.dateInputs = config.dateInputs || []; // ← THÊM MỚI: Default empty array
    config.itemsPerPage = config.itemsPerPage || 10; // ← Số items mỗi trang
    
    // Lưu config vào global để dùng trong các function khác
    window._filterConfig = config;
    
    // Khởi tạo pagination state
    if (!window._paginationState) {
        window._paginationState = {
            cardView: { currentPage: 1, totalPages: 1, totalItems: 0, allData: [] },
            listView: { currentPage: 1, totalPages: 1, totalItems: 0, allData: [] }
        };
    }
    
    // Render HTML cho sort options nếu có
    if (config.htmlFilterSort) {
        initFilterSortHtml(config.htmlFilterSort);
    }
    
    // Khởi tạo các event handlers
    initFilterEvents(config);
    
    console.log('Filter initialized with config:', config);
}
//#endregion

//#region RENDER HTML FILTER SORT
function initFilterSortHtml(htmlFilterSort) {
    if ($('#sortList_option').length > 0) {
        $('#sortList_option').html(htmlFilterSort);
    }
}
//#endregion

//#region EVENT HANDLERS INITIALIZATION
function initFilterEvents(config) {
    // 1. Xử lý collapse/expand filter dropdowns
    handleFilterCollapse();
    
    // 2. Xử lý change event của các filter inputs (select, input)
    handleFilterInputsChange(config);
    
    // 3. Xử lý change event của các date inputs (với debounce)
    handleDateInputsChange(config);
    
    // 4. Xử lý search box với debounce
    handleSearchInput(config);
    
    // 5. Xử lý click vào sort options
    handleSortClick(config);
    
    // 6. Xử lý switch view (table/card/list)
    handleViewSwitch(config);
}
//#endregion

//#region COLLAPSE/EXPAND HANDLERS
function handleFilterCollapse() {
    // Toggle Lọc nâng cao
    $(document).on('click', '.Filter_nangCao', function(e) {
        e.preventDefault();
        $('#Filter_collapsed_nangCao').slideToggle(300);
        $(this).toggleClass('active');
    });
    
    // Toggle Sắp xếp
    $(document).on('click', '.Filter_sapXep', function(e) {
        e.preventDefault();
        $('#Filter_collapsed_sapXep').slideToggle(300);
        $(this).toggleClass('active');
    });
    
    // Toggle Giao diện/Bảng
    $(document).on('click', '.Filter_giaoDien', function(e) {
        e.preventDefault();
        $('#Filter_collapsed_Bang').slideToggle(300);
        $(this).toggleClass('active');
    });
    
    // Click outside để đóng filter
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.group_nangCao, .group_sapXep, .group_Bang').length) {
            $('.Filter_collapsed').slideUp(300);
            $('.Filter_nangCao, .Filter_sapXep, .Filter_giaoDien').removeClass('active');
        }
    });
}
//#endregion

//#region FILTER INPUTS CHANGE HANDLER
function handleFilterInputsChange(config) {
    // Lắng nghe change event của tất cả filter inputs
    if (config.filterInputs && config.filterInputs.length > 0) {
        const selectors = config.filterInputs.join(', ');
        $(document).on('change', selectors, function() {
            applyCommonFilter(config);
        });
    }
}
//#endregion

//#region DATE INPUTS CHANGE HANDLER
function handleDateInputsChange(config) {
    // Lắng nghe change event của các date inputs với debounce
    if (config.dateInputs && config.dateInputs.length > 0) {
        const selectors = config.dateInputs.join(', ');
        let dateTimeout = null;
        
        $(document).on('change', selectors, function() {
            clearTimeout(dateTimeout);
            dateTimeout = setTimeout(function() {
                applyCommonFilter(config);
            }, 300); // Debounce ngắn hơn search (300ms)
        });
    }
}
//#endregion

//#region SEARCH INPUT HANDLER
function handleSearchInput(config) {
    let searchTimeout = null;
    const searchSelector = config.searchInput;
    
    // Tự động search sau debounceTime khi người dùng nhập
    $(document).on('input', searchSelector, function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(function() {
            applyCommonFilter(config);
        }, config.debounceTime);
    });
    
    // Search ngay khi nhấn Enter (ngắt timeout)
    $(document).on('keypress', searchSelector, function(e) {
        if (e.which === 13) { // Enter key
            e.preventDefault();
            clearTimeout(searchTimeout);
            applyCommonFilter(config);
        }
    });
}
//#endregion

//#region SORT CLICK HANDLERS
function handleSortClick(config) {
    // Xử lý click vào các option sắp xếp (Trường sắp xếp: Ten, LoaiCoSo, etc.)
    $(document).on('click', '#Filter_collapsed_sapXep .option_sort li', function(e) {
        e.preventDefault();
        // Remove active từ các li trong cùng ul
        $(this).closest('ul').find('li').removeClass('active');
        // Add active vào li được click
        $(this).addClass('active');
        // Trigger applyFilter
        applyCommonFilter(config);
    });
    
    // Xử lý click vào các option chiều sắp xếp (ASC/DESC)
    $(document).on('click', '#Filter_collapsed_sapXep ul:not(.option_sort) li', function(e) {
        e.preventDefault();
        // Remove active từ các li trong cùng ul
        $(this).closest('ul').find('li').removeClass('active');
        // Add active vào li được click
        $(this).addClass('active');
        // Trigger applyFilter
        applyCommonFilter(config);
    });
}
//#endregion

//#region VIEW SWITCH HANDLERS
function handleViewSwitch(config) {
    // Xử lý click vào các option giao diện (Bảng biểu/Thẻ/Danh sách)
    $(document).on('click', '#Filter_collapsed_Bang ul li', function(e) {
        e.preventDefault();
        
        // Remove active từ các li khác
        $(this).closest('ul').find('li').removeClass('active');
        // Add active vào li được click
        $(this).addClass('active');
        
        // Lấy view type từ data-value hoặc text content
        const viewType = $(this).data('value') || 'bangBieu'; // bangBieu, the, danhSach
        
        // Cập nhật text và icon của Filter_giaoDien
        updateFilterGiaoDienText(viewType);
        
        // Switch view containers
        switchViewContainers(viewType);
        
        // Nếu có callback từ config, gọi callback với viewType
        if (config.onViewChanged && typeof config.onViewChanged === 'function') {
            config.onViewChanged(viewType);
        }
    });
}

function updateFilterGiaoDienText(viewType) {
    let text = 'Bảng';
    let icon = 'hgi-table';
    
    if (viewType === 'the') {
        text = 'Thẻ';
        icon = 'hgi-grid';
    } else if (viewType === 'danhSach') {
        text = 'Danh sách';
        icon = 'hgi-paragraph';
    }
    
    // Cập nhật text và icon
    $('.Filter_giaoDien').html(`<i class="hgi-icon ${icon}"></i>${text}<i class="hgi-icon hgi-dropdown"></i>`);
}

function showViewLoading() {
    // Tạo loading overlay nếu chưa có
    if ($('#viewLoadingOverlay').length === 0) {
        const loadingHtml = `
            <div id="viewLoadingOverlay">
                <div style="text-align: center;">
                    <div class="loader"></div>
                    <p style="margin-top: 10px; font-size: 14px; color: #666;">Đang chuyển giao diện...</p>
                </div>
            </div>
        `;
        $('.content-wrapper .box_content').append(loadingHtml);
    } else {
        $('#viewLoadingOverlay').show();
    }
}

function hideViewLoading() {
    $('#viewLoadingOverlay').fadeOut(300, function() {
        $(this).remove();
    });
}

function getCurrentViewType() {
    // Kiểm tra container nào đang hiển thị
    if ($('#cardViewContainer').is(':visible')) {
        return 'the';
    } else if ($('#listViewContainer').is(':visible')) {
        return 'danhSach';
    } else {
        return 'bangBieu';
    }
}

function switchViewContainers(viewType) {
    // Lưu chiều cao hiện tại của container đang hiển thị
    const currentContainer = $('#tableViewContainer:visible, #cardViewContainer:visible, #listViewContainer:visible');
    const currentHeight = currentContainer.outerHeight();
    
    // Hiển loading overlay
    showViewLoading();
    
    // Delay 300ms để hiệu ứng mượt hơn
    setTimeout(function() {
        // Ẩn tất cả containers
        $('#tableViewContainer').hide();
        $('#cardViewContainer').hide();
        $('#listViewContainer').hide();
        
        // Hiển container tương ứng
        if (viewType === 'bangBieu') {
            $('#tableViewContainer').show();
            // Ẩn loading ngay vì table đã có sẵn
            hideViewLoading();
        } else if (viewType === 'the') {
            // Set min-height để giữ layout
            $('#cardViewContainer').css('min-height', currentHeight + 'px');
            $('#cardViewContainer').show();
            // Tự động load data cho card view (với delay vì đang đổi view)
            loadViewData('the', null, true);
            // Vẫn trigger event để backward compatible
            $(document).trigger('viewChanged:card');
        } else if (viewType === 'danhSach') {
            // Set min-height để giữ layout
            $('#listViewContainer').css('min-height', currentHeight + 'px');
            $('#listViewContainer').show();
            // Tự động load data cho list view (với delay vì đang đổi view)
            loadViewData('danhSach', null, true);
            // Vẫn trigger event để backward compatible
            $(document).trigger('viewChanged:list');
        }
        
        console.log('Switched to view:', viewType);
    }, 1000);
}
//#endregion

//#region LOAD VIEW DATA
/**
 * Tự động load data và render cho view hiện tại
 * @param {string} viewType - Loại view: 'bangBieu', 'the', 'danhSach'
 * @param {Object} config - Filter config
 * @param {boolean} isViewSwitch - True nếu đang đổi giao diện (có delay), false nếu đang lọc (không delay)
 */
function loadViewData(viewType, config, isViewSwitch) {
    if (!config) {
        config = getFilterConfig();
    }
    
    // Mặc định isViewSwitch = false (không delay)
    if (isViewSwitch === undefined) {
        isViewSwitch = false;
    }
    
    if (!config) {
        console.error('Filter config not found');
        return;
    }
    
    // Nếu là bảng biểu, dùng callback onFilterApplied truyền thống
    if (viewType === 'bangBieu') {
        applyCommonFilter(config);
        return;
    }
    
    // Nếu là card/list view, check xem có render function không
    if (viewType === 'the' && !config.renderCardItem) {
        console.warn('Card view: renderCardItem function not provided in config');
        return;
    }
    
    if (viewType === 'danhSach' && !config.renderListItem) {
        console.warn('List view: renderListItem function not provided in config');
        return;
    }
    
    // Reset về trang 1 khi filter (không phải khi đổi view)
    if (!isViewSwitch) {
        if (viewType === 'the' && window._paginationState) {
            window._paginationState.cardView.currentPage = 1;
        }
        if (viewType === 'danhSach' && window._paginationState) {
            window._paginationState.listView.currentPage = 1;
        }
    }
    
    // Build filter params
    const params = config.buildFilterParams();
    
    // Lấy giá trị sort
    const sortType = $('#Filter_collapsed_sapXep .option_sort li.active').data('value');
    const sortDirection = $('#Filter_collapsed_sapXep ul:not(.option_sort) li.active').data('value');
    
    if (sortType) params.Type = sortType;
    if (sortDirection) params.TypeSort = sortDirection;
    
    // Build URL
    let urlFilter = config.apiUrl + '?';
    const urlParams = [];
    
    for (const key in params) {
        if (params.hasOwnProperty(key)) {
            const value = params[key];
            if (value !== null && value !== undefined && value !== '' && value !== '-1') {
                urlParams.push(`${key}=${encodeURIComponent(value)}`);
            }
        }
    }
    
    urlFilter += urlParams.join('&');
    
    console.log(`Loading ${viewType} view with URL:`, urlFilter);
    
    // Gọi API
    $.ajax({
        url: urlFilter,
        type: 'GET',
        success: function(response) {
            // Hàm xử lý response
            const processResponse = function() {
                if (response && response.isSuccess && response.value) {
                    if (viewType === 'the') {
                        renderCardView(response.value, config);
                        // Xóa min-height sau khi render xong
                        $('#cardViewContainer').css('min-height', '');
                    } else if (viewType === 'danhSach') {
                        renderListView(response.value, config);
                        // Xóa min-height sau khi render xong
                        $('#listViewContainer').css('min-height', '');
                    }
                } else {
                    const container = viewType === 'the' ? '#cardViewGrid' : '#listViewItems';
                    $(container).html('<p class="text-center text-muted">Không có dữ liệu</p>');
                    // Xóa min-height khi không có dữ liệu
                    if (viewType === 'the') {
                        $('#cardViewContainer').css('min-height', '');
                    } else if (viewType === 'danhSach') {
                        $('#listViewContainer').css('min-height', '');
                    }
                }
            };
            
            // Chỉ delay khi đang đổi giao diện, không delay khi filter
            if (isViewSwitch) {
                processResponse();
                // Ẩn loading sau khi render và pagination hoàn thành
                hideViewLoading();
            } else {
                processResponse();
                // Ẩn loading sau khi render và pagination hoàn thành
                hideViewLoading();
            }
        },
        error: function(err) {
            console.error(`Error loading ${viewType} view:`, err);
            const container = viewType === 'the' ? '#cardViewGrid' : '#listViewItems';
            $(container).html('<p class="text-center text-danger">Có lỗi xảy ra khi tải dữ liệu</p>');
            // Xóa min-height khi có lỗi
            if (viewType === 'the') {
                $('#cardViewContainer').css('min-height', '');
            } else if (viewType === 'danhSach') {
                $('#listViewContainer').css('min-height', '');
            }
            // Ẩn loading khi có lỗi
            hideViewLoading();
        }
    });
}

/**
 * Render items per page selector (không dùng nữa - tích hợp vào pagination)
 */
function renderItemsPerPageSelector(viewType) {
    return '';
}

/**
 * Render card view
 */
function renderCardView(data, config) {
    const cardContainer = $('#cardViewContainer');
    const cardGrid = $('#cardViewGrid');
    
    cardGrid.empty();
    
    if (!data || data.length === 0) {
        cardGrid.html('<p class="text-center text-muted">Không có dữ liệu</p>');
        $('#cardViewPagination').empty();
        return;
    }

    console.log('Rendering card view with data:', data);
    
    // Lấy itemsPerPage từ dropdown hoặc dùng mặc định
    const itemsPerPage = parseInt($('#cardItemsPerPage').val()) || config.itemsPerPage;
    
    // Lưu data vào state
    const state = window._paginationState.cardView;
    state.allData = data;
    state.totalItems = data.length;
    state.totalPages = Math.ceil(data.length / itemsPerPage);
    
    // Đảm bảo currentPage không vượt quá totalPages
    if (state.currentPage > state.totalPages) {
        state.currentPage = state.totalPages || 1;
    }
    
    // Lấy data cho trang hiện tại
    const startIndex = (state.currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageData = data.slice(startIndex, endIndex);
    
    // Render data
    currentPageData.forEach((item, index) => {
        const cardHtml = config.renderCardItem(item, startIndex + index);
        cardGrid.append(cardHtml);
    });
    
    // Callback sau khi render xong
    if (config.onCardRendered && typeof config.onCardRendered === 'function') {
        config.onCardRendered();
    }
    
    // Render pagination
    renderPagination('card', state, config, itemsPerPage);
}

/**
 * Render list view
 */
function renderListView(data, config) {
    const listContainer = $('#listViewContainer');
    const listItems = $('#listViewItems');
    
    listItems.empty();
    
    if (!data || data.length === 0) {
        listItems.html('<p class="text-center text-muted">Không có dữ liệu</p>');
        $('#listViewPagination').empty();
        return;
    }
    
    // Lấy itemsPerPage từ dropdown hoặc dùng mặc định
    const itemsPerPage = parseInt($('#listItemsPerPage').val()) || config.itemsPerPage;
    
    // Lưu data vào state
    const state = window._paginationState.listView;
    state.allData = data;
    state.totalItems = data.length;
    state.totalPages = Math.ceil(data.length / itemsPerPage);
    
    // Đảm bảo currentPage không vượt quá totalPages
    if (state.currentPage > state.totalPages) {
        state.currentPage = state.totalPages || 1;
    }
    
    // Lấy data cho trang hiện tại
    const startIndex = (state.currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageData = data.slice(startIndex, endIndex);
    
    // Render data
    currentPageData.forEach((item, index) => {
        const listItemHtml = config.renderListItem(item, startIndex + index);
        listItems.append(listItemHtml);
    });
    
    // Callback sau khi render xong
    if (config.onListRendered && typeof config.onListRendered === 'function') {
        config.onListRendered();
    }
    
    // Render pagination
    renderPagination('list', state, config, itemsPerPage);
}

/**
 * Render pagination cho card hoặc list view
 * @param {string} viewType - 'card' hoặc 'list'
 * @param {Object} state - Pagination state
 * @param {Object} config - Filter config
 * @param {number} itemsPerPage - Số items mỗi trang
 */
function renderPagination(viewType, state, config, itemsPerPage) {
    const paginationId = viewType === 'card' ? '#cardViewPagination' : '#listViewPagination';
    const $pagination = $(paginationId);
    
    // Luôn hiển thị phần pagination footer
    $pagination.show();
    
    // Bắt đầu wrapper div
    let html = '<div class="d-flex justify-content-end align-items-center flex-wrap" style="gap: 16px;">';
    
    // Thêm dropdown selector
    html += `
        <div class="items-per-page-selector mb-2">
            <span class="me-2">Hiển thị:</span>
            <select id="${viewType}ItemsPerPage" class="form-select form-select-sm" style="width: auto; display: inline-block;">
                <option value="5" ${itemsPerPage === 5 ? 'selected' : ''}>5</option>
                <option value="10" ${itemsPerPage === 10 ? 'selected' : ''}>10</option>
                <option value="15" ${itemsPerPage === 15 ? 'selected' : ''}>15</option>
                <option value="20" ${itemsPerPage === 20 ? 'selected' : ''}>20</option>
                <option value="25" ${itemsPerPage === 25 ? 'selected' : ''}>25</option>
                <option value="30" ${itemsPerPage === 30 ? 'selected' : ''}>30</option>
                <option value="50" ${itemsPerPage === 50 ? 'selected' : ''}>50</option>
                <option value="100" ${itemsPerPage === 100 ? 'selected' : ''}>100</option>
            </select>
            <span class="ms-2">mục/trang</span>
        </div>
    `;
    
    // Ẩn phần pagination buttons nếu tổng số items <= itemsPerPage
    if (state.totalItems <= itemsPerPage) {
        html += '</div>';
        $pagination.html(html);
        
        // Vẫn khởi tạo Select2 và event handlers cho dropdown
        const dropdownSelector = viewType === 'card' ? '#cardItemsPerPage' : '#listItemsPerPage';
        if (typeof initSelect2 === 'function') {
            initSelect2();
        }
        
        // Thêm event listener cho dropdown items per page
        $(dropdownSelector).off('change.pagination').on('change.pagination', function() {
            // Reset về trang 1 khi thay đổi items per page
            if (viewType === 'card') {
                window._paginationState.cardView.currentPage = 1;
                renderCardView(window._paginationState.cardView.allData, config);
            } else if (viewType === 'list') {
                window._paginationState.listView.currentPage = 1;
                renderListView(window._paginationState.listView.allData, config);
            }
        });
        return;
    }
    
    // Bắt đầu phần pagination
    html += '<ul class="pagination justify-content-center mb-2">';
    
    // Nút Previous
    if (state.currentPage > 1) {
        html += `<li class="page-item">
                    <a class="page-link" data-page="${state.currentPage - 1}" data-view="${viewType}">
                        <i class="hgi-icon hgi-chevron-left"></i>
                    </a>
                </li>`;
    }
    
    // Các số trang
    for (let i = 1; i <= state.totalPages; i++) {
        // Hiển thị trang đầu, trang cuối, trang hiện tại và 2 trang xung quanh
        if (i === 1 || i === state.totalPages || (i >= state.currentPage - 1 && i <= state.currentPage + 1)) {
            html += `<li class="page-item ${i === state.currentPage ? 'active' : ''}">
                        <a class="page-link" data-page="${i}" data-view="${viewType}">${i}</a>
                    </li>`;
        } else if (i === state.currentPage - 2 || i === state.currentPage + 2) {
            html += `<li class="page-item disabled">
                        <span class="page-link">...</span>
                    </li>`;
        }
    }
    
    // Nút Next
    if (state.currentPage < state.totalPages) {
        html += `<li class="page-item">
                    <a class="page-link" data-page="${state.currentPage + 1}" data-view="${viewType}">
                        <i class="hgi-icon hgi-chevron-right"></i>
                    </a>
                </li>`;
    }
    
    html += '</ul>';
    // Đóng wrapper div
    html += '</div>';
    
    $pagination.html(html);
    
    // Khởi tạo Select2 cho dropdown items per page
    const dropdownSelector = viewType === 'card' ? '#cardItemsPerPage' : '#listItemsPerPage';
    if (typeof initSelect2 === 'function') {
        initSelect2();
    }
    
    // Xử lý click pagination
    $pagination.find('.page-link').off('click').on('click', function (e) {
        console.log('Pagination link clicked');
        e.preventDefault();
        const page = parseInt($(this).data('page'));
        const view = $(this).data('view');
        
        if (page && page !== state.currentPage) {
            // Cập nhật current page
            if (view === 'card') {
                window._paginationState.cardView.currentPage = page;
                // Re-render card view với data đã lưu
                renderCardView(window._paginationState.cardView.allData, config);
            } else if (view === 'list') {
                window._paginationState.listView.currentPage = page;
                // Re-render list view với data đã lưu
                renderListView(window._paginationState.listView.allData, config);
            }
            
            // Scroll to top of container
            const scrollTarget = view === 'card' ? '#cardViewContainer' : '#listViewContainer';
            $('html, body').animate({
                scrollTop: $(scrollTarget).offset().top - 100
            }, 300);
        }
    });
    
    // Thêm event listener cho dropdown items per page (chỉ thêm 1 lần)
    $(dropdownSelector).off('change.pagination').on('change.pagination', function() {
        // Reset về trang 1 khi thay đổi items per page
        if (viewType === 'card') {
            window._paginationState.cardView.currentPage = 1;
            renderCardView(window._paginationState.cardView.allData, config);
        } else if (viewType === 'list') {
            window._paginationState.listView.currentPage = 1;
            renderListView(window._paginationState.listView.allData, config);
        }
    });
}
//#endregion

//#region APPLY FILTER
function applyCommonFilter(config) {
    // Lấy parameters từ function buildFilterParams do view truyền vào
    const params = config.buildFilterParams();
    
    // Format các trường ngày tháng nếu có trong params và config.dateInputs
    if (config.dateInputs && config.dateInputs.length > 0) {
        config.dateInputs.forEach(selector => {
            // Lấy tên parameter từ selector (ví dụ: #ngay-bat-dau-search → tìm NgayBatDau trong params)
            const paramKeys = Object.keys(params);
            
            // Tìm key trong params có giá trị từ selector này
            paramKeys.forEach(key => {
                const value = $(selector).val();
                if (params[key] === value && value && value.trim() !== '') {
                    // Kiểm tra xem có function formatDateToSaveAsString không
                    if (typeof formatDateToSaveAsString === 'function') {
                        params[key] = formatDateToSaveAsString(value);
                        console.log(`Formatted ${key}: ${value} → ${params[key]}`);
                    } else {
                        console.warn('formatDateToSaveAsString function not found, using raw value');
                    }
                }
            });
        });
    }
    
    // Lấy giá trị sort từ các li có class active
    const sortType = $('#Filter_collapsed_sapXep .option_sort li.active').data('value');
    const sortDirection = $('#Filter_collapsed_sapXep ul:not(.option_sort) li.active').data('value');
    
    // Thêm sort parameters nếu có
    if (sortType) {
        params.Type = sortType;
    }window._filterConfigPost = config;
    if (sortDirection) {
        params.TypeSort = sortDirection;
    }
    
    // Build URL từ params
    let urlFilter = config.apiUrl + '?';
    const urlParams = [];
    
    for (const key in params) {
        if (params.hasOwnProperty(key)) {
            const value = params[key];
            // Chỉ thêm vào URL nếu value không null, undefined, empty, hoặc -1
            if (value !== null && value !== undefined && value !== '' && value !== '-1') {
                urlParams.push(`${key}=${encodeURIComponent(value)}`);
            }
        }
    }
    
    urlFilter += urlParams.join('&');
    
    console.log('Filter URL:', urlFilter);
    
    // Kiểm tra view hiện tại
    const currentView = getCurrentViewType();
    
    // Nếu đang ở card/list view và có render function, dùng loadViewData
    if ((currentView === 'the' && config.renderCardItem) || 
        (currentView === 'danhSach' && config.renderListItem)) {
        loadViewData(currentView, config);
    } else {
        // Nếu không, dùng callback truyền thống
        config.onFilterApplied(urlFilter);
    }
}
//#endregion

//#region HELPER FUNCTION - GET FILTER CONFIG
function getFilterConfig() {
    return window._filterConfig;
}

function getCurrentView() {
    return getCurrentViewType();
}
//#endregion
