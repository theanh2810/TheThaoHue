const lang = 'vi';
const apiBase = `${baseUrl}/api/v1/TT_StatisticalApi`;

// Gọi API GET trực tiếp bằng $.ajax với URL tuyệt đối.
// (Không dùng getDataWithApi vì helper đó tự ghép thêm getRootLink() gây double-prefix URL.)
function callApiAjax(url) {
    return $.ajax({
        type: 'GET',
        url: url,
        contentType: 'application/json; charset=utf-8'
    });
}

$(document).ready(function () {
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= 2020; y--) {
        $('#global-filter-nam').append(`<option value="${y}">Năm ${y}</option>`);
    }
    $('#global-filter-nam').select2({ theme: 'bootstrap4', width: '100%', placeholder: 'Tất cả các năm' });

    loadDashboard();

    initDanhMucChungSelect(7, '#trongtai-capbac', 'Tất cả cấp bậc');
    initDanhMucChungSelect(39, '#giaidau-capdo', 'Tất cả cấp độ');
    initDanhMucChungSelect(42, '#giaidau-trangthai', 'Tất cả trạng thái');
    initDanhMucChungSelect(56, '#thanhtich-cap', 'Tất cả cấp');
    initDanhMucChungSelect(57, '#thanhtich-hang', 'Tất cả hạng');
    initDanhMucChungSelect(55, '#thanhtich-loai', 'Tất cả loại');
    initDanhMucChungSelect(69, '#ctda-trangthai', 'Tất cả trạng thái');

    initMonTheThao('#global-filter-bomon', 'Tất cả bộ môn');
    initPhuongXa('#global-filter-diaphuong', 'Tất cả địa phương');
    $('#global-filter-bomon, #global-filter-diaphuong').select2({ theme: 'bootstrap4', width: '100%' });

    $('#thongKeTab a').on('shown.bs.tab', function (e) {
        const target = $(e.target).attr('href');
        switch (target) {
            case '#panel-dashboard':
                // Reflow Highcharts charts to fit container dimensions when tab becomes visible
                if (window.Highcharts && window.Highcharts.charts) {
                    window.Highcharts.charts.forEach(chart => {
                        if (chart) chart.reflow();
                    });
                }
                break;
            case '#panel-vdv': loadVanDongVien(); break;
            case '#panel-trongtai': loadTrongTai(); break;
            case '#panel-hlv': loadHuanLuyenVien(); break;
            case '#panel-canbo': loadCanBoTheThao(); break;
            case '#panel-donvi': loadToChucTheThao(); break;
            case '#panel-giaidau': loadGiaiDau(); break;
            case '#panel-thanhtich': loadThanhTich(); break;
            case '#panel-ctda': loadChuongTrinhDuAn(); break;
        }
    });
});

async function initDanhMucChungSelect(loaiDanhMucID, selector, defaultText) {
    try {
        const res = await callApiAjax(`${baseUrl}/api/DanhMucChungApi/GetsByLoaiDanhMuc?LoaiDanhMucID=${loaiDanhMucID}&MaNgonNgu=${lang}`);
        console.log(res, "respond danh mục chung")
        if (res && res.isSuccess && res.value) {
            let html = `<option value="">${defaultText}</option>`;
            res.value.forEach(item => {
                html += `<option value="${item.danhMucID}">${item.tenDanhMuc}</option>`;
            });
            $(selector).html(html);
            
            if ($(selector).hasClass("select2-hidden-accessible")) {
                $(selector).select2('destroy');
            }
            $(selector).select2({
                theme: 'bootstrap4',
                width: '100%',
                placeholder: defaultText,
                language: 'vi'
            });
        }
    } catch (e) {
        console.error('Error loading danh muc:', e);
    }
}

// Helper to determine CSS classes and icons for KPI cards
function getKpiCardConfig(title) {
    const t = title.toLowerCase();
    if (t.includes('vận động viên') || t.includes('vdv')) {
        return { cssClass: 'kpi-card-vdv', icon: 'hgi-user-multiple' };
    } else if (t.includes('trọng tài')) {
        return { cssClass: 'kpi-card-trongtai', icon: 'hgi-notification' };
    } else if (t.includes('huấn luyện viên') || t.includes('hlv')) {
        return { cssClass: 'kpi-card-hlv', icon: 'hgi-user-profile-active' };
    } else if (t.includes('cán bộ') || t.includes('quản lý')) {
        return { cssClass: 'kpi-card-canbo', icon: 'hgi-user-key' };
    } else if (t.includes('đơn vị') || t.includes('tổ chức')) {
        return { cssClass: 'kpi-card-donvi', icon: 'hgi-structure-01' };
    } else if (t.includes('giải đấu') || t.includes('sự kiện')) {
        return { cssClass: 'kpi-card-giaidau', icon: 'hgi-flag-01' };
    } else if (t.includes('thành tích') || t.includes('huy chương')) {
        return { cssClass: 'kpi-card-thanhtich', icon: 'hgi-award-01' };
    } else if (t.includes('chương trình') || t.includes('dự án')) {
        return { cssClass: 'kpi-card-ctda', icon: 'hgi-wallet-01' };
    }
    return { cssClass: 'kpi-card-vdv', icon: 'hgi-user' };
}

// Render the styled overview KPI cards
function renderCountCards(data) {
    let html = '';
    data.forEach(item => {
        const conf = getKpiCardConfig(item.loaiThongKe);
        html += `
            <div class="kpi-card ${conf.cssClass}">
                <div class="kpi-info">
                    <span class="kpi-value">${item.soLuong}</span>
                    <span class="kpi-title">${item.loaiThongKe}</span>
                </div>
                <div class="kpi-icon-wrapper">
                    <i class="hgi-icon ${conf.icon}"></i>
                </div>
            </div>
        `;
    });
    $('#countCardsContainer').html(html);
}

// Load and draw all Dashboard charts and cards in parallel
async function loadDashboard() {
    try {
        const loadingHtml = `
            <div class="d-flex justify-content-center align-items-center h-100 py-5">
                <div class="spinner-border text-primary" role="status" style="width: 2rem; height: 2rem;">
                    <span class="sr-only">Đang tải...</span>
                </div>
                <span class="ml-2 text-muted">Đang tải dữ liệu...</span>
            </div>
        `;
        $('#chart-personnel').html(loadingHtml);
        $('#chart-medals').html(loadingHtml);
        $('#chart-orgs').html(loadingHtml);
        $('#chart-funding').html(loadingHtml);
        $('#chart-gender').html(loadingHtml);
        $('#chart-referees').html(loadingHtml);

        // Fetch data from multiple endpoints concurrently
        const [countRes, vdvRes, huyChuongRes, orgRes, ctdaRes, trongTaiRes, giaiDauRes] = await Promise.all([
            callApiAjax(`${apiBase}/StatisticalCount?MaNgonNgu=${lang}`),
            callApiAjax(`${apiBase}/StatisticalVanDongVien?MaNgonNgu=${lang}`),
            callApiAjax(`${apiBase}/StatisticalHuyChuong?MaNgonNgu=${lang}`),
            callApiAjax(`${apiBase}/StatisticalToChucTheThao?MaNgonNgu=${lang}`),
            callApiAjax(`${apiBase}/StatisticalChuongTrinhDuAn?MaNgonNgu=${lang}`),
            callApiAjax(`${apiBase}/StatisticalTrongTai?MaNgonNgu=${lang}`),
            callApiAjax(`${apiBase}/StatisticalGiaiDauTheThao?MaNgonNgu=${lang}`)
        ]);

        // 1. KPI Cards and Personnel structure donut chart
        if (countRes && countRes.isSuccess && countRes.value) {
            const countData = [...countRes.value];
            // Append Giải đấu count if not already present
            const hasGiaiDau = countData.some(x => (x.loaiThongKe || '').toLowerCase().includes('giải đấu'));
            console.log(giaiDauRes, " co thong tin giai dau")
            if (!hasGiaiDau && giaiDauRes && giaiDauRes.isSuccess && giaiDauRes.value) {
                countData.push({ loaiThongKe: 'Giải đấu', soLuong: giaiDauRes.value.length });
            }
            renderCountCards(countData);
            renderPersonnelChart(countRes.value);
        } else {
            $('#countCardsContainer').html('<span class="text-danger">Không thể tải dữ liệu tổng đếm.</span>');
            $('#chart-personnel').html('<div class="text-danger text-center py-5">Không có dữ liệu nhân sự</div>');
        }

        // 2. Medals column chart
        if (huyChuongRes && huyChuongRes.isSuccess && huyChuongRes.value) {
            renderMedalChart(huyChuongRes.value);
        } else {
            $('#chart-medals').html('<div class="text-danger text-center py-5">Không có dữ liệu huy chương</div>');
        }

        // 3. Organization type donut chart
        if (orgRes && orgRes.isSuccess && orgRes.value) {
            renderOrgTypeChart(orgRes.value);
        } else {
            $('#chart-orgs').html('<div class="text-danger text-center py-5">Không có dữ liệu tổ chức</div>');
        }

        // 4. Funding horizontal bar chart
        if (ctdaRes && ctdaRes.isSuccess && ctdaRes.value) {
            renderFundingChart(ctdaRes.value);
        } else {
            $('#chart-funding').html('<div class="text-danger text-center py-5">Không có dữ liệu kinh phí</div>');
        }

        // 5. Athlete gender pie chart
        if (vdvRes && vdvRes.isSuccess && vdvRes.value) {
            renderGenderChart(vdvRes.value);
        } else {
            $('#chart-gender').html('<div class="text-danger text-center py-5">Không có dữ liệu giới tính VĐV</div>');
        }

        // 6. Referee grade column chart
        if (trongTaiRes && trongTaiRes.isSuccess && trongTaiRes.value) {
            renderRefereeGradeChart(trongTaiRes.value);
        } else {
            $('#chart-referees').html('<div class="text-danger text-center py-5">Không có dữ liệu cấp bậc trọng tài</div>');
        }
    } catch (e) {
        console.error('Error loading dashboard:', e);
        $('#countCardsContainer').html('<span class="text-danger">Đã xảy ra lỗi khi tải dữ liệu thống kê.</span>');
    }
}

// Chart 1: Personnel Structure (Donut)
function renderPersonnelChart(data) {
    const personnelData = [];
    data.forEach(item => {
        const t = item.loaiThongKe.toLowerCase();
        if (t.includes('vận động viên') || t.includes('trọng tài') || t.includes('huấn luyện viên') || t.includes('cán bộ')) {
            personnelData.push({
                name: item.loaiThongKe,
                y: item.soLuong
            });
        }
    });

    Highcharts.chart('chart-personnel', {
        chart: { type: 'pie', backgroundColor: '#ffffff' },
        title: { text: null },
        tooltip: { pointFormat: '<b>{point.name}</b>: {point.y} người ({point.percentage:.1f}%)' },
        plotOptions: {
            pie: {
                innerSize: '65%',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.y} người',
                    style: { fontSize: '11px' }
                },
                showInLegend: true
            }
        },
        legend: {
            align: 'center',
            verticalAlign: 'bottom',
            layout: 'horizontal'
        },
        credits: { enabled: false },
        series: [{ name: 'Số lượng', colorByPoint: true, data: personnelData }]
    });
}

// Chart 2: Medal achievements (Column)
function renderMedalChart(data) {
    const colors = ['#d9a441', '#9aa3ad', '#b87333', '#2f80ed', '#27ae60', '#8e6bbf'];
    const seriesData = (data || [])
        .filter(item => Number(item.soLuong) > 0)
        .map((item, index) => ({
            name: item.tenHuyChuong || 'Chưa phân loại',
            y: Number(item.soLuong),
            color: colors[index % colors.length]
        }));

    if (seriesData.length === 0) {
        $('#chart-medals').html('<div class="text-muted text-center py-5">Chưa có dữ liệu huy chương</div>');
        return;
    }

    Highcharts.chart('chart-medals', {
        chart: { type: 'column', backgroundColor: '#ffffff' },
        title: { text: null },
        xAxis: { type: 'category', labels: { style: { fontSize: '11px' } } },
        yAxis: { min: 0, allowDecimals: false, title: { text: 'Số lượng huy chương' } },
        legend: { enabled: false },
        tooltip: { pointFormat: 'Số lượng: <b>{point.y} huy chương</b>' },
        plotOptions: {
            column: {
                dataLabels: { enabled: true, format: '{point.y}' },
                borderRadius: 4
            }
        },
        credits: { enabled: false },
        series: [{ name: 'Huy chương', colorByPoint: true, data: seriesData }]
    });
}

// Chart 3: Organizations by Type (Donut)
function renderOrgTypeChart(data) {
    const groups = {};
    data.forEach(item => {
        const type = item.tenLoaiHinh || 'Chưa phân loại';
        groups[type] = (groups[type] || 0) + 1;
    });

    const chartData = Object.keys(groups).map(key => ({
        name: key,
        y: groups[key]
    }));

    Highcharts.chart('chart-orgs', {
        chart: { type: 'pie', backgroundColor: '#ffffff' },
        title: { text: null },
        tooltip: { pointFormat: '<b>{point.name}</b>: {point.y} đơn vị ({point.percentage:.1f}%)' },
        plotOptions: {
            pie: {
                innerSize: '50%',
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.y}',
                    style: { fontSize: '10px' }
                },
                showInLegend: true
            }
        },
        legend: {
            align: 'center',
            verticalAlign: 'bottom',
            layout: 'horizontal'
        },
        credits: { enabled: false },
        series: [{ name: 'Số lượng', colorByPoint: true, data: chartData }]
    });
}

// Chart 4: Programs and Projects funding (Horizontal Bar)
function renderFundingChart(data) {
    // Sort descending by budget and display top 8
    const sorted = [...data].sort((a, b) => (b.kinhPhi || 0) - (a.kinhPhi || 0)).slice(0, 8);
    const categories = sorted.map(item => item.tenChuongTrinh);
    const values = sorted.map(item => item.kinhPhi || 0);

    Highcharts.chart('chart-funding', {
        chart: { type: 'bar', backgroundColor: '#ffffff' },
        title: { text: null },
        xAxis: {
            categories: categories,
            labels: {
                style: { fontSize: '9px', textOverflow: 'ellipsis' },
                formatter: function () {
                    return this.value.length > 25 ? this.value.substring(0, 25) + '...' : this.value;
                }
            }
        },
        yAxis: { min: 0, title: { text: 'Kinh phí (VNĐ)' } },
        tooltip: {
            formatter: function () {
                return `<b>${this.x}</b><br/>Kinh phí: <b>${new Intl.NumberFormat('vi-VN').format(this.y)} đ</b>`;
            }
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: true,
                    formatter: function () {
                        if (this.y === 0) return '';
                        if (this.y >= 1e9) return (this.y / 1e9).toFixed(1) + ' tỷ đ';
                        if (this.y >= 1e6) return (this.y / 1e6).toFixed(0) + ' triệu đ';
                        return new Intl.NumberFormat('vi-VN').format(this.y) + ' đ';
                    },
                    style: { fontSize: '10px' }
                },
                borderRadius: 4
            }
        },
        credits: { enabled: false },
        legend: { enabled: false },
        series: [{ name: 'Kinh phí', data: values, color: '#00bcd4' }]
    });
}

// Chart 5: Athlete gender balance (Donut)
function renderGenderChart(data) {
    let male = 0, female = 0, unknown = 0;
    //console.log(data, "data giới tính")
    data.forEach(item => {
        const g = (item.gioiTinhID || '');
        if (g === 82) male++;
        else if (g === 83) female++;
        else unknown++;
    });

    const genderData = [
        { name: 'Nam', y: male, color: '#3498db' },
        { name: 'Nữ', y: female, color: '#e74c3c' }
    ];
    if (unknown > 0) {
        genderData.push({ name: 'Khác', y: unknown, color: '#95a5a6' });
    }

    Highcharts.chart('chart-gender', {
        chart: { type: 'pie', backgroundColor: '#ffffff' },
        title: { text: null },
        tooltip: { pointFormat: '<b>{point.name}</b>: {point.y} VĐV ({point.percentage:.1f}%)' },
        plotOptions: {
            pie: {
                innerSize: '60%',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.y} VĐV',
                    style: { fontSize: '11px' }
                },
                showInLegend: true
            }
        },
        legend: {
            align: 'center',
            verticalAlign: 'bottom',
            layout: 'horizontal'
        },
        credits: { enabled: false },
        series: [{ name: 'Số lượng', data: genderData }]
    });
}

// Chart 6: Referee counts by Grade (Column)
function renderRefereeGradeChart(data) {
    const grades = {};
    data.forEach(item => {
        const grade = item.tenCapBac || 'Chưa phân loại';
        grades[grade] = (grades[grade] || 0) + 1;
    });

    const categories = Object.keys(grades);
    const values = Object.values(grades);

    Highcharts.chart('chart-referees', {
        chart: { type: 'column', backgroundColor: '#ffffff' },
        title: { text: null },
        xAxis: { categories: categories, labels: { style: { fontSize: '10px' } } },
        yAxis: { min: 0, title: { text: 'Số lượng trọng tài / giám sát' } },
        tooltip: { pointFormat: 'Số lượng: <b>{point.y} người</b>' },
        plotOptions: {
            column: {
                dataLabels: { enabled: true, format: '{point.y}' },
                borderRadius: 4
            }
        },
        credits: { enabled: false },
        legend: { enabled: false },
        series: [{ name: 'Số lượng', data: values, color: '#9b59b6' }]
    });
}

async function loadStatisticalCount() {
    try {
        const res = await callApiAjax(`${apiBase}/StatisticalCount?MaNgonNgu=${lang}`);
        if (res && res.isSuccess && res.value) {
            let html = '';
            res.value.forEach(item => {
                html += `<div class="card shadow-sm" style="min-width: 180px;">
                            <div class="card-body text-center p-3">
                                <h3 class="mb-1 text-primary fw-bold">${item.soLuong}</h3>
                                <p class="mb-0 text-muted small">${item.loaiThongKe}</p>
                            </div>
                        </div>`;
            });
            $('#countCardsContainer').html(html);
        }
    } catch (e) {
        $('#countCardsContainer').html('<span class="text-danger">Lỗi tải dữ liệu</span>');
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('vi-VN');
}

function formatCurrency(value) {
    if (!value) return '';
    return new Intl.NumberFormat('vi-VN').format(value) + ' đ';
}

function getGlobalQuery() {
    const fNam = $('#global-filter-nam').val() || '';
    const fTieuChi = $('#global-filter-tieuchi').val() || '';
    const fLinhVuc = $('#global-filter-linhvuc').val() || '';
    const fBoMon = $('#global-filter-bomon').val() || '';
    const fNoiBat = $('#global-filter-noibat').val() || '';
    const fDiaPhuong = $('#global-filter-diaphuong').val() || '';

    let query = '';
    if (fNam) query += `&Nam=${encodeURIComponent(fNam)}`;
    if (fTieuChi) query += `&TieuChi=${encodeURIComponent(fTieuChi)}`;
    if (fLinhVuc) query += `&LinhVuc=${encodeURIComponent(fLinhVuc)}`;
    if (fBoMon) query += `&BoMon=${encodeURIComponent(fBoMon)}`;
    if (fNoiBat) query += `&NoiBat=${encodeURIComponent(fNoiBat)}`;
    if (fDiaPhuong) query += `&DiaPhuong=${encodeURIComponent(fDiaPhuong)}`;
    return query;
}

function applyGlobalFilter() {
    const activeTabId = $('#thongKeTab .nav-link.active').attr('href');
    switch (activeTabId) {
        case '#panel-vdv': loadVanDongVien(); break;
        case '#panel-trongtai': loadTrongTai(); break;
        case '#panel-hlv': loadHuanLuyenVien(); break;
        case '#panel-canbo': loadCanBoTheThao(); break;
        case '#panel-donvi': loadToChucTheThao(); break;
        case '#panel-giaidau': loadGiaiDau(); break;
        case '#panel-thanhtich': loadThanhTich(); break;
        case '#panel-ctda': loadChuongTrinhDuAn(); break;
    }
}

function getAvatarChar(name) {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    return parts[parts.length - 1].charAt(0).toUpperCase();
}

function renderEmptyState(message) {
    return `
        <div class="col-12 py-5 text-center w-100">
            <div class="mb-3">
                <i class="hgi-icon hgi-search-minus text-muted" style="font-size: 4rem;"></i>
            </div>
            <h5 class="text-muted">${message || 'Không có dữ liệu'}</h5>
        </div>
    `;
}

function renderSkeletonGrid() {
    let html = '';
    for(let i=0; i<4; i++) {
        html += `
        <div class="col-xl-3 col-lg-4 col-md-6 col-12">
            <div class="card h-100 shadow-sm border-0 skeleton-card" style="min-height: 150px; background: #fafafa;">
                <div class="card-body d-flex flex-column justify-content-center align-items-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="sr-only">Đang tải...</span>
                    </div>
                </div>
            </div>
        </div>`;
    }
    return html;
}

function renderUserGrid(data, type) {
    if (!data || data.length === 0) return renderEmptyState();
    let html = '';
    data.forEach(item => {
        const char = getAvatarChar(item.hoTen);
        const name = item.hoTen || 'Không tên';
        const id = item.maDinhDanh || '---';
        const date = formatDate(item.ngaySinh);
        
        let extra1 = '', extra2 = '';
        if (type === 'vdv' || type === 'hlv') {
            extra1 = `<span class="badge badge-light border text-dark"><i class="hgi-icon hgi-user mr-1"></i>${item.gioiTinh || 'Không rõ'}</span>`;
            if (type === 'hlv') extra2 = `<span class="badge badge-info"><i class="hgi-icon hgi-diploma mr-1"></i>${item.bangCap || 'Chưa cập nhật'}</span>`;
            else extra2 = `<span class="badge badge-primary"><i class="hgi-icon hgi-basketball mr-1"></i>${item.soLuongMon || 0} môn</span>`;
        } else if (type === 'trongtai') {
            extra1 = `<span class="badge badge-warning"><i class="hgi-icon hgi-award-02 mr-1"></i>${item.tenCapBac || 'Chưa cấp'}</span>`;
            extra2 = `<span class="badge badge-primary"><i class="hgi-icon hgi-basketball mr-1"></i>${item.soLuongMon || 0} môn</span>`;
        } else if (type === 'canbo') {
            extra1 = `<span class="badge badge-light border text-dark text-truncate d-inline-block" style="max-width: 150px;"><i class="hgi-icon hgi-location-point mr-1"></i>${item.diaChi || 'Không rõ'}</span>`;
        }

        html += `
        <div class="col-xl-3 col-lg-4 col-md-6 col-12">
            <div class="card h-100 shadow-sm border-0 user-card" style="transition: transform 0.2s; cursor: pointer;" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='none'">
                <div class="card-body">
                    <div class="d-flex align-items-center mb-3">
                        <div class="avatar-circle bg-primary text-white d-flex align-items-center justify-content-center mr-3" style="width: 50px; height: 50px; border-radius: 50%; font-size: 20px; font-weight: bold;">
                            ${char}
                        </div>
                        <div style="width: calc(100% - 65px);">
                            <h6 class="mb-1 fw-bold text-dark text-truncate" title="${name}">${name}</h6>
                            <small class="text-muted d-block text-truncate">ID: ${id}</small>
                        </div>
                    </div>
                    <div class="d-flex flex-wrap mb-2" style="gap: 5px;">
                        ${extra1} ${extra2}
                    </div>
                    <div class="text-muted small">
                        <i class="hgi-icon hgi-calendar-01 mr-1"></i> Sinh: ${date || '---'}
                    </div>
                </div>
            </div>
        </div>`;
    });
    return html;
}

function renderEventGrid(data, type) {
    if (!data || data.length === 0) return renderEmptyState();
    let html = '';
    data.forEach(item => {
        let title = '', icon = '', col1 = '', col2 = '', status = '';
        if (type === 'giaidau') {
            title = item.tenSuKien;
            icon = '<i class="hgi-icon hgi-flag-02 text-danger" style="font-size: 2rem;"></i>';
            status = `<span class="badge badge-success">${item.tenTrangThai || '---'}</span>`;
            col1 = `Cấp độ: <b>${item.tenCapDo || '---'}</b>`;
            col2 = `Thời gian: ${formatDate(item.batDau)} - ${formatDate(item.ketThuc)}`;
        } else if (type === 'thanhtich') {
            title = item.tenThanhTich;
            icon = '<i class="hgi-icon hgi-trophy text-warning" style="font-size: 2rem;"></i>';
            status = `<span class="badge badge-warning">${item.tenHang || '---'}</span>`;
            col1 = `Sự kiện: <b class="text-truncate d-inline-block" style="max-width:200px; vertical-align:bottom;">${item.tenSuKien || '---'}</b>`;
            col2 = `Ngày trao: ${formatDate(item.ngayTraoGiai)}`;
        } else if (type === 'donvi') {
            title = item.tenToChuc;
            icon = '<i class="hgi-icon hgi-structure-01 text-primary" style="font-size: 2rem;"></i>';
            status = `<span class="badge badge-info">${item.tenLoaiHinh || '---'}</span>`;
            col1 = `SĐT: <b>${item.dienThoai || '---'}</b>`;
            col2 = `<span class="text-truncate d-inline-block" style="max-width: 250px; vertical-align:bottom;">Địa chỉ: ${item.diaChi || '---'}</span>`;
        } else if (type === 'ctda') {
            title = item.tenChuongTrinh;
            icon = '<i class="hgi-icon hgi-wallet-01 text-success" style="font-size: 2rem;"></i>';
            status = `<span class="badge badge-secondary">${item.tenTrangThai || '---'}</span>`;
            col1 = `Đơn vị: <b class="text-truncate d-inline-block" style="max-width:200px; vertical-align:bottom;">${item.donVi || '---'}</b>`;
            col2 = `Kinh phí: <span class="text-danger fw-bold">${formatCurrency(item.kinhPhi)}</span>`;
        }

        html += `
        <div class="col-lg-6 col-12">
            <div class="card h-100 shadow-sm border-0 event-card" style="transition: transform 0.2s; cursor: pointer;" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='none'">
                <div class="card-body d-flex align-items-start">
                    <div class="mr-3 bg-light rounded p-2 d-flex align-items-center justify-content-center" style="width: 60px; height: 60px;">
                        ${icon}
                    </div>
                    <div style="flex: 1; width: calc(100% - 75px);">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="mb-0 fw-bold text-dark pr-2 text-truncate" title="${title}">${title || '---'}</h6>
                            ${status}
                        </div>
                        <div class="text-muted small mb-1"><i class="hgi-icon hgi-information mr-1"></i> ${col1}</div>
                        <div class="text-muted small" title="${col2.replace(/<[^>]+>/g, '')}"><i class="hgi-icon hgi-calendar-01 mr-1"></i> ${col2}</div>
                    </div>
                </div>
            </div>
        </div>`;
    });
    return html;
}

function loadVanDongVien() {
    const tuKhoa = $('#vdv-search').val() || '';
    let url = `${apiBase}/StatisticalVanDongVien?MaNgonNgu=${lang}&TuKhoa=${encodeURIComponent(tuKhoa)}${getGlobalQuery()}`;

    const chartIds = ['chart-vdv-gioitinh','chart-vdv-dantoc','chart-vdv-tongiao','chart-vdv-tinh','chart-vdv-tuoi','chart-vdv-mon','chart-vdv-mon-pie','chart-vdv-mon-stack','chart-vdv-phuongxa'];
    chartIds.forEach(id => $(`#${id}`).html('<div class="d-flex justify-content-center align-items-center" style="height:100%;"><div class="spinner-border text-primary" role="status"><span class="sr-only">Loading...</span></div></div>'));

    callApiAjax(url).then(res => {
        if (res && res.isSuccess && res.value) {
            const data = res.value;
            renderVdvGioiTinhChart(data);
            renderVdvDanTocChart(data);
            renderVdvTonGiaoChart(data);
            renderVdvTinhChart(data);
            renderVdvTuoiChart(data);
            renderVdvMonChart(data);
            renderVdvMonPieChart(data);
            renderVdvMonStackChart(data);
            _renderWardBarChart('chart-vdv-phuongxa', data, '#27ae60', 'VĐV');
        } else {
            chartIds.forEach(id => $(`#${id}`).html('<div class="text-danger text-center py-4">Không có dữ liệu</div>'));
        }
    }).catch(() => {
        chartIds.forEach(id => $(`#${id}`).html('<div class="text-danger text-center py-4">Lỗi tải dữ liệu</div>'));
    });
}

function _vdvCountBy(data, keyFn, defaultLabel) {
    const groups = {};
    data.forEach(item => {
        const k = keyFn(item) || defaultLabel || 'Không rõ';
        groups[k] = (groups[k] || 0) + 1;
    });
    return groups;
}

function renderVdvGioiTinhChart(data) {
    const groups = _vdvCountBy(data, d => d.gioiTinhID, 'Không rõ');
    const chartData = Object.keys(groups).map(k => ({ name: k == 82 ? 'Nam' : 'Nữ', y: groups[k] }));
    Highcharts.chart('chart-vdv-gioitinh', {
        chart: { type: 'pie', backgroundColor: '#ffffff' },
        title: { text: null },
        tooltip: { pointFormat: '<b>{point.name}</b>: {point.y} người ({point.percentage:.1f}%)' },
        plotOptions: { pie: { innerSize: '55%', dataLabels: { enabled: true, format: '<b>{point.name}</b>: {point.y}', style: { fontSize: '11px' } }, showInLegend: true, colors: ['#3498db','#e74c3c','#95a5a6'] } },
        legend: { align: 'center', verticalAlign: 'bottom', layout: 'horizontal' },
        credits: { enabled: false },
        series: [{ name: 'Số lượng', colorByPoint: true, data: chartData }]
    });
}

function renderVdvDanTocChart(data) {
    const groups = _vdvCountBy(data, d => d.danToc, 'Chưa cập nhật');
    const sorted = Object.entries(groups).sort((a, b) => b[1] - a[1]).slice(0, 15);
    Highcharts.chart('chart-vdv-dantoc', {
        chart: { type: 'column', backgroundColor: '#ffffff' },
        title: { text: null },
        xAxis: { categories: sorted.map(x => x[0]), labels: { rotation: -30, style: { fontSize: '10px' } } },
        yAxis: { min: 0, title: { text: 'Số người' } },
        tooltip: { pointFormat: 'Số lượng: <b>{point.y} người</b>' },
        plotOptions: { column: { dataLabels: { enabled: true, format: '{point.y}' }, borderRadius: 3 } },
        legend: { enabled: false },
        credits: { enabled: false },
        series: [{ name: 'Dân tộc', data: sorted.map(x => x[1]), colorByPoint: true }]
    });
}

function renderVdvTonGiaoChart(data) {
    console.log(data, "data tôn giáo")
    const tonGiaoMap = { 1: 'Không có', 2: 'Phật giáo', 3: 'Công giáo', 4: 'Tin Lành', 5: 'Cao Đài', 6: 'Hồi giáo', 7: 'Khác' };
    const groups = _vdvCountBy(data, d => tonGiaoMap[d.tonGiaoID] || (d.tonGiaoID ? 'Khác' : 'Không có'), 'Không có');
    const chartData = Object.entries(groups).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ name: k, y: v }));
    Highcharts.chart('chart-vdv-tongiao', {
        chart: { type: 'pie', backgroundColor: '#ffffff' },
        title: { text: null },
        tooltip: { pointFormat: '<b>{point.name}</b>: {point.y} người ({point.percentage:.1f}%)' },
        plotOptions: { pie: { innerSize: '50%', dataLabels: { enabled: true, format: '<b>{point.name}</b>: {point.y}', style: { fontSize: '10px' } }, showInLegend: true } },
        legend: { align: 'center', verticalAlign: 'bottom', layout: 'horizontal' },
        credits: { enabled: false },
        series: [{ name: 'Số lượng', colorByPoint: true, data: chartData }]
    });
}

function renderVdvTinhChart(data) {
    const groups = _vdvCountBy(data, d => d.tenTinh, 'Chưa cập nhật');
    const sorted = Object.entries(groups).sort((a, b) => b[1] - a[1]).slice(0, 15);
    Highcharts.chart('chart-vdv-tinh', {
        chart: { type: 'bar', backgroundColor: '#ffffff' },
        title: { text: null },
        xAxis: { categories: sorted.map(x => x[0]), labels: { style: { fontSize: '10px' } } },
        yAxis: { min: 0, title: { text: 'Số người' } },
        tooltip: { pointFormat: 'Số lượng: <b>{point.y} người</b>' },
        plotOptions: { bar: { dataLabels: { enabled: true, format: '{point.y}' }, borderRadius: 3 } },
        legend: { enabled: false },
        credits: { enabled: false },
        series: [{ name: 'Tỉnh/Thành', data: sorted.map(x => x[1]), color: '#00bcd4' }]
    });
}

function renderVdvTuoiChart(data) {
    const currentYear = new Date().getFullYear();
    const ageBuckets = {};
    data.forEach(item => {
        if (!item.ngaySinh) return;
        const age = currentYear - new Date(item.ngaySinh).getFullYear();
        if (age < 0 || age > 100) return;
        const bucket = Math.floor(age / 5) * 5;
        const label = `${bucket}-${bucket + 4}`;
        ageBuckets[label] = (ageBuckets[label] || 0) + 1;
    });
    const sortedBuckets = Object.entries(ageBuckets).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
    Highcharts.chart('chart-vdv-tuoi', {
        chart: { type: 'areaspline', backgroundColor: '#ffffff' },
        title: { text: null },
        xAxis: { categories: sortedBuckets.map(x => x[0]), title: { text: 'Nhóm tuổi' }, labels: { style: { fontSize: '10px' } } },
        yAxis: { min: 0, title: { text: 'Số VĐV' } },
        tooltip: { pointFormat: 'Nhóm tuổi <b>{point.category}</b>: <b>{point.y} VĐV</b>' },
        plotOptions: { areaspline: { fillOpacity: 0.3, marker: { enabled: true, radius: 4 } } },
        legend: { enabled: false },
        credits: { enabled: false },
        series: [{ name: 'Số VĐV', data: sortedBuckets.map(x => x[1]), color: '#3498db', fillColor: { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0,'rgba(52,152,219,0.5)'],[1,'rgba(52,152,219,0)']] } }]
    });
}

function renderVdvMonChart(data) {
    const order = ['Chưa có môn', '1 môn', '2 môn', '3 môn', '4+ môn'];
    const monGroups = { 'Chưa có môn': 0, '1 môn': 0, '2 môn': 0, '3 môn': 0, '4+ môn': 0 };
    data.forEach(item => {
        const sl = item.soLuongMon || 0;
        if (sl === 0) monGroups['Chưa có môn']++;
        else if (sl === 1) monGroups['1 môn']++;
        else if (sl === 2) monGroups['2 môn']++;
        else if (sl === 3) monGroups['3 môn']++;
        else monGroups['4+ môn']++;
    });
    Highcharts.chart('chart-vdv-mon', {
        chart: { type: 'column', backgroundColor: '#ffffff' },
        title: { text: null },
        xAxis: { categories: order, labels: { style: { fontSize: '11px' } } },
        yAxis: { min: 0, title: { text: 'Số VĐV' } },
        tooltip: { pointFormat: 'Số VĐV: <b>{point.y}</b>' },
        plotOptions: { column: { dataLabels: { enabled: true, format: '{point.y}' }, borderRadius: 4, colorByPoint: true } },
        legend: { enabled: false },
        credits: { enabled: false },
        series: [{ name: 'Số VĐV', data: order.map(k => monGroups[k]) }]
    });
}

function renderVdvMonPieChart(data) {
    const monGroups = { 'Chưa có môn': 0, '1 môn': 0, '2 môn': 0, '3 môn': 0, '4+ môn': 0 };
    data.forEach(item => {
        const sl = item.soLuongMon || 0;
        if (sl === 0) monGroups['Chưa có môn']++;
        else if (sl === 1) monGroups['1 môn']++;
        else if (sl === 2) monGroups['2 môn']++;
        else if (sl === 3) monGroups['3 môn']++;
        else monGroups['4+ môn']++;
    });
    const chartData = Object.entries(monGroups).filter(([,v]) => v > 0).map(([k, v]) => ({ name: k, y: v }));
    Highcharts.chart('chart-vdv-mon-pie', {
        chart: { type: 'pie', backgroundColor: '#ffffff' },
        title: { text: null },
        tooltip: { pointFormat: '<b>{point.name}</b>: {point.y} VĐV ({point.percentage:.1f}%)' },
        plotOptions: { pie: { dataLabels: { enabled: true, format: '<b>{point.name}</b>: {point.percentage:.1f}%', style: { fontSize: '10px' } }, showInLegend: true } },
        legend: { align: 'center', verticalAlign: 'bottom', layout: 'horizontal' },
        credits: { enabled: false },
        series: [{ name: 'Số VĐV', colorByPoint: true, data: chartData }]
    });
}

function renderVdvMonStackChart(data) {
    const gioiTinhGroups = {};
    data.forEach(item => {
        const gt = item.gioiTinh || 'Không rõ';
        if (!gioiTinhGroups[gt]) gioiTinhGroups[gt] = { coMon: 0, khongMon: 0 };
        if ((item.soLuongMon || 0) > 0) gioiTinhGroups[gt].coMon++;
        else gioiTinhGroups[gt].khongMon++;
    });
    const cats = Object.keys(gioiTinhGroups);
    Highcharts.chart('chart-vdv-mon-stack', {
        chart: { type: 'column', backgroundColor: '#ffffff' },
        title: { text: null },
        xAxis: { categories: cats, labels: { style: { fontSize: '11px' } } },
        yAxis: { min: 0, title: { text: 'Số VĐV' }, stackLabels: { enabled: true, style: { fontWeight: 'bold', color: '#666' } } },
        tooltip: { headerFormat: '<b>{point.x}</b><br/>', pointFormat: '{series.name}: {point.y}<br/>Tổng: {point.stackTotal}' },
        plotOptions: { column: { stacking: 'normal', dataLabels: { enabled: true } } },
        legend: { align: 'center', verticalAlign: 'bottom', layout: 'horizontal' },
        credits: { enabled: false },
        series: [
            { name: 'Có đăng ký môn thể thao', data: cats.map(k => gioiTinhGroups[k].coMon), color: '#2ecc71' },
            { name: 'Chưa đăng ký môn', data: cats.map(k => gioiTinhGroups[k].khongMon), color: '#e74c3c' }
        ]
    });
}

function loadTrongTai() {
    const tuKhoa = $('#trongtai-search').val() || '';
    const capBacID = $('#trongtai-capbac').val() || '';
    let url = `${apiBase}/StatisticalTrongTai?MaNgonNgu=${lang}&TuKhoa=${encodeURIComponent(tuKhoa)}${getGlobalQuery()}`;
    if (capBacID) url += `&CapBacID=${capBacID}`;

    const chartIds = ['chart-tt-gioitinh','chart-tt-capbac','chart-tt-dantoc','chart-tt-tinh','chart-tt-tuoi','chart-tt-mon','chart-tt-phuongxa'];
    const loading = '<div class="d-flex justify-content-center align-items-center" style="height:100%;"><div class="spinner-border text-primary" role="status"></div></div>';
    chartIds.forEach(id => $(`#${id}`).html(loading));

    callApiAjax(url).then(res => {
        if (res && res.isSuccess && res.value) {
            const data = res.value;
            // Giới tính
            _renderPieChart('chart-tt-gioitinh', _vdvCountBy(data, d => d.gioiTinhID == 82 ? 'Nam' : 'Nữ', 'Không rõ'), ['#3498db','#e74c3c','#95a5a6']);
            // Cấp bậc
            _renderColumnChart('chart-tt-capbac', _vdvCountBy(data, d => d.tenCapBac, 'Chưa cấp'), '#f39c12');
            // Dân tộc
            _renderColumnChart('chart-tt-dantoc', _vdvCountBy(data, d => d.danToc, 'Chưa cập nhật'), '#27ae60', true);
            // Tỉnh/Thành
            _renderBarChart('chart-tt-tinh', _vdvCountBy(data, d => d.tenTinh, 'Chưa cập nhật'), '#00bcd4');
            // Độ tuổi
            _renderAgeAreaChart('chart-tt-tuoi', data, '#9b59b6');
            // Số môn
            _renderMonGroupChart('chart-tt-mon', data, '#e67e22');
            // Phường/Xã
            _renderWardBarChart('chart-tt-phuongxa', data, '#11998e', 'trọng tài');
        } else {
            chartIds.forEach(id => $(`#${id}`).html('<div class="text-danger text-center py-4">Không có dữ liệu</div>'));
        }
    }).catch(() => {
        chartIds.forEach(id => $(`#${id}`).html('<div class="text-danger text-center py-4">Lỗi tải dữ liệu</div>'));
    });
}

function loadHuanLuyenVien() {
    const tuKhoa = $('#hlv-search').val() || '';
    let url = `${apiBase}/StatisicalHuanLuyenVien?MaNgonNgu=${lang}&TuKhoa=${encodeURIComponent(tuKhoa)}${getGlobalQuery()}`;

    const chartIds = ['chart-hlv-gioitinh','chart-hlv-dantoc','chart-hlv-bangcap','chart-hlv-tinh','chart-hlv-tuoi','chart-hlv-mon','chart-hlv-phuongxa'];
    const loading = '<div class="d-flex justify-content-center align-items-center" style="height:100%;"><div class="spinner-border text-primary" role="status"></div></div>';
    chartIds.forEach(id => $(`#${id}`).html(loading));

    callApiAjax(url).then(res => {
        if (res && res.isSuccess && res.value) {
            const data = res.value;
            console.log(data, "data HLV")
            _renderPieChart('chart-hlv-gioitinh', _vdvCountBy(data, d => d.gioiTinh, 'Không rõ'), ['#3498db','#e74c3c','#95a5a6']);
            _renderColumnChart('chart-hlv-dantoc', _vdvCountBy(data, d => d.danToc, 'Chưa cập nhật'), '#27ae60', true);
            _renderColumnChart('chart-hlv-bangcap', _vdvCountBy(data, d => d.bangCap, 'Chưa cập nhật'), '#8e44ad');
            _renderBarChart('chart-hlv-tinh', _vdvCountBy(data, d => d.tenTinh, 'Chưa cập nhật'), '#00bcd4');
            _renderAgeAreaChart('chart-hlv-tuoi', data, '#16a085');
            _renderMonGroupChart('chart-hlv-mon', data, '#2980b9');
            // Phường/Xã
            _renderWardBarChart('chart-hlv-phuongxa', data, '#f857a6', 'HLV');
        } else {
            chartIds.forEach(id => $(`#${id}`).html('<div class="text-danger text-center py-4">Không có dữ liệu</div>'));
        }
    }).catch(() => {
        chartIds.forEach(id => $(`#${id}`).html('<div class="text-danger text-center py-4">Lỗi tải dữ liệu</div>'));
    });
}

function loadCanBoTheThao() {
    const tuKhoa = $('#canbo-search').val() || '';
    let url = `${apiBase}/StatisticalCanBoTheThao?MaNgonNgu=${lang}&TuKhoa=${encodeURIComponent(tuKhoa)}${getGlobalQuery()}`;

    const chartIds = ['chart-cb-gioitinh','chart-cb-dantoc','chart-cb-tinh','chart-cb-tuoi','chart-cb-phuongxa'];
    const loading = '<div class="d-flex justify-content-center align-items-center" style="height:100%;"><div class="spinner-border text-primary" role="status"></div></div>';
    chartIds.forEach(id => $(`#${id}`).html(loading));

    callApiAjax(url).then(res => {
        if (res && res.isSuccess && res.value) {
            const data = res.value;
            _renderPieChart('chart-cb-gioitinh', _vdvCountBy(data, d => d.gioiTinh, 'Không rõ'), ['#3498db','#e74c3c','#95a5a6']);
            _renderColumnChart('chart-cb-dantoc', _vdvCountBy(data, d => d.danToc, 'Chưa cập nhật'), '#27ae60', true);
            _renderBarChart('chart-cb-tinh', _vdvCountBy(data, d => d.tenTinh, 'Chưa cập nhật'), '#e67e22');
            _renderAgeAreaChart('chart-cb-tuoi', data, '#2c3e50');
            // Phường/Xã
            _renderWardBarChart('chart-cb-phuongxa', data, '#fc4a1a', 'cán bộ quản lý');
        } else {
            chartIds.forEach(id => $(`#${id}`).html('<div class="text-danger text-center py-4">Không có dữ liệu</div>'));
        }
    }).catch(() => {
        chartIds.forEach(id => $(`#${id}`).html('<div class="text-danger text-center py-4">Lỗi tải dữ liệu</div>'));
    });
}

// === Shared chart helper functions ===
function _renderPieChart(containerId, groups, colors) {
    const chartData = Object.keys(groups).map(k => ({ name: k, y: groups[k] }));
    Highcharts.chart(containerId, {
        chart: { type: 'pie', backgroundColor: '#ffffff' },
        title: { text: null },
        tooltip: { pointFormat: '<b>{point.name}</b>: {point.y} người ({point.percentage:.1f}%)' },
        plotOptions: { pie: { innerSize: '55%', dataLabels: { enabled: true, format: '<b>{point.name}</b>: {point.y}', style: { fontSize: '11px' } }, showInLegend: true, colors: colors } },
        legend: { align: 'center', verticalAlign: 'bottom', layout: 'horizontal' },
        credits: { enabled: false },
        series: [{ name: 'Số lượng', colorByPoint: true, data: chartData }]
    });
}

function _renderColumnChart(containerId, groups, color, rotate) {
    const sorted = Object.entries(groups).sort((a, b) => b[1] - a[1]).slice(0, 15);
    Highcharts.chart(containerId, {
        chart: { type: 'column', backgroundColor: '#ffffff' },
        title: { text: null },
        xAxis: { categories: sorted.map(x => x[0]), labels: { rotation: rotate ? -30 : 0, style: { fontSize: '10px' } } },
        yAxis: { min: 0, title: { text: 'Số người' } },
        tooltip: { pointFormat: 'Số lượng: <b>{point.y} người</b>' },
        plotOptions: { column: { dataLabels: { enabled: true, format: '{point.y}' }, borderRadius: 3, color: color } },
        legend: { enabled: false },
        credits: { enabled: false },
        series: [{ name: 'Số lượng', data: sorted.map(x => x[1]), colorByPoint: !color }]
    });
}

function _renderBarChart(containerId, groups, color) {
    const sorted = Object.entries(groups).sort((a, b) => b[1] - a[1]).slice(0, 15);
    Highcharts.chart(containerId, {
        chart: { type: 'bar', backgroundColor: '#ffffff' },
        title: { text: null },
        xAxis: { categories: sorted.map(x => x[0]), labels: { style: { fontSize: '10px' } } },
        yAxis: { min: 0, title: { text: 'Số người' } },
        tooltip: { pointFormat: 'Số lượng: <b>{point.y} người</b>' },
        plotOptions: { bar: { dataLabels: { enabled: true, format: '{point.y}' }, borderRadius: 3, color: color } },
        legend: { enabled: false },
        credits: { enabled: false },
        series: [{ name: 'Số lượng', data: sorted.map(x => x[1]) }]
    });
}

function _renderAgeAreaChart(containerId, data, color) {
    const currentYear = new Date().getFullYear();
    const ageBuckets = {};
    data.forEach(item => {
        if (!item.ngaySinh) return;
        const age = currentYear - new Date(item.ngaySinh).getFullYear();
        if (age < 0 || age > 100) return;
        const bucket = Math.floor(age / 5) * 5;
        const label = `${bucket}-${bucket + 4}`;
        ageBuckets[label] = (ageBuckets[label] || 0) + 1;
    });
    const sorted = Object.entries(ageBuckets).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
    const hexColor = color || '#3498db';
    const rgbMatch = hexColor.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
    const fillColor = rgbMatch ? `rgba(${parseInt(rgbMatch[1],16)},${parseInt(rgbMatch[2],16)},${parseInt(rgbMatch[3],16)},0.3)` : 'rgba(52,152,219,0.3)';
    Highcharts.chart(containerId, {
        chart: { type: 'areaspline', backgroundColor: '#ffffff' },
        title: { text: null },
        xAxis: { categories: sorted.map(x => x[0]), title: { text: 'Nhóm tuổi' }, labels: { style: { fontSize: '10px' } } },
        yAxis: { min: 0, title: { text: 'Số người' } },
        tooltip: { pointFormat: 'Nhóm tuổi <b>{point.category}</b>: <b>{point.y}</b>' },
        plotOptions: { areaspline: { fillOpacity: 0.3, marker: { enabled: true, radius: 4 }, color: hexColor, fillColor: fillColor } },
        legend: { enabled: false },
        credits: { enabled: false },
        series: [{ name: 'Số người', data: sorted.map(x => x[1]) }]
    });
}

function _renderMonGroupChart(containerId, data, color) {
    const order = ['Chưa có môn', '1 môn', '2 môn', '3 môn', '4+ môn'];
    const monGroups = { 'Chưa có môn': 0, '1 môn': 0, '2 môn': 0, '3 môn': 0, '4+ môn': 0 };
    data.forEach(item => {
        const sl = item.soLuongMon || 0;
        if (sl === 0) monGroups['Chưa có môn']++;
        else if (sl === 1) monGroups['1 môn']++;
        else if (sl === 2) monGroups['2 môn']++;
        else if (sl === 3) monGroups['3 môn']++;
        else monGroups['4+ môn']++;
    });
    Highcharts.chart(containerId, {
        chart: { type: 'column', backgroundColor: '#ffffff' },
        title: { text: null },
        xAxis: { categories: order, labels: { style: { fontSize: '11px' } } },
        yAxis: { min: 0, title: { text: 'Số người' } },
        tooltip: { pointFormat: 'Số người: <b>{point.y}</b>' },
        plotOptions: { column: { dataLabels: { enabled: true, format: '{point.y}' }, borderRadius: 4, colorByPoint: true } },
        legend: { enabled: false },
        credits: { enabled: false },
        series: [{ name: 'Số người', data: order.map(k => monGroups[k]) }]
    });
}

// Chart helper: Số lượng theo phường/xã (bar ngang, top 30)
function _renderWardBarChart(containerId, data, color, label) {
    const groups = _vdvCountBy(data, d => d.tenXa, 'Chưa cập nhật');
    const sorted = Object.entries(groups)
        .filter(([k]) => k !== 'Chưa cập nhật' || Object.keys(groups).length === 1)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30);

    if (sorted.length === 0) {
        $(`#${containerId}`).html('<div class="text-muted text-center py-5"><i class="hgi-icon hgi-information" style="font-size:2rem;"></i><br>Không có dữ liệu phường/xã</div>');
        return;
    }

    // Tính chiều cao động: mỗi bar ~28px, tối thiểu 300px
    const dynamicHeight = Math.max(300, sorted.length * 28 + 60);
    $(`#${containerId}`).css('height', dynamicHeight + 'px');

    Highcharts.chart(containerId, {
        chart: { type: 'bar', backgroundColor: '#ffffff' },
        title: { text: null },
        xAxis: {
            categories: sorted.map(x => x[0]),
            labels: { style: { fontSize: '11px' } },
            title: { text: null }
        },
        yAxis: {
            min: 0,
            title: { text: `Số ${label}`, style: { fontSize: '11px' } },
            allowDecimals: false
        },
        tooltip: {
            formatter: function () {
                return `<b>${this.x}</b><br/>Số ${label}: <b>${this.y}</b>`;
            }
        },
        plotOptions: {
            bar: {
                dataLabels: { enabled: true, format: '{point.y}', style: { fontSize: '10px' } },
                borderRadius: 4,
                color: color,
                pointPadding: 0.05,
                groupPadding: 0.05
            }
        },
        legend: { enabled: false },
        credits: { enabled: false },
        series: [{ name: `Số ${label}`, data: sorted.map(x => x[1]) }]
    });
}

function loadToChucTheThao() {
    const tuKhoa = $('#donvi-search').val() || '';
    let url = `${apiBase}/StatisticalToChucTheThao?MaNgonNgu=${lang}&TuKhoa=${encodeURIComponent(tuKhoa)}${getGlobalQuery()}`;

    const chartIds = ['chart-dv-loaihinh','chart-dv-phamvi','chart-dv-coquan','chart-dv-tinh','chart-dv-phuongxa'];
    const loading = '<div class="d-flex justify-content-center align-items-center" style="height:100%;"><div class="spinner-border text-primary" role="status"></div></div>';
    chartIds.forEach(id => $(`#${id}`).html(loading));

    callApiAjax(url).then(res => {
        if (res && res.isSuccess && res.value) {
            const data = res.value;
            console.log(data, "data to chuc the thao")
            _renderPieChart('chart-dv-loaihinh', _vdvCountBy(data, d => d.loaiHinh, 'Chưa xác định'), ['#9b59b6','#34495e','#e67e22','#1abc9c']);
            _renderPieChart('chart-dv-phamvi', _vdvCountBy(data, d => d.phamViHoatDong, 'Chưa xác định'), ['#2ecc71','#3498db','#f1c40f','#e74c3c']);
            _renderColumnChart('chart-dv-coquan', _vdvCountBy(data, d => d.coQuanChuQuan, 'Chưa xác định'), '#f39c12', true);
            _renderBarChart('chart-dv-tinh', _vdvCountBy(data, d => d.tenTinh, 'Chưa xác định'), '#16a085');
            // Phường/Xã
            _renderWardBarChart('chart-dv-phuongxa', data, '#0072ff', 'đơn vị');
        } else {
            chartIds.forEach(id => $(`#${id}`).html('<div class="text-danger text-center py-4">Không có dữ liệu</div>'));
        }
    }).catch(() => {
        chartIds.forEach(id => $(`#${id}`).html('<div class="text-danger text-center py-4">Lỗi tải dữ liệu</div>'));
    });
}

function loadGiaiDau() {
    const tuKhoa = $('#giaidau-search').val() || '';
    const capDoID = $('#giaidau-capdo').val() || '';
    const trangThaiID = $('#giaidau-trangthai').val() || '';
    let url = `${apiBase}/StatisticalGiaiDauTheThao?MaNgonNgu=${lang}&TuKhoa=${encodeURIComponent(tuKhoa)}${getGlobalQuery()}`;
    if (capDoID) url += `&CapDoID=${capDoID}`;
    if (trangThaiID) url += `&TrangThaiID=${trangThaiID}`;

    const chartIds = ['chart-gd-capdo','chart-gd-trangthai','chart-gd-nam','chart-gd-duyet','chart-gd-do-dai','chart-gd-matrix'];
    const loading = '<div class="d-flex justify-content-center align-items-center" style="height:100%;"><div class="spinner-border text-primary" role="status"></div></div>';
    chartIds.forEach(id => $(`#${id}`).html(loading));

    callApiAjax(url).then(res => {
        if (res && res.isSuccess && res.value) {
            const data = res.value;
            _renderPieChart('chart-gd-capdo', _vdvCountBy(data, d => d.tenCapDo, 'Chưa phân cấp'), ['#3498db','#2ecc71','#9b59b6','#f1c40f']);
            _renderColumnChart('chart-gd-trangthai', _vdvCountBy(data, d => d.tenTrangThai, 'Chưa xác định'), '#e74c3c');
            
            // Xử lý biểu đồ theo năm
            const namGroups = {};
            data.forEach(item => {
                if (item.batDau) {
                    const year = new Date(item.batDau).getFullYear();
                    namGroups[year] = (namGroups[year] || 0) + 1;
                }
            });
            const sortedYears = Object.entries(namGroups).sort((a,b) => parseInt(a[0]) - parseInt(b[0]));
            Highcharts.chart('chart-gd-nam', {
                chart: { type: 'line', backgroundColor: '#ffffff' },
                title: { text: null },
                xAxis: { categories: sortedYears.map(x => x[0]), title: { text: 'Năm' } },
                yAxis: { min: 0, title: { text: 'Số lượng giải đấu' } },
                tooltip: { pointFormat: 'Năm {point.category}: <b>{point.y} giải đấu</b>' },
                plotOptions: { line: { dataLabels: { enabled: true }, marker: { enabled: true, radius: 5 } } },
                legend: { enabled: false },
                credits: { enabled: false },
                series: [{ name: 'Số lượng', data: sortedYears.map(x => x[1]), color: '#2980b9' }]
            });

            const approvalGroups = _vdvCountBy(data, item => {
                const value = item.trangThai;
                if (value === true || value === 1 || value === '1' || value === 'True' || value === 'true') return 'Đã duyệt';
                if (value === false || value === 0 || value === '0' || value === 'False' || value === 'false') return 'Chưa duyệt';
                return 'Chưa xác định';
            }, 'Chưa xác định');
            _renderPieChart('chart-gd-duyet', approvalGroups, ['#2ecc71','#e74c3c','#95a5a6']);

            const durationBuckets = { '≤ 1 ngày': 0, '2-7 ngày': 0, '8-30 ngày': 0, '31-90 ngày': 0, '> 90 ngày': 0 };
            data.forEach(item => {
                if (!item.batDau || !item.ketThuc) return;
                const start = new Date(item.batDau);
                const end = new Date(item.ketThuc);
                const duration = Math.round((end - start) / (1000 * 60 * 60 * 24));
                if (duration <= 1) durationBuckets['≤ 1 ngày']++;
                else if (duration <= 7) durationBuckets['2-7 ngày']++;
                else if (duration <= 30) durationBuckets['8-30 ngày']++;
                else if (duration <= 90) durationBuckets['31-90 ngày']++;
                else durationBuckets['> 90 ngày']++;
            });
            const durationLabels = Object.keys(durationBuckets);
            const durationValues = durationLabels.map(label => durationBuckets[label]);
            Highcharts.chart('chart-gd-do-dai', {
                chart: { type: 'column', backgroundColor: '#ffffff' },
                title: { text: null },
                xAxis: { categories: durationLabels, labels: { style: { fontSize: '10px' } } },
                yAxis: { min: 0, title: { text: 'Số lượng giải đấu' } },
                tooltip: { pointFormat: 'Số lượng: <b>{point.y} giải đấu</b>' },
                plotOptions: { column: { dataLabels: { enabled: true, format: '{point.y}' }, borderRadius: 4 } },
                legend: { enabled: false },
                credits: { enabled: false },
                series: [{ name: 'Số lượng', data: durationValues, color: '#f39c12' }]
            });

            const matrixGroups = {};
            data.forEach(item => {
                const capDo = item.tenCapDo || 'Chưa phân cấp';
                const status = item.tenTrangThai || 'Chưa xác định';
                if (!matrixGroups[capDo]) {
                    matrixGroups[capDo] = {};
                }
                matrixGroups[capDo][status] = (matrixGroups[capDo][status] || 0) + 1;
            });

            const matrixCategories = Object.keys(matrixGroups);
            const matrixStatuses = [...new Set(data.map(item => item.tenTrangThai || 'Chưa xác định'))];
            const matrixSeries = matrixStatuses.map(status => ({
                name: status,
                data: matrixCategories.map(capDo => matrixGroups[capDo][status] || 0)
            }));

            Highcharts.chart('chart-gd-matrix', {
                chart: { type: 'column', backgroundColor: '#ffffff' },
                title: { text: null },
                xAxis: { categories: matrixCategories, labels: { style: { fontSize: '10px' } } },
                yAxis: { min: 0, title: { text: 'Số lượng giải đấu' }, stackLabels: { enabled: true } },
                tooltip: { headerFormat: '<b>{point.x}</b><br/>', pointFormat: '{series.name}: {point.y}<br/>Tổng: {point.stackTotal}' },
                plotOptions: { column: { stacking: 'normal', dataLabels: { enabled: false } } },
                legend: { align: 'center', verticalAlign: 'bottom', layout: 'horizontal' },
                credits: { enabled: false },
                series: matrixSeries
            });
        } else {
            chartIds.forEach(id => $(`#${id}`).html('<div class="text-danger text-center py-4">Không có dữ liệu</div>'));
        }
    }).catch(() => {
        chartIds.forEach(id => $(`#${id}`).html('<div class="text-danger text-center py-4">Lỗi tải dữ liệu</div>'));
    });
}

function loadThanhTich() {
    const tuKhoa = $('#thanhtich-search').val() || '';
    const capID = $('#thanhtich-cap').val() || '';
    const hangID = $('#thanhtich-hang').val() || '';
    const loaiID = $('#thanhtich-loai').val() || '';
    let url = `${apiBase}/StatisticalThanhTich?MaNgonNgu=${lang}&TuKhoa=${encodeURIComponent(tuKhoa)}${getGlobalQuery()}`;
    if (capID) url += `&CapID=${capID}`;
    if (hangID) url += `&HangID=${hangID}`;
    if (loaiID) url += `&LoaiID=${loaiID}`;
    initDataTableConfigNoSearch('table-thanhtich', { url: url, type: 'GET', dataSrc: 'value' },
        [{ targets: 0, className: 'text-center', width: '50px' }],
        [
            { data: null, render: (d, t, r, m) => m.row + 1 },
            { data: 'tenThanhTich', render: (d) => d || '---' },
            { data: 'tenHang', render: (d) => d || '---' },
            { data: 'tenSuKien', render: (d) => d || '---' },
            { data: 'ngayTraoGiai', render: (d) => formatDate(d) }
        ]
    );
}

function loadChuongTrinhDuAn() {
    const tuKhoa = ''; 
    const trangThaiID = $('#ctda-trangthai').val() || '';
    let url = `${apiBase}/StatisticalChuongTrinhDuAn?MaNgonNgu=${lang}${getGlobalQuery()}`;
    if (trangThaiID) url += `&TrangThaiID=${trangThaiID}`;

    const chartIds = ['chart-ct-trangthai','chart-ct-donvi','chart-ct-soluong','chart-ct-kinhphi'];
    const loading = '<div class="d-flex justify-content-center align-items-center" style="height:100%;"><div class="spinner-border text-primary" role="status"></div></div>';
    chartIds.forEach(id => $(`#${id}`).html(loading));

    callApiAjax(url).then(res => {
        if (res && res.isSuccess && res.value) {
            const data = res.value;
            _renderPieChart('chart-ct-trangthai', _vdvCountBy(data, d => d.tenTrangThai, 'Chưa xác định'), ['#2ecc71','#e74c3c','#f1c40f','#34495e']);
            _renderBarChart('chart-ct-donvi', _vdvCountBy(data, d => d.donVi, 'Chưa xác định'), '#9b59b6');

            // Tính số lượng dự án theo năm bắt đầu
            const soLuongNamGroups = {};
            data.forEach(item => {
                if (item.batDau) {
                    const year = new Date(item.batDau).getFullYear();
                    soLuongNamGroups[year] = (soLuongNamGroups[year] || 0) + 1;
                }
            });
            const sortedSoLuongYears = Object.entries(soLuongNamGroups).sort((a,b) => parseInt(a[0]) - parseInt(b[0]));
            if (sortedSoLuongYears.length === 0) {
                $('#chart-ct-soluong').html('<div class="text-muted text-center py-5"><i class="hgi-icon hgi-information" style="font-size:2rem;"></i><br>Không có dữ liệu theo năm bắt đầu</div>');
            } else {
                Highcharts.chart('chart-ct-soluong', {
                    chart: { type: 'column', backgroundColor: '#ffffff' },
                    title: { text: null },
                    xAxis: { categories: sortedSoLuongYears.map(x => x[0]), title: { text: 'Năm bắt đầu' } },
                    yAxis: { min: 0, title: { text: 'Số lượng dự án' }, allowDecimals: false },
                    tooltip: { pointFormat: 'Năm {point.category}: <b>{point.y} dự án</b>' },
                    plotOptions: { column: { dataLabels: { enabled: true, format: '{point.y}' }, borderRadius: 4 } },
                    legend: { enabled: false },
                    credits: { enabled: false },
                    series: [{ name: 'Số lượng', data: sortedSoLuongYears.map(x => x[1]), color: '#130cb7' }]
                });
            }

            // Tính tổng kinh phí theo năm
            const namGroups = {};
            data.forEach(item => {
                if (item.batDau && item.kinhPhi) {
                    const year = new Date(item.batDau).getFullYear();
                    namGroups[year] = (namGroups[year] || 0) + item.kinhPhi;
                }
            });
            const sortedYears = Object.entries(namGroups).sort((a,b) => parseInt(a[0]) - parseInt(b[0]));
            Highcharts.chart('chart-ct-kinhphi', {
                chart: { type: 'column', backgroundColor: '#ffffff' },
                title: { text: null },
                xAxis: { categories: sortedYears.map(x => x[0]), title: { text: 'Năm' } },
                yAxis: { min: 0, title: { text: 'Tổng kinh phí (VNĐ)' }, labels: { formatter: function() { return (this.value / 1000000).toLocaleString() + ' Tr'; } } },
                tooltip: { pointFormat: 'Tổng kinh phí năm {point.category}: <b>{point.y:,.0f} VNĐ</b>' },
                plotOptions: { column: { dataLabels: { enabled: true, formatter: function() { return (this.y / 1000000).toLocaleString() + ' Tr'; }, style: { fontSize: '10px' } }, borderRadius: 3 } },
                legend: { enabled: false },
                credits: { enabled: false },
                series: [{ name: 'Kinh phí', data: sortedYears.map(x => x[1]), color: '#e67e22' }]
            });
        } else {
            chartIds.forEach(id => $(`#${id}`).html('<div class="text-danger text-center py-4">Không có dữ liệu</div>'));
        }
    }).catch(() => {
        chartIds.forEach(id => $(`#${id}`).html('<div class="text-danger text-center py-4">Lỗi tải dữ liệu</div>'));
    });
}
