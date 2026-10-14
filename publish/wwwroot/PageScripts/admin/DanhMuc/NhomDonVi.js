const baseUrl = getRootLink();

$(document).ready(function () {
    initTable();
    loadDanhSachDonVi();
    setTimeout(() => {
        initSelect2()
    }, 500);

    let selectedDetails = [];

    $('#openModalAdd').on('click', function () {
        openAddModal();
    });

    $('#formAdd').on('submit', async function (e) {
        e.preventDefault();
        await saveGroup();
    });

    $('#formDelete').on('submit', async function (e) {
        e.preventDefault();
        await deleteGroup();
    });

    $('input[name="loaiDonViAdd"]').on('change', function () {
        toggleDonViType();
    });

    $('#addDetailButton').on('click', function () {
        addSelectedDetail();
    });

    $(document).on('click', '.remove-detail-item', function () {
        const index = $(this).data('index');
        selectedDetails.splice(index, 1);
        renderDetails();
    });

    function toggleDonViType() {
        const selectedType = $('input[name="loaiDonViAdd"]:checked').val();
        if (selectedType === '1') {
            $('#selectCapXaAdd').closest('.form-group').show();
            $('#selectToChucAdd').closest('.form-group').hide();
        } else {
            $('#selectCapXaAdd').closest('.form-group').hide();
            $('#selectToChucAdd').closest('.form-group').show();
        }
    }

    async function loadDanhSachDonVi() {
        try {
            const capXaRes = await fetch(`${baseUrl}/api/CapXaApi/Gets`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            const capXaData = await capXaRes.json();
            const capXaList = capXaData?.resultObj || [];
            $('#selectCapXaAdd').empty().append('<option value="">Chọn phường/xã</option>');
            capXaList.forEach(item => {
                $('#selectCapXaAdd').append(`<option value="${item.xaID}">${item.noiDung} (${item.tenTinh || ''})</option>`);
            });

            const toChucRes = await fetch(`${baseUrl}/api/ToChucApi/DanhSach`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ MaNgonNgu: 'vi' })
            });
            const toChucData = await toChucRes.json();
            const toChucList = toChucData?.resultObj || toChucData?.result?.value || [];
            $('#selectToChucAdd').empty().append('<option value="">Chọn tổ chức</option>');
            toChucList.forEach(item => {
                const label = item.tenToChuc || item.noiDung || item.hopThu || item.maDinhDanh || '---';
                $('#selectToChucAdd').append(`<option value="${item.toChucID}">${label}</option>`);
            });

            toggleDonViType();
        } catch (error) {
            console.error(error);
        }
    }

    function addSelectedDetail() {
        const selectedType = $('input[name="loaiDonViAdd"]:checked').val();
        const isPhuongXa = selectedType === '1';
        const selectedValue = isPhuongXa ? $('#selectCapXaAdd').val() : $('#selectToChucAdd').val();
        const selectedText = isPhuongXa ? $('#selectCapXaAdd option:selected').text() : $('#selectToChucAdd option:selected').text();

        if (!selectedValue) {
            showNotification(0, 'Vui lòng chọn cơ quan để thêm vào nhóm');
            return;
        }

        const exists = selectedDetails.find(item => item.donViID === selectedValue && item.loaiDonVi === (isPhuongXa ? 1 : 2));
        if (exists) {
            showNotification(0, 'Cơ quan này đã tồn tại trong danh sách');
            return;
        }

        selectedDetails.push({
            loaiDonVi: isPhuongXa ? 1 : 2,
            donViID: selectedValue,
            tenDonVi: selectedText
        });

        renderDetails();
    }

    function renderDetails() {
        const tbody = $('#detailTable tbody');
        tbody.empty();
        selectedDetails.forEach((item, index) => {
            tbody.append(`<tr>
                <td>${index + 1}</td>
                <td>${item.tenDonVi}</td>
                <td>${item.loaiDonVi === 1 ? 'Phường/Xã' : 'Tổ chức'}</td>
                <td class="text-center"><button type="button" class="btn btn-sm btn-danger remove-detail-item" data-index="${index}">Xóa</button></td>
            </tr>`);
        });
    }

    function openAddModal() {
        $('#nhomDonViID').val('');
        $('#tenNhomAdd').val('');
        $('#trangThaiActive').prop('checked', true);
        selectedDetails = [];
        renderDetails();
        $('#modalAddTitle').text('Thêm mới nhóm đơn vị');
        $('#modalAdd').modal('show');
        toggleDonViType();
    }

    // reset modal
    $("#modalAdd").on('hidden.bs.modal', function () {
        $(this).find('input[type=text], input[type=date], textarea').val('');
        $('#nhomDonViID').val('');
        $('#selectCapXaAdd').val([]).trigger('change');

        console.log("tat modal")
    });
    
    async function initTable() {
        const tableApi = {
            url: `${baseUrl}/api/NhomDonViApi/Gets`,
            type: 'GET',
            contentType: 'application/json; charset=utf-8',
            dataSrc: function (data) {
                if (data && data.isSuccessed && data.resultObj) {
                    return data.resultObj.map((item, index) => ({
                        stt: index + 1,
                        nhomDonViID: item.nhomDonViID,
                        tenNhom: item.tenNhom,
                        soLuongDonVi: item.soLuongDonVi,
                        trangThai: item.trangThai
                    }));
                }
                return [];
            }
        };

        const tableDefs = [
            {
                targets: 3,
                render: function (data, type, row, meta) {
                    if (row.trangThai == false || row.trangThai == 0) {
                        return `<i class="hgi-icon hgi-cancel"></i>`;
                    }
                    return `<i class="hgi-icon hgi-check"></i>`;
                }
            },
            {
                targets: 4,
                render: function (data, type, row, meta) {
                    let html = '';
                    if (permitedEdit) {
                        html += `<i data-toggle="tooltip" title="Chỉnh sửa" class="edit-command-btn text-yellow" data-row="${meta.row}"><i class="hgi-icon hgi-edit"></i></i>`;
                    }
                    if (permitedDelete) {
                        html += `<i data-toggle="tooltip" title="Xóa" class="delete-command-btn text-red" data-row="${meta.row}"><i class="hgi-icon hgi-delete"></i></i>`;
                    }
                    return html;
                }
            }
        ];

        const tableCols = [
            { data: 'stt', width: '40px', class: 'center-align' },
            { data: 'tenNhom', class: 'left-align' },
            { data: 'soLuongDonVi', width: '120px', class: 'center-align' },
            { data: 'trangThai', width: '120px', class: 'center-align' },
            { data: '', width: '120px', class: 'center-align group-icon-action' }
        ];

        if (!permitedEdit && !permitedDelete) {
            tableCols.pop();
            tableDefs.pop();
        }

        initDataTableConfig('dataGrid', tableApi, tableDefs, tableCols);

        // Gắn sự kiện vào ô input tìm kiếm mặc định
        $('#dataGrid_wrapper .dt-search input')
            .unbind() // Bỏ event mặc định của DataTables
            .bind('keyup', function (e) {
                if (e.key === 'Enter' || e.keyCode === 13) {
                    $('#dataGrid').DataTable().search(this.value).draw(); // Thực hiện search khi Enter
                }
            });

        $(".New_Table .dt-search input").prependTo(".New_Table .group-button").addClass("search-icon").attr("style", "width: 350px;")
        $(".New_Table .dt-search label").remove()

        $('#dataGrid tbody').on('click', '.edit-command-btn', async function () {
            const id = $(this).data('row');
            const data = $('#dataGrid').DataTable().row(id).data();

            console.log(data, "data edit")
            await openEditModal(data.nhomDonViID);
        });

        $('#dataGrid tbody').on('click', '.delete-command-btn', function () {
            const id = $(this).data('row');
            const data = $('#dataGrid').DataTable().row(id).data();
            $('#idDelete').val(data.nhomDonViID);
            $('#nameDelete').text(data.tenNhom);
            $('#modalDelete').modal('show');
        });
    }

    async function openEditModal(id) {
        try {
            const res = await fetch(`${baseUrl}/api/NhomDonViApi/GetById?id=${id}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!res.ok) {
                throw new Error('Không thể tải thông tin nhóm đơn vị');
            }
            const data = await res.json();
            if (!data.isSuccessed) {
                showNotification(0, data.message || 'Không thể tải thông tin nhóm đơn vị');
                return;
            }

            const group = data.resultObj;
            console.log(group, "data group")

            $('#nhomDonViID').val(group.nhomDonViID);
            $('#tenNhomAdd').val(group.tenNhom);
            $(`input[name='trangThaiAdd'][value='${group.trangThai ? '1' : '0'}']`).prop('checked', true);
            selectedDetails = (group.chiTiets || []).map(item => ({
                loaiDonVi: item.loaiDonVi,
                donViID: item.donViID,
                tenDonVi: item.tenDonVi
            }));
            renderDetails();

            //load dữ liệu vào nhóm
            var arrToChuc = [];
            if (group.chiTiets) {
                console.log("co vao day")
                group.chiTiets.forEach(item => {
                    //console.log(item);
                    arrToChuc.push(item.donViID)
                })
                    //.split(',').map(item => item.trim().toLowerCase())
            }
            console.log(arrToChuc, "arrToChuc");
            $('#selectCapXaAdd').val(arrToChuc).trigger('change');

            $('#modalAddTitle').text(`Chỉnh sửa nhóm đơn vị ${group.tenNhom}`);
            $('#modalAdd').modal('show');
            toggleDonViType();
        } catch (error) {
            console.error(error);
            showNotification(0, 'Lỗi tải dữ liệu');
        }
    }

    async function saveGroup() {
        const id = $('#nhomDonViID').val();
        const tenNhom = $('#tenNhomAdd').val().trim();
        const trangThai = $('input[name="trangThaiAdd"]:checked').val() === '1';

        const listToChucID = $("#selectCapXaAdd").val().map(item => item).join(',');

        if (!tenNhom) {
            showNotification(0, 'Vui lòng nhập tên nhóm');
            return;
        }

        const payload = {
            NhomDonViID: id || null,
            TenNhom: tenNhom,
            TrangThai: trangThai,
            //DanhSachChiTiet: selectedDetails.map(item => ({ LoaiDonVi: item.loaiDonVi, DonViID: item.donViID })),
            ListDonViID: listToChucID
        };

        const method = id ? 'PUT' : 'POST';
        const url = id ? '/api/NhomDonViApi/Edit' : '/api/NhomDonViApi/Add';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText);
            }
            const data = await res.json();
            if (data && data.isSuccess) {
                showNotification(1, id ? 'Cập nhật nhóm đơn vị thành công' : 'Thêm mới nhóm đơn vị thành công');
                $('#modalAdd').modal('hide');
                $('#dataGrid').DataTable().ajax.reload(null, false);
            } else if (data && data.error) {
                showNotification(0, data.error);
            } else {
                showNotification(0, data.message || 'Đã xảy ra lỗi');
            }
        } catch (err) {
            console.error(err);
            showNotification(0, err.message || 'Đã xảy ra lỗi khi lưu nhóm đơn vị');
        }
    }

    async function deleteGroup() {
        const id = $('#idDelete').val();
        try {
            const res = await fetch(`/api/NhomDonViApi/Delete?id=${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText);
            }
            const data = await res.json();
            if (data && data.isSuccessed) {
                showNotification(1, 'Xóa nhóm đơn vị thành công');
                $('#modalDelete').modal('hide');
                $('#dataGrid').DataTable().ajax.reload(null, false);
            } else {
                showNotification(0, data.message || 'Đã xảy ra lỗi khi xóa');
            }
        } catch (err) {
            console.error(err);
            showNotification(0, err.message || 'Đã xảy ra lỗi khi xóa');
        }
    }
});
