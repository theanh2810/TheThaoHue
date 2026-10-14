const baseUrl = getRootLink();

$(document).ready(function () {
    initSelect2();

    (async function () {
        await initNgonNgu();
        await initLoaiHinhThuVien();
        initTable();
    })();

    $('#tim-kiem').on('click', async function () {
        initTable()
    });

    $('#tat-ca').on('click', async function () {
        $('#tu-khoa-search').val("");
        $('#loai-hinh-search').val("-1").trigger('change');
        $('#quy-mo-search').val("-1").trigger('change');
        $('#trang-thai-search').val("-1").trigger('change');
        $('#ngon-ngu-search').val("-1").trigger('change');
        initTable()
    });

    async function initTable() {
        const tableApi = {
            url: `${baseUrl}/api/ToChucApi/DanhSach`,
            type: "POST",
            data: function (d) {
                var loaiHinhID = $('#loai-hinh-search').val()
                var quyMoID = $('#quy-mo-search').val()
                var maNgonNgu = $('#ngon-ngu-search').val()
                var suDung = $('#trang-thai-search').val()
                return JSON.stringify({
                    loaiToChucID: 101, // ID cho thư viện
                    tuKhoa: $('#tu-khoa-search').val() || null,
                    loaiHinhID: loaiHinhID == "-1" ? null : loaiHinhID,
                    quyMoID: quyMoID == "-1" ? null : quyMoID,
                    trangThaiID: suDung == "-1" ? null : Number(suDung),
                    maNgonNgu: maNgonNgu == "-1" ? null : maNgonNgu
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
                targets: 1, // Cột tên đơn vị
                render: function (data, type, row, meta) {
                    return `<div class="group-info">
                        <div class="info-main">
                            <a href="${baseUrl}/AdminTool/ThuVien/Details?id=${row.toChucID}" class="text-primary text-decoration-none">
                                ${row.tenToChuc || ''}
                            </a>
                        </div>
                        <div class="info-sub">${row.maDinhDanh || ''}</div>
                    </div>`;
                }
            },
            {
                targets: 2, // Cột loại hình
                render: function (data, type, row, meta) {
                    return row.loaiHinh || '';
                }
            },
            {
                targets: 3, // Cột quy mô
                render: function (data, type, row, meta) {
                    return row.quyMo || '';
                }
            },
            {
                targets: 4, // Cột năm thành lập
                render: function (data, type, row, meta) {
                    return row.namThanhLap || '';
                }
            },
            {
                targets: 5, // Cột giải thưởng - danh hiệu
                render: function (data, type, row, meta) {
                    return `<div class="group-info">
                        <div class="info-main">
                            <a href="${baseUrl}/AdminTool/ThuVien/GiaiThuongDanhHieu?id=${row.toChucID}" class="text-primary text-decoration-none">
                                ${row.soLuongGiaiThuong || 0}
                            </a>
                        </div>
                    </div>`;
                }
            },
            {
                targets: 6, // Cột trạng thái
                render: function (data, type, row, meta) {
                    if (row.trangThaiID == 1) {
                        return `<span class="TrangThai green-text">Duyệt</span>`;
                    } else {
                        return `<span class="TrangThai red-text">Chưa duyệt</span>`;
                    }
                }
            },
            {
                targets: 7, // Cột chức năng
                render: function (data, type, row, meta) {
                    let html = "";
                    if (permitedEdit) {
                        html += `<a href="${baseUrl}/AdminTool/ThuVien/Add?id=${row.toChucID}" data-toggle="tooltip" title="Chỉnh sửa" class="text-yellow me-2">
                                    <i class="hgi-icon hgi-edit"></i>
                                </a>`;
                    }
                    if (permitedDelete) {
                        html += `<i data-toggle="tooltip" title="Xóa" class="delete-command-btn text-red cursor-pointer" id="delete-${meta.row}">
                                    <i class="hgi-icon hgi-delete"></i>
                                </i>`;
                    }
                    if (!permitedEdit && !permitedDelete) {
                        html = `<span class="text-muted">Chỉ xem</span>`;
                    }
                    return html;
                }
            }
        ];

        const tableCols = [
            { "data": "stt", "width": "40px", "class": "left-align" },
            { "data": "tenToChuc", "class": "left-align name-text" },
            { "data": "loaiHinh", "width": "10%", "class": "left-align" },
            { "data": "quyMo", "width": "8%", "class": "left-align" },
            { "data": "namThanhLap", "width": "10%", "class": "left-align" },
            { "data": "soLuongGiaiThuong", "width": "15%", "class": "left-align name-text" },
            { "data": "trangThaiID", "width": "8%", "class": "left-align" },
            { "data": "", "width": "8%", "class": "center-align group-icon-action" }
        ];

        if (!permitedEdit && !permitedDelete) {
            tableCols.pop();
            tableDefs.pop();
        }

        initDataTableConfigNoSearch('dataGrid', tableApi, tableDefs, tableCols);

        // Event handler cho nút xóa
        $('#dataGrid tbody').on('click', '.delete-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGrid').DataTable().row(id).data();

            $('#idDelete').val(data.toChucID);
            $('#nameDelete').text(`${data.tenToChuc}`);

            $('#modalDelete').modal('show');
        });
    }

    document.getElementById("tu-khoa-search").addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            initTable()
        }
    });

    $("#formDelete").on("submit", async function (e) {
        e.preventDefault();
        
        const submitBtn = $(this).find('button[type="submit"]');
        if (submitBtn.prop('disabled')) {
            return;
        }
        
        submitBtn.prop('disabled', true);
        const originalText = submitBtn.text();
        submitBtn.text('Đang xóa...');
        
        try {
            await dataDelete();
        } catch (error) {
            console.error('Lỗi khi xử lý form:', error);
        } finally {
            setTimeout(() => {
                submitBtn.prop('disabled', false);
                submitBtn.text(originalText);
            }, 1000);
        }
    });

    async function dataDelete() {
        let id = $('#idDelete').val();

        try {
            const res = await fetch(`${baseUrl}/api/ToChucApi/Xoa/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }

            const data = await res.json();
            if (data && data.isSuccess && data.value) {
                showNotification(1, 'Xoá thành công')
                $('#modalDelete').modal('hide');
                $('#dataGrid').DataTable().ajax.reload();
            } else {
                showNotification(0, data.error)
            }
        }
        catch (err) {
            showNotification(0, err.message)
        }
    }

    async function initNgonNgu() {
        try {
            const res = await fetch(`${baseUrl}/api/NgonNguApi/DanhSach`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    trangThai: true,
                    tuKhoa: null
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            
            const data = await res.json();

            if (data && data.isSuccess && data.value) {
                $("#ngon-ngu-search").empty();
                $("#ngon-ngu-search").append(`<option value="-1">Tất cả</option>`);
                
                data.value.forEach(lang => {
                    $("#ngon-ngu-search").append(`<option value="${lang.maNgonNgu?.toLowerCase()}">${lang.tenNgonNgu}</option>`);
                });
                
                $("#ngon-ngu-search").val('-1').trigger('change');
            } else {
                console.log('Lỗi khi tải danh sách ngôn ngữ:', data.error)
            }
        }
        catch (err) {
            console.log('Lỗi khi gọi API ngôn ngữ:', err.message)
        }
    }

    async function initLoaiHinhThuVien() {
        try {
            const res = await fetch(`${baseUrl}/api/DanhMucChungApi/DanhSach`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loaiDanhMucID: "25", // Loại hình thư viện
                    trangThai: true
                })
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            
            const data = await res.json();

            if (data && data.isSuccess && data.value) {
                $("#loai-hinh-search").empty();
                $("#loai-hinh-search").append(`<option value="-1">Tất cả</option>`);
                
                data.value.forEach(item => {
                    $("#loai-hinh-search").append(`<option value="${item.danhMucID}">${item.tenDanhMuc}</option>`);
                });
                
                $("#loai-hinh-search").val('-1').trigger('change');
            } else {
                console.log('Lỗi khi tải danh sách loại hình:', data.error)
            }
        }
        catch (err) {
            console.log('Lỗi khi gọi API loại hình:', err.message)
        }
    }
})
