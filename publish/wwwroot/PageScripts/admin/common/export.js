/**
 * Hàm export Excel/PDF chung — nhúng vào layout hoặc từng trang có _ExportButtons
 * @param {string} type  - 'Excel' hoặc 'Pdf'
 * @param {string} mauCode - mã biểu mẫu (VD: 'TT_BM11_4110')
 * @param {object} filterObj - object filter { nam, linhVucID, ... }
 */
//const baseUrl = getRootLink();

const baseUrlNew = getRootLink();
function exportFile(type, mauCode, filterObj) {
    if (!mauCode) {
        alert('Thiếu mã biểu mẫu');
        return;
    }

    const params = new URLSearchParams();
    if (filterObj) {
        if (filterObj.nam)          params.set('nam', filterObj.nam);
        if (filterObj.linhVucID)    params.set('linhVucID', filterObj.linhVucID);
        if (filterObj.tinhID)       params.set('tinhID', filterObj.tinhID);
        if (filterObj.monTheThaoID) params.set('monTheThaoID', filterObj.monTheThaoID);
        if (filterObj.maNgonNgu)    params.set('maNgonNgu', filterObj.maNgonNgu);
    }

    const url = `${baseUrlNew}/api/ExportApi/${type}/${encodeURIComponent(mauCode)}?${params.toString()}`;

    // Tạo thẻ <a> ẩn để trigger download
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    setTimeout(() => document.body.removeChild(anchor), 300);
}

/**
 * Helper: lấy filter từ form hiện tại (dùng chung cho các trang danh sách có filter)
 * Trả về object filter đã điền giá trị từ các input trên trang
 */
function getPageFilter() {
    return {
        nam:         document.getElementById('filterNam')?.value || new Date().getFullYear(),
        linhVucID:   document.getElementById('filterLinhVuc')?.value || null,
        tinhID:      document.getElementById('filterTinh')?.value || null,
        monTheThaoID:document.getElementById('filterMon')?.value || null,
        maNgonNgu:   'vi'
    };
}
