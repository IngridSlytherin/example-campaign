const btnUpsell = document.querySelector('.btn-success');
const refId = sessionStorage.getItem('ref_id'); // Obtém o ID da ordem atual
console.log('refId:', refId);
const publicKey = 'HJiDgB1BcNDWx0lJYvP79mqDeRN8d0EVN9DfqYLv'; // Campaign API Key
const ordersURL = 'https://campaigns.apps.29next.com/api/v1/orders/';
const headers = {
   'Content-Type': 'application/json',
   'Authorization': 'Bearer HJiDgB1BcNDWx0lJYvP79mqDeRN8d0EVN9DfqYLv' // Sua chave API aqui
};
let upsellLineItem = {
    "package_id": 201, // ID do novo produto de upsell
    "quantity": 1 // Quantidade inicial
};

// Atualizar o preço na página
const updateTotalPrice = (quantity) => {
    const unitPrice = 10.00; // Preço do upsell
    const totalPrice = unitPrice * quantity;
    document.getElementById('total-price').textContent = `Total: $${totalPrice.toFixed(2)}`;
};

/**
 * Get Order Details for Upsell page
 */
const getOrder = async () => {
    console.log("get order");
    try {
        const response = await fetch(`${ordersURL}${refId}/`, {
            method: 'GET',
            headers: headers
        });

        const result = await response.json();

        if (!response.ok) {
            console.log('Something went wrong');
            return;
        }

        // Verifica se a ordem suporta upsell
        if (!result.supports_post_purchase_upsells) {
            window.location.href = '/thank-you.html'; // Redireciona se não suportar upsell
        }

        console.log(result);
    } catch (error) {
        console.log(error);
    }
};

/**
 * Create Upsell
 */
const createUpsell = async () => {
   console.log("create upsell");

   const orderData = {
       "lines": [upsellLineItem]
   };

   btnUpsell.disabled = true;
   btnUpsell.textContent = btnUpsell.dataset.loadingText;

   try {
       const response = await fetch(`${ordersURL}${refId}/upsells/`, {
           method: 'POST',
           headers: headers,
           body: JSON.stringify(orderData)
       });

       const result = await response.json();

       if (!response.ok) {
           console.log('Something went wrong while adding the upsell.');
           console.log('Response status:', response.status);
           console.log('Response message:', result);  // Adicione isso para ver o conteúdo detalhado
           btnUpsell.disabled = false;
           btnUpsell.textContent = btnUpsell.dataset.text;
           return;
       }

       console.log(result);
       window.location.href = '/thank-you.html'; // Redireciona após sucesso

   } catch (error) {
       console.error('Erro ao criar upsell:', error);
   }
};

// Executa ao carregar o DOM
document.addEventListener("DOMContentLoaded", async function () {
    await getOrder(); // Recupera a ordem

    // Listener para o botão de upsell
    btnUpsell.addEventListener('click', createUpsell);

    // Listener para atualizar a quantidade e o total de preço
    document.getElementById('quantity-picker').addEventListener('change', function (event) {
        const selectedQuantity = parseInt(event.target.value);
        upsellLineItem.quantity = selectedQuantity; // Atualiza a quantidade no objeto upsellLineItem
        updateTotalPrice(selectedQuantity); // Atualiza o preço na página
    });

    // Redireciona ao clicar em "No thanks"
    [...document.getElementsByClassName('upsell-no')].forEach(anchor => {
        anchor.addEventListener('click', function (event) {
            event.preventDefault(); // Impede o comportamento padrão do link
            window.location.href = '/thank-you.html'; // Redireciona para a página de agradecimento
        });
    });

    // Inicializa o preço total na página
    updateTotalPrice(upsellLineItem.quantity);
});
