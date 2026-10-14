const baseUrl = getRootLink();

$(function () {
    let data = {}

    initSelect2();
    //getMenuChaSelect()
    //getNhomMenuSelect()

    //$('#parentIdAdd').select2({
    //    theme: 'bootstrap4',
    //    width: $(this).data('width') ? $(this).data('width') : $(this).hasClass('w-100') ? '100%' : 'style',
    //    language: "vi",
    //    allowClear: true,
    //    placeholder: $(this).data('placeholder'),
    //    dropdownParent: $('.content-wrapper').length > 0 ? $('.content-wrapper') : $('body')
    //});

    //$('#parentIdAdd').on('change', function (e) {
    //    let value = $(this).val();
    //    if (!value) {
    //        $('#areaNameAdd').prop('disabled', true);
    //        $('#controllerNameAdd').prop('disabled', true);
    //        $('#actionNameAdd').prop('disabled', true);
    //    } else {
    //        $('#areaNameAdd').prop('disabled', false);
    //        $('#controllerNameAdd').prop('disabled', false);
    //        $('#actionNameAdd').prop('disabled', false);
    //    }
    //});

    $(function () {
        //const treeView = $('#simple-treeview').dxTreeView({
        //    createChildren(parent) {
        //        parentId = parent ? parent.itemData.id : '';
        //        return $.ajax({
        //            url: `/api/adminmenuapi/getmenu/${parentId}`,
        //            dataType: 'json',
        //        });
        //    },
        //    expandNodesRecursive: false,
        //    rootValue: '',
        //    dataStructure: 'plain',
        //    height: 500,
        //    keyExpr: "id",
        //    displayExpr: "title",
        //    parentIdExpr: "parentId",
        //    hasItemsExpr: "hasChildren",
        //    onItemClick: function (evt) {
        //        data = evt.itemData
        //        console.log(data);
        //        loadData()
        //    }
        //}).dxTreeView('instance');
        //let treeViewDropdownBox;

        const itemDropdownBoxRenderedHandler = (evt) => {
            //const { itemData, itemElement } = evt;
            //const [htmlElement] = itemElement;
            //if (!itemData.isLeaf) {
            //    const checkBoxItem = htmlElement.parentNode.querySelector(".dx-checkbox");
            //    if (checkBoxItem) checkBoxItem.classList.add("dx-state-disabled");
            //    const treeViewItem =
            //        htmlElement.parentNode.querySelector(".dx-treeview-item");
            //    if (treeViewItem) treeViewItem.classList.add("dx-state-disabled");
            //}
        };

        const syncTreeViewSelection = function (treeViewInstance, value) {
            if (!value) {
                treeViewInstance.unselectAll();
            } else {
                treeViewInstance.selectItem(value);
            }
        };

        const dropdownBox = $("#parentIdAdd")
            .dxDropDownBox({
                items: [],
                valueExpr: "id",
                displayExpr: "title",
                placeholder: "Chọn menu cấp cha",
                showClearButton: true,
                //inputAttr: { "aria-label": "Owner" },
                elementAttr: {
                    class: "form-control",
                },
                contentTemplate(e) {
                    const $treeView = $("<div>").dxTreeView({
                        dataSource: e.component.getDataSource(),
                        dataStructure: "plain",
                        parentIdExpr: "parentId",
                        keyExpr: "id",
                        displayExpr: "title",
                        selectionMode: "single",
                        showCheckBoxesMode: "none",
                        selectNodesRecursive: false,
                        selectByClick: true,
                        searchEnabled: true,
                        searchMode: "contains",
                        searchExpr: ["title"],
                        onContentReady(args) {
                            const value = e.component.option("value");
                            syncTreeViewSelection(args.component, value);
                        },
                        onItemSelectionChanged(args) {
                            const selectedKeys = args.component.getSelectedNodeKeys();
                            e.component.option("value", selectedKeys);
                        },
                        onItemRendered: itemDropdownBoxRenderedHandler,
                    });

                    treeViewDropdownBox = $treeView.dxTreeView("instance");

                    e.component.on("valueChanged", (args) => {
                        syncTreeViewSelection(treeViewDropdownBox, args.value);
                        e.component.close();
                    });

                    return $treeView;
                },
            })
            .dxDropDownBox("instance");

        fetch(`${baseUrl}/Api/AdminMenuApi/DanhSachNodeCha`)
            .then((res) => res.json())
            .then((data) => {
                dropdownBox.option("items", data);
            })
            .catch((err) => {
                console.log(err);
            });

        const treeView = $('#simple-treeview').dxTreeView({
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
            onItemClick: function (evt) {
                //const itemDt = evt.itemData;
                $('#simple-treeview .dx-treeview-item').removeClass('isActive');
                $(evt.itemElement).addClass('isActive');
                data = evt.itemData;
                console.log(data)
                loadData();
            }
        }).dxTreeView('instance');
    })
    function loadData() {
        console.log(data, "Data Menu")
        $('#content_phanquyen').empty()
        let html = ` <div class="form-row">
                        <div class="col-md-12 form-group">
                            <label for="title" class="form-label">Tiêu đề<span class="text-red"> *</span></label>
                            <input type="text" class="form-control field-input" id="title" autocomplete="off">
                        </div>
                        <div class="col-md-12 form-group">
                            <label for="areaName" class="form-label">AreaName<span class="text-red"> *</span></label>
                            <input type="text" class="form-control field-input" id="areaName"  autocomplete="off" ${data.hasChildren ? "disabled" : ""} />
                        </div>
                        <div class="col-md-12 form-group">
                            <label for="controllerName" class="form-label">ControllerName<span class="text-red"> *</span></label>
                            <input type="text" class="form-control field-input" id="controllerName" autocomplete="off" ${data.hasChildren ? "disabled" : ""} />
                        </div>
                        <div class="col-md-12 form-group">
                            <label for="actionName" class="form-label">ActionName<span class="text-red"> *</span></label>
                            <input type="text" class="form-control field-input" id="actionName" autocomplete="off" ${data.hasChildren ? "disabled" : ""} />
                        </div>
                        <div class="col-md-12 form-group">
                            <label for="title" class="form-label">Thứ tự hiển thị<span class="text-red"> *</span></label>
                            <input type="number" class="form-control field-input" id="txtDisplayOrder" autocomplete="off">
                        </div>
                        <div class="col-md-12 form-group">
                            <div class="form-check-container">
                                <div class="form-check form-check-inline">
                                    <input class="form-check-input" type="checkbox" name="chkShow" id="chkShow" checked>
                                    <label class="form-check-label" for="chkShow">Hiển thị</label>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-12 form-group">
                            <label for="txtIcon" class="form-label">Icon</label>
                            <input type="text" class="form-control field-input" id="txtIcon" autocomplete="off"/>
                        </div>
                    </div>
                    <div class="group-button-action text-right">
                        <button type="button" id="btn-huy" class="btn btn-outline-light" data-dismiss="modal">Hủy bỏ</button>
                        <button type="button" id="btn-xoa" class="btn btn-danger">Xóa</button>
                        <button type="button" id="btn-sua" class="btn btn-primary">Lưu</button>
                    </div>`

        $('#content_phanquyen').append(html)

        $('#tenMenu').text(data.title)
        $('#tenMenu').parent().removeClass('d-none')
        $('#menu_list').addClass('col-lg-8').removeClass('col-lg-12')
        $('#menu_detail').removeClass('d-none')
        $('#title').val(data.title)
        $('#areaName').val(data.areaName);
        $('#controllerName').val(data.controllerName)
        $('#actionName').val(data.actionName)
        $('#txtDisplayOrder').val(data.displayOrder)
        $('#txtIcon').val(data.icon)
        console.log(data.isShow)
        if (data.isShow) {
            $("#chkShow").prop("checked", true);
        } else {
            $("#chkShow").prop("checked", false);
        }
       

        $('#btn-huy').on('click', function () { 
            loadData()
        })

        $('#btn-sua').on('click', async function () {
            let title = $('#title').val()
            let areaName = $('#areaName').val()
            let controllerName = $('#controllerName').val()
            let actionName = $('#actionName').val()
            const displayOrder = $('#txtDisplayOrder').val();
            const icon = $('#txtIcon').val();

            let dt = {
                id: data.id,
                parentId: data.parentId,
                title: title,
                areaName: areaName,
                controllerName: controllerName,
                actionName: actionName,
                isLeaf: data.isLeaf,
                displayOrder: +displayOrder,
                icon: icon,
                isShow: $("#chkShow").is(":checked") ? true : false
            }

            await fetch('/api/AdminMenuApi/ChinhSuaMenu', {
                method: 'PUT',
                headers: {
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify(dt)
            }).then(res => {
                if (!res.ok) {
                    throw new Error(res.statusText)
                }
                showNotification(1, "Chỉnh sửa menu thành công")
            }).catch (err => {
                showNotification(0, err.message)
            })
        })

        $('#btn-xoa').on('click', async function () {

            $('#idDelete').val(data.id);
            $('#nameDelete').text(data.title);

            $('#modalDelete').modal('show');
            let areaName = $('#areaName').val()
            let controllerName = $('#controllerName').val()
            let actionName = $('#actionName').val()
        })
    }

    $('.btn-close').on('click', function () {
        $('#menu_list').addClass('col-lg-12').removeClass('col-lg-8')
        $('#menu_detail').addClass('d-none')
    })

    $("#formAdd").submit(function (e) {
        e.preventDefault();
        dataAdd();
    });
   
    $("#formDelete").submit(function (e) {
        e.preventDefault();
        dataDelete();
    });

    $('#modalAdd').on('show.bs.modal', function (e) {
        $('#titleAdd').val('');
        //$('#parentIdAdd').val('').trigger('change');
        $("#parentIdAdd").dxDropDownBox("instance").option("value", null);
        $('#areaNameAdd').val('');
        $('#controllerNameAdd').val('');
        $('#actionNameAdd').val('');
        $('#txtIconAdd').val('');
        $('#txtDisplayOrderAdd').val('');
        $("#chkShowAdd").prop("checked", true);
        //$('#areaNameAdd').prop('disabled', true);
        //$('#controllerNameAdd').prop('disabled', true);
        //$('#actionNameAdd').prop('disabled', true);
    })

    async function dataAdd() {
        let title = $('#titleAdd').val();
        //let parentId = $('#parentIdAdd').val();
        let areaName = $('#areaNameAdd').val();
        let controllerName = $('#controllerNameAdd').val();
        let actionName = $("#actionNameAdd").val()
        let icon = $("#txtIconAdd").val()
        const displayOrder = $("#txtDisplayOrderAdd").val();
        //const nhomId = $("#nhomAdd").val();

        const parentId = $("#parentIdAdd").dxDropDownBox("instance").option('value');
        if (checkEmptyBlank(title)) {
            showNotification(0, 'Thông tin bắt buộc không được trống');
            return;
        }

        let dt = {
            title: title.trim(),
            parentId: parentId != null ? parentId[0] : null,
            areaName: areaName,
            controllerName: controllerName,
            actionName: actionName,
            isLeaf: parentId == "" ? false : true,
            displayOrder: +displayOrder,
            icon: icon,
            isShow: $("#chkShowAdd").is(":checked") ? true : false
        }
        
        try {
            let res = await fetch('/api/AdminMenuApi/themmoimenu', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dt)
            })
            console.log(res)
            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            showNotification(1, 'Thêm mới menu thành công')
            $('#modalAdd').modal('hide');
            location.reload()
        }
        catch (err) {
            showNotification(0, err.message)
        }
    }
    async function dataDelete() {
        let id = $('#idDelete').val();

      
        try {
            const res = await fetch('/api/AdminMenuApi/XoaMenu/' + id, {
                method: 'DELETE'
            })

            if (!res.ok) {
                var errText = await res.text();
                throw new Error(errText);
            }
            showNotification(1, 'Xóa menu thành công')
            $('#modalDelete').modal('hide');
            location.reload()
        }
        catch (err) {
            showNotification(0, err.message)
        }
    }

    async function getMenuChaSelect() {
        try {
            const res = await fetch(`/api/AdminMenuApi/DanhSachNodeCha`, {
                method: 'GET'
            })
            if (!res.ok) {
                throw new Error(res.statusText)
            }
            let data = await res.json()
            if (data && data.length) {
                for (let i = 0; i < data.length; i++) {
                    $('#parentIdAdd').append(`<option value="${data[i].id}">${data[i].title}</option>`)
                }
            }
        } catch (err) {
            showNotification(0, err.message);
        }
    };

    //async function getNhomMenuSelect() {
    //    try {
    //        const res = await fetch(`/api/AdminMenuApi/NhomMenu`, {
    //            method: 'GET'
    //        })
    //        if (!res.ok) {
    //            throw new Error(res.statusText)
    //        }
    //        let data = await res.json()
    //        if (data && data.length) {
    //            for (let i = 0; i < data.length; i++) {
    //                $('#nhomAdd').append(`<option value="${data[i].value}">${data[i].description}</option>`)
    //            }
    //        }
    //    } catch (err) {
    //        showNotification(0, err.message);
    //    }
    //};
})