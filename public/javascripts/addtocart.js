
function addToCart(proId) {
    console.log(proId)
    $.ajax({
        url: '/add-to-cart/' + proId,
        method: 'get',
        success: (response) => {
            alert(response)

        }
    })

}
