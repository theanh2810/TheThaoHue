const guidEmpty = '00000000-0000-0000-0000-000000000000';
var tacPhamTranslations = []; // mảng lưu tạm các bản dịch ấn phẩm

var AnPham = {
    init: async function () {
        // Các plugin chung
        initSelect2();
        initDatePicker();
        // Khởi tạo dữ liệu ban đầu
        await Promise.all([
            initNgonNgu(),
            initTheLoai(),
            initTinhTrang(),
            initNamXuatBan()
        ]);

        this.ThongTinChung.init();

        this.bindEvents();
    },

    bindEvents: function () {
        // Event mở form ấn phẩm
        $("#btnAddAnPham").on("click", () => {
            this.toggleForm(true);
        });
    },

    toggleForm: function (isShow) {
        if (isShow) {
            // Hiện form thêm/sửa ấn phẩm
            /* $("#formAnPham").show(); */
            /* $("#danhSachAnPham").hide(); */
        } else {
            tacPhamTranslations = [];
            // Chỉ reset vùng inputs của form chính
            const $form = $("#formInputs_AnPham");
            $form.find('input[type=text], input[type=number], input[type=file], textarea').val('');
            $form.find('select').val('vi').trigger('change');
            $form.find('input[type=radio][value=1], input[type=checkbox][value=1]').prop('checked', true);

            // Reset preview
            $("#previewAnhDaiDien_AnPham").attr("src", "/assets/images/vector/addImage.png");

            // Ẩn form thông tin chung + tài liệu truyền thông, hiện danh sách
            /* $("#formAnPham").hide();
            $("#danhSachAnPham").show(); */
        }
    },

    refresh: function () {
        $('#dataGridAnPham').DataTable().ajax.reload();
    },

    // 1. THÔNG TIN CHÍNH
    ThongTinChung: {
        init: function () {
            initTableAnPham(); // khởi tạo datatable chính

            this.bindEvents();
        },

        save: function () {
            dataAddThongTinChung()
        },

        delete: function () {
            dataDeleteThongTinChung()
        },

        bindEvents: function () {
            // Sự kiện blur trên input/textarea → tự động lưu
            $("#tenTacPham_AnPham, #moTa_AnPham, #tacGia_AnPham, #nhaXuatBan_AnPham")
                .off('blur.saveTemp')
                .on('blur.saveTemp', () => {
                    this.saveTempTacPhamTranslation();
                });

            // Sự kiện đổi ngôn ngữ → bind lại dữ liệu đã lưu
            $("#ngonNgu_AnPham")
                .off('change.lang')
                .on('change.lang', function (e) {
                let maNgonNgu = $(this).val();
                let exist = tacPhamTranslations.find(t => t.maNgonNgu === maNgonNgu);

                if (exist) {
                    $("#tenTacPham_AnPham").val(exist.tenTacPham || "");
                    $("#moTa_AnPham").val(exist.moTa || "");
                    $("#tacGia_AnPham").val(exist.tacGia || "");
                    $("#nhaXuatBan_AnPham").val(exist.nhaXuatBan || "");
                } else {
                    // reset nếu chưa có dữ liệu
                    $("#tenTacPham_AnPham").val("");
                    $("#moTa_AnPham").val("");
                    $("#tacGia_AnPham").val("");
                    $("#nhaXuatBan_AnPham").val("");
                }
                });

            // Preview ảnh đại diện
            $("#anhDaiDien_AnPham")
                .off('change.preview')
                .on('change.preview', function (event) {
                    const file = event.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = function (e) {
                            $("#previewAnhDaiDien_AnPham").attr("src", e.target.result);
                        };
                        reader.readAsDataURL(file);
                    } else {
                        // Nếu không chọn file → reset ảnh mặc định
                        $("#previewAnhDaiDien_AnPham").attr("src", "/assets/images/vector/addImage.png");
                    }
                });
        },

        saveTempTacPhamTranslation() {
            let maNgonNgu = $("#ngonNgu_AnPham").val();
            if (!maNgonNgu) return; // bắt buộc chọn ngôn ngữ

            let tenTacPham = $("#tenTacPham_AnPham").val().trim();
            let moTa = $("#moTa_AnPham").val().trim();
            let tacGia = $("#tacGia_AnPham").val().trim();
            let nhaXuatBan = $("#nhaXuatBan_AnPham").val()?.trim();

            // tìm index ngôn ngữ trong mảng
            let index = tacPhamTranslations.findIndex(t => t.maNgonNgu === maNgonNgu);

            // nếu tất cả đều trống → xóa bản dịch
            if (!tenTacPham && !moTa && !tacGia && !nhaXuatBan) {
                if (index !== -1) {
                    tacPhamTranslations.splice(index, 1);
                }
            } else {
                if (index !== -1) {
                    // cập nhật
                    tacPhamTranslations[index].tenTacPham = tenTacPham;
                    tacPhamTranslations[index].moTa = moTa;
                    tacPhamTranslations[index].tacGia = tacGia;
                    tacPhamTranslations[index].nhaXuatBan = nhaXuatBan;
                } else {
                    // thêm mới
                    tacPhamTranslations.push({
                        maNgonNgu: maNgonNgu,
                        tenTacPham: tenTacPham,
                        moTa: moTa,
                        tacGia: tacGia,
                        nhaXuatBan: nhaXuatBan
                    });
                }
            }
            console.log(tacPhamTranslations)
        }
    },
};

$(function () {
    AnPham.init();
});


//#region INIT 
async function initTableAnPham() {
    const tableApi = {
        url: `${baseUrl}/api/TacPhamApi/DanhSach`,
        type: "POST",
        data: function (d) {
            var suDung = $('#trang-thai-search').val()
            var loaiHinh = $('#loai-hinh-tac-pham-search').val()
            return JSON.stringify({
                tuKhoa: $('#tu-khoa-search').val() || null,
                maNgonNgu: $('#ngon-ngu-search').val() || 'vi',
                theLoaiID: loaiHinh == "-1" ? null : loaiHinh,
                linhVucID: 284,
                toChucID: coQuanId,
                suDung: null/*suDung == "-1" ? null : (suDung === "1" ? true : false)*/,
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
                return `<div class="group-info have-image">
                        <div class="have-image">
                            <img src="${row.hinhAnh || '/images/no-image.png'}" alt="${row.tenTacPham || ''}" onerror="this.onerror=null;this.src='/images/no-image.png';" />
                        </div>
                        <div class="group-info">
                        <div class="info-main"><div>${row.tenTacPham || ''}</div></div>
                        <div class="info-sub">${row.maDinhDanh || ''}</div></div>
                    </div>`;
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
        { "data": "tenTacPham", "width": "", "class": "left-align" },
        { "data": "tenTheLoai", "width": "220px", "class": "left-align" },
        { "data": "tacGia", "width": "220px", "class": "center-align" },
        { "data": "thuTu", "width": "120px", "class": "center-align" },
        { "data": "suDung", "width": "120px", "class": "center-align" },
        { "data": "", "width": "120px", "class": "center-align group-icon-action" },
    ];

    //if (!permitedEdit && !permitedDelete) {
    //    tableCols.pop();
    //    tableDefs.pop();
    //}

    initDataTableConfigNoSearch('dataGridAnPham', tableApi, tableDefs, tableCols);

    $('#dataGridAnPham tbody').on('click', '.edit-command-btn', async function () {
        var id = $(this).attr("ID").match(/\d+/)[0];
        var data = $('#dataGridAnPham').DataTable().row(id).data();

        resetAnPham();
        $(".thongTinAnPham").show();
        $("#danhSachAnPham").show();
        $('#btnAddAnPham').hide()
        initThongTinChung(data.tacPhamID);
    });
    $('#dataGridAnPham tbody').on('click', '.delete-command-btn', function () {
        var id = $(this).attr("ID").match(/\d+/)[0];
        var data = $('#dataGridAnPham').DataTable().row(id).data();

        $('#idDelete').val(data.tacPhamID);
        $('#idTypeDelete').val(2);
        $('#nameDelete').text(`${data.tenTacPham}`);
        $('#modalDelete').modal('show');
    });

    $('#dataGridAnPham tbody').on('click', '.detail-command-btn', function () {
        var id = $(this).attr("ID").match(/\d+/)[0];
        var data = $('#dataGridAnPham').DataTable().row(id).data();

        $('#modalDetail').modal('show');
    });

    $("#formDelete").on("submit", function (e) {
        e.preventDefault();
        AnPham.ThongTinChung.delete();
    });

}
async function initThongTinChung(tacPhamID) {
    if (checkEmptyBlank(tacPhamID)) {
        return;
    }

    try {
        const res = await fetch(`/api/TacPhamApi/ChiTiet/${tacPhamID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            throw new Error(await res.text());
        }

        const data = await res.json();

        if (data && data.isSuccess && data.value) {
            // Ảnh đại diện
            if (data.value.hinhAnh && data.value.hinhAnh.trim() !== "") {
                $("#previewAnhDaiDien_AnPham").attr("src", data.value.hinhAnh.trim());
                $("#urlAnhDaiDien_AnPham").val(data.value.hinhAnh.trim());
            }
            // Loại hình tác phẩm
            $("#tacPhamID").val(data.value.tacPhamID).trigger("change");

            // Loại hình tác phẩm
            $("#theLoaiID_AnPham").val(data.value.theLoaiID).trigger("change");

            // Tình trạng tác phẩm
            $("#tinhTrangID_AnPham").val(data.value.tinhTrangID).trigger("change");

            // Mã định danh
            $("#maDinhDanh_AnPham").val((data.value.maDinhDanh || "").trim());

            // Năm công bố
            $("#namCongBo_AnPham").val(data.value.namCongBo).trigger("change");

            // Thứ tự
            $("#thuTu_AnPham").val(data.value.thuTu || 1);

            // Trạng thái duyệt (radio)
            if (data.value.suDung == 1) {
                $("#suDung_AnPham").prop("checked", true);
            } else {
                $("#khongSuDung_AnPham").prop("checked", true);
            }

            // Bản dịch
            tacPhamTranslations = data.value.banDich || [];
            console.log(tacPhamTranslations)
            let tiengViet = tacPhamTranslations.find(el => el.maNgonNgu === "vi") || null;
            if (tiengViet) {
                $("#ngonNgu_AnPham").val("vi").trigger("change");
                $("#tenTacPham_AnPham").val((tiengViet.tenTacPham || "").trim());
                $("#moTa_AnPham").val((tiengViet.moTa || "").trim());
                $("#tacGia_AnPham").val((tiengViet.tacGia || "").trim());
            }

            AnPham.toggleForm(true);
        } else {
            showNotification(0, data.error);
        }
    }
    catch (err) {
        showNotification(0, err.message);
    }
}
//#endregion INIT

//#region XỬ LÝ DỮ LIỆU
async function dataAddThongTinChung() {
    let tacPhamID = $('#tacPhamID').val();
    let anhDaiDien = $('#anhDaiDien_AnPham')[0]?.files[0] || null;
    let urlAnhDaiDien = $('#urlAnhDaiDien_AnPham').val() || null;

    let theLoaiID = $('#theLoaiID_AnPham').val() || null;
    let tinhTrangID = $('#tinhTrangID_AnPham').val() || null;
    let maDinhDanh = $('#maDinhDanh_AnPham').val()?.trim() || null;
    let namCongBo = $('#namCongBo_AnPham').val() || null;
    let suDung = $('input[name="trangThai_AnPham"]:checked').val() === "1";
    let thuTu = $('#thuTu_AnPham').val() || 1;

    // Lấy bản dịch tiếng Việt (bắt buộc phải có)
    let tenTiengViet = tacPhamTranslations.find(el => el.maNgonNgu === 'vi')?.tenTacPham || null;

    // Validate các trường bắt buộc
    if ((anhDaiDien == null && checkEmptyBlank(urlAnhDaiDien)) || !tenTiengViet || !maDinhDanh || !theLoaiID) {
        showNotification(0, 'Vui lòng nhập đầy đủ thông tin bắt buộc (*), bao gồm bản dịch tiếng Việt');
        return null;
    }

    // Gom object thông tin chung
    let thongTinChung = {
        TacPhamID: tacPhamID || null,
        TheLoaiID: theLoaiID,
        TinhTrangID: tinhTrangID || null,
        linhVucID: 284,
        MaDinhDanh: maDinhDanh,
        NamCongBo: namCongBo,
        ThuTu: thuTu != "" ? Number(thuTu) : 1,
        SuDung: suDung == '1' ? true : false,
        HinhAnh: urlAnhDaiDien
    };

    // Chuẩn bị formData để gửi lên server
    let formData = new FormData();
    formData.append("TacPham", JSON.stringify(thongTinChung));
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
                // Thêm vào TacPham_ToChuc
                dataAddNhaXuatBan(data.value.tacPhamID)
                // Thêm vào DaPhuongTien
                AnPham.toggleForm(false);
                AnPham.refresh();
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
                dataAddNhaXuatBan(data.value.tacPhamID)
                // Thêm vào DaPhuongTien
                AnPham.toggleForm(false);
                AnPham.refresh();
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            console.log(err.message)
        }
    }
}
async function dataDeleteThongTinChung() {
    let id = $('#idDelete').val();
    try {
        const res = await fetch(`/api/TacPhamApi/Xoa/${id}`, {
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
            AnPham.refresh();
        } else {
            console.log(data.error)
        }

    }
    catch (err) {
        showNotification(0, err.message)
    }
}
async function dataAddNhaXuatBan(tacPhamID) {
    try {
        if (checkEmptyBlank(tacPhamID) || checkEmptyBlank(coQuanId)) {
            return;
        }

        await fetch('/api/TacPhamApi/ToChuc/ThemMoi', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                TacPhamID: tacPhamID,
                ToChucID: coQuanId
            })
        })
    }
    catch (err) {
        console.log(err.message)
    }
};
//#endregion XỬ LÝ DỮ LIỆU

//#region HÀM LOAD DỮ LIỆU CHO CÁC COMBOBOX
/* async function initNgonNgu() {
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
                $("#ngonNgu_AnPham").append(`<option value="${lang.maNgonNgu?.toLowerCase()}">${lang.tenNgonNgu}</option>`);
            });
            $("#ngonNgu_AnPham").val('vi').trigger('change');
        } else {
            showNotification(0, data.error)
        }
    }
    catch (err) {
        showNotification(0, err.message)
    }
}; */

async function initTheLoai() {
    try {
        const res = await fetch('/api/DanhMucChungApi/DanhSach', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                loaiDanhMucID: 25,
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
                $("#theLoaiID_AnPham").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
            });
        } else {
            showNotification(0, data.error)
        }
    }
    catch (err) {
        console.log(err.message)
    }
};

async function initTinhTrang() {
    try {
        const res = await fetch('/api/DanhMucChungApi/DanhSach', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                loaiDanhMucID: 54,
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
                $("#tinhTrangID_AnPham").append(`<option value="${el.danhMucID}">${el.tenDanhMuc}</option>`);
            });
        } else {
            showNotification(0, data.error)
        }
    }
    catch (err) {
        console.log(err.message)
    }
};

async function initNamXuatBan() {
    try {
        const currentYear = new Date().getFullYear();
        for (let year = currentYear; year >= 1900; year--) {
            $("#namCongBo_AnPham").append(`<option value="${year}">${year}</option>`);
        }
    }
    catch (err) {
        console.log(err.message)
    }
};

//#endregion HÀM LOAD DỮ LIỆU CHO CÁC COMBOBOX