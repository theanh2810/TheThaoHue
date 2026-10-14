window.HienVat = window.HienVat || {};

const guidEmpty = '00000000-0000-0000-0000-000000000000';
const allowedExtensions = {
    1: ".jpg,.jpeg,.png,.gif,.webp,.bmp",                // Ảnh
    2: ".mp4,.webm,.ogg,.mov,.avi",                      // Video
    3: ".mp3,.wav,.m4a",                                 // Audio
    4: ".doc,.docx,.pdf,.xlsx,.xls,.dot"                      // File
};
const ckeditormauSac = CKEDITOR.replace('mauSac_HienVat');
const ckeditorkichThuoc = CKEDITOR.replace('kichThuoc_HienVat');
const ckeditornienDai = CKEDITOR.replace('nienDai_HienVat');
const ckeditornguonGoc = CKEDITOR.replace('nguonGoc_HienVat');
const ckeditortinhTrangSuuTam = CKEDITOR.replace('tinhTrangSuuTam_HienVat');
const ckeditorhoanCanhSuuTam = CKEDITOR.replace('hoanCanhSuuTam_HienVat');
const ckeditorchuHienVat = CKEDITOR.replace('chuHienVat_HienVat');
const ckeditornguoiSuuTam = CKEDITOR.replace('nguoiSuuTam_HienVat');
const ckeditorkhaoTa = CKEDITOR.replace('khaoTa_HienVat');

$(document).ready(function () {
    initSelect2();
    initDatePicker();
    let hienVatTranslations = [];
    let daPhuongTientranslations_HienVat = [];
    let dataDPT_HienVat = [];

    ; (async function () {
        await Promise.all([
            initNgonNgu(),
            initChatLieu(),
            initBaoTang(),
            initLoaiHienVat()
        ]);
        initTableHienVat();
        initTableDaPhuongTien()
    })();

    //#region INIT TABLE HIEN VAT
    async function initTableHienVat() {
        const tableApi = {
            url: `${baseUrl}/api/HienVatApi/DanhSach`,
            type: "POST",
            data: function (d) {
                return JSON.stringify({
                    baoTangID: coQuanId || guidEmpty,
                    maNgonNgu: 'vi'
                })
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
                targets: 1, // Cột tên di sản hiện vật
                render: function (data, type, row, meta) {
                    return `<div class="group-info have-image">
                        <div class="have-image">
                            <img src="${row.anhDaiDien || '/assets/images/vector/no-image.png'}" alt="${row.tenHienVat || ''}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                        </div>
                        <div class="group-info">
                        <div class="info-main"><div>${row.tenHienVat || ''}</div></div>
                        <div class="info-sub">${row.maHienVat || ''}</div></div>
                    </div>`;
                }
            },
            {
                targets: 4,
                render: function (data, type, row, meta) {
                    if (data == 1) {
                        return `Mua`;
                    } else if (data == 2) {
                        return `Hiến tặng`;
                    }
                    return ``;
                }
            },
            {
                targets: 7,
                render: function (data, type, row, meta) {
                    if (data) {
                        return `<i class="hgi-icon hgi-check"></i>`;
                    }
                    else {
                        return `<i class="hgi-icon hgi-cancel"></i>`;
                    }
                }
            },
            {
                targets: 8,
                render: function (data, type, row, meta) {
                    let html = ""
                    html += `<i data-toggle="tooltip" title="Chỉnh sửa" class="edit-command-btn text-yellow" id=n-"${meta.row}">
                                   <i class="hgi-icon hgi-edit"></i>
                                </i>`;
                    html += `<i data-toggle="tooltip" title="Xoá" class="delete-command-btn text-red" id=n-"${meta.row}">
                                   <i class="hgi-icon hgi-delete"></i>
                                </i>`

                    return html
                }
            }
        ];

        const tableCols = [
            { "data": "stt", "width": "40px", "class": "center-align" },
            { "data": "tenHienVat", "width": "25%", "class": "left-align" },
            { "data": "tenLoaiHienVat", "width": "120px", "class": "left-align" },
            { "data": "tenChatLieu", "width": "120px", "class": "left-align" },
            { "data": "phuongThucTangMuaID", "width": "120px", "class": "center-align" },
            { "data": "tenBaoTang", "width": "120px", "class": "center-align" },
            { "data": "soLuong", "width": "120px", "class": "center-align" },
            { "data": "suDung", "width": "120px", "class": "center-align" },
            { "data": "", "width": "120px", "class": "center-align group-icon-action" },
        ];

        initDataTableConfigNoSearch('dataGridHienVat', tableApi, tableDefs, tableCols);

        $('#dataGridHienVat tbody').on('click', '.edit-command-btn', async function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGridHienVat').DataTable().row(id).data();

            $('#hienVatID').val(data.hienVatID);
            initThongTinChung(data.hienVatID);
            HienVat.toggleForm(true);
        });
        $('#dataGridHienVat tbody').on('click', '.delete-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGridHienVat').DataTable().row(id).data();

            $('#idDelete').val(data.hienVatID);
            $('#idTypeDelete').val(2);
            $('#nameDelete').text(`${data.tenHienVat}`);

            $('#modalDelete').modal('show');
        });
    }
    //#endregion INIT TABLE HIEN VAT

    //#region THÔNG TIN CHUNG

    document.getElementById('anhDaiDien_HienVat').addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById('previewAnhDaiDien_HienVat').setAttribute('src', e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    $(function () {
        $('#fileDPT_HienVat').on('change', function () {
            const loai = $("input[name='loaiMediaDPT_HienVat']:checked").val();
            if (loai !== "1") return; // chỉ xử lý khi loại = 1 (Hình ảnh)

            const file = this.files && this.files[0];
            if (!file) {
                $('#showhinhAnhAdd_HienVat').attr('src', '/assets/images/vector/addImage.png');
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                $('#showhinhAnhAdd_HienVat').attr('src', e.target.result);
            };
            reader.readAsDataURL(file);
        });
    });

    async function initThongTinChung(hienVatId) {
        if (checkEmptyBlank(hienVatId)) {
            return;
        }

        try {
            const res = await fetch(`/api/HienVatApi/ChiTiet/${hienVatId}`, {
                method: 'GET',
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
                $("#previewAnhDaiDien_HienVat").attr("src", data.value.anhDaiDien || "/assets/images/vector/addImage.png");
                $("#urlAnhDaiDien_HienVat").val(data.value.anhDaiDien || "");
                $("#maHienVat_HienVat").val(data.value.maHienVat || "");
                $("#loaiHienVatID_HienVat").val(data.value.loaiHienVatID).trigger("change");
                $("#chatLieuID_HienVat").val(data.value.chatLieuID).trigger("change");
                $("#phuongThucTangMuaID_HienVat").val(data.value.phuongThucTangMuaID).trigger("change");
                $("#baoTangID_HienVat").val(data.value.baoTangID).trigger("change");
                $("#trangThaiID_HienVat").val(data.value.trangThaiID).trigger("change");
                $("#tinhTrangID_HienVat").val(data.value.tinhTrangID).trigger("change");
                $("#thuTu_HienVat").val(data.value.thuTu || 1);

                // Trạng thái duyệt (radio)
                if (data.value.suDung == 1) {
                    $("#trangThaiDuyet_HienVat").prop("checked", true);
                } else {
                    $("#trangThaiChuaDuyet_HienVat").prop("checked", true);
                }

                // Bản dịch
                hienVatTranslations = data.value.banDich || [];

                let tiengViet = hienVatTranslations.find(el => el.maNgonNgu === "vi") || null;
                if (tiengViet != null) {
                    $("#ngonNgu_HienVat").val("vi").trigger("change");
                    $("#tenHienVat_HienVat").val(tiengViet.tenHienVat || "");
                    $("#tenGoiKhac_HienVat").val(tiengViet.tenGoiKhac || "");
                    $("#soLuong_HienVat").val(tiengViet.soLuong || "");
                    if (typeof ckeditormauSac !== 'undefined') ckeditormauSac.setData(tiengViet.mauSac || '');
                    if (typeof ckeditorkichThuoc !== 'undefined') ckeditorkichThuoc.setData(tiengViet.kichThuoc || '');
                    if (typeof ckeditornienDai !== 'undefined') ckeditornienDai.setData(tiengViet.nienDai || '');
                    if (typeof ckeditornguonGoc !== 'undefined') ckeditornguonGoc.setData(tiengViet.nguonGoc || '');
                    if (typeof ckeditorkhaoTa !== 'undefined') ckeditorkhaoTa.setData(tiengViet.khaoTa || '');
                    if (typeof ckeditortinhTrangSuuTam !== 'undefined') ckeditortinhTrangSuuTam.setData(tiengViet.tinhTrangSuuTam || '');
                    if (typeof ckeditorhoanCanhSuuTam !== 'undefined') ckeditorhoanCanhSuuTam.setData(tiengViet.hoanCanhSuuTam || '');
                    if (typeof ckeditorchuHienVat !== 'undefined') ckeditorchuHienVat.setData(tiengViet.chuHienVat || '');
                    if (typeof ckeditornguoiSuuTam !== 'undefined') ckeditornguoiSuuTam.setData(tiengViet.nguoiSuuTam || '');
                    //$("#mauSac").val(tiengViet.mauSac || "");
                    // $("#kichThuoc").val(tiengViet.kichThuoc || "");
                    // $("#nienDai").val(tiengViet.nienDai || "");
                    // $("#nguonGoc").val(tiengViet.nguonGoc || "");
                    // $("#khaoTa").val(tiengViet.khaoTa || "");
                    // $("#tinhTrangSuuTam").val(tiengViet.tinhTrangSuuTam || "");
                    // $("#hoanCanhSuuTam").val(tiengViet.hoanCanhSuuTam || "");
                    // $("#chuHienVat").val(tiengViet.chuHienVat || "");
                    // $("#nguoiSuuTam").val(tiengViet.nguoiSuuTam || "");
                }

                // Tài liệu truyền thông
                $('#dataGridDaPhuongTien_HienVat').DataTable().ajax.reload();

            } else {
                showNotification(0, data.error);
            }

        }
        catch (err) {
            showNotification(0, err.message)
        }
    }

    // Hàm lưu tạm cho 1 ngôn ngữ
    function saveTempHienVatTranslation() {
        let maNgonNgu = $("#ngonNgu_HienVat").val();
        if (!maNgonNgu) return; // bắt buộc chọn ngôn ngữ

        let tenHienVat = $("#tenHienVat_HienVat").val().trim();
        let tenGoiKhac = $("#tenGoiKhac_HienVat").val().trim();
        let soLuong = $("#soLuong_HienVat").val().trim();
        let mauSac = ckeditormauSac.getData();
        let kichThuoc = ckeditorkichThuoc.getData();
        let nienDai = ckeditornienDai.getData();
        let nguonGoc = ckeditornguonGoc.getData();
        let khaoTa = ckeditorkhaoTa.getData();
        let tinhTrangSuuTam = ckeditortinhTrangSuuTam.getData();
        let hoanCanhSuuTam = ckeditorhoanCanhSuuTam.getData();
        let chuHienVat = ckeditorchuHienVat.getData();
        let nguoiSuuTam = ckeditornguoiSuuTam.getData();

        // tìm index ngôn ngữ trong mảng
        let index = hienVatTranslations.findIndex(t => t.maNgonNgu === maNgonNgu);

        // nếu tất cả đều trống → xóa bản dịch
        if (
            !tenHienVat && !tenGoiKhac && !soLuong && !mauSac && !kichThuoc &&
            !nienDai && !nguonGoc && !khaoTa && !tinhTrangSuuTam &&
            !hoanCanhSuuTam && !chuHienVat && !nguoiSuuTam
        ) {
            if (index !== -1) {
                hienVatTranslations.splice(index, 1);
            }
        } else {
            if (index !== -1) {
                // cập nhật
                hienVatTranslations[index].tenHienVat = tenHienVat;
                hienVatTranslations[index].tenGoiKhac = tenGoiKhac;
                hienVatTranslations[index].soLuong = soLuong;
                hienVatTranslations[index].mauSac = mauSac;
                hienVatTranslations[index].kichThuoc = kichThuoc;
                hienVatTranslations[index].nienDai = nienDai;
                hienVatTranslations[index].nguonGoc = nguonGoc;
                hienVatTranslations[index].khaoTa = khaoTa;
                hienVatTranslations[index].tinhTrangSuuTam = tinhTrangSuuTam;
                hienVatTranslations[index].hoanCanhSuuTam = hoanCanhSuuTam;
                hienVatTranslations[index].chuHienVat = chuHienVat;
                hienVatTranslations[index].nguoiSuuTam = nguoiSuuTam;
            } else {
                // thêm mới
                hienVatTranslations.push({
                    maNgonNgu: maNgonNgu,
                    tenHienVat: tenHienVat,
                    tenGoiKhac: tenGoiKhac,
                    soLuong: soLuong,
                    mauSac: mauSac,
                    kichThuoc: kichThuoc,
                    nienDai: nienDai,
                    nguonGoc: nguonGoc,
                    khaoTa: khaoTa,
                    tinhTrangSuuTam: tinhTrangSuuTam,
                    hoanCanhSuuTam: hoanCanhSuuTam,
                    chuHienVat: chuHienVat,
                    nguoiSuuTam: nguoiSuuTam
                });
            }
        }
        console.log(hienVatTranslations);
    }

    // Sự kiện blur trên input/textarea → tự động lưu
     $("#tenHienVat_HienVat, #tenGoiKhac_HienVat, #soLuong_HienVat")
         .on("blur", function () {
             saveTempHienVatTranslation();
         });
    // Sau khi khởi tạo các CKEditor instances
    ckeditormauSac.on('blur', function() {
        saveTempHienVatTranslation();
    });
    ckeditorkichThuoc.on('blur', function() {
        saveTempHienVatTranslation();
    });
    ckeditornienDai.on('blur', function() {
        saveTempHienVatTranslation();
    });
    ckeditornguonGoc.on('blur', function() {
        saveTempHienVatTranslation();
    });
    ckeditorkhaoTa.on('blur', function() {
        saveTempHienVatTranslation();
    });
    ckeditortinhTrangSuuTam.on('blur', function() {
        saveTempHienVatTranslation();
    });
    ckeditorhoanCanhSuuTam.on('blur', function() {
        saveTempHienVatTranslation();
    });
    ckeditorchuHienVat.on('blur', function() {
        saveTempHienVatTranslation();
    });
    ckeditornguoiSuuTam.on('blur', function() {
        saveTempHienVatTranslation();
    });

    // Sự kiện đổi ngôn ngữ → bind lại dữ liệu đã lưu
    $("#ngonNgu_HienVat").on("change", function () {
        let maNgonNgu = $(this).val();
        let exist = hienVatTranslations.find(t => t.maNgonNgu === maNgonNgu);

        if (exist) {
            $("#tenHienVat_HienVat").val(exist.tenHienVat);
            $("#tenGoiKhac_HienVat").val(exist.tenGoiKhac);
            $("#soLuong_HienVat").val(exist.soLuong);
            if (typeof ckeditormauSac !== 'undefined') ckeditormauSac.setData(exist.mauSac || '');
            if (typeof ckeditorkichThuoc !== 'undefined') ckeditorkichThuoc.setData(exist.kichThuoc || '');
            if (typeof ckeditornienDai !== 'undefined') ckeditornienDai.setData(exist.nienDai || '');
            if (typeof ckeditornguonGoc !== 'undefined') ckeditornguonGoc.setData(exist.nguonGoc || '');
            if (typeof ckeditorkhaoTa !== 'undefined') ckeditorkhaoTa.setData(exist.khaoTa || '');
            if (typeof ckeditortinhTrangSuuTam !== 'undefined') ckeditortinhTrangSuuTam.setData(exist.tinhTrangSuuTam || '');
            if (typeof ckeditorhoanCanhSuuTam !== 'undefined') ckeditorhoanCanhSuuTam.setData(exist.hoanCanhSuuTam || '');
            if (typeof ckeditorchuHienVat !== 'undefined') ckeditorchuHienVat.setData(exist.chuHienVat || '');
            if (typeof ckeditornguoiSuuTam !== 'undefined') ckeditornguoiSuuTam.setData(exist.nguoiSuuTam || '');
        } else {
            // reset nếu chưa có dữ liệu
            $("#tenHienVat_HienVat").val("");
            $("#tenGoiKhac_HienVat").val("");
            $("#soLuong_HienVat").val("");
            if (typeof ckeditormauSac !== 'undefined') ckeditormauSac.setData('');
            if (typeof ckeditorkichThuoc !== 'undefined') ckeditorkichThuoc.setData('');
            if (typeof ckeditornienDai !== 'undefined') ckeditornienDai.setData('');
            if (typeof ckeditornguonGoc !== 'undefined') ckeditornguonGoc.setData('');
            if (typeof ckeditorkhaoTa !== 'undefined') ckeditorkhaoTa.setData('');
            if (typeof ckeditortinhTrangSuuTam !== 'undefined') ckeditortinhTrangSuuTam.setData('');
            if (typeof ckeditorhoanCanhSuuTam !== 'undefined') ckeditorhoanCanhSuuTam.setData('');
            if (typeof ckeditorchuHienVat !== 'undefined') ckeditorchuHienVat.setData('');
            if (typeof ckeditornguoiSuuTam !== 'undefined') ckeditornguoiSuuTam.setData('');
        }
    });

    HienVat.dataAddHienVat = async function () {
        if (!$("#formHienVat").is(":visible")) {
            return; // form ẩn thì không lưu
        }
        let hienVatId = $('#hienVatID').val();
        // Lấy file ảnh và url (nếu có)
        let anhDaiDien = $('#anhDaiDien_HienVat')[0]?.files[0] || null;
        let urlAnhDaiDien = $('#urlAnhDaiDien_HienVat').val() || null;

        // Lấy dữ liệu từ input/select
        let loaiHienVatID = $('#loaiHienVatID_HienVat').val() || null;
        let maHienVat = $('#maHienVat_HienVat').val()?.trim() || null;
        let chatLieuID = $('#chatLieuID_HienVat').val() || null;
        let phuongThucTangMuaID = $('#phuongThucTangMuaID_HienVat').val() || null;
        let baoTangID = $('#baoTangID_HienVat').val() || null;
        let trangThaiID = $('#trangThaiID_HienVat').val() || null;
        let tinhTrangID = $('#tinhTrangID_HienVat').val() || null;
        let thuTu = $('#thuTu_HienVat').val() || 1;
        let trangThai = $("input[name='trangThai_HienVat']:checked").val();

        // Lấy bản dịch tiếng Việt (bắt buộc phải có)
        let tenTiengViet = hienVatTranslations.find(el => el.maNgonNgu === 'vi')?.tenHienVat || null;

        // Validate các trường bắt buộc
        if ((anhDaiDien == null && checkEmptyBlank(urlAnhDaiDien)) || !tenTiengViet || !maHienVat || !chatLieuID || !loaiHienVatID) {
            showNotification(0, 'Vui lòng nhập đầy đủ thông tin bắt buộc (*), bao gồm bản dịch tiếng Việt');
            return null;
        }

        // Gom object thông tin chung
        let hienVat = {
            LoaiHienVatID: loaiHienVatID,
            MaHienVat: maHienVat,
            ChatLieuID: chatLieuID,
            PhuongThucTangMuaID: phuongThucTangMuaID,
            BaoTangID: baoTangID,
            TrangThaiID: trangThaiID,
            TinhTrangID: tinhTrangID,
            ThuTu: thuTu != "" ? Number(thuTu) : 1,
            SuDung: trangThai == '1' ? true : false,
            AnhDaiDien: urlAnhDaiDien
        };

        // Chuẩn bị formData để gửi lên server
        let formData = new FormData();
        formData.append("HienVat", JSON.stringify(hienVat));
        formData.append("HienVat_NoiDung", JSON.stringify(hienVatTranslations)); // mảng bản dịch
        if (anhDaiDien) {
            formData.append("AnhDaiDien", anhDaiDien);
        }

        if (checkEmptyBlank(hienVatId)) {
            try {
                const res = await fetch('/api/HienVatApi/ThemMoi', {
                    method: 'POST',
                    body: formData
                })

                if (!res.ok) {
                    var errText = await res.text();
                    throw new Error(errText);
                }
                data = await res.json();

                if (data && data.isSuccess && data.value) {
                    await HienVat.dataAddDPT_HienVat(data.value.hienVatID),
                    showNotification(1, 'Thêm mới thành công')
                    $('#dataGridHienVat').DataTable().ajax.reload();
                    HienVat.toggleForm(false);


                } else {
                    showNotification(0, data.error)
                }
            }
            catch (err) {
                console.log(err.message)
            }
        } else {
            try {
                const res = await fetch(`/api/HienVatApi/ChinhSua/${hienVatId}`, {
                    method: 'PUT',
                    body: formData
                })

                if (!res.ok) {
                    var errText = await res.text();
                    throw new Error(errText);
                }

                data = await res.json();

                if (data && data.isSuccess && data.value) {
                    await HienVat.dataAddDPT_HienVat(data.value.hienVatID),

                    showNotification(1, 'Chỉnh sửa thành công');
                    $('#dataGridHienVat').DataTable().ajax.reload();

                    HienVat.toggleForm(false);
                } else {
                    showNotification(0, data.error)
                }
            }
            catch (err) {
                console.log(err.message)
            }
        }
    }
    //#endregion THÔNG TIN CHUNG

    //#region ĐA PHƯƠNG TIỆN

    // Hàm lưu tạm cho 1 ngôn ngữ
    function saveTempTranslationDPT_HienVat() {
        let maNgonNgu = $("#ngonNguDPT_HienVat").val();
        let tieuDe = $("#tieuDeDPT_HienVat").val().trim();
        let moTa = $("#moTaDPT_HienVat").val().trim();

        if (!maNgonNgu || !tieuDe) return; // bắt buộc chọn ngôn ngữ và nhập tiêu đề

        // Kiểm tra ngôn ngữ đã tồn tại trong mảng chưa
        let exist = daPhuongTientranslations_HienVat.find(t => t.maNgonNgu === maNgonNgu);
        if (exist) {
            exist.tieuDe = tieuDe;
            exist.moTa = moTa;
        } else {
            daPhuongTientranslations_HienVat.push({
                maNgonNgu: maNgonNgu,
                tieuDe: tieuDe,
                moTa: moTa
            });
        }
    }

    // Sự kiện blur trên input/textarea → tự động lưu
    $("#tieuDeDPT_HienVat, #moTaDPT_HienVat")
        .on("blur", function () {
            saveTempTranslationDPT_HienVat();
        });

    // Sự kiện đổi ngôn ngữ → bind lại dữ liệu đã lưu
    $("#ngonNguDPT_HienVat").on("change", function () {
        let maNgonNgu = $(this).val();
        let exist = daPhuongTientranslations_HienVat.find(t => t.maNgonNgu === maNgonNgu);

        if (exist) {
            $("#tieuDeDPT_HienVat").val(exist.tieuDe);
            $("#moTaDPT_HienVat").val(exist.moTa);
        } else {
            // reset nếu chưa có dữ liệu
            $("#tieuDeDPT_HienVat").val("");
            $("#moTaDPT_HienVat").val("");
        }
    });

    $("input[name='loaiMediaDPT_HienVat']").on("change", function () {
        const loai = $(this).val();

        // Reset input
        $("#fileDPT_HienVat").val(null);
        $("#fileDPT_HienVat").attr("accept", allowedExtensions[loai] || "");

        // Ẩn tất cả container
        $("#fileHinhAnh_HienVat, #fileVideo_HienVat, #fileAmThanh_HienVat, #fileKhac_HienVat")
            .addClass("d-none");

        switch (loai) {
            case "1": // Hình ảnh
                // Chỉ hiện preview, không hiện input
                $("#fileHinhAnh_HienVat").removeClass("d-none");
                $("#fileDPT_HienVat").addClass("d-none");
                break;
            case "2": // Video
                $("#fileVideo_HienVat").removeClass("d-none");
                $("#fileVideo_HienVat").append($("#fileDPT_HienVat"));
                $("#fileDPT_HienVat").removeClass("d-none");
                break;
            case "3": // Âm thanh
                $("#fileAmThanh_HienVat").removeClass("d-none");
                $("#fileAmThanh_HienVat").append($("#fileDPT_HienVat"));
                $("#fileDPT_HienVat").removeClass("d-none");
                break;
            case "4": // File khác
                $("#fileKhac_HienVat").removeClass("d-none");
                $("#fileKhac_HienVat").append($("#fileDPT_HienVat"));
                $("#fileDPT_HienVat").removeClass("d-none");
                break;
        }
    });

    // Khởi tạo theo radio được chọn mặc định
    const loaiInit_HienVat = $("input[name='loaiMediaDPT_HienVat']:checked").val();
    $("#fileDPT_HienVat").attr("accept", allowedExtensions[loaiInit_HienVat] || "");
    $("input[name='loaiMediaDPT_HienVat']:checked").trigger("change");

    async function initTableDaPhuongTien() {
        const tableApi = {
            url: `${baseUrl}/api/DaPhuongTienApi/DanhSach`,
            type: "POST",
            data: function (d) {
                return JSON.stringify({
                    DoiTuongSoHuuID: $('#hienVatID').val() || guidEmpty,
                    maNgonNgu: 'vi'
                });
            },
            async: true,
            contentType: 'application/json; charset=utf-8',
            dataSrc: function (data) {
                console.log(data)
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
                    let tenFile = data ? data.split('/').pop() : '';
                    return `<span class="detail-command-btn text-blue" id=n-"${meta.row}">${tenFile}</span>`;
                }
            },
            {
                targets: 5,
                render: function (data, type, row, meta) {
                    if (data == 1) {
                        return `Hình ảnh`;
                    } else if (data == 2) {
                        return `Video`;
                    } else if (data == 3) {
                        return `Audio`;
                    } else if (data == 4) {
                        return `File`;
                    }
                    return ``;
                }
            },
            {
                targets: 6,
                render: function (data, type, row, meta) {
                    if (row.suDung) {
                        return `<i class="hgi-icon hgi-check"></i>`;
                    }
                    else {
                        return `<i class="hgi-icon hgi-cancel"></i>`;
                    }
                }
            },
            {
                targets: 7,
                render: function (data, type, row, meta) {
                    let html = ""
                        html += `<i data-toggle="tooltip" title="Chỉnh sửa" class="edit-command-btn text-yellow" id=n-"${meta.row}">
                                   <i class="hgi-icon hgi-edit"></i>
                                </i>`;
                        html += `<i data-toggle="tooltip" title="Xoá" class="delete-command-btn text-red" id=n-"${meta.row}">
                                   <i class="hgi-icon hgi-delete"></i>
                                </i>`
                    return html
                }
            }
        ];

        const tableCols = [
            { "data": "stt", "width": "40px", "class": "center-align" },
            { "data": "duongDanFile", "width": "25%", "class": "left-align" },
            { "data": "tieuDe", "width": "25%", "class": "left-align" },
            { "data": "moTa", "width": "120px", "class": "left-align" },
            { "data": "tacGia", "width": "120px", "class": "center-align" },
            { "data": "loaiMedia", "width": "120px", "class": "center-align" },
            { "data": "suDung", "width": "120px", "class": "center-align" },
            { "data": "", "width": "120px", "class": "center-align group-icon-action" },
        ];

        //if (!permitedEdit && !permitedDelete) {
        //    tableCols.pop();
        //    tableDefs.pop();
        //}

        initDataTableConfigNoSearch('dataGridDaPhuongTien_HienVat', tableApi, tableDefs, tableCols);

        $('#dataGridDaPhuongTien_HienVat tbody').on('click', '.edit-command-btn', async function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGridDaPhuongTien_HienVat').DataTable().row(id).data();
            $('#idDPT_HienVat').val(data.daPhuongTienID);
            if (!checkEmptyBlank(data.duongDanFile)) {
                $("#showhinhAnhAdd_HienVat").attr("src", data.duongDanFile)
            }
            // Các input text
            $("input[name='loaiMediaDPT_HienVat'][value='" + data.loaiMedia + "']").prop("checked", true);

            $("#duongDanFileDPT_HienVat").val(data.duongDanFile || "");

            $("#tacGiaDPT_HienVat").val(data.tacGia);
            $("#thuTuDPT_HienVat").val(data.thuTuHienThi);

            // Radio trạng thái
            $(`input[name='trangThaiAdd'][value='${data.suDung ? '1' : '0'}']`).prop('checked', true);

            if (data.daPhuongTienID.startsWith("temp")) {
                daPhuongTientranslations_HienVat = dataDPT_HienVat.find(t => t.DaPhuongTien.daPhuongTienID === data.daPhuongTienID)?.DaPhuongTien_NoiDung || [];
            } else {
                daPhuongTientranslations_HienVat = []
                const res = await fetch(`/api/DaPhuongTienApi/BanDich/${data.daPhuongTienID}`, {
                    method: 'GET',
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
                    daPhuongTientranslations_HienVat = data.value
                } else {
                    console.log(data.error)
                }
            }

            var banDich_vi = daPhuongTientranslations_HienVat.find(el => el.maNgonNgu === 'vi')
            $('#ngonNguDPT_HienVat').val('vi').trigger('change');
            $('#tieuDeDPT_HienVat').val(banDich_vi.tieuDe);
            $('#moTaDPT_HienVat').val(banDich_vi.moTa);


            $('#modalAddDaPhuongTien_HienVat').modal('show');
        });
        $('#dataGridDaPhuongTien_HienVat tbody').on('click', '.delete-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGridDaPhuongTien_HienVat').DataTable().row(id).data();

            $('#idDelete').val(data.daPhuongTienID);
            $('#nameDelete').text(`${data.tieuDe}`);
            $('#idTypeDelete').val(1);

            $('#modalDelete').modal('show');
        });

        //$('#dataGridDaPhuongTien_HienVat tbody').on('click', '.detail-command-btn', function () {
        //    var id = $(this).attr("ID").match(/\d+/)[0];
        //    var data = $('#dataGrid').DataTable().row(id).data();

        //    $('#linhVucChuyenSauDetail').text(data.tenLinhVucChuyenSau || "");
        //    $('#tanSuatDetail').text(data.tenTanSuat || "");
        //    //$('#thuTuDetail').text(data.thuTu);
        //    $('#trangThaiDetail').text(data.trangThai == true ? "Đã phát hành" : "Chưa phát hành");

        //    $('#ngonNguDetail').text(data.tenNgonNgu || "");
        //    $('#tenAnPhamDetail').text(data.tenAnPham || "");
        //    $('#doiTuongDocGiaDetail').text(data.doiTuongDocGia || "");

        //    // Thông tin audit
        //    $('#ngayTaoDetail').text(formatDateTime(data.ngayCapNhat));
        //    $('#nguoiTaoDetail').text(data.tenNguoiCapNhat || "");
        //    $('#ngayCapNhatDetail').text(formatDateTime(data.ngayHieuChinh));
        //    $('#nguoiCapNhatDetail').text(data.tenNguoiHieuChinh || "");

        //    $('#modalDetail').modal('show');
        //});

    }

    $('#btnSaveDPT').on('click', function () {
        let id = $('#idDPT_HienVat').val();
        if (!checkEmptyBlank(id) && !id.startsWith("temp")) {
            dataAddDaPhuongTien();
        } else {
            dataAddDPT_HienVat_Temp();
        }
    });

    async function dataAddDPT_HienVat_Temp() {
        let hienVatId = $('#hienVatID').val() || null;
        let daPhuongTienID = $('#idDPT_HienVat').val();
        let loaiMedia = $("input[name='loaiMediaDPT_HienVat']:checked").val();
        let fileDPT = $("#fileDPT_HienVat")[0].files[0] || null;
        let tacGia = $("#tacGiaDPT_HienVat").val();
        let thuTu = $("#thuTuDPT_HienVat").val();
        let trangThai = $("input[name='trangThaiDPT_HienVat']:checked").val();
        let duongDanFile = $("#duongDanFileDPT_HienVat").val();

        if (!fileDPT && checkEmptyBlank(duongDanFile)) {
            showNotification(0, 'Vui lòng nhập đầy đủ thông tin bắt buộc (*), bắt buộc có bản dịch tiếng Việt')
            return;
        }


        // Nếu chưa có ID thì tạo ID tạm
        if (checkEmptyBlank(daPhuongTienID)) {
            daPhuongTienID = generateTempID();
            $('#idDPT_HienVat').val(daPhuongTienID)
        }

        // Đóng gói object tạm
        let thongTinChung = {
            daPhuongTienID: daPhuongTienID,
            doiTuongSoHuuID: hienVatId,
            loaiMedia: Number(loaiMedia),
            loaiDoiTuong: "VH_HienVat",
            duongDanFile: duongDanFile || fileDPT.name,
            tacGia: tacGia,
            thuTuHienThi: thuTu || 1,
            suDung: trangThai == "1",

            //Thông tin hiển thị ở bảng
            stt: dataDPT_HienVat.length + 1,
            tieuDe: daPhuongTientranslations_HienVat.find(t => t.maNgonNgu === 'vi')?.tieuDe || '',
            moTa: daPhuongTientranslations_HienVat.find(t => t.maNgonNgu === 'vi')?.moTa || ''
        };

        let dataItem = {
            DaPhuongTien: thongTinChung,
            DaPhuongTien_NoiDung: [...daPhuongTientranslations_HienVat], // clone mảng dịch
            File: fileDPT || null
        };

        // Nếu ID tồn tại thì cập nhật, không thì thêm mới
        let index = dataDPT_HienVat.findIndex(d => d.DaPhuongTien.daPhuongTienID === daPhuongTienID);
        if (index > -1) {
            dataDPT_HienVat[index] = dataItem;
        } else {
            dataDPT_HienVat.push(dataItem);
        }

        // Cập nhật lại bảng chỉ cho 1 dòng
        let dt = $('#dataGridDaPhuongTien_HienVat').DataTable();
        let row = dt.rows((idx, data) => data.daPhuongTienID === daPhuongTienID);

        if (row.any()) {
            // Nếu tồn tại thì update dòng
            row.data(thongTinChung).draw(false);
        } else {
            // Nếu chưa có thì thêm mới
            dt.row.add(thongTinChung).draw(false);
        }

        console.log("dataDPT_HienVat hiện tại:", dataDPT_HienVat);
        $('#modalAddDaPhuongTien_HienVat').modal('hide');
    }

    HienVat.dataAddDPT_HienVat = async function (hienVatID) {
        if (dataDPT_HienVat.length === 0) return;

        for (let item of dataDPT_HienVat) {
            item.DaPhuongTien.doiTuongSoHuuID = hienVatID;

            if (!item.DaPhuongTien.daPhuongTienID || item.DaPhuongTien.daPhuongTienID.toString().startsWith("temp")) {
                item.DaPhuongTien.daPhuongTienID = guidEmpty;
            }

            let formData = new FormData();
            formData.append("DaPhuongTien", JSON.stringify(item.DaPhuongTien));
            formData.append("DaPhuongTien_NoiDung", JSON.stringify(item.DaPhuongTien_NoiDung));

            if (item.File) {
                formData.append("File", item.File);
            }

            try {
                let res;
                if (item.DaPhuongTien.daPhuongTienID == guidEmpty) {
                    // POST
                 
                    res = await fetch('/api/DaPhuongTienApi/ThemMoi', {
                        method: 'POST',
                        body: formData
                    });
                } else {
                    // PUT
                    res = await fetch(`/api/DaPhuongTienApi/ChinhSua/${item.DaPhuongTien.daPhuongTienID}`, {
                        method: 'PUT',
                        body: formData
                    });
                }

                if (!res.ok) {
                    console.warn("Lỗi khi lưu:", await res.text());
                    continue;
                }

                let data = await res.json();
                if (data && data.isSuccess) {
                    console.log("Lưu thành công:", data.value);
                    $('#dataGridDaPhuongTien_HienVat').DataTable().ajax.reload();
                } else {
                    console.warn("Lỗi khi lưu:", data.error);
                }
            } catch (err) {
                console.error("Exception:", err.message);
            }
        }
    }

    HienVat.dataDeleteDPT_HienVat_Temp = function () {
        let id = $('#idDelete').val();
        if (!id) return;

        // Xoá khỏi mảng tạm
        if (id.startsWith("temp")) {
            dataDPT_HienVat = dataDPT_HienVat.filter(d => d.daPhuongTienID !== id);
            $('#dataGridDaPhuongTien_HienVat').DataTable()
                .clear()
                .rows.add(dataDPT_HienVat)
                .draw();
        } else { // Xoá khỏi DB
            dataDeleteDaPhuongTien(id);
        }

        $('#modalDelete').modal('hide');
    }

    async function dataDeleteDaPhuongTien(id) {
        try {
            const res = await fetch(`/api/DaPhuongTienApi/Xoa/${id}`, {
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
                $('#dataGridDaPhuongTien_HienVat').DataTable().ajax.reload()
            } else {
                console.log(data.error)
            }
        }
        catch (err) {
            showNotification(0, err.message)
        }
    }

    async function dataAddDaPhuongTien() {
        let daPhuongTienID = $('#idDPT_HienVat').val() || guidEmpty
        let loaiMedia = $("input[name='loaiMediaDPT_HienVat']:checked").val();
        let fileDPT = $("#fileDPT_HienVat")[0].files[0] || null;
        let tacGia = $("#tacGiaDPT_HienVat").val();
        let thuTu = $("#thuTuDPT_HienVat").val();
        let trangThai = $("input[name='trangThaiDPT_HienVat']:checked").val();
        let duongDanFile = $("#duongDanFileDPT_HienVat").val();

        if (!fileDPT && checkEmptyBlank(duongDanFile)) {
            showNotification(0, 'Vui lòng nhập đầy đủ thông tin bắt buộc (*), bắt buộc có bản dịch tiếng Việt')
            return;
        }


        let thongTinChung = {
            DaPhuongTienID: daPhuongTienID,
            DoiTuongSoHuuID: $('#hienVatID').val(),
            LoaiMedia: Number(loaiMedia),
            LoaiDoiTuong: "VH_HienVat",
            DuongDanFile: duongDanFile,
            TacGia: tacGia,
            ThuTuHienThi: thuTu || 1,
            SuDung: trangThai == "1" ? true : false
        };

        let formData = new FormData();
        formData.append("DaPhuongTien", JSON.stringify(thongTinChung));
        formData.append("DaPhuongTien_NoiDung", JSON.stringify(daPhuongTientranslations_HienVat));

        if (fileDPT) {
            formData.append("File", fileDPT);
        }

        if (daPhuongTienID === guidEmpty) {
            try {
                const res = await fetch('/api/DaPhuongTienApi/ThemMoi', {
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
                    daPhuongTientranslations_HienVat = []
                    $('#dataGridDaPhuongTien_HienVat').DataTable().ajax.reload();
                    $('#modalAddDaPhuongTien_HienVat').modal('hide');
                } else {
                    showNotification(0, data.error)
                }
            }
            catch (err) {
                console.log(err.message)
            }
        } else {
            try {
                const res = await fetch(`/api/DaPhuongTienApi/ChinhSua/${daPhuongTienID}`, {
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
                    daPhuongTientranslations_HienVat = []

                    $('#dataGridDaPhuongTien_HienVat').DataTable().ajax.reload();
                    $('#modalAddDaPhuongTien_HienVat').modal('hide');
                } else {
                    showNotification(0, data.error)
                }
            }
            catch (err) {
                console.log(err.message)
            }
        }
    }
    // reset modal
    $("#modalAddDaPhuongTien_HienVat").on('hidden.bs.modal', function () {
        daPhuongTientranslations_HienVat = []
        $(this).find('input[type=text], input[type=file], textarea').val('');
        $(this).find('input[type=number]').val('1');
        $(this).find('select').val('vi').trigger('change');
        $(this).find('input[type=radio][value=1], input[type=checkbox][value=1]').prop('checked', true);
        $(this).find('img').attr('src', '/assets/images/vector/addImage.png');
    });
    //#endregion ĐA PHƯƠNG TIỆN


    HienVat.dataDeleteHienVat =  async function() {
        let id = $('#idDelete').val();

        try {
            const res = await fetch(`/api/HienVatApi/Xoa/${id}`, {
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
                $('#dataGridHienVat').DataTable().ajax.reload();
            } else {
                console.log(data.error)
            }

        }
        catch (err) {
            showNotification(0, err.message)
        }
    }

    //#region FORM HANDLERS
    window.HienVat = window.HienVat || {};

    HienVat.toggleForm = function (isShow) {
        if (isShow) {
            // Hiện form thêm/sửa hiện vật
            $("#formHienVat").show();
            $("#danhSachHienVat").hide();

            $("#baoTangID_HienVat").val(coQuanId).trigger("change");
        } else {
            const $form = $("#formInputs_HienVat"); // chỉ reset vùng inputs
            $form.find('input[type=text], input[type=number], textarea').val('');
            $form.find('select').val('').trigger('change');
            $form.find('input[type=radio][value=1], input[type=checkbox][value=1]').prop('checked', true);

            // Reset file + preview
            $("#showFileEdit").text('');
            $("#fileDPT").val(null);

            $("#formHienVat").hide();
            $("#danhSachHienVat").show();
        }
    };

    // Gán sự kiện
    $("#btnShowFormHienVat").on("click", function () {
        HienVat.toggleForm(true);
    });
    function generateTempID() {
        return 'temp-' + Math.floor(100000 + Math.random() * 900000); 
    }
    //#endregion FORM HANDLERS

    //#region HÀM LOAD DỮ LIỆU CHO CÁC COMBOBOX
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
                data.value.forEach(lang => {
                    $("#ngonNgu_HienVat").append(`<option value="${lang.maNgonNgu?.toLowerCase()}">${lang.tenNgonNgu}</option>`);
                    $("#ngonNguDPT_HienVat").append(`<option value="${lang.maNgonNgu?.toLowerCase()}">${lang.tenNgonNgu}</option>`);
                });
                $("#ngonNgu_HienVat").val('vi').trigger('change');
                $("#ngonNguDPT_HienVat").val('vi').trigger('change');
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            showNotification(0, err.message)
        }
    };

    async function initChatLieu() {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: 35,
                    tuKhoa: null
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value) {
                data.value.forEach(el => {
                    $("#chatLieuID_HienVat").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
                });
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };

    async function initBaoTang() {
        try {
            const res = await fetch('/api/ToChucApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiToChucID: 95
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();


            if (data && data.isSuccess && data.value) {
                data.value.forEach(el => {
                    $("#baoTangID_HienVat").append(`<option value="${el.toChucID}">${el.tenToChuc}</option>`);
                });
                $("#baoTangID_HienVat").val(coQuanId).trigger("change");
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };

    async function initLoaiHienVat() {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: 45,
                    tuKhoa: null
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value) {
                data.value.forEach(el => {
                    $("#loaiHienVatID_HienVat").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
                });
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };
   
    //#endregion HÀM LOAD DỮ LIỆU CHO CÁC COMBOBOX
    
})