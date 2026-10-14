const baseUrl = getRootLink();

$(document).ready(function () {
    //Get ID request from URL
    const params = new URLSearchParams(window.location.search)
    const YCID = params.get("YCID")

    //Call function load data detail
    loadDataYC(YCID)
})

const loadDataYC = (YCID) => {
    $.ajax({
        type: "GET",
        async: false,
        url: `${baseUrl}/api/RPT_YeuCauBaoCaoApi/Get?ID=${YCID}&MaNgonNgu=vi`,
        contentType: 'application/json;charset=utf-8',
        dataType: 'json',
        success: function (data) {

            //Set value for request, results report, socio-economic report from response
            let resYC = data.value.yeuCauBaoCao;
            let resBCKQ = data.value.baoCaoKetQuaHoatDong
            let resKTXH = data.value.baoCaoKinhTeKyThuat

            //Load data request
            $("#tieuDe").text(resYC.tieuDe)
            $("#toChuc").text(resYC.tenToChuc)
            resYC.tuNgay ? $("#batDau").text(formatDateWithoutTime(resYC.tuNgay)) : $("#batDau").text("")
            resYC.denNgay ? $("#ketThuc").text(formatDateWithoutTime(resYC.denNgay)) : $("#ketThuc").text("")
            resYC.noiDung ? $("#noiDungYeuCau").html(resYC.noiDung) : ""

            //Load data result report
            $("#soKyHieu").text(resBCKQ.soKyHieu)
            $("#trichYeu").text(resBCKQ.trichYeu)
            $("#ngayBanHanh").text(formatDateWithoutTime(resBCKQ.ngayBanHanh))
            $("#baoCaoChinhThuc").html(resBCKQ.baoCaoChinhThuc)
            $("#tinhHinhThucHien").html(resBCKQ.tinhHinhThucHien)
            $("#danhGiaChung").html(resBCKQ.danhGiaChung)
            $("#ketQuaThucHien").html(resBCKQ.ketQuaThucHien)
            $("#hanCheNguyenNhan").html(resBCKQ.hanCheNguyenNhan)
            $("#nhiemVuTrongTam").html(resBCKQ.nhiemVuTrongTam)
            $("#deXuatKienNghi").html(resBCKQ.deXuatKienNghi)

            //Load data socio-economic report
            if (resKTXH && resKTXH.length > 0) {
                renderBaoCaoKTXHDetail(resKTXH);
            }
        },
        error: function (err) {
            console.log(err)
        }
    })
}

const renderBaoCaoKTXHDetail = (baoCaoKTXHList) => {
    let html = '';
    
    baoCaoKTXHList.forEach((baoCao, baoCaoIndex) => {
        if (baoCao.infoBaoCao && baoCao.infoChiTieu) {
            const infoBaoCao = baoCao.infoBaoCao;
            const infoChiTieu = baoCao.infoChiTieu;
            
            // Nhóm dữ liệu theo nhomChiTieuID
            const groupedData = {};
            infoChiTieu.forEach(item => {
                if (!groupedData[item.nhomChiTieuID]) {
                    groupedData[item.nhomChiTieuID] = {
                        tenNhom: item.nhomChiTieu,
                        chiTieus: []
                    };
                }
                groupedData[item.nhomChiTieuID].chiTieus.push(item);
            });

            // Build section cho từng báo cáo
            html += `
                <div class="BaoCaoKTXH-item" style="margin-bottom: 30px;">
                    <h5 style="font-weight: 700; margin-bottom: 15px; padding: 10px; background-color: #f0f0f0; border-radius: 4px;font-family: Lato;">
                        ${infoBaoCao.tieuDe || 'N/A'}
                        <span style="font-size: 0.85em; color: #666; margin-left: 10px;">
                            (${formatDateWithoutTime(infoBaoCao.ngayCapNhat)})
                        </span>
                    </h5>
                    
                    <div class="New_Table table-responsive">
                        <table class="table row-border" width="100%" cellspacing="0">
                            <thead>
                                <tr>
                                    <th class="text-center" style="width: 50px;">Stt</th>
                                    <th style="width: 25%;">Tên tiêu chí</th>
                                    <th class="text-left" style="width: 100px;">Đơn vị tính</th>
                                    <th class="text-center" style="width: 80px;">Năm trước</th>
                                    <th class="text-center" style="width: 80px;">Kế hoạch</th>
                                    <th class="text-center" style="width: 80px;">Thực hiện</th>
                                    <th class="text-center" style="width: 100px;">Hoàn thành</th>
                                    <th class="text-left" style="width: 25%;">Ghi chú</th>
                                </tr>
                            </thead>
                            <tbody>
            `;

            let stt = 1;
            let nhomIndex = 1;
            Object.keys(groupedData).forEach(nhomID => {
                const nhom = groupedData[nhomID];
                
                // Hàng nhóm tiêu chí
                html += `
                    <tr class="nhom-chiti-header" style="background-color: #f0f0f0;">
                        <td colspan="8" style="font-weight: 700; padding: 12px;">
                            ${toRomanNumeral(nhomIndex)}. ${nhom.tenNhom}
                        </td>
                    </tr>
                `;
                nhomIndex++;

                // Các hàng chỉ tiêu trong nhóm
                nhom.chiTieus.forEach(chiTieu => {
                    html += `
                        <tr>
                            <td class="text-center">${stt}</td>
                            <td class="text-left">${chiTieu.chiTieu}</td>
                            <td class="text-left">${chiTieu.tenDonViTinh || 'N/A'}</td>
                            <td class="text-center">${chiTieu.namTruoc || 0}</td>
                            <td class="text-center">${chiTieu.keHoach || 0}</td>
                            <td class="text-center">${chiTieu.thucHien || 0}</td>
                            <td class="text-center">${parseFloat(chiTieu.hoanThanh.toFixed(2)) || 0}%</td>
                            <td class="text-left">${chiTieu.ghiChu || ''}</td>
                        </tr>
                    `;
                    stt++;
                });
            });

            html += `
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }
    });

    $("#baoCaoKTXHContainer").html(html);
}

// Hàm chuyển số thành số La Mã
function toRomanNumeral(num) {
    const romanNumerals = [
        { value: 1000, numeral: 'M' },
        { value: 900, numeral: 'CM' },
        { value: 500, numeral: 'D' },
        { value: 400, numeral: 'CD' },
        { value: 100, numeral: 'C' },
        { value: 90, numeral: 'XC' },
        { value: 50, numeral: 'L' },
        { value: 40, numeral: 'XL' },
        { value: 10, numeral: 'X' },
        { value: 9, numeral: 'IX' },
        { value: 5, numeral: 'V' },
        { value: 4, numeral: 'IV' },
        { value: 1, numeral: 'I' }
    ];
    
    let result = '';
    for (let i = 0; i < romanNumerals.length; i++) {
        while (num >= romanNumerals[i].value) {
            result += romanNumerals[i].numeral;
            num -= romanNumerals[i].value;
        }
    }
    return result;
}