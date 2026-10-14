const baseUrl = getRootLink();

$(document).ready(function () {
    let menu = {}

    initSelect2();
    getRolesSelect()

    $(() => {
        //$('#simple-treeview').dxTreeView({
        //    createChildren(parent) {
        //        const parentId = parent ? parent.itemData.id : '';
        //        return $.ajax({
        //            url: `/api/adminmenuapi/getmenu/${parentId}`,
        //            dataType: 'json',
        //        });
        //    },
        //    expandNodesRecursive: false,
        //    rootValue: '',
        //    dataStructure: 'plain',
        //    height: '100%',
        //    keyExpr: "id",
        //    displayExpr: "title",
        //    parentIdExpr: "parentId",
        //    hasItemsExpr: "hasChildren",
        //    onItemClick: async function (evt) {
        //        const itemDt = evt.itemData;
        //        menu = evt.itemData
        //        //console.log(menu)
        //        if (itemDt.hasChildren === true) {
        //            loadTable()
        //            return;
        //        }
        //        loadTable()
        //    }
        //});
        $('#simple-treeview').dxTreeView({
            dataSource: new DevExpress.data.CustomStore({
                key: 'id',
                load(loadOptions) {
                    const deferred = $.Deferred();
                    $.ajax({
                        url: '/api/adminmenuapi/danhsachmenu',
                        dataType: 'json',
                        success(result) {
                            console.log(result);
                            deferred.resolve(result)
                        },
                        error() {
                            deferred.reject('Data Loading Error');
                        },
                        timeout: 5000,
                    });

                    return deferred.promise();
                },
            }),
            expandNodesRecursive: false,
            rootValue: '',
            dataStructure: 'plain',
            height: 'calc(100vh - 182px)',
            keyExpr: "id",
            displayExpr: "title",
            parentIdExpr: "parentId",
            hasItemsExpr: "hasChildren",
            searchEnabled: true,
            searchMode: "contains",
            searchExpr: ["title"],
            onItemClick: async function (evt) {
                const itemDt = evt.itemData;
                menu = evt.itemData
                $('#simple-treeview .dx-treeview-item').removeClass('isActive');
                $(evt.itemElement).addClass('isActive');
                //console.log(menu)
                if (itemDt.hasChildren === true) {

                    loadTable()
                    return;
                }
                loadTable()
            }
        }).dxTreeView('instance');
    });

    function loadTable() {
        $('#content_phanquyen').empty();
        $('#tenMenu').parent().removeClass('d-none')
        $('#menu_list').addClass('col-lg-4').removeClass('col-lg-12')
        $('#menu_detail').removeClass('d-none')
        if (menu != null && menu.hasChildren == true) {
            $('#content_phanquyen').empty();
            return;
        }
        
        let htmlTable = `  <div class="TieuDe group-button group-title-button">
                                <h2 class="content-header-title mb-0" id="tenMenu">${menu.title}</h2>
                                
                                <div class="btn-close"></div>
                            </div>
                            <div class="New_Table table-responsive">
                                <div class="group-button flex-end"><button type="submit" class="btn btn-success" id="btn-modalAdd" @*data-toggle="modal" data-target="#modalAdd"*@>Thêm mới</button></div>
                                <table class="table row-border" id="dataGrid" width="100%" cellspacing="0">
                                    <thead>
                                        <tr>
                                            <th>Stt</th>
                                            <th>Vai trò</th>
                                            <th>Cho phép tạo</th>
                                            <th>Cho phép sửa</th>
                                            <th>Cho phép xóa</th>
                                            <th>Cho phép duyệt</th>
                                            <th>Chức năng</th>
                                        </tr>
                                    </thead>
                                </table>
                            </div>`

        $('#content_phanquyen').append(htmlTable);
        const tableData = {
            url: `${baseUrl}/api/AdminMenuApi/getmenupermission/` + menu.id,
            type: "Get",
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            dataSrc: function (data) {
                if (data && data.length > 0) {

                    for (let i = 0; i < data.length; i++) {
                        data[i].stt = i + 1
                    }
                    return data;
                }
                return [];
            },
        };

        const tableDefs = [
            {
                targets: [2,3,4,5],
                render: function (data, type, row, meta) {
                    if (data) {
                        return `<i class="icon-fluent icon_fluent_checkmark_filled text-green"></i>`
                    } else {
                        return `<i class="icon-fluent icon_fluent_dismiss_filled text-red"></i>`
                    }
                }
            },
            {
                targets: 6,
                render: function (data, type, row, meta) {
                    return `<i data-toggle="tooltip" title="Chỉnh sửa" class="edit-command-btn text-yellow" id=n-"${meta.row}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path opacity="0.4" d="M3.26538 21.9613L3.54536 21.9686C5.6032 22.0224 6.63212 22.0493 7.56806 21.6837C8.504 21.3182 9.25287 20.5969 10.7506 19.1543L19.655 10.5779L13.5 4.5L4.78943 13.9445C3.57944 15.2555 2.97444 15.9109 2.62371 16.7182C2.27297 17.5255 2.20301 18.4235 2.06308 20.2197L2.03608 20.5662C1.98636 21.2043 1.9615 21.5234 2.14359 21.73C2.32567 21.9367 2.63891 21.9449 3.26538 21.9613Z" fill="#FFB900"></path>
                                    <path d="M14.0737 3.88545C14.8189 3.07808 15.1915 2.6744 15.5874 2.43893C16.5427 1.87076 17.7191 1.85309 18.6904 2.39232C19.0929 2.6158 19.4769 3.00812 20.245 3.79276C21.0131 4.5774 21.3972 4.96972 21.6159 5.38093C22.1438 6.37312 22.1265 7.57479 21.5703 8.5507C21.3398 8.95516 20.9446 9.33578 20.1543 10.097L10.7506 19.1543C9.25288 20.5969 8.504 21.3182 7.56806 21.6837C6.63212 22.0493 5.6032 22.0224 3.54536 21.9686L3.26538 21.9613C2.63891 21.9449 2.32567 21.9367 2.14359 21.73C1.9615 21.5234 1.98636 21.2043 2.03608 20.5662L2.06308 20.2197C2.20301 18.4235 2.27297 17.5255 2.62371 16.7182C2.97444 15.9109 3.57944 15.2555 4.78943 13.9445L14.0737 3.88545Z" stroke="#FFB900" stroke-width="1.5" stroke-linejoin="round"></path>
                                    <path d="M13 4L20 11" stroke="#FFB900" stroke-width="1.5" stroke-linejoin="round"></path>
                                    <path d="M14 22H22" stroke="#FFB900" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                </svg>
                            </i>
                            <i data-toggle="tooltip" title="Xóa" class="delete-command-btn text-red" id=n-"${meta.row}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path opacity="0.4" d="M19.5 5.5L18.8803 15.5251C18.7219 18.0864 18.6428 19.3671 18.0008 20.2879C17.6833 20.7431 17.2747 21.1273 16.8007 21.416C15.8421 22 14.559 22 11.9927 22C9.42312 22 8.1383 22 7.17905 21.4149C6.7048 21.1257 6.296 20.7408 5.97868 20.2848C5.33688 19.3626 5.25945 18.0801 5.10461 15.5152L4.5 5.5H19.5Z" fill="#E31400"></path>
                                    <path d="M19.5 5.5L18.8803 15.5251C18.7219 18.0864 18.6428 19.3671 18.0008 20.2879C17.6833 20.7431 17.2747 21.1273 16.8007 21.416C15.8421 22 14.559 22 11.9927 22C9.42312 22 8.1383 22 7.17905 21.4149C6.7048 21.1257 6.296 20.7408 5.97868 20.2848C5.33688 19.3626 5.25945 18.0801 5.10461 15.5152L4.5 5.5" stroke="#E31400" stroke-width="1.5" stroke-linecap="round"></path>
                                    <path d="M21 5.5H3" stroke="#E31400" stroke-width="1.5" stroke-linecap="round"></path>
                                    <path d="M16.0575 5.5L15.3748 4.09173C14.9213 3.15626 14.6946 2.68852 14.3035 2.39681C14.2167 2.3321 14.1249 2.27454 14.0288 2.2247C13.5957 2 13.0759 2 12.0363 2C10.9706 2 10.4377 2 9.99745 2.23412C9.89986 2.28601 9.80675 2.3459 9.71906 2.41317C9.3234 2.7167 9.10239 3.20155 8.66037 4.17126L8.05469 5.5" stroke="#E31400" stroke-width="1.5" stroke-linecap="round"></path>
                                    <path d="M9.5 16.5V10.5" stroke="#E31400" stroke-width="1.5" stroke-linecap="round"></path>
                                    <path d="M14.5 16.5V10.5" stroke="#E31400" stroke-width="1.5" stroke-linecap="round"></path>
                                </svg>
                            </i>`;
                }
            }
        ];

        const tableCols = [
            { "data": "stt", "width": "5%", "class": "center-align" },
            { "data": "rolename", "width": "20%", "class": "left-align" },
            { "data": "permitedCreate", "width": "16%", "class": "center-align" },
            { "data": "permitedEdit", "width": "16%", "class": "center-align" },
            { "data": "permitedDelete", "width": "16%", "class": "center-align" },
            { "data": "permitedApprove", "width": "16%", "class": "center-align " },
            { "data": "", "width": "10%", "class": "center-align group-icon-action" },
        ];

        initDataTableConfigNoSearch('dataGrid', tableData, tableDefs, tableCols)

        $('#btn-modalAdd').on('click', function () {
            if (menu != null && menu.id != null && menu.hasChildren == false) {
                $('#menuID').val(menu.id);
                $('#modalAdd').modal('show');
            }
        })

        $('#dataGrid tbody').on('click', '.edit-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGrid').DataTable().row(id).data();
            $('#idEdit').val(data.id);
            $('#menuIDEdit').val(data.menuId);

            $('#select_vaiTro_Edit').val(data.rolename).trigger('change');
            $('#select_choPhepTao_Edit').val(data.permitedCreate == true ? 'true' : 'false').trigger('change');
            $('#select_choPhepSua_Edit').val(data.permitedEdit == true ? 'true' : 'false').trigger('change');
            $('#select_choPhepXoa_Edit').val(data.permitedDelete == true ? 'true' : 'false').trigger('change')
            $('#select_choPhepDuyet_Edit').val(data.permitedApprove == true ? 'true' : 'false').trigger('change')

            $('#modalEdit').modal('show');
        })

        $('#dataGrid tbody').on('click', '.delete-command-btn', function () {
            var id = $(this).attr("ID").match(/\d+/)[0];
            var data = $('#dataGrid').DataTable().row(id).data();
            $('#idDelete').val(data.id);
            $('#nameDelete').text(data.rolename);

            $('#modalDelete').modal('show');
        })
    }

    $('.btn-close').on('click', function () {
        $('#menu_list').addClass('col-lg-12').removeClass('col-lg-4')
        $('#menu_detail').addClass('d-none')
    })
    
    $("#formAdd").submit(function (e) {
        e.preventDefault();
        dataAdd();
    });
    $("#formEdit").submit(function (e) {
        e.preventDefault();
        dataEdit();
    });
    $("#formDelete").submit(function (e) {
        e.preventDefault();
        dataDelete();
    });


    async function dataAdd() {
        let rolename = $('#select_vaiTro_Add').val();
        let permitedDelete = $('#select_choPhepXoa_Add').val();
        let permitedEdit = $("#select_choPhepSua_Add").val()
        let permitedCreate = $("#select_choPhepTao_Add").val()
        let permitedApprove = $('#select_choPhepDuyet_Add').val();
        let menuid = $('#menuID').val();
        
        let dt = {
            RoleName: rolename,
            MenuId: menuid,
            PermitedEdit: permitedEdit === "true" ? true : false,
            PermitedCreate: permitedCreate === "true" ? true : false,
            PermitedDelete: permitedDelete === "true" ? true : false,
            PermitedApprove: permitedApprove === "true" ? true : false
        }
        
        try {
            const res = await fetch('/api/AdminMenuApi/AddMenuPermission', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dt)
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            showNotification(1, 'Thêm mới phân quyền thành công')
            $('#modalAdd').modal('hide');
            $('#dataGrid').DataTable().ajax.reload().draw();
        }
        catch (err) {
            showNotification(0, err.message)
        }
    }
    async function dataEdit() {
        let id = $('#idEdit').val();
        let rolename = $('#select_vaiTro_Edit').val();
        let permitedCreate = $('#select_choPhepTao_Edit').val();
        let permitedDelete = $('#select_choPhepXoa_Edit').val();
        let permitedEdit = $("#select_choPhepSua_Edit").val()
        let permitedApprove = $('#select_choPhepDuyet_Edit').val();
        let menuid = $('#menuIDEdit').val();

        let dt = {
            Id : id,
            RoleName: rolename,
            MenuId: menuid,
            PermitedCreate: permitedCreate === "true" ? true : false,
            PermitedEdit: permitedEdit === "true" ? true : false,
            PermitedDelete: permitedDelete === "true" ? true : false,
            PermitedApprove: permitedApprove === "true" ? true : false
        }

        try {
            const res = await fetch('/api/AdminMenuApi/UpdateMenuPermission', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dt)
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            showNotification(1, 'Cập nhật phân quyền thành công')
            $('#modalEdit').modal('hide');
            $('#dataGrid').DataTable().ajax.reload().draw();
        }
        catch (err) {
            showNotification(0, err.message)
        }
    }
    async function dataDelete() {
        let id = $('#idDelete').val();

      
        try {
            const res = await fetch('/api/AdminMenuApi/DeleteMenuPermission/' + id, {
                method: 'DELETE'
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            showNotification(1, 'Xóa phân quyền thành công')
            $('#modalDelete').modal('hide');
            $('#dataGrid').DataTable().ajax.reload().draw();
        }
        catch (err) {
            showNotification(0, err.message)
        }
    }

    function getRolesSelect() {

        getDataWithApi('GET', `/api/AccountApi/GetAllRoles`)
            .then((data) => {
                if (data && data.length > 0) {
                    for (let i = 0; i < data.length; i++) {
                        $('#select_vaiTro_Add').append(`<option value="${data[i].name}">${data[i].name}</option>`);
                        $('#select_vaiTro_Edit').append(`<option value="${data[i].name}">${data[i].name}</option>`);
                    }
                }
            })
    };
})