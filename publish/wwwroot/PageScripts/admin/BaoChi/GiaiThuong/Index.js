const baseUrl = getRootLink();

$(document).ready(function () {
    initSelect2()
    initDatePicker()
    //initDanhMucChung_NoAll(29, "#loai-co-so-search", "") // Loại cơ sở lưu trú
    //initDanhMucChung_NoAll(49, "#phong-cach-search", "") // Phong cách cơ sở
    initNgonNgu("#ngon-ngu-search")
    initTable()

    $('#tim-kiem').on('click', async function () {
        initTable()
    });

    $('#tat-ca').on('click', async function () {
        $('#tu-khoa-search').val("");
        $('#loai-co-so-search').val("").trigger('change');
        $('#phong-cach-search').val("").trigger('change');
        $('#trang-thai-search').val("-1").trigger('change');
        $('#ngon-ngu-search').val("").trigger('change');
        initTable()
    });
})

function initTable() {
    const tableApi = {
        url: `${baseUrl}/api/DM_ThanhTichApi/Gets?MaNgonNgu=vi`,
        type: "GET",
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
            targets: 1, // Tên cơ sở lưu trú
            render: function (data, type, row, meta) {
                return `<div class="group-info" id=n-"${meta.row}">
                            <div class="group-info">
                                <div class="info-main">
                                    <a href="${baseUrl}/AdminTool/GiaiThuong/Details?id=${row.thanhTichID}" class="text-primary text-decoration-none">
                                        ${row.tenThanhTich || ''}
                                    </a>
                                </div>
                                <div class="info-sub">${row.tenToChuc || ''}</div>
                            </div>
                        </div>`;
            }
        },
        {
            targets: 5, // Trạng thái
            render: function (data, type, row, meta) {
                if (row.trangThai) {
                    return `<span class="TrangThai green-text">Hoạt động</span>`;
                } else {
                    return `<span class="TrangThai red-text">Không hoạt động</span>`;
                }
            }
        },
        {
            targets: 6, // Chức năng
            render: function (data, type, row, meta) {
                let html = "";
                if (permitedEdit) {
                    html += `<a href="${baseUrl}/AdminTool/BaoChi/Edit_GiaiThuong?id=${row.thanhTichID}" data-toggle="tooltip" title="Chỉnh sửa" class="text-yellow me-2">
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
        { "data": "stt", "width": "40px", "class": "center-align" },
        { "data": "", "class": "left-align name-text" },
        { "data": "tenLoai", "width": "10%", "class": "center-align" },
        { "data": "tenCap", "width": "10%", "class": "center-align" },
        { "data": "tenHang", "width": "10%", "class": "center-align" },
        { "data": "", "width": "10%", "class": "left-align name-text" },
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

        $('#idDelete').val(data.thanhTichID);
        $('#nameDelete').text(`${data.tenThanhTich}`);

        $('#modalDelete').modal('show');
    });

    $("#formDelete").on("submit", function (e) {
        e.preventDefault();

        const submitBtn = $(this).find('button[type="submit"]');
        if (submitBtn.prop('disabled')) {
            return;
        }

        submitBtn.prop('disabled', true);
        const originalText = submitBtn.text();
        submitBtn.text('Đang xóa...');

        try {
            dataDelete();
        } catch (error) {
            console.error('Lỗi khi xử lý form:', error);
        } finally {
            setTimeout(() => {
                submitBtn.prop('disabled', false);
                submitBtn.text(originalText);
            }, 1000);
        }
    });
}

function dataDelete() {
    let id = $('#idDelete').val();
    $.ajax({
        url: `${baseUrl}/api/DM_ThanhTichApi/Delete?ThanhTichID=${id}`,
        type: 'DELETE',
        contentType: 'application/json',
        success: function (data) {
            if (data && data.isSuccess && data.value) {
                showNotification(1, 'Xoá thành công')
                $('#modalDelete').modal('hide');
                $('#dataGrid').DataTable().ajax.reload();
            } else {
                showNotification(0, data.error)
            }
        },
        error: function (err) {
            showNotification(0, 'Có lỗi xảy ra, vui lòng thử lại sau')
        }
    })
}
