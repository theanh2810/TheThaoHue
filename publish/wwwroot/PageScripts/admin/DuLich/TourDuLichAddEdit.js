const baseUrl = getRootLink();
const allowedExtensions = {
    1: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"],    // Ảnh
    2: [".mp4", ".webm", ".ogg", ".mov", ".avi"],             // Video
    3: [".mp3", ".wav", ".m4a"],                              // Audio
    4: [".doc", ".docx", ".pdf", ".xlsx", ".xls", ".dot"]     // File
};
const guidEmpty = "00000000-0000-0000-0000-000000000000";
let lichTrinhTranslations = [];
$(document).ready(function () {
    initSelect2();
    initDatePicker();
    previewPicture_WithSelector('anhDaiDien', 'previewAnhDaiDien')

    let dataDiaDiem = []
    let ckeGoiY = CKEDITOR.replace('goiY');
    let ckeTraiNghiem = CKEDITOR.replace('traiNghiem');
    let ckeMoTa = CKEDITOR.replace('moTa');

    let tourDuLichTranslations = [];
   
    let daPhuongTientranslations = [];
    let diaDiemTranslations = [];

    ; (async function () {
        await Promise.all([
            initNgonNgu(),
            initSelectDanhMuc(81, "loaiHinhID"),
            initSelectDanhMuc(82, "phuongTienID"),
            initSelectDanhMuc(80, "phanKhucID"),
            initSelectDanhMuc(83, "theLoaiID"),
            initToChuc(),
            initLinhVuc(),
            initDiaDiem(),
            initTinhThanhPho()
        ]);
        initThongTinChung();
        if (!checkEmptyBlank(tourID)) {
            await Promise.all([
                initDiaDiemDuLich(),
                initDiaDiemVanHoa(),
                initDiaDiemTheThao(),
            ]);
            loadDataDiaDiem()

            initTableLichTrinh(tourID)
            initTableDaPhuongTien(tourID)

          
        }
        reloadAccess()
    })();

    $("#formDelete").on("submit", function (e) {
        e.preventDefault();
        let type = $('#idTypeDelete').val();
        if (type == "lichtrinh") {
            dataDeleteLichTrinh();
        } else if (type == "daphuongtien") {
            dataDeleteDaPhuongTien();
        }
    });

    //#region THÔNG TIN CHUNG

    async function initThongTinChung() {
        if (checkEmptyBlank(tourID)) {
            return;
        }

        try {
            const res = await fetch(`/api/TourDuLichApi/ChiTiet/${tourID}`, {
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
                $("#previewAnhDaiDien").attr("src", data.value.anhDaiDien || "/images/no-image.png");
                $("#urlAnhDaiDien").val(data.value.anhDaiDien || "");
                // Các select
                $("#loaiHinhID").val(data.value.loaiHinhID || "").trigger("change");
                $("#theLoaiID").val(data.value.theLoaiID || "").trigger("change");
                $("#toChucID").val(data.value.toChucID || "").trigger("change");
                $("#phuongTienID").val(data.value.phuongTienID || "").trigger("change");
                $("#phanKhucID").val(data.value.phanKhucID || "").trigger("change");
                $("#diemDiID").val(data.value.diemDiID || "").trigger("change");
                $("#diemDenID").val(data.value.diemDenID || "").trigger("change");

                // Các input text / number
                $("#maDinhDanh").val(data.value.maDinhDanh || "");
                $("#giaTour").val(data.value.giaTour || "");
                $("#giaNguoi").val(data.value.giaNguoi || "");
                $("#soKhachToiThieu").val(data.value.soKhachToiThieu || "");
                $("#soKhachToiDa").val(data.value.soKhachToiDa || "");
                $("#thuTu").val(data.value.thuTu || 1);
                $("#ngayKhoiHanh").val(formatShortDate(data.value.ngayKhoiHanh));
                $("#ngayKetThuc").val(formatShortDate(data.value.ngayKetThuc));

                if (data.value.suDung === true || data.value.suDung === 1) {
                    $("#suDungCo").prop("checked", true);
                } else {
                    $("#suDungKhong").prop("checked", true);
                }

                // Bản dịch
                tourDuLichTranslations = data.value.banDich || [];
                let tiengViet = tourDuLichTranslations.find(t => t.maNgonNgu === 'vi') || {};
                if (tiengViet) {
                    $(".TieuDe #pageTitle").text(`Chỉnh sửa tour du lịch ${tiengViet.tenTour}`);
                }

                $("#ngonNgu").val("vi").trigger("change");
                console.log(ckeGoiY.getData(), ckeGoiY.getData().length)

            } else {
                showNotification(0, data.error);
            }
        }
        catch (err) {
            showNotification(0, err.message)
        }
    }

    function saveTempTourDuLichTranslation() {
        let maNgonNgu = $("#ngonNgu").val();
        let tenTour = $("#tenTour").val().trim();
        let thoiGian = $("#thoiGian").val().trim();
        let moTa = ckeMoTa.getData();
        let traiNghiem = ckeTraiNghiem.getData();
        let goiY = ckeGoiY.getData();

        if (!maNgonNgu) return; // phải chọn ngôn ngữ

        // tìm index ngôn ngữ trong mảng
        let index = tourDuLichTranslations.findIndex(t => t.maNgonNgu === maNgonNgu);

        if (!tenTour && !thoiGian && !moTa && !traiNghiem && !goiY) {
            // Nếu tất cả đều trống → xóa bản dịch
            if (index !== -1) {
                tourDuLichTranslations.splice(index, 1);
            }
        } else {
            if (index !== -1) {
                // cập nhật bản dịch đã có
                tourDuLichTranslations[index].tenTour = tenTour;
                tourDuLichTranslations[index].thoiGian = thoiGian;
                tourDuLichTranslations[index].moTa = moTa;
                tourDuLichTranslations[index].traiNghiem = traiNghiem;
                tourDuLichTranslations[index].goiY = goiY;
            } else {
                // thêm mới
                tourDuLichTranslations.push({
                    maNgonNgu: maNgonNgu,
                    tenTour: tenTour,
                    thoiGian: thoiGian,
                    moTa: moTa,
                    traiNghiem: traiNghiem,
                    goiY: goiY
                });
            }
        }
    }
    $(document).ready(function () {
        // Sự kiện blur trên input/textarea → tự động lưu
        $("#tenTour, #thoiGian").on("blur", function () {
            saveTempTourDuLichTranslation();
        });

        ckeGoiY.on("change", function () {
            saveTempTourDuLichTranslation()
        })

        ckeTraiNghiem.on("change", function () {
            saveTempTourDuLichTranslation()
        })

        ckeMoTa.on("change", function () {
            const html = this.getData();
            let text = htmlDecode(html);
            console.log(text, text.length)

            //if (text.length > 2000) {
            //    if (!isOverLimit) {
            //        isOverLimit = true;
            //        // Cắt bớt nội dung về đúng MAX_CHARS
            //        this.execCommand('undo'); // quay lại trạng thái trước đó (rất mượt)
            //    }
            //} else {
            //    isOverLimit = false;
            //}

            //// Lưu tạm nếu chưa vượt
            //if (!isOverLimit) {
            //    saveTempTourDuLichTranslation();
            //}
        })
        // Sự kiện đổi ngôn ngữ → bind lại dữ liệu đã lưu
        $("#ngonNgu").on("change", function () {
            let maNgonNgu = $(this).val();
            let exist = tourDuLichTranslations.find(t => t.maNgonNgu === maNgonNgu);

            if (exist) {
                $("#tenTour").val(exist.tenTour);
                $("#thoiGian").val(exist.thoiGian);
                ckeGoiY.setData(exist.goiY);
                ckeTraiNghiem.setData(exist.traiNghiem);
                ckeMoTa.setData(exist.moTa);
            } else {
                // reset nếu chưa có dữ liệu
                $("#tenTour").val("");
                $("#thoiGian").val("");
                ckeGoiY.setData("");
                ckeTraiNghiem.setData("");
                ckeMoTa.setData("");
            }
        });

    })


    $("#btn-save").on("click", async function (e) {
        saveTempTourDuLichTranslation();
        tourDuLichTranslations = tourDuLichTranslations.filter(t => t.tenTour && t.tenTour.trim() !== "");
        if ($("#thong-tin-chung").hasClass("active")) {
            await dataAddThongTinChung();
        }
        e.preventDefault();
    });
    $("#btn-save-and-close").on("click", async function (e) {
        saveTempTourDuLichTranslation();
        tourDuLichTranslations = tourDuLichTranslations.filter(t => t.tenTour && t.tenTour.trim() !== "");
        dataAddThongTinChung(true);
        e.preventDefault();
    });

    async function dataAddThongTinChung(isReturn) {
        // Lấy file ảnh và url (nếu có)
        let anhDaiDien = $('#anhDaiDien')[0]?.files[0] || null;
        let urlAnhDaiDien = $('#urlAnhDaiDien').val() || null;

        // Lấy dữ liệu từ input/select
        let maDinhDanh = $('#maDinhDanh').val()?.trim() || null;
        let loaiHinhID = $('#loaiHinhID').val() || null;
        let theLoaiID = $('#theLoaiID').val() || null;
        let toChucID = $('#toChucID').val() || null;
        let phuongTienID = $('#phuongTienID').val() || null;
        let phanKhucID = $('#phanKhucID').val() || null;
        let diemDiID = $('#diemDiID').val() || null;
        let diemDenID = $('#diemDenID').val() || null;

        let giaTour = $('#giaTour').val()?.trim() || null;
        let giaNguoi = $('#giaNguoi').val()?.trim() || null;
        let soKhachToiThieu = $('#soKhachToiThieu').val()?.trim() || null;
        let soKhachToiDa = $('#soKhachToiDa').val()?.trim() || null;
        let ngayKhoiHanh = $('#ngayKhoiHanh').val()?.trim() || null;
        let ngayKetThuc = $('#ngayKetThuc').val()?.trim() || null;

        let thuTu = $('#thuTu').val() || 1;
        let trangThai = $("input[name='suDung']:checked").val();

        // Lấy bản dịch tiếng Việt (bắt buộc phải có)
        let tenTiengViet = tourDuLichTranslations.find(el => el.maNgonNgu === 'vi')?.tenTour || null;

        // Validate các trường bắt buộc
        if ((anhDaiDien == null && checkEmptyBlank(urlAnhDaiDien)) || !tenTiengViet || checkEmptyBlank(loaiHinhID) || checkEmptyBlank(toChucID)) {
            showNotification(0, 'Vui lòng nhập đầy đủ thông tin bắt buộc (*), bao gồm bản dịch tiếng Việt');
            return null;
        }

        // Tạo object TourDuLich
        let tourDuLich = {
            TourID: tourID || null,
            MaDinhDanh: maDinhDanh,
            LoaiHinhID: loaiHinhID,
            TheLoaiID: theLoaiID,
            ToChucID: toChucID,
            PhuongTienID: phuongTienID,
            PhanKhucID: phanKhucID,
            DiemDiID: diemDiID,
            DiemDenID: diemDenID,
            GiaTour: giaTour ? Number(giaTour) : null,
            GiaNguoi: giaNguoi ? Number(giaNguoi) : null,
            SoKhachToiThieu: soKhachToiThieu ? Number(soKhachToiThieu) : null,
            SoKhachToiDa: soKhachToiDa ? Number(soKhachToiDa) : null,
            NgayKhoiHanh: formatDateToSearch(ngayKhoiHanh),
            NgayKetThuc: formatDateToSearch(ngayKetThuc),
            ThuTu: thuTu != "" ? Number(thuTu) : 1,
            SuDung: trangThai == '1' ? true : false,
            AnhDaiDien: urlAnhDaiDien
        };

        // Chuẩn bị formData để gửi lên server
        let formData = new FormData();
        formData.append("TourDuLich", JSON.stringify(tourDuLich));
        formData.append("TourDuLich_NoiDung", JSON.stringify(tourDuLichTranslations)); // mảng bản dịch
        if (anhDaiDien) {
            formData.append("AnhDaiDien", anhDaiDien);
        }

        // Gọi API thêm mới hoặc chỉnh sửa
        try {
            const apiUrl = checkEmptyBlank(tourID)
                ? '/api/TourDuLichApi/ThemMoi'
                : `/api/TourDuLichApi/ChinhSua/${tourID}`;
            const method = checkEmptyBlank(tourID) ? 'POST' : 'PUT';

            const res = await fetch(apiUrl, { method, body: formData });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();

            if (data && data.isSuccess && data.value) {
                showNotification(1, checkEmptyBlank(tourID) ? 'Thêm mới thành công' : 'Chỉnh sửa thành công');

                if (isReturn) {
                    setTimeout(() => window.location.href = '/AdminTool/TourDuLich', 2000);
                } else {
                    tourID = data.value.tourID;
                    initThongTinChung();
                    $("#anhDaiDien").val(null);
                    initTableLichTrinh(tourID);
                    initTableDaPhuongTien(tourID);
                    reloadAccess();
                }
            } else {
                showNotification(0, data.error);
            }
        }
        catch (err) {
            console.log(err.message);
        }
    }
    //#endregion THÔNG TIN CHUNG

    //#region LỊCH TRÌNH
    function initTableLichTrinh(id) {
        const tableApi = {
            url: `${baseUrl}/api/TourDuLichApi/LichTrinh/DanhSach`,
            type: "POST",
            data: function (d) {
                return JSON.stringify({
                    TourID: id,
                    maNgonNgu: 'vi'
                });
            },
            contentType: 'application/json; charset=utf-8',
            dataSrc: function (data) {
                if (data && data.isSuccess && data.value.length > 0) {
                    data.value.forEach((item, index) => {
                        item.stt = index + 1;
                        item.tenDiaDiem = dataDiaDiem.find(el => el.id == item.diaDiemID)?.text || '';
                    });
                    return data.value;
                }
                return [];
            },
        };

        const tableDefs = [
            {
                targets: 0,
                render: function (data, type, row, meta) {
                    return parseInt(meta.row) + 1;
                }
            },
            {
                targets: 3,
                render: function (data, type, row, meta) {
                    let time = formatDateTime(data);
                    return time
                }
            },
            {
                targets: 5,
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
                targets: 6,
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
            { data: null, width: "40px", class: "center-align" },
            { data: "hoatDong", class: "left-align" },
            { data: "tenDiaDiem", width: "350px", class: "center-align" },
            { data: "thoiDiem", width: "350px", class: "center-align" },
            { data: "thuTu", width: "120px", class: "center-align" },
            { data: "suDung", width: "120px", class: "center-align" },
            { data: null, width: "120px", class: "center-align group-icon-action" }
        ];

        initDataTableConfigNoSearch('dataGridLichTrinh', tableApi, tableDefs, tableCols);

        $('#dataGridLichTrinh tbody').on('click', '.edit-command-btn', async function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGridLichTrinh').DataTable().row(id).data();
            $('#idLichTrinh').val(data.lichTrinhID);
            $("#modalTitleLT").text(`Chỉnh sửa lịch trình`);
            loadDataDiaDiem()
            // Các input text
            $("#diaDiemLichTrinh").val(data.diaDiemID).trigger('change');
            $("#thoiDiemLichTrinh").val(formatDateTime(data.thoiDiem));
            $("#thuTuLichTrinh").val(data.thuTu);

            // Radio trạng thái
            $(`input[name='suDung_LichTrinh'][value='${data.suDung == true ? "1" : "0"}'`).prop('checked', true);

            lichTrinhTranslations = data.banDich || [];
            $('#ngonNguLichTrinh').val('vi').trigger('change');

            $('#modalAddLichTrinh').modal('show');
        });

        $('#dataGridLichTrinh tbody').on('click', '.delete-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGridLichTrinh').DataTable().row(id).data();

            $('#idDelete').val(data.lichTrinhID);
            $('#nameDelete').text(``);
            $('#idTypeDelete').val('lichtrinh');
            $('#modalDelete').modal('show');
        });

    }
    $('#linhVucLichTrinh').on('change', function () {
        loadDataDiaDiem($(this).val());
    });

    $(document).off("focusout", "#hoatDongLichTrinh, #soGioLichTrinh")
           .on("focusout", "#hoatDongLichTrinh, #soGioLichTrinh", function () {
      saveTempTranslationLichTrinh();
    });

    // Sự kiện đổi ngôn ngữ → bind lại dữ liệu đã lưu
    $("#ngonNguLichTrinh").on("change", function () {
        let maNgonNgu = $(this).val();
        let exist = lichTrinhTranslations.find(t => t.maNgonNgu === maNgonNgu);

        if (exist) {
            $("#hoatDongLichTrinh").val(exist.hoatDong);
            $("#soGioLichTrinh").val(exist.soGio);
        } else {
            // reset nếu chưa có dữ liệu
            $("#hoatDongLichTrinh").val("");
            $("#soGioLichTrinh").val("");
        }
    });
   
    $('#btnSaveLichTrinh').on('click', function () {
        lichTrinhTranslations = lichTrinhTranslations.filter(t => t.hoatDong && t.hoatDong.trim() !== "");
        dataAddLichTrinh();
    });

    async function dataAddLichTrinh() {
        if (tourID == null || tourID == guidEmpty) {
            return;
        }
        let lichTrinhID = $('#idLichTrinh').val() || null;
        let diaDiemID = $('#diaDiemLichTrinh').val() || null;
        let thoiDiem = $("#thoiDiemLichTrinh").val();
        let thuTu = $("#thuTuLichTrinh").val();
        let suDung = $("input[name='suDung_LichTrinh']:checked").val();

   
        let thongTinChung = {
            LichTrinhID: lichTrinhID,
            TourID: tourID,
            DiaDiemID: diaDiemID,
            ThoiDiem: formatDateToSaveAsStringV2(thoiDiem),
            ThuTu: thuTu || 1,
            SuDung: suDung == "1" ? true : false
        };

        let formData = new FormData();
        formData.append("TourDuLich_LichTrinh", JSON.stringify(thongTinChung));
        formData.append("TourDuLich_LichTrinh_NoiDung", JSON.stringify(lichTrinhTranslations));

        try {
            const isNew = checkEmptyBlank(lichTrinhID);
            const url = isNew
                ? '/api/TourDuLichApi/LichTrinh/ThemMoi'
                : `/api/TourDuLichApi/LichTrinh/ChinhSua/${lichTrinhID}`;
            const method = isNew ? 'POST' : 'PUT';

            const res = await fetch(url, { method, body: formData });

            if (!res.ok) throw new Error(await res.text());

            const data = await res.json();

            if (data?.isSuccess && data?.value) {
                showNotification(1, isNew ? 'Thêm mới thành công' : 'Chỉnh sửa thành công');
                lichTrinhTranslations = [];
                $('#dataGridLichTrinh').DataTable().ajax.reload();
                $('#modalAddLichTrinh').modal('hide');
            } else {
                console.log(data?.error || 'Có lỗi xảy ra');
            }
        } catch (err) {
            console.log(err.message);
        }
    }

    async function dataDeleteLichTrinh() {
        let id = $('#idDelete').val();
        try {
            const res = await fetch(`/api/TourDuLichApi/LichTrinh/Xoa/${tourID}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }

            let data = await res.json();

            if (data && data.isSuccess && data.value) {
                showNotification(1, 'Xoá thành công')
                $('#modalDelete').modal('hide');
                $('#dataGridLichTrinh').DataTable().ajax.reload();
            } else {
                console.log(data.error)
            }
        }
        catch (err) {
            showNotification(0, err.message)
        }
    }
    $("#modalAddLichTrinh").on('hidden.bs.modal', function () {
        lichTrinhTranslations = []
        $(this).find('input[type=text], input[type=file], textarea').val('');
        $(this).find('select').val('vi').trigger('change');
        $(this).find('input[type=radio][value=1], input[type=checkbox][value=1]').prop('checked', true).trigger('change');
        $("#thuTuLichTrinh").val('1');
        $("#modalTitleLT").text('Thêm mới lịch trình');
    });
    //#endregion LỊCH TRÌNH

    //#region ĐA PHƯƠNG TIỆN

    function saveTempTranslationDPT() {
        let maNgonNgu = $("#ngonNguDPT").val();
        let tieuDe = $("#tieuDeDPT").val().trim();
        let moTa = $("#moTaDPT").val().trim();

        if (!maNgonNgu) return; // bắt buộc chọn ngôn ngữ và nhập tên

        // Kiểm tra ngôn ngữ đã tồn tại trong mảng chưa
        let index = daPhuongTientranslations.findIndex(t => t.maNgonNgu === maNgonNgu);
        if (tieuDe === "" && moTa === "") {
            // Nếu trống cả tiêu đề và mô tả -> xóa bản dịch khỏi mảng
            if (index !== -1) {
                daPhuongTientranslations.splice(index, 1);
            }
        } else {
            if (index !== -1) {
                daPhuongTientranslations[index].tieuDe = tieuDe;
                daPhuongTientranslations[index].moTa = moTa;
            } else {
                daPhuongTientranslations.push({
                    maNgonNgu: maNgonNgu,
                    tieuDe: tieuDe,
                    moTa: moTa
                });
            }
        }
    }

    // Sự kiện blur trên input/textarea → tự động lưu
    $(".DaNgu").find("input, textarea, select").off("blur").on("blur", saveTempTranslationDPT);

    // Sự kiện đổi ngôn ngữ → bind lại dữ liệu đã lưu
    $("#ngonNguDPT").on("change", function () {
        let maNgonNgu = $(this).val();
        let exist = daPhuongTientranslations.find(t => t.maNgonNgu === maNgonNgu);

        if (exist) {
            $("#tieuDeDPT").val(exist.tieuDe);
            $("#moTaDPT").val(exist.moTa);
        } else {
            // reset nếu chưa có dữ liệu
            $("#tieuDeDPT").val("");
            $("#moTaDPT").val("");
        }
    });

    $("input[name='loaiMediaDPT']").on("change", function () {
        const loaiMedia = $(this).val();
        $("#fileDPT").val(null).attr("accept", (allowedExtensions[loaiMedia] || "").join(","));

        if (loaiMedia === "1") {
            // Hình ảnh
            $("#fileLabel").html('Hình ảnh <span class="text-danger">*</span>');
            $("#showhinhAnhDPT").removeClass("d-none");
            $("#fileDPT").addClass("d-none");
            $("#fileNamePreviewDPT").addClass("d-none");

            // Nếu chưa có src hoặc src rỗng thì set mặc định addImage
            const currentSrc = $("#showhinhAnhDPT").attr("src");
            if (!currentSrc || currentSrc.trim() === "" || currentSrc.includes("no-image.png")) {
                $("#showhinhAnhDPT").attr("src", "/assets/images/vector/addImage.png");
            }
        } else {
            // Các loại khác
            $("#fileLabel").text("Tệp đã chọn");
            $("#showhinhAnhDPT").addClass("d-none");
            $("#fileDPT").removeClass("d-none");
            $("#fileNamePreviewDPT").removeClass("d-none");
        }
    });

    $("#fileDPT").on("change", function () {
        const loaiMedia = $("input[name='loaiMediaDPT']:checked").val();
        const file = this.files[0];
        if (!file) return;

        if (loaiMedia === "1") {
            // Preview ảnh
            const reader = new FileReader();
            reader.onload = e => $("#showhinhAnhDPT").attr("src", e.target.result);
            reader.readAsDataURL(file);
        } else {
            // Hiện tên file
            $("#fileNamePreview").text(file.name);
        }
    });

    // Khởi tạo theo radio được chọn mặc định
    const loaiInit = $("input[name='loaiMediaDPT']:checked").val();
    $("#fileDPT").attr("accept", (allowedExtensions[loaiInit] || "").join(","));

    async function initTableDaPhuongTien(id) {
        const tableApi = {
            url: `${baseUrl}/api/DaPhuongTienApi/DanhSach`,
            type: "POST",
            data: function (d) {
                return JSON.stringify({
                    DoiTuongSoHuuID: id || guidEmpty,
                    maNgonNgu: 'vi'
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
                    let tenFile = data ? data.split('/').pop() : '';
                    return `<div class="group-info have-image detail-command-btn" id=n-"${meta.row}">
                    <div class="have-image">
                        <img src="${row.duongDanFile || '/assets/images/vector/no-image.png'}" alt="${row.tenDaPhuongTien || ''}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                    </div>
                    <div class="group-info">
                    <div class="info-main"><div>${row.tieuDe || ''}</div></div>
                    <div class="info-sub">${row.tacGia || ''}</div></div>
                </div>`;
                }
            },
            {
                targets: 2,
                render: function (data, type, row, meta) {
                    if (row.loaiMedia == 1) {
                        return `Hình ảnh`;
                    } else if (row.loaiMedia == 2) {
                        return `Video`;
                    } else if (row.loaiMedia == 3) {
                        return `Audio`;
                    } else if (row.loaiMedia == 4) {
                        return `Tệp tài liệu`;
                    }
                    return ``;
                }
            },
            /* {
                targets: 6,
                render: function (data, type, row, meta) {
                    if (row.suDung) {
                        return `<i class="hgi-icon hgi-check"></i>`;
                    }
                    else {
                        return `<i class="hgi-icon hgi-cancel"></i>`;
                    }
                }
            }, */
            {
                targets: 4,
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
            { "data": "", "width": "", "class": "left-align" },
            { "data": "", "width": "15%", "class": "left-align" },
            { "data": "tacGia", "width": "15%", "class": "left-align" },
            { "data": "", "width": "120px", "class": "center-align group-icon-action" }
        ];

        initDataTableConfigNoSearch('dataGridDaPhuongTien', tableApi, tableDefs, tableCols);

        $('#dataGridDaPhuongTien tbody').on('click', '.edit-command-btn', async function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGridDaPhuongTien').DataTable().row(id).data();
            $('#idDPT').val(data.daPhuongTienID);

            $("#modalAddDaPhuongTienTitle").text(`Chỉnh sửa tài liệu truyền thông ${data.tieuDe}`);
            $("#typeDPT").val("dpt");
            // Các input text
            $("input[name='loaiMediaDPT'][value='" + data.loaiMedia + "']").prop("checked", true).trigger("change");

            if (data.duongDanFile) {
                $("#fileNamePreviewDPT").text(data.duongDanFile.split('/').pop());
                $("#duongDanFileDPT").val(data.duongDanFile);

                if (data.loaiMedia == "1") {
                    $("#showhinhAnhDPT").attr("src", data.duongDanFile);
                }
            } else {
                $("#fileNamePreviewDPT").text("");
                $("#duongDanFileDPT").val("");
            }

            $("#tacGiaDPT").val(data.tacGia);
            $("#thuTuDPT").val(data.thuTuHienThi);

            // Radio trạng thái
            $(`input[name='trangThaiAdd'][value='${data.suDung == true ? "1" : "0"}'`).prop('checked', true);

            daPhuongTientranslations = []
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
            let resultBanDich = await res.json();

            if (resultBanDich && resultBanDich.isSuccess && resultBanDich.value) {
                daPhuongTientranslations = resultBanDich.value
            } else {
                console.log(resultBanDich.error)
            }

            $('#ngonNguDPT').val('vi').trigger('change');

        
            $('#modalAddDaPhuongTien').modal('show');
        });
        $('#dataGridDaPhuongTien tbody').on('click', '.delete-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGridDaPhuongTien').DataTable().row(id).data();

            $('#idDelete').val(data.daPhuongTienID);
            $('#nameDelete').text(`${data.tieuDe}`);
            $('#idTypeDelete').val('daphuongtien');

            $('#modalDelete').modal('show');
        });

        //$('#dataGridDaPhuongTien tbody').on('click', '.detail-command-btn', function () {
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
    $("#btnAddDaPhuongTien").on('click', function () {
        $('#typeDPT').val("dpt");
        $('#modalAddDaPhuongTien').modal('show');
    })

    $('#btnSaveDaPhuongTien').on('click', function () {
        let type = $('#typeDPT').val();
        if (type == "dpt") {
            dataAddDaPhuongTien();
        }
    });

    async function dataAddDaPhuongTien() {
        if (tourID == null || tourID == guidEmpty) {
            showNotification(0, 'Vui lòng lưu thông tin di tích trước khi thêm đa phương tiện')
            return;
        }
        let daPhuongTienID = $('#idDPT').val() || guidEmpty
        let loaiMedia = $("input[name='loaiMediaDPT']:checked").val();
        let fileDPT = $("#fileDPT")[0].files[0] || null;
        let tacGia = $("#tacGiaDPT").val();
        let thuTu = $("#thuTuDPT").val();
        let trangThai = $("input[name='trangThaiDPT']:checked").val();
        let duongDanFile = $("#duongDanFileDPT").val();

        if (!fileDPT && checkEmptyBlank(duongDanFile)) {
            showNotification(0, 'Vui lòng nhập đầy đủ thông tin bắt buộc (*), bắt buộc có bản dịch tiếng Việt')
            return;
        }

        //Kiểm tra đúng loại file và extension
        if (fileDPT != null) {
            const fileExt = "." + fileDPT.name.split(".").pop().toLowerCase();
            // Kiểm tra file extension có khớp loại media không
            if (!allowedExtensions[loaiMedia] || !allowedExtensions[loaiMedia].includes(fileExt)) {
                showNotification(0, "Tệp không hợp lệ với loại media đã chọn!");
                return; // Dừng luôn, không xử lý tiếp
            }
        }

        //Kiểm tra đúng loại file và extension
        if (!checkEmptyBlank(duongDanFile) && fileDPT == null) {
            const fileExt = "." + duongDanFile.split(".").pop().toLowerCase();
            // Kiểm tra file extension có khớp loại media không
            if (!allowedExtensions[loaiMedia] || !allowedExtensions[loaiMedia].includes(fileExt)) {
                showNotification(0, "Tệp không hợp lệ với loại media đã chọn!");
                return; // Dừng luôn, không xử lý tiếp
            }
        }

        let thongTinChung = {
            DaPhuongTienID: daPhuongTienID,
            DoiTuongSoHuuID: tourID,
            LoaiMedia: Number(loaiMedia),
            LoaiDoiTuong: "DL_TourDuLich",
            DuongDanFile: duongDanFile,
            TacGia: tacGia,
            ThuTuHienThi: thuTu || 1,
            SuDung: trangThai == "1" ? true : false
        };

        let formData = new FormData();
        formData.append("DaPhuongTien", JSON.stringify(thongTinChung));
        formData.append("DaPhuongTien_NoiDung", JSON.stringify(daPhuongTientranslations));

        if (fileDPT) {
            formData.append("File", fileDPT);
        }

        if (daPhuongTienID == null || daPhuongTienID == guidEmpty) {
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
                    daPhuongTientranslations = []
                    $('#dataGridDaPhuongTien').DataTable().ajax.reload();
                    $('#modalAddDaPhuongTien').modal('hide');
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
                    daPhuongTientranslations = []

                    $('#dataGridDaPhuongTien').DataTable().ajax.reload();
                    $('#modalAddDaPhuongTien').modal('hide');
                } else {
                    showNotification(0, data.error)
                }
            }
            catch (err) {
                console.log(err.message)
            }
        }
    }

    async function dataDeleteDaPhuongTien() {
        let id = $('#idDelete').val();
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
                $('#dataGridDaPhuongTien').DataTable().ajax.reload();
            } else {
                console.log(data.error)
            }
        }
        catch (err) {
            showNotification(0, err.message)
        }
    }

    // reset modal
    $("#modalAddDaPhuongTien").on('hidden.bs.modal', function () {
        daPhuongTientranslations = []
        $(this).find('input[type=text], input[type=file], textarea').val('');
        $(this).find('select').val('vi').trigger('change');
        $(this).find('input[type=radio][value=1], input[type=checkbox][value=1]').prop('checked', true).trigger('change');
        $("#showhinhAnhDPT").attr("src", '/assets/images/vector/Addimage.png');
        $("#modalAddDaPhuongTienTitle").text('Thêm mới tài liệu truyền thông');
        $('#thuTuDPT').val("1");
        $('#fileNamePreviewDPT').text("");
    });
    //#endregion ĐA PHƯƠNG TIỆN

    //#region ĐỊA ĐIỂM
    function saveTempDiaDiemTranslation() {
        let maNgonNgu = $("#ngonNguDiaDiem").val();
        let tenDiaDiem = $("#tenDiaDiem").val().trim();
        let diaChi = $("#diaChiDiaDiem").val().trim();
        let moTa = $("#moTaDiaDiem").val().trim();
        let thoiGianHoatDong = $("#thoiGianHoatDong").val().trim();
        let sucChua = $("#sucChua").val();

        if (!maNgonNgu) return; // phải chọn ngôn ngữ

        // tìm index ngôn ngữ trong mảng
        let index = diaDiemTranslations.findIndex(t => t.maNgonNgu === maNgonNgu);

        if (!tenDiaDiem && !diaChi && !moTa && !thoiGianHoatDong && !sucChua) {
            // Nếu tất cả đều trống → xóa bản dịch
            if (index !== -1) {
                diaDiemTranslations.splice(index, 1);
            }
        } else {
            if (index !== -1) {
                // cập nhật bản dịch đã có
                diaDiemTranslations[index].tenDiaDiem = tenDiaDiem;
                diaDiemTranslations[index].diaChi = diaChi;
                diaDiemTranslations[index].moTa = moTa;
                diaDiemTranslations[index].thoiGianHoatDong = thoiGianHoatDong;
                diaDiemTranslations[index].sucChua = sucChua;
            } else {
                // thêm mới
                diaDiemTranslations.push({
                    maNgonNgu: maNgonNgu,
                    tenDiaDiem: tenDiaDiem,
                    diaChi: diaChi,
                    moTa: moTa,
                    thoiGianHoatDong: thoiGianHoatDong,
                    sucChua: sucChua
                });
            }
        }
        console.log(diaDiemTranslations);
    }

    // Sự kiện blur trên input/textarea → tự động lưu
    $("#tenDiaDiem, #diaChiDiaDiem, #moTaDiaDiem, #thoiGianHoatDong, #sucChua").off("blur").on("blur", function () {
        saveTempDiaDiemTranslation();
    });

    // Sự kiện đổi ngôn ngữ → bind lại dữ liệu đã lưu
    $("#ngonNguDiaDiem").on("change", function () {
        let maNgonNgu = $(this).val();
        let exist = diaDiemTranslations.find(t => t.maNgonNgu === maNgonNgu);

        if (exist) {
            $("#tenDiaDiem").val(exist.tenDiaDiem);
            $("#diaChiDiaDiem").val(exist.diaChi);
            $("#moTaDiaDiem").val(exist.moTa);
            $("#thoiGianHoatDong").val(exist.thoiGianHoatDong);
            $("#sucChua").val(exist.sucChua);
        } else {
            // reset nếu chưa có dữ liệu
            $("#tenDiaDiem").val("");
            $("#diaChiDiaDiem").val("");
            $("#moTaDiaDiem").val("");
            $("#thoiGianHoatDong").val("");
            $("#sucChua").val("");
        }
    });

    $('#btnSaveDiaDiem').on('click', function () {
        dataAddDiaDiem()
    })

    async function dataAddDiaDiem() {
        // Lấy dữ liệu từ input/select
        let tinhThanhPho = $('#tinhThanhPho').val() || null;
        let phuongXa = $('#phuongXa').val() || null;
        let kinhDo = $('#kinhDo').val()?.trim() || null;
        let viDo = $('#viDo').val()?.trim() || null;
        let caoDo = $('#caoDo').val()?.trim() || null;

        let nguoiKhuyetTat = $("#nguoiKhuyetTat").is(":checked");
        let nhaVeSinh = $("#nhaVeSinh").is(":checked");
        let baiDoXe = $("#baiDoXe").is(":checked");

        // Lấy bản dịch tiếng Việt (bắt buộc phải có)
        let tenTiengViet = diaDiemTranslations.find(el => el.maNgonNgu === 'vi')?.tenDiaDiem || null;

        // Validate các trường bắt buộc
        if (!tenTiengViet || !tinhThanhPho || !phuongXa) {
            showNotification(0, 'Vui lòng nhập đầy đủ thông tin bắt buộc (*), bao gồm bản dịch tiếng Việt');
            return null;
        }

        let diaDiem = {
            DiaDiemID: null,
            TinhThanhPho: tinhThanhPho,
            PhuongXa: phuongXa,
            KinhDo: kinhDo,
            ViDo: viDo,
            CaoDo: caoDo,
            NguoiKhuyetTat: nguoiKhuyetTat,
            NhaVeSinh: nhaVeSinh,
            BaiDoXe: baiDoXe,
            TrangThai: true
        };

        // Chuẩn bị formData để gửi lên server
        let formData = new FormData();
        formData.append("DiaDiem", JSON.stringify(diaDiem));
        formData.append("DiaDiem_NoiDung", JSON.stringify(diaDiemTranslations)); // mảng bản dịch

        try {
            const res = await fetch('/api/DiaDiemApi/ThemMoi', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value) {
                showNotification(1, 'Thêm mới địa điểm thành công')
                await initDiaDiem(data.value.diaDiemID)
                $('#modalAddDiaDiem').modal('hide');
            } else {
                showNotification(0, data.error);
            }
        }
        catch (err) {
            console.log(err.message);
        }
    }

    // reset modal  
    $("#modalAddDiaDiem").on('hidden.bs.modal', function () {
        diaDiemtranslations = []
        $(this).find('input[type=text], input[type=number], input[type=file], textarea').val('');
        $(this).find('select').val('vi').trigger('change');
        $(this).find(".div_checkbox input[type='checkbox']").prop("checked", false);
    });
    //#endregion ĐỊA ĐIỂM

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
                    $("#ngonNgu").append(`<option value="${lang.maNgonNgu?.toLowerCase()}">${lang.tenNgonNgu}</option>`);
                    $("#ngonNguDPT").append(`<option value="${lang.maNgonNgu?.toLowerCase()}">${lang.tenNgonNgu}</option>`);
                    $("#ngonNguDiaDiem").append(`<option value="${lang.maNgonNgu?.toLowerCase()}">${lang.tenNgonNgu}</option>`);
                    $("#ngonNguLichTrinh").append(`<option value="${lang.maNgonNgu?.toLowerCase()}">${lang.tenNgonNgu}</option>`);
                });
                $("#ngonNgu").val('vi').trigger('change');
                $("#ngonNguDPT").val('vi').trigger('change');
                $("#ngonNguDiaDiem").val('vi').trigger('change');
                $("#ngonNguLichTrinh").val('vi').trigger('change');
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            showNotification(0, err.message)
        }
    };

    async function initDiaDiem(idDiemDi, idDiemDen) {
        try {
            const res = await fetch('/api/DiaDiemApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    maNgonNgu: 'vi',
                    trangThai: true
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value) {
                data.value.forEach(el => {
                    $("#diemDiID").append(`<option value="${el.diaDiemID}">${el.tenDiaDiem}</option>`);
                    $("#diemDenID").append(`<option value="${el.diaDiemID}">${el.tenDiaDiem}</option>`);
                });
                if (idDiemDi) {
                    $("#diemDiID").val(idDiemDi).trigger('change');
                }
                if (idDiemDen) {
                    $("#diemDenID").val(idDiemDen).trigger('change');
                }
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };

    async function initTinhThanhPho() {
        try {
            getDataWithApi('GET', '/api/CapTinhApi/Gets').then(data => {
                if (data && data.isSuccessed && data.resultObj) {
                    $("#tinhThanhPho").empty().append(`<option value="">Chọn</option>`);
                    data.resultObj.forEach(item => {
                        const displayText = item.noiDung || item.tenTinh || 'Không rõ tên';
                        $("#tinhThanhPho").append(`<option value="${item.tinhID}">${displayText}</option>`);
                    });
                }
            })
        }
        catch (err) {
            console.log(err.message)
        }
    };
    function initPhuongXa(tinhID = null) {
        if (tinhID == null) {
            $("#phuongXa").empty().append(`<option value="">Chọn</option>`);
            return;
        }
        getDataWithApi('GET', `/api/CapXaApi/GetByMaTinh?MaNgonNgu=vi&MaTinh=${tinhID ? `${tinhID}` : ''}`).then(data => {
            $("#phuongXa").empty().append(`<option value="">Chọn</option>`);
            if (data && data.isSuccess && data.value) {
                data.value.forEach(item => {
                    const displayText = item.noiDung || item.tenXa || 'Không rõ tên';
                    $("#phuongXa").append(`<option value="${item.xaID}">${displayText}</option>`);
                });
            }
        })
    }
 
    async function initSelectDanhMuc(loaiDanhMucID, selectId) {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    loaiDanhMucID: loaiDanhMucID,
                    tuKhoa: null
                })
            });

            if (!res.ok) {
                throw new Error(await res.text());
            }

            const data = await res.json();

            if (data && data.isSuccess && data.value) {
                const $select = $(`#${selectId}`);

                data.value.forEach(el => {
                    $select.append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
                });
            } else {
                showNotification(0, data.error || "Không có dữ liệu");
            }
        } catch (err) {
            console.error(`Lỗi khi tải dữ liệu cho #${selectId}:`, err.message);
        }
    }

    async function initToChuc() {
        try {
            const res = await fetch('/api/ToChucApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiToChucID: 310,
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();

            if (data && data.isSuccess && data.value) {

                data.value.forEach(el => {
                    $("#toChucID").append(`<option value="${el.toChucID}">${el.tenToChuc}</option>`);
                });
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };
    async function initLinhVuc() {
        try {
            const res = await fetch('/api/LinhVucApi/Gets', {
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

                data.value.forEach(el => {
                    if (el.linhVucCapChaID == null) {
                        $("#linhVucLichTrinh").append(`<option value="${el.linhVucID}">${el.ten}</option>`);
                    }
                });
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };

    function reloadAccess() {
        if (checkEmptyBlank(tourID)) {
            $("#tab-lich-trinh").closest("li").hide();
            $("#tab-da-phuong-tien").closest("li").hide();
        } else {
            $("#tab-lich-trinh").closest("li").show();
            $("#tab-da-phuong-tien").closest("li").show();
        }
        scrollTop();
    }

    $('#tinhThanhPho').on('change', function () {
        let tinhID = $(this).val();
        initPhuongXa(tinhID)
    })

    function initDiaDiemDuLich() {
        const apiUrlsDuLich = [
            { url: '/api/KhuDuLichApi/DanhSach', method: 'POST', body: { diemDuLich: false, maNgonNgu: 'vi'} }, // API POST
            { url: '/api/KhuDuLichApi/DanhSach', method: 'POST', body: { diemDuLich: true, maNgonNgu: 'vi' } }, // API POST
            { url: '/api/DL_CoSoDichVuTraiNghiemApi/Gets?MaNgonNgu=vi&LoaiHinhCoSoID=193', method: 'GET' },
            { url: '/api/DL_CoSoDichVuTraiNghiemApi/Gets?MaNgonNgu=vi&LoaiHinhCoSoID=194', method: 'GET' },
            { url: '/api/DL_CoSoDichVuTraiNghiemApi/Gets?MaNgonNgu=vi&LoaiHinhCoSoID=196', method: 'GET' },
            { url: '/api/DL_CoSoDichVuTraiNghiemApi/Gets?MaNgonNgu=vi&LoaiHinhCoSoID=191', method: 'GET' },
            { url: '/api/DL_CoSoLuuTruApi/Gets?MaNgonNgu=vi', method: 'GET' },
            { url: '/api/DL_CoSoAnUongApi/Gets?MaNgonNgu=vi', method: 'GET' }
        ];

        return Promise.all(
            apiUrlsDuLich.map(({ url, method, body }) =>
                fetch(url, {
                    method: method || 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: method === 'POST' ? JSON.stringify(body || {}) : null
                })
                    .then(async res => {
                        if (!res.ok) {
                            const errorText = await res.text();
                            throw new Error(`Lỗi khi tải dữ liệu từ ${url}: ${res.status} ${res.statusText}\n${errorText}`);
                        }
                        return res.json();
                    })
                    .catch(err => {
                        console.error(`Lỗi API Du lịch: ${url}`, err);
                        return null;
                    })
            )
        )
            .then(results => {
                const [khuDuLich, diemDuLich, traiNghiem193, traiNghiem194, traiNghiem196, traiNghiem191, luuTru, anUong] = results;
                if (khuDuLich && khuDuLich.isSuccess && khuDuLich.value) {
                    khuDuLich.value.forEach(el => {
                        dataDiaDiem.push({ id: el.khuDuLichID, text: el.tenKhuDuLich, loai: "dulich"});
                    }) 
                }
                if (diemDuLich && diemDuLich.isSuccess && diemDuLich.value) {
                    diemDuLich.value.forEach(el => {
                        dataDiaDiem.push({ id: el.khuDuLichID, text: el.tenKhuDuLich, loai: "dulich" });
                    })
                }
                if (traiNghiem193 && traiNghiem193.isSuccess && traiNghiem193.value) {
                    traiNghiem193.value.forEach(el => {
                        dataDiaDiem.push({ id: el.coSoDichVuID, text: el.tenCoSo, loai: "dulich" });
                    })
                }
                if (traiNghiem194 && traiNghiem194.isSuccess && traiNghiem194.value) {
                    traiNghiem194.value.forEach(el => {
                        dataDiaDiem.push({ id: el.coSoDichVuID, text: el.tenCoSo, loai: "dulich" });
                    })
                }
                if (traiNghiem196 && traiNghiem196.isSuccess && traiNghiem196.value) {
                    traiNghiem196.value.forEach(el => {
                        dataDiaDiem.push({ id: el.coSoDichVuID, text: el.tenCoSo, loai: "dulich" });
                    })
                }
                if (traiNghiem191 && traiNghiem191.isSuccess && traiNghiem191.value) {
                    traiNghiem191.value.forEach(el => {
                        dataDiaDiem.push({ id: el.coSoDichVuID, text: el.tenCoSo, loai: "dulich" });
                    })
                }
                if (luuTru && luuTru.isSuccess && luuTru.value) {
                    luuTru.value.forEach(el => {
                        dataDiaDiem.push({ id: el.coSoLuuTruID, text: el.tenCoSo, loai: "dulich" });
                    })
                }
                if (anUong && anUong.isSuccess && anUong.value) {
                    anUong.value.forEach(el => {
                        dataDiaDiem.push({ id: el.coSoAnUongID, text: el.tenCoSo, loai: "dulich" });
                    })
                }
                console.log('✅ Dữ liệu địa điểm:', dataDiaDiem);
            });
    }
    function initDiaDiemVanHoa() {
        const apiUrlsVanHoa = [
            { url: '/api/DiTichApi/DanhSach', method: 'POST', body: {} },
            { url: '/api/ToChucApi/DanhSach', method: 'POST', body: { loaiToChucID: 94 } }, // Thư viện
            { url: '/api/ToChucApi/DanhSach', method: 'POST', body: { loaiToChucID: 95 } } // Bảo tàng
        ];

        return Promise.all(
            apiUrlsVanHoa.map(({ url, method, body }) =>
                fetch(url, {
                    method: method || 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body || {})
                })
                    .then(async res => {
                        if (!res.ok) {
                            const errorText = await res.text();
                            throw new Error(`Lỗi khi tải dữ liệu từ ${url}: ${res.status} ${res.statusText}\n${errorText}`);
                        }
                        return res.json();
                    })
                    .catch(err => {
                        console.error(`Lỗi API Văn hóa: ${url}`, err);
                        return null;
                    })
            )
        )
            .then(results => {
                const [diTich, thuVien, baoTang] = results;

                if (diTich && diTich.isSuccess && diTich.value) {
                    diTich.value.forEach(el => {
                        dataDiaDiem.push({ id: el.diTichID, text: el.tenDiTich, loai: "vanhoa" });
                    })
                }

                if (thuVien && thuVien.isSuccess && thuVien.value) {
                    thuVien.value.forEach(el => {
                        dataDiaDiem.push({ id: el.toChucID, text: el.tenToChuc, loai: "vanhoa" });
                    })
                }

                if (baoTang && baoTang.isSuccess && baoTang.value) {
                    baoTang.value.forEach(el => {
                        dataDiaDiem.push({ id: el.toChucID, text: el.tenToChuc, loai: "vanhoa" });
                    })
                }
                console.log('Dữ liệu địa điểm:', dataDiaDiem);
            });
    }
    function initDiaDiemTheThao() {
        const apiUrlsTheThao = [
            { url: '/api/CongTrinhTheThaoApi/DanhSach', method: 'POST', body: {maNgonNgu: 'vi'} },
        ];

        return Promise.all(
            apiUrlsTheThao.map(({ url, method, body }) =>
                fetch(url, {
                    method: method || 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body || {})
                })
                    .then(async res => {
                        if (!res.ok) {
                            const errorText = await res.text();
                            throw new Error(`Lỗi khi tải dữ liệu từ ${url}: ${res.status} ${res.statusText}\n${errorText}`);
                        }
                        return res.json();
                    })
                    .catch(err => {
                        console.error(`Lỗi API Thể thao: ${url}`, err);
                        return null;
                    })
            )
        )
            .then(results => {
                const [congTrinhTheThao] = results;

                if (congTrinhTheThao && congTrinhTheThao.isSuccess && congTrinhTheThao.value) {
                    congTrinhTheThao.value.forEach(el => {
                        dataDiaDiem.push({ id: el.congTrinhID, text: el.tenCongTrinh, loai: "the thao" });
                    })
                }
                console.log('Dữ liệu địa điểm:', dataDiaDiem);
            });
    }
    async function loadDataDiaDiem(loai = ['1']) {
        const $diaDiemLichTrinh = $('#diaDiemLichTrinh');
        $diaDiemLichTrinh.empty().append(`<option value=""></option>`);

        // Xử lý mảng loai

        if (loai.includes("1")) {
            dataDiaDiem.forEach(el => {
                $("#diaDiemLichTrinh").append(`<option value="${el.id}">${el.text}</option>`);
            })
            return;
        }
        if (loai.includes("4")) {
            dataDiaDiem.forEach(el => {
                if (el.loai === 'dulich') {
                    $("#diaDiemLichTrinh").append(`<option value="${el.id}">${el.text}</option>`);
                }
            })
        }
        if (loai.includes("2")) {
            dataDiaDiem.forEach(el => {
                if (el.loai === 'vanhoa') {
                    $("#diaDiemLichTrinh").append(`<option value="${el.id}">${el.text}</option>`);
                }
            })
        }
        if (loai.includes("3")) {
            dataDiaDiem.forEach(el => {
                if (el.loai === 'thethao') {
                    $("#diaDiemLichTrinh").append(`<option value="${el.id}">${el.text}</option>`);
                }
            })
        }

        if (loai == "") {
            dataDiaDiem.forEach(el => {
                $("#diaDiemLichTrinh").append(`<option value="${el.id}">${el.text}</option>`);
            })
        }
    };
    //#endregion HÀM LOAD DỮ LIỆU CHO CÁC COMBOBOX

})

function saveTempTranslationLichTrinh() {
    let maNgonNgu = $("#ngonNguLichTrinh").val();
    let hoatDong = $("#hoatDongLichTrinh").val().trim();
    let soGio = $("#soGioLichTrinh").val().trim();

    if (!maNgonNgu) return; // bắt buộc chọn ngôn ngữ và nhập tên

    // Kiểm tra ngôn ngữ đã tồn tại trong mảng chưa
    let index = lichTrinhTranslations.findIndex(t => t.maNgonNgu === maNgonNgu);
    if (hoatDong === "" && soGio === "") {
        // Nếu trống cả tiêu đề và mô tả -> xóa bản dịch khỏi mảng
        if (index !== -1) {
            lichTrinhTranslations.splice(index, 1);
        }
    } else {
        if (index !== -1) {
            lichTrinhTranslations[index].hoatDong = hoatDong;
            lichTrinhTranslations[index].soGio = soGio;
        } else {
            lichTrinhTranslations.push({
                maNgonNgu: maNgonNgu,
                hoatDong: hoatDong,
                soGio: soGio
            });
        }
    }
    console.log(lichTrinhTranslations);
}