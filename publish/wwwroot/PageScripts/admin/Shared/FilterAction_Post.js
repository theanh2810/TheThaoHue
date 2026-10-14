/**
 * FILTER ACTION POST - SHARED COMPONENT
 * 
 * Hướng dẫn sử dụng:
 * 
 * 1. Trong HTML cshtml, định nghĩa các filter option trong #sortList_option
 * 2. Trong file JS của view, gọi initCommonFilterPost() với các tham số:
 * 
 * initCommonFilterPost({
 *     htmlFilterSort: `<li class="active" data-value="Ten"><a class="option_filter">Tên</a></li>...`,
 *     filterInputs: ['#loai-co-so-search', '#phong-cach-search'],
 *     dateInputs: ['#ngay-bat-dau-search', '#ngay-ket-thuc-search'],
 *     searchInput: '#tu-khoa-search',
 *     debounceTime: 1000,
 *     apiUrl: '/api/KhuDuLichApi/DanhSach',
 *     buildFilterRequest: function() {
 *         return {
 *             maNgonNgu: $('#ngon-ngu-search').val() || 'vi',
 *             tuKhoa: $('#tu-khoa-search').val(),
 *             loaiHinhID: parseInt($('#loai-hinh-search').val()) || 0,
 *             diemDuLich: true,
 *             trangThai: $('#trang-thai-search').val() === 'true'
 *         };
 *     },
 *     onFilterApplied: function(data) {
 *         // Xử lý dữ liệu trả về từ API
 *         $('#dataGrid').DataTable().clear().rows.add(data.value).draw();
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
 * Khởi tạo filter chung cho view với POST method
 * @param {Object} config - Cấu hình filter
 * @param {string} config.htmlFilterSort - HTML cho các option sắp xếp (li elements)
 * @param {Array<string>} config.filterInputs - Mảng selector của các input/select filter (không bao gồm search box và date inputs)
 * @param {Array<string>} config.dateInputs - Mảng selector của các input ngày tháng (sẽ tự động format)
 * @param {string} config.searchInput - Selector của ô search từ khóa
 * @param {number} config.debounceTime - Thời gian debounce cho search (ms), mặc định 1000
 * @param {string} config.apiUrl - URL của API (POST method)
 * @param {Function} config.buildFilterRequest - Function trả về object chứa request body cho API
 * @param {Function} config.onFilterApplied - Callback function sau khi apply filter (nhận data trả về làm tham số)
 * @param {Function} [config.renderCardItem] - Tùy chọn: Function render HTML cho 1 card item (item, index) => HTML string
 * @param {Function} [config.renderListItem] - Tùy chọn: Function render HTML cho 1 list item (item, index) => HTML string
 * @param {Function} [config.onCardRendered] - Tùy chọn: Callback sau khi render xong cards
 * @param {Function} [config.onListRendered] - Tùy chọn: Callback sau khi render xong list
 */
function initCommonFilterPost(config) {
    // Validate config
    if (!config || !config.apiUrl || !config.buildFilterRequest || !config.onFilterApplied) {
        console.error('initCommonFilterPost: Thiếu config bắt buộc (apiUrl, buildFilterRequest, onFilterApplied)');
        return;
    }
    
    // Set default values
    config.debounceTime = config.debounceTime || 1000;
    config.searchInput = config.searchInput || '#tu-khoa-search';
    config.filterInputs = config.filterInputs || [];
    config.dateInputs = config.dateInputs || []; // ← THÊM MỚI: Default empty array
    config.itemsPerPage = config.itemsPerPage || 10; // ← Số items mỗi trang
    
    // Custom selectors for multi-tab support
    config.sortListSelector = config.sortListSelector || '#sortList_option';
    config.filterNangCaoSelector = config.filterNangCaoSelector || '.Filter_nangCao';
    config.filterSapXepSelector = config.filterSapXepSelector || '.Filter_sapXep';
    config.filterGiaoDienSelector = config.filterGiaoDienSelector || '.Filter_giaoDien';
    config.filterCollapsedNangCao = config.filterCollapsedNangCao || '#Filter_collapsed_nangCao';
    config.filterCollapsedSapXep = config.filterCollapsedSapXep || '#Filter_collapsed_sapXep';
    config.filterCollapsedBang = config.filterCollapsedBang || '#Filter_collapsed_Bang';
    config.cardViewContainer = config.cardViewContainer || '#cardViewContainer';
    config.listViewContainer = config.listViewContainer || '#listViewContainer';
    config.tableViewContainer = config.tableViewContainer || '#tableViewContainer';
    config.cardViewGrid = config.cardViewGrid || '#cardViewGrid';
    config.listViewItems = config.listViewItems || '#listViewItems';
    config.cardViewPagination = config.cardViewPagination || '#cardViewPagination';
    config.listViewPagination = config.listViewPagination || '#listViewPagination';
    
    // Lưu config vào global để dùng trong các function khác
    window._filterConfigPost = config;
    
    // Khởi tạo pagination state
    if (!window._paginationStatePost) {
        window._paginationStatePost = {
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
    
    console.log('Filter POST initialized with config:', config);
}
//#endregion

//#region RENDER HTML FILTER SORT
function initFilterSortHtml(htmlFilterSort) {
    const config = window._filterConfigPost;
    const selector = config ? config.sortListSelector : '#sortList_option';
    
    if ($(selector).length > 0) {
        $(selector).html(htmlFilterSort);
    }
}
//#endregion

//#region EVENT HANDLERS INITIALIZATION
function initFilterEvents(config) {
    // 1. Xử lý collapse/expand filter dropdowns
    handleFilterCollapse(config);
    
    // 2. Xử lý change event của các filter inputs (select, input)
    handleFilterInputsChange(config);
    
    // 3. Xử lý change event của các date inputs (với debounce)
    handleDateInputsChange(config);
    
    // 4. Xử lý search box với debounce
    handleSearchInput(config);
    
    // 5. Xử lý click vào sort options
    handleSortClick(config);
    
    // 6. Xử lý switch view (Table/Card/List)
    handleViewSwitch(config);
}
//#endregion

//#region COLLAPSE/EXPAND HANDLERS
function handleFilterCollapse(config) {
    
    // Toggle Lọc nâng cao
    $(document).on('click', config.filterNangCaoSelector, function(e) {
        e.preventDefault();
        $(config.filterCollapsedNangCao).slideToggle(300);
        $(this).toggleClass('active');
    });
    
    // Toggle Sắp xếp
    $(document).on('click', config.filterSapXepSelector, function(e) {
        e.preventDefault();
        $(config.filterCollapsedSapXep).slideToggle(300);
        $(this).toggleClass('active');
    });
    
    // Toggle Giao diện/Bảng
    $(document).on('click', config.filterGiaoDienSelector, function(e) {
        e.preventDefault();
        $(config.filterCollapsedBang).slideToggle(300);
        $(this).toggleClass('active');
    });
    
    // Click outside để đóng filter
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.group_nangCao, .group_sapXep, .group_Bang').length) {
            $('.Filter_collapsed').slideUp(300);
            $(config.filterNangCaoSelector + ', ' + config.filterSapXepSelector + ', ' + config.filterGiaoDienSelector).removeClass('active');
        }
    });
}
//#endregion

//#region FILTER INPUTS CHANGE HANDLER
function handleFilterInputsChange(config) {
    // Lắng nghe change event của tất cả filter inputs
    if (config.filterInputs && config.filterInputs.length > 0) {
        config.filterInputs.forEach(selector => {
            // Sử dụng 'change' cho cả input thường và Select2
            // Select2 sẽ trigger cả 'change' và 'change.select2'
            $(document).on('change', selector, function() {
                console.log('Filter input changed:', selector, $(this).val());
                applyCommonFilter(config);
            });
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
    const collapsedSelector = config.filterCollapsedSapXep;
    
    // Xử lý click vào các option sắp xếp (Trường sắp xếp: Ten, LoaiCoSo, etc.)
    $(document).on('click', collapsedSelector + ' .option_sort li', function(e) {
        e.preventDefault();
        // Remove active từ các li trong cùng ul
        $(this).closest('ul').find('li').removeClass('active');
        // Add active vào li được click
        $(this).addClass('active');
        // Trigger applyFilter
        applyCommonFilter(config);
    });
    
    // Xử lý click vào các option chiều sắp xếp (ASC/DESC)
    $(document).on('click', collapsedSelector + ' ul:not(.option_sort) li', function(e) {
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
    $(document).on('click', config.filterCollapsedBang + ' ul li', function(e) {
        e.preventDefault();
        
        // Remove active từ các li khác
        $(this).closest('ul').find('li').removeClass('active');
        // Add active vào li được click
        $(this).addClass('active');
        
        // Lấy view type từ data-value
        const viewType = $(this).data('value') || 'bangBieu';
        
        // Cập nhật text và icon của Filter_giaoDien tương ứng
        updateFilterGiaoDienText(viewType, config.filterGiaoDienSelector);
        
        // Switch view containers
        switchViewContainers(viewType, config);
        
        // Nếu có callback từ config, gọi callback với viewType
        if (config.onViewChanged && typeof config.onViewChanged === 'function') {
            config.onViewChanged(viewType);
        }
    });
}

function updateFilterGiaoDienText(viewType, selector) {
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
    $(selector).html(`<i class="hgi-icon ${icon}"></i>${text}<i class="hgi-icon hgi-dropdown"></i>`);
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

function getCurrentViewType(config) {
    if (!config) {
        config = getFilterConfigPost();
    }
    if (!config) return 'bangBieu';
    
    // Kiểm tra container nào đang hiển thị
    if ($(config.cardViewContainer).is(':visible')) {
        return 'the';
    } else if ($(config.listViewContainer).is(':visible')) {
        return 'danhSach';
    } else {
        return 'bangBieu';
    }
}

function switchViewContainers(viewType, config) {
    if (!config) {
        config = getFilterConfigPost();
    }
    if (!config) return;
    
    // Lưu chiều cao hiện tại của container đang hiển thị
    const currentContainer = $(config.tableViewContainer + ':visible, ' + config.cardViewContainer + ':visible, ' + config.listViewContainer + ':visible');
    const currentHeight = currentContainer.outerHeight();
    
    // Hiển loading overlay
    showViewLoading();
    
    // Delay 300ms để hiệu ứng mượt hơn
    setTimeout(function() {
        // Ẩn tất cả containers
        $(config.tableViewContainer).hide();
        $(config.cardViewContainer).hide();
        $(config.listViewContainer).hide();
        
        // Hiển container tương ứng
        if (viewType === 'bangBieu') {
            $(config.tableViewContainer).show();
            // Ẩn loading ngay vì table đã có sẵn
            hideViewLoading();
        } else if (viewType === 'the') {
            // Set min-height để giữ layout
            $(config.cardViewContainer).css('min-height', currentHeight + 'px');
            $(config.cardViewContainer).show();
            // Tự động load data cho card view (với delay vì đang đổi view)
            loadViewData('the', config, true);
            // Vẫn trigger event để backward compatible
            $(document).trigger('viewChanged:card');
        } else if (viewType === 'danhSach') {
            // Set min-height để giữ layout
            $(config.listViewContainer).css('min-height', currentHeight + 'px');
            $(config.listViewContainer).show();
            // Tự động load data cho list view (với delay vì đang đổi view)
            loadViewData('danhSach', config, true);
            // Vẫn trigger event để backward compatible
            $(document).trigger('viewChanged:list');
        }
        
        console.log('Switched to view:', viewType);
    }, 300);
}
//#endregion

//#region LOAD VIEW DATA
/**
 * Tự động load data và render cho view hiện tại (POST method)
 * @param {string} viewType - Loại view: 'bangBieu', 'the', 'danhSach'
 * @param {Object} config - Filter config
 * @param {boolean} isViewSwitch - True nếu đang đổi giao diện (có delay), false nếu đang lọc (không delay)
 */
function loadViewData(viewType, config, isViewSwitch) {
    if (!config) {
        config = getFilterConfigPost();
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
        if (viewType === 'the' && window._paginationStatePost) {
            window._paginationStatePost.cardView.currentPage = 1;
        }
        if (viewType === 'danhSach' && window._paginationStatePost) {
            window._paginationStatePost.listView.currentPage = 1;
        }
    }
    
    // Lấy request body
    const requestBody = config.buildFilterRequest();
    
    // Format các trường ngày tháng nếu có
    if (config.dateInputs && config.dateInputs.length > 0) {
        config.dateInputs.forEach(selector => {
            const bodyKeys = Object.keys(requestBody);
            bodyKeys.forEach(key => {
                const value = $(selector).val();
                if (requestBody[key] === value && value && value.trim() !== '') {
                    if (typeof formatDateToSaveAsString === 'function') {
                        requestBody[key] = formatDateToSaveAsString(value);
                    }
                }
            });
        });
    }
    
    // Lấy giá trị sort
    const collapsedSelector = config.filterCollapsedSapXep;
    const sortType = $(collapsedSelector + ' .option_sort li.active').data('value');
    const sortDirection = $(collapsedSelector + ' ul:not(.option_sort) li.active').data('value');
    
    if (sortType) requestBody.type = sortType;
    if (sortDirection) requestBody.typeSort = sortDirection;
    
    console.log(`Loading ${viewType} view with request:`, requestBody);
    
    // Gọi API với POST method
    getDataWithApi('POST', config.apiUrl, JSON.stringify(requestBody))
        .then(data => {
            // Hàm xử lý response
            const processResponse = function() {
                if (data && data.isSuccess && data.value) {
                    if (viewType === 'the') {
                        renderCardView(data.value, config);
                        // Xóa min-height sau khi render xong
                        $(config.cardViewContainer).css('min-height', '');
                    } else if (viewType === 'danhSach') {
                        renderListView(data.value, config);
                        // Xóa min-height sau khi render xong
                        $(config.listViewContainer).css('min-height', '');
                    }
                } else {
                    const container = viewType === 'the' ? 
                        config.cardViewGrid : 
                        config.listViewItems;
                    $(container).html('<p class="text-center text-muted">Không có dữ liệu</p>');
                    // Xóa min-height khi không có dữ liệu
                    if (viewType === 'the') {
                        $(config.cardViewContainer).css('min-height', '');
                    } else if (viewType === 'danhSach') {
                        $(config.listViewContainer).css('min-height', '');
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
        })
        .catch(err => {
            console.error(`Error loading ${viewType} view:`, err);
            const container = viewType === 'the' ? 
                config.cardViewGrid : 
                config.listViewItems;
            $(container).html('<p class="text-center text-danger">Có lỗi xảy ra khi tải dữ liệu</p>');
            // Xóa min-height khi có lỗi
            if (viewType === 'the') {
                $(config.cardViewContainer).css('min-height', '');
            } else if (viewType === 'danhSach') {
                $(config.listViewContainer).css('min-height', '');
            }
            // Ẩn loading khi có lỗi
            hideViewLoading();
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
    const cardContainer = $(config.cardViewContainer);
    const cardGrid = $(config.cardViewGrid);
    
    cardGrid.empty();
    
    if (!data || data.length === 0) {
        cardGrid.html('<p class="text-center text-muted">Không có dữ liệu</p>');
        $(config.cardViewPagination).empty();
        return;
    }
    
    // Lấy itemsPerPage từ dropdown hoặc dùng mặc định
    const itemsPerPage = parseInt($('#cardItemsPerPage').val()) || config.itemsPerPage;
    
    // Lưu data vào state
    const state = window._paginationStatePost.cardView;
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
    renderPaginationPost('card', state, config, itemsPerPage);
}

/**
 * Render list view
 */
function renderListView(data, config) {
    const listContainer = $(config.listViewContainer);
    const listItems = $(config.listViewItems);
    
    listItems.empty();
    
    if (!data || data.length === 0) {
        listItems.html('<p class="text-center text-muted">Không có dữ liệu</p>');
        $(config.listViewPagination).empty();
        return;
    }
    
    // Lấy itemsPerPage từ dropdown hoặc dùng mặc định
    const itemsPerPage = parseInt($('#listItemsPerPage').val()) || config.itemsPerPage;
    
    // Lưu data vào state
    const state = window._paginationStatePost.listView;
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
    renderPaginationPost('list', state, config, itemsPerPage);
}

/**
 * Render pagination cho card hoặc list view (POST method)
 * @param {string} viewType - 'card' hoặc 'list'
 * @param {Object} state - Pagination state
 * @param {Object} config - Filter config
 * @param {number} itemsPerPage - Số items mỗi trang
 */
function renderPaginationPost(viewType, state, config, itemsPerPage) {
    const paginationSelector = viewType === 'card' ? 
        config.cardViewPagination : 
        config.listViewPagination;
    const $pagination = $(paginationSelector);
    
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
                window._paginationStatePost.cardView.currentPage = 1;
                renderCardView(window._paginationStatePost.cardView.allData, config);
            } else if (viewType === 'list') {
                window._paginationStatePost.listView.currentPage = 1;
                renderListView(window._paginationStatePost.listView.allData, config);
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
    const dropdownSelector = viewType === 'card' ? 
        config.cardViewPagination + ' #cardItemsPerPage' : 
        config.listViewPagination + ' #listItemsPerPage';
    if (typeof initSelect2 === 'function') {
        initSelect2();
    }
    
    // Xử lý click pagination
    $pagination.find('.page-link').off('click').on('click', function (e) {
        e.preventDefault();
        const page = parseInt($(this).data('page'));
        const view = $(this).data('view');
        
        if (page && page !== state.currentPage) {
            // Cập nhật current page
            if (view === 'card') {
                window._paginationStatePost.cardView.currentPage = page;
                // Re-render card view với data đã lưu
                renderCardView(window._paginationStatePost.cardView.allData, config);
            } else if (view === 'list') {
                window._paginationStatePost.listView.currentPage = page;
                // Re-render list view với data đã lưu
                renderListView(window._paginationStatePost.listView.allData, config);
            }
            
            // Scroll to top of container
            const scrollTarget = view === 'card' ? config.cardViewContainer : config.listViewContainer;
            $('html, body').animate({
                scrollTop: $(scrollTarget).offset().top - 100
            }, 300);
        }
    });
    
    // Thêm event listener cho dropdown items per page (chỉ thêm 1 lần)
    $(dropdownSelector).off('change.pagination').on('change.pagination', function() {
        // Reset về trang 1 khi thay đổi items per page
        if (viewType === 'card') {
            window._paginationStatePost.cardView.currentPage = 1;
            renderCardView(window._paginationStatePost.cardView.allData, config);
        } else if (viewType === 'list') {
            window._paginationStatePost.listView.currentPage = 1;
            renderListView(window._paginationStatePost.listView.allData, config);
        }
    });
}
//#endregion

//#region APPLY FILTER
function applyCommonFilter(config) {
    // Lấy request body từ function buildFilterRequest do view truyền vào
    const requestBody = config.buildFilterRequest();
    
    // Format các trường ngày tháng nếu có trong requestBody và config.dateInputs
    if (config.dateInputs && config.dateInputs.length > 0) {
        config.dateInputs.forEach(selector => {
            // Lấy tên property từ selector (ví dụ: #ngay-bat-dau-search → tìm ngayBatDau trong requestBody)
            const bodyKeys = Object.keys(requestBody);
            
            // Tìm key trong requestBody có giá trị từ selector này
            bodyKeys.forEach(key => {
                const value = $(selector).val();
                if (requestBody[key] === value && value && value.trim() !== '') {
                    // Kiểm tra xem có function formatDateToSaveAsString không
                    if (typeof formatDateToSaveAsString === 'function') {
                        requestBody[key] = formatDateToSaveAsString(value);
                        console.log(`Formatted ${key}: ${value} → ${requestBody[key]}`);
                    } else {
                        console.warn('formatDateToSaveAsString function not found, using raw value');
                    }
                }
            });
        });
    }
    
    // Lấy giá trị sort từ các li có class active
    const collapsedSelector = config.filterCollapsedSapXep;
    const sortType = $(collapsedSelector + ' .option_sort li.active').data('value');
    const sortDirection = $(collapsedSelector + ' ul:not(.option_sort) li.active').data('value');
    
    // Thêm sort properties vào request body nếu có
    if (sortType) {
        requestBody.type = sortType;
    }
    if (sortDirection) {
        requestBody.typeSort = sortDirection;
    }
    
    console.log('Filter Request Body:', requestBody);
    
    // Kiểm tra view hiện tại
    const currentView = getCurrentViewType(config);
    
    // Nếu đang ở card/list view và có render function, dùng loadViewData
    if ((currentView === 'the' && config.renderCardItem) || 
        (currentView === 'danhSach' && config.renderListItem)) {
        loadViewData(currentView, config);
    } else {
        // Nếu không, dùng callback truyền thống
        // Gọi API với POST method
        getDataWithApi('POST', config.apiUrl, JSON.stringify(requestBody))
            .then(data => {
                console.log('Filter Response:', data);
                // Gọi callback function do view truyền vào để xử lý data
                config.onFilterApplied(data);
            })
            .catch(err => {
                console.error('Filter Error:', err);
            });
    }
}
//#endregion

//#region HELPER FUNCTION - GET FILTER CONFIG
function getFilterConfigPost() {
    return window._filterConfigPost;
}

function getCurrentView() {
    return getCurrentViewType();
}
//#endregion
