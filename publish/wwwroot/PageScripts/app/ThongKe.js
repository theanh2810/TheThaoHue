$(document).ready(function () {
    initSelect2();

    let lang = currentLang
    let viewDetailText;

    ; (async function () {
        const res = await fetch(`/lang/${lang}.json`);
        if (!res.ok) return;
        const translations = await res.json();

        viewDetailText = translations['viewDetail']

        renderStatisticalCount(lang)
    })();

    //#region Render statistical count
    
    //#endregion
})

const renderStatisticalCount = async (lang) => {
    const res = await getDataWithApi('GET', `/api/CSDL_JsonApi/JsonStatisticalCount?MaNgonNgu=${lang}`);
    
    if (res.isSuccess && res.value != null) {
        let listCountBaoChi = [], listCountDuLich = [], listCountVanHoa = [], listCountTheThao = []

        if (res.value.countDuLich.length > 0) {
            listCountDuLich = res.value.countDuLich
        }
        if (res.value.countVanHoa.length > 0) {
            listCountVanHoa = res.value.countVanHoa
        }

        if (res.value.countBaoChi.length > 0) {
            listCountBaoChi = res.value.countBaoChi
        }

        if (res.value.countTheThao.length > 0) {
            listCountTheThao = res.value.countTheThao
        }

        if (listCountDuLich.length > 0) {
            let html = ``
            listCountDuLich.forEach((item) => {
                html += `<div>
                            <span>${item.loaiThongKe}</span>
                            <span>${item.soLuong}</span>
                        </div>`
            })

            $("#slideThongKe").html(html)
        }

        if (listCountVanHoa.length > 0) {
            let html = ``
            listCountVanHoa.forEach((item) => {
                html += `<div>
                            <span>${item.loaiThongKe}</span>
                            <span>${item.soLuong}</span>
                        </div>`
            })

            $("#slideThongKe1").html(html)
        }

        if (listCountBaoChi.length > 0) {
            let html = ``
            listCountBaoChi.forEach((item) => {
                html += `<div>
                            <span>${item.loaiThongKe}</span>
                            <span>${item.soLuong}</span>
                        </div>`
            })

            $("#slideThongKe2").html(html)
        }

        if (listCountTheThao.length > 0) {
            let html = ``
            listCountTheThao.forEach((item) => {
                html += `<div>
                            <span>${item.loaiThongKe}</span>
                            <span>${item.soLuong}</span>
                        </div>`
            })

            $("#slideThongKe3").html(html)
        }

    }
}