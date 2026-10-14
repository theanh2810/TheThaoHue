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
        url: `${baseUrl}/api/DM_BannerApi/Gets?MaNgonNgu=vi`,
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
                return `<div class="group-info have-image" id=n-"${meta.row}">
                            <div class="have-image">
                                <img src="${row.anhDaiDien || '/assets/images/vector/no-image.png'}" alt="${row.tenBanner || ''}" onerror="this.onerror=null;this.src='/assets/images/vector/no-image.png';" />
                            </div>
                            <div class="group-info">
                                <div class="info-main">
                                    <a href="${baseUrl}/AdminTool/Banner/Details?id=${row.bannerID}" class="text-primary text-decoration-none">
                                        ${row.tenBanner || ''}
                                    </a>
                                </div>
                                <div class="info-sub">${row.moTa || ''}</div>
                            </div>
                        </div>`;
            }
        },
        {
            targets: 2, // Chức năng
            render: function (data, type, row, meta) {
                let html = ``;
                switch (row.linhVucID ) {
                    case 0:
                        html = `Trang chủ`;
                        break;
                    case 2:
                        html = `Văn hóa`;
                        break;
                    case 1:
                        html = `Du lịch`;
                        break;
                    case 3:
                        html = `Thể thao - Báo chí`;
                        break;
                }
                return html;
            }
        },
        {
            targets: 3, // Chức năng
            render: function (data, type, row, meta) {
                let html = "";
                if (permitedEdit) {
                    html += `<a href="${baseUrl}/AdminTool/Banner/Edit?id=${row.bannerID}" data-toggle="tooltip" title="Chỉnh sửa" class="text-yellow me-2">
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
        {"data": "", "width": "8%", "class": "left-align" },
        { "data": "", "width": "8%", "class": "center-align group-icon-action" }
    ];

    if (!permitedEdit && !permitedDelete) {
        tableCols.pop();
        tableDefs.pop();
    }

    initDataTableConfigNoSearch('dataGridBanner', tableApi, tableDefs, tableCols);

    // Event handler cho nút xóa
    $('#dataGridBanner tbody').on('click', '.delete-command-btn', function () {
        var id = $(this).attr("ID").match(/\d+/)[0];
        var data = $('#dataGridBanner').DataTable().row(id).data();

        $('#idDelete').val(data.bannerID);
        $('#nameDelete').text(`${data.tenBanner}`);

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
        url: `${baseUrl}/api/DM_BannerApi/Delete?ThanhTichID=${id}`,
        type: 'DELETE',
        contentType: 'application/json',
        success: function (data) {
            if (data && data.isSuccess && data.value) {
                showNotification(1, 'Xoá thành công')
                $('#modalDelete').modal('hide');
                $('#dataGridBanner').DataTable().ajax.reload();
            } else {
                showNotification(0, data.error)
            }
        },
        error: function (err) {
            showNotification(0, 'Có lỗi xảy ra, vui lòng thử lại sau')
        }
    })
}
