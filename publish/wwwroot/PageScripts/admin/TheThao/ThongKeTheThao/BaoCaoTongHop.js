const lang = 'vi';
const baseUrl = (typeof getRootLink === 'function')
    ? getRootLink()
    : (window.location.origin || `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}`);
const apiBase = `${baseUrl}/api/v1/TT_StatisticalApi`;

function callApiAjax(url) {
    return $.ajax({
        type: 'GET',
        url: url,
        contentType: 'application/json; charset=utf-8'
    });
}

$(document).ready(function () {
    initBaoCaoFilters();
    loadBaoCaoTongHop();
});

function initBaoCaoFilters() {
    const currentYear = new Date().getFullYear();
    const yearOptions = ['<option value="">Tất cả năm</option>'];
    for (let y = currentYear; y >= 2015; y--) {
        yearOptions.push(`<option value="${y}">Năm ${y}</option>`);
    }
    $('#baoCao-filter-nam').html(yearOptions.join(''));

    initMonTheThao('#baoCao-filter-bomon', 'Tất cả bộ môn');
    initPhuongXa('#baoCao-filter-diaphuong', 'Tất cả phường/xã');
    $('#baoCao-filter-bomon, #baoCao-filter-diaphuong').select2({ theme: 'bootstrap4', width: '100%' });
    $('#baoCao-filter-nam').select2({ theme: 'bootstrap4', width: '100%' });
}

function getBaoCaoFilters() {
    return {
        nam: $('#baoCao-filter-nam').val() || '',
        boMonID: $('#baoCao-filter-bomon').val() || '',
        diaPhuongID: $('#baoCao-filter-diaphuong').val() || '',
        tuKhoa: $('#baoCao-filter-tukhoa').val() || ''
    };
}

async function loadBaoCaoTongHop() {
    const filters = getBaoCaoFilters();
    const keyword = encodeURIComponent(filters.tuKhoa.trim());
    const boMon = filters.boMonID ? filters.boMonID : '';
    const diaPhuong = filters.diaPhuongID ? filters.diaPhuongID : '';
    const nam = filters.nam ? Number(filters.nam) : '';

    try {
        const requests = [
            callApiAjax(`${apiBase}/StatisticalVanDongVien?MaNgonNgu=${lang}&TuKhoa=${keyword}&BoMonID=${boMon}&DiaPhuongID=${diaPhuong}`),
            callApiAjax(`${apiBase}/StatisticalTrongTai?MaNgonNgu=${lang}&TuKhoa=${keyword}&BoMonID=${boMon}&DiaPhuongID=${diaPhuong}`),
            callApiAjax(`${apiBase}/StatisticalHuanLuyenVien?MaNgonNgu=${lang}&TuKhoa=${keyword}&BoMonID=${boMon}&DiaPhuongID=${diaPhuong}`),
            callApiAjax(`${apiBase}/StatisticalCanBoTheThao?MaNgonNgu=${lang}&TuKhoa=${keyword}&DiaPhuongID=${diaPhuong}`),
            callApiAjax(`${apiBase}/StatisticalToChucTheThao?MaNgonNgu=${lang}&TuKhoa=${keyword}&BoMonID=${boMon}&DiaPhuongID=${diaPhuong}`),
            callApiAjax(`${apiBase}/StatisticalGiaiDauTheThao?MaNgonNgu=${lang}&TuKhoa=${keyword}&Nam=${nam}&DiaPhuongID=${diaPhuong}`),
            callApiAjax(`${apiBase}/StatisticalChuongTrinhDuAn?MaNgonNgu=${lang}&TuKhoa=${keyword}&Nam=${nam}`),
            callApiAjax(`${apiBase}/StatisticalThanhTich?MaNgonNgu=${lang}&TuKhoa=${keyword}&Nam=${nam}`)
        ];

        const [vdv, trongTai, hlv, canBo, donVi, giaiDau, ctda, thanhTich] = await Promise.allSettled(requests);

        const rows = [];

        pushRows(rows, vdv, 'Vận động viên', 'HoTen', 'MaDinhDanh', 'GioiTinh', 'TenXa', 'TenMon', 'ListTenToChuc', 'TrangThai');
        pushRows(rows, trongTai, 'Trọng tài', 'HoTen', 'MaDinhDanh', 'GioiTinh', 'TenXa', 'TenMon', 'ListTenToChuc', 'TrangThai');
        pushRows(rows, hlv, 'Huấn luyện viên', 'HoTen', 'MaDinhDanh', 'GioiTinh', 'TenXa', 'TenMon', 'ListTenToChuc', 'TrangThai');
        pushRows(rows, canBo, 'Cán bộ thể thao', 'HoTen', 'MaDinhDanh', 'GioiTinh', 'TenXa', 'ListTenToChuc', 'TrangThai');
        pushRows(rows, donVi, 'Đơn vị thể thao', 'TenToChuc', 'MaDinhDanh', 'LoaiHinh', 'TenXa', 'ListMonTheThao', 'TenToChuc', 'TrangThai');
        pushRows(rows, giaiDau, 'Giải đấu', 'TenSuKien', 'MaDinhDanh', 'TenCapDo', 'ListTenDiaDiem', 'TenLinhVuc', 'TenTrangThai', 'BatDau');
        pushRows(rows, ctda, 'Chương trình/Dự án', 'TenChuongTrinh', 'MaDinhDanh', 'GioiTinh', 'TenXa', 'TenMon', 'TenToChuc', 'TrangThai');
        pushRows(rows, thanhTich, 'Thành tích', 'TenThanhTich', 'MaDinhDanh', 'GioiTinh', 'TenXa', 'TenMon', 'Loai', 'TrangThai');

        renderBaoCaoTable(rows);
    } catch (error) {
        console.error('Error loading report:', error);
        $('#tableBaoCaoTongHop tbody').html('<tr><td colspan="9" class="text-danger text-center">Không thể tải báo cáo.</td></tr>');
    }
}

function pickField(item, keys) {
    if (!item) return '';
    for (const key of keys) {
        if (item[key] !== undefined && item[key] !== null && item[key] !== '') return item[key];
    }
    return '';
}

function pushRows(target, resultState, typeLabel, nameKey, codeKey, genderKey, districtKey, groupKey, orgKey, statusKey) {
    if (!resultState || resultState.status !== 'fulfilled' || !resultState.value) return;
    const payload = resultState.value;
    if (!payload || !payload.isSuccess || !Array.isArray(payload.value)) return;

    payload.value.forEach(item => {
        if (!item) return;

        const ten = pickField(item, [nameKey, toCamelCase(nameKey), 'TenToChuc', 'tenToChuc', 'TenSuKien', 'tenSuKien', 'TenChuongTrinh', 'tenChuongTrinh', 'TenThanhTich', 'tenThanhTich']) || '';
        const maDinhDanh = pickField(item, [codeKey, toCamelCase(codeKey), 'MaDinhDanh', 'maDinhDanh']) || '';
        const gioiTinh = pickField(item, [genderKey, toCamelCase(genderKey), 'GioiTinh', 'gioiTinh', 'TenCapDo', 'tenCapDo', 'LoaiHinh', 'loaiHinh']) || '';
        const diaPhuong = pickField(item, [districtKey, toCamelCase(districtKey), 'TenXa', 'tenXa', 'ListTenDiaDiem', 'listTenDiaDiem']) || '';
        const boMon = pickField(item, [groupKey, toCamelCase(groupKey), 'ListMonTheThao', 'listMonTheThao', 'TenMon', 'tenMon', 'TenLinhVuc', 'tenLinhVuc']) || '';
        const donVi = pickField(item, [orgKey, toCamelCase(orgKey), 'ListTenToChuc', 'listTenToChuc', 'TenToChuc', 'tenToChuc', 'TenTrangThai', 'tenTrangThai']) || '';
        const trangThai = pickField(item, [statusKey, toCamelCase(statusKey), 'TrangThai', 'trangThai', 'TenTrangThai', 'tenTrangThai']) || '';

        const row = {
            loai: typeLabel,
            ten,
            maDinhDanh,
            gioiTinh,
            diaPhuong,
            boMon,
            donVi,
            trangThai,
            nam: getYearValue(item)
        };

        target.push(row);
    });
}

function toCamelCase(value) {
    if (!value || value.length === 0) return value;
    return value.charAt(0).toLowerCase() + value.slice(1);
}

function getYearValue(item) {
    const year = item?.Nam ?? item?.nam ?? item?.BatDau ?? item?.batDau;
    if (!year) return new Date().getFullYear();

    const date = new Date(year);
    if (!isNaN(date.getTime())) {
        return date.getFullYear();
    }

    return new Date().getFullYear();
}

function renderBaoCaoTable(rows) {
    if (!Array.isArray(rows) || rows.length === 0) {
        $('#tableBaoCaoTongHop tbody').html('<tr><td colspan="9" class="text-center text-muted">Không có dữ liệu phù hợp với bộ lọc.</td></tr>');
        return;
    }

    const tbodyHtml = rows.map(row => {
        const statusHtml = row.trangThai ? `<span class="report-status">${escapeHtml(row.trangThai)}</span>` : '';

        return `
            <tr>
                <td>${escapeHtml(row.loai || '')}</td>
                <td>${escapeHtml(row.ten || '')}</td>
                <td>${escapeHtml(row.maDinhDanh || '')}</td>
                <td>${escapeHtml(row.gioiTinh || '')}</td>
                <td>${escapeHtml(row.diaPhuong || '')}</td>
                <td>${escapeHtml(row.boMon || '')}</td>
                <td>${escapeHtml(row.donVi || '')}</td>
                <td>${statusHtml}</td>
                <td>${escapeHtml(row.nam || '')}</td>
            </tr>
        `;
    }).join('');

    $('#tableBaoCaoTongHop tbody').html(tbodyHtml);
}

function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function loadSheetJsScript() {
    return new Promise((resolve, reject) => {
        const hasXlsx = !!(window.XLSX && window.XLSX.utils && window.XLSX.writeFile);
        if (hasXlsx) {
            resolve();
            return;
        }

        const existing = document.getElementById('xlsx-export-loader');
        if (existing) {
            existing.addEventListener('load', () => {
                if (window.XLSX && window.XLSX.utils && window.XLSX.writeFile) {
                    resolve();
                } else {
                    reject(new Error('SheetJS loaded but not initialized.'));
                }
            }, { once: true });
            existing.addEventListener('error', () => reject(new Error('Failed to load SheetJS.'), { once: true }));
            return;
        }

        const script = document.createElement('script');
        script.id = 'xlsx-export-loader';
        script.src = `${baseUrl}/lib/xlsx/xlsx.full.min.js`;
        script.async = true;
        script.onload = () => {
            if (window.XLSX && window.XLSX.utils && window.XLSX.writeFile) {
                resolve();
            } else {
                reject(new Error('SheetJS loaded but did not expose XLSX.utils/writeFile.'));
            }
        };
        script.onerror = () => reject(new Error('Unable to load SheetJS from local lib.'));
        document.head.appendChild(script);
    });
}

async function exportBaoCaoExcel() {
    try {
        await loadSheetJsScript();

        const table = document.getElementById('tableBaoCaoTongHop');
        const XLSX = window.XLSX;
        if (!table || !XLSX || !XLSX.utils || !XLSX.writeFile) {
            alert('Không thể tải thư viện xuất Excel. Vui lòng thử lại sau.');
            return;
        }

        const rows = Array.from(table.querySelectorAll('tbody tr')).map(tr => {
            const cells = Array.from(tr.cells).map(td => td.textContent.trim());
            return {
                Loai: cells[0] || '',
                Ten: cells[1] || '',
                MaDinhDanh: cells[2] || '',
                GioiTinh: cells[3] || '',
                PhuongXa: cells[4] || '',
                BoMon: cells[5] || '',
                DonVi: cells[6] || '',
                TrangThai: cells[7] || '',
                Nam: cells[8] || ''
            };
        });

        const workbook = XLSX.utils.book_new();
        const sheet = XLSX.utils.json_to_sheet(rows, {
            header: ['Loai', 'Ten', 'MaDinhDanh', 'GioiTinh', 'PhuongXa', 'BoMon', 'DonVi', 'TrangThai', 'Nam']
        });

        XLSX.utils.book_append_sheet(workbook, sheet, 'BaoCao');
        XLSX.writeFile(workbook, 'BaoCaoTongHop_TheThao.xlsx');
    } catch (error) {
        console.error('Export Excel failed:', error);
        alert('Xuất Excel thất bại. Vui lòng thử lại.');
    }
}
