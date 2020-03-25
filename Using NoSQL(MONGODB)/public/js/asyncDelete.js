const deleteProduct = btn => {
    const id = btn.parentNode.querySelector("[name=productID]").value;
    const csrf = btn.parentNode.querySelector("[name=_csrf]").value;

    const productCard = btn.closest("article");

    fetch(`/productDelete/${id}`, {
            method: "DELETE",
            headers: {
                "CSRF-Token": csrf
            }
        })
        .then(result => {
            productCard.parentNode.removeChild(productCard);
        })
        .catch(err => console.log("errr"));
};