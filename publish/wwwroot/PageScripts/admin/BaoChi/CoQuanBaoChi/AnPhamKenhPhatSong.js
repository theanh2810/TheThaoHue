const baseUrl = getRootLink();

const allowedExtensions = {
    1: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"],    // Ảnh
    2: [".mp4", ".webm", ".ogg", ".mov", ".avi"],             // Video
    3: [".mp3", ".wav", ".m4a"],                              // Audio
    4: [".doc", ".docx", ".pdf", ".xlsx", ".xls", ".dot"]     // File
};
const guidEmpty = "00000000-0000-0000-0000-000000000000";
$(document).ready(function () {
    initSelect2();
    let translations = [];

    console.log(coQuanBaoChiID);
    (async function () {
        await initThongTinToChuc(coQuanBaoChiID);
        await initNgonNgu();
        await initTanSuat();
        await initLinhVucChuyenSau();
        await initCoQuanBaoChi()
        initTable(coQuanBaoChiID);
        setTimeout(() => { 
            initSelect2()
        }, 500);
        initFilter_Option();
    })();

    /* OLD FILTER EVENTS - Commented for reference
    $('#tim-kiem').on('click', async function () {
        initTable(coQuanBaoChiID)
    });

    $('#tat-ca').on('click', async function () {
        $('#tu-khoa-search').val('');
        $('#tan-suat-search').val('-1').trigger('change');
        $('#linh-vuc-chuyen-sau-search').val('-1').trigger('change');
        $('#co-quan-bao-chi-search').val('-1').trigger('change');
        $('#trang-thai-search').val('-1').trigger('change');
        initTable(coQuanBaoChiID)
    });

    document.getElementById("tu-khoa-search").addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            initTable(coQuanBaoChiID)
        }
    });
    */

    async function initThongTinToChuc(coQuanBaoChiID) {
        try {
            const res = await fetch(`${baseUrl}/api/ToChucApi/BanDich/${coQuanBaoChiID}?maNgonNgu=vi`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                const data = await res.json();
                if (data && data.isSuccess && data.value) {
                    const translation = data.value[0];
                    $('.TieuDe h2').text(`Quản lý ấn phẩm xuất bản ${translation.tenToChuc || ''}`);
                }
            } else {
                console.log('Không tìm thấy bản dịch cho ngôn ngữ:', maNgonNgu);
            }
        } catch (err) {
            console.log('Lỗi khi tải bản dịch:', err.message);
        }
    }

    async function initTable(coQuanBaoChiID) {
        const tableApi = {
            url: `${baseUrl}/api/BaoChiAnPhamApi/DanhSach`,
            type: "POST",
            data: function (d) {
                var suDung = $('#trang-thai-search').val()
                var tanSuat = $('#tan-suat-search').val()
                var linhVuc = $('#linh-vuc-chuyen-sau-search').val()
                return JSON.stringify({
                    tuKhoa: $('#tu-khoa-search').val() || null,
                    maNgonNgu: $('#ngon-ngu-search').val() || 'vi',
                    tanSuatID: (tanSuat == "-1" || tanSuat == "" || !tanSuat) ? null : parseInt(tanSuat) || null,
                    toChucID: coQuanBaoChiID ? coQuanBaoChiID : null,
                    linhVucChuyenSauID: (linhVuc == "-1" || linhVuc == "" || !linhVuc) ? null : parseInt(linhVuc) || null,
                    trangThai: (suDung == "-1" || suDung == "" || !suDung) ? null : (suDung === "1" ? true : false)
                });
            },
            contentType: 'application/json; charset=utf-8',
            dataSrc: function (data) {
                if (data && data.isSuccess && data.value.length > 0) {
                    data.value.forEach((item, index) => {
                        item.stt = index + 1;
                    });
                    return data.value;
                }
                return [];
            },
        };

        const tableDefs = [
            {
                targets: 1,
                render: function (data, type, row, meta) {
                    return `<span class="detail-command-btn" id=n-"${meta.row}">${data}</span>`;
                }
            },
            {
                targets: 6,
                render: function (data, type, row, meta) {
                    if (row.trangThai) {
                        return `<span class="TrangThai green-text">Đã phát hành</span>`;
                    }
                    else {
                        return `<span class="TrangThai yellow-text">Chưa phát hành</span>`;
                    }
                }
            },
            {
                targets: 7,
                render: function (data, type, row, meta) {
                    let html = ""
                    if (permitedEdit) {
                        html += `<i data-toggle="tooltip" title="Chỉnh sửa" class="edit-command-btn text-yellow" id=n-"${meta.row}">
                                   <i class="hgi-icon hgi-edit"></i>
                                </i>`;
                    }
                    if (permitedDelete) {
                        html += `<i data-toggle="tooltip" title="Xoá" class="delete-command-btn text-red" id=n-"${meta.row}">
                                   <i class="hgi-icon hgi-delete"></i>
                                </i>`
                    }
                    return html
                }
            }
        ];

        const tableCols = [
            { "data": "stt", "width": "40px", "class": "center-align" },
            { "data": "tenAnPham", "width": "", "class": "left-align name-text" },
            { "data": "tenCoQuanBaoChi", "width": "15%", "class": "left-align" },
            { "data": "tenTanSuat", "width": "10%", "class": "left-align" },
            { "data": "tenLinhVucChuyenSau", "width": "12%", "class": "left-align" },
            { "data": "soLuong", "width": "150px", "class": "center-align" },
            { "data": "trangThai", "width": "120px", "class": "left-align" },
            { "data": "", "width": "120px", "class": "center-align group-icon-action" },
        ];

        if (!permitedEdit && !permitedDelete) {
            tableCols.pop();
            tableDefs.pop();
        }

        initDataTableConfigNoSearch('dataGrid', tableApi, tableDefs, tableCols);

        $('#dataGrid tbody').on('click', '.edit-command-btn', async function () {
            const id = $(this).attr("ID").match(/\d+/)[0];
            const rowData = $('#dataGrid').DataTable().row(id).data();

            // Gán dữ liệu cơ bản
            $('#idAnPhamAdd').val(rowData.baoChiAnPhamID);
            $('#tanSuatAdd').val(rowData.tanSuatID).trigger('change');
            $('#linhVucChuyenSauAdd').val(rowData.linhVucChuyenSauID).trigger('change');
            $(`input[name='trangThaiAdd'][value='${rowData.trangThai ? "1" : "0"}']`).prop('checked', true);

            if (rowData.dacTrungSonLa === true) {
                $("#dacTrungDiaPhuongAdd").prop("checked", true);
            } else {
                $("#dacTrungDiaPhuongAdd").prop("checked", false);
            }

            translations = [];

            try {
                // Lấy bản dịch
                const resBanDich = await fetch(`/api/BaoChiAnPhamApi/BanDich/${rowData.baoChiAnPhamID}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!resBanDich.ok) throw new Error(await resBanDich.text());

                const banDichResult = await resBanDich.json();
                if (banDichResult?.isSuccess && banDichResult.value) {
                    translations = banDichResult.value;
                } else {
                    console.log(banDichResult.error);
                }

                // Lấy file đa phương tiện
                const resFile = await fetch(`/api/BaoChiAnPhamApi/DanhSachFile`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ DoiTuongSoHuuID: rowData.baoChiAnPhamID, MaNgonNgu: null })
                });

                if (!resFile.ok) throw new Error(await resFile.text());

                const fileResult = await resFile.json();
                if (fileResult?.isSuccess && fileResult.value) {
                    const files = fileResult.value;
                    translations = translations.map(t => {
                        const found = files.find(f => f.moTa === t.maNgonNgu);
                        return found ? { ...t, tieuDe: found.tieuDe, duongDanFile: found.duongDanFile, daPhuongTienID: found.daPhuongTienID, fileName: found.duongDanFile.split('/').pop() } : t;
                    });
                } else {
                    console.log(fileResult.error);
                }

                // Bind form
                $('#ngonNguAdd').val('vi').trigger('change');
                $('#modalAdd').modal('show');

            } catch (err) {
                console.error("Lỗi khi load dữ liệu:", err.message);
            }
        });

        $('#dataGrid tbody').on('click', '.delete-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGrid').DataTable().row(id).data();

            $('#idDelete').val(data.baoChiAnPhamID);
            $('#nameDelete').text(`${data.tenAnPham}`);

            $('#modalDelete').modal('show');
        });

        $('#dataGrid tbody').on('click', '.detail-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGrid').DataTable().row(id).data();

            $('#modalDetailTitle').text(data.tenAnPham || "Chi tiết ấn phẩm/kênh phát sóng")

            $('#linhVucChuyenSauDetail').text(data.tenLinhVucChuyenSau || "");
            $('#tanSuatDetail').text(data.tenTanSuat || "");
            //$('#thuTuDetail').text(data.thuTu);
            $('#trangThaiDetail').html(data.trangThai == true ? `<div class="TrangThai green-text">Đã phát hành</div>` : `<div class="TrangThai yellow-text">Chưa phát hành</div>`);

            $('#ngonNguDetail').text(data.tenNgonNgu || "");
            $('#tenAnPhamDetail').text(data.tenAnPham || "");
            $('#doiTuongDocGiaDetail').text(data.doiTuongDocGia || "");

            // Thông tin audit
            $('#ngayTaoDetail').text(formatDateTime(data.ngayCapNhat));
            $('#nguoiTaoDetail').text(data.tenNguoiCapNhat || "");
            $('#ngayCapNhatDetail').text(formatDateTime(data.ngayHieuChinh));
            $('#nguoiCapNhatDetail').text(data.tenNguoiHieuChinh || "");

            $('#modalDetail').modal('show');
        });

    }

    function saveTempTranslation() {
        let maNgonNgu = $("#ngonNguAdd").val();
        let tenAnPham = $("#tenAnPhamAdd").val().trim();
        let doiTuongDocGia = $("#doiTuongDocGiaAdd").val().trim();
        let tieuDe = $("#tenTepAdd").val().trim();
        let fileInput = document.getElementById("fileAdd");
        let file = fileInput && fileInput.files.length > 0 ? fileInput.files[0] : null;

        if (!maNgonNgu) return; // phải chọn ngôn ngữ

        let index = translations.findIndex(t => t.maNgonNgu === maNgonNgu);

        // Nếu tất cả trường đều rỗng và không có file → xóa bản dịch
        if (!tenAnPham && !doiTuongDocGia && !tieuDe && !file) {
            if (index !== -1) {
                translations.splice(index, 1);
            }
        } else {
            if (index !== -1) {
                // cập nhật bản dịch đã có
                translations[index].tenAnPham = tenAnPham;
                translations[index].doiTuongDocGia = doiTuongDocGia;
                translations[index].tieuDe = tieuDe;
                if (file) {
                    translations[index].file = file;
                    translations[index].fileName = file.name;
                }
            } else {
                // thêm mới
                translations.push({
                    maNgonNgu: maNgonNgu,
                    tenAnPham: tenAnPham,
                    doiTuongDocGia: doiTuongDocGia,
                    tieuDe: tieuDe,
                    file: file,
                    fileName: file ? file.name : ""
                });
            }
        }
        console.log(translations);
    }

    // sự kiện blur trên các input text
    $("#tenAnPhamAdd, #doiTuongDocGiaAdd, #tenTepAdd")
        .off("blur")
        .on("blur", function () {
            saveTempTranslation();
        });

    // sự kiện change cho input file
    $("#fileAdd")
        .off("change")
        .on("change", function () {
            let file = this.files[0];
            if (file) {
                $("#filePreview").text("Đã chọn: " + file.name);
            } else {
                $("#filePreview").text("");
            }
            saveTempTranslation();
        });

    // sự kiện đổi ngôn ngữ → bind lại dữ liệu
    $("#ngonNguAdd").on("change", function () {
            let maNgonNgu = $(this).val();
            let exist = translations.find(t => t.maNgonNgu === maNgonNgu);

            if (exist) {
                $("#tenAnPhamAdd").val(exist.tenAnPham || "");
                $("#doiTuongDocGiaAdd").val(exist.doiTuongDocGia || "");
                $("#tenTepAdd").val(exist.tieuDe || "");

                // file input reset, nhưng mình có thể hiển thị tên file cũ
                if (exist.fileName) {
                    $("#filePreview").text(exist.fileName);
                } else {
                    $("#filePreview").text("");
                }

                $("#fileAdd").val("");
            } else {
                $("#tenAnPhamAdd").val("");
                $("#doiTuongDocGiaAdd").val("");
                $("#moTaAdd").val("");
                $("#tenTepAdd").val("");
                $("#fileAdd").val("");
                $("#filePreview").text("");
            }
        });

    $("#formAdd").on("submit", function (e) {
        e.preventDefault();

        const submitBtn = $(this).find('button[type="submit"]');
        if (submitBtn.prop('disabled')) {
            return;
        }
        
        submitBtn.prop('disabled', true);
        const originalText = submitBtn.find('#submitText').text();
        submitBtn.find('#submitText').text('Đang xử lý...')

        try {
            saveTempTranslation();
            dataAdd(coQuanBaoChiID);
          
            submitBtn.prop('disabled', false);
            submitBtn.find('#submitText').text(originalText);
        } catch (err) {
            console.error(err);
            submitBtn.prop('disabled', false);
            submitBtn.find('#submitText').text(originalText);
        }
    });

    $("#formDelete").on("submit", function (e) {
        e.preventDefault();
        dataDelete();
    });

    async function dataAdd(coQuanBaoChiID) {
        let idAnPham = $('#idAnPhamAdd').val();
        let linhVucChuyenSau = $('#linhVucChuyenSauAdd').val() || null;
        let tanSuat = $('#tanSuatAdd').val();
        let trangThai = $("input[name='trangThaiAdd']:checked").val();
        let dacTrung = $("#dacTrungDiaPhuongAdd").prop("checked");
        var tenTiengViet = translations.find(el => el.maNgonNgu === 'vi')?.tenAnPham || null
        if (translations?.length <= 0 || tenTiengViet == null || checkEmptyBlank(linhVucChuyenSau) || checkEmptyBlank(tanSuat)) {
            showNotification(0, 'Vui lòng nhập đầy đủ thông tin bắt buộc (*), bắt buộc có bản dịch tiếng Việt')
            return;
        }

        let thongTinChung = {
            "BaoChiAnPhamID": idAnPham || guidEmpty,
            "LinhVucChuyenSauID": linhVucChuyenSau,
            "TanSuatID": tanSuat,
            "ToChucID": coQuanBaoChiID,
            "trangThai": trangThai == "1" ? true : false,
            "dacTrungSonLa": dacTrung
        };

        let formData = new FormData()
        formData.append("BaoChiAnPham", JSON.stringify(thongTinChung));
        formData.append("BaoChiAnPham_NoiDung", JSON.stringify(translations));
      
        if (checkEmptyBlank(idAnPham)) {
            try {
                const res = await fetch('/api/BaoChiAnPhamApi/ThemMoi', {
                    method: 'POST',
                    body: formData
                })

                if (!res.ok) {
                    var errText = await res.text();
                    throw new Error(errText);
                }
                data = await res.json();

                if (data && data.isSuccess && data.value) {
                    showNotification(1, 'Thêm mới thành công')
                    await dataAddDaPhuongTien(translations, data.value.baoChiAnPhamID)
                    translations = []
                    $('#dataGrid').DataTable().ajax.reload(null, false);
                    $('#modalAdd').modal('hide');
                } else {
                    showNotification(0, data.error)
                }
            }
            catch (err) {
                console.log(err.message)
            }
        } else {
            try {
                const res = await fetch(`/api/BaoChiAnPhamApi/ChinhSua/${idAnPham}`, {
                    method: 'PUT',
                    body: formData
                })

                if (!res.ok) {
                    var errText = await res.text();
                    throw new Error(errText);
                }

                data = await res.json();

                if (data && data.isSuccess && data.value) {
                    showNotification(1, 'Chỉnh sửa thành công')
                    await dataAddDaPhuongTien(translations, data.value.baoChiAnPhamID)
                    $('#dataGrid').DataTable().ajax.reload(null, false);
                    $('#modalAdd').modal('hide');
                } else {
                    showNotification(0, data.error)
                }
            }
            catch (err) {
                console.log(err.message)
            }
        }
    }

    async function dataAddDaPhuongTien(data, id) { 
        // daPhuongTienID
        // duongDanFile
        // tieuDeFile
        // file

        // Mỗi phần tử trong mảng là một dpt 
        if (!data) {
            return;
        }
        for (const el of data) {
            let daPhuongTienID = el.daPhuongTienID || "00000000-0000-0000-0000-000000000000";
            let loaiMedia = null
            let fileDPT = el.file
            let duongDanFile = el.duongDanFile
            let ext = "";

            if (fileDPT) {
                ext = "." + fileDPT.name.split(".").pop().toLowerCase();
            } else if (!checkEmptyBlank(duongDanFile)) {
                ext = "." + duongDanFile.split("/").pop().split(".").pop().toLowerCase();
            }

            if (!ext) return null; // không có file hay đường dẫn

            // tìm trong allowedExtensions
            for (const [mediaType, extensions] of Object.entries(allowedExtensions)) {
                if (extensions.includes(ext)) {
                    loaiMedia = Number(mediaType)
                }
            }

            let thongTinChung = {
                DaPhuongTienID: daPhuongTienID,
                DoiTuongSoHuuID: id,
                LoaiMedia: loaiMedia,
                LoaiDoiTuong: "BC_BaoChiAnPham",
                DuongDanFile: duongDanFile,
                TacGia: '',
                ThuTuHienThi: 1,
                SuDung: true,
            };

            let daPhuongTientranslations = [{
                MaNgonNgu: el.maNgonNgu,
                TieuDe: el.tieuDe,
                MoTa: el.maNgonNgu // dùng để mapping với bản dịch ấn phẩm
            }]


            let formData = new FormData();
            formData.append("DaPhuongTien", JSON.stringify(thongTinChung));
            formData.append("DaPhuongTien_NoiDung", JSON.stringify(daPhuongTientranslations));

            if (fileDPT) {
                formData.append("File", fileDPT);
            }

            try {
                const isNew = (daPhuongTienID == null || daPhuongTienID == guidEmpty);
                const url = isNew
                    ? '/api/DaPhuongTienApi/ThemMoi'
                    : `/api/DaPhuongTienApi/ChinhSua/${daPhuongTienID}`;
                const method = isNew ? 'POST' : 'PUT';

                const res = await fetch(url, {
                    method: method,
                    body: formData
                });

                if (!res.ok) {
                    throw new Error(await res.text());
                }

                data = await res.json();

                if (data && data.isSuccess && data.value) {
                    showNotification(1, isNew ? 'Thêm mới thành công' : 'Chỉnh sửa thành công');
                    daPhuongTientranslations = [];
                    $('#dataGridDaPhuongTien').DataTable().ajax.reload();
                    $('#modalAddDaPhuongTien').modal('hide');
                } else {
                    showNotification(0, data.error);
                }
            } catch (err) {
                console.log(err.message);
            }
        }
    }

    // reset modal
    $("#modalAdd").on('hidden.bs.modal', function () {
        translations = []
        $(this).find('input[type=text], textarea').val('');
        $(this).find('select').val('vi').trigger('change');
        $(this).find('input[type=radio][value=1], input[type=checkbox][value=1]').prop('checked', true);
    });

    async function dataDelete() {
        let id = $('#idDelete').val();

        try {
            const res = await fetch(`/api/BaoChiAnPhamApi/Xoa/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }

            data = await res.json();

            if (data && data.isSuccess && data.value) {
                showNotification(1, 'Xoá thành công')
                $('#modalDelete').modal('hide');
                $('#dataGrid').DataTable().ajax.reload();
            } else {
                console.log(data.error)
            }

        }
        catch (err) {
            showNotification(0, err.message)
        }
    }

    async function initNgonNgu() {
        try {
            const res = await fetch('/api/NgonNguApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    trangThai: null,
                    tuKhoa: null
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value) {
                $("#ngon-ngu-search").empty();
                $("#ngonNguAdd").empty();
                //$("#ngon-ngu-search").append(`<option value="">Tất cả</option>`);
                data.value.forEach(lang => {
                    $("#ngon-ngu-search").append(`<option value="${lang.maNgonNgu?.toLowerCase() }">${lang.tenNgonNgu}</option>`);
                    $("#ngonNguAdd").append(`<option value="${lang.maNgonNgu?.toLowerCase()}">${lang.tenNgonNgu}</option>`);
                });
                $("#ngon-ngu-search").val('vi').trigger('change');
                $("#ngonNguAdd").val('vi').trigger('change');
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            showNotification(0, err.message)
        }
    };

    async function initLinhVucChuyenSau() {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: 9,
                    tuKhoa: null
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value) {
                $("#linh-vuc-chuyen-sau-search").empty();

                $("#linh-vuc-chuyen-sau-search").append(`<option value="">Chọn lĩnh vực</option><option value="-1">Tất cả</option>`);
                data.value.forEach(el => {
                    $("#linhVucChuyenSauAdd").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
                    $("#linh-vuc-chuyen-sau-search").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
                });
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };

    async function initTanSuat() {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: 6,
                    tuKhoa: null
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value) {
                $("#tan-suat-search").append(`<option value="">Chọn tần suất</option><option value="-1">Tất cả</option>`);
                data.value.forEach(el => {
                    $("#tanSuatAdd").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
                    $("#tan-suat-search").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
                });
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };

    async function initCoQuanBaoChi() {
        try {
            const res = await fetch('/api/ToChucApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiToChucID: 97
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

           
            if (data && data.isSuccess && data.value) {
                $("#co-quan-bao-chi-search").empty();
                $("#co-quan-bao-chi-search").append(`<option value="-1">Tất cả<option>`);
                data.value.forEach(el => {
                    $("#co-quan-bao-chi-search").append(`<option value="${el.toChucID}">${el.tenToChuc}</option>`);
                });
                //data.value.forEach(el => {
                //    $("#theLoaiAdd").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
                //});
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };
})

function initFilter_Option() {
    // Khởi tạo filter chung với config
    initCommonFilterPost({
        // HTML cho các option sắp xếp
        htmlFilterSort: `
            <li class="active" data-value="Ten"><a class="option_filter">Tên ấn phẩm</a></li>
            <li class="" data-value="LinhVuc"><a class="option_filter">Lĩnh vực chuyên sâu</a></li>
            <li class="" data-value="TanSuat"><a class="option_filter">Tần suất</a></li>
            <li class="" data-value="NgayCapNhat"><a class="option_filter">Ngày cập nhật</a></li>
        `,
        
        // Các filter inputs (select) - không bao gồm search box và date inputs
        filterInputs: [
            '#linh-vuc-chuyen-sau-search',
            '#tan-suat-search',
            '#trang-thai-search',
            '#ngon-ngu-search'
        ],

        // Ô search từ khóa
        searchInput: '#tu-khoa-search',
        
        // Thời gian debounce (ms)
        debounceTime: 1000,
        
        // URL API Filter
        apiUrl: `/api/BaoChiAnPhamApi/DanhSach`,
        
        // Function build request cho API
        buildFilterRequest: function() {
            var suDung = $('#trang-thai-search').val();
            var tanSuat = $('#tan-suat-search').val();
            var linhVuc = $('#linh-vuc-chuyen-sau-search').val();
            
            return {
                tuKhoa: $('#tu-khoa-search').val() || null,
                maNgonNgu: $('#ngon-ngu-search').val() || 'vi',
                tanSuatID: (tanSuat == "-1" || tanSuat == "" || !tanSuat) ? null : parseInt(tanSuat) || null,
                toChucID: coQuanBaoChiID ? coQuanBaoChiID : null,
                linhVucChuyenSauID: (linhVuc == "-1" || linhVuc == "" || !linhVuc) ? null : parseInt(linhVuc) || null,
                trangThai: (suDung == "-1" || suDung == "" || !suDung) ? null : (suDung === "1" ? true : false)
                // type và typeSort sẽ được thêm tự động bởi FilterAction_Post.js
            };
        },
        
        // Callback sau khi apply filter
        onFilterApplied: function(data) {
            // Xử lý response data
            data.value.forEach((item, index) => {
                item.stt = index + 1;
            });
            if (data.isSuccess && data.value) {
                $('#dataGrid').DataTable().clear().rows.add(data.value).draw();
            }
        }
    });
}