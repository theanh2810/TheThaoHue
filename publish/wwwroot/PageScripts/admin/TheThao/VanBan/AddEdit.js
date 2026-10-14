const baseUrl = getRootLink();
const ApiUrl = baseUrl + '/api/VanBanTheThaoApi';
const allowedFileExtensions = ['doc', 'docx', 'pdf'];
const maxFileSizeMb = 50;

// Danh sách đường dẫn file cũ được giữ lại (khi chỉnh sửa)
let keptFilePaths = [];

$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const vanBanID = urlParams.get('id');

    initSelect2();
    initDatePicker()

    // Đợi danh mục (Loại VB, Cấp ban hành, Cơ quan) load xong rồi mới đổ dữ liệu lên form,
    // tránh trường hợp set .val() khi <option> chưa được thêm vào select.
    initCategories().always(function () {
        if (vanBanID) {
            loadVanBanData(vanBanID);
        }
    });

    bindFormEvents();
    bindFileEvents();
});

function initCategories() {
    // Load Loại văn bản
    const loadTheLoai = $.ajax({
        url: baseUrl + '/api/DanhMucChungApi/GetByLoaiDanhMuc',
        type: 'POST',
        data: JSON.stringify({ maSo: 'LOAI_VB_THETHAO' }),
        contentType: 'application/json',
        success: function (result) {
            if (result.isSuccess && result.value && result.value.length > 0) {
                result.value.forEach(item => {
                    $('#theLoaiID').append(`<option value="${item.danhMucID}">${item.tenDanhMuc || item.ten}</option>`);
                });
            }
        }
    });

    // Load Cấp ban hành
    const loadCapBanHanh = $.ajax({
        url: baseUrl + '/api/DanhMucChungApi/GetByLoaiDanhMuc',
        type: 'POST',
        data: JSON.stringify({ maSo: 'CAP_BANHANH_THETHAO' }),
        contentType: 'application/json',
        success: function (result) {
            if (result.isSuccess && result.value && result.value.length > 0) {
                result.value.forEach(item => {
                    $('#capBanHanhID').append(`<option value="${item.danhMucID}">${item.tenDanhMuc || item.ten}</option>`);
                });
            }
        }
    });

    // Load Cơ quan ban hành (ToChuc)
    const loadCoQuan = $.ajax({
        url: baseUrl + '/api/ToChucApi/Filter?MaNgonNgu=vi&LoaiToChucID=170',
        type: 'GET',
        success: function (result) {
            if (result.isSuccess && result.value && result.value.length > 0) {
                result.value.forEach(item => {
                    $('#coQuanBanHanhID').append(`<option value="${item.toChucID}">${item.tenToChuc}</option>`);
                });
            }
        }
    });

    // Trả về 1 promise hoàn tất khi cả 3 danh mục đã load xong (kể cả khi có lỗi)
    return $.when(loadTheLoai, loadCapBanHanh, loadCoQuan);
}

function loadVanBanData(vanBanID) {
    $.ajax({
        url: ApiUrl + '/ChiTiet',
        type: 'POST',
        data: JSON.stringify(vanBanID),
        contentType: 'application/json',
        success: function (result) {
            if (result.isSuccess && result.value) {
                const data = result.value;

                // Fill form fields
                $('#soKyHieu').val(data.soKyHieu);
                $('#trichYeu').val(data.trichYeu);
                $('#theLoaiID').val(data.theLoaiID).trigger("change");
                $('#capBanHanhID').val(data.capBanHanhID).trigger("change");
                $('#coQuanBanHanhID').val(data.coQuanBanHanhID).trigger("change");
                $('#nguoiKy').val(data.nguoiKy);
                $('#chucVuNguoiKy').val(data.chucVuNguoiKy);
                $('#noiDung').val(data.noiDung);
                $('#bangThamChieu').val(data.bangThamChieu);

                // Format dates - convert to dd/mm/yyyy for datepicker input
                if (data.ngayBanHanh) {
                    $('#ngayBanHanh').val(formatDateWithoutTime(data.ngayBanHanh));
                }
                if (data.ngayHieuLuc) {
                    $('#ngayHieuLuc').val(formatDateWithoutTime(data.ngayHieuLuc));
                }
                if (data.ngayHetHan) {
                    $('#ngayHetHan').val(formatDateWithoutTime(data.ngayHetHan));
                }

                // Show existing files
                const currentFiles = getCurrentFiles(data.duongDanFile);
                keptFilePaths = currentFiles
                    .map(file => getFilePath(file))
                    .filter(filePath => !!filePath);
                renderExistingFiles();
            }
        },
        error: function () {
            showNotification(0, 'Không tải được dữ liệu');
        }
    });
}

function renderExistingFiles() {
    const $container = $('#existingFiles');

    if (!keptFilePaths.length) {
        $container.empty();
        return;
    }

    const items = keptFilePaths.map((filePath, index) => {
        const fileName = getFileNameFromPath(filePath);
        const fileUrl = buildWwwrootFileUrl(filePath);
        //<button type="button" class="btn btn-sm btn-danger" data-index="${index}" onclick="removeExistingFile(${index})"><i class="hgi hgi-stroke hgi-rounded hgi-file-x"></i></button>
        return `<li class="d-flex align-items-center justify-content-between" style="gap:8px;">
                    <a href="${fileUrl}" target="_blank" download>${fileName}</a>
                    <a data-toggle="tooltip" title="" class="delete-command-btn text-red cursor-pointer" data-original-title="Xóa" data-index="${index}" onclick="removeExistingFile(${index})">
                                <i class="hgi-icon hgi-delete"></i>
                            </a>
                </li>`;
    }).join('');

    $container.html(`<div class="alert alert-info"><strong>File hiện tại:</strong><ul style="list-style:none;padding-left:0;margin-bottom:0;">${items}</ul></div>`);
}

function removeExistingFile(index) {
    keptFilePaths.splice(index, 1);
    renderExistingFiles();
}

function bindFormEvents() {
    $('#formVanBan').on('submit', function (e) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const vanBanID = urlParams.get('id');

        const formData = new FormData(this);
        setDateFormData(formData, 'ngayBanHanh');
        setDateFormData(formData, 'ngayHieuLuc');
        setDateFormData(formData, 'ngayHetHan');

        // Gửi danh sách file cũ được giữ lại
        keptFilePaths.forEach(filePath => formData.append('KeptFilePaths', filePath));

        const url = vanBanID ? ApiUrl + '/ChinhSua/' + vanBanID : ApiUrl + '/TaoMoi';
        const method = vanBanID ? 'PUT' : 'POST';

        console.log(formData, "formData");
        //return;

        toggleLoadingModal(true);

        $.ajax({
            url: url,
            type: method,
            data: formData,
            processData: false,
            contentType: false,
            success: function (result) {
                toggleLoadingModal(false);
                if (result.isSuccess) {
                    showNotification(1, vanBanID ? 'Cập nhật thành công' : 'Tạo mới thành công');
                    setTimeout(() => window.location.href = baseUrl + '/AdminTool/TheThao/VanBan', 1500);
                } else {
                    showNotification(0, 'Lỗi: ' + result.error);
                }
            },
            error: function (err) {
                toggleLoadingModal(false);
                showNotification(0, 'Lỗi: ' + (err.responseJSON?.error || 'Không xác định'));
            }
        });
    });
}

function getCurrentFiles(files) {
    if (!files) {
        return [];
    }

    return Array.isArray(files) ? files : [files];
}

function getFilePath(file) {
    if (typeof file === 'string') {
        return file;
    }

    return file?.duongDanFile || file?.duongDan || file?.path || file?.url || '';
}

function getDisplayFileName(file) {
    if (typeof file === 'string') {
        return getFileNameFromPath(file);
    }

    return file?.tenFile || file?.fileName || getFileNameFromPath(getFilePath(file));
}

function buildWwwrootFileUrl(filePath) {
    const normalizedPath = normalizeWwwrootPath(filePath);
    const normalizedBaseUrl = (baseUrl || '').replace(/\/$/, '');

    return `${normalizedBaseUrl}/${normalizedPath}`;
}

function normalizeWwwrootPath(filePath) {
    return (filePath || '')
        .replace(/\\/g, '/')
        .replace(/^~\//, '')
        .replace(/^\/+/, '')
        .replace(/^wwwroot\//i, '');
}

function getFileNameFromPath(filePath) {
    const normalizedPath = normalizeWwwrootPath(filePath);
    return normalizedPath.split('/').pop() || 'Tải file';
}

function setDateFormData(formData, fieldName) {
    const dateValue = $(`#${fieldName}`).val();
    formData.set(fieldName, dateValue ? formatDateToSearch(dateValue) : '');
}

function bindFileEvents() {
    $('#fileList').on('change', function () {
        const files = Array.from(this.files);
        const invalidFiles = getInvalidFiles(files);

        if (files.length === 0) {
            $('#filePreview').empty();
            return;
        }

        if (invalidFiles.length > 0) {
            showNotification(0, getInvalidFileMessage(invalidFiles));
            this.value = '';
            $('#filePreview').empty();
            return;
        }
        let html = '<div class="alert alert-warning"><strong>File sẽ được upload:</strong><ul>';

        for (let i = 0; i < files.length; i++) {
            html += `<li>${files[i].name} (${(files[i].size / 1024 / 1024).toFixed(2)} MB)</li>`;
        }

        html += '</ul></div>';
        $('#filePreview').html(html);
    });
}

function getInvalidFiles(files) {
    return files.filter(file => {
        const extension = getFileExtension(file.name);
        const fileSizeMb = file.size / 1024 / 1024;

        return !allowedFileExtensions.includes(extension) || fileSizeMb > maxFileSizeMb;
    });
}

function getFileExtension(fileName) {
    return (fileName.split('.').pop() || '').toLowerCase();
}

function getInvalidFileMessage(files) {
    const fileNames = files.map(file => file.name).join(', ');
    return `File khong hop le: ${fileNames}. Chi cho phep DOC, DOCX, PDF va toi da ${maxFileSizeMb}MB/file`;
}

function validateForm() {
    const soKyHieu = $('#soKyHieu').val().trim();
    const trichYeu = $('#trichYeu').val().trim();
    const theLoaiID = $('#theLoaiID').val();
    const capBanHanhID = $('#capBanHanhID').val();
    const ngayBanHanh = $('#ngayBanHanh').val();

    if (!soKyHieu) {
        showNotification(0, 'Vui lòng nhập số ký hiệu');
        return false;
    }
    if (!trichYeu) {
        showNotification(0, 'Vui lòng nhập trích yếu');
        return false;
    }
    if (!theLoaiID) {
        showNotification(0, 'Vui lòng chọn loại văn bản');
        return false;
    }
    if (!capBanHanhID) {
        showNotification(0, 'Vui lòng chọn cấp ban hành');
        return false;
    }
    if (!ngayBanHanh) {
        showNotification(0, 'Vui lòng chọn ngày ban hành');
        return false;
    }

    const files = Array.from($('#fileList')[0].files);
    const invalidFiles = getInvalidFiles(files);
    if (invalidFiles.length > 0) {
        showNotification(0, getInvalidFileMessage(invalidFiles));
        return false;
    }

    // Phải có ít nhất 1 file: file cũ được giữ lại hoặc file mới upload
    if (files.length === 0 && keptFilePaths.length === 0) {
        showNotification(0, 'Vui lòng đính kèm ít nhất một file');
        return false;
    }

    return true;
}
