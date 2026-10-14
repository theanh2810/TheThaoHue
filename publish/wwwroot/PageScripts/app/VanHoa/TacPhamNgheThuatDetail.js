$(document).ready(function () {
    let lang = currentLang
    let noDataText,
        authorsText;


    ; (async function () {
        const res = await fetch(`/lang/${lang}.json`);
        if (!res.ok) return;
        const translations = await res.json();

        noDataText = translations['noData']
        authorsText = translations['authors']


        loadDetail()
    })();

    function loadDetail() {
        getDataWithApi('POST', '/api/TacPhamApi/v1/GetById', JSON.stringify({ id: itemId, maNgonNgu: lang }))
            .then(response => {
                if (response && response.isSuccess && response.value) {
                    renderDetail(response.value);
                }
            });
    }

    function renderDetail(data) {
        $('#detailContent').html(`
            <h1>${data.tenTacPham}</h1>
            <p><strong>${authorsText}:</strong> ${data.tacGia || ''}</p>
            <span class="badge badge-info">${data.theLoai || ''}</span>
            <img src="${data.anhDaiDien || '/assets/images/vector/no-image.png'}" class="img-fluid my-4">
            <div>${data.moTa || ''}</div>
            <div class="mt-4">${data.noiDung || ''}</div>
        `);
    }

    loadDetail();
});
