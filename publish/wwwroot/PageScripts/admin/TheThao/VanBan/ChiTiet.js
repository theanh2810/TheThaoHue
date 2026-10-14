const baseUrl = getRootLink();
const ApiUrl = baseUrl + '/api/VanBanTheThaoApi';

$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const vanBanID = urlParams.get('id');

    if (vanBanID) {
        loadVanBanDetails(vanBanID);
    } else {
        showError('Không tìm thấy ID văn bản');
    }
});

function loadVanBanDetails(vanBanID) {
    $.ajax({
        url: ApiUrl + '/ChiTiet',
        type: 'POST',
        data: JSON.stringify(vanBanID),
        contentType: 'application/json',
        success: function (result) {
            if (result.isSuccess && result.value) {
                displayDetails(result.value);
            } else {
                showError('Không tải được chi tiết văn bản');
            }
        },
        error: function () {
            showError('Lỗi khi tải dữ liệu');
        }
    });
}

function displayDetails(data) {
    $('#soKyHieu').text(data.soKyHieu || '-');
    $('#ngayBanHanh').text(data.ngayBanHanh ? new Date(data.ngayBanHanh).toLocaleDateString('vi-VN') : '-');
    $('#theLoai').text(data.tenTheLoai || '-');

    $('#capBanHanh').text(data.tenCapBanHanh || '-');
    $('#coQuanBanHanh').text(data.tenCoQuanBanHanh || '-');
    $('#nguoiKy').text(data.nguoiKy || '-');
    $('#chucVuNguoiKy').text(data.chucVuNguoiKy || '-');

    $('#ngayHieuLuc').text(data.ngayHieuLuc ? new Date(data.ngayHieuLuc).toLocaleDateString('vi-VN') : '-');
    $('#ngayHetHan').text(data.ngayHetHan ? new Date(data.ngayHetHan).toLocaleDateString('vi-VN') : '-');

    $('#trichYeu').text(data.trichYeu || '-');

    if (data.noiDung && window.decodeCkeditorHtml) {
        $('#noiDung').html(decodeCkeditorHtml(data.noiDung));
    } else {
        $('#noiDung').text(data.noiDung || '-');
    }

    if (data.duongDanFile && data.duongDanFile.length > 0) {
        console.log(data.duongDanFile, "duongDanFile");
        let fileHtml = '<ul class="list-group list-group-flush" style="max-width: 500px;">';
        data.duongDanFile.forEach(file => {
            const fileName = file.duongDanFile.split('/').pop();
            fileHtml += `
                <li class="list-group-item px-0 py-2 border-0">
                    <a href="${baseUrl + file.duongDanFile}" target="_blank" class="text-primary text-decoration-none">
                        <i class="hgi-icon hgi-download"></i> ${escapeHtml(fileName)}
                    </a>
                </li>
            `;
        });
        fileHtml += '</ul>';
        $('#filePreview').html(fileHtml);
    } else {
        $('#filePreview').text('Không có file đính kèm');
    }
}

function showError(message) {
    if (typeof Swal !== 'undefined') {
        Swal.fire('Lỗi!', message, 'error');
    } else {
        alert(message);
    }
}

function escapeHtml(unsafe) {
    return (unsafe || '')
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
