const baseUrl = getRootLink();
const guidEmpty = '00000000-0000-0000-0000-000000000000';

$(document).ready(function () {
    initSelect2();
    initDatePicker();
    let tacPhamTranslations = [];
    let bieuDienTranslations = [];
    ; (async function () {
        await Promise.all([
            initNgonNgu(),
            initLoaiHinhTacPham(),
            initToChucNgheThuat(),
            initNgheSi()
        ]);
        initThongTinChung();
        initTableBieuDien();
        reloadAccess()
    })();

    $("#formDelete").on("submit", function (e) {
        e.preventDefault();
        dataDeleteBieuDien();
    });

    //#region THÔNG TIN CHUNG

    document.getElementById('anhDaiDien').addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById('previewAnhDaiDien').setAttribute('src', e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    async function initThongTinChung() {
        if (checkEmptyBlank(tacPhamID)) {
            return;
        }

        try {
            const res = await fetch(`/api/TacPhamApi/ChiTiet/${tacPhamID}`, {
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

                if (data.value.hinhAnh && data.value.hinhAnh.trim() !== "") {
                    $("#previewAnhDaiDien").attr("src", data.value.hinhAnh.trim());
                    $("#urlAnhDaiDien").val(data.value.hinhAnh.trim());
                }

                // Loại hình tác phẩm
                $("#theLoaiID").val(data.value.theLoaiID).trigger("change");

                // Mã định danh
                $("#maDinhDanh").val((data.value.maDinhDanh || "").trim());

                // Năm công bố
                $("#namCongBo").val((data.value.namCongBo || "").toString().trim());

                // Thứ tự
                $("#thuTu").val(data.value.thuTu || 1);

                // Trạng thái duyệt (radio)
                if (data.value.suDung == 1) {
                    $("#suDung").prop("checked", true);
                } else {
                    $("#khongSuDung").prop("checked", true);
                }

                // Bản dịch
                tacPhamTranslations = data.value.banDich || [];
                let tiengViet = tacPhamTranslations.find(el => el.maNgonNgu === "vi") || null;
                if (tiengViet) {
                    $("#ngonNgu").val("vi").trigger("change");
                    $("#tenTacPham").val((tiengViet.tenTacPham || "").trim());
                    $("#moTa").val((tiengViet.moTa || "").trim());
                    $("#noiDung").val((tiengViet.noiDung || "").trim());
                    $("#tacGia").val((tiengViet.tacGia || "").trim());
                }
            } else {
                showNotification(0, data.error);
            }

        }
        catch (err) {
            showNotification(0, err.message)
        }
    }

    // Hàm lưu tạm cho 1 ngôn ngữ
    // Hàm lưu tạm cho 1 ngôn ngữ (TacPhamNgheThuat + tác giả)
    function saveTempTacPhamTranslation() {
        let maNgonNgu = $("#ngonNgu").val();
        if (!maNgonNgu) return; // bắt buộc chọn ngôn ngữ

        let tenTacPham = $("#tenTacPham").val().trim();
        let moTa = $("#gioiThieu").val().trim();
        let noiDung = $("#noiDung").val().trim();
        let tacGia = $("#tacGia").val().trim(); // 👈 thêm tác giả

        // tìm index ngôn ngữ trong mảng
        let index = tacPhamTranslations.findIndex(t => t.maNgonNgu === maNgonNgu);

        // nếu tất cả đều trống → xóa bản dịch
        if (!tenTacPham && !moTa && !noiDung && !tacGia) {
            if (index !== -1) {
                tacPhamTranslations.splice(index, 1);
            }
        } else {
            if (index !== -1) {
                // cập nhật
                tacPhamTranslations[index].tenTacPham = tenTacPham;
                tacPhamTranslations[index].moTa = moTa;
                tacPhamTranslations[index].noiDung = noiDung;
                tacPhamTranslations[index].tacGia = tacGia;
            } else {
                // thêm mới
                tacPhamTranslations.push({
                    maNgonNgu: maNgonNgu,
                    tenTacPham: tenTacPham,
                    moTa: moTa,
                    noiDung: noiDung,
                    tacGia: tacGia
                });
            }
        }
    }

    // Sự kiện blur trên input/textarea → tự động lưu
    $("#tenTacPham, #moTa, #noiDung, #tacGia")
        .on("blur", function () {
            saveTempTacPhamTranslation();
        });

    // Sự kiện đổi ngôn ngữ → bind lại dữ liệu đã lưu
    $("#ngonNgu").on("change", function () {
        let maNgonNgu = $(this).val();
        let exist = tacPhamTranslations.find(t => t.maNgonNgu === maNgonNgu);

        if (exist) {
            $("#tenTacPham").val(exist.tenTacPham || "");
            $("#gioiThieu").val(exist.moTa || "");
            $("#noiDung").val(exist.noiDung || "");
            $("#tacGia").val(exist.tacGia || "");
        } else {
            // reset nếu chưa có dữ liệu
            $("#tenTacPham").val("");
            $("#gioiThieu").val("");
            $("#noiDung").val("");
            $("#tacGia").val("");
        }
    });

    $("#btn-save").on("click", function (e) {
        saveTempTacPhamTranslation();
        tacPhamTranslations = tacPhamTranslations.filter(t => t.tenTacPham && t.tenTacPham.trim() !== ""); // loại bỏ các bản dịch không có tên hiện vật)
        dataAddThongTinChung();
        e.preventDefault();
    });

    $("#btn-save-and-close").on("click", function (e) {
        saveTempTacPhamTranslation();
        tacPhamTranslations = tacPhamTranslations.filter(t => t.tenTacPham && t.tenTacPham.trim() !== ""); // loại bỏ các bản dịch không có tên hiện vật)
        dataAddThongTinChung(1);
        e.preventDefault();

      
    });

    async function dataAddThongTinChung(isReturn) {
        // Lấy file ảnh và url (nếu có)
        let anhDaiDien = $('#anhDaiDien')[0]?.files[0] || null;
        let urlAnhDaiDien = $('#urlAnhDaiDien').val() || null;

        // Lấy dữ liệu từ input/select
        let theLoaiID = $('#theLoaiID').val() || null;
        let maDinhDanh = $('#maDinhDanh').val()?.trim() || null;
        let namCongBo = $('#namCongBo').val()?.trim() || null;
        let suDung = $('input[name="trangThai"]:checked').val() === "1";
        let thuTu = $('#thuTu').val() || 1;

        // Lấy bản dịch tiếng Việt (bắt buộc phải có)
        let tenTiengViet = tacPhamTranslations.find(el => el.maNgonNgu === 'vi')?.tenTacPham || null;

        // Validate các trường bắt buộc
        if ((anhDaiDien == null && checkEmptyBlank(urlAnhDaiDien)) || !tenTiengViet || !maDinhDanh || !theLoaiID) {
            showNotification(0, 'Vui lòng nhập đầy đủ thông tin bắt buộc (*), bao gồm bản dịch tiếng Việt');
            return null;
        }

        // Gom object thông tin chung
        let tacPham = {
            TacPhamID: tacPhamID || null,
            TheLoaiID: theLoaiID,
            linhVucID: 285,
            MaDinhDanh: maDinhDanh,
            NamCongBo: namCongBo,
            ThuTu: thuTu != "" ? Number(thuTu) : 1,
            SuDung: suDung == '1' ? true : false,
            HinhAnh: urlAnhDaiDien
        };

        // Chuẩn bị formData để gửi lên server
        let formData = new FormData();
        formData.append("TacPham", JSON.stringify(tacPham));
        formData.append("TacPham_NoiDung", JSON.stringify(tacPhamTranslations)); // mảng bản dịch
        if (anhDaiDien) {
            formData.append("HinhAnh", anhDaiDien);
        }

        if (checkEmptyBlank(tacPhamID)) {
            try {
                const res = await fetch('/api/TacPhamApi/ThemMoi', {
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
                    tacPhamID = data.value.tacPhamID
                    reloadAccess()
                    if (isReturn && isReturn == 1) {
                        setTimeout(function () {
                            window.location.href = '/AdminTool/TacPhamNgheThuat';
                        }, 2000)
                    } else {
                        initTableBieuDien()
                        scrollTop()
                    }
                } else {
                    showNotification(0, data.error)
                }
            }
            catch (err) {
                console.log(err.message)
            }
        } else {
            try {
                const res = await fetch(`/api/TacPhamApi/ChinhSua/${tacPhamID}`, {
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
                    tacPhamID = data.value.tacPhamID
                    reloadAccess()
                    if (isReturn && isReturn == 1) {
                        setTimeout(function () {
                            window.location.href = '/AdminTool/TacPhamNgheThuat';
                        }, 2000)
                    } else {
                        initTableBieuDien()
                        scrollTop()
                    }
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


    //#region BIỂU DIỄN
    $('#btn-show-bieu-dien').on('click', function () {
        $('#formBieuDien').removeClass("d-none");
        $(this).addClass("d-none");
        resetFormBieuDien()
    })
    $('#btn-cancel-bieu-dien').on('click', function () {
        $('#formBieuDien').addClass("d-none");
        $('#btn-show-bieu-dien').removeClass("d-none")
        resetFormBieuDien()
    })

    // Hàm lưu tạm cho 1 ngôn ngữ
    function saveTempTranslationBieuDien() {
        let maNgonNgu = $("#ngonNguBieuDien").val();
        if (!maNgonNgu) return; // bắt buộc chọn ngôn ngữ

        let tenSuKien = $("#tenChuongTrinh").val().trim();
        let moTa = $("#diaDiemToChuc").val().trim();
        let noiDung = $("#noiDungCongDien").val().trim();

        // tìm index ngôn ngữ trong mảng
        let index = bieuDienTranslations.findIndex(t => t.maNgonNgu === maNgonNgu);

        // nếu tất cả đều trống → xóa bản dịch
        if (!tenSuKien && !moTa && !noiDung) {
            if (index !== -1) {
                bieuDienTranslations.splice(index, 1);
            }
        } else {
            if (index !== -1) {
                // cập nhật
                bieuDienTranslations[index].tenSuKien = tenSuKien;
                bieuDienTranslations[index].moTa = moTa;
                bieuDienTranslations[index].noiDung = noiDung;
            } else {
                // thêm mới
                bieuDienTranslations.push({
                    maNgonNgu: maNgonNgu,
                    tenSuKien: tenSuKien,
                    moTa: moTa,
                    noiDung: noiDung
                });
            }
        }
    }

    // Sự kiện blur trên input/textarea → tự động lưu
    $("#tenChuongTrinh, #diaDiemToChuc, #noiDungCongDien")
        .on("blur", function () {
            saveTempTranslationBieuDien();
        });


    // Sự kiện đổi ngôn ngữ → bind lại dữ liệu đã lưu
    $("#ngonNguBieuDien").on("change", function () {
        let maNgonNgu = $(this).val();
        let exist = bieuDienTranslations.find(t => t.maNgonNgu === maNgonNgu);

        if (exist) {
            $("#tenChuongTrinh").val(exist.tenSuKien);
            $("#diaDiemToChuc").val(exist.moTa);
            $("#noiDungCongDien").val(exist.noiDung);
        } else {
            // reset nếu chưa có dữ liệu
            $("#tenChuongTrinh").val("");
            $("#diaDiemToChuc").val("");
            $("#noiDungCongDien").val("");
        }
    });
   
    async function initTableBieuDien() {
        const tableApi = {
            url: `${baseUrl}/api/TacPhamApi/BieuDien/DanhSach${tacPhamID ? `/${tacPhamID}` : ''}`,
            type: "GET",
            contentType: 'application/json; charset=utf-8',
            dataSrc: function (data) {
                if (data && data.isSuccess && data.value.length > 0) {
                    data.value.forEach((item, index) => {
                        item.stt = index + 1;
                        // Phân tách nghệ sĩ và tổ chức tham gia
                        if (item.thamGia != null && item.thamGia.length > 0) {
                            var ngheSiThamGia = [], toChucThamGia = [];
                            for (let i = 0; i < item.thamGia.length; i++) {
                                if (item.thamGia[i].loaiDoiTuong) {
                                    toChucThamGia.push(item.thamGia[i].doiTuongID);
                                } else {
                                    ngheSiThamGia.push(item.thamGia[i].doiTuongID);
                                }
                            }
                            item.ngheSiThamGia = ngheSiThamGia.join(',');
                            item.toChucThamGia = toChucThamGia.join(',');
                        }
                    });
                    console.log(data.value)
                    return data.value;
                }
                return [];
            },
        };

        const tableDefs = [
            {
                targets: 1,
                render: function (data, type, row, meta) {
                    return `<span class="detail-command-btn text-blue" id=n-"${meta.row}">${data}</span>`;
                }
            },
            {
                targets: 3,
                render: function (data, type, row, meta) {
                    let ngayBieuDien = data ? formatShortDate(data) : '';
                    return ngayBieuDien;
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
            { "data": "stt", "width": "40px", "class": "center-align" },
            { "data": "tenSuKien", "width": "25%", "class": "left-align" },
            { "data": "moTa", "width": "120px", "class": "left-align" },
            { "data": "batDau", "width": "120px", "class": "center-align" },
            { "data": "thuTu", "width": "120px", "class": "center-align" },
            { "data": "trangThai", "width": "120px", "class": "center-align" },
            { "data": "", "width": "120px", "class": "center-align group-icon-action" },
        ];

        //if (!permitedEdit && !permitedDelete) {
        //    tableCols.pop();
        //    tableDefs.pop();
        //}

        initDataTableConfigNoSearch('dataGridBieuDien', tableApi, tableDefs, tableCols);

        $('#dataGridBieuDien tbody').on('click', '.edit-command-btn', async function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGridBieuDien').DataTable().row(id).data();
            $('#suKienID').val(data.suKienID);
           
            $("#ngayBieuDien").val(formatShortDate(data.batDau));

            $("#ngheSiBieuDien").val(data.ngheSiThamGia?.split(",")).trigger("change");
            $("#donViBieuDien").val(data.toChucThamGia?.split(",")).trigger("change");
            $("#thuTuBieuDien").val(data.thuTu);

            // Radio trạng thái
            $(`input[name='trangThaiBieuDien'][value='${data.trangThai == true ? "1" : "0"}'`).prop('checked', true);

            bieuDienTranslations = data.banDich || [];
           
            var banDich_vi = bieuDienTranslations.find(el => el.maNgonNgu === 'vi')
            $('#ngonNguBieuDien').val('vi').trigger('change');
            $('#tenChuongTrinh').val(banDich_vi.tenSuKien);
            $('#diaDiemToChuc').val(banDich_vi.moTa);
            $('#noiDungCongDien').val(banDich_vi.noiDung);

            $('#formBieuDien').removeClass("d-none");
        });
        $('#dataGridBieuDien tbody').on('click', '.delete-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGridBieuDien').DataTable().row(id).data();

            $('#idDelete').val(data.suKienID);
            $('#nameDelete').text(`${data.tenSuKien}`);

            $('#modalDelete').modal('show');
        });

        //$('#dataGridBieuDien tbody').on('click', '.detail-command-btn', function () {
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

    $('#btn-save-bieu-dien').on('click', function () {
        bieuDienTranslations = bieuDienTranslations.filter(t => t.tenSuKien && t.tenSuKien.trim() !== ""); // loại bỏ các bản dịch không có tên)
        dataAddBieuDien();
    });
   
    async function dataAddBieuDien() {
        if (tacPhamID == null || tacPhamID == guidEmpty) {
            showNotification(0, 'Vui lòng lưu thông tin chung trước')
            return;
        }

        let suKienID = $('#suKienID').val() || null;
        let ngayBieuDien = $("#ngayBieuDien").val()?.trim();
        let ngheSiBieuDien = $("#ngheSiBieuDien").val() || null;
        let donViBieuDien = $("#donViBieuDien").val() || null;
        let thuTuBieuDien = $("#thuTuBieuDien").val();
        let trangThaiBieuDien = $("input[name='trangThaiBieuDien']:checked").val();

        // Lấy bản dịch tiếng Việt (bắt buộc phải có)
        let tenTiengViet = bieuDienTranslations.find(el => el.maNgonNgu === 'vi')?.tenSuKien || null;
        // Validate các trường bắt buộc
        if (checkEmptyBlank(ngayBieuDien) || !tenTiengViet) {
            showNotification(0, 'Vui lòng nhập đầy đủ thông tin bắt buộc (*), bao gồm bản dịch tiếng Việt');
            return null;
        }

        let thongTinChung = {
            SuKienID: suKienID || null,
            linhVucID: 272,
            BatDau: formatDateToSearch(ngayBieuDien),
            ThuTu: thuTuBieuDien || 1,
            TrangThai: trangThaiBieuDien == "1" ? true : false,
            TacPhamID: tacPhamID
        };

        let formData = new FormData();
        formData.append("SuKien", JSON.stringify(thongTinChung));
        formData.append("SuKien_NoiDung", JSON.stringify(bieuDienTranslations));

        if (ngheSiBieuDien) {
            formData.append("NgheSiThamGia", ngheSiBieuDien);
        }

        if (donViBieuDien) {
            formData.append("ToChucThamGia", donViBieuDien);
        }
      

        if (suKienID == null) {
            try {
                const res = await fetch('/api/TacPhamApi/BieuDien/ThemMoi', {
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
                    bieuDienTranslations = []
                    $('#dataGridBieuDien').DataTable().ajax.reload();
                    $('#formBieuDien').addClass("d-none");
                    $('#btn-show-bieu-dien').removeClass("d-none")
                    resetFormBieuDien()
                } else {
                    showNotification(0, data.error)
                }
            }
            catch (err) {
                console.log(err.message)
            }
        } else {
            try {
                const res = await fetch(`/api/TacPhamApi/BieuDien/ChinhSua/${suKienID}`, {
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
                    bieuDienTranslations = []

                    $('#dataGridBieuDien').DataTable().ajax.reload();
                    $('#formBieuDien').addClass("d-none");
                    $('#btn-show-bieu-dien').removeClass("d-none")
                    resetFormBieuDien()
                } else {
                    showNotification(0, data.error)
                }
            }
            catch (err) {
                console.log(err.message)
            }
        }
    }
    async function dataDeleteBieuDien() {
        let id = $('#idDelete').val();
        try {
            const res = await fetch(`/api/TacPhamApi/BieuDien/Xoa/${id}`, {
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
                $('#dataGridBieuDien').DataTable().ajax.reload();
            } else {
                console.log(data.error)
            }
        }
        catch (err) {
            showNotification(0, err.message)
        }
    }

    // reset form
    function resetFormBieuDien() {
        bieuDienTranslations = [];
        let $form = $("#formBieuDien");

        $form.find("input[type=text], input[type=number], textarea").val("");
        $form.find("select").val("vi").trigger("change");
        $form.find("input[type=radio][value=1], input[type=checkbox][value=1]").prop("checked", true);
        $form.find("#thuTuBieuDien").val('1');
    }
    //#endregion ĐA PHƯƠNG TIỆN


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
                    $("#ngonNguBieuDien").append(`<option value="${lang.maNgonNgu?.toLowerCase()}">${lang.tenNgonNgu}</option>`);
                });
                $("#ngonNgu").val('vi').trigger('change');
                $("#ngonNguBieuDien").val('vi').trigger('change');
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            showNotification(0, err.message)
        }
    };

    async function initLoaiHinhTacPham() {
        try {
            const res = await fetch('/api/DanhMucChungApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: 20,
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
                    $("#theLoaiID").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
                });
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    };

    async function initToChucNgheThuat() {
        try {
            const res = await fetch('/api/ToChucApi/DanhSach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiToChucID: 93
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();


            if (data && data.isSuccess && data.value) {
                data.value.forEach(el => {
                    $("#donViBieuDien").append(`<option value="${el.toChucID}">${el.tenToChuc}</option>`);
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

    async function initNgheSi() {
        try {
            const res = await fetch('/api/DM_CaNhan_NgheSiApi/Gets?MaNgonNgu=vi', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                //body: JSON.stringify({
                //    loaiToChucID: 93
                //})
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            data = await res.json();


            if (data && data.isSuccess && data.value) {
                data.value.forEach(el => {
                    $("#ngheSiBieuDien").append(`<option value="${el.caNhanID}">${el.hoTen}</option>`);
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
    function reloadAccess() {
        if (checkEmptyBlank(tacPhamID)) {
            $("#bieu-dien-tab").closest("li").hide();
        } else {
            $("#bieu-dien-tab").closest("li").show();
        }
    }
    //#endregion HÀM LOAD DỮ LIỆU CHO CÁC COMBOBOX
    
})